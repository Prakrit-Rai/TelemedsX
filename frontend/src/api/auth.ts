const API_URL = "http://localhost:8081/api/auth";

export const registerUser = async (user: any) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to register");
  }

  return response.json();
};

export const loginUser = async (user: any) => {

  const response = await fetch("http://localhost:8081/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};