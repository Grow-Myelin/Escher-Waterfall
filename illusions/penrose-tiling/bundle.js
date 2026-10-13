(()=>{var Ut=Object.create;var pt=Object.defineProperty;var Zt=Object.getOwnPropertyDescriptor;var Kt=Object.getOwnPropertyNames;var Qt=Object.getPrototypeOf,jt=Object.prototype.hasOwnProperty;var Jt=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var te=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Kt(e))!jt.call(t,s)&&s!==n&&pt(t,s,{get:()=>e[s],enumerable:!(r=Zt(e,s))||r.enumerable});return t};var nt=(t,e,n)=>(n=t!=null?Ut(Qt(t)):{},te(e||!t||!t.__esModule?pt(n,"default",{value:t,enumerable:!0}):n,t));var j=Jt((we,vt)=>{vt.exports=window.THREE});var b=nt(j(),1);function gt(t,e){let n=document.getElementById("frame"),r=()=>{let a=(window.innerWidth<640?10:28)+13,i=document.getElementById("masthead"),l=document.getElementById("controls"),f=(i?i.offsetHeight:0)+6+13,u=(l?l.offsetHeight:0)+8+13,p=window.innerWidth-a*2,d=window.innerHeight-f-u,c=d,h=c*t;h>p&&(h=p,c=h/t),h=Math.max(160,Math.floor(h)),c=Math.max(120,Math.floor(c)),n.style.width=`${h}px`,n.style.height=`${c}px`,n.style.top=`${f+Math.max(0,(d-c)/2)}px`,e?.(h,c)};return window.addEventListener("resize",r),r(),r}function xt(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!t)return;let r=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(s))};e?.addEventListener("click",()=>r(t.hasAttribute("hidden"))),n?.addEventListener("click",()=>r(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&r(!1)})}function ot(t,e,n){let r=s=>{for(let[a,i]of t)a.setAttribute("aria-pressed",String(i===s));e(s)};for(let[s,a]of t)s.addEventListener("click",()=>r(a));return n!==void 0&&r(n),r}function Et(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let n=t[e.key.length===1?e.key.toLowerCase():e.key];n&&(e.preventDefault(),n(e))})}function yt(t,e=!0){let n=document.getElementById("btn-play"),r=s=>{e=s,n&&(n.setAttribute("aria-pressed",String(!s)),n.querySelector("span").textContent=s?"Pause":"Play",n.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return n?.addEventListener("click",()=>r(!e)),r(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),r}function at(t,e){let n=document.getElementById("badge");n&&e&&(n.textContent=e),document.body.classList.toggle("badge-on",!!t)}function bt(){document.body.classList.add("ready")}var W=(1+Math.sqrt(5))/2,rt=1/W,tt={xThick:.62,xThin:.38,y:.2},it=(t,e,n)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n];function kt(t=0){let e=[];for(let n=0;n<10;n++){let r=(2*n-1)*Math.PI/10+t,s=(2*n+1)*Math.PI/10+t,a=[Math.cos(r),Math.sin(r)],i=[Math.cos(s),Math.sin(s)];n%2===0&&([a,i]=[i,a]),e.push({k:0,A:[0,0],B:a,C:i})}return e}function wt(t,e){let n=[],r=s=>{(!e||e(s))&&n.push(s)};for(let{k:s,A:a,B:i,C:l}of t)if(s===0){let f=it(a,i,rt);r({k:0,A:l,B:f,C:i}),r({k:1,A:f,B:l,C:a})}else{let f=it(i,a,rt),u=it(i,l,rt);r({k:1,A:u,B:l,C:a}),r({k:1,A:f,B:u,C:i}),r({k:0,A:u,B:f,C:a})}return n}var J=t=>`${Math.round(t[0]*1e7)},${Math.round(t[1]*1e7)}`;function Mt(t){let e=new Map,n=[];for(let r of t){let s=J(r.B)+"|"+J(r.C),a=e.get(s);a?(e.delete(s),n.push({k:r.k,A:a.A,B:r.B,A2:r.A,C:r.C,half:!1})):e.set(s,r)}for(let r of e.values())n.push({k:r.k,A:r.A,B:r.B,A2:null,C:r.C,half:!0});return n}function At(t,e,n=1/0,r=14){let s=new Map,a=new Map;for(let d of t)if(!d.half)for(let c of[d.A,d.B,d.A2,d.C]){let h=J(c);s.set(h,c),a.set(h,(a.get(h)||0)+1)}let i=e*2,l=new Map;for(let d of s.values()){let c=`${Math.floor(d[0]/i)},${Math.floor(d[1]/i)}`;l.has(c)||l.set(c,[]),l.get(c).push(d)}let f=Math.cos(2*Math.PI/5),u=Math.sin(2*Math.PI/5),p=[];for(let[d,c]of s){if(a.get(d)!==5)continue;let h=(n-Math.hypot(c[0],c[1]))/e;if(h<1.5)continue;let v=Math.min(r,h),m=Math.floor(c[0]/i),g=Math.floor(c[1]/i),M=v,V=!0;for(let _ of[2.6,6,v]){let x=Math.min(_,v),A=Math.ceil(x*e/i),B=[];for(let R=-A;R<=A;R++)for(let y=-A;y<=A;y++){let $=l.get(`${m+R},${g+y}`);if($)for(let L of $){let P=Math.hypot(L[0]-c[0],L[1]-c[1])/e;P>1e-6&&P<=x&&B.push([P,L])}}B.sort((R,y)=>R[0]-y[0]);for(let[R,y]of B){let $=y[0]-c[0],L=y[1]-c[1];if(!s.has(J([c[0]+$*f-L*u,c[1]+$*u+L*f]))){M=R,V=!1;break}}if(!V||x>=v)break}if(M<1.5)continue;let Q=0;t:for(let _=-1;_<=1;_++)for(let x=-1;x<=1;x++)for(let A of l.get(`${m+_},${g+x}`)||[])if(Math.abs(Math.hypot(A[0]-c[0],A[1]-c[1])-e)<e*1e-6){Q=Math.atan2(A[1]-c[1],A[0]-c[0]);break t}p.push({p:c,R:M,open:V,angle:Q})}return p}var E=nt(j(),1);var H=(t,e)=>[t[0]-e[0],t[1]-e[1]],st=(t,e)=>t[0]*e[0]+t[1]*e[1],Ct=(t,e)=>t[0]*e[1]-t[1]*e[0],z=t=>Math.hypot(t[0],t[1]);function S(t,e,n){let r=H(e,t),s=z(r),a=Math.sign(Ct(r,H(n,t)))||1;return i=>a*Ct(r,H(i,t))/s}function Tt(t){let e=0,n=0;for(let h of t)e+=h.half?3:4,n+=h.half?3:6;let r=new Float32Array(e*3),s=new Float32Array(e*4),a=new Float32Array(e*4),i=new Float32Array(e*4),l=new Float32Array(e*2),f=new Float32Array(e*2),u=new Uint32Array(n),p=0,d=0;for(let h of t){let{A:v,B:m,C:g}=h,M=z(H(v,m)),V=(h.k===1?tt.xThick:tt.xThin)*M,Q=tt.y*M,_=h.half?[v,m,g]:[v,m,h.A2,g],x=h.half?[(v[0]+m[0]+g[0])/3,(v[1]+m[1]+g[1])/3]:[(m[0]+g[0])/2,(m[1]+g[1])/2],A=h.half?[S(v,m,x),S(m,g,x),S(g,v,x),()=>1e3]:[S(v,m,x),S(m,h.A2,x),S(h.A2,g,x),S(g,v,x)],B=h.k===1?H(g,m):H(v,x),R=[-B[1]/z(B),B[0]/z(B)],y=H(m,v),$=[-y[1]/z(y),y[0]/z(y)],L=S(m,g,v),P=H(g,m),Gt=[P[0]/z(P),P[1]/z(P)],I=p;for(let C of _)r.set([C[0],C[1],0],p*3),s.set(A.map(Vt=>Vt(C)),p*4),a.set([C[0]-m[0],C[1]-m[1],C[0]-g[0],C[1]-g[1]],p*4),i.set([h.k,V,Q,M],p*4),l.set([st(C,R)/M,st(C,$)/M],p*2),f.set([L(C)/M,st(H(C,m),Gt)/M],p*2),p++;h.half?(u.set([I,I+1,I+2],d),d+=3):(u.set([I,I+1,I+3,I+2,I+3,I+1],d),d+=6)}let c=new E.BufferGeometry;return c.setAttribute("position",new E.BufferAttribute(r,3)),c.setAttribute("aEdge",new E.BufferAttribute(s,4)),c.setAttribute("aArc",new E.BufferAttribute(a,4)),c.setAttribute("aInfo",new E.BufferAttribute(i,4)),c.setAttribute("aHatch",new E.BufferAttribute(l,2)),c.setAttribute("aCut",new E.BufferAttribute(f,2)),c.setIndex(new E.BufferAttribute(u,1)),c}function Rt(t,e){let n=t.length,r=new Float32Array(n*4*3),s=new Float32Array(n*4*2),a=new Float32Array(n*4*4),i=new Uint32Array(n*6);t.forEach((f,u)=>{let p=f.open?1.6*e:f.R*e,d=Math.max(p,1.4*e)+.3*e;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([c,h],v)=>{let m=u*4+v;r.set([f.p[0]+c*d,f.p[1]+h*d,0],m*3),s.set([c*d,h*d],m*2),a.set([f.open?0:f.R*e,e,f.angle||0,f.open?1:0],m*4)}),i.set([u*4,u*4+1,u*4+2,u*4,u*4+2,u*4+3],u*6)});let l=new E.BufferGeometry;return l.setAttribute("position",new E.BufferAttribute(r,3)),l.setAttribute("aLocal",new E.BufferAttribute(s,2)),l.setAttribute("aC",new E.BufferAttribute(a,4)),l.setIndex(new E.BufferAttribute(i,1)),l}var w=nt(j(),1);function It(){return{uLitho:{value:1},uPx:{value:.001},uDpr:{value:1},uPaper:{value:new w.Vector3(.925,.898,.835)},uInk:{value:new w.Vector3(.11,.1,.09)}}}var ee=`
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
// coverage of a band of half-width w around d = 0 (all in the same units), antialiased by aa
float band(float d, float w, float aa) {
  return 1.0 - smoothstep(w - aa, w + aa, d);
}
`,Ht=`
attribute vec4 aEdge;
attribute vec4 aArc;
attribute vec4 aInfo;
attribute vec2 aHatch;
attribute vec2 aCut;
varying vec4 vEdge;
varying vec4 vArc;
varying vec4 vInfo;
varying vec2 vHatch;
varying vec2 vCut;
void main() {
  vEdge = aEdge; vArc = aArc; vInfo = aInfo; vHatch = aHatch; vCut = aCut;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Bt=`
