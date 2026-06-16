import { Link } from 'react-router-dom';
import Icon from './Icon';

// Shown in place of an AI feature when the user isn't signed in.
export default function AiLock({ label }: { label: string }) {
  return (
    <Link
      to="/account"
      className="flex items-center justify-center gap-2 bg-border-soft text-text-muted font-medium rounded-xl py-3 px-4"
    >
      <Icon name="lock" className="text-base" />
      {label}
    </Link>
  );
}
