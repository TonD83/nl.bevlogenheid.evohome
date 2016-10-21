### Honeywell Evohome

With this app you can manage your Evohome and other systems that connect via Total Connect Comfort from within Homey. It is using the unofficial API of Evohome.

### Settings
After installing the application, first visit the Homey Settings and navigate to the 'Honeywell Evohome' application.

Fill in your username (email address) and password and press save. Then, go to Devices and add a Honeywell Evohome device. Press thermostat and select which devices you'd like to add into Homey.

### Flow support

*Triggers*

- When temperature changes: triggers a flow when temperature changes
    - Via device card: individual temperature changes
    - Via Evohome card: any temperature measurement changes
- When target temperature changes: triggers a flow when the target temperature setting changes
    - Via device card: individual target temperature settings changes

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

- Execute QuickAction (manual entry); with this card you can enter the quickaction yourself. This is usefull if you have stored a quickaction value in a variable in Homey, this can be used e.g. to restore a previous setting. e.g. door open, set quickaction for heating off, then when door closes, set quickaction with variable where the previous status was stored (e.g. Auto).

All actions are currently on 'permanent' mode. In the future there might be timers (e.g. set Economy for two hours). If you need that now, using the Homey built in-timers or the CountDown app to trigger a timed event.

### Speech

No speech support at this moment

### Acknowledgement

Initial scripting (based on HC2) provided by Webster
Icons provided by Webster & Reflow
Additional information by various sources on Internet

### Donate

If you like the app, consider a donation to support development  
[![Paypal donate][pp-donate-image]][pp-donate-link]

### Limitations

Only 1 Evohome system is supported right now. Let me know if you have multiple systems (e.g. 2 houses).

### ToDo

- Add target temperature triggers
- Add speech support
- Clean-up code
- Add timeout to code if Evohome service doesn't respond
- Add error checking in code
- Translation to NL

### Known bugs

In order of priority:

The API was changed, causing getting or setting the QuickAction system  status to fail. This would also halt the result of the settings. I've disable QuickAction getting and setting. The Action cards are still there, but they will not update your system.

[ Solved 0.4.7 ] : Cancel temperature didn't work in some circumstances. Should be OK now.

### Unknown bugs

Yes ;-)

### Changelog

- V0.4.7 2016-10-21 : Correct 'cancel temperature' implementation
- V0.4.6 2016-08-04 : Disabled quickaction checking due to API change
- V0.4.5 2016-07-22 : Removed some logging that cluttered the logging in settings
- V0.4.3 2016-06-15 : Solved 'first-run' bug
- V0.4.2 2016-06-14 : extra trigger & action cards, fixed bugs, first code clean-up
- V0.4.1 2016-06-09 : release for app store
- V0.3.6 2016-06-07 : insights logging added, pairing bugs solved
- V0.3.1 2016-06-05 : Second test release, including pairing of thermostats
- V0.0.1 2016-05-28 : First test release on Github

[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ralf%40iae%2enl&lc=GB&item_name=homey%2devohome&item_number=homey%2devohome&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif
