require('dotenv').config();
var { notarize } = require('@electron/notarize');

module.exports = async function (_params) {
    if (process.platform === 'darwin') {
        try {
            await notarize({ // Ref: https://github.com/electron/notarize?tab=readme-ov-file#method-notarizeopts-promisevoid
                appBundleId: "com.klever_timeTracker",
                appPath: "electron-build/mac/Klever Desktop App.app",
                appleId: "natsventures@gmail.com",
                appleIdPassword: "wyjv-ucmp-kuur-nvsj", // The app-specific password (not your Apple ID password).
                tool: 'notarytool',
                teamId: "7D6FSY3TMG",
            });
        } catch (error) {
            console.error(error);
        }
    }
};