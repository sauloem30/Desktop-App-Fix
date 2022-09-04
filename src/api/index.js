import moment from "moment";
import axiosInstance from "../utils/axios-instance";

export const getProjects = async (userId) => {
  try {
    const response = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/projects/lookup/active?user_id=${userId}`)
    return response.data
  } catch (err) {
    // handle errors here
    return ({result: [], err_msg: {message: "Error Loading Projects"}})
  }
};

export const handleUpdateTimeLog = async (project , activeId, userId, isMidnight = false) => {
  const { id } = project;
  // handlePause(id);
  const obj = {
    time_out: moment().utc(),
    application_type : 'desktop',
    project_id: id || project,
    id : activeId,
    user_id: userId,
    offset: moment().utcOffset(),
    is_transition: isMidnight,
  }
  try {
    const response = await axiosInstance.post(`/timelog/time_out`, obj);
    return response
  }
  catch (err) {
    return ({data: {success: false,error_message :"Error Clocking Out",inserted:[]}})
  }
}

export const handlePostTimeLog = async (project_id, user_id, isMidnight = false) => {
  const obj = {
    time_in: moment().utc(),
    application_type : 'desktop',
    project_id: project_id,
    user_id: user_id,
    is_transition: isMidnight,
    offset: moment().utcOffset(),
  }
  let res;
  try {
    res = await axiosInstance.post(`/timelog/time_in`, obj)
    return res;
  }
  catch (err) {
    return ({data: {success:false, error_message: "Error Clocking In"}})
  }
}

export const handleLogout = async () => {
  let res;
  try {
    res = await axiosInstance.get(`/logout`)
    return res;
  }
  catch (err) {
    return ({data: {success:false, error_message: "Error Logging Out"}})
  }
}