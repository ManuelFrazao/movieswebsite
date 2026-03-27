import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";
import RatingBadge from "../components/RatingBadge";
import { formatVotes } from "../utils/formatVotes";

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const [trendingData, setTrendingData] = useState({});
  const navigate = useNavigate();

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        const res = await api.get("/votes/trending");

        if (!res.data.length) {
          const fallback = await api.get("/entries");
          setEntries(fallback.data);
        } else {
          setEntries(res.data);
        }
      } catch (err) {
        if (err.name === "CanceledError") return;
        console.error(err.response?.data || err.message);
      }
    };

    fetchData();
  }, []);

  // =====================
  // 🔥 FETCH MAIN DATA
  // =====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/votes/trending");

        if (!res.data.length) {
          const fallback = await api.get("/entries");
          setEntries(fallback.data);
        } else {
          setEntries(res.data);
        }
      } catch (err) {
        if (err.name === "CanceledError") return;
        console.error(err.response?.data || err.message);
      }
    };

    fetchData();
  }, []);

  // =====================
  // 🔥 FETCH GRAPH DATA
  // =====================
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
        if (err.name === "CanceledError") return;
        console.error(err.response?.data || err.message);
      }
    };

    entries.forEach((entry) => {
      if (!trendingData[entry.id]) {
        fetchTrending(entry.id); // 🔥 evita repetir
      }
    });
  }, [entries]);

  // =====================
  // 🔥 FILTERS
  // =====================
  const movies = entries.filter((e) => e.type === "movie");
  const series = entries.filter((e) => e.type === "series");

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
      <Section
        title="🎬 Top Movies"
        entries={movies}
        navigate={navigate}
        trendingData={trendingData}
      />
      <Section
        title="📺 Top Series"
        entries={series}
        navigate={navigate}
        trendingData={trendingData}
      />
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

//
// =====================
// 🔥 GRAPH COMPONENT (FORA → CORRETO)
// =====================
function Graph({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const days = getLast7Days();

  if (!data || Object.keys(data).length === 0) {
    return <div className="graph-empty">No activity</div>;
  }

  const values = days.map((day) => data?.[day]?.count || 0);
  const avgs = days.map((day) => data?.[day]?.avg || 0);

  const max = Math.max(...values, 1);

  const width = 120;
  const height = 40;
  const stepX = width / (days.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - (v / max) * height,
    value: v,
  }));

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
        <defs>
          <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4caf50" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#miniGradient)" />
        <path d={linePath} fill="none" stroke="#4caf50" strokeWidth="2" />

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

//
// =====================
// 🔥 SECTION
// =====================
function Section({ title, entries, navigate, trendingData }) {
  return (
    <div className="section">
      <h2>{title}</h2>

      <div className="table">
        {entries.slice(0, 10).map((entry, index) => (
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
              <Graph data={trendingData[entry.id]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
