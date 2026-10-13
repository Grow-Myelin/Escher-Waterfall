(()=>{var ie=Object.create;var Mt=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var re=Object.getOwnPropertyNames;var ce=Object.getPrototypeOf,le=Object.prototype.hasOwnProperty;var fe=(o,t)=>()=>{try{return t||o((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}};var he=(o,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of re(t))!le.call(o,a)&&a!==e&&Mt(o,a,{get:()=>t[a],enumerable:!(n=se(t,a))||n.enumerable});return o};var at=(o,t,e)=>(e=o!=null?ie(ce(o)):{},he(t||!o||!o.__esModule?Mt(e,"default",{value:o,enumerable:!0}):e,o));var K=fe((Le,Rt)=>{Rt.exports=window.THREE});var c=at(K(),1);function Ht(o,t){let e=document.getElementById("frame"),n=()=>{let s=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),v=document.getElementById("controls"),u=(r?r.offsetHeight:0)+6+13,x=(v?v.offsetHeight:0)+8+13,m=window.innerWidth-s*2,p=window.innerHeight-u-x,f=p,l=f*o;l>m&&(l=m,f=l/o),l=Math.max(160,Math.floor(l)),f=Math.max(120,Math.floor(f)),e.style.width=`${l}px`,e.style.height=`${f}px`,e.style.top=`${u+Math.max(0,(p-f)/2)}px`,t?.(l,f)};return window.addEventListener("resize",n),n(),n}function St(){let o=document.getElementById("panel"),t=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!o)return;let n=a=>{a?o.removeAttribute("hidden"):o.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(a))};t?.addEventListener("click",()=>n(o.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function kt(o,t,e){let n=a=>{for(let[s,r]of o)s.setAttribute("aria-pressed",String(r===a));t(a)};for(let[a,s]of o)a.addEventListener("click",()=>n(s));return e!==void 0&&n(e),n}function Ft(o){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let e=o[t.key.length===1?t.key.toLowerCase():t.key];e&&(t.preventDefault(),e(t))})}function Pt(o,t=!0){let e=document.getElementById("btn-play"),n=a=>{t=a,e&&(e.setAttribute("aria-pressed",String(!a)),e.querySelector("span").textContent=a?"Pause":"Play",e.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),o(a)};return e?.addEventListener("click",()=>n(!t)),n(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function Lt(){document.body.classList.add("ready")}var i=at(K(),1);var V=`
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
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
`,D=`
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float dist, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.03 + gw * 0.025) * uGrain;

  float L = pow(max(dot(col, vec3(0.30, 0.59, 0.11)), 0.0), 0.85);
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = uHatch * max(dist, 0.2);
  float hfw = fwidth(huv.x) + fwidth(huv.y);
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
  v += (g * 0.12 + gw * 0.07) * uGrain;
  v = clamp(v, 0.0, 1.0);
  v *= 1.0 - ink * 0.92;
  vec3 litho = mix(uInk, uPaper, v);
  return mix(colour, litho, uLitho);
}
`,I=`
uniform float uLitho;
uniform float uHatch;
uniform float uGrain;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
`,nt=`
uniform float uWaveT;
uniform vec4 uDrops[8];   // x, z, start time, amplitude
float waveH(vec2 p) {
  float t = uWaveT;
  float h = 0.0;
  h += 0.0022 * sin(dot(p, vec2(0.80, 0.60)) * 2.3 + t * 1.35);
  h += 0.0016 * sin(dot(p, vec2(-0.35, 0.94)) * 3.6 + t * 1.8 + 1.0);
  h += 0.0009 * sin(dot(p, vec2(0.96, -0.28)) * 6.1 + t * 2.4 + 2.0);
  h += 0.0005 * sin(dot(p, vec2(-0.6, -0.8)) * 10.3 + t * 3.2 + 0.5);
  h += 0.0003 * sin(dot(p, vec2(0.2, -0.98)) * 17.0 + t * 4.1 + 4.0);
  for (int i = 0; i < 8; i++) {
    vec4 d = uDrops[i];
    float age = t - d.z;
    if (age > 0.0 && age < 9.0 && d.w > 0.0) {
      float r = length(p - d.xy);
      float front = 0.08 + age * 0.32;
      float x = r - front;
      float env = exp(-x * x * 30.0) * exp(-age * 0.42) / (1.0 + r * 2.5);
      h += d.w * env * cos(x * 38.0);
    }
  }
  return h;
}
vec3 waveN(vec2 p) {
  float e = 0.012;
  float h0 = waveH(p);
  float hx = waveH(p + vec2(e, 0.0));
  float hz = waveH(p + vec2(0.0, e));
  return normalize(vec3(h0 - hx, e, h0 - hz));
}
`,At=`
// Unpolarised reflectance of a smooth boundary (exact Fresnel equations).
// cosi: cosine of the angle of incidence; eta = n1 / n2.
float fresnelExact(float cosi, float eta) {
  float s2 = eta * eta * (1.0 - cosi * cosi);
  if (s2 >= 1.0) return 1.0;
  float cost = sqrt(1.0 - s2);
  float rs = (eta * cosi - cost) / (eta * cosi + cost);
  float rp = (cosi - eta * cost) / (cosi + eta * cost);
  return 0.5 * (rs * rs + rp * rp);
}
`,it=`
float leafSDF(vec2 p, float kind, out float vein) {
  float x = p.x, y = p.y;
  float s = clamp(x + 0.5, 0.0, 1.0);   // 0 at the stalk, 1 at the tip
  float w;
  if (kind < 0.5) {
    // oak: wavy lobes
    w = 0.33 * pow(sin(3.14159 * pow(s, 0.85)), 0.8);
    w *= 0.78 + 0.22 * cos(s * 31.0 + 0.6);
  } else if (kind < 1.5) {
    // lime: heart shaped with a drawn-out tip and a fine serration
    w = 0.46 * pow(sin(3.14159 * pow(s, 0.62)), 1.15) * (1.0 - 0.12 * s);
    w *= 1.0 - 0.03 * abs(sin(s * 70.0));
  } else {
    // willow: long and narrow
    w = 0.13 * pow(sin(3.14159 * s), 0.9);
  }
  float d = abs(y) - w;
  d = max(d, abs(x) - 0.5);
  // the stalk
  float stalk = max(abs(y) - 0.012, max(-(x + 0.66), x + 0.47));
  d = min(d, stalk);
  // veins: the midrib and side veins slanting towards the tip
  float side = abs(fract((s - abs(y) * 0.9) * (kind > 1.5 ? 9.0 : 6.0)) - 0.5);
  vein = max(1.0 - smoothstep(0.0, 0.018, abs(y)), (1.0 - smoothstep(0.0, 0.05, side)) * step(abs(y), w * 0.9) * 0.7);
  return d;
}
`;var y={cx:0,cz:-2.6,rx:8.6,rz:9.2},A=[{x:2.45,z:-1.95,r:.095,top:.78},{x:-3.1,z:-5.2,r:.085,top:.52}];function st(o,t){let e=(o-y.cx)/y.rx,n=(t-y.cz)/y.rz,a=Math.hypot(e,n),s=Math.atan2(n,e),r=1+.07*Math.sin(3*s+.5)+.04*Math.sin(5*s+1.3);return(a-r)*Math.min(y.rx,y.rz)}var Ct=`
float pondD(vec2 p) {
  vec2 q = (p - vec2(${y.cx.toFixed(3)}, ${y.cz.toFixed(3)})) / vec2(${y.rx.toFixed(3)}, ${y.rz.toFixed(3)});
  float r = length(q), th = atan(q.y, q.x);
  float R = 1.0 + 0.07 * sin(3.0 * th + 0.5) + 0.04 * sin(5.0 * th + 1.3);
  return (r - R) * ${Math.min(y.rx,y.rz).toFixed(3)};
}
`;function ue(o){let t=o>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var pt=class{constructor(){this.p=[],this.n=[],this.c=[],this.k=[],this.i=[]}get count(){return this.p.length/3}v(t,e,n,a){return this.p.push(t.x,t.y,t.z),this.n.push(e.x,e.y,e.z),this.c.push(n[0],n[1],n[2]),this.k.push(a),this.count-1}tri(t,e,n){this.i.push(t,e,n)}tube(t,e,n,a,s,r,v){let u=e.clone().sub(t).normalize(),x=Math.abs(u.y)<.9?new i.Vector3(0,1,0):new i.Vector3(1,0,0),m=new i.Vector3().crossVectors(u,x).normalize(),p=new i.Vector3().crossVectors(u,m),f=this.count;for(let l=0;l<=s;l++){let d=l/s*Math.PI*2,E=m.clone().multiplyScalar(Math.cos(d)).addScaledVector(p,Math.sin(d));this.v(t.clone().addScaledVector(E,n),E,r,v),this.v(e.clone().addScaledVector(E,a),E,r,v)}for(let l=0;l<s;l++){let d=f+l*2;this.tri(d,d+2,d+1),this.tri(d+1,d+2,d+3)}}build(){let t=new i.BufferGeometry;return t.setAttribute("position",new i.Float32BufferAttribute(this.p,3)),t.setAttribute("normal",new i.Float32BufferAttribute(this.n,3)),t.setAttribute("acol",new i.Float32BufferAttribute(this.c,3)),t.setAttribute("akind",new i.Float32BufferAttribute(this.k,1)),t.setIndex(this.i),t.computeBoundingSphere(),t}},Wt=[.3,.27,.24];function vt(o,t,e,n,a=new i.Vector3){let s=(u,x,m)=>u.clone().applyAxisAngle(x,m),r=(u,x,m,p,f)=>{let l=u.clone().addScaledVector(x,m*.5),d=new i.Vector3(n()-.5,n()*.3,n()-.5).multiplyScalar(m*.12);l.add(d);let E=x.clone().add(a.clone().multiplyScalar(.06*(8-f))).add(d.clone().multiplyScalar(.8/m)).normalize(),H=l.clone().addScaledVector(E,m*.5),N=p*.86,C=p*.72,B=p>.08?9:p>.03?6:p>.012?4:3;if(o.tube(u,l,p,N,B,Wt,0),o.tube(l,H,N,C,B,Wt,0),f===0)return;let zt=f>=5?2+(n()<.55?1:0):2+(n()<.25?1:0),oe=n()*Math.PI*2;for(let et=0;et<zt;et++){let Y=new i.Vector3(1,0,0);Math.abs(E.x)>.9&&Y.set(0,0,1),Y=new i.Vector3().crossVectors(E,Y).normalize(),Y.applyAxisAngle(E,oe+et/zt*Math.PI*2+n()*.6);let dt=et===0,ae=dt?.18+n()*.2:.45+n()*.5,ot=s(E,Y,ae);ot.y+=.12+(f<3?.08:0),ot.add(a.clone().multiplyScalar(.25)),ot.normalize();let ne=dt?.8+n()*.1:.62+n()*.16;r(H,ot,m*ne,C*(dt?.92:.72),f-1)}},v=e*.024;r(t.clone().setY(t.y-.4),new i.Vector3(a.x*.15,1,a.z*.15).normalize(),e*.3,v,7)}function L(o,t){let e=st(o,t),n=.12*Math.sin(o*.7+1)*Math.sin(t*.5-.3)+.06*Math.sin(o*1.9+t*1.3);return e<=0?Math.max(-.8,e*.35):Math.min(.42,e*.3)+Math.max(0,e-1)*.02+n*Math.min(1,e*.5)}function Vt(){let o=ue(1955),t=new pt;{let m=t.count;for(let p=0;p<=148;p++)for(let f=0;f<=160;f++){let l=-40+80*f/160,d=-60+74*p/148,E=L(l,d),H=.05,N=L(l-H,d)-L(l+H,d),C=L(l,d-H)-L(l,d+H),B=new i.Vector3(N,2*H,C).normalize();t.v(new i.Vector3(l,E,d),B,[.46,.44,.33],1)}for(let p=0;p<148;p++)for(let f=0;f<160;f++){let l=m+p*161+f,d=l+1,E=l+160+1,H=E+1;t.tri(l,E,d),t.tri(d,E,H)}}let e=[[-5.6,-12.4,12.5],[-1.4,-13.6,14.5],[3.2,-12.9,11.5],[7.6,-11.2,13],[11.5,-8.5,10.5],[-10.4,-8.2,11],[-13,-15,13],[10,-17,14],[.8,-19.5,15],[-8,-19,12],[15,-3,12],[-14.5,-1.5,11]];for(let[a,s,r]of e){let v=new i.Vector3(-a,0,-s-2.6).normalize().multiplyScalar(.25);vt(t,new i.Vector3(a,L(a,s),s),r,o,v)}vt(t,new i.Vector3(-9,L(-9,-3.2),-3.2),10.5,o,new i.Vector3(1.4,0,-.1)),vt(t,new i.Vector3(9.3,L(9.3,-1),-1),9.5,o,new i.Vector3(-1.3,0,-.3));for(let a of A){let s=[.42,.36,.28];t.tube(new i.Vector3(a.x,-.3,a.z),new i.Vector3(a.x,a.top,a.z),a.r,a.r*.96,14,s,2);let r=t.v(new i.Vector3(a.x,a.top+.02,a.z),new i.Vector3(0,1,0),s,2),v=[];for(let u=0;u<=14;u++){let x=u/14*Math.PI*2;v.push(t.v(new i.Vector3(a.x+Math.cos(x)*a.r*.96,a.top,a.z+Math.sin(x)*a.r*.96),new i.Vector3(Math.cos(x)*.5,.85,Math.sin(x)*.5).normalize(),s,2))}for(let u=0;u<14;u++)t.tri(r,v[u+1],v[u])}let n=16;for(let a=0;a<n;a++){let s=-2.6+a/n*2.4+o()*.12,r=1+.07*Math.sin(3*s+.5)+.04*Math.sin(5*s+1.3)-.03,v=y.cx+Math.cos(s)*y.rx*r,u=y.cz+Math.sin(s)*y.rz*r,x=10+Math.floor(o()*12);for(let m=0;m<x;m++){let p=v+(o()-.5)*.8,f=u+(o()-.5)*.6,l=.7+o()*.9,d=(o()-.5)*.35,E=(o()-.5)*.35,H=[.6+o()*.1,.52+o()*.08,.32],N=new i.Vector3(p,-.05,f),C=new i.Vector3(p+d*.5,l*.55,f+E*.5),B=new i.Vector3(p+d,l,f+E);t.tube(N,C,.008,.006,3,H,3),t.tube(C,B,.006,.0015,3,H,3)}}return t.build()}function Dt(){return{uTime:{value:0},uLitho:{value:1},uHatch:{value:.0045},uGrain:{value:1},uClip:{value:0},uSun:{value:new i.Vector3(-.55,.42,.72).normalize()},uPaper:{value:new i.Vector3(.925,.898,.835)},uInk:{value:new i.Vector3(.11,.1,.09)},uHaze:{value:new i.Vector3(.84,.85,.83)}}}var de=`
vec3 skyColour(vec3 d) {
  float el = d.y;
  vec3 col = mix(vec3(0.93, 0.92, 0.88), vec3(0.7, 0.77, 0.86), smoothstep(-0.02, 0.6, el));
  float sd = max(dot(d, uSun), 0.0);
  col += vec3(0.16, 0.13, 0.08) * pow(sd, 8.0) + vec3(0.25, 0.22, 0.15) * pow(sd, 120.0);
  vec2 cp = d.xz / (max(el, 0.0) + 0.12);
  float cl = fbm(cp * 0.9 + vec2(uTime * 0.012, 0.0));
  float cl2 = fbm(cp * 2.3 - vec2(uTime * 0.02, 3.0));
  float cover = smoothstep(0.45, 0.75, cl * 0.75 + cl2 * 0.35) * smoothstep(-0.02, 0.15, el);
  col = mix(col, vec3(0.93, 0.92, 0.89) - 0.08 * cl2, cover * 0.75);
  if (el < 0.0) col = mix(col, vec3(0.5, 0.5, 0.44), smoothstep(0.0, -0.05, el));
  return col;
}
`,ve=`
attribute vec3 acol;
attribute float akind;
varying vec3 vN;
varying vec3 vC;
varying vec3 vW;
varying float vK;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vK = akind;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,pe=`
uniform float uTime;
uniform float uClip;
uniform vec3 uSun;
${I}
varying vec3 vN;
varying vec3 vC;
varying vec3 vW;
varying float vK;
${V}
${D}
void main() {
  if (uClip > 0.5 && vW.y < 0.0) discard;
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float dist = length(cameraPosition - vW);
  float kind = floor(vK + 0.5);
  // the banks seen from underneath (only the mirrored eye can): solid earth
  bool under = kind == 1.0 && dot(n, v) < 0.0;
  vec3 base = vC;
  float tex = 1.0;
  float ink = 0.0;
  vec2 huv = vW.xz;
  if (kind == 0.0) {          // bark
    tex = 0.78 + 0.34 * vnoise(vec2((vW.x - vW.z) * 22.0, vW.y * 3.0));
    float rim = 1.0 - abs(dot(n, v));
    ink = smoothstep(0.55, 0.95, rim) * 0.85;
    huv = vec2(vW.x + vW.z, vW.y);
  } else if (kind == 1.0) {   // banks: wet mud at the water's edge, winter grass above
    float wet = 1.0 - smoothstep(0.0, 0.16, vW.y);
    vec3 grass = vec3(0.56, 0.55, 0.38) * (0.8 + 0.35 * fbm(vW.xz * 1.3));
    grass *= 0.92 + 0.12 * vnoise(vec2(vW.x * 40.0, vW.z * 6.0));
    vec3 mud = vec3(0.36, 0.31, 0.24) * (0.85 + 0.25 * fbm(vW.xz * 4.0));
    base = mix(grass, mud, wet);
    ink = (1.0 - smoothstep(0.0, 0.012, abs(vW.y - 0.01))) * 0.5;
  } else if (kind == 2.0) {   // posts
    float a = atan(n.z, n.x);
    tex = 0.75 + 0.3 * vnoise(vec2(a * 9.0, vW.y * 2.0)) + 0.1 * sin(a * 30.0 + vnoise(vec2(a, vW.y * 8.0)) * 4.0);
    base = mix(base * 0.55, base, smoothstep(0.0, 0.18, vW.y));
    float rim = 1.0 - abs(dot(n, v));
    ink = smoothstep(0.6, 0.95, rim);
    huv = vec2(a * 0.1, vW.y);
  } else {                    // reeds
    tex = 0.8 + 0.3 * vnoise(vW.xz * 30.0 + vW.y * 3.0);
    ink = 0.45;
  }
  float diff = max(dot(n, uSun), 0.0);
  float shade = 0.62 + 0.14 * n.y + 0.38 * diff;
  vec3 col = base * tex * shade;
  if (under) col = vec3(0.3, 0.26, 0.2) * (0.8 + 0.3 * fbm(vW.xz * 3.0));
  float haze = smoothstep(10.0, 55.0, dist) * 0.65;
  vec3 outc = finish(col, haze, ink, huv, dist, kind);
  gl_FragColor = vec4(outc, 1.0);
}
`,me=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,xe=`
uniform float uTime;
uniform vec3 uSun;
${I}
varying vec3 vW;
${V}
${D}
${de}
void main() {
  vec3 d = normalize(vW - cameraPosition);
  vec3 col = skyColour(d);
  vec2 huv = d.xz / (abs(d.y) + 0.2) * 3.0;
  gl_FragColor = vec4(finish(col, 0.25, 0.0, huv, 1.0, 0.0), 1.0);
}
`;function It(o){return new i.ShaderMaterial({uniforms:o,vertexShader:ve,fragmentShader:pe,side:i.DoubleSide})}function Xt(o){let t=new i.ShaderMaterial({uniforms:o,vertexShader:me,fragmentShader:xe,side:i.BackSide,depthWrite:!1}),e=new i.Mesh(new i.SphereGeometry(250,48,24),t);return e.renderOrder=-10,e.frustumCulled=!1,e}var T=at(K(),1);var we=`
uniform vec3 uFishPos;
uniform vec2 uFishDir;
uniform float uFishPhase;
uniform float uFishTurn;

float sdEll(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// world point -> the fish's own frame (x forward, y up, z to its side),
// bent by the travelling wave of swimming and by the turn it is making
const float FS = 1.3;   // the carp is 1.3 x the unit model: about 1.25 m long
vec3 fishLocal(vec3 wp) {
  vec3 q = (wp - uFishPos) / FS;
  vec3 p = vec3(dot(q.xz, uFishDir), q.y, dot(q.xz, vec2(-uFishDir.y, uFishDir.x)));
  float a = 0.008 + 0.07 * pow(clamp((0.3 - p.x) / 0.85, 0.0, 1.0), 1.5);
  p.z -= a * sin(p.x * 6.5 + uFishPhase) + uFishTurn * p.x * p.x;
  return p;
}

// a carp: deep body, blunt head, forked tail, long dorsal fin, paired fins
float fishSDF(vec3 p, out float fin) {
  float body = sdEll(p - vec3(0.05, 0.0, 0.0), vec3(0.39, 0.115, 0.09));
  float head = sdEll(p - vec3(0.27, -0.008, 0.0), vec3(0.18, 0.085, 0.076));
  float ped = sdEll(p - vec3(-0.27, 0.004, 0.0), vec3(0.19, 0.044, 0.03));
  float d = smin(smin(body, head, 0.05), ped, 0.07);
  // tail fin: a thin fan, forked at the trailing edge
  vec3 t = p - vec3(-0.42, 0.004, 0.0);
  float tx = -t.x;
  float hh = 0.028 + 0.66 * max(tx, 0.0);
  float trail = 0.17 - 0.08 * (1.0 - smoothstep(0.0, 1.0, abs(t.y) / max(hh, 1e-3)));
  float tail = max(max(max(abs(t.y) - hh, -tx) * 0.8, tx - trail), abs(t.z) - 0.006);
  // dorsal fin: tall at the front, sloping back along the spine
  float s = clamp((0.17 - p.x) / 0.36, 0.0, 1.0);
  float back = 0.095 * sqrt(max(0.0, 1.0 - pow((p.x - 0.05) / 0.39, 2.0)));
  float top = back + mix(0.075, 0.018, pow(s, 0.7));
  float dors = max(max(abs(p.x + 0.01) - 0.18, p.y - top), max(back - 0.02 - p.y, abs(p.z) - 0.004));
  // pectoral fins
  vec3 pf = vec3(p.x - 0.19, p.y + 0.07, abs(p.z) - 0.05);
  pf.yz = rot2(1.1) * pf.yz;
  pf.xz = rot2(-0.5) * pf.xz;
  float pec = sdEll(pf - vec3(-0.045, 0.0, 0.0), vec3(0.085, 0.005, 0.042));
  // pelvic and anal fins
  vec3 pv = vec3(p.x + 0.05, p.y + 0.1, abs(p.z) - 0.03);
  pv.yz = rot2(0.5) * pv.yz;
  float pel = sdEll(pv - vec3(-0.03, 0.0, 0.0), vec3(0.05, 0.005, 0.022));
  vec3 an = p - vec3(-0.22, -0.065, 0.0);
  float anal = max(max(abs(an.x) - 0.045, max(an.y, -an.y - 0.05 + an.x * 0.4)), abs(an.z) - 0.004);
  float fins = min(min(tail, dors), min(min(pec, pel), anal));
  fin = step(fins, d);
  return min(d, fins);
}
float fishMap(vec3 wp) { float f; return fishSDF(fishLocal(wp), f) * FS; }
vec3 fishNormal(vec3 wp) {
  vec2 e = vec2(0.0015, -0.0015);
  return normalize(e.xyy * fishMap(wp + e.xyy) + e.yyx * fishMap(wp + e.yyx) + e.yxy * fishMap(wp + e.yxy) + e.xxx * fishMap(wp + e.xxx));
}

// colour and line work on the fish, in its own frame
vec3 fishColour(vec3 p, vec3 n, float fin, out float lines) {
  lines = 0.0;
  float up = clamp(p.y / 0.11 * 0.5 + 0.5, 0.0, 1.0);
  vec3 back = vec3(0.2, 0.19, 0.11), flank = vec3(0.8, 0.6, 0.28), belly = vec3(0.92, 0.86, 0.68);
  vec3 c = mix(belly, flank, smoothstep(0.12, 0.45, up));
  c = mix(c, back, smoothstep(0.55, 0.9, up));
  if (fin > 0.5) {
    c = mix(vec3(0.62, 0.42, 0.26), vec3(0.38, 0.3, 0.2), smoothstep(0.0, 0.2, p.y));
    float ray = abs(fract(atan(p.y, p.x + 0.3) * 18.0) - 0.5);
    lines = (1.0 - smoothstep(0.0, 0.18, ray)) * 0.35;
    return c;
  }
  // scales: offset rows of arcs
  if (p.x < 0.25) {
    vec2 sc = vec2(p.x / 0.03, p.y / 0.024);
    float row = floor(sc.y);
    sc.x += 0.5 * mod(row, 2.0);
    vec2 f = fract(sc) - vec2(0.5, 0.0);
    float arc = abs(length(f * vec2(1.0, 1.25)) - 0.52);
    lines = max(lines, (1.0 - smoothstep(0.0, 0.1, arc)) * 0.4 * smoothstep(0.25, 0.18, p.x));
    c *= 1.0 - 0.12 * smoothstep(0.3, 0.0, fract(sc.y));
  }
  // lateral line, gill cover, eye
  lines = max(lines, (1.0 - smoothstep(0.0, 0.004, abs(p.y - 0.006 - 0.03 * p.x))) * 0.55 * step(p.x, 0.24));
  float g = length((p.xy - vec2(0.38, 0.0)) * vec2(1.0, 0.75)) - 0.14;
  lines = max(lines, (1.0 - smoothstep(0.0, 0.005, abs(g))) * 0.8 * step(p.x, 0.27));
  float e = length(vec2(p.x - 0.36, p.y - 0.025));
  c = mix(c, vec3(0.08, 0.07, 0.05), 1.0 - smoothstep(0.012, 0.016, e));
  c = mix(c, vec3(0.85, 0.75, 0.45), (1.0 - smoothstep(0.003, 0.005, abs(e - 0.019))) * 0.7);
  lines = max(lines, (1.0 - smoothstep(0.001, 0.003, abs(e - 0.022))) * 0.8);
  // the mouth
  lines = max(lines, (1.0 - smoothstep(0.0, 0.004, abs(p.y + 0.02 - 2.0 * pow(max(p.x - 0.42, 0.0), 2.0)))) * step(0.41, p.x) * 0.8);
  return c;
}
`,ye=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ee=`
uniform float uTime;
uniform sampler2D uMirror;
uniform mat4 uMirrorVP;
uniform sampler2D uShadow;
uniform vec4 uShadowBox;
uniform vec3 uSun;
uniform vec3 uSunUW;
uniform vec4 uPosts[2];
uniform vec3 uWorlds;
uniform float uDebug;
${I}
varying vec3 vW;
${V}
${D}
${nt}
${At}
${it}
${Ct}
${we}

const float ETA = 1.0 / 1.333;
const vec3 SIGMA = vec3(0.5, 0.3, 0.38);   // absorption + scattering per metre
const vec3 MURK = vec3(0.15, 0.2, 0.17);    // light scattered back by the water itself

float reflDist(vec3 P, vec3 R) {
  vec2 c = vec2(${y.cx.toFixed(3)}, ${y.cz.toFixed(3)});
  vec2 rad = vec2(${y.rx.toFixed(3)}, ${y.rz.toFixed(3)}) * 1.12;
  vec2 o = (P.xz - c) / rad;
  vec2 d = R.xz / rad;
  float a = dot(d, d), b = dot(o, d), cc = dot(o, o) - 1.0;
  float s = (-b + sqrt(max(b * b - a * cc, 0.0))) / max(a, 1e-6);
  return clamp(s + 1.5, 1.0, 40.0);
}

float bottomY(vec2 p) {
  float deep = 1.5 + 0.2 * sin(p.x * 0.41 + 1.0) * sin(p.y * 0.33 - 0.5) + 0.05 * sin(p.x * 1.7 + p.y * 1.3);
  return max(-deep, pondD(p) * 0.35);
}

// light under the surface, seen from a point underwater: shadows of the
// floating leaves (soft, from a map rendered from above) and of the fish
float shadowAt(vec3 X) {
  vec3 S = X + uSunUW * (-X.y / uSunUW.y);
  vec2 uv = vec2(S.x - uShadowBox.x, uShadowBox.y - S.z) / uShadowBox.zw;
  float blur = log2(1.0 + (-X.y) * 18.0);
  float leaf = textureLod(uShadow, uv, blur).r;
  // the fish: an ellipse where the sun ray crosses the fish's depth
  vec3 F = X + uSunUW * ((uFishPos.y - X.y) / uSunUW.y);
  vec3 q = F - uFishPos;
  vec2 fl = vec2(dot(q.xz, uFishDir), dot(q.xz, vec2(-uFishDir.y, uFishDir.x)));
  float soft = 0.05 + max(0.0, uFishPos.y - X.y) * 0.18;
  float fe = length(fl / vec2(0.62, 0.11)) - 1.0;
  float fish = 1.0 - (1.0 - smoothstep(-soft * 4.0, soft * 6.0, fe)) * 0.55;
  return mix(1.0, leaf, 0.8) * (X.y < uFishPos.y ? fish : 1.0);
}

// moving bright webs of light focused by the ripples
float caustic(vec2 p, float t) {
  float c = 0.0;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    vec2 q = p * (2.1 + fl * 1.6) + fl * 7.3;
    vec2 i = floor(q), f = fract(q);
    float d1 = 9.0, d2 = 9.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash22(i + g);
        o = 0.5 + 0.42 * sin(t * (0.55 + 0.25 * fl) + 6.2831 * o);
        float d = length(g + o - f);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
    }
    c += pow(1.0 - smoothstep(0.0, 0.13, d2 - d1), 2.0);
  }
  return c * 0.4;
}

vec3 underLight(vec3 X, vec3 n) {
  float depth = -X.y;
  float sun = max(dot(n, uSunUW), 0.0) * shadowAt(X);
  float cau = mix(0.45, caustic(X.xz, uTime), exp(-depth * 0.6));
  vec3 down = exp(-SIGMA * depth);
  return down * (0.5 + 0.25 * max(n.y, 0.0) + sun * (0.4 + 1.2 * cau));
}

vec3 bottomColour(vec3 X, out float lines) {
  vec2 p = X.xz;
  lines = 0.0;
  vec3 c = vec3(0.46, 0.4, 0.3) * (0.8 + 0.35 * fbm(p * 2.2));
  // pebbles
  vec2 g = p / 0.15;
  vec2 i = floor(g), f = fract(g);
  float peb = 9.0;
  vec3 pc = c;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(i + o);
      if (h.x < 0.5) {
        float r = 0.18 + 0.22 * h.y;
        float d = length(o + h * 0.6 + 0.2 - f) - r;
        if (d < peb) { peb = d; pc = mix(vec3(0.55, 0.53, 0.47), vec3(0.62, 0.5, 0.34), h.y) * (0.8 + 0.3 * h.x); }
      }
    }
  }
  float inP = 1.0 - smoothstep(-0.02, 0.02, peb);
  c = mix(c, pc, inP * 0.85);
  lines = (1.0 - smoothstep(0.0, 0.05, abs(peb))) * 0.35;
  // sunken leaves, dark and soft
  vec2 lg = p / 0.8;
  vec2 li = floor(lg);
  vec2 lh = hash22(li + 31.0);
  if (lh.x < 0.45) {
    vec2 q = (fract(lg) - 0.5 - (lh - 0.5) * 0.4) * 0.8 / (0.14 + 0.06 * lh.y);
    q = rot2(lh.y * 6.28) * q;
    float vein;
    float d = leafSDF(q, floor(lh.x * 6.6), vein);
    float inL = 1.0 - smoothstep(-0.02, 0.03, d);
    c = mix(c, vec3(0.28, 0.2, 0.12) * (0.9 + 0.2 * vein), inL * 0.85);
    lines = max(lines, (1.0 - smoothstep(0.0, 0.03, abs(d))) * 0.4);
  }
  // twigs
  vec2 tg = p / 1.3;
  vec2 ti = floor(tg);
  vec2 th = hash22(ti + 7.0);
  if (th.x < 0.18) {
    vec2 q = (fract(tg) - 0.5) * 1.3;
    q = rot2(th.y * 6.28) * q;
    float d = max(abs(q.y + 0.02 * sin(q.x * 9.0)) - 0.007, abs(q.x) - 0.22);
    c = mix(c, vec3(0.2, 0.16, 0.11), 1.0 - smoothstep(0.0, 0.006, d));
  }
  // weed
  float wd = fbm(p * 1.4 + 3.0);
  c = mix(c, vec3(0.3, 0.36, 0.22), smoothstep(0.62, 0.74, wd) * (0.4 + 0.6 * vnoise(p * 40.0)) * 0.7);
  return c;
}

vec3 underwater(vec3 P, vec3 T, float pixAng, float camDist, out float ink) {
  ink = 0.0;
  // the bottom
  float tb = (P.y + 1.5) / -T.y;
  for (int i = 0; i < 5; i++) {
    vec3 X = P + T * tb;
    tb = (P.y - bottomY(X.xz)) / -T.y;
  }
  float tHit = tb;
  int what = 0;
  // the posts
  vec4 hitPost = vec4(0.0);
  for (int k = 0; k < 2; k++) {
    vec4 po = uPosts[k];
    vec2 o = P.xz - po.xy;
    float a = dot(T.xz, T.xz), b = dot(o, T.xz), c = dot(o, o) - po.z * po.z;
    float h = b * b - a * c;
    if (h > 0.0) {
      float t = (-b - sqrt(h)) / a;
      if (t > 0.0 && t < tHit) { tHit = t; what = 2; hitPost = po; }
    }
  }
  // the fish: march inside its bounding sphere
  vec3 oc = P - uFishPos;
  float b = dot(oc, T), c = dot(oc, oc) - 0.8 * 0.8;
  float h = b * b - c;
  float fin = 0.0;
  if (h > 0.0) {
    float t0 = max(-b - sqrt(h), 0.0), t1 = min(-b + sqrt(h), tHit);
    float t = t0, minD = 1e9;
    for (int i = 0; i < 72; i++) {
      if (t > t1) break;
      float d = fishMap(P + T * t);
      minD = min(minD, d);
      if (d < 0.0012) { if (t < tHit) { tHit = t; what = 1; } break; }
      t += max(d * 0.7, 0.002);
    }
    if (what != 1) {
      float px = pixAng * (camDist + t0);
      ink = (1.0 - smoothstep(px * 0.4, px * 1.4, minD)) * 0.9;
    }
  }
  vec3 X = P + T * tHit;
  vec3 col;
  if (what == 1) {
    vec3 n = fishNormal(X);
    vec3 lp = fishLocal(X);
    float f;
    fishSDF(lp, f);
    float lines;
    col = fishColour(lp, n, f, lines) * underLight(X, n);
    col *= 1.0 - lines * 0.55;
    float rim = 1.0 - abs(dot(n, -T));
    ink = max(lines * 0.25, smoothstep(0.55, 0.95, rim) * 0.75);
    col *= uWorlds.z;
  } else if (what == 2) {
    vec3 n = normalize(vec3(X.x - hitPost.x, 0.0, X.z - hitPost.y));
    float a = atan(n.z, n.x);
    vec3 wood = vec3(0.4, 0.34, 0.26) * (0.75 + 0.3 * vnoise(vec2(a * 9.0, X.y * 2.0)));
    wood = mix(wood, vec3(0.25, 0.32, 0.18), smoothstep(-0.05, -0.5, X.y) * 0.7 + 0.2);
    col = wood * underLight(X, n);
    float rim = 1.0 - abs(dot(n, -T));
    ink = smoothstep(0.6, 0.95, rim);
  } else {
    float lines;
    col = bottomColour(X, lines) * underLight(X, vec3(0.0, 1.0, 0.0));
    col *= 1.0 - lines * 0.5;
    ink = max(ink, 0.0);
  }
  // absorbed and scattered along the path through the water
  vec3 tr = exp(-SIGMA * tHit);
  vec3 murk = MURK * (0.75 + 0.25 * max(dot(-T, vec3(0.0, 1.0, 0.0)), 0.0));
  ink *= tr.g;
  return col * tr + murk * (1.0 - tr);
}

void main() {
  vec3 P = vec3(vW.x, 0.0, vW.z);
  vec3 I = normalize(P - cameraPosition);
  float dist = length(P - cameraPosition);
  float pixAng = length(fwidth(I));
  vec3 N = waveN(P.xz);
  // ripples smaller than a pixel would only alias: let them fade with distance
  float fp = fwidth(P.x) + fwidth(P.z);
  N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(0.03, 0.2, fp)));
  float cosi = clamp(-dot(I, N), 0.0, 1.0);
  float F = fresnelExact(cosi, ETA);

  // the world above, in the mirror
  vec3 R = reflect(I, N);
  R.y = max(R.y, 0.004);
  // the mirror image was rendered from the eye mirrored in the water plane, so
  // a point on the reflected ray projects straight into it. With a flat surface
  // any point on the ray gives the same pixel; with ripples the point should be
  // about as far away as what is reflected there: the banks round the pond.
  vec3 Q = P + R * reflDist(P, R);
  vec4 cq = uMirrorVP * vec4(Q, 1.0);
  vec2 muv = cq.xy / cq.w * 0.5 + 0.5;
  vec3 refl = texture2D(uMirror, muv).rgb * uWorlds.x;

  // the world beneath, through the surface
  vec3 T = refract(I, N, ETA);
  float ink;
  vec3 under = underwater(P, T, pixAng, dist, ink);

  vec3 col = F * refl + (1.0 - F) * under;
  if (uDebug > 0.5) { gl_FragColor = vec4(uDebug > 1.5 ? under : refl, 1.0); return; }
  // the shore line
  float shore = 1.0 - smoothstep(0.0, 0.03 + fp, abs(pondD(P.xz)));
  ink = max(ink * (1.0 - F), shore * 0.6);
  gl_FragColor = vec4(finish(col, 0.0, ink, P.xz, dist, 0.0), 1.0);
}
`;function Nt(o,t){return new T.ShaderMaterial({uniforms:{...o,...t},vertexShader:ye,fragmentShader:Ee})}function Bt(){let o=[];for(let t=0;t<8;t++)o.push(new T.Vector4(0,0,-100,0));return{uWaveT:{value:0},uDrops:{value:o},uMirror:{value:null},uMirrorVP:{value:new T.Matrix4},uShadow:{value:null},uShadowBox:{value:new T.Vector4(-10,-13,20,20)},uSunUW:{value:new T.Vector3(0,1,0)},uPosts:{value:[new T.Vector4,new T.Vector4]},uFishPos:{value:new T.Vector3(0,-.4,0)},uFishDir:{value:new T.Vector2(1,0)},uFishPhase:{value:0},uFishTurn:{value:0},uWorlds:{value:new T.Vector3(1,1,1)},uDebug:{value:0}}}var g=at(K(),1);var rt={x0:-9.5,z0:-12.5,x1:9.5,z1:6},$=420,$t=[[.72,.46,.2],[.62,.36,.16],[.8,.6,.28],[.5,.3,.16],[.68,.52,.26],[.56,.42,.22],[.76,.4,.18]];function ge(o){let t=o>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var qt=`
attribute vec4 aLeaf;    // x, z, angle, size
attribute vec4 aLeaf2;   // kind, curl, seed, layer
attribute vec3 aCol;
${nt}
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vCol;
varying vec2 vK;
void main() {
  vec2 uv = position.xy;   // x along the midrib, y across
  float curl = aLeaf2.y;
  float ex = uv.x + 0.5;
  float h = curl * (1.3 * uv.y * uv.y + 0.35 * ex * ex) - 0.02 * curl;
  vec3 lp = vec3(uv.x, h, uv.y) * aLeaf.w;
  float c = cos(aLeaf.z), s = sin(aLeaf.z);
  lp.xz = vec2(c * lp.x - s * lp.z, s * lp.x + c * lp.z);
  vec2 base = aLeaf.xy;
  float e = 0.05;
  float h0 = waveH(base);
  vec2 g = vec2(waveH(base + vec2(e, 0.0)) - h0, waveH(base + vec2(0.0, e)) - h0) / e;
  vec3 wp = vec3(base.x + lp.x, h0 + lp.y + dot(g, lp.xz) + 0.004 + aLeaf2.w * 0.0007, base.y + lp.z);
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  n = normalize(n + vec3(c * (-0.7 * curl * ex) - s * (-2.6 * curl * uv.y), 0.0, s * (-0.7 * curl * ex) + c * (-2.6 * curl * uv.y)));
  vUv = uv;
  vW = wp;
  vN = n;
  vCol = aCol;
  vK = aLeaf2.xz;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,Ut=`
uniform vec3 uSun;
uniform float uShadowPass;
${I}
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vCol;
varying vec2 vK;
${V}
${D}
${it}
void main() {
  float vein;
  float d = leafSDF(vUv, vK.x, vein);
  float px = fwidth(d);
  if (d > px * 0.5) discard;
  if (uShadowPass > 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  if (dot(n, v) < 0.0) n = -n;
  float dist = length(cameraPosition - vW);
  // mottled autumn colour, darker blotches and a paler underside towards the edge
  vec3 col = vCol * (0.78 + 0.4 * fbm(vUv * 7.0 + vK.y * 13.0));
  col = mix(col, col * 0.55, smoothstep(0.62, 0.8, fbm(vUv * 11.0 + vK.y * 5.0)));
  col = mix(col, col * 1.15 + 0.05, vein * 0.5);
  float shade = 0.62 + 0.4 * max(dot(n, uSun), 0.0) + 0.1 * n.y;
  col *= shade;
  // ink: the outline, the midrib and the veins
  float edge = 1.0 - smoothstep(px * 0.6, px * 2.2, -d);
  float ink = max(edge, vein * 0.42);
  gl_FragColor = vec4(finish(col, 0.0, ink, vW.xz, dist, 1.0), 1.0);
}
`,ct=class{constructor(t){let e=ge(31);this.rng=e;let n=new g.InstancedBufferGeometry,a=new g.PlaneGeometry(1.3,1,12,6);a.translate(-.08,0,0),n.index=a.index,n.setAttribute("position",a.getAttribute("position")),this.a1=new Float32Array($*4),this.a2=new Float32Array($*4),this.col=new Float32Array($*3),this.vel=[];for(let r=0;r<$;r++){this.spawn(r,!0);let v=e()<.45?0:e()<.7?1:2,u=v===2?.17+e()*.06:.15+e()*.11;this.a1[r*4+3]=u,this.a2.set([v,.04+e()*.12,e(),r%7],r*4),this.col.set($t[Math.floor(e()*$t.length)],r*3)}this.attr1=new g.InstancedBufferAttribute(this.a1,4),this.attr1.setUsage(g.DynamicDrawUsage),n.setAttribute("aLeaf",this.attr1),n.setAttribute("aLeaf2",new g.InstancedBufferAttribute(this.a2,4)),n.setAttribute("aCol",new g.InstancedBufferAttribute(this.col,3)),n.instanceCount=$,this.geo=n;let s={...t,uShadowPass:{value:0}};this.material=new g.ShaderMaterial({uniforms:s,vertexShader:qt,fragmentShader:Ut,side:g.DoubleSide}),this.shadowMaterial=new g.ShaderMaterial({uniforms:{...s,uShadowPass:{value:1}},vertexShader:qt,fragmentShader:Ut,side:g.DoubleSide}),this.mesh=new g.Mesh(n,this.material),this.mesh.frustumCulled=!1}spawn(t,e){let n=this.rng,a=rt;for(let s=0;s<40;s++){let r=e?a.x0+n()*(a.x1-a.x0):a.x0+n()*6,v=a.z0+n()*(a.z1-a.z0);if(st(r,v)<-.35){this.a1[t*4]=r,this.a1[t*4+1]=v,this.a1[t*4+2]=n()*Math.PI*2,this.vel[t]={w:(n()-.5)*.06,k:.7+n()*.6};return}}}update(t,e){let n=this.a1;for(let a=0;a<$;a++){let s=n[a*4],r=n[a*4+1],v=this.vel[a],u=.03+.02*Math.sin(r*.45+e*.05)+.012*Math.sin(e*.13+a),x=.012*Math.cos(s*.38-e*.04)+.006*Math.sin(e*.11+a*1.7);s+=u*v.k*t,r+=x*v.k*t;for(let m of A){let p=s-m.x,f=r-m.z,l=Math.hypot(p,f),d=m.r+n[a*4+3]*.5;l<d&&(s=m.x+p/l*d,r=m.z+f/l*d)}n[a*4]=s,n[a*4+1]=r,n[a*4+2]+=v.w*t,(s>rt.x1||st(s,r)>-.25)&&this.spawn(a,!1)}this.attr1.needsUpdate=!0}};var be="http://www.w3.org/2000/svg";function Te(o,t=1/1.333){let e=t*t*(1-o*o);if(e>=1)return 1;let n=Math.sqrt(1-e),a=(t*o-n)/(t*o+n),s=(o-t*n)/(o+t*n);return .5*(a*a+s*s)}var _t=o=>Te(Math.cos(o*Math.PI/180)),q=o=>26+120*o/90,j=o=>84-62*o;function F(o,t,e){let n=document.createElementNS(be,o);for(let a in t)n.setAttribute(a,t[a]);return e?.appendChild(n),n}var lt=class{constructor(t){this.host=t;let e=F("svg",{viewBox:"0 0 154 104",role:"img","aria-label":"Reflectance of water against the angle of incidence"},t);F("text",{x:6,y:12,class:"g-title"},e).textContent="Light reflected by the water";for(let a of[0,.5,1])F("line",{x1:26,x2:146,y1:j(a),y2:j(a),class:a?"g-grid":"g-axis"},e),F("text",{x:22,y:j(a)+3,class:"g-tick","text-anchor":"end"},e).textContent=`${a*100}%`;for(let a of[0,45,90])F("text",{x:q(a),y:94,class:"g-tick","text-anchor":"middle"},e).textContent=`${a}\xB0`;F("text",{x:146,y:103,class:"g-tick","text-anchor":"end"},e).textContent="angle from straight down",this.band=F("rect",{y:22,height:62,class:"g-band"},e);let n="";for(let a=0;a<=90;a+=1)n+=`${a?"L":"M"}${q(a).toFixed(1)},${j(_t(a)).toFixed(1)}`;F("path",{d:n,class:"g-curve"},e),this.dot=F("circle",{r:4,class:"g-dot"},e),this.label=F("text",{class:"g-label"},e),this.shown=null}update(t,e,n,a){if(a!==this.shown&&(this.host.classList.toggle("on",a),this.shown=a),!a)return;let s=`${t.toFixed(1)}|${e.toFixed(1)}|${n.toFixed(1)}`;if(s===this.key)return;this.key=s;let r=Math.min(t,n),v=Math.max(t,n);this.band.setAttribute("x",q(r).toFixed(1)),this.band.setAttribute("width",Math.max(1,q(v)-q(r)).toFixed(1));let u=_t(e),x=q(e),m=j(u);this.dot.setAttribute("cx",x.toFixed(1)),this.dot.setAttribute("cy",m.toFixed(1));let p=u<.1?(u*100).toFixed(1):Math.round(u*100);this.label.textContent=`${p}% at ${Math.round(e)}\xB0`;let f=x<96;this.label.setAttribute("x",(f?x+7:x-7).toFixed(1)),this.label.setAttribute("y",Math.max(30,m-6).toFixed(1)),this.label.setAttribute("text-anchor",f?"start":"end")}};var ut=30/38,U=new c.Vector3(.25,0,.35),mt=6.5,Yt=36,ze=4,Me=88,Kt=24,O=document.getElementById("scene"),z=new c.WebGLRenderer({canvas:O,antialias:!0,powerPreference:"high-performance"});z.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));var jt=new c.Color(15525333);z.setClearColor(jt,1);var R=Dt(),b=Bt();R.uWaveT=b.uWaveT;R.uDrops=b.uDrops;b.uPosts.value.forEach((o,t)=>o.set(A[t].x,A[t].z,A[t].r,A[t].top));var W=new c.Scene,J=Xt(R);W.add(J);var ft=new c.Mesh(Vt(),It(R));ft.frustumCulled=!1;W.add(ft);var ht=new c.Mesh(new c.PlaneGeometry(140,140).rotateX(-Math.PI/2),Nt(R,b));ht.frustumCulled=!1;W.add(ht);var P=new ct(R);W.add(P.mesh);{let o=R.uSun.value,t=1/1.333,e=o.y,n=1-t*t*(1-e*e),a=o.clone().negate().multiplyScalar(t).add(new c.Vector3(0,t*e-Math.sqrt(n),0));b.uSunUW.value.copy(a.negate().normalize())}var M=new c.PerspectiveCamera(Yt,ut,.05,700),S=new c.PerspectiveCamera(Yt,ut,.05,700),bt=new c.WebGLRenderTarget(4,4,{samples:4});b.uMirror.value=bt.texture;var w=rt,tt=new c.OrthographicCamera(-(w.x1-w.x0)/2,(w.x1-w.x0)/2,(w.z1-w.z0)/2,-(w.z1-w.z0)/2,.1,20);tt.position.set((w.x0+w.x1)/2,10,(w.z0+w.z1)/2);tt.up.set(0,0,-1);tt.lookAt((w.x0+w.x1)/2,0,(w.z0+w.z1)/2);tt.updateMatrixWorld();var Zt=new c.WebGLRenderTarget(512,512,{generateMipmaps:!0,minFilter:c.LinearMipmapLinearFilter});b.uShadow.value=Zt.texture;b.uShadowBox.value.set(w.x0,w.z1,w.x1-w.x0,w.z1-w.z0);var k={el:c.MathUtils.degToRad(Kt),az:0},Et=ut;function Qt(){let o=Math.cos(k.el);M.position.set(U.x+Math.sin(k.az)*o*mt,Math.sin(k.el)*mt,U.z+Math.cos(k.az)*o*mt),M.up.set(0,1,0),M.lookAt(U),M.aspect=Et,M.updateProjectionMatrix(),M.updateMatrixWorld(),S.position.set(M.position.x,-M.position.y,M.position.z),S.up.set(0,-1,0),S.lookAt(U),S.fov=M.fov,S.aspect=Et,S.updateProjectionMatrix(),S.updateMatrixWorld(),b.uMirrorVP.value.multiplyMatrices(S.projectionMatrix,S.matrixWorldInverse)}function xt(o){let t=new c.Vector3(0,o,.5).unproject(M).sub(M.position).normalize();return t.y>=-1e-4?90:c.MathUtils.radToDeg(Math.acos(-t.y))}var Re=new lt(document.getElementById("gauge"));Ht(ut,(o,t)=>{z.setSize(o,t),Et=o/t;let e=z.getPixelRatio();bt.setSize(Math.round(o*e),Math.round(t*e)),Qt()});var h={playing:!0,litho:1,lithoTarget:1,t:0,fishT:3.6,phase:0,nextDrop:1.5,drop:0,gaugeHold:5};St();kt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],o=>{h.lithoTarget=o},1);var Jt=Pt(o=>{h.playing=o}),gt=document.getElementById("elev"),He=document.getElementById("elev-out");function G(o,t){o=Math.min(Me,Math.max(ze,o)),k.el=c.MathUtils.degToRad(o),t||(gt.value=String(Math.round(o))),He.textContent=`${Math.round(o)}\xB0`,h.gaugeHold=4,Qt()}gt.addEventListener("input",()=>G(+gt.value,!0));Ft({" ":()=>Jt(!h.playing),l:()=>document.getElementById(h.lithoTarget?"btn-colour":"btn-litho").click(),ArrowUp:()=>G(c.MathUtils.radToDeg(k.el)+3),ArrowDown:()=>G(c.MathUtils.radToDeg(k.el)-3)});var _=null;O.addEventListener("pointerdown",o=>{O.setPointerCapture(o.pointerId),_={x:o.clientX,y:o.clientY}});O.addEventListener("pointermove",o=>{if(!_)return;let t=o.clientX-_.x,e=o.clientY-_.y;_={x:o.clientX,y:o.clientY},k.az=Math.max(-.55,Math.min(.55,k.az-t*.004)),G(c.MathUtils.radToDeg(k.el)+e*.25)});var te=()=>{_=null};O.addEventListener("pointerup",te);O.addEventListener("pointercancel",te);var Se=document.getElementById("panel"),wt=.1;function Z(o,t){return t.set(.3+1.3*Math.sin(wt*o),-.38+.08*Math.sin(.5*wt*o+1.3),.5+.95*Math.sin(2*wt*o+.6))}var yt=new c.Vector3,X=new c.Vector3,Q=new c.Vector3,Ot=new c.Vector3;function Tt(o){let t=h.fishT,e=.05;Z(t,yt),X.copy(Z(t+e,Ot)).sub(Z(t-e,Q)).divideScalar(2*e),Q.copy(Z(t+e,Ot)).add(Z(t-e,Q)).addScaledVector(yt,-2).divideScalar(e*e);let n=Math.hypot(X.x,X.z),a=(X.x*Q.z-X.z*Q.x)/Math.pow(Math.max(n,.001),3);b.uFishPos.value.copy(yt),b.uFishDir.value.set(X.x/n,X.z/n),b.uFishTurn.value=c.MathUtils.clamp(a*.5,-1.2,1.2),h.phase+=o*(4.5+14*n),b.uFishPhase.value=h.phase}function ke(){let o=b.uDrops.value[h.drop++%8],t=Math.random()*3,e=Math.random()*Math.PI*2;o.set(U.x+Math.cos(e)*t,U.z-1+Math.sin(e)*t*1.3,h.t,.004+Math.random()*.003)}var Gt=performance.now(),Fe=new c.Color(1,1,1);function ee(o){let t=Math.min(.05,Math.max(0,(o-Gt)/1e3));Gt=o,h.playing&&(h.t+=t,h.fishT+=t,P.update(t,h.t),Tt(t),h.t>h.nextDrop&&(ke(),h.nextDrop=h.t+2.5+Math.random()*4)),R.uTime.value=h.t,b.uWaveT.value=h.t,h.litho!==h.lithoTarget&&(h.litho+=Math.sign(h.lithoTarget-h.litho)*Math.min(Math.abs(h.lithoTarget-h.litho),t*2.2),z.setClearColor(jt.clone().lerp(new c.Color(15328988),1-h.litho),1));let e=z.getClearColor(new c.Color);J.visible=!1,ft.visible=!1,ht.visible=!1,P.mesh.material=P.shadowMaterial,z.setClearColor(Fe,1),z.setRenderTarget(Zt),z.render(W,tt),P.mesh.material=P.material,J.visible=!0,ft.visible=!0,P.mesh.visible=!1,J.position.copy(S.position),R.uLitho.value=0,R.uGrain.value=0,R.uClip.value=1,z.setClearColor(e,1),z.setRenderTarget(bt),z.render(W,S),ht.visible=!0,P.mesh.visible=!0,J.position.copy(M.position),R.uLitho.value=h.litho,R.uGrain.value=1,R.uClip.value=0,z.setRenderTarget(null),z.render(W,M),h.gaugeHold=Math.max(0,h.gaugeHold-t);let n=h.gaugeHold>0||!Se.hasAttribute("hidden");Re.update(xt(-1),xt(0),xt(1),n),requestAnimationFrame(ee)}Tt(0);G(Kt);Lt();requestAnimationFrame(ee);window.__page={view:k,state:h,setElevation:G,setPlaying:Jt,camera:M,renderer:z,wu:b,u:R,leaves:P,scene:W,updateFish:Tt};})();
