import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CastRow({ role }) {
  const navigate = useNavigate();
  const [actorFavs, setActorFavs] = useState(role.actor?.favoritesCount || 0);
  const [charFavs, setCharFavs] = useState(role.character?.favoritesCount || 0);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
      padding: "0.75rem 0",
      borderBottom: "1px solid #1f1f1f",
      alignItems: "center",
    }}>
      {/* Actor column */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
        onClick={() => role.actor?.slug && navigate(`/actor/${role.actor.slug}`)}
      >
        <img
          src={role.actor?.profileImage || "/placeholder-actor.jpg"}
          alt={role.actor?.name}
          style={{
            width: "48px",
            height: "64px",
            objectFit: "cover",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>
            {role.actor?.name || "Unknown"}
          </p>
          <p style={{
            margin: "2px 0 0",
            fontSize: "0.75rem",
            color: "#aaa",
            textTransform: "capitalize",
          }}>
            {role.roleType}
          </p>
          {actorFavs > 0 && (
            <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#e63946" }}>
              ♥ {actorFavs}
            </p>
          )}
        </div>
      </div>

      {/* Character column */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
        onClick={() => role.character?.slug && navigate(`/character/${role.character.slug}`)}
      >
        <img
          src={role.character?.image || "/placeholder-character.jpg"}
          alt={role.character?.name}
          style={{
            width: "48px",
            height: "64px",
            objectFit: "cover",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>
            {role.character?.name || "Unknown"}
          </p>
          {charFavs > 0 && (
            <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#e63946" }}>
              ♥ {charFavs}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CastList({ cast }) {
  if (!cast || cast.length === 0) {
    return <p style={{ color: "#777" }}>No cast yet.</p>;
  }

  // deduplicate by actor+character
  const seen = new Set();
  const unique = cast.filter((role) => {
    const key = `${role.actorId}-${role.characterId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // sort: main first, then supporting, then guest
  const order = { main: 0, supporting: 1, guest: 2 };
  const sorted = [...unique].sort(
    (a, b) => (order[a.roleType] ?? 3) - (order[b.roleType] ?? 3)
  );

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid #333",
        marginBottom: "0.25rem",
      }}>
        <span style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Actor
        </span>
        <span style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Character
        </span>
      </div>

      {sorted.map((role) => (
        <CastRow key={`${role.actorId}-${role.characterId}`} role={role} />
      ))}
    </div>
  );
}