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

      formData.append("title", `${editData.prefix} ${editData.title}`.trim());
      formData.append("description", editData.description || "");
      formData.append("duration", editData.duration || "");

      if (editData.airDate) {
        formData.append("airDate", editData.airDate);
      }

      formData.append("isFinal", String(editData.isFinal));

      if (editData.image) {
        formData.append("image", editData.image);
      }

      const res = await api.put(`/episodes/${id}`, formData); // ✅ aqui

      const updatedEpisode = res.data;

      // 🔥 update local
      setEpisodes((prev) => ({
        ...prev,
        [seasonId]: prev[seasonId].map((ep) =>
          ep.id === id ? updatedEpisode : ep,
        ),
      }));

      setEditingEpisode(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEpisode = async (id, seasonId) => {
    if (!window.confirm("Delete episode?")) return;

    await api.delete(`/episodes/${id}`);

    fetchEpisodes(seasonId);
  };

  const formatDate = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
                flexDirection={editingEpisode === ep.id ? "column" : "row"}
                alignItems={editingEpisode === ep.id ? "" : "center"}
                gap={2}
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
                    <Box display="flex" gap={1} width="100%">
                      <TextField
                        value={editData.prefix}
                        disabled
                        sx={{ width: 100 }}
                      />

                      <TextField
                        label="Title"
                        fullWidth
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    </Box>

                    <TextField
                      label="Description"
                      multiline
                      rows={2}
                      value={editData.description || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="Duration (min)"
                      type="number"
                      value={editData.duration || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, duration: e.target.value })
                      }
                    />

                    <TextField
                      label="Air Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={editData.airDate || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, airDate: e.target.value })
                      }
                    />

                    <Button
                      color="warning"
                      variant={editData.isFinal ? "contained" : "outlined"}
                      onClick={() =>
                        setEditData({
                          ...editData,
                          isFinal: !editData.isFinal,
                        })
                      }
                    >
                      {editData.isFinal
                        ? "Final Episode ✓"
                        : "Mark as Series Finale"}
                    </Button>

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
                    <img
                      src={
                        editingEpisode === ep.id && editData.image
                          ? URL.createObjectURL(editData.image)
                          : ep.thumbnail
                      }
                      alt=""
                      style={{
                        width: 80,
                        borderRadius: 6,
                        alignSelf: "center",
                        border:
                          editingEpisode === ep.id
                            ? "2px solid #e50914"
                            : "none",
                      }}
                    />
                    {editingEpisode === ep.id && editData.image && (
                      <span style={{ fontSize: 12, color: "#aaa" }}>
                        New image preview
                      </span>
                    )}

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
                      {ep.title} - {formatDate(ep.airDate)} - {ep.duration} min
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => {
                        setEditingEpisode(ep.id);
                        const prefix = `S${season.seasonNumber}.E${ep.number}`;
                        const cleanTitle = ep.title
                          .replace(new RegExp(`^(${prefix}\\s*)+`), "")
                          .trim();
                        setEditData({
                          prefix,
                          title: cleanTitle,
                          number: ep.number,
                          description: ep.description || "",
                          duration: ep.duration || "",
                          airDate: ep.airDate ? ep.airDate.split("T")[0] : "",
                          isFinal: ep.isFinal ?? false,
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
