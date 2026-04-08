import axios from "axios";

export const getNearbyPharmacies = (lat: number, lng: number) => {
  return axios.get("http://localhost:8081/api/pharmacies/nearby", {
    params: { lat, lng }
  });
};