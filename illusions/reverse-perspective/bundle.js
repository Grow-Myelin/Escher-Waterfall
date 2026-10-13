(()=>{var Le=Object.create;var _t=Object.defineProperty;var Se=Object.getOwnPropertyDescriptor;var Re=Object.getOwnPropertyNames;var Pe=Object.getPrototypeOf,Ae=Object.prototype.hasOwnProperty;var Fe=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var ke=(t,e,o,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Re(e))!Ae.call(t,n)&&n!==o&&_t(t,n,{get:()=>e[n],enumerable:!(a=Se(e,n))||a.enumerable});return t};var rt=(t,e,o)=>(o=t!=null?Le(Pe(t)):{},ke(e||!t||!t.__esModule?_t(o,"default",{value:t,enumerable:!0}):o,t));var Q=Fe((qe,zt)=>{zt.exports=window.THREE});var k=rt(Q(),1);var B=rt(Q(),1),He=1e3,M={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Ie(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function T(t,e=M.PLAIN,o={}){return{c:typeof t=="number"?Ie(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var Vt=["px","nx","py","ny","pz","nz"];function X(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function Tt(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function lt(t){return Math.hypot(t[0],t[1],t[2])}function j(t){let e=lt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function Lt(t,e){let o=Math.abs(e[0]),a=Math.abs(e[1]),n=Math.abs(e[2]);return o>=a&&o>=n?[t[2],t[1]]:n>=a?[t[0],t[1]]:[t[0],t[2]]}var st=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new B.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new B.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,a=e[0],n=e[1],i=e[2];return[o[0]*a+o[4]*n+o[8]*i+o[12],o[1]*a+o[5]*n+o[9]*i+o[13],o[2]*a+o[6]*n+o[10]*i+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,a=e[0],n=e[1],i=e[2];return j([o[0]*a+o[3]*n+o[6]*i,o[1]*a+o[4]*n+o[7]*i,o[2]*a+o[5]*n+o[8]*i])}tri(e,o,a,n,i=[1,1,1],s={}){let u=this._tp(e),l=this._tp(o),d=this._tp(a),r=j(Tt(X(o,e),X(a,e))),m=s.uv||[Lt(e,r),Lt(o,r),Lt(a,r)],f=j(Tt(X(l,u),X(d,u))),c=s.n?s.n.map(w=>this._tn(w)):[f,f,f],b=lt(Tt(X(l,u),X(d,u))),p=[b/(lt(X(d,l))||1),b/(lt(X(u,d))||1),b/(lt(X(l,u))||1)],v=s.k||[1,1,1],L=n.s||0,E=[u,l,d];for(let w=0;w<3;w++){let h=E[w];this.pos.push(h[0]+L,h[1]+L,h[2]+L),this.nrm.push(c[w][0],c[w][1],c[w][2]),this.col.push(n.c[0]*v[w],n.c[1]*v[w],n.c[2]*v[w]),this.uv.push(m[w][0],m[w][1]);for(let x=0;x<3;x++)i[x]?this.edg.push(w===x?p[x]:0):this.edg.push(He);this.mat.push(n.p,n.f,n.w)}}quad(e,o,a,n,i,s=[1,1,1,1],u={}){let l=u.k||[1,1,1,1],d=u.n,r=u.uv;this.tri(e,o,a,i,[s[1],0,s[0]],{k:[l[0],l[1],l[2]],n:d&&[d[0],d[1],d[2]],uv:r&&[r[0],r[1],r[2]]}),this.tri(e,a,n,i,[s[2],s[3],0],{k:[l[0],l[2],l[3]],n:d&&[d[0],d[2],d[3]],uv:r&&[r[0],r[2],r[3]]})}box(e,o,a,n,i,s,u,l={}){e>n&&([e,n]=[n,e]),o>i&&([o,i]=[i,o]),a>s&&([a,s]=[s,a]);let d=new Set(l.open||[]),r=new Set(l.skip||[]);l.bottom||r.add("ny");let m=l.ao??1,f=l.aoTop??1,c={px:[0,n],nx:[0,e],py:[1,i],ny:[1,o],pz:[2,s],nz:[2,a]},b={px:[[n,o,s],[n,o,a],[n,i,a],[n,i,s]],nx:[[e,o,a],[e,o,s],[e,i,s],[e,i,a]],pz:[[e,o,s],[n,o,s],[n,i,s],[e,i,s]],nz:[[n,o,a],[e,o,a],[e,i,a],[n,i,a]],py:[[e,i,s],[n,i,s],[n,i,a],[e,i,a]],ny:[[e,o,a],[n,o,a],[n,o,s],[e,o,s]]};for(let p of Vt){if(r.has(p)||d.has(p))continue;let v=b[p],L=[];for(let h=0;h<4;h++){let x=v[h],y=v[(h+1)%4],R=1;for(let P of Vt){if(P===p)continue;let[H,O]=c[P];Math.abs(x[H]-O)<1e-9&&Math.abs(y[H]-O)<1e-9&&d.has(P)&&(R=0)}L.push(R)}let E;p==="py"||p==="ny"?E=[f,f,f,f]:E=[m,m,1,1];let w=p==="py"&&l.top?{...l.top,s:u.s}:u;this.quad(v[0],v[1],v[2],v[3],w,L,{k:E})}}cyl(e,o,a,n,i,s,u,l={}){let d=l.caps??[!0,!0],r=l.rim??[1,1],m=l.r1??n;for(let f=0;f<s;f++){let c=f/s*Math.PI*2,b=(f+1)/s*Math.PI*2,p=Math.cos(c),v=Math.sin(c),L=Math.cos(b),E=Math.sin(b),w=[e+n*p,o,a+n*v],h=[e+m*p,i,a+m*v],x=[e+m*L,i,a+m*E],y=[e+n*L,o,a+n*E],R=(n-m)/Math.max(1e-6,i-o),P=j([p,R,v]),H=j([L,R,E]),O=c*(n+m)/2,S=b*(n+m)/2;this.quad(w,h,x,y,u,[0,r[1],0,r[0]],{n:[P,P,H,H],uv:[[O,o],[O,i],[S,i],[S,o]],k:l.k}),d[1]&&m>0&&this.tri([e,i,a],x,h,u,[1,0,0]),d[0]&&this.tri([e,o,a],w,y,u,[1,0,0])}}lathe(e,o,a,n,i,s,u={}){let l=n.length,d=[];for(let f=0;f<l-1;f++){let c=n[f+1][0]-n[f][0],b=n[f+1][1]-n[f][1];d.push(j([b,-c,0]))}let r=n.map((f,c)=>{let b=d[Math.max(0,c-1)],p=d[Math.min(l-2,c)];return j([b[0]+p[0],b[1]+p[1],0])}),m=u.edges||[];for(let f=0;f<i;f++){let c=f/i*Math.PI*2,b=(f+1)/i*Math.PI*2,p=Math.cos(c),v=Math.sin(c),L=Math.cos(b),E=Math.sin(b);for(let w=0;w<l-1;w++){let[h,x]=n[w],[y,R]=n[w+1],P=[e+h*p,o+x,a+h*v],H=[e+y*p,o+R,a+y*v],O=[e+y*L,o+R,a+y*E],S=[e+h*L,o+x,a+h*E],I=u.flat?d[w]:r[w],C=u.flat?d[w]:r[w+1];this.quad(P,H,O,S,s,[0,m[w+1]?1:0,0,m[w]?1:0],{n:[[I[0]*p,I[1],I[0]*v],[C[0]*p,C[1],C[0]*v],[C[0]*L,C[1],C[0]*E],[I[0]*L,I[1],I[0]*E]],uv:[[c*1.2,x],[c*1.2,R],[b*1.2,R],[b*1.2,x]]})}}}poly(e,o,a={}){for(let n=1;n<e.length-1;n++)this.tri(e[0],e[n],e[n+1],o,[1,n===e.length-2?1:0,n===1?1:0],a)}blob(e,o,a,n,i,s,u,l={}){let d=l.sub??1,r=l.seed??0,m=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let b=0;b<d;b++){let p=[];for(let[v,L,E]of m){let w=j([(v[0]+L[0])/2,(v[1]+L[1])/2,(v[2]+L[2])/2]),h=j([(L[0]+E[0])/2,(L[1]+E[1])/2,(L[2]+E[2])/2]),x=j([(E[0]+v[0])/2,(E[1]+v[1])/2,(E[2]+v[2])/2]);p.push([v,w,x],[w,L,h],[x,h,E],[w,h,x])}m=p}let f=b=>1+(l.lump??.12)*Math.sin(b[0]*5.1+r)*Math.sin(b[1]*4.3+r*1.7)*Math.sin(b[2]*3.7+r*.3),c=b=>{let p=f(b);return[e+b[0]*n*p,o+b[1]*i*p,a+b[2]*s*p]};for(let[b,p,v]of m)this.tri(c(b),c(p),c(v),u,[0,0,0],{n:[b,p,v],k:l.k})}build(){let e=new B.BufferGeometry;return e.setAttribute("position",new B.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new B.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new B.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new B.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new B.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new B.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},q={T:(t,e,o)=>new B.Matrix4().makeTranslation(t,e,o),RX:t=>new B.Matrix4().makeRotationX(t),RY:t=>new B.Matrix4().makeRotationY(t),RZ:t=>new B.Matrix4().makeRotationZ(t),S:(t,e,o)=>new B.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new B.Matrix4)};var Y=rt(Q(),1);function St(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new Y.Vector3(.1,.9,.66).normalize()},uPaper:{value:new Y.Vector3(.925,.898,.835)},uInk:{value:new Y.Vector3(.11,.1,.09)},uHaze:{value:new Y.Vector3(.83,.86,.84)},uFade:{value:1}}}var Rt=`
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
`,Pt=`
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
`,Ce=`
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
`,Oe=`
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
${Rt}
${Pt}

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
`;function Ut(t,e={}){return new Y.ShaderMaterial({uniforms:t,vertexShader:Ce,fragmentShader:Oe,transparent:!!e.transparent,side:e.side??Y.FrontSide})}var e0=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${Rt}
${Pt}
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
`;var o0=`
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
${Rt}
${Pt}
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
`;var a0=rt(Q(),1);function $t(t,e,o){if(!t.includes(e))throw new Error(`ink shader patch failed: ${e}`);return t.replace(e,o)}function vt(t,e={}){t.uHatch||(t.uHatch={value:1});let o=Ut(t,e),a=o.fragmentShader;return a=$t(a,"uniform float uFade;",`uniform float uFade;
uniform float uHatch;`),a=$t(a,"vec3 outc = finish(col, vM.y, ink, uv, fw, face);","vec3 outc = finish(col, vM.y, ink, uv * uHatch, fw * uHatch, face);"),o.fragmentShader=a,o.needsUpdate=!0,o}function jt(t,e){let o=document.getElementById("frame"),a=()=>{let i=(window.innerWidth<640?10:28)+13,s=document.getElementById("masthead"),u=document.getElementById("controls"),l=(s?s.offsetHeight:0)+6+13,d=(u?u.offsetHeight:0)+8+13,r=window.innerWidth-i*2,m=window.innerHeight-l-d,f=m,c=f*t;c>r&&(c=r,f=c/t),c=Math.max(160,Math.floor(c)),f=Math.max(120,Math.floor(f)),o.style.width=`${c}px`,o.style.height=`${f}px`,o.style.top=`${l+Math.max(0,(m-f)/2)}px`,e?.(c,f)};return window.addEventListener("resize",a),a(),a}function Gt(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let a=n=>{n?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(n))};e?.addEventListener("click",()=>a(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function Kt(t,e,o){let a=n=>{for(let[i,s]of t)i.setAttribute("aria-pressed",String(s===n));e(n)};for(let[n,i]of t)n.addEventListener("click",()=>a(i));return o!==void 0&&a(o),a}function Xt(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function Yt(t,e=!0){let o=document.getElementById("btn-play"),a=n=>{e=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),t(n)};return o?.addEventListener("click",()=>a(!e)),a(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function Zt(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function Jt(){document.body.classList.add("ready")}var gt=rt(Q(),1),V=2.4,z=new gt.Vector3(0,0,V),yt=.45,Qt=-yt/(V-yt),A={x0:-.75,x1:.75,y0:-.95,y1:.95};function ct(t){let e=(V-t.z)/V,o=e/(Qt+(1-Qt)*e);return z.clone().add(t.clone().sub(z).multiplyScalar(o/e))}function At(t){return ct(new gt.Vector3(0,0,-t)).z}var N=[{name:"hall",x0:-.29,x1:.29,y0:-.7,y1:.48,F:5,hidden:[]},{name:"roomL",x0:-.7,x1:-.38,y0:-.7,y1:.2,F:.95,hidden:["x1"]},{name:"roomR",x0:.38,x1:.7,y0:-.7,y1:.2,F:.95,hidden:["x0"]},{name:"nicheL",x0:-.66,x1:-.44,y0:.36,y1:.66,F:.4,hidden:["x1","y0"]},{name:"nicheR",x0:.44,x1:.66,y0:.36,y1:.66,F:.4,hidden:["x0","y0"]}];function xt(t,e){let o=t[e];if(!t.hidden.includes(e))return o;let a=e[0]==="x"?z.x:z.y;return a+(o-a)*((V+t.F)/V)}function ft(t){let e=xt(t,"x0"),o=xt(t,"x1"),a=xt(t,"y0"),n=xt(t,"y1"),i=(s,u,l)=>new gt.Vector3(s,u,l);return{near:[i(t.x0,t.y0,0),i(t.x1,t.y0,0),i(t.x1,t.y1,0),i(t.x0,t.y1,0)],far:[i(e,a,-t.F),i(o,a,-t.F),i(o,n,-t.F),i(e,n,-t.F)]}}function qt(t){let e=ft(t);return{near:e.near.map(ct),far:e.far.map(ct)}}var F=5,ut=class{constructor(e){this.b=e}s(e){return[e[0]*F,e[1]*F,e[2]*F]}box(e,o,a,n,i,s,u,l={}){this.b.box(e*F,o*F,a*F,n*F,i*F,s*F,u,l)}quad(e,o,a,n,i,s,u){this.b.quad(this.s(e),this.s(o),this.s(a),this.s(n),i,s,u)}blob(e,o,a,n,i,s,u,l){this.b.blob(e*F,o*F,a*F,n*F,i*F,s*F,u,l)}cyl(e,o,a,n,i,s,u,l={}){this.b.cyl(e*F,o*F,a*F,n*F,i*F,s,u,{...l,r1:l.r1===void 0?void 0:l.r1*F})}lathe(e,o,a,n,i,s,u){this.b.lathe(e*F,o*F,a*F,n.map(([l,d])=>[l*F,d*F]),i,s,u)}};function Be(t){let e=t>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function Ht(t){let{near:e,far:o}=ft(t),a=n=>[n.x,n.y,n.z];return{floor:[e[0],e[1],o[1],o[0]].map(a),ceil:[e[3],o[3],o[2],e[2]].map(a),left:[e[0],o[0],o[3],e[3]].map(a),right:[e[1],e[2],o[2],o[1]].map(a),far:[o[0],o[1],o[2],o[3]].map(a)}}var te=T(14471352,M.ASHLAR),D=T(15393489,M.PLAIN),ee=T(12562839,M.STONE),tt=T(15326402,M.PLASTER),It=T(15854042,M.PLASTER),Ne=T(15788506,M.PLAIN),De=T(6248012,M.PLAIN),oe=T(9662799,M.WOOD),re=T(6966325,M.WOOD),We=T(9202507,M.WOOD),_e=T(12096873,M.WOOD),Ft=T(8216387,M.WOOD),se=T(15003120,M.PLAIN),kt=T(13150056,M.PLAIN),ze=T(10991746,M.GRASS),Ve=T(14537403,M.SOIL),ne=T(9348460,M.FOLIAGE),Ue=T(8021328,M.WOOD),ae=[9190190,3099502,6122298,11569726,7028060,4538426,13218954,10115637,4153178];function $e(t){let o=new Set([A.x0-.06,A.x1+.06]),a=new Set([A.y0-.06,A.y1+.06]);for(let r of N)o.add(r.x0),o.add(r.x1),a.add(r.y0),a.add(r.y1);let n=[...o].sort((r,m)=>r-m),i=[...a].sort((r,m)=>r-m),s=(r,m)=>N.some(f=>r>f.x0&&r<f.x1&&m>f.y0&&m<f.y1);for(let r=0;r<n.length-1;r++)for(let m=0;m<i.length-1;m++){let f=(n[r]+n[r+1])/2,c=(i[m]+i[m+1])/2;if(s(f,c))continue;let b=[s(f,i[m]-1e-4)?1:0,s(n[r+1]+1e-4,c)?1:0,s(f,i[m+1]+1e-4)?1:0,s(n[r]-1e-4,c)?1:0];t.quad([n[r],i[m],0],[n[r+1],i[m],0],[n[r+1],i[m+1],0],[n[r],i[m+1],0],te,b)}let u=.035,l=.014;for(let r of N)t.box(r.x0-u,r.y1,0,r.x1+u,r.y1+u,l,D),t.box(r.x0-u,r.y0,0,r.x0,r.y1,l,D),t.box(r.x1,r.y0,0,r.x1+u,r.y1,l,D),r.name.startsWith("niche")&&t.box(r.x0-u-.01,r.y0-.03,0,r.x1+u+.01,r.y0,.035,D);let d=N[0];t.box(d.x0-.07,d.y1+u,0,d.x1+.07,d.y1+.1,.022,D),t.box(-.035,d.y1,0,.035,d.y1+.12,.032,te);for(let r of[-1,1])t.box(r>0?.3:-.37,-.76,0,r>0?.37:-.3,.8,.012,D);t.box(A.x0-.1,.8,0,A.x1+.1,.86,.03,D),t.box(A.x0-.1,.86,0,A.x1+.1,.875,.045,D);for(let r=A.x0-.05;r<A.x1+.05;r+=.045)t.box(r,.775,0,r+.022,.8,.018,D);t.box(A.x0-.1,-1.05,0,A.x1+.1,-.76,.014,ee),t.box(d.x0-.05,-.76,0,d.x1+.05,-.7,.07,ee),t.box(-.28,.88,0,.28,.98,.012,D)}function je(t){let e=N[0],o=Ht(e),{x0:a,x1:n,y0:i,y1:s}=e,u=e.F,l=4,d=34;for(let h=0;h<l;h++)for(let x=0;x<d;x++){let y=a+(n-a)*h/l,R=a+(n-a)*(h+1)/l,P=-u*x/d,H=-u*(x+1)/d;t.quad([y,i,P],[R,i,P],[R,i,H],[y,i,H],(h+x)%2?Ne:De,[0,0,0,0])}t.quad(...o.left,tt,[1,1,1,1]),t.quad(...o.right,tt,[1,1,1,1]),t.quad(...o.ceil,It,[1,1,1,1]),t.box(a,i,-u,a+.008,i+.2,0,oe),t.box(n-.008,i,-u,n,i+.2,0,oe);let r=(h,x)=>{let y=h<0?a:n,R=h<0?1:-1,P=Math.min(y,y+R*.014),H=Math.max(y,y+R*.014);t.box(P,i,x-.15,H,i+.78,x+.15,D);let O=Math.min(y,y+R*.02),S=Math.max(y,y+R*.02);t.box(O,i,x-.115,S,i+.74,x+.115,re),t.box(O,i+.36,x+(R>0?.07:-.09),S+.004,i+.38,x+(R>0?.09:-.07),kt)},m=(h,x,y,R)=>{let P=h<0?a:n,H=h<0?1:-1,O=Math.min(P,P+H*.012),S=Math.max(P,P+H*.012);t.box(O,.02,x-y/2,S,.02+R,x+y/2,kt);let I=Math.min(P,P+H*.016),C=Math.max(P,P+H*.016);t.box(I,.04,x-y/2+.02,C,R,x+y/2-.02,T(7306612,M.PLASTER))};for(let h of[-.85,-2.45,-4.05])r(-1,h);for(let h of[-1.65,-3.25])r(1,h);m(1,-.75,.32,.24),m(1,-2.45,.26,.2),m(1,-4.05,.22,.18),m(-1,-1.65,.28,.22),m(-1,-3.25,.24,.2);for(let h=-.25;h>-u;h-=.5)t.box(a,s-.035,h-.025,n,s,h+.025,We);for(let h of[-1.25,-2.85,-4.4])t.box(-.004,s-.16,h-.004,.004,s-.035,h+.004,T(3881011,M.PLAIN)),t.blob(0,s-.19,h,.032,.036,.032,T(16116946,M.PLAIN),{sub:1,lump:0});let f={x0:-.12,x1:.12,y0:i,y1:-.04},c=-u,b=(h,x,y,R,P)=>t.quad([h,x,c],[y,x,c],[y,R,c],[h,R,c],tt,P);b(a,i,f.x0,s,[1,1,1,1]),b(f.x1,i,n,s,[1,1,1,1]),b(f.x0,f.y1,f.x1,s,[1,0,1,0]),t.box(f.x0-.03,f.y0,c,f.x0,f.y1+.03,c+.01,D),t.box(f.x1,f.y0,c,f.x1+.03,f.y1+.03,c+.01,D),t.box(f.x0-.03,f.y1,c,f.x1+.03,f.y1+.03,c+.01,D),t.quad([-3,i,c],[3,i,c],[3,i,-14],[-3,i,-14],ze,[0,0,0,0]),t.quad([-.1,i+.002,c],[.1,i+.002,c],[.25,i+.002,-11],[-.25,i+.002,-11],Ve,[0,1,0,1]);for(let[h,x,y]of[[-.55,-7.8,1.1],[.62,-8.6,1.3],[-.15,-11.5,1.6],[.9,-12,1.2]])t.cyl(h,i,x,.035,i+y*.5,6,Ue,{r1:.025,caps:[!1,!1]}),t.blob(h,i+y*.62,x,y*.28,y*.26,y*.28,ne,{sub:2,seed:h*9}),t.blob(h+y*.12,i+y*.78,x,y*.2,y*.18,y*.2,ne,{sub:2,seed:x*3});t.box(-3,i,-14.2,3,i+.35,-14,T(13221284,M.STONE));let p=.06,v=-2.1,L=.31,E=T(4867392,M.CLOTH),w=T(14268832,M.PLAIN);t.cyl(p-.035*L*3,i,v,.028,i+.27,6,T(3091239,M.CLOTH),{r1:.026}),t.cyl(p+.035*L*3,i,v+.04,.028,i+.27,6,T(3091239,M.CLOTH),{r1:.026}),t.lathe(p,i+.24,v,[[.075,0],[.08,.12],[.075,.22],[.055,.26],[0,.27]],10,E,{edges:[1,0,0,0,0]}),t.blob(p,i+.555,v,.038,.045,.038,w,{sub:1,lump:.02}),t.blob(p,i+.585,v-.004,.05,.016,.05,T(3091239,M.PLAIN),{sub:1,lump:0}),t.cyl(p,i+.57,v,.03,i+.62,8,T(3091239,M.PLAIN))}function ie(t,e,o){let a=Ht(e),n=e.x0<0?"left":"right",i=n==="left"?"right":"left",s=e.x0<0?-1:1,u=n==="left"?e.x0:e.x1;t.quad(...a.floor,_e,[1,1,1,1]),t.quad(...a.ceil,It,[1,1,1,1]),t.quad(...a[n],tt,[1,1,1,1]),t.quad(...a[i],tt,[1,1,1,1]),t.quad(...a.far,tt,[1,1,1,1]);let l=Be(o),d=.075,r=-.03,m=-e.F+.03,f=E=>u-s*E,c=(E,w,h,x,y,R,P)=>t.box(Math.min(f(E),f(x)),w,Math.min(h,R),Math.max(f(E),f(x)),y,Math.max(h,R),P),b=[-.68,-.5,-.32,-.14,.04];for(let E of b)c(0,E,r,d,E+.012,m,Ft);c(0,e.y0,r,d,.18,r-.012,Ft),c(0,e.y0,m+.012,d,.18,m,Ft);for(let E=0;E<b.length;E++){let w=b[E]+.012,h=E<b.length-1?b[E+1]:.18,x=r-.015;for(;x>m+.04;){let y=.016+l()*.016,R=(h-w)*(.7+l()*.24),P=l()<.06,H=ae[Math.floor(l()*ae.length)];P||c(.006,w,x,d-.004-l()*.01,w+R,x-y,T(H,M.PLAIN)),x-=y+(l()<.08?.03:.002)}}let p=(u+a.far[n==="left"?1:0][0])/2,v=-e.F,L=.055;t.box(p-L-.012,-.36,v,p+L+.012,.12,v+.008,D),t.box(p-L,-.34,v,p+L,.1,v+.012,se),t.box(p-.004,-.34,v,p+.004,.1,v+.016,D),t.box(p-L,-.13,v,p+L,-.122,v+.016,D),t.box(p-.07,e.y0,v,p+.07,e.y0+.2,v+.12,re),t.cyl(p+.03,e.y0+.2,v+.06,.008,e.y0+.29,6,kt),t.lathe(p+.03,e.y0+.27,v+.06,[[.01,0],[.04,.02],[.03,.06],[0,.065]],8,T(6257242,M.PLAIN),{edges:[1,1,0,0]})}function le(t){t.push(q.S(1/F));let e=new ut(t);$e(e),je(e),ie(e,N[1],3),ie(e,N[2],8),t.pop();for(let o of[N[3],N[4]]){t.push(q.S(1/F));let a=new ut(t),n=Ht(o);for(let m of["left","right","ceil","floor","far"])a.quad(...n[m],m==="ceil"?It:tt,[1,1,1,1]);t.pop();let i=o.x0<0?o.x0:o.x1,s=o.x0<0?n.far[1][0]:n.far[0][0],u=(i+s)/2,l=(n.far[0][1]+o.y1)/2,d=Math.min(Math.abs(i-s),o.y1-n.far[0][1])*.36;t.push(q.chain(q.T(u,l,-o.F),q.RX(Math.PI/2),q.S(1/F)));let r=new ut(t);r.cyl(0,0,0,d*1.3,.006,24,D,{}),r.cyl(0,0,0,d,.009,24,se,{}),t.pop()}}function ce(t,e){let{x0:o,x1:a,y0:n,y1:i}=A;t.quad([o,n,0],[a,n,0],[a,i,0],[o,i,0],e);for(let s of N){let{near:u,far:l}=qt(s),d=m=>[m.x,m.y,m.z],r=[[u[0],u[1],l[1],l[0]],[u[3],l[3],l[2],u[2]],[u[0],l[0],l[3],u[3]],[u[1],u[2],l[2],l[1]],[l[0],l[1],l[2],l[3]]];for(let m of r)t.quad(...m.map(d),e)}}var fe=rt(Q(),1);var G=(t,e)=>new fe.Vector3(t,0,e);function Ge(){let t=[];for(let e of N){if(!(e.y0<0&&e.y1>0))continue;let o=ft(e),a=o.far[0].x,n=o.far[1].x,i=[G(e.x0,0),G(e.x1,0),G(n,-e.F),G(a,-e.F)];t.push({b:e,ghost:i,relief:i.map(ct)})}return t}var ht=Ge();function ue(t,e,o,a){let{sway:n,litho:i}=a,s="#1d1b18",u=i>.5?"#ece5d5":"#ebe7dd",l="#a23b2a",d=i>.5?"#d9d1c0":"#e7d3ae",r=-2.15,m=2.85,f=26,c=Math.min((o-f*2)/(m-r),(e-f*2)/2.3),b=e/2,p=f+-r*c+(o-f*2-(m-r)*c)/2,v=S=>[b+S.x*c,p+S.z*c],L=(S,I=!0)=>`${I?"italic ":""}${S}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;t.save(),t.fillStyle=u,t.fillRect(0,0,e,o);let E=-.3,w=-.045;t.save(),t.beginPath(),t.rect(0,p+E*c,e,(w-E)*c),t.clip(),t.strokeStyle="rgba(29,27,24,0.55)",t.lineWidth=1;for(let S=-o;S<e+o;S+=7)t.beginPath(),t.moveTo(S,p+E*c),t.lineTo(S+(w-E)*c,p+w*c),t.stroke();t.restore(),t.strokeStyle=s,t.lineWidth=1.4,t.beginPath(),t.moveTo(0,p+E*c),t.lineTo(e,p+E*c),t.moveTo(0,p+w*c),t.lineTo(e,p+w*c),t.stroke(),t.fillStyle=d,t.fillRect(b-.75*c,p-.045*c,1.5*c,.045*c),t.strokeRect(b-.75*c,p-.045*c,1.5*c,.045*c),t.setLineDash([6,4]),t.strokeStyle=l,t.lineWidth=1.3;for(let S of ht)t.beginPath(),S.ghost.forEach((I,C)=>{let[W,_]=v(I);C?t.lineTo(W,_):t.moveTo(W,_)}),t.closePath(),t.stroke();t.setLineDash([2,4]),t.strokeStyle="rgba(162,59,42,0.75)",t.lineWidth=1;for(let S of ht)for(let I of[S.ghost[2],S.ghost[3]]){let[C,W]=v(z),[_,J]=v(I);t.beginPath(),t.moveTo(C,W),t.lineTo(_,J),t.stroke()}t.setLineDash([]);for(let S of ht)t.beginPath(),S.relief.forEach((I,C)=>{let[W,_]=v(I);C?t.lineTo(W,_):t.moveTo(W,_)}),t.closePath(),t.fillStyle=d,t.fill(),t.strokeStyle=s,t.lineWidth=1.6,t.stroke();let h=G(n,V);t.strokeStyle="rgba(29,27,24,0.55)",t.lineWidth=1;for(let S of ht)for(let I of[S.relief[2],S.relief[3]]){let C=I.clone().sub(h),W=-h.z/C.z,_=h.clone().addScaledVector(C,W),[J,Et]=v(h),[Mt,Te]=v(_);t.beginPath(),t.moveTo(J,Et),t.lineTo(Mt,Te),t.stroke()}let x=(S,I,C,W)=>{let[_,J]=v(S);t.beginPath(),t.arc(_,J,I,0,Math.PI*2),C&&(t.fillStyle=C,t.fill()),W&&(t.strokeStyle=W,t.lineWidth=1.5,t.stroke())};x(z,4.5,l),x(h,7,null,s),x(h,2.2,s),t.fillStyle=s,t.font=L(Math.max(11,Math.round(c*.075))),t.textAlign="left";let y=(S,I,C=0,W=0,_="left",J=s)=>{let[Et,Mt]=v(I);t.fillStyle=J,t.textAlign=_,t.fillText(S,Et+C,Mt+W)};y("wall",G(-1.12,-.12),0,4),y("board",G(.78,0),4,-2);let R=ht.find(S=>S.b.name==="hall");y("relief: the real shape",R.relief[2],10,18),y("the hall as painted",G(.32,-1.6),0,0,"left",l),y("(it goes on to 5 m)",G(.32,-1.6),0,15,"left",l),y("rooms as painted",G(-1.1,-1.05),0,0,"left",l);let P=n>=0;y("design eye",z,P?-10:10,4,P?"right":"left",l),y("you",h,P?13:-13,4,P?"left":"right"),y("sight lines",z,0,26,"center","rgba(29,27,24,0.6)");let[H,O]=[f,o-f];t.strokeStyle=s,t.lineWidth=1.4,t.beginPath(),t.moveTo(H,O),t.lineTo(H+c,O),t.moveTo(H,O-4),t.lineTo(H,O+4),t.moveTo(H+c,O-4),t.lineTo(H+c,O+4),t.stroke(),t.fillStyle=s,t.textAlign="center",t.font=L(11),t.fillText("1 m",H+c/2,O-7),t.textAlign="left",t.font=L(12,!1),t.fillText("PLAN, CUT AT EYE LEVEL",f,f+4),t.restore()}var at=document.getElementById("scene"),U=new k.WebGLRenderer({canvas:at,antialias:!0});U.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var wt=new k.Color(15525333),Ke=new k.Color(14543085);U.setClearColor(wt,1);var it=St();it.uHatch={value:14};it.uLight.value.set(-.3,.55,.78).normalize();var me={...St(),uLitho:it.uLitho,uHatch:{value:5}};me.uLight.value.set(-.45,.7,.55).normalize();function bt(t,e,o){if(!t.includes(e))throw new Error(`shader patch failed: ${e}`);return t.replace(e,o)}var pe=1400,Xe=Math.round(pe*(A.y1-A.y0)/(A.x1-A.x0)),Ot=new k.WebGLRenderTarget(pe,Xe,{samples:4,generateMipmaps:!0,minFilter:k.LinearMipmapLinearFilter,magFilter:k.LinearFilter});Ot.texture.anisotropy=Math.min(8,U.capabilities.getMaxAnisotropy());var ve=new k.Scene;{let t=new st;le(t);let e=new k.Mesh(t.build(),vt(me));e.frustumCulled=!1,ve.add(e)}var Bt=new k.PerspectiveCamera(k.MathUtils.radToDeg(2*Math.atan((A.y1-A.y0)/2/V)),(A.x1-A.x0)/(A.y1-A.y0),.04,100);Bt.position.copy(z);Bt.lookAt(0,0,0);function Ye(){U.setRenderTarget(Ot),U.setClearColor(Ke.clone().lerp(wt,it.uLitho.value),1),U.clear(),U.render(ve,Bt),U.setRenderTarget(null),U.setClearColor(wt,1)}function Ze(t){let e=vt(t),o=e.vertexShader,a=e.fragmentShader;return o=bt(o,"varying vec3 vM;",`varying vec3 vM;
varying vec3 vW;`),o=bt(o,"gl_Position = projectionMatrix * viewMatrix * wp;",`vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;`),a=bt(a,"varying vec3 vM;",`varying vec3 vM;
varying vec3 vW;
uniform sampler2D uPaint;
uniform float uPaintAmt;
uniform vec3 uEye;
uniform vec4 uBoard;`),a=bt(a,"gl_FragColor = vec4(outc, uFade);",`
  vec2 q = uEye.xy + (vW.xy - uEye.xy) * (uEye.z / max(uEye.z - vW.z, 1e-3));
  vec2 puv = (q - uBoard.xy) / uBoard.zw;
  vec3 paint = texture2D(uPaint, puv).rgb;
  // real light on the real relief, kept gentle as in a gallery
  vec3 painted = paint * (0.82 + 0.22 * diff) * (1.0 - ink * 0.1);
  gl_FragColor = vec4(mix(outc, painted, uPaintAmt), uFade);`),e.vertexShader=o,e.fragmentShader=a,e.needsUpdate=!0,e}var xe={...it,uPaint:{value:Ot.texture},uPaintAmt:{value:1},uEye:{value:z.clone()},uBoard:{value:new k.Vector4(A.x0,A.y0,A.x1-A.x0,A.y1-A.y0)}},Nt=new k.Scene;{let t=new st;ce(t,T(15920868,M.PLAIN));let e=new k.Mesh(t.build(),Ze(xe));e.frustumCulled=!1,Nt.add(e)}var et=-1.6,Je=vt(it);{let t=new st,e=T(15854558,M.PLASTER),{x0:o,x1:a,y0:n,y1:i}=A;t.box(-6,et,-.3,6,1.3,-.045,e,{}),t.box(-6,et,-.045,6,et+.12,-.02,T(14537922,M.PLAIN),{}),t.box(-6,et-.1,-7,6,et,7,T(13810583,M.WOOD),{}),t.box(o,n,-.04,a,i,-.002,T(14275008,M.PLAIN),{skip:["pz"]});let s=.04,u=T(8020552,M.WOOD);t.box(o-s,n-s,-.045,a+s,n,.03,u,{}),t.box(o-s,i,-.045,a+s,i+s,.03,u,{}),t.box(o-s,n,-.045,o,i,.03,u,{}),t.box(a,n,-.045,a+s,i,.03,u,{}),t.box(a+.28,-.2,-.045,a+.5,-.06,-.035,T(16184040,M.PLAIN),{});for(let d=0;d<4;d++)t.box(a+.3,-.09-d*.025,-.035,a+.3+(d===0?.14:.18-d*.03),-.082-d*.025,-.033,T(5919562,M.PLAIN),{});t.box(-.8,et,3.6,.8,et+.42,4,T(9071178,M.WOOD),{});let l=new k.Mesh(t.build(),Je);l.frustumCulled=!1,Nt.add(l)}var mt=new k.PerspectiveCamera(50,30/38,.03,60),Z=.8,K={sway:0};function ye(){mt.position.set(K.sway,z.y,V),mt.lookAt(0,0,0)}var $=document.createElement("canvas");Object.assign($.style,{position:"absolute",left:"0",top:"0",width:"100%",height:"100%",opacity:"0",transition:"opacity 0.7s ease",pointerEvents:"none"});$.setAttribute("aria-hidden","true");document.getElementById("frame").appendChild($);var he=$.getContext("2d"),ot=1;jt(30/38,(t,e)=>{U.setSize(t,e),mt.aspect=t/e,mt.updateProjectionMatrix(),ot=Math.min(window.devicePixelRatio||1,2),$.width=Math.round(t*ot),$.height=Math.round(e*ot),ye()});var g={playing:!0,phase:0,manual:null,litho:1,lithoTarget:1,paint:1,paintTarget:1,top:0,topTarget:0,paintDirty:!0},ge=Math.PI*2/9;Gt();Kt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{g.lithoTarget=t},1);var nt=Yt(t=>{t&&g.manual!==null&&(g.phase=Math.asin(k.MathUtils.clamp(g.manual/Z,-1,1))/ge,g.manual=null),g.playing=t}),Dt=document.getElementById("btn-paint"),Wt=document.getElementById("btn-top");function be(t){g.paintTarget=t?1:0,Dt.setAttribute("aria-pressed",String(!t))}function we(t){g.topTarget=t?1:0,Wt.setAttribute("aria-pressed",String(t)),document.getElementById("hint").textContent=t?"Plan at eye level \xB7 red: the rooms as painted \xB7 grey lines: where the tops appear to you now":"Drag sideways to step left or right \xB7 the rooms seem to turn to follow you"}Dt.addEventListener("click",()=>be(g.paintTarget<.5));Wt.addEventListener("click",()=>we(g.topTarget<.5));Xt({" ":()=>nt(!g.playing),l:()=>document.getElementById(g.lithoTarget?"btn-colour":"btn-litho").click(),p:()=>Dt.click(),t:()=>Wt.click(),0:()=>{nt(!1),g.manual=0},ArrowLeft:()=>{nt(!1),g.manual=k.MathUtils.clamp((g.manual??K.sway)-.1,-Z*1.2,Z*1.2)},ArrowRight:()=>{nt(!1),g.manual=k.MathUtils.clamp((g.manual??K.sway)+.1,-Z*1.2,Z*1.2)}});var dt=null;at.addEventListener("pointerdown",t=>{at.setPointerCapture(t.pointerId),dt={x:t.clientX},nt(!1),g.manual=K.sway});at.addEventListener("pointermove",t=>{if(!dt)return;let e=t.clientX-dt.x;dt.x=t.clientX,g.manual=k.MathUtils.clamp(g.manual+e*.004,-Z*1.2,Z*1.2)});var Ee=()=>{dt=null};at.addEventListener("pointerup",Ee);at.addEventListener("pointercancel",Ee);at.addEventListener("dblclick",()=>{nt(!1),g.manual=0});var Ct=(t,e,o)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),o),de=performance.now();function Me(t){let e=Math.min(.05,Math.max(0,(t-de)/1e3));de=t,g.playing&&(g.phase+=e);let o=g.manual!==null?g.manual:Z*Math.sin(g.phase*ge);K.sway=g.manual!==null?Ct(K.sway,o,e*2.5):o,ye(),$.style.opacity=String(g.topTarget),(g.topTarget>0||$.style.opacity!=="0")&&(he.setTransform(ot,0,0,ot,0,0),ue(he,$.width/ot,$.height/ot,{sway:K.sway,litho:g.litho})),g.litho!==g.lithoTarget&&(g.litho=Ct(g.litho,g.lithoTarget,e*2.2),g.paintDirty=!0),it.uLitho.value=g.litho,g.paint=Ct(g.paint,g.paintTarget,e*1.6),xe.uPaintAmt.value=g.paint,g.paintDirty&&(Ye(),g.paintDirty=!1);let a=Math.abs(K.sway)<.03&&g.topTarget<.5&&g.paint>.99;Zt(a&&!g.noBadge,"Design point: from here the painting is exact"),U.setClearColor(wt,1),U.render(Nt,mt),requestAnimationFrame(Me)}Jt();requestAnimationFrame(Me);var pt=(t,e)=>{let o=document.getElementById(t);o&&(o.textContent=e)};pt("n-d",V.toFixed(1));pt("n-h",Math.round(yt*100));pt("n-hall",Math.round(At(N[0].F)*100));pt("n-hallF",N[0].F.toFixed(0));pt("n-room",Math.round(At(N[1].F)*100));window.__page={state:g,view:K,setSway(t){nt(!1),g.manual=t,K.sway=t},setTop(t){we(t),$.style.transition="none"},setPaint(t){be(t),g.paint=t?1:0},setLitho(t){document.getElementById(t?"btn-litho":"btn-colour").click(),g.litho=t?1:0,g.paintDirty=!0}};})();
