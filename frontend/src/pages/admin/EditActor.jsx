import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function EditActor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actor, setActor] = useState(null);
  const [image, setImage] = useState(null);

  const fetchActor = async () => {
    const res = await api.get(`/actors/${id}`);
    setActor(res.data);
  };

  useEffect(() => {
    fetchActor();
  }, [id]);

  const handleSave = async () => {
    const formData = new FormData();

    formData.append("name", actor.name);
    formData.append("bio", actor.bio || "");

    if (image) formData.append("image", image);

    await api.put(`/actors/${id}`, formData);

    alert("Actor updated!");
    fetchActor();
  };

  if (!actor) return <p>Loading...</p>;

  return (
    <Box p={3}>
      <Button onClick={() => navigate("/admin?tab=actors")}>
        ← Back
      </Button>

      <Typography variant="h5">Edit Actor</Typography>

      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={actor.name}
        onChange={(e) => setActor({ ...actor, name: e.target.value })}
      />

      <TextField
        label="Bio"
        fullWidth
        multiline
        rows={4}
        value={actor.bio || ""}
        onChange={(e) => setActor({ ...actor, bio: e.target.value })}
      />

      <Button component="label">
        Upload Image
        <input hidden type="file" onChange={(e) => setImage(e.target.files[0])} />
      </Button>

      <img
        src={image ? URL.createObjectURL(image) : actor.image}
        style={{ width: 120, borderRadius: 8 }}
      />

      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}