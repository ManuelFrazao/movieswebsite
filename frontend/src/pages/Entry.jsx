import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./Entry.css";

export default function Entry() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/entries/${slug}`);
        setEntry(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEntry();
  }, [slug]);

  if (!entry) return <p>Loading...</p>;

  return (
    <div className="entry">
      
      {/* HERO */}
      <div className="hero">
        <img src={entry.coverImage} alt={entry.title} />
        <div className="overlay">
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
        </div>
      </div>

      {/* SEASONS */}
      <div className="content">
        {entry.seasons?.map((season) => (
          <div key={season.id} className="season">
            <h2>Season {season.seasonNumber}</h2>

            <div className="episodes">
              {season.episodes?.map((ep) => (
                <div key={ep.id} className="episode">
                  <img src={ep.thumbnail} alt={ep.title} />

                  <div>
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