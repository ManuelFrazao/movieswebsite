import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
      <h2>🎬 MoviesWebsite</h2>

      <div>
        <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}