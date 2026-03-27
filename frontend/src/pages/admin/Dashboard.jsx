import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

// MUI
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tabFromUrl = params.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState(null);
  const [actors, setActors] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");

  const fetchSeasons = async (entryId) => {
    const res = await api.get(`/seasons/entry/${entryId}`);
    setSeasons(res.data);
  };

  const fetchEpisodes = async (seasonId) => {
    const res = await api.get(`/episodes/season/${seasonId}`);
    setEpisodes(res.data);
  };

  const fetchCharacters = async (entryId) => {
    const res = await api.get(`cast/characters/entry/${entryId}`);
    setCharacters(res.data);
  };

  const fetchActors = async () => {
    const res = await api.get("/actors");
    setActors(res.data);
  };

  useEffect(() => {
    fetchActors();
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) navigate("/login");
    else setToken(t);
  }, []);

  const [newEntry, setNewEntry] = useState({
    title: "",
    type: "movie",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchEntries();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;
      console.error(err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get("/entries");
      setEntries(res.data);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;
      console.error(err);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", newEntry.title);
    formData.append("type", newEntry.type);
    formData.append("description", newEntry.description);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await api.post("/entries", formData);

    fetchEntries();
    setShowForm(false);
  };

  const handleDeleteEntry = async (id) => {
    await api.delete(`/entries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDeleteActor = async (id) => {
    if (!window.confirm("Delete actor?")) return;

    await api.delete(`/actors/${id}`);

    setActors(actors.filter((a) => a.id !== id));
  };

  const handleDeleteCharacter = async (id) => {
    if (!window.confirm("Delete character?")) return;

    await api.delete(`/characters/${id}`);

    setCharacters(characters.filter((c) => c.id !== id));
  };

  const handleDeleteEpisode = async (id) => {
    if (!window.confirm("Delete episode?")) return;

    await api.delete(`/episodes/${id}`);

    setEpisodes(episodes.filter((e) => e.id !== id));
  };

  // 🔥 TABLE COLUMNS

  const userColumns = [
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", width: 120 },
  ];

  const actorColumns = [
    {
      field: "image",
      headerName: "Image",
      renderCell: (params) => (
        <img src={params.row.profileImage} style={{ width: 40, borderRadius: 6, objectFit: "cover"}} />
      ),
      width: 80,
    },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => navigate(`/admin/actors/${params.row.id}`)}>
            Edit
          </Button>

          <Button
            color="error"
            onClick={() => handleDeleteActor(params.row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const entryColumns = [
    {
      field: "coverImage",
      headerName: "Cover",
      renderCell: (params) => (
        <img
          src={params.value}
          alt=""
          style={{ width: 40, height: 60, objectFit: "cover" }}
        />
      ),
      width: 80,
    },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "type", headerName: "Type", width: 120 },

    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            gap: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "inherit",
          }}
        >
          {/* 🔥 EDIT */}
          <Button
            variant="outlined"
            onClick={() => navigate(`/admin/entries/${params.row.id}`)}
          >
            Edit
          </Button>

          {/* DELETE */}
          <Button
            color="error"
            onClick={() => handleDeleteEntry(params.row.id)}
          >
            Delete
          </Button>
        </div>
      ),
      width: 200,
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Drawer variant="permanent">
        <Box sx={{ width: 220, p: 2 }}>
          <Typography variant="h6">🎬 Admin</Typography>
          <Box mb={2}>
            <Button variant="outlined" onClick={() => navigate("/")}>
              ← Back to site
            </Button>
          </Box>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("overview")}>
                <ListItemText primary="Overview" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("users")}>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("entries")}>
                <ListItemText primary="Entries" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("actors")}>
                <ListItemText primary="Actors" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("characters")}>
                <ListItemText primary="Characters" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setActiveTab("episodes")}>
                <ListItemText primary="Episodes" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* MAIN */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Users</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Movies</Typography>
                  <Typography variant="h4">
                    {entries.filter((e) => e.type === "movie").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Series</Typography>
                  <Typography variant="h4">
                    {entries.filter((e) => e.type === "series").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* USERS TABLE */}
        {activeTab === "users" && (
          <Box>
            <Typography variant="h5" mb={2}>
              Users
            </Typography>

            <DataGrid
              rows={users}
              columns={userColumns}
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        )}

        {/* ENTRIES TABLE */}
        {activeTab === "entries" && (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Entries</Typography>

              <Button
                variant="contained"
                onClick={() => setShowForm(!showForm)}
              >
                + Add
              </Button>
            </Box>

            {/* FORM */}
            {showForm && (
              <Box component="form" onSubmit={handleCreateEntry} mb={3}>
                <TextField
                  label="Title"
                  fullWidth
                  margin="normal"
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.target.value })
                  }
                />

                <TextField
                  select
                  label="Type"
                  fullWidth
                  margin="normal"
                  value={newEntry.type}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, type: e.target.value })
                  }
                >
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="series">Series</MenuItem>
                </TextField>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Button variant="outlined" component="label">
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </Button>

                  {imageFile && (
                    <>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="preview"
                        style={{
                          width: 100,
                          borderRadius: 8,
                        }}
                      />

                      <p>{imageFile.name}</p>

                      {/* 🔥 BOTÃO REMOVER */}
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => setImageFile(null)}
                      >
                        Remove Image
                      </Button>
                    </>
                  )}
                </div>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, description: e.target.value })
                  }
                />

                <Button type="submit" variant="contained">
                  Create
                </Button>
              </Box>
            )}

            <DataGrid
              rows={entries}
              columns={entryColumns}
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        )}

        {activeTab === "actors" && (
          <Box>
            <Typography variant="h5" mb={2}>
              Actors
            </Typography>

            <DataGrid
              rows={actors}
              columns={actorColumns}
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        )}

        {activeTab === "characters" && (
          <Box>
            <Typography variant="h5" mb={2}>
              Characters
            </Typography>
            <TextField
              select
              label="Select Entry"
              fullWidth
              margin="normal"
              value={selectedEntry}
              onChange={(e) => {
                setSelectedEntry(e.target.value);
                fetchCharacters(e.target.value);
              }}
            >
              {entries.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.title}
                </MenuItem>
              ))}
            </TextField>
            <DataGrid
              rows={characters}
              columns={[
                { field: "name", headerName: "Name", flex: 1 },

                {
                  field: "actions",
                  headerName: "Actions",
                  width: 200,
                  renderCell: (params) => (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        onClick={() =>
                          navigate(`/admin/characters/${params.row.id}`)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        onClick={() => handleDeleteCharacter(params.row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        )}

        {activeTab === "episodes" && (
          <Box>
            <Typography variant="h5" mb={2}>
              Episodes
            </Typography>
            <TextField
              select
              label="Entry"
              fullWidth
              margin="normal"
              value={selectedEntry}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedEntry(val);
                fetchSeasons(val);
              }}
            >
              {entries.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Season"
              fullWidth
              margin="normal"
              value={selectedSeason}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSeason(val);
                fetchEpisodes(val);
              }}
            >
              {seasons.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  Season {s.number}
                </MenuItem>
              ))}
            </TextField>
            <DataGrid
              rows={episodes}
              columns={[
                { field: "number", headerName: "Ep", width: 80 },
                { field: "title", headerName: "Title", flex: 1 },

                {
                  field: "actions",
                  headerName: "Actions",
                  width: 200,
                  renderCell: (params) => (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        onClick={() =>
                          navigate(`/admin/episodes/${params.row.id}`)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        onClick={() => handleDeleteEpisode(params.row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
