import axios from "axios";

const API = "http://localhost:8081/api/appointments";   // ✔ correct backend port

const getToken = () => {
  return localStorage.getItem("token") || "";
};

export const bookAppointment = async (data: any) => {
  const token = getToken();

  return axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};

export const getAvailableSlots = (doctorId: number, date: string) => {
  return axios.get("http://localhost:8081/api/appointments/slots", {
    params: { doctorId, date }
  });
};

export const getPatientAppointments = async (patientId: number) => {
  const token = getToken();

  return axios.get(`${API}/patient/${patientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,  
    },
  });
};

export const getDoctorAppointments = (doctorId: number) => {
  return axios.get(`http://localhost:8081/api/appointments/doctor/${doctorId}`);
};

export const cancelAppointment = async (appointmentId: number) => {
  const token = getToken();

  return axios.put(`${API}/${appointmentId}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const completeAppointment = (appointmentId: number) => {
  const token = localStorage.getItem("token");

  return axios.put(`${API}/${appointmentId}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};