import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function EditCharacter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [character, setCharacter] = useState(null);
  const [image, setImage] = useState(null);
  const [aliases, setAliases] = useState([]);

  const fetchCharacter = async () => {
    const res = await api.get(`/characters/${id}`);
    setCharacter(res.data);
    setAliases(res.data.aliases || []);
  };

  useEffect(() => {
    fetchCharacter();
  }, [id]);

  const handleSave = async () => {
    const formData = new FormData();

    formData.append("name", character.name);
    formData.append("description", character.description || "");

    if (image) formData.append("image", image);

    await api.put(`/characters/${id}`, formData);

    // 🔥 salvar aliases
    await api.post(`/character-alias/bulk`, {
      characterId: id,
      aliases,
    });

    alert("Character updated!");
    fetchCharacter();
  };

  const handleAliasChange = (index, field, value) => {
    const updated = [...aliases];
    updated[index][field] = value;
    setAliases(updated);
  };

  const addAlias = () => {
    setAliases([
      ...aliases,
      { name: "", startSeason: null, endSeason: null },
    ]);
  };

  if (!character) return <p>Loading...</p>;

  return (
    <Box p={3}>
      <Button onClick={() => navigate("/admin?tab=characters")}>
        ← Back
      </Button>

      <Typography variant="h5">Edit Character</Typography>

      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={character.name}
        onChange={(e) =>
          setCharacter({ ...character, name: e.target.value })
        }
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={character.description || ""}
        onChange={(e) =>
          setCharacter({ ...character, description: e.target.value })
        }
      />

      {/* IMAGE */}
      <Button component="label">
        Upload Image
        <input hidden type="file" onChange={(e) => setImage(e.target.files[0])} />
      </Button>

      <img
        src={image ? URL.createObjectURL(image) : character.image}
        style={{ width: 120 }}
      />

      {/* ALIASES */}
      <Typography mt={3}>Aliases</Typography>

      {aliases.map((a, i) => (
        <Box key={i} display="flex" gap={1} mt={1}>
          <TextField
            label="Name"
            value={a.name}
            onChange={(e) =>
              handleAliasChange(i, "name", e.target.value)
            }
          />

          <TextField
            label="Start"
            type="number"
            value={a.startSeason || ""}
            onChange={(e) =>
              handleAliasChange(i, "startSeason", e.target.value)
            }
          />

          <TextField
            label="End"
            type="number"
            value={a.endSeason || ""}
            onChange={(e) =>
              handleAliasChange(i, "endSeason", e.target.value)
            }
          />
        </Box>
      ))}

      <Button onClick={addAlias}>+ Add Alias</Button>

      <Box mt={2}>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}