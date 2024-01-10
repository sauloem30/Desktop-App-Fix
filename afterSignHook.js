require('dotenv').config();
var electron_notarize = require('electron-notarize');

module.exports = async function (_params) {
    if (process.platform === 'darwin') {
        try {
            await electron_notarize.notarize({
                appBundleId: "com.klever_timeTracker",
                appPath: "electron-build/mac/Klever Desktop App.app",
                appleId: "natsventures@gmail.com",
                appleIdPassword: "wyjv-ucmp-kuur-nvsj",
                tool: 'notarytool',
                teamId: "7D6FSY3TMG",
            });
        } catch (error) {
            console.error(error);
        }
    }
};