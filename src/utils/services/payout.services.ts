"http://localhost:5000/api/v1/admin/all-host-payout?search=shhdh&page=1&limit=10";

import { axiosInstance } from "../axiosInstance";

const getPayoutData = async (page: number, search?: string) => {
  let url = `admin/all-host-payout?&page=${page}&limit=10`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await axiosInstance.get(url);
  return response;
};

export { getPayoutData };
