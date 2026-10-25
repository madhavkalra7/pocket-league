import {randomInt} from 'node:crypto';
import {Match} from '../shared/physics.js';
import {emptyInput,cleanInput,C} from '../shared/constants.js';
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export class Rooms{
 constructor({maxRooms=32,now=()=>Date.now()}={}){this.rooms=new Map();this.maxRooms=maxRooms;this.now=now;}
 send(c,q){if(c?.readyState===1&&c.bufferedAmount<256_000)c.send(JSON.stringify(q));}
 error(c,message){this.send(c,{type:'error',message});}
 code(){let c;do{c=Array.from({length:6},()=>ALPHABET[randomInt(32)]).join('');}while(this.rooms.has(c));return c;}
 announce(r){for(const c of r.clients)if(c)this.send(c,{type:'room',code:r.code,seat:c.seat,team:c.seat%2,capacity:r.capacity,humans:r.clients.filter(Boolean).length,waiting:!r.started,botLimit:r.botLimit});}
 create(c,options={}){if(c.room)return this.error(c,'Leave your current room first.');if(this.rooms.size>=this.maxRooms)return this.error(c,'Server is full.');const capacity=options?.mode==='2v2'?4:options?.mode==='3v3'?6:2,botLimit=Math.max(0,Math.min(5,Math.trunc(Number(options?.bots))||0));const code=this.code(),r={code,capacity,botLimit,started:false,clients:Array(capacity).fill(null),inputs:Array.from({length:capacity},emptyInput),inputAt:Array(capacity).fill(0),match:new Match({count:capacity}),created:this.now(),votes:new Set()};r.clients[0]=c;c.room=r;c.seat=0;this.rooms.set(code,r);this.announce(r);}
 join(c,code){if(c.room)return this.error(c,'Leave your current room first.');if(typeof code!=='string'||!/^[A-Z2-9]{6}$/.test(code))return this.error(c,'Enter a valid six-character room code.');const r=this.rooms.get(code);if(!r)return this.error(c,'Room not found.');const seat=r.clients.indexOf(null);if(r.started||seat<0)return this.error(c,'This room is full or already playing.');r.clients[seat]=c;c.room=r;c.seat=seat;if(r.clients.every(Boolean)){r.started=true;r.match.kickoff();}this.announce(r);}
 start(c){const r=c.room;if(!r||c.seat!==0)return this.error(c,'Only the host can start.');if(r.started)return;const missing=r.clients.filter(x=>!x).length;if(missing>r.botLimit)return this.error(c,`Need ${missing} bots, but the selected limit is ${r.botLimit}. Invite more players or create a room with more bots.`);r.started=true;r.match.kickoff();this.announce(r);}
 input(c,input){const r=c.room;if(!r||!r.started)return;r.inputs[c.seat]=cleanInput(input);r.inputAt[c.seat]=this.now();}
 rematch(c){const r=c.room;if(!r||r.match.phase!=='over')return;r.votes.add(c.seat);const humans=r.clients.filter(Boolean).length;for(const p of r.clients)this.send(p,{type:'rematchVotes',votes:r.votes.size,total:humans});if(r.votes.size===humans){r.match.free();r.match=new Match({count:r.capacity});r.votes.clear();r.inputs=Array.from({length:r.capacity},emptyInput);}}
 leave(c){const r=c.room;if(!r)return;for(const p of r.clients)if(p){p.room=null;if(p!==c)this.send(p,{type:'opponentLeft'});}r.match.free();this.rooms.delete(r.code);c.room=null;}
 step(){for(const r of this.rooms.values()){if(!r.started){if(this.now()-r.created>600000){this.error(r.clients[0],'Room expired.');this.leave(r.clients[0]);}continue;}r.match.step(r.clients.map((c,i)=>!c?r.match.bot(i):this.now()-r.inputAt[i]>300?emptyInput():r.inputs[i]));if(r.match.tick%3===0)for(const c of r.clients)this.send(c,{type:'state',state:r.match.snapshot()});}}
 dispose(){for(const r of this.rooms.values()){for(const c of r.clients)if(c)c.room=null;r.match.free();}this.rooms.clear();}
}
export const STEP_MS=C.step*1000;
