import { screenToWorld } from './camera.js';

/**
 * @param {HTMLCanvasElement} canvas
 */
export function createInputManager(canvas) {
  const keysDown = Object.create(null);
  const keysJustPressed = Object.create(null);
  const mouseDown = Object.create(null);
  const mouseJustPressed = Object.create(null);
  let mouseX = 0;
  let mouseY = 0;
  let bound = true;

  function onKeyDown(e) {
    if (!keysDown[e.code]) {
      keysJustPressed[e.code] = true;
    }
    keysDown[e.code] = true;
  }
  function onKeyUp(e) {
    keysDown[e.code] = false;
  }
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) * (canvas.width / rect.width)) || 0;
    mouseY = ((e.clientY - rect.top) * (canvas.height / rect.height)) || 0;
  }
  function onMouseDown(e) {
    if (!mouseDown[e.button]) {
      mouseJustPressed[e.button] = true;
    }
    mouseDown[e.button] = true;
    onMouseMove(e);
  }
  function onMouseUp(e) {
    mouseDown[e.button] = false;
  }
  function onBlur() {
    for (const k of Object.keys(keysDown)) keysDown[k] = false;
    for (const b of Object.keys(mouseDown)) mouseDown[b] = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('blur', onBlur);

  return {
    update() {
      for (const k of Object.keys(keysJustPressed)) delete keysJustPressed[k];
      for (const b of Object.keys(mouseJustPressed)) delete mouseJustPressed[b];
    },

    isKeyDown(key) {
      return !!keysDown[key];
    },

    isKeyPressed(key) {
      return !!keysJustPressed[key];
    },

    isKeyReleased(key) {
      return false;
    },

    getMousePos() {
      return { x: mouseX, y: mouseY };
    },

    getMouseWorldPos(camera) {
      return screenToWorld(mouseX, mouseY, camera);
    },

    isMouseDown(button = 0) {
      return !!mouseDown[button];
    },

    isMousePressed(button = 0) {
      return !!mouseJustPressed[button];
    },

    destroy() {
      if (!bound) return;
      bound = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
