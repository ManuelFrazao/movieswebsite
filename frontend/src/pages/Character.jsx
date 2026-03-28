import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";
import Navbar from "../components/Navbar";
import { formatVotes } from "../utils/formatVotes";
import EntryActions from "../components/EntryActions";

export default function Character() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [entryTrend, setEntryTrend] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/characters/slug/${slug}`);
        setEntry(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchEntry();
  }, [slug]);

  const fetchTrend = async (characterId) => {
    try {
      const res = await api.get(`/favorites/character/${characterId}/trending`);
      setEntryTrend(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchTrend(entry.id);
  }, [entry?.id]);

  const getLast7Days = () => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    return days;
  };

  function TrendGraph7days({ data }) {
    const days = getLast7Days();

    const counts = days.map((d) => data?.[d]?.count || 0);

    const max = Math.max(...counts, 1);

    const [hoverIndex, setHoverIndex] = useState(null);

    const width = 200;
    const height = 75;
    const stepX = width / (days.length - 1);

    const points = counts.map((v, i) => {
      const x = i * stepX;
      const y = height - (v / max) * height;
      return { x, y, value: v };
    });

    // 🔥 curva suave (quadratic bezier)
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
      <div
        className="trend-wrapper"
        style={{
          background: "transparent",
        }}
      >
        <svg width={width} height={height + 30}>
          {/* 🔥 gradient */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4caf50" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 🔥 área */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* 🔥 linha */}
          <path d={linePath} fill="none" stroke="#4caf50" strokeWidth="3" />

          {/* 🔥 crosshair */}
          {hoverIndex !== null && (
            <line
              x1={points[hoverIndex].x}
              x2={points[hoverIndex].x}
              y1={0}
              y2={height}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="4"
            />
          )}

          {/* 🔥 pontos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 6 : 3}
              fill="#4caf50"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* 🔥 dias */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#777"
            >
              {new Date(days[i]).getDate()}
            </text>
          ))}
        </svg>

        {/* 🔥 TOOLTIP */}
        {hoverIndex !== null && (
          <div
            className="trend-tooltip"
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

            <div>
              <strong>{formatVotes(counts[hoverIndex])}</strong> favorites
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!entry) return <p className="loading">Loading...</p>;

  return (
    <div className="entry">
      <Navbar />
      {/* HERO */}
      <div className="hero" style={{ backgroundImage: `url(${entry.image})` }}>
        <div className="hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-left"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
              />
            </svg>{" "}
            Back
          </button>

          <div className="hero-content">
            <h1>{entry.name}</h1>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "images" ? "active" : ""}
          onClick={() => setActiveTab("images")}
        >
          Images
        </button>

        <button
          className={activeTab === "forums" ? "active" : ""}
          onClick={() => setActiveTab("forums")}
        >
          Forums
        </button>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* 🔥 OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="movie-info">
              <div className="movie-info-content">
                <div className="movie-info-aside-left">
                  <img
                    width={240}
                    height={300}
                    src={entry.image}
                    alt=""
                    style={{
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <EntryActions
                    entityId={entry.id}
                    type="character"
                    isFavorite={entry.isFavorite}
                    favoritesCount={entry.favoritesCount}
                    onUpdate={(data) =>
                      setEntry((prev) => ({
                        ...prev,
                        ...data,
                      }))
                    }
                  />
                  {entryTrend && (
                    <>
                      <div className="movie-info-graphs">
                        <div className="entry-trend">
                          <TrendGraph7days data={entryTrend} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="movie-info-details">
                  {entry.description !== "" && (
                    <>
                      <h2>Biography</h2>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {entry.description}
                      </p>
                    </>
                  )}
                  {/* Appeared In */}
                  {entry.castRoles?.length > 0 && (
                    <div style={{ width: "100%"}}>
                      <h2>Appeared In</h2>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                        }}
                      >
                        {/* group by entry */}
                        {Object.values(
                          entry.castRoles.reduce((acc, role) => {
                            const entryId = role.entry?.id;
                            if (!entryId) return acc;
                            if (!acc[entryId])
                              acc[entryId] = { entry: role.entry, actors: [] };
                            if (role.actor)
                              acc[entryId].actors.push(role.actor);
                            return acc;
                          }, {}),
                        ).map(({ entry: e, actors }) => (
                          <div
                            key={e.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              background: "#1a1a1a",
                              borderRadius: "8px",
                              padding: "0.75rem",
                              cursor: "pointer",
                              marginBottom: "1rem"
                            }}
                            onClick={() => navigate(`/entry/${e.slug}`)}
                          >
                            <img
                              src={e.coverImage}
                              alt={e.title}
                              style={{
                                width: "60px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                            <div>
                              <p style={{ fontWeight: "bold", margin: 0 }}>
                                {e.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#aaa",
                                  margin: "0.25rem 0 0",
                                }}
                              >
                                {actors.length > 0
                                  ? `Played by: ${actors.map((a) => a.name).join(", ")}`
                                  : "Actor unknown"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="entry-contents">
                    <div className="entry-contents-card">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-images"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                        </svg>
                        <span>Images</span>
                      </div>
                    </div>
                    <div className="entry-contents-card">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-people"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg>
                        <span>Forums</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 🔥 Images */}
        {activeTab === "images" && (
          <div className="images">
            <p style={{ color: "#777" }}>Coming soon 👀</p>
          </div>
        )}

        {/* 🔥 Forums */}
        {activeTab === "forums" && (
          <div className="forums">
            <p style={{ color: "#777" }}>Coming soon 👀</p>
          </div>
        )}
      </div>
    </div>
  );
}
