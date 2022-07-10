import moment from "moment";
import axiosInstance from "../utils/axios-instance";
import axios from "axios";

export const getProjects = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/projects/lookup/active`)
    return response.data
  } catch (err) {
    // handle errors here
    console.log(err)
  }
};

export const handleUpdateTimeLog = async (project , activeId) => {
  const { id } = project;
  // handlePause(id);
  const obj = {
    time_out: moment().utc("YYYY-MM-DD hh:mm:ss"),
    application_type : 'desktop',
    project_id: id,
    id : activeId,
  }
  try {
    await axiosInstance.post(`/timelog/time_out`, obj);
  }
  catch (err) {
    console.log(err)
  }
}

export const handlePostTimeLog = async (project_time, project_id) => {
    // time_in: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
  const obj = {
    time_in: moment().utc("YYYY-MM-DD hh:mm:ss"),
    application_type : 'desktop',
    project_id: project_id,
  }
  let res;
  try {
    res = await axiosInstance.post(`/timelog/time_in`, obj)
    return res;
  }
  catch (err) {
    console.log(err)

    return err;
  }
}
