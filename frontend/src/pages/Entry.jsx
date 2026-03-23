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

  if (!entry) return <p className="loading">Loading...</p>;

  return (
    <div className="entry">

      {/* HERO */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${entry.coverImage})` }}
      >
        <div className="hero-overlay">

          {/* 🔙 BOTÃO VOLTAR */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Voltar
          </button>

          <div className="hero-content">
            <h1>{entry.title}</h1>

            <div className="meta">
              <span className="badge">{entry.type}</span>
            </div>

            <p>{entry.description}</p>

            {/* BOTÃO FAKE PLAY */}
            <button className="play-btn">▶ Watch</button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {entry.seasons?.map((season) => (
          <div key={season.id} className="season">

            <h2>Season {season.seasonNumber}</h2>

            <div className="episodes">
              {season.episodes?.map((ep) => (
                <div key={ep.id} className="episode-card">

                  <img src={ep.thumbnail} alt={ep.title} />

                  <div className="episode-info">
                    <h3>{ep.number}. {ep.title}</h3>
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