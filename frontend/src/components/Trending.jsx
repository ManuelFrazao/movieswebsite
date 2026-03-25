import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";
import RatingBadge from "../components/RatingBadge";
import { formatVotes } from "../utils/formatVotes";

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
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return; // 🔥 ignora
        }
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
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return; // 🔥 ignora
        }
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
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return; // 🔥 ignora
        }
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
  function Graph({ data, maxValue }) {
    const days = getLast7Days();

    const values = days.map((day) => data?.[day]?.count || 0);
    const avgs = days.map((day) => data?.[day]?.avg || 0);

    const max = maxValue || 1;

    const [hoverIndex, setHoverIndex] = useState(null);

    if (!data || Object.keys(data).length === 0) {
      return <div className="graph-empty">No activity</div>;
    }

    const width = 120;
    const height = 40;
    const stepX = width / (days.length - 1);

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - (v / max) * height;
      return { x, y, value: v };
    });

    // 🔥 smooth curve
    const smoothPath = (points) => {
      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;

        d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
      }

      const last = points[points.length - 1];
      d += ` T ${last.x} ${last.y}`;

      return d;
    };

    const linePath = smoothPath(points);

    const areaPath = `
    ${linePath}
    L ${width},${height}
    L 0,${height}
    Z
  `;

    return (
      <div className="graph-wrapper">
        <svg width={width} height={height}>
          {/* 🔥 gradient */}
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4caf50" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 🔥 área */}
          <path d={areaPath} fill="url(#miniGradient)" />

          {/* 🔥 linha */}
          <path d={linePath} fill="none" stroke="#4caf50" strokeWidth="2" />

          {/* 🔥 crosshair */}
          {hoverIndex !== null && (
            <line
              x1={points[hoverIndex].x}
              x2={points[hoverIndex].x}
              y1={0}
              y2={height}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="3"
            />
          )}

          {/* 🔥 pontos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4 : 2}
              fill="#4caf50"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </svg>

        {/* 🔥 TOOLTIP */}
        {hoverIndex !== null && (
          <div
            className="graph-tooltip"
            style={{
              left: `${points[hoverIndex].x}px`,
              top: `${points[hoverIndex].y}px`,
            }}
          >
            <div>
              {new Date(days[hoverIndex]).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <RatingBadge value={Number(avgs[hoverIndex]) || 0} />

            <div>
              <strong>{formatVotes(values[hoverIndex])}</strong> votes
            </div>
          </div>
        )}
      </div>
    );
  }
  const isNew = (releaseDate) => {
    if (!releaseDate) return false;

    const d = new Date(releaseDate);
    const now = new Date();

    const diffDays = (now - d) / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 30; // 🔥 filmes → 30 dias
  };

  const globalMax = Math.max(
    ...Object.values(trendingData).flatMap((entryData) =>
      Object.values(entryData).map((d) => d.count),
    ),
    1,
  );

  return (
    <div className="section">
      <h2>{title}</h2>

      <div className="table">
        {entries.slice(0, 10).map((entry, index) => {
          const score = entry.score || 0;

          const getLatestEpisodeDate = (entry) => {
            if (!entry.seasons) return null;

            const allEpisodes = entry.episodes || [];

            const dates = allEpisodes
              .map((ep) => ep.airDate)
              .filter(Boolean)
              .map((d) => new Date(d));

            if (!dates.length) return null;

            return new Date(Math.max(...dates));
          };

          const isSeries = entry.type === "series";

          const releaseDate =
            entry.type === "series"
              ? entry.firstEpisodeDate
              : entry.releaseDate;

          const isNewRelease = isNew(releaseDate);

          return (
            <div
              key={entry.id}
              className="row"
              onClick={() => navigate(`/entry/${entry.slug}`)}
            >
              <div className="rank">{index + 1}</div>
              {/*{isNewRelease && <span className="badge-new">NEW</span>}*/}

              <img src={entry.coverImage} alt={entry.title} />

              <div className="info">
                <h3>{entry.title}</h3>
                <p className="meta">{entry.type}</p>
              </div>
              <div className="score">
                {entry.totalVotes > 0 && Number(entry.avg) > 0 && (
                  <RatingBadge
                    value={Number(entry.avg)}
                    votes={formatVotes(entry.totalVotes)}
                  />
                )}
                {entry.recentVotes > 0 && (
                  <span className="trend-badge">
                    +{formatVotes(entry.recentVotes)} this week
                  </span>
                )}
              </div>
              <div className="graph">
                <Graph data={trendingData[entry.id]} maxValue={globalMax} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
