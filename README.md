### Homey Evohome

With this app you can manage your Evohome system from within Homey.


### Settings
After installing the application, first visit the Homey Settings and navigate to the 'Evohome' application.

Fill in your username (email address) and password.  You can leave the application-id as-is, unless you have your own application ID.

### Flow support

*Triggers*

No triggers defined at this moment

*Actions*

There is one action:

- Execute QuickAction ; these are the generic settings of your Evohome. You can choose between:
    - Auto: this is the normal mode, Evohome will follow the set program
    - Economy: this is the economy mode, normally 3 degrees lower than Auto
    - Heating Off: This will turn your heating off ( with a lower limit of 7 degrees to protect the system from freezing )
    - Away: This will set the Evohome system to Away mode
    - Day Off: This will set the Evohome system to 'Day off' mode
    - Custom: This will set the Evohome system to 'Custom' mode; whatever you configured in Evohome itself

All actions are currently on 'permanent' mode. In the future there might be timers (e.g. set Economy for two hours). If you need that now, using the Homey built in-timers or the CountDown app to trigger a timed event.

*Conditions*

No Conditions defined at this moment
### Speech

No speech support at this moment

### Acknowledgement

Initial scripting (based on HC2) provided by Webster
Icons provided by Webster & Reflow
Additional information by various sources on Internet

### Limitations

Only 1 Evohome system is supported right now. Let me know if you have multiple systems (e.g. 2 houses).

### ToDo

- Add individual thermostats reading and setting
- Add speech support
- Clean-up code
- Add timeout to code if Evohome service doesn't respond
- Add error checking in code
- Translation to NL

### Known bugs

- Updating thermostat temperature via device card will not work
- Adding all thermostats at once during pairing will freeze the pairing process
- Reading device card immediately after pairing will crash the app
- Logging in 'settings' sometimes disappears when new logging is added

### Unknown bugs

Yes ;-)

### Changelog

- V0.3.1 2016-06-05 : Second test release, including pairing of thermostats
- V0.0.1 2016-05-28 : First test release on Github
