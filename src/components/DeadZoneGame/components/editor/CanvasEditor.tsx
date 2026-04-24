import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore, DEFAULT_STRUCTURE_DATA, DEFAULT_BIOME_DATA, type EditorSprite } from '../../store/editorStore';
import { SPRITES } from '../../engine/SpriteAtlas';

const HANDLE_SIZE = 8;

type DragMode = 'none' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'pan';

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  objStartX: number;
  objStartY: number;
  objStartW: number;
  objStartH: number;
  panStartX: number;
  panStartY: number;
}

const imgCache = new Map<string, HTMLImageElement>();

function loadImg(src: string): HTMLImageElement | null {
  if (imgCache.has(src)) return imgCache.get(src)!;
  const img = new Image();
  const isUrl = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:');
  img.src = isUrl ? src : (SPRITES[src] ?? `/sprites/${src}`);
  if (isUrl) img.crossOrigin = 'anonymous';
  img.onload = () => imgCache.set(src, img);
  return null;
}

function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const TYPE_COLORS = {
  structure: { border: '#f59e0b', fill: 'rgba(245,158,11,0.08)', badge: '#f59e0b', text: 'STR' },
  biome:     { border: '#22d3ee', fill: 'rgba(34,211,238,0.06)', badge: '#22d3ee', text: 'BIO' },
} as const;

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const dragObjRef = useRef<string | null>(null);

  const store = useEditorStore;
  const [, forceRender] = useState(0);

  const toCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const { canvasOffset, zoom } = store.getState();
      return {
        x: (clientX - rect.left) / zoom - canvasOffset.x,
        y: (clientY - rect.top) / zoom - canvasOffset.y,
      };
    },
    [store],
  );

  const getVisibleObjects = useCallback(() => {
    const { objects, filterType } = store.getState();
    if (filterType === 'all') return objects;
    return objects.filter((o) => o.objectType === filterType);
  }, [store]);

  const hitTest = useCallback(
    (cx: number, cy: number): EditorSprite | null => {
      const visible = getVisibleObjects();
      const sorted = [...visible].sort((a, b) => b.zIndex - a.zIndex);
      for (const obj of sorted) {
        if (cx >= obj.x && cx <= obj.x + obj.width && cy >= obj.y && cy <= obj.y + obj.height) {
          return obj;
        }
      }
      return null;
    },
    [getVisibleObjects],
  );

  const getResizeHandle = useCallback(
    (cx: number, cy: number, obj: EditorSprite): DragMode => {
      const hs = HANDLE_SIZE / store.getState().zoom;
      const r = obj.x + obj.width;
      const b = obj.y + obj.height;
      if (cx >= obj.x - hs && cx <= obj.x + hs && cy >= obj.y - hs && cy <= obj.y + hs) return 'resize-tl';
      if (cx >= r - hs && cx <= r + hs && cy >= obj.y - hs && cy <= obj.y + hs) return 'resize-tr';
      if (cx >= obj.x - hs && cx <= obj.x + hs && cy >= b - hs && cy <= b + hs) return 'resize-bl';
      if (cx >= r - hs && cx <= r + hs && cy >= b - hs && cy <= b + hs) return 'resize-br';
      return 'none';
    },
    [store],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { objects, selectedId, showGrid, snapToGrid, gridSize, canvasOffset, zoom, filterType } = store.getState();

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(canvasOffset.x, canvasOffset.y);

    if (showGrid) {
      const startX = Math.floor(-canvasOffset.x / gridSize) * gridSize;
      const startY = Math.floor(-canvasOffset.y / gridSize) * gridSize;
      const endX = startX + canvas.width / zoom + gridSize * 2;
      const endY = startY + canvas.height / zoom + gridSize * 2;

      ctx.strokeStyle = snapToGrid ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
      }

      if (snapToGrid) {
        ctx.fillStyle = 'rgba(245,158,11,0.12)';
        ctx.beginPath(); ctx.arc(0, 0, 3 / zoom, 0, Math.PI * 2); ctx.fill();
      }
    }

    const visible = filterType === 'all' ? objects : objects.filter((o) => o.objectType === filterType);
    const sorted = [...visible].sort((a, b) => a.zIndex - b.zIndex);

    for (const obj of sorted) {
      const tc = TYPE_COLORS[obj.objectType];
      const img = imgCache.get(obj.sprite);

      ctx.save();
      ctx.fillStyle = tc.fill;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

      if (img) {
        if (obj.rotation) {
          ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
          ctx.translate(-(obj.x + obj.width / 2), -(obj.y + obj.height / 2));
        } else {
          ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
        }
      } else {
        loadImg(obj.sprite);
        ctx.fillStyle = 'rgba(100,100,100,0.3)';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      ctx.restore();

      // Subtle type border
      ctx.strokeStyle = tc.border;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      ctx.globalAlpha = 1;
    }

    // Selection highlight
    if (selectedId) {
      const sel = visible.find((o) => o.id === selectedId);
      if (sel) {
        const tc = TYPE_COLORS[sel.objectType];
        ctx.strokeStyle = tc.border;
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.strokeRect(sel.x, sel.y, sel.width, sel.height);
        ctx.setLineDash([]);

        const hs = HANDLE_SIZE / zoom;
        ctx.fillStyle = tc.border;
        for (const [hx, hy] of [
          [sel.x, sel.y], [sel.x + sel.width, sel.y],
          [sel.x, sel.y + sel.height], [sel.x + sel.width, sel.y + sel.height],
        ]) {
          ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
        }

        // Type badge + label (shown only when selected)
        const fontSize = Math.max(7, 9 / zoom);
        ctx.font = `bold ${fontSize}px monospace`;
        const badgeW = ctx.measureText(tc.text).width + 6 / zoom;
        const badgeH = fontSize + 4 / zoom;
        ctx.fillStyle = tc.badge;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(sel.x, sel.y - badgeH - 2 / zoom, badgeW, badgeH);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.fillText(tc.text, sel.x + 3 / zoom, sel.y - 3 / zoom);

        if (sel.label) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillText(sel.label, sel.x + badgeW + 2 / zoom, sel.y - 3 / zoom);
        }

        if (sel.spawnRate < 100) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.font = `bold ${Math.max(8, 10 / zoom)}px monospace`;
          ctx.fillText(`${sel.spawnRate}%`, sel.x + 2, sel.y + sel.height - 4 / zoom);
        }

        // Dimension + rotation label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${Math.max(8, 9 / zoom)}px monospace`;
        const dimText = sel.rotation
          ? `${Math.round(sel.width)}×${Math.round(sel.height)}  ${sel.rotation}°`
          : `${Math.round(sel.width)}×${Math.round(sel.height)}`;
        ctx.fillText(dimText, sel.x, sel.y + sel.height + 12 / zoom);
      }
    }

    ctx.restore();
    frameRef.current = requestAnimationFrame(draw);
  }, [store]);

  const fittedRef = useRef(false);

  useEffect(() => {
    for (const obj of store.getState().objects) loadImg(obj.sprite);
    frameRef.current = requestAnimationFrame(draw);

    if (!fittedRef.current && store.getState().objects.length > 0) {
      fittedRef.current = true;
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          store.getState().fitToObjects(container.clientWidth, container.clientHeight);
        }
      });
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [draw, store]);

  useEffect(() => store.subscribe(() => {
    forceRender((n) => n + 1);
    if (!fittedRef.current && store.getState().objects.length > 0) {
      fittedRef.current = true;
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          store.getState().fitToObjects(container.clientWidth, container.clientHeight);
        }
      });
    }
  }), [store]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        dragRef.current = {
          mode: 'pan', startX: e.clientX, startY: e.clientY,
          objStartX: 0, objStartY: 0, objStartW: 0, objStartH: 0,
          panStartX: store.getState().canvasOffset.x, panStartY: store.getState().canvasOffset.y,
        };
        return;
      }

      const pos = toCanvas(e.clientX, e.clientY);
      const { selectedId } = store.getState();
      const visible = getVisibleObjects();

      if (selectedId) {
        const sel = visible.find((o) => o.id === selectedId);
        if (sel) {
          const handle = getResizeHandle(pos.x, pos.y, sel);
          if (handle !== 'none') {
            dragRef.current = {
              mode: handle, startX: pos.x, startY: pos.y,
              objStartX: sel.x, objStartY: sel.y, objStartW: sel.width, objStartH: sel.height,
              panStartX: 0, panStartY: 0,
            };
            dragObjRef.current = sel.id;
            return;
          }
        }
      }

      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        store.getState().selectObject(hit.id);
        dragRef.current = {
          mode: 'move', startX: pos.x, startY: pos.y,
          objStartX: hit.x, objStartY: hit.y, objStartW: hit.width, objStartH: hit.height,
          panStartX: 0, panStartY: 0,
        };
        dragObjRef.current = hit.id;
      } else {
        store.getState().selectObject(null);
      }
    },
    [toCanvas, hitTest, getResizeHandle, getVisibleObjects, store],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) return;
      const d = dragRef.current;

      if (d.mode === 'pan') {
        const { zoom } = store.getState();
        store.getState().setCanvasOffset({
          x: d.panStartX + (e.clientX - d.startX) / zoom,
          y: d.panStartY + (e.clientY - d.startY) / zoom,
        });
        return;
      }

      const pos = toCanvas(e.clientX, e.clientY);
      const dx = pos.x - d.startX;
      const dy = pos.y - d.startY;
      const id = dragObjRef.current;
      if (!id) return;

      const { snap, snapSize } = store.getState();

      if (d.mode === 'move') {
        store.getState().updateObject(id, {
          x: snap(d.objStartX + dx),
          y: snap(d.objStartY + dy),
        });
      } else if (d.mode === 'resize-br') {
        store.getState().updateObject(id, {
          width: snapSize(d.objStartW + dx),
          height: snapSize(d.objStartH + dy),
        });
      } else if (d.mode === 'resize-bl') {
        const newW = snapSize(d.objStartW - dx);
        store.getState().updateObject(id, {
          x: snap(d.objStartX + d.objStartW - newW),
          width: newW,
          height: snapSize(d.objStartH + dy),
        });
      } else if (d.mode === 'resize-tr') {
        const newH = snapSize(d.objStartH - dy);
        store.getState().updateObject(id, {
          y: snap(d.objStartY + d.objStartH - newH),
          width: snapSize(d.objStartW + dx),
          height: newH,
        });
      } else if (d.mode === 'resize-tl') {
        const newW = snapSize(d.objStartW - dx);
        const newH = snapSize(d.objStartH - dy);
        store.getState().updateObject(id, {
          x: snap(d.objStartX + d.objStartW - newW),
          y: snap(d.objStartY + d.objStartH - newH),
          width: newW,
          height: newH,
        });
      }
    },
    [toCanvas, store],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    dragObjRef.current = null;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const { zoom } = store.getState();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      store.getState().setZoom(zoom + delta);
    },
    [store],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const sprite = e.dataTransfer.getData('sprite');
      if (!sprite) return;

      const dragType = e.dataTransfer.getData('objectType') as 'structure' | 'biome' | '';
      const { placementType, snap, snapSize, objects } = store.getState();
      const objType = dragType || placementType;

      const pos = toCanvas(e.clientX, e.clientY);
      const img = loadImg(sprite);
      const rawW = img ? Math.min(img.naturalWidth, 128) : 64;
      const rawH = img ? Math.min(img.naturalHeight, 128) : 64;
      const w = snapSize(rawW);
      const h = snapSize(rawH);

      const obj: EditorSprite = {
        id: uuid(),
        sprite,
        x: snap(pos.x - w / 2),
        y: snap(pos.y - h / 2),
        width: w,
        height: h,
        rotation: 0,
        spawnRate: 100,
        zIndex: objects.length,
        objectType: objType,
        label: (sprite.startsWith('http') ? decodeURIComponent(sprite.split('/').pop() || 'sprite').replace(/^\d+_/, '').replace(/\.[^.]+$/, '') : sprite).replace(/_/g, ' '),
        structureData: objType === 'structure' ? { ...DEFAULT_STRUCTURE_DATA } : undefined,
        biomeData: objType === 'biome' ? { ...DEFAULT_BIOME_DATA } : undefined,
      };
      store.getState().addObject(obj);
      store.getState().selectObject(obj.id);
    },
    [toCanvas, store],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { selectedId } = store.getState();
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        store.getState().removeObject(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        store.getState().duplicateObject(selectedId);
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const obj = store.getState().objects.find((o) => o.id === selectedId);
        if (!obj) return;
        const step = e.shiftKey ? -90 : 90;
        store.getState().updateObject(selectedId, { rotation: ((obj.rotation || 0) + step + 360) % 360 });
      }
    },
    [store],
  );

  const snapOn = useEditorStore((s) => s.snapToGrid);

  return (
    <div ref={containerRef} className="w-full h-full relative" tabIndex={0} onKeyDown={handleKeyDown}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      <div className="absolute bottom-2 left-2 text-[10px] text-white/30 pointer-events-none flex items-center gap-3">
        <span>Scroll zoom · Alt+drag pan · Del remove · Ctrl+D dup · R rotate</span>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${snapOn ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/30'}`}>
          SNAP {snapOn ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
