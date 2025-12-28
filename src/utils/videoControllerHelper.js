function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const map = [
    { sec: 31536000, label: "year" },
    { sec: 2592000, label: "month" },
    { sec: 86400, label: "day" },
    { sec: 3600, label: "hour" },
    { sec: 60, label: "minute" },
  ];

  for (const unit of map) {
    const count = Math.floor(seconds / unit.sec);
    if (count >= 1) return `${count} ${unit.label}${count > 1 ? "s" : ""} ago`;
  }

  return "just now";
}


function formatViews(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M views";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K views";
  return `${n} views`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [
    h > 0 ? h.toString().padStart(2, "0") : null,
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ]
  .filter(Boolean)
  .join(":");
}
export { timeAgo, formatViews, formatDuration };