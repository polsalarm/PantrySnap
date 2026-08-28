
interface IconProps {
  className?: string;
  size?: number;
}

export function FridgeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Fridge body */}
      <rect x="14" y="6" width="36" height="52" rx="8" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3" />
      {/* Split freezer line */}
      <line x1="14" y1="24" x2="50" y2="24" stroke="#0284C7" strokeWidth="2.5" />
      {/* Upper handle */}
      <rect x="18" y="12" width="3" height="8" rx="1.5" fill="#38BDF8" />
      {/* Lower handle */}
      <rect x="18" y="28" width="3" height="14" rx="1.5" fill="#38BDF8" />
      {/* Feet */}
      <rect x="18" y="58" width="6" height="3" rx="1.5" fill="#475569" />
      <rect x="40" y="58" width="6" height="3" rx="1.5" fill="#475569" />
      {/* Magnetic memo notes */}
      <rect x="34" y="11" width="7" height="7" rx="1" fill="#FEF08A" transform="rotate(8 34 11)" />
      <rect x="36" y="32" width="8" height="9" rx="1" fill="#FCA5A5" transform="rotate(-6 36 32)" />
    </svg>
  );
}

export function InventoryIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Box */}
      <path d="M10 22L32 10L54 22L32 34L10 22Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
      <path d="M10 22L10 46L32 58L32 34L10 22Z" fill="#D97706" stroke="#B45309" strokeWidth="2.5" />
      <path d="M54 22L54 46L32 58L32 34L54 22Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
      {/* Tape */}
      <path d="M26 13L38 20L38 44L26 37Z" fill="#FEF3C7" opacity="0.8" />
    </svg>
  );
}

export function StormAlertIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Cloud */}
      <path d="M16 28A10 10 0 0 1 30 18A12 12 0 0 1 48 24A9 9 0 0 1 48 38L16 38A8 8 0 0 1 16 28Z" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" />
      {/* Lightning bolt */}
      <path d="M34 34L24 46L33 46L28 60L42 44L33 44L38 34Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    </svg>
  );
}

export function RecipeBookIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Book Cover */}
      <rect x="12" y="10" width="40" height="48" rx="4" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
      {/* Spine */}
      <rect x="12" y="10" width="8" height="48" rx="2" fill="#991B1B" />
      {/* Chef Hat Emblem */}
      <path d="M28 28C26 24 30 20 34 20C38 20 42 24 40 28C44 29 44 34 40 36L28 36C24 34 24 29 28 28Z" fill="#FFFFFF" />
      <rect x="28" y="36" width="12" height="3" rx="1" fill="#FFFFFF" />
      {/* Fork & Spoon */}
      <line x1="28" y1="44" x2="40" y2="44" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="49" x2="38" y2="49" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FldsmdfrIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Capsule body */}
      <rect x="16" y="8" width="32" height="38" rx="12" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
      {/* Orange stripes */}
      <path d="M16 18L48 18M16 40L48 40" stroke="#F97316" strokeWidth="4" />
      {/* CRT Screen */}
      <circle cx="32" cy="28" r="9" fill="#0C4A6E" stroke="#0284C7" strokeWidth="2" />
      <circle cx="32" cy="28" r="6" fill="#0284C7" />
      <path d="M28 28L36 28" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Nozzle */}
      <path d="M26 46L38 46L32 54Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
      {/* Spring legs */}
      <path d="M20 46L14 58M44 46L50 58" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
