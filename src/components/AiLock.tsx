import { Link } from 'react-router-dom';
import Icon from './Icon';

// Shown in place of an AI feature when the user isn't signed in.
export default function AiLock({ label }: { label: string }) {
  return (
    <Link
      to="/account"
      className="flex items-center justify-center gap-2 bg-surface border border-border text-text-muted hover:border-primary/40 hover:text-text font-semibold rounded-xl py-3 px-4 card-shadow transition-all"
    >
      <Icon name="lock" className="text-base" />
      {label}
    </Link>
  );
}
