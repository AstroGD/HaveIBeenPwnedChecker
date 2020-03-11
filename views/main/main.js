var dark = true;
var ready = false;
var blocked;
var width;
var selector;

const iconSearch = '"\\f002"';
const iconCheck = '"\\f00c"';
const iconAlert = '"\\f071"';

function toggleTheme() {
    return;
    if (dark) {
        document.documentElement.style.setProperty("--background-color", "#fff");
        document.documentElement.style.setProperty("--switch-icon", '"\\f186"');
        document.documentElement.style.setProperty("--font-color", "rgb(50, 50, 50)");
        document.documentElement.style.setProperty("--complementary", "rgb(50, 50, 50)");
        document.documentElement.style.setProperty("--complementary-font", "#fff");
        dark = false;
    } else {
        document.documentElement.style.removeProperty("--background-color");
        document.documentElement.style.removeProperty("--switch-icon");
        document.documentElement.style.removeProperty("--font-color");
        document.documentElement.style.removeProperty("--complementary");
        document.documentElement.style.removeProperty("--complementary-font");
        dark = true;
    }
}

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
    selector.statusLoading.fadeOut(400);
    setTimeout(() => {
        selector.password.val("");
        selector.password.attr("readonly", false);
        selector.password.focus();
        blocked = false;
        selector.statusIcon.fadeIn(400);
        if (Math.random() >= 0.5) statusDanger();
        else statusNoWorries();
        checkInput();
    }, 400);
}

function statusDanger() {
    selector.body.addClass("danger");
    selector.statusCircle.addClass("danger");
    document.documentElement.style.setProperty("--status-icon", iconAlert);
    selector.password.val("");
    selector.password.attr("readonly", false);
    selector.password.focus();
    blocked = false;
    swal({
        title: "Oh No!",
        buttons: ["More", "I know what to do"],
        text: "It looks like your password has beend found in the database of HaveIBeenPwned!\n\nClick on 'More' if you want to know what you should do next.",
        icon: "error"
    });
}

function statusNoWorries() {
    selector.body.addClass("success");
    selector.statusCircle.addClass("success");
    document.documentElement.style.setProperty("--status-icon", iconCheck);
}

$(document).ready(() => {
    selector = {
        window: $(window),
        statusCircle: $("#statusCircle"),
        password: $("#passwordInput"),
        statusIcon: $("#statusIcon"),
        statusLoading: $("#statusLoading"),
        body: $("body")
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
});