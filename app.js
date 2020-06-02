const electron = require("electron");
const path = require("path");
const fs = require("fs-extra");
const childProcess = require("child_process");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const shell = electron.shell;
const package = require(path.join(__dirname, "/package.json"));
const PwnCheck = require(path.join(__dirname, "/classes/PwnCheck.js"));
const updateCheck = require(path.join(__dirname, "classes/updateCheck.js"));

const language = {
    "en": require(path.join(__dirname, "/language/en.json")),
    "de-formal": require(path.join(__dirname, "/language/de_formal.json")),
    "de-informal": require(path.join(__dirname, "/language/de_informal.json"))
}

var win = {
    main: undefined,
    startup: undefined
};
var ready, userdata, config, langOptions;
var count = 0;

function checkVersionGreater(base, check, allowEqual = false) {
    let baseArr = base.toString().split(".");
    let checkArr = check.toString().split(".");

    if (baseArr.length !== 3 || checkArr.length !== 3) throw new TypeError("Invalid version style");

    if (baseArr[0] < checkArr[0]) return true;
    if (baseArr[0] > checkArr[0]) return false;
    if (baseArr[1] < checkArr[1]) return true;
    if (baseArr[1] > checkArr[1]) return false;
    if (baseArr[2] < checkArr[2]) return true;
    if (baseArr[2] > checkArr[2]) return false;
    if (allowEqual) return true;
    else return false;
}

function init() {
    win.startup = new BrowserWindow({
        show: false,
        backgroundColor: "#333333",
        width: 500,
        height: 300,
        center: true,
        resizable: false,
        movable: false,
        closable: false,
        fullscreenable: false,
        title: "Loading...",
        frame: false,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        },
        icon: path.join(__dirname, "/icon.png")
    });

    win.startup.once("ready-to-show", () => {
        win.startup.show();
        if (ready) load();
        ready = true;
    });

    ipc.once("ready", (event, _args) => {
        win.startup.sender = event.sender;
        if (ready) load();
        ready = true;
    });

    win.startup.setStatus = (title, barReset) => {
        if (!win.startup.sender) throw new Error("Window is not ready yet");
        win.startup.focus();
        win.startup.sender.send('setStatus', title);
        if (barReset) win.startup.sender.send('setBar', 0);
    };

    win.startup.setBar = (percent) => {
        if (!win.startup.sender) throw new Error("Window is not ready yet");
        win.startup.sender.send("setBar", percent);
    }

    win.startup.setVersion = (version) => {
        if (!win.startup.sender) throw new Error("Window is not ready yet");
        win.startup.sender.send("setVersion", version);
    }

    //win.startup.setIgnoreMouseEvents(true);
    win.startup.loadURL(`file://${path.join(__dirname, "/views/startup/index.html")}`);
}

