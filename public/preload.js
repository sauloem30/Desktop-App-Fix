const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronApi',
    {
        send: (channel, payload) => ipcRenderer.send(channel, payload),
    }
)

// localStorage.setItem('screenshot' , JSON.stringify([]));

ipcRenderer.on('asynchronous-message', (evt, data) => {
    let localdata = []
    if (JSON.parse(localStorage.getItem('screenshot'))) {
        localdata = JSON.parse(localStorage.getItem('screenshot'))
    }
    localdata.push(data)
    localStorage.setItem("screenshot", JSON.stringify(localdata));
});

ipcRenderer.on('auto-out', (evt, data) => {
    localStorage.setItem("autoLoad", JSON.stringify({is_auto: true}))
});
