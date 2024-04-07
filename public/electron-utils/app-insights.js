let appInsights = require('applicationinsights');
const logger = require('./logger');

const setupAppInsights = () => {
    // enable app insights
    let key = `InstrumentationKey=7edd67c7-b077-4882-9a8f-576781bce19b;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/`;
    try {
       appInsights.setup(key);
       appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "Electron";
       appInsights.start();
    } catch (err) {
       logger.error(`Error setting up app insights: ${err}`);
    }
}

module.exports = { setupAppInsights };