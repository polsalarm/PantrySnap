import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../core/constants/catalog.dart';
import 'app_card.dart';

class ItemGlyph extends StatelessWidget {
  const ItemGlyph({
    super.key,
    required this.name,
    required this.category,
    this.size = 22,
    this.wellSize = 48,
    this.bordered = true,
  });

  final String name;
  final String category;
  final double size;
  final double wellSize;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    final icon = iconForItem(name, category);
    if (!bordered) {
      return Icon(icon, size: size, color: AppColors.ink);
    }
    return EmojiWell(
      size: wellSize,
      color: AppColors.categoryTint(category),
      child: Icon(icon, size: size, color: AppColors.ink),
    );
  }
}

IconData iconForItem(String name, String category) {
  final n = name.toLowerCase();
  if (n.contains('ice cream')) return Icons.icecream_outlined;
  if (n.contains('dumpling')) return Icons.ramen_dining_outlined;
  if (n.contains('pea')) return Icons.eco_outlined;
  if (n.contains('garlic') || n.contains('onion')) return Icons.spa_outlined;
  if (n.contains('spinach') || n.contains('leaf') || n.contains('green')) {
    return Icons.energy_savings_leaf_outlined;
  }
  if (n.contains('carrot')) return Icons.eco;
  if (n.contains('pepper')) return Icons.local_florist_outlined;
  if (n.contains('broccoli')) return Icons.park_outlined;
  if (n.contains('potato')) return Icons.bubble_chart_outlined;
  if (n.contains('berry') || n.contains('fruit')) return Icons.spa_outlined;
  if (n.contains('butter')) return Icons.cookie_outlined;
  if (n.contains('egg')) return Icons.egg_outlined;
  if (n.contains('milk')) return Icons.local_drink_outlined;
  if (n.contains('cheese')) return Icons.lunch_dining_outlined;
  if (n.contains('yogurt')) return Icons.icecream;
  if (n.contains('chicken') || n.contains('turkey') || n.contains('deli')) {
    return Icons.set_meal_outlined;
  }
  if (n.contains('rice')) return Icons.rice_bowl_outlined;
  if (n.contains('pasta')) return Icons.dinner_dining_outlined;
  if (n.contains('bread')) return Icons.bakery_dining_outlined;
  if (n.contains('soy') || n.contains('mayo') || n.contains('sauce')) {
    return Icons.water_drop_outlined;
  }
  if (n.contains('honey')) return Icons.hive_outlined;
  if (n.contains('broth') || n.contains('leftover')) return Icons.soup_kitchen_outlined;
  return switch (category) {
    'dairy' => Icons.egg_alt_outlined,
    'produce' => Icons.eco_outlined,
    'meat' || 'seafood' => Icons.set_meal_outlined,
    'frozen' => Icons.ac_unit,
    'bakery' => Icons.bakery_dining_outlined,
    'pantry' => Icons.inventory_2_outlined,
    _ => Icons.kitchen_outlined,
  };
}

IconData iconForRecipe(String key) {
  return switch (key) {
    'egg' => Icons.egg_alt_outlined,
    'salad' => Icons.eco_outlined,
    'sandwich' => Icons.lunch_dining_outlined,
    'soup' => Icons.soup_kitchen_outlined,
    'bowl' => Icons.icecream_outlined,
    'wheat' => Icons.rice_bowl_outlined,
    _ => Icons.restaurant_outlined,
  };
}

IconData iconForShelf(ShelfId id) => shelfById(id).icon;
