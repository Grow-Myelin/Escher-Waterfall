(()=>{var dt=Object.create;var Q=Object.defineProperty;var pt=Object.getOwnPropertyDescriptor;var wt=Object.getOwnPropertyNames;var xt=Object.getPrototypeOf,gt=Object.prototype.hasOwnProperty;var bt=(a,t)=>()=>{try{return t||a((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}};var Et=(a,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of wt(t))!gt.call(a,o)&&o!==e&&Q(a,o,{get:()=>t[o],enumerable:!(n=pt(t,o))||n.enumerable});return a};var U=(a,t,e)=>(e=a!=null?dt(xt(a)):{},Et(t||!a||!a.__esModule?Q(e,"default",{value:a,enumerable:!0}):e,a));var N=bt((Ht,z)=>{z.exports=window.THREE});var L=U(N(),1);var y=U(N(),1),yt=1e3,G={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Mt(a){return[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]}function et(a,t=G.PLAIN,e={}){return{c:typeof a=="number"?Mt(a):a,p:t,f:e.f||0,w:e.w||0,s:e.s||0}}var tt=["px","nx","py","ny","pz","nz"];function R(a,t){return[a[0]-t[0],a[1]-t[1],a[2]-t[2]]}function j(a,t){return[a[1]*t[2]-a[2]*t[1],a[2]*t[0]-a[0]*t[2],a[0]*t[1]-a[1]*t[0]]}function _(a){return Math.hypot(a[0],a[1],a[2])}function k(a){let t=_(a)||1;return[a[0]/t,a[1]/t,a[2]/t]}function D(a,t){let e=Math.abs(t[0]),n=Math.abs(t[1]),o=Math.abs(t[2]);return e>=n&&e>=o?[a[2],a[1]]:o>=n?[a[0],a[1]]:[a[0],a[2]]}var V=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new y.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new y.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let e=this.m.elements,n=t[0],o=t[1],i=t[2];return[e[0]*n+e[4]*o+e[8]*i+e[12],e[1]*n+e[5]*o+e[9]*i+e[13],e[2]*n+e[6]*o+e[10]*i+e[14]]}_tn(t){if(!this.nm)return t;let e=this.nm.elements,n=t[0],o=t[1],i=t[2];return k([e[0]*n+e[3]*o+e[6]*i,e[1]*n+e[4]*o+e[7]*i,e[2]*n+e[5]*o+e[8]*i])}tri(t,e,n,o,i=[1,1,1],r={}){let p=this._tp(t),s=this._tp(e),m=this._tp(n),d=k(j(R(e,t),R(n,t))),w=r.uv||[D(t,d),D(e,d),D(n,d)],l=k(j(R(s,p),R(m,p))),u=r.n?r.n.map(c=>this._tn(c)):[l,l,l],f=_(j(R(s,p),R(m,p))),h=[f/(_(R(m,s))||1),f/(_(R(p,m))||1),f/(_(R(s,p))||1)],v=r.k||[1,1,1],x=o.s||0,g=[p,s,m];for(let c=0;c<3;c++){let b=g[c];this.pos.push(b[0]+x,b[1]+x,b[2]+x),this.nrm.push(u[c][0],u[c][1],u[c][2]),this.col.push(o.c[0]*v[c],o.c[1]*v[c],o.c[2]*v[c]),this.uv.push(w[c][0],w[c][1]);for(let E=0;E<3;E++)i[E]?this.edg.push(c===E?h[E]:0):this.edg.push(yt);this.mat.push(o.p,o.f,o.w)}}quad(t,e,n,o,i,r=[1,1,1,1],p={}){let s=p.k||[1,1,1,1],m=p.n,d=p.uv;this.tri(t,e,n,i,[r[1],0,r[0]],{k:[s[0],s[1],s[2]],n:m&&[m[0],m[1],m[2]],uv:d&&[d[0],d[1],d[2]]}),this.tri(t,n,o,i,[r[2],r[3],0],{k:[s[0],s[2],s[3]],n:m&&[m[0],m[2],m[3]],uv:d&&[d[0],d[2],d[3]]})}box(t,e,n,o,i,r,p,s={}){t>o&&([t,o]=[o,t]),e>i&&([e,i]=[i,e]),n>r&&([n,r]=[r,n]);let m=new Set(s.open||[]),d=new Set(s.skip||[]);s.bottom||d.add("ny");let w=s.ao??1,l=s.aoTop??1,u={px:[0,o],nx:[0,t],py:[1,i],ny:[1,e],pz:[2,r],nz:[2,n]},f={px:[[o,e,r],[o,e,n],[o,i,n],[o,i,r]],nx:[[t,e,n],[t,e,r],[t,i,r],[t,i,n]],pz:[[t,e,r],[o,e,r],[o,i,r],[t,i,r]],nz:[[o,e,n],[t,e,n],[t,i,n],[o,i,n]],py:[[t,i,r],[o,i,r],[o,i,n],[t,i,n]],ny:[[t,e,n],[o,e,n],[o,e,r],[t,e,r]]};for(let h of tt){if(d.has(h)||m.has(h))continue;let v=f[h],x=[];for(let b=0;b<4;b++){let E=v[b],T=v[(b+1)%4],M=1;for(let F of tt){if(F===h)continue;let[A,I]=u[F];Math.abs(E[A]-I)<1e-9&&Math.abs(T[A]-I)<1e-9&&m.has(F)&&(M=0)}x.push(M)}let g;h==="py"||h==="ny"?g=[l,l,l,l]:g=[w,w,1,1];let c=h==="py"&&s.top?{...s.top,s:p.s}:p;this.quad(v[0],v[1],v[2],v[3],c,x,{k:g})}}cyl(t,e,n,o,i,r,p,s={}){let m=s.caps??[!0,!0],d=s.rim??[1,1],w=s.r1??o;for(let l=0;l<r;l++){let u=l/r*Math.PI*2,f=(l+1)/r*Math.PI*2,h=Math.cos(u),v=Math.sin(u),x=Math.cos(f),g=Math.sin(f),c=[t+o*h,e,n+o*v],b=[t+w*h,i,n+w*v],E=[t+w*x,i,n+w*g],T=[t+o*x,e,n+o*g],M=(o-w)/Math.max(1e-6,i-e),F=k([h,M,v]),A=k([x,M,g]),I=u*(o+w)/2,C=f*(o+w)/2;this.quad(c,b,E,T,p,[0,d[1],0,d[0]],{n:[F,F,A,A],uv:[[I,e],[I,i],[C,i],[C,e]],k:s.k}),m[1]&&w>0&&this.tri([t,i,n],E,b,p,[1,0,0]),m[0]&&this.tri([t,e,n],c,T,p,[1,0,0])}}lathe(t,e,n,o,i,r,p={}){let s=o.length,m=[];for(let l=0;l<s-1;l++){let u=o[l+1][0]-o[l][0],f=o[l+1][1]-o[l][1];m.push(k([f,-u,0]))}let d=o.map((l,u)=>{let f=m[Math.max(0,u-1)],h=m[Math.min(s-2,u)];return k([f[0]+h[0],f[1]+h[1],0])}),w=p.edges||[];for(let l=0;l<i;l++){let u=l/i*Math.PI*2,f=(l+1)/i*Math.PI*2,h=Math.cos(u),v=Math.sin(u),x=Math.cos(f),g=Math.sin(f);for(let c=0;c<s-1;c++){let[b,E]=o[c],[T,M]=o[c+1],F=[t+b*h,e+E,n+b*v],A=[t+T*h,e+M,n+T*v],I=[t+T*x,e+M,n+T*g],C=[t+b*x,e+E,n+b*g],P=p.flat?m[c]:d[c],B=p.flat?m[c]:d[c+1];this.quad(F,A,I,C,r,[0,w[c+1]?1:0,0,w[c]?1:0],{n:[[P[0]*h,P[1],P[0]*v],[B[0]*h,B[1],B[0]*v],[B[0]*x,B[1],B[0]*g],[P[0]*x,P[1],P[0]*g]],uv:[[u*1.2,E],[u*1.2,M],[f*1.2,M],[f*1.2,E]]})}}}poly(t,e,n={}){for(let o=1;o<t.length-1;o++)this.tri(t[0],t[o],t[o+1],e,[1,o===t.length-2?1:0,o===1?1:0],n)}blob(t,e,n,o,i,r,p,s={}){let m=s.sub??1,d=s.seed??0,w=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let f=0;f<m;f++){let h=[];for(let[v,x,g]of w){let c=k([(v[0]+x[0])/2,(v[1]+x[1])/2,(v[2]+x[2])/2]),b=k([(x[0]+g[0])/2,(x[1]+g[1])/2,(x[2]+g[2])/2]),E=k([(g[0]+v[0])/2,(g[1]+v[1])/2,(g[2]+v[2])/2]);h.push([v,c,E],[c,x,b],[E,b,g],[c,b,E])}w=h}let l=f=>1+(s.lump??.12)*Math.sin(f[0]*5.1+d)*Math.sin(f[1]*4.3+d*1.7)*Math.sin(f[2]*3.7+d*.3),u=f=>{let h=l(f);return[t+f[0]*o*h,e+f[1]*i*h,n+f[2]*r*h]};for(let[f,h,v]of w)this.tri(u(f),u(h),u(v),p,[0,0,0],{n:[f,h,v],k:s.k})}build(){let t=new y.BufferGeometry;return t.setAttribute("position",new y.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new y.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new y.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new y.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new y.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new y.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}};var S=U(N(),1);function ot(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new S.Vector3(.1,.9,.66).normalize()},uPaper:{value:new S.Vector3(.925,.898,.835)},uInk:{value:new S.Vector3(.11,.1,.09)},uHaze:{value:new S.Vector3(.83,.86,.84)},uFade:{value:1}}}var K=`
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
`,X=`
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
`,kt=`
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
`,Tt=`
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
${K}
${X}

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
`;function at(a,t={}){return new S.ShaderMaterial({uniforms:a,vertexShader:kt,fragmentShader:Tt,transparent:!!t.transparent,side:t.side??S.FrontSide})}var At=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${K}
${X}
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
`;var It=`
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
${K}
${X}
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
`;function nt(a,t){let e=document.getElementById("frame"),n=()=>{let i=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),p=document.getElementById("controls"),s=(r?r.offsetHeight:0)+6+13,m=(p?p.offsetHeight:0)+8+13,d=window.innerWidth-i*2,w=window.innerHeight-s-m,l=w,u=l*a;u>d&&(u=d,l=u/a),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),e.style.width=`${u}px`,e.style.height=`${l}px`,e.style.top=`${s+Math.max(0,(w-l)/2)}px`,t?.(u,l)};return window.addEventListener("resize",n),n(),n}function it(){let a=document.getElementById("panel"),t=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!a)return;let n=o=>{o?a.removeAttribute("hidden"):a.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(o))};t?.addEventListener("click",()=>n(a.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",o=>{o.key==="Escape"&&n(!1)})}function rt(a,t,e){let n=o=>{for(let[i,r]of a)i.setAttribute("aria-pressed",String(r===o));t(o)};for(let[o,i]of a)o.addEventListener("click",()=>n(i));return e!==void 0&&n(e),n}function st(a){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let e=a[t.key.length===1?t.key.toLowerCase():t.key];e&&(t.preventDefault(),e(t))})}function lt(a,t=!0){let e=document.getElementById("btn-play"),n=o=>{t=o,e&&(e.setAttribute("aria-pressed",String(!o)),e.querySelector("span").textContent=o?"Pause":"Play",e.querySelector(".icon").textContent=o?"\u275A\u275A":"\u25B6"),a(o)};return e?.addEventListener("click",()=>n(!t)),n(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function ft(){document.body.classList.add("ready")}var Rt=document.getElementById("scene"),q=new L.WebGLRenderer({canvas:Rt,antialias:!0});q.setPixelRatio(Math.min(window.devicePixelRatio||1,2));q.setClearColor(15525333,1);var ut=new L.Scene,Z=ot(),ht=new V;ht.box(-2,-2,-2,2,2,2,et(13221544,G.ASHLAR));var mt=new L.Mesh(ht.build(),at(Z));ut.add(mt);var H=new L.OrthographicCamera(-1,1,1,-1,.1,1e3);H.position.set(100,100,100);H.lookAt(0,0,0);var O=12;nt(30/38,(a,t)=>{q.setSize(a,t),H.left=-O/2*(a/t),H.right=O/2*(a/t),H.top=O/2,H.bottom=-O/2,H.updateProjectionMatrix()});it();var W=1,$=1;rt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],a=>{$=a},1);var J=!0,St=lt(a=>{J=a});st({" ":()=>St(!J),l:()=>document.getElementById($?"btn-colour":"btn-litho").click()});var Y=0,ct=performance.now();function vt(a){let t=Math.min(.05,(a-ct)/1e3);ct=a,J&&(Y+=t),W+=Math.sign($-W)*Math.min(Math.abs($-W),t*2.2),Z.uLitho.value=W,Z.uTime.value=Y,mt.rotation.y=Y*.4,q.render(ut,H),requestAnimationFrame(vt)}ft();requestAnimationFrame(vt);})();
