"use strict";
const Homey = require('homey');
var jsonPath = require('jsonpath-plus')
var http = require('http.min')
var evohomey = require('./lib/evohomey.js')

class Evohome extends Homey.App {

  onInit() {
    this.log("Evohome app started");
    Homey.ManagerSettings.set('account_info','None');
    Homey.ManagerSettings.set('installation','None');

// set_quickaction

let set_quickaction = new Homey.FlowCardAction('set_quickaction');
set_quickaction
    .register()
    .registerRunListener(( args, state ) => {
        this.log(args['qa'])
        let qa_set = evohomey.quickaction_set(args['qa']); // true or false
        Homey.ManagerSettings.set('quickAction',args['qa']);
        return Promise.resolve( qa_set );

    })

// set_quickaction_manual_entry

let set_quickaction_manual_entry = new Homey.FlowCardAction('set_quickaction_manual_entry');
set_quickaction_manual_entry
    .register()
    .registerRunListener(( args, state ) => {
        this.log('quickaction manual entry')
        this.log(args['qa'])
        switch(args['qa']) {
            case "HeatingOff":
            case "Auto":
            case "AutoWithEco":
            case "Away":
            case "Custom":
            case "DayOff":
              let qa_set = evohomey.quickaction_set(args['qa']); // true or false
              Homey.ManagerSettings.set('quickAction',args['qa']);
              return Promise.resolve( qa_set );
                break
              default:
                return Promise.reject ('invalidSettings')
            }
    })

// set_temperature_manual (device)

let set_temperature_manual = new Homey.FlowCardAction('set_temperature_manual');
set_temperature_manual
    .register()
    .registerRunListener(( args, state ) => {
        this.log('temperature manual entry')
        this.log(args.device._id)
        let temp_set = evohomey.temperature_set(args.device._id,args['temp_manual'],1)
        return Promise.resolve( 'temp_set' );
    })

// reset_temperature (device)

let reset_temperature = new Homey.FlowCardAction('reset_temperature');
reset_temperature
    .register()
    .registerRunListener(( args, state ) => {
        this.log('temperature reset')
        this.log(args.device._id)
        let temp_reset = evohomey.temperature_set(args.device._id,'',0)
        return Promise.resolve( 'temp_reset' );
    })
 //// MAIN

// tijdelijk voor tests:
//  Homey.ManagerSettings.set('qa','Away');
//

 console.log('-----')
 regular_update(); // kick-off during start-up
setInterval(regular_update,5 * 60 * 1000);
function regular_update() {
    console.log('5 minute update routine')
    // 1 - quickaction status uitlezen
    console.log('quickaction read')
    var quickactionPromise  = evohomey.quickaction_read();
    quickactionPromise.then(function(result) {
    var qa_new = result;
    console.log('QA retrieved: ', qa_new);
    var qa_old = Homey.ManagerSettings.get('qa')
    console.log('QA Stored: ',qa_old);
    if (qa_old != qa_new) {
      // Trigger quickaction_changed_externally
      console.log ('quickaction changed')
      Homey.ManagerSettings.set('qa',qa_new);
      let quickaction_changed_externally = new Homey.FlowCardTrigger('quickaction_changed_externally');
      let tokens = {
        'qa_name': qa_new
      }
      quickaction_changed_externally
      .register()
      .trigger(tokens)
        .catch(this.error)
        .then(this.log)
    }
    // 2 - zone status uitlezen
    console.log('zone status read')
    var zonePromise = evohomey.zones_read();
    zonePromise.then(function(result) {
      var data = result;
      console.log('hier gebeurt niets volgens mij');
      //Homey.ManagerSettings.set('zones_read','test');
      // hier dingen uitvoeren
    })
});

} // 5 minute update

 //// END MAIN
  } // end oninit
}

module.exports = Evohome;
