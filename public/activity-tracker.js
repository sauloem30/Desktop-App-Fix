const { uIOhook } = require('uiohook-napi');
const moment = require('moment');
const axios = require('axios');

let host;
let user_id;
let project_id;
let start_at;
let productivity_score = 0;
let hasMouseActivity = false;
let hasKeyboardActivity = false;
let intervalHasActivityCheck;
let intervalSubmitActivity;

uIOhook.on('keydown', (e) => {
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

function submitActivity() {
    // don't submit if there was no activity
    if (productivity_score === 0) return;

    const currentActivity = {
        user_id,
        project_id,
        productivity_score,
        start_at,
        end_at: moment().utc()
    };

    axios.post(`${host}/api/timelog/activity`, currentActivity)
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        });

    // reset mouse and keyboard activity
    productivity_score = 0;
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