export const ZOOM = 2;

export class Camera {
  x = 0;
  y = 0;
  width: number;
  height: number;
  viewWidth: number;
  viewHeight: number;
  private smoothing = 0.15;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.viewWidth = canvasWidth / ZOOM;
    this.viewHeight = canvasHeight / ZOOM;
  }

  /** Instantly center on target with no lerp */
  snapTo(targetX: number, targetY: number) {
    this.x = targetX - this.viewWidth / 2;
    this.y = targetY - this.viewHeight / 2;
  }

  follow(targetX: number, targetY: number) {
    const desiredX = targetX - this.viewWidth / 2;
    const desiredY = targetY - this.viewHeight / 2;

    this.x += (desiredX - this.x) * this.smoothing;
    this.y += (desiredY - this.y) * this.smoothing;
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: Math.round(wx - this.x), y: Math.round(wy - this.y) };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: sx / ZOOM + this.x, y: sy / ZOOM + this.y };
  }

  isVisible(wx: number, wy: number, w: number, h: number): boolean {
    return (
      wx + w > this.x &&
      wx < this.x + this.viewWidth &&
      wy + h > this.y &&
      wy < this.y + this.viewHeight
    );
  }

  resize(canvasWidth: number, canvasHeight: number) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.viewWidth = canvasWidth / ZOOM;
    this.viewHeight = canvasHeight / ZOOM;
  }
}
