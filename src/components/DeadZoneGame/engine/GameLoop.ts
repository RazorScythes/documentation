type UpdateFn = (dt: number) => void;
type RenderFn = (ctx: CanvasRenderingContext2D, dt: number) => void;

export class GameLoop {
  private lastTime = 0;
  private animFrameId = 0;
  private running = false;
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private ctx: CanvasRenderingContext2D;
  private maxDt = 1 / 30;

  constructor(ctx: CanvasRenderingContext2D, updateFn: UpdateFn, renderFn: RenderFn) {
    this.ctx = ctx;
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const rawDt = (now - this.lastTime) / 1000;
    const dt = Math.min(rawDt, this.maxDt);
    this.lastTime = now;

    this.updateFn(dt);
    this.renderFn(this.ctx, dt);

    this.animFrameId = requestAnimationFrame(this.tick);
  };
}
