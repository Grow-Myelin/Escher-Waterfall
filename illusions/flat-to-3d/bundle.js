(()=>{var Go=Object.create;var X0=Object.defineProperty;var $o=Object.getOwnPropertyDescriptor;var Ko=Object.getOwnPropertyNames;var Yo=Object.getPrototypeOf,Qo=Object.prototype.hasOwnProperty;var Xo=(t,o)=>()=>{try{return o||t((o={exports:{}}).exports,o),o.exports}catch(e){throw o=0,e}};var Zo=(t,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of Ko(o))!Qo.call(t,s)&&s!==e&&X0(t,s,{get:()=>o[s],enumerable:!(n=$o(o,s))||n.enumerable});return t};var Yt=(t,o,e)=>(e=t!=null?Go(Yo(t)):{},Zo(o||!t||!t.__esModule?X0(e,"default",{value:t,enumerable:!0}):e,t));var Bt=Xo((qe,Z0)=>{Z0.exports=window.THREE});var I=Yt(Bt(),1);var tt=Yt(Bt(),1);function J0(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new tt.Vector3(.1,.9,.66).normalize()},uPaper:{value:new tt.Vector3(.925,.898,.835)},uInk:{value:new tt.Vector3(.11,.1,.09)},uHaze:{value:new tt.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var to=`
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
`,Jo=`
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
`,te=`
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
`,oe=`
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
${to}
${Jo}

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
`;function oo(t,o={}){return new tt.ShaderMaterial({uniforms:t,vertexShader:te,fragmentShader:oe,transparent:!!o.transparent,side:o.side??tt.FrontSide})}var ee=`
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
`,ne=`
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
${to}
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
`;function w0(t,o,e,n={}){return new tt.ShaderMaterial({uniforms:{...t,uMapL:{value:o},uMapC:{value:e},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new tt.Vector3(.955,.935,.885)},uSketchLine:{value:new tt.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:ee,fragmentShader:ne,transparent:!!n.transparent,side:n.side??tt.FrontSide})}var C=Yt(Bt(),1);var _=Yt(Bt(),1),se=1e3,b0={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function ae(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function j(t,o=b0.PLAIN,e={}){return{c:typeof t=="number"?ae(t):t,p:o,f:e.f||0,w:e.w||0,s:e.s||0}}var eo=["px","nx","py","ny","pz","nz"];function Et(t,o){return[t[0]-o[0],t[1]-o[1],t[2]-o[2]]}function g0(t,o){return[t[1]*o[2]-t[2]*o[1],t[2]*o[0]-t[0]*o[2],t[0]*o[1]-t[1]*o[0]]}function Qt(t){return Math.hypot(t[0],t[1],t[2])}function pt(t){let o=Qt(t)||1;return[t[0]/o,t[1]/o,t[2]/o]}function E0(t,o){let e=Math.abs(o[0]),n=Math.abs(o[1]),s=Math.abs(o[2]);return e>=n&&e>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var mt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(o){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(o):o.clone(),this.nm=new _.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new _.Matrix3().getNormalMatrix(this.m):null,this}_tp(o){if(!this.m)return[o[0],o[1],o[2]];let e=this.m.elements,n=o[0],s=o[1],a=o[2];return[e[0]*n+e[4]*s+e[8]*a+e[12],e[1]*n+e[5]*s+e[9]*a+e[13],e[2]*n+e[6]*s+e[10]*a+e[14]]}_tn(o){if(!this.nm)return o;let e=this.nm.elements,n=o[0],s=o[1],a=o[2];return pt([e[0]*n+e[3]*s+e[6]*a,e[1]*n+e[4]*s+e[7]*a,e[2]*n+e[5]*s+e[8]*a])}tri(o,e,n,s,a=[1,1,1],c={}){let i=this._tp(o),r=this._tp(e),h=this._tp(n),u=pt(g0(Et(e,o),Et(n,o))),f=c.uv||[E0(o,u),E0(e,u),E0(n,u)],l=pt(g0(Et(r,i),Et(h,i))),p=c.n?c.n.map(M=>this._tn(M)):[l,l,l],x=Qt(g0(Et(r,i),Et(h,i))),m=[x/(Qt(Et(h,r))||1),x/(Qt(Et(i,h))||1),x/(Qt(Et(r,i))||1)],d=c.k||[1,1,1],w=s.s||0,g=[i,r,h];for(let M=0;M<3;M++){let E=g[M];this.pos.push(E[0]+w,E[1]+w,E[2]+w),this.nrm.push(p[M][0],p[M][1],p[M][2]),this.col.push(s.c[0]*d[M],s.c[1]*d[M],s.c[2]*d[M]),this.uv.push(f[M][0],f[M][1]);for(let T=0;T<3;T++)a[T]?this.edg.push(M===T?m[T]:0):this.edg.push(se);this.mat.push(s.p,s.f,s.w)}}quad(o,e,n,s,a,c=[1,1,1,1],i={}){let r=i.k||[1,1,1,1],h=i.n,u=i.uv;this.tri(o,e,n,a,[c[1],0,c[0]],{k:[r[0],r[1],r[2]],n:h&&[h[0],h[1],h[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(o,n,s,a,[c[2],c[3],0],{k:[r[0],r[2],r[3]],n:h&&[h[0],h[2],h[3]],uv:u&&[u[0],u[2],u[3]]})}box(o,e,n,s,a,c,i,r={}){o>s&&([o,s]=[s,o]),e>a&&([e,a]=[a,e]),n>c&&([n,c]=[c,n]);let h=new Set(r.open||[]),u=new Set(r.skip||[]);r.bottom||u.add("ny");let f=r.ao??1,l=r.aoTop??1,p={px:[0,s],nx:[0,o],py:[1,a],ny:[1,e],pz:[2,c],nz:[2,n]},x={px:[[s,e,c],[s,e,n],[s,a,n],[s,a,c]],nx:[[o,e,n],[o,e,c],[o,a,c],[o,a,n]],pz:[[o,e,c],[s,e,c],[s,a,c],[o,a,c]],nz:[[s,e,n],[o,e,n],[o,a,n],[s,a,n]],py:[[o,a,c],[s,a,c],[s,a,n],[o,a,n]],ny:[[o,e,n],[s,e,n],[s,e,c],[o,e,c]]};for(let m of eo){if(u.has(m)||h.has(m))continue;let d=x[m],w=[];for(let E=0;E<4;E++){let T=d[E],L=d[(E+1)%4],S=1;for(let A of eo){if(A===m)continue;let[R,k]=p[A];Math.abs(T[R]-k)<1e-9&&Math.abs(L[R]-k)<1e-9&&h.has(A)&&(S=0)}w.push(S)}let g;m==="py"||m==="ny"?g=[l,l,l,l]:g=[f,f,1,1];let M=m==="py"&&r.top?{...r.top,s:i.s}:i;this.quad(d[0],d[1],d[2],d[3],M,w,{k:g})}}cyl(o,e,n,s,a,c,i,r={}){let h=r.caps??[!0,!0],u=r.rim??[1,1],f=r.r1??s;for(let l=0;l<c;l++){let p=l/c*Math.PI*2,x=(l+1)/c*Math.PI*2,m=Math.cos(p),d=Math.sin(p),w=Math.cos(x),g=Math.sin(x),M=[o+s*m,e,n+s*d],E=[o+f*m,a,n+f*d],T=[o+f*w,a,n+f*g],L=[o+s*w,e,n+s*g],S=(s-f)/Math.max(1e-6,a-e),A=pt([m,S,d]),R=pt([w,S,g]),k=p*(s+f)/2,q=x*(s+f)/2;this.quad(M,E,T,L,i,[0,u[1],0,u[0]],{n:[A,A,R,R],uv:[[k,e],[k,a],[q,a],[q,e]],k:r.k}),h[1]&&f>0&&this.tri([o,a,n],T,E,i,[1,0,0]),h[0]&&this.tri([o,e,n],M,L,i,[1,0,0])}}lathe(o,e,n,s,a,c,i={}){let r=s.length,h=[];for(let l=0;l<r-1;l++){let p=s[l+1][0]-s[l][0],x=s[l+1][1]-s[l][1];h.push(pt([x,-p,0]))}let u=s.map((l,p)=>{let x=h[Math.max(0,p-1)],m=h[Math.min(r-2,p)];return pt([x[0]+m[0],x[1]+m[1],0])}),f=i.edges||[];for(let l=0;l<a;l++){let p=l/a*Math.PI*2,x=(l+1)/a*Math.PI*2,m=Math.cos(p),d=Math.sin(p),w=Math.cos(x),g=Math.sin(x);for(let M=0;M<r-1;M++){let[E,T]=s[M],[L,S]=s[M+1],A=[o+E*m,e+T,n+E*d],R=[o+L*m,e+S,n+L*d],k=[o+L*w,e+S,n+L*g],q=[o+E*w,e+T,n+E*g],$=i.flat?h[M]:u[M],Q=i.flat?h[M]:u[M+1];this.quad(A,R,k,q,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[$[0]*m,$[1],$[0]*d],[Q[0]*m,Q[1],Q[0]*d],[Q[0]*w,Q[1],Q[0]*g],[$[0]*w,$[1],$[0]*g]],uv:[[p*1.2,T],[p*1.2,S],[x*1.2,S],[x*1.2,T]]})}}}poly(o,e,n={}){for(let s=1;s<o.length-1;s++)this.tri(o[0],o[s],o[s+1],e,[1,s===o.length-2?1:0,s===1?1:0],n)}blob(o,e,n,s,a,c,i,r={}){let h=r.sub??1,u=r.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let x=0;x<h;x++){let m=[];for(let[d,w,g]of f){let M=pt([(d[0]+w[0])/2,(d[1]+w[1])/2,(d[2]+w[2])/2]),E=pt([(w[0]+g[0])/2,(w[1]+g[1])/2,(w[2]+g[2])/2]),T=pt([(g[0]+d[0])/2,(g[1]+d[1])/2,(g[2]+d[2])/2]);m.push([d,M,T],[M,w,E],[T,E,g],[M,E,T])}f=m}let l=x=>1+(r.lump??.12)*Math.sin(x[0]*5.1+u)*Math.sin(x[1]*4.3+u*1.7)*Math.sin(x[2]*3.7+u*.3),p=x=>{let m=l(x);return[o+x[0]*s*m,e+x[1]*a*m,n+x[2]*c*m]};for(let[x,m,d]of f)this.tri(p(x),p(m),p(d),i,[0,0,0],{n:[x,m,d],k:r.k})}build(){let o=new _.BufferGeometry;return o.setAttribute("position",new _.Float32BufferAttribute(this.pos,3)),o.setAttribute("normal",new _.Float32BufferAttribute(this.nrm,3)),o.setAttribute("acol",new _.Float32BufferAttribute(this.col,3)),o.setAttribute("fuv",new _.Float32BufferAttribute(this.uv,2)),o.setAttribute("edge",new _.Float32BufferAttribute(this.edg,3)),o.setAttribute("amat",new _.Float32BufferAttribute(this.mat,3)),o.computeBoundingSphere(),o}},Ht={T:(t,o,e)=>new _.Matrix4().makeTranslation(t,o,e),RX:t=>new _.Matrix4().makeRotationX(t),RY:t=>new _.Matrix4().makeRotationY(t),RZ:t=>new _.Matrix4().makeRotationZ(t),S:(t,o,e)=>new _.Matrix4().makeScale(t,o??t,e??t),chain:(...t)=>t.reduce((o,e)=>o.multiply(e),new _.Matrix4)};var U={...b0,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},X=.12,lt={x0:-4.5,x1:.35,z0:.3,z1:3.9},Xt={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},It={c:[2.45,0,1.6],a:.5},Vt={c:[2.45,0,4.55],r:.92,h:.38},re={c:[1.5,0,-.55]},c0={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},dt=(1+Math.sqrt(5))/2;function y0(t){let o=[];for(let f of[-1,1])for(let l of[-1,1])for(let p of[-1,1])o.push([f,l,p]);for(let f of[-1,1])for(let l of[-1,1])o.push([0,f/dt,l*dt]),o.push([f/dt,l*dt,0]),o.push([f*dt,0,l/dt]);let e=t/(2/dt),n=o.map(f=>f.map(l=>l*e)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*dt],[0,f*dt,l],[f*dt,l,0]);let a=s.map(f=>{let l=Math.hypot(...f),p=f.map(d=>d/l),x=Math.max(...n.map(d=>d[0]*p[0]+d[1]*p[1]+d[2]*p[2])),m=n.map((d,w)=>[w,d[0]*p[0]+d[1]*p[1]+d[2]*p[2]]).filter(([,d])=>d>x-1e-6).map(([d])=>d);return{n:p,d:x,idx:m}}),c=a[0].n,i=new C.Quaternion().setFromUnitVectors(new C.Vector3(...c),new C.Vector3(0,-1,0)),r=new C.Quaternion().setFromAxisAngle(new C.Vector3(0,1,0),.31);i.premultiply(r);let h=f=>new C.Vector3(...f).applyQuaternion(i).toArray();n=n.map(h);for(let f of a)f.n=h(f.n);let u=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-u,f[2]]);for(let f of a){let l=[0,1,2].map(d=>f.idx.reduce((w,g)=>w+n[g][d],0)/f.idx.length),p=new C.Vector3(...f.n),x=new C.Vector3(...n[f.idx[0]]).sub(new C.Vector3(...l)).normalize(),m=new C.Vector3().crossVectors(p,x);f.idx.sort((d,w)=>{let g=new C.Vector3(...n[d]).sub(new C.Vector3(...l)),M=new C.Vector3(...n[w]).sub(new C.Vector3(...l));return Math.atan2(g.dot(m),g.dot(x))-Math.atan2(M.dot(m),M.dot(x))}),f.c=l,f.d=p.dot(new C.Vector3(...l))}return{V:n,faces:a,height:Math.max(...n.map(f=>f[1]))}}function no(){let t=new mt,o=j(14271394,U.DESK);return t.box(c0.x0,-.45,c0.z0,c0.x1,0,c0.z1,o,{top:j(15391940,U.DESK)}),t}function so(){let t=new mt,{x0:o,x1:e,z0:n,z1:s}=lt;t.box(o,0,n,e,.04,s,j(9209210,U.CLOTH),{ao:.85}),t.box(o+.06,.04,n+.05,e-.04,X,s-.05,j(15722970,U.PAGES),{skip:["py"]});let a=22;for(let c=0;c<a;c++){let i=n+.25+c/(a-1)*(s-n-.5),r=o+.22,h=.16,u=.022,f=10;for(let l=0;l<f;l++){let p=Math.PI*(.15+l/f*.85),x=Math.PI*(.15+(l+1)/f*.85),m=[r+Math.cos(p)*h,X*.5+Math.sin(p)*h,i],d=[r+Math.cos(x)*h,X*.5+Math.sin(x)*h,i];ce(t,m,d,u,j(9341572,U.PLAIN))}}return t}function ce(t,o,e,n,s){let a=new C.Vector3(...o),i=new C.Vector3(...e).clone().sub(a),r=i.length(),h=new C.Quaternion().setFromUnitVectors(new C.Vector3(0,1,0),i.normalize()),u=new C.Matrix4().compose(a,h,new C.Vector3(1,1,1));t.push(u),t.cyl(0,0,0,n,r,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function ao(){let t=new mt,{x0:o,x1:e,z0:n,z1:s,h:a}=Xt,c=j(12555380,U.CLOTH),i=.05;t.box(o,0,n,e,i,s,c,{ao:.85}),t.box(o+.04,i,n+.05,e-.06,a-i,s-.05,j(15525072,U.PAGES),{skip:["py","nx"]}),t.box(o,a-i,n,e,a,s,c),t.push(Ht.chain(Ht.T(o+.02,a/2,(n+s)/2),Ht.RX(Math.PI/2),Ht.RZ(0)));let r=10;for(let h=0;h<r;h++){let u=Math.PI/2+h/r*Math.PI,f=Math.PI/2+(h+1)/r*Math.PI,l=a/2,p=(s-n)/2,x=[Math.cos(u)*l*.5,-p,Math.sin(u)*l],m=[Math.cos(f)*l*.5,-p,Math.sin(f)*l],d=[Math.cos(f)*l*.5,p,Math.sin(f)*l],w=[Math.cos(u)*l*.5,p,Math.sin(u)*l];t.quad(x,m,d,w,c,[h===0?1:0,1,h===r-1?1:0,1])}return t.pop(),t.box(o+.5,a,n+.6,o+1.6,a+.004,s-.6,j(11041118,U.CLOTH)),t}function ro(){let t=new mt,o=y0(It.a),[e,,n]=It.c,s=Xt.h,a=j(15131094,U.STONE);for(let c of o.faces){let i=c.idx.map(r=>[o.V[r][0]+e,o.V[r][1]+s,o.V[r][2]+n]);t.poly(i,a)}return{b:t,D:o}}var i0=[[0,.03],[.55,.035],[.7,.04],[.72,0],[.8,0],[.88,.12],[.96,.25],[1.02,.33],[1.03,.36],[1,.378],[.95,.36],[.9,.3],[.8,.2],[.62,.11],[.35,.075],[0,.07]],zt=9;function co(){let t=new mt,[o,,e]=Vt.c,n=i0.map(([c,i])=>[c*Vt.r,i]),s=n.slice(0,zt+1),a=n.slice(zt);return t.lathe(o,0,e,s,48,j(12105133,U.PEWTER),{edges:s.map((c,i)=>i===4||i===zt)}),t.lathe(o,0,e,a,48,j(13223614,U.PEWTER),{edges:a.map((c,i)=>i===2)}),t}function io(){let t=new mt,o=new C.Vector3(-3.9,.06,-.75),n=new C.Vector3(-1.3,.06,-.15).clone().sub(o),s=n.length(),a=new C.Quaternion().setFromUnitVectors(new C.Vector3(0,1,0),n.clone().normalize());return t.push(new C.Matrix4().compose(o,a,new C.Vector3(1,1,1))),t.push(Ht.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,j(7307107,U.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,j(14467994,U.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,j(3815734,U.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,j(11577752,U.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,j(13209478,U.PLAIN)),t.pop(),t.pop(),t}function lo(){let t=new mt,[o,,e]=re.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(o,0,e,n,28,j(5069411,U.PLAIN),{edges:n.map((a,c)=>c===1||c===4||c===7||c===9)}),t.cyl(o,.66,e,.1,.78,14,j(11569762,U.WOOD)),t.push(Ht.T(o,0,e));let s=10;for(let a=0;a<s;a++){let c=.15+a/s*1.4,i=.15+(a+1)/s*1.4,r=.365;t.quad([Math.cos(c)*r,.1,Math.sin(c)*r],[Math.cos(i)*r,.1,Math.sin(i)*r],[Math.cos(i)*r,.28,Math.sin(i)*r],[Math.cos(c)*r,.28,Math.sin(c)*r],j(15261900,U.PLAIN),[1,a===s-1?1:0,1,a===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var l0=Math.sqrt(3)/2,Y=[[1,0],[.5,l0],[-.5,l0],[-1,0],[-.5,-l0],[.5,-l0]],ie=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],le=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],fe=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],T0=(t,o,[e,n])=>{let s=o[0]-t[0],a=o[1]-t[1];return[t[0]+e*s+n*a,t[1]+e*a-n*s]};function k0(t,o,e){let n=Math.sin(e),s=Math.cos(e),a=t[0]-o[0],c=t[1]-o[1];return[o[0]+s*a-n*c,o[1]+n*a+s*c]}function S0(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let h=r/o,u=h*h,f=u*h,l=(p,x,m,d)=>.5*(2*x+(-p+m)*h+(2*p-5*x+4*m-d)*u+(-p+3*x-3*m+d)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}var Zt=2*Math.PI/3;function he(t=10){let o=S0(ie.map(u=>T0(Y[0],Y[1],u)),t),e=S0(le.map(u=>T0(Y[2],Y[3],u)),t),n=S0(fe.map(u=>T0(Y[4],Y[5],u)),t),s=o,a=e.map(u=>k0(u,Y[2],Zt)).reverse(),c=e,i=n.map(u=>k0(u,Y[4],Zt)).reverse(),r=n,h=o.map(u=>k0(u,Y[0],Zt)).reverse();return[s,a,c,i,r,h]}function Jt(t=10){let o=[];for(let e of he(t))for(let n=0;n<e.length-1;n++)o.push(e[n]);return o}function ue(t,o){return{r:(t.r+o.r)%3,t:ft(t,o.t)}}function ft(t,o){let e=t.r*Zt,n=Math.sin(e),s=Math.cos(e);return[s*o[0]-n*o[1]+t.t[0],n*o[0]+s*o[1]+t.t[1]]}function pe(t,o){let e=o*Zt,n=Math.sin(e),s=Math.cos(e);return{r:(o%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function fo(t){let o=new Map,e=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];o.set(e([0,0]),n);let a=[];for(;s.length;){let c=s.shift();a.push(c);for(let i of[0,2,4]){let r=ft(c,Y[i]);for(let h of[1,2]){let u=ue(pe(r,h),c),f=ft(u,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=e(f);o.has(l)||(o.set(l,u),s.push(u))}}}return a}var Z=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],xt=[{name:"left front",joint:[.74,0],foot:[1.33,.3],phase:0},{name:"right front",joint:[.2,-.68],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.3,.68],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.7,-.06],foot:[-1.24,-.33],phase:0}],f0=[[1.06,-.46],[.95,-.69]];var Ot=[.955,.935,.885],nt=(t,o=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${o})`,jt=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],A0={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[jt(15324582),jt(9412730),jt(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[jt(9071164),jt(4149043),jt(15124378)]},R0=[.12,.11,.1],H0=[.42,.41,.39],Lt=(t,o,e)=>{let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)};function me(t=60){let o=[0];for(let a=1;a<Z.length;a++)o.push(o[a-1]+Math.hypot(Z[a][0]-Z[a-1][0],Z[a][1]-Z[a-1][1]));let e=o[o.length-1],n=[],s=0;for(let a=0;a<=t;a++){let c=a/t*e;for(;s<o.length-2&&o[s+1]<c;)s++;let i=(c-o[s])/(o[s+1]-o[s]);n.push([Z[s][0]+(Z[s+1][0]-Z[s][0])*i,Z[s][1]+(Z[s+1][1]-Z[s][1])*i,c/e])}return n}var t0=me(80);function ho(t,o,e,n,s,a,c,i={}){let r=new Path2D;e.forEach((p,x)=>{let m=o(p);x?r.lineTo(m[0],m[1]):r.moveTo(m[0],m[1])}),r.closePath();let h=i.noFill?0:Lt(.28,.72,s),u=i.noFill?0:Lt(.55,.95,s),f=A0[a][n];h>0&&(t.fillStyle=nt(f,h),t.fill(r),t.save(),t.clip(r),a==="L"&&n===1&&de(t,r,c,h*.55),u>0&&xe(t,o,n,a,c,u),t.restore());let l=[0,1,2].map(p=>H0[p]+(R0[p]-H0[p])*Lt(.2,.8,s));return t.strokeStyle=nt(l,.5+.5*Lt(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(r),r}function de(t,o,e,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=nt([.25,.24,.22],n),t.lineWidth=Math.max(.8,e*.006);let a=Math.max(3,e*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let r=-i;r<c+i;r+=a)t.moveTo(r,0),t.lineTo(r+i,i);t.stroke()}function xe(t,o,e,n,s,a){let c=(n==="L"?A0.markL:A0.markC)[e],i=e===2;t.fillStyle=nt(c,a*.8),t.beginPath();for(let l=0;l<t0.length;l+=1){let p=t0[l],x=p[2];if(x<.12||x>.8||l%7)continue;let m=t0[Math.max(0,l-1)],d=t0[Math.min(t0.length-1,l+1)],w=Math.atan2(d[1]-m[1],d[0]-m[0]),g=.07*(x<.35?.7+x:1.05-(x-.35)*.9),M=o([p[0],p[1]]),E=o([p[0]+Math.cos(w),p[1]+Math.sin(w)]),T=Math.atan2(E[1]-M[1],E[0]-M[0]);t.moveTo(M[0]+Math.cos(T)*g*s*.8,M[1]+Math.sin(T)*g*s*.8),t.ellipse(M[0],M[1],g*s*.8,g*s*.62,T,0,Math.PI*2)}t.fill(),t.fillStyle=nt(c,a*.35);let r=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let p=-16;p<=16;p++){let x=l*.085+(p&1)*.0425,m=p*.074;if(Math.abs(x)>1.35||Math.abs(m)>1.3)continue;let d=o([x,m]);t.moveTo(d[0]+r,d[1]),t.arc(d[0],d[1],r,0,Math.PI*2)}t.fill(),t.strokeStyle=nt(i?[.92,.9,.85]:[.15,.14,.12],a*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of xt){let p=l.foot[0]-l.joint[0],x=l.foot[1]-l.joint[1],m=Math.hypot(p,x),d=p/m,w=x/m,g=[l.foot[0]-d*.16,l.foot[1]-w*.16];for(let L of[-.5,0,.5]){let S=d*Math.cos(L)-w*Math.sin(L),A=d*Math.sin(L)+w*Math.cos(L),R=o([g[0]+S*.04,g[1]+A*.04]),k=o([g[0]+S*.12,g[1]+A*.12]);t.moveTo(R[0],R[1]),t.lineTo(k[0],k[1])}let M=[l.joint[0]+p*.45,l.joint[1]+x*.45],E=o([M[0]-w*.05,M[1]+d*.05]),T=o([M[0]+w*.05,M[1]-d*.05]);t.moveTo(E[0],E[1]),t.lineTo(T[0],T[1])}t.stroke();let h=o([1.24,-.64]),u=o([1.12,-.68]),f=o([1.02,-.74]);t.beginPath(),t.moveTo(h[0],h[1]),t.quadraticCurveTo(u[0],u[1],f[0],f[1]),t.stroke();for(let l of f0){let p=o(l);t.fillStyle=nt(i?[.95,.93,.88]:[.98,.97,.94],a),t.beginPath(),t.arc(p[0],p[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=nt(R0,a),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=nt(R0,a),t.beginPath(),t.arc(p[0]+.008*s,p[1],.022*s,0,Math.PI*2),t.fill()}}function I0(t,o){let{W:e,D:n,res:s,tiles:a,ring:c,toPage:i,centreDist:r,hero:h}=o,u=document.createElement("canvas");u.width=Math.round(e*s),u.height=Math.round(n*s);let f=u.getContext("2d");f.fillStyle=nt(Ot),f.fillRect(0,0,u.width,u.height);let l=o.k*s;for(let p of a){let x=r(p),m=1-Lt(o.rIn,o.rOut,x);if(m>.6||x>o.rOut+1.6)continue;let d=w=>{let g=i(ft(p.pl,w));return[g[0]*s,g[1]*s]};f.beginPath(),Y.forEach((w,g)=>{let M=d(w);g?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=nt(H0,.22*(1-m)*(1-Lt(o.rOut,o.rOut+1.6,x))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let p of a){let x=r(p),m=1-Lt(o.rIn,o.rOut,x);if(x>o.rOut+.6)continue;ho(f,w=>{let g=i(ft(p.pl,w));return[g[0]*s,g[1]*s]},c,p.pl.r,Math.max(.04,m),t,l,{noFill:p===h})}return u}var vt=1.5;function L0(t,o,e,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let a=s.getContext("2d");a.fillStyle=nt(Ot),a.fillRect(0,0,n,n);let c=n/(2*vt);return ho(a,r=>[(r[0]+vt)*c,(vt-r[1])*c],o,e,1,t,c),s}var Pt=Yt(Bt(),1);var ve=.5;function Me(t,o,e){let n=[0],s=t.length+(e?1:0);for(let h=1;h<s;h++){let u=t[h-1],f=t[h%t.length];n.push(n[h-1]+Math.hypot(f[0]-u[0],f[1]-u[1]))}let a=n[n.length-1],c=Math.max(2,Math.round(a/o)),i=[],r=0;for(let h=0;h<(e?c:c+1);h++){let u=h/c*a;for(;r<n.length-2&&n[r+1]<u;)r++;let f=(u-n[r])/(n[r+1]-n[r]||1),l=t[r],p=t[(r+1)%t.length];i.push([l[0]+(p[0]-l[0])*f,l[1]+(p[1]-l[1])*f])}return{pts:i,length:a}}function we(t,o){let e=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],a=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let r=0;r<o;r++){let h=r/o,u=h*h,f=u*h,l=(p,x,m,d)=>.5*(2*x+(-p+m)*h+(2*p-5*x+4*m-d)*u+(-p+3*x-3*m+d)*f);e.push([l(s[0],a[0],c[0],i[0]),l(s[1],a[1],c[1],i[1])])}}return e.push(t[t.length-1].slice()),e}function ge(t){let o=we(Z,40),e=[0];for(let i=1;i<o.length;i++)e.push(e[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));let n=[],s=0;for(let i=0;i<=e[e.length-1]+1e-9;i+=t){for(;s<e.length-2&&e[s+1]<i;)s++;let r=(i-e[s])/(e[s+1]-e[s]||1);n.push([o[s][0]+(o[s+1][0]-o[s][0])*r,o[s][1]+(o[s+1][1]-o[s][1])*r])}let a=(n.length-1)*t,c=n.map((i,r)=>{let h=n[Math.max(0,r-2)],u=n[Math.min(n.length-1,r+2)],f=u[0]-h[0],l=u[1]-h[1],p=Math.hypot(f,l);return[f/p,l/p]});return{pts:n,T:c,N:c.map(([i,r])=>[-r,i]),length:a,step:t}}function uo(t,o,e){let n=!1;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[s],i=t[a];c[1]>e!=i[1]>e&&o<(i[0]-c[0])*(e-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function po(t,o,e){let n=1/0;for(let s=0,a=t.length-1;s<t.length;a=s++){let c=t[a],i=t[s],r=i[0]-c[0],h=i[1]-c[1],u=((o-c[0])*r+(e-c[1])*h)/(r*r+h*h||1);u=Math.max(0,Math.min(1,u));let f=c[0]+u*r-o,l=c[1]+u*h-e;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function Ee(t){let o=t.length,e=1/0,n=1/0,s=-1/0,a=-1/0;for(let l of t)e=Math.min(e,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),a=Math.max(a,l[1]);let c=Math.max(s-e,a-n)*20,i=(e+s)/2,r=(n+a)/2,h=t.concat([[i-c,r-c],[i,r+c],[i+c,r-c]]),u=(l,p,x)=>{let[m,d]=h[l],[w,g]=h[p],[M,E]=h[x],T=2*(m*(g-E)+w*(E-d)+M*(d-g)),L=((m*m+d*d)*(g-E)+(w*w+g*g)*(E-d)+(M*M+E*E)*(d-g))/T,S=((m*m+d*d)*(M-w)+(w*w+g*g)*(m-M)+(M*M+E*E)*(w-m))/T;return[L,S,(m-L)**2+(d-S)**2]},f=[[o,o+1,o+2,...u(o,o+1,o+2)]];for(let l=0;l<o;l++){let[p,x]=h[l],m=[],d=new Map;for(let w of f)if((p-w[3])**2+(x-w[4])**2<w[5])for(let[g,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let E=g<M?`${g},${M}`:`${M},${g}`;d.has(E)?d.delete(E):d.set(E,[g,M])}else m.push(w);for(let[w,g]of d.values())m.push([w,g,l,...u(w,g,l)]);f=m}return f.filter(l=>l[0]<o&&l[1]<o&&l[2]<o).map(l=>[l[0],l[1],l[2]])}function P0(t,o,e){let n=0,s=1/0;for(let p=0;p<t.pts.length;p++){let x=(t.pts[p][0]-o)**2+(t.pts[p][1]-e)**2;x<s&&(s=x,n=p)}let a=t.step,c=n*a;for(let p=0;p<4;p++){let x=Math.min(t.pts.length-1.001,Math.max(0,c/a)),m=Math.floor(x),d=x-m,w=[t.pts[m][0]+(t.pts[m+1][0]-t.pts[m][0])*d,t.pts[m][1]+(t.pts[m+1][1]-t.pts[m][1])*d],g=[t.T[m][0]+(t.T[m+1][0]-t.T[m][0])*d,t.T[m][1]+(t.T[m+1][1]-t.T[m][1])*d],M=(o-w[0])*g[0]+(e-w[1])*g[1];c=Math.min((t.pts.length-1)*a,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/a),r=Math.floor(i),h=i-r,u=[t.pts[r][0]+(t.pts[r+1][0]-t.pts[r][0])*h,t.pts[r][1]+(t.pts[r+1][1]-t.pts[r][1])*h],f=[t.N[r][0]+(t.N[r+1][0]-t.N[r][0])*h,t.N[r][1]+(t.N[r+1][1]-t.N[r][1])*h],l=(o-u[0])*f[0]+(e-u[1])*f[1];return[c,l,Math.sqrt(s)]}function be(t,o){let e=Math.min(t.pts.length-1.001,Math.max(0,o/t.step)),n=Math.floor(e),s=e-n,a=c=>[c[n][0]+(c[n+1][0]-c[n][0])*s,c[n][1]+(c[n+1][1]-c[n][1])*s];return{p:a(t.pts),t:a(t.T),n:a(t.N)}}function h0(t,o,e,n){let s=be(t,o),a=e-s.p[0],c=n-s.p[1];return[a*s.t[0]+c*s.t[1],a*s.n[0]+c*s.n[1]]}function mo(t){let o=Me(Jt(14),.018,!0).pts,e=o.map(v=>v.slice()),n=e.length,s=.04,a=3,c=()=>(a=a*16807%2147483647)/2147483647-.5;for(let v=-40;v<=40;v++)for(let y=-40;y<=40;y++){let b=y*s+(v&1)*s*.5+c()*.002,H=v*s*.866+c()*.002;Math.abs(b)>1.5||Math.abs(H)>1.5||uo(o,b,H)&&(po(o,b,H)<s*.55||e.push([b,H]))}let i=Ee(e).filter(([v,y,b])=>{let H=(e[v][0]+e[y][0]+e[b][0])/3,F=(e[v][1]+e[y][1]+e[b][1])/3;return uo(o,H,F)}),r=e.length,h=new Float32Array(r);for(let v=0;v<r;v++)h[v]=v<n?0:po(o,e[v][0],e[v][1]);let u=ge(t),f=new Float32Array(r),l=new Float32Array(r),p=new Float32Array(r);for(let v=0;v<r;v++){let[y,b,H]=P0(u,e[v][0],e[v][1]);f[v]=y,l[v]=b,p[v]=H}let x=new Float32Array(r);for(let v=0;v<r;v++){if(v<n)continue;let y=h[v],b=f[v]/u.length,H=.035*Math.exp(-((l[v]/.07)**2))*Math.min(1,y/.12)*(b>.15&&b<.9?1:.4),F=0;for(let K of f0)F+=.075*Math.exp(-(((e[v][0]-K[0])**2+(e[v][1]-K[1])**2)/.05**2));x[v]=ve*Math.sqrt(y)*(y<.03?.75+y/.03*.25:1)+H+F*Math.min(1,y/.05)}let m=Array.from({length:r},()=>new Set);for(let[v,y,b]of i)m[v].add(y).add(b),m[y].add(v).add(b),m[b].add(v).add(y);for(let v=0;v<10;v++){let y=x.slice();for(let b=n;b<r;b++){let H=0,F=0;for(let K of m[b])H+=x[K],F++;F&&(y[b]=x[b]*.5+H/F*.5)}x=y}let d=P0(u,-.62,.46)[0],w=new Int8Array(r).fill(-1),g=new Float32Array(r),M=xt.map(v=>{let y=Math.max(d,P0(u,v.joint[0],v.joint[1])[0]),[b,H]=h0(u,y,v.joint[0],v.joint[1]);return{s:y,a:b,l:H}}),E=new Float32Array(r),T=new Float32Array(r);for(let v=0;v<r;v++){let[y,b]=e[v],H=-1,F=1/0,K=0;if(xt.forEach((N,G)=>{let O=N.foot[0]-N.joint[0],J=N.foot[1]-N.joint[1],gt=O*O+J*J,W=((y-N.joint[0])*O+(b-N.joint[1])*J)/gt,ct=Math.max(0,Math.min(1,W)),it=Math.hypot(N.joint[0]+O*ct-y,N.joint[1]+J*ct-b);it<F&&(F=it,H=G,K=W)}),H>=0&&K>-.12&&F<p[v]+.02&&F<.3){w[v]=H;let N=Math.min(1,Math.max(0,(K-.02)/.62)),G=Math.min(1,Math.max(0,(.3-F)/.13));g[v]=N*N*(3-2*N)*G*G*(3-2*G);let[O,J]=h0(u,M[H].s,y,b);E[v]=O,T[v]=J}}let L=new Float32Array(r),S=new Float32Array(r),A=new Float32Array(r),R=new Float32Array(r),k=new Float32Array(r),q=new Float32Array(r),$=(v,y,b)=>{let H=Math.min(1,Math.max(0,(b-v)/(y-v)));return H*H*(3-2*H)};for(let v=0;v<r;v++){L[v]=Math.max(d,f[v]);let[y,b]=h0(u,L[v],e[v][0],e[v][1]);if(S[v]=y,A[v]=b,w[v]<0&&f[v]<d){R[v]=.75*$(.42,.1,p[v])*$(d,d-.5,f[v]);let[H,F]=h0(u,f[v],e[v][0],e[v][1]);k[v]=H,q[v]=F}}let Q=xt.map((v,y)=>{let b=v.joint,H=i.filter(G=>G.some(O=>w[O]===y)),F=G=>{let O=Math.cos(G),J=Math.sin(G),gt=W=>{let ct=w[W]===y?g[W]:0,it=e[W][0]-b[0],Rt=e[W][1]-b[1];return[e[W][0]+(b[0]+it*O-Rt*J-e[W][0])*ct,e[W][1]+(b[1]+it*J+Rt*O-e[W][1])*ct]};for(let[W,ct,it]of H){let Rt=gt(W),$0=gt(ct),K0=gt(it),Y0=($0[0]-Rt[0])*(K0[1]-Rt[1])-($0[1]-Rt[1])*(K0[0]-Rt[0]),Q0=(e[ct][0]-e[W][0])*(e[it][1]-e[W][1])-(e[ct][1]-e[W][1])*(e[it][0]-e[W][0]);if(Math.sign(Y0)!==Math.sign(Q0)||Math.abs(Y0)<Math.abs(Q0)*.15)return!1}return!0},K=0,N=0;for(;K<.4&&F(K+.02);)K+=.02;for(;N>-.4&&F(N-.02);)N-=.02;return[N,K]}),ut=new Float32Array(r*2);for(let v=0;v<r;v++)ut[v*2]=(e[v][0]+vt)/(2*vt),ut[v*2+1]=(e[v][1]+vt)/(2*vt);let rt=[];for(let[v,y,b]of i)(e[y][0]-e[v][0])*(e[b][1]-e[v][1])-(e[y][1]-e[v][1])*(e[b][0]-e[v][0])>0?rt.push(v,y,b):rt.push(v,b,y);let P=new Pt.BufferGeometry;return P.setAttribute("position",new Pt.Float32BufferAttribute(new Float32Array(r*3),3)),P.setAttribute("normal",new Pt.Float32BufferAttribute(new Float32Array(r*3),3)),P.setAttribute("uv",new Pt.Float32BufferAttribute(ut,2)),P.setAttribute("aDist",new Pt.Float32BufferAttribute(h,1)),P.setIndex(rt),{geo:P,n:r,nb:n,pts:e,ring:o,S:f,Lat:l,h:x,dist:h,legIdx:w,legW:g,legA:E,legL:T,joints:M,sAtt:L,along:S,across:A,tailW:R,tailA:k,tailL:q,legRange:Q,spine:u,tris:i}}var Ct=.004,st=(t,o)=>[t[0]-o[0],t[1]-o[1]],Wt=(t,o)=>[t[0]+o[0],t[1]+o[1]],Mt=(t,o)=>[t[0]*o,t[1]*o],D0=t=>Math.hypot(t[0],t[1]),o0=t=>Mt(t,1/(D0(t)||1));function ye(t,o,e){let n=[t[0]];for(let s=1;s<t.length-1;s++){let a=t[s-1],c=t[s],i=t[s+1],r=o0(st(c,a)),h=o0(st(i,c)),u=r[0]*h[1]-r[1]*h[0],f=Math.max(-1,Math.min(1,r[0]*h[0]+r[1]*h[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let x=(u>0?e:o)*Math.tan(l/2);x=Math.min(x,D0(st(c,a))*.48,D0(st(i,c))*.48);let m=x/Math.tan(l/2),d=st(c,Mt(r,x)),w=Wt(c,Mt(h,x)),g=u>0?[-r[1],r[0]]:[r[1],-r[0]],M=Wt(d,Mt(g,m)),E=Math.atan2(d[1]-M[1],d[0]-M[0]),T=Math.atan2(w[1]-M[1],w[0]-M[0]),L=T-E;for(;L>Math.PI;)L-=2*Math.PI;for(;L<-Math.PI;)L+=2*Math.PI;let S=Math.max(2,Math.ceil(Math.abs(L)*m/.01));for(let A=0;A<=S;A++){let R=E+L*A/S;n.push([M[0]+Math.cos(R)*m,M[1]+Math.sin(R)*m])}}return n.push(t[t.length-1]),n}function xo(t,o,e=2,n=!0){let s=[0];for(let h=1;h<t.length;h++){let u=0;for(let f=0;f<e;f++)u+=(t[h][f]-t[h-1][f])**2;s.push(s[h-1]+Math.sqrt(u))}let a=s[s.length-1],c=Math.floor(a/o+1e-9),i=[],r=0;for(let h=0;h<=c;h++){let u=h*o;for(;r<s.length-2&&s[r+1]<u;)r++;let f=(u-s[r])/(s[r+1]-s[r]||1);i.push(t[r].map((l,p)=>l+(t[r+1][p]-l)*f))}return n&&a-c*o>o*.25&&i.push(t[t.length-1].slice()),i}function Te(t){let o=y0(It.a),[e,,n]=It.c,s=Xt.h,a=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of o.faces){let l=f.n[0],p=f.n[1],x=f.n[2],m=f.d+l*e+p*s+x*n-x*t,d=g=>l*g[0]+p*g[1]<=m+1e-9,w=[];for(let g=0;g<a.length;g++){let M=a[g],E=a[(g+1)%a.length],T=d(M),L=d(E);if(T&&w.push(M),T!==L){let S=l*M[0]+p*M[1]-m,A=l*E[0]+p*E[1]-m,R=S/(S-A);w.push([M[0]+(E[0]-M[0])*R,M[1]+(E[1]-M[1])*R])}}a=w}let c=a.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),r=Math.max(...c.map(f=>f[0])),h=a.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-r)<1e-9),u=[];for(let f=0;f<a.length;f++){let l=a[(h+f)%a.length];if(u.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:u.reverse(),xl:i,xr:r,top:Math.max(...a.map(f=>f[1]))}}function ke(t,o){let e=Xt,n=e.h,s=X,a=[[t,s],[lt.x1,s],[lt.x1,0]],c=e.x0+.02,i=.1375,r=n/2;a.push([c-i,0],[c-i,r]);for(let u=7;u<12;u++){let f=u/12*Math.PI;a.push([c-i*Math.sin(f),r-r*Math.cos(f)])}a.push([c,n]);let h=Te(It.c[2]);for(let u of h.chain)a.push(u);return a.push([e.x1,n],[e.x1,n-.05],[e.x1-.06,n-.05],[e.x1-.06,.05],[e.x1,.05],[e.x1,0],[o,0]),{P:a.map(([u,f])=>[u-t,f]),top:h.top}}function Se(t,o){let e=Vt.c[0],n=Vt.r,s=i0.slice(4,zt+1),a=i0.slice(zt),c=[[t,0]];for(let[i,r]of s)c.push([e+i*n,r]);for(let[i,r]of a.slice(1))c.push([e+i*n,r]);for(let[i,r]of a.slice().reverse().slice(1))c.push([e-i*n,r]);for(let[i,r]of s.slice().reverse().slice(1))c.push([e-i*n,r]);return c.push([o,0]),c.map(([i,r])=>[t-i,r])}function C0(t,o,e,n=.07,s=.15){let a=ye(e,n,s),c=[],i=xo(a,Ct/2);for(let r=0;r<i.length;r++){let h=i[Math.max(0,r-1)],u=i[Math.min(i.length-1,r+1)],f=o0(st(u,h)),l=[-f[1],f[0]];c.push([t[0]+o[0]*i[r][0],i[r][1],t[1]+o[1]*i[r][0],o[0]*l[0],l[1],o[1]*l[0]])}return c}function Tt(t,o){return t.map(([e,n])=>[e,o,n,0,1,0])}function N0(t,o,e,n,s=200){let a=[];for(let c=0;c<=s;c++){let i=c/s,r=1-i;a.push([r*r*r*t[0]+3*r*r*i*o[0]+3*r*i*i*e[0]+i*i*i*n[0],r*r*r*t[1]+3*r*r*i*o[1]+3*r*i*i*e[1]+i*i*i*n[1]])}return a}function F0(t,o,e,n){let s=st(t,Mt(o,n)),a=Wt(t,Mt(e,n));return N0(s,Wt(s,Mt(o,n*.552)),st(a,Mt(e,n*.552)),a,60)}var Ae={zA:It.c[2],xA0:-.35,xC1:4.75,zC:Vt.c[2],xD:-1.05,zD1:3.2,r:.55};function vo(t){let o=Ae,e=[],n={};e.push(Tt(t,X));let s=t[t.length-1],a=t[t.length-6],c=o0(st(s,a)),i=[o.xA0,o.zA];e.push(Tt(N0(s,Wt(s,Mt(c,.35)),st(i,[.35,0]),i),X));let r=[o.xC1,o.zA],h=ke(o.xA0,o.xC1-o.r),u=C0([o.xA0,o.zA],[1,0],h.P);n.topY=h.top,e.push(u),e.push(Tt(F0(r,[1,0],[0,1],o.r),0));let f=[o.xC1,o.zC];e.push(Tt([[r[0],r[1]+o.r],[f[0],f[1]-o.r]],0)),e.push(Tt(F0(f,[0,1],[-1,0],o.r),0));let l=[o.xD,o.zC],p=Se(f[0]-o.r,l[0]+o.r);e.push(C0([f[0]-o.r,o.zC],[-1,0],p,.05,.12)),e.push(Tt(F0(l,[-1,0],[0,-1],o.r),0));let x=[o.xD,o.zD1],m=l[1]-o.r,d=[[0,0],[m-lt.z1,0],[m-lt.z1,X],[m-x[1],X]];e.push(C0([o.xD,m],[0,-1],d));let w=t[0],g=t[5],M=o0(st(g,w));e.push(Tt(N0(x,Wt(x,[0,-.6]),st(w,Mt(M,.6)),w),X)),e.push(Tt(t,X));let E=[];for(let P of e)for(let v of P){let y=E[E.length-1];y&&Math.hypot(v[0]-y[0],v[1]-y[1],v[2]-y[2])<1e-6||E.push(v)}let T=t.length,L=E.slice(0,T),S=E.slice(E.length-T),A=xo(E.slice(T-1,E.length-T+1),Ct,3,!1),R=L.concat(A.slice(1,A.length-1),S),k=R.length,q=new Float32Array(k*3),$=new Float32Array(k*3),Q=new Float32Array(k*3),ut=new Float32Array(k*3);for(let P=0;P<k;P++){let v=R[Math.max(0,P-2)],y=R[Math.min(k-1,P+2)],b=y[0]-v[0],H=y[1]-v[1],F=y[2]-v[2],K=Math.hypot(b,H,F)||1;b/=K,H/=K,F/=K;let N=R[P][3],G=R[P][4],O=R[P][5],J=N*b+G*H+O*F;N-=J*b,G-=J*H,O-=J*F;let gt=Math.hypot(N,G,O)||1;N/=gt,G/=gt,O/=gt;let W=G*F-O*H,ct=O*b-N*F,it=N*H-G*b;q.set([R[P][0],R[P][1],R[P][2]],P*3),$.set([b,H,F],P*3),ut.set([N,G,O],P*3),Q.set([W,ct,it],P*3)}for(let P of[ut,Q]){let v=P.slice();for(let y=2;y<k-2;y++)for(let b=0;b<3;b++)P[y*3+b]=(v[(y-2)*3+b]+v[(y-1)*3+b]*2+v[y*3+b]*3+v[(y+1)*3+b]*2+v[(y+2)*3+b])/9}let rt=0;for(let P=0;P<k;P++)q[P*3+1]>q[rt*3+1]&&(rt=P);return n.top=rt*Ct,{pos:q,T:$,B:Q,N:ut,n:k,length:(k-1)*Ct,marks:n}}function u0(t,o,e){let n=Math.min(t.n-1.0001,Math.max(0,o/Ct)),s=Math.floor(n),a=n-s;for(let c of["pos","T","B","N"]){let i=t[c],r=e[c];r[0]=i[s*3]+(i[s*3+3]-i[s*3])*a,r[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*a,r[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*a}return e}function Mo(t,o){let e=document.getElementById("frame"),n=()=>{let a=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),r=(c?c.offsetHeight:0)+6+13,h=(i?i.offsetHeight:0)+8+13,u=window.innerWidth-a*2,f=window.innerHeight-r-h,l=f,p=l*t;p>u&&(p=u,l=p/t),p=Math.max(160,Math.floor(p)),l=Math.max(120,Math.floor(l)),e.style.width=`${p}px`,e.style.height=`${l}px`,e.style.top=`${r+Math.max(0,(f-l)/2)}px`,o?.(p,l)};return window.addEventListener("resize",n),n(),n}function wo(){let t=document.getElementById("panel"),o=document.getElementById("btn-info"),e=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),o?.setAttribute("aria-expanded",String(s))};o?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),e?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function go(t,o,e){let n=s=>{for(let[a,c]of t)a.setAttribute("aria-pressed",String(c===s));o(s)};for(let[s,a]of t)s.addEventListener("click",()=>n(a));return e!==void 0&&n(e),n}function Eo(t){window.addEventListener("keydown",o=>{if(o.target.closest?.("input, textarea, select"))return;let e=t[o.key.length===1?o.key.toLowerCase():o.key];e&&(o.preventDefault(),e(o))})}function bo(t,o=!0){let e=document.getElementById("btn-play"),n=s=>{o=s,e&&(e.setAttribute("aria-pressed",String(!s)),e.querySelector("span").textContent=s?"Pause":"Play",e.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return e?.addEventListener("click",()=>n(!o)),n(o&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function yo(t,o){let e=document.getElementById("badge");e&&o&&(e.textContent=o),document.body.classList.toggle("badge-on",!!t)}function To(){document.body.classList.add("ready")}var Re=performance.now(),Fo={},At=t=>{Fo[t]=Math.round(performance.now()-Re)},He=1.4,V=.42,ko=[-.95,1.7],Kt=document.getElementById("scene"),a0=new I.WebGLRenderer({canvas:Kt,antialias:!0});a0.setPixelRatio(Math.min(window.devicePixelRatio||1,2));a0.setClearColor(15525333,1);var r0=new I.Scene,s0=J0(),Ie=oo(s0),Le=a0.capabilities.getMaxAnisotropy();function Nt(t,o=Ie){let e=new I.Mesh(t.build(),o);return e.frustumCulled=!1,r0.add(e),e}Nt(no());Nt(so());Nt(ao());Nt(ro().b);Nt(co());Nt(io());Nt(lo());At("desk");var Do=fo(9).map(t=>({pl:t,c:ft(t,[0,0])})),No=-32*(Math.PI/180),yt=null,So=1/0;for(let t of Do){if(t.pl.r!==1)continue;let o=t.pl.r*(2*Math.PI/3)+No,e=Math.hypot(t.c[0],t.c[1]),n=Math.atan2(t.c[1],t.c[0])-o;n=Math.atan2(Math.sin(n),Math.cos(n));let s=Math.abs(e-4.3)+Math.abs(n)*2.5;s<So&&(So=s,yt=t)}var Bo=-No-yt.pl.r*(2*Math.PI/3),Ao=Math.cos(Bo),Ro=Math.sin(Bo),z0=t=>[Ao*t[0]-Ro*t[1],-(Ro*t[0]+Ao*t[1])],Ho=ft(yt.pl,[1.24,-.66]),Io=[ko[0]-V*z0(Ho)[0],ko[1]-V*z0(Ho)[1]],_0=t=>{let o=z0(t);return[Io[0]+V*o[0],Io[1]+V*o[1]]},m0=t=>_0(ft(yt.pl,t)),z={x0:lt.x0+.06,z0:lt.z0+.05,x1:lt.x1-.04,z1:lt.z1-.05};z.W=z.x1-z.x0;z.D=z.z1-z.z0;var x0=Jt(10),Pe=Do.filter(t=>x0.every(o=>{let e=_0(ft(t.pl,o));return e[0]>z.x0+.08&&e[0]<z.x1-.08&&e[1]>z.z0+.08&&e[1]<z.z1-.08})),n0={W:z.W,D:z.D,res:2048/z.W,k:V,tiles:Pe,ring:x0,hero:yt,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let o=_0(t);return[o[0]-z.x0,o[1]-z.z0]}},B0=1-at(n0.rIn,n0.rOut,n0.centreDist(yt));function v0(t){let o=new I.CanvasTexture(t);return o.colorSpace=I.NoColorSpace,o.anisotropy=Le,o.generateMipmaps=!0,o.minFilter=I.LinearMipmapLinearFilter,o}At("layout");var Ce=I0("L",n0);At("pageL");var Fe=I0("C",n0);At("pageC");var De=w0(s0,v0(Ce),v0(Fe));{let t=new I.BufferGeometry,o=X+4e-4;t.setAttribute("position",new I.Float32BufferAttribute([z.x0,o,z.z0,z.x0,o,z.z1,z.x1,o,z.z1,z.x1,o,z.z0],3)),t.setAttribute("normal",new I.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new I.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new I.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let e=new I.Mesh(t,De);e.frustumCulled=!1,r0.add(e)}var B=mo(Ct/V);At("lizard");var Ft=B.spine.length,Ne=B.spine.pts.map(t=>m0(t)),wt=vo(Ne);At("path");var Dt=w0(s0,v0(L0("L",x0,yt.pl.r)),v0(L0("C",x0,yt.pl.r)),{contourStep:.05,uvScale:2*vt*V});{let t=(c,i,r)=>at(c,i,r),o=[.42,.41,.39],e=[.12,.11,.1],n=t(.2,.8,B0),s=.5+.5*t(0,.6,B0),a=o.map((c,i)=>c+(e[i]-c)*n);Dt.uniforms.uSketchLine.value.set(...a.map((c,i)=>Ot[i]+(c-Ot[i])*s)),Dt.uniforms.uSketchPaper.value.set(...Ot),Dt.uniforms.uLineW.value=(.011+.006*B0)/2}At("hero");var U0=new I.Mesh(B.geo,Dt);U0.frustumCulled=!1;U0.renderOrder=2;r0.add(U0);var Be=.62,ze=.42,_t=3.2,Ut=Ft*V,ht=wt.length,qt=Math.min(ht-1,wt.marks.top+Ft*V*.5),St=(()=>{let t=[0],o=[Ut],e=0,n=.004,s=!1;for(let a=Ut;a<ht;a+=n){let c=(r,h)=>Math.max(.22,Math.min(1,r/h)),i=Be*c(a-Ut,.5)*c(ht-a,.6)*(Math.abs(a-qt)<.45?Math.max(.25,Math.abs(a-qt)/.45):1);e+=n/i,!s&&a>=qt&&(e+=_t,s=!0,t.push(e),o.push(a)),t.push(e),o.push(Math.min(ht,a+n))}return{T:t,U:o,dur:e}})();function Ve(t){let{T:o,U:e}=St;if(t<=0)return e[0];if(t>=St.dur)return e[e.length-1];let n=0,s=o.length-1;for(;s-n>1;){let c=n+s>>1;o[c]<=t?n=c:s=c}let a=(t-o[n])/(o[s]-o[n]||1);return e[n]+(e[s]-e[n])*a}var Gt=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",St.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],V0=0;for(let t of Gt)t.start=V0,V0+=t[1];var d0=V0;function at(t,o,e){let n=Math.min(1,Math.max(0,(e-t)/(o-t)));return n*n*(3-2*n)}function je(t){t=(t%d0+d0)%d0;let o=Gt[0];for(let s of Gt)t>=s.start&&(o=s);let e=(t-o.start)/o[1],n={fill:0,relief:0,u:Ut,phase:o,pauseT:-1};switch(o[0]){case"rest":break;case"fill":n.fill=at(0,1,e);break;case"relief":n.fill=1,n.relief=.35*at(0,1,e);break;case"rise":n.fill=1,n.relief=.35+.65*at(0,1,e);break;case"walk":{n.fill=1,n.relief=1;let s=e*St.dur;n.u=Ve(s);let a=s-St.T[St.U.findIndex(c=>c>=qt)];Math.abs(n.u-qt)<1e-4&&a>=0&&a<=_t&&(n.pauseT=a);break}case"settle":n.fill=1,n.relief=1,n.u=ht;break;case"sink":n.fill=1,n.relief=1-at(0,1,e),n.u=ht;break;case"unfill":n.fill=1-at(0,1,e),n.u=ht;break}return n}var ot={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},Lo=B.geo.getAttribute("position"),e0=Ft*.79,Oe=B.joints.map(t=>t.l>0?-1:1),et={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},p0=xt.map(()=>({ang:0,lift:0,f:{pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]}}));function We(t){let o=t.u>=ht-1e-6?ht:t.u,e=Math.max(0,o-Ut),n=2*Math.PI*e/ze,s=at(0,.3,e)*at(0,.35,ht-o)*(t.pauseT>=0?0:1),a=t.pauseT>=0?.55*Math.sin(t.pauseT/_t*Math.PI*2)*at(0,.5,t.pauseT)*at(_t,_t-.5,t.pauseT):0,c=t.pauseT>=0?.12*Math.sin(t.pauseT/_t*Math.PI):0,i=t.relief;for(let h=0;h<xt.length;h++){let u=n+xt[h].phase,[f,l]=B.legRange[h],p=(f+l)*.4,x=Math.min(.26,(l-f)*.4);p0[h].ang=(p+Oe[h]*x*Math.sin(u))*s,p0[h].lift=.09*Math.max(0,Math.cos(u))*s,u0(wt,o-(Ft-B.joints[h].s)*V,p0[h].f)}let r=Lo.array;for(let h=0;h<B.n;h++){let u=B.sAtt[h],f=B.along[h],l=B.across[h],p=B.h[h];if(l+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(u/Ft-.45)),u>e0&&(a||c)){let S=at(e0,e0+.3,u),A=u+f-e0,R=a*S,k=Math.cos(R),q=Math.sin(R),$=e0+A*k-l*q;l=A*q+l*k,f=$-u,p+=c*S*(A/.5)}u0(wt,o-(Ft-u)*V,ot);let x=ot.pos[0]+(ot.T[0]*f+ot.B[0]*l)*V,m=ot.pos[1]+(ot.T[1]*f+ot.B[1]*l)*V,d=ot.pos[2]+(ot.T[2]*f+ot.B[2]*l)*V,w=ot.N[0],g=ot.N[1],M=ot.N[2],E=B.tailW[h];if(E>0){u0(wt,o-(Ft-B.S[h])*V,et);let S=B.tailA[h],A=B.tailL[h];x+=(et.pos[0]+(et.T[0]*S+et.B[0]*A)*V-x)*E,m+=(et.pos[1]+(et.T[1]*S+et.B[1]*A)*V-m)*E,d+=(et.pos[2]+(et.T[2]*S+et.B[2]*A)*V-d)*E,w+=(et.N[0]-w)*E,g+=(et.N[1]-g)*E,M+=(et.N[2]-M)*E}let T=B.legIdx[h];if(T>=0){let S=B.joints[T],A=B.legW[h],R=p0[T],k=R.f,q=B.legA[h]-S.a,$=B.legL[h]-S.l,Q=Math.cos(R.ang),ut=Math.sin(R.ang),rt=S.a+q*Q-$*ut,P=S.l+q*ut+$*Q,v=k.pos[0]+(k.T[0]*rt+k.B[0]*P)*V,y=k.pos[1]+(k.T[1]*rt+k.B[1]*P)*V,b=k.pos[2]+(k.T[2]*rt+k.B[2]*P)*V;x+=(v-x)*A,m+=(y-m)*A,d+=(b-d)*A,w+=(k.N[0]-w)*A,g+=(k.N[1]-g)*A,M+=(k.N[2]-M)*A,p+=R.lift*A}let L=p*V*i+.0015;r[h*3]=x+w*L,r[h*3+1]=m+g*L,r[h*3+2]=d+M*L}Lo.needsUpdate=!0,B.geo.computeVertexNormals(),Dt.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Dt.uniforms.uFill.value=t.fill}var _e=10631978,kt=new I.Group,q0=new I.MeshBasicMaterial({color:_e,transparent:!0,opacity:0,depthWrite:!1,side:I.DoubleSide});function zo(t,o,e=0,n=0){let s=[],a=[],c=0,i=!0,r=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),r+=c,e&&r>(i?e:n)&&(i=!i,r=0);let l=t[f];if(s.push(l[0]+l[3]*o,l[1]+l[4]*o,l[2]+l[5]*o,l[0]-l[3]*o,l[1]-l[4]*o,l[2]-l[5]*o),f&&(i||!e)){let p=(f-1)*2;a.push(p,p+1,p+2,p+1,p+3,p+2)}}let h=new I.BufferGeometry;h.setAttribute("position",new I.Float32BufferAttribute(s,3)),h.setIndex(a);let u=new I.Mesh(h,q0);return u.frustumCulled=!1,u}function Po(t,o,e,n,s){let a=o?t.concat([t[0]]):t,c=a.map((i,r)=>{let h=a[Math.max(0,r-1)],u=a[Math.min(a.length-1,r+1)],f=u[0]-h[0],l=u[1]-h[1],p=Math.hypot(f,l)||1;return[i[0],X+.003,i[1],-l/p,0,f/p]});return zo(c,e,n,s)}{let t=Jt(10).map(n=>m0(n));kt.add(Po(t,!0,.009,.05,.03));let o=[];for(let n=0;n<6;n++)for(let s=0;s<40;s++){let a=Y[n],c=Y[(n+1)%6];o.push(m0([a[0]+(c[0]-a[0])*(s/40),a[1]+(c[1]-a[1])*(s/40)]))}kt.add(Po(o,!0,.0045,.03,.025));for(let n of[0,2,4]){let s=m0(Y[n]),a=new I.Mesh(new I.CircleGeometry(.04,20),q0);a.rotation.x=-Math.PI/2,a.position.set(s[0],X+.004,s[1]),kt.add(a)}let e=[];for(let n=0;n<wt.n;n+=4){let s=wt.pos,a=wt.N,c=wt.B;e.push([s[n*3]+a[n*3]*.006,s[n*3+1]+a[n*3+1]*.006,s[n*3+2]+a[n*3+2]*.006,c[n*3],c[n*3+1],c[n*3+2]])}kt.add(zo(e,.007,.07,.05)),kt.renderOrder=5,kt.visible=!1,r0.add(kt)}var bt=new I.OrthographicCamera(-1,1,1,-1,1,400),j0={H:5.9,target:new I.Vector3(.15,.3,2.35)},M0=1,O0=1;function Vo(){let t=j0.target;bt.position.set(t.x+100,t.y+100,t.z+100),bt.up.set(0,1,0),bt.lookAt(t);let o=j0.H/2;bt.left=-o*(M0/O0),bt.right=o*(M0/O0),bt.top=o,bt.bottom=-o,bt.updateProjectionMatrix()}Mo(He,(t,o)=>{M0=t,O0=o,a0.setSize(t,o),Vo()});wo();var D={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},jo=go([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{D.lithoTarget=t},1),Oo=document.getElementById("btn-reveal");function G0(t){D.revealTarget=t?1:0,Oo.setAttribute("aria-pressed",String(t))}Oo.addEventListener("click",()=>G0(!D.revealTarget));var Wo=bo(t=>{D.playing=t});Eo({" ":()=>Wo(!D.playing),l:()=>jo(D.lithoTarget?0:1),r:()=>G0(!D.revealTarget),ArrowRight:()=>{D.t+=1},ArrowLeft:()=>{D.t-=1},0:()=>{D.t=0}});var $t=null;Kt.addEventListener("pointerdown",t=>{Kt.setPointerCapture(t.pointerId),$t={x:t.clientX}});Kt.addEventListener("pointermove",t=>{$t&&(D.t+=(t.clientX-$t.x)/Math.max(200,M0)*22,$t.x=t.clientX)});var _o=()=>{$t=null};Kt.addEventListener("pointerup",_o);Kt.addEventListener("pointercancel",_o);var Co=performance.now(),W0="",Uo=0;function qo(t){Uo++;let o=Math.min(.05,Math.max(0,(t-Co)/1e3));Co=t,D.playing&&!$t&&(D.t+=o);for(let[s,a]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=D[a]-D[s];D[s]+=Math.sign(c)*Math.min(Math.abs(c),o*2.4)}s0.uLitho.value=D.litho,s0.uTime.value=t/1e3;let e=je(D.t);We(e),Dt.uniforms.uContours.value=D.reveal*Math.min(1,e.relief*3),q0.opacity=D.reveal*.9,kt.visible=D.reveal>.01;let n=D.reveal>.5?e.phase[2]:"";n!==W0&&(yo(!!n,n),W0=n),a0.render(r0,bt),requestAnimationFrame(qo)}At("ready");To();requestAnimationFrame(qo);window.__page={state:D,VIEW:j0,updateCamera:Vo,TOTAL:d0,PHASES:Gt,setPlaying:Wo,setLitho:t=>{jo(t?1:0),D.litho=t?1:0},setReveal:t=>{G0(t),D.reveal=t?1:0},at:(t,o=0)=>{let e=Gt.find(n=>n[0]===t);D.t=e.start+e[1]*o},path:wt,hero:yt,L:B,TIMES:Fo,get frames(){return Uo},atU(t){let o=Gt.find(n=>n[0]==="walk"),e=St.U.findIndex(n=>n>=t);D.t=o.start+St.T[Math.max(0,e)]},UP:qt,U0:Ut,U1:ht,get label(){return W0}};})();
