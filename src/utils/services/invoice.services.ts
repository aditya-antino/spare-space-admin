import { axiosInstance } from "../axiosInstance";


const downloadInvoice = async (bookingId: number | string, roleId: string) => {
    const response = await axiosInstance.get(`invoice/${bookingId}?roleId=${roleId}`);
    return response;
};

const downloadInvoiceByType = async (
    bookingId: number | string,
    roleId: string,
    subType: 'guest_booking' | 'guest_platform',
) => {
    const response = await axiosInstance.get(
        `invoice/${bookingId}?roleId=${roleId}&subType=${subType}`,
    );
    return response;
};

export { downloadInvoice, downloadInvoiceByType };
