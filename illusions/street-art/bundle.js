(()=>{var U0=Object.create;var n0=Object.defineProperty;var Y0=Object.getOwnPropertyDescriptor;var j0=Object.getOwnPropertyNames;var X0=Object.getPrototypeOf,$0=Object.prototype.hasOwnProperty;var K0=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var Z0=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of j0(e))!$0.call(t,a)&&a!==o&&n0(t,a,{get:()=>e[a],enumerable:!(n=Y0(e,a))||n.enumerable});return t};var st=(t,e,o)=>(o=t!=null?U0(X0(t)):{},Z0(e||!t||!t.__esModule?n0(o,"default",{value:t,enumerable:!0}):o,t));var J=K0((He,a0)=>{a0.exports=window.THREE});var d=st(J(),1);var I=st(J(),1),Q0=1e3,y={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function J0(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function w(t,e=y.PLAIN,o={}){return{c:typeof t=="number"?J0(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var s0=["px","nx","py","ny","pz","nz"];function $(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function Vt(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function vt(t){return Math.hypot(t[0],t[1],t[2])}function j(t){let e=vt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function Ot(t,e){let o=Math.abs(e[0]),n=Math.abs(e[1]),a=Math.abs(e[2]);return o>=n&&o>=a?[t[2],t[1]]:a>=n?[t[0],t[1]]:[t[0],t[2]]}var rt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new I.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new I.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,n=e[0],a=e[1],i=e[2];return[o[0]*n+o[4]*a+o[8]*i+o[12],o[1]*n+o[5]*a+o[9]*i+o[13],o[2]*n+o[6]*a+o[10]*i+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,n=e[0],a=e[1],i=e[2];return j([o[0]*n+o[3]*a+o[6]*i,o[1]*n+o[4]*a+o[7]*i,o[2]*n+o[5]*a+o[8]*i])}tri(e,o,n,a,i=[1,1,1],c={}){let r=this._tp(e),s=this._tp(o),l=this._tp(n),u=j(Vt($(o,e),$(n,e))),f=c.uv||[Ot(e,u),Ot(o,u),Ot(n,u)],h=j(Vt($(s,r),$(l,r))),p=c.n?c.n.map(M=>this._tn(M)):[h,h,h],v=vt(Vt($(s,r),$(l,r))),x=[v/(vt($(l,s))||1),v/(vt($(r,l))||1),v/(vt($(s,r))||1)],m=c.k||[1,1,1],T=a.s||0,E=[r,s,l];for(let M=0;M<3;M++){let L=E[M];this.pos.push(L[0]+T,L[1]+T,L[2]+T),this.nrm.push(p[M][0],p[M][1],p[M][2]),this.col.push(a.c[0]*m[M],a.c[1]*m[M],a.c[2]*m[M]),this.uv.push(f[M][0],f[M][1]);for(let A=0;A<3;A++)i[A]?this.edg.push(M===A?x[A]:0):this.edg.push(Q0);this.mat.push(a.p,a.f,a.w)}}quad(e,o,n,a,i,c=[1,1,1,1],r={}){let s=r.k||[1,1,1,1],l=r.n,u=r.uv;this.tri(e,o,n,i,[c[1],0,c[0]],{k:[s[0],s[1],s[2]],n:l&&[l[0],l[1],l[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(e,n,a,i,[c[2],c[3],0],{k:[s[0],s[2],s[3]],n:l&&[l[0],l[2],l[3]],uv:u&&[u[0],u[2],u[3]]})}box(e,o,n,a,i,c,r,s={}){e>a&&([e,a]=[a,e]),o>i&&([o,i]=[i,o]),n>c&&([n,c]=[c,n]);let l=new Set(s.open||[]),u=new Set(s.skip||[]);s.bottom||u.add("ny");let f=s.ao??1,h=s.aoTop??1,p={px:[0,a],nx:[0,e],py:[1,i],ny:[1,o],pz:[2,c],nz:[2,n]},v={px:[[a,o,c],[a,o,n],[a,i,n],[a,i,c]],nx:[[e,o,n],[e,o,c],[e,i,c],[e,i,n]],pz:[[e,o,c],[a,o,c],[a,i,c],[e,i,c]],nz:[[a,o,n],[e,o,n],[e,i,n],[a,i,n]],py:[[e,i,c],[a,i,c],[a,i,n],[e,i,n]],ny:[[e,o,n],[a,o,n],[a,o,c],[e,o,c]]};for(let x of s0){if(u.has(x)||l.has(x))continue;let m=v[x],T=[];for(let L=0;L<4;L++){let A=m[L],N=m[(L+1)%4],D=1;for(let Y of s0){if(Y===x)continue;let[X,at]=p[Y];Math.abs(A[X]-at)<1e-9&&Math.abs(N[X]-at)<1e-9&&l.has(Y)&&(D=0)}T.push(D)}let E;x==="py"||x==="ny"?E=[h,h,h,h]:E=[f,f,1,1];let M=x==="py"&&s.top?{...s.top,s:r.s}:r;this.quad(m[0],m[1],m[2],m[3],M,T,{k:E})}}cyl(e,o,n,a,i,c,r,s={}){let l=s.caps??[!0,!0],u=s.rim??[1,1],f=s.r1??a;for(let h=0;h<c;h++){let p=h/c*Math.PI*2,v=(h+1)/c*Math.PI*2,x=Math.cos(p),m=Math.sin(p),T=Math.cos(v),E=Math.sin(v),M=[e+a*x,o,n+a*m],L=[e+f*x,i,n+f*m],A=[e+f*T,i,n+f*E],N=[e+a*T,o,n+a*E],D=(a-f)/Math.max(1e-6,i-o),Y=j([x,D,m]),X=j([T,D,E]),at=p*(a+f)/2,bt=v*(a+f)/2;this.quad(M,L,A,N,r,[0,u[1],0,u[0]],{n:[Y,Y,X,X],uv:[[at,o],[at,i],[bt,i],[bt,o]],k:s.k}),l[1]&&f>0&&this.tri([e,i,n],A,L,r,[1,0,0]),l[0]&&this.tri([e,o,n],M,N,r,[1,0,0])}}lathe(e,o,n,a,i,c,r={}){let s=a.length,l=[];for(let h=0;h<s-1;h++){let p=a[h+1][0]-a[h][0],v=a[h+1][1]-a[h][1];l.push(j([v,-p,0]))}let u=a.map((h,p)=>{let v=l[Math.max(0,p-1)],x=l[Math.min(s-2,p)];return j([v[0]+x[0],v[1]+x[1],0])}),f=r.edges||[];for(let h=0;h<i;h++){let p=h/i*Math.PI*2,v=(h+1)/i*Math.PI*2,x=Math.cos(p),m=Math.sin(p),T=Math.cos(v),E=Math.sin(v);for(let M=0;M<s-1;M++){let[L,A]=a[M],[N,D]=a[M+1],Y=[e+L*x,o+A,n+L*m],X=[e+N*x,o+D,n+N*m],at=[e+N*T,o+D,n+N*E],bt=[e+L*T,o+A,n+L*E],ct=r.flat?l[M]:u[M],lt=r.flat?l[M]:u[M+1];this.quad(Y,X,at,bt,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[ct[0]*x,ct[1],ct[0]*m],[lt[0]*x,lt[1],lt[0]*m],[lt[0]*T,lt[1],lt[0]*E],[ct[0]*T,ct[1],ct[0]*E]],uv:[[p*1.2,A],[p*1.2,D],[v*1.2,D],[v*1.2,A]]})}}}poly(e,o,n={}){for(let a=1;a<e.length-1;a++)this.tri(e[0],e[a],e[a+1],o,[1,a===e.length-2?1:0,a===1?1:0],n)}blob(e,o,n,a,i,c,r,s={}){let l=s.sub??1,u=s.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<l;v++){let x=[];for(let[m,T,E]of f){let M=j([(m[0]+T[0])/2,(m[1]+T[1])/2,(m[2]+T[2])/2]),L=j([(T[0]+E[0])/2,(T[1]+E[1])/2,(T[2]+E[2])/2]),A=j([(E[0]+m[0])/2,(E[1]+m[1])/2,(E[2]+m[2])/2]);x.push([m,M,A],[M,T,L],[A,L,E],[M,L,A])}f=x}let h=v=>1+(s.lump??.12)*Math.sin(v[0]*5.1+u)*Math.sin(v[1]*4.3+u*1.7)*Math.sin(v[2]*3.7+u*.3),p=v=>{let x=h(v);return[e+v[0]*a*x,o+v[1]*i*x,n+v[2]*c*x]};for(let[v,x,m]of f)this.tri(p(v),p(x),p(m),r,[0,0,0],{n:[v,x,m],k:s.k})}build(){let e=new I.BufferGeometry;return e.setAttribute("position",new I.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new I.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new I.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new I.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new I.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new I.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},R={T:(t,e,o)=>new I.Matrix4().makeTranslation(t,e,o),RX:t=>new I.Matrix4().makeRotationX(t),RY:t=>new I.Matrix4().makeRotationY(t),RZ:t=>new I.Matrix4().makeRotationZ(t),S:(t,e,o)=>new I.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new I.Matrix4)};function r0(t,e){let o=document.getElementById("frame"),n=()=>{let i=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),r=document.getElementById("controls"),s=(c?c.offsetHeight:0)+6+13,l=(r?r.offsetHeight:0)+8+13,u=window.innerWidth-i*2,f=window.innerHeight-s-l,h=f,p=h*t;p>u&&(p=u,h=p/t),p=Math.max(160,Math.floor(p)),h=Math.max(120,Math.floor(h)),o.style.width=`${p}px`,o.style.height=`${h}px`,o.style.top=`${s+Math.max(0,(f-h)/2)}px`,e?.(p,h)};return window.addEventListener("resize",n),n(),n}function i0(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let n=a=>{a?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(a))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function c0(t,e,o){let n=a=>{for(let[i,c]of t)i.setAttribute("aria-pressed",String(c===a));e(a)};for(let[a,i]of t)a.addEventListener("click",()=>n(i));return o!==void 0&&n(o),n}function l0(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function h0(t,e=!0){let o=document.getElementById("btn-play"),n=a=>{e=a,o&&(o.setAttribute("aria-pressed",String(!a)),o.querySelector("span").textContent=a?"Pause":"Play",o.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),t(a)};return o?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function Lt(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function u0(){document.body.classList.add("ready")}var S=st(J(),1);function f0(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new S.Vector3(.28,.9,.62).normalize()},uPaper:{value:new S.Vector3(.925,.898,.835)},uInk:{value:new S.Vector3(.11,.1,.09)},uHaze:{value:new S.Vector3(.83,.86,.84)},uFade:{value:1},uHatchPx:{value:7}}}var Wt=`
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
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
float lineMask(float d, float w) {
  float px = max(fwidth(d), 1e-5);
  float ww = max(w, px * 0.55);
  return (1.0 - smoothstep(ww - px * 0.5, ww + px * 0.5, d)) * min(1.0, w / (px * 0.55) + 0.35);
}
float lod(float period, float fw) {
  return smoothstep(2.5, 6.0, period / max(fw, 1e-5));
}
`,Bt=`
uniform float uHatchPx;
// a set of parallel lines covering a fraction c of their period
float hatchSet(float a, float c) {
  float d = abs(fract(a) - 0.5) * 2.0;
  float aa = fwidth(a) * 1.5 + 0.02;
  return smoothstep(1.0 - c - aa, 1.0 - c + aa, d) * smoothstep(0.0, 0.08, c);
}
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);

  float L = dot(col, vec3(0.30, 0.59, 0.11));
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float want = max(hfw * uHatchPx, 1e-5);
  float lv = log2(want / 0.01);
  float l0 = floor(lv), fr = lv - l0;
  float hpA = 0.01 * exp2(l0), hpB = hpA * 2.0;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  vec2 q = huv;
  float h1 = mix(hatchSet((q.x + q.y) / hpA, c1), hatchSet((q.x + q.y) / hpB, c1), fr);
  float h2 = mix(hatchSet((q.x - q.y) / hpA + face * 0.37, c2), hatchSet((q.x - q.y) / hpB + face * 0.37, c2), fr);
  float v = 0.16 + 0.86 * t;
  v -= h1 * 0.34 + h2 * 0.3;
  v += g * 0.12 + gw * 0.07;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`,te=`
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ee=`
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uDim;
#ifdef VIRTUAL
uniform vec2 uHole[NHOLE];
uniform float uWater;
uniform vec4 uHall;
#endif
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${Wt}
${Bt}

#ifdef VIRTUAL
bool inHole(vec2 p) {
  bool c = false;
  for (int i = 0, j = NHOLE - 1; i < NHOLE; j = i++) {
    vec2 a = uHole[i], b = uHole[j];
    if (((a.y > p.y) != (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)) c = !c;
  }
  return c;
}
#endif

void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  vec3 W = vW;
#ifdef VIRTUAL
  // the mirrored world below the water is lit as its original above it
  if (W.y < uWater) { W.y = 2.0 * uWater - W.y; n.y = -n.y; diff = max(dot(n, uLight), 0.0); }
  // sunlight reaches below the pavement only through the hole
  if (W.y < -0.02) {
    vec3 hit = W + uLight * (-W.y / uLight.y);
    if (!inHole(hit.xz)) diff *= 0.0;
  }
#endif
  float shade = 0.5 + 0.55 * diff;
#ifdef VIRTUAL
  // light bounced off the sunlit walls and water fills the shadows in the shaft
  shade = 0.5 + 0.55 * diff;
#endif
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {
    float rh = 0.24, bl = 0.52;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.84 + 0.28 * h, l);
    lines = lineMask(d, 0.016) * l * 0.8;
  } else if (pat == 2.0) {
    float rh = 0.42, bl = 0.95;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.86 + 0.2 * h, l) * (0.95 + 0.1 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.016) * l * 0.7;
  } else if (pat == 3.0) {
    float rh = 0.3, bw = 0.36;
    float row = floor(uv.y / rh);
    float x = uv.x / bw + 0.5 * mod(row, 2.0);
    float fx = fract(x) - 0.5;
    float fy = fract(uv.y / rh);
    float scallop = 0.18 * (1.0 - 4.0 * fx * fx);
    float yy = fy - scallop;
    float l = lod(rh, fw);
    tex = mix(1.0, 0.62 + 0.5 * smoothstep(0.0, 1.0, fract(yy)) + 0.08 * hash12(vec2(floor(x), row)), l);
    float dl = min(abs(fract(yy)) * rh, (1.0 - fract(yy)) * rh);
    float dv = abs(fx) > 0.47 ? 0.0 : 1.0;
    lines = max(lineMask(dl, 0.015), (1.0 - dv) * 0.6) * l;
  } else if (pat == 4.0) {
    float ph = 0.16;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 2.5, uv.y * 40.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.01) * l * 0.7;
  } else if (pat == 5.0) {
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 7.0) {
    vec2 g = uv / 0.2;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(0.2, fw);
    tex = mix(1.0, 0.86 + 0.24 * hash12(cell), l);
    lines = smoothstep(0.38, 0.49, r) * l * 0.7;
  } else if (pat == 8.0) {
    tex = 0.97 + 0.04 * sin(uv.x * 40.0);
  } else if (pat == 10.0) {
    float rh = 0.26, bl = 0.48;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.8 + 0.3 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.02) * l * 0.75;
  } else if (pat == 11.0) {
    tex = 0.75 + 0.35 * smoothstep(0.2, 0.9, fract((uv.x + uv.y) * 0.8));
  } else if (pat == 12.0) {
    tex = 0.78 + 0.3 * fbm(uv * 6.0) + 0.12 * (hash12(floor(uv * 30.0)) - 0.5);
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);
  float haze = vM.y;
#ifdef VIRTUAL
  // deeper is darker; the vaulted hall beyond the far wall fades to black
  float depth = clamp(-W.y / 3.6, 0.0, 1.0);
  col *= mix(1.0, 0.76, depth);
  float hall = max(0.0, dot(W, uHall.xyz) - uHall.w);
  col *= exp(-hall * 1.1);
#endif
  col *= uDim;

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - haze * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, haze, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;function kt(t,e={}){let o={...t,uDim:{value:e.dim??1}},n={};return e.virtual&&(n.VIRTUAL=1,n.NHOLE=e.hole.length,o.uHole={value:e.hole.map(a=>new S.Vector2(a[0],a[1]))},o.uWater={value:e.water},o.uHall={value:new S.Vector4(...e.hall.n,e.hall.d)}),new S.ShaderMaterial({uniforms:o,defines:n,vertexShader:te,fragmentShader:ee,transparent:!!e.transparent,depthWrite:e.depthWrite??!0,side:e.side??S.FrontSide})}var zt=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,oe=`
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec2 uRings[4];
uniform vec4 uHall;
varying vec3 vW;
${Wt}
${Bt}
void main() {
  vec2 p = vW.xz;
  // rings spreading from the column and the drowned steps
  float ring = 0.0;
  for (int i = 0; i < 4; i++) {
    float r = length(p - uRings[i]);
    float w = sin(r * 9.0 - fbm(p * 1.3) * 3.0) * 0.5 + 0.5;
    ring += smoothstep(0.82, 0.98, w) * exp(-r * 0.75);
  }
  float n = fbm(vec2(p.x * 1.4, p.y * 0.55));
  float streak = smoothstep(0.55, 0.75, fbm(vec2(p.x * 0.8 + n, p.y * 3.0)));
  vec3 deep = vec3(0.13, 0.21, 0.23);
  vec3 col = deep * (0.8 + 0.4 * n);
  col = mix(col, vec3(0.62, 0.72, 0.72), clamp(ring * 0.55 + streak * 0.12, 0.0, 0.8));
  float hall = max(0.0, dot(vW, uHall.xyz) - uHall.w);
  col *= exp(-hall * 1.1);
  vec3 outc = finish(col, 0.0, 0.0, p * 1.5, fwidth(p.x * 1.5), 0.0);
  gl_FragColor = vec4(outc, 0.62 + 0.25 * ring);
}
`;function d0(t,e,o){return new S.ShaderMaterial({uniforms:{...t,uRings:{value:e.map(n=>new S.Vector2(n[0],n[1]))},uHall:{value:new S.Vector4(...o.n,o.d)}},vertexShader:zt,fragmentShader:oe,transparent:!0,depthWrite:!1})}var ne=`
uniform vec3 uLight;
uniform vec3 uCol;      // column: x, z, radius
uniform float uColTop;
uniform float uLitho;
uniform vec3 uInk;
varying vec3 vW;
void main() {
  vec2 p = vW.xz;
  // follow the sun ray up from p: at height h it is above p + L*h.
  // Shadow if that segment (h in 0..top) passes within the column's radius.
  vec2 L = uLight.xz / uLight.y;
  vec2 c = uCol.xy;
  float h = clamp(dot(c - p, L) / max(dot(L, L), 1e-6), 0.0, uColTop);
  float dist = length(p + L * h - c);
  float sh = 1.0 - smoothstep(uCol.z - 0.03, uCol.z + 0.05, dist);
  vec3 tone = mix(vec3(0.18, 0.2, 0.24), uInk, uLitho);
  gl_FragColor = vec4(tone, sh * 0.42);
}
`;function p0(t,e){return new S.ShaderMaterial({uniforms:{uLight:t.uLight,uLitho:t.uLitho,uInk:t.uInk,uCol:{value:new S.Vector3(e.x,e.z,e.r)},uColTop:{value:e.top}},vertexShader:zt,fragmentShader:ne,blending:S.NoBlending})}var ae=zt,se=`
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform sampler2D uDrawing;
uniform sampler2D uDrawingC;
uniform mat4 uEyeVP;
uniform float uShow;
uniform float uChalk;
varying vec3 vW;
${Wt}
${Bt}

// flagstones: rows along x, 0.6 m deep, 0.8 or 1.05 m long
vec4 flags(vec2 p, out float joint) {
  float rowH = 0.6;
  float row = floor(p.y / rowH);
  float off = hash12(vec2(row, 3.7)) * 2.0;
  float len = 0.8 + 0.25 * step(0.5, hash12(vec2(row, 9.1)));
  float x = (p.x + off) / len;
  float cell = floor(x);
  float fx = fract(x) * len;
  float fy = fract(p.y / rowH) * rowH;
  float d = min(min(fx, len - fx), min(fy, rowH - fy));
  joint = d;
  float h = hash12(vec2(cell, row));
  return vec4(h, cell, row, d);
}

void main() {
  vec2 p = vW.xz;
  float fw = max(fwidth(p.x), fwidth(p.y));
  float jd;
  vec4 f = flags(p, jd);
  float l = lod(0.6, fw);
  float jl = lineMask(jd, 0.005) * l;
  vec3 stone = mix(vec3(0.74, 0.71, 0.66), vec3(0.84, 0.81, 0.75), f.x);
  stone *= 0.93 + 0.12 * fbm(p * 1.7 + f.yz * 3.1);
  stone *= 0.97 + 0.06 * vnoise(p * 23.0) * lod(0.04, fw);
  float diff = max(uLight.y, 0.0);
  vec3 col = stone * (0.36 + 0.66 * diff);
  col *= 1.0 - 0.38 * jl;
  vec3 pave = finish(col, 0.0, 0.0, p * 1.6, fw * 1.6, 0.0);

  // ---- the chalk drawing
  vec4 c = uEyeVP * vec4(vW, 1.0);
  vec3 outc = pave;
  if (c.w > 0.0) {
    vec2 uv = c.xy / c.w * 0.5 + 0.5;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
      vec4 d = mix(texture2D(uDrawingC, uv), texture2D(uDrawing, uv), uLitho);
      float a = d.a * uShow;
      // chalk lies on the stone: a little grain, and the joints show through
      float grain = hash12(floor(p * 220.0)) * lod(1.0 / 220.0, fw);
      float tooth = 0.9 + 0.1 * vnoise(p * 60.0) * lod(1.0 / 60.0, fw);
      vec3 chalk = d.rgb * tooth + (grain - 0.5) * 0.05;
      chalk = mix(chalk, chalk * 0.72, jl * uChalk);
      outc = mix(pave, chalk, clamp(a, 0.0, 1.0));
    }
  }
  gl_FragColor = vec4(outc, 1.0);
}
`;function m0(t,e,o){return new S.ShaderMaterial({uniforms:{...t,uDrawing:{value:e},uDrawingC:{value:o},uEyeVP:{value:new S.Matrix4},uShow:{value:1},uChalk:{value:.55}},vertexShader:ae,fragmentShader:se})}var B=st(J(),1);var C=new B.Vector3(0,1.65,6.65),H=1.6,_=4.05,P=-3.45,tt=-.45,k=-2.7,b={x:-.1,z:-1.3,r:.3,top:.82},ut={rise:.18,run1:.26,n1:7,run2:.32,n2:5,w1:1,w2:1,landing:1.2},K={x:.82,r:.5,spring:k+.04,depth:2.4},ft=P+ut.w1,qt={n:[0,0,-1],d:-ft};function g0(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let o=e;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}}function w0(){let t=g0(7),e=[],o=[[-H,_],[H,_],[H,P],[-H,P]];for(let n=0;n<4;n++){let a=o[n],i=o[(n+1)%4],c=Math.hypot(i[0]-a[0],i[1]-a[1]),r=[-(i[1]-a[1])/c,(i[0]-a[0])/c],s=[(i[0]-a[0])/c,(i[1]-a[1])/c],l=.1+t()*.22;e.push([a[0]+(r[0]-s[0])*l*.7+r[0]*.05,a[1]+(r[1]-s[1])*l*.7+r[1]*.05]);let u=.25+t()*.3;for(;u<c-.3;){let f=.04+Math.pow(t(),1.6)*.34;e.push([a[0]+s[0]*u+r[0]*f,a[1]+s[1]*u+r[1]*f]),u+=.22+t()*.42}}return e}function Nt(t,e,o,n,a,i,c=[1,1,1,1]){t.quad([e[0],n,e[1]],[o[0],n,o[1]],[o[0],a,o[1]],[e[0],a,e[1]],i,c)}var Dt=w(13222580,y.PLAIN),Ae=w(10787464,y.PLAIN),re=w(9075298,y.SOIL),x0=w(8220765,y.SOIL),E0=w(10985360,y.ASHLAR),gt=w(9406587,y.ASHLAR),Ft=w(12235426,y.PLAIN),ht=w(10524810,y.STONE),v0=w(13814717,y.PLAIN),ie=w(11906462,y.SOIL),Se=w(8288108,y.BRICK);function M0(t,e){for(let s=0;s<e.length;s++){let l=e[s],u=e[(s+1)%e.length];Nt(t,u,l,-.14,0,Dt),Nt(t,u,l,tt,-.14,re,[1,0,1,0])}{let s=e.map(h=>new B.Vector2(h[0],h[1])),l=[[-H,_],[-H,P],[H,P],[H,_]].map(h=>new B.Vector2(h[0],h[1])),u=B.ShapeUtils.triangulateShape(s,[l]),f=s.concat(l);for(let[h,p,v]of u){let x=[f[h].x,tt,f[h].y],m=[f[p].x,tt,f[p].y],T=[f[v].x,tt,f[v].y];(m[2]-x[2])*(T[0]-x[0])-(m[0]-x[0])*(T[2]-x[2])<0&&([m,T]=[T,m]),t.tri(x,m,T,x0,[0,0,0])}for(let h=0;h<4;h++){let p=l[h],v=l[(h+1)%4];Nt(t,[p.x,p.y],[v.x,v.y],tt-.06,tt,x0,[1,0,1,0])}}let o=tt-.06;t.box(-H-.7,k,P-.7,-H,o,_+.7,E0,{skip:["py"]}),t.box(-H-.7,k,P-.7,H+.7,o,P,E0,{skip:["py"]}),t.box(-H-.7,k,_,H+.7,o,_+.7,gt,{skip:["py"]}),t.box(H,k,P-.7,H+.7,o,_+.7,gt,{skip:["py"]});let n=ut,a=s=>s%2?ht:w(10130052,y.STONE),i=H-n.run1*n.n1,c=K.spring+K.r+.22;for(let s=1;s<=n.n1;s++){let l=H-n.run1*s,u=H-n.run1*(s-1),f=o-n.rise*s;t.box(l,c,P,u+.001,f,P+n.w1,a(s),{skip:["nz","px","ny"],top:Ft})}{let{x:s,r:l,spring:u,depth:f}=K,h=ft;t.box(i,k,P,s-l,c,h,ht,{skip:["nz","py","nx"]}),t.box(s+l,k,P,H,c,h,ht,{skip:["nz","py","px"]});let p=10,v=x=>[s+Math.cos(x)*l,u+Math.sin(x)*l];for(let x=0;x<p;x++){let m=Math.PI*x/p,T=Math.PI*(x+1)/p,E=v(m),M=v(T);t.quad([E[0],E[1],h],[E[0],c,h],[M[0],c,h],[M[0],M[1],h],ht,[0,0,0,1]),t.quad([M[0],M[1],h],[M[0],M[1],h-f],[E[0],E[1],h-f],[E[0],E[1],h],gt,[0,0,0,1]);let L=.5;t.quad([E[0],E[1],h+.02],[E[0]+(E[0]-s)*L,E[1]+(E[1]-u)*L,h+.02],[M[0]+(M[0]-s)*L,M[1]+(M[1]-u)*L,h+.02],[M[0],M[1],h+.02],ht)}t.quad([s-l,k,h-f],[s-l,u,h-f],[s-l,u,h],[s-l,k,h],gt,[0,0,0,0]),t.quad([s+l,k,h],[s+l,u,h],[s+l,u,h-f],[s+l,k,h-f],gt,[0,0,0,0]),t.quad([s+l,k,h-f],[s+l,u+l,h-f],[s-l,u+l,h-f],[s-l,k,h-f],w(2762790),[0,0,0,0])}let r=o-n.rise*(n.n1+1);t.box(-H,k,P,i+.001,r,P+n.landing,ht,{skip:["nz","nx"],top:Ft});for(let s=1;s<=n.n2;s++){let l=P+n.landing+n.run2*(s-1)-.001,u=P+n.landing+n.run2*s,f=r-n.rise*s;t.box(-H,k,l,-H+n.w2,f,u,a(s),{skip:["nx","nz"],top:Ft})}t.push(new B.Matrix4().makeRotationY(.4).setPosition(-1,r+.07,P+.6)),t.box(-.3,-.07,-.22,.3,.07,.22,Dt),t.pop(),t.push(new B.Matrix4().makeRotationY(-.7).multiply(new B.Matrix4().makeRotationZ(.3)).setPosition(-1.12,r-n.rise*3+.12,P+n.landing+n.run2*2.6)),t.box(-.22,-.06,-.18,.22,.06,.18,Dt),t.pop(),ce(t)}function ce(t){let{x:e,z:o,r:n,top:a}=b,i=28,c=[k,-1.9,-1.05,-.2,.45],r=g0(31),s=[];for(let l=0;l<i;l++){let u=l/i*Math.PI*2;s.push(a-.12+.2*(.5+.5*Math.sin(u*2+.6))+(r()-.5)*.12)}t.box(e-n*1.35,k-.2,o-n*1.35,e+n*1.35,k+.18,o+n*1.35,w(11643288,y.ASHLAR)),t.cyl(e,k+.18,o,n*1.18,k+.3,i,v0,{r1:n*1.04,caps:[!1,!1]});for(let l=0;l<c.length;l++){let u=l===0?k+.3:c[l],f=l===c.length-1;for(let h=0;h<i;h++){let p=h/i*Math.PI*2,v=(h+1)/i*Math.PI*2,x=Math.cos(p),m=Math.sin(p),T=Math.cos(v),E=Math.sin(v),M=(p+v)/2,L=u,A=f?s[h]:c[l+1],N=f?s[(h+1)%i]:c[l+1],D=[Math.cos(M-.25),0,Math.sin(M-.25)],Y=[Math.cos(M+.25),0,Math.sin(M+.25)],X=v0;t.quad([e+n*x,L,o+n*m],[e+n*x,A,o+n*m],[e+n*T,N,o+n*E],[e+n*T,L,o+n*E],X,[0,1,0,1],{n:[D,D,Y,Y],uv:[[p*n,L],[p*n,A],[v*n,N],[v*n,L]]}),f&&t.tri([e,a-.08,o],[e+n*T,N,o+n*E],[e+n*x,A,o+n*m],ie,[0,0,0])}}}function y0(){let t=ut,o=tt-.06-t.rise*(t.n1+1),n=H-t.run1*t.n1;return[new B.Vector3(b.x,b.top+.02,b.z),new B.Vector3(n,o,P+t.landing),new B.Vector3(K.x,K.spring+K.r,ft),new B.Vector3(-H+t.w2,o-t.rise*(t.n2-1),P+t.landing+t.run2*t.n2)]}var Be=st(J(),1);var Z=st(J(),1);var le=new Z.Vector3(0,1,0);function F(t,e,o,n,a,i={}){let c=new Z.Vector3(o[0]-e[0],o[1]-e[1],o[2]-e[2]),r=c.length();if(r<1e-6)return;let s=new Z.Quaternion().setFromUnitVectors(le,c.normalize()),l=new Z.Matrix4().compose(new Z.Vector3(e[0],e[1],e[2]),s,new Z.Vector3(1,1,1));t.push(l),t.cyl(0,0,0,n,r,i.seg??6,a,{r1:i.r1??n*.85,rim:i.rim??[0,1],caps:i.caps??[!1,!0]}),t.pop()}var Ve=w(14268832,y.PLAIN),Oe=w(3878953,y.PLAIN);var W=w(12893097,y.ASHLAR),dt=w(10853515,y.ASHLAR),Yt=w(3882818,y.PANE),G=w(3420461,y.PLAIN),pt=w(5916212,y.WOOD),T0=w(10115651,y.TILE);function _t(t,e,o,n,a,i={}){let s=3.6+3.1*(n-1),l=w(i.shutter??5661519,y.WOOD);t.box(0,0,-o,e,s,0,a,{}),t.box(-.03,0,-o,e+.03,.55,.05,dt,{}),t.box(-.04,3.6-.12,-o,e+.04,3.6+.02,.1,W,{});for(let x=1;x<n;x++)t.box(-.03,3.6+3.1*x-.06,-o,e+.03,3.6+3.1*x+.02,.06,W,{});t.box(-.12,s,-o-.12,e+.12,s+.22,.22,W,{}),t.box(-.06,s+.22,-o-.06,e+.06,s+.32,.16,dt,{});let u=i.roofH??2.2,f=s+.32,h=-o/2;t.quad([-.15,f,.3],[e+.15,f,.3],[e+.15,f+u,h],[-.15,f+u,h],T0),t.quad([e+.15,f,-o-.3],[-.15,f,-o-.3],[-.15,f+u,h],[e+.15,f+u,h],T0),t.tri([0,f,.16],[0,f+u-.1,h],[0,f,-o-.16],a),t.tri([e,f,-o-.16],[e,f+u-.1,h],[e,f,.16],a),i.chimney&&t.box(e*.7,f+u*.4,h-.8,e*.7+.6,f+u+.9,h-.2,w(10194814,y.BRICK),{});let p=Math.max(1,Math.round(e/1.9)),v=e/p;for(let x=1;x<n;x++){let m=3.6+3.1*(x-1)+.85;for(let T=0;T<p;T++){let E=v*(T+.5);if(t.box(E-.42,m,-.1,E+.42,m+1.55,.015,Yt,{skip:["nz"]}),t.box(E-.52,m-.1,-.05,E+.52,m,.12,W,{}),t.box(E-.5,m+1.55,-.05,E+.5,m+1.68,.06,W,{}),i.shutter!==null&&(t.box(E-.86,m,0,E-.44,m+1.55,.06,l,{}),t.box(E+.44,m,0,E+.86,m+1.55,.06,l,{})),i.balcony&&x===1){t.box(E-.7,m-.18,0,E+.7,m-.08,.55,W,{});for(let M=0;M<=6;M++)t.box(E-.68+M*.226,m-.08,.48,E-.65+M*.226,m+.9,.51,G,{});t.box(E-.7,m+.88,.46,E+.7,m+.94,.53,G,{})}}}for(let x=0;x<p;x++){let m=v*(x+.5),T=i.shops&&x%2===0,E=T?.75:.55;if(t.box(m-E,.55,-.12,m+E,2.6,.015,T?Yt:pt,{skip:["nz"]}),t.box(m-E-.14,.55,-.04,m-E,2.62,.07,W,{}),t.box(m+E,.55,-.04,m+E+.14,2.62,.07,W,{}),t.box(m-E-.14,2.62,-.04,m+E+.14,2.82,.07,W,{}),T&&i.awning){let M=w(i.awning,y.CLOTH);t.quad([m-E-.25,3.05,.05],[m-E-.25,2.55,1.3],[m+E+.25,2.55,1.3],[m+E+.25,3.05,.05],M),t.quad([m-E-.25,2.55,1.3],[m-E-.25,2.3,1.3],[m+E+.25,2.3,1.3],[m+E+.25,2.55,1.3],M)}}return s}function he(t,e,o,n){let i=w(13878178,y.PLASTER),c=e/n,r=4.4,s=3.2;t.box(0,r,-o,e,9.6,0,i,{}),t.box(0,0,-o,e,r,-s,w(12562060,y.PLASTER),{}),t.box(-.05,r-.05,-o,e+.05,r+.35,.08,W,{}),t.box(-.12,9.6,-o-.12,e+.12,9.6+.3,.2,W,{});for(let l=0;l<=n;l++){let u=l*c;t.box(u-.28,0,-.56,u+.28,.35,0,dt,{}),t.cyl(u,.35,-.28,.2,3,12,W,{}),t.box(u-.3,3,-.58,u+.3,3.25,.02,W,{})}for(let l=0;l<n;l++){let u=(l+.5)*c,f=c/2-.3,h=10;for(let p=0;p<h;p++){let v=Math.PI*(1-p/h),x=Math.PI*(1-(p+1)/h),m=[u+Math.cos(v)*f,3.25+Math.sin(v)*f],T=[u+Math.cos(x)*f,3.25+Math.sin(x)*f];t.quad([m[0],m[1],.02],[T[0],T[1],.02],[T[0],r,.02],[m[0],r,.02],W,[0,0,0,0]),t.quad([T[0],T[1],.02],[m[0],m[1],.02],[m[0],m[1],-.58],[T[0],T[1],-.58],dt,[1,0,1,0])}t.box(u-.6,0,-s-.02,u+.6,2.5,-s+.01,pt,{})}t.box(0,r-.3,-s,e,r-.25,-.58,w(9208176),{bottom:!0,skip:["py"]});for(let l=0;l<n;l++){let u=(l+.5)*c;t.box(u-.45,5.6,-.1,u+.45,7.9,.015,Yt,{skip:["nz"]}),t.box(u-.6,7.9,-.05,u+.6,8.15,.1,W,{}),t.box(u-.55,5.45,-.05,u+.55,5.6,.14,W,{})}}function ue(t,e,o){t.cyl(e,0,o,.16,.5,10,G,{r1:.1}),t.cyl(e,.5,o,.055,3.6,8,G,{r1:.045}),t.box(e-.17,3.6,o-.17,e+.17,3.66,o+.17,G,{}),t.box(e-.14,3.66,o-.14,e+.14,4.08,o+.14,w(15262152,y.PANE),{}),t.lathe(e,4.08,o,[[.22,0],[0,.26]],8,G,{edges:[1,0]})}function Gt(t,e,o,n){t.push(R.chain(R.T(e,0,o),R.RY(n)));for(let a=0;a<4;a++)t.box(-.9,.42,-.2+a*.11,.9,.46,-.13+a*.11,pt,{});for(let a=0;a<3;a++)t.box(-.9,.55+a*.13,-.28,.9,.64+a*.13,-.25,pt,{});for(let a of[-.75,.75])t.box(a-.03,0,-.22,a+.03,.42,-.18,G,{}),t.box(a-.03,0,.18,a+.03,.42,.22,G,{}),t.box(a-.03,.42,-.3,a+.03,.95,-.26,G,{});t.pop()}function fe(t,e,o){let n=w(12432546,y.ASHLAR),a=[[2.3,0],[2.3,.55],[2.05,.6],[2.05,.35],[0,.35]];t.lathe(e,0,o,a,16,n,{flat:!0,edges:[1,1,1,1,0]}),t.cyl(e,.4,o,2.04,.48,16,w(7309967,y.PANE),{caps:[!1,!0],rim:[0,0]}),t.cyl(e,.35,o,.3,1.6,10,n,{}),t.lathe(e,1.6,o,[[.2,0],[.9,.3],[.95,.42],[0,.42]],12,n,{edges:[0,1,1,0]}),t.cyl(e,2,o,.14,2.6,8,n,{}),t.blob(e,2.75,o,.22,.22,.22,n,{lump:.05})}function Ut(t,e,o,n=1){t.box(e-.6,0,o-.6,e+.6,.6,o+.6,W,{}),t.box(e-.5,.6,o-.5,e+.5,.62,o+.5,w(6048309,y.SOIL),{}),F(t,[e,.6,o],[e+.1,2.4*n,o],.1,w(5917242,y.WOOD),{r1:.07});let a=w(7307091,y.FOLIAGE);t.blob(e+.1,2.9*n,o,1.05*n,.85*n,1.05*n,a,{lump:.18,seed:e*3+o,sub:2}),t.blob(e+.5*n,3.3*n,o+.3,.6*n,.5*n,.6*n,a,{lump:.2,seed:e+o*5,sub:1})}function de(t,e,o){let n=w(15327953,y.CLOTH);for(let[a,i]of[[0,0],[2.2,.6],[.8,2.3]]){let c=e+a,r=o+i;t.cyl(c,0,r,.25,.04,8,G,{}),t.cyl(c,.04,r,.04,.72,6,G,{}),t.cyl(c,.72,r,.38,.75,14,w(14275266,y.PLAIN),{});for(let s of[.3,2.4,4.3]){let l=c+Math.cos(s)*.62,u=r+Math.sin(s)*.62;t.push(R.chain(R.T(l,0,u),R.RY(-s+Math.PI/2))),t.box(-.2,.44,-.2,.2,.48,.2,pt,{});for(let[f,h]of[[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]])t.box(f-.02,0,h-.02,f+.02,.44,h+.02,G,{});t.box(-.2,.48,.16,.2,.9,.2,pt,{}),t.pop()}t.cyl(c,.75,r,.03,2.3,6,w(14209215),{}),t.lathe(c,2.05,r,[[1.25,0],[0,.45]],12,n,{edges:[1,0]})}}function pe(t,e,o){t.cyl(e,0,o,.14,.75,10,dt,{r1:.12}),t.blob(e,.78,o,.13,.08,.13,dt,{lump:0})}function me(t,e,o){t.push(R.chain(R.T(e,0,o),R.RY(.35))),t.box(-.3,0,-.17,.3,.09,.17,w(8018748,y.WOOD),{}),t.box(-.27,.09,-.14,.27,.095,.14,w(14208957,y.PLAIN),{});let n=[13060923,14726208,5211816,6987866,15789280,3815994,14256714,9268144,12112092,10246716];for(let a=0;a<10;a++){let i=Math.floor(a/5),c=a%5;t.push(R.chain(R.T(-.2+c*.1,.112,-.06+i*.12),R.RY((c*.37+i)%.3-.15))),t.box(-.016,-.016,-.045,.016,.016,.045,w(n[a]),{}),t.pop()}t.push(R.chain(R.T(.42,.016,.12),R.RY(.9))),t.box(-.016,-.016,-.04,.016,.016,.04,w(n[2]),{}),t.pop(),t.push(R.chain(R.T(.36,.016,.3),R.RY(-.4))),t.box(-.016,-.016,-.03,.016,.016,.03,w(n[0]),{}),t.pop(),t.pop()}function xe(t,e,o){t.push(R.chain(R.T(e,0,o),R.RY(-.2))),t.cyl(0,0,0,.16,.11,14,w(3946547,y.CLOTH),{caps:[!0,!1]}),t.lathe(0,0,0,[[.28,.005],[.16,.012]],14,w(3946547,y.CLOTH),{edges:[1,0]}),t.cyl(0,.02,0,.145,.035,14,w(11901530),{caps:[!1,!0],rim:[0,0]}),t.pop()}function R0(t){let e=[[-15.5,4.6,3,14206886,{shops:!0,awning:10112316}],[-10.9,5.2,4,13216141,{balcony:!0,chimney:!0}],[-5.7,4.2,3,14734523,{shutter:7035461}],[-1.5,6,4,13481626,{shops:!0,awning:5532274,balcony:!0}],[4.5,4.4,3,13942941,{chimney:!0}],[8.9,6.4,4,12559757,{shops:!0,awning:8088124}]];for(let[a,i,c,r,s]of e)t.push(R.T(a,0,-18)),_t(t,i,8,c,w(r,y.PLASTER),s),t.pop();let o=[[-15.5,6,3,13350039,{shops:!0,awning:6188635}],[-9.5,4.8,4,14273456,{balcony:!0}],[-4.7,5.6,3,13018763,{chimney:!0}],[.9,4.6,4,14471093,{}],[5.5,5,3,13612950,{shops:!0,awning:9194042}],[10.5,5.1,4,12494991,{}]];for(let[a,i,c,r,s]of o)t.push(R.chain(R.T(a+i,0,17),R.RY(Math.PI))),_t(t,i,8,c,w(r,y.PLASTER),s),t.pop();t.push(R.chain(R.T(-14,0,12),R.RY(Math.PI/2))),he(t,26,9,8),t.pop();let n=[[-16,5.4,3,13811616,{}],[-10.6,6,4,12954512,{shops:!0,awning:5203056}],[-4.6,4.8,3,14470064,{balcony:!0}],[.2,5.5,4,13479567,{chimney:!0}],[5.7,5.3,3,14075557,{shops:!0,awning:10112316}],[11,4.6,3,12889749,{}]];for(let[a,i,c,r,s]of n)t.push(R.chain(R.T(14,0,a),R.RY(-Math.PI/2))),_t(t,i,8,c,w(r,y.PLASTER),s),t.pop();fe(t,-7.5,-9);for(let[a,i]of[[-5,11],[5,11],[-10.5,2],[10.5,2],[-5,-13],[5,-13]])ue(t,a,i);Gt(t,-11.6,6,Math.PI/2),Gt(t,-11.6,-3,Math.PI/2),Gt(t,8.5,-14.8,0),Ut(t,11,-9,1.1),Ut(t,-11,12.5,1),Ut(t,11.2,12,.95),de(t,9.2,-4.5);for(let a=0;a<6;a++)pe(t,-3+a*1.2,15.3);me(t,1.05,4.95),xe(t,2.5,5.7)}function H0(t,e,o,n){let a=w(14268832),i=w(9083558,y.CLOTH),c=w(4867648,y.CLOTH),r=w(5913899);t.push(R.chain(R.T(e,0,o),R.RY(n)));for(let u of[-1,1])F(t,[.12*u,.08,.45],[.12*u,.1,-.05],.075,c,{r1:.085}),F(t,[.12*u,.1,-.05],[.13*u,.62,.12],.095,c,{r1:.1}),t.box(.12*u-.05,0,.4,.12*u+.05,.12,.62,w(3025446),{});t.push(R.chain(R.T(0,.6,.1),R.RX(-.75))),t.box(-.21,0,-.12,.21,.62,.12,i,{}),t.pop();let s=[0,.6+.62*Math.cos(.75),.1-.62*Math.sin(.75)],l=[0,s[1]+.12,s[2]-.2];t.blob(l[0],l[1],l[2],.13,.15,.14,a,{lump:.03}),t.blob(l[0],l[1]+.07,l[2]+.05,.14,.12,.14,r,{lump:.06}),F(t,[.22,s[1]-.04,s[2]+.04],[.28,.42,-.42],.06,i),F(t,[.28,.42,-.42],[.25,.04,-.7],.05,a),F(t,[-.22,s[1]-.04,s[2]+.04],[-.3,.55,-.1],.06,i),F(t,[-.3,.55,-.1],[-.16,.62,.12],.05,a),t.pop()}var O=st(J(),1);var jt=w(14268832);function Xt(t,e){let o=new rt;return t(o),new O.Mesh(o.build(),e)}var et=class{constructor(e,o,n,a,i,c=0){let r=n.height??1;this.group=new O.Group,this.body=new O.Group,this.group.add(this.body),this.curve=new O.CatmullRomCurve3(a.map(([p,v])=>new O.Vector3(p,0,v)),!0,"centripetal"),this.len=this.curve.getLength(),this.speed=i,this.dist=c*this.len,this.dist0=this.dist,this.stride=1.45*r;let s=w(n.coat,y.CLOTH),l=w(n.trousers,y.CLOTH),u=w(2828068),f=.92*r,h=1.43*r;this.body.add(Xt(p=>{n.skirt&&p.lathe(0,f-.42*r,0,[[.3*r,0],[.2*r,.5*r],[0,.5*r]],10,w(n.skirt,y.CLOTH),{edges:[1,0,0]}),p.lathe(0,f-.08,0,[[.19*r,0],[.22*r,.32*r],[.24*r,h-f],[.12*r,h-f+.06],[0,h-f+.06]],10,s,{edges:[1,0,0,0,0]}),F(p,[0,h,0],[0,h+.1*r,0],.06*r,jt),p.blob(0,h+.22*r,.01,.12*r,.14*r,.13*r,jt,{lump:.03}),n.hat?(p.cyl(0,h+.3*r,0,.22*r,h+.32*r,12,w(n.hat),{}),p.cyl(0,h+.32*r,0,.13*r,h+.44*r,10,w(n.hat),{r1:.12*r})):p.blob(0,h+.28*r,-.04,.13*r,.11*r,.13*r,w(n.hair),{lump:.06}),n.bag&&p.box(.22*r,f-.1,-.12,.3*r,f+.2,.15,w(n.bag,y.WOOD),{})},e)),this.legs=[-1,1].map(p=>{let v=new O.Group;return v.position.set(.1*p*r,f,0),v.add(Xt(x=>{F(x,[0,0,0],[0,-f+.07,0],.08*r,l,{r1:.06*r}),x.box(-.055*r,-f,-.07,.055*r,-f+.08,.17*r,u,{})},e)),this.body.add(v),v}),this.arms=[-1,1].map(p=>{let v=new O.Group;return v.position.set(.25*p*r,h-.04,0),v.add(Xt(x=>{F(x,[0,0,0],[.03*p,-.32*r,.02],.055*r,s),F(x,[.03*p,-.32*r,.02],[.02*p,-.6*r,.07],.045*r,s),x.blob(.02*p,-.66*r,.08,.045,.06,.045,jt,{lump:0,sub:0})},e)),this.body.add(v),v}),this.shadow=new O.Mesh(new O.PlaneGeometry(.9*r,.9*r),o),this.shadow.rotation.x=-Math.PI/2,this.shadow.position.y=.004,this.group.add(this.shadow),this.group.traverse(p=>{p.frustumCulled=!1}),this.update(0)}update(e){this.dist=(this.dist+e*this.speed)%this.len;let o=this.dist/this.len,n=this.curve.getPointAt(o),a=this.curve.getTangentAt(o);this.group.position.copy(n),this.body.rotation.y=Math.atan2(a.x,a.z);let i=this.dist/this.stride*Math.PI*2,c=Math.sin(i);this.legs[0].rotation.x=c*.42,this.legs[1].rotation.x=-c*.42,this.arms[0].rotation.x=-c*.32,this.arms[1].rotation.x=c*.32,this.body.position.y=Math.abs(Math.cos(i))*.035-.02}};function b0(){let t=document.createElement("canvas");t.width=t.height=64;let e=t.getContext("2d"),o=e.createRadialGradient(32,32,2,32,32,31);o.addColorStop(0,"rgba(20,18,16,0.55)"),o.addColorStop(.55,"rgba(20,18,16,0.25)"),o.addColorStop(1,"rgba(20,18,16,0)"),e.fillStyle=o,e.fillRect(0,0,64,64);let n=new O.CanvasTexture(t);return new O.MeshBasicMaterial({map:n,transparent:!0,depthWrite:!1})}var Tt=10631978,Qt=new d.Color(15525333),P0=new d.Color(14935004),nt=document.getElementById("scene"),V=new d.WebGLRenderer({canvas:nt,antialias:!0,powerPreference:"high-performance"});V.setPixelRatio(Math.min(window.devicePixelRatio||1,2));V.setClearColor(Qt,1);var z=f0(),Mt=new d.Scene,Pt=w0();{let t=new rt;M0(t,Pt);let e=t.build(),o={virtual:!0,hole:Pt,water:k,hall:qt},n=new d.Mesh(e,kt(z,o));n.frustumCulled=!1,Mt.add(n);let a=new d.Mesh(e,kt(z,{...o,dim:.5}));a.scale.y=-1,a.position.y=2*k,a.frustumCulled=!1,Mt.add(a);let i=-H-.7,c=H+.7,r=ft-K.depth-.1,s=_+.7,l=new d.Mesh(new d.PlaneGeometry(c-i,s-r),d0(z,[[b.x,b.z],[-H+.6,P+ut.landing+ut.run2*4.4],[b.x+1.2,b.z+1.9],[K.x,ft+.15]],qt));l.rotation.x=-Math.PI/2,l.position.set((i+c)/2,k,(r+s)/2),l.renderOrder=2,l.frustumCulled=!1,Mt.add(l);let u=new d.Shape([[-80,80],[80,80],[80,-80],[-80,-80]].map(([p,v])=>new d.Vector2(p,v)));u.holes.push(new d.Path(Pt.map(([p,v])=>new d.Vector2(p,-v))));let f=new d.ShapeGeometry(u);f.rotateX(-Math.PI/2);let h=new d.Mesh(f,p0(z,b));h.frustumCulled=!1,Mt.add(h)}var q=new d.PerspectiveCamera(40,2,.05,80);{let t=Pt.map(([i,c])=>new d.Vector3(i,0,c));for(let i=0;i<12;i++){let c=i/12*Math.PI*2;t.push(new d.Vector3(b.x+Math.cos(c)*(b.r+.05),b.top+.25,b.z+Math.sin(c)*(b.r+.05)))}let e=-.4,o=.7,n=1;for(let i=0;i<6;i++){let c=new d.Vector3(0,Math.sin(e),-Math.cos(e)),r=new d.Vector3(0,Math.cos(e),Math.sin(e)),s=1e9,l=-1e9;n=0;for(let u of t){let f=u.clone().sub(C),h=f.dot(c);s=Math.min(s,f.dot(r)/h),l=Math.max(l,f.dot(r)/h),n=Math.max(n,Math.abs(f.x/h))}e+=Math.atan((s+l)/2),o=2*Math.atan((l-s)/2)}let a=1.03;q.fov=d.MathUtils.radToDeg(2*Math.atan(Math.tan(o/2)*a)),q.aspect=n*a/Math.tan(d.MathUtils.degToRad(q.fov)/2),q.position.copy(C),q.lookAt(C.clone().add(new d.Vector3(0,Math.sin(e),-Math.cos(e)))),q.updateProjectionMatrix(),q.updateMatrixWorld(!0)}var A0=Math.min(4096,V.capabilities.maxTextureSize||4096),Jt=Math.min(1536,A0),Ee=Math.min(A0,Math.round(Jt*q.aspect/64)*64),S0=()=>{let t=new d.WebGLRenderTarget(Ee,Jt,{minFilter:d.LinearMipmapLinearFilter,magFilter:d.LinearFilter,generateMipmaps:!0,depthBuffer:!0});return t.texture.anisotropy=V.capabilities.getMaxAnisotropy(),t},C0=S0(),I0=S0(),Kt=!0;function ve(){let t=V.getClearColor(new d.Color),e=V.getClearAlpha(),o=Jt/q.fov,n=V.domElement.height/St,a=z.uHatchPx.value,i=z.uLitho.value;z.uHatchPx.value=a*Math.max(1,o/n),V.setClearColor(0,0);for(let[c,r]of[[C0,1],[I0,0]])z.uLitho.value=r,V.setRenderTarget(c),V.clear(!0,!0,!0),V.render(Mt,q);V.setRenderTarget(null),V.setClearColor(t,e),z.uHatchPx.value=a,z.uLitho.value=i}var it=new d.Scene,V0=m0(z,C0.texture,I0.texture);V0.uniforms.uEyeVP.value.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse);{let t=new d.PlaneGeometry(90,90);t.rotateX(-Math.PI/2);let e=new d.Mesh(t,V0);e.frustumCulled=!1,it.add(e)}var mt=kt(z);{let t=new rt;R0(t),H0(t,H+1.05,-1.2,-Math.PI/2-.2);let e=new d.Mesh(t.build(),mt);e.frustumCulled=!1,it.add(e)}var wt=b0(),At=[new et(mt,wt,{coat:7101002,trousers:3947063,hat:2894375},[[-9,.4],[9,.4],[9.5,-7.5],[-9.5,-7.5]],1.25,.06),new et(mt,wt,{coat:9063228,trousers:4867392,hair:3024416,skirt:4542554,height:.95},[[-10.5,9],[-10.5,-12],[-4,-14],[10,-12],[11,8],[3,12.5]],1.05,.25),new et(mt,wt,{coat:5661035,trousers:3091754,hair:7033664,bag:5914672},[[7,13],[-8,13],[-7,9.5],[8,9.5]],1.3,.5),new et(mt,wt,{coat:13218959,trousers:4012856,hat:6112818,height:1.03},[[12,-2],[5,-11],[-5,-11],[-12,-4],[-5,-6],[5,-6]],1.15,.7),new et(mt,wt,{coat:4147779,trousers:4933441,hair:2761760,skirt:7031871,height:.92},[[4.5,7.5],[9,3],[7,-2],[3.8,1.5]],.9,.1)];for(let t of At)it.add(t.group);{let t=document.createElement("canvas");t.width=t.height=512;let e=t.getContext("2d");e.strokeStyle="rgba(250,248,240,0.92)",e.fillStyle="rgba(250,248,240,0.9)",e.lineCap="round",e.lineWidth=9;let o=c=>Math.sin(c*12.9898)*43758.5453%1;e.beginPath();for(let c=0;c<=90;c++){let r=c/90*Math.PI*2,s=210+o(c)*6;e.lineTo(256+Math.cos(r)*s,256+Math.sin(r)*s)}e.stroke();let n=(c,r)=>{e.beginPath(),e.ellipse(c,r,34,64,0,0,Math.PI*2),e.fill(),e.beginPath(),e.ellipse(c,r+88,27,34,0,0,Math.PI*2),e.fill()};n(206,220),n(306,220),e.lineWidth=7,e.beginPath(),e.moveTo(256,120),e.lineTo(256,64),e.moveTo(232,88),e.lineTo(256,62),e.lineTo(280,88),e.stroke();let a=new d.CanvasTexture(t);a.anisotropy=V.capabilities.getMaxAnisotropy();let i=new d.Mesh(new d.PlaneGeometry(.9,.9),new d.MeshBasicMaterial({map:a,transparent:!0,depthWrite:!1,opacity:.85}));i.rotation.x=-Math.PI/2,i.position.set(C.x,.004,C.z+.12),it.add(i)}var Rt=new d.Group,O0=[];{let t=new d.MeshBasicMaterial({color:Tt,transparent:!0}),e=new d.Mesh(new d.SphereGeometry(.075,16,12),t);e.position.copy(C);let o=new d.MeshBasicMaterial({color:Tt,transparent:!0,side:d.DoubleSide}),n=new d.Mesh(new d.TorusGeometry(.16,.012,6,40),o);n.position.copy(C);let a=new d.LineDashedMaterial({color:Tt,dashSize:.12,gapSize:.08,transparent:!0}),i=new d.BufferGeometry().setFromPoints([C.clone(),new d.Vector3(C.x,0,C.z)]),c=new d.Line(i,a);c.computeLineDistances(),Rt.add(e,n,c),O0.push(t,o,a),Rt.userData.ring=n,it.add(Rt)}var yt=new d.Group,W0=[];{let t=new d.MeshBasicMaterial({color:Tt,transparent:!0}),e=new d.MeshBasicMaterial({color:Tt,transparent:!0,depthTest:!1,depthWrite:!1});W0.push([t,1],[e,.6]);let o=new d.CylinderGeometry(1,1,1,6,1,!0);o.translate(0,.5,0);let n=[],a=(c,r,s,l=.035,u=.32,f=.2)=>{let h=r.clone().sub(c),p=h.length(),v=new d.Quaternion().setFromUnitVectors(new d.Vector3(0,1,0),h.clone().normalize());for(let x=0;x<p;x+=u+f)n.push({mat:s,p:c.clone().addScaledVector(h,x/p),q:v,len:Math.min(u,p-x),r:l})},i=(c,r,s=.08)=>{let l=new d.Mesh(new d.SphereGeometry(s,12,8),r);l.position.copy(c),l.renderOrder=31,yt.add(l)};for(let c of y0()){let r=C.y/(C.y-c.y),s=C.clone().lerp(c,r);s.y=.012,a(C,s,t),c.y<0&&a(s,c,e,.025,.16,.14),i(c,c.y>0?t:e,.07),i(s,t,.06)}{for(let r of[.02,b.top])for(let s=0;s<24;s+=2){let l=s/24*Math.PI*2,u=(s+1)/24*Math.PI*2;a(new d.Vector3(b.x+Math.cos(l)*b.r,r,b.z+Math.sin(l)*b.r),new d.Vector3(b.x+Math.cos(u)*b.r,r,b.z+Math.sin(u)*b.r),t,.02,1,0)}for(let r of[Math.PI*.5,Math.PI*1.5,0,Math.PI])a(new d.Vector3(b.x+Math.cos(r)*b.r,.02,b.z+Math.sin(r)*b.r),new d.Vector3(b.x+Math.cos(r)*b.r,b.top,b.z+Math.sin(r)*b.r),t,.02,.12,.1)}{let r=k,s=[[-H,_],[H,_],[H,P],[-H,P]];for(let l=0;l<4;l++){let u=s[l],f=s[(l+1)%4];a(new d.Vector3(u[0],r,u[1]),new d.Vector3(f[0],r,f[1]),e,.018,.16,.14),a(new d.Vector3(u[0],-.5,u[1]),new d.Vector3(u[0],r,u[1]),e,.018,.16,.14)}}for(let c of[t,e]){let r=n.filter(u=>u.mat===c),s=new d.InstancedMesh(o,c,r.length),l=new d.Matrix4;r.forEach((u,f)=>{s.setMatrixAt(f,l.compose(u.p,u.q,new d.Vector3(u.r,u.len,u.r)))}),s.renderOrder=c===e?29:30,s.frustumCulled=!1,yt.add(s)}yt.visible=!1,it.add(yt)}var U=new d.PerspectiveCamera(70,30/38,.05,300),Q=new d.Vector3(0,0,-2.4),L0=d.MathUtils.degToRad(-21),B0=C.clone().add(new d.Vector3(0,Math.sin(L0),-Math.cos(L0)).multiplyScalar(10)),St=70,$t={pos:new d.Vector3(2.9,16.5,10.6),target:new d.Vector3(.2,0,-1.9),fov:50},ot={period:34,hold0:6,orbit:22};function z0(t,e,o){return{pos:t.clone(),target:e.clone(),fov:o}}var t0=()=>z0(C,B0,St);function N0(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}function Zt(t,e,o){let n=Math.min(1,Math.max(0,(o-t)/(e-t)));return n*n*(3-2*n)}var Ct=C.clone().sub(Q),ge=Math.hypot(Ct.x,Ct.z),we=Math.atan2(Ct.x,Ct.z);function Me(t){let e=(t%ot.period+ot.period)%ot.period;if(e<ot.hold0||e>ot.hold0+ot.orbit)return t0();let o=N0((e-ot.hold0)/ot.orbit),n=o*Math.PI*2,a=Math.sin(n/2)**2,i=ge+1.8*a,c=C.y+3*a+1.6*Math.sin(n)**2,r=we+n,s=new d.Vector3(Q.x+Math.sin(r)*i,c,Q.z+Math.cos(r)*i),l=Zt(0,.16,o)*(1-Zt(.84,1,o)),u=B0.clone().lerp(new d.Vector3(0,.2,Q.z-1),l);return{pos:s,target:u,fov:St+(56-St)*l}}var g={mode:"tour",tourTime:0,playing:!0,litho:1,lithoTarget:1,tween:null,cur:t0(),orbit:{az:0,el:.3,dist:10},guide:0};function ye(t){U.position.copy(t.pos),U.up.set(0,1,0),U.lookAt(t.target),U.fov!==t.fov&&(U.fov=t.fov,U.updateProjectionMatrix())}function e0(t,e=2.4,o){g.tween={from:{pos:g.cur.pos.clone(),target:g.cur.target.clone(),fov:g.cur.fov},to:t,t:0,dur:e,then:o}}function Et(){let t=g.orbit;return{pos:new d.Vector3(Q.x+Math.sin(t.az)*Math.cos(t.el)*t.dist,Q.y+Math.sin(t.el)*t.dist,Q.z+Math.cos(t.az)*Math.cos(t.el)*t.dist),target:Q.clone(),fov:55}}var It=document.getElementById("btn-above"),D0=document.getElementById("hint");i0();c0([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{g.lithoTarget=t},1);var Te=h0(t=>{g.playing=t});function o0(t){It.setAttribute("aria-pressed",String(t)),t?(g.mode="above",e0(z0($t.pos,$t.target,$t.fov),2.6),D0.textContent="Red lines: sight lines from the eye, through the chalk, to the hidden scene"):Ht()}function Ht(){It.setAttribute("aria-pressed","false"),g.mode="returning",e0(t0(),2.4,()=>{g.mode="tour",g.tourTime=0}),D0.textContent="Drag to walk round the drawing \xB7 scroll to zoom \xB7 double-click to return to the eye point"}It.addEventListener("click",()=>o0(g.mode!=="above"));l0({" ":()=>Te(!g.playing),l:()=>document.getElementById(g.lithoTarget?"btn-colour":"btn-litho").click(),a:()=>o0(g.mode!=="above"),e:()=>Ht(),0:()=>Ht()});var xt=null;function F0(){if(g.mode==="manual")return;let t=g.cur.pos.clone().sub(Q),e=t.length();g.orbit={az:Math.atan2(t.x,t.z),el:Math.asin(Math.min(.99,Math.max(.03,t.y/e))),dist:Math.min(26,Math.max(4,e))},g.mode="manual",It.setAttribute("aria-pressed","false"),e0(Et(),.6)}nt.addEventListener("pointerdown",t=>{nt.setPointerCapture(t.pointerId),xt={x:t.clientX,y:t.clientY}});nt.addEventListener("pointermove",t=>{if(!xt)return;let e=t.clientX-xt.x,o=t.clientY-xt.y;Math.abs(e)+Math.abs(o)<1||(xt={x:t.clientX,y:t.clientY},F0(),g.orbit.az-=e*.006,g.orbit.el=Math.min(1.45,Math.max(.03,g.orbit.el+o*.004)),g.tween?g.tween.to=Et():g.cur=Et())});var q0=()=>{xt=null};nt.addEventListener("pointerup",q0);nt.addEventListener("pointercancel",q0);nt.addEventListener("dblclick",Ht);nt.addEventListener("wheel",t=>{t.preventDefault(),F0(),g.orbit.dist=Math.min(26,Math.max(4,g.orbit.dist*Math.exp(t.deltaY*.0012))),g.tween?g.tween.to=Et():g.cur=Et()},{passive:!1});r0(30/38,(t,e)=>{V.setSize(t,e),U.aspect=t/e,U.updateProjectionMatrix(),Kt=!0});var k0=performance.now();function _0(t){let e=Math.min(.05,Math.max(0,(t-k0)/1e3));k0=t,G0(e),requestAnimationFrame(_0)}function G0(t){if(g.playing){for(let a of At)a.update(t);g.mode==="tour"&&(g.tourTime+=t)}if(g.litho!==g.lithoTarget){let a=g.lithoTarget-g.litho;g.litho+=Math.sign(a)*Math.min(Math.abs(a),t*2.2),z.uLitho.value=g.litho,V.setClearColor(Qt.clone().lerp(P0,1-g.litho),1)}if(Kt&&(ve(),Kt=!1),g.tween){let a=g.tween;a.t=Math.min(1,a.t+t/a.dur);let i=N0(a.t);g.cur={pos:a.from.pos.clone().lerp(a.to.pos,i),target:a.from.target.clone().lerp(a.to.target,i),fov:a.from.fov+(a.to.fov-a.from.fov)*i},a.t>=1&&(g.tween=null,a.then?.())}else g.mode==="tour"?g.cur=Me(g.tourTime):g.mode==="manual"&&(g.cur=Et());ye(g.cur);let e=U.position.distanceTo(C),o=Zt(.25,1.2,e);Rt.visible=o>.01;for(let a of O0)a.opacity=o;Rt.userData.ring.lookAt(U.position);let n=g.mode==="above"?1:0;g.guide+=Math.sign(n-g.guide)*Math.min(Math.abs(n-g.guide),t*1.2),yt.visible=g.guide>.01;for(let[a,i]of W0)a.opacity=i*g.guide;e<.05?Lt(!0,"At the eye point: the chalk reads as a pit in the paving"):g.mode==="above"?Lt(!0,"From above: the true shape of the drawing"):Lt(!0,`${e.toFixed(1)} m from the eye point: the drawing is flat and stretched`),V.render(it,U)}u0();requestAnimationFrame(_0);window.__page={state:g,camera:U,renderer:V,walkers:At,eyeCam:q,setAbove:o0,goToEye:Ht,setTour(t){g.mode="tour",g.tween=null,g.tourTime=t},setWalk(t){for(let e of At)e.dist=e.dist0,e.update(t)},setLitho(t){document.getElementById(t?"btn-litho":"btn-colour").click(),g.litho=t?1:0,z.uLitho.value=g.litho,V.setClearColor(Qt.clone().lerp(P0,1-g.litho),1)},orbit(t,e,o){g.mode="manual",g.tween=null,g.orbit={az:t,el:e,dist:o}},step:G0,showGuides(t){g.guide=t}};})();
