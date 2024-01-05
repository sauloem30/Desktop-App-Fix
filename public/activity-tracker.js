const { uIOhook } = require('uiohook-napi');
const moment = require('moment');
const axios = require('axios');
const { ipcMain } = require('electron');
const { IPCEvents } = require('./ipc-api');

let host;
let user_id;
let project_id;
let start_at;
let productivity_score = 0;
let hasMouseActivity = false;
let hasKeyboardActivity = false;
let intervalHasActivityCheck;
let intervalSubmitActivity;
let numberOfClicks = 0;
let numberOfKeyPress = 0;
let onlineStatus = true;
let offlineData = [];

ipcMain.on(IPCEvents.OnlineStatusChanged, (event, status) => {
    onlineStatus = status;

    if (status && offlineData.length > 0) {
        offlineData.forEach((offlineData) => {
            axios.post(`${host}/api/timelog/activity`, offlineData);
        });
        offlineData = [];
    }
});

uIOhook.on('keydown', (e) => {
    numberOfKeyPress++;
    if (!hasKeyboardActivity) {
        hasKeyboardActivity = true;
    }
});

uIOhook.on('mousedown', (e) => {
    if (!hasMouseActivity) {
        hasMouseActivity = true;
    }
});

uIOhook.on('mousemove', (e) => {
    if (!hasMouseActivity) {
        hasMouseActivity = true;
    }
});

uIOhook.on('wheel', (e) => {
    if (!hasMouseActivity) {
        hasMouseActivity = true;
    }
});

uIOhook.on('click', (e) => {
    numberOfClicks++;
    if (!hasMouseActivity) {
        hasMouseActivity = true;
    }
});

function uploadData() {
    const data = {
        user_id,
        project_id,
        productivity_score,
        number_of_clicks: numberOfClicks,
        number_of_keypress: numberOfKeyPress,
        start_at,
        end_at: moment().utc()
    };

    if (!onlineStatus) {
        offlineData.push(data);
        return;
    } else {
        axios.post(`${host}/api/timelog/activity`, data);
    }
}

function submitActivity() {
    // don't submit if there was no activity
    if (productivity_score === 0) return;

    uploadData();

    // reset mouse and keyboard activity
    productivity_score = 0;
    numberOfClicks = 0;
    numberOfKeyPress = 0;
    start_at = moment().utc();
}

exports.start = (_user_id, _project_id, _host) => {
    // initialize variables
    user_id = _user_id;
    project_id = _project_id;
    host = _host;
    start_at = moment().utc();

    // start listening to keyboard and mouse events
    uIOhook.start();

    // every second, check if there was activity
    intervalHasActivityCheck = setInterval(() => {
        if (hasMouseActivity || hasKeyboardActivity) {
            productivity_score++;
            hasMouseActivity = false;
            hasKeyboardActivity = false;
        }
    }, 1000);

    // every 3.33 minutes, send data to server
    intervalSubmitActivity = setInterval(() => {
        submitActivity();
    }, 199998);
}

exports.stop = () => {
    submitActivity();
    clearInterval(intervalHasActivityCheck);
    clearInterval(intervalSubmitActivity);
    uIOhook.stop();
}