const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ProjectRunning',
    {
        send: (channel, payload) => ipcRenderer.send(channel, payload)
    }
)
