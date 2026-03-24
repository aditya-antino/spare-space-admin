import { axiosInstance } from "../axiosInstance";

const getCancellationsData = async (page: number, search?: string) => {
  let url = `admin/host-cancelled-booking?page=${page}&limit=10`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await axiosInstance.get(url);
  return response;
};

export { getCancellationsData };
