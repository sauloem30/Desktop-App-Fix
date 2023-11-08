const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronApi', {
   send: (channel, payload) => ipcRenderer.send(channel, payload),
});
