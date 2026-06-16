import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function TopBar({ title, account = true }: { title: string; account?: boolean }) {
  return (
    <header className="bg-bg flex items-center justify-between w-full px-5 py-3 max-w-2xl mx-auto sticky top-0 z-40">
      <h1 className="text-2xl font-bold text-primary tracking-tight">{title}</h1>
      {account && (
        <Link to="/account" aria-label="Account and sync" className="text-text-muted">
          <Icon name="account_circle" />
        </Link>
      )}
    </header>
  );
}
