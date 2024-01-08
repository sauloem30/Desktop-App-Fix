// "afterSign": "./afterSignHook.js",

require('dotenv').config();
const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');

module.exports = async function (params) {
    if (process.platform !== 'darwin') {
        return;
    }

    console.log('afterSign hook triggered', params);


    try {
        await electron_notarize.notarize({
            appBundleId: "com.klever_timeTracker",
            appPath: "/Users/nat/Downloads/Desktop-App/electron-build/mac-arm64/Klever Desktop App.app",
            appleId: "natsventures@gmail.com",
            appleIdPassword: "wyjv-ucmp-kuur-nvsj",
            tool: 'notarytool',
teamId: "7D6FSY3TMG",
        });
    } catch (error) {
        console.error(error);
    }

};