export function formatVotes(num) {
  if (num == null) return "0";

  if (num < 1000) return `${num}`;

  if (num < 1_000_000) {
    const value = num / 1000;
    return `${Number(value.toFixed(1))}K`;
  }

  const value = num / 1_000_000;
  return `${Number(value.toFixed(1))}M`;
}