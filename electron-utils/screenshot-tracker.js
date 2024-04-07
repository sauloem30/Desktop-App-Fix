const { desktopCapturer, ipcMain } = require('electron')
const { getAxios } = require('./axios-instance');
const logger = require('./logger');

function uploadScreenshot(project_id, imgs) {
    logger.info('Uploading screenshot');

    const data = {
        project_id,
        imgs,
    };

    getAxios().then(axios => {
        axios.post('/tracker-app/screenshots', data)
            .then((response) => {
                logger.info('Screenshot uploaded successfully', response.data);
            })
            .catch((err) => {
                logger.error('Error in uploading screenshot', err);
            });
    });
}

function takeScreenshot(project_id) {
    logger.info('Taking screenshot');

    try {
        desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 768 }, })
            .then((sources) => {
                logger.info('Screenshot taken');
                const imgs = sources.map((source) => {
                    return source.thumbnail.toPNG();
                });
                uploadScreenshot(project_id, imgs);
            })
            .catch((err) => {
                logger.error('Error in desktopCapturer', err);
            });
    }
    catch (err) {
        logger.error('Error in takeScreenshot', err);
    }
}

const setupScreenshotTracker = () => {
    ipcMain.on('request-screenshot', (event, project_id) => {
        logger.info('Requesting screenshot', project_id);
        takeScreenshot(project_id);
    });
}

module.exports = { setupScreenshotTracker };