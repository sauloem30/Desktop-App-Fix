const { autoUpdater } = require('electron-updater');
const { dialog, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const logger = require('./logger');

const setupAutoUpdater = () => {
    // CONFIGURE AUTOUPDATER
    // cant rename this 'Thrive-VA' to 'Klever' as this is the name of the repo
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'Thrive-VA',
        repo: 'Desktop-App',
        token: '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',
        private: true,
    });


    // SHOWS A MESSAGE WHEN A UPDTE AVAILABLE
    autoUpdater.on('update-available', (info) => {
        logger.info('Update available');
        try {
            logger.info('Downloading the update');
            autoUpdater.downloadUpdate();
        } catch (error) {
            logger.error('Error in update available', error);
        }
    });

    //ASKS TO USER TO RESTART THE APPLICATION WHEN THE UPDATE IS READY TO BE INSTALLED
    autoUpdater.on('update-downloaded', (info) => {
        logger.info('Update downloaded');
        try {
            dialog.showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: `Version ${info.version} has been downloaded. Restart the application to apply the updates?`,
                buttons: ['Restart Now', 'Later']
            }).then((result) => {
                if (result.response === 0) { // 'Restart Now' button clicked
                    logger.info('Restarting the application to install the updates');
                    setTimeout(() => {
                        autoUpdater.quitAndInstall();
                    }, 6000);
                }
            });
        } catch (error) {
            logger.error('Error in update downloaded', error);
        }
    });

    // SHOWS A MESSAGE WHEN NO UPDATES AVAILABLE
    autoUpdater.on('update-not-available', () => {
        logger.info('No updates available');
        try {
            dialog.showMessageBox({
                type: 'info',
                title: 'No Updates Available',
                message: 'Your application is up-to-date.'
            });
        } catch (error) {
            logger.error('Error in update not available', error);
        }
    });

    // Manually initiate an update check
    ipcMain.handle('CheckForUpdate', async () => {
        logger.info('Checking for updates');
        if (isDev) return;
        try {
            await autoUpdater.checkForUpdates();
            return true;
        } catch (error) {
            logger.error('Error in check for updates', error);
            return false;
        }
    });
}

module.exports = { setupAutoUpdater };