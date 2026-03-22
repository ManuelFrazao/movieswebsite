import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  const [newEntry, setNewEntry] = useState({
    title: "",
    type: "movie",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchEntries();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get("/entries");
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", newEntry.title);
      formData.append("type", newEntry.type);
      formData.append("description", newEntry.description);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/entries", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchEntries();

      setNewEntry({
        title: "",
        type: "movie",
        description: "",
      });

      setImageFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🎬 Admin</h2>

        <button onClick={() => setActiveTab("users")}>Users</button>
        <button onClick={() => setActiveTab("entries")}>Entries</button>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main */}
      <main className="main">
        <h1>Dashboard 👑</h1>

        {/* USERS */}
        {activeTab === "users" && (
          <div className="card">
            <h2>Users</h2>

            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ENTRIES */}
        {activeTab === "entries" && (
          <div className="card">
            <h2>Entries</h2>

            {/* CREATE FORM */}
            <form onSubmit={handleCreateEntry} className="form">
              <input
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
              />

              <select
                value={newEntry.type}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, type: e.target.value })
                }
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="anime">Anime</option>
              </select>

              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
              />

              <textarea
                placeholder="Description"
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, description: e.target.value })
                }
              />

              <button type="submit">Add Entry</button>
            </form>

            {/* LIST */}
            <div className="entries-list">
              {entries.map((entry) => (
                <div key={entry.id} className="entry-item">
                  <img src={entry.coverImage} alt="" />
                  <div>
                    <h3>{entry.title}</h3>
                    <p>{entry.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
