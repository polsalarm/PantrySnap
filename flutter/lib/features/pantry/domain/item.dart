import '../../../core/constants/catalog.dart';

class PantryItem {
  const PantryItem({
    required this.id,
    required this.name,
    required this.category,
    required this.shelfId,
    required this.quantityPct,
    required this.purchaseDate,
    required this.expiryDate,
    required this.expirySource,
    required this.lowStockThresholdPct,
    required this.createdAt,
    required this.updatedAt,
    this.conditionNotes,
  });

  final String id;
  final String name;
  final String category;
  final ShelfId shelfId;
  final int quantityPct;
  final String purchaseDate;
  final String expiryDate;
  final ExpirySource expirySource;
  final int lowStockThresholdPct;
  final int createdAt;
  final int updatedAt;
  final String? conditionNotes;

  bool get isLowStock => quantityPct <= lowStockThresholdPct;

  PantryItem copyWith({
    String? name,
    String? category,
    ShelfId? shelfId,
    int? quantityPct,
    String? purchaseDate,
    String? expiryDate,
    ExpirySource? expirySource,
    int? lowStockThresholdPct,
    int? updatedAt,
    String? conditionNotes,
  }) {
    return PantryItem(
      id: id,
      name: name ?? this.name,
      category: category ?? this.category,
      shelfId: shelfId ?? this.shelfId,
      quantityPct: quantityPct ?? this.quantityPct,
      purchaseDate: purchaseDate ?? this.purchaseDate,
      expiryDate: expiryDate ?? this.expiryDate,
      expirySource: expirySource ?? this.expirySource,
      lowStockThresholdPct: lowStockThresholdPct ?? this.lowStockThresholdPct,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      conditionNotes: conditionNotes ?? this.conditionNotes,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'category': category,
        'shelfId': shelfId.name,
        'quantityPct': quantityPct,
        'purchaseDate': purchaseDate,
        'expiryDate': expiryDate,
        'expirySource': expirySource.name,
        'lowStockThresholdPct': lowStockThresholdPct,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
        'conditionNotes': conditionNotes,
      };

  factory PantryItem.fromJson(Map<String, dynamic> json) {
    return PantryItem(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String? ?? 'other',
      shelfId: ShelfId.values.firstWhere(
        (s) => s.name == json['shelfId'],
        orElse: () => ShelfId.middle,
      ),
      quantityPct: (json['quantityPct'] as num?)?.toInt() ?? 80,
      purchaseDate: json['purchaseDate'] as String? ?? '',
      expiryDate: json['expiryDate'] as String? ?? '',
      expirySource: json['expirySource'] == 'manual'
          ? ExpirySource.manual
          : ExpirySource.estimated,
      lowStockThresholdPct: (json['lowStockThresholdPct'] as num?)?.toInt() ?? 20,
      createdAt: (json['createdAt'] as num?)?.toInt() ?? 0,
      updatedAt: (json['updatedAt'] as num?)?.toInt() ?? 0,
      conditionNotes: json['conditionNotes'] as String?,
    );
  }
}
