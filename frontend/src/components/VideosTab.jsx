import { useEffect, useState, useRef } from "react";
import api from "../services/api";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

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
          api.get(`/videos/episode/${ep.id}`)
            .then((r) => r.data.map((v) => ({ ...v, _episodeTitle: ep.title })))
            .catch(() => [])
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
        <div className="images-upload" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
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
              <div className="image-episode-label" style={{ bottom: "auto", top: 0 }}>
                ▶ {v.title || v._episodeTitle || "Play"}
              </div>
              {isAdmin && !v._episodeTitle && (
                <button
                  className="image-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video player modal */}
      {activeVideo && (
        <div className="lightbox-overlay" onClick={() => setActiveVideo(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {activeVideo.title && (
              <p style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>{activeVideo.title}</p>
            )}
            {activeVideo._episodeTitle && (
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                From: {activeVideo._episodeTitle}
              </p>
            )}
            <video
              src={activeVideo.url}
              controls
              autoPlay
              style={{ maxWidth: "90vw", maxHeight: "70vh", borderRadius: "8px" }}
            />
            <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
              <button onClick={() => setActiveVideo(null)}>✕ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}