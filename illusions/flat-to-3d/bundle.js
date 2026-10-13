(()=>{var te=Object.create;var s0=Object.defineProperty;var oe=Object.getOwnPropertyDescriptor;var ee=Object.getOwnPropertyNames;var ne=Object.getPrototypeOf,se=Object.prototype.hasOwnProperty;var ae=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var re=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of ee(o))!se.call(t,s)&&s!==e&&s0(t,s,{get:()=>o[s],enumerable:!(n=oe(o,s))||n.enumerable});return t};var Yt=(t,o,e)=>(e=t!=null?te(ne(t)):{},re(o||!t||!t.__esModule?s0(e,"default",{value:t,enumerable:!0}):e,t));var jt=ae((Ze,a0)=>{a0.exports=window.THREE});var I=Yt(jt(),1);var nt=Yt(jt(),1);function r0(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new nt.Vector3(.1,.9,.66).normalize()},uPaper:{value:new nt.Vector3(.925,.898,.835)},uInk:{value:new nt.Vector3(.11,.1,.09)},uHaze:{value:new nt.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var c0=`
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
`,ce=`
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
`,ie=`
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
`,le=`
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
${c0}
${ce}

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
`;function i0(t,o={}){return new nt.ShaderMaterial({uniforms:t,vertexShader:ie,fragmentShader:le,transparent:!!o.transparent,side:o.side??nt.FrontSide})}var fe=`
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
`,he=`
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
${c0}
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
    float w = fwidth(cl) * 0.8;
    float m = (1.0 - smoothstep(w * 0.5, w * 1.5, dc)) * step(0.5, cl);
    outc = mix(outc, vec3(0.64, 0.23, 0.16), m * uContours * 0.7);
  }
  gl_FragColor = vec4(outc, a * uFade);
}
`;function Eo(t,o,e,n={}){return new nt.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new nt.Vector3(.955,.935,.885)},uSketchLine:{value:new nt.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:fe,fragmentShader:he,transparent:!!n.transparent,side:n.side??nt.FrontSide})}var B=Yt(jt(),1);var $=Yt(jt(),1),ue=1e3,To={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function pe(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function U(t,o=To.PLAIN,e={}){return{c:typeof t=="number"?pe(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var l0=["px","nx","py","ny","pz","nz"];function yt(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function bo(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function Xt(t){return Math.hypot(t[0],t[1],t[2])}function dt(t){let o=Xt(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function yo(t,o){let e=Math.abs(o[0]),n=Math.abs(o[1]),s=Math.abs(o[2]);return e>=n&&e>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var xt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new $.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new $.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,n=o[0],s=o[1],a=o[2];return[e[0]*n+e[4]*s+e[8]*a+e[12],e[1]*n+e[5]*s+e[9]*a+e[13],e[2]*n+e[6]*s+e[10]*a+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,n=o[0],s=o[1],a=o[2];return dt([e[0]*n+e[3]*s+e[6]*a,e[1]*n+e[4]*s+e[7]*a,e[2]*n+e[5]*s+e[8]*a])}tri(o,e,n,s,a=[1,1,1],c={}){let i=this._tp(o),r=this._tp(e),p=this._tp(n),h=dt(bo(yt(e,o),yt(n,o))),f=c.uv||[yo(o,h),yo(e,h),yo(n,h)],l=dt(bo(yt(r,i),yt(p,i))),u=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=Xt(bo(yt(r,i),yt(p,i))),m=[v/(Xt(yt(p,r))||1),v/(Xt(yt(i,p))||1),v/(Xt(yt(r,i))||1)],x=c.k||[1,1,1],w=s.s||0,g=[i,r,p];for(let M=0;M<3;M++){let y=g[M];this.pos.push(y[0]+w,y[1]+w,y[2]+w),this.nrm.push(u[M][0],u[M][1],u[M][2]),this.col.push(s.c[0]*x[M],s.c[1]*x[M],s.c[2]*x[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)a[T]?this.edg.push(M===T?m[T]:0):this.edg.push(ue);this.mat.push(s.p,s.f,s.w)}}quad(o,e,n,s,a,c=[1,1,1,1],i={}){let r=i.k||[1,1,1,1],p=i.n,h=i.uv;this.tri(o,e,n,a,[c[1],0,c[0]],{k:[r[0],r[1],r[2]],n:p&&[p[0],p[1],p[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(o,n,s,a,[c[2],c[3],0],{k:[r[0],r[2],r[3]],n:p&&[p[0],p[2],p[3]],uv:h&&[h[0],h[2],h[3]]})}box(o,e,n,s,a,c,i,r={}){o>s&&([o,s]=[s,o]),e>a&&([e,a]=[a,e]),n>c&&([n,c]=[c,n]);let p=new Set(r.open||[]),h=new Set(r.skip||[]);r.bottom||h.add("ny");let f=r.ao??1,l=r.aoTop??1,u={px:[0,s],nx:[0,o],py:[1,a],ny:[1,e],pz:[2,c],nz:[2,n]},v={px:[[s,e,c],[s,e,n],[s,a,n],[s,a,c]],nx:[[o,e,n],[o,e,c],[o,a,c],[o,a,n]],pz:[[o,e,c],[s,e,c],[s,a,c],[o,a,c]],nz:[[s,e,n],[o,e,n],[o,a,n],[s,a,n]],py:[[o,a,c],[s,a,c],[s,a,n],[o,a,n]],ny:[[o,e,n],[s,e,n],[s,e,c],[o,e,c]]};for(let m of l0){if(h.has(m)||p.has(m))continue;let x=v[m],w=[];for(let y=0;y<4;y++){let T=x[y],S=x[(y+1)%4],C=1;for(let P of l0){if(P===m)continue;let[A,L]=u[P];Math.abs(T[A]-L)<1e-9&&Math.abs(S[A]-L)<1e-9&&p.has(P)&&(C=0)}w.push(C)}let g;m==="py"||m==="ny"?g=[l,l,l,l]:g=[f,f,1,1];let M=m==="py"&&r.top?{...r.top,s:i.s}:i;this.quad(x[0],x[1],x[2],x[3],M,w,{k:g})}}cyl(o,e,n,s,a,c,i,r={}){let p=r.caps??[!0,!0],h=r.rim??[1,1],f=r.r1??s;for(let l=0;l<c;l++){let u=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,m=Math.cos(u),x=Math.sin(u),w=Math.cos(v),g=Math.sin(v),M=[o+s*m,e,n+s*x],y=[o+f*m,a,n+f*x],T=[o+f*w,a,n+f*g],S=[o+s*w,e,n+s*g],C=(s-f)/Math.max(1e-6,a-e),P=dt([m,C,x]),A=dt([w,C,g]),L=u*(s+f)/2,H=v*(s+f)/2;this.quad(M,y,T,S,i,[0,h[1],0,h[0]],{n:[P,P,A,A],uv:[[L,e],[L,a],[H,a],[H,e]],k:r.k}),p[1]&&f>0&&this.tri([o,a,n],T,y,i,[1,0,0]),p[0]&&this.tri([o,e,n],M,S,i,[1,0,0])}}lathe(o,e,n,s,a,c,i={}){let r=s.length,p=[];for(let l=0;l<r-1;l++){let u=s[l+1][0]-s[l][0],v=s[l+1][1]-s[l][1];p.push(dt([v,-u,0]))}let h=s.map((l,u)=>{let v=p[Math.max(0,u-1)],m=p[Math.min(r-2,u)];return dt([v[0]+m[0],v[1]+m[1],0])}),f=i.edges||[];for(let l=0;l<a;l++){let u=l/a*Math.PI*2,v=(l+1)/a*Math.PI*2,m=Math.cos(u),x=Math.sin(u),w=Math.cos(v),g=Math.sin(v);for(let M=0;M<r-1;M++){let[y,T]=s[M],[S,C]=s[M+1],P=[o+y*m,e+T,n+y*x],A=[o+S*m,e+C,n+S*x],L=[o+S*w,e+C,n+S*g],H=[o+y*w,e+T,n+y*g],V=i.flat?p[M]:h[M],O=i.flat?p[M]:h[M+1];this.quad(P,A,L,H,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[V[0]*m,V[1],V[0]*x],[O[0]*m,O[1],O[0]*x],[O[0]*w,O[1],O[0]*g],[V[0]*w,V[1],V[0]*g]],uv:[[u*1.2,T],[u*1.2,C],[v*1.2,C],[v*1.2,T]]})}}}poly(o,e,n={}){for(let s=1;s<o.length-1;s++)this.tri(o[0],o[s],o[s+1],e,[1,s===o.length-2?1:0,s===1?1:0],n)}blob(o,e,n,s,a,c,i,r={}){let p=r.sub??1,h=r.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<p;v++){let m=[];for(let[x,w,g]of f){let M=dt([(x[0]+w[0])/2,(x[1]+w[1])/2,(x[2]+w[2])/2]),y=dt([(w[0]+g[0])/2,(w[1]+g[1])/2,(w[2]+g[2])/2]),T=dt([(g[0]+x[0])/2,(g[1]+x[1])/2,(g[2]+x[2])/2]);m.push([x,M,T],[M,w,y],[T,y,g],[M,y,T])}f=m}let l=v=>1+(r.lump??.12)*Math.sin(v[0]*5.1+h)*Math.sin(v[1]*4.3+h*1.7)*Math.sin(v[2]*3.7+h*.3),u=v=>{let m=l(v);return[o+v[0]*s*m,e+v[1]*a*m,n+v[2]*c*m]};for(let[v,m,x]of f)this.tri(u(v),u(m),u(x),i,[0,0,0],{n:[v,m,x],k:r.k})}build(){let o=new $.BufferGeometry;return o.setAttribute("position",new $.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new $.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new $.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new $.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new $.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new $.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},Pt={T:(t,o,e)=>new $.Matrix4().makeTranslation(t,o,e),RX:t=>new $.Matrix4().makeRotationX(t),RY:t=>new $.Matrix4().makeRotationY(t),RZ:t=>new $.Matrix4().makeRotationZ(t),S:(t,o,e)=>new $.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new $.Matrix4)};var Y={...To,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},Z=.12,ut={x0:-4.5,x1:.35,z0:.3,z1:3.9},Qt={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},Ct={c:[2.45,0,1.6],a:.56},_t={c:[2.35,0,4.45],r:.92,h:.38},me={c:[1.5,0,-.55]},fo={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},vt=(1+Math.sqrt(5))/2;function ko(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let u of[-1,1])o.push([f,l,u]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/vt,l*vt]),o.push([f/vt,l*vt,0]),o.push([f*vt,0,l/vt]);let e=t/(2/vt),n=o.map(f=>f.map(l=>l*e)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*vt],[0,f*vt,l],[f*vt,l,0]);let a=s.map(f=>{let l=Math.hypot(...f),u=f.map(x=>x/l),v=Math.max(...n.map(x=>x[0]*u[0]+x[1]*u[1]+x[2]*u[2])),m=n.map((x,w)=>[w,x[0]*u[0]+x[1]*u[1]+x[2]*u[2]]).filter(([,x])=>x>v-1e-6).map(([x])=>x);return{n:u,d:v,idx:m}}),c=a[0].n,i=new B.Quaternion().setFromUnitVectors(new B.Vector3(...c),new B.Vector3(0,-1,0)),r=new B.Quaternion().setFromAxisAngle(new B.Vector3(0,1,0),.31);i.premultiply(r);let p=f=>new B.Vector3(...f).applyQuaternion(i).toArray();n=n.map(p);for(let f of a)f.n=p(f.n);let h=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-h,f[2]]);for(let f of a){let l=[0,1,2].map(x=>f.idx.reduce((w,g)=>w+n[g][x],0)/f.idx.length),u=new B.Vector3(...f.n),v=new B.Vector3(...n[f.idx[0]]).sub(new B.Vector3(...l)).normalize(),m=new B.Vector3().crossVectors(u,v);f.idx.sort((x,w)=>{let g=new B.Vector3(...n[x]).sub(new B.Vector3(...l)),M=new B.Vector3(...n[w]).sub(new B.Vector3(...l));return Math.atan2(g.dot(m),g.dot(v))-Math.atan2(M.dot(m),M.dot(v))}),f.c=l,f.d=u.dot(new B.Vector3(...l))}return{V:n,faces:a,height:Math.max(...n.map(f=>f[1]))}}function f0(){let t=new xt,o=U(14271394,Y.DESK);return t.box(fo.x0,-.45,fo.z0,fo.x1,0,fo.z1,o,{top:U(15391940,Y.DESK)}),t}function h0(){let t=new xt,{x0:o,x1:e,z0:n,z1:s}=ut;t.box(o,0,n,e,.04,s,U(9209210,Y.CLOTH),{ao:.85}),t.box(o+.06,.04,n+.05,e-.04,Z,s-.05,U(15722970,Y.PAGES),{skip:["py"]});let a=22;for(let c=0;c<a;c++){let i=n+.25+c/(a-1)*(s-n-.5),r=o+.22,p=.16,h=.022,f=10;for(let l=0;l<f;l++){let u=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),m=[r+Math.cos(u)*p,Z*.5+Math.sin(u)*p,i],x=[r+Math.cos(v)*p,Z*.5+Math.sin(v)*p,i];de(t,m,x,h,U(9341572,Y.PLAIN))}}return t}function de(t,o,e,n,s){let a=new B.Vector3(...o),i=new B.Vector3(...e).clone().sub(a),r=i.length(),p=new B.Quaternion().setFromUnitVectors(new B.Vector3(0,1,0),i.normalize()),h=new B.Matrix4().compose(a,p,new B.Vector3(1,1,1));t.push(h),t.cyl(0,0,0,n,r,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function u0(){let t=new xt,{x0:o,x1:e,z0:n,z1:s,h:a}=Qt,c=U(12555380,Y.CLOTH),i=.05;t.box(o,0,n,e,i,s,c,{ao:.85}),t.box(o+.04,i,n+.05,e-.06,a-i,s-.05,U(15525072,Y.PAGES),{skip:["py","nx"]}),t.box(o,a-i,n,e,a,s,c),t.push(Pt.chain(Pt.T(o+.02,a/2,(n+s)/2),Pt.RX(Math.PI/2),Pt.RZ(0)));let r=10;for(let p=0;p<r;p++){let h=Math.PI/2+p/r*Math.PI,f=Math.PI/2+(p+1)/r*Math.PI,l=a/2,u=(s-n)/2,v=[Math.cos(h)*l*.5,-u,Math.sin(h)*l],m=[Math.cos(f)*l*.5,-u,Math.sin(f)*l],x=[Math.cos(f)*l*.5,u,Math.sin(f)*l],w=[Math.cos(h)*l*.5,u,Math.sin(h)*l];t.quad(v,m,x,w,c,[p===0?1:0,1,p===r-1?1:0,1])}return t.pop(),t.box(o+.5,a,n+.6,o+1.6,a+.004,s-.6,U(11041118,Y.CLOTH)),t}function p0(){let t=new xt,o=ko(Ct.a),[e,,n]=Ct.c,s=Qt.h,a=U(15131094,Y.STONE);for(let c of o.faces){let i=c.idx.map(r=>[o.V[r][0]+e,o.V[r][1]+s,o.V[r][2]+n]);t.poly(i,a)}return{b:t,D:o}}var ho=[[0,.03],[.55,.035],[.7,.04],[.72,0],[.8,0],[.88,.12],[.96,.25],[1.02,.33],[1.03,.36],[1,.378],[.95,.36],[.9,.3],[.8,.2],[.62,.11],[.35,.075],[0,.07]],Ot=9;function m0(){let t=new xt,[o,,e]=_t.c,n=ho.map(([c,i])=>[c*_t.r,i]),s=n.slice(0,Ot+1),a=n.slice(Ot);return t.lathe(o,0,e,s,48,U(12105133,Y.PEWTER),{edges:s.map((c,i)=>i===4||i===Ot)}),t.lathe(o,0,e,a,48,U(13223614,Y.PEWTER),{edges:a.map((c,i)=>i===2)}),t}function d0(){let t=new xt,o=new B.Vector3(-3.9,.06,-.75),n=new B.Vector3(-1.3,.06,-.15).clone().sub(o),s=n.length(),a=new B.Quaternion().setFromUnitVectors(new B.Vector3(0,1,0),n.clone().normalize());return t.push(new B.Matrix4().compose(o,a,new B.Vector3(1,1,1))),t.push(Pt.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,U(7307107,Y.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,U(14467994,Y.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,U(3815734,Y.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,U(11577752,Y.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,U(13209478,Y.PLAIN)),t.pop(),t.pop(),t}function x0(){let t=new xt,[o,,e]=me.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,n,28,U(5069411,Y.PLAIN),{edges:n.map((a,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,U(11569762,Y.WOOD)),t.push(Pt.T(o,0,e));let s=10;for(let a=0;a<s;a++){let c=.15+a/s*1.4,i=.15+(a+1)/s*1.4,r=.365;t.quad([Math.cos(c)*r,.1,Math.sin(c)*r],[Math.cos(i)*r,.1,Math.sin(i)*r],[Math.cos(i)*r,.28,Math.sin(i)*r],[Math.cos(c)*r,.28,Math.sin(c)*r],U(15261900,Y.PLAIN),[1,a===s-1?1:0,1,a===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var uo=Math.sqrt(3)/2,X=[[1,0],[.5,uo],[-.5,uo],[-1,0],[-.5,-uo],[.5,-uo]],xe=[[0,0],[.06,.02],[.1,.06],[.13,.15],[.12,.24],[.08,.3],[.06,.36],[.1,.39],[.12,.44],[.17,.44],[.2,.48],[.25,.44],[.26,.36],[.28,.26],[.31,.15],[.35,.06],[.39,0],[.42,-.08],[.41,-.2],[.41,-.33],[.45,-.45],[.53,-.53],[.62,-.55],[.71,-.51],[.76,-.41],[.76,-.29],[.75,-.17],[.76,-.07],[.81,0],[.9,.03],[1,0]],ve=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.43,.24],[.52,.31],[.63,.35],[.75,.36],[.86,.33],[.94,.28],[.97,.23],[.91,.2],[.81,.2],[.72,.17],[.66,.11],[.64,.03],[.72,0],[.86,0],[1,0]],Me=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],So=(t,o,[e,n])=>{let s=o[0]-t[0],a=o[1]-t[1];return[t[0]+e*s+n*a,t[1]+e*a-n*s]};function Ro(t,o,e){let n=Math.sin(e),s=Math.cos(e),a=t[0]-o[0],c=t[1]-o[1];return[o[0]+s*a-n*c,o[1]+n*a+s*c]}function Ao(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,m,x)=>.5*(2*v+(-u+m)*p+(2*u-5*v+4*m-x)*h+(-u+3*v-3*m+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var Zt=2*Math.PI/3;function we(t=10){let o=Ao(xe.map(h=>So(X[0],X[1],h)),t),e=Ao(ve.map(h=>So(X[2],X[3],h)),t),n=Ao(Me.map(h=>So(X[4],X[5],h)),t),s=o,a=e.map(h=>Ro(h,X[2],Zt)).reverse(),c=e,i=n.map(h=>Ro(h,X[4],Zt)).reverse(),r=n,p=o.map(h=>Ro(h,X[0],Zt)).reverse();return[s,a,c,i,r,p]}function Jt(t=10){let o=[];for(let e of we(t))for(let n=0;n<e.length-1;n++)o.push(e[n]);return o}function ge(t,o){return{r:(t.r+o.r)%3,t:pt(t,o.t)}}function pt(t,o){let e=t.r*Zt,n=Math.sin(e),s=Math.cos(e);return[s*o[0]-n*o[1]+t.t[0],n*o[0]+s*o[1]+t.t[1]]}function Ee(t,o){let e=o*Zt,n=Math.sin(e),s=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function v0(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];o.set(e([0,0]),n);let a=[];for(;s.length;){let c=s.shift();a.push(c);for(let i of[0,2,4]){let r=pt(c,X[i]);for(let p of[1,2]){let h=ge(Ee(r,p),c),f=pt(h,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,h),s.push(h))}}}return a}var tt=[[-1.18,.15],[-1.16,.3],[-1.09,.45],[-.96,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.4,-.24],[.62,-.42],[.82,-.57],[1,-.67],[1.17,-.75]],Mt=[{name:"left front",joint:[.7,.1],foot:[1.28,.39],phase:0},{name:"right front",joint:[.2,-.68],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.3,.68],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.7,-.06],foot:[-1.24,-.33],phase:0}],po=[[.98,-.57],[.9,-.76]];var qt=[.955,.935,.885],ct=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,Ut=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],Ho={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[Ut(15324582),Ut(9412730),Ut(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[Ut(9071164),Ut(4149043),Ut(15124378)]},Io=[.12,.11,.1],Lo=[.42,.41,.39],Ft=(t,o,e)=>{let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)};function be(t=60){let o=[0];for(let a=1;a<tt.length;a++)o.push(o[a-1]+Math.hypot(tt[a][0]-tt[a-1][0],tt[a][1]-tt[a-1][1]));let e=o[o.length-1],n=[],s=0;for(let a=0;a<=t;a++){let c=a/t*e;for(;s<o.length-2&&o[s+1]<c;)s++;let i=(c-o[s])/(o[s+1]-o[s]);n.push([tt[s][0]+(tt[s+1][0]-tt[s][0])*i,tt[s][1]+(tt[s+1][1]-tt[s][1])*i,c/e])}return n}var to=be(80);function M0(t,o,e,n,s,a,c,i={}){let r=new Path2D;e.forEach((u,v)=>{let m=o(u);v?r.lineTo(m[0],m[1]):r.moveTo(m[0],m[1])}),r.closePath();let p=i.noFill?0:Ft(.28,.72,s),h=i.noFill?0:Ft(.55,.95,s),f=Ho[a][n];p>0&&(t.fillStyle=ct(f,p),t.fill(r),t.save(),t.clip(r),a==="L"&&n===1&&ye(t,r,c,p*.55),h>0&&Te(t,o,n,a,c,h),t.restore());let l=[0,1,2].map(u=>Lo[u]+(Io[u]-Lo[u])*Ft(.2,.8,s));return t.strokeStyle=ct(l,.5+.5*Ft(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(r),r}function ye(t,o,e,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=ct([.25,.24,.22],n),t.lineWidth=Math.max(.8,e*.006);let a=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let r=-i;r<c+i;r+=a)t.moveTo(r,0),t.lineTo(r+i,i);t.stroke()}function Te(t,o,e,n,s,a){let c=(n==="L"?Ho.markL:Ho.markC)[e],i=e===2;t.fillStyle=ct(c,a*.8),t.beginPath();for(let l=0;l<to.length;l+=1){let u=to[l],v=u[2];if(v<.12||v>.8||l%7)continue;let m=to[Math.max(0,l-1)],x=to[Math.min(to.length-1,l+1)],w=Math.atan2(x[1]-m[1],x[0]-m[0]),g=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=o([u[0],u[1]]),y=o([u[0]+Math.cos(w),u[1]+Math.sin(w)]),T=Math.atan2(y[1]-M[1],y[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*g*s*.8,M[1]+Math.sin(T)*g*s*.8),t.ellipse(M[0],M[1],g*s*.8,g*s*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=ct(c,a*.35);let r=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let u=-16;u<=16;u++){let v=l*.085+(u&1)*.0425,m=u*.074;if(Math.abs(v)>1.35||Math.abs(m)>1.3)continue;let x=o([v,m]);t.moveTo(x[0]+r,x[1]),t.arc(x[0],x[1],r,0,Math.PI*2)}t.fill(),t.strokeStyle=ct(i?[.92,.9,.85]:[.15,.14,.12],a*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of Mt){let u=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],m=Math.hypot(u,v),x=u/m,w=v/m,g=[l.foot[0]-x*.16,l.foot[1]-w*.16];for(let S of[-.5,0,.5]){let C=x*Math.cos(S)-w*Math.sin(S),P=x*Math.sin(S)+w*Math.cos(S),A=o([g[0]+C*.04,g[1]+P*.04]),L=o([g[0]+C*.12,g[1]+P*.12]);t.moveTo(A[0],A[1]),t.lineTo(L[0],L[1])}let M=[l.joint[0]+u*.45,l.joint[1]+v*.45],y=o([M[0]-w*.05,M[1]+x*.05]),T=o([M[0]+w*.05,M[1]-x*.05]);t.moveTo(y[0],y[1]),t.lineTo(T[0],T[1])}t.stroke();let p=o([1.17,-.77]),h=o([1.06,-.84]),f=o([.95,-.87]);t.beginPath(),t.moveTo(p[0],p[1]),t.quadraticCurveTo(h[0],h[1],f[0],f[1]),t.stroke();for(let l of po){let u=o(l);t.fillStyle=ct(i?[.95,.93,.88]:[.98,.97,.94],a),t.beginPath(),t.arc(u[0],u[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=ct(Io,a),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=ct(Io,a),t.beginPath(),t.arc(u[0]+.008*s,u[1],.022*s,0,Math.PI*2),t.fill()}}function Po(t,o){let{W:e,D:n,res:s,tiles:a,ring:c,toPage:i,centreDist:r,hero:p}=o,h=document.createElement("canvas");h.width=Math.round(e*s),h.height=Math.round(n*s);let f=h.getContext("2d");f.fillStyle=ct(qt),f.fillRect(0,0,h.width,h.height);let l=o.k*s;for(let u of a){let v=r(u),m=1-Ft(o.rIn,o.rOut,v);if(m>.6||v>o.rOut+1.6)continue;let x=w=>{let g=i(pt(u.pl,w));return[g[0]*s,g[1]*s]};f.beginPath(),X.forEach((w,g)=>{let M=x(w);g?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=ct(Lo,.22*(1-m)*(1-Ft(o.rOut,o.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let u of a){let v=r(u),m=1-Ft(o.rIn,o.rOut,v);if(v>o.rOut+.6)continue;M0(f,w=>{let g=i(pt(u.pl,w));return[g[0]*s,g[1]*s]},c,u.pl.r,Math.max(.04,m),t,l,{noFill:u===p})}return h}var wt=1.5;function Co(t,o,e,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let a=s.getContext("2d");a.fillStyle=ct(qt),a.fillRect(0,0,n,n);let c=n/(2*wt);return M0(a,r=>[(r[0]+wt)*c,(wt-r[1])*c],o,e,1,t,c),s}var Nt=Yt(jt(),1);var ke=.5;function Se(t,o,e){let n=[0],s=t.length+(e?1:0);for(let p=1;p<s;p++){let h=t[p-1],f=t[p%t.length];n.push(n[p-1]+Math.hypot(f[0]-h[0],f[1]-h[1]))}let a=n[n.length-1],c=Math.max(2,Math.round(a/o)),i=[],r=0;for(let p=0;p<(e?c:c+1);p++){let h=p/c*a;for(;r<n.length-2&&n[r+1]<h;)r++;let f=(h-n[r])/(n[r+1]-n[r]||1),l=t[r],u=t[(r+1)%t.length];i.push([l[0]+(u[0]-l[0])*f,l[1]+(u[1]-l[1])*f])}return{pts:i,length:a}}function Re(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,m,x)=>.5*(2*v+(-u+m)*p+(2*u-5*v+4*m-x)*h+(-u+3*v-3*m+x)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function Ae(t){let o=Re(tt,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let n=[],s=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;s<e.length-2&&e[s+1]<i;)s++;let r=(i-e[s])/(e[s+1]-e[s]||1);n.push([o[s][0]+(o[s+1][0]-o[s][0])*r,o[s][1]+(o[s+1][1]-o[s][1])*r])}let a=(n.length-1)*t,c=n.map((i,r)=>{let p=n[Math.max(0,r-2)],h=n[Math.min(n.length-1,r+2)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l);return[f/u,l/u]});return{pts:n,T:c,N:c.map(([i,r])=>[-r,i]),length:a,step:t}}function w0(t,o,e){let n=!1;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[s],i=t[a];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function g0(t,o,e){let n=1/0;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[a],i=t[s],r=i[0]-c[0],p=i[1]-c[1],h=((o-c[0])*r+(e-c[1])*p)/(r*r+p*p||1);h=Math.max(0,Math.min(1,h));let f=c[0]+h*r-o,l=c[1]+h*p-e;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function He(t){let o=t.length,e=1/0,n=1/0,s=-1/0,a=-1/0;for(let l of t)e=Math.min(e,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),a=Math.max(a,l[1]);let c=Math.max(s-e,a-n)*20,i=(e+s)/2,r=(n+a)/2,p=t.concat([[i-c,r-c],[i,r+c],[i+c,r-c]]),h=(l,u,v)=>{let[m,x]=p[l],[w,g]=p[u],[M,y]=p[v],T=2*(m*(g-y)+w*(y-x)+M*(x-g)),S=((m*m+x*x)*(g-y)+(w*w+g*g)*(y-x)+(M*M+y*y)*(x-g))/T,C=((m*m+x*x)*(M-w)+(w*w+g*g)*(m-M)+(M*M+y*y)*(w-m))/T;return[S,C,(m-S)**2+(x-C)**2]},f=[[o,o+1,o+2,...h(o,o+1,o+2)]];for(let l=0;l<o;l++){let[u,v]=p[l],m=[],x=new Map;for(let w of f)if((u-w[3])**2+(v-w[4])**2<w[5])for(let[g,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let y=g<M?`${g},${M}`:`${M},${g}`;x.has(y)?x.delete(y):x.set(y,[g,M])}else m.push(w);for(let[w,g]of x.values())m.push([w,g,l,...h(w,g,l)]);f=m}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function Fo(t,o,e){let n=0,s=1/0;for(let u=0;u<t.pts.length;u++){let v=(t.pts[u][0]-o)**2+(t.pts[u][1]-e)**2;v<s&&(s=v,n=u)}let a=t.step,c=n*a;for(let u=0;u<4;u++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/a)),m=Math.floor(v),x=v-m,w=[t.pts[m][0]+(t.pts[m+1][0]-t.pts[m][0])*x,t.pts[m][1]+(t.pts[m+1][1]-t.pts[m][1])*x],g=[t.T[m][0]+(t.T[m+1][0]-t.T[m][0])*x,t.T[m][1]+(t.T[m+1][1]-t.T[m][1])*x],M=(o-w[0])*g[0]+(e-w[1])*g[1];c=Math.min((t.pts.length-1)*a,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/a),r=Math.floor(i),p=i-r,h=[t.pts[r][0]+(t.pts[r+1][0]-t.pts[r][0])*p,t.pts[r][1]+(t.pts[r+1][1]-t.pts[r][1])*p],f=[t.N[r][0]+(t.N[r+1][0]-t.N[r][0])*p,t.N[r][1]+(t.N[r+1][1]-t.N[r][1])*p],l=(o-h[0])*f[0]+(e-h[1])*f[1];return[c,l,Math.sqrt(s)]}function Ie(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),n=Math.floor(e),s=e-n,a=c=>[c[n][0]+(c[n+1][0]-c[n][0])*s,c[n][1]+(c[n+1][1]-c[n][1])*s];return{p:a(t.pts),t:a(t.T),n:a(t.N)}}function mo(t,o,e,n){let s=Ie(t,o),a=e-s.p[0],c=n-s.p[1];return[a*s.t[0]+c*s.t[1],a*s.n[0]+c*s.n[1]]}function E0(t){let o=Se(Jt(14),.018,!0).pts,e=o.map(d=>d.slice()),n=e.length,s=.04,a=3,c=()=>(a=a*16807%2147483647)/2147483647-.5;for(let d=-40;d<=40;d++)for(let b=-40;b<=40;b++){let E=b*s+(d&1)*s*.5+c()*.002,k=d*s*.866+c()*.002;Math.abs(E)>1.5||Math.abs(k)>1.5||w0(o,E,k)&&(g0(o,E,k)<s*.55||e.push([E,k]))}let i=He(e).filter(([d,b,E])=>{let k=(e[d][0]+e[b][0]+e[E][0])/3,N=(e[d][1]+e[b][1]+e[E][1])/3;return w0(o,k,N)}),r=e.length,p=new Float32Array(r);for(let d=0;d<r;d++)p[d]=d<n?0:g0(o,e[d][0],e[d][1]);let h=Ae(t),f=new Float32Array(r),l=new Float32Array(r),u=new Float32Array(r);for(let d=0;d<r;d++){let[b,E,k]=Fo(h,e[d][0],e[d][1]);f[d]=b,l[d]=E,u[d]=k}let v=new Float32Array(r);for(let d=0;d<r;d++){let b=0,E=0;for(let k=n;k<r;k++){let N=e[k][0]-e[d][0],q=e[k][1]-e[d][1];N*N+q*q<.0256&&(b+=p[k],E++)}v[d]=E?b/E:p[d]}let m=new Float32Array(r);for(let d=0;d<r;d++){if(d<n)continue;let b=p[d],E=Math.min(1,b/.045),k=b+.7*Math.max(0,v[d]-b)*E*E*(3-2*E),N=f[d]/h.length,q=.035*Math.exp(-((l[d]/.07)**2))*Math.min(1,k/.12)*(N>.15&&N<.9?1:.4),z=0;for(let _ of po)z+=.075*Math.exp(-(((e[d][0]-_[0])**2+(e[d][1]-_[1])**2)/.05**2));m[d]=ke*Math.sqrt(k)*(b<.03?.75+b/.03*.25:1)+q+z*Math.min(1,b/.05)}let x=Array.from({length:r},()=>new Set);for(let[d,b,E]of i)x[d].add(b).add(E),x[b].add(d).add(E),x[E].add(d).add(b);for(let d=0;d<10;d++){let b=m.slice();for(let E=n;E<r;E++){let k=0,N=0;for(let q of x[E])k+=m[q],N++;N&&(b[E]=m[E]*.5+k/N*.5)}m=b}let w=Fo(h,-.62,.46)[0],g=new Int8Array(r).fill(-1),M=new Float32Array(r),y=Mt.map(d=>{let b=Math.max(w,Fo(h,d.joint[0],d.joint[1])[0]),[E,k]=mo(h,b,d.joint[0],d.joint[1]);return{s:b,a:E,l:k}}),T=new Float32Array(r),S=new Float32Array(r);for(let d=0;d<r;d++){let[b,E]=e[d],k=-1,N=1/0,q=0;if(Mt.forEach((z,_)=>{let G=z.foot[0]-z.joint[0],et=z.foot[1]-z.joint[1],bt=G*G+et*et,K=((b-z.joint[0])*G+(E-z.joint[1])*et)/bt,ft=Math.max(0,Math.min(1,K)),ht=Math.hypot(z.joint[0]+G*ft-b,z.joint[1]+et*ft-E);ht<N&&(N=ht,k=_,q=K)}),k>=0&&q>-.12&&N<u[d]+.02&&N<.3){g[d]=k;let z=Math.min(1,Math.max(0,(q-.02)/.62)),_=Math.min(1,Math.max(0,(.3-N)/.13));M[d]=z*z*(3-2*z)*_*_*(3-2*_);let[G,et]=mo(h,y[k].s,b,E);T[d]=G,S[d]=et}}let C=new Float32Array(r),P=new Float32Array(r),A=new Float32Array(r),L=new Float32Array(r),H=new Float32Array(r),V=new Float32Array(r),O=(d,b,E)=>{let k=Math.min(1,Math.max(0,(E-d)/(b-d)));return k*k*(3-2*k)};for(let d=0;d<r;d++){C[d]=Math.max(w,f[d]);let[b,E]=mo(h,C[d],e[d][0],e[d][1]);if(P[d]=b,A[d]=E,g[d]<0&&f[d]<w){L[d]=.75*O(.42,.1,u[d])*O(w,w-.5,f[d]);let[k,N]=mo(h,f[d],e[d][0],e[d][1]);H[d]=k,V[d]=N}}let rt=Mt.map((d,b)=>{let E=d.joint,k=i.filter(_=>_.some(G=>g[G]===b)),N=_=>{let G=Math.cos(_),et=Math.sin(_),bt=K=>{let ft=g[K]===b?M[K]:0,ht=e[K][0]-E[0],Lt=e[K][1]-E[1];return[e[K][0]+(E[0]+ht*G-Lt*et-e[K][0])*ft,e[K][1]+(E[1]+ht*et+Lt*G-e[K][1])*ft]};for(let[K,ft,ht]of k){let Lt=bt(K),t0=bt(ft),o0=bt(ht),e0=(t0[0]-Lt[0])*(o0[1]-Lt[1])-(t0[1]-Lt[1])*(o0[0]-Lt[0]),n0=(e[ft][0]-e[K][0])*(e[ht][1]-e[K][1])-(e[ft][1]-e[K][1])*(e[ht][0]-e[K][0]);if(Math.sign(e0)!==Math.sign(n0)||Math.abs(e0)<Math.abs(n0)*.15)return!1}return!0},q=0,z=0;for(;q<.4&&N(q+.02);)q+=.02;for(;z>-.4&&N(z-.02);)z-=.02;return[z,q]}),J=new Float32Array(r*2);for(let d=0;d<r;d++)J[d*2]=(e[d][0]+wt)/(2*wt),J[d*2+1]=(e[d][1]+wt)/(2*wt);let lt=[];for(let[d,b,E]of i)(e[b][0]-e[d][0])*(e[E][1]-e[d][1])-(e[b][1]-e[d][1])*(e[E][0]-e[d][0])>0?lt.push(d,b,E):lt.push(d,E,b);let R=new Nt.BufferGeometry;return R.setAttribute("position",new Nt.Float32BufferAttribute(new Float32Array(r*3),3)),R.setAttribute("normal",new Nt.Float32BufferAttribute(new Float32Array(r*3),3)),R.setAttribute("uv",new Nt.Float32BufferAttribute(J,2)),R.setAttribute("aDist",new Nt.Float32BufferAttribute(p,1)),R.setIndex(lt),{geo:R,n:r,nb:n,pts:e,ring:o,S:f,Lat:l,h:m,dist:p,legIdx:g,legW:M,legA:T,legL:S,joints:y,sAtt:C,along:P,across:A,tailW:L,tailA:H,tailL:V,legRange:rt,TAIL_BASE:w,spine:h,tris:i}}var St=.004,it=(t,o)=>[t[0]-o[0],t[1]-o[1]],oo=(t,o)=>[t[0]+o[0],t[1]+o[1]],gt=(t,o)=>[t[0]*o,t[1]*o],zo=t=>Math.hypot(t[0],t[1]),eo=t=>gt(t,1/(zo(t)||1));function Le(t,o,e){let n=[t[0]];for(let s=1;s<t.length-1;s++){let a=t[s-1],c=t[s],i=t[s+1],r=eo(it(c,a)),p=eo(it(i,c)),h=r[0]*p[1]-r[1]*p[0],f=Math.max(-1,Math.min(1,r[0]*p[0]+r[1]*p[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let v=(h>0?e:o)*Math.tan(l/2);v=Math.min(v,zo(it(c,a))*.48,zo(it(i,c))*.48);let m=v/Math.tan(l/2),x=it(c,gt(r,v)),w=oo(c,gt(p,v)),g=h>0?[-r[1],r[0]]:[r[1],-r[0]],M=oo(x,gt(g,m)),y=Math.atan2(x[1]-M[1],x[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),S=T-y;for(;S>Math.PI;)S-=2*Math.PI;for(;S<-Math.PI;)S+=2*Math.PI;let C=Math.max(2,Math.ceil(Math.abs(S)*m/.01));for(let P=0;P<=C;P++){let A=y+S*P/C;n.push([M[0]+Math.cos(A)*m,M[1]+Math.sin(A)*m])}}return n.push(t[t.length-1]),n}function b0(t,o,e=2,n=!0){let s=[0];for(let p=1;p<t.length;p++){let h=0;for(let f=0;f<e;f++)h+=(t[p][f]-t[p-1][f])**2;s.push(s[p-1]+Math.sqrt(h))}let a=s[s.length-1],c=Math.floor(a/o+1e-9),i=[],r=0;for(let p=0;p<=c;p++){let h=p*o;for(;r<s.length-2&&s[r+1]<h;)r++;let f=(h-s[r])/(s[r+1]-s[r]||1);i.push(t[r].map((l,u)=>l+(t[r+1][u]-l)*f))}return n&&a-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function Pe(t){let o=ko(Ct.a),[e,,n]=Ct.c,s=Qt.h,a=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],u=f.n[1],v=f.n[2],m=f.d+l*e+u*s+v*n-v*t,x=g=>l*g[0]+u*g[1]<=m+1e-9,w=[];for(let g=0;g<a.length;g++){let M=a[g],y=a[(g+1)%a.length],T=x(M),S=x(y);if(T&&w.push(M),T!==S){let C=l*M[0]+u*M[1]-m,P=l*y[0]+u*y[1]-m,A=C/(C-P);w.push([M[0]+(y[0]-M[0])*A,M[1]+(y[1]-M[1])*A])}}a=w}let c=a.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),r=Math.max(...c.map(f=>f[0])),p=a.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-r)<1e-9),h=[];for(let f=0;f<a.length;f++){let l=a[(p+f)%a.length];if(h.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:h.reverse(),xl:i,xr:r,top:Math.max(...a.map(f=>f[1]))}}function Ce(t,o){let e=Qt,n=e.h,s=Z,a=[[t,s],[ut.x1,s],[ut.x1,0]],c=e.x0+.02,i=.1375,r=n/2;a.push([c-i,0],[c-i,r]);for(let h=7;h<12;h++){let f=h/12*Math.PI;a.push([c-i*Math.sin(f),r-r*Math.cos(f)])}a.push([c,n]);let p=Pe(Ct.c[2]);for(let h of p.chain)a.push(h);return a.push([e.x1,n],[e.x1,n-.05],[e.x1-.06,n-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:a.map(([h,f])=>[h-t,f]),top:p.top}}function Fe(t,o){let e=_t.c[0],n=_t.r,s=ho.slice(4,Ot+1),a=ho.slice(Ot),c=[[t,0]];for(let[i,r]of s)c.push([e+i*n,r]);for(let[i,r]of a.slice(1))c.push([e+i*n,r]);for(let[i,r]of a.slice().reverse().slice(1))c.push([e-i*n,r]);for(let[i,r]of s.slice().reverse().slice(1))c.push([e-i*n,r]);return c.push([o,0]),c.map(([i,r])=>[t-i,r])}function No(t,o,e,n=.07,s=.15){let a=Le(e,n,s),c=[],i=b0(a,St/2);for(let r=0;r<i.length;r++){let p=i[Math.max(0,r-1)],h=i[Math.min(i.length-1,r+1)],f=eo(it(h,p)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[r][0],i[r][1],t[1]+o[1]*i[r][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function Bt(t,o){return t.map(([e,n])=>[e,o,n,0,1,0])}function y0(t,o,e,n,s=200){let a=[];for(let c=0;c<=s;c++){let i=c/s,r=1-i;a.push([r*r*r*t[0]+3*r*r*i*o[0]+3*r*i*i*e[0]+i*i*i*n[0],r*r*r*t[1]+3*r*r*i*o[1]+3*r*i*i*e[1]+i*i*i*n[1]])}return a}function Bo(t,o,e,n){let s=it(t,gt(o,n)),a=oo(t,gt(e,n));return y0(s,oo(s,gt(o,n*.552)),it(a,gt(e,n*.552)),a,60)}var Ne={zA:Ct.c[2],xC1:4.35,zC:_t.c[2],r:.45};function T0(t,o){let e=Ne,n=t.length,s=[],a={},c=t[o],i=eo(it(t[o+5],c)),r=[];for(let R=o;R>0;R--)r.push(it(c,gt(i,R*St)));s.push(Bt(r.concat(t.slice(o)),Z));let p=t[n-1],h=eo(it(p,t[n-6])),f=Math.max(.3,p[1]-e.zA),l=[p[0]+f,e.zA];s.push(Bt(y0(p,oo(p,gt(h,f*.56)),it(l,[f*.56,0]),l),Z));let u=[e.xC1,e.zA],v=Ce(l[0],e.xC1-e.r);s.push(No(l,[1,0],v.P)),a.topY=v.top,s.push(Bt(Bo(u,[1,0],[0,1],e.r),0));let m=[e.xC1,e.zC];s.push(Bt([[u[0],u[1]+e.r],[m[0],m[1]-e.r]],0)),s.push(Bt(Bo(m,[0,1],[-1,0],e.r),0));let x=c[0],w=[x,e.zC],g=Fe(m[0]-e.r,w[0]+e.r);s.push(No([m[0]-e.r,e.zC],[-1,0],g,.05,.12)),s.push(Bt(Bo(w,[-1,0],[0,-1],e.r),0));let M=w[1]-e.r,y=[[0,0],[M-ut.z1,0],[M-ut.z1,Z],[M-c[1],Z]];s.push(No([x,M],[0,-1],y));let T=n-o;s.push(Bt(t.slice(o),Z));let S=[];for(let R of s)for(let d of R){let b=S[S.length-1];b&&Math.hypot(d[0]-b[0],d[1]-b[1],d[2]-b[2])<1e-6||S.push(d)}let C=S.slice(0,n),P=S.slice(S.length-T),A=b0(S.slice(n-1,S.length-T+1),St,3,!1),L=C.concat(A.slice(1,A.length-1),P),H=L.length,V=new Float32Array(H*3),O=new Float32Array(H*3),rt=new Float32Array(H*3),J=new Float32Array(H*3);for(let R=0;R<H;R++){let d=L[Math.max(0,R-2)],b=L[Math.min(H-1,R+2)],E=b[0]-d[0],k=b[1]-d[1],N=b[2]-d[2],q=Math.hypot(E,k,N)||1;E/=q,k/=q,N/=q;let z=L[R][3],_=L[R][4],G=L[R][5],et=z*E+_*k+G*N;z-=et*E,_-=et*k,G-=et*N;let bt=Math.hypot(z,_,G)||1;z/=bt,_/=bt,G/=bt;let K=_*N-G*k,ft=G*E-z*N,ht=z*k-_*E;V.set([L[R][0],L[R][1],L[R][2]],R*3),O.set([E,k,N],R*3),J.set([z,_,G],R*3),rt.set([K,ft,ht],R*3)}for(let R of[J,rt]){let d=R.slice();for(let b=2;b<H-2;b++)for(let E=0;E<3;E++)R[b*3+E]=(d[(b-2)*3+E]+d[(b-1)*3+E]*2+d[b*3+E]*3+d[(b+1)*3+E]*2+d[(b+2)*3+E])/9}let lt=0;for(let R=0;R<H;R++)V[R*3+1]>V[lt*3+1]&&(lt=R);return a.top=lt*St,{pos:V,T:O,B:rt,N:J,n:H,length:(H-1)*St,marks:a}}function no(t,o,e){let n=Math.min(t.n-1.0001,Math.max(0,o/St)),s=Math.floor(n),a=n-s;for(let c of["pos","T","B","N"]){let i=t[c],r=e[c];r[0]=i[s*3]+(i[s*3+3]-i[s*3])*a,r[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*a,r[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*a}return e}function k0(t,o){let e=document.getElementById("frame"),n=()=>{let a=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),r=(c?c.offsetHeight:0)+6+13,p=(i?i.offsetHeight:0)+8+13,h=window.innerWidth-a*2,f=window.innerHeight-r-p,l=f,u=l*t;u>h&&(u=h,l=u/t),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),e.style.width=`${u}px`,e.style.height=`${l}px`,e.style.top=`${r+Math.max(0,(f-l)/2)}px`,o?.(u,l)};return window.addEventListener("resize",n),n(),n}function S0(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(s))};o?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function R0(t,o,e){let n=s=>{for(let[a,c]of t)a.setAttribute("aria-pressed",String(c===s));o(s)};for(let[s,a]of t)s.addEventListener("click",()=>n(a));return e!==void 0&&n(e),n}function A0(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function H0(t,o=!0){let e=document.getElementById("btn-play"),n=s=>{o=s,e&&(e.setAttribute("aria-pressed",String(!s)),e.querySelector("span").textContent=s?"Pause":"Play",e.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return e?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function I0(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function L0(){document.body.classList.add("ready")}var Be=1.25,W=.48,P0=[-.78,2.1],$t=document.getElementById("scene"),io=new I.WebGLRenderer({canvas:$t,antialias:!0});io.setPixelRatio(Math.min(window.devicePixelRatio||1,2));io.setClearColor(15525333,1);var lo=new I.Scene,co=r0(),ze=i0(co),De=io.capabilities.getMaxAnisotropy();function Wt(t,o=ze){let e=new I.Mesh(t.build(),o);return e.frustumCulled=!1,lo.add(e),e}Wt(f0());Wt(h0());Wt(u0());Wt(p0().b);Wt(m0());Wt(d0());Wt(x0());var F=E0(St/W),At=F.spine.length,Wo=Math.round(F.TAIL_BASE/F.spine.step),Ve=Math.atan2(F.spine.T[Wo][1],F.spine.T[Wo][0]),j0=v0(9).map(t=>({pl:t,c:pt(t,[0,0])})),O0=t=>Math.PI/2-Ve-t*(2*Math.PI/3),kt=null,C0=1/0;for(let t of j0){if(t.pl.r!==1)continue;let o=O0(1),e=Math.cos(o)*t.c[0]-Math.sin(o)*t.c[1],n=-(Math.sin(o)*t.c[0]+Math.cos(o)*t.c[1]),s=Math.abs(Math.hypot(e,n)-4.3)+Math.abs(Math.atan2(n,e)-.25)*2.5;s<C0&&(C0=s,kt=t)}var _0=O0(kt.pl.r),F0=Math.cos(_0),N0=Math.sin(_0),jo=t=>[F0*t[0]-N0*t[1],-(N0*t[0]+F0*t[1])],B0=pt(kt.pl,F.spine.pts[F.spine.pts.length-1]),z0=[P0[0]-W*jo(B0)[0],P0[1]-W*jo(B0)[1]],Yo=t=>{let o=jo(t);return[z0[0]+W*o[0],z0[1]+W*o[1]]},ao=t=>Yo(pt(kt.pl,t)),j={x0:ut.x0+.06,z0:ut.z0+.05,x1:ut.x1-.04,z1:ut.z1-.05};j.W=j.x1-j.x0;j.D=j.z1-j.z0;var Mo=Jt(10),We=j0.filter(t=>Mo.every(o=>{let e=Yo(pt(t.pl,o));return e[0]>j.x0+.08&&e[0]<j.x1-.08&&e[1]>j.z0+.08&&e[1]<j.z1-.08})),ro={W:j.W,D:j.D,res:2048/j.W,k:W,tiles:We,ring:Mo,hero:kt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=Yo(t);return[o[0]-j.x0,o[1]-j.z0]}},Do=1-ot(ro.rIn,ro.rOut,ro.centreDist(kt));function wo(t){let o=new I.CanvasTexture(t);return o.colorSpace=I.NoColorSpace,o.anisotropy=De,o.generateMipmaps=!0,o.minFilter=I.LinearMipmapLinearFilter,o}var je=Po("L",ro),Oe=Po("C",ro),_e=Eo(co,wo(je),wo(Oe));{let t=new I.BufferGeometry,o=Z+4e-4;t.setAttribute("position",new I.Float32BufferAttribute([j.x0,o,j.z0,j.x0,o,j.z1,j.x1,o,j.z1,j.x1,o,j.z0],3)),t.setAttribute("normal",new I.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new I.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new I.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new I.Mesh(t,_e);e.frustumCulled=!1,lo.add(e)}var Ue=F.spine.pts.map(t=>ao(t)),mt=T0(Ue,Wo),Oo=new Float32Array(F.n*2);for(let t=0;t<F.n;t++)Oo.set(ao(F.pts[t]),t*2);var Dt=Eo(co,wo(Co("L",Mo,kt.pl.r)),wo(Co("C",Mo,kt.pl.r)),{contourStep:.09,uvScale:2*wt*W});{let t=(c,i,r)=>ot(c,i,r),o=[.42,.41,.39],e=[.12,.11,.1],n=t(.2,.8,Do),s=.5+.5*t(0,.6,Do),a=o.map((c,i)=>c+(e[i]-c)*n);Dt.uniforms.uSketchLine.value.set(...a.map((c,i)=>qt[i]+(c-qt[i])*s)),Dt.uniforms.uSketchPaper.value.set(...qt),Dt.uniforms.uLineW.value=(.011+.006*Do)/2}var Xo=new I.Mesh(F.geo,Dt);Xo.frustumCulled=!1;Xo.renderOrder=2;lo.add(Xo);var qe=.78,Ge=.42,Gt=3.2,Ht=At*W,at=mt.length,Kt=Math.min(at-1,mt.marks.top+At*W*.5),It=(()=>{let t=[0],o=[Ht],e=0,n=.004,s=!1;for(let a=Ht;a<at;a+=n){let c=(r,p)=>Math.max(.22,Math.min(1,r/p)),i=qe*c(a-Ht,.5)*c(at-a,.6)*(Math.abs(a-Kt)<.45?Math.max(.25,Math.abs(a-Kt)/.45):1);e+=n/i,!s&&a>=Kt&&(e+=Gt,s=!0,t.push(e),o.push(a)),t.push(e),o.push(Math.min(at,a+n))}return{T:t,U:o,dur:e}})();function Ke(t){let{T:o,U:e}=It;if(t<=0)return e[0];if(t>=It.dur)return e[e.length-1];let n=0,s=o.length-1;for(;s-n>1;){let c=n+s>>1;o[c]<=t?n=c:s=c}let a=(t-o[n])/(o[s]-o[n]||1);return e[n]+(e[s]-e[n])*a}var zt=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",It.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],_o=0;for(let t of zt)t.start=_o,_o+=t[1];var vo=_o;function ot(t,o,e){let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)}function U0(t){t=(t%vo+vo)%vo;let o=zt[0];for(let s of zt)t>=s.start&&(o=s);let e=(t-o.start)/o[1],n={fill:0,relief:0,u:Ht,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":n.fill=ot(0,1,e);break;case"relief":n.fill=1,n.relief=.35*ot(0,1,e);break;case"rise":n.fill=1,n.relief=.35+.65*ot(0,1,e);break;case"walk":{n.fill=1,n.relief=1;let s=e*It.dur;n.u=Ke(s);let a=s-It.T[It.U.findIndex(c=>c>=Kt)];Math.abs(n.u-Kt)<1e-4&&a>=0&&a<=Gt&&(n.pauseT=a);break}case"settle":n.fill=1,n.relief=1,n.u=at;break;case"sink":n.fill=1,n.relief=1-ot(0,1,e),n.u=at;break;case"unfill":n.fill=1-ot(0,1,e),n.u=at;break}return n}var st={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},D0=F.geo.getAttribute("position"),so=At*.79,$e=F.joints.map(t=>t.l>0?-1:1),Q={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},xo=Mt.map(()=>({ang:0,lift:0,f:{pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]}}));function q0(t){let o=t.u>=at-1e-6?at:t.u,e=Math.max(0,o-Ht),n=2*Math.PI*e/Ge,s=ot(0,.3,e)*ot(0,.35,at-o)*(t.pauseT>=0?0:1),a=t.pauseT>=0?.55*Math.sin(t.pauseT/Gt*Math.PI*2)*ot(0,.5,t.pauseT)*ot(Gt,Gt-.5,t.pauseT):0,c=t.pauseT>=0?.12*Math.sin(t.pauseT/Gt*Math.PI):0,i=t.relief,r=Math.max(ot(Ht+.5,Ht,o),ot(at-.5,at,o));for(let h=0;h<Mt.length;h++){let f=n+Mt[h].phase,[l,u]=F.legRange[h],v=(l+u)*.4,m=Math.min(.26,(u-l)*.4);xo[h].ang=(v+$e[h]*m*Math.sin(f))*s,xo[h].lift=.09*Math.max(0,Math.cos(f))*s,no(mt,o-(At-F.joints[h].s)*W,xo[h].f)}let p=D0.array;for(let h=0;h<F.n;h++){let f=F.sAtt[h],l=F.along[h],u=F.across[h],v=F.h[h];if(u+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(f/At-.45)),f>so&&(a||c)){let P=ot(so,so+.3,f),A=f+l-so,L=a*P,H=Math.cos(L),V=Math.sin(L),O=so+A*H-u*V;u=A*V+u*H,l=O-f,v+=c*P*(A/.5)}no(mt,o-(At-f)*W,st);let m=st.pos[0]+(st.T[0]*l+st.B[0]*u)*W,x=st.pos[1]+(st.T[1]*l+st.B[1]*u)*W,w=st.pos[2]+(st.T[2]*l+st.B[2]*u)*W,g=st.N[0],M=st.N[1],y=st.N[2],T=F.tailW[h];if(T>0){no(mt,o-(At-F.S[h])*W,Q);let P=F.tailA[h],A=F.tailL[h],L=Q.pos[0]+(Q.T[0]*P+Q.B[0]*A)*W,H=Q.pos[1]+(Q.T[1]*P+Q.B[1]*A)*W,V=Q.pos[2]+(Q.T[2]*P+Q.B[2]*A)*W,O=Q.N[0],rt=Q.N[1],J=Q.N[2];r>0&&(L+=(Oo[h*2]-L)*r,H+=(Z-H)*r,V+=(Oo[h*2+1]-V)*r,O-=O*r,rt+=(1-rt)*r,J-=J*r),m+=(L-m)*T,x+=(H-x)*T,w+=(V-w)*T,g+=(O-g)*T,M+=(rt-M)*T,y+=(J-y)*T}let S=F.legIdx[h];if(S>=0){let P=F.joints[S],A=F.legW[h],L=xo[S],H=L.f,V=F.legA[h]-P.a,O=F.legL[h]-P.l,rt=Math.cos(L.ang),J=Math.sin(L.ang),lt=P.a+V*rt-O*J,R=P.l+V*J+O*rt,d=H.pos[0]+(H.T[0]*lt+H.B[0]*R)*W,b=H.pos[1]+(H.T[1]*lt+H.B[1]*R)*W,E=H.pos[2]+(H.T[2]*lt+H.B[2]*R)*W;m+=(d-m)*A,x+=(b-x)*A,w+=(E-w)*A,g+=(H.N[0]-g)*A,M+=(H.N[1]-M)*A,y+=(H.N[2]-y)*A,v+=L.lift*A}let C=v*W*i+.0015;p[h*3]=m+g*C,p[h*3+1]=x+M*C,p[h*3+2]=w+y*C}D0.needsUpdate=!0,F.geo.computeVertexNormals(),Dt.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Dt.uniforms.uFill.value=t.fill}var Ye=10631978,Rt=new I.Group,Qo=new I.MeshBasicMaterial({color:Ye,transparent:!0,opacity:0,depthWrite:!1,side:I.DoubleSide});function G0(t,o,e=0,n=0){let s=[],a=[],c=0,i=!0,r=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),r+=c,e&&r>(i?e:n)&&(i=!i,r=0);let l=t[f];if(s.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let u=(f-1)*2;a.push(u,u+1,u+2,u+1,u+3,u+2)}}let p=new I.BufferGeometry;p.setAttribute("position",new I.Float32BufferAttribute(s,3)),p.setIndex(a);let h=new I.Mesh(p,Qo);return h.frustumCulled=!1,h}function V0(t,o,e,n,s){let a=o?t.concat([t[0]]):t,c=a.map((i,r)=>{let p=a[Math.max(0,r-1)],h=a[Math.min(a.length-1,r+1)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l)||1;return[i[0],Z+.003,i[1],-l/u,0,f/u]});return G0(c,e,n,s)}{let t=Jt(10).map(n=>ao(n));Rt.add(V0(t,!0,.009,.05,.03));let o=[];for(let n=0;n<6;n++)for(let s=0;s<40;s++){let a=X[n],c=X[(n+1)%6];o.push(ao([a[0]+(c[0]-a[0])*(s/40),a[1]+(c[1]-a[1])*(s/40)]))}Rt.add(V0(o,!0,.0045,.03,.025));for(let n of[0,2,4]){let s=ao(X[n]),a=new I.Mesh(new I.CircleGeometry(.04,20),Qo);a.rotation.x=-Math.PI/2,a.position.set(s[0],Z+.004,s[1]),Rt.add(a)}let e=[];for(let n=0;n<mt.n;n+=4){let s=mt.pos,a=mt.N,c=mt.B;e.push([s[n*3]+a[n*3]*.006,s[n*3+1]+a[n*3+1]*.006,s[n*3+2]+a[n*3+2]*.006,c[n*3],c[n*3+1],c[n*3+2]])}Rt.add(G0(e,.007,.07,.05)),Rt.renderOrder=5,Rt.visible=!1,lo.add(Rt)}var Tt=new I.OrthographicCamera(-1,1,1,-1,1,400),Et={H:5.45,target:new I.Vector3(.75,.3,2.1)},Uo={H:Et.H,target:Et.target.clone()},Xe={H:3.3},qo=!1,Vo=new I.Vector3,go=1,Go=1;function Zo(){let t=Et.target;Tt.position.set(t.x+100,t.y+100,t.z+100),Tt.up.set(0,1,0),Tt.lookAt(t);let o=Et.H/2;Tt.left=-o*(go/Go),Tt.right=o*(go/Go),Tt.top=o,Tt.bottom=-o,Tt.updateProjectionMatrix()}function K0(){let t=window.innerWidth<640;k0(t?1:Be,(o,e)=>{go=o,Go=e,io.setSize(o,e),qo=t,qo||(Et.H=Uo.H,Et.target.copy(Uo.target)),Zo()})}var Ko=null;window.addEventListener("resize",()=>{let t=window.innerWidth<640;t!==Ko&&(Ko=t,K0())});Ko=window.innerWidth<640;K0();S0();var D={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},$0=R0([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{D.lithoTarget=t},1),Y0=document.getElementById("btn-reveal");function Jo(t){D.revealTarget=t?1:0,Y0.setAttribute("aria-pressed",String(t))}Y0.addEventListener("click",()=>Jo(!D.revealTarget));var X0=H0(t=>{D.playing=t});A0({" ":()=>X0(!D.playing),l:()=>$0(D.lithoTarget?0:1),r:()=>Jo(!D.revealTarget),ArrowRight:()=>{D.t+=1},ArrowLeft:()=>{D.t-=1},0:()=>{D.t=0}});var Vt=null;$t.addEventListener("pointerdown",t=>{$t.setPointerCapture(t.pointerId),Vt={x:t.clientX}});$t.addEventListener("pointermove",t=>{Vt&&(D.t+=(t.clientX-Vt.x)/Math.max(200,go)*22,Vt.x=t.clientX)});var Q0=()=>{Vt=null};$t.addEventListener("pointerup",Q0);$t.addEventListener("pointercancel",Q0);var W0=performance.now(),$o="",Z0=0;function J0(t){Z0++;let o=Math.min(.05,Math.max(0,(t-W0)/1e3));W0=t,D.playing&&!Vt&&(D.t+=o);for(let[s,a]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=D[a]-D[s];D[s]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}co.uLitho.value=D.litho,co.uTime.value=t/1e3;let e=U0(D.t);if(q0(e),qo){no(mt,e.u-At*W*.5,Q),Vo.set(Q.pos[0],.3,Q.pos[2]).lerp(Uo.target,.25);let s=Et.target.distanceTo(Vo);Et.target.lerp(Vo,Vt||s>1.2?1:Math.min(1,o*2.5)),Et.H=Xe.H,Zo()}Dt.uniforms.uContours.value=D.reveal*Math.min(1,e.relief*3),Qo.opacity=D.reveal*.9,Rt.visible=D.reveal>.01;let n=D.reveal>.5?e.phase[2]:"";n!==$o&&(I0(!!n,n),$o=n),io.render(lo,Tt),requestAnimationFrame(J0)}L0();requestAnimationFrame(J0);window.__page={state:D,VIEW:Et,updateCamera:Zo,TOTAL:vo,PHASES:zt,setPlaying:X0,setLitho:t=>{$0(t?1:0),D.litho=t?1:0},setReveal:t=>{Jo(t),D.reveal=t?1:0},at:(t,o=0)=>{let e=zt.find(n=>n[0]===t);D.t=e.start+e[1]*o},path:mt,hero:kt,L:F,get frames(){return Z0},bench(t=30){let o=zt.find(n=>n[0]==="walk"),e=performance.now();for(let n=0;n<t;n++)q0(U0(o.start+3+n*.1));return(performance.now()-e)/t},atU(t){let o=zt.find(n=>n[0]==="walk"),e=It.U.findIndex(n=>n>=t);D.t=o.start+It.T[Math.max(0,e)]},UP:Kt,U0:Ht,U1:at,get label(){return $o}};})();
