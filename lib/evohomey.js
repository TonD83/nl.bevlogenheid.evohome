var jsonPath = require('jsonpath-plus')
var http = require('http.min')
var util = require('util')
var Util = require('../../lib/util.js')
var EventEmitter = require('events')

//var devices = {}
var sessionID=("empty")
var userID=("empty")
var locationID=("empty")
var allinformation=[]


module.exports = {

  startSession: function(error,callback) {
    var username=Homey.manager('settings').get('username')
    //Homey.log(username)
    var password=Homey.manager('settings').get('password')
    var appid=Homey.manager('settings').get('applicationid')
    var startresult=("empty")
    //Homey.log(appid)
    http.post('https://tccna.honeywell.com/WebAPI/api/Session',{ username: username, password: password, ApplicationId: appid }).then(function (result) {
      Homey.log('Start Session Code: ' + result.response.statusCode)
      var startresult= result.response.statusCode
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
      callback(userID,sessionID,startresult)
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
            //Homey.log('Response: ' + result.data)
            try {
                var data = JSON.parse(result.data)
                //console.log(data[0]["locationID"])
              } catch (error) {
                return callback(error)
              }
            var locationID = data[0]["locationID"]
            callback(sessionID,locationID)
          })
        })
  }


}

function Evohomey (options) {
  EventEmitter.call(this)
  if (options == null) { options = {} }
  this.user = options.user
  this.password = options.password
  this.appid = options.appid
  this.locationid = options.locationid
  this.userId = null
  this.activeSessionId = null
  this.activeSessionLast = null
  this.failedSessionCount = 0
  this.networkFailureStart = null
  this.trackingItems = []
  this.intervalId = null
  this.intervalMS = options.intervalMS || 10000
}
util.inherits(Evohomey, EventEmitter)

Evohomey.prototype.getOptions = function () {
  var self = this
  var options = {
    user: self.user,
    userId: self.userId,
    activeSessionId: self.activeSessionId,
    trackingItems: self.trackingItems
  }
  return options
}


Evohomey.prototype.validateAccount = function (callback) {
  var self = this
  if (!self.user) { return callback('No username set') }
  if (!self.password) { return callback('No password set') }
  // Homey.log(self.appid)
  login(self.user, self.password, self.appid, function (error, sessionID, userId) {
    if (error) return callback(error)
    Homey.log('validate: ' + sessionID)
    callback(null, userId)
    //logout(sessionId)
  })
}

Evohomey.prototype.getAllInformation = function (callback) {
  Homey.log('get all information started')
  var self = this
  login(self.user, self.password, self.appid, function (error, sessionID, userId) {
    if (error) return callback(error)
    var userID = Homey.manager('settings').get('userid')
    //Homey.log('getAllinformation: ' + sessionID)
    var locationurl = ('/WebAPI/api/locations?userId='+ userID + '&allData=True')
    //Homey.log(locationurl)
    var options = {
      protocol: 'https:',
      hostname: 'tccna.honeywell.com',
      path: locationurl,
      headers: {
        sessionId: sessionID
      }
    }
    http.get(options).then(function (result) {
        //console.log('Location Code: ' + result.response.statusCode)
        Homey.log('Information response: ' + result.data)
        var allinformation = JSON.parse(result.data)
        //Homey.log(Array.isArray(result.data))
        //Homey.log(Array.isArray(allinformation))
        //Homey.log(allinformation)
        callback(allinformation)
      })
  })

}

Evohomey.prototype.quickAction = function(qa) {
  //Homey.log('get all information started: ' + qa)
  evohomeDebugLog('QuickAction: ', qa)
  var self = this
  login(self.user, self.password, self.appid, function (error, sessionID, userId) {
    if (error) return callback(error)
    var locationID = Homey.manager('settings').get('locationid')
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
      Homey.manager('settings').set('qa_status',qa)
    })
  })
}

