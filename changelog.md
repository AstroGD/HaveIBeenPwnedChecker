# V 1.1.0
#### Released:  

## New
* Added Updater to automatically update the config from an older version.
* Added Changelog popup after you have updated to a newer version. This popup will only show once after installation of an update and not on a fresh install.

## Changes
* Updated some translations.

## Bugfixes
* Fixed a bug where the program would not close when detecting it is running with a newer config file than its version.

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 8.1.1 to 8.2.0
    - follow-redirects from 1.10.0 to 1.11.0
    - jest from 25.1.0 to 25.2.7
    - tidy-jsdoc from 1.2.2 to 1.4.0
    - fs-extra from 8.1.0 to 9.0.0

# V 1.0.0
#### Released: 12.03.2020

## New
* Check password: Enter your password in the input field and press "Enter" to verify your password in HaveIBeenPwned's database.
* Help in case of compromise: Click on "more" in the popup to learn more about what to do in case of a compromise.
* For developers: All testing work is outsourced to a class, so that developers can easily create their own software for testing and take over the functionality from my class.
* Available languages: German and English
* Updater: checks for new updates and notifies the user