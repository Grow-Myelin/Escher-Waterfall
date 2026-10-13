(()=>{var Ee=Object.create;var Vt=Object.defineProperty;var we=Object.getOwnPropertyDescriptor;var ge=Object.getOwnPropertyNames;var Me=Object.getPrototypeOf,ye=Object.prototype.hasOwnProperty;var be=(o,t)=>()=>{try{return t||o((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}};var Te=(o,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of ge(t))!ye.call(o,n)&&n!==e&&Vt(o,n,{get:()=>t[n],enumerable:!(a=we(t,n))||a.enumerable});return o};var rt=(o,t,e)=>(e=o!=null?Ee(Me(o)):{},Te(t||!o||!o.__esModule?Vt(e,"default",{value:o,enumerable:!0}):e,o));var K=be((to,Ot)=>{Ot.exports=window.THREE});var M=rt(K(),1);var P=rt(K(),1),Re=1e3,S={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function He(o){return[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]}function L(o,t=S.PLAIN,e={}){return{c:typeof o=="number"?He(o):o,p:t,f:e.f||0,w:e.w||0,s:e.s||0}}function Rt(o,t){return{...o,s:t}}var _t=["px","nx","py","ny","pz","nz"];function Y(o,t){return[o[0]-t[0],o[1]-t[1],o[2]-t[2]]}function bt(o,t){return[o[1]*t[2]-o[2]*t[1],o[2]*t[0]-o[0]*t[2],o[0]*t[1]-o[1]*t[0]]}function it(o){return Math.hypot(o[0],o[1],o[2])}function O(o){let t=it(o)||1;return[o[0]/t,o[1]/t,o[2]/t]}function Tt(o,t){let e=Math.abs(t[0]),a=Math.abs(t[1]),n=Math.abs(t[2]);return e>=a&&e>=n?[o[2],o[1]]:n>=a?[o[0],o[1]]:[o[0],o[2]]}var U=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new P.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new P.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let e=this.m.elements,a=t[0],n=t[1],s=t[2];return[e[0]*a+e[4]*n+e[8]*s+e[12],e[1]*a+e[5]*n+e[9]*s+e[13],e[2]*a+e[6]*n+e[10]*s+e[14]]}_tn(t){if(!this.nm)return t;let e=this.nm.elements,a=t[0],n=t[1],s=t[2];return O([e[0]*a+e[3]*n+e[6]*s,e[1]*a+e[4]*n+e[7]*s,e[2]*a+e[5]*n+e[8]*s])}tri(t,e,a,n,s=[1,1,1],r={}){let c=this._tp(t),i=this._tp(e),f=this._tp(a),u=O(bt(Y(e,t),Y(a,t))),l=r.uv||[Tt(t,u),Tt(e,u),Tt(a,u)],h=O(bt(Y(i,c),Y(f,c))),d=r.n?r.n.map(E=>this._tn(E)):[h,h,h],m=it(bt(Y(i,c),Y(f,c))),x=[m/(it(Y(f,i))||1),m/(it(Y(c,f))||1),m/(it(Y(i,c))||1)],p=r.k||[1,1,1],v=n.s||0,g=[c,i,f];for(let E=0;E<3;E++){let y=g[E];this.pos.push(y[0]+v,y[1]+v,y[2]+v),this.nrm.push(d[E][0],d[E][1],d[E][2]),this.col.push(n.c[0]*p[E],n.c[1]*p[E],n.c[2]*p[E]),this.uv.push(l[E][0],l[E][1]);for(let b=0;b<3;b++)s[b]?this.edg.push(E===b?x[b]:0):this.edg.push(Re);this.mat.push(n.p,n.f,n.w)}}quad(t,e,a,n,s,r=[1,1,1,1],c={}){let i=c.k||[1,1,1,1],f=c.n,u=c.uv;this.tri(t,e,a,s,[r[1],0,r[0]],{k:[i[0],i[1],i[2]],n:f&&[f[0],f[1],f[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(t,a,n,s,[r[2],r[3],0],{k:[i[0],i[2],i[3]],n:f&&[f[0],f[2],f[3]],uv:u&&[u[0],u[2],u[3]]})}box(t,e,a,n,s,r,c,i={}){t>n&&([t,n]=[n,t]),e>s&&([e,s]=[s,e]),a>r&&([a,r]=[r,a]);let f=new Set(i.open||[]),u=new Set(i.skip||[]);i.bottom||u.add("ny");let l=i.ao??1,h=i.aoTop??1,d={px:[0,n],nx:[0,t],py:[1,s],ny:[1,e],pz:[2,r],nz:[2,a]},m={px:[[n,e,r],[n,e,a],[n,s,a],[n,s,r]],nx:[[t,e,a],[t,e,r],[t,s,r],[t,s,a]],pz:[[t,e,r],[n,e,r],[n,s,r],[t,s,r]],nz:[[n,e,a],[t,e,a],[t,s,a],[n,s,a]],py:[[t,s,r],[n,s,r],[n,s,a],[t,s,a]],ny:[[t,e,a],[n,e,a],[n,e,r],[t,e,r]]};for(let x of _t){if(u.has(x)||f.has(x))continue;let p=m[x],v=[];for(let y=0;y<4;y++){let b=p[y],C=p[(y+1)%4],I=1;for(let B of _t){if(B===x)continue;let[V,j]=d[B];Math.abs(b[V]-j)<1e-9&&Math.abs(C[V]-j)<1e-9&&f.has(B)&&(I=0)}v.push(I)}let g;x==="py"||x==="ny"?g=[h,h,h,h]:g=[l,l,1,1];let E=x==="py"&&i.top?{...i.top,s:c.s}:c;this.quad(p[0],p[1],p[2],p[3],E,v,{k:g})}}cyl(t,e,a,n,s,r,c,i={}){let f=i.caps??[!0,!0],u=i.rim??[1,1],l=i.r1??n;for(let h=0;h<r;h++){let d=h/r*Math.PI*2,m=(h+1)/r*Math.PI*2,x=Math.cos(d),p=Math.sin(d),v=Math.cos(m),g=Math.sin(m),E=[t+n*x,e,a+n*p],y=[t+l*x,s,a+l*p],b=[t+l*v,s,a+l*g],C=[t+n*v,e,a+n*g],I=(n-l)/Math.max(1e-6,s-e),B=O([x,I,p]),V=O([v,I,g]),j=d*(n+l)/2,ft=m*(n+l)/2;this.quad(E,y,b,C,c,[0,u[1],0,u[0]],{n:[B,B,V,V],uv:[[j,e],[j,s],[ft,s],[ft,e]],k:i.k}),f[1]&&l>0&&this.tri([t,s,a],b,y,c,[1,0,0]),f[0]&&this.tri([t,e,a],E,C,c,[1,0,0])}}lathe(t,e,a,n,s,r,c={}){let i=n.length,f=[];for(let h=0;h<i-1;h++){let d=n[h+1][0]-n[h][0],m=n[h+1][1]-n[h][1];f.push(O([m,-d,0]))}let u=n.map((h,d)=>{let m=f[Math.max(0,d-1)],x=f[Math.min(i-2,d)];return O([m[0]+x[0],m[1]+x[1],0])}),l=c.edges||[];for(let h=0;h<s;h++){let d=h/s*Math.PI*2,m=(h+1)/s*Math.PI*2,x=Math.cos(d),p=Math.sin(d),v=Math.cos(m),g=Math.sin(m);for(let E=0;E<i-1;E++){let[y,b]=n[E],[C,I]=n[E+1],B=[t+y*x,e+b,a+y*p],V=[t+C*x,e+I,a+C*p],j=[t+C*v,e+I,a+C*g],ft=[t+y*v,e+b,a+y*g],Q=c.flat?f[E]:u[E],Z=c.flat?f[E]:u[E+1];this.quad(B,V,j,ft,r,[0,l[E+1]?1:0,0,l[E]?1:0],{n:[[Q[0]*x,Q[1],Q[0]*p],[Z[0]*x,Z[1],Z[0]*p],[Z[0]*v,Z[1],Z[0]*g],[Q[0]*v,Q[1],Q[0]*g]],uv:[[d*1.2,b],[d*1.2,I],[m*1.2,I],[m*1.2,b]]})}}}poly(t,e,a={}){for(let n=1;n<t.length-1;n++)this.tri(t[0],t[n],t[n+1],e,[1,n===t.length-2?1:0,n===1?1:0],a)}blob(t,e,a,n,s,r,c,i={}){let f=i.sub??1,u=i.seed??0,l=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let m=0;m<f;m++){let x=[];for(let[p,v,g]of l){let E=O([(p[0]+v[0])/2,(p[1]+v[1])/2,(p[2]+v[2])/2]),y=O([(v[0]+g[0])/2,(v[1]+g[1])/2,(v[2]+g[2])/2]),b=O([(g[0]+p[0])/2,(g[1]+p[1])/2,(g[2]+p[2])/2]);x.push([p,E,b],[E,v,y],[b,y,g],[E,y,b])}l=x}let h=m=>1+(i.lump??.12)*Math.sin(m[0]*5.1+u)*Math.sin(m[1]*4.3+u*1.7)*Math.sin(m[2]*3.7+u*.3),d=m=>{let x=h(m);return[t+m[0]*n*x,e+m[1]*s*x,a+m[2]*r*x]};for(let[m,x,p]of l)this.tri(d(m),d(x),d(p),c,[0,0,0],{n:[m,x,p],k:i.k})}build(){let t=new P.BufferGeometry;return t.setAttribute("position",new P.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new P.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new P.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new P.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new P.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new P.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}};var q=rt(K(),1);function zt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new q.Vector3(.1,.9,.66).normalize()},uPaper:{value:new q.Vector3(.925,.898,.835)},uInk:{value:new q.Vector3(.11,.1,.09)},uHaze:{value:new q.Vector3(.83,.86,.84)},uFade:{value:1}}}var Ht=`
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
`,St=`
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
`,Se=`
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
  vec3 nn = normal;
  #ifdef USE_INSTANCING
    wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
    nn = mat3(instanceMatrix) * normal;
  #endif
  vN = normalize(mat3(modelMatrix) * nn);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Le=`
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
${Ht}
${St}

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
`;function Lt(o,t={}){return new q.ShaderMaterial({uniforms:o,vertexShader:Se,fragmentShader:Le,transparent:!!t.transparent,side:t.side??q.FrontSide})}var oo=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${Ht}
${St}
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
`;var no=`
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
${Ht}
${St}
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
`;var F=.75,_=.15,tt=2.4,w=tt/2,z=[14,14,6,6],G=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0]],$=z.reduce((o,t)=>o+t,0)*_,T=-6,J=o=>[-o[2],0,o[0]],k=(()=>{let o=[],t=[0,0],e=0;for(let a=0;a<=4&&(o.push({c:[...t],y:e}),a!==4);a++){let n=tt+(z[a]-1)*F;t=[t[0]+G[a][0]*n,t[1]+G[a][2]*n],e+=z[a]*_}return o})(),W={wall:13482394,plinth:11115139,course:14734784,tread:14274751,riser:12168858,inner:12891548,pane:3025704,frame:14998214,door:4864556},At=L(W.wall,S.ASHLAR),Ae=L(W.inner,S.PLASTER),kt=L(W.tread,S.PLASTER),ke=L(W.riser,S.PLAIN),Ut=L(W.plinth,S.STONE),Gt=L(W.course,S.PLAIN),Ie=L(W.pane,S.PANE),jt=L(W.frame,S.PLAIN),Pe=L(W.door,S.WOOD);function dt(o,t,e,a,n,s,r=[1,1]){let c=(i,f)=>[t[0]+e[0]*i,f,t[1]+e[2]*i];a.forEach(([i,f,u],l)=>{let h=l>0?a[l-1][2]:null,d=l<a.length-1?a[l+1][2]:null,m=[n,u];h!==null&&h>n&&h<u&&m.push(h),d!==null&&d>n&&d<u&&m.push(d);let x=[...new Set(m)].sort((p,v)=>p-v);for(let p=0;p<x.length-1;p++){let v=x[p],g=x[p+1],E=l===0?r[0]:v>=h-1e-9?1:0,y=l===a.length-1?r[1]:v>=d-1e-9?1:0;o.quad(c(i,v),c(f,v),c(f,g),c(i,g),s,[v===n?1:0,y,g===u?1:0,E])}})}function $t(o){let t=G[o],e=J(t),a=k[o].c;return(n,s,r)=>[a[0]+t[0]*n+e[0]*s,r,a[1]+t[2]*n+e[2]*s]}function Dt(o,t){let e=k[o].y;if(t<w)return e;let a=Math.floor((t-w)/F)+1;return e+Math.min(a,z[o])*_}function Fe(o,t){let e=$t(t),a=k[t].y,n=z[t];for(let s=1;s<=n;s++){let r=w+(s-1)*F,c=r+F,i=a+(s-1)*_,f=a+s*_;o.quad(e(r,-w,i),e(r,w,i),e(r,w,f),e(r,-w,f),ke),s<n&&o.quad(e(r,-w,f),e(r,w,f),e(c,w,f),e(c,-w,f),kt)}}function Ce(o,t){let e=$t(t),a=k[t].y;o.quad(e(-w,-w,a),e(-w,w,a),e(w,w,a),e(w,-w,a),kt)}function Yt(o,t){let e=t==="top"?$:0,a=Rt(kt,e),n=Rt(At,e),s=[-w,0,-w],r=[w,0,w],c=Math.SQRT1_2;t==="foot"?(o.tri(s,[-w,0,w],r,a,[1,0,1]),dt(o,[w,w],[-c,0,-c],[[0,tt*Math.SQRT2,0]],T,n)):(o.tri(s,r,[w,0,-w],a,[1,1,0]),dt(o,[-w,-w],[c,0,c],[[0,tt*Math.SQRT2,0]],T,n))}function Be(o){let t=k[o].y,e=z[o],a=[[-w,w,t]];for(let s=1;s<e;s++)a.push([w+(s-1)*F,w+s*F,t+s*_]);let n=w+(e-1)*F;return a.push([n,n+tt,k[o+1].y]),a}function mt(o,t,e,a,n,s,r,c,i,f,u){let l=(d,m)=>[t[0]+e[0]*d+a[0]*f,m,t[1]+e[2]*d+a[2]*f],h=[l(n,r),l(s,r)];if(i){let d=(s-n)/2,m=(n+s)/2,x=c-d;h.push(l(s,x));for(let p=1;p<8;p++){let v=p/8*Math.PI;h.push(l(m+d*Math.cos(v),x+d*Math.sin(v)))}h.push(l(n,x))}else h.push(l(s,c),l(n,c));o.poly(h,u)}function ht(o,t,e,a,n,s,r,c,i,f=!0){if(mt(o,t,e,a,n-r/2-.12,n+r/2+.12,s-.12,s+c+.12,i,.012,jt),mt(o,t,e,a,n-r/2,n+r/2,s,s+c,i,.024,Ie),!f)return;let u=[t[0]+e[0]*(n-r/2-.2),t[1]+e[2]*(n-r/2-.2)],l=[t[0]+e[0]*(n+r/2+.2)+a[0]*.14,t[1]+e[2]*(n+r/2+.2)+a[2]*.14];o.box(u[0],s-.2,u[1],l[0],s-.08,l[1],Gt,{})}function qt(o,t,e,a,n,s,r,c,i,f){let u=[t[0]+e[0]*n,t[1]+e[2]*n],l=[t[0]+e[0]*s+a[0]*i,t[1]+e[2]*s+a[2]*i];o.box(u[0],r,u[1],l[0],c,l[1],f,{ao:.9})}var Wt=[T+.9,2.1],Xt=T+3.3,ut=[T+4,1.5];function Ne(o,t){let e=G[t],a=J(e),n=k[t].c,s=[n[0]+a[0]*w,n[1]+a[2]*w],r=Be(t),c=r[0][0],i=r[r.length-1][1];dt(o,s,e,r,T,At),qt(o,s,e,a,c,i+.08,T,T+.55,.08,Ut),qt(o,s,e,a,c,i+.1,Xt,Xt+.22,.1,Gt);let u=i-c,l=Math.max(2,Math.round(u/2.4));for(let h=0;h<l;h++){let d=c+(h+.5)/l*u;t===1&&h===Math.floor(l/2)||t===2&&h===1?Oe(o,s,e,a,d):ht(o,s,e,a,d,Wt[0],.8,Wt[1],!0),ht(o,s,e,a,d,ut[0],.7,ut[1],!1);let p=Ve(t,d)-1.6;p>ut[0]+ut[1]+.7&&ht(o,s,e,a,d,p,.45,.62,!0)}}function Ve(o,t){let e=w+(z[o]-1)*F;return t>e?k[o+1].y:Math.min(Dt(o,t-.5),Dt(o,t+.5))}function Oe(o,t,e,a,n){let c=T;mt(o,t,e,a,n-1.15/2-.25,n+1.15/2+.25,c+.55,c+2.5+.25,!0,.012,jt),mt(o,t,e,a,n-1.15/2,n+1.15/2,c+.55,c+2.5,!0,.024,Pe);for(let i=0;i<2;i++){let f=[t[0]+e[0]*(n-.575-.35+i*.12),t[1]+e[2]*(n-.575-.35+i*.12)],u=.7-i*.3,l=[t[0]+e[0]*(n+1.15/2+.35-i*.12)+a[0]*u,t[1]+e[2]*(n+1.15/2+.35-i*.12)+a[2]*u];o.box(f[0],c,f[1],l[0],c+.28*(i+1),l[1],Ut,{})}}function _e(o,t){let e=G[t],a=J(e),n=k[t].c,s=k[t].y,r=z[t],c=[n[0]-a[0]*w,n[1]-a[2]*w],i=[-e[0],0,-e[2]],f=[];for(let l=r-1;l>=1;l--)f.push([-(w+l*F),-(w+(l-1)*F),s+l*_]);dt(o,c,i,f,T,Ae);let u=[-a[0],0,-a[2]];for(let l=3;l<r-1;l+=4){let h=-(w+(l-.5)*F);ht(o,c,i,u,h,s+l*_-1.9,.42,.7,!0,!1)}}function Qt(o){for(let t=0;t<4;t++)Fe(o,t),t>0&&Ce(o,t),Ne(o,t),_e(o,t);Yt(o,"foot"),Yt(o,"top")}function It(o,t=.6){let e=[],a=c=>{c.s0=e.length?e[e.length-1].s0+e[e.length-1].L:0,e.push(c)},n=(c,i,f)=>{let u=G[(c+3)%4],l=G[c%4],h=k[c].c,d=J(u),m=J(l),x=[h[0]+o*(d[0]+m[0]),h[1]+o*(d[2]+m[2])],p=[x[0]-u[0]*t+l[0]*t,x[1]-u[2]*t+l[2]*t],v=k[c].y;return{L:t*(f-i),y0:v,at(g){let E=i+g/t,y=Math.cos(E),b=Math.sin(E);return[p[0]+t*(-l[0]*y+u[0]*b),v,p[1]+t*(-l[2]*y+u[2]*b)]},dir(g){let E=i+g/t,y=Math.cos(E),b=Math.sin(E);return[l[0]*b+u[0]*y,l[2]*b+u[2]*y]},height(){return v}}},s=c=>{let i=G[c],f=k[c].c,u=J(i),l=t-o;return{L:tt+(z[c]-1)*F+o-t-l,at(d){let m=l+d;return[f[0]+i[0]*m+u[0]*o,0,f[1]+i[2]*m+u[2]*o]},dir(){return[i[0],i[2]]},height(d){return De(c,l+d)}}};a(n(0,Math.PI/4,Math.PI/2));for(let c=0;c<4;c++)a(s(c)),a(n(c+1,0,c+1===4?Math.PI/4:Math.PI/2));let r=e[e.length-1];return{pieces:e,length:r.s0+r.L}}var ze=.22;function De(o,t){let e=k[o].y;for(let a=0;a<z[o];a++){let n=(t-(w+a*F))/ze;if(n>=1)e+=_;else if(n>-1){let s=(n+1)/2;e+=_*s*s*(3-2*s)}}return e}function Zt(o,t){t=(t%o.length+o.length)%o.length;let e=o.pieces[0];for(let s of o.pieces)if(t>=s.s0)e=s;else break;let a=Math.min(e.L,t-e.s0),n=e.at(a);return n[1]=e.height(a),{pos:n,dir:e.dir(a),s:t}}var Jt=rt(K(),1);var N=34;function et(o){let t=Math.sin(o*127.1+311.7)*43758.5453;return t-Math.floor(t)}function pt(o,t,e,a,n,s,r){let c=L(7035464,S.WOOD,{f:s}),i=L(8227426,S.FOLIAGE,{f:s});o.cyl(t,e,a,.13*n,e+1.1*n,6,c,{r1:.1*n}),o.blob(t,e+1.7*n,a,.8*n,.75*n,.8*n,i,{sub:2,lump:.16,seed:r}),o.blob(t+.35*n,e+2.2*n,a-.2*n,.5*n,.45*n,.5*n,i,{sub:1,lump:.12,seed:r+3})}function vt(o,t,e,a,n,s){let r=L(6254416,S.FOLIAGE,{f:s});o.lathe(t,e,a,[[.12*n,0],[.42*n,.5*n],[.48*n,1.4*n],[.38*n,2.5*n],[.18*n,3.4*n],[0,3.9*n]],9,r,{edges:[1,0,0,0,0,0]})}function Kt(o,t,e,a,n,s,r){o.blob(t,e+.32*n,a,.42*n,.36*n,.42*n,L(8818795,S.FOLIAGE,{f:s}),{sub:2,lump:.14,seed:r})}function Ye(o){let t=L(13616818,S.COBBLE);o.quad([-N,T,N],[N,T,N],[N,T,-N],[-N,T,-N],t,[0,0,0,0]);let e=7;for(let r=1;r<=e;r++){let c=-4.6-(r-1)*3.3,i=-6.2-(r-1)*3.3,f=T+r*1.15,u=Math.min(.6,.1+.07*r),l=L(13221542,S.STONE,{f:u}),h=L(11777424,S.VINE,{f:u}),d=11-r*1.2,m=19-r*1.2;o.box(-N,T,-N,c,f,d,l,{top:h}),o.box(c,T,-N,m,f,i,l,{top:h});let x=c-1.65,p=i-1.65;for(let v=p-1;v<d-.7;v+=1.05){let g=r*100+Math.round(v*3);et(g)<.08||(et(g+7)<.06&&r>1?pt(o,x,f,v,.8,u,g):Kt(o,x,f,v,.75+et(g+1)*.3,u,g))}for(let v=x+1;v<m-.7;v+=1.05){let g=r*100+Math.round(v*3)+50;et(g)<.08||(et(g+7)<.06&&r>1?pt(o,v,f,p,.8,u,g):Kt(o,v,f,p,.75+et(g+1)*.3,u,g))}r%2===0&&(vt(o,x,f,d-.9,1.05,u),vt(o,m-.9,f,p,1.05,u))}pt(o,-3.9,T,11,1.25,0,3),pt(o,17,T,2,1.15,0,8),vt(o,-3.2,T,4,1.35,0),vt(o,6,T,-3.4,1.3,0);let a=L(13813939,S.ASHLAR),n=19,s=17;o.lathe(n,T,s,[[1.9,0],[1.9,.55],[1.65,.6],[1.6,.35],[0,.35]],20,a,{edges:[1,0,1,1,0]}),o.lathe(n,T,s,[[.25,.35],[.22,1.2],[.7,1.35],[.66,1.5],[.1,1.5],[.08,1.9],[0,2.05]],14,a,{edges:[0,1,1,1,0,0,0]}),o.lathe(n,T,s,[[1.6,.4],[0,.4]],20,L(8230816,S.PLAIN),{edges:[0,0]})}function te(o,t){Ye(o);let e=new Jt.Mesh(o.build(),t);return e.frustumCulled=!1,e}var A=rt(K(),1);var qe=.62,We=.375;function Xe(o,t){let e=new U,a=L(o,S.CLOTH),n=L(t,S.PLAIN),s=L(7231560,S.PLAIN);e.lathe(0,.02,0,[[.3,0],[.31,.05],[.26,.38],[.215,.66],[.215,.76],[.15,.85],[0,.88]],12,a,{edges:[1,1,0,0,0,0,0]}),e.cyl(0,.5,0,.235,.54,12,n,{rim:[1,1]}),e.blob(0,.98,-.02,.165,.17,.175,a,{sub:2,lump:.03,seed:2}),e.push(new A.Matrix4().makeRotationX(2.45).setPosition(0,1,-.12)),e.cyl(0,0,0,.075,.36,7,a,{r1:.012,caps:[!1,!1]}),e.pop(),e.push(new A.Matrix4().makeRotationX(-.2).setPosition(0,.955,.158)),e.poly(Array.from({length:12},(r,c)=>{let i=c/12*Math.PI*2;return[Math.cos(i)*.085,Math.sin(i)*.1,0]}),s),e.pop();for(let r of[-1,1]){let c=new A.Vector3(.17*r,.8,-.01),i=new A.Vector3(.15*r,.58,.09),f=new A.Vector3(.04*r,.6,.2);for(let[u,l,h]of[[c,i,.075],[i,f,.07]]){let d=l.clone().sub(u),m=new A.Matrix4().compose(u,new A.Quaternion().setFromUnitVectors(new A.Vector3(0,1,0),d.clone().normalize()),new A.Vector3(1,1,1));e.push(m),e.cyl(0,0,0,h,d.length(),7,a,{r1:h*1.1,rim:[0,1],caps:[!1,!0]}),e.pop()}}return e.build()}function Ue(){let o=new U;return o.box(-.055,0,-.07,.055,.06,.1,L(2762016,S.PLAIN),{}),o.build()}var xt=class{constructor(t){this.group=new A.Group,this.files=[{lane:It(.55),dir:1,n:15,robe:10322020,trim:14207405,phase:0},{lane:It(-.55),dir:-1,n:11,robe:7106938,trim:13616820,phase:.37}];let e=Ue();for(let a of this.files){a.body=new A.InstancedMesh(Xe(a.robe,a.trim),t,a.n),a.feet=new A.InstancedMesh(e,t,a.n*2);for(let n of[a.body,a.feet])n.frustumCulled=!1,n.instanceMatrix.setUsage(A.DynamicDrawUsage),this.group.add(n);a.offsets=[];for(let n=0;n<a.n;n++){let s=Math.sin(n*12.9898+a.phase*7)*.22;a.offsets.push((n+s)/a.n*a.lane.length)}}this.m=new A.Matrix4,this.q=new A.Quaternion,this.e=new A.Euler(0,0,0,"YXZ"),this.v=new A.Vector3,this.one=new A.Vector3(1,1,1)}update(t,e){let{m:a,q:n,e:s,v:r,one:c}=this;for(let i of this.files){for(let f=0;f<i.n;f++){let u=i.offsets[f]+i.dir*t*qe,{pos:l,dir:h,s:d}=Zt(i.lane,u);e&&d<.5&&(l[0]+=$,l[1]+=$,l[2]+=$);let m=h[0]*i.dir,x=h[1]*i.dir,p=Math.atan2(m,x),v=d/We*Math.PI,g=Math.abs(Math.sin(v))*.035;s.set(.04,p,Math.sin(v)*.035),n.setFromEuler(s),r.set(l[0],l[1]+g,l[2]),a.compose(r,n,c),i.body.setMatrixAt(f,a);for(let E of[0,1]){let y=E?1:-1,b=Math.sin(v)*y*.11,C=.09*y,I=.12+b,B=Math.cos(p),V=Math.sin(p);r.set(l[0]+C*B+I*V,l[1],l[2]-C*V+I*B),s.set(0,p,0),n.setFromEuler(s),a.compose(r,n,c),i.feet.setMatrixAt(f*2+E,a)}}i.body.instanceMatrix.needsUpdate=!0,i.feet.instanceMatrix.needsUpdate=!0}}};function ee(o,t){let e=document.getElementById("frame"),a=()=>{let s=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),c=document.getElementById("controls"),i=(r?r.offsetHeight:0)+6+13,f=(c?c.offsetHeight:0)+8+13,u=window.innerWidth-s*2,l=window.innerHeight-i-f,h=l,d=h*o;d>u&&(d=u,h=d/o),d=Math.max(160,Math.floor(d)),h=Math.max(120,Math.floor(h)),e.style.width=`${d}px`,e.style.height=`${h}px`,e.style.top=`${i+Math.max(0,(l-h)/2)}px`,t?.(d,h)};return window.addEventListener("resize",a),a(),a}function oe(){let o=document.getElementById("panel"),t=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!o)return;let a=n=>{n?o.removeAttribute("hidden"):o.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(n))};t?.addEventListener("click",()=>a(o.hasAttribute("hidden"))),e?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function ne(o,t,e){let a=n=>{for(let[s,r]of o)s.setAttribute("aria-pressed",String(r===n));t(n)};for(let[n,s]of o)n.addEventListener("click",()=>a(s));return e!==void 0&&a(e),a}function ae(o){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let e=o[t.key.length===1?t.key.toLowerCase():t.key];e&&(t.preventDefault(),e(t))})}function se(o,t=!0){let e=document.getElementById("btn-play"),a=n=>{t=n,e&&(e.setAttribute("aria-pressed",String(!n)),e.querySelector("span").textContent=n?"Pause":"Play",e.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),o(n)};return e?.addEventListener("click",()=>a(!t)),a(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function re(o,t){let e=document.getElementById("badge");e&&t&&(e.textContent=t),document.body.classList.toggle("badge-on",!!o)}function ie(){document.body.classList.add("ready")}var Mt=Math.PI/4,Bt=Math.atan(1/Math.SQRT2),at={X:-2.1,Y:-6.6,H:25.5},Ge={az:Mt-.6,el:.6,zoom:.86,k:1},D=document.getElementById("scene"),ct=new M.WebGLRenderer({canvas:D,antialias:!0});ct.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var ue=new M.Color(15525333),je=new M.Color(15328988);ct.setClearColor(ue,1);var lt=new M.Scene,wt=zt(),he=Lt(wt);{let o=new U;Qt(o);let t=new M.Mesh(o.build(),he);t.frustumCulled=!1,lt.add(t)}var Pt={...wt,uFade:{value:1}},Nt=te(new U,Lt(Pt,{transparent:!0}));Nt.renderOrder=-1;lt.add(Nt);var de=new xt(he);lt.add(de.group);var ce=10631978,ot=new M.Group;{let o=new M.LineDashedMaterial({color:ce,dashSize:.45,gapSize:.3,transparent:!0,opacity:0,depthTest:!1}),t=new M.MeshBasicMaterial({color:ce,transparent:!0,opacity:0,depthTest:!1}),e=a=>{let n=new M.Vector3(...a),s=n.clone().addScalar($),r=new M.Line(new M.BufferGeometry().setFromPoints([n,s]),o);r.computeLineDistances(),ot.add(r);for(let c of[n,s]){let i=new M.Mesh(new M.SphereGeometry(.16,12,8),t);i.position.copy(c),ot.add(i)}};e([0,.02,0]),e([-1.2,.02,-1.2]),e([1.2,.02,1.2]),ot.renderOrder=20,lt.add(ot)}var X=new M.OrthographicCamera(-1,1,1,-1,1,4e3);function $e(o,t,e){let a=o*Math.SQRT2,n=t*Math.sqrt(6),s=(e+n)/3,r=2*s-n;return[(r+a)/2,s,(r-a)/2]}var Et=new M.Vector3(6.5,-1,6.5),Qe=new M.Vector3(...$e(at.X,at.Y,Et.x+Et.y+Et.z)),le=new M.Vector3,H={az:Mt,el:Bt,zoom:1,panX:0,panY:0,k:0},gt=30/38;function st(){let o=Math.cos(H.el),t=Math.sin(H.el),e=new M.Vector3(o*Math.sin(H.az),t,o*Math.cos(H.az)),a=new M.Vector3(Math.cos(H.az),0,-Math.sin(H.az)),n=new M.Vector3().crossVectors(e,a);le.copy(Qe).lerp(Et,H.k);let s=le.clone().addScaledVector(a,H.panX).addScaledVector(n,H.panY);X.position.copy(s).addScaledVector(e,1500),X.up.set(0,1,0),X.lookAt(s);let r=at.H/2/H.zoom;X.left=-r*gt,X.right=r*gt,X.top=r,X.bottom=-r,X.updateProjectionMatrix()}ee(30/38,(o,t)=>{ct.setSize(o,t),gt=o/t,st()});oe();var R={litho:1,lithoTarget:1,playing:!0,revealed:!1,tween:null,t:0};ne([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],o=>{R.lithoTarget=o},1);var me=se(o=>{R.playing=o}),Ft=document.getElementById("btn-reveal"),Ze=document.getElementById("hint");function Ke(o){return o<.5?4*o*o*o:1-Math.pow(-2*o+2,3)/2}function Ct(o,t=2.2){R.tween={from:{...H},to:{...H,...o},t:0,dur:t}}function yt(o){R.revealed=o,Ft.setAttribute("aria-pressed",String(o)),Ft.querySelector("span").textContent=o?"Back to the isometric view":"Reveal the trick",Ze.textContent=o?"Drag to turn the real building \xB7 scroll to zoom":"Drag to pan \xB7 scroll to zoom \xB7 double-click to reset",Ct(o?{...Ge,panX:0,panY:0}:{az:Mt,el:Bt,zoom:1,panX:0,panY:0,k:0})}function pe(){R.revealed?yt(!1):Ct({zoom:1,panX:0,panY:0},.8)}Ft.addEventListener("click",()=>yt(!R.revealed));ae({" ":()=>me(!R.playing),l:()=>document.getElementById(R.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>yt(!R.revealed),0:pe});var nt=null;D.addEventListener("pointerdown",o=>{D.setPointerCapture(o.pointerId),nt={x:o.clientX,y:o.clientY},R.tween=null});D.addEventListener("pointermove",o=>{if(!nt)return;let t=o.clientX-nt.x,e=o.clientY-nt.y;nt={x:o.clientX,y:o.clientY};let a=at.H/H.zoom/D.clientHeight;R.revealed?(H.az-=t*.006,H.el=Math.min(1.45,Math.max(.05,H.el+e*.004))):(H.panX-=t*a,H.panY+=e*a),st()});var ve=()=>{nt=null};D.addEventListener("pointerup",ve);D.addEventListener("pointercancel",ve);D.addEventListener("dblclick",pe);D.addEventListener("wheel",o=>{o.preventDefault(),R.tween=null;let t=D.getBoundingClientRect(),e=(o.clientX-t.left)/t.width-.5,a=.5-(o.clientY-t.top)/t.height,n=at.H/H.zoom,s=Math.min(6,Math.max(.5,H.zoom*Math.exp(-o.deltaY*.0015))),r=at.H/s;H.panX+=e*gt*(n-r),H.panY+=a*(n-r),H.zoom=s,st()},{passive:!1});var fe=performance.now();function xe(o){let t=Math.min(.05,Math.max(0,(o-fe)/1e3));if(fe=o,R.playing&&(R.t+=t),wt.uTime.value=R.t,R.litho!==R.lithoTarget){let n=R.lithoTarget-R.litho;R.litho+=Math.sign(n)*Math.min(Math.abs(n),t*2.2),wt.uLitho.value=R.litho,ct.setClearColor(ue.clone().lerp(je,1-R.litho),1)}if(R.tween){let n=R.tween;n.t=Math.min(1,n.t+t/n.dur);let s=Ke(n.t);for(let r of["az","el","zoom","panX","panY","k"])H[r]=n.from[r]+(n.to[r]-n.from[r])*s;n.t>=1&&(R.tween=null),st()}let e=Math.hypot(H.az-Mt,H.el-Bt);Pt.uFade.value=Math.max(0,1-Math.max(0,e-.03)/.25),Nt.visible=Pt.uFade.value>.001;let a=Math.min(1,Math.max(0,(e-.15)/.3));ot.visible=a>0,ot.children.forEach(n=>{n.material.opacity=a}),re(e>.02,"Off the isometric axis: the stair is a spiral"),de.update(R.t,e<.001),ct.render(lt,X),requestAnimationFrame(xe)}st();ie();requestAnimationFrame(xe);window.__page={view:H,state:R,setRevealed:yt,setPlaying:me,updateCamera:st,LAND:k,BASE:T};})();
