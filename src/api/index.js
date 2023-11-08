import moment from 'moment';
import axiosInstance from '../utils/axios-instance';

export const getProjects = async (userId) => {
   try {
      const response = await axiosInstance.get(
         `${
            process.env.REACT_APP_API_BASE_URL
         }/projects/lookup/active?user_id=${userId}&offset=${moment().utcOffset()}`,
      );

      return response.data;
   } catch (err) {
      // handle errors here
      return { result: [], err_msg: { message: 'Error Loading Projects' } };
   }
};

export const getLatestLogin = async (user_id) => {
   try {
      const response = await axiosInstance.get(
         `${process.env.REACT_APP_API_BASE_URL}/get_lookup/latest_employee_clock_in?user_id=${user_id}`,
      );
      return response.data;
   } catch (err) {
      // handle errors here
      return { data: [], err_msg: { message: 'Error Loading Latest Clock In' } };
   }
};

export const handleUpdateTimeLog = async (
   project,
   activeId,
   userId,
   isMidnight = false,
   idleTime = 0,
) => {
   const { id } = project;
   // handlePause(id);
   const obj = {
      time_out: moment().utc(),
      application_type: 'desktop',
      project_id: id || project,
      id: activeId,
      user_id: userId,
      offset: moment().utcOffset(),
      is_transition: isMidnight,
      idleTime,
   };
   try {
      const response = await axiosInstance.post(`/timelog/time_out`, obj);
      return response;
   } catch (err) {
      return { data: { success: false, error_message: 'Error Clocking Out', inserted: [] } };
   }
};

export const handlePostTimeLog = async (
   project_id,
   user_id,
   isMidnight = false,
   isResumeLog = false,
   resumeLogId = null,
) => {
   const obj = {
      time_in: moment().utc(),
      application_type: 'desktop',
      project_id: project_id,
      user_id: user_id,
      is_transition: isMidnight,
      offset: moment().utcOffset(),
      is_resume_log: isResumeLog,
      resume_log_id: resumeLogId,
   };
   let res;
   try {
      res = await axiosInstance.post(`/timelog/time_in`, obj);
      return res;
   } catch (err) {
      return { data: { success: false, error_message: 'Error Clocking In' } };
   }
};

export const handleLogout = async () => {
   let res;
   try {
      res = await axiosInstance.get(`/logout`);
      return res;
   } catch (err) {
      return { data: { success: false, error_message: 'Error Logging Out' } };
   }
};
