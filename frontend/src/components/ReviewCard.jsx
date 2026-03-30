import { useState, useEffect } from "react";
import api from "../services/api";
import "./ReviewCard.css";
import RatingBadge from "../components/RatingBadge";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export default function ReviewCard({ review, onLike, isSeries = false }) {
  const currentUser = getUser();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userValue, setUserValue] = useState(0); // 1, -1, or 0

  useEffect(() => {
    api
      .get(`/likes/review/${review.id}`)
      .then((res) => {
        setLikes(res.data.likes);
        setDislikes(res.data.dislikes);
        setUserValue(res.data.userValue);
      })
      .catch(() => {});
  }, [review.id]);

  const handleVote = async (value) => {
    if (!currentUser) return alert("You need to be logged in.");
    try {
      const res = await api.post("/likes", {
        type: "review",
        reviewId: review.id,
        value,
      });
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setUserValue(res.data.userValue);
      if (onLike) onLike();
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeDate = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return past.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <img src={review.user?.avatar} alt="" />
        <div>
          <strong>{review.user?.username}</strong>
          <div className="review-meta">
            <span>{formatRelativeDate(review.createdAt)}</span>
            {isSeries && review.episode && (
              <div className="review-episode">
                {review.episode?.season?.seasonNumber && (
                  <>S {review.episode.season.seasonNumber} • </>
                )}
                Ep {review.episode.number} • {review.episode.title}
              </div>
            )}
          </div>
          <div className="review-rating">
            <RatingBadge value={review.rating} size="small" />
          </div>
        </div>
      </div>

      <p className="review-content">{review.content}</p>

      <div className="review-actions">
        {/* Like */}
        <button
          className={`like-btn ${userValue === 1 ? "liked" : ""}`}
          onClick={() => handleVote(1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
          </svg>
          {likes > 0 && <span>{likes}</span>}
        </button>

        <span style={{ color: "#333", margin: "0 0.25rem" }}>|</span>

        {/* Dislike */}
        <button
          className={`like-btn ${userValue === -1 ? "disliked" : ""}`}
          onClick={() => handleVote(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ transform: "rotate(180deg)" }}
          >
            <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
          </svg>
          {dislikes > 0 && <span>{dislikes}</span>}
        </button>
      </div>
    </div>
  );
}
