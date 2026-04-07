import axios from "axios";

const API = "http://localhost:8081/api/reminders";

export const getReminders = (userId: number) =>
  axios.get(`${API}/${userId}`);

export const createReminder = (data: any) =>
  axios.post(API, data);

export const deleteReminder = (id: number) =>
  axios.delete(`${API}/${id}`);

export const toggleReminder = (id: number) =>
  axios.put(`${API}/toggle/${id}`);