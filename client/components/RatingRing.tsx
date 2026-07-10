interface RatingRingProps {
  rating: number;
  size?: number;
  className?: string;
}

function ratingColor(rating: number): string {
  if (rating >= 7) return "#2E6B5E";
  if (rating >= 5) return "#C9943A";
  return "#8B3A2A";
}

export default function RatingRing({ rating, size = 36, className = "" }: RatingRingProps) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(rating / 10, 1);
  const offset = circumference * (1 - pct);
  const color = ratingColor(rating);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(28,25,23,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-[var(--text-primary)]">{rating.toFixed(1)}</span>
    </div>
  );
}
