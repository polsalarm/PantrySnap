import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class Steve extends StatelessWidget {
  const Steve({super.key, this.size = 72, this.bob = true});

  final double size;
  final bool bob;

  @override
  Widget build(BuildContext context) {
    final image = Image.asset(
      'assets/steve.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.medium,
      semanticLabel: 'Steve, the PantrySnap mascot',
    );
    if (!bob) return image;
    return image
        .animate(onPlay: (c) => c.repeat(reverse: true))
        .moveY(begin: 0, end: -6, duration: 1600.ms, curve: Curves.easeInOut);
  }
}
