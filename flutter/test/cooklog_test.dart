import 'package:flutter_test/flutter_test.dart';
import 'package:pantrysnap/features/pantry/domain/cook_entry.dart';

void main() {
  test('computeStats estimates waste from rescued items', () {
    const entries = [
      CookEntry(
        id: '1',
        recipeId: 'pasta',
        recipeTitle: 'Garlic Butter Pasta',
        itemsUsed: ['Pasta', 'Garlic'],
        rescuedCount: 2,
        cookedAt: 1,
      ),
      CookEntry(
        id: '2',
        recipeId: 'soup',
        recipeTitle: 'Soup',
        itemsUsed: ['Leftovers'],
        rescuedCount: 1,
        cookedAt: 2,
      ),
    ];
    final stats = computeStats(entries);
    expect(stats.mealsCooked, 2);
    expect(stats.itemsRescued, 3);
    expect(stats.wasteAvoidedKg, 0.8);
  });
}
