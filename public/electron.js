const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const Storage = require("electron-store");
const ActiveWin = require("active-win");
const axios = require("axios");
const moment = require("moment");
const electron = require("electron");
const screenElectron = electron.screen;
const { dialog } = require("electron");
const DownloadManager = require("electron-download-manager");
const { autoUpdater } = require("electron-updater");
const logger = require('./logger');

let ActivityTrackerInterval = "";
let ActivityFlushInterval = "";
let CaptureSSinterval = "";
let CaptureTimeout = "";
let CaptureMouseActivity = "";
let keyboard = 0;
let mouse = 0;
let lastActivity = undefined;
let activityBuffer = [];
const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  globalShortcut,
  powerMonitor,
} = require("electron");

const isDev = require("electron-is-dev");
const { uIOhook } = require("uiohook-napi");
let hasMouseActivity = false;
let hasKeyboardActivity = false;

let host = "https://app.useklever.com";

DownloadManager.register({
  downloadFolder: app.getPath("downloads") + "/installer",
});

const schema = {
  defaultKeyCombination: {
    type: "string",
    default: "CommandOrControl+Y",
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
  provider: "github",
  owner: "Thrive-VA",
  repo: "Desktop-App",
  token: "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",
  private: true,
});

function showIdlePopup() {
  idlepopup = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    icon: __dirname + "Icon.icns",
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./idlepopup-preload.js"),
      backgroundThrottling: false,
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
    icon: __dirname + "Icon.icns",
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
      backgroundThrottling: false,
    },
    show: false,
  });
  win.webContents.setBackgroundThrottling(false);

  win.webContents.executeJavaScript(
    `localStorage.setItem("version", "${app.getVersion()}");`
  );

  win.webContents.executeJavaScript(
    `document.title="Klever ${app.getVersion()}";`
  );

  win.removeMenu();

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "index.html")}`
  );

  win.once("ready-to-show", () => {
    splash.destroy();
    win.show();
  });

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
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
autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail: "A new version is being downloaded.",
  };
  dialog.showMessageBox(dialogOpts, (response) => {});
});

//ASKS TO USER TO RESTART THE APPLICATION WHEN THE UPDATE IS READY TO BE INSTALLED
autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const shouldLock = app.requestSingleInstanceLock()
    
if (!shouldLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
    
  app.whenReady().then(async () => {
    splash = new BrowserWindow({
      width: 810,
      height: 610,
      transparent: true,
      frame: false,
      icon: __dirname + "Icon.icns",
      alwaysOnTop: true,
    });
    splash.loadURL(`file://${__dirname}/splash.html`);
    createWindow();
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});

    logger.log("App started");
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

const ProcessOut = async () => {
  const { id, projectId, userId } = projectData;
  if (id && projectId && userId) {
    const processData = async () => {
      logger.log("Process Out")

      const obj = {
        time_out: moment().utc(),
        application_type: "desktop-auto",
        project_id: projectId,
        user_id: userId,
        id: id,
      };
      try {
        await axios.post(`${host}/api/timelog/time_out`, obj);
        logger.log("  Process Out Successful")
      } catch (err) {
        console.log(err);
        logger.log("  Error processing out")
      }
    };
    await processData();
  }
};

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    await ProcessOut();
    logger.log("Closing application")
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// getting events from src

const handlePause = () => {
  keyboard = 0;
  mouse = 0;
  uIOhook.stop();

  clearInterval(ActivityTrackerInterval);
  clearInterval(ActivityFlushInterval);
  clearInterval(CaptureSSinterval);
  clearTimeout(CaptureTimeout);
  clearInterval(CaptureMouseActivity);
  logger.log("Application Paused")
  idlepopup = null;
};

ipcMain.on("paused", async (event, data) => {
  handlePause();
});

