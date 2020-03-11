const ipc = require("electron").ipcRenderer;

var pointers;

var versionSet = false;

async function init() {
    pointers = {
        status: $("#status"),
        bar: $(".bar"),
        version: $(".version")
    };
    pointers.status.html("Starting up...");
    pointers.bar.css("width", "0%");
    anime.timeline({
        easing: "easeInOutSine",
        complete: function () {
            ipc.send("ready");
        }
    }).add({
        targets: ".logo",
        strokeDashoffset: ["6750px", "0px"],
        duration: 2000,
        delay: 500
    }).add({
        targets: ".logo",
        fill: "#fff",
        duration: 2000
    }).add({
        targets: ".lds-ellipsis",
        opacity: ["0%", "100%"],
        duration: 2000
    }, "-=2000").add({
        targets: "#status",
        opacity: ["0%", "100%"],
        duration: 1000
    }, "-=2000");
}

ipc.on("setStatus", (_event, title) => {
    pointers.status.html(title);
});

ipc.on("setBar", (_event, percent) => {
    pointers.bar.css("width", percent + "%");
});

ipc.on("setVersion", (_event, version) => {
    if (versionSet) return;
    pointers.version.html(`V${version}`);
    anime({
        easing: "easeInOutSine",
        targets: ".version",
        opacity: ["0%", "100%"],
        duration: 1000
    });
    versionSet = true;
});

setTimeout(init,1);