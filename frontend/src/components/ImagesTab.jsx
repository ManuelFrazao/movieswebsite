import { useEffect, useState, useRef } from "react";
import api from "../services/api";

const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export default function ImagesTab({ targetType, targetId, episodes = [] }) {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const fileRef = useRef();

  const fetchImages = async () => {
    try {
      // fetch main target images (entry or episode)
      const mainRes = await api.get(`/images/${targetType}/${targetId}`);
      let all = mainRes.data;

      // if entry, also fetch all episode images
      if (episodes.length > 0) {
        const episodeRequests = episodes.map((ep) =>
          api.get(`/images/episode/${ep.id}`)
            .then((r) => r.data.map((img) => ({ ...img, _episodeTitle: ep.title })))
            .catch(() => [])
        );
        const episodeImages = await Promise.all(episodeRequests);
        all = [...all, ...episodeImages.flat()];
      }

      setImages(all);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (targetId) fetchImages();
  }, [targetId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("targetType", targetType);
    formData.append("targetId", targetId);

    try {
      const res = await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/images/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openLightbox = (img, index) => {
    setLightbox(img);
    setLightboxIndex(index);
  };

  const goNext = () => {
    const next = (lightboxIndex + 1) % images.length;
    setLightbox(images[next]);
    setLightboxIndex(next);
  };

  const goPrev = () => {
    const prev = (lightboxIndex - 1 + images.length) % images.length;
    setLightbox(images[prev]);
    setLightboxIndex(prev);
  };

  return (
    <div className="images-tab">
      {isAdmin && (
        <div className="images-upload">
          <label className="upload-btn">
            {uploading ? "Uploading..." : "+ Add Image"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {images.length === 0 ? (
        <p style={{ color: "#777" }}>No images yet.</p>
      ) : (
        <div className="images-grid">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="image-card"
              onClick={() => openLightbox(img, index)}
            >
              <img src={img.url} alt={img.caption || ""} />
              {img._episodeTitle && (
                <span className="image-episode-label">{img._episodeTitle}</span>
              )}
              {isAdmin && !img._episodeTitle && (
                <button
                  className="image-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || ""}/>
            {lightbox._episodeTitle && (
              <p style={{ color: "#aaa", fontSize: "0.85rem" }}>
                From: {lightbox._episodeTitle}
              </p>
            )}
            {lightbox.caption && <p>{lightbox.caption}</p>}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.5rem" }}>
              <button onClick={goPrev}>← Prev</button>
              <button onClick={() => setLightbox(null)}>✕ Close</button>
              <button onClick={goNext}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}