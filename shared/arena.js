import {C} from './constants.js';
// Identical mesh feeds both Rapier collision and Three.js visuals.
export const OUTLINE=[[-29.44,-51.2],[29.44,-51.2],[40.96,-39.68],[40.96,39.68],[29.44,51.2],[-29.44,51.2],[-40.96,39.68],[-40.96,-39.68]];
export function arenaSurfaces(){const groups={ramp:{positions:[],indices:[]},wall:{positions:[],indices:[]},ceiling:{positions:[],indices:[]}};
 const quad=(key,points)=>{const g=groups[key],n=g.positions.length/3;for(const p of points)g.positions.push(...p);g.indices.push(n,n+1,n+2,n,n+2,n+3);};
 function section(a,b,overGoal=false){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;const profile=[];if(overGoal)profile.push([0,C.goalHeight]);else for(let j=0;j<=16;j++){const t=j/16*Math.PI/2;profile.push([C.ramp-C.ramp*Math.sin(t),C.ramp-C.ramp*Math.cos(t)]);}profile.push([0,C.height-C.ramp]);for(let j=16;j>=0;j--){const t=j/16*Math.PI/2;profile.push([C.ramp-C.ramp*Math.sin(t),C.height-C.ramp+C.ramp*Math.cos(t)]);}const p=(a,s)=>[a[0]+nx*s[0],s[1],a[1]+nz*s[0]];
 for(let i=0;i<profile.length-1;i++){const low=profile[i],high=profile[i+1];quad(low[1]<C.ramp?'ramp':'wall',[p(a,low),p(b,low),p(b,high),p(a,high)]);}}
 for(let i=0;i<8;i++){const a=OUTLINE[i],b=OUTLINE[(i+1)%8];if(Math.abs(a[1])===C.halfLength&&a[1]===b[1]){const h=C.goalHalf,z=a[1];if(a[0]<b[0]){section(a,[-h,z]);section([h,z],b);section([-h,z],[h,z],true);}else{section(a,[h,z]);section([-h,z],b);section([h,z],[-h,z],true);}}else section(a,b);}
 for(let i=0;i<8;i++)quad('ceiling',[[0,C.height,0],[...OUTLINE[i].slice(0,1),C.height,OUTLINE[i][1]],[OUTLINE[(i+1)%8][0],C.height,OUTLINE[(i+1)%8][1]],[0,C.height,0]]);
 return groups;
}
