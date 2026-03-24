import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkUser();

    window.addEventListener("storage", checkUser);

    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null); // 🔥 atualiza UI imediatamente
    navigate("/");
  };

  return (
    <nav
      style={{
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>🎬 MoviesWebsite</h2>

      <div>
        <Link to="/" style={{ marginRight: "10px" }}>
          Home
        </Link>

        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>👤 {user.username}</span>

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
