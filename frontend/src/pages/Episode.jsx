import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ReviewCard from "../components/ReviewCard";

export default function Episode() {
  const { id } = useParams();

  const [episode, setEpisode] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);

  // 🔥 fetch episódio
  const fetchEpisode = async () => {
    const res = await api.get(`/episodes/${id}`);
    setEpisode(res.data);
  };

  // 🔥 fetch reviews
  const fetchReviews = async () => {
    const res = await api.get(`/reviews/episode/${id}`);
    setReviews(res.data);
  };

  // 🔥 count
  const fetchCount = async () => {
    const res = await api.get(`/reviews/episode/${id}/count`);
    setReviewCount(res.data.count);
  };

  useEffect(() => {
    fetchEpisode();
    fetchReviews();
    fetchCount();
  }, [id]);

  if (!episode) return <p>Loading...</p>;

  return (
    <div className="episode-page">
      <h1>{episode.title}</h1>

      <img src={episode.thumbnail} alt="" />

      <p>{episode.description}</p>

      {/* 🔥 META */}
      <div>
        <span>{reviewCount} reviews</span>
      </div>

      <button
        onClick={async () => {
          await api.post("/reviews", {
            type: "episode",
            episodeId: id,
            content: "Amazing episode 🔥",
          });

          fetchReviews();
          fetchCount();
        }}
      >
        Write Review
      </button>

      {/* 🔥 REVIEWS */}
      <div>
        <h2>Reviews</h2>

        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}
