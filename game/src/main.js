import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, CATCH, HIT, BUY, FEED, OVER } from './world.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import { createRenderer, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(location.search); const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') || '', 10); const seed = Number.isInteger(seedParam) ? seedParam : 2046;
const canvas = document.getElementById('game'); const status = document.getElementById('status');
const world = createWorld(createRandom(seed)); const renderer = createRenderer(canvas); const sound = createSound();
function bestScore() { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } }
function saveScore(score) { try { if (score > bestScore()) localStorage.setItem(BEST_KEY, String(score)); } catch {} }
function runShot(name) { const staged = stageShot(name, world); let frames = 0; function paint() { renderer.draw(world.state, staged.screen, staged.best, performance.now() / 1000); if (++frames < 3) requestAnimationFrame(paint); else window.__shotReady = true; } requestAnimationFrame(paint); }
function run() {
  const input = createInput(canvas); let screen = SCREEN_TITLE; let best = bestScore(); let last = performance.now(); let accumulator = 0; let time = 0;
  function start() { world.reset(); screen = SCREEN_PLAY; status.textContent = 'Playing. Catch embers and protect the sacred flame.'; sound.feed(); }
  function end() { screen = SCREEN_OVER; best = Math.max(best, world.state.score); saveScore(world.state.score); status.textContent = `Flame lost. Score ${world.state.score}.`; sound.end(); }
  function handle(action) { let clickBuy = false; let clickFeed = false; for (const click of action.clicks) { if (screen !== SCREEN_PLAY) { if (click.y > 545 && click.y < 660) start(); } else if (click.y > 610) { if (click.x > 358 && click.x < 658) { if (world.state.selected === 1) clickBuy = true; else { world.state.selected = 1; sound.upgrade(); } } else if (click.x > 42 && click.x < 342) { if (world.state.selected === 0) clickBuy = true; else { world.state.selected = 0; sound.upgrade(); } } else if (click.x > 680 && click.x < 980) clickFeed = true; } }
    if (action.start && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) start();
    if (screen === SCREEN_PLAY) { if (action.select !== null) world.state.selected = action.select; if (action.feed || clickFeed) sound.feed(); if (action.buy || clickBuy) sound.upgrade(); if (action.storm) sound.upgrade(); action.clickBuy = clickBuy; action.clickFeed = clickFeed; }
  }
  function frame(now) { requestAnimationFrame(frame); const dt = Math.min(0.1, (now - last) / 1000); last = now; accumulator += dt; time += dt; const action = input.take(); handle(action); let pending = { feed: Boolean(action.feed || action.clickFeed), buy: Boolean(action.buy || action.clickBuy), storm: Boolean(action.storm) }; while (accumulator >= STEP && screen === SCREEN_PLAY) { const events = world.step(STEP, input.direction(), pending); pending = { feed: false, buy: false, storm: false }; if (events & CATCH) sound.catch(); if (events & HIT) sound.rain(); if (events & BUY) sound.upgrade(); if (events & FEED) sound.feed(); if (events & OVER) end(); accumulator -= STEP; } if (screen !== SCREEN_PLAY) accumulator = 0; renderer.draw(world.state, screen, best, time); }
  status.textContent = 'Emberkeeper. Press Space or click Start.'; requestAnimationFrame(frame);
}
if (shot) runShot(shot); else run();
