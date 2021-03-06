//Node Core Modules
const path = require("path");
const crypto = require("crypto");

//Class that needs to be tested
const PwnCheck = require(path.join(__dirname, "../PwnCheck.js"));

//Utility functions

/**
 * Checks if two objects share the same values
 * @private
 * @param {Object} a - Object a
 * @param {Object} b - Object b
 * @returns {Boolean} - They Share the same values when true
 * @author http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
 */
function objectHasSameValues(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

/**
 * Password Class
 */
describe(`Password`, () => {
    let password;
    let requestOptions = {
        'method': 'GET',
        'hostname': 'api.pwnedpasswords.com',
        'path': `/range/5baa6`,
        'headers': {
            'User-Agent': 'HaveIBeenPwned Checker by AstroGD'
        },
        'maxRedirects': 20
    };

    test(`Initialization`, async () => {
        try {
            await new Promise((resolve, reject) => {
                password = new PwnCheck.Password("password");
                password.once("ready", resolve);
                setTimeout(reject, 15000);
            });
        } catch (error) {
            throw new Error("Initialization timeout");
        }
    });

    test(`Values after Initialization`, () => {
        expect(password.ready).toBe(true);
        expect(password.hash).toBe("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8");
        expect(password.identifier).toBe("5baa6");

        expect(password.requestOptions).toBeUndefined();
        expect(password.rawResponse).toBeUndefined();
        expect(password.breached).toBeUndefined();
        expect(password.howOftenBreached).toBeUndefined();
    });

    test(`Password must be defined`, () => {
        expect(() => {
            new PwnCheck.Password()
        }).toThrow(new TypeError(`password must be defined and not null`));
    });

    test(`Refuse to check if not ready`, async () => {
        password.ready = false;
        await expect(password.check()).rejects.toThrow("The Password has not been hashed yet");
        password.ready = true;
    });

    test(`Querying Database`, async () => {
        const checkedCalled = jest.fn();
        const breachedCalled = jest.fn();
        const safeCalled = jest.fn();

        password.addListener("checked", checkedCalled);
        password.addListener("breached", breachedCalled);
        password.addListener("safe", safeCalled);

        await expect(password.check()).resolves.toBe(true);
        expect(checkedCalled).toHaveBeenCalledTimes(1);
        expect(breachedCalled).toHaveBeenCalledTimes(1);
        expect(safeCalled).not.toHaveBeenCalled();

        password.removeListener("checked", checkedCalled);
        password.removeListener("breached", breachedCalled);
        password.removeListener("safe", safeCalled);
    });

    test(`Values after querying`, () => {
        expect(password.ready).toBe(true);
        expect(password.hash).toBe("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8");
        expect(password.identifier).toBe("5baa6");
        expect(requestOptions).toEqual(password.requestOptions);
        expect(password.rawResponse).toBeDefined();
        expect(password.breached).toBe(true);
        expect(password.howOftenBreached).toBeGreaterThanOrEqual(3730471); //Number of breaches that disclosed the password as of 02/03/2020 (DD/MM/YYYY)
    });

    test(`Check with false override requestOptions should fallback to default requestOptions`, async () => {
        await password.check("This is an incorrect value");
        expect(requestOptions).toEqual(password.requestOptions);
    });

    test(`Misconfigured requestOptions should throw an error`, async () => {
        let faultyRequestOptions = {
            'method': 'GET',
            'hostname': 'api.pwnedpasswords.com',
            'path': `/range/axz12`, //Not a valid hex formatted string
            'headers': {
                'User-Agent': 'HaveIBeenPwned Checker by AstroGD'
            },
            'maxRedirects': 20
        };

        let faultyRequestOptions2 = {
            'method': 'GET',
            'hostname': 'somethingswrong.astrogd.dev',
            'path': `/range/axz12`, //Not a valid hex formatted string
            'headers': {
                'User-Agent': 'HaveIBeenPwned Checker by AstroGD'
            },
            'maxRedirects': 20
        };

        await expect(password.check(faultyRequestOptions)).rejects.toThrow();
        await expect(password.check(faultyRequestOptions2)).rejects.toThrow();
    });

    test(`Querying Database with a password that is not (likely to be) breached`, async () => {
        let password2;
        try {
            await new Promise((resolve, reject) => {
                password2 = new PwnCheck.Password(crypto.randomBytes(200).toString("hex"));
                password2.once("ready", resolve);
                setTimeout(reject, 15000);
            });
        } catch (error) {
            throw new Error("Initialization timeout");
        }

        const safeCalled = jest.fn();
        const checkedCalled = jest.fn();
        const breachedCalled = jest.fn();

        password2.addListener("safe", safeCalled);
        password2.addListener("checked", checkedCalled);
        password2.addListener("breached", breachedCalled);

        await expect(password2.check()).resolves.toBe(false);
        expect(checkedCalled).toHaveBeenCalledTimes(1);
        expect(safeCalled).toHaveBeenCalledTimes(1);
        expect(breachedCalled).not.toHaveBeenCalled();

        password2.removeListener("safe", safeCalled);
        password2.removeListener("checked", checkedCalled);
        password2.removeListener("breached", breachedCalled);
    });
});