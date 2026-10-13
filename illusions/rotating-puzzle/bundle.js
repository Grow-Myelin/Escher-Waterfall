(()=>{var uo=Object.create;var zt=Object.defineProperty;var fo=Object.getOwnPropertyDescriptor;var ho=Object.getOwnPropertyNames;var po=Object.getPrototypeOf,mo=Object.prototype.hasOwnProperty;var go=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}},vo=(t,e)=>{for(var o in e)zt(t,o,{get:e[o],enumerable:!0})},Eo=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of ho(e))!mo.call(t,s)&&s!==o&&zt(t,s,{get:()=>e[s],enumerable:!(n=fo(e,s))||n.enumerable});return t};var wt=(t,e,o)=>(o=t!=null?uo(po(t)):{},Eo(e||!t||!t.__esModule?zt(o,"default",{value:t,enumerable:!0}):o,t));var ut=go((an,xe)=>{xe.exports=window.THREE});var p=wt(ut(),1);var U=wt(ut(),1);function be(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new U.Vector3(.1,.9,.66).normalize()},uPaper:{value:new U.Vector3(.925,.898,.835)},uInk:{value:new U.Vector3(.11,.1,.09)},uHaze:{value:new U.Vector3(.83,.86,.84)},uBgColour:{value:new U.Vector3(.906,.894,.851)},uFogTop:{value:0},uFogBot:{value:-3.5},uFade:{value:1}}}var wo=`
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
float lineMask(float d, float w) {
  float px = max(fwidth(d), 1e-5);
  float ww = max(w, px * 0.55);
  return (1.0 - smoothstep(ww - px * 0.5, ww + px * 0.5, d)) * min(1.0, w / (px * 0.55) + 0.35);
}
float lod(float period, float fw) {
  return smoothstep(2.5, 6.0, period / max(fw, 1e-5));
}
`,xo=`
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);

  float L = dot(col, vec3(0.30, 0.59, 0.11));
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = 0.13 + haze * 0.15;
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
  // no lines at all where the tone needs none (the original leaves faint ones)
  h1 *= smoothstep(0.0, 0.06, c1);
  h2 *= smoothstep(0.0, 0.06, c2);
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
`,bo=`
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
    float ph = uTime * 2.2 + position.x * 1.7 + position.z * 1.1;
    float g = amat.z;
    p.x += (sin(ph) * 0.05 + sin(ph * 2.3 + 1.7) * 0.02) * g;
    p.z += sin(ph * 0.9 + 0.4) * 0.05 * g;
    p.y += sin(ph * 1.3 + 0.9) * 0.02 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Mo=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uBgColour;
uniform float uFogTop;
uniform float uFogBot;
uniform float uFade;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${wo}
${xo}

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.42 + 0.63 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 1.0) {            // brick
    float rh = 0.17, bl = 0.38;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.3 * h, l);
    lines = lineMask(d, 0.012) * l * 0.85;
  } else if (pat == 2.0) {     // ashlar
    float rh = 0.25, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 9.0));
    lines = lineMask(d, 0.011) * l * 0.6;
  } else if (pat == 3.0) {     // roof tiles
    float rh = 0.16, bw = 0.2;
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
    lines = max(lineMask(dl, 0.01), (1.0 - dv) * 0.6) * l;
  } else if (pat == 4.0) {     // wood
    float ph = 0.12;
    float fy = fract(uv.y / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    float grain = vnoise(vec2(uv.x * 3.0, uv.y * 60.0));
    tex = mix(1.0, 0.8 + 0.3 * grain, l);
    lines = lineMask(d, 0.008) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 1.8) + 0.03 * vnoise(uv * 18.0);
  } else if (pat == 7.0) {     // flagstones: 2 x 2 slabs per tile, tile edges a little stronger
    vec2 tc = uv + 0.5;
    vec2 g = tc * 2.0;
    vec2 f = fract(g);
    vec2 cell = floor(g);
    float d = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) / 2.0;
    vec2 ft = fract(tc);
    float dt = min(min(ft.x, 1.0 - ft.x), min(ft.y, 1.0 - ft.y));
    float l = lod(0.5, fw);
    tex = mix(1.0, 0.93 + 0.1 * hash12(cell + 3.0), l) * (0.97 + 0.05 * vnoise(uv * 7.0));
    lines = max(lineMask(d, 0.007) * 0.55, lineMask(dt, 0.011) * 0.9) * l;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 40.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.72 + 0.5 * fbm(uv * 6.0);
  } else if (pat == 10.0) {    // rough stone
    float rh = 0.2, bl = 0.36;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.012) * l * 0.75;
  } else if (pat == 12.0) {    // soil / moss
    tex = 0.8 + 0.3 * fbm(uv * 5.0);
  } else if (pat == 14.0) {    // cloud: soft, no texture
    tex = 1.0;
    shade = 0.7 + 0.36 * diff;
  } else if (pat == 15.0) {    // outline hull: flat ink
    float fogH = smoothstep(uFogTop, uFogBot, vW.y);
    vec3 bgH = mix(uBgColour, uPaper, uLitho);
    vec3 inkC = mix(vec3(0.42, 0.4, 0.37), uInk * 1.6, uLitho);
    gl_FragColor = vec4(mix(inkC, bgH, fogH * 0.6), uFade);
    return;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  // mist: everything below the walkways dissolves into the paper
  float fog = smoothstep(uFogTop, uFogBot, vW.y);
  fog = fog * fog * (3.0 - 2.0 * fog);
  vec3 bg = mix(uBgColour, uPaper, uLitho);
  float grain = hash12(gl_FragCoord.xy * 1.3) - 0.5;
  outc = mix(outc, bg + grain * 0.02, clamp(fog + grain * 0.08 * fog * (1.0 - fog) * 4.0, 0.0, 1.0));
  gl_FragColor = vec4(outc, uFade);
}
`;function xt(t,e={}){return new U.ShaderMaterial({uniforms:t,vertexShader:bo,fragmentShader:Mo,transparent:!!e.transparent,depthWrite:e.depthWrite??!0,side:e.side??U.FrontSide})}var B=wt(ut(),1),yo=1e3,C={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function To(t){return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function x(t,e=C.PLAIN,o={}){return{c:typeof t=="number"?To(t):t,p:e,f:o.f||0,w:o.w||0,s:o.s||0}}var Me=["px","nx","py","ny","pz","nz"];function J(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function _t(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function bt(t){return Math.hypot(t[0],t[1],t[2])}function Y(t){let e=bt(t)||1;return[t[0]/e,t[1]/e,t[2]/e]}function Ut(t,e){let o=Math.abs(e[0]),n=Math.abs(e[1]),s=Math.abs(e[2]);return o>=n&&o>=s?[t[2],t[1]]:s>=n?[t[0],t[1]]:[t[0],t[2]]}var q=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this.nm=new B.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new B.Matrix3().getNormalMatrix(this.m):null,this}_tp(e){if(!this.m)return[e[0],e[1],e[2]];let o=this.m.elements,n=e[0],s=e[1],i=e[2];return[o[0]*n+o[4]*s+o[8]*i+o[12],o[1]*n+o[5]*s+o[9]*i+o[13],o[2]*n+o[6]*s+o[10]*i+o[14]]}_tn(e){if(!this.nm)return e;let o=this.nm.elements,n=e[0],s=e[1],i=e[2];return Y([o[0]*n+o[3]*s+o[6]*i,o[1]*n+o[4]*s+o[7]*i,o[2]*n+o[5]*s+o[8]*i])}tri(e,o,n,s,i=[1,1,1],r={}){let a=this._tp(e),c=this._tp(o),u=this._tp(n),l=Y(_t(J(o,e),J(n,e))),d=r.uv||[Ut(e,l),Ut(o,l),Ut(n,l)],f=Y(_t(J(c,a),J(u,a))),v=r.n?r.n.map(b=>this._tn(b)):[f,f,f],g=bt(_t(J(c,a),J(u,a))),E=[g/(bt(J(u,c))||1),g/(bt(J(a,u))||1),g/(bt(J(c,a))||1)],w=r.k||[1,1,1],T=s.s||0,k=[a,c,u];for(let b=0;b<3;b++){let H=k[b];this.pos.push(H[0]+T,H[1]+T,H[2]+T),this.nrm.push(v[b][0],v[b][1],v[b][2]),this.col.push(s.c[0]*w[b],s.c[1]*w[b],s.c[2]*w[b]),this.uv.push(d[b][0],d[b][1]);for(let I=0;I<3;I++)i[I]?this.edg.push(b===I?E[I]:0):this.edg.push(yo);this.mat.push(s.p,s.f,s.w)}}quad(e,o,n,s,i,r=[1,1,1,1],a={}){let c=a.k||[1,1,1,1],u=a.n,l=a.uv;this.tri(e,o,n,i,[r[1],0,r[0]],{k:[c[0],c[1],c[2]],n:u&&[u[0],u[1],u[2]],uv:l&&[l[0],l[1],l[2]]}),this.tri(e,n,s,i,[r[2],r[3],0],{k:[c[0],c[2],c[3]],n:u&&[u[0],u[2],u[3]],uv:l&&[l[0],l[2],l[3]]})}box(e,o,n,s,i,r,a,c={}){e>s&&([e,s]=[s,e]),o>i&&([o,i]=[i,o]),n>r&&([n,r]=[r,n]);let u=new Set(c.open||[]),l=new Set(c.skip||[]);c.bottom||l.add("ny");let d=c.ao??1,f=c.aoTop??1,v={px:[0,s],nx:[0,e],py:[1,i],ny:[1,o],pz:[2,r],nz:[2,n]},g={px:[[s,o,r],[s,o,n],[s,i,n],[s,i,r]],nx:[[e,o,n],[e,o,r],[e,i,r],[e,i,n]],pz:[[e,o,r],[s,o,r],[s,i,r],[e,i,r]],nz:[[s,o,n],[e,o,n],[e,i,n],[s,i,n]],py:[[e,i,r],[s,i,r],[s,i,n],[e,i,n]],ny:[[e,o,n],[s,o,n],[s,o,r],[e,o,r]]};for(let E of Me){if(l.has(E)||u.has(E))continue;let w=g[E],T=[];for(let H=0;H<4;H++){let I=w[H],F=w[(H+1)%4],D=1;for(let j of Me){if(j===E)continue;let[z,_]=v[j];Math.abs(I[z]-_)<1e-9&&Math.abs(F[z]-_)<1e-9&&u.has(j)&&(D=0)}T.push(D)}let k;E==="py"||E==="ny"?k=[f,f,f,f]:k=[d,d,1,1];let b=E==="py"&&c.top?{...c.top,s:a.s}:a;this.quad(w[0],w[1],w[2],w[3],b,T,{k})}}cyl(e,o,n,s,i,r,a,c={}){let u=c.caps??[!0,!0],l=c.rim??[1,1],d=c.r1??s;for(let f=0;f<r;f++){let v=f/r*Math.PI*2,g=(f+1)/r*Math.PI*2,E=Math.cos(v),w=Math.sin(v),T=Math.cos(g),k=Math.sin(g),b=[e+s*E,o,n+s*w],H=[e+d*E,i,n+d*w],I=[e+d*T,i,n+d*k],F=[e+s*T,o,n+s*k],D=(s-d)/Math.max(1e-6,i-o),j=Y([E,D,w]),z=Y([T,D,k]),_=v*(s+d)/2,it=g*(s+d)/2;this.quad(b,H,I,F,a,[0,l[1],0,l[0]],{n:[j,j,z,z],uv:[[_,o],[_,i],[it,i],[it,o]],k:c.k}),u[1]&&d>0&&this.tri([e,i,n],I,H,a,[1,0,0]),u[0]&&this.tri([e,o,n],b,F,a,[1,0,0])}}lathe(e,o,n,s,i,r,a={}){let c=s.length,u=[];for(let f=0;f<c-1;f++){let v=s[f+1][0]-s[f][0],g=s[f+1][1]-s[f][1];u.push(Y([g,-v,0]))}let l=s.map((f,v)=>{let g=u[Math.max(0,v-1)],E=u[Math.min(c-2,v)];return Y([g[0]+E[0],g[1]+E[1],0])}),d=a.edges||[];for(let f=0;f<i;f++){let v=f/i*Math.PI*2,g=(f+1)/i*Math.PI*2,E=Math.cos(v),w=Math.sin(v),T=Math.cos(g),k=Math.sin(g);for(let b=0;b<c-1;b++){let[H,I]=s[b],[F,D]=s[b+1],j=[e+H*E,o+I,n+H*w],z=[e+F*E,o+D,n+F*w],_=[e+F*T,o+D,n+F*k],it=[e+H*T,o+I,n+H*k],W=a.flat?u[b]:l[b],lt=a.flat?u[b]:l[b+1];this.quad(j,z,_,it,r,[0,d[b+1]?1:0,0,d[b]?1:0],{n:[[W[0]*E,W[1],W[0]*w],[lt[0]*E,lt[1],lt[0]*w],[lt[0]*T,lt[1],lt[0]*k],[W[0]*T,W[1],W[0]*k]],uv:[[v*1.2,I],[v*1.2,D],[g*1.2,D],[g*1.2,I]]})}}}poly(e,o,n={}){for(let s=1;s<e.length-1;s++)this.tri(e[0],e[s],e[s+1],o,[1,s===e.length-2?1:0,s===1?1:0],n)}blob(e,o,n,s,i,r,a,c={}){let u=c.sub??1,l=c.seed??0,d=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let g=0;g<u;g++){let E=[];for(let[w,T,k]of d){let b=Y([(w[0]+T[0])/2,(w[1]+T[1])/2,(w[2]+T[2])/2]),H=Y([(T[0]+k[0])/2,(T[1]+k[1])/2,(T[2]+k[2])/2]),I=Y([(k[0]+w[0])/2,(k[1]+w[1])/2,(k[2]+w[2])/2]);E.push([w,b,I],[b,T,H],[I,H,k],[b,H,I])}d=E}let f=g=>1+(c.lump??.12)*Math.sin(g[0]*5.1+l)*Math.sin(g[1]*4.3+l*1.7)*Math.sin(g[2]*3.7+l*.3),v=g=>{let E=f(g);return[e+g[0]*s*E,o+g[1]*i*E,n+g[2]*r*E]};for(let[g,E,w]of d)this.tri(v(g),v(E),v(w),a,[0,0,0],{n:[g,E,w],k:c.k})}build(){let e=new B.BufferGeometry;return e.setAttribute("position",new B.Float32BufferAttribute(this.pos,3)),e.setAttribute("normal",new B.Float32BufferAttribute(this.nrm,3)),e.setAttribute("acol",new B.Float32BufferAttribute(this.col,3)),e.setAttribute("fuv",new B.Float32BufferAttribute(this.uv,2)),e.setAttribute("edge",new B.Float32BufferAttribute(this.edg,3)),e.setAttribute("amat",new B.Float32BufferAttribute(this.mat,3)),e.computeBoundingSphere(),e}},Z={T:(t,e,o)=>new B.Matrix4().makeTranslation(t,e,o),RX:t=>new B.Matrix4().makeRotationX(t),RY:t=>new B.Matrix4().makeRotationY(t),RZ:t=>new B.Matrix4().makeRotationZ(t),S:(t,e,o)=>new B.Matrix4().makeScale(t,e??t,o??t),chain:(...t)=>t.reduce((e,o)=>e.multiply(o),new B.Matrix4)};var tt=wt(ut(),1);var Ro=new tt.Vector3(0,1,0);function ft(t,e,o,n,s,i={}){let r=new tt.Vector3(o[0]-e[0],o[1]-e[1],o[2]-e[2]),a=r.length();if(a<1e-6)return;let c=new tt.Quaternion().setFromUnitVectors(Ro,r.normalize()),u=new tt.Matrix4().compose(new tt.Vector3(e[0],e[1],e[2]),c,new tt.Vector3(1,1,1));t.push(u),t.cyl(0,0,0,n,a,i.seg??6,s,{r1:i.r1??n*.85,rim:i.rim??[0,1],caps:i.caps??[!1,!0]}),t.pop()}var fn=x(14268832,C.PLAIN),dn=x(3878953,C.PLAIN);var oe={};vo(oe,{ANG:()=>$t,ARM:()=>ko,BASE:()=>nt,DIRS:()=>Xt,EDGES:()=>ye,H:()=>M,NODES:()=>N,SLAB:()=>X,STAIR:()=>Mt,edgeCost:()=>Zt,edgeWaypoints:()=>Jt,findPath:()=>te,joinsAt:()=>Tt,neighbours:()=>Kt,nodeWorld:()=>Qt,rotP:()=>rt,solve:()=>ee,treadY:()=>yt});var M=3,ko=2,X=.42,nt=-6.5,Xt={"+x":[1,0,0],"-x":[-1,0,0],"+z":[0,0,1],"-z":[0,0,-1]},N={start:{p:[3,0,4]},porch:{p:[4,0,4]},A:{p:[3,3,0],ports:["-x"]},T:{p:[2,5,5],ports:["-z"]},B:{p:[-2,1,-5],ports:["+z"]},B2:{p:[-2,1,-6]},B3:{p:[-3,1,-5]},r1:{p:[1,3,0],rot:!0},r2:{p:[2,3,0],rot:!0,ports:["+x"]}},Mt={x:3,z0:.5,run:3,risers:12,top:3};function yt(t){let{z0:e,run:o,risers:n,top:s}=Mt;if(t<=e)return s;if(t>=e+o)return s-o;let i=Math.floor((t-e)/o*n);return s-(i+1)*(o/n)*(s/o)}function Ho(){let{x:t,z0:e,run:o,risers:n}=Mt,s=[[3,0,4],[3,0,e+o]];for(let i=n-1;i>=0;i--){let r=e+(i+.5)/n*o;s.push([t,yt(r),r])}return s.push([3,3,e],[3,3,0]),s}var ye=[["start","porch"],["start","A",Ho()],["B","B2"],["B","B3"],["r1","r2"]],$t=t=>(t%4+4)%4*Math.PI/2;function rt(t,e){let o=Math.cos(e),n=Math.sin(e);return[t[0]*o+t[2]*n,t[1],-t[0]*n+t[2]*o]}function Qt(t,e){let o=N[t];return o.rot?rt(o.p,e):o.p.slice()}var Yt=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],Lo=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],Ao=(t,e)=>[t[0]*e,t[1]*e,t[2]*e];function Tt(t){let e=$t(t),o=[];for(let[n,s]of Object.entries(N))if(!(!s.rot||!s.ports))for(let i of s.ports){let r=rt(s.p,e),a=rt(Xt[i],e).map(u=>Math.round(u)),c=Yt(r,a);for(let[u,l]of Object.entries(N))if(!(l.rot||!l.ports))for(let d of l.ports){let f=Xt[d];if(f[0]!==-a[0]||f[2]!==-a[2])continue;let v=Lo(l.p,c);if(Math.abs(v[0]-v[1])>1e-6||Math.abs(v[1]-v[2])>1e-6)continue;let g=Math.round(v[0]);if(a[0]+a[2]>0?g<0:g>0)continue;let w=Yt(r,Ao(a,.5));o.push({r:n,n:u,k:g,d:a,R:r,N:l.p.slice(),mR:w,mN:Yt(w,[g,g,g])})}}return o}var Io=[0,1,2,3].map(Tt);function Kt(t,e){let o=[];for(let[n,s,i]of ye)n===t?o.push({to:s,pts:i,dir:1}):s===t&&o.push({to:n,pts:i,dir:-1});if(e!==null)for(let n of Io[(e%4+4)%4])n.r===t?o.push({to:n.n,join:n,dir:1}):n.n===t&&o.push({to:n.r,join:n,dir:-1});return o}function Po(t){let e=0;for(let o=1;o<t.length;o++)e+=Math.hypot(t[o][0]-t[o-1][0],t[o][2]-t[o-1][2]);return e}function Jt(t,e,o){let n=$t(o);if(e.join){let r=e.join;return e.dir===1?[{p:r.R},{p:r.mR},{p:r.mN,jump:r.k},{p:r.N}]:[{p:r.N},{p:r.mN},{p:r.mR,jump:-r.k},{p:r.R}]}let s=e.pts?e.pts.slice():[N[t].p,N[e.to].p];e.pts?e.dir===-1&&(s=s.slice().reverse()):s=[N[t].p,N[e.to].p];let i=N[t].rot;return s.map(r=>({p:i?rt(r,n):r.slice()}))}function Zt(t,e){return e.join?1:Po(e.pts||[N[t].p,N[e.to].p])}function te(t,e,o){let n={[t]:0},s={},i=[t];for(;i.length;){i.sort((c,u)=>n[c]-n[u]);let a=i.shift();if(a===e)break;for(let c of Kt(a,o)){let u=n[a]+Zt(a,c);(n[c.to]===void 0||u<n[c.to]-1e-9)&&(n[c.to]=u,s[c.to]={u:a,nb:c},i.includes(c.to)||i.push(c.to))}}if(n[e]===void 0)return null;let r=[];for(let a=e;a!==t;a=s[a].u)r.unshift({from:s[a].u,nb:s[a].nb});return r}function ee(t,e,o){let n=(d,f)=>`${d}|${f}`,i={[n(t,e)]:0},r={},a=[[t,e]],c=null;for(;a.length;){a.sort((E,w)=>i[n(...E)]-i[n(...w)]);let[d,f]=a.shift(),v=n(d,f);if(d===o){c=v;break}let g=[];for(let E of Kt(d,f))g.push([E.to,f,Zt(d,E),{type:"walk",to:E.to}]);for(let E of[1,-1]){let w=(f+E+4)%4;g.push([d,w,3,{type:"turn",ti:w}])}for(let[E,w,T,k]of g){let b=n(E,w),H=i[v]+T;(i[b]===void 0||H<i[b]-1e-9)&&(i[b]=H,r[b]={k:v,act:k},a.some(([I,F])=>n(I,F)===b)||a.push([E,w]))}}if(!c)return null;let u=[];for(let d=c;r[d];d=r[d].k)u.unshift(r[d].act);let l=[];for(let d of u){let f=l[l.length-1];d.type==="walk"&&f&&f.type==="walk"?f.to=d.to:l.push({...d})}return l}var R={...C,FLAG:7,CLOUD:14},L={stone:14998471,stoneDark:13483940,walk:15919833,brick:14202010,accent:12488301,accentTop:15126446,roof:12159602,bronze:11110212,iron:4867136,wood:9136719,leaf:11848092,leafDark:10335367,trunk:7231043,soil:8021584,slit:3880240,cloud:16777215,flag:11818303},et=x(L.stone,R.ASHLAR),$=x(L.stoneDark,R.ASHLAR),Re=x(L.walk,R.FLAG);function Te(t,e){return[t[0]-e[0],t[1]-e[1],t[2]-e[2]]}function Bo(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function So(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]}function dt(t,e,o,n,s,i,r=[1,1,1]){let a=Bo(Te(o,e),Te(n,e)),c=[(e[0]+o[0]+n[0])/3-s[0],(e[1]+o[1]+n[1])/3-s[1],(e[2]+o[2]+n[2])/3-s[2]];So(a,c)<0?t.tri(e,n,o,i,[r[0],r[2],r[1]]):t.tri(e,o,n,i,r)}function St(t,e,o,n,s,i,r={}){let a=r.side||et;t.box(e,-6.5,o,n,i,s,a,{top:r.walk===!1?a:Re});let c=i-(r.course??.55);r.course!==null&&t.box(e-.05,c-.12,o-.05,n+.05,c,s+.05,r.courseStyle||$,{skip:r.courseSkip||[]});for(let[u,l,d,f]of r.slits||[])ne(t,u,l,d,f)}function ne(t,e,o,n,s){let i=x(L.slit,R.PLAIN);s==="+x"?t.box(e,o,n-.05,e+.012,o+.36,n+.05,i,{}):t.box(e-.05,o,n,e+.05,o+.36,n+.012,i,{})}function ke(){let t=new q;return St(t,-.5,-.5,.5,.5,2,{walk:!1,course:.18,slits:[[.5,3-3.1,0,"+x"],[0,3-3.1,.5,"+z"],[.5,3-5.6,0,"+x"],[0,3-5.6,.5,"+z"]]}),t.box(-.56,3-1.05,-.56,.56,2,.56,$,{}),St(t,2.5,-.5,3.5,.5,3,{course:.62,slits:[[3.5,3-2.6,0,"+x"],[3.5,-2,0,"+x"]]}),Co(t),St(t,2.5,3.5,4.5,4.5,0,{course:.5}),t.box(4.15,0,3.62,4.42,.2,4.38,$,{}),t.box(4.3,.2,3.62,4.42,.42,4.38,$,{}),St(t,1.5,4.5,2.5,5.5,5,{side:x(L.brick,R.BRICK),course:.6,courseStyle:$,slits:[[2.5,2.7,5,"+x"],[2,2.7,5.5,"+z"],[2.5,.2,5,"+x"],[2,.2,5.5,"+z"]]}),No(t,2,5,5),t.box(-3.5,.5,-6.5,-1.5,1,-4.5,et,{top:Re}),t.box(-3.56,.36,-6.56,-1.44,.5,-4.44,$,{}),t.box(-3.1,.06,-6.1,-1.9,.36,-4.9,et,{}),t.box(-2.82,-.2,-5.82,-2.18,.06,-5.18,$,{}),t.box(-2.75,-6.5,-5.75,-2.25,-.2,-5.25,et,{}),ne(t,-2.25,-1.1,-5.5,"+x"),ne(t,-2.5,-1.1,-5.25,"+z"),Oo(t,-3,1,-6),t.box(-3.42,1,-5.42,-3.18,1.2,-5.18,$,{}),Rt(t,-3.3,1.28,-5.3,.14,.11,.14,x(L.leaf,R.FOLIAGE,{w:.4}),{sub:2,seed:3,lump:.16},.016),t}function Co(t){let{x:e,z0:o,run:n,risers:s}=Mt,i=e-.5,r=e+.5,a=x(L.walk,R.PLAIN);for(let c=0;c<s;c++){let u=o+c/s*n,l=o+(c+1)/s*n,d=yt((u+l)/2),f=c<s-1?yt(l+.01):d;t.quad([i,d,l],[r,d,l],[r,d,u],[i,d,u],a,[1,1,1,1]),d>f&&t.quad([i,f,l],[r,f,l],[r,d,l],[i,d,l],et,[1,1,1,1]),d>f&&t.quad([r,f,l],[r,f,u],[r,d,u],[r,d,l],et,[0,0,1,1]),t.quad([r,-6.5,l],[r,-6.5,u],[r,f,u],[r,f,l],et,[0,0,0,c===s-1?1:0]),d>f&&t.quad([i,f,u],[i,f,l],[i,d,l],[i,d,u],et,[0,1,1,0]),t.quad([i,-6.5,u],[i,-6.5,l],[i,f,l],[i,f,u],et,[0,c===s-1?1:0,0,0])}}function No(t,e,o,n){let s=n+.24,i=x(L.stoneDark,R.ASHLAR),r=1.16,a=.45,c=.06;for(let W of[-1,1])t.box(e+W*a-c,o,s-c,e+W*a+c,o+r,s+c,i,{}),t.box(e+W*a-c-.03,o,s-c-.03,e+W*a+c+.03,o+.12,s+c+.03,$,{});let u=o+r;t.box(e-a-.12,u,s-.075,e+a+.12,u+.11,s+.075,x(L.wood,R.WOOD),{});let l=u+.11,d=l+.3,f=.34,v=e-a-.2,g=e+a+.2,E=x(L.roof,R.TILE),w=[e,l+.1,s],T=[v,l,s-f],k=[g,l,s-f],b=[g,d,s],H=[v,d,s],I=[v,l,s+f],F=[g,l,s+f];dt(t,T,k,b,w,E,[1,0,1]),dt(t,T,b,H,w,E,[1,1,0]),dt(t,I,F,b,w,E,[1,0,1]),dt(t,I,b,H,w,E,[1,1,0]);let D=x(L.wood,R.WOOD);dt(t,[v+.04,l,s-f+.04],[v+.04,l,s+f-.04],[v+.04,d-.04,s],w,D),dt(t,[g-.04,l,s-f+.04],[g-.04,l,s+f-.04],[g-.04,d-.04,s],w,D),t.cyl(e,d-.02,s,.02,d+.6,6,x(L.iron,R.PLAIN),{}),t.blob(e,d+.02,s,.045,.045,.045,x(L.iron,R.PLAIN),{sub:0});let j=x(L.flag,R.CLOTH,{w:1}),z=[e,d+.58,s],_=[e,d+.38,s],it=[e+.42,d+.48,s+.12];t.tri(z,_,it,j),t.tri(z,it,_,j)}function Oo(t,e,o,n){t.box(e-.38,o,n-.38,e+.38,o+.32,n+.38,$,{}),t.box(e-.32,o+.32,n-.32,e+.32,o+.34,n+.32,x(L.soil,R.SOIL),{});let s=x(L.trunk,R.WOOD);ft(t,[e,o+.32,n],[e+.03,o+1.05,n-.02],.065,s,{r1:.045}),ft(t,[e+.02,o+.8,n],[e+.28,o+1.12,n+.06],.035,s,{r1:.02}),ft(t,[e+.02,o+.9,n],[e-.22,o+1.2,n-.1],.035,s,{r1:.02});let i=x(L.leaf,R.FOLIAGE,{w:.25}),r=x(L.leafDark,R.FOLIAGE,{w:.25});Rt(t,e+.02,o+1.38,n-.02,.42,.36,.42,i,{sub:2,seed:1.3,lump:.12}),Rt(t,e+.3,o+1.15,n+.1,.26,.22,.26,r,{sub:2,seed:4.1,lump:.14}),Rt(t,e-.26,o+1.22,n-.12,.25,.22,.25,r,{sub:2,seed:7.7,lump:.14}),Rt(t,e+.05,o+1.7,n,.24,.2,.24,i,{sub:2,seed:2.2,lump:.12})}function Rt(t,e,o,n,s,i,r,a,c={},u=.022){t.blob(e,o,n,s,i,r,a,c),t.push(Z.chain(Z.T(e,o,n),Z.S(-1,1,1),Z.T(-e,-o,-n))),t.blob(e,o,n,s+u,i+u,r+u,x(0,15,{w:a.w}),c),t.pop()}function He(){let t=new q,e=x(L.accent,R.ASHLAR),o=x(L.accentTop,R.FLAG),n=x(L.iron,R.PLAIN),s=x(L.bronze,R.PLAIN);t.lathe(0,0,0,[[.47,2],[.5,3-.96],[.5,3-.6],[.46,3-.56],[.46,3-.42],[0,3-.42]],24,e,{edges:[1,1,1,1,1,0]});for(let i=0;i<24;i++)t.push(Z.chain(Z.RY(i/24*Math.PI*2))),t.box(.47,2,-.035,.545,3-.9,.035,x(L.iron,R.PLAIN),{}),t.pop();t.box(-.5,3-.42,-.5,2.5,3,.5,e,{top:o}),t.box(-.52,3-.42,-.52,2.5,3-.42+.1,.52,x(9398866,R.PLAIN),{skip:["px"]}),t.box(.46,3-.92,-.32,.86,3-.42,.32,e,{}),t.box(.86,3-.7,-.26,1.3,3-.42,.26,e,{}),t.box(1.3,3-.54,-.2,1.7,3-.42,.2,e,{}),t.cyl(0,3,0,.17,3+.06,14,n,{}),t.cyl(0,3+.06,0,.05,3+.38,8,n,{}),t.lathe(0,3+.28,0,[[.29,0],[.35,0],[.35,.055],[.29,.055],[.29,0]],28,s,{edges:[1,1,1,1,1]});for(let i=0;i<4;i++)t.push(Z.RY(i/4*Math.PI*2+Math.PI/4)),t.box(.04,3+.29,-.022,.3,3+.325,.022,s,{}),t.pop();return t.cyl(-.32,3+.33,0,.032,3+.56,8,x(L.wood,R.WOOD),{}),t.blob(-.32,3+.6,0,.06,.06,.06,x(L.wood,R.PLAIN),{sub:1,lump:0}),t}function Le(){let t=new q;return t.cyl(0,-.06,0,.012,.02,6,x(L.iron,R.PLAIN),{}),t.lathe(0,0,0,[[0,-.05],[.055,-.055],[.075,-.1],[.085,-.2],[.115,-.27],[.125,-.295],[0,-.295]],18,x(L.bronze,R.PLAIN),{edges:[0,0,0,1,1,1,0]}),t.blob(0,-.3,0,.03,.03,.03,x(L.iron,R.PLAIN),{sub:0}),t}function Ae(){return[{u:-3.1,v:-12.6,y:-1.5,s:1},{u:.4,v:-11.4,y:-1.2,s:.8},{u:3.6,v:-9.6,y:-1.4,s:1.05},{u:-5.2,v:-6.5,y:-2,s:.75},{u:6.2,v:-2.6,y:-1.8,s:.85},{u:5.2,v:4.6,y:-1.3,s:.7},{u:2.7,v:4.9,y:-1.25,s:.62},{u:-4.6,v:4.2,y:-1.6,s:.6}]}function se(t,e,o=0){let n=new q,s=o?x(0,15):x(L.cloud,R.CLOUD,{f:.22}),i=a=>Math.sin(t*12.9898+a*78.233)*.5+.5,r=5;for(let a=0;a<r;a++){let c=a/(r-1)*2-1,u=(.72-Math.abs(c)*.3)*e*(.85+.3*i(a)),l=(1-Math.abs(c))*.16*e+i(a+9)*.08;n.blob(c*1.05*e,l,(i(a+3)-.5)*.5*e,u+o,u*.6+o,u*.8+o,s,{sub:3,seed:t+a,lump:.03})}return n}function ie(t,e,o){let n=2*o-e;return[(n+t)/2,o,(n-t)/2]}function Ie(){let t=new q,e=x(4867134,R.PLAIN);t.blob(0,0,0,.026,.024,.075,e,{sub:1,lump:0}),t.blob(0,.01,.07,.02,.02,.02,e,{sub:1,lump:0});let o=n=>{let s=new q,i=[0,0,.035],r=[0,0,-.03],a=[n*.12,.045,0],c=[n*.12,.045,-.04],u=[n*.27,-.015,-.06];for(let[l,d,f]of[[i,a,c],[i,c,r],[a,u,c]])s.tri(l,d,f,e,[0,0,0]),s.tri(l,f,d,e,[0,0,0]);return s};return{body:t,left:o(1),right:o(-1)}}var st=wt(ut(),1);var Vo=15854818,Pe=9194811,Be=3814188,Se=14466210,Fo=4011053;function Ce(t){let e=new st.Group,o=new st.Group;e.add(o);let n=new q,s=x(Vo,C.CLOTH);n.lathe(0,0,0,[[.135,.07],[.13,.1],[.108,.24],[.086,.36],[.062,.42],[0,.43]],12,s,{edges:[1,0,0,0,0,0]}),n.lathe(0,0,0,[[.138,.065],[.138,.095],[.131,.1]],12,x(Pe,C.CLOTH),{edges:[1,1,0]}),n.lathe(0,0,0,[[.1,.33],[.098,.37],[.07,.425],[0,.44]],12,x(14867663,C.CLOTH),{edges:[1,0,0,0]}),n.blob(0,.49,.006,.062,.068,.062,x(Se,C.PLAIN),{sub:2,lump:.02}),n.cyl(0,.53,0,.13,.545,16,x(Be,C.PLAIN),{}),n.cyl(0,.545,0,.066,.62,12,x(Be,C.PLAIN),{r1:.05}),n.cyl(0,.548,0,.068,.565,12,x(Pe,C.PLAIN),{}),n.box(.08,.17,-.04,.13,.25,.05,x(8019013,C.PLAIN),{});let i=new st.Mesh(n.build(),t);o.add(i);let r=[];for(let u of[-1,1]){let l=new q;l.box(-.032,0,-.04,.032,.045,.07,x(Fo,C.PLAIN),{});let d=new st.Mesh(l.build(),t);d.position.x=u*.05,e.add(d),r.push(d)}let a=[];for(let u of[-1,1]){let l=new q;ft(l,[0,0,0],[.012*u,-.15,.01],.026,x(14867663,C.CLOTH),{r1:.022}),l.blob(.014*u,-.165,.012,.022,.022,.022,x(Se,C.PLAIN),{sub:0});let d=new st.Group;d.position.set(u*.105,.39,0),d.add(new st.Mesh(l.build(),t)),o.add(d),a.push(d)}function c(u,l){let d=Math.sin(u);for(let f=0;f<2;f++){let v=f===0?d:-d,g=Math.max(0,Math.cos(u+(f===0?0:Math.PI)))*.035*l;r[f].position.z=v*.075*l,r[f].position.y=g,a[f].rotation.x=-v*.55*l}o.position.y=Math.abs(Math.cos(u))*.016*l,o.rotation.z=d*.03*l}return c(0,0),{root:e,pose:c}}function Ne(t,e){let o=document.getElementById("frame"),n=()=>{let i=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),a=document.getElementById("controls"),c=(r?r.offsetHeight:0)+6+13,u=(a?a.offsetHeight:0)+8+13,l=window.innerWidth-i*2,d=window.innerHeight-c-u,f=d,v=f*t;v>l&&(v=l,f=v/t),v=Math.max(160,Math.floor(v)),f=Math.max(120,Math.floor(f)),o.style.width=`${v}px`,o.style.height=`${f}px`,o.style.top=`${c+Math.max(0,(d-f)/2)}px`,e?.(v,f)};return window.addEventListener("resize",n),n(),n}function Oe(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let n=s=>{s?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(s))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&n(!1)})}function Ve(t,e,o){let n=s=>{for(let[i,r]of t)i.setAttribute("aria-pressed",String(r===s));e(s)};for(let[s,i]of t)s.addEventListener("click",()=>n(i));return o!==void 0&&n(o),n}function Fe(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function De(t,e=!0){let o=document.getElementById("btn-play"),n=s=>{e=s,o&&(o.setAttribute("aria-pressed",String(!s)),o.querySelector("span").textContent=s?"Pause":"Play",o.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),t(s)};return o?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function qe(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function Ge(){document.body.classList.add("ready")}var vt=Math.PI/4,Pt=Math.atan(1/Math.SQRT2),ge={az:vt-1.3,el:.7,zoom:.75,k:1},Dt={X:.45,Y:.55,H:12.9},Q=Math.PI/2,Do=1.45,qo=.34,Go=Math.sqrt(3),V=document.getElementById("scene"),Et=new p.WebGLRenderer({canvas:V,antialias:!0});Et.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var ve=new p.Color(15525333),$e=new p.Color(15197401);Et.setClearColor(ve,1);var K=new p.Scene,kt=be(),qt=xt(kt),Qe=new p.Mesh(ke().build(),qt);Qe.frustumCulled=!1;K.add(Qe);var Gt=new p.Group,Ke=new p.Mesh(He().build(),qt);Ke.frustumCulled=!1;Gt.add(Ke);K.add(Gt);var Je=new p.Vector3(2,6.15,5.24),Ht=new p.Group;Ht.position.copy(Je);Ht.add(new p.Mesh(Le().build(),qt));K.add(Ht);var Nt=Ce(qt);K.add(Nt.root);var pt={...kt,uFade:{value:1}},jo=xt(pt,{transparent:!0}),Wo=xt(pt,{transparent:!0,side:p.BackSide}),je=Ae().map((t,e)=>{let o=new p.Mesh(se(e*1.37+.4,t.s).build(),jo),n=new p.Mesh(se(e*1.37+.4,t.s,.035).build(),Wo);n.renderOrder=1,o.add(n);let s=ie(t.u,t.v,t.y);return o.position.set(s[0],s[1],s[2]),o.userData={base:s,ph:e*1.9,sp:.05+.03*(e%3)},o.renderOrder=2,K.add(o),o}),re=Ie(),ae={body:re.body.build(),left:re.left.build(),right:re.right.build()},ce=xt(pt,{transparent:!0,side:p.DoubleSide}),le=ie(-4.4,13.2,7.4),Ze=[0,1,2].map(t=>{let e=new p.Group;e.add(new p.Mesh(ae.body,ce));let o=new p.Mesh(ae.left,ce),n=new p.Mesh(ae.right,ce);return e.add(o,n),e.userData={l:o,r:n,ph:t*2.1,rad:1+t*.35,sp:.32-t*.04,fl:t*1.7},e.scale.setScalar(.95-t*.12),K.add(e),e});function zo(t){for(let e of Ze){let{l:o,r:n,ph:s,rad:i,sp:r,fl:a}=e.userData,c=s+t*r;e.position.set(le[0]+Math.cos(c)*i,le[1]+Math.sin(c*2+s)*.12,le[2]+Math.sin(c)*i),e.rotation.set(0,-c,Math.sin(c)*.25);let u=Math.sin(t*7+a)*.55+.15,l=Math.max(0,Math.sin(t*.7+a))>.6?.25:1;o.rotation.z=u*l,n.rotation.z=-u*l}}var Ot=10631978,jt=new p.Group;jt.renderOrder=20;K.add(jt);var Ee=[];for(let t=0;t<4;t++)for(let e of Tt(t)){if(e.k===0)continue;let o=new p.Group,n=new p.LineDashedMaterial({color:Ot,dashSize:.22,gapSize:.14,transparent:!0,opacity:0,depthTest:!1}),s=new p.Vector3(...e.mR),i=new p.Vector3(...e.mN),r=new p.Line(new p.BufferGeometry().setFromPoints([s,i]),n);r.computeLineDistances(),o.add(r);let a=new p.MeshBasicMaterial({color:Ot,transparent:!0,opacity:0,depthTest:!1});for(let l of[s,i]){let d=new p.Mesh(new p.SphereGeometry(.075,12,8),a);d.position.copy(l),o.add(d)}let c=new p.LineBasicMaterial({color:Ot,transparent:!0,opacity:0,depthTest:!1}),u=[e.d[2],0,-e.d[0]];for(let l of[e.mR,e.mN]){let d=new p.Vector3(l[0]-u[0]*.5,l[1]+.004,l[2]-u[2]*.5),f=new p.Vector3(l[0]+u[0]*.5,l[1]+.004,l[2]+u[2]*.5);o.add(new p.Line(new p.BufferGeometry().setFromPoints([d,f]),c))}o.userData={ti:t,mats:[n,a,c]},jt.add(o),Ee.push(o)}{let t=[];for(let n=0;n<=96;n++){let s=n/96*Math.PI*2;t.push(new p.Vector3(Math.cos(s)*2.5,3+.005,Math.sin(s)*2.5))}let e=new p.LineDashedMaterial({color:1907480,dashSize:.08,gapSize:.1,transparent:!0,opacity:0,depthTest:!0}),o=new p.Line(new p.BufferGeometry().setFromPoints(t),e);o.computeLineDistances(),o.userData={mats:[e],ti:-1},jt.add(o),Ee.push(o)}var _o=new p.LineBasicMaterial({color:1907480,transparent:!0,opacity:0,depthTest:!1}),ot=new p.LineLoop(new p.BufferGeometry().setFromPoints([new p.Vector3(.28,0,0),new p.Vector3(0,0,.28),new p.Vector3(-.28,0,0),new p.Vector3(0,0,-.28)]),_o);ot.renderOrder=15;K.add(ot);var S={node:null,t:0,bad:!1,pos:null},Uo=new p.LineBasicMaterial({color:1907480,transparent:!0,opacity:0,depthTest:!1}),to=[];for(let t=0;t<3;t++){let e=[];for(let n=0;n<=48;n++){let s=n/48*Math.PI*2;e.push(new p.Vector3(Math.cos(s),Math.sin(s),0))}let o=new p.Line(new p.BufferGeometry().setFromPoints(e),Uo.clone());o.renderOrder=16,o.visible=!1,K.add(o),to.push(o)}var G=new p.OrthographicCamera(-1,1,1,-1,.1,400),Vt=new p.Vector3(.25,.9,-.68);function Yo(t,e,o){let n=t*Math.SQRT2,s=e*Math.sqrt(6),i=(o+s)/3,r=2*i-s;return new p.Vector3((r+n)/2,i,(r-n)/2)}var Xo=Yo(Dt.X,Dt.Y,Vt.x+Vt.y+Vt.z),Ft=new p.Vector3,P={az:vt,el:Pt,zoom:1,k:0},de=30/38;function mt(){let t=Math.cos(P.el),e=Math.sin(P.el),o=new p.Vector3(t*Math.sin(P.az),e,t*Math.cos(P.az));Ft.copy(Xo).lerp(Vt,P.k),G.position.copy(Ft).addScaledVector(o,120),G.up.set(0,1,0),G.lookAt(Ft);let n=Dt.H/2/P.zoom;G.left=-n*de,G.right=n*de,G.top=n,G.bottom=-n,G.updateProjectionMatrix(),G.updateMatrixWorld()}Ne(30/38,(t,e)=>{Et.setSize(t,e),de=t/e,mt()});function eo(){return Math.abs(P.az-vt)<1e-4&&Math.abs(P.el-Pt)<1e-4}var y={playing:!0,litho:1,lithoTarget:1,revealed:!1,viewTween:null,time:0},m={th:Q,tween:null,drag:null,pendingTurn:0};function at(){if(m.tween||m.drag)return null;let t=m.th/Q,e=Math.round(t);return Math.abs(t-e)<1e-6?(e%4+4)%4:null}function Bt(t,e){m.tween={from:m.th,to:t,t:0,dur:Math.max(.2,e)}}var h={node:"start",seg:null,queue:[],goal:null,pendingGoal:null,pos:new p.Vector3(...N.start.p),facing:Math.PI-.5,localFacing:0,phase:0,amt:0};function Wt(t){return Qt(t,m.th)}function We(t,e){return Math.hypot(e[0]-t[0],e[2]-t[2])+Math.abs(e[1]-t[1])*.35}function Lt(t){let e=at();if(e===null)return h.pendingGoal=t,!0;let o=h.seg?h.seg.to:h.node;if(o===t&&!h.seg)return!0;let n=te(o,t,e);return n?(h.queue=n,h.goal=t,h.seg||oo(),!0):!1}function oo(){let t=h.queue.shift();if(!t){h.goal=null;return}let e=at()??0;h.seg={wps:Jt(t.from,t.nb,e),i:0,s:0,to:t.nb.to}}function $o(t){h.node=t,N[t].rot&&(h.localFacing=h.facing-m.th),t==="T"&&no()}var Qo={k:0,t:-10};function Ko(t){let e=0,o=Do*t;for(;h.seg&&o>1e-9;){let{wps:s}=h.seg,i=s[h.seg.i].p,r=s[h.seg.i+1];if(r.jump!==void 0){h.seg.i++,h.seg.s=0,Qo={k:r.jump,t:y.time};continue}let c=We(i,r.p)-h.seg.s;if(o<c)h.seg.s+=o,e+=o,o=0;else if(o-=c,e+=c,h.seg.i++,h.seg.s=0,h.seg.i>=s.length-1){let u=h.seg.to;h.pos.set(...s[s.length-1].p),h.seg=null,$o(u),h.queue.length&&!m.drag&&!m.pendingTurn?oo():(h.queue=[],h.goal=null)}}if(h.seg){let{wps:s}=h.seg,i=s[h.seg.i].p,r=s[h.seg.i+1].p,a=We(i,r)||1,c=Math.min(1,h.seg.s/a);h.pos.set(i[0]+(r[0]-i[0])*c,i[1]+(r[1]-i[1])*c,i[2]+(r[2]-i[2])*c);let u=r[0]-i[0],l=r[2]-i[2];if(Math.hypot(u,l)>1e-4){let f=Math.atan2(u,l)-h.facing;f=Math.atan2(Math.sin(f),Math.cos(f)),h.facing+=f*Math.min(1,t*14)}}else N[h.node].rot&&(h.pos.set(...Wt(h.node)),h.facing=h.localFacing+m.th);h.phase+=e/qo*Math.PI;let n=h.seg?1:0;h.amt+=(n-h.amt)*Math.min(1,t*10),!h.seg&&h.amt<.02&&(h.phase=0),Nt.root.position.copy(h.pos),Nt.root.rotation.y=h.facing,Nt.pose(h.phase,h.amt)}var ht={t:10,amp:0};function no(){ht.t=0,ht.amp=.42}function Jo(t){ht.t+=t;let e=ht.t;Ht.rotation.x=ht.amp*Math.exp(-e*.9)*Math.sin(e*8.5),Ht.rotation.z=ht.amp*.3*Math.exp(-e*.9)*Math.sin(e*8.5+1.2);let o=G.position.clone().sub(Ft).normalize();to.forEach((n,s)=>{let i=e-s*.32,r=i>0&&i<1.5;if(n.visible=r,!r)return;let a=.22+i*.55;n.position.copy(Je).add(new p.Vector3(0,-.15,0)),n.lookAt(n.position.clone().add(o)),n.scale.setScalar(a),n.material.opacity=.75*(1-i/1.5)})}var ue=[{node:"T",wait:2.4},{node:"B2",wait:1.8},{node:"start",wait:1.6}],A={on:!0,gi:0,plan:null,wait:1},we=document.getElementById("btn-auto");function gt(t){A.on=t,A.plan=null,A.wait=t?.4:0,we.setAttribute("aria-pressed",String(t))}function ze(t,e){let o=((e-t)%4+4)%4;return o===3?-1:o}function Zo(t){if(!A.on||h.seg||h.queue.length||m.tween||m.drag)return;if(A.wait>0){A.wait-=t;return}let e=ue[A.gi];if(!A.plan){if(h.node===e.node){A.gi=(A.gi+1)%ue.length,A.wait=e.wait;return}if(A.plan=ee(h.node,at(),e.node),!A.plan){A.gi=(A.gi+1)%ue.length;return}}let o=A.plan.shift();if(!o){A.plan=null;return}if(o.type==="turn"){let n=at(),s=ze(n,o.ti);for(n=o.ti;A.plan.length&&A.plan[0].type==="turn";){let i=A.plan.shift();s+=ze(n,i.ti),n=i.ti}Bt(m.th+s*Q,.75+.55*Math.abs(s)),A.wait=.45}else Lt(o.to),A.wait=.35}Oe();Ve([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{y.lithoTarget=t},1);var ct=De(t=>{y.playing=t});we.addEventListener("click",()=>{gt(!A.on),A.on&&!y.playing&&ct(!0)});var he=document.getElementById("btn-reveal"),tn=document.getElementById("hint"),en="Drag the crank to turn the bridge \xB7 click a walkway to walk there",on="Drag to turn the view \xB7 the dashed lines run along the isometric line of sight";function _e(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}function pe(t,e=2){y.viewTween={from:{...P},to:{...P,...t},t:0,dur:e}}function At(t){y.revealed=t,he.setAttribute("aria-pressed",String(t)),he.querySelector("span").textContent=t?"Back to the iso view":"Reveal the trick",tn.textContent=t?on:en,pe(t?ge:{az:vt,el:Pt,zoom:1,k:0})}he.addEventListener("click",()=>At(!y.revealed));function Ct(t){if(gt(!1),y.playing||ct(!0),h.seg){h.queue=[],m.pendingTurn+=t;return}let e=m.tween?m.tween.to:m.th;Bt(e+t*Q,.7)}Fe({l:()=>document.getElementById(y.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>At(!y.revealed),a:()=>we.click()," ":()=>ct(!y.playing),0:()=>{y.revealed&&At(!1)},ArrowLeft:()=>Ct(1),ArrowRight:()=>Ct(-1),q:()=>Ct(1),e:()=>Ct(-1)});var fe=new p.Raycaster,Ue=new p.Vector2;function nn(t){let e=V.getBoundingClientRect();return Ue.set((t.clientX-e.left)/e.width*2-1,-((t.clientY-e.top)/e.height)*2+1),Ue}function It(t){let e=new p.Vector3(t[0],t[1],t[2]).project(G),o=V.getBoundingClientRect();return[(e.x+1)/2*o.width,(1-e.y)/2*o.height,e.z]}var so=3+.5;function io(t){fe.setFromCamera(nn(t),G);let e=fe.ray.origin,o=fe.ray.direction;if(Math.abs(o.y)<1e-6)return null;let n=(so-e.y)/o.y,s=e.x+o.x*n,i=e.z+o.z*n;return Math.atan2(-i,s)}function ro(t){let e=V.getBoundingClientRect(),o=t.clientX-e.left,n=t.clientY-e.top,s=rt([-.32,so+.05,0],m.th),i=It(s),r=It([0,3+.3,0]),a=e.height/(Dt.H/P.zoom),c=Math.hypot(o-i[0],n-i[1])<Math.max(18,a*.32),u=Math.hypot((o-r[0])/1,(n-r[1])/.62)<a*.46;return c||u}function ao(t,e=!1){let o=V.getBoundingClientRect(),n=t.clientX-o.left,s=t.clientY-o.top,i=null,r=-1/0,a=null,c=e?0:34;for(let u of Object.keys(N)){let l=Wt(u),d=[[.5,.5],[.5,-.5],[-.5,-.5],[-.5,.5]].map(([E,w])=>It([l[0]+E,l[1],l[2]+w])),f=!1;for(let E=0,w=3;E<4;w=E++){let[T,k]=d[E],[b,H]=d[w];k>s!=H>s&&n<(b-T)*(s-k)/(H-k)+T&&(f=!f)}let v=It(l);f&&-v[2]>r&&(i=u,r=-v[2]);let g=Math.hypot(n-v[0],s-v[1]);g<c&&(a=u,c=g)}return i||a}var O=null;V.addEventListener("pointerdown",t=>{if(V.setPointerCapture(t.pointerId),ro(t)){gt(!1),y.playing||ct(!0),h.queue=[],h.pendingGoal=null;let e=m.tween?m.tween.to:m.th;m.tween=null,m.th=e,m.drag={phi:io(t),th:m.th,id:t.pointerId},V.style.cursor="grabbing";return}O={x:t.clientX,y:t.clientY,moved:!1},y.viewTween=null});V.addEventListener("pointermove",t=>{if(m.drag){let e=io(t);if(e===null||m.drag.phi===null){m.drag.phi=e;return}if(h.seg){m.drag.phi=e,m.drag.th=m.th;return}let o=e-m.drag.phi;o=Math.atan2(Math.sin(o),Math.cos(o)),m.drag.phi=e,m.th+=o;return}if(O){let e=t.clientX-O.x,o=t.clientY-O.y;!O.moved&&Math.hypot(e,o)>5&&(O.moved=!0),O.moved&&y.revealed&&(P.az-=(t.clientX-(O.lx??O.x))*.006,P.el=Math.min(1.45,Math.max(-.2,P.el+(t.clientY-(O.ly??O.y))*.004)),mt()),O.lx=t.clientX,O.ly=t.clientY;return}V.style.cursor=ro(t)?"grab":ao(t,!0)?"pointer":y.revealed?"grab":"default"});function co(t){if(m.drag){let e=Math.round(m.th/Q)*Q;Bt(e,.18+Math.abs(e-m.th)*.5),m.drag=null,V.style.cursor="grab";return}if(O&&!O.moved&&t.type==="pointerup"){let e=ao(t);if(e){gt(!1),y.playing||ct(!0);let o=Lt(e);S.node=e,S.t=0,S.bad=!o}}O=null}V.addEventListener("pointerup",co);V.addEventListener("pointercancel",co);V.addEventListener("dblclick",()=>{y.revealed&&pe(ge,.8)});var Ye;function sn(){let t=at(),e=t===null?null:Tt(t).find(n=>n.k!==0),o=null;eo()?e&&(o=e.n==="T"?"Joined in the picture only: the bell tower is 3.5 tiles nearer to you":"Joined in the picture only: the garden is 3.5 tiles farther from you"):o=e?`Off the isometric axis: the bridge stops ${(Math.abs(e.k)*Go).toFixed(1)} tiles short of the ${e.n==="T"?"bell tower":"garden"}`:"Off the isometric axis: the dashed lines show where the joins open up",o!==Ye&&(Ye=o,qe(!!o,o||void 0))}var Xe=performance.now();function lo(t){let e=Math.min(.05,Math.max(0,(t-Xe)/1e3));Xe=t,me(y.playing?e:0,e),Et.render(K,G),requestAnimationFrame(lo)}function me(t,e){if(y.time+=t,kt.uTime.value=y.time,y.litho!==y.lithoTarget){let i=y.lithoTarget-y.litho;y.litho+=Math.sign(i)*Math.min(Math.abs(i),e*2.2),kt.uLitho.value=y.litho,Et.setClearColor($e.clone().lerp(ve,y.litho),1)}if(m.tween){let i=m.tween;i.t=Math.min(1,i.t+t/i.dur),m.th=i.from+(i.to-i.from)*_e(i.t),i.t>=1&&(m.th=i.to,m.tween=null)}if(!m.tween&&!m.drag){let i=Math.round(m.th/Q);if(Math.abs(m.th-i*Q)<1e-6&&(m.th=i*Q),m.pendingTurn&&!h.seg)Bt(m.th+m.pendingTurn*Q,.7),m.pendingTurn=0;else if(h.pendingGoal&&at()!==null){let r=h.pendingGoal;h.pendingGoal=null,Lt(r)}}Gt.rotation.y=m.th,Zo(t),Ko(t),Jo(t),zo(y.time);for(let i of Ze)i.visible=pt.uFade.value>.001;for(let i of je){let{base:r,ph:a,sp:c}=i.userData,u=Math.sin(y.time*c+a)*.35;i.position.set(r[0]+u,r[1]+Math.sin(y.time*.3+a)*.05,r[2]-u)}if(S.node){S.t+=e;let i=Wt(S.node);ot.position.set(i[0],i[1]+.01,i[2]),ot.rotation.y=N[S.node].rot?m.th:0,ot.material.color.setHex(S.bad?Ot:1907480);let r=S.bad?1:1.6,a=!S.bad&&h.node===S.node&&!h.seg;ot.material.opacity=a?Math.max(0,ot.material.opacity-e*3):Math.max(0,1-S.t/r)*.9+(S.bad?0:.1),ot.scale.setScalar(S.bad?1+.15*Math.sin(S.t*30)*Math.max(0,1-S.t*2):1+.1*Math.sin(S.t*6)),S.t>4&&!h.seg&&(S.node=null)}else ot.material.opacity=0;if(y.viewTween){let i=y.viewTween;i.t=Math.min(1,i.t+e/i.dur);let r=_e(i.t);for(let a of["az","el","zoom","k"])P[a]=i.from[a]+(i.to[a]-i.from[a])*r;i.t>=1&&(y.viewTween=null),mt()}let o=Math.hypot(P.az-vt,P.el-Pt),n=Math.min(1,Math.max(0,(o-.12)/.35)),s=at();for(let i of Ee){let r=i.userData.ti===s||i.userData.ti===-1,a=n*(i.userData.ti===-1?.45:r?1:.35);i.visible=a>.001;for(let c of i.userData.mats)c.opacity=a}pt.uFade.value=Math.max(0,1-o/.3);for(let i of je)i.visible=pt.uFade.value>.001;document.body.classList.toggle("off-axis",!eo()),sn()}mt();Ge();requestAnimationFrame(lo);window.__page={BR:m,W:h,DEMO:A,view:P,state:y,LV:oe,setRevealed:At,setAuto:gt,setPlaying:ct,turnTo:Bt,walkTo:Lt,set(t={}){if(t.auto!==void 0&&gt(t.auto),t.th!==void 0&&(m.tween=null,m.th=t.th*Math.PI/180,Gt.rotation.y=m.th),t.node&&(h.seg=null,h.queue=[],h.node=t.node,h.pos.set(...Wt(t.node)),t.facing!==void 0&&(h.facing=t.facing),h.localFacing=h.facing-m.th),t.walk&&Lt(t.walk),t.litho!==void 0&&(y.lithoTarget=t.litho,y.litho=t.litho,kt.uLitho.value=t.litho,Et.setClearColor($e.clone().lerp(ve,t.litho),1),document.getElementById(t.litho?"btn-litho":"btn-colour").setAttribute("aria-pressed","true"),document.getElementById(t.litho?"btn-colour":"btn-litho").setAttribute("aria-pressed","false")),t.revealed!==void 0&&(At(t.revealed),t.instant&&(y.viewTween=null,Object.assign(P,t.revealed?ge:{az:vt,el:Pt,zoom:1,k:0}),mt())),t.view&&(Object.assign(P,t.view),mt()),t.ring&&no(),t.playing!==void 0&&ct(t.playing),t.advance)for(let e=0;e<t.advance*30;e++)me(1/30,1/30)},screen(t){return It(t)},until(t,e=4e3){let o=0;for(;o<e&&!t();o++)me(1/60,1/60);return o}};})();
