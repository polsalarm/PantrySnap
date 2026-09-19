import '../../pantry/domain/item.dart';
import 'recipe.dart';

class RecipeMatch {
  const RecipeMatch({
    required this.recipe,
    required this.matched,
    required this.missing,
    required this.matchPct,
  });

  final Recipe recipe;
  final List<String> matched;
  final List<String> missing;
  final int matchPct;
}

List<RecipeMatch> matchRecipes(List<PantryItem> items, List<Recipe> recipes) {
  final onHand = items.map((item) => item.name.toLowerCase().trim()).toList();

  final matches = recipes.map((recipe) {
    final matched = <String>[];
    final missing = <String>[];
    for (final ingredient in recipe.ingredients) {
      final needle = ingredient.toLowerCase().trim();
      final have = onHand.any((name) => name.contains(needle) || needle.contains(name));
      if (have) {
        matched.add(ingredient);
      } else {
        missing.add(ingredient);
      }
    }
    final matchPct = recipe.ingredients.isEmpty
        ? 0
        : ((matched.length / recipe.ingredients.length) * 100).round();
    return RecipeMatch(
      recipe: recipe,
      matched: matched,
      missing: missing,
      matchPct: matchPct,
    );
  }).toList();

  matches.sort((a, b) => b.matchPct.compareTo(a.matchPct));
  return matches;
}

List<RecipeView> toRecipeViews(List<PantryItem> items, List<Recipe> recipes) {
  final urgent = urgentItems(items);
  final views = recipes.map((recipe) {
    final have = countHave(recipe.ingredients, items);
    return RecipeView(
      id: recipe.id,
      title: recipe.name,
      iconName: recipe.iconName,
      category: recipe.category,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      ingredientCount: recipe.ingredients.length,
      haveCount: have,
      ready: have == recipe.ingredients.length,
      level: recipe.level,
      mins: recipe.mins,
      serves: recipe.serves,
      rescues: findRescue(recipe.ingredients, urgent),
    );
  }).toList();

  views.sort((a, b) {
    final readyCmp = (b.ready ? 1 : 0).compareTo(a.ready ? 1 : 0);
    if (readyCmp != 0) return readyCmp;
    final rescueCmp = (b.rescues != null ? 1 : 0).compareTo(a.rescues != null ? 1 : 0);
    if (rescueCmp != 0) return rescueCmp;
    return b.matchPct.compareTo(a.matchPct);
  });
  return views;
}
