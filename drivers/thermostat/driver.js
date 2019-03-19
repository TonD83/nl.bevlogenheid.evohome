'use strict';

const Homey = require('homey');
const http = require('http.min');
const API = require('../../lib/api');
const evohomeLogin = require('../../lib/login');

class ThermostatDriver extends Homey.Driver {

  onPair(socket) {
    socket.on('login', (data, callback) => {
      const email = data.username;
      const password = data.password;
      Homey.ManagerSettings.set('username', email);
      Homey.ManagerSettings.set('password', password);
      evohomeLogin.login().then(valid => {
        Homey.ManagerSettings.set('username', email);
        Homey.ManagerSettings.set('password', password);
        callback(null, valid);
      })
        .catch(() => {
          Homey.ManagerSettings.set('username', '');
          Homey.ManagerSettings.set('password', '');
          callback(callback);
        });
    });

    socket.on('showView', (viewId, callback) => {
      callback();
      this.log('on pair: ', viewId);
      if (viewId === 'start') {
        const evohomeUser = Homey.ManagerSettings.get('username');
        const evohomePassword = Homey.ManagerSettings.get('password');
        if (!evohomeUser || !evohomePassword) {
          return socket.showView('login');
        } else {
          this.log('on pair: username set');
          return socket.showView('list_devices');
        }
      }
    });

    socket.on('list_devices', (data, callback) => {
      const devices = [];
      this.onPairListDevices(devices)
        .then(devices => {
          callback(null, devices);
        }).catch(err => {
          callback(err.message || err.toString());
        });
    });
  }

  onPairListDevices() {
    const devices = [];
    return new Promise(resolve => {
      evohomeLogin.login().then(function () {
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
        http.get(options).then(function (result) {
          const data = JSON.parse(result.data);
          const zones = data.gateways[0].temperatureControlSystems[0].zones;
          zones.forEach((device) => {
            const foundDevice = {
              name: device.name + ' - Test',
              data: {
                id: device.zoneId,
                location: locationId
              }
            };
            devices.push(foundDevice);
          });
          resolve(devices);
        });
      });
    });
  }
} // ThermostatDriver

module.exports = ThermostatDriver;
