const ElectronStore = require("electron-store");


const SecretsStore = new ElectronStore({
    name: "secrets",
    accessPropertiesByDotNotation: false, // TODO: refactor if not needed
});

exports.SecretsStore = SecretsStore;