import { LEVELS } from './config.js';

// Rays travel cell by cell. Every bend is an actual / or \ reflection.
export function createWorld() {
  const state = { level: 0, mirrors: [], moves: 0, lit: false, lifted: false, won: false, beams: [], selected: 0 };
  const history = [];
  const same = (a,b) => a[0] === b[0] && a[1] === b[1];
  function mirrorPosition(index) {
    const p = LEVELS[state.level].mirrors[index];
    return index === 1 && !state.lifted ? [p[0] + 1, p[1] + 2] : p;
  }
  function trace() {
    const l = LEVELS[state.level]; state.beams = []; state.won = false;
    let p = l.source.slice(), origin = p.slice(), dx = 1, dy = 0;
    const seen = new Set(); let grew = false;
    for (let steps = 0; steps < 240; steps++) {
      const next = [p[0]+dx,p[1]+dy];
      const key = `${next}:${dx}:${dy}`;
      if (seen.has(key) || next[0]<0 || next[0]>11 || next[1]<0 || next[1]>7) {
        state.beams.push({from:origin,to:p.slice(),active:true,color:'#ffd76a'}); break;
      }
      seen.add(key); p = next;
      if (same(p,l.seed) && !state.lit) { state.lit = true; state.lifted = true; grew = true; break; }
      if (same(p,l.goal)) { state.won = true; state.beams.push({from:origin,to:p.slice(),active:true,color:'#fff0a3'}); break; }
      if (l.blocked.some((b,i)=>same(b,p) && !(i===0 && state.lifted))) {
        state.beams.push({from:origin,to:p.slice(),active:true,color:'#ffd76a'}); break;
      }
      const index = state.mirrors.findIndex((_,i)=>same(mirrorPosition(i),p));
      if (index !== -1) {
        state.beams.push({from:origin,to:p.slice(),active:true,color:'#ffd76a'}); origin = p.slice();
        [dx,dy] = state.mirrors[index] === 0 ? [-dy,-dx] : [dy,dx];
      }
    }
    if (grew) trace();
  }
  function reset(level=0) {
    state.level=level; state.mirrors=LEVELS[level].initial.slice(); state.moves=0;
    state.lit=false; state.lifted=false; state.selected=0; history.length=0; trace();
  }
  function rotate(index) {
    if (!Number.isInteger(index)||index<0||index>=state.mirrors.length) return;
    history.push({mirrors:state.mirrors.slice(),lit:state.lit,moves:state.moves});
    state.mirrors[index]^=1; state.moves++; trace();
  }
  function undo() {
    const prev=history.pop(); if(!prev)return;
    state.mirrors=prev.mirrors;state.lit=prev.lit;state.lifted=prev.lit;state.moves=prev.moves;trace();
  }
  reset(); return {state,reset,rotate,undo,mirrorPosition};
}
