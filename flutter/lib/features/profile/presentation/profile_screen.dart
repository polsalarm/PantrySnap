import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/config/env.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/steve.dart';
import '../../pantry/presentation/pantry_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kitchen = ref.watch(kitchenProvider);
    final stats = kitchen.stats;
    final last = kitchen.cookLog.isEmpty ? null : kitchen.cookLog.first.cookedAt;

    return Scaffold(
      body: SafeArea(
        child: PageBody(
          child: ListView(
            children: [
              AppCard(
                large: true,
                color: AppColors.tintBreakfast,
                child: Row(
                  children: [
                    const Steve(size: 56, bob: false),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppEnv.cloudEnabled ? 'Your kitchen' : 'Guest cook',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                          Text(
                            last == null
                                ? 'No meals logged yet'
                                : 'Last cooked ${DateFormat.MMMd().format(DateTime.fromMillisecondsSinceEpoch(last))}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.ink.withValues(alpha: 0.65),
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(child: _Stat(label: 'Meals', value: '${stats.mealsCooked}')),
                  const SizedBox(width: 10),
                  Expanded(child: _Stat(label: 'Rescued', value: '${stats.itemsRescued}')),
                  const SizedBox(width: 10),
                  Expanded(child: _Stat(label: 'Waste est.', value: '${stats.wasteAvoidedKg}kg')),
                ],
              ),
              const SizedBox(height: 16),
              _RowLink(
                icon: Icons.notifications_none,
                title: 'Expiry alerts',
                meta: 'Items that need using up',
                onTap: () => context.push('/alerts'),
              ),
              const SizedBox(height: 10),
              _RowLink(
                icon: Icons.chat_bubble_outline,
                title: 'Steve assistant',
                meta: 'Ask what you can cook',
                onTap: () => context.go('/chat'),
              ),
              const SizedBox(height: 10),
              _RowLink(
                icon: Icons.receipt_long_outlined,
                title: 'All items',
                meta: '${kitchen.savedIds.length} saved recipe${kitchen.savedIds.length == 1 ? '' : 's'}',
                onTap: () => context.push('/items'),
              ),
              const SizedBox(height: 10),
              _RowLink(
                icon: Icons.cloud_outlined,
                title: 'Account & sync',
                meta: AppEnv.cloudEnabled ? 'Cloud ready' : 'Local-first guest mode',
                onTap: () => context.push('/account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
      child: Column(
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.inkSoft,
                ),
          ),
        ],
      ),
    );
  }
}

class _RowLink extends StatelessWidget {
  const _RowLink({
    required this.icon,
    required this.title,
    required this.meta,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String meta;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Row(
        children: [
          EmojiWell(size: 44, color: AppColors.tintDinner, child: Icon(icon, size: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                Text(
                  meta,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.inkSoft,
                      ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.inkSoft),
        ],
      ),
    );
  }
}
