(()=>{var se=Object.create;var Pt=Object.defineProperty;var ie=Object.getOwnPropertyDescriptor;var re=Object.getOwnPropertyNames;var ce=Object.getPrototypeOf,le=Object.prototype.hasOwnProperty;var he=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(o){throw t=0,o}};var fe=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of re(t))!le.call(e,n)&&n!==o&&Pt(e,n,{get:()=>t[n],enumerable:!(a=ie(t,n))||a.enumerable});return e};var wt=(e,t,o)=>(o=e!=null?se(ce(e)):{},fe(t||!e||!e.__esModule?Pt(o,"default",{value:e,enumerable:!0}):o,e));var rt=he((Ve,At)=>{At.exports=window.THREE});var P=wt(rt(),1);var N=wt(rt(),1);function Bt(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new N.Vector3(.1,.9,.66).normalize()},uPaper:{value:new N.Vector3(.925,.898,.835)},uInk:{value:new N.Vector3(.11,.1,.09)},uHaze:{value:new N.Vector3(.83,.86,.84)},uBg:{value:new N.Vector3(.925,.898,.835)},uSplit:{value:1},uBand:{value:2.2},uShade:{value:1},uView:{value:new N.Vector3(1,1,1).normalize()}}}var ue=`
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
`,de=`
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
  float hp = (0.22 + haze * 0.25) * uHatch;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float hz = clamp(1.0 - haze * 2.2, 0.0, 1.0);
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85) * hz;
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85) * hz;
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  // a band of relative width c around each hatch line, so the mean cover is c
  // at every scale (the lod blend below then never changes the tone)
  float h1 = smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
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
`,me=`
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
    // sway (the pennant): amplitude grows along the cloth
    float g = amat.z;
    float ph = uTime * 3.1 - fuv.x * 2.2;
    p.x += sin(ph) * 0.13 * g;
    p.z += sin(ph) * 0.13 * g;
    p.y += sin(ph * 0.7 + 1.3) * 0.05 * g;
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,pe=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uBg;
uniform float uFade;
uniform float uCue;
uniform float uHatch;
uniform float uSplit;
uniform float uBand;
uniform float uShade;
uniform vec3 uView;
varying vec3 vW;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
${ue}
${de}

void main() {
  vec3 n = normalize(vN);
  // picture X of this point (isometric: (x \u2212 z)/\u221A2), and the reading there
  float X = (vW.x - vW.z) * 0.70710678;
  float k = uSplit * smoothstep(-uBand, uBand, X);
  vec3 ns = normalize(n - 2.0 * k * (n - dot(n, uView) * uView));
  float diff = max(dot(ns, uLight), 0.0);
  float shade = mix(0.84, 0.36 + 0.66 * diff, uShade);
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;

  if (pat == 2.0) {            // ashlar (dressed stone courses)
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.92 + 0.14 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.018) * l * 0.6;
  } else if (pat == 3.0) {     // two-tone square tiles
    vec2 g = uv / 1.2;
    vec2 cell = floor(g);
    float chk = mod(cell.x + cell.y, 2.0);
    vec2 f = fract(g) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(1.2, fw);
    tex = mix(1.0, mix(1.06, 0.66, chk) * (0.97 + 0.06 * hash12(cell)), l);
    lines = smoothstep(0.465, 0.497, r) * l * 0.5;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 6.0) {     // grass
    tex = 0.85 + 0.25 * fbm(uv * 1.7);
  } else if (pat == 7.0) {     // flagstones
    vec2 g = uv / 1.1;
    vec2 cell = floor(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0));
    vec2 f = fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5;
    float r = max(abs(f.x), abs(f.y));
    float l = lod(1.1, fw);
    tex = mix(1.0, 0.95 + 0.09 * hash12(cell), l) * (0.97 + 0.06 * vnoise(uv * 3.0));
    lines = smoothstep(0.46, 0.495, r) * l * 0.45;
  } else if (pat == 8.0) {     // cloth
    tex = 0.97 + 0.04 * sin(uv.x * 22.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.75 + 0.45 * fbm(uv * 3.0);
  } else if (pat == 10.0) {    // rough stone
    float rh = 0.3, bl = 0.55;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.5 * mod(row, 2.0) + 0.3 * vnoise(vec2(row, 3.0));
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float l = lod(rh, fw);
    tex = mix(1.0, 0.82 + 0.28 * hash12(vec2(floor(x), row)), l);
    lines = lineMask(d, 0.025) * l * 0.75;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines * (1.0 - vM.y);

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - vM.y * 0.5;

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, vM.y, ink, uv, fw, face);
  outc = mix(outc, uBg, smoothstep(0.45, 1.0, vM.y));
  outc = mix(uBg, outc, uCue);
  gl_FragColor = vec4(outc, uFade);
}
`;function bt(e,t={}){let o=new N.ShaderMaterial({uniforms:{...e,uFade:{value:t.fade??1},uCue:{value:t.cue??1},uHatch:{value:t.hatch??1}},vertexShader:me,fragmentShader:pe,transparent:!!t.transparent,side:t.side??N.FrontSide});return t.offset&&(o.polygonOffset=!0,o.polygonOffsetFactor=t.offset,o.polygonOffsetUnits=t.offset),o}var O=wt(rt(),1),ve=1e3,A={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function ge(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function B(e,t=A.PLAIN,o={}){return{c:typeof e=="number"?ge(e):e,p:t,f:o.f||0,w:o.w||0,s:o.s||0}}var Ct=["px","nx","py","ny","pz","nz"];function U(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function xt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function nt(e){return Math.hypot(e[0],e[1],e[2])}function W(e){let t=nt(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function Mt(e,t){let o=Math.abs(t[0]),a=Math.abs(t[1]),n=Math.abs(t[2]);return o>=a&&o>=n?[e[2],e[1]]:n>=a?[e[0],e[1]]:[e[0],e[2]]}var Y=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new O.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new O.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let o=this.m.elements,a=t[0],n=t[1],s=t[2];return[o[0]*a+o[4]*n+o[8]*s+o[12],o[1]*a+o[5]*n+o[9]*s+o[13],o[2]*a+o[6]*n+o[10]*s+o[14]]}_tn(t){if(!this.nm)return t;let o=this.nm.elements,a=t[0],n=t[1],s=t[2];return W([o[0]*a+o[3]*n+o[6]*s,o[1]*a+o[4]*n+o[7]*s,o[2]*a+o[5]*n+o[8]*s])}tri(t,o,a,n,s=[1,1,1],i={}){let l=this._tp(t),h=this._tp(o),m=this._tp(a),u=W(xt(U(o,t),U(a,t))),r=i.uv||[Mt(t,u),Mt(o,u),Mt(a,u)],d=W(xt(U(h,l),U(m,l))),p=i.n?i.n.map(x=>this._tn(x)):[d,d,d],f=nt(xt(U(h,l),U(m,l))),v=[f/(nt(U(m,h))||1),f/(nt(U(l,m))||1),f/(nt(U(h,l))||1)],g=i.k||[1,1,1],w=n.s||0,S=[l,h,m];for(let x=0;x<3;x++){let T=S[x];this.pos.push(T[0]+w,T[1]+w,T[2]+w),this.nrm.push(p[x][0],p[x][1],p[x][2]),this.col.push(n.c[0]*g[x],n.c[1]*g[x],n.c[2]*g[x]),this.uv.push(r[x][0],r[x][1]);for(let k=0;k<3;k++)s[k]?this.edg.push(x===k?v[k]:0):this.edg.push(ve);this.mat.push(n.p,n.f,n.w)}}quad(t,o,a,n,s,i=[1,1,1,1],l={}){let h=l.k||[1,1,1,1],m=l.n,u=l.uv;this.tri(t,o,a,s,[i[1],0,i[0]],{k:[h[0],h[1],h[2]],n:m&&[m[0],m[1],m[2]],uv:u&&[u[0],u[1],u[2]]}),this.tri(t,a,n,s,[i[2],i[3],0],{k:[h[0],h[2],h[3]],n:m&&[m[0],m[2],m[3]],uv:u&&[u[0],u[2],u[3]]})}box(t,o,a,n,s,i,l,h={}){t>n&&([t,n]=[n,t]),o>s&&([o,s]=[s,o]),a>i&&([a,i]=[i,a]);let m=new Set(h.open||[]),u=new Set(h.skip||[]);h.bottom||u.add("ny");let r=h.ao??1,d=h.aoTop??1,p={px:[0,n],nx:[0,t],py:[1,s],ny:[1,o],pz:[2,i],nz:[2,a]},f={px:[[n,o,i],[n,o,a],[n,s,a],[n,s,i]],nx:[[t,o,a],[t,o,i],[t,s,i],[t,s,a]],pz:[[t,o,i],[n,o,i],[n,s,i],[t,s,i]],nz:[[n,o,a],[t,o,a],[t,s,a],[n,s,a]],py:[[t,s,i],[n,s,i],[n,s,a],[t,s,a]],ny:[[t,o,a],[n,o,a],[n,o,i],[t,o,i]]};for(let v of Ct){if(u.has(v)||m.has(v))continue;let g=f[v],w=[];for(let T=0;T<4;T++){let k=g[T],L=g[(T+1)%4],H=1;for(let E of Ct){if(E===v)continue;let[F,I]=p[E];Math.abs(k[F]-I)<1e-9&&Math.abs(L[F]-I)<1e-9&&m.has(E)&&(H=0)}w.push(H)}let S;v==="py"||v==="ny"?S=[d,d,d,d]:S=[r,r,1,1];let x=v==="py"&&h.top?{...h.top,s:l.s}:l;this.quad(g[0],g[1],g[2],g[3],x,w,{k:S})}}cyl(t,o,a,n,s,i,l,h={}){let m=h.caps??[!0,!0],u=h.rim??[1,1],r=h.r1??n;for(let d=0;d<i;d++){let p=d/i*Math.PI*2,f=(d+1)/i*Math.PI*2,v=Math.cos(p),g=Math.sin(p),w=Math.cos(f),S=Math.sin(f),x=[t+n*v,o,a+n*g],T=[t+r*v,s,a+r*g],k=[t+r*w,s,a+r*S],L=[t+n*w,o,a+n*S],H=(n-r)/Math.max(1e-6,s-o),E=W([v,H,g]),F=W([w,H,S]),I=p*(n+r)/2,R=f*(n+r)/2;this.quad(x,T,k,L,l,[0,u[1],0,u[0]],{n:[E,E,F,F],uv:[[I,o],[I,s],[R,s],[R,o]],k:h.k}),m[1]&&r>0&&this.tri([t,s,a],k,T,l,[1,0,0]),m[0]&&this.tri([t,o,a],x,L,l,[1,0,0])}}lathe(t,o,a,n,s,i,l={}){let h=n.length,m=[];for(let d=0;d<h-1;d++){let p=n[d+1][0]-n[d][0],f=n[d+1][1]-n[d][1];m.push(W([f,-p,0]))}let u=n.map((d,p)=>{let f=m[Math.max(0,p-1)],v=m[Math.min(h-2,p)];return W([f[0]+v[0],f[1]+v[1],0])}),r=l.edges||[];for(let d=0;d<s;d++){let p=d/s*Math.PI*2,f=(d+1)/s*Math.PI*2,v=Math.cos(p),g=Math.sin(p),w=Math.cos(f),S=Math.sin(f);for(let x=0;x<h-1;x++){let[T,k]=n[x],[L,H]=n[x+1],E=[t+T*v,o+k,a+T*g],F=[t+L*v,o+H,a+L*g],I=[t+L*w,o+H,a+L*S],R=[t+T*w,o+k,a+T*S],M=l.flat?m[x]:u[x],y=l.flat?m[x]:u[x+1];this.quad(E,F,I,R,i,[0,r[x+1]?1:0,0,r[x]?1:0],{n:[[M[0]*v,M[1],M[0]*g],[y[0]*v,y[1],y[0]*g],[y[0]*w,y[1],y[0]*S],[M[0]*w,M[1],M[0]*S]],uv:[[p*1.2,k],[p*1.2,H],[f*1.2,H],[f*1.2,k]]})}}}poly(t,o,a={}){for(let n=1;n<t.length-1;n++)this.tri(t[0],t[n],t[n+1],o,[1,n===t.length-2?1:0,n===1?1:0],a)}blob(t,o,a,n,s,i,l,h={}){let m=h.sub??1,u=h.seed??0,r=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let f=0;f<m;f++){let v=[];for(let[g,w,S]of r){let x=W([(g[0]+w[0])/2,(g[1]+w[1])/2,(g[2]+w[2])/2]),T=W([(w[0]+S[0])/2,(w[1]+S[1])/2,(w[2]+S[2])/2]),k=W([(S[0]+g[0])/2,(S[1]+g[1])/2,(S[2]+g[2])/2]);v.push([g,x,k],[x,w,T],[k,T,S],[x,T,k])}r=v}let d=f=>1+(h.lump??.12)*Math.sin(f[0]*5.1+u)*Math.sin(f[1]*4.3+u*1.7)*Math.sin(f[2]*3.7+u*.3),p=f=>{let v=d(f);return[t+f[0]*n*v,o+f[1]*s*v,a+f[2]*i*v]};for(let[f,v,g]of r)this.tri(p(f),p(v),p(g),l,[0,0,0],{n:[f,v,g],k:h.k})}build(){let t=new O.BufferGeometry;return t.setAttribute("position",new O.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new O.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new O.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new O.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new O.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new O.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}};var $={S:2.4,p:.55,yf:1.5,pierH:2.3,wallH:2.35,band:.2,rise:1.65,m:.45,wing:1},Z=B(14208954,A.ASHLAR),we=B(14866886,A.PLASTER),j=B(15130315,A.PLAIN),be=B(13616301,A.PLASTER),lt=B(13945524,A.COBBLE),xe=B(14208954,A.TILE),at=B(13023647,A.ASHLAR),ht=B(14472126,A.PLAIN),Ot=(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],Me=(e,t)=>[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],Ee=(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2];function C(e,t,o,a,n=[1,1,1,1],s={}){let i=Me(Ot(t[1],t[0]),Ot(t[2],t[0]));if(Ee(i,o)>=0){e.quad(t[0],t[1],t[2],t[3],a,n,s);return}let l=h=>h&&[h[0],h[3],h[2],h[1]];e.quad(t[0],t[3],t[2],t[1],a,[n[3],n[2],n[1],n[0]],{...s,n:l(s.n),uv:l(s.uv),k:l(s.k)})}function Et(e,t,o,a){return e==="pz"?{O:[t,0,o+a],U:[1,0,0],N:[0,0,1]}:e==="nz"?{O:[t,0,o-a],U:[-1,0,0],N:[0,0,-1]}:e==="px"?{O:[t+a,0,o],U:[0,0,-1],N:[1,0,0]}:{O:[t-a,0,o],U:[0,0,1],N:[-1,0,0]}}function ct(e,t,o,a,n={}){let{S:s,p:i,pierH:l,wallH:h,band:m,rise:u}=$,r=a+l,d=r+h,p=d+m,f=s-i,v=n.sides||["px","nx","pz","nz"];for(let T of[-1,1])for(let k of[-1,1]){let L=T<0?t-s:t+s-i,H=k<0?o-s:o+s-i;e.box(L-.05,a,H-.05,L+i+.05,a+.16,H+i+.05,j,{ao:.85}),e.box(L,a+.16,H,L+i,r-.18,H+i,we,{ao:.9}),e.box(L-.06,r-.18,H-.06,L+i+.06,r,H+i+.06,j,{})}let g=16;for(let T of v){let{O:k,U:L,N:H}=Et(T,t,o,s),E=(I,R,M)=>[k[0]+L[0]*I-H[0]*M,R,k[2]+L[2]*I-H[2]*M],F=[-H[0],0,-H[2]];C(e,[E(-s,r,0),E(-f,r,0),E(-f,d,0),E(-s,d,0)],H,Z,[0,0,0,1]),C(e,[E(f,r,0),E(s,r,0),E(s,d,0),E(f,d,0)],H,Z,[0,1,0,0]);for(let I=0;I<g;I++){let R=Math.PI-I/g*Math.PI,M=Math.PI-(I+1)/g*Math.PI,y=f*Math.cos(R),V=f*Math.cos(M),Q=r+f*Math.sin(R),_=r+f*Math.sin(M);C(e,[E(y,Q,0),E(V,_,0),E(V,d,0),E(y,d,0)],H,Z,[1,0,0,0]),C(e,[E(y,Q,i),E(V,_,i),E(V,d,i),E(y,d,i)],F,Z,[1,I===g-1?1:0,0,I===0?1:0]);let et=[Math.cos((R+M)/2),Math.sin((R+M)/2)],ot=[-(L[0]*et[0]),-et[1],-(L[2]*et[0])];C(e,[E(y,Q,0),E(V,_,0),E(V,_,i),E(y,Q,i)],ot,Z,[1,0,1,0],{k:[.82,.82,.82,.82]})}}if(e.box(t-s-.08,d,o-s-.08,t+s+.08,p,o+s+.08,j,{top:n.vault===!1?lt:j}),n.vault===!1)return p;let w=T=>u*Math.sqrt(Math.max(0,1-(T/s)**2)),S=T=>-u*(T/(s*s))/Math.sqrt(Math.max(.02,1-(T/s)**2)),x=14;for(let T of["px","nx","pz","nz"]){let{U:k,N:L}=Et(T,t,o,s),H=(R,M)=>[t+k[0]*R+L[0]*M,p+w(Math.abs(R)),o+k[2]*R+L[2]*M],E=R=>{let M=-S(Math.abs(R))*Math.sign(R),y=[k[0]*M,1,k[2]*M],V=Math.hypot(y[0],y[1],y[2]);return[y[0]/V,y[1]/V,y[2]/V]};for(let R=0;R<x;R++){let M=-s+2*s*R/x,y=-s+2*s*(R+1)/x,V=[H(M,Math.abs(M)),H(y,Math.abs(y)),H(y,s),H(M,s)],Q=[E(M),E(y),E(y),E(M)],_=ot=>Math.sign(ot)*Math.hypot(Math.abs(ot),u-w(Math.abs(ot))),et=[[Math.abs(M),_(M)],[Math.abs(y),_(y)],[s,_(y)],[s,_(M)]];C(e,V,[0,1,0],be,[1,0,1,0],{n:Q,uv:et})}let{O:F}=Et(T,t,o,s),I=(R,M)=>[F[0]+k[0]*R,M,F[2]+k[2]*R];for(let R=0;R<x;R++){let M=-s+2*s*R/x,y=-s+2*s*(R+1)/x;C(e,[I(M,p),I(y,p),I(y,p+w(Math.abs(y))),I(M,p+w(Math.abs(M)))],L,Z,[0,0,1,0])}}return e.box(t-.16,p+u-.02,o-.16,t+.16,p+u+.12,o+.16,j,{}),e.blob(t,p+u+.32,o,.22,.22,.22,j,{sub:2,lump:0}),p+u}function Ft(e,t,o,a,n,s,i,l){let h=s/i;for(let m=1;m<i;m++){let u=s-m*h,r=u-h,d=n+m*l;t?e.box(o,r,n,o+a,u,d,ht,{ao:.92,open:["nz"]}):e.box(n,r,o,d,u,o+a,ht,{ao:.92,open:["nx"]})}}function yt(){let e=new Y,{S:t,yf:o,m:a,wing:n}=$,s=2*t,l=t+n*s+a,h=l+2.3,m=-t-a-1;e.box(m,-.5,m,h,0,h,at,{top:xe,ao:.9}),e.box(m-.12,-.5,m-.12,h+.12,-.32,h+.12,j,{});let u=-t-a,r=t+a;C(e,[[u,o,u],[r,o,u],[r,o,r],[u,o,r]],[0,1,0],lt,[1,0,0,1]),C(e,[[u,o,r],[r,o,r],[r,o,l],[u,o,l]],[0,1,0],lt,[0,1,1,1]),C(e,[[r,o,u],[l,o,u],[l,o,r],[r,o,r]],[0,1,0],lt,[1,1,1,0]),C(e,[[u,0,l],[r,0,l],[r,o,l],[u,o,l]],[0,0,1],at),C(e,[[r,0,r],[r,0,l],[r,o,l],[r,o,r]],[1,0,0],at),C(e,[[l,0,u],[l,0,r],[l,o,r],[l,o,u]],[1,0,0],at),C(e,[[r,0,r],[l,0,r],[l,o,r],[r,o,r]],[0,0,1],at),ct(e,0,0,o,{vault:!1,sides:["nx","nz"]});let d=o+$.pierH+$.wallH+$.band;ct(e,0,0,d);for(let w=1;w<=n;w++)ct(e,0,w*s,o),ct(e,w*s,0,o);let p=6,f=.42,v=1.25,g=r+v;return e.box(r,0,r,g,o,g,ht,{ao:.9,top:ht}),Ft(e,!0,r,v,g,o,p,f),Ft(e,!1,r,v,g,o,p,f),e}var ye=B(14472126,A.PLAIN),Vt=B(13813679,A.ASHLAR),Te=B(13484714,A.ASHLAR),ft=B(14932936,A.PLAIN),Tt={n:7,t:.8,r:.8,W:2.1,ext:2.2,base:.45};function Nt(){let e=new Y,{n:t,t:o,r:a,W:n,ext:s,base:i}=Tt,l=t*o/2,h=l+s,m=-l-s,u=t*a,r=(f,v,g,w,S)=>e.quad([f,g,n],[v,g,n],[v,w,n],[f,w,n],Vt,S);r(l,h,-i,0,[1,1,1,0]);for(let f=0;f<t;f++){let v=l-f*o,g=v-o,w=(f+1)*a;r(g,v,-i,w-a,[1,0,0,0]),r(g,v,w-a,w,[0,1,1,0])}r(m,-l,-i,u,[1,0,1,1]),e.quad([l,0,n],[h,0,n],[h,0,-n],[l,0,-n],ft,[1,1,1,0]),e.quad([h,-i,n],[h,-i,-n],[h,0,-n],[h,0,n],Vt,[1,1,1,1]);for(let f=0;f<t;f++){let v=l-f*o,g=v-o,w=(f+1)*a;e.quad([v,w-a,n],[v,w-a,-n],[v,w,-n],[v,w,n],ye,[1,1,1,1]),e.quad([g,w,n],[v,w,n],[v,w,-n],[g,w,-n],ft,[1,1,1,1])}e.quad([m,u,n],[-l,u,n],[-l,u,-n],[m,u,-n],ft,[1,1,1,1]);let d=.4,p=u+2.6;return e.box(m,-i,-n-d,h,p,-n,Te,{ao:.9}),e.box(m-.06,p,-n-d-.06,h+.06,p+.2,-n+.06,ft,{}),e}function Wt(e,t){let o=document.getElementById("frame"),a=()=>{let s=(window.innerWidth<640?10:28)+13,i=document.getElementById("masthead"),l=document.getElementById("controls"),h=(i?i.offsetHeight:0)+6+13,m=(l?l.offsetHeight:0)+8+13,u=window.innerWidth-s*2,r=window.innerHeight-h-m,d=r,p=d*e;p>u&&(p=u,d=p/e),p=Math.max(160,Math.floor(p)),d=Math.max(120,Math.floor(d)),o.style.width=`${p}px`,o.style.height=`${d}px`,o.style.top=`${h+Math.max(0,(r-d)/2)}px`,t?.(p,d)};return window.addEventListener("resize",a),a(),a}function _t(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!e)return;let a=n=>{n?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(n))};t?.addEventListener("click",()=>a(e.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function kt(e,t,o){let a=n=>{for(let[s,i]of e)s.setAttribute("aria-pressed",String(i===n));t(n)};for(let[n,s]of e)n.addEventListener("click",()=>a(s));return o!==void 0&&a(o),a}function Ut(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let o=e[t.key.length===1?t.key.toLowerCase():t.key];o&&(t.preventDefault(),o(t))})}function qt(e,t=!0){let o=document.getElementById("btn-play"),a=n=>{t=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),e(n)};return o?.addEventListener("click",()=>a(!t)),a(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function Dt(){document.body.classList.add("ready")}var Qe=Math.PI/4,Ye=Math.atan(1/Math.SQRT2),St=Math.PI/180,K=document.getElementById("scene"),tt=new P.WebGLRenderer({canvas:K,antialias:!0});tt.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var Kt=new P.Color(15525333),ke=new P.Color(15328988);tt.setClearColor(Kt,1);var Qt=new P.Scene,D=Bt(),Re=new P.Vector3(1,0,-1).normalize(),He=new P.Vector3(-1,2,-1).normalize(),Yt=new P.Vector3(1,1,1).normalize(),Gt=40*St;function Se(e){let t=Math.cos(Gt),o=Math.sin(Gt);return new P.Vector3().addScaledVector(Re,t*Math.cos(e)).addScaledVector(He,t*Math.sin(e)).addScaledVector(Yt,o).normalize()}var J=128*St,Zt=J+Math.PI,mt=new P.Mesh(yt().build(),bt(D,{hatch:.75,transparent:!0})),zt=new P.Mesh(Nt().build(),bt(D,{hatch:.55,transparent:!0}));for(let e of[mt,zt])e.frustumCulled=!1,Qt.add(e);var $t=(e,t,o=0)=>{let a=e*Math.SQRT2,n=t*Math.sqrt(6),s=(o+n)/3,i=2*s-n;return new P.Vector3((i+a)/2,s,(i-a)/2)},st=[{key:"arcade",mesh:mt,H:23.5,target:$t(0,1.15),split:1},{key:"stairs",mesh:zt,H:17.5,target:$t(.15,2.55),split:0}],q=new P.OrthographicCamera(-1,1,1,-1,.1,400),G=0,Rt=30/38,Le=600,Jt=760,ut=1;function pt(){let e=st[G];q.position.copy(e.target).addScaledVector(Yt,150),q.up.set(0,1,0),q.lookAt(e.target);let t=e.H/2;q.left=-t*Rt,q.right=t*Rt,q.top=t,q.bottom=-t,q.updateProjectionMatrix()}var X=document.getElementById("overlay"),b=X.getContext("2d");Wt(30/38,(e,t)=>{tt.setSize(e,t),Rt=e/t,Le=e,Jt=t,ut=Math.min(window.devicePixelRatio||1,2),X.width=Math.round(e*ut),X.height=Math.round(t*ut),X.style.width=`${e}px`,X.style.height=`${t}px`,pt()});_t();var c={litho:1,lithoTarget:1,theta:J,thetaFrom:J,thetaTo:J,swing:1,shade:1,shadeTarget:1,cycle:0,fade:1,switching:null};kt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{c.lithoTarget=e,document.body.classList.toggle("colour",!e)},1);var te=[["btn-above","above"],["btn-flat","none"],["btn-below","below"]].map(([e,t])=>[document.getElementById(e),t]);function gt(e){for(let[t,o]of te)t.setAttribute("aria-pressed",String(o===e))}function ee(e){let t=e;for(;t-c.theta>Math.PI;)t-=2*Math.PI;for(;t-c.theta<-Math.PI;)t+=2*Math.PI;c.thetaFrom=c.theta,c.thetaTo=t,c.swing=0}function z(e,t=!0){if(t&&it(!1),gt(e),e==="none"){c.shadeTarget=0;return}c.shadeTarget=1,ee(e==="above"?J:Zt)}for(let[e,t]of te)e.addEventListener("click",()=>z(t));var Lt=!0,it=qt(e=>{Lt=e,e&&(c.cycle=0)}),Ie=[document.getElementById("btn-arcade"),document.getElementById("btn-stairs")],vt=kt(Ie.map((e,t)=>[e,t]),e=>{if(e===G){c.switching&&(c.switching={to:e,t:c.fade*.5});return}c.switching={to:e,t:(1-c.fade)*.35}});Ut({" ":()=>it(!Lt),l:()=>document.getElementById(c.lithoTarget?"btn-colour":"btn-litho").click(),a:()=>z("above"),b:()=>z("below"),n:()=>z("none"),s:()=>z(Math.sin(c.thetaTo)>0?"below":"above"),1:()=>vt(0),2:()=>vt(1)});var It=!1;function oe(e){let t=K.getBoundingClientRect(),o=e.clientX-t.left-t.width/2,a=t.height/2-(e.clientY-t.top);if(Math.hypot(o,a)<6)return;c.theta=Math.atan2(a,o),c.thetaTo=c.theta,c.swing=1,c.shadeTarget=1;let n=Math.sin(c.theta);gt(n>.25?"above":n<-.25?"below":"")}K.addEventListener("pointerdown",e=>{K.setPointerCapture(e.pointerId),It=!0,it(!1),oe(e)});K.addEventListener("pointermove",e=>{It&&oe(e)});var ne=()=>{It=!1};K.addEventListener("pointerup",ne);K.addEventListener("pointercancel",ne);var dt=document.getElementById("caption"),Pe={arcade:{above:"Lit from above: the left half is seen from above, the right half (the same lines) from below.",side:"With the light from the side, the habit of assuming light from above has nothing to work with.",below:"Lit from below, the readings swap: the right half looks solid, the left half hollow.",none:"Without shading the drawing is symmetric, and either half reads either way."},stairs:{above:"Lit from above: steps seen from above, climbing to the left against a wall.",side:"With the light from the side, the habit of assuming light from above has nothing to work with.",below:"Lit from below: the same lines become steps hanging from a ceiling.",none:"Schr\xF6der\u2019s stairs (1858): unshaded, the drawing flips between both readings by itself."}},Xt="";function Ht(e){e!==Xt&&(Xt=e,dt.classList.add("swap"),clearTimeout(Ht.timer),Ht.timer=setTimeout(()=>{dt.textContent=e,dt.classList.remove("swap")},260))}function Ae(){b.clearRect(0,0,X.width,X.height);let e=ut*Math.min(1.25,Math.max(.75,Jt/860)),t=21*e,o=X.width-(t+26*e),a=t+24*e,n=c.litho>.5?"rgba(36, 32, 28, ":"rgba(52, 44, 36, ";b.save(),b.globalAlpha=c.fade,b.lineWidth=1.1*e,b.strokeStyle=n+"0.55)",b.setLineDash([2.5*e,2.5*e]),b.beginPath(),b.arc(o,a,t,0,Math.PI*2),b.stroke(),b.setLineDash([]),b.beginPath(),b.moveTo(o,a-t-3*e),b.lineTo(o,a-t+3*e),b.stroke();let s=c.shade,i=o+Math.cos(c.theta)*t,l=a-Math.sin(c.theta)*t;b.globalAlpha=c.fade*(.25+.75*s),b.strokeStyle=n+"0.9)",b.lineWidth=1.2*e;for(let p=0;p<8;p++){let f=p/8*Math.PI*2;b.beginPath(),b.moveTo(i+Math.cos(f)*6.5*e,l+Math.sin(f)*6.5*e),b.lineTo(i+Math.cos(f)*9.5*e,l+Math.sin(f)*9.5*e),b.stroke()}b.fillStyle="rgba(236, 229, 213, 1)",b.beginPath(),b.arc(i,l,4.6*e,0,Math.PI*2),b.fill(),b.stroke();let h=o+(i-o)*.18,m=a+(l-a)*.18,u=o+(i-o)*.62,r=a+(l-a)*.62;b.beginPath(),b.moveTo(u,r),b.lineTo(h,m),b.stroke();let d=Math.atan2(m-r,h-u);b.beginPath(),b.moveTo(h,m),b.lineTo(h-Math.cos(d-.45)*5*e,m-Math.sin(d-.45)*5*e),b.moveTo(h,m),b.lineTo(h-Math.cos(d+.45)*5*e,m-Math.sin(d+.45)*5*e),b.stroke(),b.globalAlpha=c.fade,b.fillStyle=n+"0.7)",b.font=`italic ${Math.round(11*e)}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`,b.textAlign="center",b.textBaseline="top",b.fillText("light",o,a+t+7*e),b.restore()}var Be=6.5,Ce=2.6,jt=performance.now();function Oe(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2}function ae(e){let t=Math.min(.05,Math.max(0,(e-jt)/1e3));if(jt=e,Lt&&(c.cycle+=t,c.cycle>Be&&c.swing>=1)){c.cycle=0,c.shadeTarget=1;let i=Math.sin(c.theta)>0;gt(i?"below":"above"),ee(i?Zt:J)}if(c.swing<1&&(c.swing=Math.min(1,c.swing+t/Ce),c.theta=c.thetaFrom+(c.thetaTo-c.thetaFrom)*Oe(c.swing)),c.shade+=Math.sign(c.shadeTarget-c.shade)*Math.min(Math.abs(c.shadeTarget-c.shade),t*1.8),c.litho!==c.lithoTarget){let i=c.lithoTarget-c.litho;c.litho+=Math.sign(i)*Math.min(Math.abs(i),t*2.2)}D.uLitho.value=c.litho;let o=ke.clone().lerp(Kt,c.litho);tt.setClearColor(o,1);let a=o.clone().convertLinearToSRGB();if(D.uBg.value.set(a.r,a.g,a.b),c.switching){let i=c.switching;i.t+=t,i.to!==G?(c.fade=Math.max(0,1-i.t/.35),c.fade===0&&(G=i.to,pt(),i.t=0)):(c.fade=Math.min(1,i.t/.5),c.fade>=1&&(c.switching=null))}st.forEach((i,l)=>{i.mesh.visible=l===G,i.mesh.material.uniforms.uFade.value=c.fade}),D.uLight.value.copy(Se(c.theta)),D.uShade.value=c.shade,D.uSplit.value=st[G].split,D.uTime.value=e/1e3,tt.render(Qt,q),Ae();let n=Math.sin(c.theta),s=n>.3?"above":n<-.3?"below":"side";c.shade<.35&&(s="none"),Ht(Pe[st[G].key][s]),dt.style.opacity=String(c.fade),requestAnimationFrame(ae)}Dt();requestAnimationFrame(ae);window.__page={state:c,setLight:z,setPlaying:it,setMode:vt,updateCamera:pt,MODES:st,ARC:$,SCH:Tt,shared:D,renderer:tt,get mode(){return G},rebuild(e){Object.assign($,e),mt.geometry.dispose(),mt.geometry=yt().build()},show(e,t=128,o=1){it(!1),G=e,vt(e),c.switching=null,c.fade=1,c.theta=c.thetaTo=t*St,c.swing=1,c.shade=c.shadeTarget=o;let a=Math.sin(c.theta);gt(o<.5?"none":a>.25?"above":a<-.25?"below":""),pt()}};})();
