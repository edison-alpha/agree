import type { GameSnapshot } from '../types/game';
import { GAME_CONFIG } from '../constants/config';
import { clamp } from '../utils/math';
import { createBullets, createMinion, createDeathParticles } from './entities';
import { playSoundEffect } from '../utils/audio';

export interface PhysicsEvents {
  onScoreChange: (score: number) => void;
  onHealthChange: (health: number) => void;
  onGameOver: () => void;
  onMilestone: (milestone: number) => void;
  onBirthday: () => void;
}

/**
 * Advance one physics frame.
 * All mutations happen in-place on `state`; React state is synced
 * through the event callbacks.
 */
export function updatePhysics(
  state: GameSnapshot,
  time: number,
  dt: number,
  viewportWidth: number,
  viewportHeight: number,
  events: PhysicsEvents,
): void {
  // ── Player movement ──────────────────────────────────────────────────
  let dx = 0;
  let dy = 0;

  if (state.joysticks.left.active) {
    dx = state.joysticks.left.dx;
    dy = state.joysticks.left.dy;
  } else {
    if (state.keys['w'] || state.keys['arrowup']) dy -= 1;
    if (state.keys['s'] || state.keys['arrowdown']) dy += 1;
    if (state.keys['a'] || state.keys['arrowleft']) dx -= 1;
    if (state.keys['d'] || state.keys['arrowright']) dx += 1;
  }

  const len = Math.hypot(dx, dy);
  if (len > 0) { dx /= len; dy /= len; }

  state.player.x += dx * GAME_CONFIG.trooperSpeed * dt;
  state.player.y += dy * GAME_CONFIG.trooperSpeed * dt;
  state.player.x = clamp(state.player.x, state.player.radius, viewportWidth - state.player.radius);
  state.player.y = clamp(state.player.y, state.player.radius, viewportHeight - state.player.radius);
  state.player.angle = Math.atan2(state.mouse.y - state.player.y, state.mouse.x - state.player.x);

  // ── Shooting ─────────────────────────────────────────────────────────
  if (state.mouse.down && time - state.lastShot > 1000 / GAME_CONFIG.fireRate) {
    state.lastShot = time;
    state.bullets.push(...createBullets(state.player));
    playSoundEffect(state.audio['shoot_sound']);
  }

  // ── Spawning ─────────────────────────────────────────────────────────
  if (
    time - state.lastSpawn > GAME_CONFIG.spawnRate * 1000 &&
    state.minions.length < GAME_CONFIG.maxMinionsOnScreen
  ) {
    state.lastSpawn = time;
    state.minions.push(createMinion(viewportWidth, viewportHeight));
  }

  // ── Bullet movement ──────────────────────────────────────────────────
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < -50 || b.x > viewportWidth + 50 || b.y < -50 || b.y > viewportHeight + 50) {
      state.bullets.splice(i, 1);
    }
  }

  // ── Minion movement + collision ──────────────────────────────────────
  for (let i = state.minions.length - 1; i >= 0; i--) {
    const m = state.minions[i];
    const mdx = state.player.x - m.x;
    const mdy = state.player.y - m.y;
    const dist = Math.hypot(mdx, mdy);

    if (dist > 0) {
      m.x += (mdx / dist) * m.speed * dt;
      m.y += (mdy / dist) * m.speed * dt;
      m.angle = Math.atan2(mdy, mdx);
    }

    // Player–minion collision
    if (dist < state.player.radius + m.radius) {
      if (time - state.lastDamage > 500) {
        state.health -= m.damage;
        events.onHealthChange(state.health);
        state.lastDamage = time;

        if (state.health <= 0) {
          state.minions.length = 0;
          state.bullets.length = 0;
          state.particles.length = 0;
          state.state = 'gameover';
          events.onGameOver();
          return; // stop processing
        }
      }

      // Push minion out
      const pushAngle = Math.atan2(m.y - state.player.y, m.x - state.player.x);
      m.x = state.player.x + Math.cos(pushAngle) * (state.player.radius + m.radius + 5);
      m.y = state.player.y + Math.sin(pushAngle) * (state.player.radius + m.radius + 5);
    }

    // Bullet–minion collision
    for (let j = state.bullets.length - 1; j >= 0; j--) {
      const b = state.bullets[j];
      if (Math.hypot(b.x - m.x, b.y - m.y) < b.radius + m.radius) {
        m.health--;
        state.bullets.splice(j, 1);

        if (m.health <= 0) {
          state.score += m.scoreValue;
          events.onScoreChange(state.score);
          state.minions.splice(i, 1);
          playSoundEffect(state.audio['minion_hit_sound']);
          state.particles.push(...createDeathParticles(m.x, m.y));

          // Win condition
          if (state.score >= GAME_CONFIG.finalGoal) {
            state.minions.length = 0;
            state.bullets.length = 0;
            state.particles.length = 0;
            state.state = 'birthday';
            events.onBirthday();
            return;
          }

          // Milestone check
          if (
            state.milestoneIndex < GAME_CONFIG.wishMilestones.length &&
            state.score >= GAME_CONFIG.wishMilestones[state.milestoneIndex]
          ) {
            const reached = GAME_CONFIG.wishMilestones[state.milestoneIndex];
            state.milestoneIndex++;
            state.state = 'milestoneDialogue';
            playSoundEffect(state.audio['milestone_sound']);
            events.onMilestone(reached);
            return;
          }
        }
        break;
      }
    }
  }

  // ── Particle decay ───────────────────────────────────────────────────
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt * 2;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}
