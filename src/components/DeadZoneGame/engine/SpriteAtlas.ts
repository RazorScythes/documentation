const loaded = new Map<string, HTMLImageElement>();
let allLoaded = false;

function img(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error(`Failed to load ${src}`));
    i.src = src;
  });
}

export const SPRITES: Record<string, string> = {
  // Player walk down (6 frames)
  player_walk_down_1: '/sprites/player/walk_down_1.png',
  player_walk_down_2: '/sprites/player/walk_down_2.png',
  player_walk_down_3: '/sprites/player/walk_down_3.png',
  player_walk_down_4: '/sprites/player/walk_down_4.png',
  player_walk_down_5: '/sprites/player/walk_down_5.png',
  player_walk_down_6: '/sprites/player/walk_down_6.png',
  // Player walk left (6 frames)
  player_walk_left_1: '/sprites/player/walk_left_1.png',
  player_walk_left_2: '/sprites/player/walk_left_2.png',
  player_walk_left_3: '/sprites/player/walk_left_3.png',
  player_walk_left_4: '/sprites/player/walk_left_4.png',
  player_walk_left_5: '/sprites/player/walk_left_5.png',
  player_walk_left_6: '/sprites/player/walk_left_6.png',
  // Player walk right (6 frames)
  player_walk_right_1: '/sprites/player/walk_right_1.png',
  player_walk_right_2: '/sprites/player/walk_right_2.png',
  player_walk_right_3: '/sprites/player/walk_right_3.png',
  player_walk_right_4: '/sprites/player/walk_right_4.png',
  player_walk_right_5: '/sprites/player/walk_right_5.png',
  player_walk_right_6: '/sprites/player/walk_right_6.png',
  // Player walk up (6 frames)
  player_walk_up_1: '/sprites/player/walk_up_1.png',
  player_walk_up_2: '/sprites/player/walk_up_2.png',
  player_walk_up_3: '/sprites/player/walk_up_3.png',
  player_walk_up_4: '/sprites/player/walk_up_4.png',
  player_walk_up_5: '/sprites/player/walk_up_5.png',
  player_walk_up_6: '/sprites/player/walk_up_6.png',

  // Zombie walker
  zombie_walker_1: '/sprites/zombie/walker_1.png',
  zombie_walker_2: '/sprites/zombie/walker_2.png',
  zombie_walker_3: '/sprites/zombie/walker_3.png',
  zombie_walker_4: '/sprites/zombie/walker_4.png',
  zombie_walker_5: '/sprites/zombie/walker_5.png',
  // Zombie runner
  zombie_runner_1: '/sprites/zombie/runner_1.png',
  zombie_runner_2: '/sprites/zombie/runner_2.png',
  zombie_runner_3: '/sprites/zombie/runner_3.png',
  // Zombie boomer / tank
  zombie_boomer_1: '/sprites/zombie/boomer_1.png',
  zombie_boomer_2: '/sprites/zombie/boomer_2.png',
  // Zombie horde
  zombie_horde_1: '/sprites/zombie/horde_1.png',
  zombie_horde_2: '/sprites/zombie/horde_2.png',
  zombie_horde_3: '/sprites/zombie/horde_3.png',
  zombie_horde_4: '/sprites/zombie/horde_4.png',
  zombie_horde_5: '/sprites/zombie/horde_5.png',
  zombie_horde_6: '/sprites/zombie/horde_6.png',
  // Zombie hit
  zombie_hit_1: '/sprites/zombie/hit_1.png',
  zombie_hit_2: '/sprites/zombie/hit_2.png',
  zombie_hit_3: '/sprites/zombie/hit_3.png',
  // Zombie tank/armored
  zombie_tank_1: '/sprites/zombie/tank_1.png',
  zombie_tank_2: '/sprites/zombie/tank_2.png',
  zombie_tank_3: '/sprites/zombie/tank_3.png',
  zombie_tank_4: '/sprites/zombie/tank_4.png',

  // Terrain — v2 tiles
  terrain_grass_1: '/sprites/terrain/grass_1.png',
  terrain_grass_2: '/sprites/terrain/grass_2.png',
  terrain_dirt_1: '/sprites/terrain/dirt_1.png',
  terrain_dirt_2: '/sprites/terrain/dirt_2.png',
  terrain_gravel_1: '/sprites/terrain/gravel_1.png',
  terrain_gravel_2: '/sprites/terrain/gravel_2.png',
  terrain_pavement_1: '/sprites/terrain/pavement_1.png',
  terrain_pavement_2: '/sprites/terrain/pavement_2.png',
  terrain_concrete_1: '/sprites/terrain/concrete_1.png',
  terrain_concrete_2: '/sprites/terrain/concrete_2.png',
  terrain_road_1: '/sprites/terrain/road_1.png',
  terrain_road_2: '/sprites/terrain/road_2.png',
  terrain_city_pavement_1: '/sprites/terrain/city_pavement_1.png',
  terrain_city_pavement_2: '/sprites/terrain/city_pavement_2.png',
  terrain_forest_floor_1: '/sprites/terrain/forest_floor_1.png',
  terrain_forest_floor_2: '/sprites/terrain/forest_floor_2.png',
  terrain_forest_floor_3: '/sprites/terrain/forest_floor_3.png',
  terrain_swamp_1: '/sprites/terrain/swamp_1.png',

  // Nature — v2
  tree_oak: '/sprites/nature/tree_oak.png',
  tree_green: '/sprites/nature/tree_green.png',
  tree_birch_1: '/sprites/nature/tree_birch_1.png',
  tree_birch_2: '/sprites/nature/tree_birch_2.png',
  tree_pine_1: '/sprites/nature/tree_pine_1.png',
  tree_pine_2: '/sprites/nature/tree_pine_2.png',
  tree_pine_3: '/sprites/nature/tree_pine_3.png',
  log: '/sprites/nature/log.png',
  bush_1: '/sprites/nature/bush_1.png',
  bush_2: '/sprites/nature/bush_2.png',
  bush_3: '/sprites/nature/bush_3.png',
  bush_4: '/sprites/nature/bush_4.png',
  hedge: '/sprites/nature/hedge.png',
  bush_wide: '/sprites/nature/bush_wide.png',
  bush_small: '/sprites/nature/bush_small.png',
  bush_round: '/sprites/nature/bush_round.png',
  bush_ground: '/sprites/nature/bush_ground.png',
  flower_bush: '/sprites/nature/flower_bush.png',
  aloe: '/sprites/nature/aloe.png',
  flower_white: '/sprites/nature/flower_white.png',
  flower_purple: '/sprites/nature/flower_purple.png',
  flower_red: '/sprites/nature/flower_red.png',
  flower_brown: '/sprites/nature/flower_brown.png',
  ground_scatter: '/sprites/nature/ground_scatter.png',

  // Items — v2
  item_shotgun: '/sprites/item/shotgun.png',
  item_pistol: '/sprites/item/pistol.png',
  item_bullet: '/sprites/item/bullet.png',
  item_machete: '/sprites/item/machete.png',
  item_crowbar: '/sprites/item/crowbar.png',
  item_chainsaw: '/sprites/item/chainsaw.png',
  item_nails: '/sprites/item/nails.png',
  item_baseball_bat: '/sprites/item/baseball_bat.png',
  item_grenade: '/sprites/item/grenade.png',
  item_mine: '/sprites/item/mine.png',
  item_canned_food: '/sprites/item/canned_food.png',
  item_canned_food_2: '/sprites/item/canned_food_2.png',
  item_canned_food_3: '/sprites/item/canned_food_3.png',
  item_jam: '/sprites/item/jam.png',
  item_alcohol: '/sprites/item/alcohol.png',
  item_pills: '/sprites/item/pills.png',
  item_water_jug: '/sprites/item/water_jug.png',
  item_fire_extinguisher: '/sprites/item/fire_extinguisher.png',
  item_mre: '/sprites/item/mre.png',
  item_mre_2: '/sprites/item/mre_2.png',
  item_medkit: '/sprites/item/medkit.png',
  item_bandage: '/sprites/item/bandage.png',
  item_screwdriver: '/sprites/item/screwdriver.png',
  item_wrench: '/sprites/item/wrench.png',
  item_tools: '/sprites/item/tools.png',
  item_duct_tape: '/sprites/item/duct_tape.png',
  item_scrap_metal: '/sprites/item/scrap_metal.png',

  // House — interior/structure
  house_wall: '/sprites/house/wall.png',
  house_floor_1: '/sprites/house/floor_1.png',
  house_floor_2: '/sprites/house/floor_2.png',
  house_floor_3: '/sprites/house/floor_3.png',
  house_door: '/sprites/house/door.png',
  house_window: '/sprites/house/window.png',
  house_bed_1: '/sprites/house/bed_1.png',
  house_bed_2: '/sprites/house/bed_2.png',
  house_table: '/sprites/house/table.png',
  house_shelf_1: '/sprites/house/shelf_1.png',
  house_shelf_2: '/sprites/house/shelf_2.png',
  house_stove: '/sprites/house/stove.png',
  house_cabinet: '/sprites/house/cabinet.png',
  house_fridge: '/sprites/house/fridge.png',
  house_tv: '/sprites/house/tv.png',

  // Decorations — ground scatter
  deco_blood: '/sprites/decoration/blood.png',
  deco_can_1: '/sprites/decoration/can_1.png',
  deco_can_2: '/sprites/decoration/can_2.png',
  deco_crowbar: '/sprites/decoration/crowbar.png',
  deco_firstaid: '/sprites/decoration/firstaid.png',
  deco_gascan: '/sprites/decoration/gascan.png',
  deco_oil: '/sprites/decoration/oil.png',
  deco_opener: '/sprites/decoration/opener.png',
  deco_paper: '/sprites/decoration/paper.png',
  deco_pile_of_tires: '/sprites/decoration/pile_of_tires.png',
  deco_pistol: '/sprites/decoration/pistol.png',
  deco_tape: '/sprites/decoration/tape.png',
  deco_wrench: '/sprites/decoration/wrench.png',

  // Vehicles — v2
  vehicle_stump_1: '/sprites/vehicle/stump_1.png',
  vehicle_stump_2: '/sprites/vehicle/stump_2.png',
  vehicle_rocks: '/sprites/vehicle/rocks.png',
  vehicle_car_blue: '/sprites/vehicle/car_blue.png',
  vehicle_car_camo: '/sprites/vehicle/car_camo.png',
  vehicle_car_brown: '/sprites/vehicle/car_brown.png',
  vehicle_bus: '/sprites/vehicle/bus.png',
  vehicle_junk_pile: '/sprites/vehicle/junk_pile.png',
};

