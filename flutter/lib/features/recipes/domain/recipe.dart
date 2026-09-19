import '../../../core/constants/catalog.dart';
import '../../../core/utils/dates.dart';
import '../../pantry/domain/expiry.dart';
import '../../pantry/domain/item.dart';

enum RecipeLevel { easy, medium, hard }

class Recipe {
  const Recipe({
    required this.id,
    required this.name,
    required this.iconName,
    required this.ingredients,
    required this.steps,
    required this.mins,
    required this.serves,
    required this.category,
    required this.level,
  });

  final String id;
  final String name;
  final String iconName;
  final List<String> ingredients;
  final List<String> steps;
  final int mins;
  final int serves;
  final String category;
  final RecipeLevel level;
}

class RescueHint {
  const RescueHint({required this.name, required this.days});
  final String name;
  final int days;
}

class RecipeView {
  const RecipeView({
    required this.id,
    required this.title,
    required this.iconName,
    required this.category,
    required this.ingredients,
    required this.steps,
    required this.ingredientCount,
    required this.haveCount,
    required this.ready,
    this.level,
    this.mins,
    this.serves,
    this.rescues,
  });

  final String id;
  final String title;
  final String iconName;
  final String category;
  final List<String> ingredients;
  final List<String> steps;
  final int ingredientCount;
  final int haveCount;
  final bool ready;
  final RecipeLevel? level;
  final int? mins;
  final int? serves;
  final RescueHint? rescues;

  int get matchPct =>
      ingredientCount == 0 ? 0 : ((haveCount / ingredientCount) * 100).round();
}

bool namesOverlap(String a, String b) {
  final left = a.toLowerCase().trim();
  final right = b.toLowerCase().trim();
  return left.contains(right) || right.contains(left);
}

List<PantryItem> urgentItems(List<PantryItem> items) {
  return items
      .where((i) => i.expiryDate.isNotEmpty && expiryStatus(i.expiryDate) != ExpiryStatus.fresh)
      .toList();
}

RescueHint? findRescue(List<String> ingredients, List<PantryItem> urgent) {
  final hits = urgent
      .where((item) => ingredients.any((ing) => namesOverlap(ing, item.name)))
      .toList();
  if (hits.isEmpty) return null;
  hits.sort((a, b) => daysUntil(a.expiryDate).compareTo(daysUntil(b.expiryDate)));
  final soonest = hits.first;
  return RescueHint(name: soonest.name, days: daysUntil(soonest.expiryDate));
}

int countHave(List<String> ingredients, List<PantryItem> items) {
  return ingredients.where((ing) => items.any((item) => namesOverlap(ing, item.name))).length;
}

String iconKeyFor(String title, String category) {
  final t = title.toLowerCase();
  if (RegExp(r'pasta|spaghetti|noodle').hasMatch(t)) return 'utensils';
  if (RegExp(r'rice|risotto').hasMatch(t)) return 'wheat';
  if (RegExp(r'soup|stew|broth').hasMatch(t)) return 'soup';
  if (t.contains('salad')) return 'salad';
  if (RegExp(r'sandwich|burger|melt').hasMatch(t)) return 'sandwich';
  if (RegExp(r'egg|omelet|omelette').hasMatch(t)) return 'egg';
  if (RegExp(r'yogurt|bowl|smoothie').hasMatch(t)) return 'bowl';
  if (category == 'Breakfast') return 'egg';
  if (category == 'Snack') return 'bowl';
  return 'utensils';
}
