(()=>{function T(e,o){let l=document.getElementById("frame"),n=()=>{let p=(window.innerWidth<640?10:28)+13,u=document.getElementById("masthead"),E=document.getElementById("controls"),k=(u?u.offsetHeight:0)+6+13,z=(E?E.offsetHeight:0)+8+13,P=window.innerWidth-p*2,L=window.innerHeight-k-z,d=L,m=d*e;m>P&&(m=P,d=m/e),m=Math.max(160,Math.floor(m)),d=Math.max(120,Math.floor(d)),l.style.width=`${m}px`,l.style.height=`${d}px`,l.style.top=`${k+Math.max(0,(L-d)/2)}px`,o?.(m,d)};return window.addEventListener("resize",n),n(),n}function A(){let e=document.getElementById("panel"),o=document.getElementById("btn-info"),l=document.getElementById("panel-close");if(!e)return;let n=i=>{i?e.removeAttribute("hidden"):e.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(i))};o?.addEventListener("click",()=>n(e.hasAttribute("hidden"))),l?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",i=>{i.key==="Escape"&&n(!1)})}function R(e,o,l){let n=i=>{for(let[p,u]of e)p.setAttribute("aria-pressed",String(u===i));o(i)};for(let[i,p]of e)i.addEventListener("click",()=>n(p));return l!==void 0&&n(l),n}function B(e){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let l=e[o.key.length===1?o.key.toLowerCase():o.key];l&&(o.preventDefault(),l(o))})}function I(e,o=!0){let l=document.getElementById("btn-play"),n=i=>{o=i,l&&(l.setAttribute("aria-pressed",String(!i)),l.querySelector("span").textContent=i?"Pause":"Play",l.querySelector(".icon").textContent=i?"\u275A\u275A":"\u25B6"),e(i)};return l?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function y(e,o){let l=document.getElementById("badge");l&&o&&(l.textContent=o),document.body.classList.toggle("badge-on",!!e)}function S(){document.body.classList.add("ready")}var q=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,C=`
precision highp float;
uniform vec2 uRes;
uniform float uS;          // device px per world unit at zoom phase 0
uniform float uPhase;      // zoom phase in [0, 1): magnification 2^phase
uniform float uTime;
uniform float uLitho;
uniform float uReveal;
uniform float uAmp;        // 1: dolphins, 0: plain rectangles
uniform float uDpr;

const float PI = 3.14159265359;
const vec3 PAPER = vec3(0.925, 0.898, 0.835);
const vec3 PAPER_C = vec3(0.914, 0.902, 0.863);
const vec3 INK = vec3(0.11, 0.10, 0.09);
const vec3 RED = vec3(0.64, 0.23, 0.16);

float gSw;   // tail beat, \u22121..1

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
float line(float d, float w, float px) {
  float ww = max(w, 0.5 * px);
  return clamp((ww - abs(d)) / px + 0.5, 0.0, 1.0) * min(1.0, w / (0.5 * px));
}
float fill(float d, float px) { return clamp(0.5 - d / px, 0.0, 1.0); }
float sq(float x) { return x * x; }
float gauss(float x, float c, float w) { float t = (x - c) / w; return exp(-t * t); }

// ---- the three free edges (in tile units; the belly follows from them)
float edgeT(float x) {               // back: positive is outward
  float s = (x - 1.15) / 0.82;      // dorsal fin: 0 at its trailing base, 1 at its leading base
  float fin = 0.0;
  if (s > 0.0 && s < 1.0) fin = s < 0.22 ? pow(s / 0.22, 1.9) : 1.0 - pow((s - 0.22) / 0.78, 1.3);
  float stock = smoothstep(0.0, 0.45, x) * smoothstep(1.05, 0.62, x);
  float win = smoothstep(0.0, 0.04, x) * smoothstep(3.0, 2.88, x);
  return uAmp * win * (0.46 * fin - 0.28 * stock + 0.08 * gauss(x, 2.42, 0.28));
}
float edgeE(float y) {               // head: positive is forward (beak and melon)
  float win = smoothstep(0.0, 0.05, y) * smoothstep(1.0, 0.88, y);
  float b = clamp(1.0 - sq((y - 0.27) / 0.14), 0.0, 1.0);
  return uAmp * win * (0.34 * pow(b, 0.8) + 0.24 * gauss(y, 0.63, 0.17));
}
float edgeL(float y) {               // tail: positive is into the tile (the notch between the flukes)
  float apex = 0.36 + 0.05 * gSw;
  float t = y < apex ? y / apex : (1.0 - y) / (1.0 - apex);
  return uAmp * (0.38 + 0.03 * gSw) * pow(clamp(t, 0.0, 1.0), 1.15);
}
float edgeB(float x) {               // belly, forced by the neighbours
  if (x < 0.5) return 0.5 * edgeE(1.0 - 2.0 * x);
  if (x < 2.0) return 0.5 * edgeT(2.0 * x - 1.0);
  return -edgeL(x - 2.0);
}

vec2 armLocal(vec2 P, float k, float a) {
  vec2 Q = P * exp2(-k);
  for (int i = 0; i < 3; i++) if (float(i) < a) Q = vec2(-Q.y, Q.x);
  return vec2(2.0 * Q.x + 1.0, 2.0 * Q.y - 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float pxw = 1.0 / (uS * exp2(uPhase));            // world units per device px
  // magnify by 2^phase and turn a quarter clockwise per doubling: the tiling
  // is the same after scaling by 2 and turning by 90\xB0, colours included
  float ang = uPhase * 0.5 * PI;
  vec2 q = (fc - 0.5 * uRes) * pxw;
  vec2 P = vec2(cos(ang) * q.x - sin(ang) * q.y, sin(ang) * q.x + cos(ang) * q.y);
  float m = max(abs(P.x), abs(P.y));

  gSw = sin(uTime * 2.6);

  // ---- which ring, which arm, before bending
  float k = floor(log2(max(m, 1e-30))) + 1.0;
  vec2 Q = P * exp2(-k);
  float a = 0.0;
  for (int i = 0; i < 3; i++) {
    if (Q.y >= 0.5 && Q.x >= -0.5) break;
    Q = vec2(-Q.y, Q.x);
    a += 1.0;
  }
  vec2 l0 = vec2(2.0 * Q.x + 1.0, 2.0 * Q.y - 1.0);
  float pxl0 = pxw * 2.0 * exp2(-k);               // local units per px in that ring

  // ---- hand the pixel to whichever tile's bent edge it lies inside
  float vT = l0.y - 1.0 - edgeT(l0.x);
  float vE = l0.x - 3.0 - edgeE(l0.y);
  float vL = edgeL(l0.y) - l0.x;
  float vB = edgeB(l0.x) - l0.y;
  float vmax = max(max(vT, vE), max(vL, vB));
  float kk = k, aa = a;
  vec2 l = l0;
  if (vmax > 0.0) {
    if (vmax == vT) kk = k + 1.0;
    else if (vmax == vE) { kk = k + 1.0; aa = a + 1.0; }
    else if (vmax == vL) aa = a - 1.0;
    else if (l0.x < 0.5) { kk = k - 1.0; aa = a - 1.0; }
    else if (l0.x < 2.0) kk = k - 1.0;
    else aa = a + 1.0;
    aa = mod(aa + 4.0, 4.0);
    l = armLocal(P, kk, aa);
  }
  float px = pxw * 2.0 * exp2(-kk);                 // local units per px for the owner
  float x = l.x, y = l.y;

  // ---- the tile outline, from the owner's side
  float h = 0.004;
  float dT = (1.0 + edgeT(x) - y) / sqrt(1.0 + sq((edgeT(x + h) - edgeT(x - h)) / (2.0 * h)));
  float dE = (3.0 + edgeE(y) - x) / sqrt(1.0 + sq((edgeE(y + h) - edgeE(y - h)) / (2.0 * h)));
  float dL = (x - edgeL(y)) / sqrt(1.0 + sq((edgeL(y + h) - edgeL(y - h)) / (2.0 * h)));
  float dB = (y - edgeB(x)) / sqrt(1.0 + sq((edgeB(x + h) - edgeB(x - h)) / (2.0 * h)));
  float dOut = min(min(dT, dE), min(dL, dB));
  float lineO = line(dOut, 0.022, px);

  // ---- the dolphin, drawn in its tile's frame
  float detail = 1.0 - 0.8 * uReveal;
  float fam = mod(aa + kk, 2.0);                    // light and dark alternate in every direction
  // a soft line between the darker back and the paler belly
  float yc = 0.40 + 0.15 * smoothstep(0.3, 1.6, x) - 0.07 * smoothstep(2.1, 3.1, x) + 0.02 * sin(x * 2.6);
  float dC = y - yc;
  float cape = smoothstep(-0.5 * px, 0.5 * px, dC);
  // fin and fluke roots, eye, mouth, blowhole
  float bx = edgeB(x);
  float rootF = line(y - 1.0, 0.008, px) * step(1.17, x) * step(x, 1.95) * step(0.02, edgeT(x));
  float rootP = line(y - 0.035 - 0.03 * (x - 2.4), 0.008, px) * step(2.38, x) * step(x, 2.95) * step(bx, -0.03);
  float fb = 0.30 + 0.30 * sq(y - 0.40);
  float rootT = line(x - fb, 0.008, px) * step(0.10, y) * step(y, 0.88);
  float roots = max(rootF, max(rootP, rootT)) * detail;
  float dEye = length(vec2(x - 2.60, y - 0.55));
  float rE = 0.050;
  float eyeW = fill(dEye - rE, px) * detail;
  float eyeP = fill(dEye - rE * 0.55, px) * detail;
  float eyeL = line(dEye - rE, 0.007, px) * detail;
  float ym = 0.255 + 0.06 * smoothstep(2.86, 2.66, x);
  float lineM = line(y - ym, 0.008, px) * step(2.64, x) * step(x, 3.0 + edgeE(0.255) - 0.06) * detail;
  float dBh = length(vec2(x - 2.30, (y - 0.97) * 2.0));
  float lineH = line(dBh - 0.045, 0.007, px) * step(y, 0.97) * detail;
  float lineC = line(dC, 0.006, px) * detail * 0.7;
  // engraving: lines that follow the body, heavier on the back
  float hs = 0.05;
  float hh = abs(fract((y - yc) / hs) - 0.5) * hs;
  float hl = smoothstep(2.2, 4.5, hs / px) * detail;
  float engr = line(hh, mix(0.006, 0.013, cape), px) * hl;

  // ---- tone and colour
  float lit, ink2, pale;
  vec3 col;
  if (fam < 0.5) {
    // pale dolphin: white belly, grey engraved back
    lit = mix(0.97, mix(0.90, 0.48, engr), cape);
    lit = mix(lit, 0.62, engr * (1.0 - cape) * 0.5);
    col = mix(vec3(0.94, 0.91, 0.84), vec3(0.80, 0.74, 0.64), cape);
    col = mix(col, col * 0.82, engr);
    lit = mix(lit, 0.10, max(max(roots, lineM), max(lineH, lineC)));
    col = mix(col, INK, max(max(roots, lineM), max(lineH, lineC)) * 0.85);
  } else {
    // dark dolphin: black back cut with pale lines, grey belly
    lit = mix(0.30, mix(0.11, 0.42, engr), cape);
    lit = mix(lit, 0.46, engr * (1.0 - cape) * 0.6);
    col = mix(vec3(0.38, 0.47, 0.54), vec3(0.20, 0.28, 0.35), cape);
    col = mix(col, col * 1.25, engr);
    float pl = max(max(roots, lineM), max(lineH, lineC));
    lit = mix(lit, 0.78, pl);
    col = mix(col, vec3(0.86, 0.88, 0.84), pl * 0.8);
  }
  lit = mix(lit, 0.97, eyeW); col = mix(col, vec3(0.97, 0.95, 0.89), eyeW);
  lit = mix(lit, 0.05, max(eyeP, eyeL)); col = mix(col, INK, max(eyeP, eyeL));
  lit = mix(lit, 0.04, lineO);
  col = mix(col, INK, lineO);

  // ---- far toward the centre a whole ring is smaller than a pixel: average it
  float lod = smoothstep(1.4, 3.5, 1.0 / px);
  float meanL = 0.55;
  vec3 meanC = vec3(0.58, 0.60, 0.60);
  lit = mix(meanL, lit, lod);
  col = mix(meanC, col, lod);

  // ---- the construction: the square subdivision, in red
  float red = 0.0;
  if (uReveal > 0.0) {
    float px0 = pxl0;
    float frameD = min(min(abs(l0.y), abs(l0.y - 1.0)), min(abs(l0.x), abs(l0.x - 3.0)));
    float solid = line(frameD, 0.016, px0);
    float dashP = fract(l0.y * 4.0);
    float dashA = smoothstep(0.0, 0.08, dashP) * (1.0 - smoothstep(0.55, 0.63, dashP));
    float inner = line(min(abs(l0.x - 1.0), abs(l0.x - 2.0)), 0.010, px0) * dashA;
    float lodR = smoothstep(2.0, 6.0, 1.0 / px0);
    red = max(solid, inner * 0.9) * uReveal * lodR;
  }

  // ---- paper grain
  float g = vnoise(fc * 0.55 / uDpr) - 0.5;
  float gw = hash12(fc) - 0.5;
  float blot = vnoise(fc * 0.012 / uDpr) - 0.5;
  vec3 colour = col + g * 0.025 + gw * 0.02;
  float v = clamp(lit + g * 0.07 + gw * 0.05 + blot * 0.05 * (1.0 - lit), 0.0, 1.0);
  vec3 litho = mix(INK, PAPER, v);
  gl_FragColor = vec4(mix(mix(colour, litho, uLitho), RED, red), 1.0);
}
`;var K=7.5,U=.5,r=document.getElementById("scene"),a=r.getContext("webgl2",{antialias:!1,alpha:!1,preserveDrawingBuffer:!0})||r.getContext("webgl",{antialias:!1,alpha:!1,preserveDrawingBuffer:!0});if(!a)throw new Error("WebGL unavailable");function F(e,o){let l=a.createShader(e);if(a.shaderSource(l,o),a.compileShader(l),!a.getShaderParameter(l,a.COMPILE_STATUS))throw new Error(a.getShaderInfoLog(l));return l}var c=a.createProgram();a.attachShader(c,F(a.VERTEX_SHADER,q));a.attachShader(c,F(a.FRAGMENT_SHADER,C));a.linkProgram(c);if(!a.getProgramParameter(c,a.LINK_STATUS))throw new Error(a.getProgramInfoLog(c));a.useProgram(c);a.bindBuffer(a.ARRAY_BUFFER,a.createBuffer());a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);var Q=a.getAttribLocation(c,"aPos");a.enableVertexAttribArray(Q);a.vertexAttribPointer(Q,2,a.FLOAT,!1,0,0);var f={};for(let e of["uRes","uS","uPhase","uTime","uLitho","uReveal","uAmp","uDpr"])f[e]=a.getUniformLocation(c,e);var t={phase:0,time:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0,dirty:!0},_={w:1,h:1,dpr:1},x=1,H=T(1,(e,o)=>{let l=Math.max(.75,Math.min(window.devicePixelRatio||1,2)*x);r.width=Math.round(e*l),r.height=Math.round(o*l),_={w:e,h:o,dpr:l},a.viewport(0,0,r.width,r.height),t.dirty=!0});A();R([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{t.lithoTarget=e},1);var v=document.getElementById("btn-reveal"),Y=0;function w(e){t.revealTarget=e?1:0,v.setAttribute("aria-pressed",String(e)),v.textContent=e?"Show the dolphins":"Reveal construction",clearTimeout(Y),e?y(!0,"Each ring: four rectangles of three squares, half the size of the ring outside"):y(!1)}v.addEventListener("click",()=>w(!t.revealTarget));var N=I(e=>{t.playing=e});B({" ":()=>N(!t.playing),l:()=>document.getElementById(t.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>w(!t.revealTarget)});var b=e=>e-Math.floor(e),h=null;r.addEventListener("pointerdown",e=>{try{r.setPointerCapture(e.pointerId)}catch{}h={y:e.clientY}});r.addEventListener("pointermove",e=>{if(!h)return;let o=e.clientY-h.y;h.y=e.clientY,t.phase=b(t.phase-o/(r.clientHeight*.6)),t.dirty=!0});var O=()=>{h=null};r.addEventListener("pointerup",O);r.addEventListener("pointercancel",O);r.addEventListener("wheel",e=>{e.preventDefault(),t.phase=b(t.phase-e.deltaY*.0012),t.dirty=!0},{passive:!1});function g(){a.uniform2f(f.uRes,r.width,r.height),a.uniform1f(f.uS,U*r.width),a.uniform1f(f.uPhase,t.phase),a.uniform1f(f.uTime,t.time),a.uniform1f(f.uLitho,t.litho),a.uniform1f(f.uReveal,t.reveal);let e=t.reveal;a.uniform1f(f.uAmp,1-e*e*(3-2*e)),a.uniform1f(f.uDpr,_.dpr),a.drawArrays(a.TRIANGLES,0,3)}var M=(e,o,l)=>e+Math.sign(o-e)*Math.min(Math.abs(o-e),l),D=performance.now(),s={n:0,t:0,last:performance.now()};function W(e){let o=Math.min(.05,Math.max(0,(e-D)/1e3));D=e;let l=t.dirty;t.playing&&(t.time+=o,h||(t.phase=b(t.phase+o/K)),l=!0);let n=t.litho,i=t.reveal;t.litho=M(t.litho,t.lithoTarget,o*2.2),t.reveal=M(t.reveal,t.revealTarget,o*.9),(n!==t.litho||i!==t.reveal)&&(l=!0),l&&(g(),t.dirty=!1,s.n++,s.t+=e-s.last,s.n>=40&&(s.t/s.n>26&&x>.5&&!document.hidden&&(x*=.8,H()),s.n=0,s.t=0)),s.last=e,requestAnimationFrame(W)}g();S();requestAnimationFrame(W);window.__page={state:t,setReveal:w,setPlaying:N,setLitho:e=>document.getElementById(e?"btn-litho":"btn-colour").click(),snap(){x!==1&&(x=1,H()),t.litho=t.lithoTarget,t.reveal=t.revealTarget,g()},render:g};})();
