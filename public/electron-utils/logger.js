// logger.js

const winston = require('winston');
const util = require('util');
const isDev = require('electron-is-dev');
const { app, ipcMain } = require('electron');
const { join } = require('path');

// https://github.com/winstonjs/winston/issues/1427
const combineMessageAndSplat = () => ({
  transform(info) {
    const { [Symbol.for('splat')]: args = [], message } = info;
    // eslint-disable-next-line no-param-reassign
    info.message = util.format(message, ...args);
    return info;
  },
});

const createLogger = () => winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    combineMessageAndSplat(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
});

const logDirPath = isDev ? '.' : app.getPath('userData');

const logger = createLogger();
const dateFilename = new Date().toISOString().split('T')[0];
const logFileName = join(logDirPath, `app-${dateFilename}.log`);
console.log('Logging to:', logFileName);
logger.add(new winston.transports.File({ level: 'debug', filename: logFileName, options: { flags: 'a' } }));
logger.add(new winston.transports.Console());

module.exports = logger;