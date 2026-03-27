import { useState } from "react";
import api from "../services/api";
import "./ReviewCard.css";
import RatingBadge from "../components/RatingBadge";

export default function ReviewCard({ review, onLike, isSeries = false }) {
  const [liked, setLiked] = useState(review.liked || false);
  const [likes, setLikes] = useState(review.likes?.length || 0);

  const handleLike = async () => {
    try {
      const res = await api.post("/likes", {
        type: "review",
        reviewId: review.id,
      });

      setLiked(res.data.liked);
      setLikes((prev) => prev + (res.data.liked ? 1 : -1));

      if (onLike) onLike();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        <img src={review.user.avatar} alt="" />
        <div>
          <strong>{review.user.username}</strong>

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
        <button
          className={`like-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
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
              fill-rule="evenodd"
              d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
            />
          </svg>{" "}
          {likes}
        </button>
      </div>
    </div>
  );
}
