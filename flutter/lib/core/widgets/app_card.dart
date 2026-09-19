import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.color = AppColors.surface,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.large = false,
  });

  final Widget child;
  final Color color;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final card = DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(large ? AppRadius.xl : AppRadius.lg),
        border: Border.all(color: AppColors.ink, width: 2),
        boxShadow: const [
          BoxShadow(color: AppColors.ink, offset: Offset(4, 4), blurRadius: 0),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );

    if (onTap == null) return card;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(large ? AppRadius.xl : AppRadius.lg),
        onTap: onTap,
        child: card,
      ),
    );
  }
}

class EmojiWell extends StatelessWidget {
  const EmojiWell({
    super.key,
    required this.child,
    this.size = 48,
    this.color = AppColors.surface,
  });

  final Widget child;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.ink, width: 2),
      ),
      alignment: Alignment.center,
      child: child,
    );
  }
}

class PageBody extends StatelessWidget {
  const PageBody({super.key, required this.child, this.bottom = AppSpacing.navClearance});

  final Widget child;
  final double bottom;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: AppSpacing.maxContentWidth),
        child: Padding(
          padding: EdgeInsets.fromLTRB(AppSpacing.page, 20, AppSpacing.page, bottom),
          child: child,
        ),
      ),
    );
  }
}
