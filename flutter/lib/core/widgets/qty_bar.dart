import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

class QtyBar extends StatelessWidget {
  const QtyBar({super.key, required this.percent, this.height = 8});

  final int percent;
  final double height;

  @override
  Widget build(BuildContext context) {
    final value = (percent.clamp(0, 100)) / 100;
    final fill = percent <= 20 ? AppColors.primary : AppColors.fresh;
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        height: height,
        child: Stack(
          children: [
            Container(color: AppColors.border),
            FractionallySizedBox(
              widthFactor: value,
              child: Container(color: fill),
            ),
          ],
        ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.tone,
  });

  final String label;
  final StatusTone tone;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (tone) {
      StatusTone.fresh => (AppColors.freshSoft, AppColors.fresh),
      StatusTone.soon => (AppColors.warnSoft, AppColors.accentDark),
      StatusTone.expired => (AppColors.primarySoft, AppColors.danger),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: fg,
              fontWeight: FontWeight.w800,
            ),
      ),
    );
  }
}

enum StatusTone { fresh, soon, expired }
