import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";
import RatingBadge from "../components/RatingBadge";
import Navbar from "../components/Navbar";

export default function Entry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [episodeStats, setEpisodeStats] = useState({});
  const [ratingModal, setRatingModal] = useState({
    open: false,
    episodeId: null,
    entryId: null,
  });
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [entryTrend, setEntryTrend] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [openSeason, setOpenSeason] = useState(null);
  const [episodeTrends, setEpisodeTrends] = useState({});
  const [episodeDistribution, setEpisodeDistribution] = useState({});
  const [hoveredEpisode, setHoveredEpisode] = useState(null);
  const [entryDistribution, setEntryDistribution] = useState(null);
  const [hoverEntry, setHoverEntry] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const fetchEntryDistribution = async () => {
    if (entryDistribution) return;

    try {
      const res = await api.get(`/votes/entry/${entry.id}/distribution`);
      setEntryDistribution(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;

    fetchEntryDistribution();
  }, [entry]);

  const fetchDistribution = async (episodeId, force = false) => {
    if (!force && episodeDistribution[episodeId]) return;

    try {
      const res = await api.get(`/votes/episode/${episodeId}/distribution`);

      setEpisodeDistribution((prev) => ({
        ...prev,
        [episodeId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/entries/slug/${slug}`);
        setEntry(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEntry();
  }, [slug]);

  console.log(entry);

  const fetchEpisodeStats = async (episodeId) => {
    try {
      const res = await api.get(`/votes/episode/${episodeId}/stats`);

      setEpisodeStats((prev) => ({
        ...prev,
        [episodeId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEpisodeTrends = async (entryId) => {
    try {
      const res = await api.get(`/votes/entry/${entryId}/episodes-trending`);
      setEpisodeTrends(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchEpisodeTrends(entry.id);
  }, [entry]);

  useEffect(() => {
    if (!entry?.seasons) return;

    entry.seasons.forEach((season) => {
      season.episodes?.forEach((ep) => {
        fetchEpisodeStats(ep.id);
        fetchDistribution(ep.id);
      });
    });
  }, [entry]);

  const fetchTrend = async (entryId) => {
    try {
      const res = await api.get(`/votes/entry/${entryId}/trending`);
      setEntryTrend(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchTrend(entry.id);
  }, [entry]);

  if (!entry) return <p className="loading">Loading...</p>;

  const isSeries = entry.type === "series";

  const formatDuration = (minutes) => {
    if (!minutes) return null;

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatDate = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFirstAirYear = (seasons) => {
    if (!seasons) return null;

    const allEpisodes = seasons.flatMap((s) => s.episodes || []);

    if (allEpisodes.length === 0) return null;

    const dates = allEpisodes
      .map((ep) => ep.airDate)
      .filter(Boolean)
      .map((d) => new Date(d));

    if (dates.length === 0) return null;

    const firstDate = new Date(Math.min(...dates));

    return firstDate.getFullYear();
  };

  const getTotalDuration = (seasons) => {
    if (!seasons) return 0;

    const totalMinutes = seasons
      .flatMap((s) => s.episodes || [])
      .reduce((sum, ep) => sum + (ep.duration || 0), 0);

    return totalMinutes;
  };

  const getAverageDuration = (seasons) => {
    if (!seasons) return 0;

    const episodes = seasons.flatMap((s) => s.episodes || []);

    if (episodes.length === 0) return 0;

    const totalMinutes = episodes.reduce(
      (sum, ep) => sum + (ep.duration || 0),
      0,
    );

    return Math.round(totalMinutes / episodes.length);
  };

  const formatTotalDuration = (minutes) => {
    if (!minutes) return null;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const totalSeasons = entry.seasons?.length || 0;

  const totalEpisodes =
    entry.seasons?.reduce((sum, s) => sum + (s.episodes?.length || 0), 0) || 0;

  const firstYear = getFirstAirYear(entry.seasons);
  const endingYear = entry.endingYear;
  const totalDuration = getTotalDuration(entry.seasons);
  const avgDuration = getAverageDuration(entry.seasons);

  const formatYears = (start, end) => {
    if (!start) return null;

    if (!end || start === end) return start;

    return `${start}–${end}`;
  };

  const seasonLabel = totalSeasons === 1 ? "Season" : "Seasons";
  const episodeLabel = totalEpisodes === 1 ? "Episode" : "Episodes";

  const handleVote = async () => {
    try {
      if (ratingModal.episodeId) {
        await api.post("/votes", {
          value: selectedRating,
          type: "episode",
          episodeId: ratingModal.episodeId,
        });

        // 🔥 UPDATE LOCAL
        fetchEpisodeStats(ratingModal.episodeId);

        // 🔥 UPDATE GRÁFICOS
        fetchEpisodeTrends(entry.id);
        fetchTrend(entry.id);

        // opcional (se usares distribution no graph)
        setEpisodeDistribution((prev) => {
          const copy = { ...prev };
          //delete copy[ratingModal.episodeId];
          return copy;
        });

        fetchDistribution(ratingModal.episodeId, true);
      }

      if (ratingModal.entryId) {
        await api.post("/votes", {
          value: selectedRating,
          type: "entry",
          entryId: ratingModal.entryId,
        });

        fetchTrend(ratingModal.entryId);

        // 🔥 refresh distribution
        setEntryDistribution(null);
        fetchEntryDistribution();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRatingColor = (value) => {
    if (value <= 3) return "#e50914"; // 🔴 péssimo
    if (value <= 5) return "#ff7043"; // laranja/vermelho
    if (value <= 7) return "#ff9800"; // 🟠 médio
    if (value <= 8.5) return "#8bc34a"; // verde claro
    return "#4caf50"; // 🟢 excelente
  };

  const canRateEpisode = (airDate) => {
    if (!airDate) return false;

    const today = new Date();
    const releaseDate = new Date(airDate);

    return releaseDate <= today;
  };

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
  };

  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
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

  const getLast30Days = () => {
    const days = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      days.push(d.toISOString().split("T")[0]);
    }

    return days;
  };

  const getEpisodeWeeklyVotes = (episodeId) => {
    const data = episodeTrends[episodeId];
    if (!data) return 0;

    return Object.values(data).reduce((sum, day) => {
      return sum + (day.count || 0);
    }, 0);
  };

  function RatingOverlay({ data }) {
    const max = Math.max(...Object.values(data), 1);

    return (
      <div className="overlay-box">
        <h4>Rating Distribution</h4>

        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => {
          const count = data[n] || 0;
          const width = (count / max) * 100;

          return (
            <div key={n} className="dist-row">
              <span>{n}</span>
              <div className="bar">
                <div
                  className="fill"
                  style={{
                    width: `${width}%`,
                    background: getRatingColor(n),
                  }}
                />
              </div>
              <span>{count}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function RatingDistribution({ data }) {
    if (!data) return null;

    const max = Math.max(...Object.values(data), 1);

    return (
      <div style={{ width: "200px" }}>
        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
          <div
            key={num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              marginBottom: "2px",
            }}
          >
            <span style={{ width: "20px" }}>{num}</span>

            <div
              style={{
                flex: 1,
                height: "6px",
                background: "#222",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(data[num] / max) * 100}%`,
                  height: "100%",
                  background:
                    num >= 8 ? "#4caf50" : num >= 5 ? "#ff9800" : "#e50914",
                }}
              />
            </div>

            <span style={{ width: "20px", textAlign: "right" }}>
              {data[num]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  function RatingDistributionEpisode({ data }) {
    if (!data) return null;

    const max = Math.max(...Object.values(data), 1);
    const containerHeight = 80; // 🔥 altura real das barras

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          height: "120px",
          padding: "0 20px",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const value = data[num] || 0;

          const barHeight = (value / max) * containerHeight;

          const color = num >= 8 ? "#4caf50" : num >= 5 ? "#ff9800" : "#e50914";

          return (
            <div
              key={num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "15px",
                height: "100%",
              }}
            >
              {/* valor */}
              <span style={{ fontSize: "0.5rem", marginBottom: "4px" }}>
                {value > 0 && <>{value}</>}
              </span>

              {/* barra */}
              <div
                style={{
                  width: "100%",
                  height: `${barHeight}px`,
                  background: color,
                  borderRadius: "4px",
                  transition: "0.3s",
                }}
              />

              {/* label */}
              <span style={{ fontSize: "10px", marginTop: "4px" }}>{num}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function RatingDistributionEntry({ data }) {
    if (!data) return null;

    const isMobile = useIsMobile();
    const max = Math.max(...Object.values(data), 1);
    const containerHeight = 80; // 🔥 altura real das barras

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          height: "120px",
          padding: "0 20px",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const value = data[num] || 0;

          const barHeight = (value / max) * containerHeight;

          const color = num >= 8 ? "#4caf50" : num >= 5 ? "#ff9800" : "#e50914";

          return (
            <div
              key={num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                width: isMobile ? "11px" : "66px",
                height: "100%",
              }}
            >
              {/* valor */}
              <span style={{ fontSize: "10px", marginBottom: "4px" }}>
                {value > 0 && <>{value}</>}
              </span>

              {/* barra */}
              <div
                style={{
                  width: "100%",
                  height: `${barHeight}px`, // 🔥 AGORA FUNCIONA
                  background: color,
                  borderRadius: "4px",
                  transition: "0.3s",
                }}
              />

              {/* label */}
              <span style={{ fontSize: "10px", marginTop: "4px" }}>{num}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function RatingDistributionEntrySmall({ data }) {
    if (!data) return null;
    const max = Math.max(...Object.values(data), 1);
    const containerHeight = 80; // 🔥 altura real das barras

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",
          height: "120px",
          padding: "0 20px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const value = data[num] || 0;

          const barHeight = (value / max) * containerHeight;

          const color = num >= 8 ? "#4caf50" : num >= 5 ? "#ff9800" : "#e50914";

          return (
            <div
              key={num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "11px",
                height: "100%",
              }}
            >
              {/* valor */}
              <span style={{ fontSize: "10px", marginBottom: "4px" }}>
                {value > 0 && <>{value}</>}
              </span>

              {/* barra */}
              <div
                style={{
                  width: "100%",
                  height: `${barHeight}px`, // 🔥 AGORA FUNCIONA
                  background: color,
                  borderRadius: "4px",
                  transition: "0.3s",
                }}
              />

              {/* label */}
              <span style={{ fontSize: "10px", marginTop: "4px" }}>{num}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function TrendGraph({ data }) {
    const isMobile = useIsMobile();
    const days = isMobile ? getLast7Days() : getLast30Days();

    const counts = days.map((d) => data?.[d]?.count || 0);
    const avgs = days.map((d) => data?.[d]?.avg || 0);

    const max = Math.max(...counts, 1);

    const [hoverIndex, setHoverIndex] = useState(null);

    const width = isMobile ? 200 : days.length * 25;
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

            <RatingBadge value={avgs[hoverIndex]} />

            <div>
              <strong>{counts[hoverIndex]}</strong> votes
            </div>
          </div>
        )}
      </div>
    );
  }

  function TrendGraph7days({ data }) {
    const days = getLast7Days();

    const counts = days.map((d) => data?.[d]?.count || 0);
    const avgs = days.map((d) => data?.[d]?.avg || 0);

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

            <RatingBadge value={avgs[hoverIndex]} />

            <div>
              <strong>{counts[hoverIndex]}</strong> votes
            </div>
          </div>
        )}
      </div>
    );
  }

  function TrendGraphEpisode({ data }) {
    const isMobile = useIsMobile();
    const days = getLast7Days();

    const counts = days.map((d) => data?.[d]?.count || 0);
    const avgs = days.map((d) => data?.[d]?.avg || 0);

    const max = Math.max(...counts, 1);

    const [hoverIndex, setHoverIndex] = useState(null);

    const width = 240;
    const height = 50;
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

            <RatingBadge value={avgs[hoverIndex]} />

            <div>
              <strong>{counts[hoverIndex]}</strong> votes
            </div>
          </div>
        )}
      </div>
    );
  }

  function EpisodeRatingGraph({ entry, episodeStats }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const screenWidth = useWindowWidth();

    const isSmall = screenWidth < 900;

    if (!entry?.seasons) return null;

    // 🔥 flatten episódios
    const episodes = entry.seasons.flatMap(
      (s) =>
        (s.episodes || [])
          .map((ep) => {
            const stats = episodeStats[ep.id] || {};
            const rating = Number(stats.averageRating);

            return {
              ...ep,
              seasonNumber: s.seasonNumber,
              rating,
              votes: stats.totalVotes || 0,
            };
          })
          .filter((ep) => ep.rating > 0), // 🔥 FILTRO AQUI
    );

    if (!episodes.length) return null;

    const spacing = isSmall ? 25 : 40;
    const width = episodes.length * spacing;
    const height = 200;

    const stepX = width / (episodes.length - 1);

    const points = episodes.map((ep, i) => {
      const x = i * stepX;
      const y = height - (ep.rating / 10) * height;

      return {
        x,
        y,
        rating: ep.rating,
        title: ep.title,
        votes: ep.votes,
        epNumber: ep.number,
        season: ep.seasonNumber,
      };
    });

    return (
      <div className="episode-graph-wrapper">
        <svg
          width={width}
          height={height + 30}
          style={{
            paddingLeft: "1rem",
          }}
        >
          {/* eixo base */}
          <line x1={0} x2={width} y1={height} y2={height} stroke="#333" />

          {/* linhas horizontais (ratings) */}
          {[2, 4, 6, 8, 10].map((r) => {
            const y = height - (r / 10) * height;

            return (
              <g key={r}>
                <line
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                />
                <text
                  x={-5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#777"
                >
                  {r}
                </text>
              </g>
            );
          })}

          {/* 🔥 pontos */}
          {points.map((p, i) => {
            let color = "#e50914";
            if (p.rating > 6) color = "#4caf50";
            else if (p.rating > 3) color = "#ff9800";

            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 7 : 4}
                fill={color}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>

        {/* 🔥 TOOLTIP */}
        {hoverIndex !== null && (
          <div
            className="episode-tooltip"
            style={{
              left: `${points[hoverIndex].x}px`,
              top: `${points[hoverIndex].y}px`,
            }}
          >
            <div>
              S{points[hoverIndex].season}E{points[hoverIndex].epNumber}
            </div>

            <div style={{ fontWeight: "bold" }}>{points[hoverIndex].title}</div>

            <RatingBadge value={points[hoverIndex].rating} />

            <div>
              <strong>{points[hoverIndex].votes}</strong> votes
            </div>
          </div>
        )}
      </div>
    );
  }

  function EpisodeVotesGraph({ entry, episodeStats }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const screenWidth = useWindowWidth();

    const isSmall = screenWidth < 900;

    if (!entry?.seasons) return null;

    const episodes = entry.seasons.flatMap((s) =>
      (s.episodes || [])
        .map((ep) => {
          const stats = episodeStats[ep.id] || {};
          return {
            ...ep,
            seasonNumber: s.seasonNumber,
            votes: stats.totalVotes || 0,
            rating: Number(stats.averageRating) || 0,
          };
        })
        .filter((ep) => ep.votes > 0),
    );

    if (!episodes.length) {
      return <div style={{ color: "#777" }}>No votes yet</div>;
    }

    const spacing = isSmall ? 25 : 40;
    const width = episodes.length * spacing;
    const height = 200;

    const maxVotes = Math.max(...episodes.map((e) => e.votes), 1);

    const stepX = width / (episodes.length - 1);

    const points = episodes.map((ep, i) => {
      const x = i * stepX;
      const y = height - (ep.votes / maxVotes) * height;

      return {
        x,
        y,
        votes: ep.votes,
        rating: ep.rating,
        title: ep.title,
        epNumber: ep.number,
        season: ep.seasonNumber,
      };
    });

    // 🔥 escala suave
    const steps = 5;
    const stepValue = maxVotes / steps;

    return (
      <div className="episode-graph-wrapper">
        <svg width={width} height={height + 30} style={{ paddingLeft: "1rem" }}>
          {/* base */}
          <line x1={0} x2={width} y1={height} y2={height} stroke="#333" />

          {/* 🔥 linhas horizontais FIXED */}
          {Array.from({ length: steps + 1 }).map((_, i) => {
            const rawValue = i * stepValue;

            // 🔥 evita overflow
            const value = Math.min(rawValue, maxVotes);

            const y = height - (value / maxVotes) * height;

            return (
              <g key={i}>
                <line
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                />
                <text
                  x={-5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#777"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* 🔥 pontos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 7 : 4}
              fill="#639ef7"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{
                cursor: "pointer",
                transition: "0.2s", // 🔥 animação suave
              }}
            />
          ))}
        </svg>

        {/* 🔥 tooltip */}
        {hoverIndex !== null && (
          <div
            className="episode-tooltip"
            style={{
              left: `${points[hoverIndex].x}px`,
              top: `${points[hoverIndex].y}px`,
            }}
          >
            <div>
              S{points[hoverIndex].season}E{points[hoverIndex].epNumber}
            </div>

            <div style={{ fontWeight: "bold" }}>{points[hoverIndex].title}</div>

            <div>
              <strong>{points[hoverIndex].votes}</strong> votes
            </div>

            <RatingBadge value={points[hoverIndex].rating} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="entry">
      <Navbar />
      {/* HERO */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${entry.coverImage})` }}
      >
        <div className="hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-left"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
              />
            </svg>{" "}
            Back
          </button>

          <div className="hero-content">
            <h1>{entry.title}</h1>

            <div className="meta">
              <span
                style={{
                  textTransform: "capitalize",
                }}
              >
                {entry.type}
              </span>

              {firstYear && (
                <>
                  <span>•</span>
                  <span>
                    {formatYears(firstYear, endingYear)}
                    {!endingYear && <span className="ongoing"> (Ongoing)</span>}
                  </span>
                </>
              )}

              {totalSeasons > 0 && <span>•</span>}
              {totalSeasons > 0 && (
                <span>
                  {totalSeasons} {seasonLabel}
                </span>
              )}

              {totalEpisodes > 0 && <span>•</span>}
              {totalEpisodes > 0 && (
                <span>
                  {totalEpisodes} {episodeLabel}
                </span>
              )}

              {/* 🔥 SERIES */}
              {isSeries && avgDuration > 0 && (
                <>
                  <span>•</span>
                  <span>{formatDuration(avgDuration)}</span>
                </>
              )}

              {/* 🔥 MOVIE */}
              {!isSeries && entry.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(entry.duration)}</span>
                </>
              )}

              {/* 🔥 MOVIE RELEASE DATE */}
              {!isSeries && entry.releaseDate && (
                <>
                  <span>•</span>
                  <span>{formatDate(entry.releaseDate)}</span>
                </>
              )}
            </div>
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

        {isSeries && (
          <button
            className={activeTab === "episodes" ? "active" : ""}
            onClick={() => setActiveTab("episodes")}
          >
            Episodes
          </button>
        )}

        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>

        <button
          className={activeTab === "statistics" ? "active" : ""}
          onClick={() => setActiveTab("statistics")}
        >
          Statistics
        </button>

        <button
          className={activeTab === "cast" ? "active" : ""}
          onClick={() => setActiveTab("cast")}
        >
          Cast
        </button>
        <button
          className={activeTab === "characters" ? "active" : ""}
          onClick={() => setActiveTab("characters")}
        >
          Characters
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
                    width={180}
                    src={entry.coverImage}
                    alt=""
                    style={{
                      borderRadius: "8px",
                    }}
                  />
                  <div className="actions">
                    <button className="secondary-btn">+ Add to list</button>
                  </div>
                  {entry.totalVotes != 0 && (
                    <>
                      <div className="movie-info-graphs">
                        <div className="entry-trend">
                          <TrendGraph7days data={entryTrend} />
                        </div>
                        {entryDistribution && (
                          <div className="entry-trend">
                            <RatingDistributionEntrySmall
                              data={entryDistribution}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="movie-info-details">
                  <h2>Synopsis</h2>
                  <p
                    style={{
                      fontSize: "0.85rem",
                    }}
                  >
                    {entry.description}
                  </p>
                  <>
                    <div className="movie-info-rating">
                      <div
                        onMouseEnter={(e) => {
                          setHoverEntry(true);
                          setHoverPosition({ x: e.clientX, y: e.clientY });
                          fetchEntryDistribution();
                        }}
                        onMouseLeave={() => setHoverEntry(false)}
                        style={{ display: "inline-block" }}
                      >
                        <RatingBadge
                          value={entry.topRank / 10}
                          votes={entry.totalVotes}
                          size="large"
                        />
                      </div>
                      {entry.type === "movie" &&
                        entry.releaseDate &&
                        new Date(entry.releaseDate) <= new Date() && (
                          <button
                            className="rate-btn"
                            onClick={() =>
                              setRatingModal({
                                open: true,
                                entryId: entry.id, // ✅ correto
                                episodeId: null,
                              })
                            }
                            style={{ color: "#639ef7" }}
                          >
                            Rate
                          </button>
                        )}
                    </div>
                  </>
                  <div className="entry-contents">
                    <div className="entry-contents-card">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-camera-video"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
                        />
                      </svg>
                      Videos
                    </div>
                    <div className="entry-contents-card">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-images"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                      </svg>
                      Images
                    </div>
                    <div className="entry-contents-card">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pencil-square"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path
                          fill-rule="evenodd"
                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                        />
                      </svg>
                      Reviews
                    </div>
                  </div>
                  <div className="entry-cast">
                    <div className="entry-cast-top">
                      <h2>Cast</h2>
                      <span onClick={() => setActiveTab("cast")}>see more</span>
                    </div>
                    <div className="entry-cast-list">
                      <div className="entry-cast-top">
                        <h2>Characters</h2>
                        <span onClick={() => setActiveTab("characters")}>
                          see more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 👉 SE FOR SÉRIE */}
        {activeTab === "episodes" && isSeries && (
          <>
            {isSeries &&
              entry.seasons?.map((season) => (
                <div key={season.id} className="season">
                  <div
                    className="season-header"
                    onClick={() =>
                      setOpenSeason(openSeason === season.id ? null : season.id)
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <h2
                        style={{
                          color: "#ccc",
                          fontWeight: "bold",
                        }}
                      >
                        Season {season.seasonNumber}
                      </h2>

                      <span className="season-sub">
                        {season.episodes?.length} episodes
                      </span>
                    </div>

                    <span className="season-toggle">
                      {openSeason === season.id ? "▲" : "▼"}
                    </span>
                  </div>

                  {openSeason === season.id && (
                    <div className="episodes">
                      {season.episodes?.map((ep) => (
                        <div key={ep.id} className="episode-row">
                          <div className="episode-number">{ep.number}.</div>
                          <img src={ep.thumbnail} alt={ep.title} />

                          <div className="episode-info">
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                <h3>{ep.title}</h3>
                              </div>

                              <div className="episode-meta">
                                {ep.airDate && (
                                  <span>{formatDate(ep.airDate)}</span>
                                )}
                                {ep.airDate && ep.duration && <span>•</span>}
                                {ep.duration && (
                                  <span>{formatDuration(ep.duration)}</span>
                                )}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  fontSize: "0.8rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {episodeStats[ep.id]?.averageRating > 0 && (
                                  <span
                                    style={{
                                      marginRight: "10px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <div
                                      onMouseEnter={(e) => {
                                        setHoveredEpisode(ep.id);
                                        setHoverPosition({
                                          x: e.clientX,
                                          y: e.clientY,
                                        });
                                        fetchDistribution(ep.id);
                                      }}
                                      onMouseLeave={() =>
                                        setHoveredEpisode(null)
                                      }
                                      style={{ display: "inline-block" }}
                                    >
                                      <RatingBadge
                                        value={
                                          episodeStats[ep.id].averageRating
                                        }
                                        votes={episodeStats[ep.id].totalVotes}
                                      />
                                    </div>

                                    {getEpisodeWeeklyVotes(ep.id) > 0 && (
                                      <span
                                        style={{
                                          color: "#c7c7c7",
                                          fontSize: "0.65rem",
                                        }}
                                      >
                                        ( +{getEpisodeWeeklyVotes(ep.id)} this
                                        week )
                                      </span>
                                    )}
                                  </span>
                                )}

                                {canRateEpisode(ep.airDate) && (
                                  <button
                                    className="rate-btn"
                                    onClick={() =>
                                      setRatingModal({
                                        open: true,
                                        episodeId: ep.id,
                                      })
                                    }
                                    style={{
                                      color: "#639ef7",
                                    }}
                                  >
                                    {userRatings[ep.id]
                                      ? `Your rating: ${userRatings[ep.id]}`
                                      : "Rate"}
                                  </button>
                                )}
                                {ep.isFinal && (
                                  <span className="final-badge">FINAL</span>
                                )}
                              </div>

                              <p
                                style={{
                                  textAlign: "start",
                                }}
                              >
                                {ep.description}
                              </p>
                            </div>

                            {episodeTrends[ep.id] && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <TrendGraphEpisode
                                  data={episodeTrends[ep.id] || {}}
                                />
                                {episodeDistribution[ep.id] && (
                                  <RatingDistributionEpisode
                                    data={episodeDistribution[ep.id]}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </>
        )}

        {/* 🔥 DETAILS */}
        {activeTab === "details" && (
          <div className="details">
            <h2>Details</h2>

            <p>
              <strong>Type:</strong> {entry.type}
            </p>

            {entry.releaseDate && (
              <p>
                <strong>Release Date:</strong> {formatDate(entry.releaseDate)}
              </p>
            )}

            {entry.duration && (
              <p>
                <strong>Duration:</strong> {formatDuration(entry.duration)}
              </p>
            )}

            {entry.genres?.length > 0 && (
              <p>
                <strong>Genres:</strong> {entry.genres.join(", ")}
              </p>
            )}

            {entry.language?.length > 0 && (
              <p>
                <strong>Language:</strong> {entry.language.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* 🔥 Statistics */}
        {activeTab === "statistics" && (
          <div className="statistics">
            <div className="entry-trend">
              <h3>Votes & Rating Per Day</h3>
              <TrendGraph data={entryTrend} />
            </div>
            {entryDistribution && (
              <div className="entry-trend">
                <h3>Score Distribution</h3>

                <RatingDistributionEntry data={entryDistribution} />
              </div>
            )}
            <div className="entry-trend">
              <h3>Episode Rating Distribution</h3>
              <EpisodeRatingGraph entry={entry} episodeStats={episodeStats} />
            </div>
            <div className="entry-trend">
              <h3>Episode Votes Distribution</h3>
              <EpisodeVotesGraph entry={entry} episodeStats={episodeStats} />
            </div>
          </div>
        )}

        {/* 🔥 Characters */}
        {activeTab === "cast" && (
          <div className="cast">
            <p style={{ color: "#777" }}>Coming soon 👀</p>
          </div>
        )}

        {/* 🔥 CAST */}
        {activeTab === "characters" && (
          <div className="characters">
            <p style={{ color: "#777" }}>Coming soon 👀</p>
          </div>
        )}
      </div>

      {/*Modals and Hovers*/}
      {/*
      {hoverEntry && entryDistribution && (
        <div
          className="rating-overlay"
          style={{
            position: "fixed",
            top: hoverPosition.y + 10,
            left: hoverPosition.x + 10,
            zIndex: 999,
          }}
        >
          <RatingOverlay data={entryDistribution} />
        </div>
      )} */}
      {/* 
      {hoveredEpisode && episodeDistribution[hoveredEpisode] && (
        <div
          className="rating-overlay"
          style={{
            position: "fixed",
            top: hoverPosition.y + 10,
            left: hoverPosition.x + 10,
            zIndex: 999,
          }}
        >
          <RatingOverlay data={episodeDistribution[hoveredEpisode]} />
        </div>
      )}*/}
      {ratingModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Rate Episode</h3>
            <div
              className="rating-value"
              style={{
                color: getRatingColor(hoverRating ?? selectedRating),
              }}
            >
              {hoverRating ?? selectedRating}
            </div>

            <div className="rating-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  className={`rating-btn ${selectedRating == num ? "active" : ""}`}
                  style={
                    selectedRating == num
                      ? {
                          background: getRatingColor(num),
                          borderColor: getRatingColor(num),
                        }
                      : {}
                  }
                  onClick={() => setSelectedRating(num)}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={() =>
                  setRatingModal({
                    open: false,
                    episodeId: null,
                  })
                }
              >
                Cancel
              </button>

              <button
                className="submit"
                onClick={() => {
                  handleVote();
                  setRatingModal({
                    open: false,
                    episodeId: null,
                  });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
