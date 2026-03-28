import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CastRow({ role }) {
  const navigate = useNavigate();
  const [actorFavs, setActorFavs] = useState(0);
  const [charFavs, setCharFavs] = useState(0);

  useEffect(() => {
    // fetch actor favorites count
    if (role.actor?.id) {
      api
        .get(`/actors/${role.actor.id}`)
        .then((res) => setActorFavs(res.data.favoritesCount || 0))
        .catch(() => {});
    }

    // fetch character favorites count
    if (role.character?.id) {
      api
        .get(`/characters/${role.character.id}`)
        .then((res) => setCharFavs(res.data.favoritesCount || 0))
        .catch(() => {});
    }
  }, [role.actor?.id, role.character?.id]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        padding: "0.75rem 0",
        borderBottom: "1px solid #1f1f1f",
        alignItems: "center",
      }}
    >
      {/* Actor column */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
        }}
        onClick={() =>
          role.actor?.slug && navigate(`/actor/${role.actor.slug}`)
        }
      >
        <img
          src={role.actor?.profileImage || "/placeholder.jpg"}
          alt={role.actor?.name}
          style={{
            width: "48px",
            height: "64px",
            objectFit: "cover",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            textAlign: "left",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>
            {role.actor?.name || "Unknown"}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.75rem",
              color: "#aaa",
              textTransform: "capitalize",
            }}
          >
            {role.roleType}
          </p>
          {actorFavs > 0 && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.7rem",
                color: "#e63946",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                fill="currentColor"
                class="bi bi-heart-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                />
              </svg>{" "}
              {actorFavs}
            </p>
          )}
        </div>
      </div>

      {/* Character column */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
        }}
        onClick={() =>
          role.character?.slug && navigate(`/character/${role.character.slug}`)
        }
      >
        <img
          src={role.character?.image || "/placeholder.jpg"}
          alt={role.character?.name}
          style={{
            width: "48px",
            height: "64px",
            objectFit: "cover",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            textAlign: "left",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>
            {role.character?.name || "Unknown"}
          </p>
          {charFavs > 0 && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.7rem",
                color: "#e63946",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                fill="currentColor"
                class="bi bi-heart-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                />
              </svg>{" "}
              {charFavs}
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

    console.log("cast roles:", cast.map(r => ({
    actor: r.actor?.name,
    character: r.character?.name,
    roleType: r.roleType,
    episodeId: r.episodeId,
    entryId: r.entryId,
  })));

  const roleOrder = { main: 0, supporting: 1, guest: 2 };

  const seen = new Map();
  cast.forEach((role) => {
    const key = `${role.actorId}-${role.characterId}`;
    if (!seen.has(key)) {
      seen.set(key, role);
    } else {
      const existing = seen.get(key);
      if (
        (roleOrder[role.roleType] ?? 3) < (roleOrder[existing.roleType] ?? 3)
      ) {
        seen.set(key, role);
      }
    }
  });

  const unique = [...seen.values()];
  const sorted = [...unique].sort(
    (a, b) => (roleOrder[a.roleType] ?? 3) - (roleOrder[b.roleType] ?? 3),
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          padding: "0.5rem 0",
          borderBottom: "1px solid #333",
          marginBottom: "0.25rem",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "#777",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Actor
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#777",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Character
        </span>
      </div>

      {sorted.map((role) => (
        <CastRow key={`${role.actorId}-${role.characterId}`} role={role} />
      ))}
    </div>
  );
}
