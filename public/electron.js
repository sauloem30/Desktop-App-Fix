const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const Storage = require('electron-store');
const { activeWindow } = require('@miniben90/x-win');
const axios = require('axios');
const moment = require('moment');
const electron = require('electron');
const screenElectron = electron.screen;
const { dialog } = require('electron');
const DownloadManager = require('electron-download-manager');
const { autoUpdater } = require('electron-updater');
const logger = require('./logger');
const activityTracker = require('./activity-tracker');
const screenshotTracker = require('./screenshot-tracker');
const { IPCEvents } = require('./ipc-api');
const { SecretsStore } = require("./secrets-store")

let idleInterval;
let appActivityTrackerInterval;
let projectStart = false;
let lastAppActivity = undefined;

const {
   app,
   BrowserWindow,
   ipcMain,
   globalShortcut,
   powerMonitor
} = require('electron');

const isDev = require('electron-is-dev');

let host = 'https://app.useklever.com';

DownloadManager.register({
   downloadFolder: app.getPath('downloads') + '/installer',
});

const schema = {
   defaultKeyCombination: {
      type: 'string',
      default: 'CommandOrControl+Y',
   },
};
const store = new Storage({ schema });

let win = null;
let splash;
let idlepopup;
let projectData = [];

// CONFIGURE AUTOUPDATER
// cant rename this 'Thrive-VA' to 'Klever' as this is the name of the repo
autoUpdater.setFeedURL({
   provider: 'github',
   owner: 'Thrive-VA',
   repo: 'Desktop-App',
   token: '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',
   private: true,
});

function showIdlePopup() {
   idlepopup = new BrowserWindow({
      width: 400,
      height: 400,
      frame: false,
      icon: __dirname + 'Icon.icns',
      alwaysOnTop: true,
      webPreferences: {
         nodeIntegration: true,
         preload: path.join(__dirname, './idlepopup-preload.js'),
         backgroundThrottling: false,
         sandbox: false,
      },
   });
   idlepopup.loadURL(`file://${__dirname}/idlepopup.html`);
}

function createWindow() {
   // Create the browser window.
   let mainScreen = screenElectron.getPrimaryDisplay();
   let dimensions = mainScreen.size;

   win = new BrowserWindow({
      width: 360,
      height: dimensions.height - 20,
      x: 10,
      y: 10,
      maximizable: true,
      icon: __dirname + 'Icon.icns',
      resizable: false,
      webPreferences: {
         nodeIntegration: true,
         preload: path.join(__dirname, './preload.js'),
         backgroundThrottling: false,
         sandbox: false,
      },
      show: false,
   });
   win.webContents.setBackgroundThrottling(false);


   win.webContents.executeJavaScript(`document.title="Klever ${app.getVersion()}";`);

   win.removeMenu();

   // and load the index.html of the app.
   // win.loadFile("index.html");
   win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'index.html')}`);

   win.once('ready-to-show', () => {
      splash.destroy();
      win.show();
   });

   win.on('close', function (event) {
      if (projectStart) {
         // Prevent the window from actually closing
         event.preventDefault();

         // Minimize the window instead
         win.minimize();
      }
   });

   // Open the DevTools.
   if (isDev) {
      win.webContents.openDevTools({ mode: 'detach' });
   }
}

//CHECK UPDATES
if (!isDev) {
   try {
      autoUpdater.checkForUpdates();
   } catch (err) {
      dialog.showErrorBox(err.message, err.stack);
   }
}

// SHOWS A MESSAGE WHEN A UPDTE AVAILABLE
autoUpdater.on('update-available', (_event, releaseNotes, releaseName) => {
   const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version is being downloaded.',
   };
   dialog.showMessageBox(dialogOpts, (response) => { });
});

//ASKS TO USER TO RESTART THE APPLICATION WHEN THE UPDATE IS READY TO BE INSTALLED
autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
   const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
   };
   dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
   });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const shouldLock = app.requestSingleInstanceLock();

if (!shouldLock) {
   app.quit();
} else {
   app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (win) {
         if (win.isMinimized()) win.restore();
         win.focus();
      }
   });

   app.whenReady().then(async () => {
      splash = new BrowserWindow({
         width: 810,
         height: 610,
         transparent: true,
         frame: false,
         icon: __dirname + 'Icon.icns',
         alwaysOnTop: true,
      });
      splash.loadURL(`file://${__dirname}/splash.html`);
      createWindow();
      globalShortcut.register('CommandOrControl+R', () => { });
      globalShortcut.register('F5', () => { });

      logger.log('App started');
   });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

