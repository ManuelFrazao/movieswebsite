import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  const [trendingData, setTrendingData] = useState({});

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/votes/trending");
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (!entries.length) return;

    const fetchTrending = async (entryId) => {
      try {
        const res = await api.get(`/votes/entry/${entryId}/trending`);

        setTrendingData((prev) => ({
          ...prev,
          [entryId]: res.data,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    entries.forEach((entry) => {
      fetchTrending(entry.id);
    });
  }, [entries]);

  // 🔥 dividir por tipo
  const movies = entries.filter((e) => e.type === "movie");
  const series = entries.filter((e) => e.type === "series");

  const sortedEntries = [...entries].sort(
    (a, b) => (b.topRank || 0) - (a.topRank || 0),
  );

  return (
    <div className="trending">
      {/* 🎬 MOVIES */}
      <Section
        title="🎬 Top Movies"
        entries={movies}
        navigate={navigate}
        trendingData={trendingData}
      />

      {/* 📺 SERIES */}
      <Section
        title="📺 Top Series"
        entries={series}
        navigate={navigate}
        trendingData={trendingData}
      />

      {/* 🔥 ALL */}
      <Section
        title="🔥 Top Overall"
        entries={sortedEntries}
        navigate={navigate}
        trendingData={trendingData}
      />
    </div>
  );
}

const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    days.push(d.toISOString().split("T")[0]);
  }

  return days;
};

/* 🔥 COMPONENTE REUTILIZÁVEL */
function Section({ title, entries, navigate, trendingData }) {
  function Graph({ data }) {
    const days = getLast7Days();

    const values = days.map((day) => data?.[day] || 0);

    const max = Math.max(...values, 1); // evitar divisão por 0

    if (!data || Object.keys(data).length === 0) {
      return <div className="graph-empty">No activity</div>;
    }

    return (
      <div className="graph">
        {values.map((v, i) => (
          <div
            key={i}
            className="bar-day"
            style={{
              height: `${(v / max) * 100}%`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="section">
      <h2>{title}</h2>

      <div className="table">
        {entries.slice(0, 10).map((entry, index) => {
          const score = entry.score || 0;

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
                  <div
                    className="fill"
                    style={{ width: `${Math.min(score * 10, 100)}%` }}
                  />
                </div>

                <span>
                  ⭐ {entry.avg} ({entry.totalVotes})
                </span>
                {entry.recentVotes > 0 && (
                  <span className="trend-badge">
                    🔥 +{entry.recentVotes} this week
                  </span>
                )}
              </div>
              <div className="graph">
                <Graph data={trendingData[entry.id]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
