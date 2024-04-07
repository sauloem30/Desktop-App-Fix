import { electronApi } from './electronApi';

// log using electrin api and winston
async function doLog(level, message, ...args) {
    await electronApi.invoke('invokeLog', { level, message, args });
}

export async function logInfo(message, ...args) {
    await doLog('info', message, ...args);
}

export async function logError(message, ...args) {
    await doLog('error', message, ...args);
}

export async function logWarn(message, ...args) {
    await doLog('warn', message, ...args);
}

export async function logDebug(message, ...args) {
    await doLog('debug', message, ...args);
}

export async function logVerbose(message, ...args) {
    await doLog('verbose', message, ...args);
}

export async function logSilly(message, ...args) {
    await doLog('silly', message, ...args);
}