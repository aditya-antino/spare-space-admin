import { axiosInstance } from "../axiosInstance";

const getUserList = async (page: number) => {
  const response = await axiosInstance.get(`admin/users?page=${page}&limit=10`);
  return response;
};

const searchUsers = async (page: number, searchVal: string) => {
  const response = await axiosInstance.get(
    `admin/users?page=${page}&limit=10&search=${searchVal}`
  );
  return response;
};

const getUserStats = async () => {
  const response = await axiosInstance.get("admin/user-stats");
  return response;
};

const downloadUserListCSV = async () => {
  const response = await axiosInstance.get(`admin/users/export`);
  return response;
};

const toggleUserStatus = async (payload: { userId: number }) => {
  const response = await axiosInstance.patch(
    `admin/users/toggle-status`,
    payload
  );
  return response;
};

const getUserBookingData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/booking-history?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getUserPaymentHistoryData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/payment-history?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getUserCancellationHistoryData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/cancellation-history?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getHostPropertyData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/host-properties?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getHostBookingData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/host-booking?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getHostPayoutData = async (
  userID: string | number,
  page: number,
  limit: number
) => {
  const response = await axiosInstance.get(
    `admin/host-payout?userId=${userID}&page=${page}&limit=${limit}`
  );
  return response;
};

const getUserDetails = async (userID: string | number) => {
  const response = await axiosInstance.get(`admin/user-info?userId=${userID}`);
  return response;
};

const getGuestStats = async (userID: string | number) => {
  const response = await axiosInstance.get(
    `admin/guest-dasboard?userId=${userID}`
  );
  return response;
};

const getHostStats = async (userID: string | number) => {
  const response = await axiosInstance.get(
    `admin/host-dasboard?userId=${userID}`
  );
  return response;
};

const updateUserAbout = async (payload: { userId: string | number; about: string }) => {
  const response = await axiosInstance.patch(
    `admin/users/${payload.userId}/about`,
    { about: payload.about }
  );
  return response;
};

const updateUserCashfreeVerification = async (userId: string | number, payload: any) => {
  console.log("payload ",payload)
  const response = await axiosInstance.post(
    `admin/users/${userId}/cashfree`,
    payload
  );
  return response;
};

export {
  getHostBookingData,
  getHostPropertyData,
  getGuestStats,
  getHostStats,
  getUserList,
  getUserStats,
  searchUsers,
  downloadUserListCSV,
  toggleUserStatus,
  getUserBookingData,
  getUserPaymentHistoryData,
  getUserCancellationHistoryData,
  getHostPayoutData,
  getUserDetails,
  updateUserAbout,
  updateUserCashfreeVerification
};
