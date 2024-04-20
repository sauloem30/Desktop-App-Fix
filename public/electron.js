const {
   app,
   BrowserWindow,
   ipcMain,
   globalShortcut,
   powerMonitor,
} = require('electron');
const path = require('path');
const logger = require('./electron-utils/logger');
const isDev = require('electron-is-dev');
const { setupAppInsights } = require('./electron-utils/app-insights');
const { setupAutoUpdater } = require('./electron-utils/auto-updater');
const { setupStore } = require('./electron-utils/store');
const { beforeCreateWindow, onlineStatusListener } = require('./electron-utils/utils');
const { setupScreenshotTracker } = require('./electron-utils/screenshot-tracker');
const { setupActivityTracker } = require('./electron-utils/activity-tracker');
const { setupAppUsageTracker } = require('./electron-utils/app-usage-tracker');

let win;
let splash;
let idlepopup;
let isTimerRunning = false;
let isSetupDone = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const shouldLock = app.requestSingleInstanceLock();

if (!shouldLock) {
   logger.info('App already running, quitting new instance');
   app.quit();
} else {
   app.on('second-instance', () => {
      logger.info('Second instance tried to run');

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
         icon: __dirname + 'icon-new.icns',
         alwaysOnTop: true,
      });
      splash.loadURL(`file://${__dirname}/splash.html`);

      globalShortcut.register('CommandOrControl+R', () => { });
      globalShortcut.register('F5', () => { });

      beforeCreateWindow(app, createWindow);

      if (!isSetupDone) {
         setupIpcListenersMain();
         setupAppInsights();
         setupAutoUpdater();
         setupStore();
         setupScreenshotTracker();
         setupActivityTracker();
         setupAppUsageTracker();
         onlineStatusListener();
         isSetupDone = true;
      }
   });
}

app.on('window-all-closed', async () => {
   logger.info('Window all closed event');

   if (process.platform !== 'darwin') {
      logger.info('Closing application');
      app.quit();
   }
});

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   logger.info('App activated');
   if (BrowserWindow.getAllWindows().length === 0) {
      beforeCreateWindow(app, createWindow);
   }
});

const createWindow = () => {
   // Create the browser window.

   win = new BrowserWindow({
      width: 360,
      height: 850,
      x: 10,
      y: 10,
      maximizable: true,
      icon: __dirname + 'icon-new.icns',
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
   win.removeMenu();

   // and load the index.html of the app.
   // win.loadFile("index.html");
   win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'index.html')}`);

   win.once('ready-to-show', async () => {
      splash.destroy();
      win.show();
   });

   win.on('close', function (event) {
      logger.info('Window close event');
      if (isTimerRunning) {
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

function showIdlePopup() {
   idlepopup = new BrowserWindow({
      width: 400,
      height: 400,
      frame: false,
      icon: __dirname + 'icon-new.icns',
      alwaysOnTop: true,
      webPreferences: {
         nodeIntegration: true,
         preload: path.join(__dirname, './preload.js'),
         backgroundThrottling: false,
         sandbox: false,
      },
   });
   idlepopup.loadURL(`file://${__dirname}/idlepopup.html`);
}

const setupIpcListenersMain = () => {

   ipcMain.handle('GetAppVersion', () => {
      return app.getVersion();
   });

   ipcMain.handle('SetTimerRunning', (_event, status) => {
      if (status) {
         logger.info('Timer started');
      } else {
         logger.info('Timer stopped');
      }
      isTimerRunning = status;
   });

   ipcMain.on('ShowIdlePopup', () => {
      if (!idlepopup) {
         logger.info('Showing idle popup');
         showIdlePopup();
      }
   });

   ipcMain.handle('GetIdleTime', () => {
      return powerMonitor.getSystemIdleTime()
   });

   ipcMain.on('IdlePopupResponse', (_event, response) => {
      logger.info('Idle popup response main', response);

      if (win)
         win.webContents.send('IdlePopupResponse2', response);

      if (idlepopup) {
         idlepopup.close();
         idlepopup = null;
      }
   });

   ipcMain.handle("invokeLog", async (_event, { level, message, args }) => {
      logger[level](message, ...args);
   });
};

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
