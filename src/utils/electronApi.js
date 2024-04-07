export async function getFromStore(key) {
    return await window.electronApi?.invoke('GetFromStore', key);
}

export async function setToStore(key, value) {
    return await window.electronApi?.invoke('SetToStore', { key, value });
}

export async function deleteFromStore(key) {
    return await window.electronApi?.invoke('DeleteFromStore', key);
}

export async function checkForUpdate() {
    return await window.electronApi?.invoke('CheckForUpdate');
}

export async function getAppVersion() {
    return await window.electronApi?.invoke('GetAppVersion');
}

export async function setIsTimerRunning(status) {
    return await window.electronApi?.invoke('SetTimerRunning', status);
}

export async function onlineStatusChanged(status) {
    return await window.electronApi?.invoke('OnlineStatusChanged', status);
}

export const electronApi = {
    invoke: async (channel, ...args) => {
        return await window.electronApi?.invoke(channel, ...args);
    },
    send: (channel, ...args) => {
        window.electronApi?.send(channel, ...args);
    },
    on: (channel, listener) => {
        window.electronApi?.on(channel, listener);
    },
    once: (channel, listener) => {
        window.electronApi?.once(channel, listener);
    },
    removeListener: (channel, listener) => {
        window.electronApi?.removeListener(channel, listener);
    },
    removeAllListeners: (channel) => {
        window.electronApi?.removeAllListeners(channel);
    },
    handle: (channel, listener) => {
        window.electronApi?.handle(channel, listener);
    }
};