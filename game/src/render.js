import { FIELD, FONT, WEATHER } from './config.js';
import { EMBER, DROP } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio); canvas.height = Math.round(window.innerHeight * ratio);
    view.scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    view.x = (canvas.width - FIELD.width * view.scale) / 2; view.y = (canvas.height - FIELD.height * view.scale) / 2;
  }
  function text(value, x, y, size, color, align = 'left', weight = 600) {
    ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y);
  }
  function rounded(x, y, w, h, r, fill, stroke = null) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function flame(state, time) {
    const intensity = state.flame / 100; const scale = 0.78 + intensity * 0.38 + Math.sin(time * 10) * 0.035 + state.flare * 0.22;
    ctx.save(); ctx.translate(state.x, 545); ctx.scale(scale, scale);
    ctx.shadowBlur = 32; ctx.shadowColor = '#ff731f'; ctx.fillStyle = '#ff731f';
    ctx.beginPath(); ctx.moveTo(0, -112); ctx.bezierCurveTo(-40, -76, -28, -48, -62, -22); ctx.bezierCurveTo(-80, 12, -48, 54, 0, 64); ctx.bezierCurveTo(48, 54, 80, 12, 62, -22); ctx.bezierCurveTo(28, -48, 40, -76, 0, -112); ctx.fill();
    ctx.shadowBlur = 18; ctx.shadowColor = '#ffd85a'; ctx.fillStyle = '#ffd85a';
    ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(-25, -38, -17, -14, -35, 4); ctx.bezierCurveTo(-38, 32, -18, 45, 0, 48); ctx.bezierCurveTo(22, 40, 37, 17, 27, -3); ctx.bezierCurveTo(12, -18, 16, -38, 0, -70); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff1ad'; ctx.beginPath(); ctx.ellipse(0, 23, 14, 27, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (state.shield) { ctx.strokeStyle = '#9af4e0'; ctx.lineWidth = 4; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(state.x, 528, state.radius + 22, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  function drawBackdrop(state, time) {
    const weather = WEATHER[(state.wave - 1) % WEATHER.length];
    ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#101a27'; ctx.fillRect(0, 102, FIELD.width, 550);
    ctx.strokeStyle = '#1a2b3a'; ctx.lineWidth = 2;
    for (let x = 0; x < FIELD.width; x += 64) { ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x - 120, 652); ctx.stroke(); }
    ctx.fillStyle = '#131b22'; ctx.fillRect(0, 652, FIELD.width, 68);
    ctx.fillStyle = '#30404a'; ctx.fillRect(0, 650, FIELD.width, 4);
    ctx.fillStyle = weather.color; ctx.globalAlpha = 0.1; ctx.fillRect(0, 102, FIELD.width, 4); ctx.globalAlpha = 1;
    text('THE HOLLOW OF CINDERS', 44, 84, 17, '#718394', 'left', 800);
    text(`WEATHER  ${weather.name}`, 1236, 84, 17, weather.color, 'right', 800);
    if (state.wave >= 2) {
      ctx.strokeStyle = weather.color; ctx.globalAlpha = 0.25; ctx.lineWidth = 1;
      for (let x = 40; x < FIELD.width; x += 92) { const y = 155 + ((time * 45 + x) % 450); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + weather.wind * 30, y + 32); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }
  function hud(state) {
    rounded(32, 22, 1216, 78, 10, '#0c131d', '#243746');
    text('EMBERKEEPER', 56, 53, 22, '#ffbd55', 'left', 900); text('FLAME', 246, 49, 12, '#8093a3', 'left', 800);
    rounded(246, 59, 245, 16, 7, '#17232c'); rounded(246, 59, 245 * state.flame / 100, 16, 7, state.flame > 68 ? '#ff952f' : state.flame > 32 ? '#e75d34' : '#d93b45');
    text(`${Math.ceil(state.flame)}%`, 501, 73, 16, '#f9e2bd', 'right', 800);
    text('EMBER RESERVE', 560, 49, 12, '#8093a3', 'left', 800); text(`${state.embers}`, 560, 77, 27, '#ffd36e', 'left', 900);
    text('WAVE', 676, 49, 12, '#8093a3', 'left', 800); text(`${state.wave}`, 676, 77, 27, '#e8f3f0', 'left', 900);
    text('SCORE', 770, 49, 12, '#8093a3', 'left', 800); text(`${state.score}`, 770, 77, 27, '#e8f3f0', 'left', 900);
    const multiplier = state.flame > 70 ? 'x2.0' : state.flame > 35 ? 'x1.2' : 'x0.7';
    text('MULTIPLIER', 885, 49, 12, '#8093a3', 'left', 800); text(multiplier, 885, 77, 27, state.flame > 70 ? '#ffbd55' : '#e8f3f0', 'left', 900);
    text('SHIELD', 1030, 49, 12, '#8093a3', 'left', 800); text(state.shield ? `READY x${state.shield}` : 'EMPTY', 1030, 77, 19, state.shield ? '#8de6db' : '#6c7984', 'left', 800);
  }
  function upgrades(state) {
    const y = 610; text('EMBER DECISION', 42, y - 18, 13, '#9cabb5', 'left', 900);
    const first = state.selected === 0 ? '#ffb347' : '#30424c'; const second = state.selected === 1 ? '#ffb347' : '#30424c';
    rounded(42, y, 300, 84, 8, '#111d27', first); rounded(358, y, 300, 84, 8, '#111d27', second);
    text('1  WIDE CATCH', 62, y + 30, 17, '#ffe2ab', 'left', 900); text('3 embers  |  +22 radius', 62, y + 56, 14, '#a5b4bc');
    text('2  TEMPER / SHIELD', 378, y + 30, 17, '#b6f4e8', 'left', 900); text('3 embers  |  block one rain', 378, y + 56, 14, '#a5b4bc');
    text('F / click to feed', 690, y + 28, 17, '#ffcf70', 'left', 800); text('+22 life · +12 score', 690, y + 54, 14, '#8296a4', 'left', 600);
    text('E buys selected  ·  x2 score above 70% life', 690, y + 76, 12, '#8296a4', 'left', 600);
    if (state.storm > 0) { rounded(990, y + 6, 254, 64, 8, '#263045', '#b6f4e8'); text('STORM BREAK', 1117, y + 29, 17, '#b6f4e8', 'center', 900); text(`S to spend 35 score  ${Math.ceil(state.storm)}s`, 1117, y + 52, 13, '#d4e8e7', 'center', 700); }
  }
  function world(state, time) {
    drawBackdrop(state, time);
    for (const item of state.items) {
      if (item.kind === EMBER) { ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = '#ff9b38'; ctx.fillStyle = '#ffb347'; ctx.translate(item.x, item.y); ctx.rotate(item.phase); ctx.beginPath(); ctx.moveTo(0, -item.r); ctx.lineTo(item.r * 0.74, 0); ctx.lineTo(0, item.r); ctx.lineTo(-item.r * 0.74, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff0a6'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      else { ctx.strokeStyle = '#8ec8f0'; ctx.lineWidth = 4; ctx.globalAlpha = 0.82; ctx.beginPath(); ctx.moveTo(item.x, item.y - 16); ctx.lineTo(item.x + item.vx * 0.035, item.y + 12); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    flame(state, time);
    for (const p of state.particles) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
  }
  function panel(state, screen, best) {
    ctx.fillStyle = 'rgba(5, 9, 15, 0.76)'; ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    if (screen === 'title') {
      text('EMBERKEEPER', 640, 190, 78, '#ffbd55', 'center', 950); text('GUARD THE LAST SACRED FLAME', 640, 227, 20, '#b9c9cd', 'center', 800);
      ctx.shadowBlur = 34; ctx.shadowColor = '#ff7b24'; ctx.fillStyle = '#ff9b38'; ctx.beginPath(); ctx.arc(640, 329, 76, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      text('CATCH EMBERS. DODGE RAIN. DECIDE WHAT SURVIVES.', 640, 447, 21, '#eff7ee', 'center', 800);
      text('← → / A D   MOVE', 640, 486, 17, '#8fa5ad', 'center', 700); text('F / click flame   FEED', 640, 514, 17, '#ffcf70', 'center', 700); text('1 / 2   CHOOSE   •   E / click card   BUY', 640, 542, 17, '#8de6db', 'center', 700);
      rounded(488, 579, 304, 62, 10, '#ff9b38'); text('START  [SPACE]', 640, 619, 23, '#161b20', 'center', 900);
      text(`BEST SCORE  ${best}`, 640, 678, 16, '#7d919b', 'center', 700);
    } else {
      text('THE FLAME HAS GONE QUIET', 640, 230, 52, '#ff9d48', 'center', 950); text('The hollow remembers every ember you kept.', 640, 272, 20, '#bdcbd0', 'center', 700);
      text(`${state.score}`, 640, 390, 86, '#f5f7dc', 'center', 950); text('FINAL SCORE', 640, 421, 15, '#8599a3', 'center', 900);
      text(`BEST  ${best}`, 540, 475, 22, '#ffca69', 'center', 800); text(`WAVE  ${state.wave}`, 740, 475, 22, '#8de6db', 'center', 800);
      rounded(488, 544, 304, 62, 10, '#ff9b38'); text('RESTART  [SPACE]', 640, 584, 23, '#161b20', 'center', 900);
    }
  }
  function draw(state, screen, best, time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x + (state.shake ? Math.sin(time * 80) * state.shake : 0), view.y + (state.shake ? Math.cos(time * 91) * state.shake * 0.5 : 0));
    world(state, time); if (screen === SCREEN_PLAY) { hud(state); upgrades(state); } else panel(state, screen, best);
    if (state.hitFlash) { ctx.fillStyle = `rgba(130, 190, 235, ${state.hitFlash * 0.28})`; ctx.fillRect(0, 0, FIELD.width, FIELD.height); }
  }
  resize(); window.addEventListener('resize', resize); return { draw };
}
