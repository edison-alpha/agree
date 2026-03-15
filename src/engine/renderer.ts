import type { GameSnapshot } from '../types/game';
import { GAME_CONFIG } from '../constants/config';

/** Set up the canvas for HiDPI rendering. Returns true if the canvas was resized. */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nextW = Math.floor(vw * dpr);
  const nextH = Math.floor(vh * dpr);

  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
}

/** Draw a rotated image centred on (x, y). */
function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Render one complete frame of the game world. */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameSnapshot,
  time: number,
  vw: number,
  vh: number,
): void {
  ctx.clearRect(0, 0, vw, vh);

  if (state.state !== 'playing') return;

  // ── Background ─────────────────────────────────────────────────────
  const bg = state.images.arena_background;
  if (bg?.complete) {
    const scale = Math.max(vw / bg.width, vh / bg.height);
    const dw = bg.width * scale;
    const dh = bg.height * scale;
    ctx.drawImage(bg, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, vw, vh);
  }

  // ── Minions ────────────────────────────────────────────────────────
  state.minions.forEach((m) => {
    if (m.type === 'elite') {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);
      const eliteImg = state.images['goblin_bay_local'];
      if (eliteImg?.complete) {
        ctx.drawImage(eliteImg, -45, -45, 90, 90);
      } else {
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Health bar
      const ratio = Math.max(0, m.health / m.maxHealth);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(m.x - 30, m.y - 56, 60, 7);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(m.x - 30, m.y - 56, 60 * ratio, 7);
    } else if (state.images.goblin_minion) {
      drawRotatedImage(ctx, state.images.goblin_minion, m.x, m.y, 50, 50, m.angle);
    } else {
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ── Player (with damage flash) ─────────────────────────────────────
  if (time - state.lastDamage < 200 && Math.floor(time / 50) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  if (state.images.trooper_character) {
    drawRotatedImage(ctx, state.images.trooper_character, state.player.x, state.player.y, 60, 60, state.player.angle);
  } else {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Player health bar ──────────────────────────────────────────────
  const hpPct = Math.max(0, state.health / GAME_CONFIG.playerMaxHealth);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(state.player.x - 30, state.player.y + 40, 60, 8);
  ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(state.player.x - 30, state.player.y + 40, 60 * hpPct, 8);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(state.player.x - 30, state.player.y + 40, 60, 8);

  // ── Bullets ────────────────────────────────────────────────────────
  ctx.fillStyle = 'yellow';
  state.bullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Particles ──────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
  state.particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Left joystick visualiser ───────────────────────────────────────
  if (state.joysticks.left.active) {
    const jl = state.joysticks.left;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(jl.baseX, jl.baseY, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(jl.baseX + jl.dx * 50, jl.baseY + jl.dy * 50, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}
