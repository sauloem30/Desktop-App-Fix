const { uIOhook } = require('uiohook-napi');
const { ipcMain } = require('electron');
const { getAxios } = require('./axios-instance');
const logger = require('./logger');

function uploadData(data, callback) {
    logger.info('Uploading activity data');

    getAxios().then(axios => {
        axios.post('/tracker-app/activities', data)
            .then((response) => {
                logger.info('Activity data uploaded successfully', response.data);
            })
            .catch((err) => {
                logger.error('Error in uploading activity data', err.message);
            })
            .finally(() => {
                callback();
            });
    });
}

const setupActivityTracker = () => {
    let number_of_keypress = 0;
    let number_of_clicks = 0;
    let productivity_score = 0;
    let hasActivity = false;
    let intervalHasActivityCheck;

    const resetActivity = () => {
        number_of_keypress = 0;
        number_of_clicks = 0;
        productivity_score = 0;
        hasActivity = false;
    }

    const stopHook = () => {
        try {
            uIOhook.stop();
        } catch (error) {
            logger.error('Error in stopping uIOhook', error.message);
        }
    }

    const startHook = () => {
        try {
            uIOhook.start();
        } catch (error) {
            logger.error('Error in starting uIOhook', error.message);
        }
    }

    ipcMain.on('start-activity-tracking', (event) => {
        logger.info('Starting activity tracking');
        resetActivity();
        stopHook();
        startHook();
        intervalHasActivityCheck = setInterval(() => {
            if (hasActivity) {
                productivity_score++;
                hasActivity = false;
            }
        }, 1000);
    });

    ipcMain.on('stop-activity-tracking', (event) => {
        logger.info('Stopping activity tracking');
        resetActivity();
        stopHook();
        clearInterval(intervalHasActivityCheck);
    });

    ipcMain.on('request-activity-tracking', (event, { project_id, duration }) => {
        logger.info('Requesting activity', project_id);
        const data = {
            project_id,
            duration,
            productivity_score,
            number_of_clicks,
            number_of_keypress,
        };
        uploadData(data, resetActivity);
    });

    try {
        uIOhook.on('keydown', (e) => {
            number_of_keypress++;
        });

        uIOhook.on('click', (e) => {
            number_of_clicks++;
        });

        uIOhook.on('input', (e) => {
            if (!hasActivity) {
                hasActivity = true;
            }
        });

    } catch (error) {
        logger.error('Error in uIOhook listeners', error.message);
    }
}

module.exports = { setupActivityTracker };