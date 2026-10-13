(()=>{var Oe=Object.create;var qo=Object.defineProperty;var We=Object.getOwnPropertyDescriptor;var je=Object.getOwnPropertyNames;var _e=Object.getPrototypeOf,Ue=Object.prototype.hasOwnProperty;var qe=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var Ge=(t,o,e,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let n of je(o))!Ue.call(t,n)&&n!==e&&qo(t,n,{get:()=>o[n],enumerable:!(s=We(o,n))||s.enumerable});return t};var jt=(t,o,e)=>(e=t!=null?Oe(_e(t)):{},Ge(o||!t||!t.__esModule?qo(e,"default",{value:t,enumerable:!0}):e,t));var Lt=qe((V0,Go)=>{Go.exports=window.THREE});var R=jt(Lt(),1);var tt=jt(Lt(),1);function $o(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new tt.Vector3(.1,.9,.66).normalize()},uPaper:{value:new tt.Vector3(.925,.898,.835)},uInk:{value:new tt.Vector3(.11,.1,.09)},uHaze:{value:new tt.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var Ko=`
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
`,$e=`
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
  float hp = uHatch + haze * 0.25;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  // a line covers the fraction c of each period (darker tone, wider line)
  float h1 = smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1) * smoothstep(0.0, 0.06, c1);
  float h2 = smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2) * smoothstep(0.0, 0.06, c2);
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
`,Ke=`
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
varying vec3 vW;
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
  vW = wp.xyz;
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ye=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uHatch;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${Ko}
${$e}

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
  } else if (pat == 14.0) {    // desk: planks with wood grain along x
    float pw = 1.7;
    float plank = floor(uv.y / pw);
    float fy = fract(uv.y / pw) * pw;
    float seam = lineMask(min(fy, pw - fy), 0.012) * lod(pw, fw);
    float h = hash12(vec2(plank, 3.0));
    float warp = fbm(vec2(uv.x * 0.15 + h * 9.0, uv.y * 1.1)) * 3.0;
    float grain = fract((uv.y + warp * 0.3 + h) * 5.0);
    float g = smoothstep(0.0, 0.5, grain) * smoothstep(1.0, 0.7, grain);
    float l = lod(0.2, fw);
    tex = (0.93 + 0.07 * h) * mix(1.0, 0.93 + 0.08 * g, l) * (0.97 + 0.05 * vnoise(uv * vec2(0.3, 5.0)));
    lines = seam * 0.8;
  } else if (pat == 15.0) {    // page block: fine lines along the edges of the leaves
    float ph = 0.022;
    float fy = fract(uv.y / ph);
    float l = lod(ph, fw);
    tex = mix(0.96, 0.9 + 0.1 * fy, l);
  } else if (pat == 16.0) {    // book cloth: a fine weave
    float w = sin(uv.x * 140.0) * sin(uv.y * 140.0);
    tex = 0.95 + 0.03 * w * lod(0.12, fw) + 0.07 * fbm(uv * 1.5);
  } else if (pat == 17.0) {    // pewter: spun rings, a polished sheen
    vec3 vd = normalize(cameraPosition - vW);
    vec3 hv = normalize(vd + uLight);
    float sp = pow(max(dot(normalize(vN), hv), 0.0), 18.0);
    float ring = sin(length(uv) * 90.0) * lod(0.07, fw);
    tex = 0.9 + 0.04 * ring + 0.55 * sp;
  } else if (pat == 18.0) {    // stone: veined
    float v1 = fbm(uv * 1.6 + 4.0);
    float vein = 1.0 - smoothstep(0.0, 0.05, abs(fract(v1 * 3.0 + uv.x * 0.4) - 0.5) - 0.42);
    tex = 0.9 + 0.12 * fbm(uv * 3.0) - 0.16 * vein;
  } else if (pat == 19.0) {    // pencil: painted facets with a lengthwise stripe
    tex = 0.94 + 0.06 * sin(uv.x * 30.0);
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
`;function Yo(t,o={}){return new tt.ShaderMaterial({uniforms:t,vertexShader:Ke,fragmentShader:Ye,transparent:!!o.transparent,side:o.side??tt.FrontSide})}var Qe=`
attribute float aDist;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vDist;
void main() {
  vUv = uv;
  vDist = aDist;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Xe=`
uniform sampler2D uMapL;
uniform sampler2D uMapC;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform float uFade;
uniform float uSolid;      // 0 flat drawing, 1 solid body
uniform float uContours;   // reveal: contour lines of the inflation
uniform float uContourStep;
uniform float uFill;       // 1 the finished drawing, 0 just its outline
uniform float uLineW;      // half width of that outline (distance units)
uniform vec3 uSketchPaper;
uniform vec3 uSketchLine;
uniform float uUvScale;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vDist;
${Ko}
void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec4 tl = texture2D(uMapL, vUv);
  vec4 tc = texture2D(uMapC, vUv);
  vec3 base = mix(tc.rgb, tl.rgb, uLitho);
  float a = mix(tc.a, tl.a, uLitho);
  if (uFill < 0.999) {
    float ln = 1.0 - smoothstep(uLineW * 0.55, uLineW * 1.45, vDist);
    base = mix(mix(uSketchPaper, uSketchLine, ln), base, uFill);
  }
  // light, normalised to a face looking straight up
  float up = 0.42 + 0.62 * max(uLight.y, 0.0);
  float diff = 0.42 + 0.62 * max(dot(n, uLight), 0.0);
  float shade = mix(1.0, diff / up, uSolid);
  vec3 vd = normalize(cameraPosition - vW);
  float rim = 1.0 - smoothstep(0.08, 0.42, abs(dot(n, vd)));
  float spec = pow(max(dot(n, normalize(vd + uLight)), 0.0), 24.0) * 0.35 * uSolid;
  vec3 col = base * shade + spec;
  // lithograph: hatching that follows the surface where it turns from the light
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float dark = clamp((1.0 - shade) * 2.2, 0.0, 1.0) * uSolid;
  // hatching follows the drawing's own coordinates, so it bends with the body
  vec2 hu = vUv * uUvScale;
  float hp = 0.045;
  float a1 = (hu.x + hu.y) / hp;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float aa = fwidth(a1) * 1.5 + 0.02;
  float c1 = clamp(dark * 0.9, 0.0, 0.85);
  float h1 = mix(c1, smoothstep(1.0 - c1 - aa, 1.0 - c1 + aa, d1) * smoothstep(0.0, 0.06, c1), lod(hp, fwidth(hu.x)));
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  vec3 colour = col * (1.0 - rim * 0.55 * uSolid) + g * 0.03 + gw * 0.025;
  vec3 litho = col * (1.0 - h1 * 0.35 * uLitho) * (1.0 - rim * 0.8 * uSolid);
  litho += (g * 0.07 + gw * 0.05);
  vec3 outc = mix(colour, litho, uLitho);
  // contour lines of equal height (reveal)
  if (uContours > 0.001) {
    float cl = vDist / uContourStep;
    float dc = abs(fract(cl + 0.5) - 0.5);
    float w = fwidth(cl) * 1.2;
    float m = (1.0 - smoothstep(w * 0.5, w * 1.5, dc)) * step(0.5, cl);
    outc = mix(outc, vec3(0.64, 0.23, 0.16), m * uContours * 0.85);
  }
  gl_FragColor = vec4(outc, a * uFade);
}
`;function vo(t,o,e,s={}){return new tt.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:s.solid??0},uContours:{value:0},uContourStep:{value:s.contourStep??.02},uFill:{value:1},uUvScale:{value:s.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new tt.Vector3(.955,.935,.885)},uSketchLine:{value:new tt.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:Qe,fragmentShader:Xe,transparent:!!s.transparent,side:s.side??tt.FrontSide})}var P=jt(Lt(),1);var W=jt(Lt(),1),Ze=1e3,Eo={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Je(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function V(t,o=Eo.PLAIN,e={}){return{c:typeof t=="number"?Je(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var Qo=["px","nx","py","ny","pz","nz"];function dt(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function Mo(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function _t(t){return Math.hypot(t[0],t[1],t[2])}function it(t){let o=_t(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function wo(t,o){let e=Math.abs(o[0]),s=Math.abs(o[1]),n=Math.abs(o[2]);return e>=s&&e>=n?[t[2],t[1]]:n>=s?[t[0],t[1]]:[t[0],t[2]]}var lt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new W.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new W.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,s=o[0],n=o[1],r=o[2];return[e[0]*s+e[4]*n+e[8]*r+e[12],e[1]*s+e[5]*n+e[9]*r+e[13],e[2]*s+e[6]*n+e[10]*r+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,s=o[0],n=o[1],r=o[2];return it([e[0]*s+e[3]*n+e[6]*r,e[1]*s+e[4]*n+e[7]*r,e[2]*s+e[5]*n+e[8]*r])}tri(o,e,s,n,r=[1,1,1],c={}){let i=this._tp(o),a=this._tp(e),p=this._tp(s),h=it(Mo(dt(e,o),dt(s,o))),f=c.uv||[wo(o,h),wo(e,h),wo(s,h)],l=it(Mo(dt(a,i),dt(p,i))),u=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=_t(Mo(dt(a,i),dt(p,i))),d=[v/(_t(dt(p,a))||1),v/(_t(dt(i,p))||1),v/(_t(dt(a,i))||1)],x=c.k||[1,1,1],w=n.s||0,E=[i,a,p];for(let M=0;M<3;M++){let g=E[M];this.pos.push(g[0]+w,g[1]+w,g[2]+w),this.nrm.push(u[M][0],u[M][1],u[M][2]),this.col.push(n.c[0]*x[M],n.c[1]*x[M],n.c[2]*x[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)r[T]?this.edg.push(M===T?d[T]:0):this.edg.push(Ze);this.mat.push(n.p,n.f,n.w)}}quad(o,e,s,n,r,c=[1,1,1,1],i={}){let a=i.k||[1,1,1,1],p=i.n,h=i.uv;this.tri(o,e,s,r,[c[1],0,c[0]],{k:[a[0],a[1],a[2]],n:p&&[p[0],p[1],p[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(o,s,n,r,[c[2],c[3],0],{k:[a[0],a[2],a[3]],n:p&&[p[0],p[2],p[3]],uv:h&&[h[0],h[2],h[3]]})}box(o,e,s,n,r,c,i,a={}){o>n&&([o,n]=[n,o]),e>r&&([e,r]=[r,e]),s>c&&([s,c]=[c,s]);let p=new Set(a.open||[]),h=new Set(a.skip||[]);a.bottom||h.add("ny");let f=a.ao??1,l=a.aoTop??1,u={px:[0,n],nx:[0,o],py:[1,r],ny:[1,e],pz:[2,c],nz:[2,s]},v={px:[[n,e,c],[n,e,s],[n,r,s],[n,r,c]],nx:[[o,e,s],[o,e,c],[o,r,c],[o,r,s]],pz:[[o,e,c],[n,e,c],[n,r,c],[o,r,c]],nz:[[n,e,s],[o,e,s],[o,r,s],[n,r,s]],py:[[o,r,c],[n,r,c],[n,r,s],[o,r,s]],ny:[[o,e,s],[n,e,s],[n,e,c],[o,e,c]]};for(let d of Qo){if(h.has(d)||p.has(d))continue;let x=v[d],w=[];for(let g=0;g<4;g++){let T=x[g],A=x[(g+1)%4],L=1;for(let I of Qo){if(I===d)continue;let[S,H]=u[I];Math.abs(T[S]-H)<1e-9&&Math.abs(A[S]-H)<1e-9&&p.has(I)&&(L=0)}w.push(L)}let E;d==="py"||d==="ny"?E=[l,l,l,l]:E=[f,f,1,1];let M=d==="py"&&a.top?{...a.top,s:i.s}:i;this.quad(x[0],x[1],x[2],x[3],M,w,{k:E})}}cyl(o,e,s,n,r,c,i,a={}){let p=a.caps??[!0,!0],h=a.rim??[1,1],f=a.r1??n;for(let l=0;l<c;l++){let u=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,d=Math.cos(u),x=Math.sin(u),w=Math.cos(v),E=Math.sin(v),M=[o+n*d,e,s+n*x],g=[o+f*d,r,s+f*x],T=[o+f*w,r,s+f*E],A=[o+n*w,e,s+n*E],L=(n-f)/Math.max(1e-6,r-e),I=it([d,L,x]),S=it([w,L,E]),H=u*(n+f)/2,_=v*(n+f)/2;this.quad(M,g,T,A,i,[0,h[1],0,h[0]],{n:[I,I,S,S],uv:[[H,e],[H,r],[_,r],[_,e]],k:a.k}),p[1]&&f>0&&this.tri([o,r,s],T,g,i,[1,0,0]),p[0]&&this.tri([o,e,s],M,A,i,[1,0,0])}}lathe(o,e,s,n,r,c,i={}){let a=n.length,p=[];for(let l=0;l<a-1;l++){let u=n[l+1][0]-n[l][0],v=n[l+1][1]-n[l][1];p.push(it([v,-u,0]))}let h=n.map((l,u)=>{let v=p[Math.max(0,u-1)],d=p[Math.min(a-2,u)];return it([v[0]+d[0],v[1]+d[1],0])}),f=i.edges||[];for(let l=0;l<r;l++){let u=l/r*Math.PI*2,v=(l+1)/r*Math.PI*2,d=Math.cos(u),x=Math.sin(u),w=Math.cos(v),E=Math.sin(v);for(let M=0;M<a-1;M++){let[g,T]=n[M],[A,L]=n[M+1],I=[o+g*d,e+T,s+g*x],S=[o+A*d,e+L,s+A*x],H=[o+A*w,e+L,s+A*E],_=[o+g*w,e+T,s+g*E],U=i.flat?p[M]:h[M],O=i.flat?p[M]:h[M+1];this.quad(I,S,H,_,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[U[0]*d,U[1],U[0]*x],[O[0]*d,O[1],O[0]*x],[O[0]*w,O[1],O[0]*E],[U[0]*w,U[1],U[0]*E]],uv:[[u*1.2,T],[u*1.2,L],[v*1.2,L],[v*1.2,T]]})}}}poly(o,e,s={}){for(let n=1;n<o.length-1;n++)this.tri(o[0],o[n],o[n+1],e,[1,n===o.length-2?1:0,n===1?1:0],s)}blob(o,e,s,n,r,c,i,a={}){let p=a.sub??1,h=a.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<p;v++){let d=[];for(let[x,w,E]of f){let M=it([(x[0]+w[0])/2,(x[1]+w[1])/2,(x[2]+w[2])/2]),g=it([(w[0]+E[0])/2,(w[1]+E[1])/2,(w[2]+E[2])/2]),T=it([(E[0]+x[0])/2,(E[1]+x[1])/2,(E[2]+x[2])/2]);d.push([x,M,T],[M,w,g],[T,g,E],[M,g,T])}f=d}let l=v=>1+(a.lump??.12)*Math.sin(v[0]*5.1+h)*Math.sin(v[1]*4.3+h*1.7)*Math.sin(v[2]*3.7+h*.3),u=v=>{let d=l(v);return[o+v[0]*n*d,e+v[1]*r*d,s+v[2]*c*d]};for(let[v,d,x]of f)this.tri(u(v),u(d),u(x),i,[0,0,0],{n:[v,d,x],k:a.k})}build(){let o=new W.BufferGeometry;return o.setAttribute("position",new W.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new W.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new W.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new W.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new W.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new W.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},gt={T:(t,o,e)=>new W.Matrix4().makeTranslation(t,o,e),RX:t=>new W.Matrix4().makeRotationX(t),RY:t=>new W.Matrix4().makeRotationY(t),RZ:t=>new W.Matrix4().makeRotationZ(t),S:(t,o,e)=>new W.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new W.Matrix4)};var j={...Eo,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},$=.12,at={x0:-4.5,x1:.35,z0:.3,z1:3.9},Ut={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},bt={c:[2.45,0,1.6],a:.5},Ct={c:[2.45,0,4.55],r:.92,h:.38},t0={c:[1.5,0,-.55]},ao={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},ft=(1+Math.sqrt(5))/2;function go(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let u of[-1,1])o.push([f,l,u]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/ft,l*ft]),o.push([f/ft,l*ft,0]),o.push([f*ft,0,l/ft]);let e=t/(2/ft),s=o.map(f=>f.map(l=>l*e)),n=[];for(let f of[-1,1])for(let l of[-1,1])n.push([f,0,l*ft],[0,f*ft,l],[f*ft,l,0]);let r=n.map(f=>{let l=Math.hypot(...f),u=f.map(x=>x/l),v=Math.max(...s.map(x=>x[0]*u[0]+x[1]*u[1]+x[2]*u[2])),d=s.map((x,w)=>[w,x[0]*u[0]+x[1]*u[1]+x[2]*u[2]]).filter(([,x])=>x>v-1e-6).map(([x])=>x);return{n:u,d:v,idx:d}}),c=r[0].n,i=new P.Quaternion().setFromUnitVectors(new P.Vector3(...c),new P.Vector3(0,-1,0)),a=new P.Quaternion().setFromAxisAngle(new P.Vector3(0,1,0),.31);i.premultiply(a);let p=f=>new P.Vector3(...f).applyQuaternion(i).toArray();s=s.map(p);for(let f of r)f.n=p(f.n);let h=Math.min(...s.map(f=>f[1]));s=s.map(f=>[f[0],f[1]-h,f[2]]);for(let f of r){let l=[0,1,2].map(x=>f.idx.reduce((w,E)=>w+s[E][x],0)/f.idx.length),u=new P.Vector3(...f.n),v=new P.Vector3(...s[f.idx[0]]).sub(new P.Vector3(...l)).normalize(),d=new P.Vector3().crossVectors(u,v);f.idx.sort((x,w)=>{let E=new P.Vector3(...s[x]).sub(new P.Vector3(...l)),M=new P.Vector3(...s[w]).sub(new P.Vector3(...l));return Math.atan2(E.dot(d),E.dot(v))-Math.atan2(M.dot(d),M.dot(v))}),f.c=l,f.d=u.dot(new P.Vector3(...l))}return{V:s,faces:r,height:Math.max(...s.map(f=>f[1]))}}function Xo(){let t=new lt,o=V(14271394,j.DESK);return t.box(ao.x0,-.45,ao.z0,ao.x1,0,ao.z1,o,{top:V(15391940,j.DESK)}),t}function Zo(){let t=new lt,{x0:o,x1:e,z0:s,z1:n}=at;t.box(o,0,s,e,.04,n,V(9209210,j.CLOTH),{ao:.85}),t.box(o+.06,.04,s+.05,e-.04,$,n-.05,V(15722970,j.PAGES),{skip:["py"]});let r=22;for(let c=0;c<r;c++){let i=s+.25+c/(r-1)*(n-s-.5),a=o+.22,p=.16,h=.022,f=10;for(let l=0;l<f;l++){let u=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),d=[a+Math.cos(u)*p,$*.5+Math.sin(u)*p,i],x=[a+Math.cos(v)*p,$*.5+Math.sin(v)*p,i];o0(t,d,x,h,V(9341572,j.PLAIN))}}return t}function o0(t,o,e,s,n){let r=new P.Vector3(...o),i=new P.Vector3(...e).clone().sub(r),a=i.length(),p=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),i.normalize()),h=new P.Matrix4().compose(r,p,new P.Vector3(1,1,1));t.push(h),t.cyl(0,0,0,s,a,6,n,{caps:[!1,!1],rim:[0,0]}),t.pop()}function Jo(){let t=new lt,{x0:o,x1:e,z0:s,z1:n,h:r}=Ut,c=V(12555380,j.CLOTH),i=.05;t.box(o,0,s,e,i,n,c,{ao:.85}),t.box(o+.04,i,s+.05,e-.06,r-i,n-.05,V(15525072,j.PAGES),{skip:["py","nx"]}),t.box(o,r-i,s,e,r,n,c),t.push(gt.chain(gt.T(o+.02,r/2,(s+n)/2),gt.RX(Math.PI/2),gt.RZ(0)));let a=10;for(let p=0;p<a;p++){let h=Math.PI/2+p/a*Math.PI,f=Math.PI/2+(p+1)/a*Math.PI,l=r/2,u=(n-s)/2,v=[Math.cos(h)*l*.5,-u,Math.sin(h)*l],d=[Math.cos(f)*l*.5,-u,Math.sin(f)*l],x=[Math.cos(f)*l*.5,u,Math.sin(f)*l],w=[Math.cos(h)*l*.5,u,Math.sin(h)*l];t.quad(v,d,x,w,c,[p===0?1:0,1,p===a-1?1:0,1])}return t.pop(),t.box(o+.5,r,s+.6,o+1.6,r+.004,n-.6,V(11041118,j.CLOTH)),t}function te(){let t=new lt,o=go(bt.a),[e,,s]=bt.c,n=Ut.h,r=V(15131094,j.STONE);for(let c of o.faces){let i=c.idx.map(a=>[o.V[a][0]+e,o.V[a][1]+n,o.V[a][2]+s]);t.poly(i,r)}return{b:t,D:o}}var ro=[[0,.03],[.55,.035],[.7,.04],[.72,0],[.8,0],[.88,.12],[.96,.25],[1.02,.33],[1.03,.36],[1,.378],[.95,.36],[.9,.3],[.8,.2],[.62,.11],[.35,.075],[0,.07]],Pt=9;function oe(){let t=new lt,[o,,e]=Ct.c,s=ro.map(([c,i])=>[c*Ct.r,i]),n=s.slice(0,Pt+1),r=s.slice(Pt);return t.lathe(o,0,e,n,48,V(12105133,j.PEWTER),{edges:n.map((c,i)=>i===4||i===Pt)}),t.lathe(o,0,e,r,48,V(13223614,j.PEWTER),{edges:r.map((c,i)=>i===2)}),t}function ee(){let t=new lt,o=new P.Vector3(-3.9,.06,-.75),s=new P.Vector3(-1.3,.06,-.15).clone().sub(o),n=s.length(),r=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),s.clone().normalize());return t.push(new P.Matrix4().compose(o,r,new P.Vector3(1,1,1))),t.push(gt.RY(.3)),t.cyl(0,0,0,.06,n-.34,6,V(7307107,j.PENCIL)),t.cyl(0,n-.34,0,.06,n-.06,6,V(14467994,j.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,n-.06,0,.012,n,6,V(3815734,j.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,V(11577752,j.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,V(13209478,j.PLAIN)),t.pop(),t.pop(),t}function ne(){let t=new lt,[o,,e]=t0.c,s=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,s,28,V(5069411,j.PLAIN),{edges:s.map((r,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,V(11569762,j.WOOD)),t.push(gt.T(o,0,e));let n=10;for(let r=0;r<n;r++){let c=.15+r/n*1.4,i=.15+(r+1)/n*1.4,a=.365;t.quad([Math.cos(c)*a,.1,Math.sin(c)*a],[Math.cos(i)*a,.1,Math.sin(i)*a],[Math.cos(i)*a,.28,Math.sin(i)*a],[Math.cos(c)*a,.28,Math.sin(c)*a],V(15261900,j.PLAIN),[1,r===n-1?1:0,1,r===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var co=Math.sqrt(3)/2,K=[[1,0],[.5,co],[-.5,co],[-1,0],[-.5,-co],[.5,-co]],e0=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],n0=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],s0=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],bo=(t,o,[e,s])=>{let n=o[0]-t[0],r=o[1]-t[1];return[t[0]+e*n+s*r,t[1]+e*r-s*n]};function yo(t,o,e){let s=Math.sin(e),n=Math.cos(e),r=t[0]-o[0],c=t[1]-o[1];return[o[0]+n*r-s*c,o[1]+s*r+n*c]}function To(t,o){let e=[];for(let s=0;s<t.length-1;s++){let n=t[Math.max(0,s-1)],r=t[s],c=t[s+1],i=t[Math.min(t.length-1,s+2)];for(let a=0;a<o;a++){let p=a/o,h=p*p,f=h*p,l=(u,v,d,x)=>.5*(2*v+(-u+d)*p+(2*u-5*v+4*d-x)*h+(-u+3*v-3*d+x)*f);e.push([l(n[0],r[0],c[0],i[0]),l(n[1],r[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var qt=2*Math.PI/3;function a0(t=10){let o=To(e0.map(h=>bo(K[0],K[1],h)),t),e=To(n0.map(h=>bo(K[2],K[3],h)),t),s=To(s0.map(h=>bo(K[4],K[5],h)),t),n=o,r=e.map(h=>yo(h,K[2],qt)).reverse(),c=e,i=s.map(h=>yo(h,K[4],qt)).reverse(),a=s,p=o.map(h=>yo(h,K[0],qt)).reverse();return[n,r,c,i,a,p]}function Gt(t=10){let o=[];for(let e of a0(t))for(let s=0;s<e.length-1;s++)o.push(e[s]);return o}function r0(t,o){return{r:(t.r+o.r)%3,t:rt(t,o.t)}}function rt(t,o){let e=t.r*qt,s=Math.sin(e),n=Math.cos(e);return[n*o[0]-s*o[1]+t.t[0],s*o[0]+n*o[1]+t.t[1]]}function c0(t,o){let e=o*qt,s=Math.sin(e),n=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(n*t[0]-s*t[1]),t[1]-(s*t[0]+n*t[1])]}}function se(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,s={r:0,t:[0,0]},n=[s];o.set(e([0,0]),s);let r=[];for(;n.length;){let c=n.shift();r.push(c);for(let i of[0,2,4]){let a=rt(c,K[i]);for(let p of[1,2]){let h=r0(c0(a,p),c),f=rt(h,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,h),n.push(h))}}}return r}var X=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],yt=[{name:"left front",joint:[.6,-.02],foot:[1.33,.3],phase:0},{name:"right front",joint:[.3,-.5],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.28,.6],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.62,-.02],foot:[-1.24,-.33],phase:0}],io=[[1.06,-.46],[.95,-.69]];var Dt=[.955,.935,.885],et=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,Ft=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],ko={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[Ft(15324582),Ft(9412730),Ft(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[Ft(9071164),Ft(4149043),Ft(15124378)]},So=[.12,.11,.1],Ao=[.42,.41,.39],Tt=(t,o,e)=>{let s=Math.min(1,Math.max(0,(e-t)/(o-t)));return s*s*(3-2*s)};function i0(t=60){let o=[0];for(let r=1;r<X.length;r++)o.push(o[r-1]+Math.hypot(X[r][0]-X[r-1][0],X[r][1]-X[r-1][1]));let e=o[o.length-1],s=[],n=0;for(let r=0;r<=t;r++){let c=r/t*e;for(;n<o.length-2&&o[n+1]<c;)n++;let i=(c-o[n])/(o[n+1]-o[n]);s.push([X[n][0]+(X[n+1][0]-X[n][0])*i,X[n][1]+(X[n+1][1]-X[n][1])*i,c/e])}return s}var $t=i0(80);function ae(t,o,e,s,n,r,c,i={}){let a=new Path2D;e.forEach((u,v)=>{let d=o(u);v?a.lineTo(d[0],d[1]):a.moveTo(d[0],d[1])}),a.closePath();let p=i.noFill?0:Tt(.28,.72,n),h=i.noFill?0:Tt(.55,.95,n),f=ko[r][s];p>0&&(t.fillStyle=et(f,p),t.fill(a),t.save(),t.clip(a),r==="L"&&s===1&&l0(t,a,c,p*.55),h>0&&f0(t,o,s,r,c,h),t.restore());let l=[0,1,2].map(u=>Ao[u]+(So[u]-Ao[u])*Tt(.2,.8,n));return t.strokeStyle=et(l,.5+.5*Tt(0,.6,n)),t.lineWidth=(.011+.006*n)*c,t.lineJoin="round",t.stroke(a),a}function l0(t,o,e,s){let n={x0:-1e5,y0:-1e5};t.strokeStyle=et([.25,.24,.22],s),t.lineWidth=Math.max(.8,e*.006);let r=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let a=-i;a<c+i;a+=r)t.moveTo(a,0),t.lineTo(a+i,i);t.stroke()}function f0(t,o,e,s,n,r){let c=(s==="L"?ko.markL:ko.markC)[e],i=e===2;t.fillStyle=et(c,r*.8),t.beginPath();for(let l=0;l<$t.length;l+=1){let u=$t[l],v=u[2];if(v<.12||v>.8||l%7)continue;let d=$t[Math.max(0,l-1)],x=$t[Math.min($t.length-1,l+1)],w=Math.atan2(x[1]-d[1],x[0]-d[0]),E=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=o([u[0],u[1]]),g=o([u[0]+Math.cos(w),u[1]+Math.sin(w)]),T=Math.atan2(g[1]-M[1],g[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*E*n*.8,M[1]+Math.sin(T)*E*n*.8),t.ellipse(M[0],M[1],E*n*.8,E*n*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=et(c,r*.35);let a=Math.max(.6,n*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let u=-16;u<=16;u++){let v=l*.085+(u&1)*.0425,d=u*.074;if(Math.abs(v)>1.35||Math.abs(d)>1.3)continue;let x=o([v,d]);t.moveTo(x[0]+a,x[1]),t.arc(x[0],x[1],a,0,Math.PI*2)}t.fill(),t.strokeStyle=et(i?[.92,.9,.85]:[.15,.14,.12],r*.75),t.lineWidth=Math.max(.8,n*.007),t.lineCap="round",t.beginPath();for(let l of yt){let u=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],d=Math.hypot(u,v),x=u/d,w=v/d,E=[l.foot[0]-x*.16,l.foot[1]-w*.16];for(let A of[-.5,0,.5]){let L=x*Math.cos(A)-w*Math.sin(A),I=x*Math.sin(A)+w*Math.cos(A),S=o([E[0]+L*.04,E[1]+I*.04]),H=o([E[0]+L*.12,E[1]+I*.12]);t.moveTo(S[0],S[1]),t.lineTo(H[0],H[1])}let M=[l.joint[0]+u*.45,l.joint[1]+v*.45],g=o([M[0]-w*.05,M[1]+x*.05]),T=o([M[0]+w*.05,M[1]-x*.05]);t.moveTo(g[0],g[1]),t.lineTo(T[0],T[1])}t.stroke();let p=o([1.24,-.64]),h=o([1.12,-.68]),f=o([1.02,-.74]);t.beginPath(),t.moveTo(p[0],p[1]),t.quadraticCurveTo(h[0],h[1],f[0],f[1]),t.stroke();for(let l of io){let u=o(l);t.fillStyle=et(i?[.95,.93,.88]:[.98,.97,.94],r),t.beginPath(),t.arc(u[0],u[1],.045*n,0,Math.PI*2),t.fill(),t.strokeStyle=et(So,r),t.lineWidth=Math.max(.8,n*.008),t.stroke(),t.fillStyle=et(So,r),t.beginPath(),t.arc(u[0]+.008*n,u[1],.022*n,0,Math.PI*2),t.fill()}}function Ro(t,o){let{W:e,D:s,res:n,tiles:r,ring:c,toPage:i,centreDist:a,hero:p}=o,h=document.createElement("canvas");h.width=Math.round(e*n),h.height=Math.round(s*n);let f=h.getContext("2d");f.fillStyle=et(Dt),f.fillRect(0,0,h.width,h.height);let l=o.k*n;for(let u of r){let v=a(u),d=1-Tt(o.rIn,o.rOut,v);if(d>.6||v>o.rOut+1.6)continue;let x=w=>{let E=i(rt(u.pl,w));return[E[0]*n,E[1]*n]};f.beginPath(),K.forEach((w,E)=>{let M=x(w);E?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=et(Ao,.22*(1-d)*(1-Tt(o.rOut,o.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let u of r){let v=a(u),d=1-Tt(o.rIn,o.rOut,v);if(v>o.rOut+.6)continue;ae(f,w=>{let E=i(rt(u.pl,w));return[E[0]*n,E[1]*n]},c,u.pl.r,Math.max(.04,d),t,l,{noFill:u===p})}return h}var ht=1.5;function Ho(t,o,e,s=1024){let n=document.createElement("canvas");n.width=n.height=s;let r=n.getContext("2d");r.fillStyle=et(Dt),r.fillRect(0,0,s,s);let c=s/(2*ht);return ae(r,a=>[(a[0]+ht)*c,(ht-a[1])*c],o,e,1,t,c),n}var kt=jt(Lt(),1);var h0=.5;function u0(t,o,e){let s=[0],n=t.length+(e?1:0);for(let p=1;p<n;p++){let h=t[p-1],f=t[p%t.length];s.push(s[p-1]+Math.hypot(f[0]-h[0],f[1]-h[1]))}let r=s[s.length-1],c=Math.max(2,Math.round(r/o)),i=[],a=0;for(let p=0;p<(e?c:c+1);p++){let h=p/c*r;for(;a<s.length-2&&s[a+1]<h;)a++;let f=(h-s[a])/(s[a+1]-s[a]||1),l=t[a],u=t[(a+1)%t.length];i.push([l[0]+(u[0]-l[0])*f,l[1]+(u[1]-l[1])*f])}return{pts:i,length:r}}function p0(t,o){let e=[];for(let s=0;s<t.length-1;s++){let n=t[Math.max(0,s-1)],r=t[s],c=t[s+1],i=t[Math.min(t.length-1,s+2)];for(let a=0;a<o;a++){let p=a/o,h=p*p,f=h*p,l=(u,v,d,x)=>.5*(2*v+(-u+d)*p+(2*u-5*v+4*d-x)*h+(-u+3*v-3*d+x)*f);e.push([l(n[0],r[0],c[0],i[0]),l(n[1],r[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function m0(t){let o=p0(X,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let s=[],n=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;n<e.length-2&&e[n+1]<i;)n++;let a=(i-e[n])/(e[n+1]-e[n]||1);s.push([o[n][0]+(o[n+1][0]-o[n][0])*a,o[n][1]+(o[n+1][1]-o[n][1])*a])}let r=(s.length-1)*t,c=s.map((i,a)=>{let p=s[Math.max(0,a-2)],h=s[Math.min(s.length-1,a+2)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l);return[f/u,l/u]});return{pts:s,T:c,N:c.map(([i,a])=>[-a,i]),length:r,step:t}}function re(t,o,e){let s=!1;for(let n=0,r=t.length-1;n<t.length;r=n++){let c=t[n],i=t[r];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(s=!s)}return s}function ce(t,o,e){let s=1/0;for(let n=0,r=t.length-1;n<t.length;r=n++){let c=t[r],i=t[n],a=i[0]-c[0],p=i[1]-c[1],h=((o-c[0])*a+(e-c[1])*p)/(a*a+p*p||1);h=Math.max(0,Math.min(1,h));let f=c[0]+h*a-o,l=c[1]+h*p-e;s=Math.min(s,f*f+l*l)}return Math.sqrt(s)}function d0(t){let o=t.length,e=1/0,s=1/0,n=-1/0,r=-1/0;for(let l of t)e=Math.min(e,l[0]),s=Math.min(s,l[1]),n=Math.max(n,l[0]),r=Math.max(r,l[1]);let c=Math.max(n-e,r-s)*20,i=(e+n)/2,a=(s+r)/2,p=t.concat([[i-c,a-c],[i,a+c],[i+c,a-c]]),h=(l,u,v)=>{let[d,x]=p[l],[w,E]=p[u],[M,g]=p[v],T=2*(d*(E-g)+w*(g-x)+M*(x-E)),A=((d*d+x*x)*(E-g)+(w*w+E*E)*(g-x)+(M*M+g*g)*(x-E))/T,L=((d*d+x*x)*(M-w)+(w*w+E*E)*(d-M)+(M*M+g*g)*(w-d))/T;return[A,L,(d-A)**2+(x-L)**2]},f=[[o,o+1,o+2,...h(o,o+1,o+2)]];for(let l=0;l<o;l++){let[u,v]=p[l],d=[],x=new Map;for(let w of f)if((u-w[3])**2+(v-w[4])**2<w[5])for(let[E,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let g=E<M?`${E},${M}`:`${M},${E}`;x.has(g)?x.delete(g):x.set(g,[E,M])}else d.push(w);for(let[w,E]of x.values())d.push([w,E,l,...h(w,E,l)]);f=d}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function Io(t,o,e){let s=0,n=1/0;for(let u=0;u<t.pts.length;u++){let v=(t.pts[u][0]-o)**2+(t.pts[u][1]-e)**2;v<n&&(n=v,s=u)}let r=t.step,c=s*r;for(let u=0;u<4;u++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/r)),d=Math.floor(v),x=v-d,w=[t.pts[d][0]+(t.pts[d+1][0]-t.pts[d][0])*x,t.pts[d][1]+(t.pts[d+1][1]-t.pts[d][1])*x],E=[t.T[d][0]+(t.T[d+1][0]-t.T[d][0])*x,t.T[d][1]+(t.T[d+1][1]-t.T[d][1])*x],M=(o-w[0])*E[0]+(e-w[1])*E[1];c=Math.min((t.pts.length-1)*r,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/r),a=Math.floor(i),p=i-a,h=[t.pts[a][0]+(t.pts[a+1][0]-t.pts[a][0])*p,t.pts[a][1]+(t.pts[a+1][1]-t.pts[a][1])*p],f=[t.N[a][0]+(t.N[a+1][0]-t.N[a][0])*p,t.N[a][1]+(t.N[a+1][1]-t.N[a][1])*p],l=(o-h[0])*f[0]+(e-h[1])*f[1];return[c,l,Math.sqrt(n)]}function x0(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),s=Math.floor(e),n=e-s,r=c=>[c[s][0]+(c[s+1][0]-c[s][0])*n,c[s][1]+(c[s+1][1]-c[s][1])*n];return{p:r(t.pts),t:r(t.T),n:r(t.N)}}function lo(t,o,e,s){let n=x0(t,o),r=e-n.p[0],c=s-n.p[1];return[r*n.t[0]+c*n.t[1],r*n.n[0]+c*n.n[1]]}function ie(t){let o=u0(Gt(14),.018,!0).pts,e=o.map(m=>m.slice()),s=e.length,n=.04,r=3,c=()=>(r=r*16807%2147483647)/2147483647-.5;for(let m=-40;m<=40;m++)for(let y=-40;y<=40;y++){let b=y*n+(m&1)*n*.5+c()*.002,k=m*n*.866+c()*.002;Math.abs(b)>1.5||Math.abs(k)>1.5||re(o,b,k)&&(ce(o,b,k)<n*.55||e.push([b,k]))}let i=d0(e).filter(([m,y,b])=>{let k=(e[m][0]+e[y][0]+e[b][0])/3,C=(e[m][1]+e[y][1]+e[b][1])/3;return re(o,k,C)}),a=e.length,p=new Float32Array(a);for(let m=0;m<a;m++)p[m]=m<s?0:ce(o,e[m][0],e[m][1]);let h=m0(t),f=new Float32Array(a),l=new Float32Array(a),u=new Float32Array(a);for(let m=0;m<a;m++){let[y,b,k]=Io(h,e[m][0],e[m][1]);f[m]=y,l[m]=b,u[m]=k}let v=new Float32Array(a);for(let m=0;m<a;m++){if(m<s)continue;let y=p[m],b=f[m]/h.length,k=.035*Math.exp(-((l[m]/.07)**2))*Math.min(1,y/.12)*(b>.15&&b<.9?1:.4),C=0;for(let q of io)C+=.075*Math.exp(-(((e[m][0]-q[0])**2+(e[m][1]-q[1])**2)/.05**2));v[m]=h0*Math.sqrt(y)*(y<.03?.75+y/.03*.25:1)+k+C*Math.min(1,y/.05)}let d=Array.from({length:a},()=>new Set);for(let[m,y,b]of i)d[m].add(y).add(b),d[y].add(m).add(b),d[b].add(m).add(y);for(let m=0;m<10;m++){let y=v.slice();for(let b=s;b<a;b++){let k=0,C=0;for(let q of d[b])k+=v[q],C++;C&&(y[b]=v[b]*.5+k/C*.5)}v=y}let x=Io(h,-.62,.46)[0],w=new Int8Array(a).fill(-1),E=new Float32Array(a),M=yt.map(m=>{let y=Math.max(x,Io(h,m.joint[0],m.joint[1])[0]),[b,k]=lo(h,y,m.joint[0],m.joint[1]);return{s:y,a:b,l:k}}),g=new Float32Array(a),T=new Float32Array(a);for(let m=0;m<a;m++){let[y,b]=e[m],k=-1,C=1/0,q=0;if(yt.forEach((G,J)=>{let Y=G.foot[0]-G.joint[0],Q=G.foot[1]-G.joint[1],Wt=Y*Y+Q*Q,It=((y-G.joint[0])*Y+(b-G.joint[1])*Q)/Wt,no=Math.max(0,Math.min(1,It)),so=Math.hypot(G.joint[0]+Y*no-y,G.joint[1]+Q*no-b);so<C&&(C=so,k=J,q=It)}),k>=0&&q>-.12&&C<u[m]+.02&&C<.3){w[m]=k;let G=Math.min(1,Math.max(0,(q+.08)/.53)),J=Math.min(1,Math.max(0,(.3-C)/.13));E[m]=G*G*(3-2*G)*J*J*(3-2*J);let[Y,Q]=lo(h,M[k].s,y,b);g[m]=Y,T[m]=Q}}let A=new Float32Array(a),L=new Float32Array(a),I=new Float32Array(a),S=new Float32Array(a),H=new Float32Array(a),_=new Float32Array(a),U=(m,y,b)=>{let k=Math.min(1,Math.max(0,(b-m)/(y-m)));return k*k*(3-2*k)};for(let m=0;m<a;m++){A[m]=Math.max(x,f[m]);let[y,b]=lo(h,A[m],e[m][0],e[m][1]);if(L[m]=y,I[m]=b,w[m]<0&&f[m]<x){S[m]=.75*U(.42,.1,u[m])*U(x,x-.5,f[m]);let[k,C]=lo(h,f[m],e[m][0],e[m][1]);H[m]=k,_[m]=C}}let O=new Float32Array(a*2);for(let m=0;m<a;m++)O[m*2]=(e[m][0]+ht)/(2*ht),O[m*2+1]=(e[m][1]+ht)/(2*ht);let ct=[];for(let[m,y,b]of i)(e[y][0]-e[m][0])*(e[b][1]-e[m][1])-(e[y][1]-e[m][1])*(e[b][0]-e[m][0])>0?ct.push(m,y,b):ct.push(m,b,y);let Z=new kt.BufferGeometry;return Z.setAttribute("position",new kt.Float32BufferAttribute(new Float32Array(a*3),3)),Z.setAttribute("normal",new kt.Float32BufferAttribute(new Float32Array(a*3),3)),Z.setAttribute("uv",new kt.Float32BufferAttribute(O,2)),Z.setAttribute("aDist",new kt.Float32BufferAttribute(p,1)),Z.setIndex(ct),{geo:Z,n:a,nb:s,pts:e,ring:o,S:f,Lat:l,h:v,dist:p,legIdx:w,legW:E,legA:g,legL:T,joints:M,sAtt:A,along:L,across:I,tailW:S,tailA:H,tailL:_,spine:h,tris:i}}var St=.004,nt=(t,o)=>[t[0]-o[0],t[1]-o[1]],Nt=(t,o)=>[t[0]+o[0],t[1]+o[1]],ut=(t,o)=>[t[0]*o,t[1]*o],Co=t=>Math.hypot(t[0],t[1]),Kt=t=>ut(t,1/(Co(t)||1));function v0(t,o,e){let s=[t[0]];for(let n=1;n<t.length-1;n++){let r=t[n-1],c=t[n],i=t[n+1],a=Kt(nt(c,r)),p=Kt(nt(i,c)),h=a[0]*p[1]-a[1]*p[0],f=Math.max(-1,Math.min(1,a[0]*p[0]+a[1]*p[1])),l=Math.acos(f);if(l<.001){s.push(c);continue}let v=(h>0?e:o)*Math.tan(l/2);v=Math.min(v,Co(nt(c,r))*.48,Co(nt(i,c))*.48);let d=v/Math.tan(l/2),x=nt(c,ut(a,v)),w=Nt(c,ut(p,v)),E=h>0?[-a[1],a[0]]:[a[1],-a[0]],M=Nt(x,ut(E,d)),g=Math.atan2(x[1]-M[1],x[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),A=T-g;for(;A>Math.PI;)A-=2*Math.PI;for(;A<-Math.PI;)A+=2*Math.PI;let L=Math.max(2,Math.ceil(Math.abs(A)*d/.01));for(let I=0;I<=L;I++){let S=g+A*I/L;s.push([M[0]+Math.cos(S)*d,M[1]+Math.sin(S)*d])}}return s.push(t[t.length-1]),s}function le(t,o,e=2,s=!0){let n=[0];for(let p=1;p<t.length;p++){let h=0;for(let f=0;f<e;f++)h+=(t[p][f]-t[p-1][f])**2;n.push(n[p-1]+Math.sqrt(h))}let r=n[n.length-1],c=Math.floor(r/o+1e-9),i=[],a=0;for(let p=0;p<=c;p++){let h=p*o;for(;a<n.length-2&&n[a+1]<h;)a++;let f=(h-n[a])/(n[a+1]-n[a]||1);i.push(t[a].map((l,u)=>l+(t[a+1][u]-l)*f))}return s&&r-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function M0(t){let o=go(bt.a),[e,,s]=bt.c,n=Ut.h,r=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],u=f.n[1],v=f.n[2],d=f.d+l*e+u*n+v*s-v*t,x=E=>l*E[0]+u*E[1]<=d+1e-9,w=[];for(let E=0;E<r.length;E++){let M=r[E],g=r[(E+1)%r.length],T=x(M),A=x(g);if(T&&w.push(M),T!==A){let L=l*M[0]+u*M[1]-d,I=l*g[0]+u*g[1]-d,S=L/(L-I);w.push([M[0]+(g[0]-M[0])*S,M[1]+(g[1]-M[1])*S])}}r=w}let c=r.filter(f=>Math.abs(f[1]-n)<1e-6),i=Math.min(...c.map(f=>f[0])),a=Math.max(...c.map(f=>f[0])),p=r.findIndex(f=>Math.abs(f[1]-n)<1e-6&&Math.abs(f[0]-a)<1e-9),h=[];for(let f=0;f<r.length;f++){let l=r[(p+f)%r.length];if(h.push(l),Math.abs(l[1]-n)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:h.reverse(),xl:i,xr:a,top:Math.max(...r.map(f=>f[1]))}}function w0(t,o){let e=Ut,s=e.h,n=$,r=[[t,n],[at.x1,n],[at.x1,0]],c=e.x0+.02,i=.1375,a=s/2;r.push([c-i,0],[c-i,a]);for(let h=7;h<12;h++){let f=h/12*Math.PI;r.push([c-i*Math.sin(f),a-a*Math.cos(f)])}r.push([c,s]);let p=M0(bt.c[2]);for(let h of p.chain)r.push(h);return r.push([e.x1,s],[e.x1,s-.05],[e.x1-.06,s-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:r.map(([h,f])=>[h-t,f]),top:p.top}}function E0(t,o){let e=Ct.c[0],s=Ct.r,n=ro.slice(4,Pt+1),r=ro.slice(Pt),c=[[t,0]];for(let[i,a]of n)c.push([e+i*s,a]);for(let[i,a]of r.slice(1))c.push([e+i*s,a]);for(let[i,a]of r.slice().reverse().slice(1))c.push([e-i*s,a]);for(let[i,a]of n.slice().reverse().slice(1))c.push([e-i*s,a]);return c.push([o,0]),c.map(([i,a])=>[t-i,a])}function Lo(t,o,e,s=.07,n=.15){let r=v0(e,s,n),c=[],i=le(r,St/2);for(let a=0;a<i.length;a++){let p=i[Math.max(0,a-1)],h=i[Math.min(i.length-1,a+1)],f=Kt(nt(h,p)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[a][0],i[a][1],t[1]+o[1]*i[a][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function Mt(t,o){return t.map(([e,s])=>[e,o,s,0,1,0])}function Fo(t,o,e,s,n=200){let r=[];for(let c=0;c<=n;c++){let i=c/n,a=1-i;r.push([a*a*a*t[0]+3*a*a*i*o[0]+3*a*i*i*e[0]+i*i*i*s[0],a*a*a*t[1]+3*a*a*i*o[1]+3*a*i*i*e[1]+i*i*i*s[1]])}return r}function Po(t,o,e,s){let n=nt(t,ut(o,s)),r=Nt(t,ut(e,s));return Fo(n,Nt(n,ut(o,s*.552)),nt(r,ut(e,s*.552)),r,60)}var g0={zA:bt.c[2],xA0:-.35,xC1:4.75,zC:Ct.c[2],xD:-1.05,zD1:3.2,r:.55};function fe(t){let o=g0,e=[],s={};e.push(Mt(t,$));let n=t[t.length-1],r=t[t.length-6],c=Kt(nt(n,r)),i=[o.xA0,o.zA];e.push(Mt(Fo(n,Nt(n,ut(c,.35)),nt(i,[.35,0]),i),$));let a=[o.xC1,o.zA],p=w0(o.xA0,o.xC1-o.r),h=Lo([o.xA0,o.zA],[1,0],p.P);s.topY=p.top,e.push(h),e.push(Mt(Po(a,[1,0],[0,1],o.r),0));let f=[o.xC1,o.zC];e.push(Mt([[a[0],a[1]+o.r],[f[0],f[1]-o.r]],0)),e.push(Mt(Po(f,[0,1],[-1,0],o.r),0));let l=[o.xD,o.zC],u=E0(f[0]-o.r,l[0]+o.r);e.push(Lo([f[0]-o.r,o.zC],[-1,0],u,.05,.12)),e.push(Mt(Po(l,[-1,0],[0,-1],o.r),0));let v=[o.xD,o.zD1],d=l[1]-o.r,x=[[0,0],[d-at.z1,0],[d-at.z1,$],[d-v[1],$]];e.push(Lo([o.xD,d],[0,-1],x));let w=t[0],E=t[5],M=Kt(nt(E,w));e.push(Mt(Fo(v,Nt(v,[0,-.6]),nt(w,ut(M,.6)),w),$)),e.push(Mt(t,$));let g=[];for(let m of e)for(let y of m){let b=g[g.length-1];b&&Math.hypot(y[0]-b[0],y[1]-b[1],y[2]-b[2])<1e-6||g.push(y)}let T=t.length,A=g.slice(0,T),L=g.slice(g.length-T),I=le(g.slice(T-1,g.length-T+1),St,3,!1),S=A.concat(I.slice(1,I.length-1),L),H=S.length,_=new Float32Array(H*3),U=new Float32Array(H*3),O=new Float32Array(H*3),ct=new Float32Array(H*3);for(let m=0;m<H;m++){let y=S[Math.max(0,m-2)],b=S[Math.min(H-1,m+2)],k=b[0]-y[0],C=b[1]-y[1],q=b[2]-y[2],G=Math.hypot(k,C,q)||1;k/=G,C/=G,q/=G;let J=S[m][3],Y=S[m][4],Q=S[m][5],Wt=J*k+Y*C+Q*q;J-=Wt*k,Y-=Wt*C,Q-=Wt*q;let It=Math.hypot(J,Y,Q)||1;J/=It,Y/=It,Q/=It;let no=Y*q-Q*C,so=Q*k-J*q,Ve=J*C-Y*k;_.set([S[m][0],S[m][1],S[m][2]],m*3),U.set([k,C,q],m*3),ct.set([J,Y,Q],m*3),O.set([no,so,Ve],m*3)}for(let m of[ct,O]){let y=m.slice();for(let b=2;b<H-2;b++)for(let k=0;k<3;k++)m[b*3+k]=(y[(b-2)*3+k]+y[(b-1)*3+k]*2+y[b*3+k]*3+y[(b+1)*3+k]*2+y[(b+2)*3+k])/9}let Z=0;for(let m=0;m<H;m++)_[m*3+1]>_[Z*3+1]&&(Z=m);return s.top=Z*St,{pos:_,T:U,B:O,N:ct,n:H,length:(H-1)*St,marks:s}}function fo(t,o,e){let s=Math.min(t.n-1.0001,Math.max(0,o/St)),n=Math.floor(s),r=s-n;for(let c of["pos","T","B","N"]){let i=t[c],a=e[c];a[0]=i[n*3]+(i[n*3+3]-i[n*3])*r,a[1]=i[n*3+1]+(i[n*3+4]-i[n*3+1])*r,a[2]=i[n*3+2]+(i[n*3+5]-i[n*3+2])*r}return e}function he(t,o){let e=document.getElementById("frame"),s=()=>{let r=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),a=(c?c.offsetHeight:0)+6+13,p=(i?i.offsetHeight:0)+8+13,h=window.innerWidth-r*2,f=window.innerHeight-a-p,l=f,u=l*t;u>h&&(u=h,l=u/t),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),e.style.width=`${u}px`,e.style.height=`${l}px`,e.style.top=`${a+Math.max(0,(f-l)/2)}px`,o?.(u,l)};return window.addEventListener("resize",s),s(),s}function ue(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let s=n=>{n?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(n))};o?.addEventListener("click",()=>s(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>s(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&s(!1)})}function pe(t,o,e){let s=n=>{for(let[r,c]of t)r.setAttribute("aria-pressed",String(c===n));o(n)};for(let[n,r]of t)n.addEventListener("click",()=>s(r));return e!==void 0&&s(e),s}function me(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function de(t,o=!0){let e=document.getElementById("btn-play"),s=n=>{o=n,e&&(e.setAttribute("aria-pressed",String(!n)),e.querySelector("span").textContent=n?"Pause":"Play",e.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),t(n)};return e?.addEventListener("click",()=>s(!o)),s(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),s}function xe(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function ve(){document.body.classList.add("ready")}var b0=performance.now(),Ae={},Et=t=>{Ae[t]=Math.round(performance.now()-b0)},y0=1.4,z=.42,Me=[-.95,1.7],Ot=document.getElementById("scene"),oo=new R.WebGLRenderer({canvas:Ot,antialias:!0});oo.setPixelRatio(Math.min(window.devicePixelRatio||1,2));oo.setClearColor(15525333,1);var eo=new R.Scene,Jt=$o(),T0=Yo(Jt),k0=oo.capabilities.getMaxAnisotropy();function Ht(t,o=T0){let e=new R.Mesh(t.build(),o);return e.frustumCulled=!1,eo.add(e),e}Ht(Xo());Ht(Zo());Ht(Jo());Ht(te().b);Ht(oe());Ht(ee());Ht(ne());Et("desk");var Re=se(9).map(t=>({pl:t,c:rt(t,[0,0])})),He=-32*(Math.PI/180),vt=null,we=1/0;for(let t of Re){if(t.pl.r!==1)continue;let o=t.pl.r*(2*Math.PI/3)+He,e=Math.hypot(t.c[0],t.c[1]),s=Math.atan2(t.c[1],t.c[0])-o;s=Math.atan2(Math.sin(s),Math.cos(s));let n=Math.abs(e-4.3)+Math.abs(s)*2.5;n<we&&(we=n,vt=t)}var Ie=-He-vt.pl.r*(2*Math.PI/3),Ee=Math.cos(Ie),ge=Math.sin(Ie),No=t=>[Ee*t[0]-ge*t[1],-(ge*t[0]+Ee*t[1])],be=rt(vt.pl,[1.24,-.66]),ye=[Me[0]-z*No(be)[0],Me[1]-z*No(be)[1]],Wo=t=>{let o=No(t);return[ye[0]+z*o[0],ye[1]+z*o[1]]},ho=t=>Wo(rt(vt.pl,t)),N={x0:at.x0+.06,z0:at.z0+.05,x1:at.x1-.04,z1:at.z1-.05};N.W=N.x1-N.x0;N.D=N.z1-N.z0;var po=Gt(10),S0=Re.filter(t=>po.every(o=>{let e=Wo(rt(t.pl,o));return e[0]>N.x0+.08&&e[0]<N.x1-.08&&e[1]>N.z0+.08&&e[1]<N.z1-.08})),Qt={W:N.W,D:N.D,res:2048/N.W,k:z,tiles:S0,ring:po,hero:vt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=Wo(t);return[o[0]-N.x0,o[1]-N.z0]}},Do=1-st(Qt.rIn,Qt.rOut,Qt.centreDist(vt));function mo(t){let o=new R.CanvasTexture(t);return o.colorSpace=R.NoColorSpace,o.anisotropy=k0,o.generateMipmaps=!0,o.minFilter=R.LinearMipmapLinearFilter,o}Et("layout");var A0=Ro("L",Qt);Et("pageL");var R0=Ro("C",Qt);Et("pageC");var H0=vo(Jt,mo(A0),mo(R0));{let t=new R.BufferGeometry,o=$+4e-4;t.setAttribute("position",new R.Float32BufferAttribute([N.x0,o,N.z0,N.x0,o,N.z1,N.x1,o,N.z1,N.x1,o,N.z0],3)),t.setAttribute("normal",new R.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new R.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new R.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new R.Mesh(t,H0);e.frustumCulled=!1,eo.add(e)}var B=ie(St/z);Et("lizard");var At=B.spine.length,I0=B.spine.pts.map(t=>ho(t)),pt=fe(I0);Et("path");var Rt=vo(Jt,mo(Ho("L",po,vt.pl.r)),mo(Ho("C",po,vt.pl.r)),{contourStep:.05,uvScale:2*ht*z});{let t=(c,i,a)=>st(c,i,a),o=[.42,.41,.39],e=[.12,.11,.1],s=t(.2,.8,Do),n=.5+.5*t(0,.6,Do),r=o.map((c,i)=>c+(e[i]-c)*s);Rt.uniforms.uSketchLine.value.set(...r.map((c,i)=>Dt[i]+(c-Dt[i])*n)),Rt.uniforms.uSketchPaper.value.set(...Dt),Rt.uniforms.uLineW.value=(.011+.006*Do)/2}Et("hero");var jo=new R.Mesh(B.geo,Rt);jo.frustumCulled=!1;jo.renderOrder=2;eo.add(jo);var L0=.62,P0=.42,zt=3.2,Xt=At*z,mt=pt.length,Zt=Math.min(mt-1,pt.marks.top+At*z*.5),Bt=(()=>{let t=[0],o=[Xt],e=0,s=.004,n=!1;for(let r=Xt;r<mt;r+=s){let c=(a,p)=>Math.max(.22,Math.min(1,a/p)),i=L0*c(r-Xt,.5)*c(mt-r,.6)*(Math.abs(r-Zt)<.45?Math.max(.25,Math.abs(r-Zt)/.45):1);e+=s/i,!n&&r>=Zt&&(e+=zt,n=!0,t.push(e),o.push(r)),t.push(e),o.push(Math.min(mt,r+s))}return{T:t,U:o,dur:e}})();function C0(t){let{T:o,U:e}=Bt;if(t<=0)return e[0];if(t>=Bt.dur)return e[e.length-1];let s=0,n=o.length-1;for(;n-s>1;){let c=s+n>>1;o[c]<=t?s=c:n=c}let r=(t-o[s])/(o[n]-o[s]||1);return e[s]+(e[n]-e[s])*r}var to=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",Bt.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],zo=0;for(let t of to)t.start=zo,zo+=t[1];var uo=zo;function st(t,o,e){let s=Math.min(1,Math.max(0,(e-t)/(o-t)));return s*s*(3-2*s)}function F0(t){t=(t%uo+uo)%uo;let o=to[0];for(let n of to)t>=n.start&&(o=n);let e=(t-o.start)/o[1],s={fill:0,relief:0,u:Xt,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":s.fill=st(0,1,e);break;case"relief":s.fill=1,s.relief=.35*st(0,1,e);break;case"rise":s.fill=1,s.relief=.35+.65*st(0,1,e);break;case"walk":{s.fill=1,s.relief=1;let n=e*Bt.dur;s.u=C0(n);let r=n-Bt.T[Bt.U.findIndex(c=>c>=Zt)];Math.abs(s.u-Zt)<1e-4&&r>=0&&r<=zt&&(s.pauseT=r);break}case"settle":s.fill=1,s.relief=1,s.u=mt;break;case"sink":s.fill=1,s.relief=1-st(0,1,e),s.u=mt;break;case"unfill":s.fill=1-st(0,1,e),s.u=mt;break}return s}var ot={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},Te=B.geo.getAttribute("position"),Yt=At*.79,D0=B.joints.map(t=>t.l>0?-1:1),F={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]};function N0(t){let o=t.u>=mt-1e-6?mt:t.u,e=Math.max(0,o-Xt),s=2*Math.PI*e/P0,n=st(0,.3,e)*st(0,.35,mt-o)*(t.pauseT>=0?0:1),r=.38*n,c=t.pauseT>=0?.55*Math.sin(t.pauseT/zt*Math.PI*2)*st(0,.5,t.pauseT)*st(zt,zt-.5,t.pauseT):0,i=t.pauseT>=0?.12*Math.sin(t.pauseT/zt*Math.PI):0,a=t.relief,p=Te.array;for(let h=0;h<B.n;h++){let f=B.sAtt[h],l=B.along[h],u=B.across[h],v=B.h[h];if(u+=.05*n*Math.sin(s)*Math.cos(2*Math.PI*(f/At-.45)),f>Yt&&(c||i)){let I=st(Yt,Yt+.3,f),S=f+l-Yt,H=c*I,_=Math.cos(H),U=Math.sin(H),O=Yt+S*_-u*U;u=S*U+u*_,l=O-f,v+=i*I*(S/.5)}fo(pt,o-(At-f)*z,ot);let d=ot.pos[0]+(ot.T[0]*l+ot.B[0]*u)*z,x=ot.pos[1]+(ot.T[1]*l+ot.B[1]*u)*z,w=ot.pos[2]+(ot.T[2]*l+ot.B[2]*u)*z,E=ot.N[0],M=ot.N[1],g=ot.N[2],T=B.tailW[h];if(T>0){fo(pt,o-(At-B.S[h])*z,F);let I=B.tailA[h],S=B.tailL[h];d+=(F.pos[0]+(F.T[0]*I+F.B[0]*S)*z-d)*T,x+=(F.pos[1]+(F.T[1]*I+F.B[1]*S)*z-x)*T,w+=(F.pos[2]+(F.T[2]*I+F.B[2]*S)*z-w)*T,E+=(F.N[0]-E)*T,M+=(F.N[1]-M)*T,g+=(F.N[2]-g)*T}let A=B.legIdx[h];if(A>=0){let I=yt[A],S=B.joints[A],H=B.legW[h],_=s+I.phase,U=D0[A]*r*Math.sin(_),O=B.legA[h]-S.a,ct=B.legL[h]-S.l,Z=Math.cos(U),m=Math.sin(U),y=S.a+O*Z-ct*m,b=S.l+O*m+ct*Z;fo(pt,o-(At-S.s)*z,F);let k=F.pos[0]+(F.T[0]*y+F.B[0]*b)*z,C=F.pos[1]+(F.T[1]*y+F.B[1]*b)*z,q=F.pos[2]+(F.T[2]*y+F.B[2]*b)*z;d+=(k-d)*H,x+=(C-x)*H,w+=(q-w)*H,E+=(F.N[0]-E)*H,M+=(F.N[1]-M)*H,g+=(F.N[2]-g)*H,v+=.09*H*Math.max(0,Math.cos(_))*n}let L=v*z*a+.0015;p[h*3]=d+E*L,p[h*3+1]=x+M*L,p[h*3+2]=w+g*L}Te.needsUpdate=!0,B.geo.computeVertexNormals(),Rt.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Rt.uniforms.uFill.value=t.fill}var z0=10631978,wt=new R.Group,_o=new R.MeshBasicMaterial({color:z0,transparent:!0,opacity:0,depthWrite:!1,side:R.DoubleSide});function Le(t,o,e=0,s=0){let n=[],r=[],c=0,i=!0,a=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),a+=c,e&&a>(i?e:s)&&(i=!i,a=0);let l=t[f];if(n.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let u=(f-1)*2;r.push(u,u+1,u+2,u+1,u+3,u+2)}}let p=new R.BufferGeometry;p.setAttribute("position",new R.Float32BufferAttribute(n,3)),p.setIndex(r);let h=new R.Mesh(p,_o);return h.frustumCulled=!1,h}function ke(t,o,e,s,n){let r=o?t.concat([t[0]]):t,c=r.map((i,a)=>{let p=r[Math.max(0,a-1)],h=r[Math.min(r.length-1,a+1)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l)||1;return[i[0],$+.003,i[1],-l/u,0,f/u]});return Le(c,e,s,n)}{let t=Gt(10).map(e=>ho(e));wt.add(ke(t,!0,.009,.05,.03)),wt.add(ke(K.map(e=>ho(e)),!0,.005,.03,.03));for(let e of[0,2,4]){let s=ho(K[e]),n=new R.Mesh(new R.CircleGeometry(.04,20),_o);n.rotation.x=-Math.PI/2,n.position.set(s[0],$+.004,s[1]),wt.add(n)}let o=[];for(let e=0;e<pt.n;e+=4){let s=pt.pos,n=pt.N,r=pt.B;o.push([s[e*3]+n[e*3]*.006,s[e*3+1]+n[e*3+1]*.006,s[e*3+2]+n[e*3+2]*.006,r[e*3],r[e*3+1],r[e*3+2]])}wt.add(Le(o,.007,.07,.05)),wt.renderOrder=5,wt.visible=!1,eo.add(wt)}var xt=new R.OrthographicCamera(-1,1,1,-1,1,400),Bo={H:5.9,target:new R.Vector3(.15,.3,2.35)},xo=1,Vo=1;function Pe(){let t=Bo.target;xt.position.set(t.x+100,t.y+100,t.z+100),xt.up.set(0,1,0),xt.lookAt(t);let o=Bo.H/2;xt.left=-o*(xo/Vo),xt.right=o*(xo/Vo),xt.top=o,xt.bottom=-o,xt.updateProjectionMatrix()}he(y0,(t,o)=>{xo=t,Vo=o,oo.setSize(t,o),Pe()});ue();var D={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},Ce=pe([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{D.lithoTarget=t},1),Fe=document.getElementById("btn-reveal");function Uo(t){D.revealTarget=t?1:0,Fe.setAttribute("aria-pressed",String(t))}Fe.addEventListener("click",()=>Uo(!D.revealTarget));var De=de(t=>{D.playing=t});me({" ":()=>De(!D.playing),l:()=>Ce(D.lithoTarget?0:1),r:()=>Uo(!D.revealTarget),ArrowRight:()=>{D.t+=1},ArrowLeft:()=>{D.t-=1},0:()=>{D.t=0}});var Vt=null;Ot.addEventListener("pointerdown",t=>{Ot.setPointerCapture(t.pointerId),Vt={x:t.clientX}});Ot.addEventListener("pointermove",t=>{Vt&&(D.t+=(t.clientX-Vt.x)/Math.max(200,xo)*22,Vt.x=t.clientX)});var Ne=()=>{Vt=null};Ot.addEventListener("pointerup",Ne);Ot.addEventListener("pointercancel",Ne);var Se=performance.now(),Oo="",ze=0;function Be(t){ze++;let o=Math.min(.05,Math.max(0,(t-Se)/1e3));Se=t,D.playing&&!Vt&&(D.t+=o);for(let[n,r]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=D[r]-D[n];D[n]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}Jt.uLitho.value=D.litho,Jt.uTime.value=t/1e3;let e=F0(D.t);N0(e),Rt.uniforms.uContours.value=D.reveal*Math.min(1,e.relief*3),_o.opacity=D.reveal*.9,wt.visible=D.reveal>.01;let s=D.reveal>.5?e.phase[2]:"";s!==Oo&&(xe(!!s,s),Oo=s),oo.render(eo,xt),requestAnimationFrame(Be)}Et("ready");ve();requestAnimationFrame(Be);window.__page={state:D,VIEW:Bo,updateCamera:Pe,TOTAL:uo,PHASES:to,setPlaying:De,setLitho:t=>{Ce(t?1:0),D.litho=t?1:0},setReveal:t=>{Uo(t),D.reveal=t?1:0},at:(t,o=0)=>{let e=to.find(s=>s[0]===t);D.t=e.start+e[1]*o},path:pt,hero:vt,L:B,TIMES:Ae,get frames(){return ze},get label(){return Oo}};})();
