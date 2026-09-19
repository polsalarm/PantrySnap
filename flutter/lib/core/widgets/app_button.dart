import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.busy = false,
    this.expanded = true,
    this.tone = AppButtonTone.ink,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool busy;
  final bool expanded;
  final AppButtonTone tone;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !busy;
    final bg = switch (tone) {
      AppButtonTone.ink => AppColors.ink,
      AppButtonTone.marinara => AppColors.primary,
      AppButtonTone.ghost => AppColors.surface,
    };
    final fg = tone == AppButtonTone.ghost ? AppColors.ink : Colors.white;

    final child = AnimatedOpacity(
      duration: const Duration(milliseconds: 150),
      opacity: enabled ? 1 : 0.6,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: tone == AppButtonTone.ghost
              ? Border.all(color: AppColors.ink, width: 2)
              : null,
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
            children: [
              if (busy)
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: fg),
                )
              else if (icon != null)
                Icon(icon, size: 18, color: fg),
              if (busy || icon != null) const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: fg,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    final tap = Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        onTap: enabled ? onPressed : null,
        child: child,
      ),
    );

    return expanded ? SizedBox(width: double.infinity, child: tap) : tap;
  }
}

enum AppButtonTone { ink, marinara, ghost }
