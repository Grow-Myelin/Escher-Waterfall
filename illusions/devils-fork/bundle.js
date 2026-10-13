(()=>{var oe=Object.create;var Wt=Object.defineProperty;var ae=Object.getOwnPropertyDescriptor;var ne=Object.getOwnPropertyNames;var ie=Object.getPrototypeOf,re=Object.prototype.hasOwnProperty;var se=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(o){throw t=0,o}};var le=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of ne(t))!re.call(e,a)&&a!==o&&Wt(e,a,{get:()=>t[a],enumerable:!(n=ae(t,a))||n.enumerable});return e};var kt=(e,t,o)=>(o=e!=null?oe(ie(e)):{},le(t||!e||!e.__esModule?Wt(o,"default",{value:e,enumerable:!0}):o,e));var pt=se((Se,jt)=>{jt.exports=window.THREE});function Vt(e,t){let o=document.getElementById("frame"),n=()=>{let i=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),f=document.getElementById("controls"),c=(r?r.offsetHeight:0)+6+13,l=(f?f.offsetHeight:0)+8+13,u=window.innerWidth-i*2,w=window.innerHeight-c-l,m=w,v=m*e;v>u&&(v=u,m=v/e),v=Math.max(160,Math.floor(v)),m=Math.max(120,Math.floor(m)),o.style.width=`${v}px`,o.style.height=`${m}px`,o.style.top=`${c+Math.max(0,(w-m)/2)}px`,t?.(v,m)};return window.addEventListener("resize",n),n(),n}function $t(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!e)return;let n=a=>{a?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(a))};t?.addEventListener("click",()=>n(e.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function Dt(e,t,o){let n=a=>{for(let[i,r]of e)i.setAttribute("aria-pressed",String(r===a));t(a)};for(let[a,i]of e)a.addEventListener("click",()=>n(i));return o!==void 0&&n(o),n}function Xt(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let o=e[t.key.length===1?t.key.toLowerCase():t.key];o&&(t.preventDefault(),o(t))})}function Gt(e,t=!0){let o=document.getElementById("btn-play"),n=a=>{t=a,o&&(o.setAttribute("aria-pressed",String(!a)),o.querySelector("span").textContent=a?"Pause":"Play",o.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),e(a)};return o?.addEventListener("click",()=>n(!t)),n(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function Ut(){document.body.classList.add("ready")}var B=kt(pt(),1);var L=kt(pt(),1),ce=1e3,vt={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function fe(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function Rt(e,t=vt.PLAIN,o={}){return{c:typeof e=="number"?fe(e):e,p:t,f:o.f||0,w:o.w||0,s:o.s||0}}var qt=["px","nx","py","ny","pz","nz"];function G(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function Tt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function st(e){return Math.hypot(e[0],e[1],e[2])}function W(e){let t=st(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function St(e,t){let o=Math.abs(t[0]),n=Math.abs(t[1]),a=Math.abs(t[2]);return o>=n&&o>=a?[e[2],e[1]]:a>=n?[e[0],e[1]]:[e[0],e[2]]}var lt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new L.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new L.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let o=this.m.elements,n=t[0],a=t[1],i=t[2];return[o[0]*n+o[4]*a+o[8]*i+o[12],o[1]*n+o[5]*a+o[9]*i+o[13],o[2]*n+o[6]*a+o[10]*i+o[14]]}_tn(t){if(!this.nm)return t;let o=this.nm.elements,n=t[0],a=t[1],i=t[2];return W([o[0]*n+o[3]*a+o[6]*i,o[1]*n+o[4]*a+o[7]*i,o[2]*n+o[5]*a+o[8]*i])}tri(t,o,n,a,i=[1,1,1],r={}){let f=this._tp(t),c=this._tp(o),l=this._tp(n),u=W(Tt(G(o,t),G(n,t))),w=r.uv||[St(t,u),St(o,u),St(n,u)],m=W(Tt(G(c,f),G(l,f))),v=r.n?r.n.map(b=>this._tn(b)):[m,m,m],p=st(Tt(G(c,f),G(l,f))),g=[p/(st(G(l,c))||1),p/(st(G(f,l))||1),p/(st(G(c,f))||1)],x=r.k||[1,1,1],M=a.s||0,T=[f,c,l];for(let b=0;b<3;b++){let S=T[b];this.pos.push(S[0]+M,S[1]+M,S[2]+M),this.nrm.push(v[b][0],v[b][1],v[b][2]),this.col.push(a.c[0]*x[b],a.c[1]*x[b],a.c[2]*x[b]),this.uv.push(w[b][0],w[b][1]);for(let R=0;R<3;R++)i[R]?this.edg.push(b===R?g[R]:0):this.edg.push(ce);this.mat.push(a.p,a.f,a.w)}}quad(t,o,n,a,i,r=[1,1,1,1],f={}){let c=f.k||[1,1,1,1],l=f.n,u=f.uv;this.tri(t,o,n,i,[r[1],0,r[0]],{k:[c[0],c[1],c[2]],n:l&&[l[0],l[1],l[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(t,n,a,i,[r[2],r[3],0],{k:[c[0],c[2],c[3]],n:l&&[l[0],l[2],l[3]],uv:u&&[u[0],u[2],u[3]]})}box(t,o,n,a,i,r,f,c={}){t>a&&([t,a]=[a,t]),o>i&&([o,i]=[i,o]),n>r&&([n,r]=[r,n]);let l=new Set(c.open||[]),u=new Set(c.skip||[]);c.bottom||u.add("ny");let w=c.ao??1,m=c.aoTop??1,v={px:[0,a],nx:[0,t],py:[1,i],ny:[1,o],pz:[2,r],nz:[2,n]},p={px:[[a,o,r],[a,o,n],[a,i,n],[a,i,r]],nx:[[t,o,n],[t,o,r],[t,i,r],[t,i,n]],pz:[[t,o,r],[a,o,r],[a,i,r],[t,i,r]],nz:[[a,o,n],[t,o,n],[t,i,n],[a,i,n]],py:[[t,i,r],[a,i,r],[a,i,n],[t,i,n]],ny:[[t,o,n],[a,o,n],[a,o,r],[t,o,r]]};for(let g of qt){if(u.has(g)||l.has(g))continue;let x=p[g],M=[];for(let S=0;S<4;S++){let R=x[S],X=x[(S+1)%4],O=1;for(let K of qt){if(K===g)continue;let[Z,J]=v[K];Math.abs(R[Z]-J)<1e-9&&Math.abs(X[Z]-J)<1e-9&&l.has(K)&&(O=0)}M.push(O)}let T;g==="py"||g==="ny"?T=[m,m,m,m]:T=[w,w,1,1];let b=g==="py"&&c.top?{...c.top,s:f.s}:f;this.quad(x[0],x[1],x[2],x[3],b,M,{k:T})}}cyl(t,o,n,a,i,r,f,c={}){let l=c.caps??[!0,!0],u=c.rim??[1,1],w=c.r1??a;for(let m=0;m<r;m++){let v=m/r*Math.PI*2,p=(m+1)/r*Math.PI*2,g=Math.cos(v),x=Math.sin(v),M=Math.cos(p),T=Math.sin(p),b=[t+a*g,o,n+a*x],S=[t+w*g,i,n+w*x],R=[t+w*M,i,n+w*T],X=[t+a*M,o,n+a*T],O=(a-w)/Math.max(1e-6,i-o),K=W([g,O,x]),Z=W([M,O,T]),J=v*(a+w)/2,mt=p*(a+w)/2;this.quad(b,S,R,X,f,[0,u[1],0,u[0]],{n:[K,K,Z,Z],uv:[[J,o],[J,i],[mt,i],[mt,o]],k:c.k}),l[1]&&w>0&&this.tri([t,i,n],R,S,f,[1,0,0]),l[0]&&this.tri([t,o,n],b,X,f,[1,0,0])}}lathe(t,o,n,a,i,r,f={}){let c=a.length,l=[];for(let m=0;m<c-1;m++){let v=a[m+1][0]-a[m][0],p=a[m+1][1]-a[m][1];l.push(W([p,-v,0]))}let u=a.map((m,v)=>{let p=l[Math.max(0,v-1)],g=l[Math.min(c-2,v)];return W([p[0]+g[0],p[1]+g[1],0])}),w=f.edges||[];for(let m=0;m<i;m++){let v=m/i*Math.PI*2,p=(m+1)/i*Math.PI*2,g=Math.cos(v),x=Math.sin(v),M=Math.cos(p),T=Math.sin(p);for(let b=0;b<c-1;b++){let[S,R]=a[b],[X,O]=a[b+1],K=[t+S*g,o+R,n+S*x],Z=[t+X*g,o+O,n+X*x],J=[t+X*M,o+O,n+X*T],mt=[t+S*M,o+R,n+S*T],tt=f.flat?l[b]:u[b],et=f.flat?l[b]:u[b+1];this.quad(K,Z,J,mt,r,[0,w[b+1]?1:0,0,w[b]?1:0],{n:[[tt[0]*g,tt[1],tt[0]*x],[et[0]*g,et[1],et[0]*x],[et[0]*M,et[1],et[0]*T],[tt[0]*M,tt[1],tt[0]*T]],uv:[[v*1.2,R],[v*1.2,O],[p*1.2,O],[p*1.2,R]]})}}}poly(t,o,n={}){for(let a=1;a<t.length-1;a++)this.tri(t[0],t[a],t[a+1],o,[1,a===t.length-2?1:0,a===1?1:0],n)}blob(t,o,n,a,i,r,f,c={}){let l=c.sub??1,u=c.seed??0,w=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let p=0;p<l;p++){let g=[];for(let[x,M,T]of w){let b=W([(x[0]+M[0])/2,(x[1]+M[1])/2,(x[2]+M[2])/2]),S=W([(M[0]+T[0])/2,(M[1]+T[1])/2,(M[2]+T[2])/2]),R=W([(T[0]+x[0])/2,(T[1]+x[1])/2,(T[2]+x[2])/2]);g.push([x,b,R],[b,M,S],[R,S,T],[b,S,R])}w=g}let m=p=>1+(c.lump??.12)*Math.sin(p[0]*5.1+u)*Math.sin(p[1]*4.3+u*1.7)*Math.sin(p[2]*3.7+u*.3),v=p=>{let g=m(p);return[t+p[0]*a*g,o+p[1]*i*g,n+p[2]*r*g]};for(let[p,g,x]of w)this.tri(v(p),v(g),v(x),f,[0,0,0],{n:[p,g,x],k:c.k})}build(){let t=new L.BufferGeometry;return t.setAttribute("position",new L.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new L.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new L.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new L.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new L.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new L.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}},gt={T:(e,t,o)=>new L.Matrix4().makeTranslation(e,t,o),RX:e=>new L.Matrix4().makeRotationX(e),RY:e=>new L.Matrix4().makeRotationY(e),RZ:e=>new L.Matrix4().makeRotationZ(e),S:(e,t,o)=>new L.Matrix4().makeScale(e,t??e,o??e),chain:(...e)=>e.reduce((t,o)=>t.multiply(o),new L.Matrix4)};var U=kt(pt(),1);function Kt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new U.Vector3(.1,.9,.66).normalize()},uPaper:{value:new U.Vector3(.925,.898,.835)},uInk:{value:new U.Vector3(.11,.1,.09)},uHaze:{value:new U.Vector3(.83,.86,.84)},uFade:{value:1}}}var Lt=`
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
// 1 on a line of half-width w (world units) around d = 0; never thinner than ~0.7px
float lineMask(float d, float w) {
  float px = max(fwidth(d), 1e-5);
  float ww = max(w, px * 0.55);
  return (1.0 - smoothstep(ww - px * 0.5, ww + px * 0.5, d)) * min(1.0, w / (px * 0.55) + 0.35);
}
// fade detail out when its period shrinks below a few pixels
float lod(float period, float fw) {
  return smoothstep(2.5, 6.0, period / max(fw, 1e-5));
}
`,It=`
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  // aerial perspective
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);

  // ---- lithograph ----
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  // hatching that follows the surface: one set below mid tone, a cross set in deep shade
  float hp = 0.22 + haze * 0.25;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  // d is 0 on a hatch line and 1 midway between lines; a line covers the
  // fraction c of each period, so darker tones get wider lines
  float h1 = 1.0 - smoothstep(c1 - aa1, c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(c2 - aa2, c2 + aa2, d2);
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
`,he=`
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
uniform float uTime;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
void main() {
  vec3 p = position;
  if (amat.z > 0.0) {
    float ph = uTime * 1.5 + position.x * 0.5 + position.z * 0.25;
    float g = amat.z;
    p.z += (sin(ph) * 0.20 + sin(ph * 2.3 + 1.7) * 0.06) * g;
    p.x += sin(ph * 0.7 + 0.4) * 0.07 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  #ifdef USE_INSTANCING
    wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  #endif
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ue=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
${Lt}
${It}

void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.36 + 0.66 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {            // brick
    float rh = 0.34, bl = 0.76;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.3 * h, l);
    lines = lineMask(d, 0.022) * l * 0.85;
  } else if (pat == 2.0) {     // ashlar (dressed stone courses)
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.018) * l * 0.6;
  } else if (pat == 3.0) {     // roof tiles: scalloped courses
    float rh = 0.42, bw = 0.5;
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
    lines = max(lineMask(dl, 0.02), (1.0 - dv) * 0.6) * l;
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
  } else if (pat == 7.0) {     // cobbles
    vec2 g = uv / 0.36;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(0.36, fw);
    tex = mix(1.0, 0.86 + 0.24 * hash12(cell), l);
    lines = smoothstep(0.38, 0.49, r) * l * 0.7;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 22.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.75 + 0.45 * fbm(uv * 3.0);
  } else if (pat == 10.0) {    // rough stone (terrace walls)
    float rh = 0.3, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.025) * l * 0.75;
  } else if (pat == 11.0) {    // window pane
    tex = 0.75 + 0.35 * smoothstep(0.2, 0.9, fract((uv.x + uv.y) * 0.8));
  } else if (pat == 12.0) {    // soil
    tex = 0.85 + 0.2 * fbm(uv * 2.5);
  } else if (pat == 13.0) {    // vine rows (tops of the terraces)
    tex = 0.86 + 0.18 * fbm(uv * 0.9);
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;function zt(e,t={}){return new U.ShaderMaterial({uniforms:e,vertexShader:he,fragmentShader:ue,transparent:!!t.transparent,side:t.side??U.FrontSide})}var Le=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${Lt}
${It}
void main() {
  float s = vF.x - uFlowTime * 2.6;
  float lat = vF.y;
  float n = fbm(vec2(s * 0.45, lat * 1.8));
  float n2 = fbm(vec2(s * 1.3 + 3.1 + n * 1.5, lat * 4.0));
  float streak = smoothstep(0.56, 0.74, n2);
  float wall = smoothstep(0.75, 1.3, abs(lat));
  // ripple bands across the flow, bent by the noise
  float rp = s * 2.4 + n * 3.0 + lat * lat * 0.6;
  float ripple = abs(fract(rp) - 0.5) * 2.0;
  float rl = 1.0 - smoothstep(0.0, 0.18 + fwidth(rp) * 2.0, ripple);
  vec3 deep = vec3(0.30, 0.47, 0.55);
  vec3 col = deep * (0.85 + 0.35 * n);
  col = mix(col, vec3(0.88, 0.94, 0.95), clamp(streak * 0.75 + wall * 0.25 * n, 0.0, 1.0));
  col *= 1.0 - rl * 0.12;
  vec3 outc = finish(col, 0.0, rl * 0.25 * (1.0 - streak), vec2(s, lat), fwidth(s), 0.0);
  gl_FragColor = vec4(outc, uFade);
}
`;var Ie=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uSpeed;
varying vec2 vF;
varying vec3 vN;
${Lt}
${It}
void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.72 + 0.3 * diff;
  // s grows downstream; the fall accelerates, so stretch the noise with depth
  float s = vF.x;
  float lat = vF.y;
  float sp = s * 0.18 - uFlowTime * uSpeed * 0.18;
  float n1 = fbm(vec2(lat * 3.2, sp * 1.0));
  float n2 = fbm(vec2(lat * 7.5 + n1 * 1.5, sp * 2.2));
  float streak = smoothstep(0.42, 0.72, n2);
  float dark = smoothstep(0.55, 0.3, n2);
  vec3 col = mix(vec3(0.55, 0.68, 0.74), vec3(0.95, 0.98, 1.0), 0.35 + 0.6 * streak);
  col *= shade;
  col *= 1.0 - dark * 0.18;
  float edgeL = 1.0 - smoothstep(0.0, 0.06 + fwidth(lat) * 1.5, 0.5 * uWidth - abs(lat));
  vec3 outc = finish(col, 0.0, edgeL * 0.6, vec2(lat * 0.6, s * 0.08), fwidth(s * 0.08), 0.0);
  gl_FragColor = vec4(outc, uFade);
}
`;var F=.42,ft=1.8,ht=-2.4,ct=1.7,Pt=2.6;function de(){let e=new lt,t=Rt(13227743,vt.PLAIN);for(let o=0;o<3;o++)e.push(gt.chain(gt.T(ht,F,-o*ft),gt.RZ(-Math.PI/2))),e.cyl(0,0,0,F,ct-ht,28,t,{caps:[!0,!1]}),e.pop();return e.box(ct,0,-2*ft-F-.15,Pt,2*F,F+.15,t,{}),e.build()}function me(){let e=new lt,t=Rt(15127208,vt.PLAIN),o=[-F,F],n=[-2*ft+F-2*F,-2*ft+F];return e.box(ht,0,o[0],ct,2*F,o[1],t,{open:["px"]}),e.box(ht,0,n[0],ct,2*F,n[1],t,{open:["px"]}),e.box(ct,0,n[0],Pt,2*F,o[1],t,{}),e.build()}var wt=class{constructor(t){this.canvas=t,this.renderer=new B.WebGLRenderer({canvas:t,antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.setClearColor(0,0),this.renderer.autoClear=!1,this.uniforms=Kt(),this.uniforms.uLight.value.set(-.5,.85,.28).normalize(),this.items=[de(),me()].map(n=>{let a={...this.uniforms,uFade:{value:1}},i=new B.Mesh(n,zt(a,{transparent:!0})),r=new B.Scene,f=new B.Group;f.position.set(-(ht+Pt)/2+.1,0,ft);let c=new B.Group;return c.add(f),f.add(i),r.add(c),{scene:r,holder:c,u:a}});let o=new B.OrthographicCamera(-1,1,1,-1,.1,100);o.position.set(-6,9,18),o.lookAt(0,.4,0),this.camera=o,this.w=1,this.h=1}resize(t,o){this.w=t,this.h=o,this.renderer.setSize(t,o,!1)}render(t,o,n){let a=this.renderer,i=this.camera;this.uniforms.uLitho.value=n,this.uniforms.uTime.value=t,a.setScissorTest(!1),a.clear(),a.setScissorTest(!0);let r=this.w/2,f=r/this.h,c=3.4;i.left=-c*f,i.right=c*f,i.top=c,i.bottom=-c,i.updateProjectionMatrix(),this.items.forEach((l,u)=>{l.holder.rotation.y=.32*Math.sin(t*.45+u*1.3),l.u.uFade.value=.22+.78*o[u],a.setViewport(u*r,0,r,this.h),a.setScissor(u*r,0,r,this.h),a.render(l.scene,i)})}};var A=1e3,Et=1e3*38/30,I=60,At=175,it=150,k=735,H=870,ut=.3*I,V=[360,470],Y=[500,610],bt=485,h=e=>At+e*I,rt=.5,y=rt*I,Ct=[H-4*y,k-3*y,k-3*y,k-y,H,H],Bt=e=>H-rt*(h(4)-e),pe=e=>k-3*y+rt*(e-h(1)),ve=e=>k-3*y+rt*(e-h(2)),P=document.getElementById("scene"),s=P.getContext("2d"),yt=document.getElementById("readings"),_t=null;try{_t=new wt(yt)}catch{yt.style.display="none"}var E=1,xt=1,j=null,q=null;Vt(30/38,(e,t)=>{xt=Math.min(window.devicePixelRatio||1,2),P.width=Math.round(e*xt),P.height=Math.round(t*xt),E=e*xt/A;let o={x:.07*e,y:690/Et*t,w:.86*e,h:400/Et*t};Object.assign(yt.style,{left:`${o.x}px`,top:`${o.y}px`,width:`${o.w}px`,height:`${o.h}px`}),_t?.resize(Math.round(o.w),Math.round(o.h)),j=null,q=null});function ge(e,t,o=1){let n=e.length,a=[0];for(let l=1;l<n;l++)a.push(a[l-1]+Math.hypot(e[l][0]-e[l-1][0],e[l][1]-e[l-1][1]));let i=a[n-1],r=i*o,f=[],c=[];for(let l=0;l<n;l++){let u=e[l],w=a[l];if(w>r){let T=(r-a[l-1])/Math.max(1e-6,a[l]-a[l-1]);u=[e[l-1][0]+(e[l][0]-e[l-1][0])*T,e[l-1][1]+(e[l][1]-e[l-1][1])*T],w=r}let m=e[Math.max(0,l-1)],v=e[Math.min(n-1,l+1)],p=v[0]-m[0],g=v[1]-m[1],x=Math.hypot(p,g)||1;p/=x,g/=x;let M=t(w,i,u)/2;if(f.push([u[0]-g*M,u[1]+p*M]),c.push([u[0]+g*M,u[1]-p*M]),w>=r)break}if(!(f.length<2)){s.beginPath(),s.moveTo(f[0][0]*E,f[0][1]*E);for(let l of f)s.lineTo(l[0]*E,l[1]*E);for(let l=c.length-1;l>=0;l--)s.lineTo(c[l][0]*E,c[l][1]*E);s.closePath(),s.fill()}}function _(e,t,o,n,a=24){let i=[];for(let r=0;r<=a;r++)i.push([e+(o-e)*r/a,t+(n-t)*r/a]);return i}var z=(e,t,o)=>{let n=Math.min(1,Math.max(0,(o-e)/(t-e)));return n*n*(3-2*n)},Nt=e=>{let t=Math.sin(e*91.7+13.1)*43758.5453;return t-Math.floor(t)},D=[];function C(e,t,o){D.push({pts:e,width:t,dur:o})}var Q=2.7,N=(e,t,o=6)=>Math.min(1,e/o+.35,(t-e)/o+.35);for(let e=0;e<6;e++){let t=e*7;C(_(it,h(e),Ct[e],h(e),60),(o,n)=>Q*(.97+.05*Math.sin(o*.013+t))*N(o,n),.75)}for(let e=0;e<3;e++){let t=h(2*e)+I/2,o=[];for(let n=0;n<=64;n++){let a=-Math.PI/2-n/64*Math.PI*2;o.push([it+ut*Math.cos(a),t+I/2*Math.sin(a)])}C(o,(n,a)=>{let i=n/a;return Q*(.85+.45*Math.max(0,Math.sin(i*Math.PI*2-.4)))},.55)}C(_(H,h(5),H,h(4),10),(e,t)=>Q*N(e,t,3),.2);C(_(H,h(4),H-4*y,h(0),30),(e,t)=>Q*N(e,t,3),.4);C(_(k-3*y,h(1),k-3*y,h(2),10),(e,t)=>Q*N(e,t,3),.2);C(_(k-3*y,h(1),k-y,h(3),20),(e,t)=>Q*N(e,t,3),.3);C(_(k-3*y,h(2),k-2*y,h(3),12),(e,t)=>Q*.8*N(e,t,3),.2);var Mt=D.length,we=e=>1-z(V[0],V[1],e),Jt=e=>z(Y[0],Y[1],e);for(let e=0;e<3;e++){let t=h(2*e)+I/2,o=I/2;for(let n=-.35;n<1.5;n+=.15){let a=t+o*Math.sin(n),i=it+ut*Math.cos(n)+4,f=.45+1.15*((Math.sin(n)+.45)/1.45),c=V[1]-8*Nt(e*31+n*10);C(_(i,a,c,a,30),(l,u,w)=>f*we(w[0])*N(l,u,10),.22)}}function dt(e,t,o,n,a=.5){for(let i=0;i<t;i++){let r=h(e)+I*((i+a)/t),f=Y[0]-6+10*Nt(e*13+i);C(_(f,r,o(r)-3,r,30),(c,l,u)=>n*Jt(u[0])*N(c,l,8),.22)}}dt(1,8,()=>k-3*y,1.25);dt(4,8,()=>H,1.25);dt(2,11,ve,1.6);dt(0,2,Bt,.5,.7);dt(3,2,Bt,.5,.7);for(let e of[1,2])for(let t=0;t<2;t++){let o=h(e)+I*((t+.7)/2);C(_(pe(o)+5,o,Bt(o)-3,o,12),(n,a)=>.5*N(n,a,8),.2)}for(let e=k-3*y+4;e<k-y-2;e+=4.5){let t=h(1)+(e-(k-3*y))/rt,o=e<k-2*y?h(2)+(e-(k-3*y))/rt:h(3);o-t>3&&C(_(e,t+1.5,e,o-1.5,6),(n,a)=>.9*N(n,a,4),.1)}for(let e=0;e<24;e++){let t=Y[0]+40+e*((k-3*y-Y[0]-60)/24);C(_(t,h(2)+2,t+I*.55,h(3)-2,8),(o,n,a)=>.8*Jt(a[0])*N(o,n,5),.12)}var Yt=.3;D.forEach((e,t)=>{e.t0=Yt,Yt+=t<Mt?e.dur*.62:.035});var ot=D[D.length-1].t0+D[D.length-1].dur;function be(e){if(e<=.001)return;s.save(),s.globalAlpha=e;let t=E,o=(n,a)=>{let i=s.createLinearGradient(n*t,0,a*t,0);return i.addColorStop(0,"rgba(255,255,255,0)"),i.addColorStop(1,"rgba(255,255,255,1)"),i};for(let n=0;n<3;n++){let a=h(2*n),i=a+I,r=s.createLinearGradient(0,a*t,0,i*t);r.addColorStop(0,"rgba(150,172,190,0.55)"),r.addColorStop(.35,"rgba(126,152,174,0.6)"),r.addColorStop(1,"rgba(70,96,122,0.75)"),s.fillStyle=r,s.beginPath(),s.ellipse(it*t,(a+I/2)*t,ut*t,I/2*t,0,Math.PI/2,Math.PI*1.5),s.lineTo(V[1]*t,a*t),s.lineTo(V[1]*t,i*t),s.closePath(),s.fill(),s.fillStyle="rgba(196,212,224,0.75)",s.beginPath(),s.ellipse(it*t,(a+I/2)*t,ut*t,I/2*t,0,0,Math.PI*2),s.fill()}if(s.globalCompositeOperation="destination-out",s.fillStyle=o(V[0],V[1]),s.fillRect(V[0]*t,(h(0)-4)*t,(V[1]-V[0]+4)*t,(5*I+8)*t),s.globalCompositeOperation="source-over",!q){q=document.createElement("canvas"),q.width=P.width,q.height=P.height;let n=q.getContext("2d"),a=(l,u)=>{n.fillStyle=u,n.beginPath(),l.forEach(([w,m],v)=>v?n.lineTo(w*t,m*t):n.moveTo(w*t,m*t)),n.closePath(),n.fill()},i="rgba(224,196,140,0.55)",r="rgba(176,128,72,0.62)",f=Y[0];a([[f,h(0)],[Ct[0],h(0)],[H,h(4)],[f,h(4)]],i),a([[f,h(1)],[k-3*y,h(1)],[k-3*y,h(2)],[f,h(2)]],r),a([[f,h(2)],[k-3*y,h(2)],[k-2*y,h(3)],[f,h(3)]],"rgba(84,60,40,0.72)"),a([[k-3*y,h(1)],[k-y,h(3)],[k-2*y,h(3)],[k-3*y,h(2)]],"rgba(150,108,62,0.65)"),a([[f,h(4)],[H,h(4)],[H,h(5)],[f,h(5)]],r),n.globalCompositeOperation="destination-in";let c=n.createLinearGradient(Y[0]*t,0,Y[1]*t,0);c.addColorStop(0,"rgba(0,0,0,0)"),c.addColorStop(1,"rgba(0,0,0,1)"),n.fillStyle=c,n.fillRect(0,0,q.width,q.height)}s.drawImage(q,0,0),s.restore()}function xe(e){if(!j){j=document.createElement("canvas"),j.width=P.width,j.height=P.height;let n=j.getContext("2d"),a=n.createImageData(j.width,j.height);for(let i=0;i<a.data.length;i+=4){let r=(Nt(i*.25)-.5)*10;a.data[i]=150+r,a.data[i+1]=145+r,a.data[i+2]=135+r,a.data[i+3]=14}n.putImageData(a,0,0)}s.fillStyle=e>.5?"#ece5d5":"#efe9dc",s.fillRect(0,0,P.width,P.height),s.drawImage(j,0,0);let t=E,o=30;s.strokeStyle="rgba(120,108,88,0.45)",s.lineWidth=1.2*t,s.strokeRect(o*t,o*t,(A-2*o)*t,(Et-2*o)*t),s.strokeStyle="rgba(255,255,255,0.6)",s.strokeRect((o+1.5)*t,(o+1.5)*t,(A-2*o)*t,(Et-2*o)*t)}function $(e,t,o,n,a={}){s.save(),s.font=`${a.italic?"italic ":""}${n*E}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`,s.textAlign=a.align||"center",s.textBaseline="middle",s.fillStyle=a.color||Qt,a.spacing&&"letterSpacing"in s&&(s.letterSpacing=`${a.spacing*E}px`),s.fillText(e,t*E,o*E),s.restore()}function Me(e){if(e<=.001)return;s.save(),s.globalAlpha=e;let t="#a23b2a",o=[[88,["prong","gap","prong","gap","prong"]],[918,["top","front","slot","top","front"]]];for(let[n,a]of o){for(let i=0;i<6;i++)s.fillStyle=t,s.beginPath(),s.arc(n*E,h(i)*E,10*E,0,Math.PI*2),s.fill(),$(String(i+1),n,h(i)+.5,13,{color:"#f4efe4"});a.forEach((i,r)=>$(i,n,h(r)+I/2,14,{italic:!0,color:t}))}s.strokeStyle="rgba(162,59,42,0.45)",s.lineWidth=.9*E,s.setLineDash([3*E,4*E]);for(let n=0;n<6;n++)s.beginPath(),s.moveTo((it-ut-6)*E,h(n)*E),s.lineTo(102*E,h(n)*E),s.moveTo((Ct[n]+6)*E,h(n)*E),s.lineTo(904*E,h(n)*E),s.stroke();s.restore()}function Ee(e){if(Math.abs(e)<.002)return;let t=E,o=At-70,n=h(5)+64,a,i;e<0?(a=A+40+(bt-A-40)*-e,i=A+60):(a=-60,i=-40+(bt+40)*e),s.save(),s.shadowColor="rgba(40,30,20,0.35)",s.shadowBlur=18*t,s.shadowOffsetX=(e<0?-4:4)*t,s.fillStyle="#f3eee3",s.fillRect(a*t,o*t,(i-a)*t,(n-o)*t),s.restore(),s.save(),s.strokeStyle="rgba(90,80,64,0.5)",s.lineWidth=1*t,s.strokeRect(a*t,o*t,(i-a)*t,(n-o)*t),s.restore();let r=z(.82,.98,Math.abs(e));if(r>0){s.save(),s.globalAlpha=r;let f=e<0?(bt+A-30)/2+10:(bt+30)/2-10,c=e<0?["Alone, the left half","is three round prongs."]:["Alone, the right half","is a U-shaped bar","of square section."];c.forEach((l,u)=>$(l,f,(At+h(5))/2+(u-(c.length-1)/2)*26,19,{italic:!0,color:"#5b5145"})),s.restore()}}var Qt="#1d1b18",d={t:0,draw:0,playing:!0,litho:1,lithoTarget:1,cover:0,labels:0,labelsOn:!1};$t();Dt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{d.lithoTarget=e},1);var ye=window.matchMedia("(prefers-reduced-motion: reduce)").matches;ye&&(d.draw=ot);var Ft=Gt(e=>{d.playing=e}),Ht=document.getElementById("cover"),at=e=>{d.cover=Math.max(-1,Math.min(1,e)),Ht.value=String(Math.round(d.cover*100))};Ht.addEventListener("input",()=>{d.cover=+Ht.value/100});var te=document.getElementById("btn-labels"),Ot=e=>{d.labelsOn=e,te.setAttribute("aria-pressed",String(e))};te.addEventListener("click",()=>Ot(!d.labelsOn));Xt({" ":()=>Ft(!d.playing),l:()=>document.getElementById(d.lithoTarget?"btn-colour":"btn-litho").click(),n:()=>Ot(!d.labelsOn),d:()=>{d.draw=0,Ft(!0)},ArrowLeft:()=>at(d.cover-.25),ArrowRight:()=>at(d.cover+.25),0:()=>at(0)});var nt=null;P.addEventListener("pointerdown",e=>{P.setPointerCapture(e.pointerId),nt={x:e.clientX,v:d.cover}});P.addEventListener("pointermove",e=>{nt&&at(nt.v+(e.clientX-nt.x)/(P.clientWidth*.5))});P.addEventListener("pointerup",()=>{nt=null});P.addEventListener("pointercancel",()=>{nt=null});P.addEventListener("dblclick",()=>at(0));var Zt=performance.now();function ee(e){let t=Math.min(.05,Math.max(0,(e-Zt)/1e3));Zt=e,d.playing&&(d.t+=t,d.draw=Math.min(ot,d.draw+t)),d.litho+=Math.sign(d.lithoTarget-d.litho)*Math.min(Math.abs(d.lithoTarget-d.litho),t*2.5),d.labels+=Math.sign((d.labelsOn?1:0)-d.labels)*Math.min(Math.abs((d.labelsOn?1:0)-d.labels),t*4),Qt=d.litho>.5?"#1d1b18":"#3b2b1e",xe(d.litho);let o=z(D[Mt].t0,ot,d.draw);be((1-d.litho)*o),s.fillStyle=d.litho>.5?"#1d1b18":"#35271b";for(let r of D){let f=(d.draw-r.t0)/r.dur;f<=0||ge(r.pts,r.width,Math.min(1,f))}Me(d.labels*z(0,Mt?D[Mt].t0:1,d.draw));let n=z(ot-.6,ot,d.draw);n>0&&(s.save(),s.globalAlpha=n,$("THE DEVIL\u2019S FORK",A/2,88,15,{spacing:6}),$("FIG. 1",A/2,585,13,{spacing:4}),$("Six lines. Three round prongs at one end, two square bars at the other.",A/2,612,17,{italic:!0}),$("a.  three round prongs",A*.285,1105,16,{italic:!0}),$("b.  a U-shaped bar",A*.715,1105,16,{italic:!0}),$("FIG. 2",A/2,1160,13,{spacing:4}),$("The two solids the drawing could be. Neither matches all of it.",A/2,1187,17,{italic:!0}),s.restore()),Ee(d.cover);let a=d.cover<0?1:1-z(.2,.9,d.cover),i=d.cover>0?1:1-z(.2,.9,-d.cover);yt.style.opacity=String(n),_t?.render(d.t,[a,i],d.litho),requestAnimationFrame(ee)}Ut();requestAnimationFrame(ee);window.__page={state:d,setCover:at,setLabels:Ot,setPlaying:Ft,DRAW_END:ot};})();