const ProcessOut = async () => {
   const { id, projectId, userId } = projectData;
   if (id && projectId && userId) {
      const processData = async () => {
         logger.log('Process Out');

         const obj = {
            time_out: moment().utc(),
            application_type: 'desktop-auto',
            project_id: projectId,
            user_id: userId,
            id: id,
         };
         try {
            await axios.post(`${host}/api/timelog/time_out`, obj);
            logger.log('  Process Out Successful');
         } catch (err) {
            console.log(err);
            logger.log('  Error processing out');
         }
      };
      await processData();
   }
};

app.on('window-all-closed', async () => {
   if (process.platform !== 'darwin') {
      if (projectStart) {
         await handlePause();
      }

      await ProcessOut();
      logger.log('Closing application');
      app.quit();
   }
});

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
   }
});

// getting events from src

const handlePause = async () => {
   logger.log('Application Paused');

   activityTracker.stop();
   screenshotTracker.stop();

   clearInterval(idleInterval);
   clearInterval(appActivityTrackerInterval);
   idlepopup = null;
   projectStart = false;
   lastAppActivity = undefined;
};

ipcMain.on(IPCEvents.Paused, async (event, data) => {
   handlePause();
});

ipcMain.on(IPCEvents.Idle, async (event, data) => {
   if (!idlepopup) showIdlePopup();
});

ipcMain.on(IPCEvents.NotWorking, async (event, data) => {
   if (win) {
      win.webContents.send(IPCEvents.NotWorking, data);
      idlepopup.destroy();
   }
});

ipcMain.handle(IPCEvents.GetFromStore, (_event, key) => {
   const data = SecretsStore.get(key);
   return data;
 });

 ipcMain.handle(IPCEvents.SetToStore, (_event, key, value) => {
   SecretsStore.set(key, value);
   return value;
 });

 ipcMain.handle(IPCEvents.DeleteFromStore, (_event, key) => {
   SecretsStore.delete(key);
   return true;
 });
/*
   sample data received from src
   data = {
      id: 1,
      screenshot_tracking: true,
      app_website_tracking: true,
      productivity_tracking: true,
   }
*/
ipcMain.on(IPCEvents.ProjectStarted, async (event, data) => {
   logger.log('User Clocked IN');

   projectStart = true;

   // new activity tracker
   activityTracker.start(data.userId, data.projectId, host);

   // new screenshot tracker
   screenshotTracker.start(data.userId, data.projectId, host);

   // app activity tracking
   appActivityTrackerInterval = setInterval(executeAppActivityCapture, 5000);

   // idle checking interval
   idleInterval = setInterval(() => {
      if (win) {
         win.webContents.send(IPCEvents.SystemIdleTime, powerMonitor.getSystemIdleTime());
      }
   }, 1000);

   const storeProjectData = await SecretsStore.get("projectData");
   projectData = storeProjectData.at(0);
   logger.log('  Project Details: ' + JSON.stringify(projectData));
   logger.log('  ------------------------------ ');
});

ipcMain.handle(IPCEvents.AppVersion, () => {
   return app.getVersion();
});

// SHOWS A MESSAGE WHEN THERE IS NO INTERNET CONNECTION
ipcMain.on(IPCEvents.OnlineStatusChanged, (event, status) => {
   if (status) return;
   const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: 'No Internet Connection',
      message: 'Please check your internet connection.',
   };
   dialog.showMessageBox(dialogOpts, (response) => { });
});

var executeAppActivityCapture = () => {
   try {
      if (!projectData?.projectId) return;

      const currentApp = activeWindow();
      const currentAppActivity = {
         user_id: projectData?.userId,
         project_id: projectData?.projectId,
         application_name: currentApp?.info?.name ?? 'Unknown App'
      };

      if (lastAppActivity?.application_name !== currentAppActivity?.application_name) {
         axios.post(`${host}/api/application-usage/upload2`, { currentAppActivity });
         lastAppActivity = currentAppActivity;
      }
   } catch (err) {
      logger.log(err);
   }
}


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
