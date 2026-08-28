import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import BottomNav from './components/BottomNav';
import PhoneFrame from './components/PhoneFrame';
import PageTransition from './components/PageTransition';
import InstallPrompt from './components/InstallPrompt';
import UpdateFridgeFab from './components/UpdateFridgeFab';
import FridgeHome from './pages/FridgeHome';
import FridgeView from './pages/FridgeView';
import Profile from './pages/Profile';
import ShelfDetail from './pages/ShelfDetail';
import Items from './pages/Items';
import ItemForm from './pages/ItemForm';
import Alerts from './pages/Alerts';
import Chat from './pages/Chat';
import Welcome from './pages/Welcome';
import { navIndex } from './lib/motion';

const Account = lazy(() => import('./pages/Account'));

function AnimatedRoutes() {
  const location = useLocation();
  const [routeMotion, setRouteMotion] = useState({
    path: location.pathname,
    direction: 1,
  });

  // Derive slide direction when the path changes (React-supported render-time adjust).
  if (location.pathname !== routeMotion.path) {
    setRouteMotion({
      path: location.pathname,
      direction:
        Math.sign(navIndex(location.pathname) - navIndex(routeMotion.path)) || 1,
    });
  }
  const direction = routeMotion.direction;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition direction={direction}>
              <FridgeHome />
            </PageTransition>
          }
        />
        <Route
          path="/fridge"
          element={
            <PageTransition direction={direction}>
              <FridgeView />
            </PageTransition>
          }
        />
        <Route
          path="/profile"
          element={
            <PageTransition direction={direction}>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="/shelf/:shelfId"
          element={
            <PageTransition direction={direction}>
              <ShelfDetail />
            </PageTransition>
          }
        />
        <Route
          path="/items"
          element={
            <PageTransition direction={direction}>
              <Items />
            </PageTransition>
          }
        />
        <Route
          path="/items/new"
          element={
            <PageTransition direction={direction}>
              <ItemForm />
            </PageTransition>
          }
        />
        <Route
          path="/items/:itemId/edit"
          element={
            <PageTransition direction={direction}>
              <ItemForm />
            </PageTransition>
          }
        />
        <Route
          path="/alerts"
          element={
            <PageTransition direction={direction}>
              <Alerts />
            </PageTransition>
          }
        />
        <Route path="/recipes" element={<Navigate to="/" replace />} />
        <Route
          path="/chat"
          element={
            <PageTransition direction={direction}>
              <Chat />
            </PageTransition>
          }
        />
        <Route
          path="/account"
          element={
            <PageTransition direction={direction}>
              <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading…</div>}>
                <Account />
              </Suspense>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

/** Full-screen chat has its own bottom composer — the tab bar would fight it for space. */
function AppShell() {
  const location = useLocation();
  const hideNav =
    location.pathname === '/chat' ||
    location.pathname === '/items/new' ||
    location.pathname.endsWith('/edit');
  const showFridgeFab = location.pathname === '/' || location.pathname === '/fridge';

  return (
    <div className="h-full max-w-2xl mx-auto bg-bg relative">
      <Welcome />
      <AnimatedRoutes />
      {showFridgeFab && <UpdateFridgeFab />}
      {!hideNav && <BottomNav />}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </PhoneFrame>
    </MotionConfig>
  );
}
