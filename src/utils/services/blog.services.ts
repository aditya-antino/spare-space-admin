import { axiosInstance } from "../axiosInstance";

export const getBlogs = async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get(`admin/content?type=blog&page=${page}&limit=${limit}`);
    return response;
};

export const getBlogDetails = async (slug: string) => {
    const response = await axiosInstance.get(`admin/content/${slug}`);
    return response;
};

export const createBlog = async (payload: any) => {
    const response = await axiosInstance.post(`admin/content`, payload);
    return response;
};

export const updateBlog = async (id: string | number, payload: any) => {
    const response = await axiosInstance.patch(`admin/content/${id}`, payload);
    return response;
};

export const deleteBlog = async (id: string | number) => {
    const response = await axiosInstance.delete(`admin/content/${id}`);
    return response;
};