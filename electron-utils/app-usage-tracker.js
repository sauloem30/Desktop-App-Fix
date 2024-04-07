const { ipcMain } = require('electron');
const { getAxios } = require('./axios-instance');
const logger = require('./logger');
const { activeWindow } = require('@miniben90/x-win');

function uploadData(data) {
    getAxios().then(axios => {
        axios.post('/tracker-app/app-usage', data)
            .then(({ data }) => {
                if (data.error) {
                    logger.info('Error in uploading app usage data', data.error);
                }
            })
            .catch((err) => {
                logger.error('Error in uploading app usage data', err.message);
            });
    });
}

const setupAppUsageTracker = () => {
    let previous = '';

    const getActiveWindow = () => {
        try {
            const currentApp = activeWindow();
            const application_name = currentApp?.info?.name ?? 'Unknown App';
            const website = currentApp?.url ?? '';
            return { application_name, website };
        } catch (err) {
            logger.error('Error in getActiveWindow', err.message);
            return { application_name: 'Error App', website: '' };
        }
    }

    ipcMain.on('request-app-tracking', (event, { project_id, duration }) => {
        try {
            const { application_name, website } = getActiveWindow();
            
            if (previous !== application_name) {
                uploadData({
                    project_id,
                    duration, 
                    application_name,
                    website
                });
                // update previous
                previous = application_name;
            }
        } catch (err) {
            logger.error('Error in request app usage', err);
        }
    });

    ipcMain.on('start-app-tracking', (event) => {
        logger.info('Starting app tracking');
        const { application_name } = getActiveWindow();
        previous = application_name;
    });

    ipcMain.on('stop-app-tracking', (event) => {
        logger.info('Stopping app tracking');
        previous = '';
    });
}

module.exports = { setupAppUsageTracker };