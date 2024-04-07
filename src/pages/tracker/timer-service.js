import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axiosInstance from '../../utils/axios-instance';

export const useTimer = (activeProjectId) => {
    const [counterInSeconds, setCounterInSeconds] = useState(0);
    const [counterInMinutes, setCounterInMinutes] = useState(0);
    const timerRef = React.useRef(null);

    useEffect(() => {
        if (activeProjectId > 0) {
            timerRef.current = setInterval(() => {
                setCounterInSeconds((prevMinutes) => prevMinutes + 1);
            }, 1000);
        }
        else {
            clearInterval(timerRef.current);
            setCounterInSeconds(0);
            setCounterInMinutes(0);
        }

        return () => {
            clearInterval(timerRef.current);
        };
    }, [activeProjectId]);

    useEffect(() => {
        if (counterInSeconds > 0 && counterInSeconds % 60 === 0) {
            setCounterInMinutes((prevMinutes) => prevMinutes + 1);
        }
    }, [counterInSeconds]);

    return { counterInSeconds, counterInMinutes };
}

export const useWeeklyLimitChecker = (weeklyLimitInSeconds, totalToday) => {
    const [lastChecked, setLastChecked] = useState();
    const [previousTotal, setPreviousTotal] = useState(0);
    const [totalThisWeek, setTotalThisWeek] = useState(0);
    const [isWeeklyLimitReached, setIsWeeklyLimitReached] = useState(false);

    useEffect(() => {
        if (weeklyLimitInSeconds > 0 && moment().format('YYYY-MM-DD') !== lastChecked) {
            // fetch previous total
            axiosInstance.get('/tracker-app/previous-days-total')
                .then(({ data }) => {
                    setLastChecked(moment().format('YYYY-MM-DD'));
                    setPreviousTotal(Number(data.total || 0));
                })
        }
    }, [weeklyLimitInSeconds, lastChecked]);

    useEffect(() => {
        const total = previousTotal + totalToday;
        
        if (weeklyLimitInSeconds > 0) {
            setTotalThisWeek(total);
            setIsWeeklyLimitReached(total >= weeklyLimitInSeconds);
        }
    }, [previousTotal, totalToday, weeklyLimitInSeconds]);

    return  { totalThisWeek, isWeeklyLimitReached };
}