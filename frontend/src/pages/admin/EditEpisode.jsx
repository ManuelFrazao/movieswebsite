import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function EditEpisode() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState(null);
  const [image, setImage] = useState(null);

  const fetchEpisode = async () => {
    const res = await api.get(`/episodes/${id}`);
    setEpisode(res.data);
  };

  useEffect(() => {
    fetchEpisode();
  }, [id]);

  const handleSave = async () => {
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
  };

  if (!episode) return <p>Loading...</p>;

  return (
    <Box p={3}>
      <Button onClick={() => navigate(-1)}>← Back</Button>

      <Typography variant="h5">Edit Episode</Typography>

      <TextField
        label="Title"
        fullWidth
        value={episode.title}
        onChange={(e) =>
          setEpisode({ ...episode, title: e.target.value })
        }
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        value={episode.description || ""}
        onChange={(e) =>
          setEpisode({ ...episode, description: e.target.value })
        }
      />

      <TextField
        label="Duration"
        type="number"
        value={episode.duration || ""}
        onChange={(e) =>
          setEpisode({ ...episode, duration: e.target.value })
        }
      />

      <TextField
        type="date"
        value={episode.airDate?.split("T")[0] || ""}
        onChange={(e) =>
          setEpisode({ ...episode, airDate: e.target.value })
        }
      />

      <Button component="label">
        Upload Image
        <input hidden type="file" onChange={(e) => setImage(e.target.files[0])} />
      </Button>

      <img
        src={image ? URL.createObjectURL(image) : episode.thumbnail}
        style={{ width: 120 }}
      />

      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}