uniform float uLitho;
uniform float uPx;
uniform float uDpr;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec4 vEdge;
varying vec4 vArc;
varying vec4 vInfo;
varying vec2 vHatch;
varying vec2 vCut;
${ee}
`,ne=`
${Bt}
uniform float uAlpha;
void main() {
  float kind = vInfo.x;              // 1 thick, 0 thin
  float s = vInfo.w;
  float e = min(min(vEdge.x, vEdge.y), min(vEdge.z, vEdge.w)) / s;
  float g = vnoise(gl_FragCoord.xy * 0.55) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  float big = vnoise(vHatch * 3.1) - 0.5;   // slow mottling, fixed to the tile

  // ---- colour print
  vec3 thick = vec3(0.882, 0.792, 0.612);
  vec3 thin = vec3(0.447, 0.541, 0.608);
  vec3 col = mix(thin, thick, kind);
  col *= 0.93 + 0.1 * smoothstep(0.0, 0.28, e) + big * 0.05;
  col += g * 0.03 + gw * 0.025;

  // ---- lithograph: thick tiles stay pale, thin tiles are ruled
  float hp = 0.1;                    // hatch period, in edge lengths
  float a1 = vHatch.x / hp;
  float a2 = vHatch.y / (hp * 1.3);
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float f1 = fwidth(a1) * 1.5 + 0.02, f2 = fwidth(a2) * 1.5 + 0.02;
  float lod = smoothstep(0.45, 0.2, fwidth(a1));   // fade ruling when it gets too fine
  float c1 = mix(0.12, 0.5, 1.0 - kind);           // line coverage
  float c2 = mix(0.0, 0.16, 1.0 - kind);
  float h1 = (1.0 - smoothstep(c1 - f1, c1 + f1, d1)) * smoothstep(0.0, 0.05, c1);
  float h2 = (1.0 - smoothstep(c2 - f2, c2 + f2, d2)) * smoothstep(0.0, 0.05, c2);
  h1 = mix(c1, h1, lod);
  h2 = mix(c2, h2, lod);
  float v = mix(0.86, 0.97, kind);
  v -= h1 * mix(0.2, 0.62, 1.0 - kind) + h2 * 0.35;
  v -= (1.0 - smoothstep(0.0, 0.22, e)) * 0.05;   // a breath of tone along the edges
  v += g * 0.1 + gw * 0.07 + big * 0.04;
  v = clamp(v, 0.0, 1.0);
  vec3 litho = mix(uInk, uPaper, v);

  gl_FragColor = vec4(mix(col, litho, uLitho), uAlpha);
}
`,oe=`
${Bt}
uniform float uLine;     // outline opacity
uniform float uLineW;    // outline half-width, CSS px
uniform float uArc;      // arc opacity
uniform float uCut;      // Robinson cut opacity
uniform vec3 uSuper;     // outline colour (colour mode)
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
void main() {
  float s = vInfo.w;
  float px = uPx;
  float aa = px * 0.75;
  vec4 acc = vec4(0.0);
  vec3 ink = mix(vec3(0.16, 0.13, 0.11), uInk, uLitho);
  vec3 paper = uPaper;

  // dashed cut along the Robinson diagonal BC
  if (uCut > 0.001) {
    float dash = step(0.5, fract(vCut.y * 7.0 + 0.25));
    float c = band(abs(vCut.x) * s, 0.6 * px * uDpr, aa) * dash;
    vec3 cc = mix(vec3(0.62, 0.2, 0.15), vec3(0.636, 0.231, 0.165), uLitho);
    acc = over(acc, cc, c * uCut);
  }

  if (uArc > 0.001) {
    float dX = abs(length(vArc.xy) - vInfo.y);
    float dY = abs(length(vArc.zw) - vInfo.z);
    float wX = max(0.042 * s, 0.9 * px * uDpr);
    float wY = max(0.03 * s, 0.9 * px * uDpr);
    vec3 cX = mix(vec3(0.66, 0.2, 0.15), ink, uLitho);
    vec3 cY = mix(vec3(0.95, 0.92, 0.84), ink, uLitho);
    float y = band(dY, wY, aa);
    // colour: a pale cord edged in ink; litho: an ink cord with a paper core
    float core = band(dY, wY * 0.42, aa);
    acc = over(acc, mix(ink, cY, 1.0 - uLitho), y * uArc);
    acc = over(acc, mix(cY, paper, uLitho), core * uArc * mix(0.0, 1.0, uLitho));
    acc = over(acc, cY, band(dY, wY * 0.62, aa) * uArc * (1.0 - uLitho));
    acc = over(acc, cX, band(dX, wX, aa) * uArc);
  }

  float e = min(min(vEdge.x, vEdge.y), min(vEdge.z, vEdge.w));
  float w = uLineW * px * uDpr;
  float line = band(e, w, aa);
  acc = over(acc, mix(uSuper, uInk, uLitho), line * uLine);

  if (acc.a < 0.002) discard;
  gl_FragColor = acc;      // premultiplied
}
`;function Lt(t){return new w.ShaderMaterial({uniforms:{...t,uAlpha:{value:1}},vertexShader:Ht,fragmentShader:ne,transparent:!0,depthTest:!1,depthWrite:!1,side:w.DoubleSide})}function Pt(t){return new w.ShaderMaterial({uniforms:{...t,uLine:{value:1},uLineW:{value:.5},uArc:{value:1},uCut:{value:0},uSuper:{value:new w.Vector3(.18,.14,.12)}},vertexShader:Ht,fragmentShader:oe,transparent:!0,premultipliedAlpha:!0,depthTest:!1,depthWrite:!1,side:w.DoubleSide})}var ae=`
attribute vec2 aLocal;
attribute vec4 aC;
varying vec2 vL;
varying vec4 vC;
void main() {
  vL = aLocal; vC = aC;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,re=`
uniform float uAlpha;
uniform float uPx;
uniform float uDpr;
uniform float uLitho;
varying vec2 vL;
varying vec4 vC;
const float PI = 3.14159265;
// signed distance to a regular five-pointed star (after Inigo Quilez)
float sdStar5(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
void main() {
  float R = vC.x, s = vC.y, ang = vC.z;
  float px = uPx;
  float aa = px * 0.8;
  float d = length(vL);
  vec3 red = mix(vec3(0.70, 0.16, 0.12), vec3(0.636, 0.231, 0.165), uLitho);
  vec4 acc = vec4(0.0);
  if (R > 3.0 * s) {
    // a fine ring where the five-fold symmetry ends
    float w = 0.6 * px * uDpr;
    acc = over(acc, red, (1.0 - smoothstep(w - aa, w + aa, abs(d - R))) * 0.55);
  }
  // the star, pointing along the five edges that meet here; larger stars
  // mark symmetry that reaches further
  float size = vC.w > 0.5 ? 0.62 * s : clamp(0.12 * R, 0.24 * s, 0.62 * s);
  size = min(size, 15.0 * px * uDpr);
  vec2 q = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * vL;
  q = vec2(q.y, q.x);
  float st = sdStar5(q, size, 0.45);
  acc = over(acc, vec3(0.97, 0.94, 0.86), 1.0 - smoothstep(-aa, aa, st - 1.4 * px * uDpr));
  acc = over(acc, red, 1.0 - smoothstep(-aa, aa, st));
  acc *= uAlpha;
  if (acc.a < 0.002) discard;
  gl_FragColor = acc;
}
`;function St(t){return new w.ShaderMaterial({uniforms:{uAlpha:{value:1},uPx:t.uPx,uDpr:t.uDpr,uLitho:t.uLitho},vertexShader:ae,fragmentShader:re,transparent:!0,premultipliedAlpha:!0,depthTest:!1,depthWrite:!1,side:w.DoubleSide})}var ft=30/38,ie=Math.hypot(1,ft),se=Math.cos(Math.PI/10),D=8,ce=9,q=6,le=7.5,fe=.72,ue=-Math.PI/10,he=4.2,de=1.7,me=2.4,Yt=t=>le*Math.pow(W,-t),pe=t=>Math.min(1,Math.max(0,t)),T=(t,e,n)=>{let r=pe((n-t)/(e-t));return r*r*(3-2*r)},ct=(t,e,n)=>t+(e-t)*n,ve=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;function zt(t){return t<=D?1/0:Yt(Math.max(q,t-1.35))*ie+2.5*Math.pow(W,-t)}var X=[];{let t=kt();for(let e=0;e<=ce;e++){if(e>0){let a=zt(e);t=wt(t,Number.isFinite(a)?i=>{let l=(i.A[0]+i.B[0]+i.C[0])/3,f=(i.A[1]+i.B[1]+i.C[1])/3;return Math.hypot(l,f)<a}:null)}let n=Mt(t),r=n.filter(a=>!a.half),s=r.filter(a=>a.k===1).length;X.push({k:e,s:Math.pow(W,-e),list:n,genR:zt(e),thick:s,thin:r.length-s,fill:null,ink:null,centres:null,zoomCentres:null})}}var Y=document.getElementById("scene"),G=new b.WebGLRenderer({canvas:Y,antialias:!0}),_t=Math.min(window.devicePixelRatio||1,2);G.setPixelRatio(_t);var ut=new b.Color(15525333),$t=new b.Color(15328472);G.setClearColor(ut,1);var ht=new b.Scene,N=It();N.uDpr.value=_t;var F=new b.OrthographicCamera(-1,1,1,-1,-10,10);F.position.set(0,0,5);var et=ft;function ge(t){if(t.fill)return;let e=Tt(t.list);t.fill=new b.Mesh(e,Lt(N)),t.ink=new b.Mesh(e,Pt(N));for(let n of[t.fill,t.ink])n.frustumCulled=!1,n.visible=!1,ht.add(n)}function Wt(t,e){t.k<=D-1&&(e=!1);let n=e?"zoomCentres":"centres";if(t[n])return t[n];let r;if(e&&t.k>D-1){let a=Wt(X[t.k-2],!0).list,i=Math.cos(-Math.PI/5),l=Math.sin(-Math.PI/5),f=1/(W*W);r=a.map(u=>({...u,p:[(u.p[0]*i-u.p[1]*l)*f,(u.p[0]*l+u.p[1]*i)*f],angle:u.angle-Math.PI/5}))}else r=At(t.list,t.s,Number.isFinite(t.genR)?t.genR:se);let s=new b.Mesh(Rt(r,t.s),St(N));return s.frustumCulled=!1,s.visible=!1,s.renderOrder=300,ht.add(s),t[n]={list:r,mesh:s},t[n]}var o={playing:!0,litho:1,lithoTarget:1,mode:"zoom",m:0,z:q+.15,lam:6,target:6,dwell:0,dir:1,arcs:1,arcsT:1,marks:1,marksT:1};function xe(t,e){let n=(d,c)=>d+(c-d)*e,r=T(n(-.62,-.85),n(-.45,-.6),t),s=T(n(-.42,-.55),n(-.26,-.35),t),a=T(n(-.26,-.35),n(-.1,-.15),t),i=1-T(n(.42,.45),n(.58,.62),t),l=T(n(.45,.4),n(.7,.6),t),f=1-T(n(.8,.68),n(1.1,.95),t),u=s*(1-T(n(.58,.45),n(.74,.65),t)),p=e*T(.03,.2,t)*(1-T(.55,.8,t));return{line:r*f,lineW:.45+l*.85,fill:s,arc:a*i,mark:u,cut:p}}function Ee(){let t=ve(o.m),e=Yt(o.z),n=ue*(o.z-q),r=Math.exp(ct(Math.log(e),Math.log(fe),t)),s=ct(n,0,t),a=ct(o.z,o.lam,t);return{h:r,theta:s,lam:a,m:t}}function lt(){let t=Ee();F.left=-t.h*et,F.right=t.h*et,F.top=t.h,F.bottom=-t.h,F.rotation.z=t.theta,F.updateProjectionMatrix(),N.uPx.value=2*t.h/Math.max(1,Y.height);let e=t.h*Math.hypot(1,et),n=[];for(let a of X){let i=xe(t.lam-a.k,t.m),l=Number.isFinite(a.genR)?T(1,.92,e/a.genR):1;i.line*=l,i.fill*=l,i.arc*=l,i.cut*=l,i.mark*=l,n.push([a,i])}let r=0;n.forEach(([,a],i)=>{a.fill>.999&&(r=i)});let s=[];n.forEach(([a,i],l)=>{let f=l>=r&&i.fill>.001,u=(i.line>.002||i.arc*o.arcs>.002||i.cut>.002)&&l>=r-2;if(!f&&!u){a.fill&&(a.fill.visible=!1,a.ink.visible=!1);return}ge(a),a.fill.visible=f,a.fill.material.uniforms.uAlpha.value=l===r?1:i.fill,a.fill.renderOrder=10+a.k,a.ink.visible=u;let p=a.ink.material.uniforms;p.uLine.value=i.line,p.uLineW.value=i.lineW,p.uArc.value=i.arc*o.arcs,p.uCut.value=i.cut,a.ink.renderOrder=200-a.k,i.mark*o.marks>.002&&s.push([a,i.mark*o.marks])});for(let a of X)for(let i of["centres","zoomCentres"])a[i]&&(a[i].mesh.visible=!1);for(let[a,i]of s){let l=Wt(a,t.m<.5);l.mesh.visible=!0,l.mesh.material.uniforms.uAlpha.value=i}G.render(ht,F)}var Z=!0,ye=gt(ft,(t,e)=>{G.setSize(t,e),et=t/e,Z=!0});xt();var k=t=>document.getElementById(t),Ot=ot([[k("btn-litho"),1],[k("btn-colour"),0]],t=>{o.lithoTarget=t},1),dt=ot([[k("btn-zoom"),"zoom"],[k("btn-steps"),"steps"]],t=>{if(t!==o.mode){if(o.mode=t,t==="steps"){let e=Math.max(0,Math.min(D,Math.round(o.z)));o.lam=o.z,o.target=e,o.dwell=0,o.dir=e>=D?-1:1}else o.z=Math.min(q+1.999,Math.max(q,o.lam));document.body.classList.toggle("steps",t==="steps"),Z=!0,ye(),K()}},"zoom");function O(t){o.mode!=="steps"&&dt("steps"),o.target=Math.max(0,Math.min(D,Math.round(o.target)+t)),o.dir=t>0?1:-1,o.dwell=0,K()}k("btn-finer").addEventListener("click",()=>O(1));k("btn-coarser").addEventListener("click",()=>O(-1));function qt(t,e){let n=o[e+"T"]<.5;o[e+"T"]=n?1:0,t.setAttribute("aria-pressed",String(n))}k("btn-arcs").addEventListener("click",()=>qt(k("btn-arcs"),"arcs"));k("btn-marks").addEventListener("click",()=>qt(k("btn-marks"),"marks"));var be=yt(t=>{o.playing=t});Et({" ":()=>be(!o.playing),l:()=>Ot(o.lithoTarget?0:1),z:()=>dt(o.mode==="zoom"?"steps":"zoom"),"[":()=>O(-1),"]":()=>O(1),ArrowLeft:()=>O(-1),ArrowRight:()=>O(1),a:()=>k("btn-arcs").click(),c:()=>k("btn-marks").click()});function Ft(t){return t.toLocaleString("en-GB")}function K(){if(o.mode!=="steps"){at(!1);return}let t=Math.round(o.target),e=X[t];k("level").textContent=String(t);let n=t===0?"Level 0 \xB7 the seed: ten half-rhombs round a point":`Level ${t} \xB7 ${Ft(e.thick)} thick, ${Ft(e.thin)} thin \xB7 ratio ${(e.thick/e.thin).toFixed(3)}`;at(!0,n)}var U=null;Y.addEventListener("pointerdown",t=>{Y.setPointerCapture(t.pointerId),U={y:t.clientY,x:t.clientX}});Y.addEventListener("pointermove",t=>{if(!U||o.mode!=="zoom")return;let e=t.clientY-U.y;U={y:t.clientY,x:t.clientX},mt(-e/160)});var Nt=()=>{U=null};Y.addEventListener("pointerup",Nt);Y.addEventListener("pointercancel",Nt);Y.addEventListener("wheel",t=>{o.mode==="zoom"&&(t.preventDefault(),mt(-t.deltaY*.0022))},{passive:!1});function mt(t){for(Z=!0,o.z+=t;o.z>=q+2;)o.z-=2;for(;o.z<q;)o.z+=2}var Dt=performance.now();function Xt(t){let e=Math.min(.05,Math.max(0,(t-Dt)/1e3));Dt=t;let n=o.mode==="steps"?1:0;if(o.m+=Math.sign(n-o.m)*Math.min(Math.abs(n-o.m),e/1.1),o.mode==="zoom")o.playing&&mt(e/he);else{let a=o.target-o.lam;Math.abs(a)>1e-4?o.lam+=Math.sign(a)*Math.min(Math.abs(a),e/de):o.playing&&o.m>.99&&(o.dwell+=e,o.dwell>me*(o.target===0||o.target===D?1.6:1)&&(o.target>=D&&(o.dir=-1),o.target<=0&&(o.dir=1),o.target+=o.dir,o.dwell=0,K()))}let r=(a,i)=>{o[a]+=Math.sign(o[a+"T"]-o[a])*Math.min(Math.abs(o[a+"T"]-o[a]),e*i)};if(r("arcs",3),r("marks",3),o.litho!==o.lithoTarget){let a=o.lithoTarget-o.litho;o.litho+=Math.sign(a)*Math.min(Math.abs(a),e*2.2),N.uLitho.value=o.litho,G.setClearColor($t.clone().lerp(ut,o.litho),1)}(!(!o.playing&&Math.abs(o.target-o.lam)<1e-4&&(o.m===0||o.m===1)&&o.arcs===o.arcsT&&o.marks===o.marksT&&o.litho===o.lithoTarget)||Z)&&(lt(),Z=!1),requestAnimationFrame(Xt)}K();bt();requestAnimationFrame(Xt);window.__page={state:o,levels:X,setMode:dt,setLitho:Ot,step:O,render:lt,set(t){Object.assign(o,t),"litho"in t&&(N.uLitho.value=t.litho,G.setClearColor($t.clone().lerp(ut,t.litho),1)),K(),lt()}};})();
