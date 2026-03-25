import { useState } from "react";
import api from "../services/api";
import "./ReviewCard.css";

export default function ReviewCard({ review, onLike }) {
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

  return (
    <div className="review-card">
      <div className="review-header">
        <img src={review.user.avatar} alt="" />
        <div>
          <strong>{review.user.username}</strong>

          <div className="review-meta">
            <span className="review-date">{formatDate(review.createdAt)}</span>
            {isSeries && review.episode && (
              <div className="review-episode">
                Ep {review.episode.number} • {review.episode.title}
              </div>
            )}
          </div>
          <div className="review-rating">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-star-fill"
              viewBox="0 0 16 16"
            >
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            </svg>{" "}
            {review.rating}
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
            class="bi bi-heart-fill"
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
