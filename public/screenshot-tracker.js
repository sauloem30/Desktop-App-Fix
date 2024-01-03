const screenshot = require('screenshot-desktop')
const { desktopCapturer } = require('electron')
const moment = require('moment');
const axios = require('axios');

let host;
let user_id;
let project_id;
let start_at;
let intervalTakeScreenshot;


function uploadScreenshot(imgs) {
    const data = {
        user_id,
        project_id,
        imgs,
        generated_at: moment().utc()
    };

    axios.post(`${host}/api/screenshots/v2/upload`, data);
}

function takeScreenshot() {
    console.log('New Capture function initiated');

    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 768 }, })
        .then((sources) => {
            const imgs = sources.map((source) => {
                return source.thumbnail.toPNG();
            });
            uploadScreenshot(imgs);
        })
        .catch((err) => {
            // if fails, will try the screenshot-desktop library
            screenshot.all({ format: 'png' })
                .then(uploadScreenshot)
        });

    start_at = moment().utc();
}

exports.start = (_user_id, _project_id, _host) => {
    // initialize variables
    user_id = _user_id;
    project_id = _project_id;
    host = _host;
    start_at = moment().utc();

    // after 30 seconds, take initial screenshot
    setTimeout(() => {
        takeScreenshot();
    }, 30000);

    // every 3.33 minutes, take screenshot
    intervalTakeScreenshot = setInterval(() => {
        takeScreenshot();
    }, 199998);
}

exports.stop = () => {
    clearInterval(intervalTakeScreenshot);

    // check if theres at least 10 seconds from last screenshot
    if (moment().utc().diff(start_at, 'seconds') >= 10) {
        takeScreenshot();
    }
}

