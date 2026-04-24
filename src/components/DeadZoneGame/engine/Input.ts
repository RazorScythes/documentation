export class Input {
  private keys = new Set<string>();
  private mouseX = 0;
  private mouseY = 0;
  private mouseDown = false;
  private mouseClicked = false;
  private rightMouseDown = false;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouseDown = true;
        this.mouseClicked = true;
      }
      if (e.button === 2) this.rightMouseDown = true;
    });
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
      if (e.button === 2) this.rightMouseDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  getMousePos(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }

  isMouseDown(): boolean {
    return this.mouseDown;
  }

  isRightMouseDown(): boolean {
    return this.rightMouseDown;
  }

  consumeClick(): boolean {
    if (this.mouseClicked) {
      this.mouseClicked = false;
      return true;
    }
    return false;
  }

  private pressedKeys = new Set<string>();

  consumeKey(code: string): boolean {
    if (this.keys.has(code) && !this.pressedKeys.has(code)) {
      this.pressedKeys.add(code);
      return true;
    }
    if (!this.keys.has(code)) {
      this.pressedKeys.delete(code);
    }
    return false;
  }

  endFrame() {
    this.mouseClicked = false;
  }
}
