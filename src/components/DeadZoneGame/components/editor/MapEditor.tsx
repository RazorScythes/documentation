import React, { useCallback, useEffect, useState } from 'react';
import SpritePalette from './SpritePalette';
import CanvasEditor from './CanvasEditor';
import InspectorPanel from './InspectorPanel';
import EditorTopbar from './EditorTopbar';
import { useEditorStore, type EditorSprite } from '../../store/editorStore';
import { useGameDefs } from '../../data/gameDefinitions';
import { fetchDefinitionById, updateDefinition, type SpriteAsset, type SpriteFolder } from '../../api/mapEditorApi';

interface Props {
  onExit: () => void;
  definitionId?: string;
  userSprites?: SpriteAsset[];
  userFolders?: SpriteFolder[];
}

export default function MapEditor({ onExit, definitionId, userSprites = [], userFolders = [] }: Props) {
  const handleDragStart = useCallback((_sprite: string) => {}, []);
  const [loaded, setLoaded] = useState(!definitionId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!definitionId) return;
    let cancelled = false;

    (async () => {
      try {
        const def = await fetchDefinitionById(definitionId);
        if (cancelled) return;

        if (def.data?.editorObjects) {
          useEditorStore.getState().loadLayout(def.data.editorObjects as EditorSprite[]);
        }
        if (def.data?.structures || def.data?.biomes) {
          useGameDefs.getState().loadDefs(
            (def.data.structures ?? []) as never[],
            (def.data.biomes ?? []) as never[],
          );
        }
        setLoaded(true);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load');
      }
    })();

    return () => { cancelled = true; };
  }, [definitionId]);

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-[#0a0a14] flex items-center justify-center text-white">
        {loadError ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-red-400">{loadError}</p>
            <button onClick={onExit} className="text-xs text-indigo-400 hover:underline">Back</button>
          </div>
        ) : (
          <p className="text-sm text-white/40">Loading definition...</p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a14] flex flex-col text-white select-none">
      <EditorTopbar onExit={onExit} definitionId={definitionId} />

      <div className="flex flex-1 min-h-0">
        <div className="w-56 shrink-0 border-r border-white/10 bg-[#0d0d16] overflow-hidden flex flex-col">
          <SpritePalette onDragStart={handleDragStart} userSprites={userSprites} userFolders={userFolders} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 bg-[#12121e]">
            <CanvasEditor />
          </div>
        </div>

        <div className="w-56 shrink-0 border-l border-white/10 bg-[#0d0d16] overflow-hidden flex flex-col">
          <InspectorPanel />
        </div>
      </div>
    </div>
  );
}
