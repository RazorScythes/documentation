import type { ItemDef } from './types';

export const ITEM_DEFS: Record<string, ItemDef> = {
  kitchen_knife: {
    id: 'kitchen_knife', name: 'Kitchen Knife', type: 'weapon', weight: 0.5,
    stackable: false, maxStack: 1, icon: '🔪',
    description: 'A sharp kitchen knife. Fast attack speed with low noise — ideal for stealth kills. Click to swing at nearby zombies. Short range but won\'t attract hordes.',
    damage: 20, range: 28, noiseLevel: 0.1,
  },
  baseball_bat: {
    id: 'baseball_bat', name: 'Baseball Bat', type: 'weapon', weight: 1.5,
    stackable: false, maxStack: 1, icon: '🏏',
    description: 'Heavy wooden bat with good reach. Click to swing — can knock back zombies. Moderate noise. Great for clearing 1-2 zombies without wasting ammo.',
    damage: 30, range: 36, noiseLevel: 0.3,
  },
  crowbar: {
    id: 'crowbar', name: 'Crowbar', type: 'weapon', weight: 2.0,
    stackable: false, maxStack: 1, icon: '🔧',
    description: 'Sturdy iron crowbar. High damage melee weapon. Click to strike. The weight means slower swings but devastating hits. 15% chance of headshot for triple damage.',
    damage: 35, range: 32, noiseLevel: 0.3,
  },
  axe: {
    id: 'axe', name: 'Fire Axe', type: 'weapon', weight: 3.0,
    stackable: false, maxStack: 1, icon: '🪓',
    description: 'Devastating fire axe. The heaviest melee weapon — one-shots runners. Click to chop. High noise and weight but unmatched melee damage.',
    damage: 50, range: 30, noiseLevel: 0.4,
  },
  pistol: {
    id: 'pistol', name: 'Pistol', type: 'weapon', weight: 1.2,
    stackable: false, maxStack: 1, icon: '🔫',
    description: '9mm semi-automatic. Click to fire (needs 9mm Ammo). Press R to reload. LOUD — zombies within 400m will hear. 20% headshot chance for 2.5x damage. Accurate at range.',
    damage: 40, range: 300, fireRate: 0.4, ammoType: 'pistol_ammo', noiseLevel: 1.0,
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', type: 'weapon', weight: 3.5,
    stackable: false, maxStack: 1, icon: '🔫',
    description: 'Pump-action 12 gauge. VERY LOUD — will alert every zombie nearby. Click to fire (needs Shotgun Shells). Press R to reload. Devastating at close range. Slow fire rate.',
    damage: 70, range: 150, fireRate: 1.0, ammoType: 'shotgun_ammo', noiseLevel: 1.5,
  },
  pistol_ammo: {
    id: 'pistol_ammo', name: '9mm Ammo', type: 'ammo', weight: 0.05,
    stackable: true, maxStack: 50, icon: '🔹',
    description: '9mm rounds for the Pistol. Found in warehouses and cars. Each shot uses 1 round. Equip a pistol and click to fire. Stack up to 50.',
  },
  shotgun_ammo: {
    id: 'shotgun_ammo', name: 'Shotgun Shells', type: 'ammo', weight: 0.1,
    stackable: true, maxStack: 24, icon: '🔸',
    description: '12 gauge shells for the Shotgun. Rarer than pistol ammo — found in warehouses. Each shot uses 1 shell. Stack up to 24.',
  },
  canned_food: {
    id: 'canned_food', name: 'Canned Food', type: 'food', weight: 0.4,
    stackable: true, maxStack: 10, icon: '🥫',
    description: 'Preserved canned food. Open Inventory (I), hover over it, and click "Use" to eat. Restores 40 hunger. Keep hunger above 0 or you\'ll lose health!',
    foodAmount: 40,
  },
  water_bottle: {
    id: 'water_bottle', name: 'Water Bottle', type: 'water', weight: 0.5,
    stackable: true, maxStack: 5, icon: '💧',
    description: 'Clean drinking water. Open Inventory (I), hover and click "Use" to drink. Restores 45 thirst. Thirst drains faster than hunger — prioritize water!',
    waterAmount: 45,
  },
  bandage: {
    id: 'bandage', name: 'Bandage', type: 'medicine', weight: 0.1,
    stackable: true, maxStack: 10, icon: '🩹',
    description: 'Cloth bandage. Open Inventory (I) and click "Use" to apply. STOPS BLEEDING and heals 15 HP. Always keep some — bleeding drains health over time!',
    healAmount: 15,
  },
  painkillers: {
    id: 'painkillers', name: 'Painkillers', type: 'medicine', weight: 0.1,
    stackable: true, maxStack: 5, icon: '💊',
    description: 'Pain relief medication. Open Inventory (I) and click "Use". Heals 30 HP but does NOT stop bleeding. Use a bandage first if you\'re bleeding.',
    healAmount: 30,
  },
  medkit: {
    id: 'medkit', name: 'First Aid Kit', type: 'medicine', weight: 1.0,
    stackable: false, maxStack: 1, icon: '🏥',
    description: 'Complete medical kit. Open Inventory (I) and click "Use". Heals 70 HP — the best healing item. Rare — found in hospitals. Save for emergencies!',
    healAmount: 70,
  },
  rags: {
    id: 'rags', name: 'Rags', type: 'material', weight: 0.1,
    stackable: true, maxStack: 10, icon: '🧶',
    description: 'Dirty cloth strips. Crafting material — press C to open Crafting. 2 Rags = 2 Bandages. Can also combine with Alcohol to make a Molotov Cocktail.',
  },
  nails: {
    id: 'nails', name: 'Nails', type: 'material', weight: 0.2,
    stackable: true, maxStack: 20, icon: '📌',
    description: 'Box of sharp nails. Crafting material for advanced recipes. Found in warehouses. Keep them for future crafting upgrades.',
  },
  alcohol: {
    id: 'alcohol', name: 'Alcohol', type: 'material', weight: 0.3,
    stackable: true, maxStack: 5, icon: '🍾',
    description: 'Rubbing alcohol. Crafting material — press C to open Crafting. Combine with Rags to craft a Molotov Cocktail (fire bomb). Found in hospitals.',
  },
  molotov: {
    id: 'molotov', name: 'Molotov Cocktail', type: 'throwable', weight: 0.8,
    stackable: true, maxStack: 3, icon: '🔥',
    description: 'Improvised fire bomb. Equip to hotbar (1-5) and click to throw. Deals 60 area damage and attracts zombies with noise. Craft from Alcohol + Rags (press C).',
    damage: 60, range: 200, noiseLevel: 1.2,
  },
  mre: {
    id: 'mre', name: 'MRE', type: 'food', weight: 0.6,
    stackable: true, maxStack: 5, icon: '🍱',
    description: 'Military ration — Meal Ready to Eat. Open Inventory (I) and click "Use" to eat. Restores 60 hunger. Rare but highly nutritious.',
    foodAmount: 60,
  },
  chainsaw: {
    id: 'chainsaw', name: 'Chainsaw', type: 'weapon', weight: 5.0,
    stackable: false, maxStack: 1, icon: '🪚',
    description: 'Gas-powered chainsaw. Extremely heavy but devastating. Click to rev and slash nearby zombies. VERY LOUD — will attract every zombie in the area.',
    damage: 75, range: 34, noiseLevel: 1.8,
  },
  screwdriver: {
    id: 'screwdriver', name: 'Screwdriver', type: 'tool', weight: 0.3,
    stackable: false, maxStack: 1, icon: '🪛',
    description: 'Flathead screwdriver. A basic tool useful for crafting and prying open containers. Can be used as an emergency weapon in a pinch.',
    damage: 12, range: 24, noiseLevel: 0.05,
  },
  wrench: {
    id: 'wrench', name: 'Wrench', type: 'tool', weight: 0.8,
    stackable: false, maxStack: 1, icon: '🔧',
    description: 'Heavy pipe wrench. Useful tool and decent improvised weapon. Good knockback on hit.',
    damage: 25, range: 30, noiseLevel: 0.2,
  },
  duct_tape: {
    id: 'duct_tape', name: 'Duct Tape', type: 'material', weight: 0.2,
    stackable: true, maxStack: 5, icon: '🩹',
    description: 'Roll of duct tape. Essential crafting material for weapon upgrades and repairs. Found in warehouses and gas stations.',
  },
  scrap_metal: {
    id: 'scrap_metal', name: 'Scrap Metal', type: 'material', weight: 0.5,
    stackable: true, maxStack: 10, icon: '⚙️',
    description: 'Salvaged metal scraps. Crafting material for barricades and weapon mods. Common in junkyards and wrecked cars.',
  },
  motorcycle_helmet: {
    id: 'motorcycle_helmet', name: 'Motorcycle Helmet', type: 'armor', weight: 1.0,
    stackable: false, maxStack: 1, icon: '⛑️',
    description: 'A sturdy motorcycle helmet. Provides basic head protection against zombie attacks.',
    armorSlot: 'head', defense: 5,
  },
  riot_helmet: {
    id: 'riot_helmet', name: 'Riot Helmet', type: 'armor', weight: 1.5,
    stackable: false, maxStack: 1, icon: '🪖',
    description: 'Military-grade riot helmet with face shield. Strong head protection found in bunkers.',
    armorSlot: 'head', defense: 8,
  },
  tactical_vest: {
    id: 'tactical_vest', name: 'Tactical Vest', type: 'armor', weight: 2.5,
    stackable: false, maxStack: 1, icon: '🦺',
    description: 'Lightweight tactical vest with ballistic panels. Good torso protection.',
    armorSlot: 'body', defense: 10,
  },
  military_vest: {
    id: 'military_vest', name: 'Military Vest', type: 'armor', weight: 3.5,
    stackable: false, maxStack: 1, icon: '🎽',
    description: 'Heavy-duty military body armor. Maximum torso protection but weighs you down.',
    armorSlot: 'body', defense: 15,
  },
  leather_jacket: {
    id: 'leather_jacket', name: 'Leather Jacket', type: 'armor', weight: 1.5,
    stackable: false, maxStack: 1, icon: '🧥',
    description: 'Thick leather jacket. Moderate torso protection, lighter than tactical vests.',
    armorSlot: 'body', defense: 6,
  },
  combat_boots: {
    id: 'combat_boots', name: 'Combat Boots', type: 'armor', weight: 1.0,
    stackable: false, maxStack: 1, icon: '🥾',
    description: 'Heavy-duty military boots. Protects your legs and improves traction.',
    armorSlot: 'legs', defense: 3,
  },
};

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  result: { defId: string; quantity: number };
  ingredients: { defId: string; quantity: number }[];
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_bandage',
    name: 'Craft Bandage',
    description: 'Tear rags into clean bandages. Stops bleeding and heals minor wounds.',
    result: { defId: 'bandage', quantity: 2 },
    ingredients: [{ defId: 'rags', quantity: 2 }],
  },
  {
    id: 'craft_molotov',
    name: 'Craft Molotov',
    description: 'Create an improvised fire bomb. Great for crowd control but VERY loud.',
    result: { defId: 'molotov', quantity: 1 },
    ingredients: [{ defId: 'alcohol', quantity: 1 }, { defId: 'rags', quantity: 1 }],
  },
];
