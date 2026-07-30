import { CONFIG } from '../config.js';
import { on, createDisposer } from '../core/dom.js';

// ============================================================================
// BACKGROUND ANIMATION
// ============================================================================

/**
 * The animated gradient wallpaper.
 *
 * Rewritten in Phase 7 to fix four defects in the original:
 *   - getContext() was called on every frame;
 *   - resizeCanvas() applied ctx.scale(dpr, dpr) cumulatively, so each resize
 *     compounded the previous scale and the gradient drifted out of alignment;
 *   - the rAF loop had no stored handle, so it could never be stopped — it kept
 *     repainting the full canvas at 60fps behind opaque windows and in
 *     background tabs;
 *   - the resize listener ran the full reflow synchronously on every event.
 */
export class BackgroundAnimation {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    // Cached once. `alpha: false` lets the compositor skip blending.
    this.ctx = this.canvas?.getContext('2d', { alpha: false }) ?? null;
    this.gradientOffset = 0;
    this.frame = 0;
    this.resizeFrame = 0;
    this.lastPaint = 0;
    this.width = 0;
    this.height = 0;
    this.disposer = createDisposer();

    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  }

  get prefersReducedMotion() {
    return Boolean(this.reducedMotion?.matches);
  }

  resizeCanvas() {
    if (!this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    // setTransform (not scale) so repeated resizes replace the transform
    // instead of multiplying it.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.paint();
  }

  paint() {
    if (!this.ctx || !this.width || !this.height) return;

    const { colors } = CONFIG.background;
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      this.width * Math.cos(this.gradientOffset),
      this.height * Math.sin(this.gradientOffset)
    );

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Throttled to ~20fps. At 0.002 rad/frame the gradient moves imperceptibly
   * slowly, so painting every frame spent battery for nothing.
   */
  tick = (timestamp = 0) => {
    this.frame = requestAnimationFrame(this.tick);

    const MIN_INTERVAL = 1000 / 20;
    if (timestamp - this.lastPaint < MIN_INTERVAL) return;
    this.lastPaint = timestamp;

    this.gradientOffset += CONFIG.background.animationSpeed;
    this.paint();
  };

  start() {
    if (this.frame || !this.ctx) return;
    if (this.prefersReducedMotion) {
      // Honour the OS preference: render one static frame and stop.
      this.paint();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.frame) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  init() {
    if (!this.ctx) return;
    this.resizeCanvas();

    // Coalesce resize bursts into one reflow per frame.
    this.disposer.add(on(window, 'resize', () => {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        this.resizeCanvas();
      });
    }, { passive: true }));

    // Nothing is visible in a hidden tab, so stop burning frames.
    this.disposer.add(on(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.stop();
      else this.start();
    }));

    // React to the OS motion preference changing mid-session.
    if (this.reducedMotion?.addEventListener) {
      this.disposer.add(on(this.reducedMotion, 'change', () => {
        this.stop();
        this.start();
      }));
    }

    this.start();
  }

  destroy() {
    this.stop();
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    this.disposer.dispose();
  }
}
