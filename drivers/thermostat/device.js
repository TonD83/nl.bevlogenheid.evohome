'use strict';

const Homey = require('homey');

class ThermostatDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        //this.log('class:', this.getClass());
        //this.log('capability:', this.getCapabilities());
        this.log('settings:'), this.getData();

        // register a capability listener
        this.registerCapabilityListener('target_temperature', (value, opts) => {
            this.log('target temperature set requested')
            var target_old = this.getCapabilityValue('target_temperature')
            this.log('old:', target_old)
            this.log(value)
            this.log(opts)
            if (target_old != value) {
              // execute target setting
              this.log('changing target temperature')
              // execute HTTP request ; how to know zone_id ?
              this.setCapabilityValue('target_temperature', value)
            }
            return Promise.resolve()

        })

    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }

}

module.exports = ThermostatDevice;
