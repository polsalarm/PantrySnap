import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/storage/local_store.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/steve.dart';

class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF38BDF8), Color(0xFFBAE6FD), Color(0xFFF0F9FF)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 28),
                child: ListView(
                  children: [
                    const SizedBox(height: 24),
                    const Center(child: Steve(size: 132, bob: false)),
                    const SizedBox(height: 8),
                    Text(
                      'PantrySnap',
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.w900,
                            color: AppColors.ink,
                            letterSpacing: -1,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.92),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0xFF7DD3FC), width: 2),
                      ),
                      child: Text(
                        'YOUR ATTENTIVE KITCHEN CLOUD',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0C4A6E),
                              letterSpacing: 0.6,
                            ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _Prop(
                      icon: Icons.photo_camera_outlined,
                      title: 'Snap what you have',
                      body: 'Photograph a shelf. Track quantity and expiry in one place.',
                    ),
                    const SizedBox(height: 10),
                    _Prop(
                      icon: Icons.timer_outlined,
                      title: 'Cook before it spoils',
                      body: 'Meals ranked by what is already in the fridge — soonest first.',
                    ),
                    const SizedBox(height: 10),
                    _Prop(
                      icon: Icons.chat_bubble_outline,
                      title: 'Ask Steve',
                      body: '“What can I cook tonight?” He watches the shelves so you do not have to.',
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      label: 'Open the fridge',
                      onPressed: () async {
                        await ref.read(localStoreProvider).setOnboarded(true);
                        if (context.mounted) context.go('/');
                      },
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Works offline. No account required.',
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: AppColors.inkSoft,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Prop extends StatelessWidget {
  const _Prop({required this.icon, required this.title, required this.body});

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.86),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.ink, width: 2),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.ink),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                Text(
                  body,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.inkSoft,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
