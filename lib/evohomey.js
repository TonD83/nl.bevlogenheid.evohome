"use strict";
const Homey = require('homey');
var jsonPath = require('jsonpath-plus')
var http = require('http.min')
var evohomey = require('./evohomey.js')

module.exports = {

  quickaction_read: function() {
    // https://tccna.honeywell.com/WebAPI/emea/api/v1/temperatureControlSystem/' + systemID + '/status'
    return new Promise (function ( resolve, reject ) {
      var evohomeUser = Homey.ManagerSettings.get('username');
      var evohomePassword= Homey.ManagerSettings.get('password');
      var appid="91db1612-73fd-4500-91b2-e63b069b185c";
      evohomelogin(evohomeUser,evohomePassword,appid).then(function() {
        console.log ('login successfull')
        var access_token = Homey.ManagerSettings.get('access_token');
        var systemId = Homey.ManagerSettings.get('systemId');
        var locationurl = ('/WebAPI/emea/api/v1/temperatureControlSystem/' + systemId + '/status');
        var options = {
          protocol: 'https:',
          hostname: 'tccna.honeywell.com',
          path: locationurl,
          headers: {
            'Authorization': 'bearer ' + access_token,
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          }
        }
        http.get(options).then(function (result) {
          var data = JSON.parse(result.data)
          //console.log(data.systemModeStatus.mode)
          resolve(data.systemModeStatus.mode)
        })
        .catch(function(reject) {
          console.log(reject);
        })
    })
    .catch(function(reject) {
      console.log(reject);
    })
  })
},

quickaction_set: function(qa_value) {
  // https://tccna.honeywell.com/WebAPI/emea/api/v1/temperatureControlSystem/%s/mode' % self.systemId, data=json.dumps(data), headers=headers)
  return new Promise (function ( resolve, reject ) {
    console.log('quickaction_set', qa_value);
    var evohomeUser = Homey.ManagerSettings.get('username');
    var evohomePassword= Homey.ManagerSettings.get('password');
    var appid="91db1612-73fd-4500-91b2-e63b069b185c";
    evohomelogin(evohomeUser,evohomePassword,appid).then(function() {
      console.log ('login successfull')
      var access_token = Homey.ManagerSettings.get('access_token');
      var systemId = Homey.ManagerSettings.get('systemId');
      var locationurl = ('/WebAPI/emea/api/v1/temperatureControlSystem/' + systemId + '/mode');
      var options = {
        protocol: 'https:',
        hostname: 'tccna.honeywell.com',
        path: locationurl,
        headers: {
          'Authorization': 'bearer ' + access_token,
          'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
        },
        json: true,
        form: {
          'SystemMode': qa_value,
          'Permanent': 'true'
          //'TimeUntil': 'None'
        }
      }
      http.put(options).then(function (result) {
        resolve(qa_value)
      })
      .catch(function(reject) {
        console.log(reject);
      })
  })
  .catch(function(reject) {
    console.log(reject);
  })
})
},

temperature_set: function(zoneid,temp_new,setcode) {
    console.log('temperature set manual', zoneid, temp_new, setcode)
      // execute target setting
      // /WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint
        var evohomeUser = Homey.ManagerSettings.get('username');
        var evohomePassword= Homey.ManagerSettings.get('password');
        var appid="91db1612-73fd-4500-91b2-e63b069b185c";
        evohomelogin(evohomeUser,evohomePassword,appid).then(function() {
          console.log('login successfull')
          var access_token = Homey.ManagerSettings.get('access_token');
          var locationurl = ('/WebAPI/emea/api/v1/temperatureZone/' + zoneid + '/heatSetpoint');
          var options = {
            protocol: 'https:',
            hostname: 'tccna.honeywell.com',
            path: locationurl,
            headers: {
              'Authorization': 'bearer ' + access_token,
              'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
            },
            json: true,
            form: {
              'HeatSetpointValue': temp_new,
              'SetpointMode': setcode,
              'TimeUntil': ''
            }
          }
          console.log(options)
          http.put(options).then(function (result) {
            return Promise.resolve();
          })
          .catch(function(reject) {
            console.log('catch 1')
            console.log(reject);
          })
        })
        .catch(function(reject) {
          console.log('catch 2')
          console.log(reject);
        })
},

zones_read: function() {
  // /WebAPI/api/locations/?userId=" << v1uid << "&allData=True
  return new Promise (function ( resolve, reject ) {
    var evohomeUser = Homey.ManagerSettings.get('username');
    var evohomePassword= Homey.ManagerSettings.get('password');
    var appid="91db1612-73fd-4500-91b2-e63b069b185c";
    evohomelogin(evohomeUser,evohomePassword,appid).then(function() {
      console.log ('login successfull')
      var access_token = Homey.ManagerSettings.get('access_token');
      var locationId= Homey.ManagerSettings.get('locationId');
      var locationurl = ('/WebAPI/emea/api/v1/location/' + locationId + '/status?includeTemperatureControlSystems=True');
      var options = {
        protocol: 'https:',
        hostname: 'tccna.honeywell.com',
        path: locationurl,
        headers: {
          'Authorization': 'bearer ' + access_token,
          'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
        }
      }
      console.log(locationurl)
      http.get(options).then(function (result) {
        var data = JSON.parse(result.data)
  //      console.log(result.data.gateways[0].temperatureControlSystems[0].zones)
        //console.log(result.data);
        console.log('---');
        console.log(data.gateways[0].temperatureControlSystems[0].zones);

        //resolve(data.systemModeStatus.mode)
      })
      .catch(function(reject) {
        console.log(reject);
      })
  })
  .catch(function(reject) {
    console.log(reject);
  })
})
}

} // module.exports

