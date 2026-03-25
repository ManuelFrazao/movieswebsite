import { useState } from "react";
import { Box, Button, Typography, MenuItem, Select } from "@mui/material";
import ActorAutocomplete from "./ActorAutocomplete";
import CharacterAutocomplete from "./CharacterAutocomplete";

export default function CastManager({ entryId, onChange, castData, setCastData }) {
  const [tempActor, setTempActor] = useState(null);
  const [tempCharacter, setTempCharacter] = useState(null);
  const [roleType, setRoleType] = useState("supporting");

  // 🔥 ADD CAST
  const addCast = () => {
    if (!tempActor || !tempCharacter) return;

    const newItem = {
      id: Date.now(),
      actor: tempActor,
      character: tempCharacter,
      roleType,
      order: castData.length + 1,
    };

    const updated = [...castData, newItem];
    setCastData(updated);
    onChange(updated);

    // reset
    setTempActor(null);
    setTempCharacter(null);
  };

  // ❌ REMOVE
  const removeCast = (id) => {
    const updated = castData.filter((c) => c.id !== id);
    setCastData(updated);
    onChange(updated);
  };

  // 🔼 DRAG LOGIC (simple version)
  const moveUp = (index) => {
    if (index === 0) return;

    const newCast = [...castData];
    [newCast[index - 1], newCast[index]] = [newCast[index], newCast[index - 1]];

    setCastData(newCast);
    onChange(newCast);
  };

  const moveDown = (index) => {
    if (index === castData.length - 1) return;

    const newCast = [...castData];
    [newCast[index + 1], newCast[index]] = [newCast[index], newCast[index + 1]];

    setCastData(newCast);
    onChange(newCast);
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Cast Manager</Typography>

      {/* ADD FORM */}
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <ActorAutocomplete onSelect={setTempActor} />
        <CharacterAutocomplete onSelect={setTempCharacter} />

        <Select value={roleType} onChange={(e) => setRoleType(e.target.value)}>
          <MenuItem value="main">Main</MenuItem>
          <MenuItem value="supporting">Supporting</MenuItem>
          <MenuItem value="guest">Guest</MenuItem>
        </Select>

        <Button variant="contained" onClick={addCast}>
          Add
        </Button>
      </Box>

      {/* LIST */}
      {castData.map((c, index) => (
        <Box
          key={c.id}
          display="flex"
          alignItems="center"
          gap={2}
          mt={2}
          p={1}
          border="1px solid #ccc"
          borderRadius={2}
        >
          <Typography>
            {index + 1}. {c.actor.name} → {c.character.name} ({c.roleType})
          </Typography>

          <Button onClick={() => moveUp(index)}>↑</Button>
          <Button onClick={() => moveDown(index)}>↓</Button>

          <Button color="error" onClick={() => removeCast(c.id)}>
            Remove
          </Button>
        </Box>
      ))}
    </Box>
  );
}