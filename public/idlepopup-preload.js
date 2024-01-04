const { contextBridge } = require('electron');
const { electronAPI } = require('./preload')
contextBridge.exposeInMainWorld('electronApi', electronAPI);
