import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/constants/catalog.dart';
import '../../../core/utils/dates.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/item_glyph.dart';
import '../../pantry/domain/expiry.dart';
import '../../pantry/domain/item.dart';
import 'pantry_controller.dart';

class FridgeScreen extends ConsumerWidget {
  const FridgeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(kitchenProvider).items;
    final freezer = items.where((i) => i.shelfId == ShelfId.freezer).toList();
    final fridge = items.where((i) => i.shelfId != ShelfId.freezer).toList();
    final expiring = items.where((i) => i.expiryDate.isNotEmpty && daysUntil(i.expiryDate) <= 3).length;

    return Scaffold(
      body: SafeArea(
        child: PageBody(
          child: ListView(
            children: [
              Text(
                'Your fridge',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                '${items.length} item${items.length == 1 ? '' : 's'} in storage · $expiring need using up',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.ink.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 18),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(28), bottom: Radius.circular(14)),
                  border: Border.all(color: AppColors.ink, width: 2),
                  boxShadow: const [
                    BoxShadow(color: AppColors.ink, offset: Offset(4, 4), blurRadius: 0),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
                      decoration: const BoxDecoration(
                        color: AppColors.tintCool,
                        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'FREEZER',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.freezerLabel,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.7,
                                    ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '−18°C',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.freezerLabel,
                                      fontWeight: FontWeight.w800,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (freezer.isEmpty)
                            Text(
                              'Nothing in the freezer yet.',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.freezerLabel.withValues(alpha: 0.7),
                                    fontWeight: FontWeight.w600,
                                  ),
                            )
                          else
                            _ItemGrid(items: freezer),
                        ],
                      ),
                    ),
                    Container(height: 5, color: AppColors.ink),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 22),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'FRIDGE',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.inkSoft,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.7,
                                    ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '4°C',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.inkSoft,
                                      fontWeight: FontWeight.w800,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (fridge.isEmpty)
                            Text(
                              'Nothing stored yet.',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.inkSoft,
                                    fontWeight: FontWeight.w600,
                                  ),
                            )
                          else
                            _ItemGrid(items: fridge),
                        ],
                      ),
                    ),
                    Container(height: 9, color: AppColors.ink),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final shelf in shelves)
                    ActionChip(
                      label: Text('${shelf.name} · ${items.where((i) => i.shelfId == shelf.id).length}'),
                      onPressed: () => context.push('/shelf/${shelf.id.name}'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 72),
        child: FloatingActionButton.extended(
          backgroundColor: AppColors.ink,
          foregroundColor: Colors.white,
          onPressed: () => context.push('/items/new'),
          icon: const Icon(Icons.add_a_photo_outlined),
          label: const Text('Add item'),
        ),
      ),
    );
  }
}

class _ItemGrid extends StatelessWidget {
  const _ItemGrid({required this.items});
  final List<PantryItem> items;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 14,
        crossAxisSpacing: 8,
        childAspectRatio: 0.78,
      ),
      itemBuilder: (context, index) {
        final item = items[index];
        final days = item.expiryDate.isEmpty ? 99 : daysUntil(item.expiryDate);
        final color = days <= 2
            ? AppColors.primaryDark
            : days <= 5
                ? AppColors.accentDark
                : AppColors.inkSoft;
        return InkWell(
          onTap: () => context.push('/items/${item.id}/edit'),
          child: Column(
            children: [
              ItemGlyph(name: item.name, category: item.category, wellSize: 54, size: 24),
              const SizedBox(height: 6),
              Text(
                item.name,
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              Text(
                item.expiryDate.isEmpty ? '—' : shortExpiryLabel(item.expiryDate),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class ShelfDetailScreen extends ConsumerWidget {
  const ShelfDetailScreen({super.key, required this.shelfId});
  final String shelfId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final id = ShelfId.values.firstWhere((s) => s.name == shelfId, orElse: () => ShelfId.middle);
    final info = shelfById(id);
    final items = ref.watch(kitchenProvider).items.where((i) => i.shelfId == id).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(info.name),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: PageBody(
          bottom: 32,
          child: items.isEmpty
              ? Text(
                  'Nothing on the ${info.name.toLowerCase()} yet.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                )
              : ListView.separated(
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return AppCard(
                      onTap: () => context.push('/items/${item.id}/edit'),
                      child: Row(
                        children: [
                          ItemGlyph(name: item.name, category: item.category),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.name,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w800,
                                      ),
                                ),
                                Text(
                                  expiryLabel(item.expiryDate),
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.inkSoft,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${item.quantityPct}%',
                            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}
