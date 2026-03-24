import { axiosInstance } from "../axiosInstance";

const getStaticDetails = async () => {
  const response = await axiosInstance.get(`admin/booking-activity`);
  return response;
};

export { getStaticDetails };
