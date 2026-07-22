import { axiosInstance } from "../axiosInstance";

const getApprovalsList = async (page: number) => {
  const response = await axiosInstance.get(
    `admin/approval-spaces?page=${page}&limit=10`
  );
  return response;
};

const approveProperty = async (id: number | string) => {
  const response = await axiosInstance.patch(`admin/approval-space/${id}`);
  return response;
};

const updatePropertyDetails = async (
  id: number | string,
  payload: {
    title?: string;
    description?: string;
    detailedDescription?: string;
    // arrivalInstructions?: string[];
    // customRules?: string;
    images?: {
      imageUrl: string;
      isFeatured: boolean;
    }[];
    tagIds?: number[];
  }
) => {
  const response = await axiosInstance.patch(
    `admin/spaces/${id}/listing-images`,
    payload
  );
  return response;
};

//get space tag categories
const getSpaceTagCategories = async () => {
  const response = await axiosInstance.get(`admin/space-tag-categories`);
  return response;
};

//get all admin tags
const getAllAdminTags = async (params?: { page?: number; limit?: number; search?: string; status?: string; categoryId?: number }) => {
  const response = await axiosInstance.get(`admin/space-tags`, { params });
  return response;
};
//create admin tag
const createAdminTag = async (payload: { name: string; categoryId: number; status?: string }) => {
  const response = await axiosInstance.post(`admin/space-tags`, payload);
  return response;
};
//update admin tag
const updateAdminTag = async (id: number | string, payload: { name?: string; categoryId?: number; status?: string }) => {
  const response = await axiosInstance.put(`admin/space-tags/${id}`, payload);
  return response;
};
//toggle admin tag status
const toggleAdminTagStatus = async (id: number | string) => {
  const response = await axiosInstance.patch(`admin/space-tags/${id}/status`);
  return response;
};
//delete a tag
const deleteAdminTag = async (id: number | string) => {
  const response = await axiosInstance.delete(`admin/space-tags/${id}`);
  return response;
};

export {
  getApprovalsList,
  approveProperty,
  updatePropertyDetails,
  getSpaceTagCategories,
  getAllAdminTags,
  createAdminTag,
  updateAdminTag,
  toggleAdminTagStatus,
  deleteAdminTag,
};
