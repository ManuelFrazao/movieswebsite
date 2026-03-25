import { useEffect, useState } from "react";
import { TextField, Box } from "@mui/material";
import api from "../services/api";

export default function CharacterAutocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length >= 2) {
        search(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const search = async (q) => {
    try {
      const res = await api.get(`/characters/search?q=${q}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (char) => {
    setQuery(char.name);
    setResults([]);
    onSelect(char);
  };

  const handleCreate = async () => {
    const res = await api.post("/characters", { name: query });
    handleSelect(res.data);
  };

  return (
    <Box position="relative">
      <TextField
        label="Character"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            background: "#fff",
            width: "100%",
            zIndex: 10,
          }}
        >
          {results.map((c) => (
            <Box
              key={c.id}
              onClick={() => handleSelect(c)}
              sx={{ p: 1, cursor: "pointer" }}
            >
              {c.name}
            </Box>
          ))}
          <Box onClick={handleCreate} sx={{ p: 1, fontWeight: "bold" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-plus-lg"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
              />
            </svg>{" "}
            Create "{query}"
          </Box>
        </Box>
      )}
    </Box>
  );
}
