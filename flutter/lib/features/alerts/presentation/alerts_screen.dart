import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/constants/catalog.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/item_glyph.dart';
import '../../../core/widgets/qty_bar.dart';
import '../../pantry/domain/expiry.dart';
import '../../pantry/domain/item.dart';
import '../../pantry/presentation/pantry_controller.dart';
import '../../recipes/domain/recipe.dart';

enum AlertFilter { all, expiring, lowStock }

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  AlertFilter _filter = AlertFilter.all;

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(kitchenProvider).items;
    final expiring = urgentItems(items);
    final low = items.where((i) => i.isLowStock).toList();
    final shown = switch (_filter) {
      AlertFilter.expiring => expiring,
      AlertFilter.lowStock => low,
      AlertFilter.all => {...expiring, ...low}.toList(),
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kitchen alerts'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: PageBody(
          bottom: 32,
          child: Column(
            children: [
              Row(
                children: [
                  for (final filter in AlertFilter.values) ...[
                    Expanded(
                      child: ChoiceChip(
                        label: Text(switch (filter) {
                          AlertFilter.all => 'All',
                          AlertFilter.expiring => 'Expiring',
                          AlertFilter.lowStock => 'Low stock',
                        }),
                        selected: _filter == filter,
                        onSelected: (_) => setState(() => _filter = filter),
                        selectedColor: AppColors.ink,
                        labelStyle: TextStyle(
                          color: _filter == filter ? Colors.white : AppColors.ink,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    if (filter != AlertFilter.lowStock) const SizedBox(width: 8),
                  ],
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: shown.isEmpty
                    ? const EmptyState(
                        icon: Icons.check_circle_outline,
                        title: 'All clear',
                        message: 'Nothing expiring soon and no jars scraping the bottom.',
                        color: AppColors.freshSoft,
                      )
                    : ListView.separated(
                        itemCount: shown.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final item = shown[index];
                          return _AlertRow(item: item);
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AlertRow extends StatelessWidget {
  const _AlertRow({required this.item});
  final PantryItem item;

  @override
  Widget build(BuildContext context) {
    final status = expiryStatus(item.expiryDate);
    return AppCard(
      color: AppColors.tintDinner,
      onTap: () => context.push('/items/${item.id}/edit'),
      child: Row(
        children: [
          ItemGlyph(name: item.name, category: item.category, wellSize: 52),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  expiryLabel(item.expiryDate),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: status == ExpiryStatus.fresh ? AppColors.inkSoft : AppColors.primaryDark,
                      ),
                ),
                if (item.isLowStock) ...[
                  const SizedBox(height: 8),
                  QtyBar(percent: item.quantityPct),
                  const SizedBox(height: 4),
                  Text(
                    'Low stock · ${item.quantityPct}% left',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.accentDark,
                        ),
                  ),
                ],
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.inkSoft),
        ],
      ),
    );
  }
}
