import '../../../core/constants/catalog.dart';
import '../../../core/utils/dates.dart';

const soonThresholdDays = 3;

ExpiryStatus expiryStatus(String dateIso) {
  final days = daysUntil(dateIso);
  if (days < 0) return ExpiryStatus.expired;
  if (days <= soonThresholdDays) return ExpiryStatus.soon;
  return ExpiryStatus.fresh;
}

String expiryLabel(String dateIso) {
  final days = daysUntil(dateIso);
  if (days < 0) return 'Expired ${days.abs()}d ago';
  if (days == 0) return 'Use by today';
  if (days == 1) return 'Use by tomorrow';
  return 'Expiring in $days days';
}

String shortExpiryLabel(String dateIso) {
  final days = daysUntil(dateIso);
  if (days < 0) return 'expired';
  if (days == 0) return 'today';
  if (days == 1) return '1 day';
  return '$days days';
}

int estimateShelfLifeDays(String category) {
  return categoryShelfLifeDays[category] ?? categoryShelfLifeDays['other']!;
}

String estimateExpiryDate(String purchaseDateIso, String category) {
  return addDays(purchaseDateIso, estimateShelfLifeDays(category));
}

String mapDetectedCategory(String detected) {
  final d = detected.toLowerCase();
  if (categories.contains(d)) return d;
  if (RegExp(r'milk|dairy|egg|cheese|yogurt').hasMatch(d)) return 'dairy';
  if (RegExp(r'poultry|meat|beef|pork|chicken').hasMatch(d)) return 'meat';
  if (RegExp(r'fish|seafood').hasMatch(d)) return 'seafood';
  if (RegExp(r'veg|fruit|produce|leaf').hasMatch(d)) return 'produce';
  if (RegExp(r'bread|bakery').hasMatch(d)) return 'bakery';
  if (RegExp(r'condiment|sauce').hasMatch(d)) return 'condiments';
  if (RegExp(r'can|dry|pantry|grain|pasta|rice').hasMatch(d)) return 'pantry';
  if (d.contains('frozen')) return 'frozen';
  if (RegExp(r'beverage|drink|juice').hasMatch(d)) return 'beverages';
  if (d.contains('leftover')) return 'leftovers';
  return 'other';
}
