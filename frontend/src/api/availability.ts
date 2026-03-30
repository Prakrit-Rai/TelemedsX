import axios from "axios";

const BASE_URL = "http://localhost:8081/api/availability";

export const addAvailability = (data: any) => {
  return axios.post(BASE_URL, data);
};

export const getDoctorAvailability = (doctorId: number) => {
  return axios.get(`${BASE_URL}/${doctorId}`);
};

export const deleteAvailability = (id: number) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const toggleAvailability = (id: number) => {
  return axios.put(`${BASE_URL}/${id}/toggle`);
};