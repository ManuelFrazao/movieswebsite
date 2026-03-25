import { useEffect, useState, useRef } from "react";
import { TextField, Box } from "@mui/material";
import api from "../services/api";

export default function CharacterAutocomplete({
  onSelect,
  inputRef,
  disabled,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const containerRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = async (q) => {
    try {
      const res = await api.get(
        `/characters/search?q=${encodeURIComponent(q)}`,
      );
      setResults(Array.isArray(res.data) ? res.data : []);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (char) => {
    setQuery(char.name);
    setResults([]);
    setOpen(false);
    onSelect(char);
  };

  const handleCreate = async () => {
    const res = await api.post("/characters", { name: query });
    handleSelect(res.data);
  };

  return (
    <Box position="relative" ref={containerRef}>
      <TextField
        disabled={disabled}
        inputRef={inputRef}
        label="Character"
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
            background: "#fff",
            width: "100%",
            zIndex: 10,
          }}
        >
          {results.length === 0 && (
            <Box sx={{ p: 1, color: "#888", fontStyle: "italic" }}>
              No characters found
            </Box>
          )}

          {results.map((c) => (
            <Box
              key={c.id}
              onClick={() => handleSelect(c)}
              sx={{
                p: 1,
                cursor: "pointer",
                color: "#111", // ✅ strong readable text
                "&:hover": {
                  background: "#eee",
                },
              }}
            >
              {c.name}
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
    </Box>
  );
}
