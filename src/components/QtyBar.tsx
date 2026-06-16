export default function QtyBar({ pct, lowThreshold }: { pct: number; lowThreshold: number }) {
  const isLow = pct <= lowThreshold;
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-border-soft overflow-hidden">
        <div
          className={`h-full rounded-full ${isLow ? 'bg-accent' : 'bg-primary'}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <span className="text-xs text-text-muted">{pct}% left</span>
    </div>
  );
}
