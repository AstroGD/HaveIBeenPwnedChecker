const electron = require("electron");
const path = require("path");
const fs = require("fs-extra");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const package = require(path.join(__dirname, "/package.json"));
const PwnCheck = require(path.join(__dirname, "/classes/PwnCheck.js"));

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
        lang: "en"
    }

    if (!fs.existsSync(path.join(userdata, "/config.json"))) {
        fs.writeFileSync(path.join(userdata, "/config.json"), JSON.stringify(defaultConfig));
        config = defaultConfig;
    } else {
        config = require(path.join(userdata, "/config.json"));
    }

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
    });

    ipc.on("loaded", (event) => {
        if (!win.main.sender) win.main.sender = event.sender;
        win.main.sender.send("content", {
            version: package.version,
            lang: language[config.lang],
            langOptions: langOptions
        });
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