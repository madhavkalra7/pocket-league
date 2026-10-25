import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
test('installed launch serves the cached shell paired with its own versioned assets',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'pocket-sw-'));try{await mkdir(path.join(dir,'dist'));await writeFile(path.join(dir,'dist/index.html'),'old-version-shell');execFileSync(process.execPath,[path.resolve('scripts/build-sw.js')],{cwd:dir});const code=await readFile(path.join(dir,'dist/sw.js'),'utf8'),handlers={};let requested=false,response;const shell=new Response('old-version-shell');vm.runInNewContext(code,{self:{location:{origin:'https://game.example'},addEventListener:(name,fn)=>handlers[name]=fn},URL,Response,caches:{open:async()=>({match:async()=>shell})},fetch:async()=>{requested=true;return new Response('new incompatible shell');}});handlers.fetch({request:{url:'https://game.example/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await(await response).text(),'old-version-shell');assert.equal(requested,false);}finally{await rm(dir,{recursive:true,force:true});}});
