import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

export function stageShot(name, world) {
  world.reset();
  if (name === 'start') return { screen: SCREEN_TITLE, best: 1840 };
  if (name === 'end') { for (let i = 0; i < 1300; i += 1) world.step(STEP, Math.sin(i * 0.17), { feed: i % 83 === 0, buy: i === 95 }); world.state.dead = true; world.state.flame = 0; world.state.score = 1840; world.state.wave = 4; return { screen: SCREEN_OVER, best: 2190 }; }
  for (let i = 0; i < 2500; i += 1) world.step(STEP, Math.sin(i * 0.035), { feed: i % 150 === 40, buy: i === 130 });
  world.state.flame = 78; world.state.embers = 4; world.state.score = 1260; world.state.storm = 2.8; world.state.selected = 1; return { screen: SCREEN_PLAY, best: 2190 };
}
