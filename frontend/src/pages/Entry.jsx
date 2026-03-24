import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";
import RatingBadge from "../components/RatingBadge";

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

  const fetchDistribution = async (episodeId) => {
    if (episodeDistribution[episodeId]) return;

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

        fetchEpisodeStats(ratingModal.episodeId);
      }

      if (ratingModal.entryId) {
        await api.post("/votes", {
          value: selectedRating,
          type: "entry",
          entryId: ratingModal.entryId,
        });

        fetchTrend(ratingModal.entryId);
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

  function TrendGraphEpisode({ data }) {
    const isMobile = useIsMobile();
    const days = getLast7Days();

    const counts = days.map((d) => data?.[d]?.count || 0);
    const avgs = days.map((d) => data?.[d]?.avg || 0);

    const max = Math.max(...counts, 1);

    const [hoverIndex, setHoverIndex] = useState(null);

    const width = 200;
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

    const width = episodes.length * 40;
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

    if (!entry?.seasons) return null;

    const episodes = entry.seasons.flatMap(
      (s) =>
        (s.episodes || [])
          .map((ep) => {
            const stats = episodeStats[ep.id] || {};
            const votes = stats.totalVotes || 0;

            return {
              ...ep,
              seasonNumber: s.seasonNumber,
              votes,
              rating: Number(stats.averageRating) || 0,
            };
          })
          .filter((ep) => ep.votes > 0), // 🔥 só com votos
    );

    if (!episodes.length) {
      return <div style={{ color: "#777" }}>No votes yet</div>;
    }

    const width = episodes.length * 40;
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

    const steps = 5; // nº de linhas
    const stepValue = Math.ceil(maxVotes / steps);

    return (
      <div className="episode-graph-wrapper">
        <svg
          width={width}
          height={height + 30}
          style={{
            paddingLeft: "1rem",
          }}
        >
          {/* base */}
          <line x1={0} x2={width} y1={height} y2={height} stroke="#333" />

          {/* 🔥 linhas horizontais + labels */}
          {Array.from({ length: steps + 1 }).map((_, i) => {
            const value = i * stepValue;
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
                  {value}
                </text>
              </g>
            );
          })}

          {/* pontos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 7 : 4}
              fill="#639ef7"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </svg>

        {/* tooltip */}
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
      {/* HERO */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${entry.coverImage})` }}
      >
        <div className="hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Voltar
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
          className={activeTab === "cast" ? "active" : ""}
          onClick={() => setActiveTab("cast")}
        >
          Cast
        </button>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* 🔥 OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="movie-info">
              <div
                style={{
                  display: "flex",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    marginRight: "1rem",
                  }}
                >
                  <img
                    width={180}
                    src={entry.coverImage}
                    alt=""
                    style={{
                      borderRadius: "8px",
                    }}
                  />
                  <div className="actions">
                    <button className="secondary-btn">+ My List</button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                  }}
                >
                  <h2>Synopsis</h2>
                  <p
                    style={{
                      fontSize: "0.85rem",
                    }}
                  >
                    {entry.description}
                  </p>
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "0.5rem 0",
                        gap: "10px",
                      }}
                    >
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
                    <div className="entry-trend">
                      <h3>Votes & Rating Per Day</h3>
                      <TrendGraph data={entryTrend} />
                    </div>
                  </>
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
                                {ep.isFinal && (
                                  <span className="final-badge">FINAL</span>
                                )}
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
                              <div style={{ marginTop: "10px" }}>
                                <TrendGraphEpisode
                                  data={episodeTrends[ep.id] || {}}
                                />
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

        {/* 🔥 CAST */}
        {activeTab === "cast" && (
          <div className="cast">
            <h2>Cast</h2>
            <p style={{ color: "#777" }}>Coming soon 👀</p>
          </div>
        )}
      </div>
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
      )}
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
      )}
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
