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
    title: string;
    description: string;
    detailedDescription: string;
    // arrivalInstructions: string[];
    // customRules: string;
    images: {
      imageUrl: string;
      isFeatured: boolean;
    }[];
  }
) => {
  const response = await axiosInstance.patch(
    `admin/spaces/${id}/listing-images`,
    payload
  );
  return response;
};

export { getApprovalsList, approveProperty, updatePropertyDetails };
