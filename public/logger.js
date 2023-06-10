const path = require("path");
const log = require('electron-log');

// log.transports.file.resolvePathFn = () => path.join(__dirname, '/logsmain.log');
log.transports.file.level = "info";

exports.log = (entry) => log.info(entry)