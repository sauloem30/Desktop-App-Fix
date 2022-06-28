import moment from "moment";
import axiosInstance from "../utils/axios-instance";

export const getProjects = async () => {
  try {
    return axiosInstance
      .request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}/projects/lookup/active`,
      })
      .then((res) => {
        const { data } = res;
        let arr = data?.results
        return arr
      })
  } catch (error) {
    console.log(error)
  }

};


export const handleUpdateTimeLog = async (project , activeId) => {

  const { id } = project;
  // handlePause(id);
  const obj = {
    time_out: moment().format("YYYY-MM-DD hh:mm:ss"),
    application_type : 'desktop',
    project_id: id,
    id : activeId,
  }
  try {
    const res = await axiosInstance.post(`/timelog/time_out`, obj);
  }
  catch (err) {
    console.log(err)
  }

}



export const handlePostTimeLog = async (project_time, project_id) => {
    // time_in: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
  const obj = {
    time_in: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
    application_type : 'desktop',
    project_id: project_id,
  }
  let res;
  try {
    res = await axiosInstance.post(`/timelog/time_in`, obj)
    return res;
  }
  catch (err) {
    return err;
  }
}
