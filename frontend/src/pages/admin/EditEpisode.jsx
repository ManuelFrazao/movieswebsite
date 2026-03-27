import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";

export default function EditEpisode() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState(null);
  const [image, setImage] = useState(null);

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
  }, [id]);

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("title", episode.title);
      formData.append("description", episode.description || "");
      formData.append("duration", episode.duration || "");

      if (episode.airDate) {
        formData.append("airDate", episode.airDate);
      }

      if (image) formData.append("image", image);

      await api.put(`/episodes/${id}`, formData);

      alert("Episode updated!");
      fetchEpisode();
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
          onChange={(e) =>
            setEpisode({ ...episode, title: e.target.value })
          }
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
                  : episode.thumbnail
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

        {/* ACTIONS */}
        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}