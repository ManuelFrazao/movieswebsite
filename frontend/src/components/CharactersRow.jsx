import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CharactersRow({ cast = [] }) {
  const navigate = useNavigate();
  if (!cast.length) return null;

  const uniqueCharacters = [];
  const map = new Map();

  cast.forEach((c) => {
    if (!map.has(c.character?.id)) {
      map.set(c.character?.id, c);
      uniqueCharacters.push(c);
    }
  });

  return (
    <Box mt={2}>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          py: 1,
        }}
      >
        {uniqueCharacters.map((c) => (
          <Box
            key={c.character.id}
            sx={{
              minWidth: 120,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={c.character?.image || "/placeholder.jpg"}
              sx={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: 2,
                mb: 0.5,
              }}
            />

            <Typography fontSize="0.85rem" onClick={() => navigate(`/character/slug/${c.character?.slug}`)}>
              {c.character?.name}
            </Typography>

            <Typography fontSize="0.7rem" color="#aaa">
              {c.actor?.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}