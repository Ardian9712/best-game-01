import { FIELD, WEATHER } from './config.js';

export const EMBER = 1;
export const DROP = 2;
export const OVER = 1;
export const CATCH = 2;
export const HIT = 4;
export const BUY = 8;
export const FEED = 16;
export const STORM = 32;

export function createWorld(random) {
  const state = {
    x: FIELD.width / 2, flame: 62, embers: 0, score: 0, wave: 1, elapsed: 0,
    items: [], particles: [], selected: 0, radius: 68, shield: 0, shake: 0,
    flare: 0, hitFlash: 0, feedFlash: 0, spawn: 0, rainSpawn: 0, storm: 0, dead: false,
  };
  function reset() {
    Object.assign(state, { x: FIELD.width / 2, flame: 62, embers: 0, score: 0, wave: 1, elapsed: 0,
      items: [], particles: [], selected: 0, radius: 68, shield: 0, shake: 0, flare: 0, hitFlash: 0,
      feedFlash: 0, spawn: 0, rainSpawn: 1.6, storm: 0, dead: false });
  }
  function burst(x, y, color, amount = 12) {
    for (let i = 0; i < amount; i += 1) {
      const a = random() * Math.PI * 2;
      const speed = 35 + random() * 150;
      state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 35,
        life: 0.35 + random() * 0.55, max: 0.9, color, size: 2 + random() * 4 });
    }
  }
  function spawn(kind) {
    const weather = WEATHER[(state.wave - 1) % WEATHER.length];
    const x = 110 + random() * 1060;
    const waveFactor = 1 + (state.wave - 1) * 0.14;
    const gust = weather.wind * 105;
    state.items.push({ kind, x, y: -20, vx: gust + (random() - 0.5) * 55,
      vy: (kind === EMBER ? 150 : 240) * waveFactor + random() * 70, r: kind === EMBER ? 13 : 10,
      spin: random() * 6, phase: random() * 8 });
  }
  function buy() {
    if (state.embers < 3) return false;
    state.embers -= 3;
    if (state.selected === 0) {
      state.radius = Math.min(126, state.radius + 22);
      state.score += 5;
    } else {
      state.shield = Math.min(3, state.shield + 1);
    }
    state.flare = 0.8;
    burst(state.x, 552, '#8de6db', 20);
    return true;
  }
  function feed() {
    if (!state.embers) return false;
    state.embers -= 1;
    state.flame = Math.min(100, state.flame + 22);
    state.score += 12;
    state.flare = 1;
    state.feedFlash = 0.55;
    burst(state.x, 546, '#ffb347', 18);
    return true;
  }
  function spendStorm() {
    if (state.score < 35 || state.storm <= 0) return false;
    state.score -= 35;
    state.storm = 0;
    state.shield = Math.max(state.shield, 1);
    state.flare = 0.65;
    burst(state.x, 520, '#b6f4e8', 24);
    return true;
  }
  function step(dt, direction, actions = {}) {
    let events = 0;
    if (state.dead) return events;
    const weather = WEATHER[(state.wave - 1) % WEATHER.length];
    state.elapsed += dt;
    state.wave = 1 + Math.floor(state.elapsed / 18);
    const wind = weather.wind * (state.flame > 70 ? 1.6 : 1) * (0.7 + 0.3 * Math.sin(state.elapsed * 1.7));
    state.x = Math.max(110, Math.min(1170, state.x + direction * 530 * dt));
    state.flame = Math.max(0, state.flame - dt * (1.05 + weather.rain * 1.1));
    state.flare = Math.max(0, state.flare - dt);
    state.feedFlash = Math.max(0, state.feedFlash - dt);
    state.hitFlash = Math.max(0, state.hitFlash - dt);
    state.shake = Math.max(0, state.shake - dt * 25);
    state.storm = Math.max(0, state.storm - dt);
    if (state.wave >= 4 && state.storm <= 0 && Math.sin(state.elapsed * 0.19) > 0.91) state.storm = 3.2;
    if (actions.feed && feed()) events |= FEED;
    if (actions.buy && buy()) events |= BUY;
    if (actions.storm && spendStorm()) events |= STORM;
    state.spawn -= dt;
    if (state.spawn <= 0) {
      spawn(EMBER);
      state.spawn += Math.max(0.34, 1.08 - (state.wave - 1) * 0.075) * (0.8 + random() * 0.35);
    }
    state.rainSpawn -= dt;
    if (state.rainSpawn <= 0) {
      if (random() < weather.rain) spawn(DROP);
      state.rainSpawn += Math.max(0.18, 0.82 - (state.wave - 1) * 0.055) * (0.6 + random() * 0.5);
    }
    for (let i = state.items.length - 1; i >= 0; i -= 1) {
      const item = state.items[i];
      item.phase += dt * 4;
      item.x += (item.vx + wind * 72 + Math.sin(item.phase) * 16) * dt;
      item.y += item.vy * dt;
      if (item.x < 36 || item.x > FIELD.width - 36) item.vx *= -0.75;
      const nearFlame = Math.abs(item.x - state.x) < state.radius + item.r && item.y > 475 && item.y < 582;
      if (nearFlame && item.kind === EMBER) {
        state.items.splice(i, 1);
        state.embers += 1;
        state.score += Math.round(8 * (state.flame > 70 ? 2 : 1));
        state.flare = 0.8;
        burst(item.x, 550, '#ffd36e', 15);
        events |= CATCH;
      } else if (nearFlame && item.kind === DROP) {
        state.items.splice(i, 1);
        if (state.shield) state.shield -= 1;
        else state.flame = Math.max(0, state.flame - (state.flame > 70 ? 20 : 14));
        state.shake = 10;
        state.hitFlash = 0.32;
        burst(state.x, 545, '#83c6ee', 15);
        events |= HIT;
      } else if (item.y > 745) state.items.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    if (state.flame <= 0) { state.dead = true; events |= OVER; }
    return events;
  }
  reset();
  return { state, reset, step };
}
