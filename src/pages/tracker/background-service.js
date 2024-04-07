import { useEffect, useRef } from 'react';
import { electronApi } from '../../utils/electronApi';
import { logInfo } from '../../utils/loggerHelper';
import { setIsTimerRunning } from '../../utils/electronApi';

export const useBackgroundService = (
    project_id,
    counterInSeconds,
    {
        screenshot_tracking,
        productivity_tracking,
        app_website_tracking
    }) => {

    // take screenshot every 2.5 minutes
    useEffect(() => {
        if (screenshot_tracking && counterInSeconds > 0 && counterInSeconds % 150 === 0) {
            electronApi.send('request-screenshot', project_id);
        }
    }, [counterInSeconds, screenshot_tracking, project_id]);

    // track productivity every 5 seconds
    useEffect(() => {
        if (productivity_tracking && counterInSeconds > 0 && counterInSeconds % 5 === 0) {
            electronApi.send('request-app-tracking', { project_id, duration: 5 });
        }
    }, [counterInSeconds, productivity_tracking], project_id);

    // track app and website usage every 2.5 minutes
    useEffect(() => {
        if (app_website_tracking && counterInSeconds > 0 && counterInSeconds % 150 === 0) {
            electronApi.send('request-activity-tracking', { project_id, duration: 150 });
        }
    }, [counterInSeconds, app_website_tracking, project_id]);
}

export const startActivityTracking = () => {
    electronApi.send('start-activity-tracking');
}

export const stopActivityTracking = () => {
    electronApi.send('stop-activity-tracking');
}

export const startAppUsageTracking = () => {
    electronApi.send('start-app-tracking');
}

export const stopAppUsageTracking = () => {
    electronApi.send('stop-app-tracking');
}

export const useIdleCheck = (counterInSeconds, inactivityTimeoffInSeconds, inactivityLogout, setActiveProjectId) => {
    const idleTimeRef = useRef(0);

    useEffect(() => {
        if (counterInSeconds > 0 && inactivityTimeoffInSeconds > 0 && counterInSeconds % 45 === 0) {
            (async () => {
                const idleTime = await electronApi.invoke('GetIdleTime');
                if (idleTime >= inactivityTimeoffInSeconds) {
                    idleTimeRef.current = idleTime;
                    if (idleTimeRef.current > 0) {
                        logInfo('Idle time reached, showing popup');
                        electronApi.send('ShowIdlePopup');
                    }
                }
            })();
        }
    }, [counterInSeconds, inactivityTimeoffInSeconds]);

    useEffect(() => {
        const listener = (response) => {
            logInfo('Got idle popup response', response);
            if (response == 'stop') {
                inactivityLogout(idleTimeRef.current, () => {
                    (async () => {
                        idleTimeRef.current = 0;
                        setActiveProjectId(-1)
                        stopActivityTracking();
                        stopAppUsageTracking();
                        await setIsTimerRunning(false);
                    })();
                })

            }
        }

        electronApi.on('IdlePopupResponse2', listener);

        return () => {
            electronApi.removeListener('IdlePopupResponse2', listener);
        };
    }, []);
}