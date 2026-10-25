import {randomInt} from 'node:crypto';
import {Match} from '../shared/physics.js';
import {emptyInput,cleanInput,C} from '../shared/constants.js';
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export class Rooms{
 constructor({maxRooms=32,now=()=>Date.now()}={}){this.rooms=new Map();this.maxRooms=maxRooms;this.now=now;}
 send(client,data){if(client.readyState===1&&client.bufferedAmount<256_000)client.send(JSON.stringify(data));}
 error(client,message){this.send(client,{type:'error',message});}
 code(){let code;do{code=Array.from({length:6},()=>ALPHABET[randomInt(ALPHABET.length)]).join('');}while(this.rooms.has(code));return code;}
 create(client){if(client.room)return this.error(client,'Leave your current room first.');if(this.rooms.size>=this.maxRooms)return this.error(client,'Server is full. Try again shortly.');const code=this.code(),room={code,clients:[client,null],inputs:[emptyInput(),emptyInput()],inputAt:[0,0],match:new Match(),created:this.now(),votes:new Set()};this.rooms.set(code,room);client.room=room;client.seat=0;this.send(client,{type:'room',code,seat:0,waiting:true});}
 join(client,code){if(client.room)return this.error(client,'Leave your current room first.');if(typeof code!=='string'||!/^[A-Z2-9]{6}$/.test(code))return this.error(client,'Enter a valid six-character room code.');const room=this.rooms.get(code);if(!room)return this.error(client,'Room not found.');if(room.clients[1])return this.error(client,'This room is full.');room.clients[1]=client;client.room=room;client.seat=1;room.match.kickoff();for(const c of room.clients)this.send(c,{type:'room',code,seat:c.seat,waiting:false});}
 input(client,raw){const r=client.room;if(!r||!r.clients[1])return;r.inputs[client.seat]=cleanInput(raw);r.inputAt[client.seat]=this.now();}
 rematch(client){const r=client.room;if(!r||r.match.phase!=='over')return;r.votes.add(client.seat);for(const c of r.clients)if(c)this.send(c,{type:'rematchVotes',votes:r.votes.size});if(r.votes.size===2){r.match.free();r.match=new Match();r.votes.clear();r.inputs=[emptyInput(),emptyInput()];}}
 leave(client){const r=client.room;if(!r)return;for(const c of r.clients)if(c){c.room=null;if(c!==client)this.send(c,{type:'opponentLeft'});}r.match.free();this.rooms.delete(r.code);client.room=null;}
 step(){for(const r of this.rooms.values()){if(!r.clients[1]){if(this.now()-r.created>10*60*1000){this.send(r.clients[0],{type:'error',message:'Room expired. Create a new room.'});this.leave(r.clients[0]);}continue;}const inputs=r.inputs.map((input,i)=>this.now()-r.inputAt[i]>300?emptyInput():input);r.match.step(inputs);if(r.match.tick%3===0){const message={type:'state',state:r.match.snapshot()};for(const c of r.clients)this.send(c,message);}}}
 dispose(){for(const r of this.rooms.values())r.match.free();this.rooms.clear();}
}
export const STEP_MS=C.step*1000;
