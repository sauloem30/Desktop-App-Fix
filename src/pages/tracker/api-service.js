import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios-instance';
import { startBackgroundService, stopBackgroundService } from './background-service';
import AppContext from '../../AppContext';

export const useGetProjects = () => {
    const { setErrorMessage } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [totalToday, setTotalToday] = useState(0);

    const fetchProjects = useCallback(() => {
        axiosInstance.get(`/tracker-app/projects`)
            .then(({ data }) => {
                setProjects(data.projects);
                setTotalToday(Number(data.totalTime));
            })
            .catch((error) => {
                if (error.response.status === 401 || error.response.status === 403) {
                    navigate('/');
                } else if (error.message === 'Network Error' || error.response.status >= 500) {
                    setErrorMessage('Unable to connect to the server.', 45000);
                }
            });
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return { projects, totalToday, fetchProjects };
}

export const useGetUserDetails = () => {
    const { setErrorMessage } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [weeklyLimitInSeconds, setWeeklyLimitInSeconds] = useState(0);
    const [inactivityTimeoffInSeconds, setInactivityTimeoffInSeconds] = useState(0);

    useEffect(() => {
        axiosInstance.get('/tracker-app/user-details')
            .then(({ data }) => {
                setUser(data.user);
                setWeeklyLimitInSeconds(Number(data.weeklyLimitInSeconds ?? 0));
                setInactivityTimeoffInSeconds(Number(data.inactivityTimeoffInSeconds));
            })
            .catch((error) => {
                if (error.response.status === 401 || error.response.status === 403) {
                    navigate('/');
                } else if (error.message === 'Network Error' || error.response.status >= 500) {
                    setErrorMessage('Unable to connect to the server.', 45000);
                }
            });
    }, []);

    return { user, weeklyLimitInSeconds, inactivityTimeoffInSeconds };
}

export const useHeartbeat = (conter, timelogId, callback) => {
    const { setErrorMessage } = React.useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (conter > 0) {
            axiosInstance.post('/tracker-app/heartbeat', { timelogId })
                .then(() => {
                    callback();
                })
                .catch((error) => {
                    if (error.response.status === 401 || error.response.status === 403) {
                        navigate('/');
                    } else if (error.message === 'Network Error' || error.response.status >= 500) {
                        setErrorMessage('Unable to connect to the server.', 45000);
                    }
                });
        }
    }, [conter, timelogId]);
}

export const useStartStop = (activeProjectId, fetchProjects, setTimelogId) => {
    const { setErrorMessage } = React.useContext(AppContext);
    const navigate = useNavigate();

    // notify electron if timer is running or not
    useEffect(() => {
        (async () => {
            if (activeProjectId > 0) {
                start(activeProjectId);
                await startBackgroundService();
            } else if (activeProjectId === 0) {
                stop(fetchProjects);
                await stopBackgroundService();
            }
        })();
    }, [activeProjectId]);

    const start = (project_id) => {
        submitRequest('/tracker-app/start', project_id)
    }

    const stop = (callback, idleTime) => {
        submitRequest('/tracker-app/stop', 0, callback, idleTime)
    }

    const logout = (callback) => {
        stop(callback);
    }

    const inactivityLogout = (idleTime, callback) => {
        stop(() => {
            fetchProjects();
            if (callback)
                callback();
        }, idleTime);
    }

    const submitRequest = (endpoint, project_id, callback, idleTime) => {
        axiosInstance.post(endpoint, { idleTime, project_id })
            .then(({ data: { error, id } }) => {
                if (error) {
                    setErrorMessage(error);
                } else {
                    setTimelogId(id);
                    if (callback)
                        callback();
                }
            })
            .catch((error) => {
                if (error.response.status === 401 || error.response.status === 403) {
                    navigate('/');
                } else if (error.message === 'Network Error' || error.response.status >= 500) {
                    setErrorMessage('Unable to connect to the server.', 45000);
                }
            });
    }

    return { logout, inactivityLogout };
}