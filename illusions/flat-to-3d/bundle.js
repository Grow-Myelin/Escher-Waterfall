(()=>{var O0=Object.create;var qo=Object.defineProperty;var W0=Object.getOwnPropertyDescriptor;var j0=Object.getOwnPropertyNames;var _0=Object.getPrototypeOf,U0=Object.prototype.hasOwnProperty;var q0=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var G0=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of j0(o))!U0.call(t,s)&&s!==e&&qo(t,s,{get:()=>o[s],enumerable:!(n=W0(o,s))||n.enumerable});return t};var qt=(t,o,e)=>(e=t!=null?O0(_0(t)):{},G0(o||!t||!t.__esModule?qo(e,"default",{value:t,enumerable:!0}):e,t));var Pt=q0((Ve,Go)=>{Go.exports=window.THREE});var R=qt(Pt(),1);var tt=qt(Pt(),1);function $o(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new tt.Vector3(.1,.9,.66).normalize()},uPaper:{value:new tt.Vector3(.925,.898,.835)},uInk:{value:new tt.Vector3(.11,.1,.09)},uHaze:{value:new tt.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var Ko=`
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
`,$0=`
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
`,K0=`
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
`,Y0=`
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
${$0}

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
`;function Yo(t,o={}){return new tt.ShaderMaterial({uniforms:t,vertexShader:K0,fragmentShader:Y0,transparent:!!o.transparent,side:o.side??tt.FrontSide})}var Q0=`
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
`,X0=`
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
`;function vo(t,o,e,n={}){return new tt.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new tt.Vector3(.955,.935,.885)},uSketchLine:{value:new tt.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:Q0,fragmentShader:X0,transparent:!!n.transparent,side:n.side??tt.FrontSide})}var P=qt(Pt(),1);var W=qt(Pt(),1),Z0=1e3,Eo={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function J0(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function V(t,o=Eo.PLAIN,e={}){return{c:typeof t=="number"?J0(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var Qo=["px","nx","py","ny","pz","nz"];function dt(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function Mo(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function Gt(t){return Math.hypot(t[0],t[1],t[2])}function lt(t){let o=Gt(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function wo(t,o){let e=Math.abs(o[0]),n=Math.abs(o[1]),s=Math.abs(o[2]);return e>=n&&e>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var ft=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new W.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new W.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,n=o[0],s=o[1],a=o[2];return[e[0]*n+e[4]*s+e[8]*a+e[12],e[1]*n+e[5]*s+e[9]*a+e[13],e[2]*n+e[6]*s+e[10]*a+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,n=o[0],s=o[1],a=o[2];return lt([e[0]*n+e[3]*s+e[6]*a,e[1]*n+e[4]*s+e[7]*a,e[2]*n+e[5]*s+e[8]*a])}tri(o,e,n,s,a=[1,1,1],c={}){let i=this._tp(o),r=this._tp(e),p=this._tp(n),h=lt(Mo(dt(e,o),dt(n,o))),f=c.uv||[wo(o,h),wo(e,h),wo(n,h)],l=lt(Mo(dt(r,i),dt(p,i))),u=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=Gt(Mo(dt(r,i),dt(p,i))),d=[v/(Gt(dt(p,r))||1),v/(Gt(dt(i,p))||1),v/(Gt(dt(r,i))||1)],x=c.k||[1,1,1],w=s.s||0,E=[i,r,p];for(let M=0;M<3;M++){let g=E[M];this.pos.push(g[0]+w,g[1]+w,g[2]+w),this.nrm.push(u[M][0],u[M][1],u[M][2]),this.col.push(s.c[0]*x[M],s.c[1]*x[M],s.c[2]*x[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)a[T]?this.edg.push(M===T?d[T]:0):this.edg.push(Z0);this.mat.push(s.p,s.f,s.w)}}quad(o,e,n,s,a,c=[1,1,1,1],i={}){let r=i.k||[1,1,1,1],p=i.n,h=i.uv;this.tri(o,e,n,a,[c[1],0,c[0]],{k:[r[0],r[1],r[2]],n:p&&[p[0],p[1],p[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(o,n,s,a,[c[2],c[3],0],{k:[r[0],r[2],r[3]],n:p&&[p[0],p[2],p[3]],uv:h&&[h[0],h[2],h[3]]})}box(o,e,n,s,a,c,i,r={}){o>s&&([o,s]=[s,o]),e>a&&([e,a]=[a,e]),n>c&&([n,c]=[c,n]);let p=new Set(r.open||[]),h=new Set(r.skip||[]);r.bottom||h.add("ny");let f=r.ao??1,l=r.aoTop??1,u={px:[0,s],nx:[0,o],py:[1,a],ny:[1,e],pz:[2,c],nz:[2,n]},v={px:[[s,e,c],[s,e,n],[s,a,n],[s,a,c]],nx:[[o,e,n],[o,e,c],[o,a,c],[o,a,n]],pz:[[o,e,c],[s,e,c],[s,a,c],[o,a,c]],nz:[[s,e,n],[o,e,n],[o,a,n],[s,a,n]],py:[[o,a,c],[s,a,c],[s,a,n],[o,a,n]],ny:[[o,e,n],[s,e,n],[s,e,c],[o,e,c]]};for(let d of Qo){if(h.has(d)||p.has(d))continue;let x=v[d],w=[];for(let g=0;g<4;g++){let T=x[g],A=x[(g+1)%4],L=1;for(let I of Qo){if(I===d)continue;let[S,H]=u[I];Math.abs(T[S]-H)<1e-9&&Math.abs(A[S]-H)<1e-9&&p.has(I)&&(L=0)}w.push(L)}let E;d==="py"||d==="ny"?E=[l,l,l,l]:E=[f,f,1,1];let M=d==="py"&&r.top?{...r.top,s:i.s}:i;this.quad(x[0],x[1],x[2],x[3],M,w,{k:E})}}cyl(o,e,n,s,a,c,i,r={}){let p=r.caps??[!0,!0],h=r.rim??[1,1],f=r.r1??s;for(let l=0;l<c;l++){let u=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,d=Math.cos(u),x=Math.sin(u),w=Math.cos(v),E=Math.sin(v),M=[o+s*d,e,n+s*x],g=[o+f*d,a,n+f*x],T=[o+f*w,a,n+f*E],A=[o+s*w,e,n+s*E],L=(s-f)/Math.max(1e-6,a-e),I=lt([d,L,x]),S=lt([w,L,E]),H=u*(s+f)/2,_=v*(s+f)/2;this.quad(M,g,T,A,i,[0,h[1],0,h[0]],{n:[I,I,S,S],uv:[[H,e],[H,a],[_,a],[_,e]],k:r.k}),p[1]&&f>0&&this.tri([o,a,n],T,g,i,[1,0,0]),p[0]&&this.tri([o,e,n],M,A,i,[1,0,0])}}lathe(o,e,n,s,a,c,i={}){let r=s.length,p=[];for(let l=0;l<r-1;l++){let u=s[l+1][0]-s[l][0],v=s[l+1][1]-s[l][1];p.push(lt([v,-u,0]))}let h=s.map((l,u)=>{let v=p[Math.max(0,u-1)],d=p[Math.min(r-2,u)];return lt([v[0]+d[0],v[1]+d[1],0])}),f=i.edges||[];for(let l=0;l<a;l++){let u=l/a*Math.PI*2,v=(l+1)/a*Math.PI*2,d=Math.cos(u),x=Math.sin(u),w=Math.cos(v),E=Math.sin(v);for(let M=0;M<r-1;M++){let[g,T]=s[M],[A,L]=s[M+1],I=[o+g*d,e+T,n+g*x],S=[o+A*d,e+L,n+A*x],H=[o+A*w,e+L,n+A*E],_=[o+g*w,e+T,n+g*E],U=i.flat?p[M]:h[M],O=i.flat?p[M]:h[M+1];this.quad(I,S,H,_,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[U[0]*d,U[1],U[0]*x],[O[0]*d,O[1],O[0]*x],[O[0]*w,O[1],O[0]*E],[U[0]*w,U[1],U[0]*E]],uv:[[u*1.2,T],[u*1.2,L],[v*1.2,L],[v*1.2,T]]})}}}poly(o,e,n={}){for(let s=1;s<o.length-1;s++)this.tri(o[0],o[s],o[s+1],e,[1,s===o.length-2?1:0,s===1?1:0],n)}blob(o,e,n,s,a,c,i,r={}){let p=r.sub??1,h=r.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<p;v++){let d=[];for(let[x,w,E]of f){let M=lt([(x[0]+w[0])/2,(x[1]+w[1])/2,(x[2]+w[2])/2]),g=lt([(w[0]+E[0])/2,(w[1]+E[1])/2,(w[2]+E[2])/2]),T=lt([(E[0]+x[0])/2,(E[1]+x[1])/2,(E[2]+x[2])/2]);d.push([x,M,T],[M,w,g],[T,g,E],[M,g,T])}f=d}let l=v=>1+(r.lump??.12)*Math.sin(v[0]*5.1+h)*Math.sin(v[1]*4.3+h*1.7)*Math.sin(v[2]*3.7+h*.3),u=v=>{let d=l(v);return[o+v[0]*s*d,e+v[1]*a*d,n+v[2]*c*d]};for(let[v,d,x]of f)this.tri(u(v),u(d),u(x),i,[0,0,0],{n:[v,d,x],k:r.k})}build(){let o=new W.BufferGeometry;return o.setAttribute("position",new W.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new W.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new W.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new W.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new W.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new W.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},bt={T:(t,o,e)=>new W.Matrix4().makeTranslation(t,o,e),RX:t=>new W.Matrix4().makeRotationX(t),RY:t=>new W.Matrix4().makeRotationY(t),RZ:t=>new W.Matrix4().makeRotationZ(t),S:(t,o,e)=>new W.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new W.Matrix4)};var j={...Eo,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},K=.12,at={x0:-4.5,x1:.35,z0:.3,z1:3.9},$t={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},yt={c:[2.45,0,1.6],a:.5},Ft={c:[2.45,0,4.55],r:.92,h:.38},te={c:[1.5,0,-.55]},ao={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},ht=(1+Math.sqrt(5))/2;function go(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let u of[-1,1])o.push([f,l,u]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/ht,l*ht]),o.push([f/ht,l*ht,0]),o.push([f*ht,0,l/ht]);let e=t/(2/ht),n=o.map(f=>f.map(l=>l*e)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*ht],[0,f*ht,l],[f*ht,l,0]);let a=s.map(f=>{let l=Math.hypot(...f),u=f.map(x=>x/l),v=Math.max(...n.map(x=>x[0]*u[0]+x[1]*u[1]+x[2]*u[2])),d=n.map((x,w)=>[w,x[0]*u[0]+x[1]*u[1]+x[2]*u[2]]).filter(([,x])=>x>v-1e-6).map(([x])=>x);return{n:u,d:v,idx:d}}),c=a[0].n,i=new P.Quaternion().setFromUnitVectors(new P.Vector3(...c),new P.Vector3(0,-1,0)),r=new P.Quaternion().setFromAxisAngle(new P.Vector3(0,1,0),.31);i.premultiply(r);let p=f=>new P.Vector3(...f).applyQuaternion(i).toArray();n=n.map(p);for(let f of a)f.n=p(f.n);let h=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-h,f[2]]);for(let f of a){let l=[0,1,2].map(x=>f.idx.reduce((w,E)=>w+n[E][x],0)/f.idx.length),u=new P.Vector3(...f.n),v=new P.Vector3(...n[f.idx[0]]).sub(new P.Vector3(...l)).normalize(),d=new P.Vector3().crossVectors(u,v);f.idx.sort((x,w)=>{let E=new P.Vector3(...n[x]).sub(new P.Vector3(...l)),M=new P.Vector3(...n[w]).sub(new P.Vector3(...l));return Math.atan2(E.dot(d),E.dot(v))-Math.atan2(M.dot(d),M.dot(v))}),f.c=l,f.d=u.dot(new P.Vector3(...l))}return{V:n,faces:a,height:Math.max(...n.map(f=>f[1]))}}function Xo(){let t=new ft,o=V(14271394,j.DESK);return t.box(ao.x0,-.45,ao.z0,ao.x1,0,ao.z1,o,{top:V(15391940,j.DESK)}),t}function Zo(){let t=new ft,{x0:o,x1:e,z0:n,z1:s}=at;t.box(o,0,n,e,.04,s,V(9209210,j.CLOTH),{ao:.85}),t.box(o+.06,.04,n+.05,e-.04,K,s-.05,V(15722970,j.PAGES),{skip:["py"]});let a=22;for(let c=0;c<a;c++){let i=n+.25+c/(a-1)*(s-n-.5),r=o+.22,p=.16,h=.022,f=10;for(let l=0;l<f;l++){let u=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),d=[r+Math.cos(u)*p,K*.5+Math.sin(u)*p,i],x=[r+Math.cos(v)*p,K*.5+Math.sin(v)*p,i];oe(t,d,x,h,V(9341572,j.PLAIN))}}return t}function oe(t,o,e,n,s){let a=new P.Vector3(...o),i=new P.Vector3(...e).clone().sub(a),r=i.length(),p=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),i.normalize()),h=new P.Matrix4().compose(a,p,new P.Vector3(1,1,1));t.push(h),t.cyl(0,0,0,n,r,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function Jo(){let t=new ft,{x0:o,x1:e,z0:n,z1:s,h:a}=$t,c=V(12555380,j.CLOTH),i=.05;t.box(o,0,n,e,i,s,c,{ao:.85}),t.box(o+.04,i,n+.05,e-.06,a-i,s-.05,V(15525072,j.PAGES),{skip:["py","nx"]}),t.box(o,a-i,n,e,a,s,c),t.push(bt.chain(bt.T(o+.02,a/2,(n+s)/2),bt.RX(Math.PI/2),bt.RZ(0)));let r=10;for(let p=0;p<r;p++){let h=Math.PI/2+p/r*Math.PI,f=Math.PI/2+(p+1)/r*Math.PI,l=a/2,u=(s-n)/2,v=[Math.cos(h)*l*.5,-u,Math.sin(h)*l],d=[Math.cos(f)*l*.5,-u,Math.sin(f)*l],x=[Math.cos(f)*l*.5,u,Math.sin(f)*l],w=[Math.cos(h)*l*.5,u,Math.sin(h)*l];t.quad(v,d,x,w,c,[p===0?1:0,1,p===r-1?1:0,1])}return t.pop(),t.box(o+.5,a,n+.6,o+1.6,a+.004,s-.6,V(11041118,j.CLOTH)),t}function t0(){let t=new ft,o=go(yt.a),[e,,n]=yt.c,s=$t.h,a=V(15131094,j.STONE);for(let c of o.faces){let i=c.idx.map(r=>[o.V[r][0]+e,o.V[r][1]+s,o.V[r][2]+n]);t.poly(i,a)}return{b:t,D:o}}var ro=[[0,.03],[.55,.035],[.7,.04],[.72,0],[.8,0],[.88,.12],[.96,.25],[1.02,.33],[1.03,.36],[1,.378],[.95,.36],[.9,.3],[.8,.2],[.62,.11],[.35,.075],[0,.07]],Ct=9;function o0(){let t=new ft,[o,,e]=Ft.c,n=ro.map(([c,i])=>[c*Ft.r,i]),s=n.slice(0,Ct+1),a=n.slice(Ct);return t.lathe(o,0,e,s,48,V(12105133,j.PEWTER),{edges:s.map((c,i)=>i===4||i===Ct)}),t.lathe(o,0,e,a,48,V(13223614,j.PEWTER),{edges:a.map((c,i)=>i===2)}),t}function e0(){let t=new ft,o=new P.Vector3(-3.9,.06,-.75),n=new P.Vector3(-1.3,.06,-.15).clone().sub(o),s=n.length(),a=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),n.clone().normalize());return t.push(new P.Matrix4().compose(o,a,new P.Vector3(1,1,1))),t.push(bt.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,V(7307107,j.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,V(14467994,j.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,V(3815734,j.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,V(11577752,j.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,V(13209478,j.PLAIN)),t.pop(),t.pop(),t}function n0(){let t=new ft,[o,,e]=te.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,n,28,V(5069411,j.PLAIN),{edges:n.map((a,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,V(11569762,j.WOOD)),t.push(bt.T(o,0,e));let s=10;for(let a=0;a<s;a++){let c=.15+a/s*1.4,i=.15+(a+1)/s*1.4,r=.365;t.quad([Math.cos(c)*r,.1,Math.sin(c)*r],[Math.cos(i)*r,.1,Math.sin(i)*r],[Math.cos(i)*r,.28,Math.sin(i)*r],[Math.cos(c)*r,.28,Math.sin(c)*r],V(15261900,j.PLAIN),[1,a===s-1?1:0,1,a===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var co=Math.sqrt(3)/2,$=[[1,0],[.5,co],[-.5,co],[-1,0],[-.5,-co],[.5,-co]],ee=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],ne=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],se=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],bo=(t,o,[e,n])=>{let s=o[0]-t[0],a=o[1]-t[1];return[t[0]+e*s+n*a,t[1]+e*a-n*s]};function yo(t,o,e){let n=Math.sin(e),s=Math.cos(e),a=t[0]-o[0],c=t[1]-o[1];return[o[0]+s*a-n*c,o[1]+n*a+s*c]}function To(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,d,x)=>.5*(2*v+(-u+d)*p+(2*u-5*v+4*d-x)*h+(-u+3*v-3*d+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var Kt=2*Math.PI/3;function ae(t=10){let o=To(ee.map(h=>bo($[0],$[1],h)),t),e=To(ne.map(h=>bo($[2],$[3],h)),t),n=To(se.map(h=>bo($[4],$[5],h)),t),s=o,a=e.map(h=>yo(h,$[2],Kt)).reverse(),c=e,i=n.map(h=>yo(h,$[4],Kt)).reverse(),r=n,p=o.map(h=>yo(h,$[0],Kt)).reverse();return[s,a,c,i,r,p]}function Yt(t=10){let o=[];for(let e of ae(t))for(let n=0;n<e.length-1;n++)o.push(e[n]);return o}function re(t,o){return{r:(t.r+o.r)%3,t:rt(t,o.t)}}function rt(t,o){let e=t.r*Kt,n=Math.sin(e),s=Math.cos(e);return[s*o[0]-n*o[1]+t.t[0],n*o[0]+s*o[1]+t.t[1]]}function ce(t,o){let e=o*Kt,n=Math.sin(e),s=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function s0(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];o.set(e([0,0]),n);let a=[];for(;s.length;){let c=s.shift();a.push(c);for(let i of[0,2,4]){let r=rt(c,$[i]);for(let p of[1,2]){let h=re(ce(r,p),c),f=rt(h,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,h),s.push(h))}}}return a}var X=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],Tt=[{name:"left front",joint:[.6,-.02],foot:[1.33,.3],phase:0},{name:"right front",joint:[.3,-.5],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.28,.6],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.62,-.02],foot:[-1.24,-.33],phase:0}],io=[[1.06,-.46],[.95,-.69]];var Nt=[.955,.935,.885],et=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,Dt=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],ko={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[Dt(15324582),Dt(9412730),Dt(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[Dt(9071164),Dt(4149043),Dt(15124378)]},So=[.12,.11,.1],Ao=[.42,.41,.39],kt=(t,o,e)=>{let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)};function ie(t=60){let o=[0];for(let a=1;a<X.length;a++)o.push(o[a-1]+Math.hypot(X[a][0]-X[a-1][0],X[a][1]-X[a-1][1]));let e=o[o.length-1],n=[],s=0;for(let a=0;a<=t;a++){let c=a/t*e;for(;s<o.length-2&&o[s+1]<c;)s++;let i=(c-o[s])/(o[s+1]-o[s]);n.push([X[s][0]+(X[s+1][0]-X[s][0])*i,X[s][1]+(X[s+1][1]-X[s][1])*i,c/e])}return n}var Qt=ie(80);function a0(t,o,e,n,s,a,c,i={}){let r=new Path2D;e.forEach((u,v)=>{let d=o(u);v?r.lineTo(d[0],d[1]):r.moveTo(d[0],d[1])}),r.closePath();let p=i.noFill?0:kt(.28,.72,s),h=i.noFill?0:kt(.55,.95,s),f=ko[a][n];p>0&&(t.fillStyle=et(f,p),t.fill(r),t.save(),t.clip(r),a==="L"&&n===1&&le(t,r,c,p*.55),h>0&&fe(t,o,n,a,c,h),t.restore());let l=[0,1,2].map(u=>Ao[u]+(So[u]-Ao[u])*kt(.2,.8,s));return t.strokeStyle=et(l,.5+.5*kt(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(r),r}function le(t,o,e,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=et([.25,.24,.22],n),t.lineWidth=Math.max(.8,e*.006);let a=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let r=-i;r<c+i;r+=a)t.moveTo(r,0),t.lineTo(r+i,i);t.stroke()}function fe(t,o,e,n,s,a){let c=(n==="L"?ko.markL:ko.markC)[e],i=e===2;t.fillStyle=et(c,a*.8),t.beginPath();for(let l=0;l<Qt.length;l+=1){let u=Qt[l],v=u[2];if(v<.12||v>.8||l%7)continue;let d=Qt[Math.max(0,l-1)],x=Qt[Math.min(Qt.length-1,l+1)],w=Math.atan2(x[1]-d[1],x[0]-d[0]),E=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=o([u[0],u[1]]),g=o([u[0]+Math.cos(w),u[1]+Math.sin(w)]),T=Math.atan2(g[1]-M[1],g[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*E*s*.8,M[1]+Math.sin(T)*E*s*.8),t.ellipse(M[0],M[1],E*s*.8,E*s*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=et(c,a*.35);let r=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let u=-16;u<=16;u++){let v=l*.085+(u&1)*.0425,d=u*.074;if(Math.abs(v)>1.35||Math.abs(d)>1.3)continue;let x=o([v,d]);t.moveTo(x[0]+r,x[1]),t.arc(x[0],x[1],r,0,Math.PI*2)}t.fill(),t.strokeStyle=et(i?[.92,.9,.85]:[.15,.14,.12],a*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of Tt){let u=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],d=Math.hypot(u,v),x=u/d,w=v/d,E=[l.foot[0]-x*.16,l.foot[1]-w*.16];for(let A of[-.5,0,.5]){let L=x*Math.cos(A)-w*Math.sin(A),I=x*Math.sin(A)+w*Math.cos(A),S=o([E[0]+L*.04,E[1]+I*.04]),H=o([E[0]+L*.12,E[1]+I*.12]);t.moveTo(S[0],S[1]),t.lineTo(H[0],H[1])}let M=[l.joint[0]+u*.45,l.joint[1]+v*.45],g=o([M[0]-w*.05,M[1]+x*.05]),T=o([M[0]+w*.05,M[1]-x*.05]);t.moveTo(g[0],g[1]),t.lineTo(T[0],T[1])}t.stroke();let p=o([1.24,-.64]),h=o([1.12,-.68]),f=o([1.02,-.74]);t.beginPath(),t.moveTo(p[0],p[1]),t.quadraticCurveTo(h[0],h[1],f[0],f[1]),t.stroke();for(let l of io){let u=o(l);t.fillStyle=et(i?[.95,.93,.88]:[.98,.97,.94],a),t.beginPath(),t.arc(u[0],u[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=et(So,a),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=et(So,a),t.beginPath(),t.arc(u[0]+.008*s,u[1],.022*s,0,Math.PI*2),t.fill()}}function Ro(t,o){let{W:e,D:n,res:s,tiles:a,ring:c,toPage:i,centreDist:r,hero:p}=o,h=document.createElement("canvas");h.width=Math.round(e*s),h.height=Math.round(n*s);let f=h.getContext("2d");f.fillStyle=et(Nt),f.fillRect(0,0,h.width,h.height);let l=o.k*s;for(let u of a){let v=r(u),d=1-kt(o.rIn,o.rOut,v);if(d>.6||v>o.rOut+1.6)continue;let x=w=>{let E=i(rt(u.pl,w));return[E[0]*s,E[1]*s]};f.beginPath(),$.forEach((w,E)=>{let M=x(w);E?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=et(Ao,.22*(1-d)*(1-kt(o.rOut,o.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let u of a){let v=r(u),d=1-kt(o.rIn,o.rOut,v);if(v>o.rOut+.6)continue;a0(f,w=>{let E=i(rt(u.pl,w));return[E[0]*s,E[1]*s]},c,u.pl.r,Math.max(.04,d),t,l,{noFill:u===p})}return h}var ut=1.5;function Ho(t,o,e,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let a=s.getContext("2d");a.fillStyle=et(Nt),a.fillRect(0,0,n,n);let c=n/(2*ut);return a0(a,r=>[(r[0]+ut)*c,(ut-r[1])*c],o,e,1,t,c),s}var St=qt(Pt(),1);var he=.5;function ue(t,o,e){let n=[0],s=t.length+(e?1:0);for(let p=1;p<s;p++){let h=t[p-1],f=t[p%t.length];n.push(n[p-1]+Math.hypot(f[0]-h[0],f[1]-h[1]))}let a=n[n.length-1],c=Math.max(2,Math.round(a/o)),i=[],r=0;for(let p=0;p<(e?c:c+1);p++){let h=p/c*a;for(;r<n.length-2&&n[r+1]<h;)r++;let f=(h-n[r])/(n[r+1]-n[r]||1),l=t[r],u=t[(r+1)%t.length];i.push([l[0]+(u[0]-l[0])*f,l[1]+(u[1]-l[1])*f])}return{pts:i,length:a}}function pe(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,d,x)=>.5*(2*v+(-u+d)*p+(2*u-5*v+4*d-x)*h+(-u+3*v-3*d+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function me(t){let o=pe(X,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let n=[],s=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;s<e.length-2&&e[s+1]<i;)s++;let r=(i-e[s])/(e[s+1]-e[s]||1);n.push([o[s][0]+(o[s+1][0]-o[s][0])*r,o[s][1]+(o[s+1][1]-o[s][1])*r])}let a=(n.length-1)*t,c=n.map((i,r)=>{let p=n[Math.max(0,r-2)],h=n[Math.min(n.length-1,r+2)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l);return[f/u,l/u]});return{pts:n,T:c,N:c.map(([i,r])=>[-r,i]),length:a,step:t}}function r0(t,o,e){let n=!1;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[s],i=t[a];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function c0(t,o,e){let n=1/0;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[a],i=t[s],r=i[0]-c[0],p=i[1]-c[1],h=((o-c[0])*r+(e-c[1])*p)/(r*r+p*p||1);h=Math.max(0,Math.min(1,h));let f=c[0]+h*r-o,l=c[1]+h*p-e;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function de(t){let o=t.length,e=1/0,n=1/0,s=-1/0,a=-1/0;for(let l of t)e=Math.min(e,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),a=Math.max(a,l[1]);let c=Math.max(s-e,a-n)*20,i=(e+s)/2,r=(n+a)/2,p=t.concat([[i-c,r-c],[i,r+c],[i+c,r-c]]),h=(l,u,v)=>{let[d,x]=p[l],[w,E]=p[u],[M,g]=p[v],T=2*(d*(E-g)+w*(g-x)+M*(x-E)),A=((d*d+x*x)*(E-g)+(w*w+E*E)*(g-x)+(M*M+g*g)*(x-E))/T,L=((d*d+x*x)*(M-w)+(w*w+E*E)*(d-M)+(M*M+g*g)*(w-d))/T;return[A,L,(d-A)**2+(x-L)**2]},f=[[o,o+1,o+2,...h(o,o+1,o+2)]];for(let l=0;l<o;l++){let[u,v]=p[l],d=[],x=new Map;for(let w of f)if((u-w[3])**2+(v-w[4])**2<w[5])for(let[E,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let g=E<M?`${E},${M}`:`${M},${E}`;x.has(g)?x.delete(g):x.set(g,[E,M])}else d.push(w);for(let[w,E]of x.values())d.push([w,E,l,...h(w,E,l)]);f=d}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function Io(t,o,e){let n=0,s=1/0;for(let u=0;u<t.pts.length;u++){let v=(t.pts[u][0]-o)**2+(t.pts[u][1]-e)**2;v<s&&(s=v,n=u)}let a=t.step,c=n*a;for(let u=0;u<4;u++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/a)),d=Math.floor(v),x=v-d,w=[t.pts[d][0]+(t.pts[d+1][0]-t.pts[d][0])*x,t.pts[d][1]+(t.pts[d+1][1]-t.pts[d][1])*x],E=[t.T[d][0]+(t.T[d+1][0]-t.T[d][0])*x,t.T[d][1]+(t.T[d+1][1]-t.T[d][1])*x],M=(o-w[0])*E[0]+(e-w[1])*E[1];c=Math.min((t.pts.length-1)*a,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/a),r=Math.floor(i),p=i-r,h=[t.pts[r][0]+(t.pts[r+1][0]-t.pts[r][0])*p,t.pts[r][1]+(t.pts[r+1][1]-t.pts[r][1])*p],f=[t.N[r][0]+(t.N[r+1][0]-t.N[r][0])*p,t.N[r][1]+(t.N[r+1][1]-t.N[r][1])*p],l=(o-h[0])*f[0]+(e-h[1])*f[1];return[c,l,Math.sqrt(s)]}function xe(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),n=Math.floor(e),s=e-n,a=c=>[c[n][0]+(c[n+1][0]-c[n][0])*s,c[n][1]+(c[n+1][1]-c[n][1])*s];return{p:a(t.pts),t:a(t.T),n:a(t.N)}}function lo(t,o,e,n){let s=xe(t,o),a=e-s.p[0],c=n-s.p[1];return[a*s.t[0]+c*s.t[1],a*s.n[0]+c*s.n[1]]}function i0(t){let o=ue(Yt(14),.018,!0).pts,e=o.map(m=>m.slice()),n=e.length,s=.04,a=3,c=()=>(a=a*16807%2147483647)/2147483647-.5;for(let m=-40;m<=40;m++)for(let y=-40;y<=40;y++){let b=y*s+(m&1)*s*.5+c()*.002,k=m*s*.866+c()*.002;Math.abs(b)>1.5||Math.abs(k)>1.5||r0(o,b,k)&&(c0(o,b,k)<s*.55||e.push([b,k]))}let i=de(e).filter(([m,y,b])=>{let k=(e[m][0]+e[y][0]+e[b][0])/3,F=(e[m][1]+e[y][1]+e[b][1])/3;return r0(o,k,F)}),r=e.length,p=new Float32Array(r);for(let m=0;m<r;m++)p[m]=m<n?0:c0(o,e[m][0],e[m][1]);let h=me(t),f=new Float32Array(r),l=new Float32Array(r),u=new Float32Array(r);for(let m=0;m<r;m++){let[y,b,k]=Io(h,e[m][0],e[m][1]);f[m]=y,l[m]=b,u[m]=k}let v=new Float32Array(r);for(let m=0;m<r;m++){if(m<n)continue;let y=p[m],b=f[m]/h.length,k=.035*Math.exp(-((l[m]/.07)**2))*Math.min(1,y/.12)*(b>.15&&b<.9?1:.4),F=0;for(let q of io)F+=.075*Math.exp(-(((e[m][0]-q[0])**2+(e[m][1]-q[1])**2)/.05**2));v[m]=he*Math.sqrt(y)*(y<.03?.75+y/.03*.25:1)+k+F*Math.min(1,y/.05)}let d=Array.from({length:r},()=>new Set);for(let[m,y,b]of i)d[m].add(y).add(b),d[y].add(m).add(b),d[b].add(m).add(y);for(let m=0;m<10;m++){let y=v.slice();for(let b=n;b<r;b++){let k=0,F=0;for(let q of d[b])k+=v[q],F++;F&&(y[b]=v[b]*.5+k/F*.5)}v=y}let x=Io(h,-.62,.46)[0],w=new Int8Array(r).fill(-1),E=new Float32Array(r),M=Tt.map(m=>{let y=Math.max(x,Io(h,m.joint[0],m.joint[1])[0]),[b,k]=lo(h,y,m.joint[0],m.joint[1]);return{s:y,a:b,l:k}}),g=new Float32Array(r),T=new Float32Array(r);for(let m=0;m<r;m++){let[y,b]=e[m],k=-1,F=1/0,q=0;if(Tt.forEach((G,J)=>{let Y=G.foot[0]-G.joint[0],Q=G.foot[1]-G.joint[1],Ut=Y*Y+Q*Q,Lt=((y-G.joint[0])*Y+(b-G.joint[1])*Q)/Ut,no=Math.max(0,Math.min(1,Lt)),so=Math.hypot(G.joint[0]+Y*no-y,G.joint[1]+Q*no-b);so<F&&(F=so,k=J,q=Lt)}),k>=0&&q>-.12&&F<u[m]+.02&&F<.3){w[m]=k;let G=Math.min(1,Math.max(0,(q+.08)/.53)),J=Math.min(1,Math.max(0,(.3-F)/.13));E[m]=G*G*(3-2*G)*J*J*(3-2*J);let[Y,Q]=lo(h,M[k].s,y,b);g[m]=Y,T[m]=Q}}let A=new Float32Array(r),L=new Float32Array(r),I=new Float32Array(r),S=new Float32Array(r),H=new Float32Array(r),_=new Float32Array(r),U=(m,y,b)=>{let k=Math.min(1,Math.max(0,(b-m)/(y-m)));return k*k*(3-2*k)};for(let m=0;m<r;m++){A[m]=Math.max(x,f[m]);let[y,b]=lo(h,A[m],e[m][0],e[m][1]);if(L[m]=y,I[m]=b,w[m]<0&&f[m]<x){S[m]=.75*U(.42,.1,u[m])*U(x,x-.5,f[m]);let[k,F]=lo(h,f[m],e[m][0],e[m][1]);H[m]=k,_[m]=F}}let O=new Float32Array(r*2);for(let m=0;m<r;m++)O[m*2]=(e[m][0]+ut)/(2*ut),O[m*2+1]=(e[m][1]+ut)/(2*ut);let it=[];for(let[m,y,b]of i)(e[y][0]-e[m][0])*(e[b][1]-e[m][1])-(e[y][1]-e[m][1])*(e[b][0]-e[m][0])>0?it.push(m,y,b):it.push(m,b,y);let Z=new St.BufferGeometry;return Z.setAttribute("position",new St.Float32BufferAttribute(new Float32Array(r*3),3)),Z.setAttribute("normal",new St.Float32BufferAttribute(new Float32Array(r*3),3)),Z.setAttribute("uv",new St.Float32BufferAttribute(O,2)),Z.setAttribute("aDist",new St.Float32BufferAttribute(p,1)),Z.setIndex(it),{geo:Z,n:r,nb:n,pts:e,ring:o,S:f,Lat:l,h:v,dist:p,legIdx:w,legW:E,legA:g,legL:T,joints:M,sAtt:A,along:L,across:I,tailW:S,tailA:H,tailL:_,spine:h,tris:i}}var At=.004,nt=(t,o)=>[t[0]-o[0],t[1]-o[1]],zt=(t,o)=>[t[0]+o[0],t[1]+o[1]],pt=(t,o)=>[t[0]*o,t[1]*o],Co=t=>Math.hypot(t[0],t[1]),Xt=t=>pt(t,1/(Co(t)||1));function ve(t,o,e){let n=[t[0]];for(let s=1;s<t.length-1;s++){let a=t[s-1],c=t[s],i=t[s+1],r=Xt(nt(c,a)),p=Xt(nt(i,c)),h=r[0]*p[1]-r[1]*p[0],f=Math.max(-1,Math.min(1,r[0]*p[0]+r[1]*p[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let v=(h>0?e:o)*Math.tan(l/2);v=Math.min(v,Co(nt(c,a))*.48,Co(nt(i,c))*.48);let d=v/Math.tan(l/2),x=nt(c,pt(r,v)),w=zt(c,pt(p,v)),E=h>0?[-r[1],r[0]]:[r[1],-r[0]],M=zt(x,pt(E,d)),g=Math.atan2(x[1]-M[1],x[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),A=T-g;for(;A>Math.PI;)A-=2*Math.PI;for(;A<-Math.PI;)A+=2*Math.PI;let L=Math.max(2,Math.ceil(Math.abs(A)*d/.01));for(let I=0;I<=L;I++){let S=g+A*I/L;n.push([M[0]+Math.cos(S)*d,M[1]+Math.sin(S)*d])}}return n.push(t[t.length-1]),n}function l0(t,o,e=2,n=!0){let s=[0];for(let p=1;p<t.length;p++){let h=0;for(let f=0;f<e;f++)h+=(t[p][f]-t[p-1][f])**2;s.push(s[p-1]+Math.sqrt(h))}let a=s[s.length-1],c=Math.floor(a/o+1e-9),i=[],r=0;for(let p=0;p<=c;p++){let h=p*o;for(;r<s.length-2&&s[r+1]<h;)r++;let f=(h-s[r])/(s[r+1]-s[r]||1);i.push(t[r].map((l,u)=>l+(t[r+1][u]-l)*f))}return n&&a-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function Me(t){let o=go(yt.a),[e,,n]=yt.c,s=$t.h,a=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],u=f.n[1],v=f.n[2],d=f.d+l*e+u*s+v*n-v*t,x=E=>l*E[0]+u*E[1]<=d+1e-9,w=[];for(let E=0;E<a.length;E++){let M=a[E],g=a[(E+1)%a.length],T=x(M),A=x(g);if(T&&w.push(M),T!==A){let L=l*M[0]+u*M[1]-d,I=l*g[0]+u*g[1]-d,S=L/(L-I);w.push([M[0]+(g[0]-M[0])*S,M[1]+(g[1]-M[1])*S])}}a=w}let c=a.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),r=Math.max(...c.map(f=>f[0])),p=a.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-r)<1e-9),h=[];for(let f=0;f<a.length;f++){let l=a[(p+f)%a.length];if(h.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:h.reverse(),xl:i,xr:r,top:Math.max(...a.map(f=>f[1]))}}function we(t,o){let e=$t,n=e.h,s=K,a=[[t,s],[at.x1,s],[at.x1,0]],c=e.x0+.02,i=.1375,r=n/2;a.push([c-i,0],[c-i,r]);for(let h=7;h<12;h++){let f=h/12*Math.PI;a.push([c-i*Math.sin(f),r-r*Math.cos(f)])}a.push([c,n]);let p=Me(yt.c[2]);for(let h of p.chain)a.push(h);return a.push([e.x1,n],[e.x1,n-.05],[e.x1-.06,n-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:a.map(([h,f])=>[h-t,f]),top:p.top}}function Ee(t,o){let e=Ft.c[0],n=Ft.r,s=ro.slice(4,Ct+1),a=ro.slice(Ct),c=[[t,0]];for(let[i,r]of s)c.push([e+i*n,r]);for(let[i,r]of a.slice(1))c.push([e+i*n,r]);for(let[i,r]of a.slice().reverse().slice(1))c.push([e-i*n,r]);for(let[i,r]of s.slice().reverse().slice(1))c.push([e-i*n,r]);return c.push([o,0]),c.map(([i,r])=>[t-i,r])}function Lo(t,o,e,n=.07,s=.15){let a=ve(e,n,s),c=[],i=l0(a,At/2);for(let r=0;r<i.length;r++){let p=i[Math.max(0,r-1)],h=i[Math.min(i.length-1,r+1)],f=Xt(nt(h,p)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[r][0],i[r][1],t[1]+o[1]*i[r][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function Mt(t,o){return t.map(([e,n])=>[e,o,n,0,1,0])}function Fo(t,o,e,n,s=200){let a=[];for(let c=0;c<=s;c++){let i=c/s,r=1-i;a.push([r*r*r*t[0]+3*r*r*i*o[0]+3*r*i*i*e[0]+i*i*i*n[0],r*r*r*t[1]+3*r*r*i*o[1]+3*r*i*i*e[1]+i*i*i*n[1]])}return a}function Po(t,o,e,n){let s=nt(t,pt(o,n)),a=zt(t,pt(e,n));return Fo(s,zt(s,pt(o,n*.552)),nt(a,pt(e,n*.552)),a,60)}var ge={zA:yt.c[2],xA0:-.35,xC1:4.75,zC:Ft.c[2],xD:-1.05,zD1:3.2,r:.55};function f0(t){let o=ge,e=[],n={};e.push(Mt(t,K));let s=t[t.length-1],a=t[t.length-6],c=Xt(nt(s,a)),i=[o.xA0,o.zA];e.push(Mt(Fo(s,zt(s,pt(c,.35)),nt(i,[.35,0]),i),K));let r=[o.xC1,o.zA],p=we(o.xA0,o.xC1-o.r),h=Lo([o.xA0,o.zA],[1,0],p.P);n.topY=p.top,e.push(h),e.push(Mt(Po(r,[1,0],[0,1],o.r),0));let f=[o.xC1,o.zC];e.push(Mt([[r[0],r[1]+o.r],[f[0],f[1]-o.r]],0)),e.push(Mt(Po(f,[0,1],[-1,0],o.r),0));let l=[o.xD,o.zC],u=Ee(f[0]-o.r,l[0]+o.r);e.push(Lo([f[0]-o.r,o.zC],[-1,0],u,.05,.12)),e.push(Mt(Po(l,[-1,0],[0,-1],o.r),0));let v=[o.xD,o.zD1],d=l[1]-o.r,x=[[0,0],[d-at.z1,0],[d-at.z1,K],[d-v[1],K]];e.push(Lo([o.xD,d],[0,-1],x));let w=t[0],E=t[5],M=Xt(nt(E,w));e.push(Mt(Fo(v,zt(v,[0,-.6]),nt(w,pt(M,.6)),w),K)),e.push(Mt(t,K));let g=[];for(let m of e)for(let y of m){let b=g[g.length-1];b&&Math.hypot(y[0]-b[0],y[1]-b[1],y[2]-b[2])<1e-6||g.push(y)}let T=t.length,A=g.slice(0,T),L=g.slice(g.length-T),I=l0(g.slice(T-1,g.length-T+1),At,3,!1),S=A.concat(I.slice(1,I.length-1),L),H=S.length,_=new Float32Array(H*3),U=new Float32Array(H*3),O=new Float32Array(H*3),it=new Float32Array(H*3);for(let m=0;m<H;m++){let y=S[Math.max(0,m-2)],b=S[Math.min(H-1,m+2)],k=b[0]-y[0],F=b[1]-y[1],q=b[2]-y[2],G=Math.hypot(k,F,q)||1;k/=G,F/=G,q/=G;let J=S[m][3],Y=S[m][4],Q=S[m][5],Ut=J*k+Y*F+Q*q;J-=Ut*k,Y-=Ut*F,Q-=Ut*q;let Lt=Math.hypot(J,Y,Q)||1;J/=Lt,Y/=Lt,Q/=Lt;let no=Y*q-Q*F,so=Q*k-J*q,V0=J*F-Y*k;_.set([S[m][0],S[m][1],S[m][2]],m*3),U.set([k,F,q],m*3),it.set([J,Y,Q],m*3),O.set([no,so,V0],m*3)}for(let m of[it,O]){let y=m.slice();for(let b=2;b<H-2;b++)for(let k=0;k<3;k++)m[b*3+k]=(y[(b-2)*3+k]+y[(b-1)*3+k]*2+y[b*3+k]*3+y[(b+1)*3+k]*2+y[(b+2)*3+k])/9}let Z=0;for(let m=0;m<H;m++)_[m*3+1]>_[Z*3+1]&&(Z=m);return n.top=Z*At,{pos:_,T:U,B:O,N:it,n:H,length:(H-1)*At,marks:n}}function fo(t,o,e){let n=Math.min(t.n-1.0001,Math.max(0,o/At)),s=Math.floor(n),a=n-s;for(let c of["pos","T","B","N"]){let i=t[c],r=e[c];r[0]=i[s*3]+(i[s*3+3]-i[s*3])*a,r[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*a,r[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*a}return e}function h0(t,o){let e=document.getElementById("frame"),n=()=>{let a=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),r=(c?c.offsetHeight:0)+6+13,p=(i?i.offsetHeight:0)+8+13,h=window.innerWidth-a*2,f=window.innerHeight-r-p,l=f,u=l*t;u>h&&(u=h,l=u/t),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),e.style.width=`${u}px`,e.style.height=`${l}px`,e.style.top=`${r+Math.max(0,(f-l)/2)}px`,o?.(u,l)};return window.addEventListener("resize",n),n(),n}function u0(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(s))};o?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function p0(t,o,e){let n=s=>{for(let[a,c]of t)a.setAttribute("aria-pressed",String(c===s));o(s)};for(let[s,a]of t)s.addEventListener("click",()=>n(a));return e!==void 0&&n(e),n}function m0(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function d0(t,o=!0){let e=document.getElementById("btn-play"),n=s=>{o=s,e&&(e.setAttribute("aria-pressed",String(!s)),e.querySelector("span").textContent=s?"Pause":"Play",e.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return e?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function x0(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function v0(){document.body.classList.add("ready")}var be=performance.now(),A0={},gt=t=>{A0[t]=Math.round(performance.now()-be)},ye=1.4,z=.42,M0=[-.95,1.7],_t=document.getElementById("scene"),oo=new R.WebGLRenderer({canvas:_t,antialias:!0});oo.setPixelRatio(Math.min(window.devicePixelRatio||1,2));oo.setClearColor(15525333,1);var eo=new R.Scene,to=$o(),Te=Yo(to),ke=oo.capabilities.getMaxAnisotropy();function It(t,o=Te){let e=new R.Mesh(t.build(),o);return e.frustumCulled=!1,eo.add(e),e}It(Xo());It(Zo());It(Jo());It(t0().b);It(o0());It(e0());It(n0());gt("desk");var R0=s0(9).map(t=>({pl:t,c:rt(t,[0,0])})),H0=-32*(Math.PI/180),vt=null,w0=1/0;for(let t of R0){if(t.pl.r!==1)continue;let o=t.pl.r*(2*Math.PI/3)+H0,e=Math.hypot(t.c[0],t.c[1]),n=Math.atan2(t.c[1],t.c[0])-o;n=Math.atan2(Math.sin(n),Math.cos(n));let s=Math.abs(e-4.3)+Math.abs(n)*2.5;s<w0&&(w0=s,vt=t)}var I0=-H0-vt.pl.r*(2*Math.PI/3),E0=Math.cos(I0),g0=Math.sin(I0),No=t=>[E0*t[0]-g0*t[1],-(g0*t[0]+E0*t[1])],b0=rt(vt.pl,[1.24,-.66]),y0=[M0[0]-z*No(b0)[0],M0[1]-z*No(b0)[1]],Wo=t=>{let o=No(t);return[y0[0]+z*o[0],y0[1]+z*o[1]]},ho=t=>Wo(rt(vt.pl,t)),N={x0:at.x0+.06,z0:at.z0+.05,x1:at.x1-.04,z1:at.z1-.05};N.W=N.x1-N.x0;N.D=N.z1-N.z0;var po=Yt(10),Se=R0.filter(t=>po.every(o=>{let e=Wo(rt(t.pl,o));return e[0]>N.x0+.08&&e[0]<N.x1-.08&&e[1]>N.z0+.08&&e[1]<N.z1-.08})),Jt={W:N.W,D:N.D,res:2048/N.W,k:z,tiles:Se,ring:po,hero:vt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=Wo(t);return[o[0]-N.x0,o[1]-N.z0]}},Do=1-st(Jt.rIn,Jt.rOut,Jt.centreDist(vt));function mo(t){let o=new R.CanvasTexture(t);return o.colorSpace=R.NoColorSpace,o.anisotropy=ke,o.generateMipmaps=!0,o.minFilter=R.LinearMipmapLinearFilter,o}gt("layout");var Ae=Ro("L",Jt);gt("pageL");var Re=Ro("C",Jt);gt("pageC");var He=vo(to,mo(Ae),mo(Re));{let t=new R.BufferGeometry,o=K+4e-4;t.setAttribute("position",new R.Float32BufferAttribute([N.x0,o,N.z0,N.x0,o,N.z1,N.x1,o,N.z1,N.x1,o,N.z0],3)),t.setAttribute("normal",new R.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new R.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new R.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new R.Mesh(t,He);e.frustumCulled=!1,eo.add(e)}var B=i0(At/z);gt("lizard");var Rt=B.spine.length,Ie=B.spine.pts.map(t=>ho(t)),mt=f0(Ie);gt("path");var Ht=vo(to,mo(Ho("L",po,vt.pl.r)),mo(Ho("C",po,vt.pl.r)),{contourStep:.05,uvScale:2*ut*z});{let t=(c,i,r)=>st(c,i,r),o=[.42,.41,.39],e=[.12,.11,.1],n=t(.2,.8,Do),s=.5+.5*t(0,.6,Do),a=o.map((c,i)=>c+(e[i]-c)*n);Ht.uniforms.uSketchLine.value.set(...a.map((c,i)=>Nt[i]+(c-Nt[i])*s)),Ht.uniforms.uSketchPaper.value.set(...Nt),Ht.uniforms.uLineW.value=(.011+.006*Do)/2}gt("hero");var jo=new R.Mesh(B.geo,Ht);jo.frustumCulled=!1;jo.renderOrder=2;eo.add(jo);var Le=.62,Pe=.42,Bt=3.2,Vt=Rt*z,ct=mt.length,Ot=Math.min(ct-1,mt.marks.top+Rt*z*.5),Et=(()=>{let t=[0],o=[Vt],e=0,n=.004,s=!1;for(let a=Vt;a<ct;a+=n){let c=(r,p)=>Math.max(.22,Math.min(1,r/p)),i=Le*c(a-Vt,.5)*c(ct-a,.6)*(Math.abs(a-Ot)<.45?Math.max(.25,Math.abs(a-Ot)/.45):1);e+=n/i,!s&&a>=Ot&&(e+=Bt,s=!0,t.push(e),o.push(a)),t.push(e),o.push(Math.min(ct,a+n))}return{T:t,U:o,dur:e}})();function Ce(t){let{T:o,U:e}=Et;if(t<=0)return e[0];if(t>=Et.dur)return e[e.length-1];let n=0,s=o.length-1;for(;s-n>1;){let c=n+s>>1;o[c]<=t?n=c:s=c}let a=(t-o[n])/(o[s]-o[n]||1);return e[n]+(e[s]-e[n])*a}var Wt=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",Et.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],zo=0;for(let t of Wt)t.start=zo,zo+=t[1];var uo=zo;function st(t,o,e){let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)}function Fe(t){t=(t%uo+uo)%uo;let o=Wt[0];for(let s of Wt)t>=s.start&&(o=s);let e=(t-o.start)/o[1],n={fill:0,relief:0,u:Vt,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":n.fill=st(0,1,e);break;case"relief":n.fill=1,n.relief=.35*st(0,1,e);break;case"rise":n.fill=1,n.relief=.35+.65*st(0,1,e);break;case"walk":{n.fill=1,n.relief=1;let s=e*Et.dur;n.u=Ce(s);let a=s-Et.T[Et.U.findIndex(c=>c>=Ot)];Math.abs(n.u-Ot)<1e-4&&a>=0&&a<=Bt&&(n.pauseT=a);break}case"settle":n.fill=1,n.relief=1,n.u=ct;break;case"sink":n.fill=1,n.relief=1-st(0,1,e),n.u=ct;break;case"unfill":n.fill=1-st(0,1,e),n.u=ct;break}return n}var ot={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},T0=B.geo.getAttribute("position"),Zt=Rt*.79,De=B.joints.map(t=>t.l>0?-1:1),D={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]};function Ne(t){let o=t.u>=ct-1e-6?ct:t.u,e=Math.max(0,o-Vt),n=2*Math.PI*e/Pe,s=st(0,.3,e)*st(0,.35,ct-o)*(t.pauseT>=0?0:1),a=.38*s,c=t.pauseT>=0?.55*Math.sin(t.pauseT/Bt*Math.PI*2)*st(0,.5,t.pauseT)*st(Bt,Bt-.5,t.pauseT):0,i=t.pauseT>=0?.12*Math.sin(t.pauseT/Bt*Math.PI):0,r=t.relief,p=T0.array;for(let h=0;h<B.n;h++){let f=B.sAtt[h],l=B.along[h],u=B.across[h],v=B.h[h];if(u+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(f/Rt-.45)),f>Zt&&(c||i)){let I=st(Zt,Zt+.3,f),S=f+l-Zt,H=c*I,_=Math.cos(H),U=Math.sin(H),O=Zt+S*_-u*U;u=S*U+u*_,l=O-f,v+=i*I*(S/.5)}fo(mt,o-(Rt-f)*z,ot);let d=ot.pos[0]+(ot.T[0]*l+ot.B[0]*u)*z,x=ot.pos[1]+(ot.T[1]*l+ot.B[1]*u)*z,w=ot.pos[2]+(ot.T[2]*l+ot.B[2]*u)*z,E=ot.N[0],M=ot.N[1],g=ot.N[2],T=B.tailW[h];if(T>0){fo(mt,o-(Rt-B.S[h])*z,D);let I=B.tailA[h],S=B.tailL[h];d+=(D.pos[0]+(D.T[0]*I+D.B[0]*S)*z-d)*T,x+=(D.pos[1]+(D.T[1]*I+D.B[1]*S)*z-x)*T,w+=(D.pos[2]+(D.T[2]*I+D.B[2]*S)*z-w)*T,E+=(D.N[0]-E)*T,M+=(D.N[1]-M)*T,g+=(D.N[2]-g)*T}let A=B.legIdx[h];if(A>=0){let I=Tt[A],S=B.joints[A],H=B.legW[h],_=n+I.phase,U=De[A]*a*Math.sin(_),O=B.legA[h]-S.a,it=B.legL[h]-S.l,Z=Math.cos(U),m=Math.sin(U),y=S.a+O*Z-it*m,b=S.l+O*m+it*Z;fo(mt,o-(Rt-S.s)*z,D);let k=D.pos[0]+(D.T[0]*y+D.B[0]*b)*z,F=D.pos[1]+(D.T[1]*y+D.B[1]*b)*z,q=D.pos[2]+(D.T[2]*y+D.B[2]*b)*z;d+=(k-d)*H,x+=(F-x)*H,w+=(q-w)*H,E+=(D.N[0]-E)*H,M+=(D.N[1]-M)*H,g+=(D.N[2]-g)*H,v+=.09*H*Math.max(0,Math.cos(_))*s}let L=v*z*r+.0015;p[h*3]=d+E*L,p[h*3+1]=x+M*L,p[h*3+2]=w+g*L}T0.needsUpdate=!0,B.geo.computeVertexNormals(),Ht.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Ht.uniforms.uFill.value=t.fill}var ze=10631978,wt=new R.Group,_o=new R.MeshBasicMaterial({color:ze,transparent:!0,opacity:0,depthWrite:!1,side:R.DoubleSide});function L0(t,o,e=0,n=0){let s=[],a=[],c=0,i=!0,r=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),r+=c,e&&r>(i?e:n)&&(i=!i,r=0);let l=t[f];if(s.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let u=(f-1)*2;a.push(u,u+1,u+2,u+1,u+3,u+2)}}let p=new R.BufferGeometry;p.setAttribute("position",new R.Float32BufferAttribute(s,3)),p.setIndex(a);let h=new R.Mesh(p,_o);return h.frustumCulled=!1,h}function k0(t,o,e,n,s){let a=o?t.concat([t[0]]):t,c=a.map((i,r)=>{let p=a[Math.max(0,r-1)],h=a[Math.min(a.length-1,r+1)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l)||1;return[i[0],K+.003,i[1],-l/u,0,f/u]});return L0(c,e,n,s)}{let t=Yt(10).map(n=>ho(n));wt.add(k0(t,!0,.009,.05,.03));let o=[];for(let n=0;n<6;n++)for(let s=0;s<40;s++){let a=$[n],c=$[(n+1)%6];o.push(ho([a[0]+(c[0]-a[0])*(s/40),a[1]+(c[1]-a[1])*(s/40)]))}wt.add(k0(o,!0,.0045,.03,.025));for(let n of[0,2,4]){let s=ho($[n]),a=new R.Mesh(new R.CircleGeometry(.04,20),_o);a.rotation.x=-Math.PI/2,a.position.set(s[0],K+.004,s[1]),wt.add(a)}let e=[];for(let n=0;n<mt.n;n+=4){let s=mt.pos,a=mt.N,c=mt.B;e.push([s[n*3]+a[n*3]*.006,s[n*3+1]+a[n*3+1]*.006,s[n*3+2]+a[n*3+2]*.006,c[n*3],c[n*3+1],c[n*3+2]])}wt.add(L0(e,.007,.07,.05)),wt.renderOrder=5,wt.visible=!1,eo.add(wt)}var xt=new R.OrthographicCamera(-1,1,1,-1,1,400),Bo={H:5.9,target:new R.Vector3(.15,.3,2.35)},xo=1,Vo=1;function P0(){let t=Bo.target;xt.position.set(t.x+100,t.y+100,t.z+100),xt.up.set(0,1,0),xt.lookAt(t);let o=Bo.H/2;xt.left=-o*(xo/Vo),xt.right=o*(xo/Vo),xt.top=o,xt.bottom=-o,xt.updateProjectionMatrix()}h0(ye,(t,o)=>{xo=t,Vo=o,oo.setSize(t,o),P0()});u0();var C={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},C0=p0([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{C.lithoTarget=t},1),F0=document.getElementById("btn-reveal");function Uo(t){C.revealTarget=t?1:0,F0.setAttribute("aria-pressed",String(t))}F0.addEventListener("click",()=>Uo(!C.revealTarget));var D0=d0(t=>{C.playing=t});m0({" ":()=>D0(!C.playing),l:()=>C0(C.lithoTarget?0:1),r:()=>Uo(!C.revealTarget),ArrowRight:()=>{C.t+=1},ArrowLeft:()=>{C.t-=1},0:()=>{C.t=0}});var jt=null;_t.addEventListener("pointerdown",t=>{_t.setPointerCapture(t.pointerId),jt={x:t.clientX}});_t.addEventListener("pointermove",t=>{jt&&(C.t+=(t.clientX-jt.x)/Math.max(200,xo)*22,jt.x=t.clientX)});var N0=()=>{jt=null};_t.addEventListener("pointerup",N0);_t.addEventListener("pointercancel",N0);var S0=performance.now(),Oo="",z0=0;function B0(t){z0++;let o=Math.min(.05,Math.max(0,(t-S0)/1e3));S0=t,C.playing&&!jt&&(C.t+=o);for(let[s,a]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=C[a]-C[s];C[s]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}to.uLitho.value=C.litho,to.uTime.value=t/1e3;let e=Fe(C.t);Ne(e),Ht.uniforms.uContours.value=C.reveal*Math.min(1,e.relief*3),_o.opacity=C.reveal*.9,wt.visible=C.reveal>.01;let n=C.reveal>.5?e.phase[2]:"";n!==Oo&&(x0(!!n,n),Oo=n),oo.render(eo,xt),requestAnimationFrame(B0)}gt("ready");v0();requestAnimationFrame(B0);window.__page={state:C,VIEW:Bo,updateCamera:P0,TOTAL:uo,PHASES:Wt,setPlaying:D0,setLitho:t=>{C0(t?1:0),C.litho=t?1:0},setReveal:t=>{Uo(t),C.reveal=t?1:0},at:(t,o=0)=>{let e=Wt.find(n=>n[0]===t);C.t=e.start+e[1]*o},path:mt,hero:vt,L:B,TIMES:A0,get frames(){return z0},atU(t){let o=Wt.find(n=>n[0]==="walk"),e=Et.U.findIndex(n=>n>=t);C.t=o.start+Et.T[Math.max(0,e)]},UP:Ot,U0:Vt,U1:ct,get label(){return Oo}};})();