export async function loadAllSprites(): Promise<void> {
  const entries = Object.entries(SPRITES);
  const results = await Promise.allSettled(
    entries.map(async ([key, src]) => {
      const image = await img(src);
      loaded.set(key, image);
    })
  );
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) console.warn(`${failed}/${entries.length} sprites failed to load`);
  allLoaded = true;
}

export function getSprite(key: string): HTMLImageElement | undefined {
  return loaded.get(key);
}

export function isLoaded(): boolean {
  return allLoaded;
}

export const PLAYER_WALK_DOWN = ['player_walk_down_1', 'player_walk_down_2', 'player_walk_down_3', 'player_walk_down_4', 'player_walk_down_5', 'player_walk_down_6'];
export const PLAYER_WALK_LEFT = ['player_walk_left_1', 'player_walk_left_2', 'player_walk_left_3', 'player_walk_left_4', 'player_walk_left_5', 'player_walk_left_6'];
export const PLAYER_WALK_RIGHT = ['player_walk_right_1', 'player_walk_right_2', 'player_walk_right_3', 'player_walk_right_4', 'player_walk_right_5', 'player_walk_right_6'];
export const PLAYER_WALK_UP = ['player_walk_up_1', 'player_walk_up_2', 'player_walk_up_3', 'player_walk_up_4', 'player_walk_up_5', 'player_walk_up_6'];
export const PLAYER_ATTACK = PLAYER_WALK_DOWN;

