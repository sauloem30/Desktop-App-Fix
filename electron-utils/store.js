const ElectronStore = require("electron-store");
const { ipcMain } = require("electron");

const SecretsStore = new ElectronStore();

const setupStore = () => {
    ipcMain.handle("GetFromStore", async (_event, key) => {
        return await SecretsStore.get(key);
    });
    
    ipcMain.handle("SetToStore", async (_event, { key, value }) => {
        await SecretsStore.set(key, value || "");
    });
    
    ipcMain.handle("DeleteFromStore", async (_event, key) => {
        await SecretsStore.delete(key);
    });
}

module.exports = {
    setupStore,
    SecretsStore
};