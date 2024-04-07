const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
    /*
     * Used for communication patterns where you send a request from React to Electron's main process and expect a response back.
     * This trigger the ipcMain `handle` in the main process.
    */
    invoke: (channel, data) => {
        return ipcRenderer.invoke(channel, data);
    },
    /*
     * Used for one-way communication where your React component needs to send a message to Electron's main process but doesn't expect an immediate response.
     * This trigger the ipcMain `handle` in the main process.
    */
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    /*
    * Used to set up a listener in your React component to receive messages pushed from Electron's main process.
    * This trigger the ipcMain `on` in the main process.
    */
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once: (channel, func) => {
        ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeListener: (channel, func) => {
        ipcRenderer.removeListener(channel, func);
    },
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
    handle: (channel, func) => {
        ipcRenderer.handle(channel, (event, ...args) => func(...args));
    }
}

contextBridge.exposeInMainWorld('electronApi', electronAPI)
exports.electronAPI = electronAPI