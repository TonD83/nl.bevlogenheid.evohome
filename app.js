//var jsonPath = require('jsonpath-plus')
//var http = require('http.min')
//var parseString = require('xml2js').parseString
var Evohomey = require('./lib/evohomey')



function flow_actions () {

  Homey.manager('flow').on('action.set_quickaction', function (callback, args) {
    Homey.log('QuickAction: ' + args.qa)
    var settings = Homey.manager('settings').get('evohomeaccount')
      if (settings) {
        var evohomesystem = new Evohomey({
          user: settings.user,
          password: settings.password,
          appid: settings.appid
        })
        Homey.log (settings.password)
        evohomesystem.quickAction(args.qa)
        callback( null, true )
      } else {
        callback ('invalidSettings')
      }
  })
}

var self = {
  init: function() {
     Homey.log("Evohome app started")

     flow_actions()
  }
}

module.exports = self;
