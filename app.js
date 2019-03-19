'use strict';

const Homey = require('homey');
const evohomey = require('./lib/evohomey.js');

class Evohome extends Homey.App {

  onInit() {
    this.log('Evohome app started');
    Homey.ManagerSettings.set('account_info', 'None');
    Homey.ManagerSettings.set('installation', 'None');
    Homey.ManagerSettings.set('zones_read', 'None');
    Homey.ManagerSettings.set('access_token_expires', Date()); // make sure new is used at start-up

    // set_quickaction
    let set_quickaction = new Homey.FlowCardAction('set_quickaction');
    set_quickaction
      .register()
      .registerRunListener(args => {
        this.log(args['qa']);
        let qa_set = evohomey.quickaction_set(args['qa'], 'True', ''); // true or false
        Homey.ManagerSettings.set('quickAction', args['qa']);
        return Promise.resolve(qa_set);

      });

    // set_quickaction
    let set_temporary_quickaction = new Homey.FlowCardAction('set_temporary_quickaction');
    set_temporary_quickaction
      .register()
      .registerRunListener(args => {
        this.log(args['qa']);
        const tmpTime = new Date();
        tmpTime.setHours(tmpTime.getHours() + args['temp_hours']);
        tmpTime.setSeconds(0, 0);
        this.log(args['temp_hours']);
        this.log(tmpTime.toISOString().replace(/\.\d+Z/, 'Z'));

        evohomey.quickaction_set(args['qa'], 'False', tmpTime.toISOString().replace(/\.\d+Z/, 'Z')); // true or false
        Homey.ManagerSettings.set('quickAction', args['qa']);
        return Promise.resolve(' TMP ok');
      });

    // set_quickaction_manual_entry
    let set_quickaction_manual_entry = new Homey.FlowCardAction('set_quickaction_manual_entry');
    set_quickaction_manual_entry
      .register()
      .registerRunListener(args => {
        this.log('quickaction manual entry');
        this.log(args['qa']);
        switch (args['qa']) {
          case 'HeatingOff':
          case 'Auto':
          case 'AutoWithEco':
          case 'Away':
          case 'Custom':
          case 'DayOff': {
            let qa_set = evohomey.quickaction_set(args['qa'], 'True', ''); // true or false
            Homey.ManagerSettings.set('quickAction', args['qa']);
            return Promise.resolve(qa_set);
          }
          default:
            return Promise.reject('invalidSettings');
        }
      });

    // set_temperature_manual (device)
    let set_temperature_manual = new Homey.FlowCardAction('set_temperature_manual');
    set_temperature_manual
      .register()
      .registerRunListener(args => {
        this.log('temperature manual entry');
        var id = args.device.getID();
        this.log(id);
        evohomey.temperature_set(id, args['temp_manual'], 1);
        return Promise.resolve('temp_set');
      });

    // set_temperature_temporary (device)
    let set_temperature_temporary = new Homey.FlowCardAction('set_temperature_temporary');
    set_temperature_temporary
      .register()
      .registerRunListener(args => {
        this.log('temperature temporary manual entry');
        var id = args.device.getID();
        this.log(id);
        const tmpTime = new Date();
        this.log(tmpTime);
        tmpTime.setHours(tmpTime.getHours() + args['temp_hours']);
        tmpTime.setSeconds(0, 0);
        this.log(args['temp_hours']);
        this.log(tmpTime.toISOString().replace(/\.\d+Z/, 'Z'));
        var setcode = 'TemporaryOverride';
        evohomey.temperature_set(id, args['temp_manual'], setcode, tmpTime.toISOString().replace(/\.\d+Z/, 'Z'));
        return Promise.resolve('temp_temorary_set');
      });

    // reset_temperature (device)
    let reset_temperature = new Homey.FlowCardAction('reset_temperature');
    reset_temperature
      .register()
      .registerRunListener(args => {
        this.log('temperature reset');
        var id = args.device.getID();
        this.log(id);
        evohomey.temperature_set(id, '', 0);
        return Promise.resolve('temp_reset');
      });

    // reset_all_zones (device)
    let reset_all_zones = new Homey.FlowCardAction('reset_all_zones');
    reset_all_zones
      .register()
      .registerRunListener(() => {
        this.log('reset all zones');
        // first we need a list of all IDs
        var zonePromise = evohomey.zones_read();
        zonePromise.then((result) => {
          var data = result;
          data.forEach((value) => {
            if (value.setpointStatus.setpointMode != 'FollowSchedule') {
              evohomey.temperature_set(value.zoneId, '', 0, '');
            }
          });
          return Promise.resolve('ok');
        })
          .catch('catch reset_all_zones');
        return Promise.resolve('ok');
      });

    //// MAIN

    regular_update(); // kick-off during start-up
    setInterval(regular_update, 5 * 60 * 1000);
    function regular_update() {
      // 1 - quickaction status uitlezen
      var quickactionPromise = evohomey.quickaction_read();
      quickactionPromise.then((result) => {
        var qa_new = result;
        var qa_old = Homey.ManagerSettings.get('qa');
        if (qa_old !== qa_new) {
          // Trigger quickaction_changed_externally
          Homey.ManagerSettings.set('qa', qa_new);
          let quickaction_changed_externally = new Homey.FlowCardTrigger('quickaction_changed_externally');
          let tokens = {
            'qa_name': qa_new
          };
          quickaction_changed_externally
            .register()
            .trigger(tokens)
            .catch('qa changed externally catch');
        }
        // 2 - zone status uitlezen
        var zonePromise = evohomey.zones_read();
        zonePromise.then(result => {
          Homey.ManagerSettings.set('zones_read', result);
          // hier dingen uitvoeren
          const getSchedules = result.map(res => {
            // 3 - schedule uitlezen
            return evohomey.schedules_read(res.zoneId);
          });
          Promise.all(getSchedules).then(result => {
            Homey.ManagerSettings.set('zone_switchpoints', result);
          });
        });
      }).catch(err => console.log(err));

    } // 5 minute update
    //// END MAIN
  } // end oninit
}

module.exports = Evohome;
