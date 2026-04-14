const API = "http://localhost:8081/api/admin";

export const getStats = async () => {
  const res = await fetch(`${API}/stats`);
  return res.json();
};

export const getPendingDoctors = async () => {
  const res = await fetch(`${API}/pending-doctors`);
  return res.json();
};

export const approveDoctor = async (id: number) => {
  return fetch(`${API}/approve/${id}`, {
    method: "PUT",
  });
};

export const deleteUser = async (id: number) => {
  return fetch(`${API}/delete/${id}`, {
    method: "DELETE",
  });
};