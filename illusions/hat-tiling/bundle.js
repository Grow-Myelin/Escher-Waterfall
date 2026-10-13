(()=>{var ye=Object.create;var Tt=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var we=Object.getOwnPropertyNames;var be=Object.getPrototypeOf,Ee=Object.prototype.hasOwnProperty;var Me=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var Pe=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of we(e))!Ee.call(t,o)&&o!==n&&Tt(t,o,{get:()=>e[o],enumerable:!(i=ge(e,o))||i.enumerable});return t};var vt=(t,e,n)=>(n=t!=null?ye(be(t)):{},Pe(e||!t||!t.__esModule?Tt(n,"default",{value:t,enumerable:!0}):n,t));var st=Me((un,kt)=>{kt.exports=window.THREE});var A=vt(st(),1);function Ht(t,e){let n=document.getElementById("frame"),i=()=>{let a=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),s=document.getElementById("controls"),l=(r?r.offsetHeight:0)+6+13,p=(s?s.offsetHeight:0)+8+13,d=window.innerWidth-a*2,h=window.innerHeight-l-p,c=h,u=c*t;u>d&&(u=d,c=u/t),u=Math.max(160,Math.floor(u)),c=Math.max(120,Math.floor(c)),n.style.width=`${u}px`,n.style.height=`${c}px`,n.style.top=`${l+Math.max(0,(h-c)/2)}px`,e?.(u,c)};return window.addEventListener("resize",i),i(),i}function Lt(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!t)return;let i=o=>{o?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(o))};e?.addEventListener("click",()=>i(t.hasAttribute("hidden"))),n?.addEventListener("click",()=>i(!1)),window.addEventListener("keydown",o=>{o.key==="Escape"&&i(!1)})}function xt(t,e,n){let i=o=>{for(let[a,r]of t)a.setAttribute("aria-pressed",String(r===o));e(o)};for(let[o,a]of t)o.addEventListener("click",()=>i(a));return n!==void 0&&i(n),i}function Ct(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let n=t[e.key.length===1?e.key.toLowerCase():e.key];n&&(e.preventDefault(),n(e))})}function St(t,e=!0){let n=document.getElementById("btn-play"),i=o=>{e=o,n&&(n.setAttribute("aria-pressed",String(!o)),n.querySelector("span").textContent=o?"Pause":"Play",n.querySelector(".icon").textContent=o?"\u275A\u275A":"\u25B6"),t(o)};return n?.addEventListener("click",()=>i(!e)),i(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),i}function yt(t,e){let n=document.getElementById("badge");n&&e&&(n.textContent=e),document.body.classList.toggle("badge-on",!!t)}function It(){document.body.classList.add("ready")}var E=Math.sqrt(3)/2,x=(t,e)=>({x:t,y:e}),I=(t,e)=>x(t+.5*e,E*e),W=[1,0,0,0,1,0];function lt(t){let e=t[0]*t[4]-t[1]*t[3];return[t[4]/e,-t[1]/e,(t[1]*t[5]-t[2]*t[4])/e,-t[3]/e,t[0]/e,(t[2]*t[3]-t[0]*t[5])/e]}function T(t,e){return[t[0]*e[0]+t[1]*e[3],t[0]*e[1]+t[1]*e[4],t[0]*e[2]+t[1]*e[5]+t[2],t[3]*e[0]+t[4]*e[3],t[3]*e[1]+t[4]*e[4],t[3]*e[2]+t[4]*e[5]+t[5]]}var ct=(t,e)=>x(t.x+e.x,t.y+e.y),tt=(t,e)=>x(t.x-e.x,t.y-e.y),wt=t=>[Math.cos(t),-Math.sin(t),0,Math.sin(t),Math.cos(t),0],U=(t,e)=>[1,0,t,0,1,e],At=(t,e)=>T(U(t.x,t.y),T(wt(e),U(-t.x,-t.y))),w=(t,e)=>x(t[0]*e.x+t[1]*e.y+t[2],t[3]*e.x+t[4]*e.y+t[5]),Rt=(t,e)=>[e.x-t.x,t.y-e.y,t.x,e.y-t.y,e.x-t.x,t.y],et=(t,e,n,i)=>T(Rt(n,i),lt(Rt(t,e)));function Te(t,e,n,i){let o=(i.y-n.y)*(e.x-t.x)-(i.x-n.x)*(e.y-t.y),a=((i.x-n.x)*(t.y-n.y)-(i.y-n.y)*(t.x-n.x))/o;return x(t.x+a*(e.x-t.x),t.y+a*(e.y-t.y))}var R=[I(0,0),I(-1,-1),I(0,-2),I(2,-2),I(2,-1),I(4,-2),I(5,-1),I(4,0),I(3,0),I(2,2),I(0,3),I(0,2),I(-1,2)],_=class{constructor(e){this.label=e}},F=class{constructor(e,n){this.shape=e,this.width=n,this.children=[]}addChild(e,n){this.children.push({T:e,geom:n})}evalChild(e,n){return w(this.children[e].T,this.children[e].geom.shape[n])}recentre(){let e=0,n=0;for(let o of this.shape)e+=o.x,n+=o.y;e/=this.shape.length,n/=this.shape.length,this.shape=this.shape.map(o=>x(o.x-e,o.y-n));let i=U(-e,-n);for(let o of this.children)o.T=T(i,o.T)}},ke=new _("H1"),gt=new _("H"),He=new _("T"),Ft=new _("P"),Dt=new _("F");function Le(){let t=[x(0,0),x(4,0),x(4.5,E),x(2.5,5*E),x(1.5,5*E),x(-.5,E)],e=new F(t,2);return e.addChild(et(R[5],R[7],t[5],t[0]),gt),e.addChild(et(R[9],R[11],t[1],t[2]),gt),e.addChild(et(R[5],R[7],t[3],t[4]),gt),e.addChild(T(U(2.5,E),T([-.5,-E,0,E,-.5,0],[.5,0,0,0,-.5,0])),ke),e}function Ce(){let t=[x(0,0),x(3,0),x(1.5,3*E)],e=new F(t,2);return e.addChild([.5,0,.5,0,.5,E],He),e}function Se(){let t=[x(0,0),x(4,0),x(3,2*E),x(-1,2*E)],e=new F(t,2);return e.addChild([.5,0,1.5,0,.5,E],Ft),e.addChild(T(U(0,2*E),T([.5,E,0,-E,.5,0],[.5,0,0,0,.5,0])),Ft),e}function Ie(){let t=[x(0,0),x(3,0),x(3.5,E),x(3,2*E),x(-1,2*E)],e=new F(t,2);return e.addChild([.5,0,1.5,0,.5,E],Dt),e.addChild(T(U(0,2*E),T([.5,E,0,-E,.5,0],[.5,0,0,0,.5,0])),Dt),e}var Ae=[["H"],[0,0,"P",2],[1,0,"H",2],[2,0,"P",2],[3,0,"H",2],[4,4,"P",2],[0,4,"F",3],[2,4,"F",3],[4,1,3,2,"F",0],[8,3,"H",0],[9,2,"P",0],[10,2,"H",0],[11,4,"P",2],[12,0,"H",2],[13,0,"F",3],[14,2,"F",1],[15,3,"H",4],[8,2,"F",1],[17,3,"H",0],[18,2,"P",0],[19,2,"H",2],[20,4,"F",3],[20,0,"P",2],[22,0,"H",2],[23,4,"F",3],[23,0,"F",3],[16,0,"P",2],[9,4,0,2,"T",2],[4,0,"F",3]];function Re(t,e,n,i){let o={H:t,T:e,P:n,F:i},a=new F([],t.width);for(let r of Ae)if(r.length===1)a.addChild(W,o[r[0]]);else if(r.length===4){let s=a.children[r[0]].geom.shape,l=a.children[r[0]].T,p=w(l,s[(r[1]+1)%s.length]),d=w(l,s[r[1]]),h=o[r[2]],c=h.shape;a.addChild(et(c[r[3]],c[(r[3]+1)%c.length],p,d),h)}else{let s=a.children[r[0]],l=a.children[r[2]],p=w(l.T,l.geom.shape[r[3]]),d=w(s.T,s.geom.shape[r[1]]),h=o[r[4]],c=h.shape;a.addChild(et(c[r[5]],c[(r[5]+1)%c.length],p,d),h)}return a}function Fe(t){let e=t.evalChild(8,2),n=t.evalChild(21,2),i=w(At(e,-2*Math.PI/3),n),o=t.evalChild(7,2),a=t.evalChild(25,2),r=Te(e,i,t.evalChild(6,2),o),s=tt(t.evalChild(6,2),r),l=[r,e];s=w(wt(-Math.PI/3),s),l.push(ct(l[1],s)),l.push(t.evalChild(14,2)),s=w(wt(-Math.PI/3),s),l.push(tt(l[3],s)),l.push(t.evalChild(6,2));let p=new F(l,t.width*2);for(let f of[0,9,16,27,26,6,1,8,10,15])p.addChild(t.children[f].T,t.children[f].geom);let d=new F([o,ct(o,tt(e,r)),e,r],t.width*2);for(let f of[7,2,3,4,28])d.addChild(t.children[f].T,t.children[f].geom);let h=new F([n,t.evalChild(24,2),t.evalChild(25,0),a,ct(a,tt(r,e))],t.width*2);for(let f of[21,20,22,23,24,25])h.addChild(t.children[f].T,t.children[f].geom);let c=l[2],u=ct(l[1],tt(l[4],l[5])),g=w(At(u,-Math.PI/3),c),y=new F([u,g,c],t.width*2);return y.addChild(t.children[11].T,t.children[11].geom),p.recentre(),d.recentre(),h.recentre(),y.recentre(),[p,y,d,h]}function Bt(t){let e=[Le(),Ce(),Se(),Ie()];for(let n=0;n<t;n++)e=Fe(Re(...e));return e}function Gt(t,e,n=W){let i=[],o=[],a=(r,s,l,p,d)=>{if(r instanceof _){let c={};for(let u=1;u<=d.length;u++)c[u]=d[d.length-u];i.push({T:s,label:r.label,path:p,types:c});return}let h=De(r);o.push({level:l,kind:h,pts:r.shape.map(c=>w(s,c))}),r.children.forEach((c,u)=>a(c.geom,T(s,c.T),l-1,p.concat(u),d.concat(h)))};return a(t,n,e+1,[],[]),{hats:i,outlines:o}}function De(t){let e=t.shape.length;return e===6?"H":e===3?"T":e===4?"P":"F"}var q=Math.sqrt(3),$t=[3,q],jt=[0,2*q];function ht(t,e){return[t*$t[0]+e*jt[0],t*$t[1]+e*jt[1]]}function dt(t,e,n){let[i,o]=ht(t,e),a=n*Math.PI/3,r=a-Math.PI/6,s=a+Math.PI/6;return[[i,o],[i+q*Math.cos(r),o+q*Math.sin(r)],[i+2*Math.cos(a),o+2*Math.sin(a)],[i+q*Math.cos(s),o+q*Math.sin(s)]]}function Be(t,e){let n=t/3,i=(e-n*q)/(2*q),o=Math.round(n),a=Math.round(i),[r,s]=ht(o,a);return{i:o,j:a,err:Math.hypot(t-r,e-s)}}function Ge(t,e,n){let i=!1;for(let o=0,a=n.length-1;o<n.length;a=o++){let[r,s]=[n[o].x,n[o].y],[l,p]=[n[a].x,n[a].y];s>e!=p>e&&t<(l-r)*(e-s)/(p-s)+r&&(i=!i)}return i}var $e=(()=>{let t=[];for(let e=-3;e<=3;e++)for(let n=-3;n<=3;n++)for(let i=0;i<6;i++){let o=dt(e,n,i),a=(o[0][0]+o[1][0]+o[2][0]+o[3][0])/4,r=(o[0][1]+o[1][1]+o[2][1]+o[3][1])/4;Ge(a,r,R)&&t.push({i:e,j:n,d:i,pts:o})}return t})();var je=(t,e,n)=>`${t},${e},${n}`;function qt(t){let e=lt(t[0].T),n=new Map,i=0,o=0,a=0,r=0,s=0,l=[];t.forEach((d,h)=>{let c=T(e,d.T),u=c[0]*c[4]-c[1]*c[3];u<0&&r++,u<0!=(d.label==="H1")&&s++;let g=[];for(let y of $e){let f=y.pts.map(([rt,xe])=>w(c,{x:rt,y:xe})),m=Be(f[0].x,f[0].y),[k,P]=ht(m.i,m.j),D=Math.atan2(f[2].y-P,f[2].x-k),B=(Math.round(D/(Math.PI/3))%6+6)%6,b=dt(m.i,m.j,B),S=m.err;S=Math.max(S,Math.hypot(f[2].x-b[2][0],f[2].y-b[2][1]));let G=Math.max(Math.hypot(f[1].x-b[1][0],f[1].y-b[1][1]),Math.hypot(f[3].x-b[3][0],f[3].y-b[3][1])),j=Math.max(Math.hypot(f[1].x-b[3][0],f[1].y-b[3][1]),Math.hypot(f[3].x-b[1][0],f[3].y-b[1][1]));S=Math.max(S,Math.min(G,j)),o=Math.max(o,S),S>1e-6&&i++;let N=je(m.i,m.j,B);n.has(N)?a++:n.set(N,h),g.push(N)}l.push(g)});let p=_e(n);return{hats:t.length,kites:n.size,offGrid:i,maxErr:o,overlaps:a,holes:p,reflected:r,mislabelled:s,perHat:l,base:e}}var _t=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];function _e(t){let e=1/0,n=-1/0,i=1/0,o=-1/0,a=[];for(let g of t.keys()){let[y,f,m]=g.split(",").map(Number);a.push([y,f,m]),e=Math.min(e,y),n=Math.max(n,y),i=Math.min(i,f),o=Math.max(o,f)}e-=2,n+=2,i-=2,o+=2;let r=n-e+1,s=o-i+1,l=(g,y,f)=>((g-e)*s+(y-i))*6+f,p=r*s*6,d=new Uint8Array(p);for(let[g,y,f]of a)d[l(g,y,f)]=1;let h=new Uint8Array(p),c=[l(e,i,0)];for(h[c[0]]=1;c.length;){let g=c.pop(),y=g%6,f=(g-y)/6,m=Math.floor(f/s)+e,k=f%s+i,P=_t[(y+5)%6],D=_t[y],B=[[m,k,(y+1)%6],[m,k,(y+5)%6],[m+P[0],k+P[1],(y+2)%6],[m+D[0],k+D[1],(y+4)%6]];for(let[b,S,G]of B){if(b<e||b>n||S<i||S>o)continue;let j=l(b,S,G);!h[j]&&!d[j]&&(h[j]=1,c.push(j))}}let u=0;for(let g=0;g<p;g++)!d[g]&&!h[g]&&u++;return u}var H=Math.sqrt(3)/2,L=[x(0,0),x(1,0),x(1.5,-H),x(1.5+H,.5-H),x(1.5+H,1.5-H),x(2.5+H,1.5-H),x(3+H,1.5),x(3,2),x(3-H,1.5),x(2.5-H,1.5+H),x(1.5-H,1.5+H),x(.5-H,1.5+H),x(-H,1.5),x(0,1)],Ot=t=>[Math.cos(t),-Math.sin(t),0,Math.sin(t),Math.cos(t),0],Qt=(t,e)=>[1,0,t,0,1,e],qe=(t,e)=>Qt(e.x-t.x,e.y-t.y),zt=[L[3],L[5],L[7],L[11]],X=class{constructor(e){this.label=e,this.quad=zt}},ut=class{constructor(e,n){this.quad=e,this.label=n,this.children=[]}addChild(e,n){this.children.push({T:e,geom:n})}},Oe=["Gamma","Delta","Theta","Lambda","Xi","Pi","Sigma","Phi","Psi"];function Qe(){let t={};for(let n of Oe.slice(1))t[n]=new X(n);let e=new ut(zt,"Gamma");return e.addChild(W,new X("Gamma1")),e.addChild(T(Qt(L[8].x,L[8].y),Ot(Math.PI/6)),new X("Gamma2")),t.Gamma=e,t}var ze={Gamma:["Pi","Delta",null,"Theta","Sigma","Xi","Phi","Gamma"],Delta:["Xi","Delta","Xi","Phi","Sigma","Pi","Phi","Gamma"],Theta:["Psi","Delta","Pi","Phi","Sigma","Pi","Phi","Gamma"],Lambda:["Psi","Delta","Xi","Phi","Sigma","Pi","Phi","Gamma"],Xi:["Psi","Delta","Pi","Phi","Sigma","Psi","Phi","Gamma"],Pi:["Psi","Delta","Xi","Phi","Sigma","Psi","Phi","Gamma"],Sigma:["Xi","Delta","Xi","Phi","Sigma","Pi","Lambda","Gamma"],Phi:["Psi","Delta","Psi","Phi","Sigma","Pi","Phi","Gamma"],Psi:["Psi","Delta","Psi","Phi","Sigma","Psi","Phi","Gamma"]};function Ve(t){let e=t.Delta.quad,n=[-1,0,0,0,1,0],i=[[60,3,1],[0,2,0],[60,3,1],[60,3,1],[0,2,0],[60,3,1],[-120,3,3]],o=[W],a=0,r=W,s=[...e];for(let[d,h,c]of i)a+=d,d!==0&&(r=Ot(a*Math.PI/180),s=e.map(u=>w(r,u))),o.push(T(qe(s[c],w(o[o.length-1],e[h])),r));for(let d=0;d<o.length;d++)o[d]=T(n,o[d]);let l=[w(o[6],e[2]),w(o[5],e[1]),w(o[3],e[2]),w(o[0],e[1])],p={};for(let[d,h]of Object.entries(ze)){let c=new ut(l,d);h.forEach((u,g)=>{u&&c.addChild(o[g],t[u])}),p[d]=c}return p}function Vt(t){let e=Qe();for(let n=0;n<t;n++)e=Ve(e);return e}function Wt(t,e=W){let n=[],i=(o,a,r,s)=>{if(o instanceof X){n.push({T:a,label:o.label,path:r,labels:s});return}o.children.forEach((l,p)=>i(l.geom,T(a,l.T),r.concat(p),s.concat(o.label)))};return i(t,e,[],[]),n}function Nt(t){let e=h=>`${Math.round(h.x*1e6)},${Math.round(h.y*1e6)}`,n=new Map,i=new Map,o=new Set,a=0;for(let h of t){let c=h.T[0]*h.T[4]-h.T[1]*h.T[3];o.add(Math.sign(c));let u=L.map(y=>w(h.T,y)),g=u.length;for(let y=0;y<g;y++){let f=u[(y+g-1)%g],m=u[y],k=u[(y+1)%g],P=e(f)+">"+e(m);n.has(P)&&a++,n.set(P,!0);let D=Math.atan2(f.y-m.y,f.x-m.x),B=Math.atan2(k.y-m.y,k.x-m.x),b=c>0?D-B:B-D;for(;b<=0;)b+=2*Math.PI;for(;b>2*Math.PI;)b-=2*Math.PI;i.set(e(m),(i.get(e(m))||0)+b)}}let r=new Set,s=0,l=0;for(let h of n.keys()){let[c,u]=h.split(">");n.has(u+">"+c)?s++:(l++,r.add(c),r.add(u))}let p=0,d=0;for(let[h,c]of i)r.has(h)||(d++,Math.abs(c-2*Math.PI)>1e-6&&p++);return{tiles:t.length,handedness:[...o],sharedEdges:s/2,boundaryEdges:l,interiorVertices:d,badAngle:p,badEdge:a}}var M=vt(st(),1);var ft={H:0,H1:0,T:1,P:2,F:3},We={Gamma:0,Gamma1:0,Gamma2:0,Delta:1,Theta:2,Lambda:3,Xi:4,Pi:5,Sigma:6,Phi:7,Psi:8};function Ne(t){let e=Math.sin(t*127.1+311.7)*43758.5453;return e-Math.floor(e)}function Kt(t,e){let n=0;for(;n<t.length&&n<e.length&&t[n]===e[n];)n++;return n}function Yt(t){let e=t.map(n=>new M.Vector2(n.x,n.y));return M.ShapeUtils.triangulateShape(e,[])}function Jt(t,e,n,i,o){let a=e.length,r=new Float32Array(t.length*a*2),s=new Float32Array(t.length*a*2),l=new Float32Array(t.length*a*4),p=new Float32Array(t.length*a*4),d=new Uint32Array(t.length*n.length*3);t.forEach((c,u)=>{let g=i(c),y=o(c)?1:0,f=Ne(u);for(let m=0;m<a;m++){let k=w(c.T,e[m]),P=u*a+m;r[P*2]=k.x,r[P*2+1]=k.y,s[P*2]=e[m].x,s[P*2+1]=e[m].y,l.set(g,P*4),p[P*4]=y,p[P*4+1]=f,p[P*4+2]=Math.sign(c.T[0]*c.T[4]-c.T[1]*c.T[3])}n.forEach((m,k)=>d.set([u*a+m[0],u*a+m[1],u*a+m[2]],(u*n.length+k)*3))});let h=new M.BufferGeometry;return h.setAttribute("position",new M.BufferAttribute(r,2)),h.setAttribute("aLocal",new M.BufferAttribute(s,2)),h.setAttribute("aType",new M.BufferAttribute(l,4)),h.setAttribute("aInfo",new M.BufferAttribute(p,4)),h.setIndex(new M.BufferAttribute(d,1)),h}function Zt(t){let e=new M.InstancedBufferGeometry;e.setAttribute("position",new M.BufferAttribute(new Float32Array([-1,-1,1,-1,1,1,-1,1]),2)),e.setIndex([0,1,2,0,2,3]);let n=new Float32Array(t.length*4),i=new Float32Array(t.length);return t.forEach((o,a)=>{n.set([o[0],o[1],o[2],o[3]],a*4),i[a]=o[4]}),e.setAttribute("iPQ",new M.InstancedBufferAttribute(n,4)),e.setAttribute("iLevel",new M.InstancedBufferAttribute(i,1)),e.instanceCount=t.length,e}function te(t,e){let n=new M.Vector3((e.x0+e.x1)/2,(e.y0+e.y1)/2,0),i=Math.hypot(e.x1-e.x0,e.y1-e.y0)/2+10;for(let o of t)o.boundingSphere=new M.Sphere(n,i)}function ee(t){let e=t.getAttribute("position").array,n=1/0,i=-1/0,o=1/0,a=-1/0,r=0,s=0;for(let l=0;l<e.length;l+=2)n=Math.min(n,e[l]),i=Math.max(i,e[l]),o=Math.min(o,e[l+1]),a=Math.max(a,e[l+1]),r+=e[l],s+=e[l+1];return{x0:n,x1:i,y0:o,y1:a,cx:r/(e.length/2),cy:s/(e.length/2)}}function ne(t,e,n){let i=Jt(t,R,Yt(R),h=>[ft[h.label],ft[h.types[2]],ft[h.types[3]],ft[h.types[4]]],h=>h.label==="H1"),o=new Map;e.perHat.forEach((h,c)=>h.forEach(u=>o.set(u,c)));let a=t[0].T,r=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]],s=Math.min(...t.map(h=>h.path.length)),l=[];e.perHat.forEach((h,c)=>{for(let u of h){let[g,y,f]=u.split(",").map(Number),m=dt(g,y,f),k=r[(f+5)%6],P=r[f],D=[[[g,y,(f+5)%6],m[0],m[1]],[[g+k[0],y+k[1],(f+2)%6],m[1],m[2]],[[g+P[0],y+P[1],(f+4)%6],m[2],m[3]],[[g,y,(f+1)%6],m[3],m[0]]];for(let[B,b,S]of D){let G=o.get(B.join(","));if(G===c||G!==void 0&&G<c)continue;let j=G===void 0?n+1:s-1-Kt(t[c].path,t[G].path),N=w(a,{x:b[0],y:b[1]}),rt=w(a,{x:S[0],y:S[1]});l.push([N.x,N.y,rt.x,rt.y,j])}}});let p=Zt(l),d=ee(i);return te([i,p],d),{fill:i,lines:p,box:d,count:t.length,segments:l.length}}var Ue=.12,Ut=6;function oe(t,e){let n=e.x-t.x,i=e.y-t.y,o=[];for(let a=0;a<Ut;a++){let r=a/Ut,s=Ue*Math.sin(2*Math.PI*r);o.push({x:t.x+n*r-i*s,y:t.y+i*r+n*s})}return o}var Xt=L.flatMap((t,e)=>oe(t,L[(e+1)%L.length]));function ie(t,e){let n=Jt(t,Xt,Yt(Xt),d=>{let h=d.labels.slice().reverse();d.label.startsWith("Gamma")&&h.shift();let c=u=>u===0?d.label:h[u-1]||"Delta";return[0,1,2,3].map(u=>We[c(u)])},d=>d.label==="Gamma2"),i=d=>`${Math.round(d.x*1e5)},${Math.round(d.y*1e5)}`,o=L.length,a=t.map(d=>L.map(h=>w(d.T,h))),r=new Map;a.forEach((d,h)=>{for(let c=0;c<o;c++)r.set(i(d[c])+">"+i(d[(c+1)%o]),h)});let s=[];a.forEach((d,h)=>{for(let c=0;c<o;c++){let u=r.get(i(d[(c+1)%o])+">"+i(d[c]));if(u!==void 0&&u<h)continue;let g=u===void 0?e:Math.max(0,e-1-Kt(t[h].path,t[u].path)),f=oe(L[c],L[(c+1)%o]).concat([L[(c+1)%o]]).map(m=>w(t[h].T,m));for(let m=0;m<f.length-1;m++)s.push([f[m].x,f[m].y,f[m+1].x,f[m+1].y,g])}});let l=Zt(s),p=ee(n);return te([n,l],p),{fill:n,lines:l,box:p,count:t.length,segments:s.length}}var C=vt(st(),1);function ae(){return{uLitho:{value:1},uPx:{value:.01},uDpr:{value:1},uPaper:{value:new C.Vector3(.925,.898,.835)},uInk:{value:new C.Vector3(.11,.1,.09)}}}var Xe=`
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
`,Ke=`
attribute vec2 aLocal;
attribute vec4 aType;
attribute vec4 aInfo;
varying vec2 vL;
varying vec4 vT;
varying vec4 vI;
void main() {
  vL = aLocal; vT = aType; vI = aInfo;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0.0, 1.0);
}
`,Ye=`
uniform float uLitho;
uniform float uPx;
uniform float uDpr;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uLevel;    // which level of cluster sets the colour (0..3, fractional = cross-fade)
uniform float uOdd;      // emphasis on the odd ones out
uniform float uKites;    // kite grid visibility
uniform float uSpectre;  // 0 hats, 1 spectres
varying vec2 vL;
varying vec4 vT;
varying vec4 vI;
${Xe}

// colour print palettes
vec3 hatColour(float t) {
  if (t < 0.5) return vec3(0.815, 0.852, 0.858);   // H
  if (t < 1.5) return vec3(0.741, 0.455, 0.345);   // T
  if (t < 2.5) return vec3(0.878, 0.741, 0.506);   // P
  return vec3(0.612, 0.682, 0.553);                // F
}
vec3 spectreColour(float t) {
  if (t < 0.5) return vec3(0.835, 0.858, 0.855);   // \u0393
  if (t < 1.5) return vec3(0.867, 0.749, 0.537);   // \u0394
  if (t < 2.5) return vec3(0.733, 0.502, 0.400);   // \u0398
  if (t < 3.5) return vec3(0.600, 0.659, 0.718);   // \u039B
  if (t < 4.5) return vec3(0.639, 0.698, 0.592);   // \u039E
  if (t < 5.5) return vec3(0.890, 0.847, 0.733);   // \u03A0
  if (t < 6.5) return vec3(0.718, 0.635, 0.678);   // \u03A3
  if (t < 7.5) return vec3(0.820, 0.667, 0.522);   // \u03A6
  return vec3(0.918, 0.902, 0.839);                // \u03A8
}
// lithograph: (tone, hatch coverage, cross-hatch coverage)
vec3 hatInk(float t) {
  if (t < 0.5) return vec3(0.95, 0.0, 0.0);
  if (t < 1.5) return vec3(0.62, 0.5, 0.32);
  if (t < 2.5) return vec3(0.86, 0.26, 0.0);
  return vec3(0.76, 0.4, 0.14);
}
vec3 spectreInk(float t) {
  if (t < 0.5) return vec3(0.95, 0.0, 0.0);
  if (t < 1.5) return vec3(0.86, 0.26, 0.0);
  if (t < 2.5) return vec3(0.62, 0.5, 0.32);
  if (t < 3.5) return vec3(0.8, 0.36, 0.08);
  if (t < 4.5) return vec3(0.76, 0.4, 0.14);
  if (t < 5.5) return vec3(0.9, 0.16, 0.0);
  if (t < 6.5) return vec3(0.7, 0.44, 0.22);
  if (t < 7.5) return vec3(0.83, 0.3, 0.06);
  return vec3(0.97, 0.0, 0.0);
}
float typeAt(float l) {
  if (l < 0.5) return vT.x;
  if (l < 1.5) return vT.y;
  if (l < 2.5) return vT.z;
  return vT.w;
}

// distance (in hat units) to the nearest line of the kite grid: the hexagon
// edges, and the lines from each hexagon centre to its edge midpoints
float kiteDist(vec2 p) {
  const float R3 = 1.7320508;
  float fi = p.x / 3.0;
  float fj = (p.y - fi * R3) / (2.0 * R3);
  vec2 best = vec2(0.0); float bd = 1e9;
  for (int a = 0; a < 2; a++) for (int b = 0; b < 2; b++) {
    vec2 ij = vec2(floor(fi) + float(a), floor(fj) + float(b));
    vec2 c = vec2(3.0 * ij.x, R3 * ij.x + 2.0 * R3 * ij.y);
    float d = dot(p - c, p - c);
    if (d < bd) { bd = d; best = c; }
  }
  vec2 q = p - best;
  vec2 n0 = vec2(0.8660254, 0.5), n1 = vec2(0.0, 1.0), n2 = vec2(-0.8660254, 0.5);
  float h = R3 - max(max(abs(dot(q, n0)), abs(dot(q, n1))), abs(dot(q, n2)));
  float d0 = abs(q.x * n0.y - q.y * n0.x), d1 = abs(q.x * n1.y - q.y * n1.x), d2 = abs(q.x * n2.y - q.y * n2.x);
  return min(h, min(d0, min(d1, d2)));
}

void main() {
  float l0 = floor(uLevel), f = uLevel - l0;
  float tA = typeAt(l0), tB = typeAt(l0 + 1.0);
  vec3 colA = mix(hatColour(tA), spectreColour(tA), uSpectre);
  vec3 colB = mix(hatColour(tB), spectreColour(tB), uSpectre);
  vec3 inkA = mix(hatInk(tA), spectreInk(tA), uSpectre);
  vec3 inkB = mix(hatInk(tB), spectreInk(tB), uSpectre);
  vec3 col = mix(colA, colB, f);
  vec3 tone = mix(inkA, inkB, f);

  float odd = vI.x * uOdd;
  float rnd = vI.y;
  float g = vnoise(gl_FragCoord.xy * 0.55) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  float mottle = vnoise(vL * 1.3 + rnd * 17.0) - 0.5;

  // ---- colour print
  vec3 oddCol = mix(vec3(0.204, 0.239, 0.400), vec3(0.635, 0.169, 0.133), uSpectre);
  vec3 colour = mix(col, oddCol, odd);
  colour *= 1.0 + mottle * 0.06;
  colour += g * 0.03 + gw * 0.025;

  // ---- lithograph: ruled lines that turn with the tile
  vec3 ttone = mix(tone, vec3(0.16, 0.85, 0.6), odd);
  float hp = mix(0.42, 0.34, uSpectre);         // period, in tile units
  float a1 = (vL.x * 0.5 + vL.y * 0.8660254) / hp;
  float a2 = (vL.x * 0.5 - vL.y * 0.8660254) / hp;
  float d1 = abs(fract(a1) - 0.5) * 2.0, d2 = abs(fract(a2) - 0.5) * 2.0;
  float f1 = fwidth(a1) * 1.5 + 0.02, f2 = fwidth(a2) * 1.5 + 0.02;
  float lod = smoothstep(0.5, 0.22, fwidth(a1));
  float h1 = (1.0 - smoothstep(ttone.y - f1, ttone.y + f1, d1)) * smoothstep(0.0, 0.05, ttone.y);
  float h2 = (1.0 - smoothstep(ttone.z - f2, ttone.z + f2, d2)) * smoothstep(0.0, 0.05, ttone.z);
  h1 = mix(ttone.y, h1, lod);
  h2 = mix(ttone.z, h2, lod);
  float v = ttone.x - h1 * 0.5 - h2 * 0.42;
  v += g * 0.1 + gw * 0.07 + mottle * 0.05;
  vec3 litho = mix(uInk, uPaper, clamp(v, 0.0, 1.0));

  vec3 outc = mix(colour, litho, uLitho);

  // the kite grid inside each hat
  if (uKites > 0.001 && uSpectre < 0.5) {
    float kd = kiteDist(vL);
    float fw = max(fwidth(vL.x), fwidth(vL.y));
    float px = kd / max(fw, 1e-5);
    float show = uKites * smoothstep(0.035, 0.09, 1.0 / max(fw, 1e-5) / 100.0);
    float line = 1.0 - smoothstep(0.35 * uDpr, 0.35 * uDpr + 1.0, px);
    // construction lines: a darker shade of the tile's own colour
    vec3 kc = mix(outc * mix(0.74, 1.0, odd) + vec3(0.32) * odd, mix(uInk, uPaper, step(0.5, odd)), uLitho);
    outc = mix(outc, kc, line * show * mix(0.85, 0.3, uLitho));
  }
  gl_FragColor = vec4(outc, 1.0);
}
`;function re(t){return new C.ShaderMaterial({uniforms:{...t,uLevel:{value:0},uOdd:{value:1},uKites:{value:1},uSpectre:{value:0}},vertexShader:Ke,fragmentShader:Ye,depthTest:!1,depthWrite:!1,side:C.DoubleSide})}var Je=`
attribute vec4 iPQ;
attribute float iLevel;
uniform float uH;       // half-height of the view, world units
uniform float uPx;      // world units per device pixel
uniform float uDpr;
uniform float uBase;    // size of one tile, world units
uniform float uGrow;    // how much larger each level of cluster is
uniform float uLevels;  // the outline of the whole patch
varying vec2 vW;
varying vec4 vPQ;
varying float vHalf;
varying float vA;
void main() {
  float r = uBase * pow(uGrow, iLevel) / (2.0 * uH);   // cluster size / view height
  // a tile a fifth of the view high gets a 1.2px line; each doubling of
  // cluster size adds 0.8px
  float w = clamp(1.6 + 0.8 * log2(max(r, 1e-5) / 0.16), 0.45, 3.5);
  if (iLevel >= uLevels - 0.5) w = max(w, 2.6);
  vA = smoothstep(0.006, 0.03, r);
  vHalf = 0.5 * w * uDpr * uPx;
  float hw = vHalf + 1.2 * uPx;
  vec2 p = iPQ.xy, q = iPQ.zw;
  vec2 d = q - p;
  float L = max(length(d), 1e-9);
  vec2 t = d / L, n = vec2(-t.y, t.x);
  vec2 w2 = mix(p, q, position.x * 0.5 + 0.5) + t * position.x * hw + n * position.y * hw;
  vW = w2; vPQ = iPQ;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(w2, 0.0, 1.0);
}
`,Ze=`
uniform float uLitho;
uniform float uPx;
uniform vec3 uInk;
uniform float uAlpha;
varying vec2 vW;
varying vec4 vPQ;
varying float vHalf;
varying float vA;
void main() {
  vec2 p = vPQ.xy, q = vPQ.zw;
  vec2 pa = vW - p, ba = q - p;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-12), 0.0, 1.0);
  float d = length(pa - ba * h);
  float c = 1.0 - smoothstep(vHalf - 0.6 * uPx, vHalf + 0.6 * uPx, d);
  c *= vA * uAlpha;
  if (c < 0.003) discard;
  vec3 ink = mix(vec3(0.17, 0.13, 0.11), uInk, uLitho);
  // min-blended: overlapping joints never darken twice
  gl_FragColor = vec4(mix(vec3(1.0), ink, c), 1.0);
}
`;function se(t,e){return new C.ShaderMaterial({uniforms:{uLitho:t.uLitho,uPx:t.uPx,uDpr:t.uDpr,uInk:t.uInk,uH:{value:10},uBase:{value:e.base},uGrow:{value:e.grow},uLevels:{value:e.levels},uAlpha:{value:1}},vertexShader:Je,fragmentShader:Ze,depthTest:!1,depthWrite:!1,transparent:!0,blending:C.CustomBlending,blendEquation:C.MinEquation,blendSrc:C.OneFactor,blendDst:C.OneFactor})}var le=30/38,nt=4,bt=5,ot={x:116.94,y:-225.31,r:110},tn=44,en=t=>Math.min(1,Math.max(0,t)),nn=(t,e,n)=>{let i=en((n-t)/(e-t));return i*i*(3-2*i)},Q=t=>t.toLocaleString("en-GB"),z=document.getElementById("scene"),Z=new A.WebGLRenderer({canvas:z,antialias:!0}),he=Math.min(window.devicePixelRatio||1,2);Z.setPixelRatio(he);var Mt=new A.Color(15525333),de=new A.Color(15131093);Z.setClearColor(Mt,1);var ue=new A.Scene,K=ae();K.uDpr.value=he;var O=new A.OrthographicCamera(-1,1,1,-1,-10,10);O.position.set(0,0,5);var mt=le,$={};function on(t,e,n){let i=e.lines.getAttribute("iPQ").array,o=e.lines.getAttribute("iLevel").array,a=[];for(let l=0;l<o.length;l++)o[l]>=n-.5&&a.push(i[l*4],i[l*4+1]);let r=t[0],s=-1;for(let l of t){let p=1/0;for(let d=0;d<a.length;d+=2)p=Math.min(p,(a[d]-l.x)**2+(a[d+1]-l.y)**2);p>s&&(s=p,r=l)}return r}function an(){let[t]=Bt(nt),{hats:e}=Gt(t,nt),n=qt(e),i=ne(e,n,nt),o=e.filter(s=>s.label==="H1").map(s=>({x:s.T[0]*1.5+s.T[1]*.433+s.T[2],y:s.T[3]*1.5+s.T[4]*.433+s.T[5]})),a=on(o,i,nt+1),r=e.filter(s=>s.label==="H1").length;return{data:i,focus:a,base:2,grow:2.618,levels:nt+1,close:6.4,report:{tiles:e.length,odd:r,kites:n.kites,offGrid:n.offGrid,overlaps:n.overlaps,holes:n.holes,maxErr:n.maxErr}}}function rn(){let t=Vt(bt),e=Wt(t.Delta).filter(s=>{let l=w(s.T,{x:1.5,y:.75});return Math.hypot(l.x-ot.x,l.y-ot.y)<ot.r}),n=ie(e,bt),i=Nt(e),o=null,a=1/0;for(let s of e){if(s.label!=="Gamma2")continue;let l=w(s.T,{x:1.5,y:.75}),p=Math.hypot(l.x-ot.x,l.y-ot.y);p<a&&(a=p,o=l)}let r=e.filter(s=>s.label==="Gamma2").length;return{data:n,focus:o,base:2.9,grow:2.8,levels:bt,close:10.5,report:{tiles:e.length,odd:r,handed:i.handedness.length===1,badAngle:i.badAngle,badEdge:i.badEdge,interior:i.interiorVertices}}}function pt(t){if($[t])return $[t];let e=t==="hat"?an():rn();e.fill=new A.Mesh(e.data.fill,re(K)),e.fill.material.uniforms.uSpectre.value=t==="hat"?0:1,e.lines=new A.Mesh(e.data.lines,se(K,{base:e.base,grow:e.grow,levels:e.levels}));for(let i of[e.fill,e.lines])i.frustumCulled=!1,i.visible=!1,ue.add(i);e.fill.renderOrder=1,e.lines.renderOrder=2;let n=e.data.box;return e.far={x:(n.x0+n.x1)/2,y:(n.y0+n.y1)/2,w:n.x1-n.x0,h:n.y1-n.y0},$[t]=e,e}var v={playing:!0,litho:1,lithoTarget:1,mode:"hat",fade:1,phase:0,odd:1,oddT:1};function sn(t){let e=t%1,n=e<.5?e*2:2-e*2;return nn(.08,.92,n)}function cn(t,e){let n=Math.max(t.far.h/2,t.far.w/2/mt)*1.03,i=t.close*Math.pow(n/t.close,e),o=Math.pow(e,1.2);return{h:i,x:t.focus.x+(t.far.x-t.focus.x)*o,y:t.focus.y+(t.far.y-t.focus.y)*o}}var Y="";function ln(t,e,n){let i=Math.log(.5*e/t.base)/Math.log(t.grow)-.2,o=n>.97?t.levels:Math.max(0,Math.min(t.levels-1,Math.round(i))),a=t.report,r;v.mode==="hat"?(o===0?r="Hats: each one eight kites of a hexagonal grid":o===1?r="Level 1: hats grouped into H, T, P and F metatiles":o<t.levels?r=`Level ${o}: those groups grouped again into larger H, T, P and F`:r=`The whole patch: one level-${t.levels} H of ${Q(a.tiles)} hats`,v.oddT&&(r+=` \xB7 ${Q(a.odd)} reflected (1 in ${(a.tiles/a.odd).toFixed(2)})`)):(o===0?r="Spectres: one shape, its edges bent so it cannot be flipped":o<t.levels?r=`Level ${o}: spectres grouped into nine kinds of cluster`:r=`${Q(a.tiles)} spectres, cut as a disc from a level-${t.levels} cluster`,v.oddT&&(r+=` \xB7 ${Q(a.odd)} turned by 30\xB0 (1 in ${(a.tiles/a.odd).toFixed(2)})`)),r!==Y&&(yt(!0,r),Y=r)}function Et(){let t=pt(v.mode);for(let a of Object.keys($)){let r=a===v.mode;$[a].fill.visible=r,$[a].lines.visible=r}let e=sn(v.phase),n=cn(t,e);O.left=-n.h*mt,O.right=n.h*mt,O.top=n.h,O.bottom=-n.h,O.position.set(n.x,n.y,5),O.updateProjectionMatrix(),K.uPx.value=2*n.h/Math.max(1,z.height);let i=t.fill.material.uniforms,o=Math.log(.66*n.h/t.base)/Math.log(t.grow);i.uLevel.value=Math.max(0,Math.min(3,o-1.6)),i.uOdd.value=v.odd,i.uKites.value=1,t.lines.material.uniforms.uH.value=n.h,t.lines.material.uniforms.uAlpha.value=1,ln(t,n.h,e),Z.render(ue,O)}var J=!0;Ht(le,(t,e)=>{Z.setSize(t,e),mt=t/e,J=!0});Lt();var V=t=>document.getElementById(t),fe=xt([[V("btn-litho"),1],[V("btn-colour"),0]],t=>{v.lithoTarget=t},1),at=xt([[V("btn-hat"),"hat"],[V("btn-spectre"),"spectre"]],t=>{if(t!==v.mode){if(!$[t]){yt(!0,t==="spectre"?"Building the spectres\u2026":"Building the hats\u2026"),Y="",setTimeout(()=>{pt(t),at(t)},30);return}v.mode=t,Y="",document.body.classList.toggle("spectre",t==="spectre"),Pt(),J=!0}},"hat");V("btn-odd").addEventListener("click",()=>{v.oddT=v.oddT?0:1,V("btn-odd").setAttribute("aria-pressed",String(!!v.oddT)),Y="",J=!0});var hn=St(t=>{v.playing=t});Ct({" ":()=>hn(!v.playing),l:()=>fe(v.lithoTarget?0:1),m:()=>at(v.mode==="hat"?"spectre":"hat"),s:()=>at(v.mode==="hat"?"spectre":"hat"),h:()=>V("btn-odd").click()});function me(t){let e=v.phase%1;v.phase=e<.5?Math.min(.5,Math.max(0,e+t*.5)):Math.min(.9999,Math.max(.5,e-t*.5)),J=!0}var it=null;z.addEventListener("pointerdown",t=>{z.setPointerCapture(t.pointerId),it=t.clientY});z.addEventListener("pointermove",t=>{it!==null&&(me((it-t.clientY)/-500),it=t.clientY)});var pe=()=>{it=null};z.addEventListener("pointerup",pe);z.addEventListener("pointercancel",pe);z.addEventListener("wheel",t=>{t.preventDefault(),me(t.deltaY*9e-4)},{passive:!1});function Pt(){let t=V("report");if(!t)return;let e=$[v.mode];if(!e)return;let n=e.report;t.textContent=v.mode==="hat"?`Checked in your browser: ${Q(n.tiles)} hats cover ${Q(n.kites)} kites, exactly eight each; ${n.offGrid===0?"every corner lies on the kite grid":`${n.offGrid} kites off the grid`}; ${n.overlaps} kites covered twice; ${n.holes} gaps.`:`Checked in your browser: ${Q(n.tiles)} spectres, ${n.handed?"all the same way round":"mixed handedness"}; they meet edge to edge${n.badEdge?" (with errors)":""}, and the corners round each of the ${Q(n.interior)} inner vertices add up to 360\xB0${n.badAngle?` except at ${n.badAngle}`:""}.`}var ce=performance.now();function ve(t){let e=Math.min(.05,Math.max(0,(t-ce)/1e3));if(ce=t,v.playing&&(v.phase=(v.phase+e/tn)%1),v.odd+=Math.sign(v.oddT-v.odd)*Math.min(Math.abs(v.oddT-v.odd),e*3),v.litho!==v.lithoTarget){let i=v.lithoTarget-v.litho;v.litho+=Math.sign(i)*Math.min(Math.abs(i),e*2.2),K.uLitho.value=v.litho,Z.setClearColor(de.clone().lerp(Mt,v.litho),1)}(v.playing||v.litho!==v.lithoTarget||v.odd!==v.oddT||J)&&(Et(),J=!1),requestAnimationFrame(ve)}pt("hat");Pt();It();requestAnimationFrame(ve);window.__page={state:v,patches:$,setMode:at,setLitho:fe,render:Et,ensure:pt,set(t){let{mode:e,...n}=t;Object.assign(v,n),"litho"in t&&(K.uLitho.value=t.litho,Z.setClearColor(de.clone().lerp(Mt,t.litho),1)),e&&at(e),Y="",Pt(),Et()}};})();
