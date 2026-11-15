import { FIELD } from './config.js';

export function createInput(canvas) {
  const keys = new Set();
  const presses = new Set();
  const actions = [];
  function keydown(e) {
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'Enter', 'KeyF', 'KeyE', 'Digit1', 'Digit2', 'KeyS'].includes(e.code)) e.preventDefault();
    if (!e.repeat) {
      keys.add(e.code);
      presses.add(e.code);
    }
  }
  function keyup(e) { keys.delete(e.code); }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('blur', () => keys.clear());
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(bounds.width / FIELD.width, bounds.height / FIELD.height);
    return { x: (event.clientX - bounds.left - (bounds.width - FIELD.width * scale) / 2) / scale,
      y: (event.clientY - bounds.top - (bounds.height - FIELD.height * scale) / 2) / scale };
  }
  canvas.addEventListener('pointerdown', (event) => { actions.push({ type: 'click', ...point(event) }); });
  return {
    direction: () => (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0),
    take: () => { const out = actions.splice(0); const pressed = (key) => { const wasPressed = presses.has(key); presses.delete(key); return wasPressed; };
      return { clicks: out, start: pressed('Space') || pressed('Enter'), feed: pressed('KeyF'), buy: pressed('KeyE'),
        select: pressed('Digit1') ? 0 : pressed('Digit2') ? 1 : null, storm: pressed('KeyS') }; },
  };
}
