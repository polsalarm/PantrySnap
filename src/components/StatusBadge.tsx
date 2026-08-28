import type { ExpiryStatus } from '../lib/expiry';
import { expiryLabel } from '../lib/expiry';

const STYLES: Record<ExpiryStatus, string> = {
  fresh: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
  soon: 'bg-amber-100 text-amber-900 border border-amber-200/80',
  expired: 'bg-red-100 text-danger border border-red-200/80',
};

export default function StatusBadge({ status, dateIso }: { status: ExpiryStatus; dateIso: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STYLES[status]}`}>
      {expiryLabel(dateIso)}
    </span>
  );
}
