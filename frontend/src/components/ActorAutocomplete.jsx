import { useEffect, useState } from "react";
import { TextField, Box, CircularProgress } from "@mui/material";
import api from "../services/api";

export default function ActorAutocomplete({ onSelect, inputRef }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length >= 2) {
        searchActors(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const searchActors = async (q) => {
    try {
      setLoading(true);
      const res = await api.get(`/actors/search?q=${q}`);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (actor) => {
    setQuery(actor.name);
    setResults([]);
    onSelect(actor); // 🔥 send to parent
  };

  const handleCreate = async () => {
    try {
      const res = await api.post("/actors", { name: query });
      handleSelect(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box position="relative">
      <TextField
        inputRef={inputRef}
        label="Search Actor"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Dropdown */}
      {Array.isArray(results) && query.length >= 2 && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 1,
            mt: 1,
            zIndex: 10,
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          {results.length === 0 && (
            <Box sx={{ p: 1, color: "#888" }}>No actors found</Box>
          )}
          {results.map((actor) => (
            <Box
              key={actor.id}
              onClick={() => handleSelect(actor)}
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { background: "#eee" },
              }}
            >
              {actor.profileImage && (
                <img
                  src={actor.profileImage}
                  alt=""
                  style={{ width: 30, height: 30, borderRadius: "50%" }}
                />
              )}
              {actor.name}
            </Box>
          ))}

          {/* Create option */}
          <Box
            onClick={handleCreate}
            sx={{
              p: 1,
              cursor: "pointer",
              borderTop: "1px solid #ddd",
              fontWeight: "bold",
              "&:hover": { background: "#eee" },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus-lg"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
              />
            </svg>{" "}
            Create "{query}"
          </Box>
        </Box>
      )}

      {loading && (
        <CircularProgress
          size={20}
          sx={{ position: "absolute", right: 10, top: 15 }}
        />
      )}
    </Box>
  );
}
