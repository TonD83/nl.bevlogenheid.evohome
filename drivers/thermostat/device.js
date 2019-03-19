'use strict';

const Homey = require('homey');
const http = require('http.min');
const evohomeLogin = require('../../lib/login');
const evohomey = require('../../lib/evohomey.js');
const API = require('../../lib/api');

const POLL_INTERVAL = 20 * 1000; // 20 seconds

class ThermostatDevice extends Homey.Device {

  // this method is called when the Device is inited
  onInit() {
    let device = this;
    this.log('device init name:', this.getName());
    const { id } = this.getData();

    // device will check every POLL_INTERVAL if there have been changes in its state
    this._sync = this._sync.bind(this);
    this._syncInterval = setInterval(this._sync, POLL_INTERVAL);

    // Action: target_temperature
    this.registerCapabilityListener('target_temperature', async (value) => {
      this.log('target temperature set requested');
      const target_old = this.getCapabilityValue('target_temperature');
      this.log('old:', target_old);
      this.log('new:', value);
      if (target_old != value) {
        this.log('start target setting', id, value);
        device.setCapabilityValue('target_temperature', value);
        // execute target setting
        // /WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint
        evohomeLogin.login().then(function () {
          const switchpoints = Homey.ManagerSettings.get('zone_switchpoints');
          const nextSwitchpoint = switchpoints.find(sp => sp.zoneId === id).timeOfDay;
          const access_token = Homey.ManagerSettings.get('access_token');
          const locationurl = (API.baseUri + 'temperatureZone/' + id + '/heatSetpoint');
          const options = {
            protocol: API.protocol,
            hostname: API.hostname,
            path: locationurl,
            headers: {
              'Authorization': 'bearer ' + access_token,
              'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
            },
            json: true,
            form: {
              'HeatSetpointValue': value,
              'SetpointMode': 2, // 0 schedule, 1 permanent override, 2 temp override
              'TimeUntil': evohomey.toDateWithoutTimeZone(nextSwitchpoint).toISOString()
            }
          };
          http.put(options).then(() => {
            // we need to write the new target_temperature into the zone_data file, so it contains the new value (or otherwise _sync will override it)
            const zone_data = Homey.ManagerSettings.get('zones_read');
            // rewrite the target_temperature into zone_data and save
            zone_data.forEach(function (item, i) { if (item.zoneId == id) zone_data[i].setpointStatus.targetHeatTemperature = value; });
            Homey.ManagerSettings.set('zones_read', zone_data);
            return Promise.resolve();
          })
            .catch(error => {
              console.log('catch 1', error);
            });
        })
          .catch(error => {
            console.log('catch 2', error);
          });
      }
    });

    //  test

    // Action: target_temperature
    this.registerCapabilityListener('target_temperature_manual', async (value) => {
      this.log('manual target temperature set requested');
      const target_old = this.getCapabilityValue('target_temperature');
      this.log('old:', target_old);
      this.log('new:', value);
      if (target_old != value) {
        this.log('start target setting', id, value);
        device.setCapabilityValue('target_temperature', value);
        // execute target setting
        // /WebAPI/api/devices/' + deviceID + '/thermostat/changeableValues/heatSetpoint
        evohomeLogin.login().then(function () {
          const access_token = Homey.ManagerSettings.get('access_token');
          const locationurl = (API.baseUri + 'temperatureZone/' + id + '/heatSetpoint');
          const options = {
            protocol: API.protocol,
            hostname: API.hostname,
            path: locationurl,
            headers: {
              'Authorization': 'bearer ' + access_token,
              'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
            },
            json: true,
            form: {
              'HeatSetpointValue': value,
              'SetpointMode': 1,
              'TimeUntil': ''
            }
          };
          http.put(options).then(() => {
            // we need to write the new target_temperature into the zone_data file, so it contains the new value (or otherwise _sync will override it)
            const zone_data = Homey.ManagerSettings.get('zones_read');
            // rewrite the target_temperature into zone_data and save
            zone_data.forEach(function (item, i) { if (item.zoneId == id) zone_data[i].setpointStatus.targetHeatTemperature = value; });
            Homey.ManagerSettings.set('zones_read', zone_data);
            return Promise.resolve();
          })
            .catch(error => {
              console.log('catch 1', error);
            });
        })
          .catch(error => {
            console.log('catch 2', error);
          });
      }
    });

    // TEST
    // read zone information
    // dit moeten we elke paar minuten draaien
  }

  getID() {
    return this.getData().id;
  }

  // this method is called when the Device is added
  onAdded() {
    this.log('device added');
  }

  // this method is called when the Device is deleted
  onDeleted() {
    this.log('Device deleted: ', this.getData().id);
    clearInterval(this._syncInterval);
  }

  // capabilities checking
  _sync() {
    const { id } = this.getData();
    let device = this;
    const zone_data = Homey.ManagerSettings.get('zones_read');
    if (zone_data != 'None') {
      zone_data.forEach((value) => {
        if (value.zoneId == id) {
          // process zone information
          const measure_old = device.getCapabilityValue('measure_temperature');
          if (measure_old != value.temperatureStatus.temperature) {
            device.setCapabilityValue('measure_temperature', value.temperatureStatus.temperature);
            let anytempchange = new Homey.FlowCardTrigger('any_measure_temp_changed');
            let tokens = {
              'thermostat': value.name,
              'temperature': value.temperatureStatus.temperature
            };
            anytempchange
              .register()
              .trigger(tokens)
              .catch(device.error)
              .then(device.log);
          }
          device.getCapabilityValue('target_temperature');
          device.setCapabilityValue('target_temperature', value.setpointStatus.targetHeatTemperature);
          // hier nog een trigger bouwen voor target temp change card (new)
        }
      });
    }
  }
}

module.exports = ThermostatDevice;
