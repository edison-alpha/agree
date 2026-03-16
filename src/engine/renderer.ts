import type { GameSnapshot } from '../types/game';
import { GAME_CONFIG } from '../constants/config';

/** Set up the canvas for HiDPI rendering. */
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

// Pickup icons
const PICKUP_ICONS: Record<string, { emoji: string; color: string }> = {
  heart: { emoji: '❤️', color: '#ef4444' },
  weapon_shotgun: { emoji: '🔫', color: '#f97316' },
  weapon_rapid: { emoji: '⚡', color: '#3b82f6' },
  powerup_double: { emoji: '✨', color: '#a855f7' },
};

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

  const cam = state.camera;

  // ── Background (tiled dark with grid) ─────────────────────────────
  const bg = state.images.arena_background;
  if (bg?.complete) {
    // Tile background image across visible map area
    const tileW = bg.width;
    const tileH = bg.height;
    const startX = Math.floor(cam.x / tileW) * tileW;
    const startY = Math.floor(cam.y / tileH) * tileH;
    for (let tx = startX; tx < cam.x + vw; tx += tileW) {
      for (let ty = startY; ty < cam.y + vh; ty += tileH) {
        ctx.drawImage(bg, tx - cam.x, ty - cam.y, tileW, tileH);
      }
    }
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, vw, vh);
  }

  // ── Grid lines for spatial awareness ──────────────────────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 200;
  const gridStartX = Math.floor(cam.x / gridSize) * gridSize;
  const gridStartY = Math.floor(cam.y / gridSize) * gridSize;
  for (let gx = gridStartX; gx < cam.x + vw; gx += gridSize) {
    ctx.beginPath();
    ctx.moveTo(gx - cam.x, 0);
    ctx.lineTo(gx - cam.x, vh);
    ctx.stroke();
  }
  for (let gy = gridStartY; gy < cam.y + vh; gy += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, gy - cam.y);
    ctx.lineTo(vw, gy - cam.y);
    ctx.stroke();
  }

  // ── Map boundary ──────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-cam.x, -cam.y, GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight);

  // ── Turrets ───────────────────────────────────────────────────────
  state.turrets.forEach((t) => {
    const sx = t.x - cam.x;
    const sy = t.y - cam.y;
    // Skip if off screen
    if (sx < -60 || sx > vw + 60 || sy < -60 || sy > vh + 60) return;

    // Base
    ctx.save();
    ctx.translate(sx, sy);

    // Outer ring
    const gradient = ctx.createRadialGradient(0, 0, t.radius * 0.3, 0, 0, t.radius);
    gradient.addColorStop(0, '#ff6b35');
    gradient.addColorStop(1, '#8b1a1a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, 0, t.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Turret barrel pointing towards player
    const angle = Math.atan2(state.player.y - t.y, state.player.x - t.x);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * t.radius * 1.3, Math.sin(angle) * t.radius * 1.3);
    ctx.stroke();

    // Range indicator (subtle)
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, t.range, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Health bar
    const ratio = Math.max(0, t.health / t.maxHealth);
    const barW = t.radius * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx - barW / 2, sy - t.radius - 12, barW, 6);
    ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(sx - barW / 2, sy - t.radius - 12, barW * ratio, 6);
  });

  // ── Pickups ───────────────────────────────────────────────────────
  state.pickups.forEach((p) => {
    const sx = p.x - cam.x;
    const sy = p.y - cam.y;
    if (sx < -30 || sx > vw + 30 || sy < -30 || sy > vh + 30) return;

    const icon = PICKUP_ICONS[p.type] || { emoji: '?', color: '#fff' };

    // Glow
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(time / 200) * 0.2;
    ctx.fillStyle = icon.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.radius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Circle
    ctx.fillStyle = icon.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emoji
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(icon.emoji, sx, sy);
    ctx.restore();
  });

  // ── Minions ───────────────────────────────────────────────────────
  state.minions.forEach((m) => {
    const sx = m.x - cam.x;
    const sy = m.y - cam.y;
    if (sx < -60 || sx > vw + 60 || sy < -60 || sy > vh + 60) return;

    if (m.type === 'elite') {
      ctx.save();
      ctx.translate(sx, sy);
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
      ctx.fillRect(sx - 30, sy - 56, 60, 7);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(sx - 30, sy - 56, 60 * ratio, 7);
    } else if (state.images.goblin_minion) {
      drawRotatedImage(ctx, state.images.goblin_minion, sx, sy, 50, 50, m.angle);
    } else {
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(sx, sy, m.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ── Player (with damage flash) ────────────────────────────────────
  const px = state.player.x - cam.x;
  const py = state.player.y - cam.y;

  if (time - state.lastDamage < 200 && Math.floor(time / 50) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  if (state.images.trooper_character) {
    drawRotatedImage(ctx, state.images.trooper_character, px, py, 60, 60, state.player.angle);
  } else {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(px, py, state.player.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Player health bar ─────────────────────────────────────────────
  const hpPct = Math.max(0, state.health / GAME_CONFIG.playerMaxHealth);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(px - 30, py + 40, 60, 8);
  ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(px - 30, py + 40, 60 * hpPct, 8);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(px - 30, py + 40, 60, 8);

  // ── Bullets ───────────────────────────────────────────────────────
  state.bullets.forEach((b) => {
    const bx = b.x - cam.x;
    const by = b.y - cam.y;
    if (bx < -10 || bx > vw + 10 || by < -10 || by > vh + 10) return;

    ctx.fillStyle = b.fromTurret ? '#ff4444' : '#ffff00';
    ctx.beginPath();
    ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Particles ─────────────────────────────────────────────────────
  state.particles.forEach((p) => {
    const ppx = p.x - cam.x;
    const ppy = p.y - cam.y;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color || 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(ppx, ppy, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Joystick visualiser (screen space, no camera offset) ──────────
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

  // ── Minimap (bottom-right corner) ─────────────────────────────────
  const mmSize = Math.min(100, vw * 0.2);
  const mmX = vw - mmSize - 10;
  const mmY = vh - mmSize - 10;
  const scaleX = mmSize / GAME_CONFIG.mapWidth;
  const scaleY = mmSize / GAME_CONFIG.mapHeight;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(mmX, mmY, mmSize, mmSize);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX, mmY, mmSize, mmSize);

  // Viewport indicator
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.strokeRect(
    mmX + cam.x * scaleX,
    mmY + cam.y * scaleY,
    vw * scaleX,
    vh * scaleY,
  );

  // Turrets on minimap
  ctx.fillStyle = '#ff6b35';
  state.turrets.forEach((t) => {
    ctx.fillRect(mmX + t.x * scaleX - 2, mmY + t.y * scaleY - 2, 4, 4);
  });

  // Minions on minimap (dots)
  ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
  state.minions.forEach((m) => {
    ctx.fillRect(mmX + m.x * scaleX - 1, mmY + m.y * scaleY - 1, 2, 2);
  });

  // Pickups on minimap
  ctx.fillStyle = '#fbbf24';
  state.pickups.forEach((p) => {
    ctx.fillRect(mmX + p.x * scaleX - 1, mmY + p.y * scaleY - 1, 3, 3);
  });

  // Player on minimap
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(mmX + state.player.x * scaleX, mmY + state.player.y * scaleY, 3, 0, Math.PI * 2);
  ctx.fill();
}