export const ZOMBIE_WALKER = ['zombie_walker_1', 'zombie_walker_2', 'zombie_walker_3', 'zombie_walker_4', 'zombie_walker_5'];
export const ZOMBIE_RUNNER = ['zombie_runner_1', 'zombie_runner_2', 'zombie_runner_3'];
export const ZOMBIE_TANK = ['zombie_tank_1', 'zombie_tank_2', 'zombie_tank_3', 'zombie_tank_4'];
export const ZOMBIE_HIT = ['zombie_hit_1', 'zombie_hit_2', 'zombie_hit_3'];

export const TERRAIN_GRASS = ['terrain_grass_1', 'terrain_grass_2'];
export const TERRAIN_DIRT = ['terrain_dirt_1', 'terrain_dirt_2'];
export const TERRAIN_GRAVEL = ['terrain_gravel_1', 'terrain_gravel_2'];
export const TERRAIN_CONCRETE = ['terrain_concrete_1', 'terrain_concrete_2'];
export const TERRAIN_ROAD = ['terrain_road_1', 'terrain_road_2'];
export const TERRAIN_PAVEMENT = ['terrain_pavement_1', 'terrain_pavement_2'];
export const TERRAIN_CITY = ['terrain_city_pavement_1', 'terrain_city_pavement_2'];
export const TERRAIN_FOREST = ['terrain_forest_floor_1', 'terrain_forest_floor_2', 'terrain_forest_floor_3'];
export const NATURE_TREES = ['tree_oak', 'tree_green', 'tree_birch_1', 'tree_birch_2', 'tree_pine_1', 'tree_pine_2', 'tree_pine_3'];
export const NATURE_BUSHES = ['bush_1', 'bush_2', 'bush_3', 'bush_4', 'hedge', 'bush_wide', 'bush_small'];
export const VEHICLES = ['vehicle_car_blue', 'vehicle_car_camo', 'vehicle_car_brown'];

