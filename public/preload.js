const { contextBridge, ipcRenderer } = require('electron');
const { IPCEvents } = require('./ipc-api');

const electronAPI = {
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
    appVersion: async () => {
        let version = await ipcRenderer.invoke(IPCEvents.AppVersion);
        return version;
    },
    getFromStore: async (key) => {
        const storeData = await ipcRenderer.invoke(IPCEvents.GetFromStore, key);
        return storeData;
    },
    setToStore: async (key, value) => {
        const storeData = await ipcRenderer.invoke(IPCEvents.SetToStore, key, value);
        return storeData;
    },   
}

contextBridge.exposeInMainWorld('electronApi', electronAPI)
exports.electronAPI = electronAPI