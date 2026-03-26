import { Box, Typography } from "@mui/material";

export default function ActorsRow({ cast = [] }) {
  if (!cast.length) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          py: 1,
        }}
      >
        {cast.map((c) => (
          <Box
            key={c.id}
            sx={{
              minWidth: 120,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={c.actor?.image || "/placeholder.jpg"}
              sx={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: 2,
                mb: 0.5,
              }}
            />

            <Typography fontSize="0.85rem">
              {c.actor?.name}
            </Typography>

            <Typography fontSize="0.7rem" color="#aaa">
              {c.character?.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}