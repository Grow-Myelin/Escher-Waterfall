(()=>{var Oe=Object.create;var jt=Object.defineProperty;var ze=Object.getOwnPropertyDescriptor;var qe=Object.getOwnPropertyNames;var We=Object.getPrototypeOf,Ve=Object.prototype.hasOwnProperty;var De=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var Ge=(t,e,o,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of qe(e))!Ve.call(t,n)&&n!==o&&jt(t,n,{get:()=>e[n],enumerable:!(a=ze(e,n))||a.enumerable});return t};var j=(t,e,o)=>(o=t!=null?Oe(We(t)):{},Ge(e||!t||!t.__esModule?jt(o,"default",{value:t,enumerable:!0}):o,t));var W=De((ko,Xt)=>{Xt.exports=window.THREE});var g=j(W(),1);var H=j(W(),1),Ue=1e3,w={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Ye(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function T(t,e=w.PLAIN,o={}){return{c:typeof t=="number"?Ye(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var Kt=["px","nx","py","ny","pz","nz"];function V(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function Ft(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function pt(t){return Math.hypot(t[0],t[1],t[2])}function _(t){let e=pt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function Ct(t,e){let o=Math.abs(e[0]),a=Math.abs(e[1]),n=Math.abs(e[2]);return o>=a&&o>=n?[t[2],t[1]]:n>=a?[t[0],t[1]]:[t[0],t[2]]}var ot=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new H.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new H.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,a=e[0],n=e[1],s=e[2];return[o[0]*a+o[4]*n+o[8]*s+o[12],o[1]*a+o[5]*n+o[9]*s+o[13],o[2]*a+o[6]*n+o[10]*s+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,a=e[0],n=e[1],s=e[2];return _([o[0]*a+o[3]*n+o[6]*s,o[1]*a+o[4]*n+o[7]*s,o[2]*a+o[5]*n+o[8]*s])}tri(e,o,a,n,s=[1,1,1],c={}){let h=this._tp(e),f=this._tp(o),u=this._tp(a),p=_(Ft(V(o,e),V(a,e))),r=c.uv||[Ct(e,p),Ct(o,p),Ct(a,p)],i=_(Ft(V(f,h),V(u,h))),l=c.n?c.n.map(M=>this._tn(M)):[i,i,i],d=pt(Ft(V(f,h),V(u,h))),m=[d/(pt(V(u,f))||1),d/(pt(V(h,u))||1),d/(pt(V(f,h))||1)],x=c.k||[1,1,1],E=n.s||0,y=[h,f,u];for(let M=0;M<3;M++){let b=y[M];this.pos.push(b[0]+E,b[1]+E,b[2]+E),this.nrm.push(l[M][0],l[M][1],l[M][2]),this.col.push(n.c[0]*x[M],n.c[1]*x[M],n.c[2]*x[M]),this.uv.push(r[M][0],r[M][1]);for(let R=0;R<3;R++)s[R]?this.edg.push(M===R?m[R]:0):this.edg.push(Ue);this.mat.push(n.p,n.f,n.w)}}quad(e,o,a,n,s,c=[1,1,1,1],h={}){let f=h.k||[1,1,1,1],u=h.n,p=h.uv;this.tri(e,o,a,s,[c[1],0,c[0]],{k:[f[0],f[1],f[2]],n:u&&[u[0],u[1],u[2]],uv:p&&[p[0],p[1],p[2]]}),this.tri(e,a,n,s,[c[2],c[3],0],{k:[f[0],f[2],f[3]],n:u&&[u[0],u[2],u[3]],uv:p&&[p[0],p[2],p[3]]})}box(e,o,a,n,s,c,h,f={}){e>n&&([e,n]=[n,e]),o>s&&([o,s]=[s,o]),a>c&&([a,c]=[c,a]);let u=new Set(f.open||[]),p=new Set(f.skip||[]);f.bottom||p.add("ny");let r=f.ao??1,i=f.aoTop??1,l={px:[0,n],nx:[0,e],py:[1,s],ny:[1,o],pz:[2,c],nz:[2,a]},d={px:[[n,o,c],[n,o,a],[n,s,a],[n,s,c]],nx:[[e,o,a],[e,o,c],[e,s,c],[e,s,a]],pz:[[e,o,c],[n,o,c],[n,s,c],[e,s,c]],nz:[[n,o,a],[e,o,a],[e,s,a],[n,s,a]],py:[[e,s,c],[n,s,c],[n,s,a],[e,s,a]],ny:[[e,o,a],[n,o,a],[n,o,c],[e,o,c]]};for(let m of Kt){if(p.has(m)||u.has(m))continue;let x=d[m],E=[];for(let b=0;b<4;b++){let R=x[b],L=x[(b+1)%4],A=1;for(let $ of Kt){if($===m)continue;let[tt,et]=l[$];Math.abs(R[tt]-et)<1e-9&&Math.abs(L[tt]-et)<1e-9&&u.has($)&&(A=0)}E.push(A)}let y;m==="py"||m==="ny"?y=[i,i,i,i]:y=[r,r,1,1];let M=m==="py"&&f.top?{...f.top,s:h.s}:h;this.quad(x[0],x[1],x[2],x[3],M,E,{k:y})}}cyl(e,o,a,n,s,c,h,f={}){let u=f.caps??[!0,!0],p=f.rim??[1,1],r=f.r1??n;for(let i=0;i<c;i++){let l=i/c*Math.PI*2,d=(i+1)/c*Math.PI*2,m=Math.cos(l),x=Math.sin(l),E=Math.cos(d),y=Math.sin(d),M=[e+n*m,o,a+n*x],b=[e+r*m,s,a+r*x],R=[e+r*E,s,a+r*y],L=[e+n*E,o,a+n*y],A=(n-r)/Math.max(1e-6,s-o),$=_([m,A,x]),tt=_([E,A,y]),et=l*(n+r)/2,Et=d*(n+r)/2;this.quad(M,b,R,L,h,[0,p[1],0,p[0]],{n:[$,$,tt,tt],uv:[[et,o],[et,s],[Et,s],[Et,o]],k:f.k}),u[1]&&r>0&&this.tri([e,s,a],R,b,h,[1,0,0]),u[0]&&this.tri([e,o,a],M,L,h,[1,0,0])}}lathe(e,o,a,n,s,c,h={}){let f=n.length,u=[];for(let i=0;i<f-1;i++){let l=n[i+1][0]-n[i][0],d=n[i+1][1]-n[i][1];u.push(_([d,-l,0]))}let p=n.map((i,l)=>{let d=u[Math.max(0,l-1)],m=u[Math.min(f-2,l)];return _([d[0]+m[0],d[1]+m[1],0])}),r=h.edges||[];for(let i=0;i<s;i++){let l=i/s*Math.PI*2,d=(i+1)/s*Math.PI*2,m=Math.cos(l),x=Math.sin(l),E=Math.cos(d),y=Math.sin(d);for(let M=0;M<f-1;M++){let[b,R]=n[M],[L,A]=n[M+1],$=[e+b*m,o+R,a+b*x],tt=[e+L*m,o+A,a+L*x],et=[e+L*E,o+A,a+L*y],Et=[e+b*E,o+R,a+b*y],ct=h.flat?u[M]:p[M],it=h.flat?u[M]:p[M+1];this.quad($,tt,et,Et,c,[0,r[M+1]?1:0,0,r[M]?1:0],{n:[[ct[0]*m,ct[1],ct[0]*x],[it[0]*m,it[1],it[0]*x],[it[0]*E,it[1],it[0]*y],[ct[0]*E,ct[1],ct[0]*y]],uv:[[l*1.2,R],[l*1.2,A],[d*1.2,A],[d*1.2,R]]})}}}poly(e,o,a={}){for(let n=1;n<e.length-1;n++)this.tri(e[0],e[n],e[n+1],o,[1,n===e.length-2?1:0,n===1?1:0],a)}blob(e,o,a,n,s,c,h,f={}){let u=f.sub??1,p=f.seed??0,r=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let d=0;d<u;d++){let m=[];for(let[x,E,y]of r){let M=_([(x[0]+E[0])/2,(x[1]+E[1])/2,(x[2]+E[2])/2]),b=_([(E[0]+y[0])/2,(E[1]+y[1])/2,(E[2]+y[2])/2]),R=_([(y[0]+x[0])/2,(y[1]+x[1])/2,(y[2]+x[2])/2]);m.push([x,M,R],[M,E,b],[R,b,y],[M,b,R])}r=m}let i=d=>1+(f.lump??.12)*Math.sin(d[0]*5.1+p)*Math.sin(d[1]*4.3+p*1.7)*Math.sin(d[2]*3.7+p*.3),l=d=>{let m=i(d);return[e+d[0]*n*m,o+d[1]*s*m,a+d[2]*c*m]};for(let[d,m,x]of r)this.tri(l(d),l(m),l(x),h,[0,0,0],{n:[d,m,x],k:f.k})}build(){let e=new H.BufferGeometry;return e.setAttribute("position",new H.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new H.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new H.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new H.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new H.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new H.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},k={T:(t,e,o)=>new H.Matrix4().makeTranslation(t,e,o),RX:t=>new H.Matrix4().makeRotationX(t),RY:t=>new H.Matrix4().makeRotationY(t),RZ:t=>new H.Matrix4().makeRotationZ(t),S:(t,e,o)=>new H.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new H.Matrix4)};var D=j(W(),1);function Zt(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new D.Vector3(.1,.9,.66).normalize()},uPaper:{value:new D.Vector3(.925,.898,.835)},uInk:{value:new D.Vector3(.11,.1,.09)},uHaze:{value:new D.Vector3(.83,.86,.84)},uFade:{value:1}}}var Nt=`
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
`,Bt=`
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
`,$e=`
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
`,je=`
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
${Nt}
${Bt}

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
`;function Jt(t,e={}){return new D.ShaderMaterial({uniforms:t,vertexShader:$e,fragmentShader:je,transparent:!!e.transparent,side:e.side??D.FrontSide})}var Ho=`
uniform float uTime;
uniform float uFlowTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
varying vec2 vF;
${Nt}
${Bt}
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
`;var Lo=`
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
${Nt}
${Bt}
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
`;var Po=j(W(),1);function Qt(t,e,o){if(!t.includes(e))throw new Error(`ink shader patch failed: ${e}`);return t.replace(e,o)}function te(t,e={}){t.uHatch||(t.uHatch={value:1});let o=Jt(t,e),a=o.fragmentShader;return a=Qt(a,"uniform float uFade;",`uniform float uFade;
uniform float uHatch;`),a=Qt(a,"vec3 outc = finish(col, vM.y, ink, uv, fw, face);","vec3 outc = finish(col, vM.y, ink, uv * uHatch, fw * uHatch, face);"),o.fragmentShader=a,o.needsUpdate=!0,o}function ee(t,e){let o=document.getElementById("frame"),a=()=>{let s=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),h=document.getElementById("controls"),f=(c?c.offsetHeight:0)+6+13,u=(h?h.offsetHeight:0)+8+13,p=window.innerWidth-s*2,r=window.innerHeight-f-u,i=r,l=i*t;l>p&&(l=p,i=l/t),l=Math.max(160,Math.floor(l)),i=Math.max(120,Math.floor(i)),o.style.width=`${l}px`,o.style.height=`${i}px`,o.style.top=`${f+Math.max(0,(r-i)/2)}px`,e?.(l,i)};return window.addEventListener("resize",a),a(),a}function oe(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let a=n=>{n?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(n))};e?.addEventListener("click",()=>a(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function ne(t,e,o){let a=n=>{for(let[s,c]of t)s.setAttribute("aria-pressed",String(c===n));e(n)};for(let[n,s]of t)n.addEventListener("click",()=>a(s));return o!==void 0&&a(o),a}function ae(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function se(t,e=!0){let o=document.getElementById("btn-play"),a=n=>{e=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),t(n)};return o?.addEventListener("click",()=>a(!e)),a(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function ce(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function ie(){document.body.classList.add("ready")}var U=j(W(),1),G=4.6,lt=.64,zt=1.6,yt=25,Xe=1.5,P=(t,e,o)=>new U.Vector3(t,e,o);var bt=G*Math.sqrt(3),O=1-bt/yt,vt=Math.cbrt(O),X=[lt/2,lt/2*vt,lt/2*vt*vt,lt/2*O],S=[P(0,0,0),P(G,0,0),P(G,G,0),P(G,G,G)],C=S[3].clone().divideScalar(1-O),Rt=new U.Matrix4().makeTranslation(C.x,C.y,C.z).multiply(new U.Matrix4().makeScale(O,O,O)).multiply(new U.Matrix4().makeTranslation(-C.x,-C.y,-C.z)),No=Rt.clone().invert();function Ke(t){let e=(o,a,n)=>P(o*t,a*t,n*t);return[{pts:[e(1,-1,1),e(1,-1,-1),e(1,1,-1),e(1,1,1)],tag:"box"},{pts:[e(-1,-1,-1),e(-1,-1,1),e(-1,1,1),e(-1,1,-1)],tag:"box"},{pts:[e(-1,1,1),e(1,1,1),e(1,1,-1),e(-1,1,-1)],tag:"box"},{pts:[e(-1,-1,-1),e(1,-1,-1),e(1,-1,1),e(-1,-1,1)],tag:"box"},{pts:[e(-1,-1,1),e(1,-1,1),e(1,1,1),e(-1,1,1)],tag:"box"},{pts:[e(1,-1,-1),e(-1,-1,-1),e(-1,1,-1),e(1,1,-1)],tag:"box"}]}function Ze(t,e){let o=[],a=[];for(let s of t){let c=[],h=s.pts;for(let u=0;u<h.length;u++){let p=h[u],r=h[(u+1)%h.length],i=e.n.dot(p)-e.d,l=e.n.dot(r)-e.d;if(i<=1e-9&&c.push(p),Math.abs(i)<=1e-9&&a.push(p),i<-1e-9&&l>1e-9||i>1e-9&&l<-1e-9){let d=p.clone().lerp(r,i/(i-l));c.push(d),a.push(d)}}let f=re(c,!0);f.length>=3&&o.push({pts:f,tag:s.tag})}let n=re(a,!1);if(n.length>=3){let s=n.reduce((f,u)=>f.add(u),P(0,0,0)).divideScalar(n.length),c=n[0].clone().sub(s).normalize(),h=e.n.clone().normalize().cross(c);n.sort((f,u)=>Math.atan2(f.clone().sub(s).dot(h),f.clone().sub(s).dot(c))-Math.atan2(u.clone().sub(s).dot(h),u.clone().sub(s).dot(c))),o.push({pts:n,tag:e.tag})}return o}function re(t,e){let o=[];for(let a of t)o.some(n=>n.distanceToSquared(a)<1e-14)||o.push(a);if(e){let a=[];for(let n of t)(!a.length||a[a.length-1].distanceToSquared(n)>1e-14)&&a.push(n);for(;a.length>1&&a[0].distanceToSquared(a[a.length-1])<1e-14;)a.pop();return a}return o}function mt(t){let e=Ke(60);for(let o of t)e=Ze(e,o);return e}var Tt=(t,e,o)=>({n:t.clone().normalize(),d:t.clone().normalize().dot(e),tag:o}),wt=[P(1,0,0),P(0,1,0),P(0,0,1)],_t=["x","y","z"],rt=1.1;function qt(t,e,o,a,n,s,c){let h=wt[o],f=e.clone().sub(t).dot(h),u=(m,x,E,y)=>{let M=(y-x)/(E-m),b=[];for(let R of[0,1,2])if(R!==o)for(let L of[1,-1]){let A=wt[R].clone().multiplyScalar(L).addScaledVector(h,-M);b.push({n:A,d:A.dot(t)+x-M*m,tag:`side:${L>0?"+":"-"}${_t[R]}`})}return b},p=(m,x)=>{let E=t.clone().addScaledVector(h,m);return Tt(x?h:h.clone().negate(),E,"seg")},r=wt[s].clone().add(h),i=Tt(r.clone().negate(),t,`mitre:${_t[3-s-o]}`),l=h.clone().add(wt[c]),d=Tt(l,e,`mitre:${_t[3-o-c]}`);return[[...u(0,a,1,a),i,p(rt,!0)],[...u(rt,a,f-rt,n),p(rt,!1),p(f-rt,!0)],[...u(0,n,1,n),p(f-rt,!1),d]]}var le=qt(S[0],S[1],0,X[0],X[1],2,1),Je=qt(S[1],S[2],1,X[1],X[2],0,2),fe=qt(S[2],S[3],2,X[2],X[3],1,0);function Qe(){let t=fe[2].map(e=>{let o=(e.d-e.n.dot(C)*(1-O))/O;return{n:e.n.clone(),d:o,tag:e.tag}});return mt(t)}function to(t){let e=[],o=t.map(a=>Ot(a.pts).dot(C.clone().sub(a.pts[0]))>0);t.forEach((a,n)=>{o[n]||e.push(Tt(Ot(a.pts),a.pts[0],"cut"))});for(let a=0;a<t.length;a++){let n=t[a].pts;for(let s=0;s<n.length;s++){let c=n[s],h=n[(s+1)%n.length];for(let f=0;f<t.length;f++){if(f===a||o[a]===o[f]||!eo(t[f].pts,c,h)||!o[a])continue;let u=h.clone().sub(c).cross(C.clone().sub(c)).normalize(),p=oo(t.flatMap(r=>r.pts));u.dot(p.clone().sub(c))>0&&u.negate(),e.push({n:u,d:u.dot(c),tag:"cut"})}}}return e}function eo(t,e,o){for(let a=0;a<t.length;a++){let n=t[a],s=t[(a+1)%t.length];if(n.distanceToSquared(e)<1e-10&&s.distanceToSquared(o)<1e-10||n.distanceToSquared(o)<1e-10&&s.distanceToSquared(e)<1e-10)return!0}return!1}function Ot(t){let e=P(0,0,0);for(let o=0;o<t.length;o++){let a=t[o],n=t[(o+1)%t.length];e.x+=(a.y-n.y)*(a.z+n.z),e.y+=(a.z-n.z)*(a.x+n.x),e.z+=(a.x-n.x)*(a.y+n.y)}return e.normalize()}function oo(t){return t.reduce((e,o)=>e.add(o),P(0,0,0)).divideScalar(t.length)}function ue(){let t=Qe();return{A:le.map(mt),B:Je.map(mt),C:fe.map(mt),W:mt([...le[0],...to(t)]),cEnd:t}}function no(t){let e=P(1,1,1).normalize(),a=P(0,0,1).clone().multiplyScalar(Math.cos(t)).add(P(0,-Math.sin(t),0)),n=1/(Math.sqrt(3)*Math.cos(t)),s=Math.sqrt(Math.max(0,1-n*n)),c=null;for(let h of[1,-1]){let f=P(h*s,0,n),u=a.clone().multiplyScalar(Math.sqrt(3)).sub(f);for(let p of[1,-1]){let r=f.clone().cross(u).multiplyScalar(p),i=u.clone().add(r).multiplyScalar(.5),l=u.clone().sub(r).multiplyScalar(.5);i.clone().cross(f).dot(l)<.99||i.y<0&&l.y>0&&(!c||i.x<c.a.x)&&(c={a:i,b:f,c:l,m:a,n:e})}}return c}function he(){let t=P(0,zt,0),e=i=>{let l=no(i),d=new U.Matrix4().makeBasis(l.a,l.b,l.c),m=t.clone().sub(C.clone().applyMatrix4(d));return{M:new U.Matrix4().makeTranslation(m.x,m.y,m.z).multiply(d),R:d,fr:l}},o=0,a=.6;for(let i=0;i<60;i++){let l=(o+a)/2;S[1].clone().applyMatrix4(e(l).M).y>Xe?a=l:o=l}let n=(o+a)/2,s=e(n),c=S[1].clone().applyMatrix4(s.M),h=S[2].clone().applyMatrix4(s.M),f=c.clone().add(h).multiplyScalar(.5),p=new U.Matrix4().makeTranslation(-f.x,0,-f.z).clone().multiply(s.M),r=C.clone().applyMatrix4(p);return{alpha:n,M:p,R:s.R,frame:s.fr,eye:r,world:i=>i.clone().applyMatrix4(p)}}var _o=j(W(),1);function ao(t,e){let o=t.pts,a=[],n=t.tag.startsWith("side:"),s=n?t.tag.slice(-1):null;for(let c=0;c<o.length;c++){let h=o[c],f=o[(c+1)%o.length];if(!n){a.push(1);continue}let u=null;for(let p of e){if(p===t)continue;let r=p.pts;for(let i=0;i<r.length;i++){let l=r[i],d=r[(i+1)%r.length];if(l.distanceToSquared(f)<1e-10&&d.distanceToSquared(h)<1e-10){u=p;break}}if(u)break}if(!u){a.push(1);continue}u.tag.startsWith("side:")?a.push(1):u.tag.startsWith("mitre:")?a.push(u.tag.slice(-1)===s?0:1):a.push(0)}return a}function so(t,e,o,a){let n=e.length,s=c=>[c.x,c.y,c.z];for(let c=1;c<n-1;c++)t.tri(s(e[0]),s(e[c]),s(e[c+1]),a,[o[c],c+1===n-1?o[n-1]:0,c===1?o[0]:0])}function z(t,e,o,a,n){for(let s of e)a.includes(s.tag)||so(s.tag==="cut"&&n?n:t,s.pts,ao(s,e),o)}function de(t,e,o){let{A:a,B:n,C:s,W:c}=ue(),h="seg";z(t,a[0],e,[h]),z(t,a[1],e,[h]),z(t,a[2],e,[h,"mitre:z"]),z(t,n[0],e,[h,"mitre:z"]),z(t,n[1],e,[h]),z(t,n[2],e,[h,"mitre:x"]),z(t,s[0],e,[h,"mitre:x"]),z(t,s[1],e,[h]),z(t,s[2],e,[h,"mitre:y"]),t.push(Rt),o&&o.push(Rt),z(t,c,e,["mitre:y",h],o),t.pop(),o&&o.pop()}var zo=S[0].clone(),qo=S[3].clone();var Yo=j(W(),1);var Y=j(W(),1);var co=new Y.Vector3(0,1,0);function q(t,e,o,a,n,s={}){let c=new Y.Vector3(o[0]-e[0],o[1]-e[1],o[2]-e[2]),h=c.length();if(h<1e-6)return;let f=new Y.Quaternion().setFromUnitVectors(co,c.normalize()),u=new Y.Matrix4().compose(new Y.Vector3(e[0],e[1],e[2]),f,new Y.Vector3(1,1,1));t.push(u),t.cyl(0,0,0,a,h,s.seg??6,n,{r1:s.r1??a*.85,rim:s.rim??[0,1],caps:s.caps??[!1,!0]}),t.pop()}var Do=T(14268832,w.PLAIN),Go=T(3878953,w.PLAIN);var N=Math.PI*2;function xt(t){let e=t>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function ft(t,e,o,a,n,s,c,h={}){let f=[];for(let u=0;u<s;u++){let p=-u/s*N;f.push([e+n*Math.cos(p),o,a+n*Math.sin(p)])}for(let u=0;u<s;u++){let p=f[u],r=f[(u+1)%s];t.tri([e,o,a],p,r,c,[h.rim===!1?0:1,0,0])}}function kt(t,e,o,a,n,s,c,h,f=0,u=N){for(let p=0;p<c;p++){let r=f+(u-f)*p/c,i=f+(u-f)*(p+1)/c,l=(d,m)=>[e+d*Math.sin(m),o,a+d*Math.cos(m)];t.quad(l(n,r),l(s,r),l(s,i),l(n,i),h,[0,1,0,1])}}var io=T(10991231,w.GRASS),ro=T(10334071,w.GRASS),lo=T(14077368,w.ASHLAR),fo=T(13353387,w.COBBLE),pe=T(14274489,w.SOIL),me=T(12366752,w.STONE),ve=T(13156266,w.ASHLAR),xe=T(9071164,w.PLAIN),St=T(5193255,w.PLAIN),Ee=T(8745821,w.WOOD,{f:.1}),we=T(10926214,w.FOLIAGE,{f:.26}),Te=T(11780752,w.FOLIAGE,{f:.26}),uo=T(12166538,w.SOIL),ho=T(13217914,w.FOLIAGE),Me=T(10124119,w.WOOD),Mt=T(3881011,w.PLAIN),po=T(15854294,w.PLAIN);function ge(t,e,o,a,n,s){let c=xt(s);t.cyl(e,0,o,.2+n*.03,a*.55,7,Ee,{r1:.12+n*.02,caps:[!1,!1]});let h=3+Math.floor(c()*2);for(let f=0;f<h;f++){let u=c()*N,p=n*.35*c(),r=n*(.6+.3*c());t.blob(e+Math.cos(u)*p,a*(.62+.22*c()),o+Math.sin(u)*p,r,r*.85,r,f%2?we:Te,{sub:2,seed:s+f*7.3,lump:.16})}}function mo(t,e,o,a,n){t.cyl(e,0,o,.16,a*.2,6,Ee,{r1:.12,caps:[!1,!1]}),t.lathe(e,0,o,[[0,a*.15],[n,a*.22],[n*.82,a*.45],[n*.6,a*.62],[n*.32,a*.85],[0,a]],9,we,{edges:[0,1,0,0,0,0]})}function vo(t,e,o,a){t.push(k.chain(k.T(e,0,o),k.RY(a)));for(let n of[-.8,.8])t.box(n-.05,0,-.22,n+.05,.42,.22,Mt,{ao:.8}),t.box(n-.04,.42,.18,n+.04,.85,.24,Mt,{});for(let n=0;n<3;n++)t.box(-1,.42,-.24+n*.15,1,.47,-.12+n*.15,Me,{});for(let n=0;n<2;n++)t.box(-1,.56+n*.16,.2,1,.68+n*.16,.25,Me,{});t.pop()}function xo(t,e,o){t.box(e-.16,0,o-.16,e+.16,.35,o+.16,Mt,{}),t.cyl(e,.35,o,.06,3.6,6,Mt,{r1:.045}),t.lathe(e,3.55,o,[[.06,0],[.24,.12],[.2,.55],[.3,.62],[0,.8]],8,po,{edges:[0,1,1,1,0]})}function Wt(t,e,o,a,n={}){let s=T(n.coat??5919560,w.CLOTH),c=T(n.legs??4078133,w.CLOTH),h=T(14203036,w.PLAIN),f=T(n.hair??3813159,w.PLAIN),u=n.h??1;t.push(k.chain(k.T(e,0,o),k.RY(a),k.S(u,u,u)));for(let p of[-1,1])q(t,[.1*p,.04,0],[.09*p,.86,0],.08,c,{r1:.09});if(t.lathe(0,.82,0,[[.2,0],[.22,.25],[.24,.55],[.19,.66],[0,.7]],10,s,{edges:[1,0,0,0,0]}),q(t,[0,1.5,0],[0,1.6,0],.06,h),t.blob(0,1.7,0,.11,.13,.11,h,{lump:.03,sub:1}),t.blob(0,1.76,.03,.115,.09,.11,f,{lump:.04,sub:1}),n.point)q(t,[.22,1.45,0],[.3,1.5,-.3],.055,s),q(t,[.3,1.5,-.3],[.33,1.62,-.62],.045,h),q(t,[-.22,1.45,0],[-.25,1.05,.04],.055,s);else for(let p of[-1,1])q(t,[.22*p,1.45,0],[.25*p,1,.04],.055,s);t.pop()}function Mo(t,e,o,a,n={}){let s=T(n.coat??7036752,w.CLOTH),c=T(4078133,w.CLOTH),h=T(14203036,w.PLAIN);t.push(k.chain(k.T(e,0,o),k.RY(a)));for(let f of[-1,1])q(t,[.1*f,.5,.05],[.12*f,.52,-.4],.08,c),q(t,[.12*f,.52,-.4],[.12*f,.05,-.45],.07,c);t.lathe(0,.47,.1,[[.2,0],[.22,.25],[.23,.55],[.18,.66],[0,.7]],10,s,{edges:[1,0,0,0,0]}),t.blob(0,1.33,.08,.11,.13,.11,h,{lump:.03,sub:1}),t.blob(0,1.4,.11,.115,.09,.11,T(9077624,w.PLAIN),{lump:.04,sub:1});for(let f of[-1,1])q(t,[.22*f,1.1,.1],[.2*f,.75,-.2],.055,s);t.pop()}function Vt(t,e,o,a,n,s,c,h,f,u){let p=xt(u),r={...h,f};t.box(e,0,o,e+a,s,o+n,r,{});let i=T(9399898,w.TILE,{f}),l=s,d=s+c,m=o+n/2,x=.3;t.quad([e-x,l,o+n+x],[e+a+x,l,o+n+x],[e+a+x,d,m],[e-x,d,m],i),t.quad([e+a+x,l,o-x],[e-x,l,o-x],[e-x,d,m],[e+a+x,d,m],i),t.tri([e,l,o+n],[e,d,m],[e,l,o],r,[1,1,0]),t.tri([e+a,l,o],[e+a,d,m],[e+a,l,o+n],r,[1,1,0]);let E=T(4867905,w.PANE,{f}),y=Math.max(2,Math.floor(s/3.2)),M=Math.max(2,Math.floor(a/2.4));for(let b=0;b<y;b++)for(let R=0;R<M;R++){let L=e+(R+.5)*a/M,A=1.2+b*(s-1.6)/y+.6;b===0&&R===Math.floor(M/2)&&p()<.8?t.box(L-.6,0,o+n,L+.6,2.4,o+n+.06,E,{}):t.box(L-.45,A,o+n,L+.45,A+1.4,o+n+.06,E,{})}p()<.7&&t.box(e+a*.7,s+c*.3,m-.4,e+a*.7+.7,s+c+.9,m+.4,{...T(10190182,w.BRICK),f},{})}function ye(t,e,o,a){let n=e.x,s=e.z,c=Math.hypot(n,s);ft(t,0,0,0,160,72,io,{rim:!1});for(let r=0;r<6;r++){let i=r/6*N+.4,l=30+r%2*8;ft(t,Math.sin(i)*l,.004,Math.cos(i)*l,7+r%3*2,20,ro,{rim:!1})}kt(t,0,.012,0,c-1,c+1,120,pe),ft(t,0,.022,0,8.6,64,fo),kt(t,0,.03,0,8.6,9,64,me);let h=Math.atan2(n,s);for(let r=0;r<4;r++){let i=h+r*N/4,l=Math.sin(i),d=Math.cos(i),m=d,x=-l,E=r===0?1.4:1,y=8.8,M=c-.6;t.quad([l*y-m*E,.016,d*y-x*E],[l*M-m*E,.016,d*M-x*E],[l*M+m*E,.016,d*M+x*E],[l*y+m*E,.016,d*y+x*E],pe,[1,0,1,0])}ft(t,n,.026,s,2.4,48,lo),kt(t,n,.032,s,2.4,2.65,48,me),ft(t,n,.04,s,.5,40,xe),kt(t,n,.046,s,.42,.47,40,St);for(let r=0;r<4;r++){let i=h+Math.PI+r*N/4,l=Math.sin(i),d=Math.cos(i),m=d*.06,x=-l*.06;t.tri([n+l*.4,.05,s+d*.4],[n-m,.05,s-x],[n+m,.05,s+x],St)}{let r=h+Math.PI;for(let i of[-1,1]){let l=n+Math.cos(r)*.1*i,d=s-Math.sin(r)*.1*i;t.blob(l-Math.sin(r)*.12,.05,d-Math.cos(r)*.12,.05,.008,.05,St,{sub:1,lump:0}),t.blob(l+Math.sin(r)*.05,.05,d+Math.cos(r)*.05,.055,.008,.055,St,{sub:1,lump:0})}}{let r=h+.9,i=n+Math.sin(r)*2,l=s+Math.cos(r)*2;t.push(k.chain(k.T(i,0,l),k.RY(h))),t.box(-.06,0,-.06,.06,.95,.06,Mt,{}),t.push(k.chain(k.T(0,.98,0),k.RX(-.6))),t.box(-.24,-.02,-.16,.24,.03,.16,xe,{}),t.pop(),t.pop()}{let r=o[0].clone().add(o[1]).multiplyScalar(.5),i=Math.atan2(a.x,a.z),l=o[0].distanceTo(o[1])+1.6;t.push(k.chain(k.T(r.x,0,r.z),k.RY(i))),t.box(-.95,0,-l/2,.95,.36,l/2,ve,{ao:.8}),t.box(-.75,.36,-l/2+.2,.75,.46,l/2-.2,ve,{}),t.pop();for(let d of o)t.box(d.x-.17,.46,d.z-.17,d.x+.17,d.y,d.z+.17,T(10262154,w.PLAIN),{ao:.75})}for(let r of[-.17,.17,1.2,-1.35,2.4,-2.6]){let i=h+r,l=c+1.6;vo(t,Math.sin(i)*l,Math.cos(i)*l,i+Math.PI)}for(let r=0;r<8;r++){let i=h+(r+.5)*N/8;xo(t,Math.sin(i)*(c+2.6),Math.cos(i)*(c+2.6))}for(let r=0;r<4;r++){let i=h+(r+.5)*(N/4),l=Math.sin(i)*12.6,d=Math.cos(i)*12.6;ft(t,l,.03,d,2.2,28,uo);for(let m=0;m<7;m++){let x=m/7*N;t.blob(l+Math.cos(x)*1.3,.18,d+Math.sin(x)*1.3,.42,.22,.42,ho,{sub:1,seed:r*7+m,lump:.15})}t.blob(l,.3,d,.6,.36,.6,Te,{sub:1,seed:r,lump:.15})}let f=xt(7);for(let r=0;r<46;r++){let i=h+r/46*N+(f()-.5)*.1,l=Math.atan2(Math.sin(i-h),Math.cos(i-h));if(Math.abs(l)<.2)continue;let d=c+9+f()*10;r%5===2?mo(t,Math.sin(i)*d,Math.cos(i)*d,9+f()*4,1.8+f()*.6):ge(t,Math.sin(i)*d,Math.cos(i)*d,7+f()*4,2.6+f()*1.4,11+r)}for(let[r,i]of[[.75,26],[-.8,25.5],[1.65,26.5],[-1.9,26],[2.7,25.5],[-2.75,26.5]]){let l=h+r;ge(t,Math.sin(l)*i,Math.cos(l)*i,6.5,2.4,50+i)}{let r=(y,M)=>[Math.sin(h+y)*M,Math.cos(h+y)*M],[i,l]=r(1.95,7.6);Wt(t,i,l,h+1.95+Math.PI+.25,{coat:8019786,point:!0});let[d,m]=r(2.05,7.9);Wt(t,d,m,h+2.05+Math.PI-.1,{coat:5134946,h:.92,hair:7033922});let[x,E]=r(-2.2,8);Wt(t,x,E,h-2.2+Math.PI,{coat:6445642})}{let r=h-1.35,i=c+1.6;Mo(t,Math.sin(r)*i+.3,Math.cos(r)*i,r+Math.PI,{coat:6122074})}let u=xt(3),p=-70;for(;p<70;){let r=7+u()*6,i=8+u()*7,l=-62-u()*4,d=[14273973,13483942,14735042,13219739][Math.floor(u()*4)];Vt(t,p,l,r,10,i,3+u()*2,T(d,w.PLASTER),.5,Math.floor(u()*1e3)),p+=r+.2}for(p=-70;p<70;){let r=7+u()*6,i=8+u()*7,l=58+u()*4;t.push(k.chain(k.T(0,0,0),k.RY(Math.PI))),Vt(t,p,-l-10,r,10,i,3+u()*2,T(14076594,w.PLASTER),.5,Math.floor(u()*1e3)),t.pop(),p+=r+.2}for(let r of[-1,1]){let i=-55;for(;i<55;){let l=7+u()*6,d=8+u()*6;t.push(k.chain(k.RY(r*Math.PI/2))),Vt(t,i,-68-u()*3,l,10,d,3+u()*2,T(13878957,w.PLASTER),.55,Math.floor(u()*1e3)),t.pop(),i+=l+.2}}}function be(t,e){let o=Math.hypot(e.x,e.z),a=Math.atan2(e.x,e.z),n=xt(7);for(let s=0;s<46;s++){let c=a+s/46*N+(n()-.5)*.1,h=Math.atan2(Math.sin(c-a),Math.cos(c-a));if(Math.abs(h)<.2)continue;let f=o+9+n()*10,u=Math.sin(c)*f,p=Math.cos(c)*f;if(s%5===2){n(),n();continue}let r=7+n()*4,i=2.6+n()*1.4;t.blob(u,r*.7,p,i,i*.8,i,T(0,w.PLAIN),{sub:1})}}var B=he(),F=B.eye.clone(),Pt=B.world(S[0]),He=B.world(S[3]),Re=Math.hypot(F.x,F.z),go=Math.atan2(F.x,F.z),Le=B.world(S[1]).add(B.world(S[2])).add(Pt.clone().add(He).multiplyScalar(.5)).multiplyScalar(1/3);Le.y+=.15;var Z=document.getElementById("scene"),ht=new g.WebGLRenderer({canvas:Z,antialias:!0,stencil:!0});ht.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var Ut=new g.Color(15525333),Ae=new g.Color(14935775);ht.setClearColor(Ut,1);var st=new g.Scene,dt=Zt();dt.uLight.value.set(-.15,.66,.73).normalize();dt.uHatch={value:3};var Yt=te(dt),Eo=T(14728060,w.PLAIN),Dt=new ot,Pe=(()=>{let t=new ot;return t.push(B.M),Dt.push(B.M),de(t,Eo,Dt),t.pop(),t.build()})(),Ie=new g.Mesh(Pe,Yt);Ie.frustumCulled=!1;st.add(Ie);var It=new g.Mesh(Dt.build(),Yt);It.frustumCulled=!1;st.add(It);var wo=[B.world(S[1]),B.world(S[2])],To=new g.Vector3(0,1,0).transformDirection(B.R),yo=(()=>{let t=new ot;ye(t,F,wo,To);let e=new g.Mesh(t.build(),Yt);return e.frustumCulled=!1,e})();st.add(yo);{let t=dt.uLight.value,e=.06,o=new g.Matrix4().set(1,-t.x/t.y,0,t.x*e/t.y,0,0,0,e,0,-t.z/t.y,1,t.z*e/t.y,0,0,0,1),a=new g.MeshBasicMaterial({color:2762014,transparent:!0,opacity:.3,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:g.NotEqualStencilFunc,stencilZPass:g.ReplaceStencilOp,side:g.DoubleSide}),n=new ot;be(n,F);for(let s of[Pe,It.geometry,n.build()]){let c=new g.Mesh(s,a);c.matrixAutoUpdate=!1,c.matrix.copy(o),c.matrixWorldNeedsUpdate=!0,c.frustumCulled=!1,c.renderOrder=2,st.add(c)}}var ut=new g.Group,Gt=[];{let t=new g.LineDashedMaterial({color:10631978,dashSize:.45,gapSize:.3,transparent:!0,opacity:0,depthTest:!1});Gt.push(t);let e=(o,a)=>{let n=new g.BufferGeometry().setFromPoints([o,a]),s=new g.Line(n,t);s.computeLineDistances(),ut.add(s)};e(F,Pt),e(new g.Vector3(F.x,.05,F.z),F);for(let[o,a]of[[F,.07],[He,.09],[Pt,.09]]){let n=new g.MeshBasicMaterial({color:10631978,transparent:!0,opacity:0,depthTest:!1});Gt.push(n);let s=new g.Mesh(new g.SphereGeometry(a,14,10),n);s.position.copy(o),ut.add(s)}ut.renderOrder=20,ut.children.forEach(o=>{o.renderOrder=20}),st.add(ut)}var K=new g.PerspectiveCamera(24,30/38,.1,700),I={off:0,fov:24};function Fe(){let t=go+I.off;K.position.set(Math.sin(t)*Re,zt,Math.cos(t)*Re),Math.abs(I.off)<1e-9&&K.position.copy(F),K.lookAt(I.look||Le),K.fov=I.fov,K.updateProjectionMatrix()}ee(30/38,(t,e)=>{ht.setSize(t,e),K.aspect=t/e,Fe()});var Ht=[[0,-38],[6.5,0],[10,0],[16.5,38],[18,38],[24.5,0],[28,0],[34.5,-38],[36,-38]],Lt=36,Ce=t=>t*t*(3-2*t);function At(t){let e=(t%Lt+Lt)%Lt;for(let o=0;o<Ht.length-1;o++){let[a,n]=Ht[o],[s,c]=Ht[o+1];if(e<=s)return g.MathUtils.degToRad(n+(c-n)*Ce((e-a)/(s-a)))}return g.MathUtils.degToRad(Ht[0][1])}var v={playing:!0,phase:7,litho:1,lithoTarget:1,manual:null,blend:1,tween:null,standing:!1},Ne=document.getElementById("btn-spot");function nt(t){v.standing=t,Ne.setAttribute("aria-pressed",String(t))}oe();ne([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{v.lithoTarget=t},1);var at=se(t=>{t&&!v.playing&&(v.manual!==null&&(v.phase=v.standing?10-.001:bo(v.manual),v.blend=v.standing?1:0),v.tween=null,nt(!1)),v.playing=t});function bo(t){let e=0,o=1/0;for(let a=0;a<Lt;a+=.05){let n=Math.abs(At(a)-t)+(At(a+.5)>At(a)?0:.001);n<o&&(o=n,e=a)}return e}function $t(){if(v.standing){at(!0);return}let t=v.manual??I.off;v.manual=t,v.tween={from:t,to:0,t:0,dur:Math.max(.6,Math.abs(t)*2.6)},at(!1),nt(!0)}Ne.addEventListener("click",$t);ae({" ":()=>at(!v.playing),l:()=>document.getElementById(v.lithoTarget?"btn-colour":"btn-litho").click(),s:$t,ArrowLeft:()=>ke(-3),ArrowRight:()=>ke(3)});function ke(t){at(!1),nt(!1),v.tween=null,v.manual=(v.manual??I.off)+g.MathUtils.degToRad(t)}var gt=null;Z.addEventListener("pointerdown",t=>{Z.setPointerCapture(t.pointerId),gt={x:t.clientX},at(!1),nt(!1),v.tween=null,v.manual=I.off});Z.addEventListener("pointermove",t=>{if(!gt)return;let e=t.clientX-gt.x;gt.x=t.clientX,v.manual-=e*.004});var Be=()=>{gt=null};Z.addEventListener("pointerup",Be);Z.addEventListener("pointercancel",Be);Z.addEventListener("wheel",t=>{t.preventDefault(),I.fov=g.MathUtils.clamp(I.fov*Math.exp(t.deltaY*.001),10,50)},{passive:!1});Z.addEventListener("dblclick",$t);var Se=performance.now();function _e(t){let e=Math.min(.05,Math.max(0,(t-Se)/1e3));if(Se=t,v.playing&&(v.phase+=e,v.blend<1&&(v.blend=Math.min(1,v.blend+e/1.6))),v.tween){let s=v.tween;s.t=Math.min(1,s.t+e/s.dur);let c=s.t<.5?4*s.t**3:1-(-2*s.t+2)**3/2;v.manual=s.from+(s.to-s.from)*c,s.t>=1&&(v.tween=null)}if(v.playing){let s=At(v.phase);I.off=v.manual===null||v.blend>=1?s:v.manual+(s-v.manual)*Ce(v.blend),v.blend>=1&&(v.manual=null)}else v.manual!==null&&(I.off=v.manual);if(Fe(),v.litho!==v.lithoTarget){let s=v.lithoTarget-v.litho;v.litho+=Math.sign(s)*Math.min(Math.abs(s),e*2.2),ht.setClearColor(Ae.clone().lerp(Ut,v.litho),1)}dt.uLitho.value=v.litho,dt.uTime.value=t/1e3;let o=K.position.distanceTo(F),a=g.MathUtils.clamp((o-.6)/2.5,0,1);ut.visible=a>.001,Gt.forEach(s=>{s.opacity=a*.9});let n=o<.05;It.visible=o>.001,ce(n&&!v.noBadge,"Sweet spot: the far end hides exactly behind the near end"),n!==v.wasAt&&(v.wasAt=n,!n&&v.standing&&!v.tween&&nt(!1)),ht.render(st,K),requestAnimationFrame(_e)}ie();requestAnimationFrame(_e);var J=(t,e=1)=>t.toFixed(e),Q=(t,e)=>{let o=document.getElementById(t);o&&(o.textContent=e)};Q("n-gap",J(bt));Q("n-dist",J(yt));Q("n-near",J(yt-bt));Q("n-k",J(O,2));Q("n-taper",J((1-vt)*100,0));Q("n-wfar",J(lt*100,0));Q("n-wnear",J(X[3]*200,0));Q("n-len",J(G));window.__page={state:v,view:I,pose:B,setOffset(t){at(!1),nt(!1),v.tween=null,v.manual=g.MathUtils.degToRad(t)},stand(){at(!1),v.tween=null,v.manual=0,nt(!0)},setLitho(t){document.getElementById(t?"btn-litho":"btn-colour").click(),v.litho=t?1:0,ht.setClearColor(Ae.clone().lerp(Ut,v.litho),1)},setFov(t){I.fov=t},setPhase(t){v.phase=t},lookApex(t){I.look=t?Pt.clone():null},scene:st};})();
