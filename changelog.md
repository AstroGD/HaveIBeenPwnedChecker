# V1.6.2
#### Release: 13.06.2022

## Updates
* Updated Electron to V19
* Updated Jest to V28

# V1.6.1
#### Release: 28.09.2021

## Updates
* Updated Electron to V15

# V1.6.0
#### Release: 28.05.2021

## Updates
* Updated tests for newer jest version
* Updated git url in package.json
* Added User Agent for requests to the HaveIBeenPwned API
* Updated dependencies to the newest version. This is part of the monthly security updates.
  Updated packages:
    - Upgrade fs-extra to 10.0.0
    - Upgrade jest to 27.0.1
    - Upgrade follow-redirects to 1.14.0
    - Upgrade electron to 13.0.1


# V1.5.1
#### Release: 10.04.2021

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - follow-redirects from 1.13.2 to 1.13.3
    - electron from 11.2.2 to 11.4.2
* Updated jQuery to 3.6.0
* Updated AnimeJS to 3.2.1

# V1.5.0
#### Release: 03.02.2021

## New
* New Design and Icon - HaveIBeenPwned-Checker goes darker

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - follow-redirects from 1.13.0 to 1.13.2
    - fs-extra from 9.0.1 to 9.1.0
    - electron from 11.0.3 to 11.2.2
    - electron-packager from 15.1.0 to 15.2.0
* Updated Readme.md

# V1.4.0
#### Release: 25.11.2020

## New
* Removed unnecessary files to speed up installation and reduce required space

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 10.1.3 to 11.0.3
    - jest from 26.4.2 to 26.6.3

# V1.3.4
#### Release: 01.10.2020

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 10.1.1 to 10.1.3
    - jsdoc from 3.6.5 to 3.6.6

# V1.3.3
#### Release: 02.09.2020

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 9.2.1 to 10.1.1
    - electron-packager from 15.0.0 to 15.1.0
    - jest from 26.4.1 to 26.4.2

# V1.3.2
#### Release: 20.08.2020

## Updates
* Updated dependencies to the newest version. This is a hotfix as a result of a high severity vulnerability in Electron < 9.2.1.
  Updated packages:
    - electron from 9.1.2 to 9.2.1
    - follow-redirects from 1.12.1 to 1.13.0
    - jest from 26.2.2 to 26.4.1

# V1.3.1
#### Release: 03.08.2020

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 9.1.0 to 9.1.2
    - jest from 26.1.0 to 26.2.2
    - jsdoc from 3.6.4 to 3.6.5

# V1.3.0
#### Release: 11.07.2020

## New
* When building the License file will be automattically adjusted to the projects License

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - follow-redirects from 1.11.0 to 1.12.1
    - electron from 9.0.2 to 9.1.0
    - electron-packager from 14.2.1 to 15.0.0
    - jest from 26.0.1 to 26.1.0

# V1.2.0
#### Release: 06.05.2020

## New
* If the updater fails to check if a newer update is available, it will repeat to check every 30 seconds until success

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 8.2.5 to 9.0.2
    - jest from 25.5.3 to 26.0.1
    - fs-extra from 9.0.0 to 9.0.1

# V1.1.1
#### Release: 01.05.2020

## Updates
* Updated dependencies to the newest version. This is part of the monthly security update.
  Updated packages:
    - electron from 8.2.0 to 8.2.5
    - jest from 25.2.7 to 25.5.3
    - jsdoc from 3.6.3 to 3.6.4

# V 1.1.0
#### Release:  04.04.2020

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
#### Release: 12.03.2020

## New
* Check password: Enter your password in the input field and press "Enter" to verify your password in HaveIBeenPwned's database.
* Help in case of compromise: Click on "more" in the popup to learn more about what to do in case of a compromise.
* For developers: All testing work is outsourced to a class, so that developers can easily create their own software for testing and take over the functionality from my class.
* Available languages: German and English
* Updater: checks for new updates and notifies the user