# PantrySnap — Flutter migration architecture

This document is the project audit and target architecture for the Flutter rebuild. The original React PWA stays at the repository root. The Flutter client lives in `flutter/`.

## 1. Project understanding

PantrySnap is a **local-first kitchen radar**. You photograph or type what is in the fridge, track quantity and expiry, and cook the soonest-to-expire food first. Steve, the kitchen mascot, answers pantry questions and ranks meals from on-hand stock.

The product is already mobile-first as a PWA. The Flutter rebuild keeps that intent and makes it a native Android / iOS app instead of a website in a phone frame.

## 2. Technology audit

| Layer | Existing | Flutter |
| --- | --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Tailwind v4 | Flutter 3, Dart 3 |
| State | Zustand + Dexie live queries | Riverpod `Notifier` |
| Navigation | react-router-dom 7 | go_router (shell + detail routes) |
| Local data | Dexie / IndexedDB | `shared_preferences` JSON store |
| Photos | Blob in IndexedDB | Deferred — detect stays on the proxy |
| Auth | Optional Supabase magic link | Guest-first; same optional backend |
| Sync | Optional Supabase RLS table `items` | Same contract when env is set |
| AI / data | Hono proxy (`server/`) | Dio client, same `/api` contract |
| Grounding | USDA FoodKeeper, Open Food Facts, TheMealDB | Unchanged — stays on the server |
| Secrets | Gemini + optional Spoonacular on the proxy | Never bundled in the app |
| Motion | Motion + GSAP | Flutter implicit animations + flutter_animate |
| PWA | vite-plugin-pwa | Native install; Flutter web used only for preview |

## 3. Feature inventory

| Feature | Existing implementation | Flutter implementation | Backend dependency | Difficulty |
| --- | --- | --- | --- | --- |
| Welcome | Full-screen GSAP splash | `WelcomeScreen` + onboarding flag | None | Low |
| Home / cook tonight | Recipe match + Gemini generate | Seed match + local/AI generate | Optional `/recipe/generate` | Medium |
| Visual fridge | Shelf illustration, 3-col slots | Same layout, Material glyphs | None | Medium |
| Add / edit item | Form + camera + detect | Form + estimated expiry | Optional `/detect`, `/expiry/analyze` | Medium |
| Alerts | Expiring / low-stock chips | Same filters and cards | None | Low |
| Steve chat | Gemini + pantry context | Local Steve + optional `/chat` | Optional | Medium |
| Profile stats | Cook log in Dexie | Same stats, local cook log | None | Low |
| Account / sync | Supabase OTP | Guest account screen; env-gated | Optional Supabase | Medium |
| Photo detect | Gemini vision via proxy | Not in this slice — keys stay server-side | Required | High |
| Push alerts | Web Notifications | Not in this slice | None | Medium |

## 4. Backend vs Flutter responsibilities

**Flutter client**

- UI, navigation, form validation
- Local pantry, cook log, saved recipes, onboarding
- Expiry math and recipe matching (same rules as the PWA)
- Offline Steve answers
- Calling public `/api` routes when `API_BASE` is set

**Backend (keep)**

- Gemini vision / chat / recipe generation
- Rate limits and CORS
- USDA FoodKeeper + Open Food Facts + TheMealDB
- Optional Supabase JWT verification

**Database**

- Device store for guest mode
- Supabase `items` (RLS, `auth.uid()`) for later sync

**Third-party**

- Gemini, TheMealDB, Open Food Facts — only through the proxy

Never put `GEMINI_API_KEY`, service-role keys, or OAuth secrets in the Flutter app.

## 5. Migration risks

- Photo detect and Gemini require a deployed proxy. The live Vercel app does not currently expose `/api/health` at the same origin.
- IndexedDB blobs do not exist on mobile. Photo storage needs files or a later upload path.
- Web Notifications are not FCM. Expiry reminders need a native follow-up.
- The PWA phone-frame / GSAP welcome is desktop-showcase chrome. Flutter drops the fake device and uses a real mobile shell.
- `google_fonts` fetches Plus Jakarta Sans at runtime. Release builds should vendor the font if offline-first typography matters.

## 6. Proposed Flutter stack

- **Architecture:** feature-first, thin domain, no freezed/codegen
- **State:** Riverpod — scales past a single ChangeNotifier without Bloc ceremony
- **Navigation:** go_router with a 4-tab `StatefulShellRoute`
- **Networking:** Dio + typed exceptions
- **Local storage:** SharedPreferences JSON (web + mobile, no isolate/codegen)
- **Auth:** guest-first; optional Supabase later via `--dart-define`
- **Models:** immutable Dart classes with `toJson` / `fromJson`
- **Testing:** unit tests for expiry, match, cook stats; widget tests for welcome and empty home

## 7. Target folder structure

```
flutter/lib/
  main.dart
  app/ app.dart  router.dart  theme/
  core/ config/  constants/  errors/  network/  storage/  utils/  widgets/
  features/
    onboarding/  pantry/  recipes/  alerts/  chat/  profile/  account/  shell/
```

## 8. Screen map

```
Welcome
   └─ (onboarded)
Home ── Recipe detail
Fridge ── Shelf detail ── Edit item
Steve (chat)
Profile ── Alerts
        ── All items ── Add / edit item
        ── Account
```

Bottom tabs: Home · Fridge · Steve · Profile. Adding stock is a full-screen form, not a tab — same as the PWA.

## 9. Migration roadmap

1. Flutter scaffold + theme tokens
2. Local store + seed pantry
3. Expiry + recipe match (ported logic)
4. Shell navigation
5. Home / Fridge / Alerts / Items / Form
6. Steve (local, then Dio)
7. Profile stats + account
8. Optional API_BASE + Supabase
9. Camera detect + FCM (later)
10. Tests and production config

## 10. First implementation task

Theme tokens + local pantry + Home/Fridge/Steve/Profile shell. That is the slice that proves the product is a mobile kitchen, not a ported webpage.

## Mapping

| React | Flutter |
| --- | --- |
| Component | Widget |
| Zustand / Dexie hook | Riverpod `KitchenController` |
| react-router | go_router |
| fetch / api.ts | Dio `ApiClient` |
| localStorage + IndexedDB | SharedPreferences |
| CSS variables | `AppColors` / `ThemeData` |
| BottomNav | `AppShell` glass bar |
| Steve PNG | `assets/steve.png` |