async function load() {
    win.startup.setVersion(package.version);
    win.startup.setStatus(`[00${++count}] Loading config`, true);
    userdata = app.getPath('userData');
    fs.ensureDirSync(userdata);

    const defaultConfig = {
        lang: "en",
        version: package.version,
        changelogShown: true
    }

    if (!fs.existsSync(path.join(userdata, "/config.json"))) {
        fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(defaultConfig));
        config = defaultConfig;
    } else {
        config = require(path.join(userdata, "/config.json"));
    }

    win.startup.setStatus(`[00${++count}] Checking version`, true);

    if (checkVersionGreater(config.version, package.version)) {
        win.startup.setStatus(`[00${++count}] Finishing Update to newer version`, true);

        if (fs.existsSync(path.join(__dirname, "/update.js"))) {
            const Updater = require(path.join(__dirname, "/update.js"));
            try {
                await Updater(path.join(userdata, "/config.json"), config);
            } catch (error) {
                fs.writeFileSync(path.join(userdata, "/update-error.log"), error.stack);
                dialog.showMessageBoxSync(win.startup, {
                    type: "error",
                    buttons: ["Ok"],
                    title: "Error",
                    message: "We were unable to update your config to the newest version",
                    detail: `You can try to delete ${path.join(userdata, "/config.json")}, but this will delete your preferences. Otherwise delete the file, uninstall and reinstall the program and try again. If this isn't helping either, please contact support@astrogd.eu.\n\nAn error log has been created in ${path.join(userdata, "/update-error.log")}`
                });
                app.exit();
                return;
            }

            app.relaunch();
            app.exit();

            return;
        } else {
            config.version = package.version;
            fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(config));
        }
    }

    //This means an older version of HIBP Checker is running than the config was created for
    if (checkVersionGreater(package.version, config.version)) {
        dialog.showMessageBoxSync(win.startup, {
            type: "error",
            buttons: ["Ok"],
            title: "Error",
            message: "Your running an older version of HaveIBeenPwned Checker",
            detail: "The config shows you have been running a newer version of HaveIBeenPwned Checker. Opening the config with an older version can corrupt the data or crash the program in unexpected ways. The programm will not start. Please download the newest version of HaveIBeenPwned Checker."
        });
        shell.openExternal("https://www.astrogd.eu/software/haveibeenpwned-checker");
        win.startup.close();
        app.exit();
        return;
    }

    win.startup.setStatus(`[00${++count}] Checking language`, true);
    if (!language[config.lang]) {
        config.lang = "en";
        fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(config));
    }

    win.startup.setStatus(`[00${++count}] Preparing content`, true);
    langOptions = "";
    let availableLanguages = Object.keys(language);
    for (let i = 0; i < availableLanguages.length; i++) {
        const langID = availableLanguages[i];
        langOptions = langOptions + `<option value="${langID}">${language[langID].lang}</option>`;
    }

    win.startup.setStatus(`[00${++count}] Preparing view`, true);

    win.main = new BrowserWindow({
        show: false,
        backgroundColor: "#fff",
        width: 600,
        height: 750,
        minWidth: 600,
        minHeight: 750,
        center: true,
        resizable: true,
        movable: true,
        closable: true,
        fullscreenable: true,
        title: "AstroGD - HaveIBeenPwned Checker",
        frame: false,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        },
        icon: path.join(__dirname, "/icon.png")
    });

    ipc.once("ready", () => {        
        win.main.show();
        win.startup.destroy();
        win.startup = undefined;

        const update = new updateCheck();

        update.on("update-needed", (response) => {
            win.main.sender.send("update-available", response);
        });

        //Retry search for updates after 30 seconds if it has failed
        update.on("failed", () => {
            setTimeout(() => {
                update.check();
            }, 30000);
        });
    });

    ipc.on("loaded", (event) => {
        if (!win.main.sender) win.main.sender = event.sender;
        win.main.sender.send("content", {
            version: package.version,
            lang: language[config.lang],
            langCode: config.lang,
            langOptions: langOptions,
            showChangelog: config.changelogShown ? false : true
        });

        if (!config.changelogShown) {
            config.changelogShown = true;
            fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(config));
        }
    });

    ipc.on("minimize", () => {
        win.main.minimize();
    });

    ipc.on("maximize", () => {
        if (win.main.isMaximized()) win.main.unmaximize();
        else win.main.maximize();
    });

    ipc.on("close", () => {
        win.main.close();
        app.quit();
    });

    ipc.on("switchLang", (_event, lang) => {
        if (language[lang]) {
            config.lang = lang;
            fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(config));
            win.main.sender.send("languageFile", language[lang]);
        } else {
            win.main.sender.send("languageFile", false);
        }
    });

    ipc.on("check", async (_event, password) => {
        const timeout = setTimeout(() => {
            win.main.sender.send("timeout");
        }, 10000);
        const check = new PwnCheck.Password(password);
        check.once("ready", () => {
            check.check().catch(console.error);
            check.once("checked", (breached) => {
                clearTimeout(timeout);
                win.main.sender.send("result", breached);
            });
        });
    });

    win.main.loadURL(`file://${path.join(__dirname, "/views/main/index.html")}`);
}

app.on("ready", () => {
    init();
});