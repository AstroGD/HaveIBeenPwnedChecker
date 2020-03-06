//Node Core Modules
const path = require("path");

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

//Testing is done with a very unsecure password that is obviously found in the database
//Otherwise if using a strong password it may someday come up in the database and the test would then fail.
//This means this test can only test the functionality of breached passwords!

describe(`Password`, () => {
    let password;

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

    test(`Refuse to check if not ready`, async () => {
        password.ready = false;
        await expect(password.check()).rejects.toThrow("The Password has not been hashed yet");
        password.ready = true;
    });

    test(`Querying Database`, async () => {
        const checkedCalled = jest.fn();
        const breachedCalled = jest.fn();

        password.addListener("checked", checkedCalled);
        password.addListener("breached", breachedCalled);

        await expect(password.check()).resolves.toBe(true);
        expect(checkedCalled).toHaveBeenCalledTimes(1);
        expect(breachedCalled).toHaveBeenCalledTimes(1);

        password.removeListener("checked", checkedCalled);
        password.removeListener("breached", breachedCalled);
    });

    test(`Values after querying`, () => {
        let requestOptions = {
            'method': 'GET',
            'hostname': 'api.pwnedpasswords.com',
            'path': `/range/5baa6`,
            'maxRedirects': 20
        };

        expect(password.ready).toBe(true);
        expect(password.hash).toBe("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8");
        expect(password.identifier).toBe("5baa6");
        expect(objectHasSameValues(requestOptions, password.requestOptions)).toBe(true);
        expect(password.rawResponse).toBeDefined();
        expect(password.breached).toBe(true);
        expect(password.howOftenBreached).toBeGreaterThanOrEqual(3730471); //Number of breaches that disclosed the password as of 02/03/2020 (DD/MM/YYYY)
    });
});