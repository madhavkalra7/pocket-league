import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const result=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+item.name;if(item.isDirectory())result.push(...await walk(p));else if(item.name!=='sw.js')result.push(p);}return result;}
const files=await walk('dist'),hash=createHash('sha256');for(const file of files.sort())hash.update(await readFile(file));const version='pocket-'+hash.digest('hex').slice(0,16),urls=files.map(f=>'/'+f.slice(5));
await writeFile('dist/sw.js',`const CACHE=${JSON.stringify(version)},FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
// Updates wait until the previous app closes; never reload an active match.
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pocket-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname==='/health'||u.pathname==='/ws')return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(u.pathname))||fetch(e.request)));});
`);
console.log('PWA offline shell:',version,urls.length,'files');
