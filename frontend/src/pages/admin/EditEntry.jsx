import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Box, TextField, Button, Typography } from "@mui/material";

export default function EditEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState({});
  const [episodeImage, setEpisodeImage] = useState(null);

  const [newSeason, setNewSeason] = useState({
    seasonNumber: "",
  });

  const [newEpisode, setNewEpisode] = useState({
    title: "",
    number: "",
  });

  const navigate = useNavigate();

  const fetchEntry = async () => {
    try {
      const res = await api.get(`/entries/${id}`);
      setEntry(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await api.get(`/seasons/entry/${id}`);
      setSeasons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntry();
    fetchSeasons();
  }, [id]);

  const fetchEpisodes = async (seasonId) => {
    try {
      const res = await api.get(`/episodes/season/${seasonId}`);
      setEpisodes((prev) => ({
        ...prev,
        [seasonId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSeason = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/seasons",
        {
          entryId: id,
          seasonNumber: newSeason.seasonNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchSeasons();
      setNewSeason({ seasonNumber: "" });
    } catch (err) {
      console.error(err);
    }
  };

const handleCreateEpisode = async (seasonId) => {
  try {
    const formData = new FormData();

    formData.append("title", newEpisode.title);
    formData.append("number", newEpisode.number);
    formData.append("seasonId", seasonId);

    if (episodeImage) {
      formData.append("image", episodeImage);
    }

    await api.post("/episodes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    fetchEpisodes(seasonId);

    setNewEpisode({ title: "", number: "" });
    setEpisodeImage(null);

  } catch (err) {
    console.error(err);
  }
};

  const handleUpdate = async () => {
    await api.put(`/entries/${id}`, entry);
    alert("Updated!");
  };

  if (!entry) return <p>Loading...</p>;

  return (
    <Box p={3}>
      <Button
        variant="outlined"
        onClick={() => navigate("/admin?tab=entries")}
        sx={{ mb: 2 }}
      >
        ← Back to Entries
      </Button>
      <Typography variant="h5">Edit Entry</Typography>

      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={entry.title}
        onChange={(e) => setEntry({ ...entry, title: e.target.value })}
      />

      <TextField
        label="Description"
        fullWidth
        margin="normal"
        value={entry.description}
        onChange={(e) => setEntry({ ...entry, description: e.target.value })}
      />

      <Button variant="contained" onClick={handleUpdate}>
        Save
      </Button>

      <Typography mt={4} variant="h6">
        Seasons
      </Typography>

      {/* ADD SEASON */}
      <Box display="flex" gap={2} mt={2}>
        <TextField
          label="Season Number"
          value={newSeason.seasonNumber}
          onChange={(e) => setNewSeason({ seasonNumber: e.target.value })}
        />

        <Button variant="contained" onClick={handleCreateSeason}>
          + Add Season
        </Button>
      </Box>

      {/* LIST SEASONS */}
      {seasons.map((season) => (
        <Accordion key={season.id} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Season {season.seasonNumber}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {/* LOAD EPISODES */}
            <Button size="small" onClick={() => fetchEpisodes(season.id)}>
              Load Episodes
            </Button>

            {/* ADD EPISODE */}
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Episode Title"
                onChange={(e) =>
                  setNewEpisode({
                    ...newEpisode,
                    title: e.target.value,
                  })
                }
              />

              <TextField
                label="Number"
                onChange={(e) =>
                  setNewEpisode({
                    ...newEpisode,
                    number: e.target.value,
                  })
                }
              />
              <Button variant="outlined" component="label">
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  onChange={(e) => setEpisodeImage(e.target.files[0])}
                />
              </Button>

              {episodeImage && (
                <img
                  src={URL.createObjectURL(episodeImage)}
                  alt=""
                  style={{ width: 80, marginTop: 10 }}
                />
              )}

              <Button
                variant="outlined"
                onClick={() => handleCreateEpisode(season.id)}
              >
                + Episode
              </Button>
            </Box>

            {/* EPISODES LIST */}
            {episodes[season.id]?.map((ep) => (
              <Box
                key={ep.id}
                mt={2}
                display="flex"
                gap={2}
                alignItems="center"
              >
                {ep.thumbnail && (
                  <img
                    src={ep.thumbnail}
                    alt=""
                    style={{ width: 80, borderRadius: 6 }}
                  />
                )}

                <Typography>
                  {ep.number}. {ep.title}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
