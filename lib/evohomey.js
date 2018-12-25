"use strict";
const Homey = require('homey');
var jsonPath = require('jsonpath-plus')
var http = require('http.min')

module.exports = {
  login: function(user, password, appid, callback) {
    console.log("evohomey.login")
    if (!user) { callback('No username set'); return }
    if (!password) { callback('No password set'); return }

    // Check of token nog 30 seconden geldig is, zo niet, opnieuw token ophalen
    var access_token = Homey.ManagerSettings.get('access_token');
    var access_token_expires = Homey.ManagerSettings.get('access_token_expires');
    console.log(access_token_expires);
    var currentTime = new Date();
    var expireTime = Date.parse(access_token_expires);
    var difference = expireTime - currentTime;
    console.log (difference);
    if (difference > 30*1000)
    {
      console.log ('token not yet expired');
      return;
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
    } // end else


  } //login


} // module.exports
