import { axiosInstance } from "../axiosInstance";

export const getArticles = async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get(`admin/content?type=article&page=${page}&limit=${limit}`);
    return response;
};

export const getArticleDetails = async (slug: string) => {
    const response = await axiosInstance.get(`admin/content/${slug}`);
    return response;
};

export const createArticle = async (payload: any) => {
    const response = await axiosInstance.post(`admin/content`, payload);
    return response;
};

export const updateArticle = async (id: string | number, payload: any) => {
    const response = await axiosInstance.patch(`admin/content/${id}`, payload);
    return response;
};

export const deleteArticle = async (id: string | number) => {
    const response = await axiosInstance.delete(`admin/content/${id}`);
    return response;
};

export const getArticleCategories = async () => {
    const response = await axiosInstance.get(`admin/article-categories`);
    return response;
};

export const createArticleCategory = async (payload: { name: string }) => {
    const response = await axiosInstance.post(`admin/article-categories`, payload);
    return response;
};