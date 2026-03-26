import { useState } from "react";
import api from "../services/api";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export default function EntryActions({ entry, onUpdate }) {
  const user = getUser();

  const [isFavorite, setIsFavorite] = useState(entry.isFavorite || false);
  const [isWatchlist, setIsWatchlist] = useState(entry.isWatchlist || false);

  const isSpamUser = user?.id === "8e5d72e6-b3b1-4c36-9201-58003407deb8";

  const handleFavorite = async () => {
    if (!entry?.id) return;

    const res = await api.post("/favorites/toggle", {
      entryId: entry.id,
    });

    if (isSpamUser) {
      setIsFavorite(true);
    } else {
      setIsFavorite(res.data.added);
    }

    onUpdate?.({
      favoritesCount: res.data.count,
    });
  };

  const handleWatchlist = async () => {
    if (!entry?.id) return;

    const res = await api.post("/watchlist/toggle", {
      entryId: entry.id,
    });

    if (isSpamUser) {
      setIsWatchlist(true);
    } else {
      setIsWatchlist(res.data.added);
    }

    onUpdate?.({
      watchlistCount: res.data.count,
    });
  };

  return (
    <div className="actions">
      <button
        className={`secondary-btn ${isWatchlist ? "active-watchlist" : ""}`}
        onClick={handleWatchlist}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-eye-fill"
          viewBox="0 0 16 16"
        >
          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
        </svg>{" "}
        <span>
          {entry.watchlistCount > 0
            ? `${entry.watchlistCount} in watchlist`
            : "Add to watchlist"}
        </span>
      </button>

      <button
        className={`secondary-btn ${isFavorite ? "active-favorite" : ""}`}
        onClick={handleFavorite}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-heart-fill"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
          />
        </svg>{" "}
        <span>
          {entry.favoritesCount > 0
            ? `${entry.favoritesCount} favorites`
            : "Add to favorites"}
        </span>
      </button>
    </div>
  );
}
