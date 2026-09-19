import 'package:flutter/material.dart';

enum ShelfId { freezer, top, middle, bottom, crisper, door, pantry }

enum StorageClass { fridge, freezer, pantry }

enum ExpirySource { manual, estimated }

enum ExpiryStatus { fresh, soon, expired }

class ShelfInfo {
  const ShelfInfo({
    required this.id,
    required this.name,
    required this.icon,
    required this.order,
  });

  final ShelfId id;
  final String name;
  final IconData icon;
  final int order;
}

const shelves = <ShelfInfo>[
  ShelfInfo(id: ShelfId.freezer, name: 'Freezer', icon: Icons.ac_unit, order: -1),
  ShelfInfo(id: ShelfId.top, name: 'Top Shelf', icon: Icons.kitchen_outlined, order: 0),
  ShelfInfo(id: ShelfId.middle, name: 'Middle Shelf', icon: Icons.kitchen_outlined, order: 1),
  ShelfInfo(id: ShelfId.bottom, name: 'Bottom Shelf', icon: Icons.kitchen_outlined, order: 2),
  ShelfInfo(id: ShelfId.crisper, name: 'Crisper', icon: Icons.grass, order: 3),
  ShelfInfo(id: ShelfId.door, name: 'Door', icon: Icons.sensor_door_outlined, order: 4),
  ShelfInfo(id: ShelfId.pantry, name: 'Pantry', icon: Icons.shelves, order: 5),
];

const categories = <String>[
  'dairy',
  'meat',
  'seafood',
  'produce',
  'leftovers',
  'condiments',
  'bakery',
  'beverages',
  'frozen',
  'pantry',
  'other',
];

const categoryShelfLifeDays = <String, int>{
  'dairy': 10,
  'meat': 4,
  'seafood': 2,
  'produce': 7,
  'leftovers': 4,
  'condiments': 180,
  'bakery': 5,
  'beverages': 14,
  'frozen': 90,
  'pantry': 270,
  'other': 7,
};

ShelfInfo shelfById(ShelfId id) => shelves.firstWhere((s) => s.id == id);

StorageClass storageForShelf(ShelfId shelfId) {
  if (shelfId == ShelfId.pantry) return StorageClass.pantry;
  if (shelfId == ShelfId.freezer) return StorageClass.freezer;
  return StorageClass.fridge;
}

String shelfLabel(ShelfId id) => shelfById(id).name;
