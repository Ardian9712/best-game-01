import { WIDTH, HEIGHT, LEVELS } from './config.js';

export function createInput(canvas) {
  const down = new Set(); const pressed = new Set(); const clicks = [];
  function keydown(e) {
    const valid = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'KeyR', 'KeyZ', 'KeyU', 'KeyN'];
    if (valid.includes(e.code)) e.preventDefault();
    if (!e.repeat) pressed.add(e.code);
    down.add(e.code);
  }
  window.addEventListener('keydown', keydown); window.addEventListener('keyup', e => down.delete(e.code));
  window.addEventListener('blur', () => down.clear());
  function point(e) {
    const r = canvas.getBoundingClientRect(); const scale = Math.min(r.width / WIDTH, r.height / HEIGHT);
    return { x: (e.clientX - r.left - (r.width - WIDTH * scale) / 2) / scale, y: (e.clientY - r.top - (r.height - HEIGHT * scale) / 2) / scale };
  }
  canvas.addEventListener('pointerdown', e => clicks.push(point(e)));
  return { take() { const keys = new Set(pressed); pressed.clear(); return { keys, clicks: clicks.splice(0) }; } };
}
