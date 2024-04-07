const { dialog, systemPreferences, ipcMain } = require('electron');
const logger = require('./logger');

// permission check
const beforeCreateWindow = (app, createWindow) => {
   logger.info('Checking permissions');

   const doCreateWindow = () => {
      logger.info('App started');
      createWindow();
   };

   // check if screen recording permission is granted
   if (process.platform === "darwin") {
      const accessibilityPermission = systemPreferences.isTrustedAccessibilityClient(true);
      const screenPermission = systemPreferences.getMediaAccessStatus("screen");


      if (!accessibilityPermission || screenPermission !== "granted") {
         logger.error('Permissions not granted, closing app');
         // Show an informative dialog explaining why permissions are needed
         dialog.showMessageBox({
            type: 'error',
            title: 'Permissions Required',
            message: 'This application requires screenshot and accessibility permissions to function. Please grant the necessary permissions and restart the application.'
         });

         app.quit(); // Exit the application
      } else {
         doCreateWindow();
      }
   } else {
      doCreateWindow();
   }
}

const onlineStatusListener = () => {
   let dialogShown = false;

   ipcMain.handle('OnlineStatusChanged', (event, status) => {
      if (!status && !dialogShown) {
         dialogShown = true;
         dialog.showMessageBox({
            type: 'error',
            title: 'No Internet Connection',
            message: 'You are currently offline. Please check your internet connection.'
         }).then(() => {
            dialogShown = false;
         });
      }
   });
}


module.exports = {
   beforeCreateWindow,
   onlineStatusListener
};