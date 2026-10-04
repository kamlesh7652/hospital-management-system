import api from "./axios";

export const fetchMedicines = (params) => api.get("/medicines", { params });
export const fetchMedicineById = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (data) => api.post("/medicines", data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const updateMedicineStock = (id, quantity) => api.patch(`/medicines/${id}/stock`, { quantity });
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);