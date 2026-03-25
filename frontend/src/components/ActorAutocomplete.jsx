import { useEffect, useState, useRef } from "react";
import { TextField, Box, CircularProgress } from "@mui/material";
import api from "../services/api";

export default function ActorAutocomplete({ onSelect, inputRef }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchActors = async (q) => {
    try {
      setLoading(true);
      const res = await api.get(`/actors/search?q=${encodeURIComponent(q)}`);
      setResults(Array.isArray(res.data) ? res.data : []);
      setOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (actor) => {
    setQuery(actor.name);
    setResults([]);
    setOpen(false);
    onSelect(actor);
  };

  const handleCreate = async () => {
    const res = await api.post("/actors", { name: query });
    handleSelect(res.data);
  };

  return (
    <Box position="relative" ref={containerRef}>
      <TextField
        inputRef={inputRef}
        label="Search Actor"
        fullWidth
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />

      {open && query.length >= 2 && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            background: "#fff",
            zIndex: 10,
          }}
        >
          {results.length === 0 && (
            <Box sx={{ p: 1, color: "#888", fontStyle: "italic" }}>
              No actors found
            </Box>
          )}

          {results.map((actor) => (
            <Box
              key={actor.id}
              onClick={() => handleSelect(actor)}
              sx={{
                p: 1,
                cursor: "pointer",
                color: "#111", // ✅ strong readable text
                "&:hover": {
                  background: "#eee",
                },
              }}
            >
              {actor.name}
            </Box>
          ))}

          <Box
            onClick={handleCreate}
            sx={{
              p: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer", // ✅ FIX
              borderTop: "1px solid #ddd",
              fontWeight: "bold",
              "&:hover": {
                background: "#eee",
                transform: "scale(1.01)",
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd" // ✅ FIX
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
              />
            </svg>
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
