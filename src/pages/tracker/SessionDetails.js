import React from 'react'
import { getHourMin, getHourMinSec, getHoursWithOutZero } from '../../utils';
import { Typography, Box } from '@mui/material'
import TrackerContext from './TrackerContext';

export default function SessionDetails() {
    const {
        currentSession,
        weeklyLimitInSeconds,
        totalToday,
        totalThisWeek,
        isLimitReached,
        errorMessage,
    } = React.useContext(TrackerContext);

    const getWeeklyLimitDisplay = () => {
        if (weeklyLimitInSeconds > 0) {
            return `${getHoursWithOutZero(weeklyLimitInSeconds)} hours`;
        }
        return 'None';
    }

    return (
        <>
            <Typography variant='h4' sx={{ marginTop: '32px', pointerEvents: 'none' }}>
                Current Session:
            </Typography>

            <Typography variant='body4' sx={{ marginBottom: '12px' }}>
                <Box>{getHourMinSec(currentSession)}</Box>
            </Typography>

            <Typography variant='body5'>
                <Box sx={{ marginBottom: '10px' }}>
                    Weekly time tracking limit: {getWeeklyLimitDisplay()}
                </Box>
            </Typography>

            {/* <Typography variant='body5'>
                <Box sx={{ marginBottom: '10px' }}>
                    Total time this week: {getHourMin(totalThisWeek)}
                </Box>
            </Typography> */}

            <Typography variant='body6' sx={{ marginTop: '10px', marginBottom: '32px' }}>
                Total today: {getHourMin(totalToday)}
            </Typography>

            <div style={{ textAlign: 'center', minHeight: 25 }}>
                {isLimitReached && (
                    <Typography variant='body5' style={{ color: 'red' }}>
                        Weekly Time Limit Reached
                    </Typography>
                )}
                {errorMessage?.length > 0 && (
                    <Typography variant='body5' style={{ color: 'red' }}>
                        {errorMessage}
                    </Typography>
                )}
            </div>
        </>
    )
}