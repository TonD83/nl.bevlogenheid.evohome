### Homey Evohome

With this app you can manage your Evohome system from within Homey.

### Settings
After installing the application, first visit the Homey Settings and navigate to the 'Evohome' application.

Fill in your username (email address) and password.  You can leave the application-id as-is, unless you have your own application ID.

### Flow support

*Triggers*

- When temperature changes: triggers a flow when temperature changes 

*Conditions*

No conditions defined at this moment

*Actions*

- Set temperature ; this will set the individual temperature on a device. Attention: there is no way yet to cancel this setting other than setting another temperature or using the Evohome app/system. 

- Reset temperature: Cancel individual device setting

- Execute QuickAction ; these are the generic settings of your Evohome. You can choose between:
    - Auto: this is the normal mode, Evohome will follow the set program
    - Economy: this is the economy mode, normally 3 degrees lower than Auto
    - Heating Off: This will turn your heating off ( with a lower limit of 7 degrees to protect the system from freezing )
    - Away: This will set the Evohome system to Away mode
    - Day Off: This will set the Evohome system to 'Day off' mode
    - Custom: This will set the Evohome system to 'Custom' mode; whatever you configured in Evohome itself

All actions are currently on 'permanent' mode. In the future there might be timers (e.g. set Economy for two hours). If you need that now, using the Homey built in-timers or the CountDown app to trigger a timed event.

### Speech

No speech support at this moment

### Acknowledgement

Initial scripting (based on HC2) provided by Webster
Icons provided by Webster & Reflow
Additional information by various sources on Internet

### Donate

If you like the app, buy me a beer!  
[![Paypal donate][pp-donate-image]][pp-donate-link]

- Adddd
- Adddd

### Limitations

Only 1 Evohome system is supported right now. Let me know if you have multiple systems (e.g. 2 houses).

### ToDo

- Add quick action status changes (outside of Homey)
- Add speech support
- Clean-up code
- Add timeout to code if Evohome service doesn't respond
- Add error checking in code
- Translation to NL

### Known bugs

In order of priority:

- [SOLVED 0.4.0] Restart of app needed after pairing to get device cards working (i.e. not crashing the app)
- [SOLVED 0.3.6] Adding all thermostats at once during pairing will freeze the pairing process
- [SOLVED 0.3.6] App crashes when pairing starts without username/password settings
- Removing the app doesn't remove the devices info (which can impact when you re-install the app)
- [SOLVED 0.3.3] Setting the target temperature will give an error 400: invalid URL and target temperature will not be sent to Evohome

### Unknown bugs

Yes ;-)

### Changelog

- V0.4.0 2016-06-09 : bug solving, add and delete thermostat as expected
- V0.3.6 2016-06-07 : insights logging added, pairing bugs solved
- V0.3.4 2016-06-07 : update: insights logging added
- V0.3.3 2016-06-06 : update: target temperature setting OK
- V0.3.2 2016-06-06 : update: target-temperature reading OK, buglist ordered to priority
- V0.3.1 2016-06-05 : Second test release, including pairing of thermostats
- V0.0.1 2016-05-28 : First test release on Github

[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ralf%40iae%2enl&lc=GB&item_name=homey%2devohome&item_number=homey%2devohome&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted 
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif
