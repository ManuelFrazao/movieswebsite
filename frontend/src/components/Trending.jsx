import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  const [trendingData, setTrendingData] = useState({});
  const [trendingEntries, setTrendingEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/votes/trending");

        // 🔥 se não houver trending → fallback para entries normais
        if (!res.data.length) {
          const fallback = await api.get("/entries");
          setEntries(fallback.data);
        } else {
          setEntries(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, entriesRes] = await Promise.all([
          api.get("/votes/trending"),
          api.get("/entries"),
        ]);

        setTrendingEntries(trendingRes.data);
        setAllEntries(entriesRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
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
  const movies = trendingEntries.filter((e) => e.type === "movie");
  const series = trendingEntries.filter((e) => e.type === "series");

  const sortedEntries = [...entries].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newEntries = entries.filter(
    (e) => new Date(e.createdAt) >= thirtyDaysAgo,
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

      <Section
        title="🆕 New Releases"
        entries={newEntries}
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

    // 🔥 usar count (votos)
    const values = days.map((day) => data?.[day]?.count || 0);

    const max = Math.max(...values, 1);

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
            title={`${v} votes`}
          />
        ))}
      </div>
    );
  }

  const isNew = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);

    return diffDays <= 14; // 2 semanas
  };

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
              {isNew(entry.createdAt) && <span className="badge-new">NEW</span>}

              <img src={entry.coverImage} alt={entry.title} />

              <div className="info">
                <h3>{entry.title}</h3>
                <p className="meta">{entry.type}</p>
              </div>
              <div className="score">
                {entry.totalVotes > 0 && entry.avg > 0 && (
                  <span>
                    ⭐ {entry.avg} ({entry.totalVotes})
                  </span>
                )}
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
