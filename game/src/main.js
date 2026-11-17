import {BEST_KEY,LEVELS} from './config.js';
import {createWorld} from './world.js';
import {createInput} from './input.js';
import {createRenderer} from './render.js';
import {createSound} from './sound.js';
import {stageShot} from './shots.js';

const canvas=document.getElementById('game'),status=document.getElementById('status');
const world=createWorld(),input=createInput(canvas),renderer=createRenderer(canvas),sound=createSound();
let screen='title',best=0,score=0,chosen=0;
try{best=Number(localStorage.getItem(BEST_KEY))||0;}catch{}
function announce(){status.textContent=screen==='win'?`Garden awakened. Score ${score}.`: `Level ${world.state.level+1}. ${world.state.lit?'Seed grown. Relay lifted.':'Seed dark.'} ${world.state.won?'Goal lit. N or click Continue.':'Route sunlight to the goal.'}`;}
function start(){world.reset();score=0;chosen=0;screen='play';announce();sound('grow');}
function next(){score+=Math.max(100,600-world.state.moves*25);if(world.state.level===2){screen='win';best=Math.max(best,score);try{localStorage.setItem(BEST_KEY,String(best));}catch{}}else{world.reset(world.state.level+1);chosen=0;}announce();sound('win');}
function turn(index){const was=world.state.lit;world.rotate(index);announce();sound(world.state.won?'win':!was&&world.state.lit?'grow':'turn');}
function actions(){
 const {keys,clicks}=input.take();
 if(screen!=='play'){if(keys.has('Space')||keys.has('Enter')||clicks.some(p=>p.y>520&&p.y<615))start();return;}
 if(keys.has('KeyR')){world.reset(world.state.level);chosen=0;announce();}
 if(keys.has('KeyZ')||keys.has('KeyU')){world.undo();announce();sound();}
 if(keys.has('ArrowRight')||keys.has('ArrowDown'))chosen=(chosen+1)%world.state.mirrors.length;
 if(keys.has('ArrowLeft')||keys.has('ArrowUp'))chosen=(chosen+world.state.mirrors.length-1)%world.state.mirrors.length;
 if(keys.has('KeyN')&&world.state.won){next();return;}
 if(keys.has('Space')||keys.has('Enter'))turn(chosen);
 for(const p of clicks){
  if(p.y>600&&p.x<150){world.undo();announce();continue;}
  if(p.y>600&&p.x<250){world.reset(world.state.level);announce();continue;}
  if(world.state.won&&p.y>600&&p.x>900){next();return;}
  const index=world.state.mirrors.findIndex((_,i)=>{const c=world.mirrorPosition(i);return Math.hypot(p.x-(286+(c[0]+.5)*54),p.y-(136+(c[1]+.5)*54))<30;});
  if(index>=0){chosen=index;turn(index);}
 }
}
const shot=new URLSearchParams(location.search).get('shot');
if(shot){const scene=stageShot(shot,world);let frames=0;function paint(){renderer.draw(world.state,scene.screen,scene.best,scene.score,2,1);if(++frames<3)requestAnimationFrame(paint);else window.__shotReady=true;}requestAnimationFrame(paint);}
else{function frame(now){requestAnimationFrame(frame);actions();renderer.draw(world.state,screen,best,score,now/1000,chosen);window.__sunseedState={screen,...world.state,mirrors:world.state.mirrors.slice()};}requestAnimationFrame(frame);}
