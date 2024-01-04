const { contextBridge, ipcRenderer } = require('electron');
const { IPCEvents } = require('./ipc-api');

const electronAPI = {
    send: (channel, payload) => ipcRenderer.send(channel, payload),
    onSystemIdleTime: (callback) => {
        ipcRenderer.on(IPCEvents.SystemIdleTime, callback);
        return () => ipcRenderer.removeListener(IPCEvents.SystemIdleTime, callback);
    },
    onNotWorking: (callback) => {
        ipcRenderer.on(IPCEvents.NotWorking, callback);
        return () => ipcRenderer.removeListener(IPCEvents.NotWorking, callback);
    },
    notWorking: (data) => ipcRenderer.send(IPCEvents.NotWorking, data),
    pauseProject: () => ipcRenderer.send(IPCEvents.Paused),
    startProject: (data) => ipcRenderer.send(IPCEvents.ProjectStarted, data),
    projectIdle: (data) => ipcRenderer.send(IPCEvents.Idle, data),
}

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

ipcRenderer.on('SystemIdleTime', (evt, data) => {
    localStorage.setItem("SystemIdleTime", data)
});

contextBridge.exposeInMainWorld('electronApi', electronAPI)
exports.electronAPI = electronAPI