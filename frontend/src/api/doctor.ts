import axios from "axios";

const API = "http://localhost:8081/api/doctors";

export const getDoctors = async () => {
  return axios.get(API);
};