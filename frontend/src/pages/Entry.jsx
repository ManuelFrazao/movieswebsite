import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";
import RatingBadge from "../components/RatingBadge";
import Navbar from "../components/Navbar";
import { formatVotes } from "../utils/formatVotes";
import ReviewCard from "../components/ReviewCard";
import ActorsRow from "../components/ActorsRow";
import CharactersRow from "../components/CharactersRow";
import EntryActions from "../components/EntryActions";
import ImagesTab from "../components/ImagesTab";
import VideosTab from "../components/VideosTab";
import CastList from "../components/CastList";

function NextEpisodeCountdown({ seasons }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [nextEpisode, setNextEpisode] = useState(null);

  useEffect(() => {
    if (!seasons) return;

    const now = new Date();
    const allEpisodes = seasons
      .flatMap((s) =>
        (s.episodes || []).map((ep) => ({
          ...ep,
          seasonNumber: s.seasonNumber,
        })),
      )
      .filter((ep) => ep.airDate && new Date(ep.airDate) > now)
      .sort((a, b) => new Date(a.airDate) - new Date(b.airDate));

    if (allEpisodes.length === 0) {
      setNextEpisode(null);
      return;
    }

    setNextEpisode(allEpisodes[0]);
  }, [seasons]);

  useEffect(() => {
    if (!nextEpisode) return;

    const tick = () => {
      const now = new Date();
      const target = new Date(nextEpisode.airDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextEpisode]);

  if (!nextEpisode || !timeLeft) return null;

  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "10px",
        marginBottom: "1rem",
        width: "100%",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "0 0 0.5rem" }}>
        Next episode: S{nextEpisode.seasonNumber}.E{nextEpisode.number}{" "}
        {nextEpisode.title !== "" && <>— {nextEpisode.title}</>}
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#639ef7",
                minWidth: "50px",
              }}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#777",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EpisodeCountdown({ airDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(airDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [airDate]);

  if (!timeLeft) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        marginTop: "0.4rem",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "0.7rem", color: "#777" }}>Airs in:</span>
      {[
        { label: "d", value: timeLeft.days },
        { label: "h", value: timeLeft.hours },
        { label: "m", value: timeLeft.minutes },
        { label: "s", value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "6px",
            padding: "2px 6px",
            textAlign: "center",
            minWidth: "36px",
          }}
        >
          <span
            style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#639ef7" }}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span
            style={{ fontSize: "0.6rem", color: "#777", marginLeft: "2px" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function MovieCountdown({ releaseDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(releaseDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  if (!timeLeft) return null;

  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1rem",
        width: "100%",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "0 0 0.5rem" }}>
        Release in:
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#639ef7",
                minWidth: "50px",
              }}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#777",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [reviews, setReviews] = useState([]);
  const [topReview, setTopReview] = useState(null);
  const [reviewSort, setReviewSort] = useState("recent");
  const [episodeReviewCounts, setEpisodeReviewCounts] = useState({});
  const [entryReviewCount, setEntryReviewCount] = useState(0);
  const [cast, setCast] = useState([]);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    type: null,
    entryId: null,
    episodeId: null,
  });
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [trailer, setTrailer] = useState(null);
  const [videoCount, setVideoCount] = useState(0);
  const [overviewVideoStats, setOverviewVideoStats] = useState({
    likes: 0,
    dislikes: 0,
    comments: 0,
  });

  useEffect(() => {
    if (!entry?.id) return;

    const fetchOverviewStats = async () => {
      try {
        const res = await api.get(`/videos/entry/${entry.id}`);
        const videos = res.data;

        const statsRequests = videos.map(async (v) => {
          const [likesRes, commentsRes] = await Promise.all([
            api
              .get(`/likes/${v.id}`)
              .catch(() => ({ data: { likes: 0, dislikes: 0 } })),
            api.get(`/comments/${v.id}`).catch(() => ({ data: [] })),
          ]);
          return {
            likes: likesRes.data.likes,
            dislikes: likesRes.data.dislikes,
            comments: commentsRes.data.length,
          };
        });

        const allStats = await Promise.all(statsRequests);
        const totals = allStats.reduce(
          (acc, s) => ({
            likes: acc.likes + s.likes,
            dislikes: acc.dislikes + s.dislikes,
            comments: acc.comments + s.comments,
          }),
          { likes: 0, dislikes: 0, comments: 0 },
        );

        setOverviewVideoStats(totals);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOverviewStats();
  }, [entry?.id]);

  useEffect(() => {
    if (!entry?.id) return;

    const fetchVideoCount = async () => {
      try {
        const entryRes = await api.get(`/videos/entry/${entry.id}`);
        let total = entryRes.data.length;

        const allEpisodes =
          entry.seasons?.flatMap((s) => s.episodes || []) || [];
        const episodeRequests = allEpisodes.map((ep) =>
          api
            .get(`/videos/episode/${ep.id}`)
            .then((r) => r.data.length)
            .catch(() => 0),
        );

        const episodeCounts = await Promise.all(episodeRequests);
        total += episodeCounts.reduce((sum, count) => sum + count, 0);

        setVideoCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideoCount();
  }, [entry?.id]);

  useEffect(() => {
    if (!entry?.id) return;
    api
      .get(`/videos/entry/${entry.id}`)
      .then((res) => {
        const t = res.data.find((v) => v.isTrailer);
        setTrailer(t || null);
      })
      .catch(console.error);
  }, [entry?.id]);

  useEffect(() => {
    if (!entry?.id) return;

    const fetchImageCount = async () => {
      try {
        // entry images
        const entryRes = await api.get(`/images/entry/${entry.id}`);
        let total = entryRes.data.length;

        // episode images from all seasons
        const allEpisodes =
          entry.seasons?.flatMap((s) => s.episodes || []) || [];
        const episodeRequests = allEpisodes.map((ep) =>
          api
            .get(`/images/episode/${ep.id}`)
            .then((r) => r.data.length)
            .catch(() => 0),
        );

        const episodeCounts = await Promise.all(episodeRequests);
        total += episodeCounts.reduce((sum, count) => sum + count, 0);

        setImageCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    fetchImageCount();
  }, [entry?.id]);

  const fetchCast = async () => {
    try {
      const res = await api.get(`/cast/entry/${entry.id}`);
      setCast(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  useEffect(() => {
    if (!entry?.id) return;
    fetchCast();
  }, [entry?.id]);

  const fetchReviews = async () => {
    try {
      let url = "";

      if (entry?.type === "series") {
        url = `/reviews/entry/${entry.id}?sort=${reviewSort}`;
      } else {
        url = `/reviews/entry/${entry.id}?sort=${reviewSort}`;
      }

      const res = await api.get(url);

      setReviews(res.data.reviews || res.data);
      setTopReview(res.data.topReview || null);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchReviews();
  }, [entry?.id, reviewSort]);

  const fetchEntryDistribution = async () => {
    if (entryDistribution) return;

    try {
      const res = await api.get(`/votes/entry/${entry.id}/distribution`);
      setEntryDistribution(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;

    fetchEntryDistribution();
  }, [entry?.id]);

  const fetchDistribution = async (episodeId, force = false) => {
    if (!force && episodeDistribution[episodeId]) return;

    try {
      const res = await api.get(`/votes/episode/${episodeId}/distribution`);

      setEpisodeDistribution((prev) => ({
        ...prev,
        [episodeId]: res.data,
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/entries/slug/${slug}`);
        setEntry(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchEntry();
  }, [slug]);

  const fetchEpisodeStats = async (episodeId) => {
    try {
      const res = await api.get(`/votes/episode/${episodeId}/stats`);

      setEpisodeStats((prev) => ({
        ...prev,
        [episodeId]: res.data,
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const fetchEpisodeTrends = async (entryId) => {
    try {
      const res = await api.get(`/votes/entry/${entryId}/episodes-trending`);
      setEpisodeTrends(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchEpisodeTrends(entry.id);
  }, [entry?.id]);

  useEffect(() => {
    if (!entry?.seasons) return;

    entry.seasons.forEach((season) => {
      season.episodes?.forEach((ep) => {
        fetchEpisodeStats(ep.id);
        fetchDistribution(ep.id);
        fetchEpisodeReviewCount(ep.id);
      });
    });
  }, [entry?.id]);

  const fetchTrend = async (entryId) => {
    try {
      const res = await api.get(`/votes/entry/${entryId}/trending`);
      setEntryTrend(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;
    fetchTrend(entry.id);
  }, [entry?.id]);

  const fetchEpisodeReviewCount = async (episodeId) => {
    try {
      const res = await api.get(`/reviews/episode/${episodeId}/count`);

      setEpisodeReviewCounts((prev) => ({
        ...prev,
        [episodeId]: res.data.count,
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!entry?.id) return;

    api
      .get(`/reviews/entry/${entry.id}/count`)
      .then((res) => setEntryReviewCount(res.data.count))
      .catch(console.error);
  }, [entry?.id]);

  const seasonRefs = useRef({});

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

        setUserRatings((prev) => ({
          ...prev,
          [ratingModal.episodeId]: selectedRating,
        }));

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

        setUserRatings((prev) => ({
          ...prev,
          entry: selectedRating,
        }));

        fetchTrend(ratingModal.entryId);

        // 🔥 refresh distribution
        setEntryDistribution(null);
        fetchEntryDistribution();
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
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
        setIsMobile(window.innerWidth < 960);
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

  const getSeasonStats = (season) => {
    if (!season?.episodes) return { avg: 0, votes: 0 };

    let totalVotes = 0;
    let weightedSum = 0;

    season.episodes.forEach((ep) => {
      const stats = episodeStats[ep.id];
      if (!stats || stats.totalVotes === 0) return;

      totalVotes += stats.totalVotes;
      weightedSum += stats.averageRating * stats.totalVotes;
    });

    const avg = totalVotes > 0 ? weightedSum / totalVotes : 0;

    return {
      avg,
      votes: totalVotes,
    };
  };

  const handleCreateReview = async () => {
    try {
      await api.post("/reviews", {
        content: reviewText,
        type: reviewModal.type,
        entryId: reviewModal.entryId,
        episodeId: reviewModal.episodeId,
        rating: reviewRating,
      });

      // 🔥 refresh
      fetchReviews();

      // reset
      setReviewModal({ open: false, type: null });
      setReviewText("");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const openReviewModal = (data) => {
    let rating = 0;

    if (data.episodeId) {
      rating = userRatings[data.episodeId] || 0;
    }

    if (data.entryId) {
      rating = userRatings.entry || 0;
    }

    setReviewRating(rating);

    setReviewModal({
      open: true,
      ...data,
    });
  };

  const totalCharacters = new Set(
    cast.map((c) => c.character?.id).filter(Boolean),
  ).size;

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
      <div className="graph-rating-distribuition">
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
                width: "15px",
                height: "100%",
              }}
            >
              {/* valor */}
              <span style={{ fontSize: "0.5rem", marginBottom: "4px" }}>
                {value > 0 && <>{formatVotes(value)}</>}
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
              <strong>{formatVotes(counts[hoverIndex])}</strong>{" "}
              {counts[hoverIndex] === 1 ? "vote" : "votes"}
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
              <strong>{formatVotes(counts[hoverIndex])}</strong>{" "}
              {counts[hoverIndex] === 1 ? "vote" : "votes"}
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
              <strong>{formatVotes(counts[hoverIndex])}</strong>{" "}
              {counts[hoverIndex] === 1 ? "vote" : "votes"}
            </div>
          </div>
        )}
      </div>
    );
  }

  function EpisodeRatingGraph({ entry, episodeStats }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const screenWidth = useWindowWidth();
    const svgRef = useRef(null);

    const isSmall = screenWidth < 900;

    if (!entry?.seasons) return null;

    const episodes = entry.seasons.flatMap((s) =>
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
        .filter((ep) => ep.rating > 0),
    );

    if (!episodes.length) return null;

    const spacing = isSmall ? 25 : 40;
    const width = episodes.length * spacing;
    const height = 200;

    // 🔥 Y DINÂMICO
    const ratings = episodes.map((ep) => ep.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const padding = 0.5;
    const minY = Math.max(0, minRating - padding);
    const maxY = Math.min(10, maxRating + padding);
    const range = maxY - minY || 1;

    const stepX = width / (episodes.length - 1);

    const points = episodes.map((ep, i) => {
      const x = i * stepX;
      const y = height - ((ep.rating - minY) / range) * height;

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

    const rect = svgRef.current?.getBoundingClientRect();

    // 🔥 SHAPES
    const getSeasonShape = (season) => {
      const shapes = ["circle", "triangle", "square", "diamond"];
      return shapes[(season - 1) % shapes.length];
    };

    const renderPoint = (p, i, color) => {
      const shape = getSeasonShape(p.season);
      const size = hoverIndex === i ? 7 : 4;

      switch (shape) {
        case "triangle":
          return (
            <polygon
              key={i}
              points={`${p.x},${p.y - size} ${p.x - size},${p.y + size} ${p.x + size},${p.y + size}`}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        case "square":
          return (
            <rect
              key={i}
              x={p.x - size}
              y={p.y - size}
              width={size * 2}
              height={size * 2}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        case "diamond":
          return (
            <polygon
              key={i}
              points={`${p.x},${p.y - size} ${p.x - size},${p.y} ${p.x},${p.y + size} ${p.x + size},${p.y}`}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        default:
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={size}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );
      }
    };

    const steps = 5;
    const stepSize = range / steps;

    return (
      <div>
        <div className="episode-graph-wrapper" ref={svgRef}>
          <svg
            width={width}
            height={height + 30}
            style={{ paddingLeft: "1rem" }}
          >
            <line x1={0} x2={width} y1={height} y2={height} stroke="#333" />

            {/* 🔥 eixo dinâmico */}
            {Array.from({ length: steps + 1 }).map((_, i) => {
              const value = minY + i * stepSize;
              const y = height - ((value - minY) / range) * height;

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
                    {value.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {points.map((p, i) => renderPoint(p, i, getRatingColor(p.rating)))}
          </svg>

          {hoverIndex !== null && rect && (
            <div
              className="episode-tooltip"
              style={{
                position: "fixed",
                left: rect.left + points[hoverIndex].x,
                top: rect.top + points[hoverIndex].y,
              }}
            >
              <div>
                S{points[hoverIndex].season}E{points[hoverIndex].epNumber}
              </div>

              <div style={{ fontWeight: "bold" }}>
                {points[hoverIndex].title}
              </div>

              <RatingBadge value={points[hoverIndex].rating} />

              <div>
                <strong>{formatVotes(points[hoverIndex].votes)}</strong> votes
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function EpisodeVotesGraph({ entry, episodeStats }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const screenWidth = useWindowWidth();
    const svgRef = useRef(null);

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

    const votesArr = episodes.map((e) => e.votes);

    const minVotes = 0;
    const maxVotes = Math.max(...votesArr);
    const maxY = maxVotes * 1.1;
    const range = maxY - minVotes || 1;

    const stepX = width / (episodes.length - 1);

    const points = episodes.map((ep, i) => {
      const x = i * stepX;
      const y = height - ((ep.votes - minVotes) / range) * height;

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

    const rect = svgRef.current?.getBoundingClientRect();

    const getSeasonShape = (season) => {
      const shapes = ["circle", "triangle", "square", "diamond"];
      return shapes[(season - 1) % shapes.length];
    };

    const renderPoint = (p, i, color) => {
      const shape = getSeasonShape(p.season);
      const size = hoverIndex === i ? 7 : 4;

      switch (shape) {
        case "triangle":
          return (
            <polygon
              key={i}
              points={`${p.x},${p.y - size} ${p.x - size},${p.y + size} ${p.x + size},${p.y + size}`}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        case "square":
          return (
            <rect
              key={i}
              x={p.x - size}
              y={p.y - size}
              width={size * 2}
              height={size * 2}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        case "diamond":
          return (
            <polygon
              key={i}
              points={`${p.x},${p.y - size} ${p.x - size},${p.y} ${p.x},${p.y + size} ${p.x + size},${p.y}`}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );

        default:
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={size}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );
      }
    };

    const steps = 5;
    const stepSize = range / steps;

    return (
      <div className="episode-graph-wrapper" ref={svgRef}>
        <svg width={width} height={height + 30} style={{ paddingLeft: "1rem" }}>
          <line x1={0} x2={width} y1={height} y2={height} stroke="#333" />

          {Array.from({ length: steps + 1 }).map((_, i) => {
            const value = minVotes + i * stepSize;
            const y = height - ((value - minVotes) / range) * height;

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

          {points.map((p, i) => renderPoint(p, i, "#639ef7"))}
        </svg>

        {hoverIndex !== null && rect && (
          <div
            className="episode-tooltip"
            style={{
              position: "fixed",
              left: rect.left + points[hoverIndex].x,
              top: rect.top + points[hoverIndex].y,
            }}
          >
            <div>
              S{points[hoverIndex].season}E{points[hoverIndex].epNumber}
            </div>

            <div style={{ fontWeight: "bold" }}>{points[hoverIndex].title}</div>

            <div>
              <strong>{formatVotes(points[hoverIndex].votes)}</strong> votes
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
          className={activeTab === "videos" ? "active" : ""}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>

        <button
          className={activeTab === "images" ? "active" : ""}
          onClick={() => setActiveTab("images")}
        >
          Images
        </button>
        {entry.totalVotes > 0 && (
          <>
            <button
              className={activeTab === "statistics" ? "active" : ""}
              onClick={() => setActiveTab("statistics")}
            >
              Statistics
            </button>
          </>
        )}

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
                    src={entry.coverImage}
                    alt=""
                    style={{
                      borderRadius: "8px",
                    }}
                  />
                  <EntryActions
                    entityId={entry.id}
                    type="entry"
                    releaseDate={entry.releaseDate}
                    isFavorite={entry.isFavorite}
                    isWatchlist={entry.isWatchlist}
                    favoritesCount={entry.favoritesCount}
                    watchlistCount={entry.watchlistCount}
                    onUpdate={(data) =>
                      setEntry((prev) => ({
                        ...prev,
                        ...data,
                      }))
                    }
                  />
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
                  {trailer && (
                    <div
                      className="trailer-section"
                      style={{
                        marginBottom: "1rem",
                      }}
                    >
                      <video
                        src={trailer.url}
                        controls
                        style={{
                          width: "100%",
                          maxWidth: "560px",
                          borderRadius: "8px",
                        }}
                      />
                      <>
                        {/* likes, dislikes, comments */}
                        {(overviewVideoStats.likes > 0 ||
                          overviewVideoStats.dislikes > 0 ||
                          overviewVideoStats.comments > 0) && (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              fontSize: "0.7rem",
                              color: "#aaa",
                            }}
                          >
                            {overviewVideoStats.likes > 0 && (
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-hand-thumbs-up-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                                </svg>{" "}
                                {formatVotes(overviewVideoStats.likes)}
                              </span>
                            )}
                            {overviewVideoStats.dislikes > 0 && (
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-hand-thumbs-up-fill"
                                  viewBox="0 0 16 16"
                                  style={{ transform: "rotate(180deg)" }}
                                >
                                  <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                                </svg>{" "}
                                {formatVotes(overviewVideoStats.dislikes)}
                              </span>
                            )}
                            {overviewVideoStats.comments > 0 && (
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-chat-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15" />
                                </svg>{" "}
                                {formatVotes(overviewVideoStats.comments)}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    </div>
                  )}
                  {!isSeries &&
                    entry.releaseDate &&
                    new Date(entry.releaseDate) > new Date() && (
                      <MovieCountdown releaseDate={entry.releaseDate} />
                    )}
                  {isSeries && <NextEpisodeCountdown seasons={entry.seasons} />}
                  {entry.description !== "" && (
                    <>
                      <h2>Synopsis</h2>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {entry.description}
                      </p>
                    </>
                  )}
                  <>
                    {entry.totalVotes > 0 && (
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
                              votes={formatVotes(entry.totalVotes)}
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
                    )}
                  </>
                  <div className="entry-contents">
                    <div className="entry-contents-card">
                      <div
                        onClick={() => setActiveTab("videos")}
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
                          className="bi bi-camera-video"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
                          />
                        </svg>
                        {videoCount > 0 ? (
                          <span>
                            {formatVotes(videoCount)}{" "}
                            {videoCount === 1 ? "video" : "videos"}
                          </span>
                        ) : (
                          <span>Videos</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="entry-contents-card"
                      onClick={() => setActiveTab("images")}
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
                          className="bi bi-images"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                        </svg>
                        {imageCount > 0 ? (
                          <span>
                            {formatVotes(imageCount)}{" "}
                            {imageCount === 1 ? "image" : "images"}
                          </span>
                        ) : (
                          <span>Images</span>
                        )}
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
                        {entryReviewCount > 0 ? (
                          <span>
                            {formatVotes(entryReviewCount)}{" "}
                            {entryReviewCount === 1 ? "review" : "reviews"}
                          </span>
                        ) : (
                          "Reviews"
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
                          className="bi bi-people"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg>
                        <span>Forums</span>
                      </div>
                    </div>
                  </div>
                  <div className="entry-cast">
                    <div className="entry-cast-list">
                      <div className="entry-cast-top">
                        <h2
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Cast{" "}
                          <p
                            style={{ fontSize: "0.8rem", marginLeft: "0.3rem" }}
                          >
                            {cast.length > 0 && <>({cast.length})</>}
                          </p>
                        </h2>
                        <span onClick={() => setActiveTab("cast")}>
                          see more
                        </span>
                      </div>
                      <ActorsRow cast={cast} />
                    </div>
                    <div className="entry-cast-list">
                      <div className="entry-cast-top">
                        <h2
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Characters{" "}
                          <p
                            style={{ fontSize: "0.8rem", marginLeft: "0.3rem" }}
                          >
                            {totalCharacters > 0 && <>({totalCharacters})</>}
                          </p>
                        </h2>
                        <span onClick={() => setActiveTab("cast")}>
                          see more
                        </span>
                      </div>
                      <CharactersRow cast={cast} />
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
              entry.seasons?.map((season) => {
                const seasonStats = getSeasonStats(season);
                return (
                  <div
                    key={season.id}
                    className="season"
                    ref={(el) => (seasonRefs.current[season.id] = el)}
                  >
                    <div
                      className="season-header"
                      onClick={() => {
                        const isOpening = openSeason !== season.id;
                        setOpenSeason(
                          openSeason === season.id ? null : season.id,
                        );

                        // only scroll if we're opening, not closing
                        if (isOpening) {
                          setTimeout(() => {
                            seasonRefs.current[season.id]?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 50);
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
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
                        {seasonStats.votes > 0 && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginLeft: "10px",
                            }}
                          >
                            <RatingBadge
                              value={seasonStats.avg}
                              votes={formatVotes(seasonStats.votes)}
                            />
                          </span>
                        )}
                      </div>

                      <span className="season-toggle">
                        {openSeason === season.id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-caret-up-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-caret-down-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                          </svg>
                        )}
                      </span>
                    </div>

                    {openSeason === season.id && (
                      <div className="episodes">
                        {season.episodes?.map((ep) => (
                          <div key={ep.id} className="episode-row">
                            <div className="episode-number">{ep.number}.</div>
                            {/*{ep.isFinal && (
                                    <span className="final-badge">FINAL</span>
                                  )}*/}
                            <img
                              src={ep.thumbnail || entry.coverImage}
                              alt={ep.title}
                            />

                            <div className="episode-info">
                              <div>
                                <div
                                  onClick={() => navigate(`/episode/${ep.id}`)}
                                  style={{
                                    display: "flex",
                                    cursor: "pointer",
                                  }}
                                >
                                  <h3>
                                    {ep.title?.trim()
                                      ? ep.title
                                      : `S${season.seasonNumber}.E${ep.number}`}
                                  </h3>
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

                                {ep.airDate &&
                                  new Date(ep.airDate) > new Date() && (
                                    <EpisodeCountdown airDate={ep.airDate} />
                                  )}

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
                                          votes={formatVotes(
                                            episodeStats[ep.id].totalVotes,
                                          )}
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

                                <div className="episode-reviews">
                                  {episodeReviewCounts[ep.id] > 0 && (
                                    <span
                                      onClick={() =>
                                        navigate(`/episode/${ep.id}`, {
                                          state: { scrollTo: "reviews" },
                                        })
                                      }
                                      style={{ cursor: "pointer" }}
                                    >
                                      {formatVotes(
                                        episodeReviewCounts[ep.id] || 0,
                                      )}{" "}
                                      {(episodeReviewCounts[ep.id] || 0) === 1
                                        ? "review"
                                        : "reviews"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {episodeTrends[ep.id] && (
                                <div className="entry-episode-graphs">
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
                );
              })}
          </>
        )}

        {/* 🔥 Videos */}
        {activeTab === "videos" && (
          <VideosTab
            targetType="entry"
            targetId={entry.id}
            episodes={entry.seasons?.flatMap((s) => s.episodes || []) || []}
          />
        )}

        {/* 🔥 Images */}
        {activeTab === "images" && (
          <ImagesTab
            targetType="entry"
            targetId={entry.id}
            episodes={entry.seasons?.flatMap((s) => s.episodes || []) || []}
          />
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
            <div className="entry-trend-dist-graph">
              <h3>Episode Rating Distribution</h3>
              <EpisodeRatingGraph entry={entry} episodeStats={episodeStats} />
            </div>
            <div className="entry-trend-dist-graph">
              <h3>Episode Votes Distribution</h3>
              <EpisodeVotesGraph entry={entry} episodeStats={episodeStats} />
            </div>
          </div>
        )}

        {/* 🔥 Reviews */}
        {activeTab === "reviews" && (
          <div className="reviews">
            <h2>Reviews</h2>

            {entry.type !== "series" &&
              entry.releaseDate &&
              new Date(entry.releaseDate) <= new Date() && (
                <button
                  className="rate-btn"
                  onClick={() =>
                    openReviewModal({
                      type: "entry",
                      entryId: entry.id,
                    })
                  }
                >
                  Write Review
                </button>
              )}

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
                <ReviewCard
                  key={r.id}
                  review={r}
                  isSeries={entry?.type === "series"}
                />
              ))}
            </div>
          </div>
        )}

        {/* 🔥 Cast */}
        {activeTab === "cast" && (
          <div className="cast">
            <CastList cast={cast} />
          </div>
        )}

        {/* 🔥 Forums */}
        {activeTab === "forums" && (
          <div className="forums">
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
      {reviewModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Write Review</h3>

            <div className="rating-grid"></div>

            {/* 🔥 rating atual */}
            <div style={{ marginBottom: "10px", color: "#aaa" }}>
              Current rating: <strong>{reviewRating}</strong>
            </div>

            {/* textarea */}
            <textarea
              placeholder="Write your thoughts..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              style={{ width: "100%" }}
            />

            <div className="modal-actions">
              <button
                onClick={() => setReviewModal({ open: false, type: null })}
              >
                Cancel
              </button>

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
