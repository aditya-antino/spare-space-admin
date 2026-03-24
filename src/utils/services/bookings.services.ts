import { axiosInstance } from "../axiosInstance";

const getBookings = async (page: number) => {
  const response = await axiosInstance(`admin/bookings?page=${page}&limit=10`);
  return response;
};

const searchBookings = async (page: number, id: number) => {
  const response = await axiosInstance(
    `admin/bookings?page=${page}&limit=10&bookingId=${id}`
  );
  return response;
};

export { getBookings, searchBookings };
