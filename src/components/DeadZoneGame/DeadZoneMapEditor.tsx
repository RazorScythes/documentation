import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorLanding from './components/editor/EditorLanding';
import MapEditor from './components/editor/MapEditor';
import type { SpriteAsset, SpriteFolder } from './api/mapEditorApi';

export default function DeadZoneMapEditor() {
  const navigate = useNavigate();
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [userSprites, setUserSprites] = useState<SpriteAsset[]>([]);
  const [userFolders, setUserFolders] = useState<SpriteFolder[]>([]);

  const handleSpritesChange = useCallback((sprites: SpriteAsset[], folders: SpriteFolder[]) => {
    setUserSprites(sprites);
    setUserFolders(folders);
  }, []);

  if (canvasId) {
    return <MapEditor definitionId={canvasId} onExit={() => setCanvasId(null)} userSprites={userSprites} userFolders={userFolders} />;
  }

  return (
    <EditorLanding
      onExit={() => navigate('/deadzone')}
      onOpenCanvas={(id: string) => setCanvasId(id)}
      onSpritesChange={handleSpritesChange}
    />
  );
}
