import moment from 'moment';
import axiosInstance from '../utils/axios-instance';

export const getProjects = async (userId) => {
   try {
      const response = await axiosInstance.get(`/time-tracker/projects?user_id=${userId}&utcOffset=${moment().utcOffset()}`);

      return response.data;
   } catch (err) {
      // handle errors here
      return { result: [], err_msg: { message: 'Error Loading Projects' } };
   }
};

export const getLatestLogin = async (user_id) => {
   try {
      const response = await axiosInstance.get(`/get_lookup/latest_employee_clock_in?user_id=${user_id}`);
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
   const obj = {
      id: activeId,
      user_id: userId,
      utcOffset: moment().utcOffset(),
      idleTime
   };
   try {
      const response = await axiosInstance.post(`/time-tracker/time-out`, obj);
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
      user_id,
      project_id,
      utcOffset: moment().utcOffset(),
   };
   try {
      const res = await axiosInstance.post(`/time-tracker/time-in`, obj);
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
