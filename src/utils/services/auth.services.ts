import { axiosInstance } from "../axiosInstance";

const userSignIn = async (email: string, password: string) => {
  const response = await axiosInstance.post("/auth/admin-login", {
    email,
    password,
  });
  return response;
};

const updateAdminProfile = async (payload: unknown) => {
  const response = await axiosInstance.patch(`auth/admin/profile`, payload);
  return response;
};

const uploadImage = async (formData: FormData) => {
  const response = await axiosInstance.post(`auth/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export { userSignIn, updateAdminProfile, uploadImage };
