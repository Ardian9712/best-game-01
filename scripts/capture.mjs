import { createRequire } from 'node:module';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
const require=createRequire(import.meta.url); const {chromium}=require('/home/hatch/workspace/makefun/threejs-fps-02-ops/playwright/node_modules/playwright');
function chrome(){for(const d of readdirSync(path.join(homedir(),'.cache','ms-playwright')).sort().reverse())if(d.startsWith('chromium-'))for(const s of ['chrome-linux64','chrome-linux']){const p=path.join(homedir(),'.cache','ms-playwright',d,s,'chrome');if(existsSync(p))return p}throw Error('chromium not found')}
const out=path.resolve('shots');mkdirSync(out,{recursive:true});const b=await chromium.launch({executablePath:chrome(),args:['--no-sandbox']});
for(const [name,q,wait] of [['1-cover','cover',4500],['2-fed','fed',1500],['3-start','start',200],['4-win','win',200]]){const p=await b.newPage({viewport:{width:1024,height:1024},deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));await p.goto(`http://127.0.0.1:8123/?shot=${q}`);await p.waitForTimeout(wait);await p.screenshot({path:path.join(out,`${name}.jpg`),type:'jpeg',quality:92});if(errors.length)throw Error(`${name}: ${errors.join('; ')}`);await p.close()}
await b.close();console.log('captured 4 Tidegate shots');
