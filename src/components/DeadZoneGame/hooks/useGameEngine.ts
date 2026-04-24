import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameLoop } from '../engine/GameLoop';
import { Camera, ZOOM } from '../engine/Camera';
import { Input } from '../engine/Input';
import { TILE_SIZE, CHUNK_SIZE, TileType } from '../engine/types';
import { drawTile, drawTileOverlay, drawPlayer, drawZombie, drawBullet, drawBloodSplatter, drawLootHighlight, drawLootItem, tickSpriteFrame, OVERLAY_TILES, TALL_OVERLAY_TILES } from '../engine/SpriteRenderer';
import { updatePlayer, updateSurvival, checkNearbyLoot } from '../systems/playerSystem';
import { updateZombies } from '../systems/zombieAI';
import { handleMeleeAttack, handleGunFire, updateBullets, getPlayerDefense } from '../systems/combat';
import { searchLootSpot } from '../systems/inventorySystem';
import { ITEM_DEFS } from '../engine/itemDefs';
import { useItem } from '../systems/playerSystem';

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const loopRef = useRef<GameLoop | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const inputRef = useRef<Input | null>(null);
  const survivalTickRef = useRef(0);
  const cameraInitRef = useRef(false);

  const startEngine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const camera = new Camera(canvas.width, canvas.height);
    cameraRef.current = camera;
    cameraInitRef.current = false;

    const input = new Input(canvas);
    inputRef.current = input;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      camera.resize(canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);

    const update = (dt: number) => {
      const store = useGameStore.getState();
      if (store.gameStatus !== 'playing') return;
      if (store.showInventory || store.showCrafting) return;

      const cm = store.chunkManager;
      if (!cm) return;

      let { player, bullets, bloodSplatters, inventory } = store;
      const { maxWeight, equippedSlot } = store;

      // Snap camera on first frame so there's no lerp jump
      if (!cameraInitRef.current) {
        camera.snapTo(player.x, player.y);
        cameraInitRef.current = true;
      }

      player = updatePlayer(player, dt, input, camera, cm, inventory, maxWeight);

      cm.updateLoadedChunks(player.x, player.y);

      // Only gather zombies from nearby chunks
      let zombies = cm.getVisibleZombies(player.x, player.y, 3);

      survivalTickRef.current += dt;
      if (survivalTickRef.current >= 1) {
        player = updateSurvival(player, survivalTickRef.current, store.timeOfDay);
        survivalTickRef.current = 0;
      }

      const zombieResult = updateZombies(zombies, player, cm, dt, store.worldTime, store.timeOfDay);
      zombies = zombieResult.zombies;

      if (zombieResult.playerDamage > 0) {
        const defense = getPlayerDefense(player, inventory);
        const reduced = Math.max(1, zombieResult.playerDamage - defense);
        player = { ...player, health: Math.max(0, player.health - reduced) };
        if (zombieResult.playerBleeding) {
          player.bleeding = true;
          player.bleedTimer = 10;
        }
      }

      if (player.health <= 0) {
        useGameStore.setState({ player, gameStatus: 'gameover' });
        return;
      }

      if (input.consumeClick()) {
        const item = inventory.find(i => i.slotIndex === equippedSlot);
        const def = item ? ITEM_DEFS[item.defId] : null;

        if (def && def.type === 'weapon' && def.ammoType) {
          const gunResult = handleGunFire(player, inventory, equippedSlot, bullets);
          player = gunResult.player;
          inventory = gunResult.inventory;
          bullets = gunResult.bullets;
          if (gunResult.message) {
            useGameStore.setState({ notification: gunResult.message, notificationTimer: 2 });
          }
        } else {
          const meleeResult = handleMeleeAttack(player, zombies, equippedSlot, inventory);
          player = meleeResult.player;
          zombies = meleeResult.zombies;
          bloodSplatters = [...bloodSplatters, ...meleeResult.blood];
        }
      }

      const bulletResult = updateBullets(bullets, zombies, cm, dt);
      bullets = bulletResult.bullets;
      zombies = bulletResult.zombies;
      bloodSplatters = [...bloodSplatters, ...bulletResult.blood];

      bloodSplatters = bloodSplatters
        .map(b => ({ ...b, alpha: b.alpha - dt * 0.05 }))
        .filter(b => b.alpha > 0);

      const lootSpots = cm.getVisibleLootSpots(player.x, player.y, 1);
      const lootIdx = checkNearbyLoot(player.x, player.y, lootSpots);
      const nearbyLootSpot = lootIdx >= 0 ? lootSpots[lootIdx] : null;

      if (input.isKeyDown('KeyE') && lootIdx >= 0) {
        const searchResult = searchLootSpot(lootSpots, lootIdx, inventory, maxWeight);
        for (let i = 0; i < searchResult.lootSpots.length; i++) {
          const ls = searchResult.lootSpots[i];
          if (ls.searched && !lootSpots[i].searched) {
            cm.updateLootSpot(ls.tileX, ls.tileY, { searched: true });
          }
        }
        inventory = searchResult.inventory;
        const msg = searchResult.messages.join(' ');
        useGameStore.setState({ notification: msg, notificationTimer: 3 });
      }

      if (input.consumeKey('KeyF')) {
        const ptx = Math.floor(player.x / TILE_SIZE);
        const pty = Math.floor(player.y / TILE_SIZE);
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
        for (const [dx, dy] of dirs) {
          const nx = ptx + dx;
          const ny = pty + dy;
          const t = cm.getTile(nx, ny);
          if (t === TileType.DOOR) {
            cm.setTile(nx, ny, TileType.DOOR_LOCKED);
            useGameStore.setState({ notification: 'Door locked', notificationTimer: 2 });
            break;
          } else if (t === TileType.DOOR_LOCKED) {
            cm.setTile(nx, ny, TileType.DOOR);
            useGameStore.setState({ notification: 'Door unlocked', notificationTimer: 2 });
            break;
          }
        }
      }

      if (input.isKeyDown('KeyR') && !player.isReloading) {
        const item = inventory.find(i => i.slotIndex === equippedSlot);
        const def = item ? ITEM_DEFS[item.defId] : null;
        if (def?.ammoType) {
          player = { ...player, isReloading: true, reloadTimer: 1.5 };
        }
      }

      // Quick-use slots
      const quickKeys = ['KeyQ', 'KeyZ', 'KeyX'] as const;
      const qSlots = store.quickUseSlots;
      for (let qi = 0; qi < 3; qi++) {
        if (input.consumeKey(quickKeys[qi]) && qSlots[qi] !== null) {
          const result = useItem(player, inventory, qSlots[qi]!);
          player = result.player;
          inventory = result.inventory;
          if (result.message) {
            useGameStore.setState({ notification: result.message, notificationTimer: 2 });
          }
        }
      }

      let worldTime = store.worldTime + dt;
      let timeOfDay = store.timeOfDay + dt / store.dayLength;
      let dayCount = store.dayCount;
      if (timeOfDay >= 1) {
        timeOfDay -= 1;
        dayCount++;
      }

      let notifTimer = store.notificationTimer - dt;
      if (notifTimer < 0) notifTimer = 0;

      zombies = zombies.filter(z => z.state !== 'dead' || z.deathTimer < 10);

      // Write zombies back to their chunks.
      // First clear all zombie arrays in loaded chunks that we pulled from,
      // then redistribute based on current position.
      const pcx = Math.floor(player.x / (CHUNK_SIZE * TILE_SIZE));
      const pcy = Math.floor(player.y / (CHUNK_SIZE * TILE_SIZE));
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (cm.hasChunk(pcx + dx, pcy + dy)) {
            cm.setChunkZombies(pcx + dx, pcy + dy, []);
          }
        }
      }
      for (const z of zombies) {
        const zcx = Math.floor(z.x / (CHUNK_SIZE * TILE_SIZE));
        const zcy = Math.floor(z.y / (CHUNK_SIZE * TILE_SIZE));
        if (cm.hasChunk(zcx, zcy)) {
          const chunk = cm.getChunk(zcx, zcy);
          chunk.zombies.push(z);
        }
      }

      useGameStore.setState({
        player, zombies, bullets, bloodSplatters, inventory,
        nearbyLootSpot, worldTime, timeOfDay, dayCount, notificationTimer: notifTimer,
      });

      camera.follow(player.x, player.y);
    };

    const render = (ctx: CanvasRenderingContext2D, _dt: number) => {
      tickSpriteFrame();
      const store = useGameStore.getState();
      if (store.gameStatus === 'menu') return;

      const cm = store.chunkManager;
      if (!cm) return;

      const { player, zombies, bullets, bloodSplatters, timeOfDay } = store;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(ZOOM, 0, 0, ZOOM, 0, 0);

      const vw = camera.viewWidth;
      const vh = camera.viewHeight;

      const startCol = Math.floor(camera.x / TILE_SIZE) - 1;
      const endCol = Math.ceil((camera.x + vw) / TILE_SIZE) + 2;
      const startRow = Math.floor(camera.y / TILE_SIZE) - 1;
      const endRow = Math.ceil((camera.y + vh) / TILE_SIZE) + 2;

      // Build a local tile lookup with 1-tile padding on all sides
      // so getBuildingFloorKey/getWallRotation can safely look at neighbors
      const visW = endCol - startCol + 1;
      const visH = endRow - startRow + 1;
      const localTiles: number[][] = [];
      for (let r = 0; r < visH; r++) {
        const row = new Array(visW);
        for (let c = 0; c < visW; c++) {
          row[c] = cm.getTile(startCol + c, startRow + r);
        }
        localTiles[r] = row;
      }

      // Pass 1: Ground tiles
      for (let row = startRow + 1; row < endRow - 1; row++) {
        for (let col = startCol + 1; col < endCol - 1; col++) {
          const lr = row - startRow;
          const lc = col - startCol;
          const tile = localTiles[lr][lc];
          const screen = camera.worldToScreen(col * TILE_SIZE, row * TILE_SIZE);
          drawTile(ctx, tile, screen.x, screen.y, col, row, localTiles, lc, lr);
        }
      }

      // Pass 2: Short overlay objects (fences, barrels, crates, stumps, rocks, cars)
      for (let row = startRow + 1; row < endRow - 1; row++) {
        for (let col = startCol + 1; col < endCol - 1; col++) {
          const lr = row - startRow;
          const lc = col - startCol;
          const tile = localTiles[lr][lc];
          if (!OVERLAY_TILES.has(tile) || TALL_OVERLAY_TILES.has(tile)) continue;
          const screen = camera.worldToScreen(col * TILE_SIZE, row * TILE_SIZE);
          drawTileOverlay(ctx, tile, screen.x, screen.y, col, row);
        }
      }

      // Building labels
      const buildings = cm.getVisibleBuildings(player.x, player.y, 2);
      for (const b of buildings) {
        if (!camera.isVisible(b.x * TILE_SIZE, b.y * TILE_SIZE, b.w * TILE_SIZE, b.h * TILE_SIZE)) continue;
        const bs = camera.worldToScreen(b.x * TILE_SIZE, b.y * TILE_SIZE);
        const bw = b.w * TILE_SIZE;
        const bh = b.h * TILE_SIZE;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, bs.x + bw / 2, bs.y + bh / 2 + 3);
        ctx.textAlign = 'start';
      }

      // Loot items
      const lootSpots = cm.getVisibleLootSpots(player.x, player.y, 2);
      for (const ls of lootSpots) {
        if (!camera.isVisible(ls.tileX * TILE_SIZE, ls.tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE)) continue;
        const screen = camera.worldToScreen(ls.tileX * TILE_SIZE, ls.tileY * TILE_SIZE);
        drawLootHighlight(ctx, screen.x, screen.y, ls.searched);
        if (!ls.searched && ls.items.length > 0) {
          drawLootItem(ctx, screen.x, screen.y, ls.items[0].defId);
        }
      }

      // Blood splatters
      for (const b of bloodSplatters) {
        if (camera.isVisible(b.x - b.size, b.y - b.size, b.size * 2, b.size * 2)) {
          const screen = camera.worldToScreen(b.x, b.y);
          drawBloodSplatter(ctx, screen.x, screen.y, b);
        }
      }

      // Y-sort entities together with tall overlays (trees, dead trees, bushes)
      // so tree canopies render on top of entities that walk behind them
      const allEntities: { y: number; draw: () => void }[] = [];

      // Add tall overlays as Y-sortable entries (Y = bottom of their tile)
      for (let row = startRow + 1; row < endRow - 1; row++) {
        for (let col = startCol + 1; col < endCol - 1; col++) {
          const lr = row - startRow;
          const lc = col - startCol;
          const tile = localTiles[lr][lc];
          if (!TALL_OVERLAY_TILES.has(tile)) continue;
          const worldY = (row + 1) * TILE_SIZE;
          const capturedCol = col;
          const capturedRow = row;
          allEntities.push({
            y: worldY,
            draw: () => {
              const screen = camera.worldToScreen(capturedCol * TILE_SIZE, capturedRow * TILE_SIZE);
              drawTileOverlay(ctx, tile, screen.x, screen.y, capturedCol, capturedRow);
            },
          });
        }
      }

      allEntities.push({
        y: player.y,
        draw: () => {
          const ps = camera.worldToScreen(player.x, player.y);
          drawPlayer(ctx, ps.x, ps.y, player.facing, player.isMoving, player.isRunning, player.isSneaking,
            player.isAttacking, player.animFrame, player.health, player.maxHealth, player.equippedWeapon);
        },
      });

      for (const z of zombies) {
        if (!camera.isVisible(z.x - 20, z.y - 20, 40, 40)) continue;
        allEntities.push({
          y: z.y,
          draw: () => {
            const zs = camera.worldToScreen(z.x, z.y);
            drawZombie(ctx, zs.x, zs.y, z.type, z.state, z.facing, z.animFrame,
              z.health, z.maxHealth, z.deathTimer);
          },
        });
      }

      allEntities.sort((a, b) => a.y - b.y);
      for (const e of allEntities) e.draw();

      // Bullets
      for (const b of bullets) {
        const bs = camera.worldToScreen(b.x, b.y);
        drawBullet(ctx, bs.x, bs.y);
      }

      // Night/fog
      const isNight = timeOfDay > 0.7 || timeOfDay < 0.2;
      if (isNight) {
        const nightAlpha = timeOfDay > 0.7
          ? Math.min(0.7, (timeOfDay - 0.7) * 2.5)
          : Math.min(0.7, (0.2 - timeOfDay) * 2.5);

        const ps = camera.worldToScreen(player.x, player.y);
        const vr = 160;
        const gradient = ctx.createRadialGradient(ps.x, ps.y, 20, ps.x, ps.y, vr);
        gradient.addColorStop(0, 'rgba(0,5,20,0)');
        gradient.addColorStop(0.5, `rgba(0,5,20,${nightAlpha * 0.25})`);
        gradient.addColorStop(1, `rgba(0,5,20,${nightAlpha})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, vw, vh);
      }

      {
        const fogR = isNight ? 140 : 260;
        const ps = camera.worldToScreen(player.x, player.y);
        const fogGrad = ctx.createRadialGradient(ps.x, ps.y, fogR * 0.7, ps.x, ps.y, fogR * 1.4);
        fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
        fogGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, vw, vh);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const loop = new GameLoop(ctx, update, render);
    loopRef.current = loop;
    loop.start();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef]);

  const stopEngine = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
  }, []);

  return { startEngine, stopEngine };
}
