import api from "./axios";

export const fetchBills = (params) => api.get("/bills", { params });
export const fetchBillById = (id) => api.get(`/bills/${id}`);
export const createBill = (data) => api.post("/bills", data);
export const addBillPayment = (id, data) => api.patch(`/bills/${id}/pay`, data);
export const cancelBill = (id) => api.patch(`/bills/${id}/cancel`);