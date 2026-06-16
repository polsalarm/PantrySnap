import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const KEY = 'pantrysnap.onboarded';

// First-run welcome card. Dismissed state persists in localStorage.
export default function Onboarding() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(KEY) === '1');
  if (dismissed) return null;

  function close() {
    localStorage.setItem(KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="animate-in bg-primary text-white rounded-2xl p-5 mb-6 card-shadow relative">
      <button
        onClick={close}
        aria-label="Dismiss welcome"
        className="absolute top-3 right-3 text-primary-soft"
      >
        <Icon name="close" />
      </button>
      <h3 className="text-lg font-bold">Welcome to PantrySnap 👋</h3>
      <p className="text-sm text-primary-soft mt-1">
        Snap a photo to add food, track what's expiring, and cook with what you have.
      </p>
      <div className="flex gap-2 mt-4">
        <Link
          to="/items/new"
          onClick={close}
          className="bg-white text-primary text-sm font-semibold rounded-full px-4 py-2 flex items-center gap-1.5"
        >
          <Icon name="photo_camera" /> Add first item
        </Link>
        <button onClick={close} className="text-sm text-primary-soft px-3 py-2">
          Skip
        </button>
      </div>
    </div>
  );
}
