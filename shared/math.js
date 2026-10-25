export const v=(x=0,y=0,z=0)=>({x,y,z});
export const add=(a,b)=>v(a.x+b.x,a.y+b.y,a.z+b.z),sub=(a,b)=>v(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a,s)=>v(a.x*s,a.y*s,a.z*s),dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a,b)=>v(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x),len=a=>Math.hypot(a.x,a.y,a.z),norm=a=>mul(a,1/(len(a)||1)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function rotate(q,a){const t=mul(cross(q,a),2);return add(a,add(mul(t,q.w),cross(q,t)));}
export const axes=q=>({r:rotate(q,v(1,0,0)),u:rotate(q,v(0,1,0)),f:rotate(q,v(0,0,1))});
export const yawQ=a=>({x:0,y:Math.sin(a/2),z:0,w:Math.cos(a/2)});
