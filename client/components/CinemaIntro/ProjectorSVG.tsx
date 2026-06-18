export default function ProjectorSVG() {
  return (
    <svg
      className="cinema-projector"
      width="120"
      height="90"
      viewBox="0 0 120 90"
      fill="none"
      aria-hidden="true"
    >
      <rect x="18" y="38" width="72" height="32" rx="6" fill="#3f3f46" />
      <rect x="18" y="34" width="72" height="8" rx="3" fill="#52525b" />
      <circle cx="30" cy="54" r="10" fill="#27272a" stroke="#71717a" strokeWidth="2" />
      <circle cx="30" cy="54" r="6" fill="#52525b" />
      <circle cx="30" cy="54" r="2" fill="#fafafa" />
      <circle cx="52" cy="28" r="11" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />
      <circle cx="52" cy="28" r="4" fill="#52525b" />
      <line x1="52" y1="17" x2="52" y2="39" stroke="#71717a" strokeWidth="1" />
      <line x1="41" y1="28" x2="63" y2="28" stroke="#71717a" strokeWidth="1" />
      <circle cx="68" cy="28" r="11" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />
      <circle cx="68" cy="28" r="4" fill="#52525b" />
      <line x1="68" y1="17" x2="68" y2="39" stroke="#71717a" strokeWidth="1" />
      <line x1="57" y1="28" x2="79" y2="28" stroke="#71717a" strokeWidth="1" />
      <rect x="40" y="70" width="8" height="10" rx="2" fill="#52525b" />
      <rect x="72" y="70" width="8" height="10" rx="2" fill="#52525b" />
      <circle cx="58" cy="50" r="1.5" fill="#F59E0B" />
      <circle cx="64" cy="50" r="1.5" fill="#F59E0B" />
      <path className="cinema-projector-beam" d="M30 54 L60 0 L90 54 Z" fill="url(#beamGrad)" />
      <defs>
        <linearGradient id="beamGrad" x1="30" y1="54" x2="60" y2="0">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
