import type { GameSnapshot } from '../types/game';
import { GAME_CONFIG } from '../constants/config';
import { clamp } from '../utils/math';
import { createBullets, createMinion, createDeathParticles, createTurretBullet, createRandomPickup, createPickup } from './entities';
import { playSoundEffect } from '../utils/audio';

export interface PhysicsEvents {
  onScoreChange: (score: number) => void;
  onHealthChange: (health: number) => void;
  onLivesChange: (lives: number) => void;
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
  const mw = GAME_CONFIG.mapWidth;
  const mh = GAME_CONFIG.mapHeight;

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
  state.player.x = clamp(state.player.x, state.player.radius, mw - state.player.radius);
  state.player.y = clamp(state.player.y, state.player.radius, mh - state.player.radius);

  // ── Camera (follows player, clamped to map) ──────────────────────────
  state.camera.x = clamp(state.player.x - viewportWidth / 2, 0, Math.max(0, mw - viewportWidth));
  state.camera.y = clamp(state.player.y - viewportHeight / 2, 0, Math.max(0, mh - viewportHeight));

  // ── Aiming — convert screen mouse to world coords ────────────────────
  const worldMouseX = state.mouse.x + state.camera.x;
  const worldMouseY = state.mouse.y + state.camera.y;
  state.player.angle = Math.atan2(worldMouseY - state.player.y, worldMouseX - state.player.x);

  // ── Determine fire rate based on weapon ──────────────────────────────
  let fireRate: number = GAME_CONFIG.fireRate;
  if (state.weapon === 'shotgun') fireRate = GAME_CONFIG.shotgunFireRate;
  else if (state.weapon === 'rapid') fireRate = GAME_CONFIG.rapidFireRate;

  // ── Shooting ─────────────────────────────────────────────────────────
  if (state.mouse.down && time - state.lastShot > 1000 / fireRate) {
    state.lastShot = time;
    const hasDouble = state.powerUps.some((p) => p.type === 'double_bullets');
    state.bullets.push(...createBullets(state.player, state.weapon, hasDouble));
    playSoundEffect(state.audio['shoot_sound']);
  }

  // ── Spawning minions ─────────────────────────────────────────────────
  if (
    time - state.lastSpawn > GAME_CONFIG.spawnRate * 1000 &&
    state.minions.length < GAME_CONFIG.maxMinionsOnScreen
  ) {
    state.lastSpawn = time;
    state.minions.push(createMinion(state.player.x, state.player.y));
  }

  // ── Pickup spawning ──────────────────────────────────────────────────
  if (time - state.lastPickupSpawn > GAME_CONFIG.pickupSpawnRate * 1000) {
    state.lastPickupSpawn = time;
    if (state.pickups.length < 5) {
      state.pickups.push(createRandomPickup(state.player.x, state.player.y));
    }
  }

  // ── Power-up timers ──────────────────────────────────────────────────
  for (let i = state.powerUps.length - 1; i >= 0; i--) {
    state.powerUps[i].remaining -= dt;
    if (state.powerUps[i].remaining <= 0) {
      state.powerUps.splice(i, 1);
    }
  }

