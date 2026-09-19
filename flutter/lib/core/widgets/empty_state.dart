import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import 'app_button.dart';
import 'app_card.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon = Icons.kitchen_outlined,
    this.actionLabel,
    this.onAction,
    this.color = AppColors.tintSnack,
  });

  final String title;
  final String message;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      large: true,
      color: color,
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 28),
      child: Column(
        children: [
          EmojiWell(size: 82, child: Icon(icon, size: 34, color: AppColors.ink)),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.inkSoft,
                  fontWeight: FontWeight.w600,
                ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 20),
            AppButton(label: actionLabel!, onPressed: onAction, expanded: false),
          ],
        ],
      ),
    );
  }
}

class ErrorState extends StatelessWidget {
  const ErrorState({
    super.key,
    required this.message,
    this.onRetry,
  });

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.primarySoft,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.primaryDark,
                  fontWeight: FontWeight.w700,
                ),
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 12),
            AppButton(label: 'Try again', onPressed: onRetry, expanded: false, tone: AppButtonTone.ghost),
          ],
        ],
      ),
    );
  }
}

class LoadingGrid extends StatelessWidget {
  const LoadingGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 14,
      crossAxisSpacing: 14,
      childAspectRatio: 0.78,
      children: List.generate(
        4,
        (i) => const AppCard(
          color: AppColors.borderSoft,
          child: SizedBox.expand(),
        ),
      ),
    );
  }
}
