import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,DEFAULTS,sanitizeSettings,FramePacer} from '../client/settings.js';
test('integrated GPU default keeps a 60 FPS target independent of quality',()=>{assert.equal(DEFAULTS.fps,60);assert.equal(DEFAULTS.preset,'smooth');assert(!PRESETS.smooth.shadows);assert(!PRESETS.smooth.bloom);assert(PRESETS.smooth.scale<1);assert.equal(Object.keys(PRESETS).length,5);});
test('persisted settings are bounded and invalid targets fall back',()=>{const s=sanitizeSettings({fps:999,scale:10,music:-1,preset:'bad',bloom:'yes'});assert.equal(s.fps,60);assert.equal(s.scale,1.5);assert.equal(s.music,0);assert.equal(s.preset,'smooth');assert.equal(s.bloom,false);});
test('frame pacing caps draws without using a different simulation timestep',()=>{for(const fps of [30,45,60,90,120]){const p=new FramePacer();let n=0;for(let i=0;i<2400;i++)if(p.shouldRender(i*1000/240,fps))n++;assert(Math.abs(n-fps*10)<=2,`${fps}: ${n}`);}const p=new FramePacer();assert(p.shouldRender(1,0));assert(p.shouldRender(2,0));});
