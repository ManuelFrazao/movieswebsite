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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [commentsRes, likesRes] = await Promise.all([
          api.get(`/comments/${video.id}`),
          api.get(`/likes/${video.id}`),
        ]);
        setComments(commentsRes.data);
        setLikes(likesRes.data.likes);
        setDislikes(likesRes.data.dislikes);
        setUserValue(likesRes.data.userValue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const formatRelativeDate = (date) => {
    if (!date) return "";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-hand-thumbs-up-fill"
              viewBox="0 0 16 16"
            >
              <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
            </svg>{" "}
            {likes > 0 && likes}
          </button>
          <span style={{ color: "#333" }}>|</span>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-hand-thumbs-up-fill"
              viewBox="0 0 16 16"
              style={{ transform: "rotate(180deg)" }}
            >
              <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
            </svg>{" "}
            {dislikes > 0 && dislikes}
          </button>
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid #222", paddingTop: "0.75rem" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>Comments</h4>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              marginBottom: "0.5rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chat-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15" />
            </svg>{" "}
            <strong style={{ color: "#fff" }}>{comments.length}</strong>
            {comments.length === 1 ? "comment" : "comments"}
          </span>

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
                  textAlign: "start",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#639ef7",
                      }}
                    >
                      {c.user?.username}
                    </span>

                    <span style={{ fontSize: "0.7rem", color: "#777" }}>
                      {formatRelativeDate(c.createdAt)}
                    </span>
                  </div>

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

  const handleToggleTrailer = async (video) => {
    try {
      await api.patch(`/videos/${video.id}/trailer`, {
        isTrailer: !video.isTrailer,
      });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, isTrailer: !v.isTrailer } : v,
        ),
      );
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

              {/* trailer badge */}
              {v.isTrailer && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    left: "6px",
                    background: "#639ef7",
                    color: "#fff",
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  TRAILER
                </span>
              )}

              {isAdmin && !v._episodeTitle && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTrailer(v);
                    }}
                    style={{
                      background: v.isTrailer ? "#639ef7" : "#333",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                  >
                    {v.isTrailer ? "★ Trailer" : "☆ Trailer"}
                  </button>
                  <button
                    className="image-delete-btn"
                    style={{ position: "static" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(v.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
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
