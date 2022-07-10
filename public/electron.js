const path = require("path");
const fs = require("fs");
const fsExtra = require('fs-extra')
const Storage = require('electron-store');
var CaptureSSinterval = "";
var CaptureTimeout = "";
var keyboard = 0;
var mouse = 0
const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  globalShortcut
} = require("electron");
const isDev = require("electron-is-dev");
const { uIOhook } = require("uiohook-napi");

const schema = {
  defaultKeyCombination: {
    type: 'string',
    default: 'CommandOrControl+Y'
  }
}
const store = new Storage({ schema })

let win = null;
let splash;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 360,
    height: 600,
    maximizable: false,
    icon: __dirname + 'Icon.icns',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
    show: false
  });

  win.removeMenu()

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "index.html")}`
  );

  win.once('ready-to-show', () => {
    splash.destroy();
    win.show();
  });

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {


  splash = new BrowserWindow({ width: 810, height: 610, transparent: true, frame: false, icon: __dirname + 'Icon.icns', alwaysOnTop: true });
  splash.loadURL(`file://${__dirname}/splash.html`);

  createWindow()
  globalShortcut.register('CommandOrControl+R', () => { })
  globalShortcut.register('F5', () => { })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
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

ipcMain.on("paused", async (event, data) => {
  keyboard = 0;
  mouse = 0;
  uIOhook.stop()

  clearInterval(CaptureSSinterval);
  clearTimeout(CaptureTimeout);

});

ipcMain.on("quiteApp", async (event, data) => {
  win.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("project-started", async (event, data) => {
  uIOhook.start()
  CaptureTimeout = setTimeout(() => captureFunction(), getRandomInt(30000, 19000))
  CaptureSSinterval = setInterval(
    () => {
      CaptureTimeout = setTimeout(() => {
        captureFunction()
      }, getRandomInt(1000, 199980));
    }
    , 199998
  )
});

// getting mouse keyboard events 

uIOhook.on('mousedown', (e) => {
  mouse += 1
})

uIOhook.on('keydown', (e) => {
  keyboard += 1
})

captureFunction = () => {
  let captureImg;
  let captureImg2;
  desktopCapturer
    .getSources({
      types: ["screen"],
      thumbnailSize: { width: 1200, height: 675 },
    })
    .then((sources) => {
      sources.forEach(async (source, index) => {
        if (source.name == 'Screen 1' || source.name == 'Entire Screen') {
          captureImg = source.thumbnail.toPNG();
        }
        else if (source.name == 'Screen 2') {
          captureImg2 = source.thumbnail.toPNG();

        }

        setTimeout(() => {
          fs.writeFile(
            path.resolve(__dirname, `./images/${source.name == "Entire Screen" ? "screenshot-1.png" : source.name == "Screen 1" ? "screenshot-1.png" : "screenshot-2.png"}`),
            source.name == "Entire Screen" ? captureImg : source.name == "Screen 1" ? captureImg : captureImg2,
            () => {
              const windowCap = new BrowserWindow({
                maximizable: false,
                width: 300,
                height: 200,
                modal: true,
                x: 20,
                y: 20,
                autoHideMenuBar: true,
                frame: false,
              });
              if (source.name == "Entire Screen") {
                windowCap.loadURL(`file://${path.join(__dirname, `/screenshot.html`)}`);
                const image = source.thumbnail.toDataURL();
                win.webContents.send('asynchronous-message', { image, keyboard, mouse });
                keyboard = 0;
                mouse = 0;

              }
              else if (source.name == "Screen 1" || source.name == "Screen 2") {
                windowCap.loadURL(`file://${path.join(__dirname, `/multiscreenshots.html`)}`);
                const image = source.thumbnail.toDataURL();
                source.name == "Screen 1" ? win.webContents.send('asynchronous-message', { image, keyboard, mouse }) :
                  win.webContents.send('asynchronous-message', { image, keyboard, mouse, second_screenshot: true });

              }
              setTimeout(() => {
                windowCap.close();
                fsExtra.removeSync(`${__dirname}/images/${source.name == "Entire Screen" ? 'screenshot-1.png' : source.name == "Screen 1" ? "screenshot-1.png" : "screenshot-2.png"}`)
              }, 5000);
            }
          )
        }, 20);
      })
    });
}


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';