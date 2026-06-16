import type { ExpiryStatus } from '../lib/expiry';
import { expiryLabel } from '../lib/expiry';

const STYLES: Record<ExpiryStatus, string> = {
  fresh: 'bg-primary-soft text-primary-dark',
  soon: 'bg-warn-soft text-accent-dark',
  expired: 'bg-danger/10 text-danger',
};

export default function StatusBadge({ status, dateIso }: { status: ExpiryStatus; dateIso: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STYLES[status]}`}>
      {expiryLabel(dateIso)}
    </span>
  );
}
