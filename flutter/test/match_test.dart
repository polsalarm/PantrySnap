import 'package:flutter_test/flutter_test.dart';
import 'package:pantrysnap/core/constants/catalog.dart';
import 'package:pantrysnap/features/pantry/domain/item.dart';
import 'package:pantrysnap/features/recipes/data/recipe_seed.dart';
import 'package:pantrysnap/features/recipes/domain/match.dart';
import 'package:pantrysnap/features/recipes/domain/recipe.dart';

PantryItem item(String name, {String expiry = '2099-01-01'}) {
  return PantryItem(
    id: name,
    name: name,
    category: 'other',
    shelfId: ShelfId.middle,
    quantityPct: 80,
    purchaseDate: '2026-01-01',
    expiryDate: expiry,
    expirySource: ExpirySource.estimated,
    lowStockThresholdPct: 20,
    createdAt: 0,
    updatedAt: 0,
  );
}

void main() {
  test('matchRecipes ranks grilled cheese when bread, cheese, butter are on hand', () {
    final items = [item('Bread'), item('Swiss cheese'), item('Butter')];
    final matches = matchRecipes(items, recipeSeed);
    expect(matches.first.recipe.id, 'grilled-cheese');
    expect(matches.first.matchPct, 100);
  });

  test('toRecipeViews marks ready meals and surfaces a rescue', () {
    final items = [
      item('Eggs'),
      item('Swiss cheese'),
      item('Bell pepper'),
      item('Onion'),
      item('Milk', expiry: isoSoon()),
    ];
    final views = toRecipeViews(items, recipeSeed);
    final omelette = views.firstWhere((v) => v.id == 'omelette');
    expect(omelette.ready, isTrue);
    expect(omelette.rescues, isNotNull);
    expect(omelette.rescues!.name, 'Milk');
  });

  test('namesOverlap is bidirectional', () {
    expect(namesOverlap('leafy greens', 'Spinach leafy greens'), isTrue);
    expect(namesOverlap('cheese', 'Swiss cheese'), isTrue);
    expect(namesOverlap('chicken', 'rice'), isFalse);
  });
}

String isoSoon() {
  final d = DateTime.now().add(const Duration(days: 1));
  final m = d.month.toString().padLeft(2, '0');
  final day = d.day.toString().padLeft(2, '0');
  return '${d.year}-$m-$day';
}
