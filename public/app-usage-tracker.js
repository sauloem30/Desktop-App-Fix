const screenshot = require('screenshot-desktop')
const { desktopCapturer, ipcMain } = require('electron')
const moment = require('moment');
const axios = require('axios');
const { activeWindow } = require('@miniben90/x-win');

let host;
let user_id;
let project_id;
let start_at;
let interval;
let onlineStatus = true;
let offlineData = [];
let lastAppActivity;

ipcMain.on('online-status-changed', (event, status) => {
    onlineStatus = status;

    if (status && offlineData.length > 0) {
        offlineData.forEach((offlineData) => {
            axios.post(`${host}/api/application-usage/upload2`, offlineData);
        });
        offlineData = [];
    }
});


function uploadData(currentApp) {
    const data = {
        user_id,
        project_id,
        application_name: currentApp?.info?.name ?? 'Unknown App'
    };

    if (!onlineStatus) {
        offlineData.push(data);
        return;
    } else {
        axios.post(`${host}/api/application-usage/upload2`, data);
    }
}

function takeScreenshot() {
    try {
        const currentApp = activeWindow();
  
        if (lastAppActivity?.application_name !== currentApp?.application_name) {
            uploadData(currentApp);
            lastAppActivity = currentApp;
         }
     } catch (err) {
        logger.log(err);
     }
}

exports.start = (_user_id, _project_id, _host) => {
    // initialize variables
    user_id = _user_id;
    project_id = _project_id;
    host = _host;
    start_at = moment().utc();

    // every 5 seconds, check/record app usage
    interval = setInterval(() => {
        takeScreenshot();
    }, 5000);
}

exports.stop = () => {
    clearInterval(interval);
}

