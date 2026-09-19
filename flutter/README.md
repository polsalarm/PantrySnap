# PantrySnap (Flutter)

Native Android and iOS client for PantrySnap. Preview also runs on Flutter web.

After checkout, copy `../steve.png` to `flutter/assets/steve.png` (binary cannot be uploaded via API).

```bash
flutter pub get
flutter test
flutter run
```

Theme tokens, local pantry, recipe matching, Steve, and the four-tab shell live under `lib/`. Architecture notes are in the repo-root [MIGRATION.md](../MIGRATION.md).