Evohomey.prototype.setDeviceTemperature = function(deviceID,new_target,callback) {
    Homey.log('setting device temperature: ' + deviceID)
    Homey.log('setting device temperature: ' + new_target)
    //evohomeDebugLog('setDeviceTemperature: ', qa)
    var self = this
    login(self.user, self.password, self.appid, function (error, sessionID, userId) {  var locationurl = ('/WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint')
      //Homey.log('set device temperature session id: ' + sessionID)
      var options = {
        protocol: 'https:',
        hostname: 'tccna.honeywell.com',
        path: locationurl,
        headers: {
          sessionId: sessionID
        }
      }
      Homey.log(locationurl)
      http.put(options,{ Value: new_target, Status: 'Hold', NextTime: '' }).then(function (result) {
        Homey.log('Set Device Temperature result: ' + result.response.statusCode)
        Homey.log('Response: ' + result.data)
        callback(true)
      })
  })
}

Evohomey.prototype.resetDeviceTemperature = function(deviceID,callback) {
    Homey.log('setting device temperature: ' + deviceID)
    //Homey.log('setting device temperature: ' + new_target)
    evohomeDebugLog('resetDeviceTemperature: ', deviceID)
    var self = this
    login(self.user, self.password, self.appid, function (error, sessionID, userId) {  var locationurl = ('/WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint')
      //Homey.log('set device temperature session id: ' + sessionID)
      var options = {
        protocol: 'https:',
        hostname: 'tccna.honeywell.com',
        path: locationurl,
        headers: {
          sessionId: sessionID
        }
      }
      Homey.log(locationurl)
      http.put(options,{ Value: '', Status: 'Scheduled', NextTime: '' }).then(function (result) {
        Homey.log('Reset Device Temperature result: ' + result.response.statusCode)
        Homey.log('Response: ' + result.data)
        callback(true)
      })
  })
}

// login function returns sessionId
function login (user, password, appid, callback) {
  if (!user) { callback('No username set'); return }
  if (!password) { callback('No password set'); return }
  http.post('https://tccna.honeywell.com/WebAPI/api/Session',{ username: user, password: password, ApplicationId: appid }).then(function (result) {
    Homey.log('Start Session Code: ' + result.response.statusCode)
    var startresult= result.response.statusCode
    if ( startresult != '200' ) {
      Homey.log ('invalid settings')
      callback('errorInvalidSettings'); return
    }
      //console.log('Response: ' + result.data)
    try {
        var data = JSON.parse(result.data)
      } catch (error) {
        return callback(error)
      }
    var sessionID = data.sessionId
    data2 = (data.userInfo)
    var userid = Homey.manager('settings').get('userid')
    if (!userid) {
      var userid = data2.userID
      Homey.manager('settings').set('userid',userid)
    }
    Homey.log('Session ID: ' + sessionID)
    var locationid = Homey.manager('settings').get('locationid')
    Homey.log('Location ID: ' + locationid)
    Homey.log('User ID: ' + userid)
    if (!locationid) {
      Homey.log ('no location information set yet... retrieving and storing in configuration')
      var locationurl = ('/WebAPI/api/locations?userId='+ userid + '&allData=True');
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
          //Homey.log('Response: ' + result.data)
          try {
              var data = JSON.parse(result.data)
              //console.log(data[0]["locationID"])
            } catch (error) {
              return callback(error)
            }
          var locationID = data[0]["locationID"]
          Homey.manager('settings').set('locationid',locationID)
        })
    }

    //if { startresult == '200' } {
      callback(null,sessionID)
    //}
    //else callback(startresult)
  })
} // end function login

var debugSetting = true;
var debugLog = [];

function evohomeDebugLog(message, data) {
  if (!debugSetting) {
        return;
  }
  if (!debugLog) {
        debugLog = [];
  }
  if (!data) {
      data = null;
  }
  Homey.manager('api').realtime('evohomeLog', {datetime: new Date(), message: message, data: data});
  debugLog.push({datetime: new Date(), message: message, data: data});
  if (debugLog.length > 100) debugLog.splice(0, 1);
  if (data == null) {
    Homey.log(Util.epochToTimeFormatter(), message);
  } else {
    Homey.log(Util.epochToTimeFormatter(), message, data);
  };
  Homey.manager('settings').set('evohomeLog', debugLog);
} // function evohomeDebugLog


exports = module.exports = Evohomey
