import { axiosInstance } from "../axiosInstance";
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipEncryption?: boolean;
  }
}

const getStaticPages = async (id: 1 | 2 | 3) => {
  const response = await axiosInstance.get(`admin/static-pages?id=${id}`, {
    skipEncryption: true,
  } as any);
  return response;
};

const updateStaticPageData = async (payload: unknown, id: string | number) => {
  const response = await axiosInstance.patch(`admin/static-pages`, payload, {
    skipEncryption: true,
  } as any);
  return response;
};

export { getStaticPages, updateStaticPageData };
