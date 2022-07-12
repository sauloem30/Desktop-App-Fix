import moment from "moment";
import axiosInstance from "../utils/axios-instance";
import axios from "axios";

export const getProjects = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/projects/lookup/active`)
    return response.data
  } catch (err) {
    // handle errors here
    return ({result: [], err_msg: {message: "Error Loading Projects"}})
  }
};

export const handleUpdateTimeLog = async (project , activeId) => {
  const { id } = project;
  // handlePause(id);
  const obj = {
    time_out: moment().utc(),
    application_type : 'desktop',
    project_id: id,
    id : activeId,
  }
  try {
    const response = await axiosInstance.post(`/timelog/time_out`, obj);
    return response
  }
  catch (err) {
    return ({data: {success: false,error_message :"Error Clocking Out",inserted:[]}})
  }
}

export const handlePostTimeLog = async (project_id) => {
  const obj = {
    time_in: moment().utc(),
    application_type : 'desktop',
    project_id: project_id,
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
