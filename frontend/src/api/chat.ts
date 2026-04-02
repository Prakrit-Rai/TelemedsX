import axios from "axios";

const API = "http://localhost:8081/api/chat";

export const getMessages = (appointmentId: number) =>
  axios.get(`${API}/${appointmentId}`);