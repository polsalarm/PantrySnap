class CookEntry {
  const CookEntry({
    required this.id,
    required this.recipeId,
    required this.recipeTitle,
    required this.itemsUsed,
    required this.rescuedCount,
    required this.cookedAt,
  });

  final String id;
  final String recipeId;
  final String recipeTitle;
  final List<String> itemsUsed;
  final int rescuedCount;
  final int cookedAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'recipeId': recipeId,
        'recipeTitle': recipeTitle,
        'itemsUsed': itemsUsed,
        'rescuedCount': rescuedCount,
        'cookedAt': cookedAt,
      };

  factory CookEntry.fromJson(Map<String, dynamic> json) {
    return CookEntry(
      id: json['id'] as String,
      recipeId: json['recipeId'] as String,
      recipeTitle: json['recipeTitle'] as String,
      itemsUsed: (json['itemsUsed'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
      rescuedCount: (json['rescuedCount'] as num?)?.toInt() ?? 0,
      cookedAt: (json['cookedAt'] as num?)?.toInt() ?? 0,
    );
  }
}

class CookStats {
  const CookStats({
    required this.mealsCooked,
    required this.itemsRescued,
    required this.wasteAvoidedKg,
  });

  final int mealsCooked;
  final int itemsRescued;
  final double wasteAvoidedKg;
}

const avgItemWeightKg = 0.25;

CookStats computeStats(List<CookEntry> entries) {
  final rescued = entries.fold<int>(0, (sum, e) => sum + e.rescuedCount);
  return CookStats(
    mealsCooked: entries.length,
    itemsRescued: rescued,
    wasteAvoidedKg: (rescued * avgItemWeightKg * 10).round() / 10,
  );
}
