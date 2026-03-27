import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

export default function CastSelectorFromEntry({
  entryCast,
  castData,
  setCastData,
}) {
  const addFromEntry = (item) => {
    const newItem = {
      id: Date.now(),
      actor: item.actor,
      character: item.character,
      roleType: item.roleType,
      order: castData.length + 1,
    };

    setCastData([...castData, newItem]);
  };

  return (
    <Box>
      {entryCast.map((c) => {
        // 🔥 AQUI
        const alreadyAdded = castData.some(
          (item) =>
            item.actor?.id === c.actor.id &&
            item.character?.id === c.character.id
        );

        return (
          <Box
            key={c.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={1}
            border="1px solid #ccc"
            borderRadius={2}
            mt={1}
          >
            <Typography>
              {c.actor.name} → {c.character.name} ({c.roleType})
            </Typography>

            {/* 🔥 AQUI */}
            <Button
              onClick={() => addFromEntry(c)}
              disabled={alreadyAdded}
            >
              {alreadyAdded ? "Added" : "Add"}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}