  // ── Pickup despawn ───────────────────────────────────────────────────
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    state.pickups[i].life -= dt;
    if (state.pickups[i].life <= 0) {
      state.pickups.splice(i, 1);
    }
  }

  // ── Bullet movement (player + turret bullets) ────────────────────────
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    // Remove if out of map bounds (with margin)
    if (b.x < -50 || b.x > mw + 50 || b.y < -50 || b.y > mh + 50) {
      state.bullets.splice(i, 1);
    }
  }

  // ── Turret AI ────────────────────────────────────────────────────────
  for (const turret of state.turrets) {
    const distToPlayer = Math.hypot(state.player.x - turret.x, state.player.y - turret.y);
    if (distToPlayer < turret.range && time - turret.lastShot > 1000 / turret.fireRate) {
      turret.lastShot = time;
      state.bullets.push(createTurretBullet(turret, state.player.x, state.player.y));
    }
  }

  // ── Turret-bullet collision (player bullets hitting turrets) ──────────
  for (let t = state.turrets.length - 1; t >= 0; t--) {
    const turret = state.turrets[t];
    for (let j = state.bullets.length - 1; j >= 0; j--) {
      const b = state.bullets[j];
      if (b.fromTurret) continue; // turret bullets don't hit turrets
      if (Math.hypot(b.x - turret.x, b.y - turret.y) < b.radius + turret.radius) {
        turret.health -= b.damage;
        state.bullets.splice(j, 1);

        if (turret.health <= 0) {
          state.score += turret.scoreValue;
          events.onScoreChange(state.score);
          state.particles.push(...createDeathParticles(turret.x, turret.y, 12, '#ff6b35'));
          // Drop a pickup
          state.pickups.push(createPickup(turret.x, turret.y));
          state.turrets.splice(t, 1);
          playSoundEffect(state.audio['minion_hit_sound']);

          // Check win
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

  // ── Turret bullets hitting player ────────────────────────────────────
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    if (!b.fromTurret) continue;
    if (Math.hypot(b.x - state.player.x, b.y - state.player.y) < b.radius + state.player.radius) {
      state.bullets.splice(i, 1);
      if (time - state.lastDamage > 300) {
        state.health -= b.damage;
        state.lastDamage = time;
        events.onHealthChange(state.health);

        if (state.health <= 0) {
          // Lose a life
          state.lives--;
          events.onLivesChange(state.lives);
          if (state.lives <= 0) {
            state.minions.length = 0;
            state.bullets.length = 0;
            state.particles.length = 0;
            state.state = 'gameover';
            events.onGameOver();
            return;
          }
          // Revive with full health
          state.health = GAME_CONFIG.playerMaxHealth;
          events.onHealthChange(state.health);
          state.lastDamage = time;
        }
      }
    }
  }

  // ── Pickup collection ────────────────────────────────────────────────
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const p = state.pickups[i];
    if (Math.hypot(p.x - state.player.x, p.y - state.player.y) < p.radius + state.player.radius + 10) {
      state.pickups.splice(i, 1);
      state.particles.push(...createDeathParticles(p.x, p.y, 6, '#fbbf24'));

      switch (p.type) {
        case 'heart':
          state.health = Math.min(state.health + GAME_CONFIG.heartHealAmount, GAME_CONFIG.playerMaxHealth);
          events.onHealthChange(state.health);
          break;
        case 'weapon_shotgun':
          state.weapon = 'shotgun';
          // Auto-reset to default after duration (handled via timer)
          setTimeout(() => { if (state.weapon === 'shotgun') state.weapon = 'default'; }, GAME_CONFIG.weaponDuration * 1000);
          break;
        case 'weapon_rapid':
          state.weapon = 'rapid';
          setTimeout(() => { if (state.weapon === 'rapid') state.weapon = 'default'; }, GAME_CONFIG.weaponDuration * 1000);
          break;
        case 'powerup_double':
          // Stack or refresh
          const existing = state.powerUps.find((pu) => pu.type === 'double_bullets');
          if (existing) {
            existing.remaining = GAME_CONFIG.doubleBulletDuration;
          } else {
            state.powerUps.push({ type: 'double_bullets', remaining: GAME_CONFIG.doubleBulletDuration });
          }
          break;
      }
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

    // Clamp minions to map
    m.x = clamp(m.x, m.radius, mw - m.radius);
    m.y = clamp(m.y, m.radius, mh - m.radius);

    // Player–minion collision
    if (dist < state.player.radius + m.radius) {
      if (time - state.lastDamage > 500) {
        state.health -= m.damage;
        events.onHealthChange(state.health);
        state.lastDamage = time;

        if (state.health <= 0) {
          state.lives--;
          events.onLivesChange(state.lives);
          if (state.lives <= 0) {
            state.minions.length = 0;
            state.bullets.length = 0;
            state.particles.length = 0;
            state.state = 'gameover';
            events.onGameOver();
            return;
          }
          // Revive with full health
          state.health = GAME_CONFIG.playerMaxHealth;
          events.onHealthChange(state.health);
          state.lastDamage = time;
        }
      }

      // Push minion out
      const pushAngle = Math.atan2(m.y - state.player.y, m.x - state.player.x);
      m.x = state.player.x + Math.cos(pushAngle) * (state.player.radius + m.radius + 5);
      m.y = state.player.y + Math.sin(pushAngle) * (state.player.radius + m.radius + 5);
    }

    // Bullet–minion collision (only player bullets)
    for (let j = state.bullets.length - 1; j >= 0; j--) {
      const b = state.bullets[j];
      if (b.fromTurret) continue;
      if (Math.hypot(b.x - m.x, b.y - m.y) < b.radius + m.radius) {
        m.health -= b.damage;
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
