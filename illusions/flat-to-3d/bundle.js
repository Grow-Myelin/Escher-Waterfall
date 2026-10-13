(()=>{var No=Object.create;var Ne=Object.defineProperty;var Bo=Object.getOwnPropertyDescriptor;var Vo=Object.getOwnPropertyNames;var Oo=Object.getPrototypeOf,Wo=Object.prototype.hasOwnProperty;var jo=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var _o=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Vo(e))!Wo.call(t,s)&&s!==o&&Ne(t,s,{get:()=>e[s],enumerable:!(n=Bo(e,s))||n.enumerable});return t};var Nt=(t,e,o)=>(o=t!=null?No(Oo(t)):{},_o(e||!t||!t.__esModule?Ne(o,"default",{value:t,enumerable:!0}):o,t));var St=jo((D0,Be)=>{Be.exports=window.THREE});var S=Nt(St(),1);var U=Nt(St(),1);function Ve(){return{uTime:{value:0},uFlowTime:{value:0},uLitho:{value:1},uLight:{value:new U.Vector3(.1,.9,.66).normalize()},uPaper:{value:new U.Vector3(.925,.898,.835)},uInk:{value:new U.Vector3(.11,.1,.09)},uHaze:{value:new U.Vector3(.83,.86,.84)},uFade:{value:1},uHatch:{value:.055}}}var Oe=`
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
`,Uo=`
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
`,qo=`
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
`,Go=`
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
${Oe}
${Uo}

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
`;function We(t,e={}){return new U.ShaderMaterial({uniforms:t,vertexShader:qo,fragmentShader:Go,transparent:!!e.transparent,side:e.side??U.FrontSide})}var $o=`
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
`,Ko=`
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
${Oe}
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
`;function he(t,e,o,n={}){return new U.ShaderMaterial({uniforms:{...t,uMapL:{value:e},uMapC:{value:o},uSolid:{value:n.solid??0},uContours:{value:0},uContourStep:{value:n.contourStep??.02},uFill:{value:1},uUvScale:{value:n.uvScale??1},uLineW:{value:.006},uSketchPaper:{value:new U.Vector3(.955,.935,.885)},uSketchLine:{value:new U.Vector3(.4,.4,.4)},uFade:{value:1}},vertexShader:$o,fragmentShader:Ko,transparent:!!n.transparent,side:n.side??U.FrontSide})}var H=Nt(St(),1);var F=Nt(St(),1),Yo=1e3,me={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Qo(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function C(t,e=me.PLAIN,o={}){return{c:typeof t=="number"?Qo(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var je=["px","nx","py","ny","pz","nz"];function at(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function ue(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function Bt(t){return Math.hypot(t[0],t[1],t[2])}function Z(t){let e=Bt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function pe(t,e){let o=Math.abs(e[0]),n=Math.abs(e[1]),s=Math.abs(e[2]);return o>=n&&o>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var J=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new F.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new F.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,n=e[0],s=e[1],r=e[2];return[o[0]*n+o[4]*s+o[8]*r+o[12],o[1]*n+o[5]*s+o[9]*r+o[13],o[2]*n+o[6]*s+o[10]*r+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,n=e[0],s=e[1],r=e[2];return Z([o[0]*n+o[3]*s+o[6]*r,o[1]*n+o[4]*s+o[7]*r,o[2]*n+o[5]*s+o[8]*r])}tri(e,o,n,s,r=[1,1,1],c={}){let i=this._tp(e),a=this._tp(o),h=this._tp(n),p=Z(ue(at(o,e),at(n,e))),f=c.uv||[pe(e,p),pe(o,p),pe(n,p)],l=Z(ue(at(a,i),at(h,i))),u=c.n?c.n.map(M=>this._tn(M)):[l,l,l],v=Bt(ue(at(a,i),at(h,i))),m=[v/(Bt(at(h,a))||1),v/(Bt(at(i,h))||1),v/(Bt(at(a,i))||1)],d=c.k||[1,1,1],w=s.s||0,E=[i,a,h];for(let M=0;M<3;M++){let g=E[M];this.pos.push(g[0]+w,g[1]+w,g[2]+w),this.nrm.push(u[M][0],u[M][1],u[M][2]),this.col.push(s.c[0]*d[M],s.c[1]*d[M],s.c[2]*d[M]),this.uv.push(f[M][0],f[M][1]);for(let x=0;x<3;x++)r[x]?this.edg.push(M===x?m[x]:0):this.edg.push(Yo);this.mat.push(s.p,s.f,s.w)}}quad(e,o,n,s,r,c=[1,1,1,1],i={}){let a=i.k||[1,1,1,1],h=i.n,p=i.uv;this.tri(e,o,n,r,[c[1],0,c[0]],{k:[a[0],a[1],a[2]],n:h&&[h[0],h[1],h[2]],uv:p&&[p[0],p[1],p[2]]}),this.tri(e,n,s,r,[c[2],c[3],0],{k:[a[0],a[2],a[3]],n:h&&[h[0],h[2],h[3]],uv:p&&[p[0],p[2],p[3]]})}box(e,o,n,s,r,c,i,a={}){e>s&&([e,s]=[s,e]),o>r&&([o,r]=[r,o]),n>c&&([n,c]=[c,n]);let h=new Set(a.open||[]),p=new Set(a.skip||[]);a.bottom||p.add("ny");let f=a.ao??1,l=a.aoTop??1,u={px:[0,s],nx:[0,e],py:[1,r],ny:[1,o],pz:[2,c],nz:[2,n]},v={px:[[s,o,c],[s,o,n],[s,r,n],[s,r,c]],nx:[[e,o,n],[e,o,c],[e,r,c],[e,r,n]],pz:[[e,o,c],[s,o,c],[s,r,c],[e,r,c]],nz:[[s,o,n],[e,o,n],[e,r,n],[s,r,n]],py:[[e,r,c],[s,r,c],[s,r,n],[e,r,n]],ny:[[e,o,n],[s,o,n],[s,o,c],[e,o,c]]};for(let m of je){if(p.has(m)||h.has(m))continue;let d=v[m],w=[];for(let g=0;g<4;g++){let x=d[g],b=d[(g+1)%4],y=1;for(let T of je){if(T===m)continue;let[k,R]=u[T];Math.abs(x[k]-R)<1e-9&&Math.abs(b[k]-R)<1e-9&&h.has(T)&&(y=0)}w.push(y)}let E;m==="py"||m==="ny"?E=[l,l,l,l]:E=[f,f,1,1];let M=m==="py"&&a.top?{...a.top,s:i.s}:i;this.quad(d[0],d[1],d[2],d[3],M,w,{k:E})}}cyl(e,o,n,s,r,c,i,a={}){let h=a.caps??[!0,!0],p=a.rim??[1,1],f=a.r1??s;for(let l=0;l<c;l++){let u=l/c*Math.PI*2,v=(l+1)/c*Math.PI*2,m=Math.cos(u),d=Math.sin(u),w=Math.cos(v),E=Math.sin(v),M=[e+s*m,o,n+s*d],g=[e+f*m,r,n+f*d],x=[e+f*w,r,n+f*E],b=[e+s*w,o,n+s*E],y=(s-f)/Math.max(1e-6,r-o),T=Z([m,y,d]),k=Z([w,y,E]),R=u*(s+f)/2,z=v*(s+f)/2;this.quad(M,g,x,b,i,[0,p[1],0,p[0]],{n:[T,T,k,k],uv:[[R,o],[R,r],[z,r],[z,o]],k:a.k}),h[1]&&f>0&&this.tri([e,r,n],x,g,i,[1,0,0]),h[0]&&this.tri([e,o,n],M,b,i,[1,0,0])}}lathe(e,o,n,s,r,c,i={}){let a=s.length,h=[];for(let l=0;l<a-1;l++){let u=s[l+1][0]-s[l][0],v=s[l+1][1]-s[l][1];h.push(Z([v,-u,0]))}let p=s.map((l,u)=>{let v=h[Math.max(0,u-1)],m=h[Math.min(a-2,u)];return Z([v[0]+m[0],v[1]+m[1],0])}),f=i.edges||[];for(let l=0;l<r;l++){let u=l/r*Math.PI*2,v=(l+1)/r*Math.PI*2,m=Math.cos(u),d=Math.sin(u),w=Math.cos(v),E=Math.sin(v);for(let M=0;M<a-1;M++){let[g,x]=s[M],[b,y]=s[M+1],T=[e+g*m,o+x,n+g*d],k=[e+b*m,o+y,n+b*d],R=[e+b*w,o+y,n+b*E],z=[e+g*w,o+x,n+g*E],Y=i.flat?h[M]:p[M],V=i.flat?h[M]:p[M+1];this.quad(T,k,R,z,c,[0,f[M+1]?1:0,0,f[M]?1:0],{n:[[Y[0]*m,Y[1],Y[0]*d],[V[0]*m,V[1],V[0]*d],[V[0]*w,V[1],V[0]*E],[Y[0]*w,Y[1],Y[0]*E]],uv:[[u*1.2,x],[u*1.2,y],[v*1.2,y],[v*1.2,x]]})}}}poly(e,o,n={}){for(let s=1;s<e.length-1;s++)this.tri(e[0],e[s],e[s+1],o,[1,s===e.length-2?1:0,s===1?1:0],n)}blob(e,o,n,s,r,c,i,a={}){let h=a.sub??1,p=a.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let v=0;v<h;v++){let m=[];for(let[d,w,E]of f){let M=Z([(d[0]+w[0])/2,(d[1]+w[1])/2,(d[2]+w[2])/2]),g=Z([(w[0]+E[0])/2,(w[1]+E[1])/2,(w[2]+E[2])/2]),x=Z([(E[0]+d[0])/2,(E[1]+d[1])/2,(E[2]+d[2])/2]);m.push([d,M,x],[M,w,g],[x,g,E],[M,g,x])}f=m}let l=v=>1+(a.lump??.12)*Math.sin(v[0]*5.1+p)*Math.sin(v[1]*4.3+p*1.7)*Math.sin(v[2]*3.7+p*.3),u=v=>{let m=l(v);return[e+v[0]*s*m,o+v[1]*r*m,n+v[2]*c*m]};for(let[v,m,d]of f)this.tri(u(v),u(m),u(d),i,[0,0,0],{n:[v,m,d],k:a.k})}build(){let e=new F.BufferGeometry;return e.setAttribute("position",new F.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new F.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new F.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new F.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new F.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new F.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},wt={T:(t,e,o)=>new F.Matrix4().makeTranslation(t,e,o),RX:t=>new F.Matrix4().makeRotationX(t),RY:t=>new F.Matrix4().makeRotationY(t),RZ:t=>new F.Matrix4().makeRotationZ(t),S:(t,e,o)=>new F.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new F.Matrix4)};var D={...me,DESK:14,PAGES:15,CLOTH:16,PEWTER:17,STONE:18,PENCIL:19},O=.12,Q={x0:-4.5,x1:.35,z0:.3,z1:3.9},Vt={x0:1,x1:3.9,z0:.45,z1:2.75,h:.55},Et={c:[2.45,0,1.6],a:.5},Ht={c:[2.45,0,4.55],r:.95,h:.26},Xo={c:[3.5,0,-.9]},Jt={x0:-7.5,x1:7.2,z0:-5.2,z1:6.4},tt=(1+Math.sqrt(5))/2;function de(t){let e=[];for(let f of[-1,1])for(let l of[-1,1])for(let u of[-1,1])e.push([f,l,u]);for(let f of[-1,1])for(let l of[-1,1])e.push([0,f/tt,l*tt]),e.push([f/tt,l*tt,0]),e.push([f*tt,0,l/tt]);let o=t/(2/tt),n=e.map(f=>f.map(l=>l*o)),s=[];for(let f of[-1,1])for(let l of[-1,1])s.push([f,0,l*tt],[0,f*tt,l],[f*tt,l,0]);let r=s.map(f=>{let l=Math.hypot(...f),u=f.map(d=>d/l),v=Math.max(...n.map(d=>d[0]*u[0]+d[1]*u[1]+d[2]*u[2])),m=n.map((d,w)=>[w,d[0]*u[0]+d[1]*u[1]+d[2]*u[2]]).filter(([,d])=>d>v-1e-6).map(([d])=>d);return{n:u,d:v,idx:m}}),c=r[0].n,i=new H.Quaternion().setFromUnitVectors(new H.Vector3(...c),new H.Vector3(0,-1,0)),a=new H.Quaternion().setFromAxisAngle(new H.Vector3(0,1,0),.31);i.premultiply(a);let h=f=>new H.Vector3(...f).applyQuaternion(i).toArray();n=n.map(h);for(let f of r)f.n=h(f.n);let p=Math.min(...n.map(f=>f[1]));n=n.map(f=>[f[0],f[1]-p,f[2]]);for(let f of r){let l=[0,1,2].map(d=>f.idx.reduce((w,E)=>w+n[E][d],0)/f.idx.length),u=new H.Vector3(...f.n),v=new H.Vector3(...n[f.idx[0]]).sub(new H.Vector3(...l)).normalize(),m=new H.Vector3().crossVectors(u,v);f.idx.sort((d,w)=>{let E=new H.Vector3(...n[d]).sub(new H.Vector3(...l)),M=new H.Vector3(...n[w]).sub(new H.Vector3(...l));return Math.atan2(E.dot(m),E.dot(v))-Math.atan2(M.dot(m),M.dot(v))}),f.c=l,f.d=u.dot(new H.Vector3(...l))}return{V:n,faces:r,height:Math.max(...n.map(f=>f[1]))}}function _e(){let t=new J,e=C(14271394,D.DESK);return t.box(Jt.x0,-.45,Jt.z0,Jt.x1,0,Jt.z1,e,{top:C(15391940,D.DESK)}),t}function Ue(){let t=new J,{x0:e,x1:o,z0:n,z1:s}=Q;t.box(e,0,n,o,.04,s,C(9209210,D.CLOTH),{ao:.85}),t.box(e+.06,.04,n+.05,o-.04,O,s-.05,C(15722970,D.PAGES),{skip:["py"]});let r=22;for(let c=0;c<r;c++){let i=n+.25+c/(r-1)*(s-n-.5),a=e+.22,h=.16,p=.022,f=10;for(let l=0;l<f;l++){let u=Math.PI*(.15+l/f*.85),v=Math.PI*(.15+(l+1)/f*.85),m=[a+Math.cos(u)*h,O*.5+Math.sin(u)*h,i],d=[a+Math.cos(v)*h,O*.5+Math.sin(v)*h,i];Zo(t,m,d,p,C(9341572,D.PLAIN))}}return t}function Zo(t,e,o,n,s){let r=new H.Vector3(...e),i=new H.Vector3(...o).clone().sub(r),a=i.length(),h=new H.Quaternion().setFromUnitVectors(new H.Vector3(0,1,0),i.normalize()),p=new H.Matrix4().compose(r,h,new H.Vector3(1,1,1));t.push(p),t.cyl(0,0,0,n,a,6,s,{caps:[!1,!1],rim:[0,0]}),t.pop()}function qe(){let t=new J,{x0:e,x1:o,z0:n,z1:s,h:r}=Vt,c=C(12555380,D.CLOTH),i=.05;t.box(e,0,n,o,i,s,c,{ao:.85}),t.box(e+.04,i,n+.05,o-.06,r-i,s-.05,C(15525072,D.PAGES),{skip:["py","nx"]}),t.box(e,r-i,n,o,r,s,c),t.push(wt.chain(wt.T(e+.02,r/2,(n+s)/2),wt.RX(Math.PI/2),wt.RZ(0)));let a=10;for(let h=0;h<a;h++){let p=Math.PI/2+h/a*Math.PI,f=Math.PI/2+(h+1)/a*Math.PI,l=r/2,u=(s-n)/2,v=[Math.cos(p)*l*.5,-u,Math.sin(p)*l],m=[Math.cos(f)*l*.5,-u,Math.sin(f)*l],d=[Math.cos(f)*l*.5,u,Math.sin(f)*l],w=[Math.cos(p)*l*.5,u,Math.sin(p)*l];t.quad(v,m,d,w,c,[h===0?1:0,1,h===a-1?1:0,1])}return t.pop(),t.box(e+.5,r,n+.6,e+1.6,r+.004,s-.6,C(11041118,D.CLOTH)),t}function Ge(){let t=new J,e=de(Et.a),[o,,n]=Et.c,s=Vt.h,r=C(15131094,D.STONE);for(let c of e.faces){let i=c.idx.map(a=>[e.V[a][0]+o,e.V[a][1]+s,e.V[a][2]+n]);t.poly(i,r)}return{b:t,D:e}}var te=[[0,.03],[.6,.035],[.78,.04],[.8,0],[.86,0],[.92,.09],[.98,.18],[1.02,.25],[1.01,.275],[.97,.255],[.9,.2],[.8,.13],[.65,.085],[.4,.065],[0,.06]],Rt=8;function $e(){let t=new J,[e,,o]=Ht.c,n=te.map(([c,i])=>[c*Ht.r,i]),s=n.slice(0,Rt+1),r=n.slice(Rt);return t.lathe(e,0,o,s,48,C(12105133,D.PEWTER),{edges:s.map((c,i)=>i===4||i===Rt)}),t.lathe(e,0,o,r.slice().reverse(),48,C(12894649,D.PEWTER),{edges:r.map(()=>!1)}),t}function Ke(){let t=new J,e=new H.Vector3(-3.9,.06,-.75),n=new H.Vector3(-1.3,.06,-.15).clone().sub(e),s=n.length(),r=new H.Quaternion().setFromUnitVectors(new H.Vector3(0,1,0),n.clone().normalize());return t.push(new H.Matrix4().compose(e,r,new H.Vector3(1,1,1))),t.push(wt.RY(.3)),t.cyl(0,0,0,.06,s-.34,6,C(7307107,D.PENCIL)),t.cyl(0,s-.34,0,.06,s-.06,6,C(14467994,D.WOOD),{r1:.012,caps:[!1,!1]}),t.cyl(0,s-.06,0,.012,s,6,C(3815734,D.PLAIN),{r1:0,caps:[!1,!1]}),t.cyl(0,-.12,0,.062,0,12,C(11577752,D.PLAIN)),t.cyl(0,-.22,0,.055,-.12,12,C(13209478,D.PLAIN)),t.pop(),t.pop(),t}function Ye(){let t=new J,[e,,o]=Xo.c,n=[[0,0],[.34,0],[.36,.03],[.36,.36],[.33,.42],[.2,.47],[.12,.5],[.12,.6],[.14,.62],[.14,.66],[.11,.67]];t.lathe(e,0,o,n,28,C(5069411,D.PLAIN),{edges:n.map((r,c)=>c===1||c===4||c===7||c===9)}),t.cyl(e,.66,o,.1,.78,14,C(11569762,D.WOOD)),t.push(wt.T(e,0,o));let s=10;for(let r=0;r<s;r++){let c=.15+r/s*1.4,i=.15+(r+1)/s*1.4,a=.365;t.quad([Math.cos(c)*a,.1,Math.sin(c)*a],[Math.cos(i)*a,.1,Math.sin(i)*a],[Math.cos(i)*a,.28,Math.sin(i)*a],[Math.cos(c)*a,.28,Math.sin(c)*a],C(15261900,D.PLAIN),[1,r===s-1?1:0,1,r===0?1:0],{n:[[Math.cos(c),0,Math.sin(c)],[Math.cos(i),0,Math.sin(i)],[Math.cos(i),0,Math.sin(i)],[Math.cos(c),0,Math.sin(c)]]})}return t.pop(),t}var ee=Math.sqrt(3)/2,W=[[1,0],[.5,ee],[-.5,ee],[-1,0],[-.5,-ee],[.5,-ee]],Jo=[[0,0],[.035,.07],[.045,.15],[.025,.23],[-.025,.28],[-.05,.33],[-.015,.36],[0,.41],[.05,.41],[.09,.44],[.13,.4],[.15,.32],[.17,.22],[.21,.12],[.26,.04],[.29,-.06],[.28,-.18],[.28,-.32],[.33,-.45],[.42,-.54],[.52,-.57],[.62,-.53],[.68,-.43],[.69,-.3],[.68,-.18],[.69,-.07],[.74,.02],[.82,.06],[.9,.06],[.96,.03],[1,0]],t0=[[0,0],[.04,-.07],[.06,-.16],[.05,-.25],[.02,-.3],[.03,-.35],[.08,-.36],[.11,-.4],[.15,-.37],[.19,-.37],[.2,-.3],[.21,-.21],[.24,-.11],[.29,-.03],[.34,.04],[.37,.14],[.44,.24],[.55,.31],[.68,.35],[.82,.35],[.94,.31],[1.03,.25],[1.07,.2],[.99,.19],[.87,.2],[.76,.17],[.68,.11],[.65,.03],[.72,0],[.86,0],[1,0]],e0=[[0,0],[.1,.04],[.2,.06],[.29,.05],[.35,.03],[.38,.1],[.42,.19],[.47,.26],[.53,.3],[.58,.33],[.6,.38],[.65,.37],[.68,.4],[.72,.36],[.74,.31],[.72,.25],[.67,.2],[.64,.13],[.63,.05],[.67,-.01],[.71,-.07],[.73,-.16],[.72,-.24],[.74,-.3],[.79,-.31],[.83,-.35],[.87,-.31],[.9,-.3],[.9,-.22],[.91,-.13],[.94,-.05],[1,0]],ve=(t,e,[o,n])=>{let s=e[0]-t[0],r=e[1]-t[1];return[t[0]+o*s+n*r,t[1]+o*r-n*s]};function xe(t,e,o){let n=Math.sin(o),s=Math.cos(o),r=t[0]-e[0],c=t[1]-e[1];return[e[0]+s*r-n*c,e[1]+n*r+s*c]}function Me(t,e){let o=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],r=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let a=0;a<e;a++){let h=a/e,p=h*h,f=p*h,l=(u,v,m,d)=>.5*(2*v+(-u+m)*h+(2*u-5*v+4*m-d)*p+(-u+3*v-3*m+d)*f);o.push([l(s[0],r[0],c[0],i[0]),l(s[1],r[1],c[1],i[1])])}}return o.push(t[t.length-1].slice()),o}var Ot=2*Math.PI/3;function o0(t=10){let e=Me(Jo.map(p=>ve(W[0],W[1],p)),t),o=Me(t0.map(p=>ve(W[2],W[3],p)),t),n=Me(e0.map(p=>ve(W[4],W[5],p)),t),s=e,r=o.map(p=>xe(p,W[2],Ot)).reverse(),c=o,i=n.map(p=>xe(p,W[4],Ot)).reverse(),a=n,h=e.map(p=>xe(p,W[0],Ot)).reverse();return[s,r,c,i,a,h]}function Wt(t=10){let e=[];for(let o of o0(t))for(let n=0;n<o.length-1;n++)e.push(o[n]);return e}function n0(t,e){return{r:(t.r+e.r)%3,t:X(t,e.t)}}function X(t,e){let o=t.r*Ot,n=Math.sin(o),s=Math.cos(o);return[s*e[0]-n*e[1]+t.t[0],n*e[0]+s*e[1]+t.t[1]]}function s0(t,e){let o=e*Ot,n=Math.sin(o),s=Math.cos(o);return{r:(e%3+3)%3,t:[t[0]-(s*t[0]-n*t[1]),t[1]-(n*t[0]+s*t[1])]}}function Qe(t){let e=new Map,o=c=>`${Math.round(c[0]*1e3)},${Math.round(c[1]*1e3)}`,n={r:0,t:[0,0]},s=[n];e.set(o([0,0]),n);let r=[];for(;s.length;){let c=s.shift();r.push(c);for(let i of[0,2,4]){let a=X(c,W[i]);for(let h of[1,2]){let p=n0(s0(a,h),c),f=X(p,[0,0]);if(Math.hypot(f[0],f[1])>t)continue;let l=o(f);e.has(l)||(e.set(l,p),s.push(p))}}}return r}var j=[[-1.215,.06],[-1.2,.22],[-1.13,.42],[-.98,.55],[-.76,.52],[-.5,.36],[-.2,.16],[.1,-.03],[.43,-.24],[.68,-.37],[.9,-.48],[1.1,-.58],[1.24,-.66]],lt=[{name:"left front",joint:[.6,-.02],foot:[1.33,.3],phase:0},{name:"right front",joint:[.3,-.5],foot:[.18,-1.22],phase:Math.PI},{name:"left hind",joint:[-.28,.6],foot:[-.42,1.22],phase:Math.PI},{name:"right hind",joint:[-.62,-.02],foot:[-1.24,-.33],phase:0}],oe=[[1.06,-.46],[.95,-.69]];var It=[.955,.935,.885],q=(t,e=1)=>`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`,At=t=>[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255],we={L:[[.97,.955,.915],[.66,.64,.6],[.2,.19,.17]],C:[At(15324582),At(9412730),At(8410431)],markL:[[.25,.23,.2],[.18,.17,.15],[.93,.91,.86]],markC:[At(9071164),At(4149043),At(15124378)]},Ee=[.12,.11,.1],ge=[.42,.41,.39],gt=(t,e,o)=>{let n=Math.min(1,Math.max(0,(o-t)/(e-t)));return n*n*(3-2*n)};function a0(t=60){let e=[0];for(let r=1;r<j.length;r++)e.push(e[r-1]+Math.hypot(j[r][0]-j[r-1][0],j[r][1]-j[r-1][1]));let o=e[e.length-1],n=[],s=0;for(let r=0;r<=t;r++){let c=r/t*o;for(;s<e.length-2&&e[s+1]<c;)s++;let i=(c-e[s])/(e[s+1]-e[s]);n.push([j[s][0]+(j[s+1][0]-j[s][0])*i,j[s][1]+(j[s+1][1]-j[s][1])*i,c/o])}return n}var jt=a0(80);function Xe(t,e,o,n,s,r,c,i={}){let a=new Path2D;o.forEach((u,v)=>{let m=e(u);v?a.lineTo(m[0],m[1]):a.moveTo(m[0],m[1])}),a.closePath();let h=i.noFill?0:gt(.28,.72,s),p=i.noFill?0:gt(.55,.95,s),f=we[r][n];h>0&&(t.fillStyle=q(f,h),t.fill(a),t.save(),t.clip(a),r==="L"&&n===1&&r0(t,a,c,h*.55),p>0&&c0(t,e,n,r,c,p),t.restore());let l=[0,1,2].map(u=>ge[u]+(Ee[u]-ge[u])*gt(.2,.8,s));return t.strokeStyle=q(l,.5+.5*gt(0,.6,s)),t.lineWidth=(.011+.006*s)*c,t.lineJoin="round",t.stroke(a),a}function r0(t,e,o,n){let s={x0:-1e5,y0:-1e5};t.strokeStyle=q([.25,.24,.22],n),t.lineWidth=Math.max(.8,o*.006);let r=Math.max(3,o*.03);t.beginPath();let c=t.canvas.width,i=t.canvas.height;for(let a=-i;a<c+i;a+=r)t.moveTo(a,0),t.lineTo(a+i,i);t.stroke()}function c0(t,e,o,n,s,r){let c=(n==="L"?we.markL:we.markC)[o],i=o===2;t.fillStyle=q(c,r*.8),t.beginPath();for(let l=0;l<jt.length;l+=1){let u=jt[l],v=u[2];if(v<.12||v>.8||l%7)continue;let m=jt[Math.max(0,l-1)],d=jt[Math.min(jt.length-1,l+1)],w=Math.atan2(d[1]-m[1],d[0]-m[0]),E=.07*(v<.35?.7+v:1.05-(v-.35)*.9),M=e([u[0],u[1]]),g=e([u[0]+Math.cos(w),u[1]+Math.sin(w)]),x=Math.atan2(g[1]-M[1],g[0]-M[0]);t.moveTo(M[0]+Math.cos(x)*E*s*.8,M[1]+Math.sin(x)*E*s*.8),t.ellipse(M[0],M[1],E*s*.8,E*s*.62,x,0,Math.PI*2)}t.fill(),t.fillStyle=q(c,r*.35);let a=Math.max(.6,s*.006);t.beginPath();for(let l=-16;l<=16;l++)for(let u=-16;u<=16;u++){let v=l*.085+(u&1)*.0425,m=u*.074;if(Math.abs(v)>1.35||Math.abs(m)>1.3)continue;let d=e([v,m]);t.moveTo(d[0]+a,d[1]),t.arc(d[0],d[1],a,0,Math.PI*2)}t.fill(),t.strokeStyle=q(i?[.92,.9,.85]:[.15,.14,.12],r*.75),t.lineWidth=Math.max(.8,s*.007),t.lineCap="round",t.beginPath();for(let l of lt){let u=l.foot[0]-l.joint[0],v=l.foot[1]-l.joint[1],m=Math.hypot(u,v),d=u/m,w=v/m,E=[l.foot[0]-d*.16,l.foot[1]-w*.16];for(let b of[-.5,0,.5]){let y=d*Math.cos(b)-w*Math.sin(b),T=d*Math.sin(b)+w*Math.cos(b),k=e([E[0]+y*.04,E[1]+T*.04]),R=e([E[0]+y*.12,E[1]+T*.12]);t.moveTo(k[0],k[1]),t.lineTo(R[0],R[1])}let M=[l.joint[0]+u*.45,l.joint[1]+v*.45],g=e([M[0]-w*.05,M[1]+d*.05]),x=e([M[0]+w*.05,M[1]-d*.05]);t.moveTo(g[0],g[1]),t.lineTo(x[0],x[1])}t.stroke();let h=e([1.24,-.64]),p=e([1.12,-.68]),f=e([1.02,-.74]);t.beginPath(),t.moveTo(h[0],h[1]),t.quadraticCurveTo(p[0],p[1],f[0],f[1]),t.stroke();for(let l of oe){let u=e(l);t.fillStyle=q(i?[.95,.93,.88]:[.98,.97,.94],r),t.beginPath(),t.arc(u[0],u[1],.045*s,0,Math.PI*2),t.fill(),t.strokeStyle=q(Ee,r),t.lineWidth=Math.max(.8,s*.008),t.stroke(),t.fillStyle=q(Ee,r),t.beginPath(),t.arc(u[0]+.008*s,u[1],.022*s,0,Math.PI*2),t.fill()}}function be(t,e){let{W:o,D:n,res:s,tiles:r,ring:c,toPage:i,centreDist:a,hero:h}=e,p=document.createElement("canvas");p.width=Math.round(o*s),p.height=Math.round(n*s);let f=p.getContext("2d");f.fillStyle=q(It),f.fillRect(0,0,p.width,p.height);let l=e.k*s;for(let u of r){let v=a(u),m=1-gt(e.rIn,e.rOut,v);if(m>.6||v>e.rOut+1.6)continue;let d=w=>{let E=i(X(u.pl,w));return[E[0]*s,E[1]*s]};f.beginPath(),W.forEach((w,E)=>{let M=d(w);E?f.lineTo(M[0],M[1]):f.moveTo(M[0],M[1])}),f.closePath(),f.strokeStyle=q(ge,.22*(1-m)*(1-gt(e.rOut,e.rOut+1.6,v))),f.lineWidth=Math.max(.7,l*.005),f.stroke()}for(let u of r){let v=a(u),m=1-gt(e.rIn,e.rOut,v);if(v>e.rOut+.6)continue;Xe(f,w=>{let E=i(X(u.pl,w));return[E[0]*s,E[1]*s]},c,u.pl.r,Math.max(.04,m),t,l,{noFill:u===h})}return p}var et=1.5;function ye(t,e,o,n=1024){let s=document.createElement("canvas");s.width=s.height=n;let r=s.getContext("2d");r.fillStyle=q(It),r.fillRect(0,0,n,n);let c=n/(2*et);return Xe(r,a=>[(a[0]+et)*c,(et-a[1])*c],e,o,1,t,c),s}var bt=Nt(St(),1);var i0=.5;function l0(t,e,o){let n=[0],s=t.length+(o?1:0);for(let h=1;h<s;h++){let p=t[h-1],f=t[h%t.length];n.push(n[h-1]+Math.hypot(f[0]-p[0],f[1]-p[1]))}let r=n[n.length-1],c=Math.max(2,Math.round(r/e)),i=[],a=0;for(let h=0;h<(o?c:c+1);h++){let p=h/c*r;for(;a<n.length-2&&n[a+1]<p;)a++;let f=(p-n[a])/(n[a+1]-n[a]||1),l=t[a],u=t[(a+1)%t.length];i.push([l[0]+(u[0]-l[0])*f,l[1]+(u[1]-l[1])*f])}return{pts:i,length:r}}function f0(t,e){let o=[];for(let n=0;n<t.length-1;n++){let s=t[Math.max(0,n-1)],r=t[n],c=t[n+1],i=t[Math.min(t.length-1,n+2)];for(let a=0;a<e;a++){let h=a/e,p=h*h,f=p*h,l=(u,v,m,d)=>.5*(2*v+(-u+m)*h+(2*u-5*v+4*m-d)*p+(-u+3*v-3*m+d)*f);o.push([l(s[0],r[0],c[0],i[0]),l(s[1],r[1],c[1],i[1])])}}return o.push(t[t.length-1].slice()),o}function h0(t){let e=f0(j,40),o=[0];for(let i=1;i<e.length;i++)o.push(o[i-1]+Math.hypot(e[i][0]-e[i-1][0],e[i][1]-e[i-1][1]));let n=[],s=0;for(let i=0;i<=o[o.length-1]+1e-9;i+=t){for(;s<o.length-2&&o[s+1]<i;)s++;let a=(i-o[s])/(o[s+1]-o[s]||1);n.push([e[s][0]+(e[s+1][0]-e[s][0])*a,e[s][1]+(e[s+1][1]-e[s][1])*a])}let r=(n.length-1)*t,c=n.map((i,a)=>{let h=n[Math.max(0,a-2)],p=n[Math.min(n.length-1,a+2)],f=p[0]-h[0],l=p[1]-h[1],u=Math.hypot(f,l);return[f/u,l/u]});return{pts:n,T:c,N:c.map(([i,a])=>[-a,i]),length:r,step:t}}function Ze(t,e,o){let n=!1;for(let s=0,r=t.length-1;s<t.length;r=s++){let c=t[s],i=t[r];c[1]>o!=i[1]>o&&e<(i[0]-c[0])*(o-c[1])/(i[1]-c[1])+c[0]&&(n=!n)}return n}function Je(t,e,o){let n=1/0;for(let s=0,r=t.length-1;s<t.length;r=s++){let c=t[r],i=t[s],a=i[0]-c[0],h=i[1]-c[1],p=((e-c[0])*a+(o-c[1])*h)/(a*a+h*h||1);p=Math.max(0,Math.min(1,p));let f=c[0]+p*a-e,l=c[1]+p*h-o;n=Math.min(n,f*f+l*l)}return Math.sqrt(n)}function u0(t){let e=t.length,o=1/0,n=1/0,s=-1/0,r=-1/0;for(let l of t)o=Math.min(o,l[0]),n=Math.min(n,l[1]),s=Math.max(s,l[0]),r=Math.max(r,l[1]);let c=Math.max(s-o,r-n)*20,i=(o+s)/2,a=(n+r)/2,h=t.concat([[i-c,a-c],[i,a+c],[i+c,a-c]]),p=(l,u,v)=>{let[m,d]=h[l],[w,E]=h[u],[M,g]=h[v],x=2*(m*(E-g)+w*(g-d)+M*(d-E)),b=((m*m+d*d)*(E-g)+(w*w+E*E)*(g-d)+(M*M+g*g)*(d-E))/x,y=((m*m+d*d)*(M-w)+(w*w+E*E)*(m-M)+(M*M+g*g)*(w-m))/x;return[b,y,(m-b)**2+(d-y)**2]},f=[[e,e+1,e+2,...p(e,e+1,e+2)]];for(let l=0;l<e;l++){let[u,v]=h[l],m=[],d=new Map;for(let w of f)if((u-w[3])**2+(v-w[4])**2<w[5])for(let[E,M]of[[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){let g=E<M?`${E},${M}`:`${M},${E}`;d.has(g)?d.delete(g):d.set(g,[E,M])}else m.push(w);for(let[w,E]of d.values())m.push([w,E,l,...p(w,E,l)]);f=m}return f.filter(l=>l[0]<e&&l[1]<e&&l[2]<e).map(l=>[l[0],l[1],l[2]])}function to(t,e,o){let n=0,s=1/0;for(let u=0;u<t.pts.length;u++){let v=(t.pts[u][0]-e)**2+(t.pts[u][1]-o)**2;v<s&&(s=v,n=u)}let r=t.step,c=n*r;for(let u=0;u<4;u++){let v=Math.min(t.pts.length-1.001,Math.max(0,c/r)),m=Math.floor(v),d=v-m,w=[t.pts[m][0]+(t.pts[m+1][0]-t.pts[m][0])*d,t.pts[m][1]+(t.pts[m+1][1]-t.pts[m][1])*d],E=[t.T[m][0]+(t.T[m+1][0]-t.T[m][0])*d,t.T[m][1]+(t.T[m+1][1]-t.T[m][1])*d],M=(e-w[0])*E[0]+(o-w[1])*E[1];c=Math.min((t.pts.length-1)*r,Math.max(0,c+M*.9))}let i=Math.min(t.pts.length-1.001,c/r),a=Math.floor(i),h=i-a,p=[t.pts[a][0]+(t.pts[a+1][0]-t.pts[a][0])*h,t.pts[a][1]+(t.pts[a+1][1]-t.pts[a][1])*h],f=[t.N[a][0]+(t.N[a+1][0]-t.N[a][0])*h,t.N[a][1]+(t.N[a+1][1]-t.N[a][1])*h],l=(e-p[0])*f[0]+(o-p[1])*f[1];return[c,l]}function eo(t){let e=l0(Wt(14),.018,!0).pts,o=e.map(x=>x.slice()),n=o.length,s=.04,r=3,c=()=>(r=r*16807%2147483647)/2147483647-.5;for(let x=-40;x<=40;x++)for(let b=-40;b<=40;b++){let y=b*s+(x&1)*s*.5+c()*.002,T=x*s*.866+c()*.002;Math.abs(y)>1.5||Math.abs(T)>1.5||Ze(e,y,T)&&(Je(e,y,T)<s*.55||o.push([y,T]))}let i=u0(o).filter(([x,b,y])=>{let T=(o[x][0]+o[b][0]+o[y][0])/3,k=(o[x][1]+o[b][1]+o[y][1])/3;return Ze(e,T,k)}),a=o.length,h=new Float32Array(a);for(let x=0;x<a;x++)h[x]=x<n?0:Je(e,o[x][0],o[x][1]);let p=h0(t),f=new Float32Array(a),l=new Float32Array(a);for(let x=0;x<a;x++){let[b,y]=to(p,o[x][0],o[x][1]);f[x]=b,l[x]=y}let u=new Float32Array(a);for(let x=0;x<a;x++){if(x<n)continue;let b=h[x],y=f[x]/p.length,T=.035*Math.exp(-((l[x]/.07)**2))*Math.min(1,b/.12)*(y>.15&&y<.9?1:.4),k=0;for(let R of oe)k+=.075*Math.exp(-(((o[x][0]-R[0])**2+(o[x][1]-R[1])**2)/.05**2));u[x]=i0*Math.sqrt(b)*(b<.03?.75+b/.03*.25:1)+T+k*Math.min(1,b/.05)}let v=Array.from({length:a},()=>new Set);for(let[x,b,y]of i)v[x].add(b).add(y),v[b].add(x).add(y),v[y].add(x).add(b);for(let x=0;x<10;x++){let b=u.slice();for(let y=n;y<a;y++){let T=0,k=0;for(let R of v[y])T+=u[R],k++;k&&(b[y]=u[y]*.5+T/k*.5)}u=b}let m=new Int8Array(a).fill(-1),d=new Float32Array(a),w=lt.map(x=>to(p,x.joint[0],x.joint[1]));for(let x=0;x<a;x++){let[b,y]=o[x],T=-1,k=1/0,R=0;lt.forEach((z,Y)=>{let V=z.foot[0]-z.joint[0],it=z.foot[1]-z.joint[1],zt=V*V+it*it,A=((b-z.joint[0])*V+(y-z.joint[1])*it)/zt,N=Math.max(0,Math.min(1,A)),P=Math.hypot(z.joint[0]+V*N-b,z.joint[1]+it*N-y);P<k&&(k=P,T=Y,R=A)}),T>=0&&R>-.12&&k<Math.abs(l[x])*.95+.02&&k<.32&&(m[x]=T,d[x]=Math.min(1,Math.max(0,(R+.1)/.5))**1.5)}let E=new Float32Array(a*2);for(let x=0;x<a;x++)E[x*2]=(o[x][0]+et)/(2*et),E[x*2+1]=(o[x][1]+et)/(2*et);let M=[];for(let[x,b,y]of i)(o[b][0]-o[x][0])*(o[y][1]-o[x][1])-(o[b][1]-o[x][1])*(o[y][0]-o[x][0])>0?M.push(x,b,y):M.push(x,y,b);let g=new bt.BufferGeometry;return g.setAttribute("position",new bt.Float32BufferAttribute(new Float32Array(a*3),3)),g.setAttribute("normal",new bt.Float32BufferAttribute(new Float32Array(a*3),3)),g.setAttribute("uv",new bt.Float32BufferAttribute(E,2)),g.setAttribute("aDist",new bt.Float32BufferAttribute(h,1)),g.setIndex(M),{geo:g,n:a,nb:n,pts:o,ring:e,S:f,Lat:l,h:u,dist:h,legIdx:m,legW:d,joints:w,spine:p,tris:i}}var yt=.004,G=(t,e)=>[t[0]-e[0],t[1]-e[1]],Lt=(t,e)=>[t[0]+e[0],t[1]+e[1]],ot=(t,e)=>[t[0]*e,t[1]*e],Se=t=>Math.hypot(t[0],t[1]),_t=t=>ot(t,1/(Se(t)||1));function p0(t,e,o){let n=[t[0]];for(let s=1;s<t.length-1;s++){let r=t[s-1],c=t[s],i=t[s+1],a=_t(G(c,r)),h=_t(G(i,c)),p=a[0]*h[1]-a[1]*h[0],f=Math.max(-1,Math.min(1,a[0]*h[0]+a[1]*h[1])),l=Math.acos(f);if(l<.001){n.push(c);continue}let v=(p>0?o:e)*Math.tan(l/2);v=Math.min(v,Se(G(c,r))*.48,Se(G(i,c))*.48);let m=v/Math.tan(l/2),d=G(c,ot(a,v)),w=Lt(c,ot(h,v)),E=p>0?[-a[1],a[0]]:[a[1],-a[0]],M=Lt(d,ot(E,m)),g=Math.atan2(d[1]-M[1],d[0]-M[0]),x=Math.atan2(w[1]-M[1],w[0]-M[0]),b=x-g;for(;b>Math.PI;)b-=2*Math.PI;for(;b<-Math.PI;)b+=2*Math.PI;let y=Math.max(2,Math.ceil(Math.abs(b)*m/.01));for(let T=0;T<=y;T++){let k=g+b*T/y;n.push([M[0]+Math.cos(k)*m,M[1]+Math.sin(k)*m])}}return n.push(t[t.length-1]),n}function oo(t,e,o=2,n=!0){let s=[0];for(let h=1;h<t.length;h++){let p=0;for(let f=0;f<o;f++)p+=(t[h][f]-t[h-1][f])**2;s.push(s[h-1]+Math.sqrt(p))}let r=s[s.length-1],c=Math.floor(r/e+1e-9),i=[],a=0;for(let h=0;h<=c;h++){let p=h*e;for(;a<s.length-2&&s[a+1]<p;)a++;let f=(p-s[a])/(s[a+1]-s[a]||1);i.push(t[a].map((l,u)=>l+(t[a+1][u]-l)*f))}return n&&r-c*e>e*.25&&i.push(t[t.length-1].slice()),i}function m0(t){let e=de(Et.a),[o,,n]=Et.c,s=Vt.h,r=[[-20,-20],[20,-20],[20,20],[-20,20]];for(let f of e.faces){let l=f.n[0],u=f.n[1],v=f.n[2],m=f.d+l*o+u*s+v*n-v*t,d=E=>l*E[0]+u*E[1]<=m+1e-9,w=[];for(let E=0;E<r.length;E++){let M=r[E],g=r[(E+1)%r.length],x=d(M),b=d(g);if(x&&w.push(M),x!==b){let y=l*M[0]+u*M[1]-m,T=l*g[0]+u*g[1]-m,k=y/(y-T);w.push([M[0]+(g[0]-M[0])*k,M[1]+(g[1]-M[1])*k])}}r=w}let c=r.filter(f=>Math.abs(f[1]-s)<1e-6),i=Math.min(...c.map(f=>f[0])),a=Math.max(...c.map(f=>f[0])),h=r.findIndex(f=>Math.abs(f[1]-s)<1e-6&&Math.abs(f[0]-a)<1e-9),p=[];for(let f=0;f<r.length;f++){let l=r[(h+f)%r.length];if(p.push(l),Math.abs(l[1]-s)<1e-6&&Math.abs(l[0]-i)<1e-9&&f>0)break}return{chain:p.reverse(),xl:i,xr:a,top:Math.max(...r.map(f=>f[1]))}}function d0(t,e){let o=Vt,n=o.h,s=O,r=[[t,s],[Q.x1,s],[Q.x1,0]],c=o.x0+.02,i=.1375,a=n/2;r.push([c-i,0],[c-i,a]);for(let p=7;p<12;p++){let f=p/12*Math.PI;r.push([c-i*Math.sin(f),a-a*Math.cos(f)])}r.push([c,n]);let h=m0(Et.c[2]);for(let p of h.chain)r.push(p);return r.push([o.x1,n],[o.x1,n-.05],[o.x1-.06,n-.05],[o.x1-.06,.05],[o.x1,.05],[o.x1,0],[e,0]),{P:r.map(([p,f])=>[p-t,f]),top:h.top}}function v0(t,e){let o=Ht.c[0],n=Ht.r,s=te.slice(4,Rt+1),r=te.slice(Rt),c=[[t,0]];for(let[i,a]of s)c.push([o+i*n,a]);for(let[i,a]of r.slice(1))c.push([o+i*n,a]);for(let[i,a]of r.slice().reverse().slice(1))c.push([o-i*n,a]);for(let[i,a]of s.slice().reverse().slice(1))c.push([o-i*n,a]);return c.push([e,0]),c.map(([i,a])=>[t-i,a])}function Te(t,e,o,n=.07,s=.15){let r=p0(o,n,s),c=[],i=oo(r,yt/2);for(let a=0;a<i.length;a++){let h=i[Math.max(0,a-1)],p=i[Math.min(i.length-1,a+1)],f=_t(G(p,h)),l=[-f[1],f[0]];c.push([t[0]+e[0]*i[a][0],i[a][1],t[1]+e[1]*i[a][0],e[0]*l[0],l[1],e[1]*l[0]])}return c}function ft(t,e){return t.map(([o,n])=>[o,e,n,0,1,0])}function Re(t,e,o,n,s=200){let r=[];for(let c=0;c<=s;c++){let i=c/s,a=1-i;r.push([a*a*a*t[0]+3*a*a*i*e[0]+3*a*i*i*o[0]+i*i*i*n[0],a*a*a*t[1]+3*a*a*i*e[1]+3*a*i*i*o[1]+i*i*i*n[1]])}return r}function ke(t,e,o,n){let s=G(t,ot(e,n)),r=Lt(t,ot(o,n));return Re(s,Lt(s,ot(e,n*.552)),G(r,ot(o,n*.552)),r,60)}var x0={zA:Et.c[2],xA0:-.35,xC1:4.75,zC:Ht.c[2],xD:-1.05,zD1:3.2,r:.55};function no(t){let e=x0,o=[],n={};o.push(ft(t,O));let s=t[t.length-1],r=t[t.length-6],c=_t(G(s,r)),i=[e.xA0,e.zA];o.push(ft(Re(s,Lt(s,ot(c,.35)),G(i,[.35,0]),i),O));let a=[e.xC1,e.zA],h=d0(e.xA0,e.xC1-e.r),p=Te([e.xA0,e.zA],[1,0],h.P);n.topY=h.top,o.push(p),o.push(ft(ke(a,[1,0],[0,1],e.r),0));let f=[e.xC1,e.zC];o.push(ft([[a[0],a[1]+e.r],[f[0],f[1]-e.r]],0)),o.push(ft(ke(f,[0,1],[-1,0],e.r),0));let l=[e.xD,e.zC],u=v0(f[0]-e.r,l[0]+e.r);o.push(Te([f[0]-e.r,e.zC],[-1,0],u,.05,.12)),o.push(ft(ke(l,[-1,0],[0,-1],e.r),0));let v=[e.xD,e.zD1],m=l[1]-e.r,d=[[0,0],[m-Q.z1,0],[m-Q.z1,O],[m-v[1],O]];o.push(Te([e.xD,m],[0,-1],d));let w=t[0],E=t[5],M=_t(G(E,w));o.push(ft(Re(v,Lt(v,[0,-.6]),G(w,ot(M,.6)),w),O)),o.push(ft(t,O));let g=[];for(let A of o)for(let N of A){let P=g[g.length-1];P&&Math.hypot(N[0]-P[0],N[1]-P[1],N[2]-P[2])<1e-6||g.push(N)}let x=t.length,b=g.slice(0,x),y=g.slice(g.length-x),T=oo(g.slice(x-1,g.length-x+1),yt,3,!1),k=b.concat(T.slice(1,T.length-1),y),R=k.length,z=new Float32Array(R*3),Y=new Float32Array(R*3),V=new Float32Array(R*3),it=new Float32Array(R*3);for(let A=0;A<R;A++){let N=k[Math.max(0,A-2)],P=k[Math.min(R-1,A+2)],B=P[0]-N[0],mt=P[1]-N[1],dt=P[2]-N[2],ie=Math.hypot(B,mt,dt)||1;B/=ie,mt/=ie,dt/=ie;let vt=k[A][3],xt=k[A][4],Mt=k[A][5],le=vt*B+xt*mt+Mt*dt;vt-=le*B,xt-=le*mt,Mt-=le*dt;let fe=Math.hypot(vt,xt,Mt)||1;vt/=fe,xt/=fe,Mt/=fe;let Fo=xt*dt-Mt*mt,Do=Mt*B-vt*dt,zo=vt*mt-xt*B;z.set([k[A][0],k[A][1],k[A][2]],A*3),Y.set([B,mt,dt],A*3),it.set([vt,xt,Mt],A*3),V.set([Fo,Do,zo],A*3)}for(let A of[it,V]){let N=A.slice();for(let P=2;P<R-2;P++)for(let B=0;B<3;B++)A[P*3+B]=(N[(P-2)*3+B]+N[(P-1)*3+B]*2+N[P*3+B]*3+N[(P+1)*3+B]*2+N[(P+2)*3+B])/9}let zt=0;for(let A=0;A<R;A++)z[A*3+1]>z[zt*3+1]&&(zt=A);return n.top=zt*yt,{pos:z,T:Y,B:V,N:it,n:R,length:(R-1)*yt,marks:n}}function so(t,e,o){let n=Math.min(t.n-1.0001,Math.max(0,e/yt)),s=Math.floor(n),r=n-s;for(let c of["pos","T","B","N"]){let i=t[c],a=o[c];a[0]=i[s*3]+(i[s*3+3]-i[s*3])*r,a[1]=i[s*3+1]+(i[s*3+4]-i[s*3+1])*r,a[2]=i[s*3+2]+(i[s*3+5]-i[s*3+2])*r}return o}function ao(t,e){let o=document.getElementById("frame"),n=()=>{let r=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),i=document.getElementById("controls"),a=(c?c.offsetHeight:0)+6+13,h=(i?i.offsetHeight:0)+8+13,p=window.innerWidth-r*2,f=window.innerHeight-a-h,l=f,u=l*t;u>p&&(u=p,l=u/t),u=Math.max(160,Math.floor(u)),l=Math.max(120,Math.floor(l)),o.style.width=`${u}px`,o.style.height=`${l}px`,o.style.top=`${a+Math.max(0,(f-l)/2)}px`,e?.(u,l)};return window.addEventListener("resize",n),n(),n}function ro(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(s))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function co(t,e,o){let n=s=>{for(let[r,c]of t)r.setAttribute("aria-pressed",String(c===s));e(s)};for(let[s,r]of t)s.addEventListener("click",()=>n(r));return o!==void 0&&n(o),n}function io(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function lo(t,e=!0){let o=document.getElementById("btn-play"),n=s=>{e=s,o&&(o.setAttribute("aria-pressed",String(!s)),o.querySelector("span").textContent=s?"Pause":"Play",o.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return o?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function fo(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function ho(){document.body.classList.add("ready")}var M0=performance.now(),yo={},pt=t=>{yo[t]=Math.round(performance.now()-M0)},w0=39/31,K=.42,uo=[-.95,1.7],Dt=document.getElementById("scene"),Xt=new S.WebGLRenderer({canvas:Dt,antialias:!0});Xt.setPixelRatio(Math.min(window.devicePixelRatio||1,2));Xt.setClearColor(15525333,1);var Zt=new S.Scene,Kt=Ve(),E0=We(Kt),g0=Xt.capabilities.getMaxAnisotropy();function kt(t,e=E0){let o=new S.Mesh(t.build(),e);return o.frustumCulled=!1,Zt.add(o),o}kt(_e());kt(Ue());kt(qe());kt(Ge().b);kt($e());kt(Ke());kt(Ye());pt("desk");var To=Qe(9).map(t=>({pl:t,c:X(t,[0,0])})),ko=-32*(Math.PI/180),ct=null,po=1/0;for(let t of To){if(t.pl.r!==1)continue;let e=t.pl.r*(2*Math.PI/3)+ko,o=Math.hypot(t.c[0],t.c[1]),n=Math.atan2(t.c[1],t.c[0])-e;n=Math.atan2(Math.sin(n),Math.cos(n));let s=Math.abs(o-4.3)+Math.abs(n)*2.5;s<po&&(po=s,ct=t)}var So=-ko-ct.pl.r*(2*Math.PI/3),mo=Math.cos(So),vo=Math.sin(So),Ae=t=>[mo*t[0]-vo*t[1],-(vo*t[0]+mo*t[1])],xo=X(ct.pl,[1.24,-.66]),Mo=[uo[0]-K*Ae(xo)[0],uo[1]-K*Ae(xo)[1]],Ce=t=>{let e=Ae(t);return[Mo[0]+K*e[0],Mo[1]+K*e[1]]},ne=t=>Ce(X(ct.pl,t)),L={x0:Q.x0+.06,z0:Q.z0+.05,x1:Q.x1-.04,z1:Q.z1-.05};L.W=L.x1-L.x0;L.D=L.z1-L.z0;var ae=Wt(10),b0=To.filter(t=>ae.every(e=>{let o=Ce(X(t.pl,e));return o[0]>L.x0+.08&&o[0]<L.x1-.08&&o[1]>L.z0+.08&&o[1]<L.z1-.08})),qt={W:L.W,D:L.D,res:2048/L.W,k:K,tiles:b0,ring:ae,hero:ct,rIn:2.6,rOut:5,centreDist:t=>Math.hypot(t.c[0],t.c[1]),toPage:t=>{let e=Ce(t);return[e[0]-L.x0,e[1]-L.z0]}},He=1-$(qt.rIn,qt.rOut,qt.centreDist(ct));function re(t){let e=new S.CanvasTexture(t);return e.colorSpace=S.NoColorSpace,e.anisotropy=g0,e.generateMipmaps=!0,e.minFilter=S.LinearMipmapLinearFilter,e}pt("layout");var y0=be("L",qt);pt("pageL");var T0=be("C",qt);pt("pageC");var k0=he(Kt,re(y0),re(T0));{let t=new S.BufferGeometry,e=O+4e-4;t.setAttribute("position",new S.Float32BufferAttribute([L.x0,e,L.z0,L.x0,e,L.z1,L.x1,e,L.z1,L.x1,e,L.z0],3)),t.setAttribute("normal",new S.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3)),t.setAttribute("uv",new S.Float32BufferAttribute([0,1,0,0,1,0,1,1],2)),t.setAttribute("aDist",new S.Float32BufferAttribute([1,1,1,1],1)),t.setIndex([0,1,2,0,2,3]);let o=new S.Mesh(t,k0);o.frustumCulled=!1,Zt.add(o)}var _=eo(yt/K);pt("lizard");var Yt=_.spine.length,S0=_.spine.pts.map(t=>ne(t)),ut=no(S0);pt("path");var Tt=he(Kt,re(ye("L",ae,ct.pl.r)),re(ye("C",ae,ct.pl.r)),{contourStep:.05,uvScale:2*et*K});{let t=(c,i,a)=>$(c,i,a),e=[.42,.41,.39],o=[.12,.11,.1],n=t(.2,.8,He),s=.5+.5*t(0,.6,He),r=e.map((c,i)=>c+(o[i]-c)*n);Tt.uniforms.uSketchLine.value.set(...r.map((c,i)=>It[i]+(c-It[i])*s)),Tt.uniforms.uSketchPaper.value.set(...It),Tt.uniforms.uLineW.value=(.011+.006*He)/2}pt("hero");var Fe=new S.Mesh(_.geo,Tt);Fe.frustumCulled=!1;Fe.renderOrder=2;Zt.add(Fe);var R0=.62,H0=.42,Pt=3.2,Gt=Yt*K,st=ut.length,$t=Math.min(st-1,ut.marks.top+Yt*K*.5),Ct=(()=>{let t=[0],e=[Gt],o=0,n=.004,s=!1;for(let r=Gt;r<st;r+=n){let c=(a,h)=>Math.max(.22,Math.min(1,a/h)),i=R0*c(r-Gt,.5)*c(st-r,.6)*(Math.abs(r-$t)<.45?Math.max(.25,Math.abs(r-$t)/.45):1);o+=n/i,!s&&r>=$t&&(o+=Pt,s=!0,t.push(o),e.push(r)),t.push(o),e.push(Math.min(st,r+n))}return{T:t,U:e,dur:o}})();function A0(t){let{T:e,U:o}=Ct;if(t<=0)return o[0];if(t>=Ct.dur)return o[o.length-1];let n=0,s=e.length-1;for(;s-n>1;){let c=n+s>>1;e[c]<=t?n=c:s=c}let r=(t-e[n])/(e[s]-e[n]||1);return o[n]+(o[s]-o[n])*r}var Qt=[["rest",1.4,"a pencil outline in the drawing"],["fill",2.2,"the drawing is finished"],["relief",2.6,"shaded, it rises in low relief"],["rise",1.8,"a solid body, the outline its footprint"],["walk",Ct.dur,"walking over the desk"],["settle",1,"back in its place"],["sink",2.6,"flattening into the page"],["unfill",1.8,"only an outline again"]],Ie=0;for(let t of Qt)t.start=Ie,Ie+=t[1];var se=Ie;function $(t,e,o){let n=Math.min(1,Math.max(0,(o-t)/(e-t)));return n*n*(3-2*n)}function I0(t){t=(t%se+se)%se;let e=Qt[0];for(let s of Qt)t>=s.start&&(e=s);let o=(t-e.start)/e[1],n={fill:0,relief:0,u:Gt,phase:e,pauseT:-1};switch(e[0]){case"rest":break;case"fill":n.fill=$(0,1,o);break;case"relief":n.fill=1,n.relief=.35*$(0,1,o);break;case"rise":n.fill=1,n.relief=.35+.65*$(0,1,o);break;case"walk":{n.fill=1,n.relief=1;let s=o*Ct.dur;n.u=A0(s);let r=s-Ct.T[Ct.U.findIndex(c=>c>=$t)];Math.abs(n.u-$t)<1e-4&&r>=0&&r<=Pt&&(n.pauseT=r);break}case"settle":n.fill=1,n.relief=1,n.u=st;break;case"sink":n.fill=1,n.relief=1-$(0,1,o),n.u=st;break;case"unfill":n.fill=1-$(0,1,o),n.u=st;break}return n}var nt={pos:[0,0,0],T:[0,0,0],B:[0,0,0],N:[0,0,0]},wo=_.geo.getAttribute("position"),Ut=Yt*.79,L0=lt.map((t,e)=>_.joints[e][1]>0?-1:1);function P0(t){let e=t.u>=st-1e-6?st:t.u,o=Math.max(0,e-Gt),n=2*Math.PI*o/H0,s=$(0,.3,o)*$(0,.35,st-e)*(t.pauseT>=0?0:1),r=.38*s,c=t.pauseT>=0?.55*Math.sin(t.pauseT/Pt*Math.PI*2)*$(0,.5,t.pauseT)*$(Pt,Pt-.5,t.pauseT):0,i=t.pauseT>=0?.12*Math.sin(t.pauseT/Pt*Math.PI):0,a=wo.array;for(let h=0;h<_.n;h++){let p=_.S[h],f=_.Lat[h],l=_.h[h],u=_.legIdx[h];if(u>=0&&r>0){let d=lt[u],w=_.joints[u],E=_.legW[h],M=n+d.phase,g=L0[u]*r*Math.sin(M)*E,x=p-w[0],b=f-w[1],y=Math.cos(g),T=Math.sin(g);p=w[0]+x*y-b*T,f=w[1]+x*T+b*y,l+=.09*E*Math.max(0,Math.cos(M))*s}if(f+=.05*s*Math.sin(n)*Math.cos(2*Math.PI*(p/Yt-.45)),p>Ut&&(c||i)){let d=$(Ut,Ut+.3,p),w=p-Ut,E=c*d,M=Math.cos(E),g=Math.sin(E);p=Ut+w*M-f*g,f=w*g+f*M,l+=i*d*(w/.5)}so(ut,e-(Yt-p)*K,nt);let v=f*K,m=l*K*t.relief+.0015;a[h*3]=nt.pos[0]+nt.B[0]*v+nt.N[0]*m,a[h*3+1]=nt.pos[1]+nt.B[1]*v+nt.N[1]*m,a[h*3+2]=nt.pos[2]+nt.B[2]*v+nt.N[2]*m}wo.needsUpdate=!0,_.geo.computeVertexNormals(),Tt.uniforms.uSolid.value=Math.min(1,t.relief*2.4),Tt.uniforms.uFill.value=t.fill}var C0=10631978,ht=new S.Group,De=new S.MeshBasicMaterial({color:C0,transparent:!0,opacity:0,depthWrite:!1});function Ro(t,e,o=0,n=0){let s=[],r=[],c=0,i=!0,a=0;for(let f=0;f<t.length;f++){f&&(c=Math.hypot(t[f][0]-t[f-1][0],t[f][1]-t[f-1][1],t[f][2]-t[f-1][2])),a+=c,o&&a>(i?o:n)&&(i=!i,a=0);let l=t[f];if(s.push(l[0]+l[3]*e,l[1]+l[4]*e,l[2]+l[5]*e,l[0]-l[3]*e,l[1]-l[4]*e,l[2]-l[5]*e),f&&(i||!o)){let u=(f-1)*2;r.push(u,u+1,u+2,u+1,u+3,u+2)}}let h=new S.BufferGeometry;h.setAttribute("position",new S.Float32BufferAttribute(s,3)),h.setIndex(r);let p=new S.Mesh(h,De);return p.frustumCulled=!1,p}function Eo(t,e,o,n,s){let r=e?t.concat([t[0]]):t,c=r.map((i,a)=>{let h=r[Math.max(0,a-1)],p=r[Math.min(r.length-1,a+1)],f=p[0]-h[0],l=p[1]-h[1],u=Math.hypot(f,l)||1;return[i[0],O+.003,i[1],-l/u,0,f/u]});return Ro(c,o,n,s)}{let t=Wt(10).map(o=>ne(o));ht.add(Eo(t,!0,.009,.05,.03)),ht.add(Eo(W.map(o=>ne(o)),!0,.005,.03,.03));for(let o of[0,2,4]){let n=ne(W[o]),s=new S.Mesh(new S.CircleGeometry(.04,20),De);s.rotation.x=-Math.PI/2,s.position.set(n[0],O+.004,n[1]),ht.add(s)}let e=[];for(let o=0;o<ut.n;o+=4){let n=ut.pos,s=ut.N,r=ut.B;e.push([n[o*3]+s[o*3]*.006,n[o*3+1]+s[o*3+1]*.006,n[o*3+2]+s[o*3+2]*.006,r[o*3],r[o*3+1],r[o*3+2]])}ht.add(Ro(e,.007,.07,.05)),ht.renderOrder=5,ht.visible=!1,Zt.add(ht)}var rt=new S.OrthographicCamera(-1,1,1,-1,1,400),Le={H:5.6,target:new S.Vector3(.2,.3,2)},ce=1,Pe=1;function Ho(){let t=Le.target;rt.position.set(t.x+100,t.y+100,t.z+100),rt.up.set(0,1,0),rt.lookAt(t);let e=Le.H/2;rt.left=-e*(ce/Pe),rt.right=e*(ce/Pe),rt.top=e,rt.bottom=-e,rt.updateProjectionMatrix()}ao(w0,(t,e)=>{ce=t,Pe=e,Xt.setSize(t,e),Ho()});ro();var I={t:0,playing:!0,litho:1,lithoTarget:1,reveal:0,revealTarget:0},Ao=co([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{I.lithoTarget=t},1),Io=document.getElementById("btn-reveal");function ze(t){I.revealTarget=t?1:0,Io.setAttribute("aria-pressed",String(t))}Io.addEventListener("click",()=>ze(!I.revealTarget));var Lo=lo(t=>{I.playing=t});io({" ":()=>Lo(!I.playing),l:()=>Ao(I.lithoTarget?0:1),r:()=>ze(!I.revealTarget),ArrowRight:()=>{I.t+=1},ArrowLeft:()=>{I.t-=1},0:()=>{I.t=0}});var Ft=null;Dt.addEventListener("pointerdown",t=>{Dt.setPointerCapture(t.pointerId),Ft={x:t.clientX}});Dt.addEventListener("pointermove",t=>{Ft&&(I.t+=(t.clientX-Ft.x)/Math.max(200,ce)*22,Ft.x=t.clientX)});var Po=()=>{Ft=null};Dt.addEventListener("pointerup",Po);Dt.addEventListener("pointercancel",Po);var go=performance.now(),bo="";function Co(t){let e=Math.min(.05,Math.max(0,(t-go)/1e3));go=t,I.playing&&!Ft&&(I.t+=e);for(let[s,r]of[["litho","lithoTarget"],["reveal","revealTarget"]]){let c=I[r]-I[s];I[s]+=Math.sign(c)*Math.min(Math.abs(c),e*2.4)}Kt.uLitho.value=I.litho,Kt.uTime.value=t/1e3;let o=I0(I.t);P0(o),Tt.uniforms.uContours.value=I.reveal*Math.min(1,o.relief*3),De.opacity=I.reveal*.9,ht.visible=I.reveal>.01;let n=I.reveal>.5?o.phase[2]:"";n!==bo&&(fo(!!n,n),bo=n),Xt.render(Zt,rt),requestAnimationFrame(Co)}pt("ready");ho();requestAnimationFrame(Co);window.__page={state:I,VIEW:Le,updateCamera:Ho,TOTAL:se,PHASES:Qt,setPlaying:Lo,setLitho:t=>{Ao(t?1:0),I.litho=t?1:0},setReveal:t=>{ze(t),I.reveal=t?1:0},at:(t,e=0)=>{let o=Qt.find(n=>n[0]===t);I.t=o.start+o[1]*e},path:ut,hero:ct,L:_,TIMES:yo};})();
