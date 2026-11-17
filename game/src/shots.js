import {LEVELS} from './config.js';
export function stageShot(name,world){
 world.reset(name==='end'?2:0);
 if(name==='start')return{screen:'title',best:1650,score:0};
 const l=LEVELS[world.state.level];
 l.solution.forEach((angle,i)=>{if(world.state.mirrors[i]!==angle)world.rotate(i);});
 return{screen:name==='end'?'win':'play',best:1650,score:name==='end'?1500:550};
}
