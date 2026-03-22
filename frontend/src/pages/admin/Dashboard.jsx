import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard 👑</h1>

      <h2>Users</h2>

      {users.map((user) => (
        <div key={user.id}>
          <p>{user.email} - {user.role}</p>
        </div>
      ))}
    </div>
  );
}