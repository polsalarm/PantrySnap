import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/config/env.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../pantry/presentation/pantry_controller.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Account & sync'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: PageBody(
          inset: false,
          child: ListView(
            padding: PageBody.insets(bottom: 32),
            children: [
              AppCard(
                color: AppColors.tintCool,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Local-first on purpose',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppEnv.cloudEnabled
                          ? 'Supabase is configured. Sign-in can be wired to the existing magic-link flow without moving pantry data off this device until you sync.'
                          : 'PantrySnap does not require an account. Your fridge lives on this device. Optional Supabase sync stays behind SUPABASE_URL and SUPABASE_ANON_KEY — never a service-role key.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.inkSoft,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _kv(context, 'AI proxy', AppEnv.hasRemoteApi ? AppEnv.apiBase : 'Not configured — Steve answers locally'),
                    const SizedBox(height: 8),
                    _kv(context, 'Cloud sync', AppEnv.cloudEnabled ? 'Enabled' : 'Off'),
                    const SizedBox(height: 8),
                    _kv(context, 'Session', 'Guest cook'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              AppButton(
                label: 'Reset demo kitchen',
                tone: AppButtonTone.ghost,
                onPressed: () async {
                  await ref.read(kitchenProvider.notifier).resetDemo();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Demo fridge restored')),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _kv(BuildContext context, String k, String v) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(k, style: Theme.of(context).textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w800, color: AppColors.inkSoft)),
        Text(v, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700)),
      ],
    );
  }
}
