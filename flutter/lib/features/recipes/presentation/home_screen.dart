import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/item_glyph.dart';
import '../../../core/widgets/steve.dart';
import '../../pantry/data/pantry_repository.dart';
import '../../pantry/presentation/pantry_controller.dart';
import '../../recipes/domain/recipe.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _generating = false;
  String? _error;
  RecipeView? _generated;

  String _tonightCopy(int stock, int ready, int expiring) {
    if (stock == 0) return 'Add a few staples and meals will appear here.';
    final meals = '$ready ${ready == 1 ? 'meal' : 'meals'} from what\'s already in storage.';
    if (expiring == 0) return meals;
    final urgent = expiring == 1
        ? '1 ingredient wants using up first.'
        : '$expiring ingredients want using up first.';
    return '$meals $urgent';
  }

  Future<void> _generate() async {
    final kitchen = ref.read(kitchenProvider);
    setState(() {
      _generating = true;
      _error = null;
      _generated = null;
    });
    try {
      final repo = ref.read(pantryRepositoryProvider);
      final have = kitchen.items.map((e) => e.name).toList();
      final expiring = urgentItems(kitchen.items).map((e) => e.name).toList();
      final remote = await repo.generateRecipe(have: have, expiring: expiring);
      if (remote != null) {
        final title = remote['title'] as String? ?? 'Generated recipe';
        final ingredients = (remote['ingredients'] as List<dynamic>? ?? const [])
            .map((e) => e.toString())
            .toList();
        final steps =
            (remote['steps'] as List<dynamic>? ?? const []).map((e) => e.toString()).toList();
        final uses = (remote['usesExpiring'] as List<dynamic>? ?? const [])
            .map((e) => e.toString())
            .toList();
        setState(() {
          _generated = RecipeView(
            id: 'generated',
            title: title,
            iconName: iconKeyFor(title, 'Dinner'),
            category: 'Dinner',
            ingredients: ingredients,
            steps: steps,
            ingredientCount: ingredients.length,
            haveCount: ingredients.length,
            ready: true,
            rescues: uses.isEmpty ? null : RescueHint(name: uses.first, days: 1),
          );
        });
      } else {
        final hero = kitchen.recipes.where((r) => r.ready).cast<RecipeView?>().firstWhere(
              (r) => r != null,
              orElse: () => kitchen.recipes.isEmpty ? null : kitchen.recipes.first,
            );
        if (hero == null) {
          setState(() => _error = 'Add a few staples and I can invent a meal.');
        } else {
          setState(() => _generated = hero);
        }
      }
    } catch (e) {
      setState(() => _error = humanizeError(e));
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final kitchen = ref.watch(kitchenProvider);
    final views = kitchen.recipes;
    final ready = views.where((v) => v.ready).toList();
    final hero = ready.isNotEmpty ? ready.first : null;
    final rest = views.where((v) => v.id != hero?.id).toList();
    final expiring = urgentItems(kitchen.items).length;

    return Scaffold(
      body: SafeArea(
        child: PageBody(
          inset: false,
          child: ListView(
            padding: PageBody.insets(bottom: AppSpacing.navClearance),
            children: [
              AppCard(
                large: true,
                color: AppColors.tintCool,
                padding: const EdgeInsets.fromLTRB(18, 18, 14, 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TONIGHT',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: AppColors.freezerLabel,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1,
                                ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Ready to cook',
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.6,
                                  height: 1.1,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _tonightCopy(kitchen.items.length, ready.length, expiring),
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.ink.withValues(alpha: 0.7),
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ],
                      ),
                    ),
                    const Steve(size: 72, bob: false),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (kitchen.items.isNotEmpty)
                AppCard(
                  color: AppColors.tintBreakfast,
                  onTap: _generating ? null : _generate,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_generating)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.ink),
                        )
                      else
                        const Icon(Icons.auto_awesome, size: 18, color: AppColors.ink),
                      const SizedBox(width: 8),
                      Text(
                        _generating
                            ? 'Generating a recipe from your items…'
                            : 'Generate a recipe from my items',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ],
                  ),
                ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                ErrorState(message: _error!),
              ],
              if (_generated != null) ...[
                const SizedBox(height: 16),
                _GeneratedCard(recipe: _generated!),
              ],
              const SizedBox(height: 20),
              if (kitchen.items.isEmpty || views.isEmpty)
                EmptyState(
                  title: 'No recipes ready yet',
                  message:
                      'Add a few staples to your fridge and we\'ll match recipes to what you already have.',
                  actionLabel: 'Update fridge stock',
                  onAction: () => context.push('/items/new'),
                )
              else ...[
                if (hero != null)
                  _HeroRecipe(
                    recipe: hero,
                    saved: kitchen.savedIds.contains(hero.id),
                    onSave: () => ref.read(kitchenProvider.notifier).toggleSaved(hero.id),
                    onCook: () => ref.read(kitchenProvider.notifier).cook(hero),
                    onOpen: () => context.push('/recipe/${hero.id}'),
                  ),
                if (rest.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth > 420;
                      final tiles = rest
                          .map(
                            (recipe) => _MiniRecipe(
                              recipe: recipe,
                              saved: kitchen.savedIds.contains(recipe.id),
                              onSave: () =>
                                  ref.read(kitchenProvider.notifier).toggleSaved(recipe.id),
                              onOpen: () => context.push('/recipe/${recipe.id}'),
                            ),
                          )
                          .toList();
                      if (!wide) {
                        return Column(
                          children: [
                            for (var i = 0; i < tiles.length; i++) ...[
                              tiles[i],
                              if (i != tiles.length - 1) const SizedBox(height: 12),
                            ],
                          ],
                        );
                      }
                      return Wrap(
                        spacing: 14,
                        runSpacing: 14,
                        children: [
                          for (final tile in tiles)
                            SizedBox(width: (constraints.maxWidth - 14) / 2, child: tile),
                        ],
                      );
                    },
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _GeneratedCard extends StatelessWidget {
  const _GeneratedCard({required this.recipe});
  final RecipeView recipe;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      large: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, color: AppColors.ink),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  recipe.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          if (recipe.rescues != null) ...[
            const SizedBox(height: 8),
            Text(
              'Rescues: ${recipe.rescues!.name}',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w800,
                  ),
            ),
          ],
          const SizedBox(height: 8),
          Text(
            'Ingredients: ${recipe.ingredients.join(', ')}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.inkSoft,
                ),
          ),
          const SizedBox(height: 10),
          for (var i = 0; i < recipe.steps.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                '${i + 1}. ${recipe.steps[i]}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.inkSoft,
                    ),
              ),
            ),
        ],
      ),
    );
  }
}

