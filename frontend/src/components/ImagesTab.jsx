import { useEffect, useState, useRef } from "react";
import api from "../services/api";

export default function ImagesTab({ targetType, targetId, isAdmin }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  const fetchImages = async () => {
    try {
      const res = await api.get(`/images/${targetType}/${targetId}`);
      setImages(res.data);
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
          {images.map((img) => (
            <div key={img.id} className="image-card" onClick={() => setLightbox(img)}>
              <img src={img.url} alt={img.caption || ""} />
              {isAdmin && (
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
            <img src={lightbox.url} alt={lightbox.caption || ""} />
            {lightbox.caption && <p>{lightbox.caption}</p>}
            <button onClick={() => setLightbox(null)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}