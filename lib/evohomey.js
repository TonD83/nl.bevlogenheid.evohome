var jsonPath = require('jsonpath-plus')
var http = require('http.min')

var sessionID=("empty")
var userID=("empty")
var locationID=("empty")
var allinformation=[]

module.exports = {

  startSession: function(error,callback) {
    var username=Homey.manager('settings').get('username')
    Homey.log(username)
    var password=Homey.manager('settings').get('password')
    var appid=Homey.manager('settings').get('applicationid')
    Homey.log(appid)
     http.post('https://tccna.honeywell.com/WebAPI/api/Session',{ username: username, password: password, ApplicationId: appid }).then(function (result) {
     Homey.log('Start Session Code: ' + result.response.statusCode)
     //console.log('Response: ' + result.data)
    try {
        var data = JSON.parse(result.data)
      } catch (error) {
        return callback(error)
      }
    var sessionID = data.sessionId
    data2 = (data.userInfo)
    var userID = (data2.userID)
    //console.log (data)
    callback(userID,sessionID)
    })
  },

  getLocationID: function(userID,sessionID,callback) {
      this.startSession(sessionID, function(userID,sessionID) {
        //console.log(userID)//startSession(err,callback)
        //console.log(sessionID)
        var locationurl = ('/WebAPI/api/locations?userId='+ userID + '&allData=True');
        var options = {
      	  protocol: 'https:',
          hostname: 'tccna.honeywell.com',
          path: locationurl,
          headers: {
   	        sessionId: sessionID
          }
        }
        //console.log(options);
        http.get(options).then(function (result) {
            //console.log('Location Code: ' + result.response.statusCode)
            Homey.log('Response: ' + result.data)
            try {
                var data = JSON.parse(result.data)
                //console.log(data[0]["locationID"])
              } catch (error) {
                return callback(error)
              }
            var locationID = data[0]["locationID"]
            Homey.log('Location: ' + sessionID)
            callback(sessionID,locationID)
          })
        })
  },

  getAllInformation: function(callback) {
      this.startSession(sessionID, function(userID,sessionID) {
        var locationurl = ('/WebAPI/api/locations?userId='+ userID + '&allData=True')
        var options = {
      	  protocol: 'https:',
          hostname: 'tccna.honeywell.com',
          path: locationurl,
          headers: {
   	        sessionId: sessionID
          }
        }
        //console.log(options);
        http.get(options).then(function (result) {
            //console.log('Location Code: ' + result.response.statusCode)
            //console.log('Response: ' + result.data)
            var allinformation = result.data
            //console.log(allinformation)
            return(allinformation)
            callback(allinformation)
          })
        })
  },

  setDeviceTemperature: function(deviceID,callback) {
      Homey.log('setting device temperature: ' + deviceID)
      this.startSession(sessionID, function(userID,sessionID) {
        var locationurl = ('WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint')
        var options = {
      	  protocol: 'https:',
          hostname: 'tccna.honeywell.com',
          path: locationurl,
          headers: {
   	        sessionId: sessionID
          }
        }
        http.put(options,{ Value: newtemperature, Status: 'Hold', NextTime: '' }).then(function (result) {
          Homey.log('Quick Action Code: ' + result.response.statusCode)
          Homey.log('Response: ' + result.data)
        callback(true)
        })
    })
  },

  resetDeviceTemperature: function(deviceID,callback) {
      Homey.log('resetting device temperature: ' + deviceID)
      this.startSession(sessionID, function(userID,sessionID) {
        var locationurl = ('WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint')
        var options = {
          protocol: 'https:',
          hostname: 'tccna.honeywell.com',
          path: locationurl,
          headers: {
            sessionId: sessionID
          }
        }
        http.put(options,{ Value: '', Status: 'Scheduled', NextTime: '' }).then(function (result) {
          Homey.log('Quick Action Code: ' + result.response.statusCode)
          Homey.log('Response: ' + result.data)
        callback(true)
        })
    })
  },

  quickAction: function(qa) {
          this.getLocationID(userID, sessionID, function(sessionID,locationID) {
                Homey.log('QuickAction: ' + locationID)
                Homey.log('QuickAction: ' + qa)
                Homey.log('QuickAction: ' + sessionID)
                var options = {
                  protocol: 'https:',
                  hostname: 'tccna.honeywell.com',
                  path: '/WebAPI/api/evoTouchSystems?locationId=' + locationID,
                  headers: {
                    sessionId: sessionID
                  }
                }
                http.put(options,{ QuickAction: qa, QuickActionNextTime: '' }).then(function (result) {
                  Homey.log(sessionID)
                  Homey.log('Quick Action Code: ' + result.response.statusCode)
                  Homey.log('Response: ' + result.data)
                })
              })
  },

}
