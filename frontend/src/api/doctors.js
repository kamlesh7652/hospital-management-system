import api from "./axios";

export const fetchDoctors = () => api.get("/doctors");
export const fetchDoctor = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (payload) => api.post("/doctors", payload);
export const updateDoctor = (id, payload) => api.put(`/doctors/${id}`, payload);
export const deactivateDoctor = (id) => api.delete(`/doctors/${id}`);