import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";

export default function Entry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [episodeStats, setEpisodeStats] = useState({});
  const [ratingModal, setRatingModal] = useState({
    open: false,
    episodeId: null,
  });
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [entryTrend, setEntryTrend] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [openSeason, setOpenSeason] = useState(null);

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

  useEffect(() => {
    if (!entry?.seasons) return;

    entry.seasons.forEach((season) => {
      season.episodes?.forEach((ep) => {
        fetchEpisodeStats(ep.id);
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

  const handleVote = async (episodeId, value) => {
    try {
      await api.post("/votes", {
        value,
        type: "episode",
        episodeId,
      });

      fetchEpisodeStats(episodeId); // 🔥 refresh
    } catch (err) {
      console.error(err);
    }
  };

  const getRatingColor = (value) => {
    if (value <= 3) return "#e50914"; // 🔴
    if (value <= 6) return "#ff9800"; // 🟠
    return "#4caf50"; // 🟢
  };

  const canRateEpisode = (airDate) => {
    if (!airDate) return false;

    const today = new Date();
    const releaseDate = new Date(airDate);

    return releaseDate <= today;
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

  function TrendGraph({ data }) {
    const days = getLast7Days();

    const counts = days.map((d) => data?.[d]?.count || 0);
    const avgs = days.map((d) => data?.[d]?.avg || 0);

    const maxVotes = Math.max(...counts, 1);

    return (
      <div className="trend-graph">
        {days.map((day, i) => (
          <div key={day} className="trend-day">
            {/* 🔥 barra votos */}
            <div className="trend-bar">
              <div
                className="trend-bar-fill"
                style={{
                  height: `${(counts[i] / maxVotes) * 100}%`,
                }}
              />
            </div>

            {/* 🔥 ponto rating */}
            <div
              className="trend-dot"
              style={{
                bottom: `${(avgs[i] / 10) * 100}%`,
              }}
              title={`${day} → ${counts[i]} votes | ⭐ ${avgs[i].toFixed(1)}`}
            />
          </div>
        ))}
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

              {isSeries && entry.totalVotes > 0 && (
                <>
                  <span>•</span>
                  <div>
                    <span style={{ color: "#aaa" }}>
                      ⭐ {(entry.topRank / 10).toFixed(1)}
                    </span>
                    <span> ({entry.totalVotes})</span>
                  </div>
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

            <div className="actions">
              <button className="secondary-btn">+ My List</button>
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
              <h2>Synopsis</h2>
              <p>{entry.description}</p>

              <div className="entry-trend">
                <h3>Votes & Rating Over Time</h3>
                <TrendGraph data={entryTrend} />
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

                            <div>
                              {episodeStats[ep.id]?.averageRating > 0 && (
                                <>
                                  <span
                                    style={{
                                      marginRight: "10px",
                                    }}
                                  >
                                    ⭐ {episodeStats[ep.id].averageRating} (
                                    {episodeStats[ep.id].totalVotes}{" "}
                                    {episodeStats[ep.id].totalVotes === 1
                                      ? "vote"
                                      : "votes"}
                                    )
                                  </span>
                                </>
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
                                >
                                  ⭐{" "}
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
                  handleVote(ratingModal.episodeId, selectedRating);
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
