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

              {avgDuration > 0 && <span>•</span>}
              {avgDuration > 0 && (
                <span>{formatTotalDuration(avgDuration)}</span>
              )}
            </div>

            <p className="description">{entry.description}</p>

            <div className="actions">
              <button className="secondary-btn">+ My List</button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* 👉 SE FOR FILME */}
        {!isSeries && (
          <div className="movie-info">
            <h2>About</h2>
            <p>{entry.description}</p>
          </div>
        )}

        {/* 👉 SE FOR SÉRIE */}
        {isSeries &&
          entry.seasons?.map((season) => (
            <div key={season.id} className="season">
              <div className="season-header">
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <h2
                    style={{
                      color: "#ccc",
                      fontWeight: "bold",
                      marginRight: "10px",
                    }}
                  >
                    Season {season.seasonNumber}
                  </h2>
                  <span className="season-sub">
                    {season.episodes?.length} episodes
                  </span>
                </div>
              </div>

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
                        {ep.airDate && <span>{formatDate(ep.airDate)}</span>}
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

                        <button
                          className="rate-btn"
                          onClick={() =>
                            setRatingModal({ open: true, episodeId: ep.id })
                          }
                        >
                          ⭐{" "}
                          {userRatings[ep.id]
                            ? `Your rating: ${userRatings[ep.id]}`
                            : "Rate"}
                        </button>
                      </div>

                      <p>{ep.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
