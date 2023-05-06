const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const Storage = require("electron-store");
const axios = require("axios");
const moment = require("moment");
const electron = require("electron");
const screenElectron = electron.screen;
const { dialog } = require("electron");
const DownloadManager = require("electron-download-manager");
const child = require("child_process");
const { autoUpdater } = require("electron-updater");

let CaptureSSinterval = "";
let CaptureTimeout = "";
let CaptureMouseActivity = "";
let keyboard = 0;
let mouse = 0;
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

let host = "https://app.hireklever.com";

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
let projectData = [];

//CONFIGURE AUTOUPDATER
autoUpdater.setFeedURL({
  provider: "github",
  owner: "Thrive-VA",
  repo: "Desktop-App",
  token: "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",
  private: true,
});

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
    `document.title="ThriveVA ${app.getVersion()}";`
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

const shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

const ProcessOut = async () => {
  const { id, projectId, userId } = projectData;
  if (id && projectId && userId) {
    const processData = async () => {
      const obj = {
        time_out: moment().utc(),
        application_type: "desktop-auto",
        project_id: projectId,
        user_id: userId,
        id: id,
      };
      try {
        await axios.post(`${host}/api/timelog/time_out`, obj);
      } catch (err) {
        console.log(err);
      }
    };
    await processData();
  }
};

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    await ProcessOut();
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

  clearInterval(CaptureSSinterval);
  clearTimeout(CaptureTimeout);
  clearInterval(CaptureMouseActivity);
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

ipcMain.on("project-started", async (event, data) => {
  uIOhook.start();

  CaptureTimeout = setTimeout(
    () => captureFunction(),
    getRandomInt(30000, 19000)
  );
  CaptureMouseActivity = setInterval(() => {
    if (powerMonitor.getSystemIdleTime() === 1200) {
      win.webContents.send("auto-out");
    }

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

  win.webContents
    .executeJavaScript('localStorage.getItem("projectData");', true)
    .then((result) => {
      projectData = JSON.parse(result)[0];
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

captureFunction = () => {
  let captureImg;
  let captureImg2;
  let mainScreen = screenElectron.getPrimaryDisplay();

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
