# HaveIBeenPwnedChecker
A tool to check your passwords for being leaked on [HaveIBeenPwned.com](https://www.haveibeenpwned.com)

[Download, Screenshots and more information (German)](https://www.astrogd.eu/software/haveibeenpwned-checker)

[Download V 1.0.0 (English & German)](https://software.astrogd.eu/haveibeenpwnedchecker/download/HaveIBeenPwnedCheckerV1.0.0.exe) | [Signature](https://software.astrogd.eu/haveibeenpwnedchecker/download/HaveIBeenPwnedCheckerV1.0.0.exe.sig)

## How to create your own binary
- Download Repository, install [NodeJS](https://www.nodejs.org) and run `npm install`
- Open a command prompt, change directory to base directory of this code and run `npm run build-win`
- The binary will be saved to `base directory/build/HaveIBeenPwned Checker-win32-x64/`
- In Order to run the binary **all files created need to be present in the directory of the executable**. This means you can't just copy the executable somewhere
