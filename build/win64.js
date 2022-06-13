const packager = require('electron-packager');
const path = require("path");
const fs = require("fs");

async function bundleElectronApp(options) {
    const appPaths = await packager(options)
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`);
    fs.renameSync(path.join(__dirname, "../bin/HaveIBeenPwned Checker-win32-x64/LICENSE"), path.join(__dirname, "../bin/HaveIBeenPwned Checker-win32-x64/LICENSE.github"));
    fs.copyFileSync(path.join(__dirname, "../License.md"), path.join(__dirname, "../bin/HaveIBeenPwned Checker-win32-x64/LICENSE"));
    console.log(`LICENSE files updated`);
}

const options = {
    appCopyright: `(c) 2020-${new Date().getFullYear()} AstroGD Lukas Weber`,
    arch: "x64",
    dir: path.join(__dirname, "../"),
    asar: true,
    executableName: "HaveIBeenPwnedChecker",
    icon: path.join(__dirname, "/icon.ico"),
    ignore: /^.*\b(docs|coverage|build|jsdoc\.json|\.gitignore|README\.md)\b.*$/mi,
    name: "HaveIBeenPwned Checker",
    out: path.join(__dirname, "../bin/"),
    platform: "win32",
    win32metadata: {
        CompanyName: "AstroGD Lukas Weber",
        FileDescription: "A tool to check if a password was part of a leak",
        ProductName: "HaveIBeenPwned Checker"
    },
    overwrite: true
}

bundleElectronApp(options);