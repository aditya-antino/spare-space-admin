import { axiosInstance } from "../axiosInstance";

const getPropertyReviewList = async (
  page: number,
  searchVal: string | null
) => {
  let url = `admin/user-reviews?page=${page}&limit=10`;
  if (searchVal)
    url = `admin/user-reviews?page=${page}&limit=10&search=${searchVal}`;
  const response = await axiosInstance.get(url);
  return response;
};

const getUserReviewList = async (page: number, searchVal: string | null) => {
  let url = `admin/guest-reviews?page=${page}&limit=10`;
  if (searchVal)
    url = `admin/guest-reviews?page=1&limit=10&search=${searchVal}`;

  const response = axiosInstance.get(url);
  return response;
};

const deletePropertyReview = async (reviewId: number) => {
  const response = await axiosInstance.delete(`/admin/user-reviews/${reviewId}`);
  return response;
};

const deleteGuestReview = async (reviewId: number) => {
  const response = await axiosInstance.delete(`/admin/guest-reviews/${reviewId}`);
  return response;
};

export {
  getPropertyReviewList,
  getUserReviewList,
  deletePropertyReview,
  deleteGuestReview,
};
