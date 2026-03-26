import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";
import RatingBadge from "../components/RatingBadge";
import Navbar from "../components/Navbar";
import { formatVotes } from "../utils/formatVotes";
import ReviewCard from "../components/ReviewCard";

export default function Entry() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
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
  const [activeTab, setActiveTab] = useState("overview");
  const [episodeTrends, setEpisodeTrends] = useState({});
  const [episodeDistribution, setEpisodeDistribution] = useState({});
  const [reviews, setReviews] = useState([]);
  const [topReview, setTopReview] = useState(null);
  const [reviewSort, setReviewSort] = useState("recent");
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [trend, setTrend] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "reviews") {
      setActiveTab("reviews");

      // espera renderizar
      setTimeout(() => {
        document
          .querySelector(".reviews")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const res = await api.get(`/episodes/${id}`);
        setEpisode(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEpisode();
  }, [id]);

  useEffect(() => {
    if (!episode?.id) return;

    api
      .get(`/votes/episode/${episode.id}/stats`)
      .then((res) => setStats(res.data));
    api
      .get(`/votes/episode/${episode.id}/distribution`)
      .then((res) => setDistribution(res.data));
    api
      .get(`/votes/episode/${episode.id}/trending`)
      .then((res) => setTrend(res.data));
  }, [episode]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(
        `/reviews/episode/${episode.id}?sort=${reviewSort}`,
      );

      setReviews(res.data.reviews || res.data);
      setTopReview(res.data.topReview || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!episode?.id) return;
    fetchReviews();
  }, [episode, reviewSort]);

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

  if (!episode) return <p className="loading">Loading...</p>;

  const isSeries = entry?.type === "series";

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

  const handleVote = async () => {
    try {
      if (ratingModal.episodeId) {
        await api.post("/votes", {
          value: selectedRating,
          type: "episode",
          episodeId: ratingModal.episodeId,
        });

        // refresh
        api
          .get(`/votes/episode/${episode.id}/stats`)
          .then((res) => setStats(res.data));
        api
          .get(`/votes/episode/${episode.id}/distribution`)
          .then((res) => setDistribution(res.data));
        api
          .get(`/votes/episode/${episode.id}/trending`)
          .then((res) => setTrend(res.data));
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

  const handleCreateReview = async () => {
    try {
      await api.post("/reviews", {
        type: "episode",
        episodeId: episode.id,
        content: reviewText,
        rating: selectedRating,
      });

      setReviewText("");
      setReviewRating(5);
      setReviewModal(false);

      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const openReviewModal = async () => {
    try {
      let rating = 5;

      if (entry.type === "series") {
        const res = await api.get(`/votes/entry/${entry.id}/my-average`);
        rating = res.data.avg || 5;
      } else {
        const res = await api.get(`/votes/entry/${entry.id}/my-vote`);
        rating = res.data.value || 5;
      }

      setReviewRating(Math.round(rating));
      setReviewModal(true);
    } catch (err) {
      console.error(err);
      setReviewModal(true);
    }
  };

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
          padding: isMobile ? "0 0" : "0 20px",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const value = data[num] || 0;

          const barHeight = (value / max) * containerHeight;

          const color = getRatingColor(num);

          return (
            <div
              key={num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                width: isMobile ? "22px" : "66px",
                height: "100%",
              }}
            >
              {/* valor */}
              <span style={{ fontSize: "10px", marginBottom: "4px" }}>
                {value > 0 && <>{formatVotes(value)}</>}
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

          const color = getRatingColor(num);

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
                {value > 0 && <>{formatVotes(value)}</>}
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

    const width = isMobile ? 290 : days.length * 22;
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
              <strong>{formatVotes(counts[hoverIndex])}</strong> votes
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
              <strong>{formatVotes(counts[hoverIndex])}</strong> votes
            </div>
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
        style={{ backgroundImage: `url(${episode.thumbnail})` }}
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
            <h1>{episode.title}</h1>

            <div className="meta">
              <>
                <span>{formatDuration(episode.duration)}</span>
              </>
              <>
                <span>•</span>
                <span>{formatDate(episode.airDate)}</span>
              </>
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
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
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
                    width={220}
                    src={episode.thumbnail}
                    alt=""
                    style={{
                      borderRadius: "8px",
                    }}
                  />
                  <div className="actions">
                    <button className="secondary-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-eye-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                      </svg>{" "}
                      Add to watchlist
                    </button>
                    <button className="secondary-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-heart-fill"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                        />
                      </svg>{" "}
                      Add to favorites
                    </button>
                  </div>
                  {stats?.totalVotes != 0 && (
                    <>
                      <div className="movie-info-graphs">
                        <div className="entry-trend">
                          <TrendGraph7days data={trend} />
                        </div>
                        {distribution && (
                          <div className="entry-trend">
                            <RatingDistributionEntrySmall data={distribution} />
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
                    {episode.description}
                  </p>
                  <>
                    <div className="movie-info-rating">
                      <div style={{ display: "inline-block" }}>
                        <RatingBadge
                          value={stats?.averageRating}
                          votes={formatVotes(stats?.totalVotes)}
                          size="large"
                        />
                      </div>
                      {episode.airDate &&
                        new Date(episode.airDate) <= new Date() && (
                          <button
                            className="rate-btn"
                            onClick={() =>
                              setRatingModal({
                                open: true,
                                episodeId: episode.id,
                                entryId: null,
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
                          class="bi bi-camera-video"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
                          />
                        </svg>
                        <span>Videos</span>
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
                          class="bi bi-images"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                        </svg>
                        <span>Images</span>
                      </div>
                    </div>
                    <div
                      className="entry-contents-card"
                      onClick={() => setActiveTab("reviews")}
                    >
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
                          className="bi bi-pencil-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                          <path
                            fillRule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                          />
                        </svg>

                        {reviews.length > 0 ? (
                          <span>
                            {formatVotes(reviews.length)}{" "}
                            {reviews.length === 1 ? "review" : "reviews"}
                          </span>
                        ) : (
                          <span>No reviews</span>
                        )}
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
                          class="bi bi-people"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg>
                        <span>Forums</span>
                      </div>
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

        {/* 🔥 DETAILS */}
        {activeTab === "details" && (
          <div className="details">
            <h2>Details</h2>

            {episode.airDate && (
              <p>
                <strong>Release Date:</strong> {formatDate(episode.airDate)}
              </p>
            )}

            {episode.duration && (
              <p>
                <strong>Duration:</strong> {formatDuration(episode.duration)}
              </p>
            )}
          </div>
        )}

        {/* 🔥 Statistics */}
        {activeTab === "statistics" && (
          <div className="statistics">
            <div className="entry-trend">
              <h3>Votes & Rating Per Day</h3>
              <TrendGraph data={trend} />
            </div>
            {distribution && (
              <div className="entry-trend">
                <h3>Score Distribution</h3>
                <RatingDistributionEntry data={distribution} />
              </div>
            )}
          </div>
        )}

        {/* 🔥 Reviews */}
        {activeTab === "reviews" && (
          <div className="reviews">
            <h2>Reviews</h2>

            <button className="primary-btn" onClick={openReviewModal}>
              Write Review
            </button>

            {/* 🔝 TOP REVIEW */}
            {topReview && (
              <div className="top-review">
                <h3>🔥 Top Review</h3>
                <ReviewCard review={topReview} />
              </div>
            )}

            {/* 🔽 SORT */}
            <div className="review-sort">
              <button onClick={() => setReviewSort("recent")}>Recent</button>
              <button onClick={() => setReviewSort("popular")}>Popular</button>
              <button onClick={() => setReviewSort("rating")}>Rating</button>
            </div>

            {/* 📝 LIST */}
            <div className="reviews-list">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
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
      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Write Review</h3>

            {/* rating */}
            <div className="rating-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  className={reviewRating === num ? "active" : ""}
                  onClick={() => setReviewRating(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* textarea */}
            <textarea
              placeholder="Write your thoughts..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              style={{ width: "100%", marginTop: "10px" }}
            />

            <div className="modal-actions">
              <button onClick={() => setReviewModal(false)}>Cancel</button>

              <button className="submit" onClick={handleCreateReview}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
