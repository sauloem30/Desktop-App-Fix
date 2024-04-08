import React, { useEffect } from 'react'
import Header from './Header'
import SessionDetails from './SessionDetails'
import ProjectList from './ProjectList'
import { useStyles } from './styles';
import { Box, Grid, Paper } from '@mui/material'
import { useGetProjects, useGetUserDetails, useHeartbeat, useStartStop } from './api-service';
import TrackerContext from './TrackerContext';
import { useTimer, useWeeklyLimitChecker } from './timer-service';
import { useBackgroundService, useIdleCheck } from './background-service';
import AppContext from '../../AppContext';

export default function Main() {
    const classes = useStyles();
    const { isOnline } = React.useContext(AppContext);

    const [activeProjectId, setActiveProjectId] = React.useState(-1);
    const [errorMessage, setErrorMessage] = React.useState();

    const netStatusRef = React.useRef();

    const { projects, totalToday, fetchProjects } = useGetProjects();

    const { user, weeklyLimitInSeconds, inactivityTimeoffInSeconds } = useGetUserDetails();

    const { counterInSeconds, counterInMinutes } = useTimer(activeProjectId);

    useHeartbeat(counterInMinutes, fetchProjects);

    const { logout, inactivityLogout } = useStartStop(activeProjectId, setErrorMessage, fetchProjects);

    const { totalThisWeek, isWeeklyLimitReached } = useWeeklyLimitChecker(weeklyLimitInSeconds, totalToday);

    // background service for screenshoots, activity and app usage tracking
    useBackgroundService(activeProjectId, counterInSeconds, user);

    // check for idle time
    useIdleCheck(counterInSeconds, inactivityTimeoffInSeconds, inactivityLogout, setActiveProjectId);

    useEffect(() => {
        if (!isOnline) {
            const message = 'You are offline. Please check your internet connection.';
            if (activeProjectId > 0) {
                setErrorMessage(`${message} The tracker will automatically pause in 5 minutes.`);
                netStatusRef.current = setTimeout(() => {
                    setActiveProjectId(0);
                    setErrorMessage(message);
                }, 300000);
            } else {
                setErrorMessage(message);
            }
        } else {
            setErrorMessage('');
            clearTimeout(netStatusRef.current);
        }

        return () => {
            clearTimeout(netStatusRef.current);
        }
    }, [isOnline, activeProjectId]);

        return (
            <Box sx={{ height: 'fit-content' }}>
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Grid item lg={5} md={4} sm={12} xs={12}>
                        <Paper
                            className={classes.loginContainer}
                            style={{ boxShadow: 'none', position: 'relative' }}>
                            <TrackerContext.Provider value={{
                                projects,
                                totalToday,
                                user,
                                weeklyLimitInSeconds,
                                inactivityTimeoffInSeconds,
                                currentSession: counterInSeconds,
                                activeProjectId,
                                setActiveProjectId,
                                errorMessage,
                                setErrorMessage,
                                totalThisWeek,
                                isLimitReached: isWeeklyLimitReached,
                                logout
                            }}>
                                <Header />
                                <Box sx={{ border: '1px solid #F2F3F7' }} />
                                <SessionDetails />
                                <ProjectList />
                            </TrackerContext.Provider>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        )
    }