import '../../../core/constants/catalog.dart';
import '../../../core/utils/dates.dart';
import '../domain/item.dart';

class SeedSpec {
  const SeedSpec({
    required this.name,
    required this.category,
    required this.shelfId,
    required this.daysUntilExpiry,
    this.quantityPct = 80,
    this.conditionNotes,
  });

  final String name;
  final String category;
  final ShelfId shelfId;
  final int daysUntilExpiry;
  final int quantityPct;
  final String? conditionNotes;
}

const itemSeed = <SeedSpec>[
  SeedSpec(name: 'Ice cream', category: 'frozen', shelfId: ShelfId.freezer, daysUntilExpiry: 30),
  SeedSpec(name: 'Dumplings', category: 'frozen', shelfId: ShelfId.freezer, daysUntilExpiry: 25),
  SeedSpec(name: 'Peas', category: 'frozen', shelfId: ShelfId.freezer, daysUntilExpiry: 40),
  SeedSpec(
    name: 'Garlic',
    category: 'produce',
    shelfId: ShelfId.crisper,
    daysUntilExpiry: 2,
    conditionNotes: 'sealed',
  ),
  SeedSpec(
    name: 'Spinach leafy greens',
    category: 'produce',
    shelfId: ShelfId.crisper,
    daysUntilExpiry: 1,
    quantityPct: 15,
    conditionNotes: 'wilting',
  ),
  SeedSpec(name: 'Carrots', category: 'produce', shelfId: ShelfId.crisper, daysUntilExpiry: 3),
  SeedSpec(name: 'Bell pepper', category: 'produce', shelfId: ShelfId.crisper, daysUntilExpiry: 4),
  SeedSpec(name: 'Onion', category: 'produce', shelfId: ShelfId.crisper, daysUntilExpiry: 6),
  SeedSpec(name: 'Broccoli', category: 'produce', shelfId: ShelfId.crisper, daysUntilExpiry: 5),
  SeedSpec(name: 'Potatoes', category: 'produce', shelfId: ShelfId.bottom, daysUntilExpiry: 2),
  SeedSpec(
    name: 'Berry fruit',
    category: 'produce',
    shelfId: ShelfId.crisper,
    daysUntilExpiry: 2,
    conditionNotes: 'soft',
  ),
  SeedSpec(name: 'Butter', category: 'dairy', shelfId: ShelfId.door, daysUntilExpiry: 18),
  SeedSpec(name: 'Eggs', category: 'dairy', shelfId: ShelfId.door, daysUntilExpiry: 5, quantityPct: 18),
  SeedSpec(
    name: 'Milk',
    category: 'dairy',
    shelfId: ShelfId.door,
    daysUntilExpiry: 2,
    quantityPct: 12,
    conditionNotes: 'opened',
  ),
  SeedSpec(name: 'Swiss cheese', category: 'dairy', shelfId: ShelfId.door, daysUntilExpiry: 9),
  SeedSpec(name: 'Yogurt', category: 'dairy', shelfId: ShelfId.top, daysUntilExpiry: 1, quantityPct: 10),
  SeedSpec(
    name: 'Chicken',
    category: 'meat',
    shelfId: ShelfId.bottom,
    daysUntilExpiry: 1,
    conditionNotes: 'raw',
  ),
  SeedSpec(name: 'Turkey deli meat', category: 'meat', shelfId: ShelfId.middle, daysUntilExpiry: 2),
  SeedSpec(name: 'Rice', category: 'pantry', shelfId: ShelfId.pantry, daysUntilExpiry: 90, quantityPct: 15),
  SeedSpec(name: 'Pasta', category: 'pantry', shelfId: ShelfId.pantry, daysUntilExpiry: 180),
  SeedSpec(
    name: 'Bread',
    category: 'bakery',
    shelfId: ShelfId.middle,
    daysUntilExpiry: 0,
    quantityPct: 8,
    conditionNotes: 'opened',
  ),
  SeedSpec(name: 'Soy sauce', category: 'condiments', shelfId: ShelfId.pantry, daysUntilExpiry: 180),
  SeedSpec(
    name: 'Mayo condiment',
    category: 'condiments',
    shelfId: ShelfId.door,
    daysUntilExpiry: 40,
    quantityPct: 8,
  ),
  SeedSpec(name: 'Honey', category: 'pantry', shelfId: ShelfId.pantry, daysUntilExpiry: 365),
  SeedSpec(name: 'Broth', category: 'pantry', shelfId: ShelfId.pantry, daysUntilExpiry: 14),
  SeedSpec(
    name: 'Leftovers',
    category: 'leftovers',
    shelfId: ShelfId.middle,
    daysUntilExpiry: -1,
    conditionNotes: 'cooked',
  ),
];

List<PantryItem> buildSeedItems() {
  final now = DateTime.now().millisecondsSinceEpoch;
  return [
    for (var i = 0; i < itemSeed.length; i++)
      PantryItem(
        id: 'seed-$i',
        name: itemSeed[i].name,
        category: itemSeed[i].category,
        shelfId: itemSeed[i].shelfId,
        quantityPct: itemSeed[i].quantityPct,
        purchaseDate: isoOffset(-3),
        expiryDate: isoOffset(itemSeed[i].daysUntilExpiry),
        expirySource: ExpirySource.estimated,
        lowStockThresholdPct: 20,
        createdAt: now,
        updatedAt: now,
        conditionNotes: itemSeed[i].conditionNotes,
      ),
  ];
}
