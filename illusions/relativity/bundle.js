(()=>{var vo=Object.create;var Ot=Object.defineProperty;var Eo=Object.getOwnPropertyDescriptor;var wo=Object.getOwnPropertyNames;var go=Object.getPrototypeOf,bo=Object.prototype.hasOwnProperty;var Ro=(o,t)=>()=>{try{return t||o((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}};var To=(o,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of wo(t))!bo.call(o,n)&&n!==e&&Ot(o,n,{get:()=>t[n],enumerable:!(s=Eo(t,n))||s.enumerable});return o};var ot=(o,t,e)=>(e=o!=null?vo(go(o)):{},To(t||!o||!o.__esModule?Ot(e,"default",{value:o,enumerable:!0}):e,o));var K=Ro((oe,Ft)=>{Ft.exports=window.THREE});var S=ot(K(),1);function Gt(o,t){let e=document.getElementById("frame"),s=()=>{let r=(window.innerWidth<640?10:28)+13,a=document.getElementById("masthead"),i=document.getElementById("controls"),c=(a?a.offsetHeight:0)+6+13,f=(i?i.offsetHeight:0)+8+13,h=window.innerWidth-r*2,p=window.innerHeight-c-f,d=p,m=d*o;m>h&&(m=h,d=m/o),m=Math.max(160,Math.floor(m)),d=Math.max(120,Math.floor(d)),e.style.width=`${m}px`,e.style.height=`${d}px`,e.style.top=`${c+Math.max(0,(p-d)/2)}px`,t?.(m,d)};return window.addEventListener("resize",s),s(),s}function _t(){let o=document.getElementById("panel"),t=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!o)return;let s=n=>{n?o.removeAttribute("hidden"):o.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(n))};t?.addEventListener("click",()=>s(o.hasAttribute("hidden"))),e?.addEventListener("click",()=>s(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&s(!1)})}function Dt(o,t,e){let s=n=>{for(let[r,a]of o)r.setAttribute("aria-pressed",String(a===n));t(n)};for(let[n,r]of o)n.addEventListener("click",()=>s(r));return e!==void 0&&s(e),s}function qt(o){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let e=o[t.key.length===1?t.key.toLowerCase():t.key];e&&(t.preventDefault(),e(t))})}function Ut(o,t=!0){let e=document.getElementById("btn-play"),s=n=>{t=n,e&&(e.setAttribute("aria-pressed",String(!n)),e.querySelector("span").textContent=n?"Pause":"Play",e.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),o(n)};return e?.addEventListener("click",()=>s(!t)),s(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),s}function bt(o,t){let e=document.getElementById("badge");e&&t&&(e.textContent=t),document.body.classList.toggle("badge-on",!!o)}function Wt(){document.body.classList.add("ready")}var N=ot(K(),1),Yt=14,zt=15;function Xt(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new N.Vector3(.45,.85,.62).normalize()},uPaper:{value:new N.Vector3(.925,.898,.835)},uInk:{value:new N.Vector3(.11,.1,.09)},uHaze:{value:new N.Vector3(.83,.86,.84)},uFade:{value:1},uTint:{value:0},uLift:{value:0},uTintX:{value:new N.Vector3(.36,.5,.74)},uTintY:{value:new N.Vector3(.78,.46,.34)},uTintZ:{value:new N.Vector3(.42,.66,.42)}}}var Mo=`
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
`,yo=`
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
  float hp = 0.2 + haze * 0.25;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  float h1 = 1.0 - smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  h1 = mix(c1, h1, hl);
  h2 = mix(c2, h2, hl);
  float v = 0.2 + 0.82 * t;
  v -= h1 * 0.22 + h2 * 0.2;
  v += g * 0.12 + gw * 0.07;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`,Lo=`
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ao=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uTint;
uniform float uLift;
uniform vec3 uTintX;
uniform vec3 uTintY;
uniform vec3 uTintZ;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
${Mo}
${yo}

void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.46 + 0.58 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 2.0) {            // ashlar
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.018) * l * 0.6;
  } else if (pat == 4.0) {     // wood planks
    float ph = 0.28;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 1.5, uv.y * 30.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.015) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 6.0) {     // grass
    tex = 0.85 + 0.25 * fbm(uv * 1.7);
  } else if (pat == 7.0) {     // gravel
    tex = 0.86 + 0.2 * vnoise(uv * 9.0) + 0.06 * fbm(uv * 2.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.75 + 0.45 * fbm(uv * 3.0);
  } else if (pat == 14.0) {    // square flagstones, the same from every side
    float p = 2.0;
    vec2 c = floor(uv / p);
    vec2 f = fract(uv / p) * p;
    float d = min(min(f.x, p - f.x), min(f.y, p - f.y));
    float h = hash12(c + 3.0);
    float l = lod(p, fw);
    tex = mix(1.0, 0.9 + 0.14 * h, l) * (0.95 + 0.08 * fbm(uv * 1.3));
    lines = lineMask(d, 0.03) * l * 0.75;
  } else if (pat == 15.0) {    // the dark inside of a doorway
    tex = 0.9 + 0.1 * vnoise(uv * 3.0);
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);
  col = mix(col, vec3(0.97, 0.95, 0.9), uLift * uLitho);

  // colour mode: wash each floor with the colour of its gravity
  vec3 an = abs(n);
  vec3 tint = an.x > an.y && an.x > an.z ? uTintX : (an.y > an.z ? uTintY : uTintZ);
  float tw = uTint * (1.0 - vM.z) * smoothstep(0.8, 0.95, max(an.x, max(an.y, an.z)));
  col = mix(col, col * (0.5 + 0.8 * tint), tw * 0.32);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;function lt(o,t={}){return new N.ShaderMaterial({uniforms:o,vertexShader:Lo,fragmentShader:Ao,transparent:!!t.transparent,depthWrite:t.depthWrite??!0,side:t.side??N.FrontSide})}var Lt=ot(K(),1);var C=ot(K(),1),Io=1e3,y={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Ho(o){return[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]}function M(o,t=y.PLAIN,e={}){return{c:typeof o=="number"?Ho(o):o,p:t,f:e.f||0,w:e.w||0,s:e.s||0}}var jt=["px","nx","py","ny","pz","nz"];function W(o,t){return[o[0]-t[0],o[1]-t[1],o[2]-t[2]]}function Rt(o,t){return[o[1]*t[2]-o[2]*t[1],o[2]*t[0]-o[0]*t[2],o[0]*t[1]-o[1]*t[0]]}function st(o){return Math.hypot(o[0],o[1],o[2])}function G(o){let t=st(o)||1;return[o[0]/t,o[1]/t,o[2]/t]}function Tt(o,t){let e=Math.abs(t[0]),s=Math.abs(t[1]),n=Math.abs(t[2]);return e>=s&&e>=n?[o[2],o[1]]:n>=s?[o[0],o[1]]:[o[0],o[2]]}var _=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new C.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new C.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let e=this.m.elements,s=t[0],n=t[1],r=t[2];return[e[0]*s+e[4]*n+e[8]*r+e[12],e[1]*s+e[5]*n+e[9]*r+e[13],e[2]*s+e[6]*n+e[10]*r+e[14]]}_tn(t){if(!this.nm)return t;let e=this.nm.elements,s=t[0],n=t[1],r=t[2];return G([e[0]*s+e[3]*n+e[6]*r,e[1]*s+e[4]*n+e[7]*r,e[2]*s+e[5]*n+e[8]*r])}tri(t,e,s,n,r=[1,1,1],a={}){let i=this._tp(t),c=this._tp(e),f=this._tp(s),h=G(Rt(W(e,t),W(s,t))),p=a.uv||[Tt(t,h),Tt(e,h),Tt(s,h)],d=G(Rt(W(c,i),W(f,i))),m=a.n?a.n.map(v=>this._tn(v)):[d,d,d],x=st(Rt(W(c,i),W(f,i))),E=[x/(st(W(f,c))||1),x/(st(W(i,f))||1),x/(st(W(c,i))||1)],w=a.k||[1,1,1],l=n.s||0,u=[i,c,f];for(let v=0;v<3;v++){let g=u[v];this.pos.push(g[0]+l,g[1]+l,g[2]+l),this.nrm.push(m[v][0],m[v][1],m[v][2]),this.col.push(n.c[0]*w[v],n.c[1]*w[v],n.c[2]*w[v]),this.uv.push(p[v][0],p[v][1]);for(let b=0;b<3;b++)r[b]?this.edg.push(v===b?E[b]:0):this.edg.push(Io);this.mat.push(n.p,n.f,n.w)}}quad(t,e,s,n,r,a=[1,1,1,1],i={}){let c=i.k||[1,1,1,1],f=i.n,h=i.uv;this.tri(t,e,s,r,[a[1],0,a[0]],{k:[c[0],c[1],c[2]],n:f&&[f[0],f[1],f[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(t,s,n,r,[a[2],a[3],0],{k:[c[0],c[2],c[3]],n:f&&[f[0],f[2],f[3]],uv:h&&[h[0],h[2],h[3]]})}box(t,e,s,n,r,a,i,c={}){t>n&&([t,n]=[n,t]),e>r&&([e,r]=[r,e]),s>a&&([s,a]=[a,s]);let f=new Set(c.open||[]),h=new Set(c.skip||[]);c.bottom||h.add("ny");let p=c.ao??1,d=c.aoTop??1,m={px:[0,n],nx:[0,t],py:[1,r],ny:[1,e],pz:[2,a],nz:[2,s]},x={px:[[n,e,a],[n,e,s],[n,r,s],[n,r,a]],nx:[[t,e,s],[t,e,a],[t,r,a],[t,r,s]],pz:[[t,e,a],[n,e,a],[n,r,a],[t,r,a]],nz:[[n,e,s],[t,e,s],[t,r,s],[n,r,s]],py:[[t,r,a],[n,r,a],[n,r,s],[t,r,s]],ny:[[t,e,s],[n,e,s],[n,e,a],[t,e,a]]};for(let E of jt){if(h.has(E)||f.has(E))continue;let w=x[E],l=[];for(let g=0;g<4;g++){let b=w[g],L=w[(g+1)%4],A=1;for(let k of jt){if(k===E)continue;let[H,P]=m[k];Math.abs(b[H]-P)<1e-9&&Math.abs(L[H]-P)<1e-9&&f.has(k)&&(A=0)}l.push(A)}let u;E==="py"||E==="ny"?u=[d,d,d,d]:u=[p,p,1,1];let v=E==="py"&&c.top?{...c.top,s:i.s}:i;this.quad(w[0],w[1],w[2],w[3],v,l,{k:u})}}cyl(t,e,s,n,r,a,i,c={}){let f=c.caps??[!0,!0],h=c.rim??[1,1],p=c.r1??n;for(let d=0;d<a;d++){let m=d/a*Math.PI*2,x=(d+1)/a*Math.PI*2,E=Math.cos(m),w=Math.sin(m),l=Math.cos(x),u=Math.sin(x),v=[t+n*E,e,s+n*w],g=[t+p*E,r,s+p*w],b=[t+p*l,r,s+p*u],L=[t+n*l,e,s+n*u],A=(n-p)/Math.max(1e-6,r-e),k=G([E,A,w]),H=G([l,A,u]),P=m*(n+p)/2,U=x*(n+p)/2;this.quad(v,g,b,L,i,[0,h[1],0,h[0]],{n:[k,k,H,H],uv:[[P,e],[P,r],[U,r],[U,e]],k:c.k}),f[1]&&p>0&&this.tri([t,r,s],b,g,i,[1,0,0]),f[0]&&this.tri([t,e,s],v,L,i,[1,0,0])}}lathe(t,e,s,n,r,a,i={}){let c=n.length,f=[];for(let d=0;d<c-1;d++){let m=n[d+1][0]-n[d][0],x=n[d+1][1]-n[d][1];f.push(G([x,-m,0]))}let h=n.map((d,m)=>{let x=f[Math.max(0,m-1)],E=f[Math.min(c-2,m)];return G([x[0]+E[0],x[1]+E[1],0])}),p=i.edges||[];for(let d=0;d<r;d++){let m=d/r*Math.PI*2,x=(d+1)/r*Math.PI*2,E=Math.cos(m),w=Math.sin(m),l=Math.cos(x),u=Math.sin(x);for(let v=0;v<c-1;v++){let[g,b]=n[v],[L,A]=n[v+1],k=[t+g*E,e+b,s+g*w],H=[t+L*E,e+A,s+L*w],P=[t+L*l,e+A,s+L*u],U=[t+g*l,e+b,s+g*u],Q=i.flat?f[v]:h[v],O=i.flat?f[v]:h[v+1];this.quad(k,H,P,U,a,[0,p[v+1]?1:0,0,p[v]?1:0],{n:[[Q[0]*E,Q[1],Q[0]*w],[O[0]*E,O[1],O[0]*w],[O[0]*l,O[1],O[0]*u],[Q[0]*l,Q[1],Q[0]*u]],uv:[[m*1.2,b],[m*1.2,A],[x*1.2,A],[x*1.2,b]]})}}}poly(t,e,s={}){for(let n=1;n<t.length-1;n++)this.tri(t[0],t[n],t[n+1],e,[1,n===t.length-2?1:0,n===1?1:0],s)}blob(t,e,s,n,r,a,i,c={}){let f=c.sub??1,h=c.seed??0,p=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let x=0;x<f;x++){let E=[];for(let[w,l,u]of p){let v=G([(w[0]+l[0])/2,(w[1]+l[1])/2,(w[2]+l[2])/2]),g=G([(l[0]+u[0])/2,(l[1]+u[1])/2,(l[2]+u[2])/2]),b=G([(u[0]+w[0])/2,(u[1]+w[1])/2,(u[2]+w[2])/2]);E.push([w,v,b],[v,l,g],[b,g,u],[v,g,b])}p=E}let d=x=>1+(c.lump??.12)*Math.sin(x[0]*5.1+h)*Math.sin(x[1]*4.3+h*1.7)*Math.sin(x[2]*3.7+h*.3),m=x=>{let E=d(x);return[t+x[0]*n*E,e+x[1]*r*E,s+x[2]*a*E]};for(let[x,E,w]of p)this.tri(m(x),m(E),m(w),i,[0,0,0],{n:[x,E,w],k:c.k})}build(){let t=new C.BufferGeometry;return t.setAttribute("position",new C.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new C.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new C.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new C.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new C.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new C.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}};var $=[[0,1,2],[1,2,0],[2,0,1]],Kt=[1,2,0];function $t(o,t){let e=[0,0,0];for(let s=0;s<3;s++)e[$[o][s]]=t[s];return e}function Zt(o){let t=new Array(16).fill(0);for(let e=0;e<3;e++)t[e*4+$[o][e]]=1;return t[15]=1,t}var Mt={foot:[4,9],v0:5.4,v1:8.6,laneSplit:7,thick:.8},ut=7.8,ft=6.2,Jt=[{box:[7.2,9,4,9,12.5,5.4],style:"plaster"},{box:[7.05,12.5,4,9,12.75,5.55],style:"cornice"},{box:[0,13.2,2.6,3.4,16.6,5],style:"plaster"},{box:[3.4,13.05,2.6,3.65,16.6,5.15],style:"cornice"},{box:[0,6,13.6,2,6.4,16.6],style:"stone"},{box:[1.75,6.4,13.6,2,7.3,16.6],style:"stone"},{box:[0,6.4,13.6,1.75,7.3,13.85],style:"stone"},{box:[0,6.4,16.35,1.75,7.3,16.6],style:"stone"}],ko=[{n:0,c:0,up:1,ac:2,upR:[13,9+6.5],acR:[7.15,8.45],r:.65,depth:.8},{n:1,c:9,up:0,ac:2,upR:[4,4+2.5],acR:[5.55,6.85],r:.65,depth:1.2},{n:2,c:5.4,up:1,ac:0,upR:[9,9+2.5],acR:[7.45,8.75],r:.65,depth:1},{n:2,c:5,up:0,ac:1,upR:[0,2.5],acR:[14,15.3],r:.65,depth:1.2},{n:2,c:0,up:1,ac:0,upR:[0,2.5],acR:[5.35,6.65],r:.65,depth:.9},{n:0,c:0,up:1,ac:2,upR:[6.4,8.9],acR:[14.45,15.75],r:.65,depth:.9},{n:0,c:0,up:1,ac:2,upR:[0,3.2],acR:[7.4,11.6],r:2.1,depth:.8,through:!0}];function to(){let o=[];for(let t=0;t<3;t++)for(let e of ko)o.push({...e,n:$[t][e.n],up:$[t][e.up],ac:$[t][e.ac],world:t});return o}var at={arch:[7.4,11.6],path:[8.7,10.3],shrubs:[[7.55,1.55,.55],[4.5,4.1,.8],[6.2,4.9,.6],[10.95,1.5,.45]],tree:[5.9,2.5]};var Po=o=>13+.25-o,oo=[{id:"up-to-wall",up:1,pts:[[8.1,9,4.95],[8.1,9,ut],[4+.25,9,ut],[.25,Po(.25),ut],[-.45,13,ut]],stair:[2]},{id:"other-down-to-block",up:0,pts:[[0,14.65,4.55],[0,14.65,ft],[0,13+.25,ft],[4,9+.25,ft],[4,9-.45,ft]],stair:[2]},{id:"floor-to-garden",up:1,pts:[[6,0,-.45],[6,0,9.5],[-4.6,0,9.5]],stair:[],fadeEnd:2.6},{id:"balcony",up:1,pts:[[-.45,6.4,15.1],[1,6.4,15.1],[1,6.4,14.35]],stair:[],linger:!0}];var Co=to(),F=1e-6,T={flag:M(14077112,Yt),plaster:M(13879474,y.PLASTER),stone:M(13352871,y.ASHLAR),stair:M(13682094,y.PLASTER),cornice:M(12563355,y.PLAIN),void:M(2038809,zt,{w:1}),poche:M(3814445,y.PLAIN,{w:1}),grass:M(9411177,y.GRASS,{w:1}),gravel:M(13221798,y.COBBLE,{w:1}),hedge:M(6254662,y.FOLIAGE,{w:1}),bark:M(5982779,y.PLAIN,{w:1}),leaf:M(7307084,y.FOLIAGE,{w:1}),flower:M(13208940,y.PLAIN,{w:1}),soil:M(8219218,y.GRASS,{w:1}),basin:M(13616560,y.PLAIN,{w:1}),roof:M(9400156,y.PLAIN),jamb:M(10129276,y.PLASTER)};function mt(o,t){return[o[0]-t[0],o[1]-t[1],o[2]-t[2]]}function eo(o,t){return[o[1]*t[2]-o[2]*t[1],o[2]*t[0]-o[0]*t[2],o[0]*t[1]-o[1]*t[0]]}function no(o,t){return o[0]*t[0]+o[1]*t[1]+o[2]*t[2]}function B(o,t,e,s,n,r,a,i=[1,1,1,1]){let c=eo(mt(e,t),mt(s,t));no(c,r)>=0?o.quad(t,e,s,n,a,i):o.quad(t,n,s,e,a,[i[3],i[2],i[1],i[0]])}function so(o,t,e,s,n,r,a=[1,1,1]){let i=eo(mt(e,t),mt(s,t));no(i,n)>=0?o.tri(t,e,s,r,a):o.tri(t,s,e,r,[a[0],a[2],a[1]])}function Z(o,t=1){let e=[0,0,0];return e[o]=t,e}function rt(o,t,e,s,n,r,a=0){let i=[0,0,0];return i[o]=t-a,i[e]=s,i[n]=r,i}function it(o,t,e,s,n,r,a={}){let i=(t+1)%3,c=(t+2)%3,f=Z(t),h=(a.noHoles?[]:Co).filter(l=>l.n===t&&Math.abs(l.c-e)<F).map(l=>{let u=l.up===i,v=l.r||0,g=[l.upR[0],l.upR[1]+v],b=u?{a:l.upR,b:l.acR}:{a:l.acR,b:l.upR},L=u?{a:g,b:l.acR}:{a:l.acR,b:g},A=v>0?u?{a:[l.upR[1],g[1]],b:l.acR}:{a:l.acR,b:[l.upR[1],g[1]]}:null;return{d:l,hole:b,box:L,arch:A,upA:u}}).filter(l=>l.box.a[1]>s[0]+F&&l.box.a[0]<s[1]-F&&l.box.b[1]>n[0]+F&&l.box.b[0]<n[1]-F),p=new Set([s[0],s[1]]),d=new Set([n[0],n[1]]);for(let l of h){for(let u of[l.box.a[0],l.box.a[1],l.hole.a[0],l.hole.a[1]])u>s[0]&&u<s[1]&&p.add(u);for(let u of[l.box.b[0],l.box.b[1],l.hole.b[0],l.hole.b[1]])u>n[0]&&u<n[1]&&d.add(u)}let m=[...p].sort((l,u)=>l-u),x=[...d].sort((l,u)=>l-u),E=(l,u,v)=>u>l.a[0]-F&&u<l.a[1]+F&&v>l.b[0]-F&&v<l.b[1]+F,w=(l,u)=>{if(l<0||u<0||l>=m.length-1||u>=x.length-1)return"out";let v=(m[l]+m[l+1])/2,g=(x[u]+x[u+1])/2;for(let b of h){if(E(b.hole,v,g))return"hole";if(b.arch&&E(b.arch,v,g))return"arch"}return"solid"};for(let l=0;l<m.length-1;l++)for(let u=0;u<x.length-1;u++){if(w(l,u)!=="solid")continue;let v=b=>b==="out"||b==="hole"?1:0,g=[v(w(l,u-1)),v(w(l+1,u)),v(w(l,u+1)),v(w(l-1,u))];B(o,rt(t,e,i,m[l],c,x[u]),rt(t,e,i,m[l+1],c,x[u]),rt(t,e,i,m[l+1],c,x[u+1]),rt(t,e,i,m[l],c,x[u+1]),f,r,g)}for(let l of h)No(o,t,e,i,c,l,r,s,n)}function Bo(o,t,e){return o.upA?[e,t]:[t,e]}function No(o,t,e,s,n,r,a,i,c){let f=r.d,h=f.depth,p=f.r||0,[d,m]=f.acR,[x,E]=f.upR,w=f.up,l=f.ac,u=(g,b,L)=>{let[A,k]=Bo(r,g,b);return rt(t,e,s,A,n,k,L)},v=(f.through,T.jamb);if(p>0){let g=Math.max(8,Math.round(p*9)),b=(d+m)/2,L=E+p,A=H=>{let P=Math.PI*(1-H/g);return[b+p*Math.cos(P),E+p*Math.sin(P)]},k=r.upA?L>=i[1]-F:L>=c[1]-F;for(let H=0;H<g;H++){let[P,U]=A(H),[Q,O]=A(H+1),Nt=H===0?d:P,Vt=H===g-1?m:Q;B(o,u(Nt,U,0),u(Vt,O,0),u(Vt,L,0),u(Nt,L,0),Z(t),a,[1,0,k?1:0,0]);let Qt=[(P+Q)/2-b,(U+O)/2-E],gt=[0,0,0];gt[l]=-Qt[0],gt[w]=-Qt[1],B(o,u(P,U,0),u(Q,O,0),u(Q,O,h),u(P,U,h),gt,v,[1,0,1,0])}}else B(o,u(d,E,0),u(m,E,0),u(m,E,h),u(d,E,h),Z(w,-1),v);if(B(o,u(d,x,0),u(d,E,0),u(d,E,h),u(d,x,h),Z(l,1),v,[1,p>0?0:1,1,1]),B(o,u(m,x,0),u(m,E,0),u(m,E,h),u(m,x,h),Z(l,-1),v,[1,p>0?0:1,1,1]),B(o,u(d,x,0),u(m,x,0),u(m,x,h),u(d,x,h),Z(w,1),v),!f.through){let g=Z(t);if(B(o,u(d,x,h),u(m,x,h),u(m,E,h),u(d,E,h),g,T.void,[0,0,0,0]),p>0){let b=Math.max(8,Math.round(p*9)),L=(d+m)/2;for(let A=0;A<b;A++){let k=Math.PI*(1-A/b),H=Math.PI*(1-(A+1)/b);so(o,u(L,E,h),u(L+p*Math.cos(k),E+p*Math.sin(k),h),u(L+p*Math.cos(H),E+p*Math.sin(H),h),g,T.void,[0,0,0])}}}}function Vo(o,t,e,s={}){let[n,r,a,i,c,f]=t,h=[n,r,a],p=[i,c,f];for(let d=0;d<3;d++){if(s.skip&&s.skip.includes(d))continue;let m=(d+1)%3,x=(d+2)%3;it(o,d,p[d],[h[m],p[m]],[h[x],p[x]],s.top&&d===1?s.top:e)}}function Qo(o){let[t,e]=Mt.foot,{v0:s,v1:n,thick:r}=Mt,a=T.stair;for(let i=0;i<8;i++){let c=t-i*.5,f=e+i*.5,h=c-.5,p=f+.5;B(o,[c,f,s],[c,f,n],[c,p,n],[c,p,s],[1,0,0],a),B(o,[c,p,s],[c,p,n],[h,p,n],[h,p,s],[0,1,0],a),B(o,[c,f-r,n],[h,p-r,n],[h,p,n],[c,p,n],[0,0,1],a,[1,0,1,i===0?1:0])}}function Oo(o,t){o.push(new Lt.Matrix4().makeRotationY(-Math.PI/2));let[e,s]=at.arch,n=.8,r=6.4;B(o,[e-1-n,0,n],[s+.6-n,0,n],[s+.6-r,0,r],[e-1-r,0,r],[0,1,0],T.grass,[0,0,0,0]);let[a,i]=at.path;B(o,[a,.02,n],[i,.02,n],[i,.02,5.2],[a,.02,5.2],[0,1,0],T.gravel,[0,1,0,1]);for(let[h,p,d]of at.shrubs)d&&(o.cyl(h,0,p,.07,d*.7,6,T.bark,{}),o.blob(h,d*1.25,p,d,d*.9,d,T.leaf,{sub:2,lump:.14,seed:h*3.1}));let[c,f]=at.tree;t===0?(o.cyl(c,0,f,.1,2.8,7,T.bark,{r1:.06}),o.blob(c,3.2,f,.85,.8,.8,T.leaf,{sub:2,lump:.16,seed:4.2}),o.blob(c+.45,2.6,f+.2,.55,.5,.55,T.leaf,{sub:2,lump:.16,seed:7.7})):t===1?(o.cyl(c,0,f,.09,.5,6,T.bark,{}),o.lathe(c,0,f,[[0,.4],[.5,.9],[.62,1.8],[.5,2.9],[.28,3.7],[0,4.2]],10,T.hedge,{})):(o.lathe(c,0,f,[[.95,0],[.95,.45],[.8,.45],[.8,.3],[0,.3]],16,T.basin,{edges:[1,1,1,0,0]}),o.cyl(c,.3,f,.1,1.1,8,T.basin,{}),o.blob(c,1.25,f,.22,.2,.22,T.leaf,{sub:1,lump:.1})),o.box(a-1,0,1.3,a-.15,.18,5,T.soil,{});for(let h=0;h<9;h++){let p=1.55+h*.4,d=a-.55+.22*Math.sin(h*2.3);o.blob(d,.36,p,.15,.12,.15,h%3?T.flower:T.leaf,{sub:1,lump:.08,seed:h})}o.pop()}function Fo(o){it(o,1,0,[0,17],[0,17],T.flag),it(o,0,17,[-.8,0],[0,17],T.poche,{noHoles:!0}),it(o,2,17,[-.8,17],[-.8,0],T.poche,{noHoles:!0})}function Go(o,t){let s=9,n=4,r=5.55,a=12.75,i=(7.05+s)/2,c=(n+r)/2;if(t===1){let f=[i,a+1.1,c],h=[[7.05,a,n],[s,a,n],[s,a,r],[7.05,a,r]];for(let p=0;p<4;p++)so(o,h[p],h[(p+1)%4],f,[h[p][0]+h[(p+1)%4][0]-2*i,1,h[p][2]+h[(p+1)%4][2]-2*c],T.roof)}else t===2&&(o.lathe(i,a,c,[[.72,0],[.72,.12],[.62,.45],[.4,.75],[0,.88]],14,T.roof,{edges:[1,1,0,0,0]}),o.cyl(i,a+.86,c,.05,a+1.25,6,T.cornice,{}))}function _o(o,t){Fo(o),it(o,1,9,[4,9],[4,9],T.stone),Qo(o);for(let e of Jt){let[s,n,r,a,i,c]=e.box;Vo(o,[s,n,r,a,i,c],T[e.style])}Oo(o,t),Go(o,t)}function ao(){let o=new _;for(let t=0;t<3;t++)o.push(new Lt.Matrix4().fromArray(Zt(t))),_o(o,t),o.pop();return o.build()}var I=ot(K(),1);var Y=ot(K(),1);var Do=new Y.Vector3(0,1,0);function et(o,t,e,s,n,r={}){let a=new Y.Vector3(e[0]-t[0],e[1]-t[1],e[2]-t[2]),i=a.length();if(i<1e-6)return;let c=new Y.Quaternion().setFromUnitVectors(Do,a.normalize()),f=new Y.Matrix4().compose(new Y.Vector3(t[0],t[1],t[2]),c,new Y.Vector3(1,1,1));o.push(f),o.cyl(0,0,0,s,i,r.seg??6,n,{r1:r.r1??s*.85,rim:r.rim??[0,1],caps:r.caps??[!1,!0]}),o.pop()}var he=M(14268832,y.PLAIN),pe=M(3878953,y.PLAIN);var ro=[11754046,5016151,4155558],qo=15129805;function Uo(o,t){return new I.Color(o).multiplyScalar(t).getHex()}function Wo(o){let t=M(ro[o],y.PLAIN,{w:1}),e=M(Uo(ro[o],.55),y.PLAIN,{w:1}),s=M(qo,y.PLAIN,{w:1}),n=M(2959653,y.PLAIN,{w:1}),r={},a=new _;return a.cyl(0,.86,0,.15,1.12,10,e,{r1:.16,rim:[0,0]}),a.cyl(0,1.08,0,.165,1.5,10,t,{r1:.2,rim:[1,0]}),a.blob(0,1.48,0,.21,.07,.15,t,{sub:1,lump:0}),et(a,[0,1.5,0],[0,1.62,.01],.055,s,{seg:6}),a.blob(0,1.72,.015,.11,.135,.12,s,{sub:2,lump:0}),r.body=a.build(),a=new _,et(a,[0,0,0],[0,-.45,0],.085,e,{r1:.065,seg:7}),r.thigh=a.build(),a=new _,et(a,[0,0,0],[0,-.4,0],.062,e,{r1:.05,seg:7}),a.box(-.05,-.47,-.06,.05,-.4,.15,n,{}),r.shin=a.build(),a=new _,et(a,[0,0,0],[0,-.29,0],.06,t,{r1:.05,seg:6}),r.upper=a.build(),a=new _,et(a,[0,0,0],[0,-.26,0],.045,s,{r1:.04,seg:6}),a.blob(0,-.29,0,.045,.05,.04,s,{sub:0,lump:0}),r.fore=a.build(),r}var kt=class{constructor(t,e){this.uniforms={...e,uFade:{value:1},uLift:{value:.42}};let s=lt(this.uniforms,{transparent:!0});this.mat=s;let n=r=>{let a=new I.Mesh(r,s);return a.frustumCulled=!1,a};this.root=new I.Group,this.root.matrixAutoUpdate=!1,this.body=new I.Group,this.root.add(this.body),this.body.add(n(t.body)),this.legs=[];for(let r of[-1,1]){let a=new I.Group;a.position.set(.09*r,.9,0),a.add(n(t.thigh));let i=new I.Group;i.position.set(0,-.45,0),i.add(n(t.shin)),a.add(i),this.body.add(a),this.legs.push({hip:a,knee:i})}this.arms=[];for(let r of[-1,1]){let a=new I.Group;a.position.set(.215*r,1.44,0),a.rotation.z=.08*r,a.add(n(t.upper));let i=new I.Group;i.position.set(0,-.29,0),i.add(n(t.fore)),a.add(i),this.body.add(a),this.arms.push({sh:a,el:i})}}pose(t,e,s){for(let r=0;r<2;r++){let a=t+r*Math.PI,i=Math.sin(a),c=Math.cos(a),f=Math.max(0,c),h=(.42*i+e*(.3+.35*f))*s,p=(.12+.75*f*f+e*.45*f)*s;this.legs[r].hip.rotation.x=-h,this.legs[r].knee.rotation.x=p,this.arms[r].sh.rotation.x=.38*Math.sin(a+Math.PI)*s,this.arms[r].el.rotation.x=-(.18+.12*s)}let n=this.legs;this.body.position.y=(.03*Math.abs(Math.cos(t))-.035-e*.05)*s,this.body.rotation.x=(.05+e*.12)*s}};function Yo(o,t){let e=o.pts.map(c=>$t(t,c)),s=$[t][o.up],n=Kt.indexOf(s),r=[],a=0;for(let c=0;c<e.length-1;c++){let f=new I.Vector3(...e[c]),h=new I.Vector3(...e[c+1]),p=f.distanceTo(h);r.push({a:f,b:h,len:p,s0:a,stair:o.stair.includes(c)}),a+=p}let i=new I.Vector3;return i.setComponent(s,1),{...o,segs:r,total:a,up:i,world:n,k:t}}function At(o,t){t=Math.min(o.total,Math.max(0,t));for(let s of o.segs)if(t<=s.s0+s.len+1e-9){let n=s.len>0?(t-s.s0)/s.len:0;return{p:s.a.clone().lerp(s.b,n),stair:s.stair}}let e=o.segs[o.segs.length-1];return{p:e.b.clone(),stair:e.stair}}function io(o){return o=Math.min(1,Math.max(0,o)),o*o*(3-2*o)}var ct=1.1,zo=1.4,It=1.16,Ht=46,Xo={"up-to-wall":[{mode:"pingpong",phase:0}],"other-down-to-block":[{mode:"pingpong",phase:.5+6/46}],"floor-to-garden":[{mode:"pingpong",phase:.21,lat:-.35},{mode:"pingpong",phase:.71,lat:.35}],balcony:[{mode:"linger",phase:.33}]},xt=class{constructor(t,e){this.list=[];let s=[0,1,2].map(Wo);for(let n=0;n<3;n++)for(let r of oo){let a=Yo(r,n);for(let i of Xo[r.id]||[]){let c=new kt(s[a.world],e);t.add(c.root),this.list.push({w:a,fig:c,plan:i,k:n,phase:0,dir:new I.Vector3,last:null})}}}timeline(t,e){let{w:s,plan:n,k:r}=t,a=s.total/ct,i=((e/Ht+n.phase+r*.137)%1+1)%1*Ht;if(n.mode==="pingpong"){let f=Ht/2;return i<a?{s:i*ct,fwd:1,on:!0}:i>=f&&i<f+a?{s:s.total-(i-f)*ct,fwd:-1,on:!0}:{on:!1}}let c=12;return i<a?{s:i*ct,fwd:1,on:!0}:i<a+c?{s:s.total,fwd:1,on:!0,still:!0}:i<2*a+c?{s:s.total-(i-a-c)*ct,fwd:-1,on:!0}:{on:!1}}update(t){let e=new I.Matrix4,s=new I.Vector3,n=new I.Vector3;for(let r of this.list){let{w:a,fig:i,plan:c}=r,f=this.timeline(r,t);if(i.root.visible=f.on,!f.on)continue;let h=At(a,f.s),p=At(a,f.s+.3*f.fwd),d=At(a,f.s-.3*f.fwd);if(n.subVectors(p.p,d.p),n.addScaledVector(a.up,-n.dot(a.up)),n.lengthSq()<1e-6&&n.copy(r.dir.lengthSq()?r.dir:new I.Vector3(1,0,0)),n.normalize(),f.still){let l=a.segs[a.segs.length-1];n.subVectors(l.b,l.a).normalize()}r.dir.copy(n),s.crossVectors(a.up,n).normalize();let m=h.p.clone();c.lat&&m.addScaledVector(s,c.lat),e.makeBasis(s.multiplyScalar(It),a.up.clone().multiplyScalar(It),n.clone().multiplyScalar(It)).setPosition(m),i.root.matrix.copy(e),i.root.matrixWorldNeedsUpdate=!0;let x=f.s/zo*Math.PI*2*f.fwd;i.pose(x,h.stair?1:0,f.still?0:1);let E=a.fadeEnd||.75,w=io(f.s/.75);a.id!=="balcony"&&(w*=io((a.total-f.s)/E)),i.uniforms.uFade.value=w,i.root.visible=w>.01}}};var Pt=277/294,jo=32.6,j=document.getElementById("scene"),nt=new S.WebGLRenderer({canvas:j,antialias:!0,powerPreference:"high-performance"});nt.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var St=new S.Color(15525333),uo=new S.Color(15197144);nt.setClearColor(St,1);var Ct=new S.Scene,J=Xt(),fo=new S.Mesh(ao(),lt(J));fo.frustumCulled=!1;Ct.add(fo);var ho=new xt(Ct,J),z=new S.OrthographicCamera(-1,1,1,-1,1,400),co=new S.Vector3(17/2,17/2,17/2),Et=new S.Vector3(1,1,1).normalize(),Ko=new S.Vector3(0,1,0).addScaledVector(Et,-Et.y).normalize(),wt=Pt,V={roll:0,zoom:1};function tt(){z.position.copy(co).addScaledVector(Et,120),z.up.copy(Ko).applyAxisAngle(Et,V.roll),z.lookAt(co);let o=jo/2/V.zoom;z.left=-o*wt,z.right=o*wt,z.top=o,z.bottom=-o,z.updateProjectionMatrix()}Gt(Pt,(o,t)=>{nt.setSize(o,t),wt=o/t,V.zoom=Math.min(1,wt/Pt),tt()});_t();var R={litho:1,lithoTarget:1,playing:!0,t:8,down:0,tween:null};var $o=["Gravity I is down: the terracotta figures stand upright","Gravity II is down: the green figures stand upright","Gravity III is down: the blue figures stand upright"];Dt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],o=>{R.lithoTarget=o,document.body.classList.toggle("colour",o===0)},1);var Bt=[0,1,2].map(o=>document.getElementById(`btn-g${o}`)),vt=0;function Zo(o){return o<.5?4*o*o*o:1-Math.pow(-2*o+2,3)/2}function q(o,t){let s=o*2*Math.PI/3-V.roll;s=(s%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI,R.down=o,Bt.forEach((n,r)=>n.setAttribute("aria-pressed",String(r===o))),t||Math.abs(s)<1e-4?(V.roll+=s,R.tween=null,tt()):R.tween={from:V.roll,to:V.roll+s,t:0,dur:1.2+Math.abs(s)*.6},bt(!0,$o[o]),vt=3.5}Bt.forEach((o,t)=>o.addEventListener("click",()=>q(t)));document.getElementById("btn-turn").addEventListener("click",()=>q((R.down+1)%3));Bt[0].setAttribute("aria-pressed","true");var Jo=Ut(o=>{R.playing=o});qt({" ":()=>Jo(!R.playing),l:()=>document.getElementById(R.lithoTarget?"btn-colour":"btn-litho").click(),t:()=>q((R.down+1)%3),1:()=>q(0),2:()=>q(1),3:()=>q(2),0:()=>q(R.down)});var X=null;function po(o){let t=j.getBoundingClientRect();return Math.atan2(o.clientY-(t.top+t.height/2),o.clientX-(t.left+t.width/2))}j.addEventListener("pointerdown",o=>{j.setPointerCapture(o.pointerId),X={a:po(o),moved:0},R.tween=null});j.addEventListener("pointermove",o=>{if(!X)return;let t=po(o),e=t-X.a;e=(e+3*Math.PI)%(2*Math.PI)-Math.PI,X.a=t,X.moved+=Math.abs(e),V.roll+=e,tt()});var mo=()=>{if(!X)return;let o=X.moved;X=null;let t=2*Math.PI/3,e=(Math.round(V.roll/t)%3+3)%3;o>.02&&q(e)};j.addEventListener("pointerup",mo);j.addEventListener("pointercancel",mo);j.addEventListener("dblclick",()=>q(0));var lo=performance.now();function xo(o){let t=Math.min(.05,Math.max(0,(o-lo)/1e3));if(lo=o,R.playing&&(R.t+=t),J.uTime.value=R.t,R.litho!==R.lithoTarget){let e=R.lithoTarget-R.litho;R.litho+=Math.sign(e)*Math.min(Math.abs(e),t*2.2),nt.setClearColor(St.clone().lerp(uo,1-R.litho),1)}if(J.uLitho.value=R.litho,J.uTint.value=1-R.litho,R.tween){let e=R.tween;e.t=Math.min(1,e.t+t/e.dur),V.roll=e.from+(e.to-e.from)*Zo(e.t),e.t>=1&&(R.tween=null),tt()}vt>0&&(vt-=t,vt<=0&&bt(!1)),ho.update(R.t),nt.render(Ct,z),requestAnimationFrame(xo)}tt();Wt();requestAnimationFrame(xo);window.__page={state:R,view:V,walkers:ho,turnTo:q,updateCamera:tt,setTime:o=>{R.t=o},setRoll:o=>{V.roll=o,R.tween=null,tt()},setLitho:o=>{R.litho=R.lithoTarget=o,J.uLitho.value=o,J.uTint.value=1-o,nt.setClearColor(St.clone().lerp(uo,1-o),1)}};})();