export const HOUSE_FLOORS = ['house_floor_1', 'house_floor_2', 'house_floor_3'];
export const HOUSE_BEDS = ['house_bed_1', 'house_bed_2'];
export const HOUSE_SHELVES = ['house_shelf_1', 'house_shelf_2'];

export const DECO_ROAD = ['deco_can_1', 'deco_can_2', 'deco_paper', 'deco_oil'];
export const DECO_URBAN = ['deco_can_1', 'deco_can_2', 'deco_paper', 'deco_blood', 'deco_tape', 'deco_opener'];
export const DECO_MILITARY = ['deco_pistol', 'deco_crowbar', 'deco_firstaid', 'deco_gascan'];
export const DECO_JUNKYARD = ['deco_pile_of_tires', 'deco_oil', 'deco_wrench', 'deco_gascan', 'deco_can_1', 'deco_can_2'];

export const ITEM_SPRITE_MAP: Record<string, string> = {
  kitchen_knife: 'item_machete',
  baseball_bat: 'item_baseball_bat',
  crowbar: 'item_crowbar',
  axe: 'item_crowbar',
  pistol: 'item_pistol',
  shotgun: 'item_shotgun',
  pistol_ammo: 'item_bullet',
  shotgun_ammo: 'item_bullet',
  canned_food: 'item_canned_food',
  water_bottle: 'item_water_jug',
  bandage: 'item_bandage',
  painkillers: 'item_pills',
  medkit: 'item_medkit',
  rags: 'item_bandage',
  nails: 'item_nails',
  alcohol: 'item_alcohol',
  molotov: 'item_grenade',
  mre: 'item_mre',
  chainsaw: 'item_chainsaw',
  screwdriver: 'item_screwdriver',
  wrench: 'item_wrench',
  duct_tape: 'item_duct_tape',
  scrap_metal: 'item_scrap_metal',
};
