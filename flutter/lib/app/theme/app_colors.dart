import 'package:flutter/material.dart';

/// Cloudy with a Chance of Meatballs tokens from the original PWA.
class AppColors {
  static const bg = Color(0xFFF7F5F2);
  static const surface = Color(0xFFFFFFFF);
  static const text = Color(0xFF1E293B);
  static const textMuted = Color(0xFF8C8880);
  static const primary = Color(0xFFD92626);
  static const primaryDark = Color(0xFF8E1515);
  static const primarySoft = Color(0xFFFDECEC);
  static const accent = Color(0xFFD97706);
  static const accentDark = Color(0xFF9A3412);
  static const warnSoft = Color(0xFFFEF3C7);
  static const danger = Color(0xFFC81E1E);
  static const border = Color(0xFFECE8E3);
  static const borderSoft = Color(0xFFF2EFEB);
  static const ink = Color(0xFF1E293B);
  static const inkSoft = Color(0xFF475569);
  static const tintBreakfast = Color(0xFFF7EED6);
  static const tintLunch = Color(0xFFE7EFD6);
  static const tintDinner = Color(0xFFF1F0EC);
  static const tintSnack = Color(0xFFE4EFF8);
  static const tintCool = Color(0xFFDCEAF6);
  static const sky = Color(0xFF0EA5E9);
  static const skySoft = Color(0xFFE0F2FE);
  static const fresh = Color(0xFF16A34A);
  static const freshSoft = Color(0xFFDCFCE7);
  static const freezerLabel = Color(0xFF245D89);

  static Color categoryTint(String category) {
    switch (category.toLowerCase()) {
      case 'produce':
        return const Color(0xFFDFEBC5);
      case 'dairy':
        return const Color(0xFFF5E7C0);
      case 'meat':
      case 'seafood':
        return const Color(0xFFEADFD6);
      case 'bakery':
      case 'condiments':
        return const Color(0xFFF1E7D6);
      case 'pantry':
      case 'frozen':
      case 'beverages':
        return const Color(0xFFDCEAF6);
      case 'leftovers':
        return tintDinner;
      default:
        return const Color(0xFFEFEAE3);
    }
  }

  static Color mealTint(String category) {
    switch (category) {
      case 'Breakfast':
        return tintBreakfast;
      case 'Lunch':
        return tintLunch;
      case 'Snack':
        return tintSnack;
      default:
        return tintDinner;
    }
  }
}
