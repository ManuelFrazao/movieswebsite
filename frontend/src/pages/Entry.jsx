import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";

export default function Entry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);

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

  if (!entry) return <p className="loading">Loading...</p>;

  const isSeries = entry.type === "serie";

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
              <span className="badge">{entry.type}</span>

              {entry.year && <span>{entry.year}</span>}
              {entry.duration && <span>{entry.duration} min</span>}
            </div>

            <p className="description">{entry.description}</p>

            <div className="actions">
              <button className="play-btn">▶ Watch</button>
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
                <h2>Season {season.seasonNumber}</h2>
                {season.releaseDate && (
                  <span>{new Date(season.releaseDate).getFullYear()}</span>
                )}
              </div>

              <div className="episodes">
                {season.episodes?.map((ep) => (
                  <div key={ep.id} className="episode-card">
                    <img src={ep.thumbnail} alt={ep.title} />

                    <div className="episode-info">
                      <h3>
                        {ep.number}. {ep.title}
                      </h3>

                      <div className="episode-meta">
                        {ep.duration && <span>{ep.duration} min</span>}
                        {ep.airDate && (
                          <span>
                            {new Date(ep.airDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <p>{ep.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
