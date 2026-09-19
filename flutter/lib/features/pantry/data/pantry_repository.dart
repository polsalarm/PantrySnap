import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/constants/catalog.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/local_store.dart';
import '../../recipes/domain/recipe.dart';
import '../domain/cook_entry.dart';
import '../domain/expiry.dart';
import '../domain/item.dart';

class PantryRepository {
  PantryRepository(this._store, this._api);

  final LocalStore _store;
  final ApiClient _api;
  final _uuid = const Uuid();

  List<PantryItem> items() {
    final next = List<PantryItem>.from(_store.readItems());
    next.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
    return next;
  }

  List<CookEntry> cookLog() {
    final next = List<CookEntry>.from(_store.readCookLog());
    next.sort((a, b) => b.cookedAt.compareTo(a.cookedAt));
    return next;
  }

  List<String> savedIds() => _store.savedRecipeIds;

  Future<void> upsert(PantryItem item) async {
    final next = items();
    final index = next.indexWhere((e) => e.id == item.id);
    if (index >= 0) {
      next[index] = item;
    } else {
      next.add(item);
    }
    await _store.writeItems(next);
  }

  Future<void> delete(String id) async {
    final next = items().where((e) => e.id != id).toList();
    await _store.writeItems(next);
  }

  Future<PantryItem> create({
    required String name,
    required String category,
    required ShelfId shelfId,
    required int quantityPct,
    required String purchaseDate,
    required String expiryDate,
    required ExpirySource expirySource,
    required int lowStockThresholdPct,
    String? conditionNotes,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final item = PantryItem(
      id: _uuid.v4(),
      name: name,
      category: category,
      shelfId: shelfId,
      quantityPct: quantityPct,
      purchaseDate: purchaseDate,
      expiryDate: expiryDate,
      expirySource: expirySource,
      lowStockThresholdPct: lowStockThresholdPct,
      createdAt: now,
      updatedAt: now,
      conditionNotes: conditionNotes,
    );
    await upsert(item);
    return item;
  }

  Future<void> toggleSaved(String recipeId) async {
    final ids = savedIds();
    if (ids.contains(recipeId)) {
      ids.remove(recipeId);
    } else {
      ids.add(recipeId);
    }
    await _store.setSavedRecipeIds(ids);
  }

  Future<CookEntry> recordCook(RecipeView recipe, List<PantryItem> onHand) async {
    final used = onHand.where((item) {
      return recipe.ingredients.any((ing) => namesOverlap(ing, item.name));
    }).toList();
    final entry = CookEntry(
      id: _uuid.v4(),
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      itemsUsed: used.map((e) => e.name).toList(),
      rescuedCount: used
          .where((i) => i.expiryDate.isNotEmpty && expiryStatus(i.expiryDate) != ExpiryStatus.fresh)
          .length,
      cookedAt: DateTime.now().millisecondsSinceEpoch,
    );
    final log = cookLog()..insert(0, entry);
    await _store.writeCookLog(log);
    return entry;
  }

  Future<bool> aiAvailable() async {
    if (!_api.enabled) return false;
    try {
      final health = await _api.getJson('/health');
      return health['aiEnabled'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<String?> sendChat({
    required List<Map<String, String>> messages,
    required List<PantryItem> pantry,
  }) async {
    if (!_api.enabled) return null;
    final data = await _api.postJson('/chat', {
      'messages': messages,
      'pantry': pantry
          .map(
            (item) => {
              'name': item.name,
              'expiryDate': item.expiryDate,
              'quantityPct': item.quantityPct,
            },
          )
          .toList(),
    });
    return data['reply'] as String?;
  }

  Future<Map<String, dynamic>?> generateRecipe({
    required List<String> have,
    required List<String> expiring,
  }) async {
    if (!_api.enabled) return null;
    return _api.postJson('/recipe/generate', {
      'have': have,
      'expiring': expiring,
    });
  }
}

final pantryRepositoryProvider = Provider<PantryRepository>((ref) {
  return PantryRepository(ref.watch(localStoreProvider), ref.watch(apiClientProvider));
});
