(()=>{var ye=Object.create;var Bt=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var we=Object.getPrototypeOf,Ee=Object.prototype.hasOwnProperty;var Me=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var Te=(t,e,o,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of be(e))!Ee.call(t,n)&&n!==o&&Bt(t,n,{get:()=>e[n],enumerable:!(a=ge(e,n))||a.enumerable});return t};var ot=(t,e,o)=>(o=t!=null?ye(we(t)):{},Te(e||!t||!t.__esModule?Bt(o,"default",{value:t,enumerable:!0}):o,t));var X=Me((Ge,Nt)=>{Nt.exports=window.THREE});var g=ot(X(),1);var I=ot(X(),1),Re=1e3,w={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Le(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function M(t,e=w.PLAIN,o={}){return{c:typeof t=="number"?Le(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var Dt=["px","nx","py","ny","pz","nz"];function U(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function yt(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function nt(t){return Math.hypot(t[0],t[1],t[2])}function W(t){let e=nt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function gt(t,e){let o=Math.abs(e[0]),a=Math.abs(e[1]),n=Math.abs(e[2]);return o>=a&&o>=n?[t[2],t[1]]:n>=a?[t[0],t[1]]:[t[0],t[2]]}var Y=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new I.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new I.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,a=e[0],n=e[1],r=e[2];return[o[0]*a+o[4]*n+o[8]*r+o[12],o[1]*a+o[5]*n+o[9]*r+o[13],o[2]*a+o[6]*n+o[10]*r+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,a=e[0],n=e[1],r=e[2];return W([o[0]*a+o[3]*n+o[6]*r,o[1]*a+o[4]*n+o[7]*r,o[2]*a+o[5]*n+o[8]*r])}tri(e,o,a,n,r=[1,1,1],s={}){let c=this._tp(e),l=this._tp(o),u=this._tp(a),i=W(yt(U(o,e),U(a,e))),h=s.uv||[gt(e,i),gt(o,i),gt(a,i)],f=W(yt(U(l,c),U(u,c))),p=s.n?s.n.map(T=>this._tn(T)):[f,f,f],b=nt(yt(U(l,c),U(u,c))),v=[b/(nt(U(u,l))||1),b/(nt(U(c,u))||1),b/(nt(U(l,c))||1)],y=s.k||[1,1,1],L=n.s||0,R=[c,l,u];for(let T=0;T<3;T++){let d=R[T];this.pos.push(d[0]+L,d[1]+L,d[2]+L),this.nrm.push(p[T][0],p[T][1],p[T][2]),this.col.push(n.c[0]*y[T],n.c[1]*y[T],n.c[2]*y[T]),this.uv.push(h[T][0],h[T][1]);for(let m=0;m<3;m++)r[m]?this.edg.push(T===m?v[m]:0):this.edg.push(Re);this.mat.push(n.p,n.f,n.w)}}quad(e,o,a,n,r,s=[1,1,1,1],c={}){let l=c.k||[1,1,1,1],u=c.n,i=c.uv;this.tri(e,o,a,r,[s[1],0,s[0]],{k:[l[0],l[1],l[2]],n:u&&[u[0],u[1],u[2]],uv:i&&[i[0],i[1],i[2]]}),this.tri(e,a,n,r,[s[2],s[3],0],{k:[l[0],l[2],l[3]],n:u&&[u[0],u[2],u[3]],uv:i&&[i[0],i[2],i[3]]})}box(e,o,a,n,r,s,c,l={}){e>n&&([e,n]=[n,e]),o>r&&([o,r]=[r,o]),a>s&&([a,s]=[s,a]);let u=new Set(l.open||[]),i=new Set(l.skip||[]);l.bottom||i.add("ny");let h=l.ao??1,f=l.aoTop??1,p={px:[0,n],nx:[0,e],py:[1,r],ny:[1,o],pz:[2,s],nz:[2,a]},b={px:[[n,o,s],[n,o,a],[n,r,a],[n,r,s]],nx:[[e,o,a],[e,o,s],[e,r,s],[e,r,a]],pz:[[e,o,s],[n,o,s],[n,r,s],[e,r,s]],nz:[[n,o,a],[e,o,a],[e,r,a],[n,r,a]],py:[[e,r,s],[n,r,s],[n,r,a],[e,r,a]],ny:[[e,o,a],[n,o,a],[n,o,s],[e,o,s]]};for(let v of Dt){if(i.has(v)||u.has(v))continue;let y=b[v],L=[];for(let d=0;d<4;d++){let m=y[d],E=y[(d+1)%4],S=1;for(let A of Dt){if(A===v)continue;let[P,B]=p[A];Math.abs(m[P]-B)<1e-9&&Math.abs(E[P]-B)<1e-9&&u.has(A)&&(S=0)}L.push(S)}let R;v==="py"||v==="ny"?R=[f,f,f,f]:R=[h,h,1,1];let T=v==="py"&&l.top?{...l.top,s:c.s}:c;this.quad(y[0],y[1],y[2],y[3],T,L,{k:R})}}cyl(e,o,a,n,r,s,c,l={}){let u=l.caps??[!0,!0],i=l.rim??[1,1],h=l.r1??n;for(let f=0;f<s;f++){let p=f/s*Math.PI*2,b=(f+1)/s*Math.PI*2,v=Math.cos(p),y=Math.sin(p),L=Math.cos(b),R=Math.sin(b),T=[e+n*v,o,a+n*y],d=[e+h*v,r,a+h*y],m=[e+h*L,r,a+h*R],E=[e+n*L,o,a+n*R],S=(n-h)/Math.max(1e-6,r-o),A=W([v,S,y]),P=W([L,S,R]),B=p*(n+h)/2,z=b*(n+h)/2;this.quad(T,d,m,E,c,[0,i[1],0,i[0]],{n:[A,A,P,P],uv:[[B,o],[B,r],[z,r],[z,o]],k:l.k}),u[1]&&h>0&&this.tri([e,r,a],m,d,c,[1,0,0]),u[0]&&this.tri([e,o,a],T,E,c,[1,0,0])}}lathe(e,o,a,n,r,s,c={}){let l=n.length,u=[];for(let f=0;f<l-1;f++){let p=n[f+1][0]-n[f][0],b=n[f+1][1]-n[f][1];u.push(W([b,-p,0]))}let i=n.map((f,p)=>{let b=u[Math.max(0,p-1)],v=u[Math.min(l-2,p)];return W([b[0]+v[0],b[1]+v[1],0])}),h=c.edges||[];for(let f=0;f<r;f++){let p=f/r*Math.PI*2,b=(f+1)/r*Math.PI*2,v=Math.cos(p),y=Math.sin(p),L=Math.cos(b),R=Math.sin(b);for(let T=0;T<l-1;T++){let[d,m]=n[T],[E,S]=n[T+1],A=[e+d*v,o+m,a+d*y],P=[e+E*v,o+S,a+E*y],B=[e+E*L,o+S,a+E*R],z=[e+d*L,o+m,a+d*R],$=c.flat?u[T]:i[T],j=c.flat?u[T]:i[T+1];this.quad(A,P,B,z,s,[0,h[T+1]?1:0,0,h[T]?1:0],{n:[[$[0]*v,$[1],$[0]*y],[j[0]*v,j[1],j[0]*y],[j[0]*L,j[1],j[0]*R],[$[0]*L,$[1],$[0]*R]],uv:[[p*1.2,m],[p*1.2,S],[b*1.2,S],[b*1.2,m]]})}}}poly(e,o,a={}){for(let n=1;n<e.length-1;n++)this.tri(e[0],e[n],e[n+1],o,[1,n===e.length-2?1:0,n===1?1:0],a)}blob(e,o,a,n,r,s,c,l={}){let u=l.sub??1,i=l.seed??0,h=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let b=0;b<u;b++){let v=[];for(let[y,L,R]of h){let T=W([(y[0]+L[0])/2,(y[1]+L[1])/2,(y[2]+L[2])/2]),d=W([(L[0]+R[0])/2,(L[1]+R[1])/2,(L[2]+R[2])/2]),m=W([(R[0]+y[0])/2,(R[1]+y[1])/2,(R[2]+y[2])/2]);v.push([y,T,m],[T,L,d],[m,d,R],[T,d,m])}h=v}let f=b=>1+(l.lump??.12)*Math.sin(b[0]*5.1+i)*Math.sin(b[1]*4.3+i*1.7)*Math.sin(b[2]*3.7+i*.3),p=b=>{let v=f(b);return[e+b[0]*n*v,o+b[1]*r*v,a+b[2]*s*v]};for(let[b,v,y]of h)this.tri(p(b),p(v),p(y),c,[0,0,0],{n:[b,v,y],k:l.k})}build(){let e=new I.BufferGeometry;return e.setAttribute("position",new I.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new I.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new I.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new I.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new I.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new I.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},Z={T:(t,e,o)=>new I.Matrix4().makeTranslation(t,e,o),RX:t=>new I.Matrix4().makeRotationX(t),RY:t=>new I.Matrix4().makeRotationY(t),RZ:t=>new I.Matrix4().makeRotationZ(t),S:(t,e,o)=>new I.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new I.Matrix4)};var G=ot(X(),1);function bt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new G.Vector3(.1,.9,.66).normalize()},uPaper:{value:new G.Vector3(.925,.898,.835)},uInk:{value:new G.Vector3(.11,.1,.09)},uHaze:{value:new G.Vector3(.83,.86,.84)},uFade:{value:1}}}var wt=`
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
`,Et=`
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
`,He=`
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
`,Se=`
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
${wt}
${Et}

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
`;function Wt(t,e={}){return new G.ShaderMaterial({uniforms:t,vertexShader:He,fragmentShader:Se,transparent:!!e.transparent,side:e.side??G.FrontSide})}var je=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${wt}
${Et}
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
`;var Ke=`
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
${wt}
${Et}
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
`;var Ye=ot(X(),1);function _t(t,e,o){if(!t.includes(e))throw new Error(`ink shader patch failed: ${e}`);return t.replace(e,o)}function ut(t,e={}){t.uHatch||(t.uHatch={value:1});let o=Wt(t,e),a=o.fragmentShader;return a=_t(a,"uniform float uFade;",`uniform float uFade;
uniform float uHatch;`),a=_t(a,"vec3 outc = finish(col, vM.y, ink, uv, fw, face);","vec3 outc = finish(col, vM.y, ink, uv * uHatch, fw * uHatch, face);"),o.fragmentShader=a,o.needsUpdate=!0,o}function Vt(t,e){let o=document.getElementById("frame"),a=()=>{let r=(window.innerWidth<640?10:28)+13,s=document.getElementById("masthead"),c=document.getElementById("controls"),l=(s?s.offsetHeight:0)+6+13,u=(c?c.offsetHeight:0)+8+13,i=window.innerWidth-r*2,h=window.innerHeight-l-u,f=h,p=f*t;p>i&&(p=i,f=p/t),p=Math.max(160,Math.floor(p)),f=Math.max(120,Math.floor(f)),o.style.width=`${p}px`,o.style.height=`${f}px`,o.style.top=`${l+Math.max(0,(h-f)/2)}px`,e?.(p,f)};return window.addEventListener("resize",a),a(),a}function zt(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let a=n=>{n?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(n))};e?.addEventListener("click",()=>a(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function Ut(t,e,o){let a=n=>{for(let[r,s]of t)r.setAttribute("aria-pressed",String(s===n));e(n)};for(let[n,r]of t)n.addEventListener("click",()=>a(r));return o!==void 0&&a(o),a}function Gt(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function $t(t,e=!0){let o=document.getElementById("btn-play"),a=n=>{e=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),t(n)};return o?.addEventListener("click",()=>a(!e)),a(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function jt(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function Kt(){document.body.classList.add("ready")}var pt=ot(X(),1),D=2.4,_=new pt.Vector3(0,0,D),dt=.45,Xt=-dt/(D-dt),H={x0:-.75,x1:.75,y0:-.95,y1:.95};function Mt(t){let e=(D-t.z)/D,o=e/(Xt+(1-Xt)*e);return _.clone().add(t.clone().sub(_).multiplyScalar(o/e))}function Tt(t){return Mt(new pt.Vector3(0,0,-t)).z}var O=[{name:"hall",x0:-.29,x1:.29,y0:-.7,y1:.48,F:5,hidden:[]},{name:"roomL",x0:-.7,x1:-.38,y0:-.7,y1:.2,F:.95,hidden:["x1"]},{name:"roomR",x0:.38,x1:.7,y0:-.7,y1:.2,F:.95,hidden:["x0"]},{name:"nicheL",x0:-.66,x1:-.44,y0:.36,y1:.66,F:.4,hidden:["x1","y0"]},{name:"nicheR",x0:.44,x1:.66,y0:.36,y1:.66,F:.4,hidden:["x0","y0"]}];function ht(t,e){let o=t[e];if(!t.hidden.includes(e))return o;let a=e[0]==="x"?_.x:_.y;return a+(o-a)*((D+t.F)/D)}function at(t){let e=ht(t,"x0"),o=ht(t,"x1"),a=ht(t,"y0"),n=ht(t,"y1"),r=(s,c,l)=>new pt.Vector3(s,c,l);return{near:[r(t.x0,t.y0,0),r(t.x1,t.y0,0),r(t.x1,t.y1,0),r(t.x0,t.y1,0)],far:[r(e,a,-t.F),r(o,a,-t.F),r(o,n,-t.F),r(e,n,-t.F)]}}function Rt(t){let e=at(t);return{near:e.near.map(Mt),far:e.far.map(Mt)}}var F=5,rt=class{constructor(e){this.b=e}s(e){return[e[0]*F,e[1]*F,e[2]*F]}box(e,o,a,n,r,s,c,l={}){this.b.box(e*F,o*F,a*F,n*F,r*F,s*F,c,l)}quad(e,o,a,n,r,s,c){this.b.quad(this.s(e),this.s(o),this.s(a),this.s(n),r,s,c)}blob(e,o,a,n,r,s,c,l){this.b.blob(e*F,o*F,a*F,n*F,r*F,s*F,c,l)}cyl(e,o,a,n,r,s,c,l={}){this.b.cyl(e*F,o*F,a*F,n*F,r*F,s,c,{...l,r1:l.r1===void 0?void 0:l.r1*F})}lathe(e,o,a,n,r,s,c){this.b.lathe(e*F,o*F,a*F,n.map(([l,u])=>[l*F,u*F]),r,s,c)}};function Fe(t){let e=t>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function St(t){let{near:e,far:o}=at(t),a=n=>[n.x,n.y,n.z];return{floor:[e[0],e[1],o[1],o[0]].map(a),ceil:[e[3],o[3],o[2],e[2]].map(a),left:[e[0],o[0],o[3],e[3]].map(a),right:[e[1],e[2],o[2],o[1]].map(a),far:[o[0],o[1],o[2],o[3]].map(a)}}var Yt=M(14471352,w.ASHLAR),k=M(15393489,w.PLAIN),Zt=M(12562839,w.STONE),J=M(15326402,w.PLASTER),Ft=M(15854042,w.PLASTER),Ae=M(15788506,w.PLAIN),Pe=M(6248012,w.PLAIN),Jt=M(9662799,w.WOOD),ee=M(6966325,w.WOOD),Ie=M(9202507,w.WOOD),ke=M(12096873,w.WOOD),Lt=M(8216387,w.WOOD),oe=M(15003120,w.PLAIN),Ht=M(13150056,w.PLAIN),Oe=M(10991746,w.GRASS),Ce=M(14537403,w.SOIL),Qt=M(9348460,w.FOLIAGE),Be=M(8021328,w.WOOD),qt=[9190190,3099502,6122298,11569726,7028060,4538426,13218954,10115637,4153178];function Ne(t){let o=new Set([H.x0-.06,H.x1+.06]),a=new Set([H.y0-.06,H.y1+.06]);for(let i of O)o.add(i.x0),o.add(i.x1),a.add(i.y0),a.add(i.y1);let n=[...o].sort((i,h)=>i-h),r=[...a].sort((i,h)=>i-h),s=(i,h)=>O.some(f=>i>f.x0&&i<f.x1&&h>f.y0&&h<f.y1);for(let i=0;i<n.length-1;i++)for(let h=0;h<r.length-1;h++){let f=(n[i]+n[i+1])/2,p=(r[h]+r[h+1])/2;if(s(f,p))continue;let b=[s(f,r[h]-1e-4)?1:0,s(n[i+1]+1e-4,p)?1:0,s(f,r[h+1]+1e-4)?1:0,s(n[i]-1e-4,p)?1:0];t.quad([n[i],r[h],0],[n[i+1],r[h],0],[n[i+1],r[h+1],0],[n[i],r[h+1],0],Yt,b)}let c=.035,l=.014;for(let i of O)t.box(i.x0-c,i.y1,0,i.x1+c,i.y1+c,l,k),t.box(i.x0-c,i.y0,0,i.x0,i.y1,l,k),t.box(i.x1,i.y0,0,i.x1+c,i.y1,l,k),i.name.startsWith("niche")&&t.box(i.x0-c-.01,i.y0-.03,0,i.x1+c+.01,i.y0,.035,k);let u=O[0];t.box(u.x0-.07,u.y1+c,0,u.x1+.07,u.y1+.1,.022,k),t.box(-.035,u.y1,0,.035,u.y1+.12,.032,Yt);for(let i of[-1,1])t.box(i>0?.3:-.37,-.76,0,i>0?.37:-.3,.8,.012,k);t.box(H.x0-.1,.8,0,H.x1+.1,.86,.03,k),t.box(H.x0-.1,.86,0,H.x1+.1,.875,.045,k);for(let i=H.x0-.05;i<H.x1+.05;i+=.045)t.box(i,.775,0,i+.022,.8,.018,k);t.box(H.x0-.1,-1.05,0,H.x1+.1,-.76,.014,Zt),t.box(u.x0-.05,-.76,0,u.x1+.05,-.7,.07,Zt),t.box(-.28,.88,0,.28,.98,.012,k)}function De(t){let e=O[0],o=St(e),{x0:a,x1:n,y0:r,y1:s}=e,c=e.F,l=4,u=34;for(let d=0;d<l;d++)for(let m=0;m<u;m++){let E=a+(n-a)*d/l,S=a+(n-a)*(d+1)/l,A=-c*m/u,P=-c*(m+1)/u;t.quad([E,r,A],[S,r,A],[S,r,P],[E,r,P],(d+m)%2?Ae:Pe,[0,0,0,0])}t.quad(...o.left,J,[1,1,1,1]),t.quad(...o.right,J,[1,1,1,1]),t.quad(...o.ceil,Ft,[1,1,1,1]),t.box(a,r,-c,a+.008,r+.2,0,Jt),t.box(n-.008,r,-c,n,r+.2,0,Jt);let i=(d,m)=>{let E=d<0?a:n,S=d<0?1:-1,A=Math.min(E,E+S*.014),P=Math.max(E,E+S*.014);t.box(A,r,m-.15,P,r+.78,m+.15,k);let B=Math.min(E,E+S*.02),z=Math.max(E,E+S*.02);t.box(B,r,m-.115,z,r+.74,m+.115,ee),t.box(B,r+.36,m+(S>0?.07:-.09),z+.004,r+.38,m+(S>0?.09:-.07),Ht)},h=(d,m,E,S)=>{let A=d<0?a:n,P=d<0?1:-1,B=Math.min(A,A+P*.012),z=Math.max(A,A+P*.012);t.box(B,.02,m-E/2,z,.02+S,m+E/2,Ht);let $=Math.min(A,A+P*.016),j=Math.max(A,A+P*.016);t.box($,.04,m-E/2+.02,j,S,m+E/2-.02,M(7306612,w.PLASTER))};for(let d of[-.85,-2.45,-4.05])i(-1,d);for(let d of[-1.65,-3.25])i(1,d);h(1,-.75,.32,.24),h(1,-2.45,.26,.2),h(1,-4.05,.22,.18),h(-1,-1.65,.28,.22),h(-1,-3.25,.24,.2);for(let d=-.25;d>-c;d-=.5)t.box(a,s-.035,d-.025,n,s,d+.025,Ie);for(let d of[-1.25,-2.85,-4.4])t.box(-.004,s-.16,d-.004,.004,s-.035,d+.004,M(3881011,w.PLAIN)),t.blob(0,s-.19,d,.032,.036,.032,M(16116946,w.PLAIN),{sub:1,lump:0});let f={x0:-.12,x1:.12,y0:r,y1:-.04},p=-c,b=(d,m,E,S,A)=>t.quad([d,m,p],[E,m,p],[E,S,p],[d,S,p],J,A);b(a,r,f.x0,s,[1,1,1,1]),b(f.x1,r,n,s,[1,1,1,1]),b(f.x0,f.y1,f.x1,s,[1,0,1,0]),t.box(f.x0-.03,f.y0,p,f.x0,f.y1+.03,p+.01,k),t.box(f.x1,f.y0,p,f.x1+.03,f.y1+.03,p+.01,k),t.box(f.x0-.03,f.y1,p,f.x1+.03,f.y1+.03,p+.01,k),t.quad([-3,r,p],[3,r,p],[3,r,-14],[-3,r,-14],Oe,[0,0,0,0]),t.quad([-.1,r+.002,p],[.1,r+.002,p],[.25,r+.002,-11],[-.25,r+.002,-11],Ce,[0,1,0,1]);for(let[d,m,E]of[[-.55,-7.8,1.1],[.62,-8.6,1.3],[-.15,-11.5,1.6],[.9,-12,1.2]])t.cyl(d,r,m,.035,r+E*.5,6,Be,{r1:.025,caps:[!1,!1]}),t.blob(d,r+E*.62,m,E*.28,E*.26,E*.28,Qt,{sub:2,seed:d*9}),t.blob(d+E*.12,r+E*.78,m,E*.2,E*.18,E*.2,Qt,{sub:2,seed:m*3});t.box(-3,r,-14.2,3,r+.35,-14,M(13221284,w.STONE));let v=.06,y=-2.1,L=.31,R=M(4867392,w.CLOTH),T=M(14268832,w.PLAIN);t.cyl(v-.035*L*3,r,y,.028,r+.27,6,M(3091239,w.CLOTH),{r1:.026}),t.cyl(v+.035*L*3,r,y+.04,.028,r+.27,6,M(3091239,w.CLOTH),{r1:.026}),t.lathe(v,r+.24,y,[[.075,0],[.08,.12],[.075,.22],[.055,.26],[0,.27]],10,R,{edges:[1,0,0,0,0]}),t.blob(v,r+.555,y,.038,.045,.038,T,{sub:1,lump:.02}),t.blob(v,r+.585,y-.004,.05,.016,.05,M(3091239,w.PLAIN),{sub:1,lump:0}),t.cyl(v,r+.57,y,.03,r+.62,8,M(3091239,w.PLAIN))}function te(t,e,o){let a=St(e),n=e.x0<0?"left":"right",r=n==="left"?"right":"left",s=e.x0<0?-1:1,c=n==="left"?e.x0:e.x1;t.quad(...a.floor,ke,[1,1,1,1]),t.quad(...a.ceil,Ft,[1,1,1,1]),t.quad(...a[n],J,[1,1,1,1]),t.quad(...a[r],J,[1,1,1,1]),t.quad(...a.far,J,[1,1,1,1]);let l=Fe(o),u=.075,i=-.03,h=-e.F+.03,f=R=>c-s*R,p=(R,T,d,m,E,S,A)=>t.box(Math.min(f(R),f(m)),T,Math.min(d,S),Math.max(f(R),f(m)),E,Math.max(d,S),A),b=[-.68,-.5,-.32,-.14,.04];for(let R of b)p(0,R,i,u,R+.012,h,Lt);p(0,e.y0,i,u,.18,i-.012,Lt),p(0,e.y0,h+.012,u,.18,h,Lt);for(let R=0;R<b.length;R++){let T=b[R]+.012,d=R<b.length-1?b[R+1]:.18,m=i-.015;for(;m>h+.04;){let E=.016+l()*.016,S=(d-T)*(.7+l()*.24),A=l()<.06,P=qt[Math.floor(l()*qt.length)];A||p(.006,T,m,u-.004-l()*.01,T+S,m-E,M(P,w.PLAIN)),m-=E+(l()<.08?.03:.002)}}let v=(c+a.far[n==="left"?1:0][0])/2,y=-e.F,L=.055;t.box(v-L-.012,-.36,y,v+L+.012,.12,y+.008,k),t.box(v-L,-.34,y,v+L,.1,y+.012,oe),t.box(v-.004,-.34,y,v+.004,.1,y+.016,k),t.box(v-L,-.13,y,v+L,-.122,y+.016,k),t.box(v-.07,e.y0,y,v+.07,e.y0+.2,y+.12,ee),t.cyl(v+.03,e.y0+.2,y+.06,.008,e.y0+.29,6,Ht),t.lathe(v+.03,e.y0+.27,y+.06,[[.01,0],[.04,.02],[.03,.06],[0,.065]],8,M(6257242,w.PLAIN),{edges:[1,1,0,0]})}function ne(t){t.push(Z.S(1/F));let e=new rt(t);Ne(e),De(e),te(e,O[1],3),te(e,O[2],8),t.pop();for(let o of[O[3],O[4]]){t.push(Z.S(1/F));let a=new rt(t),n=St(o);for(let h of["left","right","ceil","floor","far"])a.quad(...n[h],h==="ceil"?Ft:J,[1,1,1,1]);t.pop();let r=o.x0<0?o.x0:o.x1,s=o.x0<0?n.far[1][0]:n.far[0][0],c=(r+s)/2,l=(n.far[0][1]+o.y1)/2,u=Math.min(Math.abs(r-s),o.y1-n.far[0][1])*.36;t.push(Z.chain(Z.T(c,l,-o.F),Z.RX(Math.PI/2),Z.S(1/F)));let i=new rt(t);i.cyl(0,0,0,u*1.3,.006,24,k,{}),i.cyl(0,0,0,u,.009,24,oe,{}),t.pop()}}var n0=ot(X(),1);function ae(t,e){let{x0:o,x1:a,y0:n,y1:r}=H;t.quad([o,n,0],[a,n,0],[a,r,0],[o,r,0],e);for(let s of O){let{near:c,far:l}=Rt(s),u=h=>[h.x,h.y,h.z],i=[[c[0],c[1],l[1],l[0]],[c[3],l[3],l[2],c[2]],[c[0],l[0],l[3],c[3]],[c[1],c[2],l[2],l[1]],[l[0],l[1],l[2],l[3]]];for(let h of i)t.quad(...h.map(u),e)}}function re(t){let e=[],o=[];for(let a of O){let n=at(a),r=Rt(a);for(let s=0;s<4;s++)e.push([n.far[s],n.far[(s+1)%4]]),e.push([n.near[s],n.far[s]]),o.push([t.clone(),n.far[s]])}return{ghost:e,sight:o}}var tt=document.getElementById("scene"),N=new g.WebGLRenderer({canvas:tt,antialias:!0});N.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var vt=new g.Color(15525333),We=new g.Color(14543085);N.setClearColor(vt,1);var et=bt();et.uHatch={value:14};et.uLight.value.set(-.38,.72,.58).normalize();var se={...bt(),uLitho:et.uLitho,uHatch:{value:5}};se.uLight.value.set(-.45,.7,.55).normalize();function mt(t,e,o){if(!t.includes(e))throw new Error(`shader patch failed: ${e}`);return t.replace(e,o)}var le=1024,_e=Math.round(le*(H.y1-H.y0)/(H.x1-H.x0)),It=new g.WebGLRenderTarget(le,_e,{samples:4,generateMipmaps:!0,minFilter:g.LinearMipmapLinearFilter,magFilter:g.LinearFilter});It.texture.anisotropy=Math.min(8,N.capabilities.getMaxAnisotropy());var ce=new g.Scene;{let t=new Y;ne(t);let e=new g.Mesh(t.build(),ut(se));e.frustumCulled=!1,ce.add(e)}var kt=new g.PerspectiveCamera(g.MathUtils.radToDeg(2*Math.atan((H.y1-H.y0)/2/D)),(H.x1-H.x0)/(H.y1-H.y0),.04,100);kt.position.copy(_);kt.lookAt(0,0,0);function Ve(){N.setRenderTarget(It),N.setClearColor(We.clone().lerp(vt,et.uLitho.value),1),N.clear(),N.render(ce,kt),N.setRenderTarget(null),N.setClearColor(vt,1)}function ze(t){let e=ut(t),o=e.vertexShader,a=e.fragmentShader;return o=mt(o,"varying vec3 vM;",`varying vec3 vM;
varying vec3 vW;`),o=mt(o,"gl_Position = projectionMatrix * viewMatrix * wp;",`vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;`),a=mt(a,"varying vec3 vM;",`varying vec3 vM;
varying vec3 vW;
uniform sampler2D uPaint;
uniform float uPaintAmt;
uniform vec3 uEye;
uniform vec4 uBoard;`),a=mt(a,"gl_FragColor = vec4(outc, uFade);",`
  vec2 q = uEye.xy + (vW.xy - uEye.xy) * (uEye.z / max(uEye.z - vW.z, 1e-3));
  vec2 puv = (q - uBoard.xy) / uBoard.zw;
  vec3 paint = texture2D(uPaint, puv).rgb;
  // real light on the real relief, kept gentle as in a gallery
  vec3 painted = paint * (0.82 + 0.22 * diff) * (1.0 - ink * 0.1);
  gl_FragColor = vec4(mix(outc, painted, uPaintAmt), uFade);`),e.vertexShader=o,e.fragmentShader=a,e.needsUpdate=!0,e}var fe={...et,uPaint:{value:It.texture},uPaintAmt:{value:1},uEye:{value:_.clone()},uBoard:{value:new g.Vector4(H.x0,H.y0,H.x1-H.x0,H.y1-H.y0)}},ct=new g.Scene;{let t=new Y;ae(t,M(15920868,w.PLAIN));let e=new g.Mesh(t.build(),ze(fe));e.frustumCulled=!1,ct.add(e)}var V=-1.6,ue=ut(et);{let t=new Y,e=M(15262162,w.PLASTER),{x0:o,x1:a,y0:n,y1:r}=H;t.box(-6,V-.1,-.5,6,4,-.045,e,{}),t.box(-6,V,-.045,6,V+.12,-.02,M(13616560,w.PLAIN),{}),t.box(-6,V-.1,-.045,6,V,7,M(13085571,w.WOOD),{}),t.box(o,n,-.04,a,r,-.002,M(14275008,w.PLAIN),{skip:["pz"]});let s=.04,c=M(8020552,w.WOOD);t.box(o-s,n-s,-.045,a+s,n,.03,c,{}),t.box(o-s,r,-.045,a+s,r+s,.03,c,{}),t.box(o-s,n,-.045,o,r,.03,c,{}),t.box(a,n,-.045,a+s,r,.03,c,{}),t.box(a+.28,-.2,-.045,a+.5,-.06,-.035,M(16184040,w.PLAIN),{});for(let u=0;u<4;u++)t.box(a+.3,-.09-u*.025,-.035,a+.3+(u===0?.14:.18-u*.03),-.082-u*.025,-.033,M(5919562,w.PLAIN),{});t.box(-.8,V,3.6,.8,V+.42,4,M(9071178,w.WOOD),{});let l=new g.Mesh(t.build(),ue);l.frustumCulled=!1,ct.add(l)}var it=new g.Group,Pt=[];{let{ghost:t,sight:e}=re(_),o=new g.LineDashedMaterial({color:10631978,dashSize:.05,gapSize:.035,transparent:!0,opacity:0,depthTest:!1}),a=new g.LineDashedMaterial({color:8219221,dashSize:.03,gapSize:.04,transparent:!0,opacity:0,depthTest:!1});Pt.push([o,.95],[a,.7]);for(let[s,c]of[[t,o],[e,a]])for(let[l,u]of s){let i=new g.Line(new g.BufferGeometry().setFromPoints([l,u]),c);i.computeLineDistances(),i.renderOrder=30,it.add(i)}let n=new g.MeshBasicMaterial({color:10631978,transparent:!0,opacity:0,depthTest:!1});Pt.push([n,1]);let r=new g.Mesh(new g.SphereGeometry(.035,16,10),n);r.position.copy(_),r.renderOrder=31,it.add(r),it.visible=!1,ct.add(it)}var st=new g.Group;{let t=new Y,e=M(5591114,w.CLOTH);t.cyl(0,V,0,.16,V+.85,10,M(4078133,w.CLOTH),{r1:.14}),t.cyl(0,V+.85,0,.19,-.14,10,e,{r1:.15}),t.blob(0,-.05,0,.1,.12,.1,M(14203036,w.PLAIN),{sub:1}),t.blob(0,.03,.02,.105,.07,.1,M(3813159,w.PLAIN),{sub:1});let o=new g.Mesh(t.build(),ue);o.frustumCulled=!1,st.add(o),st.visible=!1,ct.add(st)}var Q=new g.PerspectiveCamera(50,30/38,.03,60),At={pos:new g.Vector3(2.15,3.15,3.55),target:new g.Vector3(-.05,-.35,-.2),fov:50},K=.8,C={sway:0,top:0};function he(){let t=C.top<.5?4*C.top**3:1-(-2*C.top+2)**3/2,e=new g.Vector3(C.sway,_.y,D);Q.position.copy(e).lerp(At.pos,t);let o=new g.Vector3(0,0,0).lerp(At.target,t);Q.up.set(0,1,0),Q.lookAt(o),Q.fov=50+(At.fov-50)*t,Q.updateProjectionMatrix(),st.position.set(C.sway,0,D+.02),st.visible=t>.02,it.visible=t>.02;for(let[a,n]of Pt)a.opacity=n*Math.max(0,(t-.3)/.7)}Vt(30/38,(t,e)=>{N.setSize(t,e),Q.aspect=t/e,he()});var x={playing:!0,phase:0,manual:null,litho:1,lithoTarget:1,paint:1,paintTarget:1,top:0,topTarget:0,paintDirty:!0},de=Math.PI*2/9;zt();Ut([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{x.lithoTarget=t},1);var q=$t(t=>{t&&x.manual!==null&&(x.phase=Math.asin(g.MathUtils.clamp(x.manual/K,-1,1))/de,x.manual=null),x.playing=t}),Ot=document.getElementById("btn-paint"),Ct=document.getElementById("btn-top");function pe(t){x.paintTarget=t?1:0,Ot.setAttribute("aria-pressed",String(!t))}function me(t){x.topTarget=t?1:0,Ct.setAttribute("aria-pressed",String(t)),document.getElementById("hint").textContent=t?"Red: the rooms as painted, behind the board \xB7 dotted: sight lines from the design eye":"Drag sideways to step left or right \xB7 the rooms seem to turn to follow you"}Ot.addEventListener("click",()=>pe(x.paintTarget<.5));Ct.addEventListener("click",()=>me(x.topTarget<.5));Gt({" ":()=>q(!x.playing),l:()=>document.getElementById(x.lithoTarget?"btn-colour":"btn-litho").click(),p:()=>Ot.click(),t:()=>Ct.click(),0:()=>{q(!1),x.manual=0},ArrowLeft:()=>{q(!1),x.manual=g.MathUtils.clamp((x.manual??C.sway)-.1,-K*1.2,K*1.2)},ArrowRight:()=>{q(!1),x.manual=g.MathUtils.clamp((x.manual??C.sway)+.1,-K*1.2,K*1.2)}});var lt=null;tt.addEventListener("pointerdown",t=>{tt.setPointerCapture(t.pointerId),lt={x:t.clientX},q(!1),x.manual=C.sway});tt.addEventListener("pointermove",t=>{if(!lt)return;let e=t.clientX-lt.x;lt.x=t.clientX,x.manual=g.MathUtils.clamp(x.manual+e*.004,-K*1.2,K*1.2)});var xe=()=>{lt=null};tt.addEventListener("pointerup",xe);tt.addEventListener("pointercancel",xe);tt.addEventListener("dblclick",()=>{q(!1),x.manual=0});var xt=(t,e,o)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),o),ie=performance.now();function ve(t){let e=Math.min(.05,Math.max(0,(t-ie)/1e3));ie=t,x.playing&&(x.phase+=e);let o=x.manual!==null?x.manual:K*Math.sin(x.phase*de);C.sway=x.manual!==null?xt(C.sway,o,e*2.5):o,x.top=xt(x.top,x.topTarget,e/1.8),C.top=x.top,he(),x.litho!==x.lithoTarget&&(x.litho=xt(x.litho,x.lithoTarget,e*2.2),x.paintDirty=!0),et.uLitho.value=x.litho,x.paint=xt(x.paint,x.paintTarget,e*1.6),fe.uPaintAmt.value=x.paint,x.paintDirty&&(Ve(),x.paintDirty=!1);let a=Math.abs(C.sway)<.03&&x.top<.01&&x.paint>.99;jt(a&&!x.noBadge,"Design point: from here the painting is exact"),N.setClearColor(vt,1),N.render(ct,Q),requestAnimationFrame(ve)}Kt();requestAnimationFrame(ve);var ft=(t,e)=>{let o=document.getElementById(t);o&&(o.textContent=e)};ft("n-d",D.toFixed(1));ft("n-h",Math.round(dt*100));ft("n-hall",Math.round(Tt(O[0].F)*100));ft("n-hallF",O[0].F.toFixed(0));ft("n-room",Math.round(Tt(O[1].F)*100));window.__page={state:x,view:C,setSway(t){q(!1),x.manual=t,C.sway=t},setTop(t){me(t),x.top=t?1:0},setPaint(t){pe(t),x.paint=t?1:0},setLitho(t){document.getElementById(t?"btn-litho":"btn-colour").click(),x.litho=t?1:0,x.paintDirty=!0}};})();
