import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Trending.css";
import RatingBadge from "../components/RatingBadge";
import { formatVotes } from "../utils/formatVotes";
import Navbar from "../components/Navbar";

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
  if (!data || Object.keys(data).length === 0)
    return <span style={{ color: "#333", fontSize: "0.7rem" }}>—</span>;

  const values = days.map((day) => data?.[day]?.count || 0);
  const avgs = days.map((day) => data?.[day]?.avg || 0);
  const max = Math.max(...values, 1);
  const width = 100;
  const height = 36;
  const stepX = width / (days.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - (v / max) * height,
    value: v,
  }));

  const smoothPath = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
    }
    d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    return d;
  };

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="graph-wrapper">
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4caf50" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#miniGrad)" />
        <path d={linePath} fill="none" stroke="#4caf50" strokeWidth="1.5" />
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
            })}
          </div>
          <RatingBadge value={Number(avgs[hoverIndex]) || 0} />
          <div>
            <strong>{formatVotes(values[hoverIndex])}</strong>{" "}
            {values[hoverIndex] === 1 ? "vote" : "votes"}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendTable({ entries, navigate, trendingData, prevRanks = {} }) {
  if (!entries.length) return <p style={{ color: "#555" }}>No data yet.</p>;

  function PositionChange({ entryId, currentRank, prevRanks }) {
    const prev = prevRanks[entryId];
    if (!prev || prev === currentRank)
      return (
        <span style={{ color: "#444", fontSize: "0.7rem", width: "28px" }}>
          —
        </span>
      );

    const diff = prev - currentRank; // positive = moved up
    return diff > 0 ? (
      <span style={{ color: "#4caf50", fontSize: "0.7rem", width: "28px" }}>
        ▲{diff}
      </span>
    ) : (
      <span style={{ color: "#e50914", fontSize: "0.7rem", width: "28px" }}>
        ▼{Math.abs(diff)}
      </span>
    );
  }

  return (
    <table className="trend-table">
      <thead>
        <tr>
          <th>#</th>
          <th style={{ width: "28px" }}></th>
          <th>Title</th>
          <th>Rating</th>
          <th>This week</th>
          <th className="graph-cell">7 days</th>
        </tr>
      </thead>
      <tbody>
        {entries.slice(0, 10).map((entry, index) => (
          <tr key={entry.id} onClick={() => navigate(`/entry/${entry.slug}`)}>
            <td className={`rank-cell ${index < 3 ? "top3" : ""}`}>
              {index + 1}
            </td>
            <td>
              <PositionChange
                entryId={entry.id}
                currentRank={index + 1}
                prevRanks={prevRanks}
              />
            </td>
            <td className="cover-cell">
              <img src={entry.coverImage} alt={entry.title} />
            </td>
            <td className="title-cell">
              <h3>{entry.title}</h3>
              <p>{entry.type}</p>
            </td>
            <td className="score-cell">
              {entry.totalVotes > 0 && Number(entry.avg) > 0 ? (
                <RatingBadge
                  value={Number(entry.avg)}
                  votes={formatVotes(entry.totalVotes)}
                />
              ) : (
                <span style={{ color: "#444", fontSize: "0.75rem" }}>—</span>
              )}
            </td>
            <td className="trend-cell">
              {entry.recentVotes > 0
                ? `+${formatVotes(entry.recentVotes)}`
                : "—"}
            </td>
            <td className="graph-cell">
              <Graph data={trendingData[entry.id]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Add this function before the Trending component
const getPreviousRanks = () => {
  try {
    return JSON.parse(localStorage.getItem("trendingRanks") || "{}");
  } catch {
    return {};
  }
};

const saveCurrentRanks = (entries) => {
  const ranks = {};
  entries.forEach((e, i) => {
    ranks[e.id] = i + 1;
  });
  localStorage.setItem("trendingRanks", JSON.stringify(ranks));
};

export default function Trending() {
  const [entries, setEntries] = useState([]);
  const [trendingData, setTrendingData] = useState({});
  const navigate = useNavigate();
  const [prevRanks, setPrevRanks] = useState({});

  useEffect(() => {
    if (!entries.length) return;
    setPrevRanks(getPreviousRanks());
    saveCurrentRanks(entries);
  }, [entries]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/votes/trending");
        setEntries(
          res.data.length ? res.data : (await api.get("/entries")).data,
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!entries.length) return;
    entries.forEach((entry) => {
      if (!trendingData[entry.id]) {
        api
          .get(`/votes/entry/${entry.id}/trending`)
          .then((res) =>
            setTrendingData((prev) => ({ ...prev, [entry.id]: res.data })),
          )
          .catch(() => {});
      }
    });
  }, [entries]);

  const movies = entries.filter((e) => e.type === "movie");
  const series = entries.filter((e) => e.type === "series");
  const sorted = [...entries].sort((a, b) => (b.score || 0) - (a.score || 0));
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newEntries = entries.filter(
    (e) => new Date(e.createdAt) >= thirtyDaysAgo,
  );

  return (
    <div>
      <div className="trending">
        <h1>📊 Trending</h1>

        <div className="section">
          <h2>🎬 Top Movies</h2>
          <TrendTable
            entries={movies}
            navigate={navigate}
            trendingData={trendingData}
          />
        </div>

        <div className="section">
          <h2>📺 Top Series</h2>
          <TrendTable
            entries={series}
            navigate={navigate}
            trendingData={trendingData}
          />
        </div>

        <div className="section">
          <h2>🔥 Top Overall</h2>
          <TrendTable
            entries={sorted}
            navigate={navigate}
            trendingData={trendingData}
          />
        </div>

        <div className="section">
          <h2>🆕 New Releases</h2>
          <TrendTable
            entries={newEntries}
            navigate={navigate}
            trendingData={trendingData}
          />
        </div>
      </div>
    </div>
  );
}
