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
import 'pantry_controller.dart';

class ItemsScreen extends ConsumerStatefulWidget {
  const ItemsScreen({super.key});

  @override
  ConsumerState<ItemsScreen> createState() => _ItemsScreenState();
}

class _ItemsScreenState extends ConsumerState<ItemsScreen> {
  String _query = '';
  String _category = 'all';

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(kitchenProvider).items;
    final cats = ['all', ...({for (final i in items) i.category}.toList()..sort())];
    final filtered = items.where((item) {
      final q = _query.toLowerCase();
      final matchesQuery = item.name.toLowerCase().contains(q);
      final matchesCat = _category == 'all' || item.category == _category;
      return matchesQuery && matchesCat;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Food radar'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: PageBody(
          bottom: 32,
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      onChanged: (v) => setState(() => _query = v),
                      decoration: const InputDecoration(
                        hintText: 'Search pantry items…',
                        prefixIcon: Icon(Icons.search),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Material(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => context.push('/items/new'),
                      child: const SizedBox(
                        width: 52,
                        height: 52,
                        child: Icon(Icons.add, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 38,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: cats.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final cat = cats[index];
                    final selected = cat == _category;
                    return ChoiceChip(
                      label: Text(cat == 'all' ? 'All items' : cat),
                      selected: selected,
                      onSelected: (_) => setState(() => _category = cat),
                      selectedColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color: selected ? Colors.white : AppColors.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 14),
              Expanded(
                child: filtered.isEmpty
                    ? EmptyState(
                        title: _query.isEmpty ? 'No items yet' : 'No matches',
                        message: _query.isEmpty
                            ? 'Add what is in the fridge and it will show up on the radar.'
                            : 'Nothing matches “$_query”.',
                        actionLabel: 'Add item',
                        onAction: () => context.push('/items/new'),
                      )
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final item = filtered[index];
                          final status = expiryStatus(item.expiryDate);
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
                                      const SizedBox(height: 4),
                                      StatusBadge(
                                        label: expiryLabel(item.expiryDate),
                                        tone: switch (status) {
                                          ExpiryStatus.fresh => StatusTone.fresh,
                                          ExpiryStatus.soon => StatusTone.soon,
                                          ExpiryStatus.expired => StatusTone.expired,
                                        },
                                      ),
                                      const SizedBox(height: 8),
                                      QtyBar(percent: item.quantityPct),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.chevron_right, color: AppColors.inkSoft),
                              ],
                            ),
                          );
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
