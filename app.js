const electron = require("electron");
const path = require("path");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const package = require(path.join(__dirname, "/package.json"));
const PwnCheck = require(path.join(__dirname, "/classes/PwnCheck.js"));

var win = {
    main: undefined,
    startup: undefined
};
var ready;
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
        }
    });

    win.startup.once("ready-to-show", () => {
        win.startup.show();
        if (ready) setTimeout(load, 2000);
        ready = true;
    });

    ipc.once("ready", (event, _args) => {
        win.startup.sender = event.sender;
        if (ready) setTimeout(load, 2000);
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
        }
    });

    ipc.once("ready", () => {
        win.main.show();
        win.startup.destroy();
        win.startup = undefined;
    });

    ipc.once("loaded", (event) => {
        win.main.sender = event.sender;
        win.main.sender.send("version", package.version);
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