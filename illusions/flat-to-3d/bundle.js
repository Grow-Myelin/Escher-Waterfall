(()=>{var $o=Object.create;var Z0=Object.defineProperty;var Ko=Object.getOwnPropertyDescriptor;var Yo=Object.getOwnPropertyNames;var Qo=Object.getPrototypeOf,Xo=Object.prototype.hasOwnProperty;var Zo=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var Jo=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of Yo(o))!Xo.call(t,s)&&s!==e&&Z0(t,s,{get:()=>o[s],enumerable:!(n=Ko(o,s))||n.enumerable});return t};var Qt=(t,o,e)=>(e=t!=null?$o(Qo(t)):{},Jo(o||!t||!t.__esModule?Z0(e,"default",{value:t,enumerable:!0}):e,t));var zt=Zo((Ge,J0)=>{J0.exports=window.THREE});var I=Qt(zt(),1);var ot=Qt(zt(),1);function to(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new ot.Vector3(.1,.9,.66).normalize()},uPaper:{value:new ot.Vector3(.925,.898,.835)},uInk:{value:new ot.Vector3(.11,.1,.09)},uHaze:{value:new ot.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var oo=`
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
`,te=`
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
`,oe=`
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
`,ee=`
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
${oo}
${te}

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
`;function eo(t,o={}){return new ot.ShaderMaterial({uniforms:t,vertexShader:oe,fragmentShader:ee,transparent:!!o.transparent,side:o.side??ot.FrontSide})}var ne=`
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
`,se=`
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
${oo}
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
  float spec = pow(max(dot(n, normalize(vd + uLight)), 0.0), 10.0) * 0.12 * uSolid;
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
`;function g0(t,o,e,n={}){return new ot.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new ot.Vector3(.955,.935,.885)},uSketchLine:{value:new ot.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:ne,fragmentShader:se,transparent:!!n.transparent,side:n.side??ot.FrontSide})}var C=Qt(zt(),1);var q=Qt(zt(),1),ae=1e3,y0={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function re(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function _(t,o=y0.PLAIN,e={}){return{c:typeof t=="number"?re(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var no=["px","nx","py","ny","pz","nz"];function gt(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function E0(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function Xt(t){return Math.hypot(t[0],t[1],t[2])}function ut(t){let o=Xt(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function b0(t,o){let e=Math.abs(o[0]),n=Math.abs(o[1]),s=Math.abs(o[2]);return e>=n&&e>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var pt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new q.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new q.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,n=o[0],s=o[1],a=o[2];return[e[0]*n+e[4]*s+e[8]*a+e[12],e[1]*n+e[5]*s+e[9]*a+e[13],e[2]*n+e[6]*s+e[10]*a+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,n=o[0],s=o[1],a=o[2];return ut([e[0]*n+e[3]*s+e[6]*a,e[1]*n+e[4]*s+e[7]*a,e[2]*n+e[5]*s+e[8]*a])}tri(o,e,n,s,a=[1,1,1],c={}){let i=this._tp(o),r=this._tp(e),h=this._tp(n),u=ut(E0(gt(e,o),gt(n,o))),f=c.uv||[b0(o,u),b0(e,u),b0(n,u)],l=ut(E0(gt(r,i),gt(h,i))),p=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=Xt(E0(gt(r,i),gt(h,i))),d=[v/(Xt(gt(h,r))||1),v/(Xt(gt(i,h))||1),v/(Xt(gt(r,i))||1)],x=c.k||[1,1,1],w=s.s||0,g=[i,r,h];for(let M=0;M<3;M++){let E=g[M];this.pos.push(E[0]+w,E[1]+w,E[2]+w),this.nrm.push(p[M][0],p[M][1],p[M][2]),this.col.push(s.c[0]*x[M],s.c[1]*x[M],s.c[2]*x[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)a[T]?this.edg.push(M===T?d[T]:0):this.edg.push(ae);this.mat.push(s.p,s.f,s.w)}}quad(o,e,n,s,a,c=[1,1,1,1],i={}){let r=i.k||[1,1,1,1],h=i.n,u=i.uv;this.tri(o,e,n,a,[c[1],0,c[0]],{k:[r[0],r[1],r[2]],n:h&&[h[0],h[1],h[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(o,n,s,a,[c[2],c[3],0],{k:[r[0],r[2],r[3]],n:h&&[h[0],h[2],h[3]],uv:u&&[u[0],u[2],u[3]]})}box(o,e,n,s,a,c,i,r={}){o>s&&([o,s]=[s,o]),e>a&&([e,a]=[a,e]),n>c&&([n,c]=[c,n]);let h=new Set(r.open||[]),u=new Set(r.skip||[]);r.bottom||u.add("ny");let f=r.ao??1,l=r.aoTop??1,p={px:[0,s],nx:[0,o],py:[1,a],ny:[1,e],pz:[2,c],nz:[2,n]},v={px:[[s,e,c],[s,e,n],[s,a,n],[s,a,c]],nx:[[o,e,n],[o,e,c],[o,a,c],[o,a,n]],pz:[[o,e,c],[s,e,c],[s,a,c],[o,a,c]],nz:[[s,e,n],[o,e,n],[o,a,n],[s,a,n]],py:[[o,a,c],[s,a,c],[s,a,n],[o,a,n]],ny:[[o,e,n],[s,e,n],[s,e,c],[o,e,c]]};for(let d of no){if(u.has(d)||h.has(d))continue;let x=v[d],w=[];for(let E=0;E<4;E++){let T=x[E],L=x[(E+1)%4],S=1;for(let R of no){if(R===d)continue;let[H,A]=p[R];Math.abs(T[H]-A)<1e-9&&Math.abs(L[H]-A)<1e-9&&h.has(R)&&(S=0)}w.push(S)}let g;d==="py"||d==="ny"?g=[l,l,l,l]:g=[f,f,1,1];let M=d==="py"&&r.top?{...r.top,s:i.s}:i;this.quad(x[0],x[1],x[2],x[3],M,w,{k:g})}}cyl(o,e,n,s,a,c,i,r={}){let h=r.caps??[!0,!0],u=r.rim??[1,1],f=r.r1??s;for(let l=0;l<c;l++){let p=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,d=Math.cos(p),x=Math.sin(p),w=Math.cos(v),g=Math.sin(v),M=[o+s*d,e,n+s*x],E=[o+f*d,a,n+f*x],T=[o+f*w,a,n+f*g],L=[o+s*w,e,n+s*g],S=(s-f)/Math.max(1e-6,a-e),R=ut([d,S,x]),H=ut([w,S,g]),A=p*(s+f)/2,$=v*(s+f)/2;this.quad(M,E,T,L,i,[0,u[1],0,u[0]],{n:[R,R,H,H],uv:[[A,e],[A,a],[$,a],[$,e]],k:r.k}),h[1]&&f>0&&this.tri([o,a,n],T,E,i,[1,0,0]),h[0]&&this.tri([o,e,n],M,L,i,[1,0,0])}}lathe(o,e,n,s,a,c,i={}){let r=s.length,h=[];for(let l=0;l<r-1;l++){let p=s[l+1][0]-s[l][0],v=s[l+1][1]-s[l][1];h.push(ut([v,-p,0]))}let u=s.map((l,p)=>{let v=h[Math.max(0,p-1)],d=h[Math.min(r-2,p)];return ut([v[0]+d[0],v[1]+d[1],0])}),f=i.edges||[];for(let l=0;l<a;l++){let p=l/a*Math.PI*2,v=(l+1)/a*Math.PI*2,d=Math.cos(p),x=Math.sin(p),w=Math.cos(v),g=Math.sin(v);for(let M=0;M<r-1;M++){let[E,T]=s[M],[L,S]=s[M+1],R=[o+E*d,e+T,n+E*x],H=[o+L*d,e+S,n+L*x],A=[o+L*w,e+S,n+L*g],$=[o+E*w,e+T,n+E*g],K=i.flat?h[M]:u[M],Y=i.flat?h[M]:u[M+1];this.quad(R,H,A,$,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[K[0]*d,K[1],K[0]*x],[Y[0]*d,Y[1],Y[0]*x],[Y[0]*w,Y[1],Y[0]*g],[K[0]*w,K[1],K[0]*g]],uv:[[p*1.2,T],[p*1.2,S],[v*1.2,S],[v*1.2,T]]})}}}poly(o,e,n={}){for(let s=1;s<o.length-1;s++)this.tri(o[0],o[s],o[s+1],e,[1,s===o.length-2?1:0,s===1?1:0],n)}blob(o,e,n,s,a,c,i,r={}){let h=r.sub??1,u=r.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<h;v++){let d=[];for(let[x,w,g]of f){let M=ut([(x[0]+w[0])/2,(x[1]+w[1])/2,(x[2]+w[2])/2]),E=ut([(w[0]+g[0])/2,(w[1]+g[1])/2,(w[2]+g[2])/2]),T=ut([(g[0]+x[0])/2,(g[1]+x[1])/2,(g[2]+x[2])/2]);d.push([x,M,T],[M,w,E],[T,E,g],[M,E,T])}f=d}let l=v=>1+(r.lump??.12)*Math.sin(v[0]*5.1+u)*Math.sin(v[1]*4.3+u*1.7)*Math.sin(v[2]*3.7+u*.3),p=v=>{let d=l(v);return[o+v[0]*s*d,e+v[1]*a*d,n+v[2]*c*d]};for(let[v,d,x]of f)this.tri(p(v),p(d),p(x),i,[0,0,0],{n:[v,d,x],k:r.k})}build(){let o=new q.BufferGeometry;return o.setAttribute("position",new q.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new q.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new q.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new q.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new q.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new q.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},It={T:(t,o,e)=>new q.Matrix4().makeTranslation(t,o,e),RX:t=>new q.Matrix4().makeRotationX(t),RY:t=>new q.Matrix4().makeRotationY(t),RZ:t=>new q.Matrix4().makeRotationZ(t),S:(t,o,e)=>new q.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new q.Matrix4)};var G={...y0,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},Z=.12,lt={x0:-4.5,x1:.35,z0:.3,z1:3.9},Zt={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},Lt={c:[2.45,0,1.6],a:.5},jt={c:[2.45,0,4.55],r:.92,h:.38},ce={c:[1.5,0,-.55]},i0={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},mt=(1+Math.sqrt(5))/2;function T0(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let p of[-1,1])o.push([f,l,p]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/mt,l*mt]),o.push([f/mt,l*mt,0]),o.push([f*mt,0,l/mt]);let e=t/(2/mt),n=o.map(f=>f.map(l=>l*e)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*mt],[0,f*mt,l],[f*mt,l,0]);let a=s.map(f=>{let l=Math.hypot(...f),p=f.map(x=>x/l),v=Math.max(...n.map(x=>x[0]*p[0]+x[1]*p[1]+x[2]*p[2])),d=n.map((x,w)=>[w,x[0]*p[0]+x[1]*p[1]+x[2]*p[2]]).filter(([,x])=>x>v-1e-6).map(([x])=>x);return{n:p,d:v,idx:d}}),c=a[0].n,i=new C.Quaternion().setFromUnitVectors(new C.Vector3(...c),new C.Vector3(0,-1,0)),r=new C.Quaternion().setFromAxisAngle(new C.Vector3(0,1,0),.31);i.premultiply(r);let h=f=>new C.Vector3(...f).applyQuaternion(i).toArray();n=n.map(h);for(let f of a)f.n=h(f.n);let u=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-u,f[2]]);for(let f of a){let l=[0,1,2].map(x=>f.idx.reduce((w,g)=>w+n[g][x],0)/f.idx.length),p=new C.Vector3(...f.n),v=new C.Vector3(...n[f.idx[0]]).sub(new C.Vector3(...l)).normalize(),d=new C.Vector3().crossVectors(p,v);f.idx.sort((x,w)=>{let g=new C.Vector3(...n[x]).sub(new C.Vector3(...l)),M=new C.Vector3(...n[w]).sub(new C.Vector3(...l));return Math.atan2(g.dot(d),g.dot(v))-Math.atan2(M.dot(d),M.dot(v))}),f.c=l,f.d=p.dot(new C.Vector3(...l))}return{V:n,faces:a,height:Math.max(...n.map(f=>f[1]))}}function so(){let t=new pt,o=_(14271394,G.DESK);return t.box(i0.x0,-.45,i0.z0,i0.x1,0,i0.z1,o,{top:_(15391940,G.DESK)}),t}function ao(){let t=new pt,{x0:o,x1:e,z0:n,z1:s}=lt;t.box(o,0,n,e,.04,s,_(9209210,G.CLOTH),{ao:.85}),t.box(o+.06,.04,n+.05,e-.04,Z,s-.05,_(15722970,G.PAGES),{skip:["py"]});let a=22;for(let c=0;c<a;c++){let i=n+.25+c/(a-1)*(s-n-.5),r=o+.22,h=.16,u=.022,f=10;for(let l=0;l<f;l++){let p=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),d=[r+Math.cos(p)*h,Z*.5+Math.sin(p)*h,i],x=[r+Math.cos(v)*h,Z*.5+Math.sin(v)*h,i];ie(t,d,x,u,_(9341572,G.PLAIN))}}return t}function ie(t,o,e,n,s){let a=new C.Vector3(...o),i=new C.Vector3(...e).clone().sub(a),r=i.length(),h=new C.Quaternion().setFromUnitVectors(new C.Vector3(0,1,0),i.normalize()),u=new C.Matrix4().compose(a,h,new C.Vector3(1,1,1));t.push(u),t.cyl(0,0,0,n,r,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function ro(){let t=new pt,{x0:o,x1:e,z0:n,z1:s,h:a}=Zt,c=_(12555380,G.CLOTH),i=.05;t.box(o,0,n,e,i,s,c,{ao:.85}),t.box(o+.04,i,n+.05,e-.06,a-i,s-.05,_(15525072,G.PAGES),{skip:["py","nx"]}),t.box(o,a-i,n,e,a,s,c),t.push(It.chain(It.T(o+.02,a/2,(n+s)/2),It.RX(Math.PI/2),It.RZ(0)));let r=10;for(let h=0;h<r;h++){let u=Math.PI/2+h/r*Math.PI,f=Math.PI/2+(h+1)/r*Math.PI,l=a/2,p=(s-n)/2,v=[Math.cos(u)*l*.5,-p,Math.sin(u)*l],d=[Math.cos(f)*l*.5,-p,Math.sin(f)*l],x=[Math.cos(f)*l*.5,p,Math.sin(f)*l],w=[Math.cos(u)*l*.5,p,Math.sin(u)*l];t.quad(v,d,x,w,c,[h===0?1:0,1,h===r-1?1:0,1])}return t.pop(),t.box(o+.5,a,n+.6,o+1.6,a+.004,s-.6,_(11041118,G.CLOTH)),t}function co(){let t=new pt,o=T0(Lt.a),[e,,n]=Lt.c,s=Zt.h,a=_(15131094,G.STONE);for(let c of o.faces){let i=c.idx.map(r=>[o.V[r][0]+e,o.V[r][1]+s,o.V[r][2]+n]);t.poly(i,a)}return{b:t,D:o}}var l0=[[0,.03],[.55,.035],[.7,.04],[.72,0],[.8,0],[.88,.12],[.96,.25],[1.02,.33],[1.03,.36],[1,.378],[.95,.36],[.9,.3],[.8,.2],[.62,.11],[.35,.075],[0,.07]],Vt=9;function io(){let t=new pt,[o,,e]=jt.c,n=l0.map(([c,i])=>[c*jt.r,i]),s=n.slice(0,Vt+1),a=n.slice(Vt);return t.lathe(o,0,e,s,48,_(12105133,G.PEWTER),{edges:s.map((c,i)=>i===4||i===Vt)}),t.lathe(o,0,e,a,48,_(13223614,G.PEWTER),{edges:a.map((c,i)=>i===2)}),t}function lo(){let t=new pt,o=new C.Vector3(-3.9,.06,-.75),n=new C.Vector3(-1.3,.06,-.15).clone().sub(o),s=n.length(),a=new C.Quaternion().setFromUnitVectors(new C.Vector3(0,1,0),n.clone().normalize());return t.push(new C.Matrix4().compose(o,a,new C.Vector3(1,1,1))),t.push(It.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,_(7307107,G.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,_(14467994,G.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,_(3815734,G.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,_(11577752,G.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,_(13209478,G.PLAIN)),t.pop(),t.pop(),t}function fo(){let t=new pt,[o,,e]=ce.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,n,28,_(5069411,G.PLAIN),{edges:n.map((a,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,_(11569762,G.WOOD)),t.push(It.T(o,0,e));let s=10;for(let a=0;a<s;a++){let c=.15+a/s*1.4,i=.15+(a+1)/s*1.4,r=.365;t.quad([Math.cos(c)*r,.1,Math.sin(c)*r],[Math.cos(i)*r,.1,Math.sin(i)*r],[Math.cos(i)*r,.28,Math.sin(i)*r],[Math.cos(c)*r,.28,Math.sin(c)*r],_(15261900,G.PLAIN),[1,a===s-1?1:0,1,a===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var f0=Math.sqrt(3)/2,Q=[[1,0],[.5,f0],[-.5,f0],[-1,0],[-.5,-f0],[.5,-f0]],le=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],fe=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],he=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],k0=(t,o,[e,n])=>{let s=o[0]-t[0],a=o[1]-t[1];return[t[0]+e*s+n*a,t[1]+e*a-n*s]};function S0(t,o,e){let n=Math.sin(e),s=Math.cos(e),a=t[0]-o[0],c=t[1]-o[1];return[o[0]+s*a-n*c,o[1]+n*a+s*c]}function A0(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let h=r/o,u=h*h,f=u*h,l=(p,v,d,x)=>.5*(2*v+(-p+d)*h+(2*p-5*v+4*d-x)*u+(-p+3*v-3*d+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var Jt=2*Math.PI/3;function ue(t=10){let o=A0(le.map(u=>k0(Q[0],Q[1],u)),t),e=A0(fe.map(u=>k0(Q[2],Q[3],u)),t),n=A0(he.map(u=>k0(Q[4],Q[5],u)),t),s=o,a=e.map(u=>S0(u,Q[2],Jt)).reverse(),c=e,i=n.map(u=>S0(u,Q[4],Jt)).reverse(),r=n,h=o.map(u=>S0(u,Q[0],Jt)).reverse();return[s,a,c,i,r,h]}function t0(t=10){let o=[];for(let e of ue(t))for(let n=0;n<e.length-1;n++)o.push(e[n]);return o}function pe(t,o){return{r:(t.r+o.r)%3,t:ft(t,o.t)}}function ft(t,o){let e=t.r*Jt,n=Math.sin(e),s=Math.cos(e);return[s*o[0]-n*o[1]+t.t[0],n*o[0]+s*o[1]+t.t[1]]}function me(t,o){let e=o*Jt,n=Math.sin(e),s=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function ho(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];o.set(e([0,0]),n);let a=[];for(;s.length;){let c=s.shift();a.push(c);for(let i of[0,2,4]){let r=ft(c,Q[i]);for(let h of[1,2]){let u=pe(me(r,h),c),f=ft(u,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,u),s.push(u))}}}return a}var J=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],dt=[{name:"left front",joint:[.74,0],foot:[1.33,.3],phase:0},{name:"right front",joint:[.2,-.68],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.3,.68],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.7,-.06],foot:[-1.24,-.33],phase:0}],h0=[[1.06,-.46],[.95,-.69]];var Wt=[.955,.935,.885],st=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,Ot=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],R0={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[Ot(15324582),Ot(9412730),Ot(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[Ot(9071164),Ot(4149043),Ot(15124378)]},H0=[.12,.11,.1],I0=[.42,.41,.39],Pt=(t,o,e)=>{let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)};function de(t=60){let o=[0];for(let a=1;a<J.length;a++)o.push(o[a-1]+Math.hypot(J[a][0]-J[a-1][0],J[a][1]-J[a-1][1]));let e=o[o.length-1],n=[],s=0;for(let a=0;a<=t;a++){let c=a/t*e;for(;s<o.length-2&&o[s+1]<c;)s++;let i=(c-o[s])/(o[s+1]-o[s]);n.push([J[s][0]+(J[s+1][0]-J[s][0])*i,J[s][1]+(J[s+1][1]-J[s][1])*i,c/e])}return n}var o0=de(80);function uo(t,o,e,n,s,a,c,i={}){let r=new Path2D;e.forEach((p,v)=>{let d=o(p);v?r.lineTo(d[0],d[1]):r.moveTo(d[0],d[1])}),r.closePath();let h=i.noFill?0:Pt(.28,.72,s),u=i.noFill?0:Pt(.55,.95,s),f=R0[a][n];h>0&&(t.fillStyle=st(f,h),t.fill(r),t.save(),t.clip(r),a==="L"&&n===1&&xe(t,r,c,h*.55),u>0&&ve(t,o,n,a,c,u),t.restore());let l=[0,1,2].map(p=>I0[p]+(H0[p]-I0[p])*Pt(.2,.8,s));return t.strokeStyle=st(l,.5+.5*Pt(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(r),r}function xe(t,o,e,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=st([.25,.24,.22],n),t.lineWidth=Math.max(.8,e*.006);let a=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let r=-i;r<c+i;r+=a)t.moveTo(r,0),t.lineTo(r+i,i);t.stroke()}function ve(t,o,e,n,s,a){let c=(n==="L"?R0.markL:R0.markC)[e],i=e===2;t.fillStyle=st(c,a*.8),t.beginPath();for(let l=0;l<o0.length;l+=1){let p=o0[l],v=p[2];if(v<.12||v>.8||l%7)continue;let d=o0[Math.max(0,l-1)],x=o0[Math.min(o0.length-1,l+1)],w=Math.atan2(x[1]-d[1],x[0]-d[0]),g=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=o([p[0],p[1]]),E=o([p[0]+Math.cos(w),p[1]+Math.sin(w)]),T=Math.atan2(E[1]-M[1],E[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*g*s*.8,M[1]+Math.sin(T)*g*s*.8),t.ellipse(M[0],M[1],g*s*.8,g*s*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=st(c,a*.35);let r=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let p=-16;p<=16;p++){let v=l*.085+(p&1)*.0425,d=p*.074;if(Math.abs(v)>1.35||Math.abs(d)>1.3)continue;let x=o([v,d]);t.moveTo(x[0]+r,x[1]),t.arc(x[0],x[1],r,0,Math.PI*2)}t.fill(),t.strokeStyle=st(i?[.92,.9,.85]:[.15,.14,.12],a*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of dt){let p=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],d=Math.hypot(p,v),x=p/d,w=v/d,g=[l.foot[0]-x*.16,l.foot[1]-w*.16];for(let L of[-.5,0,.5]){let S=x*Math.cos(L)-w*Math.sin(L),R=x*Math.sin(L)+w*Math.cos(L),H=o([g[0]+S*.04,g[1]+R*.04]),A=o([g[0]+S*.12,g[1]+R*.12]);t.moveTo(H[0],H[1]),t.lineTo(A[0],A[1])}let M=[l.joint[0]+p*.45,l.joint[1]+v*.45],E=o([M[0]-w*.05,M[1]+x*.05]),T=o([M[0]+w*.05,M[1]-x*.05]);t.moveTo(E[0],E[1]),t.lineTo(T[0],T[1])}t.stroke();let h=o([1.24,-.64]),u=o([1.12,-.68]),f=o([1.02,-.74]);t.beginPath(),t.moveTo(h[0],h[1]),t.quadraticCurveTo(u[0],u[1],f[0],f[1]),t.stroke();for(let l of h0){let p=o(l);t.fillStyle=st(i?[.95,.93,.88]:[.98,.97,.94],a),t.beginPath(),t.arc(p[0],p[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=st(H0,a),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=st(H0,a),t.beginPath(),t.arc(p[0]+.008*s,p[1],.022*s,0,Math.PI*2),t.fill()}}function L0(t,o){let{W:e,D:n,res:s,tiles:a,ring:c,toPage:i,centreDist:r,hero:h}=o,u=document.createElement("canvas");u.width=Math.round(e*s),u.height=Math.round(n*s);let f=u.getContext("2d");f.fillStyle=st(Wt),f.fillRect(0,0,u.width,u.height);let l=o.k*s;for(let p of a){let v=r(p),d=1-Pt(o.rIn,o.rOut,v);if(d>.6||v>o.rOut+1.6)continue;let x=w=>{let g=i(ft(p.pl,w));return[g[0]*s,g[1]*s]};f.beginPath(),Q.forEach((w,g)=>{let M=x(w);g?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=st(I0,.22*(1-d)*(1-Pt(o.rOut,o.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let p of a){let v=r(p),d=1-Pt(o.rIn,o.rOut,v);if(v>o.rOut+.6)continue;uo(f,w=>{let g=i(ft(p.pl,w));return[g[0]*s,g[1]*s]},c,p.pl.r,Math.max(.04,d),t,l,{noFill:p===h})}return u}var xt=1.5;function P0(t,o,e,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let a=s.getContext("2d");a.fillStyle=st(Wt),a.fillRect(0,0,n,n);let c=n/(2*xt);return uo(a,r=>[(r[0]+xt)*c,(xt-r[1])*c],o,e,1,t,c),s}var Ct=Qt(zt(),1);var Me=.5;function we(t,o,e){let n=[0],s=t.length+(e?1:0);for(let h=1;h<s;h++){let u=t[h-1],f=t[h%t.length];n.push(n[h-1]+Math.hypot(f[0]-u[0],f[1]-u[1]))}let a=n[n.length-1],c=Math.max(2,Math.round(a/o)),i=[],r=0;for(let h=0;h<(e?c:c+1);h++){let u=h/c*a;for(;r<n.length-2&&n[r+1]<u;)r++;let f=(u-n[r])/(n[r+1]-n[r]||1),l=t[r],p=t[(r+1)%t.length];i.push([l[0]+(p[0]-l[0])*f,l[1]+(p[1]-l[1])*f])}return{pts:i,length:a}}function ge(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let h=r/o,u=h*h,f=u*h,l=(p,v,d,x)=>.5*(2*v+(-p+d)*h+(2*p-5*v+4*d-x)*u+(-p+3*v-3*d+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function Ee(t){let o=ge(J,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let n=[],s=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;s<e.length-2&&e[s+1]<i;)s++;let r=(i-e[s])/(e[s+1]-e[s]||1);n.push([o[s][0]+(o[s+1][0]-o[s][0])*r,o[s][1]+(o[s+1][1]-o[s][1])*r])}let a=(n.length-1)*t,c=n.map((i,r)=>{let h=n[Math.max(0,r-2)],u=n[Math.min(n.length-1,r+2)],f=u[0]-h[0],l=u[1]-h[1],p=Math.hypot(f,l);return[f/p,l/p]});return{pts:n,T:c,N:c.map(([i,r])=>[-r,i]),length:a,step:t}}function po(t,o,e){let n=!1;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[s],i=t[a];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function mo(t,o,e){let n=1/0;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[a],i=t[s],r=i[0]-c[0],h=i[1]-c[1],u=((o-c[0])*r+(e-c[1])*h)/(r*r+h*h||1);u=Math.max(0,Math.min(1,u));let f=c[0]+u*r-o,l=c[1]+u*h-e;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function be(t){let o=t.length,e=1/0,n=1/0,s=-1/0,a=-1/0;for(let l of t)e=Math.min(e,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),a=Math.max(a,l[1]);let c=Math.max(s-e,a-n)*20,i=(e+s)/2,r=(n+a)/2,h=t.concat([[i-c,r-c],[i,r+c],[i+c,r-c]]),u=(l,p,v)=>{let[d,x]=h[l],[w,g]=h[p],[M,E]=h[v],T=2*(d*(g-E)+w*(E-x)+M*(x-g)),L=((d*d+x*x)*(g-E)+(w*w+g*g)*(E-x)+(M*M+E*E)*(x-g))/T,S=((d*d+x*x)*(M-w)+(w*w+g*g)*(d-M)+(M*M+E*E)*(w-d))/T;return[L,S,(d-L)**2+(x-S)**2]},f=[[o,o+1,o+2,...u(o,o+1,o+2)]];for(let l=0;l<o;l++){let[p,v]=h[l],d=[],x=new Map;for(let w of f)if((p-w[3])**2+(v-w[4])**2<w[5])for(let[g,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let E=g<M?`${g},${M}`:`${M},${g}`;x.has(E)?x.delete(E):x.set(E,[g,M])}else d.push(w);for(let[w,g]of x.values())d.push([w,g,l,...u(w,g,l)]);f=d}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function C0(t,o,e){let n=0,s=1/0;for(let p=0;p<t.pts.length;p++){let v=(t.pts[p][0]-o)**2+(t.pts[p][1]-e)**2;v<s&&(s=v,n=p)}let a=t.step,c=n*a;for(let p=0;p<4;p++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/a)),d=Math.floor(v),x=v-d,w=[t.pts[d][0]+(t.pts[d+1][0]-t.pts[d][0])*x,t.pts[d][1]+(t.pts[d+1][1]-t.pts[d][1])*x],g=[t.T[d][0]+(t.T[d+1][0]-t.T[d][0])*x,t.T[d][1]+(t.T[d+1][1]-t.T[d][1])*x],M=(o-w[0])*g[0]+(e-w[1])*g[1];c=Math.min((t.pts.length-1)*a,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/a),r=Math.floor(i),h=i-r,u=[t.pts[r][0]+(t.pts[r+1][0]-t.pts[r][0])*h,t.pts[r][1]+(t.pts[r+1][1]-t.pts[r][1])*h],f=[t.N[r][0]+(t.N[r+1][0]-t.N[r][0])*h,t.N[r][1]+(t.N[r+1][1]-t.N[r][1])*h],l=(o-u[0])*f[0]+(e-u[1])*f[1];return[c,l,Math.sqrt(s)]}function ye(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),n=Math.floor(e),s=e-n,a=c=>[c[n][0]+(c[n+1][0]-c[n][0])*s,c[n][1]+(c[n+1][1]-c[n][1])*s];return{p:a(t.pts),t:a(t.T),n:a(t.N)}}function u0(t,o,e,n){let s=ye(t,o),a=e-s.p[0],c=n-s.p[1];return[a*s.t[0]+c*s.t[1],a*s.n[0]+c*s.n[1]]}function xo(t){let o=we(t0(14),.018,!0).pts,e=o.map(m=>m.slice()),n=e.length,s=.04,a=3,c=()=>(a=a*16807%2147483647)/2147483647-.5;for(let m=-40;m<=40;m++)for(let b=-40;b<=40;b++){let y=b*s+(m&1)*s*.5+c()*.002,k=m*s*.866+c()*.002;Math.abs(y)>1.5||Math.abs(k)>1.5||po(o,y,k)&&(mo(o,y,k)<s*.55||e.push([y,k]))}let i=be(e).filter(([m,b,y])=>{let k=(e[m][0]+e[b][0]+e[y][0])/3,N=(e[m][1]+e[b][1]+e[y][1])/3;return po(o,k,N)}),r=e.length,h=new Float32Array(r);for(let m=0;m<r;m++)h[m]=m<n?0:mo(o,e[m][0],e[m][1]);let u=Ee(t),f=new Float32Array(r),l=new Float32Array(r),p=new Float32Array(r);for(let m=0;m<r;m++){let[b,y,k]=C0(u,e[m][0],e[m][1]);f[m]=b,l[m]=y,p[m]=k}let v=new Float32Array(r);for(let m=0;m<r;m++){let b=0,y=0;for(let k=n;k<r;k++){let N=e[k][0]-e[m][0],z=e[k][1]-e[m][1];N*N+z*z<.0256&&(b+=h[k],y++)}v[m]=y?b/y:h[m]}let d=new Float32Array(r);for(let m=0;m<r;m++){if(m<n)continue;let b=h[m],y=Math.min(1,b/.045),k=b+.7*Math.max(0,v[m]-b)*y*y*(3-2*y),N=f[m]/u.length,z=.035*Math.exp(-((l[m]/.07)**2))*Math.min(1,k/.12)*(N>.15&&N<.9?1:.4),F=0;for(let W of h0)F+=.075*Math.exp(-(((e[m][0]-W[0])**2+(e[m][1]-W[1])**2)/.05**2));d[m]=Me*Math.sqrt(k)*(b<.03?.75+b/.03*.25:1)+z+F*Math.min(1,b/.05)}let x=Array.from({length:r},()=>new Set);for(let[m,b,y]of i)x[m].add(b).add(y),x[b].add(m).add(y),x[y].add(m).add(b);for(let m=0;m<10;m++){let b=d.slice();for(let y=n;y<r;y++){let k=0,N=0;for(let z of x[y])k+=d[z],N++;N&&(b[y]=d[y]*.5+k/N*.5)}d=b}let w=C0(u,-.62,.46)[0],g=new Int8Array(r).fill(-1),M=new Float32Array(r),E=dt.map(m=>{let b=Math.max(w,C0(u,m.joint[0],m.joint[1])[0]),[y,k]=u0(u,b,m.joint[0],m.joint[1]);return{s:b,a:y,l:k}}),T=new Float32Array(r),L=new Float32Array(r);for(let m=0;m<r;m++){let[b,y]=e[m],k=-1,N=1/0,z=0;if(dt.forEach((F,W)=>{let X=F.foot[0]-F.joint[0],tt=F.foot[1]-F.joint[1],Rt=X*X+tt*tt,U=((b-F.joint[0])*X+(y-F.joint[1])*tt)/Rt,it=Math.max(0,Math.min(1,U)),wt=Math.hypot(F.joint[0]+X*it-b,F.joint[1]+tt*it-y);wt<N&&(N=wt,k=W,z=U)}),k>=0&&z>-.12&&N<p[m]+.02&&N<.3){g[m]=k;let F=Math.min(1,Math.max(0,(z-.02)/.62)),W=Math.min(1,Math.max(0,(.3-N)/.13));M[m]=F*F*(3-2*F)*W*W*(3-2*W);let[X,tt]=u0(u,E[k].s,b,y);T[m]=X,L[m]=tt}}let S=new Float32Array(r),R=new Float32Array(r),H=new Float32Array(r),A=new Float32Array(r),$=new Float32Array(r),K=new Float32Array(r),Y=(m,b,y)=>{let k=Math.min(1,Math.max(0,(y-m)/(b-m)));return k*k*(3-2*k)};for(let m=0;m<r;m++){S[m]=Math.max(w,f[m]);let[b,y]=u0(u,S[m],e[m][0],e[m][1]);if(R[m]=b,H[m]=y,g[m]<0&&f[m]<w){A[m]=.75*Y(.42,.1,p[m])*Y(w,w-.5,f[m]);let[k,N]=u0(u,f[m],e[m][0],e[m][1]);$[m]=k,K[m]=N}}let yt=dt.map((m,b)=>{let y=m.joint,k=i.filter(W=>W.some(X=>g[X]===b)),N=W=>{let X=Math.cos(W),tt=Math.sin(W),Rt=U=>{let it=g[U]===b?M[U]:0,wt=e[U][0]-y[0],Ht=e[U][1]-y[1];return[e[U][0]+(y[0]+wt*X-Ht*tt-e[U][0])*it,e[U][1]+(y[1]+wt*tt+Ht*X-e[U][1])*it]};for(let[U,it,wt]of k){let Ht=Rt(U),K0=Rt(it),Y0=Rt(wt),Q0=(K0[0]-Ht[0])*(Y0[1]-Ht[1])-(K0[1]-Ht[1])*(Y0[0]-Ht[0]),X0=(e[it][0]-e[U][0])*(e[wt][1]-e[U][1])-(e[it][1]-e[U][1])*(e[wt][0]-e[U][0]);if(Math.sign(Q0)!==Math.sign(X0)||Math.abs(Q0)<Math.abs(X0)*.15)return!1}return!0},z=0,F=0;for(;z<.4&&N(z+.02);)z+=.02;for(;F>-.4&&N(F-.02);)F-=.02;return[F,z]}),ct=new Float32Array(r*2);for(let m=0;m<r;m++)ct[m*2]=(e[m][0]+xt)/(2*xt),ct[m*2+1]=(e[m][1]+xt)/(2*xt);let P=[];for(let[m,b,y]of i)(e[b][0]-e[m][0])*(e[y][1]-e[m][1])-(e[b][1]-e[m][1])*(e[y][0]-e[m][0])>0?P.push(m,b,y):P.push(m,y,b);let B=new Ct.BufferGeometry;return B.setAttribute("position",new Ct.Float32BufferAttribute(new Float32Array(r*3),3)),B.setAttribute("normal",new Ct.Float32BufferAttribute(new Float32Array(r*3),3)),B.setAttribute("uv",new Ct.Float32BufferAttribute(ct,2)),B.setAttribute("aDist",new Ct.Float32BufferAttribute(h,1)),B.setIndex(P),{geo:B,n:r,nb:n,pts:e,ring:o,S:f,Lat:l,h:d,dist:h,legIdx:g,legW:M,legA:T,legL:L,joints:E,sAtt:S,along:R,across:H,tailW:A,tailA:$,tailL:K,legRange:yt,spine:u,tris:i}}var Ft=.004,at=(t,o)=>[t[0]-o[0],t[1]-o[1]],_t=(t,o)=>[t[0]+o[0],t[1]+o[1]],vt=(t,o)=>[t[0]*o,t[1]*o],N0=t=>Math.hypot(t[0],t[1]),e0=t=>vt(t,1/(N0(t)||1));function Te(t,o,e){let n=[t[0]];for(let s=1;s<t.length-1;s++){let a=t[s-1],c=t[s],i=t[s+1],r=e0(at(c,a)),h=e0(at(i,c)),u=r[0]*h[1]-r[1]*h[0],f=Math.max(-1,Math.min(1,r[0]*h[0]+r[1]*h[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let v=(u>0?e:o)*Math.tan(l/2);v=Math.min(v,N0(at(c,a))*.48,N0(at(i,c))*.48);let d=v/Math.tan(l/2),x=at(c,vt(r,v)),w=_t(c,vt(h,v)),g=u>0?[-r[1],r[0]]:[r[1],-r[0]],M=_t(x,vt(g,d)),E=Math.atan2(x[1]-M[1],x[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),L=T-E;for(;L>Math.PI;)L-=2*Math.PI;for(;L<-Math.PI;)L+=2*Math.PI;let S=Math.max(2,Math.ceil(Math.abs(L)*d/.01));for(let R=0;R<=S;R++){let H=E+L*R/S;n.push([M[0]+Math.cos(H)*d,M[1]+Math.sin(H)*d])}}return n.push(t[t.length-1]),n}function vo(t,o,e=2,n=!0){let s=[0];for(let h=1;h<t.length;h++){let u=0;for(let f=0;f<e;f++)u+=(t[h][f]-t[h-1][f])**2;s.push(s[h-1]+Math.sqrt(u))}let a=s[s.length-1],c=Math.floor(a/o+1e-9),i=[],r=0;for(let h=0;h<=c;h++){let u=h*o;for(;r<s.length-2&&s[r+1]<u;)r++;let f=(u-s[r])/(s[r+1]-s[r]||1);i.push(t[r].map((l,p)=>l+(t[r+1][p]-l)*f))}return n&&a-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function ke(t){let o=T0(Lt.a),[e,,n]=Lt.c,s=Zt.h,a=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],p=f.n[1],v=f.n[2],d=f.d+l*e+p*s+v*n-v*t,x=g=>l*g[0]+p*g[1]<=d+1e-9,w=[];for(let g=0;g<a.length;g++){let M=a[g],E=a[(g+1)%a.length],T=x(M),L=x(E);if(T&&w.push(M),T!==L){let S=l*M[0]+p*M[1]-d,R=l*E[0]+p*E[1]-d,H=S/(S-R);w.push([M[0]+(E[0]-M[0])*H,M[1]+(E[1]-M[1])*H])}}a=w}let c=a.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),r=Math.max(...c.map(f=>f[0])),h=a.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-r)<1e-9),u=[];for(let f=0;f<a.length;f++){let l=a[(h+f)%a.length];if(u.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:u.reverse(),xl:i,xr:r,top:Math.max(...a.map(f=>f[1]))}}function Se(t,o){let e=Zt,n=e.h,s=Z,a=[[t,s],[lt.x1,s],[lt.x1,0]],c=e.x0+.02,i=.1375,r=n/2;a.push([c-i,0],[c-i,r]);for(let u=7;u<12;u++){let f=u/12*Math.PI;a.push([c-i*Math.sin(f),r-r*Math.cos(f)])}a.push([c,n]);let h=ke(Lt.c[2]);for(let u of h.chain)a.push(u);return a.push([e.x1,n],[e.x1,n-.05],[e.x1-.06,n-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:a.map(([u,f])=>[u-t,f]),top:h.top}}function Ae(t,o){let e=jt.c[0],n=jt.r,s=l0.slice(4,Vt+1),a=l0.slice(Vt),c=[[t,0]];for(let[i,r]of s)c.push([e+i*n,r]);for(let[i,r]of a.slice(1))c.push([e+i*n,r]);for(let[i,r]of a.slice().reverse().slice(1))c.push([e-i*n,r]);for(let[i,r]of s.slice().reverse().slice(1))c.push([e-i*n,r]);return c.push([o,0]),c.map(([i,r])=>[t-i,r])}function F0(t,o,e,n=.07,s=.15){let a=Te(e,n,s),c=[],i=vo(a,Ft/2);for(let r=0;r<i.length;r++){let h=i[Math.max(0,r-1)],u=i[Math.min(i.length-1,r+1)],f=e0(at(u,h)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[r][0],i[r][1],t[1]+o[1]*i[r][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function Tt(t,o){return t.map(([e,n])=>[e,o,n,0,1,0])}function B0(t,o,e,n,s=200){let a=[];for(let c=0;c<=s;c++){let i=c/s,r=1-i;a.push([r*r*r*t[0]+3*r*r*i*o[0]+3*r*i*i*e[0]+i*i*i*n[0],r*r*r*t[1]+3*r*r*i*o[1]+3*r*i*i*e[1]+i*i*i*n[1]])}return a}function D0(t,o,e,n){let s=at(t,vt(o,n)),a=_t(t,vt(e,n));return B0(s,_t(s,vt(o,n*.552)),at(a,vt(e,n*.552)),a,60)}var Re={zA:Lt.c[2],xA0:-.35,xC1:4.75,zC:jt.c[2],xD:-1.05,zD1:3.2,r:.55};function Mo(t){let o=Re,e=[],n={};e.push(Tt(t,Z));let s=t[t.length-1],a=t[t.length-6],c=e0(at(s,a)),i=[o.xA0,o.zA];e.push(Tt(B0(s,_t(s,vt(c,.35)),at(i,[.35,0]),i),Z));let r=[o.xC1,o.zA],h=Se(o.xA0,o.xC1-o.r),u=F0([o.xA0,o.zA],[1,0],h.P);n.topY=h.top,e.push(u),e.push(Tt(D0(r,[1,0],[0,1],o.r),0));let f=[o.xC1,o.zC];e.push(Tt([[r[0],r[1]+o.r],[f[0],f[1]-o.r]],0)),e.push(Tt(D0(f,[0,1],[-1,0],o.r),0));let l=[o.xD,o.zC],p=Ae(f[0]-o.r,l[0]+o.r);e.push(F0([f[0]-o.r,o.zC],[-1,0],p,.05,.12)),e.push(Tt(D0(l,[-1,0],[0,-1],o.r),0));let v=[o.xD,o.zD1],d=l[1]-o.r,x=[[0,0],[d-lt.z1,0],[d-lt.z1,Z],[d-v[1],Z]];e.push(F0([o.xD,d],[0,-1],x));let w=t[0],g=t[5],M=e0(at(g,w));e.push(Tt(B0(v,_t(v,[0,-.6]),at(w,vt(M,.6)),w),Z)),e.push(Tt(t,Z));let E=[];for(let P of e)for(let B of P){let m=E[E.length-1];m&&Math.hypot(B[0]-m[0],B[1]-m[1],B[2]-m[2])<1e-6||E.push(B)}let T=t.length,L=E.slice(0,T),S=E.slice(E.length-T),R=vo(E.slice(T-1,E.length-T+1),Ft,3,!1),H=L.concat(R.slice(1,R.length-1),S),A=H.length,$=new Float32Array(A*3),K=new Float32Array(A*3),Y=new Float32Array(A*3),yt=new Float32Array(A*3);for(let P=0;P<A;P++){let B=H[Math.max(0,P-2)],m=H[Math.min(A-1,P+2)],b=m[0]-B[0],y=m[1]-B[1],k=m[2]-B[2],N=Math.hypot(b,y,k)||1;b/=N,y/=N,k/=N;let z=H[P][3],F=H[P][4],W=H[P][5],X=z*b+F*y+W*k;z-=X*b,F-=X*y,W-=X*k;let tt=Math.hypot(z,F,W)||1;z/=tt,F/=tt,W/=tt;let Rt=F*k-W*y,U=W*b-z*k,it=z*y-F*b;$.set([H[P][0],H[P][1],H[P][2]],P*3),K.set([b,y,k],P*3),yt.set([z,F,W],P*3),Y.set([Rt,U,it],P*3)}for(let P of[yt,Y]){let B=P.slice();for(let m=2;m<A-2;m++)for(let b=0;b<3;b++)P[m*3+b]=(B[(m-2)*3+b]+B[(m-1)*3+b]*2+B[m*3+b]*3+B[(m+1)*3+b]*2+B[(m+2)*3+b])/9}let ct=0;for(let P=0;P<A;P++)$[P*3+1]>$[ct*3+1]&&(ct=P);return n.top=ct*Ft,{pos:$,T:K,B:Y,N:yt,n:A,length:(A-1)*Ft,marks:n}}function p0(t,o,e){let n=Math.min(t.n-1.0001,Math.max(0,o/Ft)),s=Math.floor(n),a=n-s;for(let c of["pos","T","B","N"]){let i=t[c],r=e[c];r[0]=i[s*3]+(i[s*3+3]-i[s*3])*a,r[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*a,r[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*a}return e}function wo(t,o){let e=document.getElementById("frame"),n=()=>{let a=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),r=(c?c.offsetHeight:0)+6+13,h=(i?i.offsetHeight:0)+8+13,u=window.innerWidth-a*2,f=window.innerHeight-r-h,l=f,p=l*t;p>u&&(p=u,l=p/t),p=Math.max(160,Math.floor(p)),l=Math.max(120,Math.floor(l)),e.style.width=`${p}px`,e.style.height=`${l}px`,e.style.top=`${r+Math.max(0,(f-l)/2)}px`,o?.(p,l)};return window.addEventListener("resize",n),n(),n}function go(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(s))};o?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function Eo(t,o,e){let n=s=>{for(let[a,c]of t)a.setAttribute("aria-pressed",String(c===s));o(s)};for(let[s,a]of t)s.addEventListener("click",()=>n(a));return e!==void 0&&n(e),n}function bo(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function yo(t,o=!0){let e=document.getElementById("btn-play"),n=s=>{o=s,e&&(e.setAttribute("aria-pressed",String(!s)),e.querySelector("span").textContent=s?"Pause":"Play",e.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return e?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function To(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function ko(){document.body.classList.add("ready")}var He=performance.now(),Do={},At=t=>{Do[t]=Math.round(performance.now()-He)},Ie=1.4,O=.42,So=[-.95,1.7],Yt=document.getElementById("scene"),r0=new I.WebGLRenderer({canvas:Yt,antialias:!0});r0.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r0.setClearColor(15525333,1);var c0=new I.Scene,a0=to(),Le=eo(a0),Pe=r0.capabilities.getMaxAnisotropy();function Bt(t,o=Le){let e=new I.Mesh(t.build(),o);return e.frustumCulled=!1,c0.add(e),e}Bt(so());Bt(ao());Bt(ro());Bt(co().b);Bt(io());Bt(lo());Bt(fo());At("desk");var No=ho(9).map(t=>({pl:t,c:ft(t,[0,0])})),Bo=-32*(Math.PI/180),bt=null,Ao=1/0;for(let t of No){if(t.pl.r!==1)continue;let o=t.pl.r*(2*Math.PI/3)+Bo,e=Math.hypot(t.c[0],t.c[1]),n=Math.atan2(t.c[1],t.c[0])-o;n=Math.atan2(Math.sin(n),Math.cos(n));let s=Math.abs(e-4.3)+Math.abs(n)*2.5;s<Ao&&(Ao=s,bt=t)}var zo=-Bo-bt.pl.r*(2*Math.PI/3),Ro=Math.cos(zo),Ho=Math.sin(zo),V0=t=>[Ro*t[0]-Ho*t[1],-(Ho*t[0]+Ro*t[1])],Io=ft(bt.pl,[1.24,-.66]),Lo=[So[0]-O*V0(Io)[0],So[1]-O*V0(Io)[1]],U0=t=>{let o=V0(t);return[Lo[0]+O*o[0],Lo[1]+O*o[1]]},d0=t=>U0(ft(bt.pl,t)),j={x0:lt.x0+.06,z0:lt.z0+.05,x1:lt.x1-.04,z1:lt.z1-.05};j.W=j.x1-j.x0;j.D=j.z1-j.z0;var v0=t0(10),Ce=No.filter(t=>v0.every(o=>{let e=U0(ft(t.pl,o));return e[0]>j.x0+.08&&e[0]<j.x1-.08&&e[1]>j.z0+.08&&e[1]<j.z1-.08})),s0={W:j.W,D:j.D,res:2048/j.W,k:O,tiles:Ce,ring:v0,hero:bt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=U0(t);return[o[0]-j.x0,o[1]-j.z0]}},z0=1-rt(s0.rIn,s0.rOut,s0.centreDist(bt));function M0(t){let o=new I.CanvasTexture(t);return o.colorSpace=I.NoColorSpace,o.anisotropy=Pe,o.generateMipmaps=!0,o.minFilter=I.LinearMipmapLinearFilter,o}At("layout");var Fe=L0("L",s0);At("pageL");var De=L0("C",s0);At("pageC");var Ne=g0(a0,M0(Fe),M0(De));{let t=new I.BufferGeometry,o=Z+4e-4;t.setAttribute("position",new I.Float32BufferAttribute([j.x0,o,j.z0,j.x0,o,j.z1,j.x1,o,j.z1,j.x1,o,j.z0],3)),t.setAttribute("normal",new I.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new I.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new I.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new I.Mesh(t,Ne);e.frustumCulled=!1,c0.add(e)}var V=xo(Ft/O);At("lizard");var Dt=V.spine.length,Be=V.spine.pts.map(t=>d0(t)),Mt=Mo(Be);At("path");var Nt=g0(a0,M0(P0("L",v0,bt.pl.r)),M0(P0("C",v0,bt.pl.r)),{contourStep:.05,uvScale:2*xt*O});{let t=(c,i,r)=>rt(c,i,r),o=[.42,.41,.39],e=[.12,.11,.1],n=t(.2,.8,z0),s=.5+.5*t(0,.6,z0),a=o.map((c,i)=>c+(e[i]-c)*n);Nt.uniforms.uSketchLine.value.set(...a.map((c,i)=>Wt[i]+(c-Wt[i])*s)),Nt.uniforms.uSketchPaper.value.set(...Wt),Nt.uniforms.uLineW.value=(.011+.006*z0)/2}At("hero");var q0=new I.Mesh(V.geo,Nt);q0.frustumCulled=!1;q0.renderOrder=2;c0.add(q0);var ze=.62,Ve=.42,Ut=3.2,qt=Dt*O,ht=Mt.length,Gt=Math.min(ht-1,Mt.marks.top+Dt*O*.5),St=(()=>{let t=[0],o=[qt],e=0,n=.004,s=!1;for(let a=qt;a<ht;a+=n){let c=(r,h)=>Math.max(.22,Math.min(1,r/h)),i=ze*c(a-qt,.5)*c(ht-a,.6)*(Math.abs(a-Gt)<.45?Math.max(.25,Math.abs(a-Gt)/.45):1);e+=n/i,!s&&a>=Gt&&(e+=Ut,s=!0,t.push(e),o.push(a)),t.push(e),o.push(Math.min(ht,a+n))}return{T:t,U:o,dur:e}})();function je(t){let{T:o,U:e}=St;if(t<=0)return e[0];if(t>=St.dur)return e[e.length-1];let n=0,s=o.length-1;for(;s-n>1;){let c=n+s>>1;o[c]<=t?n=c:s=c}let a=(t-o[n])/(o[s]-o[n]||1);return e[n]+(e[s]-e[n])*a}var $t=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",St.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],j0=0;for(let t of $t)t.start=j0,j0+=t[1];var x0=j0;function rt(t,o,e){let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)}function Oe(t){t=(t%x0+x0)%x0;let o=$t[0];for(let s of $t)t>=s.start&&(o=s);let e=(t-o.start)/o[1],n={fill:0,relief:0,u:qt,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":n.fill=rt(0,1,e);break;case"relief":n.fill=1,n.relief=.35*rt(0,1,e);break;case"rise":n.fill=1,n.relief=.35+.65*rt(0,1,e);break;case"walk":{n.fill=1,n.relief=1;let s=e*St.dur;n.u=je(s);let a=s-St.T[St.U.findIndex(c=>c>=Gt)];Math.abs(n.u-Gt)<1e-4&&a>=0&&a<=Ut&&(n.pauseT=a);break}case"settle":n.fill=1,n.relief=1,n.u=ht;break;case"sink":n.fill=1,n.relief=1-rt(0,1,e),n.u=ht;break;case"unfill":n.fill=1-rt(0,1,e),n.u=ht;break}return n}var et={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},Po=V.geo.getAttribute("position"),n0=Dt*.79,We=V.joints.map(t=>t.l>0?-1:1),nt={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},m0=dt.map(()=>({ang:0,lift:0,f:{pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]}}));function _e(t){let o=t.u>=ht-1e-6?ht:t.u,e=Math.max(0,o-qt),n=2*Math.PI*e/Ve,s=rt(0,.3,e)*rt(0,.35,ht-o)*(t.pauseT>=0?0:1),a=t.pauseT>=0?.55*Math.sin(t.pauseT/Ut*Math.PI*2)*rt(0,.5,t.pauseT)*rt(Ut,Ut-.5,t.pauseT):0,c=t.pauseT>=0?.12*Math.sin(t.pauseT/Ut*Math.PI):0,i=t.relief;for(let h=0;h<dt.length;h++){let u=n+dt[h].phase,[f,l]=V.legRange[h],p=(f+l)*.4,v=Math.min(.26,(l-f)*.4);m0[h].ang=(p+We[h]*v*Math.sin(u))*s,m0[h].lift=.09*Math.max(0,Math.cos(u))*s,p0(Mt,o-(Dt-V.joints[h].s)*O,m0[h].f)}let r=Po.array;for(let h=0;h<V.n;h++){let u=V.sAtt[h],f=V.along[h],l=V.across[h],p=V.h[h];if(l+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(u/Dt-.45)),u>n0&&(a||c)){let S=rt(n0,n0+.3,u),R=u+f-n0,H=a*S,A=Math.cos(H),$=Math.sin(H),K=n0+R*A-l*$;l=R*$+l*A,f=K-u,p+=c*S*(R/.5)}p0(Mt,o-(Dt-u)*O,et);let v=et.pos[0]+(et.T[0]*f+et.B[0]*l)*O,d=et.pos[1]+(et.T[1]*f+et.B[1]*l)*O,x=et.pos[2]+(et.T[2]*f+et.B[2]*l)*O,w=et.N[0],g=et.N[1],M=et.N[2],E=V.tailW[h];if(E>0){p0(Mt,o-(Dt-V.S[h])*O,nt);let S=V.tailA[h],R=V.tailL[h];v+=(nt.pos[0]+(nt.T[0]*S+nt.B[0]*R)*O-v)*E,d+=(nt.pos[1]+(nt.T[1]*S+nt.B[1]*R)*O-d)*E,x+=(nt.pos[2]+(nt.T[2]*S+nt.B[2]*R)*O-x)*E,w+=(nt.N[0]-w)*E,g+=(nt.N[1]-g)*E,M+=(nt.N[2]-M)*E}let T=V.legIdx[h];if(T>=0){let S=V.joints[T],R=V.legW[h],H=m0[T],A=H.f,$=V.legA[h]-S.a,K=V.legL[h]-S.l,Y=Math.cos(H.ang),yt=Math.sin(H.ang),ct=S.a+$*Y-K*yt,P=S.l+$*yt+K*Y,B=A.pos[0]+(A.T[0]*ct+A.B[0]*P)*O,m=A.pos[1]+(A.T[1]*ct+A.B[1]*P)*O,b=A.pos[2]+(A.T[2]*ct+A.B[2]*P)*O;v+=(B-v)*R,d+=(m-d)*R,x+=(b-x)*R,w+=(A.N[0]-w)*R,g+=(A.N[1]-g)*R,M+=(A.N[2]-M)*R,p+=H.lift*R}let L=p*O*i+.0015;r[h*3]=v+w*L,r[h*3+1]=d+g*L,r[h*3+2]=x+M*L}Po.needsUpdate=!0,V.geo.computeVertexNormals(),Nt.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Nt.uniforms.uFill.value=t.fill}var Ue=10631978,kt=new I.Group,G0=new I.MeshBasicMaterial({color:Ue,transparent:!0,opacity:0,depthWrite:!1,side:I.DoubleSide});function Vo(t,o,e=0,n=0){let s=[],a=[],c=0,i=!0,r=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),r+=c,e&&r>(i?e:n)&&(i=!i,r=0);let l=t[f];if(s.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let p=(f-1)*2;a.push(p,p+1,p+2,p+1,p+3,p+2)}}let h=new I.BufferGeometry;h.setAttribute("position",new I.Float32BufferAttribute(s,3)),h.setIndex(a);let u=new I.Mesh(h,G0);return u.frustumCulled=!1,u}function Co(t,o,e,n,s){let a=o?t.concat([t[0]]):t,c=a.map((i,r)=>{let h=a[Math.max(0,r-1)],u=a[Math.min(a.length-1,r+1)],f=u[0]-h[0],l=u[1]-h[1],p=Math.hypot(f,l)||1;return[i[0],Z+.003,i[1],-l/p,0,f/p]});return Vo(c,e,n,s)}{let t=t0(10).map(n=>d0(n));kt.add(Co(t,!0,.009,.05,.03));let o=[];for(let n=0;n<6;n++)for(let s=0;s<40;s++){let a=Q[n],c=Q[(n+1)%6];o.push(d0([a[0]+(c[0]-a[0])*(s/40),a[1]+(c[1]-a[1])*(s/40)]))}kt.add(Co(o,!0,.0045,.03,.025));for(let n of[0,2,4]){let s=d0(Q[n]),a=new I.Mesh(new I.CircleGeometry(.04,20),G0);a.rotation.x=-Math.PI/2,a.position.set(s[0],Z+.004,s[1]),kt.add(a)}let e=[];for(let n=0;n<Mt.n;n+=4){let s=Mt.pos,a=Mt.N,c=Mt.B;e.push([s[n*3]+a[n*3]*.006,s[n*3+1]+a[n*3+1]*.006,s[n*3+2]+a[n*3+2]*.006,c[n*3],c[n*3+1],c[n*3+2]])}kt.add(Vo(e,.007,.07,.05)),kt.renderOrder=5,kt.visible=!1,c0.add(kt)}var Et=new I.OrthographicCamera(-1,1,1,-1,1,400),O0={H:5.9,target:new I.Vector3(.15,.3,2.35)},w0=1,W0=1;function jo(){let t=O0.target;Et.position.set(t.x+100,t.y+100,t.z+100),Et.up.set(0,1,0),Et.lookAt(t);let o=O0.H/2;Et.left=-o*(w0/W0),Et.right=o*(w0/W0),Et.top=o,Et.bottom=-o,Et.updateProjectionMatrix()}wo(Ie,(t,o)=>{w0=t,W0=o,r0.setSize(t,o),jo()});go();var D={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},Oo=Eo([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{D.lithoTarget=t},1),Wo=document.getElementById("btn-reveal");function $0(t){D.revealTarget=t?1:0,Wo.setAttribute("aria-pressed",String(t))}Wo.addEventListener("click",()=>$0(!D.revealTarget));var _o=yo(t=>{D.playing=t});bo({" ":()=>_o(!D.playing),l:()=>Oo(D.lithoTarget?0:1),r:()=>$0(!D.revealTarget),ArrowRight:()=>{D.t+=1},ArrowLeft:()=>{D.t-=1},0:()=>{D.t=0}});var Kt=null;Yt.addEventListener("pointerdown",t=>{Yt.setPointerCapture(t.pointerId),Kt={x:t.clientX}});Yt.addEventListener("pointermove",t=>{Kt&&(D.t+=(t.clientX-Kt.x)/Math.max(200,w0)*22,Kt.x=t.clientX)});var Uo=()=>{Kt=null};Yt.addEventListener("pointerup",Uo);Yt.addEventListener("pointercancel",Uo);var Fo=performance.now(),_0="",qo=0;function Go(t){qo++;let o=Math.min(.05,Math.max(0,(t-Fo)/1e3));Fo=t,D.playing&&!Kt&&(D.t+=o);for(let[s,a]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=D[a]-D[s];D[s]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}a0.uLitho.value=D.litho,a0.uTime.value=t/1e3;let e=Oe(D.t);_e(e),Nt.uniforms.uContours.value=D.reveal*Math.min(1,e.relief*3),G0.opacity=D.reveal*.9,kt.visible=D.reveal>.01;let n=D.reveal>.5?e.phase[2]:"";n!==_0&&(To(!!n,n),_0=n),r0.render(c0,Et),requestAnimationFrame(Go)}At("ready");ko();requestAnimationFrame(Go);window.__page={state:D,VIEW:O0,updateCamera:jo,TOTAL:x0,PHASES:$t,setPlaying:_o,setLitho:t=>{Oo(t?1:0),D.litho=t?1:0},setReveal:t=>{$0(t),D.reveal=t?1:0},at:(t,o=0)=>{let e=$t.find(n=>n[0]===t);D.t=e.start+e[1]*o},path:Mt,hero:bt,L:V,TIMES:Do,get frames(){return qo},atU(t){let o=$t.find(n=>n[0]==="walk"),e=St.U.findIndex(n=>n>=t);D.t=o.start+St.T[Math.max(0,e)]},UP:Gt,U0:qt,U1:ht,get label(){return _0}};})();
