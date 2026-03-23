import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchEntries = async () => {
      try {
        const res = await api.get("/entries", {
          signal: controller.signal,
        });
        setEntries(res.data);
      } catch (err) {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;

        console.error(err);
      }
    };

    fetchEntries();

    return () => controller.abort(); // 🔥 cleanup
  }, []);

  // 🔥 dividir por tipo
  const movies = entries.filter((e) => e.type === "movie");
  const series = entries.filter((e) => e.type === "series");

  const sortedEntries = [...entries].sort(
  (a, b) => (b.topRank || 0) - (a.topRank || 0)
);

  return (
    <div className="trending">
      {/* 🎬 MOVIES */}
      <Section title="🎬 Top Movies" entries={movies} navigate={navigate} />

      {/* 📺 SERIES */}
      <Section title="📺 Top Series" entries={series} navigate={navigate} />

      {/* 🔥 ALL */}
      <Section title="🔥 Top Overall" entries={sortedEntries} navigate={navigate} />
    </div>
  );
}

/* 🔥 COMPONENTE REUTILIZÁVEL */
function Section({ title, entries, navigate }) {
  return (
    <div className="section">
      <h2>{title}</h2>

      <div className="table">
        {entries.slice(0, 10).map((entry, index) => {
          const score = entries.topRank || 50;

          return (
            <div
              key={entry.id}
              className="row"
              onClick={() => navigate(`/entry/${entry.slug}`)}
            >
              <div className="rank">{index + 1}</div>

              <img src={entry.coverImage} alt={entry.title} />

              <div className="info">
                <h3>{entry.title}</h3>
                <p className="meta">{entry.type}</p>
              </div>

              <div className="score">
                <div className="bar">
                  <div className="fill" style={{ width: `${score}%` }} />
                  <span>{score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
