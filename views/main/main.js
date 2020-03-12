const ipc = require("electron").ipcRenderer;
const shell = require("electron").shell;

var dark = true;
var ready = false;
var blocked;
var width;
var selector;
var lang;
var langOptions = "";

const iconSearch = '"\\f002"';
const iconCheck = '"\\f00c"';
const iconAlert = '"\\f071"';

function recalcWidth() {
    window.requestAnimationFrame(() => {
        selector.statusCircle.css("font-size", selector.statusCircle.width() < 300 ? selector.statusCircle.width() == 200 ? "65px" : width * 0.1 : "100px");
    });
}

function checkInput() {
    if (blocked) return;
    if (selector.password.val().length > 0) {
        selector.statusCircle.addClass("ready");
        ready = true;
    } else {
        selector.statusCircle.removeClass("ready");
        ready = false;
    }
}

function startCheck() {
    if (!ready || blocked) return;

    blocked = true;
    selector.password.attr("readonly", "readonly");
    selector.password.blur();
    selector.statusCircle.removeClass("ready");
    selector.statusIcon.fadeOut(400);
    setTimeout(() => {
        selector.body.removeClass("danger");
        selector.statusCircle.removeClass("danger");
        selector.body.removeClass("success");
        selector.statusCircle.removeClass("success");
        selector.statusLoading.fadeIn(400);
        setTimeout(checkPassword, 400);
    }, 400);
}

function checkPassword() {
    ipc.send("check", selector.password.val());
}

function helpMe() {
    shell.openExternal("https://www.astrogd.eu/software/haveibeenpwned-checker/mein-passwort-existiert-in-der-datenbank");
    updateLang();
}

function statusDanger() {
    selector.body.addClass("danger");
    selector.statusCircle.addClass("danger");
    document.documentElement.style.setProperty("--status-icon", iconAlert);
    selector.password.val("");
    selector.password.attr("readonly", false);
    selector.password.focus();
    blocked = false;
    Swal.fire({
        title: lang.status.danger.title,
        text: lang.status.danger.text,
        icon: "error",
        footer: `<a href onclick="helpMe()">${lang.status.danger.footer}</a>`,
        confirmButtonText: lang.status.danger.confirm,
        confirmButtonAriaLabel: lang.status.danger.aria,
    });
}

function statusNoWorries() {
    selector.body.addClass("success");
    selector.statusCircle.addClass("success");
    document.documentElement.style.setProperty("--status-icon", iconCheck);
}

function switchLanguage() {
    Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: lang.buttons.ok,
        cancelButtonText: lang.buttons.cancel,
        title: lang.switchLanguage.title,
        html: `<div class="my-3"><select class="custom-select" id="inputLanguage"><option selected>${lang.switchLanguage.text}</option>${langOptions}</select></div>`,
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    reject(lang.switchLanguage.error.timeout);
                }, 5000);
                let val = $("#inputLanguage").val();
                if (!val) return resolve(true);
                ipc.send("switchLang", val);

                ipc.once("languageFile", (_event, language) => {
                    if (!language) return (reject(lang.switchLanguage.error.unknownLang));
                    lang = language;
                    updateLang();
                    clearTimeout(timeout);
                    resolve(true);
                });
            }).catch((message) => {
                Swal.showValidationMessage(
                    `${lang.switchLanguage.error.info}: ${message}`
                );
            });
        }
    }).then((result) => {
        if (!result.value) return;
        Swal.fire({
            icon: 'success',
            title: lang.switchLanguage.success,
            showConfirmButton: false,
            timer: 1500
        });
    });
}

function updateLang() {
    if (!lang) return;
    selector.lang.title.html(lang.window.title);
    selector.lang.language.html(lang.window.language);
    selector.lang.password.html(lang.window.password);
    selector.lang.copyrightPre.html(lang.window.copyrightPre);
    selector.lang.copyrightPost.html(lang.window.copyrightPost);
}

ipc.once("content", (_event, content) => {
    window.requestAnimationFrame(() => {
        selector.version.html(`V ${content.version}`);
        lang = content.lang;
        langOptions = content.langOptions;
        updateLang();
        ipc.send("ready");
    });
});

ipc.on("result", (_event, breached) => {
    selector.statusLoading.fadeOut(400);
    setTimeout(() => {
        selector.password.val("");
        selector.password.attr("readonly", false);
        selector.password.focus();
        blocked = false;
        selector.statusIcon.fadeIn(400);
        if (breached) statusDanger();
        else statusNoWorries();
        checkInput();
    }, 400);
});

ipc.on("timeout", () => {
    selector.statusLoading.fadeOut(400);
    setTimeout(() => {
        selector.password.val("");
        selector.password.attr("readonly", false);
        selector.password.focus();
        blocked = false;
        selector.statusIcon.fadeIn(400);
        document.documentElement.style.setProperty("--status-icon", iconSearch);
        selector.password.val("");
        selector.password.attr("readonly", false);
        selector.password.focus();
        blocked = false;
        Swal.fire({
            title: lang.status.timeout.title,
            text: lang.status.timeout.text,
            icon: "warning"
        });
        checkInput();
    }, 400);
});

ipc.on("update-available", async (_event, updateInformation) => {
    const {value: signature} = await Swal.fire({
        title: lang.update.title,
        text: lang.update.text.split("{version}").join(updateInformation.version),
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        input: "checkbox",
        inputValue: 0,
        inputPlaceholder: lang.update.signature,
        icon: "info",
        confirmButtonText: lang.update.confirm,
        confirmButtonAriaLabel: lang.update.aria,
        showCloseButton: false,
        showCancelButton: false,
    });

    shell.openExternal(updateInformation.url);
    if (signature) {
        shell.openExternal(updateInformation.signature);
    }
});

$(document).ready(() => {
    selector = {
        window: $(window),
        statusCircle: $("#statusCircle"),
        password: $("#passwordInput"),
        statusIcon: $("#statusIcon"),
        statusLoading: $("#statusLoading"),
        body: $("body"),
        minimize: $("#minimize"),
        maximize: $("#maximize"),
        close: $("#close"),
        version: $("#version"),
        lang: {
            title: $("#langTitle"),
            language: $("#langLanguage"),
            password: $("#langPassword"),
            copyrightPre: $("#langCopyrightPre"),
            copyrightPost: $("#langCopyrightPost")
        }
    };

    width = selector.window.width();
    recalcWidth();

    selector.window.on("resize", () => {
        if (width == selector.window.width()) return;
        recalcWidth();
        width = selector.window.width();
    });

    selector.password.on("paste change keyup", () => {
        if (blocked) return;
        checkInput();
    });

    selector.statusCircle.click((e) => {
        e.preventDefault();
        startCheck();
    });

    selector.password.keypress((e) => {
        if (e.which != 13) return;
        e.preventDefault();
        startCheck();
    });

    selector.minimize.click(() => {
        ipc.send("minimize");
    });

    selector.maximize.click(() => {
        ipc.send("maximize");
    });

    selector.close.click(() => {
        ipc.send("close");
    });

    ipc.send("loaded");
});