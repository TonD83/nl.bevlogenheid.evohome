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

// set_quickaction_manual_entry

// set_temperature_manual (device)

// reset_temperature (device)

//var evohomeUser = Homey.ManagerSettings.get('username');
//var evohomePassword= Homey.ManagerSettings.get('password');
//var appid="91db1612-73fd-4500-91b2-e63b069b185c"

//    evohomey.login(evohomeUser,evohomePassword,appid);
//    var access_token = Homey.ManagerSettings.get('access_token');
//    var access_token_expires = Homey.ManagerSettings.get('access_token_expires');
    //console.log(access_token);
    //console.log(access_token_expires);
  //  setInterval(timers_update,1000);
	//   function timers_update() {
  //     var access_token_expires = Homey.ManagerSettings.get('access_token_expires');
  //     //console.log(access_token);
  //     //console.log(access_token_expires);
  //     var huidigeTime = new Date();
  //     //console.log('huidige tijd: ', huidigeTime);
  //     var difference = access_token_expires - huidigeTime;
  //     if (difference < 0)
  //     {
  //       console.log ('token expired');
  //     }
  //  }


 //// MAIN

// tijdelijk voor tests:

  Homey.ManagerSettings.set('qa','Away');
//


 var quickactionPromise  = evohomey.quickaction_read();
 quickactionPromise.then(function(result) {
    var qa_new = result;
    console.log(qa_new);
    var qa_old = Homey.ManagerSettings.get('qa')
    console.log(qa_old);
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
});

 //// END MAIN
  } // end oninit
}

module.exports = Evohome;
