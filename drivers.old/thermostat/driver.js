var evohomey = require('../../lib/evohomey')
var jsonPath = require('jsonpath-plus')
var devices = {}

var sessionID=("empty")
var userID=("empty")
var locationID=("empty")
var allinformation=[]

var self = module.exports = {

  init : function (devices_data, callback) {
  // when the driver starts, Homey rebooted. Initialize all previously paired devices.
      devices_data.forEach(function(device_data){
          Homey.log('initializing:' + device_data.id + ': ' + device_data.name)
          devices[ device_data.id ] = {
                data    : device_data,
                state   : {}
            }
      })
      getState(devices_data)
      setInterval(function(){
            Homey.log('[Evohome] Recurring Interval devices')
          // getState(devices_data)
        }, 1000 * 60 * 1)
      callback()
}

getState : function ( devices_data, callback) {
  var rawdata =[]
  evohomey.getAllInformation(sessionID,function(rawdata) {
    var rawdevices = rawdata[0]["devices"]
    rawdevices.forEach(function(entry){
      Homey.log(entry["deviceID"] + ' checken...')
      devices_data.forEach(function(device_data) {
        // !! BUG: als je device toevoegt terwijl app al draait, dan wordt deze nog niet meegenomen. Pas na herstarten weer
        Homey.log (entry["deviceID"] + ' vergelijken met ' + device_data.id)
        if (device_data.id == entry["deviceID"]) {
          Homey.log ('Gevonden: ' + device_data.name)
          // voer updates uit
          // check of temperatuur veranderd is
          Homey.log ('Temp old: ' + device_id.temp)
          Homey.log ('Temp new: ' + Number(entry["thermostat"]["indoorTemperature"].toFixed(2)))
          Homey.log ('////////////')
          // TODO: check of naam veranderd is, zo ja, in Homey aanpassen indien mogelijk
        }
        Homey.log('----VOLGENDE----')
      })
    })
    Homey.log('---Einde getState-----')
    callback(null)
  })
 }


pair : function( socket ) {

  socket.on('start', function(data, callback) {
    Homey.log('list systems')
    evohomey.getLocationID(sessionID,locationID,function(sessionID,locationID) {
        Homey.log('list systems location:' + locationID)
        Homey.manager('settings').set('systemID',locationID)
        callback(null,locationID)
    })

    //var locationID = Homey.manager('settings').get('systemID')
    //Homey.log('new: ' + locationID)
    //if ( locationID == "empty" ) {
    //  Homey.log ('we need to pair the system')
    //}
    //callback(null,locationID)
  })


  socket.on('list_devices', function (data, callback) {
    Homey.log('list devices')
    var rawdata =[]
    evohomey.getAllInformation(sessionID,function(rawdata) {
      //Homey.log('Pairing data:' + rawdata)
      //Homey.log('========')
      //Homey.log(Array.isArray(rawdata))
      //Homey.log(rawdata[0]["devices"])
      //Homey.log(allinformation[0]["devices"])
      var rawdevices = rawdata[0]["devices"]
      var devices = []
      //Homey.log(devices)
      Homey.log('++++++++++')
      //Homey.log(rawdevices)
      rawdevices.forEach(function(entry){
        var device = {
          name: entry["name"],
          data: {
              id: entry["deviceID"],
              name: entry["name"],
              alive: entry["isAlive"],
              temp: Number(entry["thermostat"]["indoorTemperature"].toFixed(2))
          }
        }
        Homey.log(device)
        Homey.log('--------------------------------')
        devices.push(device)
        //Homey.log(devices)
      })
      callback(null, devices)
    })
  })

  socket.on("add_device", function(device, callback) {
    Homey.log('add device');
    devices.push(device)
  })

  socket.on('disconnect', function(){
    Homey.log("User aborted pairing, or pairing is finished");
  })
}

capabilities : {
    measure_temperature: {

        // this function is called by Homey when it wants to GET the dim state, e.g. when the user loads the smartphone interface
        // `device_data` is the object as saved during pairing
        // `callback` should return the current value in the format callback( err, value )
        get: function( device_data, callback ){
            Homey.log (device_data.temp)
            Homey.log (device_data.name)
            // get the bulb with a locally defined function
            //var thermostat = device_data.data.temp
            //Homey.log ('get temp:' + thermostat)
            //if( thermostat instanceof Error ) return callback( thermostat );

            // send the dim value to Homey
            if( typeof callback == 'function' ) {
                callback( null, device_data.state.measure_temperature );
            }
        }

        // this function is called by Homey when it wants to SET the dim state, e.g. when the user says 'red lights'
        // `device_data` is the object as saved during pairing
        // `dim` is the new value
        // `callback` should return the new value in the format callback( err, value )
      },
    target_temperature: {

      get: function( device_data, target_temperature, callback ) {
          Homey.log ('get target temperature')
          Homey.log (device_data)
          Homey.log (target_temperature)
          Homey.log ('set: ' + device_data.temp)
          //var bulb = getBulb( device_data.id );
          //if( bulb instanceof Error ) return callback( bulb );

          //if( bulb.state.dim != dim ) {
          //    bulb.state.dim = dim;
          //    module.exports.realtime( device_data, 'dim', dim);
          //    updateBulb( device_data.id );
          //}

          // send the new dim value to Homey
          if( typeof callback == 'function' ) {
              callback( null, device_data.state.target_temperature);
          }
      },
        set: function( device_data, target_temperature, callback ) {
            Homey.log ('set temperature')
            Homey.log ('set' + device_data)
            //var bulb = getBulb( device_data.id );
            //if( bulb instanceof Error ) return callback( bulb );

            //if( bulb.state.dim != dim ) {
            //    bulb.state.dim = dim;
            //    module.exports.realtime( device_data, 'dim', dim);
            //    updateBulb( device_data.id );
            //}

            // send the new dim value to Homey
            if( typeof callback == 'function' ) {
                callback( null, device_data.state.target_temperature);
            }
        }
    }
}

}
