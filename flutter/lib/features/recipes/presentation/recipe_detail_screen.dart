import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/item_glyph.dart';
import '../../pantry/presentation/pantry_controller.dart';
import '../../recipes/domain/recipe.dart';

class RecipeDetailScreen extends ConsumerWidget {
  const RecipeDetailScreen({super.key, required this.recipeId});

  final String recipeId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kitchen = ref.watch(kitchenProvider);
    RecipeView? recipe;
    for (final view in kitchen.recipes) {
      if (view.id == recipeId) recipe = view;
    }

    if (recipe == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Recipe')),
        body: const PageBody(
          child: Text('That recipe is no longer on the board.'),
        ),
      );
    }

    final view = recipe;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(view.title),
        actions: [
          IconButton(
            onPressed: () => ref.read(kitchenProvider.notifier).toggleSaved(view.id),
            icon: Icon(
              kitchen.savedIds.contains(view.id) ? Icons.bookmark : Icons.bookmark_border,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: PageBody(
          bottom: 32,
          child: ListView(
            children: [
              AppCard(
                large: true,
                color: AppColors.mealTint(view.category),
                child: Row(
                  children: [
                    EmojiWell(
                      size: 72,
                      child: Icon(iconForRecipe(view.iconName), size: 32),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            view.category,
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.6,
                                ),
                          ),
                          Text(
                            '${view.mins ?? 15} min · serves ${view.serves ?? 2}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.inkSoft,
                                ),
                          ),
                          Text(
                            '${view.haveCount}/${view.ingredientCount} ingredients on hand',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: view.ready ? AppColors.fresh : AppColors.accentDark,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Ingredients',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              for (final ing in view.ingredients)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    color: kitchen.items.any(
                      (item) => item.name.toLowerCase().contains(ing) || ing.contains(item.name.toLowerCase()),
                    )
                        ? AppColors.freshSoft
                        : AppColors.surface,
                    child: Row(
                      children: [
                        Icon(
                          kitchen.items.any(
                            (item) =>
                                item.name.toLowerCase().contains(ing) ||
                                ing.contains(item.name.toLowerCase()),
                          )
                              ? Icons.check_circle
                              : Icons.radio_button_unchecked,
                          size: 18,
                          color: AppColors.ink,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          ing,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              Text(
                'Steps',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              for (var i = 0; i < view.steps.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: AppCard(
                    child: Text(
                      '${i + 1}. ${view.steps[i]}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                ),
              const SizedBox(height: 8),
              AppButton(
                label: 'I cooked this',
                icon: Icons.restaurant,
                onPressed: () {
                  ref.read(kitchenProvider.notifier).cook(view);
                  context.pop();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
