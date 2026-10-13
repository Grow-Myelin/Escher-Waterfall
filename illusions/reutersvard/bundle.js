(()=>{var Wt=Object.create;var Et=Object.defineProperty;var Yt=Object.getOwnPropertyDescriptor;var Xt=Object.getOwnPropertyNames;var $t=Object.getPrototypeOf,Ut=Object.prototype.hasOwnProperty;var jt=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var Qt=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of Xt(e))!Ut.call(t,o)&&o!==n&&Et(t,o,{get:()=>e[o],enumerable:!(a=Yt(e,o))||a.enumerable});return t};var J=(t,e,n)=>(n=t!=null?Wt($t(t)):{},Qt(e||!t||!t.__esModule?Et(n,"default",{value:t,enumerable:!0}):n,t));var X=jt((ve,gt)=>{gt.exports=window.THREE});var l=J(X(),1);var k=J(X(),1),Zt=1e3,ot={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Kt(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function bt(t,e=ot.PLAIN,n={}){return{c:typeof t=="number"?Kt(t):t,p:e,f:n.f||0,w:n.w||0,s:n.s||0}}function Mt(t,e){return{...t,s:e}}var xt=["px","nx","py","ny","pz","nz"];function F(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function tt(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function G(t){return Math.hypot(t[0],t[1],t[2])}function H(t){let e=G(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function et(t,e){let n=Math.abs(e[0]),a=Math.abs(e[1]),o=Math.abs(e[2]);return n>=a&&n>=o?[t[2],t[1]]:o>=a?[t[0],t[1]]:[t[0],t[2]]}var $=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new k.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new k.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let n=this.m.elements,a=e[0],o=e[1],r=e[2];return[n[0]*a+n[4]*o+n[8]*r+n[12],n[1]*a+n[5]*o+n[9]*r+n[13],n[2]*a+n[6]*o+n[10]*r+n[14]]}_tn(e){if(!this.nm)return e;let n=this.nm.elements,a=e[0],o=e[1],r=e[2];return H([n[0]*a+n[3]*o+n[6]*r,n[1]*a+n[4]*o+n[7]*r,n[2]*a+n[5]*o+n[8]*r])}tri(e,n,a,o,r=[1,1,1],i={}){let c=this._tp(e),s=this._tp(n),u=this._tp(a),h=H(tt(F(n,e),F(a,e))),g=i.uv||[et(e,h),et(n,h),et(a,h)],f=H(tt(F(s,c),F(u,c))),m=i.n?i.n.map(E=>this._tn(E)):[f,f,f],d=G(tt(F(s,c),F(u,c))),v=[d/(G(F(u,s))||1),d/(G(F(c,u))||1),d/(G(F(s,c))||1)],w=i.k||[1,1,1],M=o.s||0,y=[c,s,u];for(let E=0;E<3;E++){let T=y[E];this.pos.push(T[0]+M,T[1]+M,T[2]+M),this.nrm.push(m[E][0],m[E][1],m[E][2]),this.col.push(o.c[0]*w[E],o.c[1]*w[E],o.c[2]*w[E]),this.uv.push(g[E][0],g[E][1]);for(let R=0;R<3;R++)r[R]?this.edg.push(E===R?v[R]:0):this.edg.push(Zt);this.mat.push(o.p,o.f,o.w)}}quad(e,n,a,o,r,i=[1,1,1,1],c={}){let s=c.k||[1,1,1,1],u=c.n,h=c.uv;this.tri(e,n,a,r,[i[1],0,i[0]],{k:[s[0],s[1],s[2]],n:u&&[u[0],u[1],u[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(e,a,o,r,[i[2],i[3],0],{k:[s[0],s[2],s[3]],n:u&&[u[0],u[2],u[3]],uv:h&&[h[0],h[2],h[3]]})}box(e,n,a,o,r,i,c,s={}){e>o&&([e,o]=[o,e]),n>r&&([n,r]=[r,n]),a>i&&([a,i]=[i,a]);let u=new Set(s.open||[]),h=new Set(s.skip||[]);s.bottom||h.add("ny");let g=s.ao??1,f=s.aoTop??1,m={px:[0,o],nx:[0,e],py:[1,r],ny:[1,n],pz:[2,i],nz:[2,a]},d={px:[[o,n,i],[o,n,a],[o,r,a],[o,r,i]],nx:[[e,n,a],[e,n,i],[e,r,i],[e,r,a]],pz:[[e,n,i],[o,n,i],[o,r,i],[e,r,i]],nz:[[o,n,a],[e,n,a],[e,r,a],[o,r,a]],py:[[e,r,i],[o,r,i],[o,r,a],[e,r,a]],ny:[[e,n,a],[o,n,a],[o,n,i],[e,n,i]]};for(let v of xt){if(h.has(v)||u.has(v))continue;let w=d[v],M=[];for(let T=0;T<4;T++){let R=w[T],L=w[(T+1)%4],S=1;for(let C of xt){if(C===v)continue;let[B,_]=m[C];Math.abs(R[B]-_)<1e-9&&Math.abs(L[B]-_)<1e-9&&u.has(C)&&(S=0)}M.push(S)}let y;v==="py"||v==="ny"?y=[f,f,f,f]:y=[g,g,1,1];let E=v==="py"&&s.top?{...s.top,s:c.s}:c;this.quad(w[0],w[1],w[2],w[3],E,M,{k:y})}}cyl(e,n,a,o,r,i,c,s={}){let u=s.caps??[!0,!0],h=s.rim??[1,1],g=s.r1??o;for(let f=0;f<i;f++){let m=f/i*Math.PI*2,d=(f+1)/i*Math.PI*2,v=Math.cos(m),w=Math.sin(m),M=Math.cos(d),y=Math.sin(d),E=[e+o*v,n,a+o*w],T=[e+g*v,r,a+g*w],R=[e+g*M,r,a+g*y],L=[e+o*M,n,a+o*y],S=(o-g)/Math.max(1e-6,r-n),C=H([v,S,w]),B=H([M,S,y]),_=m*(o+g)/2,Y=d*(o+g)/2;this.quad(E,T,R,L,c,[0,h[1],0,h[0]],{n:[C,C,B,B],uv:[[_,n],[_,r],[Y,r],[Y,n]],k:s.k}),u[1]&&g>0&&this.tri([e,r,a],R,T,c,[1,0,0]),u[0]&&this.tri([e,n,a],E,L,c,[1,0,0])}}lathe(e,n,a,o,r,i,c={}){let s=o.length,u=[];for(let f=0;f<s-1;f++){let m=o[f+1][0]-o[f][0],d=o[f+1][1]-o[f][1];u.push(H([d,-m,0]))}let h=o.map((f,m)=>{let d=u[Math.max(0,m-1)],v=u[Math.min(s-2,m)];return H([d[0]+v[0],d[1]+v[1],0])}),g=c.edges||[];for(let f=0;f<r;f++){let m=f/r*Math.PI*2,d=(f+1)/r*Math.PI*2,v=Math.cos(m),w=Math.sin(m),M=Math.cos(d),y=Math.sin(d);for(let E=0;E<s-1;E++){let[T,R]=o[E],[L,S]=o[E+1],C=[e+T*v,n+R,a+T*w],B=[e+L*v,n+S,a+L*w],_=[e+L*M,n+S,a+L*y],Y=[e+T*M,n+R,a+T*y],N=c.flat?u[E]:h[E],D=c.flat?u[E]:h[E+1];this.quad(C,B,_,Y,i,[0,g[E+1]?1:0,0,g[E]?1:0],{n:[[N[0]*v,N[1],N[0]*w],[D[0]*v,D[1],D[0]*w],[D[0]*M,D[1],D[0]*y],[N[0]*M,N[1],N[0]*y]],uv:[[m*1.2,R],[m*1.2,S],[d*1.2,S],[d*1.2,R]]})}}}poly(e,n,a={}){for(let o=1;o<e.length-1;o++)this.tri(e[0],e[o],e[o+1],n,[1,o===e.length-2?1:0,o===1?1:0],a)}blob(e,n,a,o,r,i,c,s={}){let u=s.sub??1,h=s.seed??0,g=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let d=0;d<u;d++){let v=[];for(let[w,M,y]of g){let E=H([(w[0]+M[0])/2,(w[1]+M[1])/2,(w[2]+M[2])/2]),T=H([(M[0]+y[0])/2,(M[1]+y[1])/2,(M[2]+y[2])/2]),R=H([(y[0]+w[0])/2,(y[1]+w[1])/2,(y[2]+w[2])/2]);v.push([w,E,R],[E,M,T],[R,T,y],[E,T,R])}g=v}let f=d=>1+(s.lump??.12)*Math.sin(d[0]*5.1+h)*Math.sin(d[1]*4.3+h*1.7)*Math.sin(d[2]*3.7+h*.3),m=d=>{let v=f(d);return[e+d[0]*o*v,n+d[1]*r*v,a+d[2]*i*v]};for(let[d,v,w]of g)this.tri(m(d),m(v),m(w),c,[0,0,0],{n:[d,v,w],k:s.k})}build(){let e=new k.BufferGeometry;return e.setAttribute("position",new k.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new k.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new k.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new k.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new k.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new k.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}};var P=J(X(),1);function yt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new P.Vector3(.1,.9,.66).normalize()},uPaper:{value:new P.Vector3(.925,.898,.835)},uInk:{value:new P.Vector3(.11,.1,.09)},uHaze:{value:new P.Vector3(.83,.86,.84)},uFade:{value:1}}}var nt=`
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
`,at=`
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
`,Jt=`
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
`,te=`
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
${nt}
${at}

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
`;function Tt(t,e={}){return new P.ShaderMaterial({uniforms:t,vertexShader:Jt,fragmentShader:te,transparent:!!e.transparent,side:e.side??P.FrontSide})}var Ee=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${nt}
${at}
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
`;var ge=`
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
${nt}
${at}
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
`;function rt(t){let e=[];for(let n=0;n<t;n++)e.push([n,0,0]);for(let n=0;n<t;n++)e.push([t,n,0]);for(let n=0;n<t;n++)e.push([t,t,n]);return e}function ee(t,e){let n=t/(e-1),a=[.95,.74,.55],o=[.93,.88,.7],r=[.62,.76,.86],i=(c,s,u)=>c.map((h,g)=>h+(s[g]-h)*u);return n<.5?i(a,o,n*2):i(o,r,(n-.5)*2)}var z=.9,A=(1-z)/2;function oe(t,e,n){t.box(e[0]+A,e[1]+A,e[2]+A,e[0]+A+z,e[1]+A+z,e[2]+A+z,n,{bottom:!0})}function Rt(t,e,n,a){let o=(r,i,c)=>[e[0]+A+r*z,e[1]+A+i*z,e[2]+A+c*z];a==="upper"?(t.quad(o(1,0,0),o(0,0,0),o(0,1,0),o(1,1,0),n),t.quad(o(0,1,1),o(1,1,1),o(1,1,0),o(0,1,0),n),t.tri(o(1,0,0),o(1,1,0),o(1,1,1),n,[1,0,1]),t.tri(o(0,0,0),o(0,1,1),o(0,1,0),n,[1,1,0]),t.quad(o(0,0,0),o(1,0,0),o(1,1,1),o(0,1,1),n)):(t.quad(o(0,0,1),o(1,0,1),o(1,1,1),o(0,1,1),n),t.quad(o(0,0,0),o(1,0,0),o(1,0,1),o(0,0,1),n),t.tri(o(1,0,1),o(1,0,0),o(1,1,1),n,[0,1,1]),t.tri(o(0,0,0),o(0,0,1),o(0,1,1),n,[1,0,1]),t.quad(o(0,0,0),o(0,1,1),o(1,1,1),o(1,0,0),n))}function kt(t,e,n){let a=rt(e),o=bt(ee(n,a.length),ot.PLAIN);if(n<a.length-1){oe(t,a[n],o);return}Rt(t,a[n],o,"upper"),Rt(t,a[n],Mt(o,-e),"lower")}function St(t,e){let n=document.getElementById("frame"),a=()=>{let r=(window.innerWidth<640?10:28)+13,i=document.getElementById("masthead"),c=document.getElementById("controls"),s=(i?i.offsetHeight:0)+6+13,u=(c?c.offsetHeight:0)+8+13,h=window.innerWidth-r*2,g=window.innerHeight-s-u,f=g,m=f*t;m>h&&(m=h,f=m/t),m=Math.max(160,Math.floor(m)),f=Math.max(120,Math.floor(f)),n.style.width=`${m}px`,n.style.height=`${f}px`,n.style.top=`${s+Math.max(0,(g-f)/2)}px`,e?.(m,f)};return window.addEventListener("resize",a),a(),a}function Ht(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!t)return;let a=o=>{o?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(o))};e?.addEventListener("click",()=>a(t.hasAttribute("hidden"))),n?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",o=>{o.key==="Escape"&&a(!1)})}function it(t,e,n){let a=o=>{for(let[r,i]of t)r.setAttribute("aria-pressed",String(i===o));e(o)};for(let[o,r]of t)o.addEventListener("click",()=>a(r));return n!==void 0&&a(n),a}function Lt(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let n=t[e.key.length===1?e.key.toLowerCase():e.key];n&&(e.preventDefault(),n(e))})}function Ft(t,e=!0){let n=document.getElementById("btn-play"),a=o=>{e=o,n&&(n.setAttribute("aria-pressed",String(!o)),n.querySelector("span").textContent=o?"Pause":"Play",n.querySelector(".icon").textContent=o?"\u275A\u275A":"\u25B6"),t(o)};return n?.addEventListener("click",()=>a(!e)),a(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function Pt(t,e){let n=document.getElementById("badge");n&&e&&(n.textContent=e),document.body.classList.toggle("badge-on",!!t)}function At(){document.body.classList.add("ready")}var Q=Math.PI/4,dt=Math.atan(1/Math.SQRT2),Ct=-Math.PI/6,ne={az:Q-1.25,el:.75,roll:0,zoom:.85,k:1},U=10631978,V=document.getElementById("scene"),W=new l.WebGLRenderer({canvas:V,antialias:!0});W.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var Bt=new l.Color(15525333),ae=new l.Color(15657695);W.setClearColor(Bt,1);var Z=new l.Scene,mt=yt();mt.uLight.value.set(.3,.9,.5).normalize();var x={n:3,cubes:[],group:new l.Group,guides:new l.Group,centre:new l.Vector3,picCentre:[0,0]};Z.add(x.group);Z.add(x.guides);function re(t){return[(t[0]-t[2])/Math.SQRT2,(2*t[1]-t[0]-t[2])/Math.sqrt(6)]}function pt(t){for(let f of x.cubes)f.mesh.geometry.dispose(),f.mesh.material.dispose();x.group.clear(),x.guides.clear(),x.cubes=[],x.n=t;let e=rt(t);e.forEach((f,m)=>{let d=new $;kt(d,t,m);let v={...mt,uFade:{value:1}},w=new l.Mesh(d.build(),Tt(v,{transparent:!0}));w.frustumCulled=!1,x.group.add(w),x.cubes.push({mesh:w,u:v,cell:f})});let n=new l.Vector3;for(let f of e)n.add(new l.Vector3(f[0]+.5,f[1]+.5,f[2]+.5));x.centre.copy(n.divideScalar(e.length));let a=[[.5,.5,.5],[t+.5,.5,.5],[t+.5,t+.5,.5]].map(re);x.picCentre=[(a[0][0]+a[1][0]+a[2][0])/3,(a[0][1]+a[1][1]+a[2][1])/3];let o=new l.LineDashedMaterial({color:U,dashSize:.18,gapSize:.12,transparent:!0,opacity:0,depthTest:!1}),r=new l.MeshBasicMaterial({color:U,transparent:!0,opacity:0,depthTest:!1}),i=e[e.length-1],c=new l.Vector3(i[0]+.5,i[1]+.5,i[2]+.5),s=c.clone().addScalar(-t),u=new l.Line(new l.BufferGeometry().setFromPoints([s,c]),o);u.computeLineDistances(),x.guides.add(u);for(let f of[c,s]){let m=new l.Mesh(new l.SphereGeometry(.07,12,8),r);m.position.copy(f),x.guides.add(m)}let h=new l.LineSegments(new l.EdgesGeometry(new l.BoxGeometry(1,1,1)),new l.LineDashedMaterial({color:U,dashSize:.1,gapSize:.08,transparent:!0,opacity:0}));h.position.set(t+.5,t+.5,t+.5),h.computeLineDistances(),x.guides.add(h);let g=new l.Line(new l.BufferGeometry().setFromPoints([new l.Vector3(.5,.5,.5),new l.Vector3(t+.5,t+.5,t+.5)]),new l.LineDashedMaterial({color:U,dashSize:.18,gapSize:.12,transparent:!0,opacity:0,depthTest:!1}));g.computeLineDistances(),x.guides.add(g),se()}var st=(()=>{let t=[],n=[[1,0,0],[0,1,0],[0,0,1]].map(c=>new l.Vector3(...c).addScalar(-.3333333333333333).normalize()),a=new l.Vector3(-40/3,-40/3,-40/3);for(let c=0;c<3;c++){let s=n[c],u=new l.Vector3().crossVectors(s,new l.Vector3(1,1,1).normalize()),h=Math.SQRT1_2;for(let g=-60;g<=60;g++){let f=a.clone().addScaledVector(u,g*h);t.push(f.clone().addScaledVector(s,-40),f.clone().addScaledVector(s,40))}}let o=new l.BufferGeometry().setFromPoints(t),r=new l.LineBasicMaterial({color:10260344,transparent:!0,opacity:.16}),i=new l.LineSegments(o,r);return i.renderOrder=-2,Z.add(i),i})(),I=new l.OrthographicCamera(-1,1,1,-1,1,4e3),b={az:Q,el:dt,roll:Ct,zoom:1,panX:0,panY:0,k:0},_t=new l.Vector3,It=new l.Vector3,ct=30/38,vt=7;function ie(t,e,n){let a=t*Math.SQRT2,o=e*Math.sqrt(6),r=(n+o)/3,i=2*r-o;return[(i+a)/2,r,(i-a)/2]}function se(){let t=x.centre;_t.set(...ie(x.picCentre[0],x.picCentre[1],t.x+t.y+t.z)),vt=(x.n+1)*2.05,q()}function q(){let t=Math.cos(b.el),e=Math.sin(b.el),n=new l.Vector3(t*Math.sin(b.az),e,t*Math.cos(b.az)),a=new l.Vector3(Math.cos(b.az),0,-Math.sin(b.az)),o=new l.Vector3().crossVectors(n,a),r=a.clone().multiplyScalar(Math.cos(b.roll)).addScaledVector(o,Math.sin(b.roll)),i=o.clone().multiplyScalar(Math.cos(b.roll)).addScaledVector(a,-Math.sin(b.roll));It.copy(_t).lerp(x.centre,b.k);let c=It.clone().addScaledVector(r,b.panX).addScaledVector(i,b.panY);I.position.copy(c).addScaledVector(n,1500),I.up.copy(i),I.lookAt(c);let s=vt/2/b.zoom;I.left=-s*ct,I.right=s*ct,I.top=s,I.bottom=-s,I.updateProjectionMatrix()}St(30/38,(t,e)=>{W.setSize(t,e),ct=t/e,q()});var j=.75,le=.6,zt=5,Nt=.18,ce=1;function lt(){let t=x.cubes.length;return t*j+zt+t*Nt+.6+ce}var fe=window.matchMedia("(prefers-reduced-motion: reduce)").matches,p={litho:1,lithoTarget:1,playing:!0,revealed:!1,tween:null,t:0,manual:null};function ue(t){return 1-Math.pow(1-t,3)}function Dt(t,e){let n=x.cubes.length;if(p.manual!==null)return[t<p.manual?1:0,0];let a=(e%lt()+lt())%lt(),o=a-t*j,r=Math.min(1,Math.max(0,o/le)),i=a-(n*j+zt+(n-1-t)*Nt),c=Math.min(1,Math.max(0,i/.6));return[r,c]}function he(t){let e=0;return x.cubes.forEach((n,a)=>{let[o,r]=Dt(a,t);o>=1&&r<=0&&e++}),e}Ht();it([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{p.lithoTarget=t},1);var wt=Ft(t=>{p.playing=t,t&&(p.manual=null)}),ft=document.getElementById("btn-reveal"),de=document.getElementById("hint"),He=it([[document.getElementById("btn-9"),3],[document.getElementById("btn-15"),5]],t=>{(t!==x.n||!x.cubes.length)&&pt(t),p.t=fe?x.cubes.length*j:0},3);function me(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}function ut(t,e=2){p.tween={from:{...b},to:{...b,...t},t:0,dur:e}}function K(t){p.revealed=t,ft.setAttribute("aria-pressed",String(t)),ft.querySelector("span").textContent=t?"Back to the isometric view":"Reveal the trick",de.textContent=t?"Drag to turn the cubes \xB7 scroll to zoom":"\u2190 \u2192 place or remove one cube \xB7 drag to pan \xB7 scroll to zoom",ut(t?{...ne,panX:0,panY:0}:{az:Q,el:dt,roll:Ct,zoom:1,panX:0,panY:0,k:0})}function Ot(){p.revealed?K(!1):ut({zoom:1,panX:0,panY:0},.8)}ft.addEventListener("click",()=>K(!p.revealed));function ht(t){p.manual===null&&(p.manual=he(p.t)),wt(!1),p.manual=Math.max(0,Math.min(x.cubes.length,p.manual+t))}Lt({" ":()=>wt(!p.playing),l:()=>document.getElementById(p.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>K(!p.revealed),0:Ot,ArrowRight:()=>ht(1),ArrowLeft:()=>ht(-1)});var O=null;V.addEventListener("pointerdown",t=>{V.setPointerCapture(t.pointerId),O={x:t.clientX,y:t.clientY},p.tween=null});V.addEventListener("pointermove",t=>{if(!O)return;let e=t.clientX-O.x,n=t.clientY-O.y;O={x:t.clientX,y:t.clientY};let a=vt/b.zoom/V.clientHeight;p.revealed?(b.az-=e*.006,b.el=Math.min(1.45,Math.max(-1.2,b.el+n*.004))):(b.panX-=e*a,b.panY+=n*a),q()});var qt=()=>{O=null};V.addEventListener("pointerup",qt);V.addEventListener("pointercancel",qt);V.addEventListener("dblclick",Ot);V.addEventListener("wheel",t=>{t.preventDefault(),p.tween=null,b.zoom=Math.min(5,Math.max(.4,b.zoom*Math.exp(-t.deltaY*.0015))),q()},{passive:!1});var Vt=performance.now();function Gt(t){let e=Math.min(.05,Math.max(0,(t-Vt)/1e3));if(Vt=t,p.playing&&(p.t+=e),p.litho!==p.lithoTarget){let o=p.lithoTarget-p.litho;p.litho+=Math.sign(o)*Math.min(Math.abs(o),e*2.2),mt.uLitho.value=p.litho,W.setClearColor(Bt.clone().lerp(ae,1-p.litho),1)}if(p.tween){let o=p.tween;o.t=Math.min(1,o.t+e/o.dur);let r=me(o.t);for(let i of["az","el","roll","zoom","panX","panY","k"])b[i]=o.from[i]+(o.to[i]-o.from[i])*r;o.t>=1&&(p.tween=null),q()}x.cubes.forEach((o,r)=>{let[i,c]=Dt(r,p.t),s=i*(1-c);o.mesh.visible=s>.001,o.u.uFade.value=s,o.mesh.position.y=(1-ue(i))*1.6+c*c*1.6,o.mesh.material.depthWrite=s>.98});let n=Math.hypot(b.az-Q,b.el-dt);st.material.opacity=.16*Math.max(0,1-n/.15),st.visible=st.material.opacity>.002;let a=Math.min(1,Math.max(0,(n-.12)/.3));x.guides.visible=a>0,x.guides.children.forEach(o=>{o.material.opacity=a*(o.isLineSegments?.8:1)}),Pt(n>.02,"Off the isometric axis: the cubes form an open spiral"),W.render(Z,I),requestAnimationFrame(Gt)}x.cubes.length||pt(3);At();requestAnimationFrame(Gt);window.__page={view:b,state:p,setRevealed:K,setPlaying:wt,updateCamera:q,fig:x,buildFigure:pt,stepCubes:ht};})();
