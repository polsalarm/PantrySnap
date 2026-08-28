export type RecipeLevel = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[]; // lowercase keywords matched against item names
  steps: string[];
  /** Cook time in minutes. Hand-authored for these seeds. */
  mins: number;
  serves: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  level: RecipeLevel;
}

export const RECIPE_SEED: Recipe[] = [
  {
    id: 'omelette',
    name: 'Veggie Omelette',
    emoji: '🍳',
    ingredients: ['egg', 'cheese', 'bell pepper', 'onion', 'milk'],
    steps: [
      'Whisk eggs with a splash of milk.',
      'Sauté diced onion and bell pepper until soft.',
      'Pour eggs over veggies, sprinkle cheese, fold and serve.',
    ],
    mins: 10,
    serves: 2,
    category: 'Breakfast',
    level: 'Easy',
  },
  {
    id: 'stir-fry',
    name: 'Quick Veggie Stir-Fry',
    emoji: '🥦',
    ingredients: ['carrot', 'bell pepper', 'broccoli', 'soy sauce', 'garlic', 'leafy greens'],
    steps: [
      'Heat oil in a wok, add garlic until fragrant.',
      'Add chopped vegetables, stir-fry on high heat 4-5 min.',
      'Splash soy sauce, toss, serve over rice.',
    ],
    mins: 15,
    serves: 3,
    category: 'Dinner',
    level: 'Easy',
  },
  {
    id: 'sandwich',
    name: 'Deli Sandwich',
    emoji: '🥪',
    ingredients: ['deli meat', 'cheese', 'bread', 'condiment', 'leafy greens'],
    steps: [
      'Spread condiment on bread.',
      'Layer deli meat, cheese, and greens.',
      'Close, slice, serve.',
    ],
    mins: 5,
    serves: 1,
    category: 'Lunch',
    level: 'Easy',
  },
  {
    id: 'soup',
    name: 'Leftover Veggie Soup',
    emoji: '🍲',
    ingredients: ['carrot', 'onion', 'leftovers', 'broth', 'leafy greens'],
    steps: [
      'Sauté onion and carrot until soft.',
      'Add leftovers and broth, simmer 15 min.',
      'Stir in greens at the end, season, serve.',
    ],
    mins: 30,
    serves: 4,
    category: 'Dinner',
    level: 'Medium',
  },
  {
    id: 'yogurt-bowl',
    name: 'Yogurt Fruit Bowl',
    emoji: '🥣',
    ingredients: ['yogurt', 'fruit', 'honey'],
    steps: [
      'Spoon yogurt into a bowl.',
      'Top with chopped fruit and a drizzle of honey.',
    ],
    mins: 5,
    serves: 1,
    category: 'Snack',
    level: 'Easy',
  },
  {
    id: 'grilled-cheese',
    name: 'Grilled Cheese',
    emoji: '🧀',
    ingredients: ['cheese', 'bread', 'butter'],
    steps: [
      'Butter bread slices, layer cheese between them.',
      'Grill in a pan on medium heat until golden on both sides.',
    ],
    mins: 8,
    serves: 1,
    category: 'Lunch',
    level: 'Easy',
  },
  {
    id: 'pasta',
    name: 'Garlic Butter Pasta',
    emoji: '🍝',
    ingredients: ['pasta', 'garlic', 'butter', 'cheese', 'leafy greens'],
    steps: [
      'Boil pasta until al dente.',
      'Sauté garlic in butter, toss with pasta and cheese.',
      'Fold in greens, season, serve.',
    ],
    mins: 20,
    serves: 2,
    category: 'Dinner',
    level: 'Easy',
  },
];
