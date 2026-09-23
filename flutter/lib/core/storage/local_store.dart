import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/pantry/data/seed.dart';
import '../../features/pantry/domain/cook_entry.dart';
import '../../features/pantry/domain/item.dart';

class LocalStore {
  LocalStore(this._prefs);

  final SharedPreferences _prefs;

  static const itemsKey = 'pantrysnap.items.v1';
  static const cookLogKey = 'pantrysnap.cookLog.v1';
  static const onboardedKey = 'pantrysnap.onboarded.v1';
  static const savedKey = 'pantrysnap.saved.v1';
  static const seedFlagKey = 'pantrysnap.itemSeed.v3';

  bool get onboarded => _prefs.getBool(onboardedKey) ?? false;

  Future<void> setOnboarded(bool value) => _prefs.setBool(onboardedKey, value);

  List<String> get savedRecipeIds {
    final raw = _prefs.getStringList(savedKey) ?? const [];
    return List<String>.from(raw);
  }

  Future<void> setSavedRecipeIds(List<String> ids) =>
      _prefs.setStringList(savedKey, ids);

  List<PantryItem> readItems() {
    final raw = _prefs.getString(itemsKey);
    if (raw == null || raw.isEmpty) return <PantryItem>[];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => PantryItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> writeItems(List<PantryItem> items) {
    return _prefs.setString(
      itemsKey,
      jsonEncode(items.map((e) => e.toJson()).toList()),
    );
  }

  List<CookEntry> readCookLog() {
    final raw = _prefs.getString(cookLogKey);
    if (raw == null || raw.isEmpty) return <CookEntry>[];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => CookEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> writeCookLog(List<CookEntry> entries) {
    return _prefs.setString(
      cookLogKey,
      jsonEncode(entries.map((e) => e.toJson()).toList()),
    );
  }

  Future<void> ensureSeeded() async {
    if (_prefs.getBool(seedFlagKey) ?? false) return;
    final existing = readItems();
    if (existing.isEmpty) {
      await writeItems(buildSeedItems());
    }
    await _prefs.setBool(seedFlagKey, true);
  }

  Future<void> resetDemoKitchen() async {
    await writeItems(buildSeedItems());
    await writeCookLog(const []);
    await setSavedRecipeIds(const []);
    await _prefs.setBool(seedFlagKey, true);
  }
}

final localStoreProvider = Provider<LocalStore>((ref) {
  throw StateError('localStoreProvider must be overridden in main()');
});
