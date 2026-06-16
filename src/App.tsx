import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import FridgeHome from './pages/FridgeHome';
import ShelfDetail from './pages/ShelfDetail';
import Items from './pages/Items';
import ItemForm from './pages/ItemForm';
import Alerts from './pages/Alerts';
import Recipes from './pages/Recipes';
import Chat from './pages/Chat';

// Lazy — pulls in the Supabase SDK only when the user opens Account.
const Account = lazy(() => import('./pages/Account'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen max-w-2xl mx-auto bg-bg">
        <Routes>
          <Route path="/" element={<FridgeHome />} />
          <Route path="/shelf/:shelfId" element={<ShelfDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:itemId/edit" element={<ItemForm />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/account"
            element={
              <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading…</div>}>
                <Account />
              </Suspense>
            }
          />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