class _HeroRecipe extends StatelessWidget {
  const _HeroRecipe({
    required this.recipe,
    required this.saved,
    required this.onSave,
    required this.onCook,
    required this.onOpen,
  });

  final RecipeView recipe;
  final bool saved;
  final VoidCallback onSave;
  final VoidCallback onCook;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      large: true,
      color: AppColors.mealTint(recipe.category),
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'COOK TO BEAT EXPIRY',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                      ),
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: onSave,
                icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border, color: AppColors.ink),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              EmojiWell(
                size: 64,
                color: AppColors.surface,
                child: Icon(iconForRecipe(recipe.iconName), size: 28, color: AppColors.ink),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      recipe.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${recipe.haveCount}/${recipe.ingredientCount} on hand · ${recipe.mins ?? 15} min',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.inkSoft,
                          ),
                    ),
                    if (recipe.rescues != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Uses ${recipe.rescues!.name} first',
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: AppColors.primaryDark,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          AppButton(label: 'Cook this now', onPressed: onCook, icon: Icons.restaurant),
        ],
      ),
    );
  }
}

class _MiniRecipe extends StatelessWidget {
  const _MiniRecipe({
    required this.recipe,
    required this.saved,
    required this.onSave,
    required this.onOpen,
  });

  final RecipeView recipe;
  final bool saved;
  final VoidCallback onSave;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.mealTint(recipe.category),
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              EmojiWell(
                size: 42,
                child: Icon(iconForRecipe(recipe.iconName), size: 20),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onSave,
                child: Icon(saved ? Icons.bookmark : Icons.bookmark_border, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            recipe.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            '${recipe.matchPct}% match',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: recipe.ready ? AppColors.fresh : AppColors.inkSoft,
                ),
          ),
          if (!recipe.ready)
            Text(
              'Need ${recipe.ingredientCount - recipe.haveCount} more',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textMuted),
            ),
        ],
      ),
    );
  }
}
