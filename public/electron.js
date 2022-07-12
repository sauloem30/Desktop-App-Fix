const path = require("path");
const fs = require("fs");
const fsExtra = require('fs-extra')
const Storage = require('electron-store');
const axios  = require('axios');
const moment  = require('moment');
const electron = require('electron');
const screenElectron = electron.screen;

let CaptureSSinterval = "";
let CaptureTimeout = "";
let CaptureMouseActivity = ""
let keyboard = 0;
let mouse = 0
const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  globalShortcut
} = require("electron");
const isDev = require("electron-is-dev");
const { uIOhook } = require("uiohook-napi");
let hasMouseActivity = false
let hasKeyboardActivity = false

const schema = {
  defaultKeyCombination: {
    type: 'string',
    default: 'CommandOrControl+Y'
  }
}
const store = new Storage({ schema })

let win = null;
let splash;
let projectData = []

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
    const ProcessOut = async() => {
      const {id , projectId, userId} = projectData
      if(id && projectId && userId) {
        const processData = async() => {
          const obj = {
            time_out: moment().utc(),
            application_type : 'desktop-auto',
            project_id: projectId,
            user_id: userId,
            id : id,
          }
          try {
            await axios.post(`http://localhost:3000/api/timelog/time_out`, obj);
          }
          catch (err) {
            console.log(err)
          }
        }
        await processData()
      }
    }
    ProcessOut();
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
  clearInterval(CaptureMouseActivity);

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
  CaptureMouseActivity = setInterval(
    () => {
      if(hasMouseActivity && hasKeyboardActivity) {
        mouse++
        hasMouseActivity = false
        hasKeyboardActivity = false
      } else if(hasMouseActivity) {
        mouse++
        hasMouseActivity = false
      } else if (hasKeyboardActivity) {
        keyboard++
        hasKeyboardActivity = false
      }
    }
  , 1000)
  CaptureSSinterval = setInterval(
    () => {     
      CaptureTimeout = setTimeout(() => {
        captureFunction()
      }, getRandomInt(10000, 199980));
    }
    , 199998
  )

  win.webContents
    .executeJavaScript('localStorage.getItem("projectData");', true)
    .then(result => {
      projectData = JSON.parse(result)[0]
    });
});

// getting mouse keyboard events 
uIOhook.on('keydown', (e) => {
  hasKeyboardActivity = true
})

uIOhook.on('mousedown', (e) => {
  hasMouseActivity = true
})

uIOhook.on('mousemove', (e) => {
  hasMouseActivity = true
})

uIOhook.on('wheel', (e) => {
  hasMouseActivity = true
})

captureFunction = () => {
  let captureImg;
  let captureImg2;
  desktopCapturer
    .getSources({
      types: ["screen"],
      thumbnailSize: { width: 889, height: 500 },
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
          // create directory when missing 
          var dir = path.join(__dirname, './images/screenshots');

          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFile(
            path.resolve(__dirname, `./images/screenshots/${source.name == "Entire Screen" ? "screenshot-1.png" : source.name == "Screen 1" ? "screenshot-1.png" : "screenshot-2.png"}`),
            source.name == "Entire Screen" ? captureImg : source.name == "Screen 1" ? captureImg : captureImg2,
            () => {
              let mainScreen = screenElectron.getPrimaryDisplay();

              const windowCap = new BrowserWindow({
                maximizable: false,
                width: 300,
                height: 200,
                modal: true,
                x: mainScreen.bounds.width - 320,
                y: mainScreen.bounds.height - 270,
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
                fsExtra.removeSync(`${__dirname}/images/screenshots/${source.name == "Entire Screen" ? 'screenshot-1.png' : source.name == "Screen 1" ? "screenshot-1.png" : "screenshot-2.png"}`)
              }, 5000);
            }
          )
        }, 20);
      })
    });
}


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';