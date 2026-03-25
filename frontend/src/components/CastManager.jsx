import { useState, useRef } from "react";
import { Box, Button, Typography, MenuItem, Select } from "@mui/material";
import ActorAutocomplete from "./ActorAutocomplete";
import CharacterAutocomplete from "./CharacterAutocomplete";

export default function CastManager({
  entryId,
  onChange,
  castData,
  setCastData,
}) {
  const [tempActor, setTempActor] = useState(null);
  const [tempCharacter, setTempCharacter] = useState(null);
  const [roleType, setRoleType] = useState("supporting");

  const characterRef = useRef();
  const actorRef = useRef();

  // 🔥 ADD CAST (manual button only)
  const addCast = () => {
    if (!tempActor || !tempCharacter) return;

    setCastData((prev) => {
      const exists = prev.some(
        (c) =>
          c.actor?.id === tempActor.id &&
          c.character?.id === tempCharacter.id
      );

      if (exists) return prev;

      const newItem = {
        id: Date.now(),
        actor: tempActor,
        character: tempCharacter,
        roleType,
        order: prev.length + 1,
      };

      const updated = [...prev, newItem];
      if (onChange) onChange(updated);
      return updated;
    });

    setTempCharacter(null);

    setTimeout(() => {
      characterRef.current?.focus();
    }, 0);
  };

  const normalizeOrder = (list) =>
    list.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

  const removeCast = (id) => {
    const updated = normalizeOrder(castData.filter((c) => c.id !== id));
    setCastData(updated);
    if (onChange) onChange(updated);
  };

  const moveUp = (index) => {
    if (index === 0) return;

    const newCast = [...castData];
    [newCast[index - 1], newCast[index]] = [
      newCast[index],
      newCast[index - 1],
    ];

    const updated = normalizeOrder(newCast);
    setCastData(updated);
    if (onChange) onChange(updated);
  };

  const moveDown = (index) => {
    if (index === castData.length - 1) return;

    const newCast = [...castData];
    [newCast[index + 1], newCast[index]] = [
      newCast[index],
      newCast[index + 1],
    ];

    const updated = normalizeOrder(newCast);
    setCastData(updated);
    if (onChange) onChange(updated);
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Cast Manager</Typography>

      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <ActorAutocomplete
          inputRef={actorRef}
          onSelect={(actor) => {
            setTempActor(actor);
            setTimeout(() => {
              characterRef.current?.focus();
            }, 0);
          }}
        />

        {tempActor && (
          <Typography sx={{ alignSelf: "center" }}>
            🎭 {tempActor.name}
          </Typography>
        )}

        <CharacterAutocomplete
          disabled={!tempActor}
          onSelect={setTempCharacter}
          inputRef={characterRef}
        />

        <Select
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
        >
          <MenuItem value="main">Main</MenuItem>
          <MenuItem value="supporting">Supporting</MenuItem>
          <MenuItem value="guest">Guest</MenuItem>
        </Select>

        {tempActor && (
          <Button
            onClick={() => {
              setTempActor(null);
              setTimeout(() => actorRef.current?.focus(), 0);
            }}
          >
            Change Actor
          </Button>
        )}

        <Button
          variant="contained"
          onClick={addCast}
          disabled={!tempActor || !tempCharacter}
        >
          Add Cast
        </Button>
      </Box>

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
            {index + 1}. {c.actor?.name || "❌"} →{" "}
            {c.character?.name || "❌"} ({c.roleType})
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