function evohomelogin(user, password, appid, callback) {
  return new Promise (function (fulfill, reject) {
    console.log("evohomey.login")
    if (!user) { reject('No username set'); return }
    if (!password) { reject('No password set'); return }
    // Check of token nog 30 seconden geldig is, zo niet, opnieuw token ophalen
    var access_token = Homey.ManagerSettings.get('access_token');
    var access_token_expires = Homey.ManagerSettings.get('access_token_expires');
    //console.log(access_token_expires);
    var currentTime = new Date();
    var expireTime = Date.parse(access_token_expires);
    var difference = expireTime - currentTime;
    //console.log (difference);
    if (difference > 30*1000)
    {
      console.log ('token not yet expired');
    }
    else {
      console.log('get new token')
      var options = {
      uri: 'https://tccna.honeywell.com/Auth/OAuth/Token',
      headers: {
        'Authorization': 'Basic YjAxM2FhMjYtOTcyNC00ZGJkLTg4OTctMDQ4YjlhYWRhMjQ5OnRlc3Q=',
        'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
      },
      json: true,
      form: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Host': 'rs.alarmnet.com/',
        'Cache-Control':'no-store no-cache',
        'Pragma': 'no-cache',
        'grant_type': 'password',
        'scope': 'EMEA-V1-Basic EMEA-V1-Anonymous EMEA-V1-Get-Current-User-Account',
        'Username': user,
        'Password': password,
        'Connection': 'Keep-Alive'
      }
      }
      http.put(options).then(function (data) {
      //var resultaat = JSON.parse(data)
      var access_token = data.data.access_token
      //console.log('Response access token:', data.data.access_token)
      //console.log('Expires:', data.data.expires_in)
      console.log(data.data);
      var timeObject = new Date();
      var timeObject = new Date(timeObject.getTime() + data.data.expires_in*1000);
      Homey.ManagerSettings.set('access_token', data.data.access_token);
      console.log (data.data.access_token);
      console.log (timeObject);
      Homey.ManagerSettings.set('access_token_expires', timeObject);
      //self.access_token = None
      //self.access_token_expires = None
    })
    .catch(function(reject) {
      console.log(reject);
    })
  } // end else
  // user_account
  var account_info = Homey.ManagerSettings.get('account_info');
  if (account_info == "None") {
    console.log ("get account_info")
    var locationurl = ('/WebAPI/emea/api/v1/userAccount');
    var options = {
      protocol: 'https:',
      hostname: 'tccna.honeywell.com',
      path: locationurl,
      headers: {
        'Authorization': 'bearer ' + access_token,
        'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          }
    }
    //console.log(options);
    http.get(options).then(function (result) {
        //console.log('Location Code: ' + result.response.statusCode)
        //Homey.log('Response: ' + result.data)
            var data = JSON.parse(result.data)
            Homey.ManagerSettings.set('account_info',data.userId);
            console.log(data.userId);
            // installation / location
            var installation = Homey.ManagerSettings.get('installation');
            if (installation == "None") {
              console.log ("get location_info")
              var account_info = Homey.ManagerSettings.get('account_info');
              var locationurl = ('/WebAPI/emea/api/v1/location/installationInfo?userId=' + account_info + '&includeTemperatureControlSystems=True');
              var options = {
                protocol: 'https:',
                hostname: 'tccna.honeywell.com',
                path: locationurl,
                headers: {
                  'Authorization': 'bearer ' + access_token,
                  'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
                }
              }
              http.get(options).then(function (result) {
                  var data = JSON.parse(result.data)
                  //console.log(data)
                  var systemId = data[0].gateways[0].temperatureControlSystems[0].systemId;
                  var locationId = data[0].locationInfo.locationId;
                  //console.log(result.data);
                  //var locationId =
                  Homey.ManagerSettings.set('systemId',systemId);
                  Homey.ManagerSettings.set('locationId',locationId);
              })
              .catch(function(reject) {
                console.log(reject);
              })
            }
      })
      .catch(function(reject) {
        console.log(reject);
      })

  }
  fulfill('ok');
  })

} //evohomelogin