ipcMain.on("quiteApp", async (event, data) => {
  win.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("idle-detected", async (event, data) => {
  if (!idlepopup)
    showIdlePopup();
});

ipcMain.on("idle-detected-notworking", async (event, data) => {
  win.webContents.executeJavaScript(
    `localStorage.setItem("idle-detected-notworking", "${data ? 'true' : 'false'}");`
  );
  idlepopup.destroy();
});

ipcMain.on("project-started", async (event, data) => {
  uIOhook.start();
  logger.log("User Clocked IN")

  CaptureTimeout = setTimeout(
    () => captureFunction(),
    getRandomInt(30000, 19000)
  );
  CaptureMouseActivity = setInterval(() => {
    // if (powerMonitor.getSystemIdleTime() === 1200) {
    //   win.webContents.send("SystemIdleTime", powerMonitor.getSystemIdleTime());
    // }

    win.webContents.send("SystemIdleTime", powerMonitor.getSystemIdleTime());

    if (hasMouseActivity && hasKeyboardActivity) {
      mouse++;
      hasMouseActivity = false;
      hasKeyboardActivity = false;
    } else if (hasMouseActivity) {
      mouse++;
      hasMouseActivity = false;
    } else if (hasKeyboardActivity) {
      keyboard++;
      hasKeyboardActivity = false;
    }
  }, 1000);

  CaptureSSinterval = setInterval(() => {
    CaptureTimeout = setTimeout(() => {
      captureFunction();
    }, getRandomInt(10000, 199980));
  }, 199998);

  ActivityTrackerInterval = setInterval(() => {
    ActiveWin()
      .then((currentApp) => {
        const currentActivity = {
          application_name: currentApp?.owner.name ?? "Unknown App",
          created_date: new Date(),
          website: typeof currentApp.url === "string" ? new URL(currentApp.url).hostname : null
        };
        if (lastActivity?.application_name !== currentActivity?.application_name || lastActivity?.website !== currentActivity?.website) {
          if (lastActivity !== undefined) {
            lastActivity.updated_at = new Date();
          }
          win.webContents.send("track-activity", currentActivity);
          activityBuffer.push(currentActivity);
          lastActivity = currentActivity;
        }
      })
      .catch(console.log);
  }, 10 * 1000);
  
  ActivityFlushInterval = setInterval(() => {
    if (activityBuffer.length > 0) {
      logger.log(activityBuffer); // Flush to cloud DB
      activityBuffer = [];
    }
  }, 60 * 1000);

  win.webContents
    .executeJavaScript('localStorage.getItem("projectData");', true)
    .then((result) => {
      projectData = JSON.parse(result)[0];
      logger.log("  Project Details: " + JSON.stringify(JSON.parse(result)[0]))
      logger.log("  ------------------------------ ")
    });
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

// getting mouse keyboard events
uIOhook.on("keydown", (e) => {
  if (!hasKeyboardActivity) {
    hasKeyboardActivity = true;
  }
});

uIOhook.on("mousedown", (e) => {
  if (!hasMouseActivity) {
    hasMouseActivity = true;
  }
});

uIOhook.on("mousemove", (e) => {
  if (!hasMouseActivity) {
    hasMouseActivity = true;
  }
});

uIOhook.on("wheel", (e) => {
  if (!hasMouseActivity) {
    hasMouseActivity = true;
  }
});

var captureFunction = () => {
  let captureImg;
  let captureImg2;
  let mainScreen = screenElectron.getPrimaryDisplay();
  logger.log("  Capture function initiated")

  desktopCapturer
    .getSources({
      types: ["screen"],
      thumbnailSize: { width: 1280, height: 768 },
    })
    .then((sources) => {
      sources.forEach(async (source, index) => {
        if (source.name == "Screen 1" || source.name == "Entire Screen") {
          captureImg = source.thumbnail.toPNG();
        } else if (source.name == "Screen 2") {
          captureImg2 = source.thumbnail.toPNG();
        } else {
          return;
        }

        setTimeout(() => {
          // create directory when missing
          const dir = path.resolve("c:/images/screenshots");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFile(
            path.resolve(
              `c:/images/screenshots/${
                source.name == "Entire Screen"
                  ? "screenshot-1.png"
                  : source.name == "Screen 1"
                  ? "screenshot-1.png"
                  : "screenshot-2.png"
              }`
            ),
            source.name == "Entire Screen"
              ? captureImg
              : source.name == "Screen 1"
              ? captureImg
              : captureImg2,
            () => {
              // const windowCap = new BrowserWindow({
              //   maximizable: false,
              //   width: 300,
              //   height: 200,
              //   modal: true,
              //   x: mainScreen.bounds.width - 320,
              //   y: mainScreen.bounds.height - 270,
              //   autoHideMenuBar: true,
              //   frame: false,
              // });

              if (source.name == "Entire Screen") {
                // windowCap.loadURL(
                //   `file://${path.join(__dirname, `/screenshot.html`)}`
                // );
                const image = source.thumbnail.toDataURL();
                win.webContents.send("asynchronous-message", {
                  image,
                  keyboard_activities_seconds: keyboard,
                  mouse_activities_seconds: mouse,
                  user_id: projectData.userId,
                });
                keyboard = 0;
                mouse = 0;
              } else if (source.name == "Screen 1" || source.name == "Screen 2") {
                // windowCap.loadURL(
                //   `file://${path.join(__dirname, `/multiscreenshots.html`)}`
                // );
                const image = source.thumbnail.toDataURL();
                source.name == "Screen 1"
                  ? win.webContents.send("asynchronous-message", {
                      image,
                      keyboard_activities_seconds: keyboard,
                      mouse_activities_seconds: mouse,
                      user_id: projectData.userId,
                    })
                  : win.webContents.send("asynchronous-message", {
                      image,
                      keyboard_activities_seconds: keyboard,
                      mouse_activities_seconds: mouse,
                      second_screenshot: true,
                      user_id: projectData.userId,
                    });
                keyboard = 0;
                mouse = 0;
              }
              setTimeout(() => {
                // windowCap.close();
                fsExtra.removeSync(
                  `c:/images/screenshots/${
                    source.name == "Entire Screen"
                      ? "screenshot-1.png"
                      : source.name == "Screen 1"
                      ? "screenshot-1.png"
                      : "screenshot-2.png"
                  }`
                );
              }, 5000);
            }
          );
        }, 20);
      });
    });
};

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
