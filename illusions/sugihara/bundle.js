(()=>{var Kt=Object.create;var wt=Object.defineProperty;var Yt=Object.getOwnPropertyDescriptor;var Xt=Object.getOwnPropertyNames;var Jt=Object.getPrototypeOf,Qt=Object.prototype.hasOwnProperty;var te=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(o){throw t=0,o}};var ee=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Xt(t))!Qt.call(e,a)&&a!==o&&wt(e,a,{get:()=>t[a],enumerable:!(n=Yt(t,a))||n.enumerable});return e};var st=(e,t,o)=>(o=e!=null?Kt(Jt(e)):{},ee(t||!e||!e.__esModule?wt(o,"default",{value:e,enumerable:!0}):o,e));var J=te((xe,gt)=>{gt.exports=window.THREE});var c=st(J(),1);var R=st(J(),1),oe=1e3,k={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function ne(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function S(e,t=k.PLAIN,o={}){return{c:typeof e=="number"?ne(e):e,p:t,f:o.f||0,w:o.w||0,s:o.s||0}}var Mt=["px","nx","py","ny","pz","nz"];function C(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function ct(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Q(e){return Math.hypot(e[0],e[1],e[2])}function I(e){let t=Q(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function ft(e,t){let o=Math.abs(t[0]),n=Math.abs(t[1]),a=Math.abs(t[2]);return o>=n&&o>=a?[e[2],e[1]]:a>=n?[e[0],e[1]]:[e[0],e[2]]}var tt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new R.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new R.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let o=this.m.elements,n=t[0],a=t[1],i=t[2];return[o[0]*n+o[4]*a+o[8]*i+o[12],o[1]*n+o[5]*a+o[9]*i+o[13],o[2]*n+o[6]*a+o[10]*i+o[14]]}_tn(t){if(!this.nm)return t;let o=this.nm.elements,n=t[0],a=t[1],i=t[2];return I([o[0]*n+o[3]*a+o[6]*i,o[1]*n+o[4]*a+o[7]*i,o[2]*n+o[5]*a+o[8]*i])}tri(t,o,n,a,i=[1,1,1],r={}){let s=this._tp(t),l=this._tp(o),m=this._tp(n),E=I(ct(C(o,t),C(n,t))),v=r.uv||[ft(t,E),ft(o,E),ft(n,E)],h=I(ct(C(l,s),C(m,s))),u=r.n?r.n.map(w=>this._tn(w)):[h,h,h],f=Q(ct(C(l,s),C(m,s))),d=[f/(Q(C(m,l))||1),f/(Q(C(s,m))||1),f/(Q(C(l,s))||1)],x=r.k||[1,1,1],M=a.s||0,g=[s,l,m];for(let w=0;w<3;w++){let y=g[w];this.pos.push(y[0]+M,y[1]+M,y[2]+M),this.nrm.push(u[w][0],u[w][1],u[w][2]),this.col.push(a.c[0]*x[w],a.c[1]*x[w],a.c[2]*x[w]),this.uv.push(v[w][0],v[w][1]);for(let b=0;b<3;b++)i[b]?this.edg.push(w===b?d[b]:0):this.edg.push(oe);this.mat.push(a.p,a.f,a.w)}}quad(t,o,n,a,i,r=[1,1,1,1],s={}){let l=s.k||[1,1,1,1],m=s.n,E=s.uv;this.tri(t,o,n,i,[r[1],0,r[0]],{k:[l[0],l[1],l[2]],n:m&&[m[0],m[1],m[2]],uv:E&&[E[0],E[1],E[2]]}),this.tri(t,n,a,i,[r[2],r[3],0],{k:[l[0],l[2],l[3]],n:m&&[m[0],m[2],m[3]],uv:E&&[E[0],E[2],E[3]]})}box(t,o,n,a,i,r,s,l={}){t>a&&([t,a]=[a,t]),o>i&&([o,i]=[i,o]),n>r&&([n,r]=[r,n]);let m=new Set(l.open||[]),E=new Set(l.skip||[]);l.bottom||E.add("ny");let v=l.ao??1,h=l.aoTop??1,u={px:[0,a],nx:[0,t],py:[1,i],ny:[1,o],pz:[2,r],nz:[2,n]},f={px:[[a,o,r],[a,o,n],[a,i,n],[a,i,r]],nx:[[t,o,n],[t,o,r],[t,i,r],[t,i,n]],pz:[[t,o,r],[a,o,r],[a,i,r],[t,i,r]],nz:[[a,o,n],[t,o,n],[t,i,n],[a,i,n]],py:[[t,i,r],[a,i,r],[a,i,n],[t,i,n]],ny:[[t,o,n],[a,o,n],[a,o,r],[t,o,r]]};for(let d of Mt){if(E.has(d)||m.has(d))continue;let x=f[d],M=[];for(let y=0;y<4;y++){let b=x[y],H=x[(y+1)%4],F=1;for(let _ of Mt){if(_===d)continue;let[V,q]=u[_];Math.abs(b[V]-q)<1e-9&&Math.abs(H[V]-q)<1e-9&&m.has(_)&&(F=0)}M.push(F)}let g;d==="py"||d==="ny"?g=[h,h,h,h]:g=[v,v,1,1];let w=d==="py"&&l.top?{...l.top,s:s.s}:s;this.quad(x[0],x[1],x[2],x[3],w,M,{k:g})}}cyl(t,o,n,a,i,r,s,l={}){let m=l.caps??[!0,!0],E=l.rim??[1,1],v=l.r1??a;for(let h=0;h<r;h++){let u=h/r*Math.PI*2,f=(h+1)/r*Math.PI*2,d=Math.cos(u),x=Math.sin(u),M=Math.cos(f),g=Math.sin(f),w=[t+a*d,o,n+a*x],y=[t+v*d,i,n+v*x],b=[t+v*M,i,n+v*g],H=[t+a*M,o,n+a*g],F=(a-v)/Math.max(1e-6,i-o),_=I([d,F,x]),V=I([M,F,g]),q=u*(a+v)/2,it=f*(a+v)/2;this.quad(w,y,b,H,s,[0,E[1],0,E[0]],{n:[_,_,V,V],uv:[[q,o],[q,i],[it,i],[it,o]],k:l.k}),m[1]&&v>0&&this.tri([t,i,n],b,y,s,[1,0,0]),m[0]&&this.tri([t,o,n],w,H,s,[1,0,0])}}lathe(t,o,n,a,i,r,s={}){let l=a.length,m=[];for(let h=0;h<l-1;h++){let u=a[h+1][0]-a[h][0],f=a[h+1][1]-a[h][1];m.push(I([f,-u,0]))}let E=a.map((h,u)=>{let f=m[Math.max(0,u-1)],d=m[Math.min(l-2,u)];return I([f[0]+d[0],f[1]+d[1],0])}),v=s.edges||[];for(let h=0;h<i;h++){let u=h/i*Math.PI*2,f=(h+1)/i*Math.PI*2,d=Math.cos(u),x=Math.sin(u),M=Math.cos(f),g=Math.sin(f);for(let w=0;w<l-1;w++){let[y,b]=a[w],[H,F]=a[w+1],_=[t+y*d,o+b,n+y*x],V=[t+H*d,o+F,n+H*x],q=[t+H*M,o+F,n+H*g],it=[t+y*M,o+b,n+y*g],j=s.flat?m[w]:E[w],$=s.flat?m[w]:E[w+1];this.quad(_,V,q,it,r,[0,v[w+1]?1:0,0,v[w]?1:0],{n:[[j[0]*d,j[1],j[0]*x],[$[0]*d,$[1],$[0]*x],[$[0]*M,$[1],$[0]*g],[j[0]*M,j[1],j[0]*g]],uv:[[u*1.2,b],[u*1.2,F],[f*1.2,F],[f*1.2,b]]})}}}poly(t,o,n={}){for(let a=1;a<t.length-1;a++)this.tri(t[0],t[a],t[a+1],o,[1,a===t.length-2?1:0,a===1?1:0],n)}blob(t,o,n,a,i,r,s,l={}){let m=l.sub??1,E=l.seed??0,v=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let f=0;f<m;f++){let d=[];for(let[x,M,g]of v){let w=I([(x[0]+M[0])/2,(x[1]+M[1])/2,(x[2]+M[2])/2]),y=I([(M[0]+g[0])/2,(M[1]+g[1])/2,(M[2]+g[2])/2]),b=I([(g[0]+x[0])/2,(g[1]+x[1])/2,(g[2]+x[2])/2]);d.push([x,w,b],[w,M,y],[b,y,g],[w,y,b])}v=d}let h=f=>1+(l.lump??.12)*Math.sin(f[0]*5.1+E)*Math.sin(f[1]*4.3+E*1.7)*Math.sin(f[2]*3.7+E*.3),u=f=>{let d=h(f);return[t+f[0]*a*d,o+f[1]*i*d,n+f[2]*r*d]};for(let[f,d,x]of v)this.tri(u(f),u(d),u(x),s,[0,0,0],{n:[f,d,x],k:l.k})}build(){let t=new R.BufferGeometry;return t.setAttribute("position",new R.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new R.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new R.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new R.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new R.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new R.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}};var B=st(J(),1);function bt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new B.Vector3(.1,.9,.66).normalize()},uPaper:{value:new B.Vector3(.925,.898,.835)},uInk:{value:new B.Vector3(.11,.1,.09)},uHaze:{value:new B.Vector3(.83,.86,.84)},uFade:{value:1}}}var ut=`
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
`,dt=`
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
`,ae=`
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
`,re=`
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
${ut}
${dt}

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
`;function yt(e,t={}){return new B.ShaderMaterial({uniforms:e,vertexShader:ae,fragmentShader:re,transparent:!!t.transparent,side:t.side??B.FrontSide})}var ge=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${ut}
${dt}
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
`;var Me=`
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
${ut}
${dt}
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
`;var ye=st(J(),1);function Tt(e,t,o){if(!e.includes(t))throw new Error(`ink shader patch failed: ${t}`);return e.replace(t,o)}function ht(e,t={}){e.uHatch||(e.uHatch={value:1});let o=yt(e,t),n=o.fragmentShader;return n=Tt(n,"uniform float uFade;",`uniform float uFade;
uniform float uHatch;`),n=Tt(n,"vec3 outc = finish(col, vM.y, ink, uv, fw, face);","vec3 outc = finish(col, vM.y, ink, uv * uHatch, fw * uHatch, face);"),o.fragmentShader=n,o.needsUpdate=!0,o}function Rt(e,t){let o=document.getElementById("frame"),n=()=>{let i=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),s=document.getElementById("controls"),l=(r?r.offsetHeight:0)+6+13,m=(s?s.offsetHeight:0)+8+13,E=window.innerWidth-i*2,v=window.innerHeight-l-m,h=v,u=h*e;u>E&&(u=E,h=u/e),u=Math.max(160,Math.floor(u)),h=Math.max(120,Math.floor(h)),o.style.width=`${u}px`,o.style.height=`${h}px`,o.style.top=`${l+Math.max(0,(v-h)/2)}px`,t?.(u,h)};return window.addEventListener("resize",n),n(),n}function kt(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!e)return;let n=a=>{a?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(a))};t?.addEventListener("click",()=>n(e.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function Ht(e,t,o){let n=a=>{for(let[i,r]of e)i.setAttribute("aria-pressed",String(r===a));t(a)};for(let[a,i]of e)a.addEventListener("click",()=>n(i));return o!==void 0&&n(o),n}function St(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let o=e[t.key.length===1?t.key.toLowerCase():t.key];o&&(t.preventDefault(),o(t))})}function Lt(e,t=!0){let o=document.getElementById("btn-play"),n=a=>{t=a,o&&(o.setAttribute("aria-pressed",String(!a)),o.querySelector("span").textContent=a?"Pause":"Play",o.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),e(a)};return o?.addEventListener("click",()=>n(!t)),n(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function At(e,t){let o=document.getElementById("badge");o&&t&&(o.textContent=t),document.body.classList.toggle("badge-on",!!e)}function Ft(){document.body.classList.add("ready")}function D(e,t,o,n,a){let i=Math.sqrt(Math.max(0,e*e-n*n)),r=Math.tan(o);return a?[n,t-r*(i-e)/2,-(i+e)/2]:[n,t+r*(i-e)/2,(i+e)/2]}function It(e,t,o,n=48,a=6){let i=[],r=Math.tan(o);for(let s=0;s<=n;s++){let l=s/n*Math.PI,m=e*Math.cos(l),E=D(e,t,o,m,!1),v=-e*Math.sin(l),h=e*Math.cos(l)/2,u=Math.hypot(v,h)||1,f=h/u,d=-v/u;d<0&&(f=-f,d=-d),i.push({p:E,n:[f,0,d],corner:s===0||s===n})}for(let s=1;s<a;s++){let l=s/a,m=e/2,E=-e/2;i.push({p:[-e,t-r*e/2+l*r*e,m+(E-m)*l],n:[-1,0,0],corner:!1})}for(let s=0;s<=n;s++){let l=Math.PI+s/n*Math.PI,m=e*Math.cos(l),E=D(e,t,o,m,!0),v=-e*Math.sin(l),h=-(e*Math.cos(l))/2,u=Math.hypot(v,h)||1,f=h/u,d=-v/u;d>0&&(f=-f,d=-d),i.push({p:E,n:[f,0,d],corner:s===0||s===n})}for(let s=1;s<a;s++){let l=s/a,m=-e/2,E=e/2;i.push({p:[e,t+r*e/2-l*r*e,m+(E-m)*l],n:[1,0,0],corner:!1})}for(let s of i)s.corner&&(s.n=[Math.sign(s.p[0]),0,0]);return i}function Pt(e,t,o,n,a,i,r){let s=It(t,o,n),l=It(t-a,o,n),m=s.length,E=[0];for(let v=1;v<=m;v++){let h=s[v-1].p,u=s[v%m].p;E.push(E[v-1]+Math.hypot(u[0]-h[0],u[2]-h[2]))}for(let v=0;v<m;v++){let h=(v+1)%m,u=s[v],f=s[h],d=l[v],x=l[h],M=E[v],g=E[v+1],w=u.corner?1:0,y=f.corner?1:0;e.quad([f.p[0],0,f.p[2]],[u.p[0],0,u.p[2]],u.p,f.p,i,[1,w,1,y],{n:[f.n,u.n,u.n,f.n],uv:[[g,0],[M,0],[M,u.p[1]],[g,f.p[1]]]});let b=H=>[-H.n[0],0,-H.n[2]];e.quad([d.p[0],0,d.p[2]],[x.p[0],0,x.p[2]],x.p,d.p,r,[0,y,1,w],{n:[b(d),b(x),b(x),b(d)],uv:[[M,0],[g,0],[g,x.p[1]],[M,d.p[1]]]}),e.quad(f.p,u.p,d.p,x.p,i,[1,0,1,0])}return s}var G=c.MathUtils.degToRad(42),ie=Math.tan(G),z=-2.2,N={x0:-2.4,x1:2.6,y0:.14,y1:4.85},et=-2.75,L={x0:-8,x1:8,z0:et,z1:2.75,top:0,th:.3},zt=[{x:-.6,z:.2,r:1,hMin:.95,wall:.07,col:15710351,inner:16178372,turn:0},{x:1.78,z:.55,r:.52,hMin:.5,wall:.05,col:12111325,inner:14674159,turn:Math.PI}];for(let e of zt)e.y0=e.hMin+ie*e.r/2;var O=document.getElementById("scene"),P=new c.WebGLRenderer({canvas:O,antialias:!0,stencil:!0});P.setPixelRatio(Math.min(window.devicePixelRatio||1,2));P.autoClear=!1;var Nt=new c.Color(15525333),se=new c.Color(15328474);P.setClearColor(Nt,1);var Y=bt();Y.uHatch={value:5};Y.uLight.value.set(-.42,.78,.47).normalize();var le={...Y,uLight:{value:Y.uLight.value.clone().multiply(new c.Vector3(1,1,-1))}},_t=ht(Y),lt=ht(le);Object.assign(lt,{stencilWrite:!0,stencilRef:1,stencilFunc:c.EqualStencilFunc,stencilFail:c.KeepStencilOp,stencilZFail:c.KeepStencilOp,stencilZPass:c.KeepStencilOp});var W=new c.Scene,Ot=new c.Scene,Wt=new c.Scene,U=new c.Group;U.matrixAutoUpdate=!1;U.matrix.makeTranslation(0,0,z).multiply(new c.Matrix4().makeScale(1,1,-1)).multiply(new c.Matrix4().makeTranslation(0,0,-z));U.matrixWorldNeedsUpdate=!0;Ot.add(U);function at(e,t=_t){let o=new tt;e(o);let n=new c.Mesh(o.build(),t);return n.frustumCulled=!1,n}var pt=S(14468771,k.WOOD),Z=S(11111016,k.WOOD),ce=S(15788506,k.PLASTER,{f:.15});W.add(at(e=>{e.box(-12,-3,et-.3,12,12,et,ce,{skip:["nz"]}),e.box(-12,1.6,et,12,1.72,et+.06,S(14866886,k.PLAIN),{});let{x0:t,x1:o,y0:n,y1:a}=N,i=.2,r=z-.14,s=z+.07;e.box(t-i,n-i,r,o+i,n,s,Z,{}),e.box(t-i,a,r,o+i,a+i,s,Z,{}),e.box(t-i,n,r,t,a,s,Z,{}),e.box(o,n,r,o+i,a,s,Z,{}),e.box(t-i-.02,a+i,r-.02,o+i+.02,a+i+.08,s+.02,Z,{});for(let l of[t+.5,o-.5])e.box(l-.18,0,z-.75,l+.18,.14,z-.1,Z,{});e.box(L.x0,L.top-L.th,L.z0,L.x1,L.top,z,pt,{top:pt})}));var Vt=e=>e.box(L.x0,L.top-L.th,z,L.x1,L.top,L.z1,pt,{skip:["nz"]});W.add(at(Vt));U.add(at(Vt,lt));var qt=e=>{e.box(-.55,0,1.75,.55,.012,2.35,S(15986402,k.PLAIN),{}),e.box(-.42,.012,1.86,.3,.016,1.9,S(5919562,k.PLAIN),{}),e.box(-.42,.012,1.98,.42,.016,2.01,S(9406331,k.PLAIN),{}),e.box(-.42,.012,2.08,.36,.016,2.11,S(9406331,k.PLAIN),{}),e.box(-.42,.012,2.18,.1,.016,2.21,S(9406331,k.PLAIN),{})};W.add(at(qt));U.add(at(qt,lt));var vt=zt.map(e=>{let t=(()=>{let s=new tt;return Pt(s,e.r,e.y0,G,e.wall,S(e.col,k.PLAIN),S(e.inner,k.PLAIN)),s.build()})(),o=new c.Group;o.position.set(e.x,0,e.z);let n=new c.Mesh(t,_t);n.frustumCulled=!1,o.add(n),W.add(o);let a=new c.Group;a.position.copy(o.position);let i=new c.Mesh(t,lt);i.frustumCulled=!1,a.add(i),U.add(a);let r=fe(e);return o.add(r.direct),a.add(r.mirror),{t:e,real:o,seen:a,guides:r,angle:e.turn}});function fe(e){let{r:t,y0:o}=e,n=new c.LineDashedMaterial({color:10631978,dashSize:.09,gapSize:.06,transparent:!0,opacity:0,depthTest:!1}),a=n.clone();Object.assign(a,{stencilWrite:!0,stencilRef:1,stencilFunc:c.EqualStencilFunc,stencilZPass:c.KeepStencilOp});let i=(u,f)=>{let d=new c.Group;for(let x of u){let M=new c.BufferGeometry().setFromPoints(x.map(w=>new c.Vector3(...w))),g=new c.Line(M,f);g.computeLineDistances(),g.renderOrder=30,d.add(g)}return d},r=[[t,o,t],[-t,o,t],[-t,o,-t],[t,o,-t],[t,o,t]],s=[];for(let u=0;u<=72;u++){let f=u/72*Math.PI*2;s.push([t*Math.cos(f),o,t*Math.sin(f)])}let l=[D(t,o,G,t,!1),D(t,o,G,-t,!1),D(t,o,G,-t,!0),D(t,o,G,t,!0)],m=[[t,o,t],[-t,o,t],[-t,o,-t],[t,o,-t]],E=[[t,o,0],[-t,o,0],[-t,o,0],[t,o,0]],v=[r,...l.map((u,f)=>[u,m[f]])],h=[s,...l.map((u,f)=>[u,E[f]])];return{direct:i(v,n),directAlt:i(h,n),mirror:i(h,a),mirrorAlt:i(v,a),mats:[n,a]}}for(let e of vt)e.real.add(e.guides.directAlt),e.seen.add(e.guides.mirrorAlt);var rt=new c.PlaneGeometry(N.x1-N.x0,N.y1-N.y0);rt.translate((N.x0+N.x1)/2,(N.y0+N.y1)/2,z);Wt.add(new c.Mesh(rt,new c.MeshBasicMaterial({colorWrite:!1,depthWrite:!1,depthTest:!1,stencilWrite:!0,stencilRef:1,stencilFunc:c.AlwaysStencilFunc,stencilZPass:c.ReplaceStencilOp})));var Dt=new c.Mesh(rt,new c.MeshBasicMaterial({colorWrite:!1}));Dt.renderOrder=-10;W.add(Dt);var ue=(()=>{let e=document.createElement("canvas");e.width=256,e.height=256;let t=e.getContext("2d"),o=t.createLinearGradient(0,0,256,256);o.addColorStop(0,"rgba(255,255,255,0.10)"),o.addColorStop(.32,"rgba(255,255,255,0.02)"),o.addColorStop(.36,"rgba(255,255,255,0.13)"),o.addColorStop(.42,"rgba(255,255,255,0.03)"),o.addColorStop(1,"rgba(255,255,255,0.0)"),t.fillStyle=o,t.fillRect(0,0,256,256);let n=new c.CanvasTexture(e);return n.colorSpace=c.SRGBColorSpace,n})(),Gt=new c.Mesh(rt,new c.MeshBasicMaterial({color:10465965,transparent:!0,opacity:.1,depthWrite:!1}));Gt.renderOrder=10;W.add(Gt);var Ut=new c.Mesh(rt,new c.MeshBasicMaterial({map:ue,transparent:!0,depthWrite:!1}));Ut.renderOrder=11;W.add(Ut);var A=new c.OrthographicCamera(-1,1,1,-1,.1,200),Ct=new c.Vector3(.1,1.62,-.75),de=7.7,X={az:0,el:G,zoom:1},he={az:.62,el:.5,zoom:1.08},T={...X},Et=30/38;function jt(){let e=Math.cos(T.el),t=Math.sin(T.el),o=new c.Vector3(e*Math.sin(T.az),t,e*Math.cos(T.az));A.position.copy(Ct).addScaledVector(o,60),A.up.set(0,1,0),A.lookAt(Ct);let n=de/2/T.zoom;A.left=-n*Et,A.right=n*Et,A.top=n,A.bottom=-n,A.updateProjectionMatrix()}Rt(30/38,(e,t)=>{P.setSize(e,t),Et=e/t,jt()});var p={playing:!0,litho:1,lithoTarget:1,revealed:!1,tween:null,turn:null,turned:!1,clock:0};kt();Ht([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{p.lithoTarget=e},1);var me=Lt(e=>{p.playing=e,p.clock=0}),pe=document.getElementById("btn-turn"),ot=document.getElementById("btn-reveal");function xt(){p.turn||(p.turn={t:0,dur:2.6},p.clock=0)}function nt(e){p.revealed=e,ot.setAttribute("aria-pressed",String(e)),ot.querySelector("span").textContent=e?"Back to the design view":"Show the real shape",document.getElementById("hint").textContent=e?"Drag to turn the view \xB7 double-click for the design view":"Drag to look from elsewhere \xB7 the mirror shows the back of each tube",ve(e?he:X)}function ve(e,t=2){p.tween={from:{...T},to:{...e},t:0,dur:t}}pe.addEventListener("click",xt);ot.addEventListener("click",()=>nt(!p.revealed));St({" ":()=>me(!p.playing),l:()=>document.getElementById(p.lithoTarget?"btn-colour":"btn-litho").click(),t:xt,r:()=>nt(!p.revealed),0:()=>nt(!1)});var K=null;O.addEventListener("pointerdown",e=>{O.setPointerCapture(e.pointerId),K={x:e.clientX,y:e.clientY},p.tween=null});O.addEventListener("pointermove",e=>{if(!K)return;let t=e.clientX-K.x,o=e.clientY-K.y;K={x:e.clientX,y:e.clientY},T.az=c.MathUtils.clamp(T.az-t*.006,-1.4,1.4),T.el=c.MathUtils.clamp(T.el+o*.004,.08,1.35),!p.revealed&&Math.hypot(T.az-X.az,T.el-X.el)>.05&&(p.revealed=!0,ot.setAttribute("aria-pressed","true"),ot.querySelector("span").textContent="Back to the design view")});var $t=()=>{K=null};O.addEventListener("pointerup",$t);O.addEventListener("pointercancel",$t);O.addEventListener("dblclick",()=>nt(!1));O.addEventListener("wheel",e=>{e.preventDefault(),T.zoom=c.MathUtils.clamp(T.zoom*Math.exp(-e.deltaY*.0012),.6,4)},{passive:!1});var mt=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,Bt=performance.now();function Zt(e){let t=Math.min(.05,Math.max(0,(e-Bt)/1e3));Bt=e,p.playing&&!p.turn&&!p.revealed&&(p.clock+=t,p.clock>6.5&&xt());let o=p.turned?1:0;if(p.turn){let r=p.turn;r.t=Math.min(1,r.t+t/r.dur),o=p.turned?1-mt(r.t):mt(r.t),r.t>=1&&(p.turn=null,p.turned=!p.turned,o=p.turned?1:0)}for(let r of vt){let s=r.t.turn+Math.PI*o;r.real.rotation.y=s,r.seen.rotation.y=s}if(p.tween){let r=p.tween;r.t=Math.min(1,r.t+t/r.dur);let s=mt(r.t);for(let l of["az","el","zoom"])T[l]=r.from[l]+(r.to[l]-r.from[l])*s;r.t>=1&&(p.tween=null)}jt();let n=Math.hypot(T.az-X.az,T.el-X.el),a=p.turn?0:c.MathUtils.clamp((n-.1)/.35,0,1);for(let r of vt){let s=Math.round(r.real.rotation.y/Math.PI%2)===1;r.guides.direct.visible=!s,r.guides.directAlt.visible=s,r.guides.mirror.visible=!s,r.guides.mirrorAlt.visible=s;for(let l of[r.guides.direct,r.guides.directAlt,r.guides.mirror,r.guides.mirrorAlt])l.children.forEach(m=>{m.material.opacity=a})}if(p.litho!==p.lithoTarget){let r=p.lithoTarget-p.litho;p.litho+=Math.sign(r)*Math.min(Math.abs(r),t*2.2)}Y.uLitho.value=p.litho,P.setClearColor(se.clone().lerp(Nt,p.litho),1);let i=n<.001&&!p.turn;At(i&&!p.noBadge,p.turned?"Design view: round tubes in front, square in the mirror":"Design view: square tubes in front, round in the mirror"),document.body.classList.toggle("off-axis",n>.001),P.clear(!0,!0,!0),P.render(Wt,A),P.render(Ot,A),P.clearDepth(),P.render(W,A),requestAnimationFrame(Zt)}Ft();requestAnimationFrame(Zt);window.__page={state:p,view:T,setView(e,t,o=1){p.tween=null,Object.assign(T,{az:e,el:t,zoom:o})},setTurned(e){p.turn=null,p.turned=e,p.clock=0},setTurnPhase(e){p.turn={t:e,dur:1e9}},setLitho(e){document.getElementById(e?"btn-litho":"btn-colour").click(),p.litho=e?1:0},reveal:nt};})();
