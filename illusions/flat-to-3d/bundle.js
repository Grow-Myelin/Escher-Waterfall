(()=>{var Ve=Object.create;var Wo=Object.defineProperty;var Oe=Object.getOwnPropertyDescriptor;var je=Object.getOwnPropertyNames;var We=Object.getPrototypeOf,_e=Object.prototype.hasOwnProperty;var Ue=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var qe=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of je(o))!_e.call(t,s)&&s!==e&&Wo(t,s,{get:()=>o[s],enumerable:!(n=Oe(o,s))||n.enumerable});return t};var Ot=(t,o,e)=>(e=t!=null?Ve(We(t)):{},qe(o||!t||!t.__esModule?Wo(e,"default",{value:t,enumerable:!0}):e,t));var Ht=Ue((B0,_o)=>{_o.exports=window.THREE});var A=Ot(Ht(),1);var Y=Ot(Ht(),1);function Uo(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new Y.Vector3(.1,.9,.66).normalize()},uPaper:{value:new Y.Vector3(.925,.898,.835)},uInk:{value:new Y.Vector3(.11,.1,.09)},uHaze:{value:new Y.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var qo=`
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
`,Ge=`
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
`,Ke=`
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
${qo}
${Ge}

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
`;function Go(t,o={}){return new Y.ShaderMaterial({uniforms:t,vertexShader:$e,fragmentShader:Ke,transparent:!!o.transparent,side:o.side??Y.FrontSide})}var Ye=`
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
`,Qe=`
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
${qo}
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
`;function uo(t,o,e,n={}){return new Y.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new Y.Vector3(.955,.935,.885)},uSketchLine:{value:new Y.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:Ye,fragmentShader:Qe,transparent:!!n.transparent,side:n.side??Y.FrontSide})}var P=Ot(Ht(),1);var j=Ot(Ht(),1),Xe=1e3,vo={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Ze(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function O(t,o=vo.PLAIN,e={}){return{c:typeof t=="number"?Ze(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var $o=["px","nx","py","ny","pz","nz"];function ut(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function po(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function jt(t){return Math.hypot(t[0],t[1],t[2])}function at(t){let o=jt(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function mo(t,o){let e=Math.abs(o[0]),n=Math.abs(o[1]),s=Math.abs(o[2]);return e>=n&&e>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var rt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new j.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new j.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,n=o[0],s=o[1],a=o[2];return[e[0]*n+e[4]*s+e[8]*a+e[12],e[1]*n+e[5]*s+e[9]*a+e[13],e[2]*n+e[6]*s+e[10]*a+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,n=o[0],s=o[1],a=o[2];return at([e[0]*n+e[3]*s+e[6]*a,e[1]*n+e[4]*s+e[7]*a,e[2]*n+e[5]*s+e[8]*a])}tri(o,e,n,s,a=[1,1,1],c={}){let i=this._tp(o),r=this._tp(e),p=this._tp(n),h=at(po(ut(e,o),ut(n,o))),f=c.uv||[mo(o,h),mo(e,h),mo(n,h)],l=at(po(ut(r,i),ut(p,i))),u=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=jt(po(ut(r,i),ut(p,i))),m=[v/(jt(ut(p,r))||1),v/(jt(ut(i,p))||1),v/(jt(ut(r,i))||1)],d=c.k||[1,1,1],w=s.s||0,E=[i,r,p];for(let M=0;M<3;M++){let g=E[M];this.pos.push(g[0]+w,g[1]+w,g[2]+w),this.nrm.push(u[M][0],u[M][1],u[M][2]),this.col.push(s.c[0]*d[M],s.c[1]*d[M],s.c[2]*d[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)a[T]?this.edg.push(M===T?m[T]:0):this.edg.push(Xe);this.mat.push(s.p,s.f,s.w)}}quad(o,e,n,s,a,c=[1,1,1,1],i={}){let r=i.k||[1,1,1,1],p=i.n,h=i.uv;this.tri(o,e,n,a,[c[1],0,c[0]],{k:[r[0],r[1],r[2]],n:p&&[p[0],p[1],p[2]],uv:h&&[h[0],h[1],h[2]]}),this.tri(o,n,s,a,[c[2],c[3],0],{k:[r[0],r[2],r[3]],n:p&&[p[0],p[2],p[3]],uv:h&&[h[0],h[2],h[3]]})}box(o,e,n,s,a,c,i,r={}){o>s&&([o,s]=[s,o]),e>a&&([e,a]=[a,e]),n>c&&([n,c]=[c,n]);let p=new Set(r.open||[]),h=new Set(r.skip||[]);r.bottom||h.add("ny");let f=r.ao??1,l=r.aoTop??1,u={px:[0,s],nx:[0,o],py:[1,a],ny:[1,e],pz:[2,c],nz:[2,n]},v={px:[[s,e,c],[s,e,n],[s,a,n],[s,a,c]],nx:[[o,e,n],[o,e,c],[o,a,c],[o,a,n]],pz:[[o,e,c],[s,e,c],[s,a,c],[o,a,c]],nz:[[s,e,n],[o,e,n],[o,a,n],[s,a,n]],py:[[o,a,c],[s,a,c],[s,a,n],[o,a,n]],ny:[[o,e,n],[s,e,n],[s,e,c],[o,e,c]]};for(let m of $o){if(h.has(m)||p.has(m))continue;let d=v[m],w=[];for(let g=0;g<4;g++){let T=d[g],R=d[(g+1)%4],L=1;for(let H of $o){if(H===m)continue;let[k,I]=u[H];Math.abs(T[k]-I)<1e-9&&Math.abs(R[k]-I)<1e-9&&p.has(H)&&(L=0)}w.push(L)}let E;m==="py"||m==="ny"?E=[l,l,l,l]:E=[f,f,1,1];let M=m==="py"&&r.top?{...r.top,s:i.s}:i;this.quad(d[0],d[1],d[2],d[3],M,w,{k:E})}}cyl(o,e,n,s,a,c,i,r={}){let p=r.caps??[!0,!0],h=r.rim??[1,1],f=r.r1??s;for(let l=0;l<c;l++){let u=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,m=Math.cos(u),d=Math.sin(u),w=Math.cos(v),E=Math.sin(v),M=[o+s*m,e,n+s*d],g=[o+f*m,a,n+f*d],T=[o+f*w,a,n+f*E],R=[o+s*w,e,n+s*E],L=(s-f)/Math.max(1e-6,a-e),H=at([m,L,d]),k=at([w,L,E]),I=u*(s+f)/2,x=v*(s+f)/2;this.quad(M,g,T,R,i,[0,h[1],0,h[0]],{n:[H,H,k,k],uv:[[I,e],[I,a],[x,a],[x,e]],k:r.k}),p[1]&&f>0&&this.tri([o,a,n],T,g,i,[1,0,0]),p[0]&&this.tri([o,e,n],M,R,i,[1,0,0])}}lathe(o,e,n,s,a,c,i={}){let r=s.length,p=[];for(let l=0;l<r-1;l++){let u=s[l+1][0]-s[l][0],v=s[l+1][1]-s[l][1];p.push(at([v,-u,0]))}let h=s.map((l,u)=>{let v=p[Math.max(0,u-1)],m=p[Math.min(r-2,u)];return at([v[0]+m[0],v[1]+m[1],0])}),f=i.edges||[];for(let l=0;l<a;l++){let u=l/a*Math.PI*2,v=(l+1)/a*Math.PI*2,m=Math.cos(u),d=Math.sin(u),w=Math.cos(v),E=Math.sin(v);for(let M=0;M<r-1;M++){let[g,T]=s[M],[R,L]=s[M+1],H=[o+g*m,e+T,n+g*d],k=[o+R*m,e+L,n+R*d],I=[o+R*w,e+L,n+R*E],x=[o+g*w,e+T,n+g*E],b=i.flat?p[M]:h[M],y=i.flat?p[M]:h[M+1];this.quad(H,k,I,x,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[b[0]*m,b[1],b[0]*d],[y[0]*m,y[1],y[0]*d],[y[0]*w,y[1],y[0]*E],[b[0]*w,b[1],b[0]*E]],uv:[[u*1.2,T],[u*1.2,L],[v*1.2,L],[v*1.2,T]]})}}}poly(o,e,n={}){for(let s=1;s<o.length-1;s++)this.tri(o[0],o[s],o[s+1],e,[1,s===o.length-2?1:0,s===1?1:0],n)}blob(o,e,n,s,a,c,i,r={}){let p=r.sub??1,h=r.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<p;v++){let m=[];for(let[d,w,E]of f){let M=at([(d[0]+w[0])/2,(d[1]+w[1])/2,(d[2]+w[2])/2]),g=at([(w[0]+E[0])/2,(w[1]+E[1])/2,(w[2]+E[2])/2]),T=at([(E[0]+d[0])/2,(E[1]+d[1])/2,(E[2]+d[2])/2]);m.push([d,M,T],[M,w,g],[T,g,E],[M,g,T])}f=m}let l=v=>1+(r.lump??.12)*Math.sin(v[0]*5.1+h)*Math.sin(v[1]*4.3+h*1.7)*Math.sin(v[2]*3.7+h*.3),u=v=>{let m=l(v);return[o+v[0]*s*m,e+v[1]*a*m,n+v[2]*c*m]};for(let[v,m,d]of f)this.tri(u(v),u(m),u(d),i,[0,0,0],{n:[v,m,d],k:r.k})}build(){let o=new j.BufferGeometry;return o.setAttribute("position",new j.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new j.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new j.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new j.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new j.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new j.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},Et={T:(t,o,e)=>new j.Matrix4().makeTranslation(t,o,e),RX:t=>new j.Matrix4().makeRotationX(t),RY:t=>new j.Matrix4().makeRotationY(t),RZ:t=>new j.Matrix4().makeRotationZ(t),S:(t,o,e)=>new j.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new j.Matrix4)};var W={...vo,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},q=.12,ot={x0:-4.5,x1:.35,z0:.3,z1:3.9},Wt={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},gt={c:[2.45,0,1.6],a:.5},Lt={c:[2.45,0,4.55],r:.95,h:.26},Je={c:[3.5,0,-.9]},oo={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},ct=(1+Math.sqrt(5))/2;function xo(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let u of[-1,1])o.push([f,l,u]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/ct,l*ct]),o.push([f/ct,l*ct,0]),o.push([f*ct,0,l/ct]);let e=t/(2/ct),n=o.map(f=>f.map(l=>l*e)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*ct],[0,f*ct,l],[f*ct,l,0]);let a=s.map(f=>{let l=Math.hypot(...f),u=f.map(d=>d/l),v=Math.max(...n.map(d=>d[0]*u[0]+d[1]*u[1]+d[2]*u[2])),m=n.map((d,w)=>[w,d[0]*u[0]+d[1]*u[1]+d[2]*u[2]]).filter(([,d])=>d>v-1e-6).map(([d])=>d);return{n:u,d:v,idx:m}}),c=a[0].n,i=new P.Quaternion().setFromUnitVectors(new P.Vector3(...c),new P.Vector3(0,-1,0)),r=new P.Quaternion().setFromAxisAngle(new P.Vector3(0,1,0),.31);i.premultiply(r);let p=f=>new P.Vector3(...f).applyQuaternion(i).toArray();n=n.map(p);for(let f of a)f.n=p(f.n);let h=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-h,f[2]]);for(let f of a){let l=[0,1,2].map(d=>f.idx.reduce((w,E)=>w+n[E][d],0)/f.idx.length),u=new P.Vector3(...f.n),v=new P.Vector3(...n[f.idx[0]]).sub(new P.Vector3(...l)).normalize(),m=new P.Vector3().crossVectors(u,v);f.idx.sort((d,w)=>{let E=new P.Vector3(...n[d]).sub(new P.Vector3(...l)),M=new P.Vector3(...n[w]).sub(new P.Vector3(...l));return Math.atan2(E.dot(m),E.dot(v))-Math.atan2(M.dot(m),M.dot(v))}),f.c=l,f.d=u.dot(new P.Vector3(...l))}return{V:n,faces:a,height:Math.max(...n.map(f=>f[1]))}}function Ko(){let t=new rt,o=O(14271394,W.DESK);return t.box(oo.x0,-.45,oo.z0,oo.x1,0,oo.z1,o,{top:O(15391940,W.DESK)}),t}function Yo(){let t=new rt,{x0:o,x1:e,z0:n,z1:s}=ot;t.box(o,0,n,e,.04,s,O(9209210,W.CLOTH),{ao:.85}),t.box(o+.06,.04,n+.05,e-.04,q,s-.05,O(15722970,W.PAGES),{skip:["py"]});let a=22;for(let c=0;c<a;c++){let i=n+.25+c/(a-1)*(s-n-.5),r=o+.22,p=.16,h=.022,f=10;for(let l=0;l<f;l++){let u=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),m=[r+Math.cos(u)*p,q*.5+Math.sin(u)*p,i],d=[r+Math.cos(v)*p,q*.5+Math.sin(v)*p,i];t0(t,m,d,h,O(9341572,W.PLAIN))}}return t}function t0(t,o,e,n,s){let a=new P.Vector3(...o),i=new P.Vector3(...e).clone().sub(a),r=i.length(),p=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),i.normalize()),h=new P.Matrix4().compose(a,p,new P.Vector3(1,1,1));t.push(h),t.cyl(0,0,0,n,r,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function Qo(){let t=new rt,{x0:o,x1:e,z0:n,z1:s,h:a}=Wt,c=O(12555380,W.CLOTH),i=.05;t.box(o,0,n,e,i,s,c,{ao:.85}),t.box(o+.04,i,n+.05,e-.06,a-i,s-.05,O(15525072,W.PAGES),{skip:["py","nx"]}),t.box(o,a-i,n,e,a,s,c),t.push(Et.chain(Et.T(o+.02,a/2,(n+s)/2),Et.RX(Math.PI/2),Et.RZ(0)));let r=10;for(let p=0;p<r;p++){let h=Math.PI/2+p/r*Math.PI,f=Math.PI/2+(p+1)/r*Math.PI,l=a/2,u=(s-n)/2,v=[Math.cos(h)*l*.5,-u,Math.sin(h)*l],m=[Math.cos(f)*l*.5,-u,Math.sin(f)*l],d=[Math.cos(f)*l*.5,u,Math.sin(f)*l],w=[Math.cos(h)*l*.5,u,Math.sin(h)*l];t.quad(v,m,d,w,c,[p===0?1:0,1,p===r-1?1:0,1])}return t.pop(),t.box(o+.5,a,n+.6,o+1.6,a+.004,s-.6,O(11041118,W.CLOTH)),t}function Xo(){let t=new rt,o=xo(gt.a),[e,,n]=gt.c,s=Wt.h,a=O(15131094,W.STONE);for(let c of o.faces){let i=c.idx.map(r=>[o.V[r][0]+e,o.V[r][1]+s,o.V[r][2]+n]);t.poly(i,a)}return{b:t,D:o}}var eo=[[0,.03],[.6,.035],[.78,.04],[.8,0],[.86,0],[.92,.09],[.98,.18],[1.02,.25],[1.01,.275],[.97,.255],[.9,.2],[.8,.13],[.65,.085],[.4,.065],[0,.06]],It=8;function Zo(){let t=new rt,[o,,e]=Lt.c,n=eo.map(([c,i])=>[c*Lt.r,i]),s=n.slice(0,It+1),a=n.slice(It);return t.lathe(o,0,e,s,48,O(12105133,W.PEWTER),{edges:s.map((c,i)=>i===4||i===It)}),t.lathe(o,0,e,a.slice().reverse(),48,O(12894649,W.PEWTER),{edges:a.map(()=>!1)}),t}function Jo(){let t=new rt,o=new P.Vector3(-3.9,.06,-.75),n=new P.Vector3(-1.3,.06,-.15).clone().sub(o),s=n.length(),a=new P.Quaternion().setFromUnitVectors(new P.Vector3(0,1,0),n.clone().normalize());return t.push(new P.Matrix4().compose(o,a,new P.Vector3(1,1,1))),t.push(Et.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,O(7307107,W.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,O(14467994,W.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,O(3815734,W.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,O(11577752,W.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,O(13209478,W.PLAIN)),t.pop(),t.pop(),t}function te(){let t=new rt,[o,,e]=Je.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,n,28,O(5069411,W.PLAIN),{edges:n.map((a,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,O(11569762,W.WOOD)),t.push(Et.T(o,0,e));let s=10;for(let a=0;a<s;a++){let c=.15+a/s*1.4,i=.15+(a+1)/s*1.4,r=.365;t.quad([Math.cos(c)*r,.1,Math.sin(c)*r],[Math.cos(i)*r,.1,Math.sin(i)*r],[Math.cos(i)*r,.28,Math.sin(i)*r],[Math.cos(c)*r,.28,Math.sin(c)*r],O(15261900,W.PLAIN),[1,a===s-1?1:0,1,a===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var no=Math.sqrt(3)/2,G=[[1,0],[.5,no],[-.5,no],[-1,0],[-.5,-no],[.5,-no]],o0=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],e0=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],n0=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],Mo=(t,o,[e,n])=>{let s=o[0]-t[0],a=o[1]-t[1];return[t[0]+e*s+n*a,t[1]+e*a-n*s]};function wo(t,o,e){let n=Math.sin(e),s=Math.cos(e),a=t[0]-o[0],c=t[1]-o[1];return[o[0]+s*a-n*c,o[1]+n*a+s*c]}function Eo(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,m,d)=>.5*(2*v+(-u+m)*p+(2*u-5*v+4*m-d)*h+(-u+3*v-3*m+d)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var _t=2*Math.PI/3;function s0(t=10){let o=Eo(o0.map(h=>Mo(G[0],G[1],h)),t),e=Eo(e0.map(h=>Mo(G[2],G[3],h)),t),n=Eo(n0.map(h=>Mo(G[4],G[5],h)),t),s=o,a=e.map(h=>wo(h,G[2],_t)).reverse(),c=e,i=n.map(h=>wo(h,G[4],_t)).reverse(),r=n,p=o.map(h=>wo(h,G[0],_t)).reverse();return[s,a,c,i,r,p]}function Ut(t=10){let o=[];for(let e of s0(t))for(let n=0;n<e.length-1;n++)o.push(e[n]);return o}function a0(t,o){return{r:(t.r+o.r)%3,t:et(t,o.t)}}function et(t,o){let e=t.r*_t,n=Math.sin(e),s=Math.cos(e);return[s*o[0]-n*o[1]+t.t[0],n*o[0]+s*o[1]+t.t[1]]}function r0(t,o){let e=o*_t,n=Math.sin(e),s=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function oe(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];o.set(e([0,0]),n);let a=[];for(;s.length;){let c=s.shift();a.push(c);for(let i of[0,2,4]){let r=et(c,G[i]);for(let p of[1,2]){let h=a0(r0(r,p),c),f=et(h,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,h),s.push(h))}}}return a}var K=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],bt=[{name:"left front",joint:[.6,-.02],foot:[1.33,.3],phase:0},{name:"right front",joint:[.3,-.5],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.28,.6],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.62,-.02],foot:[-1.24,-.33],phase:0}],so=[[1.06,-.46],[.95,-.69]];var Ct=[.955,.935,.885],Z=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,Pt=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],go={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[Pt(15324582),Pt(9412730),Pt(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[Pt(9071164),Pt(4149043),Pt(15124378)]},bo=[.12,.11,.1],yo=[.42,.41,.39],yt=(t,o,e)=>{let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)};function c0(t=60){let o=[0];for(let a=1;a<K.length;a++)o.push(o[a-1]+Math.hypot(K[a][0]-K[a-1][0],K[a][1]-K[a-1][1]));let e=o[o.length-1],n=[],s=0;for(let a=0;a<=t;a++){let c=a/t*e;for(;s<o.length-2&&o[s+1]<c;)s++;let i=(c-o[s])/(o[s+1]-o[s]);n.push([K[s][0]+(K[s+1][0]-K[s][0])*i,K[s][1]+(K[s+1][1]-K[s][1])*i,c/e])}return n}var qt=c0(80);function ee(t,o,e,n,s,a,c,i={}){let r=new Path2D;e.forEach((u,v)=>{let m=o(u);v?r.lineTo(m[0],m[1]):r.moveTo(m[0],m[1])}),r.closePath();let p=i.noFill?0:yt(.28,.72,s),h=i.noFill?0:yt(.55,.95,s),f=go[a][n];p>0&&(t.fillStyle=Z(f,p),t.fill(r),t.save(),t.clip(r),a==="L"&&n===1&&i0(t,r,c,p*.55),h>0&&l0(t,o,n,a,c,h),t.restore());let l=[0,1,2].map(u=>yo[u]+(bo[u]-yo[u])*yt(.2,.8,s));return t.strokeStyle=Z(l,.5+.5*yt(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(r),r}function i0(t,o,e,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=Z([.25,.24,.22],n),t.lineWidth=Math.max(.8,e*.006);let a=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let r=-i;r<c+i;r+=a)t.moveTo(r,0),t.lineTo(r+i,i);t.stroke()}function l0(t,o,e,n,s,a){let c=(n==="L"?go.markL:go.markC)[e],i=e===2;t.fillStyle=Z(c,a*.8),t.beginPath();for(let l=0;l<qt.length;l+=1){let u=qt[l],v=u[2];if(v<.12||v>.8||l%7)continue;let m=qt[Math.max(0,l-1)],d=qt[Math.min(qt.length-1,l+1)],w=Math.atan2(d[1]-m[1],d[0]-m[0]),E=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=o([u[0],u[1]]),g=o([u[0]+Math.cos(w),u[1]+Math.sin(w)]),T=Math.atan2(g[1]-M[1],g[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*E*s*.8,M[1]+Math.sin(T)*E*s*.8),t.ellipse(M[0],M[1],E*s*.8,E*s*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=Z(c,a*.35);let r=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let u=-16;u<=16;u++){let v=l*.085+(u&1)*.0425,m=u*.074;if(Math.abs(v)>1.35||Math.abs(m)>1.3)continue;let d=o([v,m]);t.moveTo(d[0]+r,d[1]),t.arc(d[0],d[1],r,0,Math.PI*2)}t.fill(),t.strokeStyle=Z(i?[.92,.9,.85]:[.15,.14,.12],a*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of bt){let u=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],m=Math.hypot(u,v),d=u/m,w=v/m,E=[l.foot[0]-d*.16,l.foot[1]-w*.16];for(let R of[-.5,0,.5]){let L=d*Math.cos(R)-w*Math.sin(R),H=d*Math.sin(R)+w*Math.cos(R),k=o([E[0]+L*.04,E[1]+H*.04]),I=o([E[0]+L*.12,E[1]+H*.12]);t.moveTo(k[0],k[1]),t.lineTo(I[0],I[1])}let M=[l.joint[0]+u*.45,l.joint[1]+v*.45],g=o([M[0]-w*.05,M[1]+d*.05]),T=o([M[0]+w*.05,M[1]-d*.05]);t.moveTo(g[0],g[1]),t.lineTo(T[0],T[1])}t.stroke();let p=o([1.24,-.64]),h=o([1.12,-.68]),f=o([1.02,-.74]);t.beginPath(),t.moveTo(p[0],p[1]),t.quadraticCurveTo(h[0],h[1],f[0],f[1]),t.stroke();for(let l of so){let u=o(l);t.fillStyle=Z(i?[.95,.93,.88]:[.98,.97,.94],a),t.beginPath(),t.arc(u[0],u[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=Z(bo,a),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=Z(bo,a),t.beginPath(),t.arc(u[0]+.008*s,u[1],.022*s,0,Math.PI*2),t.fill()}}function To(t,o){let{W:e,D:n,res:s,tiles:a,ring:c,toPage:i,centreDist:r,hero:p}=o,h=document.createElement("canvas");h.width=Math.round(e*s),h.height=Math.round(n*s);let f=h.getContext("2d");f.fillStyle=Z(Ct),f.fillRect(0,0,h.width,h.height);let l=o.k*s;for(let u of a){let v=r(u),m=1-yt(o.rIn,o.rOut,v);if(m>.6||v>o.rOut+1.6)continue;let d=w=>{let E=i(et(u.pl,w));return[E[0]*s,E[1]*s]};f.beginPath(),G.forEach((w,E)=>{let M=d(w);E?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=Z(yo,.22*(1-m)*(1-yt(o.rOut,o.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let u of a){let v=r(u),m=1-yt(o.rIn,o.rOut,v);if(v>o.rOut+.6)continue;ee(f,w=>{let E=i(et(u.pl,w));return[E[0]*s,E[1]*s]},c,u.pl.r,Math.max(.04,m),t,l,{noFill:u===p})}return h}var it=1.5;function ko(t,o,e,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let a=s.getContext("2d");a.fillStyle=Z(Ct),a.fillRect(0,0,n,n);let c=n/(2*it);return ee(a,r=>[(r[0]+it)*c,(it-r[1])*c],o,e,1,t,c),s}var Tt=Ot(Ht(),1);var f0=.5;function h0(t,o,e){let n=[0],s=t.length+(e?1:0);for(let p=1;p<s;p++){let h=t[p-1],f=t[p%t.length];n.push(n[p-1]+Math.hypot(f[0]-h[0],f[1]-h[1]))}let a=n[n.length-1],c=Math.max(2,Math.round(a/o)),i=[],r=0;for(let p=0;p<(e?c:c+1);p++){let h=p/c*a;for(;r<n.length-2&&n[r+1]<h;)r++;let f=(h-n[r])/(n[r+1]-n[r]||1),l=t[r],u=t[(r+1)%t.length];i.push([l[0]+(u[0]-l[0])*f,l[1]+(u[1]-l[1])*f])}return{pts:i,length:a}}function u0(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let p=r/o,h=p*p,f=h*p,l=(u,v,m,d)=>.5*(2*v+(-u+m)*p+(2*u-5*v+4*m-d)*h+(-u+3*v-3*m+d)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function p0(t){let o=u0(K,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let n=[],s=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;s<e.length-2&&e[s+1]<i;)s++;let r=(i-e[s])/(e[s+1]-e[s]||1);n.push([o[s][0]+(o[s+1][0]-o[s][0])*r,o[s][1]+(o[s+1][1]-o[s][1])*r])}let a=(n.length-1)*t,c=n.map((i,r)=>{let p=n[Math.max(0,r-2)],h=n[Math.min(n.length-1,r+2)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l);return[f/u,l/u]});return{pts:n,T:c,N:c.map(([i,r])=>[-r,i]),length:a,step:t}}function ne(t,o,e){let n=!1;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[s],i=t[a];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function se(t,o,e){let n=1/0;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[a],i=t[s],r=i[0]-c[0],p=i[1]-c[1],h=((o-c[0])*r+(e-c[1])*p)/(r*r+p*p||1);h=Math.max(0,Math.min(1,h));let f=c[0]+h*r-o,l=c[1]+h*p-e;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function m0(t){let o=t.length,e=1/0,n=1/0,s=-1/0,a=-1/0;for(let l of t)e=Math.min(e,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),a=Math.max(a,l[1]);let c=Math.max(s-e,a-n)*20,i=(e+s)/2,r=(n+a)/2,p=t.concat([[i-c,r-c],[i,r+c],[i+c,r-c]]),h=(l,u,v)=>{let[m,d]=p[l],[w,E]=p[u],[M,g]=p[v],T=2*(m*(E-g)+w*(g-d)+M*(d-E)),R=((m*m+d*d)*(E-g)+(w*w+E*E)*(g-d)+(M*M+g*g)*(d-E))/T,L=((m*m+d*d)*(M-w)+(w*w+E*E)*(m-M)+(M*M+g*g)*(w-m))/T;return[R,L,(m-R)**2+(d-L)**2]},f=[[o,o+1,o+2,...h(o,o+1,o+2)]];for(let l=0;l<o;l++){let[u,v]=p[l],m=[],d=new Map;for(let w of f)if((u-w[3])**2+(v-w[4])**2<w[5])for(let[E,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let g=E<M?`${E},${M}`:`${M},${E}`;d.has(g)?d.delete(g):d.set(g,[E,M])}else m.push(w);for(let[w,E]of d.values())m.push([w,E,l,...h(w,E,l)]);f=m}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function So(t,o,e){let n=0,s=1/0;for(let u=0;u<t.pts.length;u++){let v=(t.pts[u][0]-o)**2+(t.pts[u][1]-e)**2;v<s&&(s=v,n=u)}let a=t.step,c=n*a;for(let u=0;u<4;u++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/a)),m=Math.floor(v),d=v-m,w=[t.pts[m][0]+(t.pts[m+1][0]-t.pts[m][0])*d,t.pts[m][1]+(t.pts[m+1][1]-t.pts[m][1])*d],E=[t.T[m][0]+(t.T[m+1][0]-t.T[m][0])*d,t.T[m][1]+(t.T[m+1][1]-t.T[m][1])*d],M=(o-w[0])*E[0]+(e-w[1])*E[1];c=Math.min((t.pts.length-1)*a,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/a),r=Math.floor(i),p=i-r,h=[t.pts[r][0]+(t.pts[r+1][0]-t.pts[r][0])*p,t.pts[r][1]+(t.pts[r+1][1]-t.pts[r][1])*p],f=[t.N[r][0]+(t.N[r+1][0]-t.N[r][0])*p,t.N[r][1]+(t.N[r+1][1]-t.N[r][1])*p],l=(o-h[0])*f[0]+(e-h[1])*f[1];return[c,l]}function d0(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),n=Math.floor(e),s=e-n,a=c=>[c[n][0]+(c[n+1][0]-c[n][0])*s,c[n][1]+(c[n+1][1]-c[n][1])*s];return{p:a(t.pts),t:a(t.T),n:a(t.N)}}function Ro(t,o,e,n){let s=d0(t,o),a=e-s.p[0],c=n-s.p[1];return[a*s.t[0]+c*s.t[1],a*s.n[0]+c*s.n[1]]}function ae(t){let o=h0(Ut(14),.018,!0).pts,e=o.map(x=>x.slice()),n=e.length,s=.04,a=3,c=()=>(a=a*16807%2147483647)/2147483647-.5;for(let x=-40;x<=40;x++)for(let b=-40;b<=40;b++){let y=b*s+(x&1)*s*.5+c()*.002,F=x*s*.866+c()*.002;Math.abs(y)>1.5||Math.abs(F)>1.5||ne(o,y,F)&&(se(o,y,F)<s*.55||e.push([y,F]))}let i=m0(e).filter(([x,b,y])=>{let F=(e[x][0]+e[b][0]+e[y][0])/3,V=(e[x][1]+e[b][1]+e[y][1])/3;return ne(o,F,V)}),r=e.length,p=new Float32Array(r);for(let x=0;x<r;x++)p[x]=x<n?0:se(o,e[x][0],e[x][1]);let h=p0(t),f=new Float32Array(r),l=new Float32Array(r);for(let x=0;x<r;x++){let[b,y]=So(h,e[x][0],e[x][1]);f[x]=b,l[x]=y}let u=So(h,-.62,.46)[0],v=new Float32Array(r),m=new Float32Array(r),d=new Float32Array(r);for(let x=0;x<r;x++){let b=f[x]<u&&Math.abs(l[x])<.2;v[x]=b?f[x]:Math.max(u,f[x]);let[y,F]=Ro(h,v[x],e[x][0],e[x][1]);m[x]=y,d[x]=F}let w=new Float32Array(r);for(let x=0;x<r;x++){if(x<n)continue;let b=p[x],y=f[x]/h.length,F=.035*Math.exp(-((l[x]/.07)**2))*Math.min(1,b/.12)*(y>.15&&y<.9?1:.4),V=0;for(let S of so)V+=.075*Math.exp(-(((e[x][0]-S[0])**2+(e[x][1]-S[1])**2)/.05**2));w[x]=f0*Math.sqrt(b)*(b<.03?.75+b/.03*.25:1)+F+V*Math.min(1,b/.05)}let E=Array.from({length:r},()=>new Set);for(let[x,b,y]of i)E[x].add(b).add(y),E[b].add(x).add(y),E[y].add(x).add(b);for(let x=0;x<10;x++){let b=w.slice();for(let y=n;y<r;y++){let F=0,V=0;for(let S of E[y])F+=w[S],V++;V&&(b[y]=w[y]*.5+F/V*.5)}w=b}let M=new Int8Array(r).fill(-1),g=new Float32Array(r),T=bt.map(x=>{let b=Math.max(u,So(h,x.joint[0],x.joint[1])[0]),[y,F]=Ro(h,b,x.joint[0],x.joint[1]);return{s:b,a:y,l:F}}),R=new Float32Array(r),L=new Float32Array(r);for(let x=0;x<r;x++){let[b,y]=e[x],F=-1,V=1/0,S=0;if(bt.forEach((C,D)=>{let N=C.foot[0]-C.joint[0],$=C.foot[1]-C.joint[1],ht=N*N+$*$,At=((b-C.joint[0])*N+(y-C.joint[1])*$)/ht,nt=Math.max(0,Math.min(1,At)),st=Math.hypot(C.joint[0]+N*nt-b,C.joint[1]+$*nt-y);st<V&&(V=st,F=D,S=At)}),F>=0&&S>-.12&&V<Math.abs(l[x])*.95+.02&&V<.32){M[x]=F,g[x]=Math.min(1,Math.max(0,(S+.1)/.5))**1.5;let[C,D]=Ro(h,T[F].s,b,y);R[x]=C,L[x]=D}}let H=new Float32Array(r*2);for(let x=0;x<r;x++)H[x*2]=(e[x][0]+it)/(2*it),H[x*2+1]=(e[x][1]+it)/(2*it);let k=[];for(let[x,b,y]of i)(e[b][0]-e[x][0])*(e[y][1]-e[x][1])-(e[b][1]-e[x][1])*(e[y][0]-e[x][0])>0?k.push(x,b,y):k.push(x,y,b);let I=new Tt.BufferGeometry;return I.setAttribute("position",new Tt.Float32BufferAttribute(new Float32Array(r*3),3)),I.setAttribute("normal",new Tt.Float32BufferAttribute(new Float32Array(r*3),3)),I.setAttribute("uv",new Tt.Float32BufferAttribute(H,2)),I.setAttribute("aDist",new Tt.Float32BufferAttribute(p,1)),I.setIndex(k),{geo:I,n:r,nb:n,pts:e,ring:o,S:f,Lat:l,h:w,dist:p,legIdx:M,legW:g,legA:R,legL:L,joints:T,sAtt:v,along:m,across:d,spine:h,tris:i}}var kt=.004,J=(t,o)=>[t[0]-o[0],t[1]-o[1]],Ft=(t,o)=>[t[0]+o[0],t[1]+o[1]],lt=(t,o)=>[t[0]*o,t[1]*o],Io=t=>Math.hypot(t[0],t[1]),Gt=t=>lt(t,1/(Io(t)||1));function v0(t,o,e){let n=[t[0]];for(let s=1;s<t.length-1;s++){let a=t[s-1],c=t[s],i=t[s+1],r=Gt(J(c,a)),p=Gt(J(i,c)),h=r[0]*p[1]-r[1]*p[0],f=Math.max(-1,Math.min(1,r[0]*p[0]+r[1]*p[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let v=(h>0?e:o)*Math.tan(l/2);v=Math.min(v,Io(J(c,a))*.48,Io(J(i,c))*.48);let m=v/Math.tan(l/2),d=J(c,lt(r,v)),w=Ft(c,lt(p,v)),E=h>0?[-r[1],r[0]]:[r[1],-r[0]],M=Ft(d,lt(E,m)),g=Math.atan2(d[1]-M[1],d[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),R=T-g;for(;R>Math.PI;)R-=2*Math.PI;for(;R<-Math.PI;)R+=2*Math.PI;let L=Math.max(2,Math.ceil(Math.abs(R)*m/.01));for(let H=0;H<=L;H++){let k=g+R*H/L;n.push([M[0]+Math.cos(k)*m,M[1]+Math.sin(k)*m])}}return n.push(t[t.length-1]),n}function re(t,o,e=2,n=!0){let s=[0];for(let p=1;p<t.length;p++){let h=0;for(let f=0;f<e;f++)h+=(t[p][f]-t[p-1][f])**2;s.push(s[p-1]+Math.sqrt(h))}let a=s[s.length-1],c=Math.floor(a/o+1e-9),i=[],r=0;for(let p=0;p<=c;p++){let h=p*o;for(;r<s.length-2&&s[r+1]<h;)r++;let f=(h-s[r])/(s[r+1]-s[r]||1);i.push(t[r].map((l,u)=>l+(t[r+1][u]-l)*f))}return n&&a-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function x0(t){let o=xo(gt.a),[e,,n]=gt.c,s=Wt.h,a=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],u=f.n[1],v=f.n[2],m=f.d+l*e+u*s+v*n-v*t,d=E=>l*E[0]+u*E[1]<=m+1e-9,w=[];for(let E=0;E<a.length;E++){let M=a[E],g=a[(E+1)%a.length],T=d(M),R=d(g);if(T&&w.push(M),T!==R){let L=l*M[0]+u*M[1]-m,H=l*g[0]+u*g[1]-m,k=L/(L-H);w.push([M[0]+(g[0]-M[0])*k,M[1]+(g[1]-M[1])*k])}}a=w}let c=a.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),r=Math.max(...c.map(f=>f[0])),p=a.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-r)<1e-9),h=[];for(let f=0;f<a.length;f++){let l=a[(p+f)%a.length];if(h.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:h.reverse(),xl:i,xr:r,top:Math.max(...a.map(f=>f[1]))}}function M0(t,o){let e=Wt,n=e.h,s=q,a=[[t,s],[ot.x1,s],[ot.x1,0]],c=e.x0+.02,i=.1375,r=n/2;a.push([c-i,0],[c-i,r]);for(let h=7;h<12;h++){let f=h/12*Math.PI;a.push([c-i*Math.sin(f),r-r*Math.cos(f)])}a.push([c,n]);let p=x0(gt.c[2]);for(let h of p.chain)a.push(h);return a.push([e.x1,n],[e.x1,n-.05],[e.x1-.06,n-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:a.map(([h,f])=>[h-t,f]),top:p.top}}function w0(t,o){let e=Lt.c[0],n=Lt.r,s=eo.slice(4,It+1),a=eo.slice(It),c=[[t,0]];for(let[i,r]of s)c.push([e+i*n,r]);for(let[i,r]of a.slice(1))c.push([e+i*n,r]);for(let[i,r]of a.slice().reverse().slice(1))c.push([e-i*n,r]);for(let[i,r]of s.slice().reverse().slice(1))c.push([e-i*n,r]);return c.push([o,0]),c.map(([i,r])=>[t-i,r])}function Ao(t,o,e,n=.07,s=.15){let a=v0(e,n,s),c=[],i=re(a,kt/2);for(let r=0;r<i.length;r++){let p=i[Math.max(0,r-1)],h=i[Math.min(i.length-1,r+1)],f=Gt(J(h,p)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[r][0],i[r][1],t[1]+o[1]*i[r][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function vt(t,o){return t.map(([e,n])=>[e,o,n,0,1,0])}function Lo(t,o,e,n,s=200){let a=[];for(let c=0;c<=s;c++){let i=c/s,r=1-i;a.push([r*r*r*t[0]+3*r*r*i*o[0]+3*r*i*i*e[0]+i*i*i*n[0],r*r*r*t[1]+3*r*r*i*o[1]+3*r*i*i*e[1]+i*i*i*n[1]])}return a}function Ho(t,o,e,n){let s=J(t,lt(o,n)),a=Ft(t,lt(e,n));return Lo(s,Ft(s,lt(o,n*.552)),J(a,lt(e,n*.552)),a,60)}var E0={zA:gt.c[2],xA0:-.35,xC1:4.75,zC:Lt.c[2],xD:-1.05,zD1:3.2,r:.55};function ce(t){let o=E0,e=[],n={};e.push(vt(t,q));let s=t[t.length-1],a=t[t.length-6],c=Gt(J(s,a)),i=[o.xA0,o.zA];e.push(vt(Lo(s,Ft(s,lt(c,.35)),J(i,[.35,0]),i),q));let r=[o.xC1,o.zA],p=M0(o.xA0,o.xC1-o.r),h=Ao([o.xA0,o.zA],[1,0],p.P);n.topY=p.top,e.push(h),e.push(vt(Ho(r,[1,0],[0,1],o.r),0));let f=[o.xC1,o.zC];e.push(vt([[r[0],r[1]+o.r],[f[0],f[1]-o.r]],0)),e.push(vt(Ho(f,[0,1],[-1,0],o.r),0));let l=[o.xD,o.zC],u=w0(f[0]-o.r,l[0]+o.r);e.push(Ao([f[0]-o.r,o.zC],[-1,0],u,.05,.12)),e.push(vt(Ho(l,[-1,0],[0,-1],o.r),0));let v=[o.xD,o.zD1],m=l[1]-o.r,d=[[0,0],[m-ot.z1,0],[m-ot.z1,q],[m-v[1],q]];e.push(Ao([o.xD,m],[0,-1],d));let w=t[0],E=t[5],M=Gt(J(E,w));e.push(vt(Lo(v,Ft(v,[0,-.6]),J(w,lt(M,.6)),w),q)),e.push(vt(t,q));let g=[];for(let S of e)for(let C of S){let D=g[g.length-1];D&&Math.hypot(C[0]-D[0],C[1]-D[1],C[2]-D[2])<1e-6||g.push(C)}let T=t.length,R=g.slice(0,T),L=g.slice(g.length-T),H=re(g.slice(T-1,g.length-T+1),kt,3,!1),k=R.concat(H.slice(1,H.length-1),L),I=k.length,x=new Float32Array(I*3),b=new Float32Array(I*3),y=new Float32Array(I*3),F=new Float32Array(I*3);for(let S=0;S<I;S++){let C=k[Math.max(0,S-2)],D=k[Math.min(I-1,S+2)],N=D[0]-C[0],$=D[1]-C[1],ht=D[2]-C[2],At=Math.hypot(N,$,ht)||1;N/=At,$/=At,ht/=At;let nt=k[S][3],st=k[S][4],wt=k[S][5],fo=nt*N+st*$+wt*ht;nt-=fo*N,st-=fo*$,wt-=fo*ht;let ho=Math.hypot(nt,st,wt)||1;nt/=ho,st/=ho,wt/=ho;let De=st*ht-wt*$,Ne=wt*N-nt*ht,Be=nt*$-st*N;x.set([k[S][0],k[S][1],k[S][2]],S*3),b.set([N,$,ht],S*3),F.set([nt,st,wt],S*3),y.set([De,Ne,Be],S*3)}for(let S of[F,y]){let C=S.slice();for(let D=2;D<I-2;D++)for(let N=0;N<3;N++)S[D*3+N]=(C[(D-2)*3+N]+C[(D-1)*3+N]*2+C[D*3+N]*3+C[(D+1)*3+N]*2+C[(D+2)*3+N])/9}let V=0;for(let S=0;S<I;S++)x[S*3+1]>x[V*3+1]&&(V=S);return n.top=V*kt,{pos:x,T:b,B:y,N:F,n:I,length:(I-1)*kt,marks:n}}function Po(t,o,e){let n=Math.min(t.n-1.0001,Math.max(0,o/kt)),s=Math.floor(n),a=n-s;for(let c of["pos","T","B","N"]){let i=t[c],r=e[c];r[0]=i[s*3]+(i[s*3+3]-i[s*3])*a,r[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*a,r[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*a}return e}function ie(t,o){let e=document.getElementById("frame"),n=()=>{let a=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),r=(c?c.offsetHeight:0)+6+13,p=(i?i.offsetHeight:0)+8+13,h=window.innerWidth-a*2,f=window.innerHeight-r-p,l=f,u=l*t;u>h&&(u=h,l=u/t),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),e.style.width=`${u}px`,e.style.height=`${l}px`,e.style.top=`${r+Math.max(0,(f-l)/2)}px`,o?.(u,l)};return window.addEventListener("resize",n),n(),n}function le(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(s))};o?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function fe(t,o,e){let n=s=>{for(let[a,c]of t)a.setAttribute("aria-pressed",String(c===s));o(s)};for(let[s,a]of t)s.addEventListener("click",()=>n(a));return e!==void 0&&n(e),n}function he(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function ue(t,o=!0){let e=document.getElementById("btn-play"),n=s=>{o=s,e&&(e.setAttribute("aria-pressed",String(!s)),e.querySelector("span").textContent=s?"Pause":"Play",e.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return e?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function pe(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function me(){document.body.classList.add("ready")}var g0=performance.now(),ke={},Mt=t=>{ke[t]=Math.round(performance.now()-g0)},b0=39/31,_=.42,de=[-.95,1.7],Vt=document.getElementById("scene"),Jt=new A.WebGLRenderer({canvas:Vt,antialias:!0});Jt.setPixelRatio(Math.min(window.devicePixelRatio||1,2));Jt.setClearColor(15525333,1);var to=new A.Scene,Xt=Uo(),y0=Go(Xt),T0=Jt.capabilities.getMaxAnisotropy();function Rt(t,o=y0){let e=new A.Mesh(t.build(),o);return e.frustumCulled=!1,to.add(e),e}Rt(Ko());Rt(Yo());Rt(Qo());Rt(Xo().b);Rt(Zo());Rt(Jo());Rt(te());Mt("desk");var Se=oe(9).map(t=>({pl:t,c:et(t,[0,0])})),Re=-32*(Math.PI/180),dt=null,ve=1/0;for(let t of Se){if(t.pl.r!==1)continue;let o=t.pl.r*(2*Math.PI/3)+Re,e=Math.hypot(t.c[0],t.c[1]),n=Math.atan2(t.c[1],t.c[0])-o;n=Math.atan2(Math.sin(n),Math.cos(n));let s=Math.abs(e-4.3)+Math.abs(n)*2.5;s<ve&&(ve=s,dt=t)}var Ae=-Re-dt.pl.r*(2*Math.PI/3),xe=Math.cos(Ae),Me=Math.sin(Ae),Fo=t=>[xe*t[0]-Me*t[1],-(Me*t[0]+xe*t[1])],we=et(dt.pl,[1.24,-.66]),Ee=[de[0]-_*Fo(we)[0],de[1]-_*Fo(we)[1]],Bo=t=>{let o=Fo(t);return[Ee[0]+_*o[0],Ee[1]+_*o[1]]},ao=t=>Bo(et(dt.pl,t)),B={x0:ot.x0+.06,z0:ot.z0+.05,x1:ot.x1-.04,z1:ot.z1-.05};B.W=B.x1-B.x0;B.D=B.z1-B.z0;var co=Ut(10),k0=Se.filter(t=>co.every(o=>{let e=Bo(et(t.pl,o));return e[0]>B.x0+.08&&e[0]<B.x1-.08&&e[1]>B.z0+.08&&e[1]<B.z1-.08})),Kt={W:B.W,D:B.D,res:2048/B.W,k:_,tiles:k0,ring:co,hero:dt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=Bo(t);return[o[0]-B.x0,o[1]-B.z0]}},Co=1-tt(Kt.rIn,Kt.rOut,Kt.centreDist(dt));function io(t){let o=new A.CanvasTexture(t);return o.colorSpace=A.NoColorSpace,o.anisotropy=T0,o.generateMipmaps=!0,o.minFilter=A.LinearMipmapLinearFilter,o}Mt("layout");var S0=To("L",Kt);Mt("pageL");var R0=To("C",Kt);Mt("pageC");var A0=uo(Xt,io(S0),io(R0));{let t=new A.BufferGeometry,o=q+4e-4;t.setAttribute("position",new A.Float32BufferAttribute([B.x0,o,B.z0,B.x0,o,B.z1,B.x1,o,B.z1,B.x1,o,B.z0],3)),t.setAttribute("normal",new A.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new A.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new A.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new A.Mesh(t,A0);e.frustumCulled=!1,to.add(e)}var U=ae(kt/_);Mt("lizard");var Dt=U.spine.length,H0=U.spine.pts.map(t=>ao(t)),mt=ce(H0);Mt("path");var St=uo(Xt,io(ko("L",co,dt.pl.r)),io(ko("C",co,dt.pl.r)),{contourStep:.05,uvScale:2*it*_});{let t=(c,i,r)=>tt(c,i,r),o=[.42,.41,.39],e=[.12,.11,.1],n=t(.2,.8,Co),s=.5+.5*t(0,.6,Co),a=o.map((c,i)=>c+(e[i]-c)*n);St.uniforms.uSketchLine.value.set(...a.map((c,i)=>Ct[i]+(c-Ct[i])*s)),St.uniforms.uSketchPaper.value.set(...Ct),St.uniforms.uLineW.value=(.011+.006*Co)/2}Mt("hero");var Vo=new A.Mesh(U.geo,St);Vo.frustumCulled=!1;Vo.renderOrder=2;to.add(Vo);var I0=.62,L0=.42,zt=3.2,Yt=Dt*_,ft=mt.length,Qt=Math.min(ft-1,mt.marks.top+Dt*_*.5),Nt=(()=>{let t=[0],o=[Yt],e=0,n=.004,s=!1;for(let a=Yt;a<ft;a+=n){let c=(r,p)=>Math.max(.22,Math.min(1,r/p)),i=I0*c(a-Yt,.5)*c(ft-a,.6)*(Math.abs(a-Qt)<.45?Math.max(.25,Math.abs(a-Qt)/.45):1);e+=n/i,!s&&a>=Qt&&(e+=zt,s=!0,t.push(e),o.push(a)),t.push(e),o.push(Math.min(ft,a+n))}return{T:t,U:o,dur:e}})();function P0(t){let{T:o,U:e}=Nt;if(t<=0)return e[0];if(t>=Nt.dur)return e[e.length-1];let n=0,s=o.length-1;for(;s-n>1;){let c=n+s>>1;o[c]<=t?n=c:s=c}let a=(t-o[n])/(o[s]-o[n]||1);return e[n]+(e[s]-e[n])*a}var Zt=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",Nt.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],zo=0;for(let t of Zt)t.start=zo,zo+=t[1];var ro=zo;function tt(t,o,e){let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)}function C0(t){t=(t%ro+ro)%ro;let o=Zt[0];for(let s of Zt)t>=s.start&&(o=s);let e=(t-o.start)/o[1],n={fill:0,relief:0,u:Yt,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":n.fill=tt(0,1,e);break;case"relief":n.fill=1,n.relief=.35*tt(0,1,e);break;case"rise":n.fill=1,n.relief=.35+.65*tt(0,1,e);break;case"walk":{n.fill=1,n.relief=1;let s=e*Nt.dur;n.u=P0(s);let a=s-Nt.T[Nt.U.findIndex(c=>c>=Qt)];Math.abs(n.u-Qt)<1e-4&&a>=0&&a<=zt&&(n.pauseT=a);break}case"settle":n.fill=1,n.relief=1,n.u=ft;break;case"sink":n.fill=1,n.relief=1-tt(0,1,e),n.u=ft;break;case"unfill":n.fill=1-tt(0,1,e),n.u=ft;break}return n}var Q={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},ge=U.geo.getAttribute("position"),$t=Dt*.79,F0=U.joints.map(t=>t.l>0?-1:1),X={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]};function z0(t){let o=t.u>=ft-1e-6?ft:t.u,e=Math.max(0,o-Yt),n=2*Math.PI*e/L0,s=tt(0,.3,e)*tt(0,.35,ft-o)*(t.pauseT>=0?0:1),a=.38*s,c=t.pauseT>=0?.55*Math.sin(t.pauseT/zt*Math.PI*2)*tt(0,.5,t.pauseT)*tt(zt,zt-.5,t.pauseT):0,i=t.pauseT>=0?.12*Math.sin(t.pauseT/zt*Math.PI):0,r=t.relief,p=ge.array;for(let h=0;h<U.n;h++){let f=U.sAtt[h],l=U.along[h],u=U.across[h],v=U.h[h];if(u+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(f/Dt-.45)),f>$t&&(c||i)){let L=tt($t,$t+.3,f),H=f+l-$t,k=c*L,I=Math.cos(k),x=Math.sin(k),b=$t+H*I-u*x;u=H*x+u*I,l=b-f,v+=i*L*(H/.5)}Po(mt,o-(Dt-f)*_,Q);let m=Q.pos[0]+(Q.T[0]*l+Q.B[0]*u)*_,d=Q.pos[1]+(Q.T[1]*l+Q.B[1]*u)*_,w=Q.pos[2]+(Q.T[2]*l+Q.B[2]*u)*_,E=Q.N[0],M=Q.N[1],g=Q.N[2],T=U.legIdx[h];if(T>=0){let L=bt[T],H=U.joints[T],k=U.legW[h],I=n+L.phase,x=F0[T]*a*Math.sin(I),b=U.legA[h]-H.a,y=U.legL[h]-H.l,F=Math.cos(x),V=Math.sin(x),S=H.a+b*F-y*V,C=H.l+b*V+y*F;Po(mt,o-(Dt-H.s)*_,X);let D=X.pos[0]+(X.T[0]*S+X.B[0]*C)*_,N=X.pos[1]+(X.T[1]*S+X.B[1]*C)*_,$=X.pos[2]+(X.T[2]*S+X.B[2]*C)*_;m+=(D-m)*k,d+=(N-d)*k,w+=($-w)*k,E+=(X.N[0]-E)*k,M+=(X.N[1]-M)*k,g+=(X.N[2]-g)*k,v+=.09*k*Math.max(0,Math.cos(I))*s}let R=v*_*r+.0015;p[h*3]=m+E*R,p[h*3+1]=d+M*R,p[h*3+2]=w+g*R}ge.needsUpdate=!0,U.geo.computeVertexNormals(),St.uniforms.uSolid.value=Math.min(1,t.relief*2.4),St.uniforms.uFill.value=t.fill}var D0=10631978,xt=new A.Group,Oo=new A.MeshBasicMaterial({color:D0,transparent:!0,opacity:0,depthWrite:!1});function He(t,o,e=0,n=0){let s=[],a=[],c=0,i=!0,r=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),r+=c,e&&r>(i?e:n)&&(i=!i,r=0);let l=t[f];if(s.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let u=(f-1)*2;a.push(u,u+1,u+2,u+1,u+3,u+2)}}let p=new A.BufferGeometry;p.setAttribute("position",new A.Float32BufferAttribute(s,3)),p.setIndex(a);let h=new A.Mesh(p,Oo);return h.frustumCulled=!1,h}function be(t,o,e,n,s){let a=o?t.concat([t[0]]):t,c=a.map((i,r)=>{let p=a[Math.max(0,r-1)],h=a[Math.min(a.length-1,r+1)],f=h[0]-p[0],l=h[1]-p[1],u=Math.hypot(f,l)||1;return[i[0],q+.003,i[1],-l/u,0,f/u]});return He(c,e,n,s)}{let t=Ut(10).map(e=>ao(e));xt.add(be(t,!0,.009,.05,.03)),xt.add(be(G.map(e=>ao(e)),!0,.005,.03,.03));for(let e of[0,2,4]){let n=ao(G[e]),s=new A.Mesh(new A.CircleGeometry(.04,20),Oo);s.rotation.x=-Math.PI/2,s.position.set(n[0],q+.004,n[1]),xt.add(s)}let o=[];for(let e=0;e<mt.n;e+=4){let n=mt.pos,s=mt.N,a=mt.B;o.push([n[e*3]+s[e*3]*.006,n[e*3+1]+s[e*3+1]*.006,n[e*3+2]+s[e*3+2]*.006,a[e*3],a[e*3+1],a[e*3+2]])}xt.add(He(o,.007,.07,.05)),xt.renderOrder=5,xt.visible=!1,to.add(xt)}var pt=new A.OrthographicCamera(-1,1,1,-1,1,400),Do={H:5.6,target:new A.Vector3(.2,.3,2)},lo=1,No=1;function Ie(){let t=Do.target;pt.position.set(t.x+100,t.y+100,t.z+100),pt.up.set(0,1,0),pt.lookAt(t);let o=Do.H/2;pt.left=-o*(lo/No),pt.right=o*(lo/No),pt.top=o,pt.bottom=-o,pt.updateProjectionMatrix()}ie(b0,(t,o)=>{lo=t,No=o,Jt.setSize(t,o),Ie()});le();var z={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},Le=fe([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{z.lithoTarget=t},1),Pe=document.getElementById("btn-reveal");function jo(t){z.revealTarget=t?1:0,Pe.setAttribute("aria-pressed",String(t))}Pe.addEventListener("click",()=>jo(!z.revealTarget));var Ce=ue(t=>{z.playing=t});he({" ":()=>Ce(!z.playing),l:()=>Le(z.lithoTarget?0:1),r:()=>jo(!z.revealTarget),ArrowRight:()=>{z.t+=1},ArrowLeft:()=>{z.t-=1},0:()=>{z.t=0}});var Bt=null;Vt.addEventListener("pointerdown",t=>{Vt.setPointerCapture(t.pointerId),Bt={x:t.clientX}});Vt.addEventListener("pointermove",t=>{Bt&&(z.t+=(t.clientX-Bt.x)/Math.max(200,lo)*22,Bt.x=t.clientX)});var Fe=()=>{Bt=null};Vt.addEventListener("pointerup",Fe);Vt.addEventListener("pointercancel",Fe);var ye=performance.now(),Te="";function ze(t){let o=Math.min(.05,Math.max(0,(t-ye)/1e3));ye=t,z.playing&&!Bt&&(z.t+=o);for(let[s,a]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=z[a]-z[s];z[s]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}Xt.uLitho.value=z.litho,Xt.uTime.value=t/1e3;let e=C0(z.t);z0(e),St.uniforms.uContours.value=z.reveal*Math.min(1,e.relief*3),Oo.opacity=z.reveal*.9,xt.visible=z.reveal>.01;let n=z.reveal>.5?e.phase[2]:"";n!==Te&&(pe(!!n,n),Te=n),Jt.render(to,pt),requestAnimationFrame(ze)}Mt("ready");me();requestAnimationFrame(ze);window.__page={state:z,VIEW:Do,updateCamera:Ie,TOTAL:ro,PHASES:Zt,setPlaying:Ce,setLitho:t=>{Le(t?1:0),z.litho=t?1:0},setReveal:t=>{jo(t),z.reveal=t?1:0},at:(t,o=0)=>{let e=Zt.find(n=>n[0]===t);z.t=e.start+e[1]*o},path:mt,hero:dt,L:U,TIMES:ke};})();
