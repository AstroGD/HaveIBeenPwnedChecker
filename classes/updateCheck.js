const eventEmitter = require("events");
const https = require('follow-redirects').https;
const path = require("path");
const packageFile = require(path.join(__dirname, "../package.json"));

/**
 * This class represents a check for Updates instance
 * 
 * @extends EventEmitter
 */
class updateCheck extends eventEmitter {
    constructor() {
        super();
        this.check();
    }

    /**
     * Checks for an update
     * 
     * @fires updateCheck#failed                    - Fires if there was an error checking for updates
     * @fires updateCheck#no-update-needed          - Fires if the software is running the newest version
     * @fires updateCheck#update-needed             - Fires if there is an update that needs to be installed
     * @returns {void}
     */
    check() {
        let requestOptions = {
            'method': 'GET',
            'hostname': 'software.astrogd.eu',
            'path': `/haveibeenpwnedchecker/version.json`,
            'maxRedirects': 20
        };

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

        new Promise((resolve, reject) => {
            const req = https.request(requestOptions, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
                    if (res.statusCode !== 200) reject(new TypeError(`Request finished with a status code of ${res.statusCode} but expected 200`));
                    var body = Buffer.concat(chunks);
                    try {
                        body = JSON.parse(body.toString())
                    } catch (error) {
                        return reject(error);
                    }
                    resolve(body);
                });

                res.on("error", function (error) {
                    reject(error);
                });
            });

            req.end();

            req.on("error", reject);
        }).then((response) => {
            if (!response.latest) return this.emit("failed");
            /**
             * Emitted whenever no update is needed
             * 
             * @event updateCheck#no-update-needed
             */
            if (!checkVersionGreater(packageFile.version, response.latest.version)) return this.emit("no-update-needed");

            let updateTo;

            if (!response[packageFile.version]) updateTo = response.latest;
            else if (!response[packageFile.version].nextVersionOnUpdate) updateTo = response.latest;
            else if (!response[response[packageFile.version].nextVersionOnUpdate]) updateTo = response.latest;
            else updateTo = response[response[packageFile.version].nextVersionOnUpdate];

            /**
             * HTTP options for a request
             * @typedef {object} updateResponse
             * @property {string} url               - Url to the new version installer
             * @property {string} signature         - Url to installers signature
             * @property {string} version           - Version of the available update
             */
            const updateResponse = {
                url: updateTo.url,
                signature: updateTo.signature,
                version: updateTo.version
            };

            /**
             * Emitted whenever an update is available
             * 
             * @event updateCheck#update-needed
             * @param {updateResponse}              - updateResponse Object with needed parameters to direct the user to the update files
             */
            return this.emit("update-needed", updateResponse);
        }).catch(e => {
            console.error(e);
            /**
             * Emitted whenever the check for updates failed
             * 
             * @event updateCheck#failed
             */
            this.emit("failed");
        });
    }
}

module.exports = updateCheck;