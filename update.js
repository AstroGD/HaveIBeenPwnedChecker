module.exports = async function(configPath, config) {
    const path = require("path");
    const fs = require("fs-extra");
    
    const package = require(path.join(__dirname, "/package.json"));
    const version = config.version.split(".");

    //Changes since Versions 1.x.x
    if (version[0] <= 1) {
        //There are no config changes for versions 1.0.x

        //Changes since Versions 1.1.x
        if (version[1] <= 1) {
            
            //Changes for version 1.1.0
            if (version[2] <= 0) {
                config.changelogShown = null; //Added because changelogs were implemented here. This is to check if the changelog should be shown or not.
            }
        }
    }

    //Update Config version and set Changelog to be shown on restart
    config.version = package.version;
    config.changelogShown = false;

    //Save new config
    try {
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        throw error;
    }
}