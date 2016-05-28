//var jsonPath = require('jsonpath-plus')
//var http = require('http.min')
//var parseString = require('xml2js').parseString
var evohomey = require('./lib/evohomey')

function flow_actions () {

  Homey.manager('flow').on('action.set_quickaction', function (callback, args) {
    Homey.log(args)
    Homey.log(args.qa)
    evohomey.quickAction(args.qa)
    callback( null, true )
  })
}

var self = {
  init: function() {
     Homey.log("Evohome app started")

     flow_actions()
  }
}

module.exports = self;
