'use strict';

const Homey = require('homey');
const http = require('http.min');
const evohomeLogin = require('../lib/login');
const API = require('../lib/api');

module.exports = {

  toDateWithoutTimeZone: date => toDateWithOutTimeZone(date),

  quickaction_read: function () {
    // https://tccna.honeywell.com/WebAPI/emea/api/v1/temperatureControlSystem/' + systemID + '/status'
    return new Promise((resolve, reject) => {

      const evohomeloginPromise = evohomeLogin.login();
      evohomeloginPromise.then(() => {
        const access_token = Homey.ManagerSettings.get('access_token');
        const systemId = Homey.ManagerSettings.get('systemId');
        const locationurl = API.baseUri + 'temperatureControlSystem/' + systemId + '/status';
        const options = {
          protocol: API.protocol,
          hostname: API.hostname,
          path: locationurl,
          headers: {
            'Authorization': 'bearer ' + access_token,
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          }
        };
        http.get(options).then((result) => {
          const data = JSON.parse(result.data);
          resolve(data.systemModeStatus.mode);
          // deze resolvet niet goed als token net vernieuwd is. warschijnljk gaat evohome login al verder terwijl nieuw token opgehaald wordt
        })
          .catch(error => {
            reject(error);
          });
      })
        .catch(error => {
          reject('qa read: login failed: ' + error);
        });
    });
  },

  schedules_read: function (zoneId) {
    // https://tccna.honeywell.com/WebAPI/emea/api/v1/%s/%s/schedule' (self.zone_type, self.zoneId)
    return new Promise((resolve, reject) => {
      const evohomeloginPromise = evohomeLogin.login();
      evohomeloginPromise.then(() => {
        const access_token = Homey.ManagerSettings.get('access_token');
        const locationurl = API.baseUri + 'temperatureZone/' + zoneId + '/schedule';
        const options = {
          protocol: API.protocol,
          hostname: API.hostname,
          path: locationurl,
          headers: {
            'Authorization': 'bearer ' + access_token,
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          }
        };
        http.get(options).then((result) => {
          const data = JSON.parse(result.data);
          const nextSP = getNextSwitchpoint(data.dailySchedules);
          const timeOfDay = (nextSP && nextSP.timeOfDay) || '23:59:00';
          resolve({ zoneId, timeOfDay });
          // deze resolvet niet goed als token net vernieuwd is. warschijnljk gaat evohome login al verder terwijl nieuw token opgehaald wordt
        })
          .catch(function (reject) {
            console.log(reject);
          });
      })
        .catch(function (reject) {
          console.log('qa read: login failed: ', reject);
        });
    });
  },

  quickaction_set: function (qa_value, permanent_value, tmpTime) {
    // https://tccna.honeywell.com/WebAPI/emea/api/v1/temperatureControlSystem/%s/mode' % self.systemId, data=json.dumps(data), headers=headers)
    return new Promise((resolve, reject) => {
      const evohomeloginPromise = evohomeLogin.login();
      evohomeloginPromise.then(() => {
        const access_token = Homey.ManagerSettings.get('access_token');
        const systemId = Homey.ManagerSettings.get('systemId');
        const locationurl = API.baseUri + 'temperatureControlSystem/' + systemId + '/mode';
        const options = {
          protocol: API.protocol,
          hostname: API.hostname,
          path: locationurl,
          headers: {
            'Authorization': 'bearer ' + access_token,
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          },
          json: true,
          form: {
            'SystemMode': qa_value,
            'Permanent': permanent_value,
            'TimeUntil': tmpTime
          }
        };
        http.put(options).then(() => {
          Homey.ManagerSettings.set('qa', qa_value);
          resolve(qa_value);
        })
          .catch(error => {
            reject(error);
          });
      })
        .catch(error => {
          reject(error);
        });
    });
  },

  temperature_set: function (zoneid, temp_new, setcode, tmpTime) {
    // execute target setting
    // /WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint
    evohomeLogin.login().then(() => {
      const access_token = Homey.ManagerSettings.get('access_token');
      const locationurl = API.baseUri + 'temperatureZone/' + zoneid + '/heatSetpoint';
      const options = {
        protocol: API.protocol,
        hostname: API.hostname,
        path: locationurl,
        headers: {
          'Authorization': 'bearer ' + access_token,
          'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
        },
        json: true,
        form: {
          'HeatSetpointValue': temp_new,
          'SetpointMode': setcode,
          'TimeUntil': tmpTime
        }
      };
      http.put(options).then(() => {
        // TODO: Figure out what's going on here
        if (setcode === 1) return Promise.resolve();
      })
        .catch(error => {
          console.log('catch1', error);
        });
    })
      .catch(error => {
        console.log('login failed', error);
      });
  },

  zones_read: function () {
    // /WebAPI/api/locations/?userId=" << v1uid << "&allData=True
    return new Promise((resolve, reject) => {
      evohomeLogin.login().then(() => {
        const access_token = Homey.ManagerSettings.get('access_token');
        const locationId = Homey.ManagerSettings.get('locationId');
        const locationurl = API.baseUri + 'location/' + locationId + '/status?includeTemperatureControlSystems=True';
        const options = {
          protocol: API.protocol,
          hostname: API.hostname,
          path: locationurl,
          headers: {
            'Authorization': 'bearer ' + access_token,
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          }
        };
        http.get(options).then((result) => {
          const data = JSON.parse(result.data);
          resolve(data.gateways[0].temperatureControlSystems[0].zones);
        })
          .catch(error => {
            reject(error);
          });
      })
        .catch(error => {
          reject(error);
        });
    });
  }
}; // module.exports

function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function toDateWithOutTimeZone(date) {
  const tempTime = date.split(':');
  const dt = new Date();
  dt.setHours(tempTime[0]);
  dt.setMinutes(tempTime[1]);
  dt.setSeconds(tempTime[2]);
  return dt;
}

function getNextSwitchpoint(schedules) {
  const now = new Date();
  const dayOfWeek = getDayName(now);
  const schedule = schedules.find(sched => sched.dayOfWeek === dayOfWeek);
  const temp = schedule.switchpoints.filter(sp => toDateWithOutTimeZone(sp.timeOfDay) > now);
  return temp[0];
}
