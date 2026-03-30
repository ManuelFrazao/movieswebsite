export default function RatingBadge({ value, votes, size = "small" }) {
  if (!value || value <= 0) return null;

  const getRatingColor = (value) => {
    if (value <= 3) return "#e50914";
    if (value <= 5) return "#ff7043";
    if (value <= 7) return "#ff9800";
    if (value <= 8.5) return "#8bc34a";
    return "#4caf50";
  };

  const color = getRatingColor(Number(value));

  // 🔥 votes can be a number or pre-formatted string
  const formatVoteLabel = (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "number") {
      return v === 1 ? "1 vote" : `${v.toLocaleString()} votes`;
    }
    // already a string — can't know if singular, just display as-is
    return `${v} votes`;
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{
        background: color,
        color: "#fff",
        padding: size === "large" ? "4px 10px" : "2px 8px",
        borderRadius: "6px",
        fontSize: size === "large" ? "14px" : "12px",
        fontWeight: "bold",
        minWidth: "32px",
        textAlign: "center",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      }}>
        {Number(value).toFixed(1)}
      </span>
      {votes !== undefined && (
        <span style={{ color: "#aaa", fontSize: "12px" }}>
          {formatVoteLabel(votes)}
        </span>
      )}
    </span>
  );
}