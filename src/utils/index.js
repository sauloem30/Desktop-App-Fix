const Hours = (time) => `0${Math.floor(time / 3600)}`.slice(-2);

const Minutes = (time) => {
    const mins = `0${Math.floor(time / 60)}`
    return `0${mins % 60}`.slice(-2)
}

const Seconds = (time) => `0${time % 60}`.slice(-2);

export const getHourMinSec = (time) => {
    return `${Hours(time)}:${Minutes(time)}:${Seconds(time)}`;
}

export const  getHourMin= (time) =>{
    return `${Hours(time)}:${Minutes(time)}`
}