import { useState } from "react";
import api from "../services/api";
import { formatVotes } from "../utils/formatVotes";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export default function EntryActions({
  entityId,
  type = "entry", // 🔥 default = entry
  isFavorite: initialFavorite,
  isWatchlist: initialWatchlist,
  favoritesCount = 0,
  watchlistCount = 0,
  onUpdate,
}) {
  const user = getUser();
  const isSpamUser = user?.id === "8e5d72e6-b3b1-4c36-9201-58003407deb8";

  const [isFavorite, setIsFavorite] = useState(
    isSpamUser ? true : initialFavorite || false,
  );

  const [isWatchlist, setIsWatchlist] = useState(
    isSpamUser ? true : initialWatchlist || false,
  );

  const requireAuth = () => {
    if (!user) {
      alert("You need to be logged in.");
      return false;
    }
    return true;
  };

  const handleFavorite = async () => {
    if (!requireAuth()) return;
    if (!entityId) return;

    const res = await api.post("/favorites/toggle", {
      targetId: entityId,
      targetType: type, // 🔥 aqui está a magia
    });

    if (!isSpamUser) {
      setIsFavorite(res.data.added);
    }

    onUpdate?.({
      favoritesCount: res.data.count,
    });
  };

  const handleWatchlist = async () => {
    if (!requireAuth()) return;
    if (!entityId) return;

    const res = await api.post("/watchlist/toggle", {
      targetId: entityId,
      targetType: type,
    });

    if (!isSpamUser) {
      setIsWatchlist(res.data.added);
    }

    onUpdate?.({
      watchlistCount: res.data.count,
    });
  };

  return (
    <div className="actions">
      {/* WATCHLIST */}
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
          {isWatchlist
            ? `${formatVotes(watchlistCount)} added to watchlist`
            : "Add to watchlist"}
        </span>
      </button>

      {/* FAVORITES */}
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
          {isFavorite
            ? `${formatVotes(favoritesCount)} ${
                favoritesCount === 1 ? "favorite" : "favorites"
              }`
            : "Add to favorites"}
        </span>
      </button>
    </div>
  );
}
