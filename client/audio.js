export class GameAudio{
 constructor(){this.muted=false;}
 unlock(){if(this.ctx){this.ctx.resume();return;}try{this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=.18;this.master.connect(this.ctx.destination);this.engine=this.ctx.createOscillator();this.gain=this.ctx.createGain();const filter=this.ctx.createBiquadFilter();filter.frequency.value=550;this.engine.type='sawtooth';this.engine.connect(filter).connect(this.gain).connect(this.master);this.gain.gain.value=0;this.engine.start();}catch{}}
 tone(from,to,duration=.12,volume=.3){if(!this.ctx||this.muted)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.master);o.start(t);o.stop(t+duration);}
 update(speed,active){if(!this.ctx)return;this.engine.frequency.value=40+speed*7;this.gain.gain.value=active&&!this.muted?.06+speed*.003:0;}
}
