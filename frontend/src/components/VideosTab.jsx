import { useEffect, useState, useRef } from "react";
import api from "../services/api";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

function VideoModal({ video, onClose, currentUser }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userValue, setUserValue] = useState(0); // 1, -1, or 0
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    api
      .get(`/comments/${video.id}`)
      .then((res) => setComments(res.data))
      .catch(() => {});
  }, [video.id]);

  const handleVote = async (value) => {
    if (!currentUser) return alert("You need to be logged in.");
    try {
      const res = await api.post("/likes", {
        type: "video",
        videoId: video.id,
        value,
      });
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setUserValue(res.data.userValue);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/comments/${video.id}`, {
        content: commentText,
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(700px, 95vw)" }}
      >
        {video.title && (
          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
            {video.title}
          </p>
        )}
        {video._episodeTitle && (
          <p
            style={{
              color: "#aaa",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            From: {video._episodeTitle}
          </p>
        )}

        <video
          src={video.url}
          controls
          autoPlay
          style={{ width: "100%", borderRadius: "8px", maxHeight: "50vh" }}
        />

        {/* Like / Dislike */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "0.75rem 0",
          }}
        >
          <button
            onClick={() => handleVote(1)}
            style={{
              background: userValue === 1 ? "#4caf50" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            👍 {likes > 0 && likes}
          </button>

          <button
            onClick={() => handleVote(-1)}
            style={{
              background: userValue === -1 ? "#e50914" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            👎 {dislikes > 0 && dislikes}
          </button>
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid #222", paddingTop: "0.75rem" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>Comments</h4>

          {currentUser && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                style={{
                  flex: 1,
                  padding: "0.4rem 0.8rem",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                }}
              />
              <button
                onClick={handleComment}
                style={{
                  padding: "0.4rem 0.8rem",
                  background: "#639ef7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Post
              </button>
            </div>
          )}

          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {comments.length === 0 && (
              <p style={{ color: "#777", fontSize: "0.85rem" }}>
                No comments yet.
              </p>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "#1a1a1a",
                  borderRadius: "6px",
                  padding: "0.5rem 0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#639ef7",
                      marginRight: "0.5rem",
                    }}
                  >
                    {c.user?.username}
                  </span>
                  <span style={{ fontSize: "0.85rem" }}>{c.content}</span>
                </div>
                {(currentUser?.id === c.userId ||
                  currentUser?.role === "admin") && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e50914",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          <button onClick={onClose}>✕ Close</button>
        </div>
      </div>
    </div>
  );
}

export default function VideosTab({ targetType, targetId, episodes = [] }) {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [title, setTitle] = useState("");
  const fileRef = useRef();

  const fetchVideos = async () => {
    try {
      const mainRes = await api.get(`/videos/${targetType}/${targetId}`);
      let all = mainRes.data;

      if (episodes.length > 0) {
        const episodeRequests = episodes.map((ep) =>
          api
            .get(`/videos/episode/${ep.id}`)
            .then((r) => r.data.map((v) => ({ ...v, _episodeTitle: ep.title })))
            .catch(() => []),
        );
        const episodeVideos = await Promise.all(episodeRequests);
        all = [...all, ...episodeVideos.flat()];
      }

      setVideos(all);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (targetId) fetchVideos();
  }, [targetId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("targetType", targetType);
    formData.append("targetId", targetId);
    if (title) formData.append("title", title);

    try {
      const res = await api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVideos((prev) => [...prev, res.data]);
      setTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (activeVideo?.id === id) setActiveVideo(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="images-tab">
      {isAdmin && (
        <div
          className="images-upload"
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Video title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "0.4rem 0.8rem",
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#fff",
            }}
          />
          <label className="upload-btn">
            {uploading ? "Uploading..." : "+ Add Video"}
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {videos.length === 0 ? (
        <p style={{ color: "#777" }}>No videos yet.</p>
      ) : (
        <div className="images-grid">
          {videos.map((v) => (
            <div
              key={v.id}
              className="image-card"
              onClick={() => setActiveVideo(v)}
              style={{ cursor: "pointer" }}
            >
              <video
                src={v.url}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                muted
              />
              <div
                className="image-episode-label"
                style={{ bottom: "auto", top: 0 }}
              >
                ▶ {v.title || v._episodeTitle || "Play"}
              </div>
              {isAdmin && !v._episodeTitle && (
                <button
                  className="image-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(v.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          currentUser={user}
        />
      )}
    </div>
  );
}
