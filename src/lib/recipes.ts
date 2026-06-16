export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[]; // lowercase keywords matched against item names
  steps: string[];
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
  },
];
