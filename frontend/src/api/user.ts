export const getUserById = (id: number) =>
  fetch(`http://localhost:8081/api/users/${id}`)
    .then(res => res.json());