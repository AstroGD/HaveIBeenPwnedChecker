//Node Native Modules
const eventEmitter = require("events");
const crypto = require("crypto");

//NPM hosted Modules
const https = require('follow-redirects').https;

/**
 * This class represents a Password that is getting checked by HIBP
 * 
 * @extends EventEmitter
 * 
 * @property {boolean} ready                    - Indicates whether the password has been hashed and is ready to be checked
 * @property {string} hash                      - The hashed password. Available after the ready event
 * @property {string} identifier                - The first five characters of the hash. This will be sent to HIBP
 * @property {requestOptions} requestOptions    - Options for the request that querys the HIBP database
 * @property {string} rawResponse               - The raw data that was sent from the api
 * @property {boolean} breached                 - Indicates whether the password was breached and therefore found in the database of HIBP
 * @property {number} howOftenBreached          - number of incidents that diclosed the password
 */
class Password extends eventEmitter {
    /**
     * @param {string} password                 - The Password that will be checked against HIBP
     */
    constructor(password) {
        super();

        //Will be true after the init function finished
        this.ready = false;

        if (password === undefined || password === null) throw new TypeError(`password must be defined and not null`);

        this.init(password.toString());
    }

    /**
     * Hashes the password and then fires the ready event
     * 
     * @param {string} password                 - The password that will be checked against HIBP
     * @fires Password#ready                    - Fires after the password has been hashed and is ready to be checked
     * @returns {Promise<void>}
     */
    async init(password) {
        const hash = crypto.createHash('sha1');

        const hashedPassword = await new Promise((resolve, _reject) => {
            hash.on('readable', () => {
                const data = hash.read();
                if (data) {
                    resolve(data.toString('hex'));
                }
            });

            hash.write(password);
            hash.end();
        });

        this.hash = hashedPassword;
        this.identifier = hashedPassword.substring(0, 5);
        this.ready = true;

        /**
         * Emitted when the password has been hashed and the class is ready to check for breaches on HIBP
         * 
         * @event Password#ready
         */
        this.emit("ready");
    }

    /**
     * Checks the Password for being present in the HIBP Database
     * 
     * @param {requestOptions} [requestOptions] - Override to the default request options to request HIBP
     * @returns {Promise<boolean>}              - Returns a boolean indicating whether the password has been breached or not
     * @fires Password#checked
     * @fires Password#breached
     * @fires Password#safe
     * @example
     * Password.check()
     *   .then(breached => {
     *     if (breached) {
     *       console.log("Oh no my password has been breached I should change it immediately!");
     *     } else {
     *       console.log("All good nothing to worry here :) ");
     *     }
     *   })
     *   .catch(e => {
     *     //Oh no I guess something went wrong here :(
     *     console.error(e);
     *   });
     */
    async check(requestOptions) {
        if (!this.ready) throw new Error("The Password has not been hashed yet");

        /**
         * HTTP options for a request
         * @typedef {object} requestOptions
         * @property {string} method            - HTTP Method to be used for the request
         * @property {string} hostname          - Hostname that will be requested (example.org NOT example.org/bla/blablubb)
         * @property {string} path              - Path on the host that will be requested (/bla/blablubb NOT example.org/bla/blablubb or example.org)
         * @property {number} maxRedirects      - Max redirects allowed before the request fails and throws an error
         */
        let defaultRequestOptions = {
            'method': 'GET',
            'hostname': 'api.pwnedpasswords.com',
            'path': `/range/${this.identifier.toString()}`,
            'maxRedirects': 20
        };

        if (!requestOptions || typeof requestOptions !== "object") requestOptions = defaultRequestOptions;

        this.requestOptions = requestOptions;

        let response;
        try {
            response = await new Promise((resolve, reject) => {
                const req = https.request(requestOptions, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        if (res.statusCode !== 200) reject(new TypeError(`Request finished with a status code of ${res.statusCode} but expected 200`));
                        var body = Buffer.concat(chunks);
                        resolve(body.toString());
                    });

                    res.on("error", function (error) {
                        reject(error);
                    });
                });

                req.end();
            });
        } catch (error) {
            throw error;
        }

        this.rawResponse = response;

        let responseArr = response.split("\n");
        let subHash = this.hash.substring(5, Infinity);
        let breached = false;
        let howOftenBreached = 0;

        responseArr.forEach((savedBreach) => {
            let hash = savedBreach.split(":")[0];
            if (hash.toLowerCase() == subHash.toLowerCase()) {
                breached = true;
                howOftenBreached = Number(savedBreach.split(":")[1]);
            }
        });

        this.breached = breached;
        this.howOftenBreached = howOftenBreached;

        /**
         * Emitted whenever the password was checked for appearing in the databse of HIBP
         * 
         * @event Password#checked
         * @param {boolean} breached            - Indicates whether the Password has been breached or not
         */
        this.emit("checked", breached);

        if (breached) {
            /**
             * Emitted whenever the password was checked and found in the database of HIBP
             * 
             * @event Password#breached
             * @param {number} howOftenBreached - The number of incidents that disclosed the password
             */
            this.emit("breached", howOftenBreached);
        } else {
            /**
             * Emitted whenever the password was checked and NOT found in the database of HIBP
             * 
             * @event Password#safe
             */
            this.emit("safe");
        }

        return breached;
    }
}

module.exports = {
    Password
};