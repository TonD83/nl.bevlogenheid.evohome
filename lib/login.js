'use strict';

const Homey = require('homey');
const http = require('http.min');
const API = require('../lib/api');

function token_handling() {
  return new Promise(function (resolve, reject) {
    const access_token_expires = Homey.ManagerSettings.get('access_token_expires');
    const evohomeUser = Homey.ManagerSettings.get('username');
    const evohomePassword = Homey.ManagerSettings.get('password');
    if (!evohomeUser || !evohomePassword) {
      reject('username settings missing');
    } else {
      const currentTime = new Date();
      const expireTime = Date.parse(access_token_expires);
      const difference = expireTime - currentTime;
      if (difference > 30 * 1000) {
        resolve('token not expired');
      } else {
        const options = {
          uri: API.protocol + '//' + API.hostname + '/Auth/OAuth/Token',
          headers: {
            'Authorization': 'Basic NGEyMzEwODktZDJiNi00MWJkLWE1ZWItMTZhMGE0MjJiOTk5OjFhMTVjZGI4LTQyZGUtNDA3Yi1hZGQwLTA1OWY5MmM1MzBjYg==',
            'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
          },
          json: true,
          form: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Host': 'rs.alarmnet.com/',
            'Cache-Control': 'no-store no-cache',
            'Pragma': 'no-cache',
            'grant_type': 'password',
            'scope': 'EMEA-V1-Basic EMEA-V1-Anonymous EMEA-V1-Get-Current-User-Account',
            'Username': evohomeUser,
            'Password': evohomePassword,
            'Connection': 'Keep-Alive'
          }
        };
        http.put(options).then(function (data) {
          const timeObject = new Date((new Date()).getTime() + data.data.expires_in * 1000);
          Homey.ManagerSettings.set('access_token', data.data.access_token);
          Homey.ManagerSettings.set('access_token_expires', timeObject);
          resolve('new token saved');
        })
          .catch(function (reject) {
            reject('token retrieval failed');
          });
      } // end else
    }
  }); // end Promise
}

function account_handling() {
  return new Promise(function (resolve, reject) {
    const account_info = Homey.ManagerSettings.get('account_info');
    const access_token = Homey.ManagerSettings.get('access_token');
    if (!access_token) { reject('no token'); }
    if (account_info === 'None') {
      const locationurl = API.baseUri + 'userAccount';
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
        Homey.ManagerSettings.set('account_info', data.userId);
        // installation / location
        const installation = Homey.ManagerSettings.get('installation');
        if (installation === 'None') {
          const account_info = Homey.ManagerSettings.get('account_info');
          const locationurl = API.baseUri + 'location/installationInfo?userId=' + account_info + '&includeTemperatureControlSystems=True';
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
            const systemId = data[0].gateways[0].temperatureControlSystems[0].systemId;
            const locationId = data[0].locationInfo.locationId;
            Homey.ManagerSettings.set('systemId', systemId);
            Homey.ManagerSettings.set('locationId', locationId);
            resolve('ok');
          })
            .catch(function () {
              // eek
            });
        } //endif installation == none
      });
    } else {
      resolve('account handling OK');
    }
  });
}

exports.login = () => {
  return new Promise(function (resolve, reject) {
    const token_handlingPromise = token_handling();
    token_handlingPromise.then(function () {
      const account_handlingPromise = account_handling();
      account_handlingPromise.then(function () {
        resolve('evohomelogin: login OK');
      })
        .catch(function (error) {
          reject(error);
        });
    })
      .catch(function (error) {
        reject(error);
      });
  });
};