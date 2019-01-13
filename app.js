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

// TRIGGERS

//any_measure_temp_changed

//quickaction_changed_externally

// CONDITIONS

// ACTIONS

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

// set_temperature_manual (device)

// reset_temperature (device)

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
      console.log(data);
      // hier dingen uitvoeren
    })
});

} // 5 minute update

 //// END MAIN
  } // end oninit
}

module.exports = Evohome;
