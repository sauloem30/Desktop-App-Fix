console.log("this will render second");
const path = require("path");
const fs = require("fs");

const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  desktopCapturer,
  ipcRenderer,
  remote,
} = require("electron");
const isDev = require("electron-is-dev");

let win = null;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 360,
    height: 600,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

setInterval(() => {
  desktopCapturer
    .getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    })
    .then((sources) => {
      let image = sources[0];
      /**
       * for now we are saving screenshots in images folder, will add the APIs.
       */
      fs.writeFile(
        path.resolve(__dirname, `./images/screenshot-${Date.now()}.png`),
        image.thumbnail.toPNG(),
        () => {
          //*******************NEW window to display screenshot , might be helpful in future */
          const window = new BrowserWindow({
            maximizable: false,
            width: 300,
            height: 300,
            modal: true,
            x: 20,
            y: 20,
            autoHideMenuBar: true,
            frame: false,
          });
          window.loadURL(`file://${path.join(__dirname, "sample.html")}`);
          setTimeout(() => {
            window.close();
            fs.unlink("./images/screenshot.png", function (err) {
              if (err) return console.log(err);
              console.log("file deleted successfully");
            });
          }, 5000);
          console.log("Image Added Successfully");
        }
      );
    });
}, 5000);
