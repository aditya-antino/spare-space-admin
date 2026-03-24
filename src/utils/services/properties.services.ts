import { axiosInstance } from "../axiosInstance";

const getPropertiesList = async (
  page: number,
  city?: string,
  status?: string
) => {
  let query = `/admin/properties?page=${page}&limit=10`;

  if (city) query += `&city=${city}`;
  if (status) query += `&status=${status}`;

  const response = await axiosInstance.get(query);
  return response;
};

const searchProperties = async (
  page: number,
  searchVal: string,
  city?: string,
  status?: string
) => {
  let query = `/admin/properties?page=${page}&limit=10&search=${searchVal}`;

  if (city) query += `&city=${city}`;
  if (status) query += `&status=${status}`;

  const response = await axiosInstance.get(query);
  return response;
};

const getPropertyDetails = async (id: number) => {
  const response = await axiosInstance(`admin/properties/${id}`);
  return response;
};

const getCitites = async () => {
  const response = await axiosInstance(`auth/cities`);
  return response;
};

const resetApprovalStatus = async (id: number) => {
  const response = await axiosInstance.patch(
    `/admin/approval-space/${id}/reset-approval-status`
  );
  return response;
};

export {
  getPropertiesList,
  searchProperties,
  getPropertyDetails,
  getCitites,
  resetApprovalStatus,
};
