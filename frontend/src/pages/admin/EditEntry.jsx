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
  // 🔥 NOVO STATE
  const [episodeImages, setEpisodeImages] = useState({});
  const [entryImage, setEntryImage] = useState(null);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [editData, setEditData] = useState({});

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

  const getNextSeasonNumber = () => {
    return seasons.length + 1;
  };

  const handleCreateSeason = async () => {
    try {
      const seasonNumber = getNextSeasonNumber();

      await api.post(`/seasons/entries/${id}`, {
        seasonNumber,
      });

      fetchSeasons();
    } catch (err) {
      console.error(err);
    }
  };

  const getNextEpisodeNumber = (seasonId) => {
    const seasonEpisodes = episodes[seasonId] || [];
    return seasonEpisodes.length + 1;
  };

  const generateEpisodeTitle = (seasonNumber, episodeNumber) => {
    return `S${seasonNumber}.E${episodeNumber}`;
  };

  const handleCreateEpisode = async (season) => {
    try {
      const episodeNumber = getNextEpisodeNumber(season.id);
      const title = generateEpisodeTitle(season.seasonNumber, episodeNumber);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("number", episodeNumber);

      if (episodeImages[season.id]) {
        formData.append("image", episodeImages[season.id]);
      }

      await api.post(`/episodes/season/${season.id}`, formData);

      fetchEpisodes(season.id);

      setEpisodeImages((prev) => ({
        ...prev,
        [season.id]: null,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      formData.append("title", entry.title);
      formData.append("description", entry.description);

      if (entryImage) {
        formData.append("image", entryImage);
      }

      await api.put(`/entries/${id}`, formData);

      alert("Updated!");
      fetchEntry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm("Delete season?")) return;

    await api.delete(`/seasons/${seasonId}`);

    fetchSeasons();
  };

  const handleUpdateEpisode = async (id, seasonId) => {
    try {
      const formData = new FormData();

      formData.append("title", editData.title);
      formData.append("number", editData.number);

      if (editData.image) {
        formData.append("image", editData.image);
      }

      await api.put(`/episodes/${id}`, formData);

      setEditingEpisode(null);
      fetchEpisodes(seasonId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEpisode = async (id, seasonId) => {
    if (!window.confirm("Delete episode?")) return;

    await api.delete(`/episodes/${id}`);

    fetchEpisodes(seasonId);
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

      {entry.type === "series" && (
        <>
          <Typography mt={4} variant="h6">
            Seasons
          </Typography>

          {/* ADD SEASON */}
          <Box
            display="flex"
            gap={2}
            mt={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Button variant="contained" onClick={handleCreateSeason}>
              + Add Season
            </Button>
          </Box>
        </>
      )}

      {/* LIST SEASONS */}
      {seasons.map((season) => (
        <Accordion key={season.id} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Season {season.seasonNumber}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Button
              color="error"
              size="small"
              onClick={() => handleDeleteSeason(season.id)}
            >
              Delete Season
            </Button>
            {/* LOAD EPISODES */}
            <Button size="small" onClick={() => fetchEpisodes(season.id)}>
              Load Episodes
            </Button>

            {/* ADD EPISODE */}
            <Box
              display="flex"
              gap={2}
              mt={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="body2">
                Next: S{season.seasonNumber}.E{getNextEpisodeNumber(season.id)}
              </Typography>
              <Button variant="outlined" component="label">
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setEpisodeImages((prev) => ({
                      ...prev,
                      [season.id]: e.target.files[0],
                    }))
                  }
                />
              </Button>

              {episodeImages[season.id] && (
                <img
                  src={URL.createObjectURL(episodeImages[season.id])}
                  alt=""
                  style={{ width: 80 }}
                />
              )}

              <Button
                variant="outlined"
                onClick={() => handleCreateEpisode(season)}
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

                {/* 🔥 SE ESTIVER A EDITAR */}
                {editingEpisode === ep.id ? (
                  <>
                    <TextField
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />

                    <TextField
                      value={editData.number}
                      onChange={(e) =>
                        setEditData({ ...editData, number: e.target.value })
                      }
                    />

                    <Button variant="outlined" component="label">
                      Change Image
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            image: e.target.files[0],
                          })
                        }
                      />
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => handleUpdateEpisode(ep.id, season.id)}
                    >
                      Save
                    </Button>

                    <Button onClick={() => setEditingEpisode(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography>
                      {ep.number}. {ep.title}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => {
                        setEditingEpisode(ep.id);
                        setEditData({
                          title: ep.title,
                          number: ep.number,
                        });
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleDeleteEpisode(ep.id, season.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
