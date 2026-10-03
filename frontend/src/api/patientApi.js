import api from "./axios";

export const fetchPatients = (params) => api.get("/patients", { params });
export const fetchPatient = (id) => api.get(`/patients/${id}`);
export const fetchMyProfile = () => api.get("/patients/me");
export const createPatient = (payload) => api.post("/patients", payload);
export const updatePatient = (id, payload) => api.put(`/patients/${id}`, payload);
export const setPatientStatus = (id, isActive) =>
    api.patch(`/patients/${id}/status`, { isActive });