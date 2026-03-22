import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await api.get("/entries");
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="trending">
      <h2>🔥 Top últimos 7 dias</h2>

      <div className="cards">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className="card"
            onClick={() => navigate(`/entry/${entry.id}`)}
          >
            <img src={entry.coverImage} alt={entry.title} />
            <p>{entry.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}