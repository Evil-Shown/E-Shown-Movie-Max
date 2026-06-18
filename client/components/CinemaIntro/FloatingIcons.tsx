const ICONS = [
  { left: "8%", delay: "0s", type: "film" },
  { left: "22%", delay: "0.6s", type: "star" },
  { left: "45%", delay: "1.2s", type: "popcorn" },
  { left: "68%", delay: "1.8s", type: "ticket" },
  { left: "85%", delay: "2.4s", type: "reel" }
] as const;

function Icon({ type }: { type: (typeof ICONS)[number]["type"] }) {
  const stroke = "#F59E0B";
  if (type === "film") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="6" width="16" height="12" rx="1" stroke={stroke} strokeWidth="1.5" />
        <path d="M8 6v12M12 6v12M16 6v12" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  if (type === "star") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l2.4 5.8 6.3.5-4.8 4.1 1.5 6.1L12 16.8 6.6 19.5l1.5-6.1-4.8-4.1 6.3-.5L12 3z"
          stroke={stroke}
          strokeWidth="1.2"
          fill="rgba(245,158,11,0.15)"
        />
      </svg>
    );
  }
  if (type === "popcorn") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 14 L9 8 L11 14 L13 7 L15 14 L17 9 L19 14 Z" fill="rgba(245,158,11,0.3)" stroke={stroke} />
        <path d="M6 14 h12 v5 a2 2 0 0 1-2 2 H8 a2 2 0 0 1-2-2 v-5z" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === "ticket") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="8" rx="2" stroke={stroke} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.5" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="1.5" />
      <line x1="12" y1="4" x2="12" y2="20" stroke={stroke} />
      <line x1="4" y1="12" x2="20" y2="12" stroke={stroke} />
    </svg>
  );
}

export default function FloatingIcons() {
  return (
    <div className="cinema-floating-icons" aria-hidden="true">
      {ICONS.map((icon) => (
        <div
          key={icon.type}
          className="cinema-float-icon"
          style={{ left: icon.left, animationDelay: icon.delay }}
        >
          <Icon type={icon.type} />
        </div>
      ))}
    </div>
  );
}
