import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/storage/local_store.dart';
import '../../recipes/domain/match.dart';
import '../../recipes/domain/recipe.dart';
import '../../recipes/data/recipe_seed.dart';
import '../data/pantry_repository.dart';
import '../domain/cook_entry.dart';
import '../domain/item.dart';

class KitchenState {
  const KitchenState({
    required this.items,
    required this.cookLog,
    required this.savedIds,
    this.justCooked,
  });

  final List<PantryItem> items;
  final List<CookEntry> cookLog;
  final List<String> savedIds;
  final String? justCooked;

  CookStats get stats => computeStats(cookLog);
  List<RecipeView> get recipes => toRecipeViews(items, recipeSeed);

  KitchenState copyWith({
    List<PantryItem>? items,
    List<CookEntry>? cookLog,
    List<String>? savedIds,
    String? justCooked,
    bool clearCooked = false,
  }) {
    return KitchenState(
      items: items ?? this.items,
      cookLog: cookLog ?? this.cookLog,
      savedIds: savedIds ?? this.savedIds,
      justCooked: clearCooked ? null : (justCooked ?? this.justCooked),
    );
  }
}

class KitchenController extends Notifier<KitchenState> {
  @override
  KitchenState build() {
    final repo = ref.read(pantryRepositoryProvider);
    return KitchenState(
      items: repo.items(),
      cookLog: repo.cookLog(),
      savedIds: repo.savedIds(),
    );
  }

  PantryRepository get _repo => ref.read(pantryRepositoryProvider);

  void _reload({String? justCooked, bool clearCooked = false}) {
    state = state.copyWith(
      items: _repo.items(),
      cookLog: _repo.cookLog(),
      savedIds: _repo.savedIds(),
      justCooked: justCooked,
      clearCooked: clearCooked,
    );
  }

  Future<void> saveItem(PantryItem item) async {
    await _repo.upsert(item);
    _reload();
  }

  Future<void> createItem(PantryItem item) async {
    await _repo.upsert(item);
    _reload();
  }

  Future<void> deleteItem(String id) async {
    await _repo.delete(id);
    _reload();
  }

  Future<void> toggleSaved(String recipeId) async {
    await _repo.toggleSaved(recipeId);
    _reload();
  }

  Future<void> cook(RecipeView recipe) async {
    await _repo.recordCook(recipe, state.items);
    _reload(justCooked: recipe.title);
    Future<void>.delayed(const Duration(milliseconds: 2400), () {
      if (state.justCooked == recipe.title) {
        state = state.copyWith(clearCooked: true);
      }
    });
  }

  Future<void> resetDemo() async {
    await ref.read(localStoreProvider).resetDemoKitchen();
    _reload(clearCooked: true);
  }
}

final kitchenProvider = NotifierProvider<KitchenController, KitchenState>(
  KitchenController.new,
);

final pantryItemProvider = Provider.family<PantryItem?, String>((ref, id) {
  final items = ref.watch(kitchenProvider).items;
  for (final item in items) {
    if (item.id == id) return item;
  }
  return null;
});
