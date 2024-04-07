export const getHours = (time) => `0${Math.floor(time / 3600)}`.slice(-2);

const Minutes = (time) => {
    const mins = `0${Math.floor(time / 60)}`
    return `0${Math.floor(mins % 60)}`.slice(-2)
}

const Seconds = (time) => `0${Math.floor(time % 60)}`.slice(-2);

export const getHourMinSec = (time) => {
    return `${getHours(time)}:${Minutes(time)}:${Seconds(time)}`;
}

export const getHourMin = (time) => {
    return `${getHours(time)}:${Minutes(time)}`
}

export const getHoursWithOutZero = (time) => {
    return `${Math.floor(time / 3600)}`
}