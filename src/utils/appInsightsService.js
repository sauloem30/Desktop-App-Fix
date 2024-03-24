import {ApplicationInsights } from '@microsoft/applicationinsights-web';
import {ReactPlugin} from '@microsoft/applicationinsights-react-js';

let key = `InstrumentationKey=7edd67c7-b077-4882-9a8f-576781bce19b;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/`;

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString: key,
    extensions: [reactPlugin],
    enableAutoRouteTracking: true,
    disableAjaxTracking: false,
    autoTrackPageVisitTime: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true
  }
});
appInsights.loadAppInsights();

appInsights.addTelemetryInitializer((env) => {
    env.tags = env.tags || [];
    env.tags["ai.cloud.role"] = "Tracker_App";
});

export { reactPlugin, appInsights };


