//var jsonPath = require('jsonpath-plus')
//var http = require('http.min')
//var parseString = require('xml2js').parseString
var Evohomey = require('./lib/evohomey')

function trigger_actions () {
  Homey.log('trigger_actions')

}

function flow_actions () {

  Homey.manager('flow').on('action.set_quickaction', function (callback, args) {
    //Homey.log('QuickAction: ' + args.qa)
    var settings = Homey.manager('settings').get('evohomeaccount')
      if (settings) {
        var evohomesystem = new Evohomey({
          user: settings.user,
          password: settings.password,
          appid: settings.appid
        })
        //Homey.log (settings.password)
        evohomesystem.quickAction(args.qa)
        callback( null, true )
      } else {
        callback ('invalidSettings')
      }
  })

  Homey.manager('flow').on('action.set_quickaction_manual_entry', function (callback, args) {
    //Homey.log('QuickAction: ' + args.qa)
    var settings = Homey.manager('settings').get('evohomeaccount')
      if (settings) {
        var evohomesystem = new Evohomey({
          user: settings.user,
          password: settings.password,
          appid: settings.appid
        })
        //Homey.log (settings.password)
        Homey.log('[trigger] qa manual entry: ' + args.qa )
        switch(args.qa) {
            case "HeatingOff":
            case "Auto":
            case "AutoWithEco":
            case "Away":
            case "Custom":
            case "DayOff":
              evohomesystem.quickAction(args.qa)
              callback (null, true)
              break
            default:
              callback ('invalidSettings')
        }
      } else {
        callback ('invalidSettings')
      }
  })

}



var self = {
  init: function() {
     Homey.log("Evohome app started -- app.js")
     flow_actions()
     trigger_actions()
  }
}

module.exports = self;
