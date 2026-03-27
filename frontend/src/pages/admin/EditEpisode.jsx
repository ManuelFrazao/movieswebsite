import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import CastManager from "../../components/CastManager";
import CastSelectorFromEntry from "../../components/CastSelectorFromEntry";

import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function EditEpisode() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState(null);
  const [image, setImage] = useState(null);
  const [castData, setCastData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [entryCast, setEntryCast] = useState([]);

  const fetchEntryCast = async (entryId) => {
    try {
      const res = await api.get(`/cast/entry/${entryId}`);

      const formatted = res.data.map((c) => ({
        id: c.id,
        actor: c.actor,
        character: c.character,
        roleType: c.roleType,
        order: c.order,
      }));

      setEntryCast(formatted);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (episode?.season?.entry?.id) {
      fetchEntryCast(episode.season.entry.id);
    }
  }, [episode]);

  const fetchCast = async () => {
    try {
      const res = await api.get(`/cast/episode/${id}`);

      const formatted = res.data.map((c) => ({
        id: c.id,
        actor: c.actor,
        character: c.character,
        roleType: c.roleType,
        order: c.order,
      }));

      setCastData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEpisode = async () => {
    try {
      const res = await api.get(`/episodes/${id}`);
      setEpisode(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEpisode();
    fetchCast();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      formData.append("title", episode.title);
      formData.append("description", episode.description || "");
      formData.append("duration", episode.duration || "");

      if (episode.airDate) {
        formData.append("airDate", episode.airDate?.split("T")[0] || "");
      }

      if (image) formData.append("image", image);

      await api.put(`/episodes/${id}`, formData);

      alert("Episode updated!");
      fetchEpisode();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCast = async () => {
    try {
      const validCast = castData.filter((c) => c.actor && c.character);

      if (validCast.length === 0) {
        if (!window.confirm("This will remove all cast. Continue?")) return;
      }

      await api.post("/cast/bulk", {
        entryId: episode.season.entry.id,
        episodeId: id,
        cast: validCast.map((c, index) => ({
          actorId: c.actor.id,
          characterId: c.character.id,
          roleType: c.roleType,
          order: index + 1,
        })),
      });

      await fetchCast();

      alert("Cast saved!");
    } catch (err) {
      console.error(err);
    }
  };

  if (!episode) return <p>Loading...</p>;

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 3,
          borderRadius: 3,
        }}
      >
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ← Back
          </Button>

          <Typography variant="h6">Edit Episode</Typography>
        </Box>

        {/* TITLE */}
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={episode.title}
          onChange={(e) => setEpisode({ ...episode, title: e.target.value })}
        />

        {/* DESCRIPTION */}
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={episode.description || ""}
          onChange={(e) =>
            setEpisode({ ...episode, description: e.target.value })
          }
        />

        {/* DURATION + DATE */}
        <Box display="flex" gap={2} mt={2}>
          <TextField
            label="Duration (min)"
            type="number"
            fullWidth
            value={episode.duration || ""}
            onChange={(e) =>
              setEpisode({ ...episode, duration: e.target.value })
            }
          />

          <TextField
            label="Air Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={episode.airDate?.split("T")[0] || ""}
            onChange={(e) =>
              setEpisode({ ...episode, airDate: e.target.value })
            }
          />
        </Box>

        {/* IMAGE */}
        <Box mt={3} textAlign="center">
          <Button variant="outlined" component="label">
            Upload Thumbnail
            <input
              hidden
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Button>

          <Box mt={2}>
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : episode.thumbnail || "/placeholder.jpg"
              }
              alt=""
              style={{
                width: 160,
                borderRadius: 8,
                border: image ? "2px solid #e50914" : "none",
              }}
            />
          </Box>

          {image && (
            <Typography fontSize={12} color="#aaa" mt={1}>
              New image preview
            </Typography>
          )}
        </Box>

        {/* CAST */}
        <Box mt={4}>
          <Typography variant="h6" mb={2}>
            Cast
          </Typography>

          <CastSelectorFromEntry
            entryCast={entryCast}
            castData={castData}
            setCastData={setCastData}
          />

          {/* 🔥 CUSTOM CAST */}
          <Typography variant="subtitle1" mt={3}>
            Custom Cast
          </Typography>

          <CastManager
            castData={castData}
            setCastData={setCastData}
            onChange={setCastData}
          />

          <Button variant="contained" onClick={handleSaveCast} sx={{ mt: 2 }}>
            Save Cast
          </Button>
        </Box>

        {/* ACTIONS */}
        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
