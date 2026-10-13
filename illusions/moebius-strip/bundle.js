(()=>{var _e=Object.create;var jt=Object.defineProperty;var Oe=Object.getOwnPropertyDescriptor;var Ge=Object.getOwnPropertyNames;var Ne=Object.getPrototypeOf,ze=Object.prototype.hasOwnProperty;var Ue=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var We=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Ge(t))!ze.call(e,s)&&s!==n&&jt(e,s,{get:()=>t[s],enumerable:!(o=Oe(t,s))||o.enumerable});return e};var Q=(e,t,n)=>(n=e!=null?_e(Ne(e)):{},We(t||!e||!e.__esModule?jt(n,"default",{value:e,enumerable:!0}):n,e));var X=Ue((dn,Yt)=>{Yt.exports=window.THREE});var A=Q(X(),1);var _=Q(X(),1);function Xt(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new _.Vector3(-.35,.85,.55).normalize()},uPaper:{value:new _.Vector3(.925,.898,.835)},uInk:{value:new _.Vector3(.11,.1,.09)},uHaze:{value:new _.Vector3(.83,.86,.84)},uSpot:{value:new _.Vector3(.78,.27,.18)},uPaint:{value:0},uPaintFrom:{value:0},uMark:{value:0},uFade:{value:1}}}var qe=`
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
`,De=`
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face, float spot) {
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
  vec3 litho = mix(uInk, mix(uPaper, uSpot, spot), v);
  return mix(colour, litho, uLitho);
}
`,je=`
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
attribute float asig;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying float vSig;
varying vec3 vV;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vSig = asig;
  vV = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ye=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uSpot;
uniform float uPaint;
uniform float uPaintFrom;
uniform float uMark;
uniform float uFade;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying float vSig;
varying vec3 vV;
${qe}
${De}
const float FOUR_PI = 12.566370614359172;

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float diff = max(dot(n, uLight), 0.0);
  float rim = pow(1.0 - abs(dot(n, normalize(vV))), 3.0);
  float shade = 0.42 + 0.62 * diff;
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;
  float spot = 0.0;

  if (pat == 2.0) {            // the band's faces: fine wood grain along the straps
    float g = vnoise(vec2(uv.x * 1.6, uv.y * 26.0));
    tex = 0.95 + 0.08 * g;
  } else if (pat == 3.0) {     // the walls round the holes
    shade *= 0.9;
  } else if (pat == 4.0) {     // ant
    shade = 0.5 + 0.5 * diff + rim * 0.25;
  } else if (pat == 5.0) {     // lead ant: spot colour
    shade = 0.55 + 0.5 * diff + rim * 0.2;
    spot = 1.0;
  }

  vec3 col = vC * tex * shade;
  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  // ants are printed in nearly solid ink: no hatching across their bodies
  vec2 huv = pat >= 4.0 ? vec2(0.0) : uv;
  vec3 outc = finish(col, vM.y, ink, huv, fw, face, spot);

  // paint: spreads both ways from where it was put down, along the single
  // side. Each front runs 2\u03C0; they meet on the far face, behind the start.
  if (vSig >= 0.0 && uPaint > 0.0) {
    float d = mod(vSig - uPaintFrom, FOUR_PI);
    float dd = min(d, FOUR_PI - d);
    float reach = uPaint * 6.2831853;
    float on = 1.0 - smoothstep(reach - 0.015, reach + 0.015, dd);
    if (uPaint >= 1.0) on = 1.0;
    float k = dd / 6.2831853;
    vec3 c0 = vec3(0.99, 0.84, 0.55), c1 = vec3(0.88, 0.52, 0.32);
    vec3 tint = mix(c0, c1, k);
    // a fine stripe every 30 degrees of travel, so the colour can be followed
    float sv = dd / 0.5235988;
    float stripe = 1.0 - smoothstep(0.0, fwidth(sv) * 1.5 + 0.03, abs(fract(sv + 0.5) - 0.5));
    tint *= 1.0 - 0.12 * stripe;
    float front = (1.0 - smoothstep(0.0, 0.09, abs(dd - reach))) * step(uPaint, 0.999);
    outc = mix(outc, outc * tint * 1.04, on);
    outc = mix(outc, vec3(0.75, 0.3, 0.16), front * 0.65);
  }
  // the start mark across the centre strap: solid at 0\xB0, outlined at 360\xB0
  if (pat == 2.0 && abs(uv.y) < 0.24) {
    float dm = mod(vSig - uMark + 6.2831853, FOUR_PI) - 6.2831853; // \u22122\u03C0 \u2026 2\u03C0
    float far = mod(vSig - uMark, FOUR_PI) - 6.2831853;
    float px = fwidth(vSig);
    float solid = 1.0 - smoothstep(0.011, 0.011 + px, abs(dm));
    float ring = abs(abs(far) - 0.011);
    float hollow = (1.0 - smoothstep(0.0025, 0.0025 + px, ring)) * step(abs(uv.y), 0.235);
    vec3 red = mix(vec3(0.72, 0.2, 0.13), vec3(0.66, 0.16, 0.1), uLitho);
    outc = mix(outc, red, max(solid, hollow * 0.9));
  }
  gl_FragColor = vec4(outc, uFade);
}
`;function $t(e,t={}){return new _.ShaderMaterial({uniforms:e,vertexShader:je,fragmentShader:Ye,side:t.side??_.FrontSide,transparent:!!t.transparent})}var O=Q(X(),1),kt=3.05,Pt=3.75,it=(kt+Pt)/2,at=1.05,te=.07,ee=9,Kt=-Math.PI*.42,Xe=.8,ne=.11,$e=.24,Ke=.08,Zt=.07,Ht=Math.PI*2;function Bt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function pt(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function Ze(e){return[kt*Math.cos(e),Pt*Math.sin(e),0]}function Qe(e){return(e-Kt-Math.PI)/2+Xe/2*Math.sin(e-Kt)}function oe(e){let t=pt([Pt*Math.cos(e),kt*Math.sin(e),0]),n=Qe(e),o=Math.cos(n),s=Math.sin(n);return[s*t[0],s*t[1],o]}function J(e,t){let n=Ze(e),o=oe(e);return[n[0]+t*o[0],n[1]+t*o[1],n[2]+t*o[2]]}function Lt(e,t){let o=J(e+1e-5,t),s=J(e-1e-5,t);return[(o[0]-s[0])/(2*1e-5),(o[1]-s[1])/(2*1e-5),(o[2]-s[2])/(2*1e-5)]}function se(e,t){return pt(Bt(Lt(e,t),oe(e)))}function ae(e,t){let n=Lt(e,t);return Math.hypot(n[0],n[1],n[2])}function Qt(e,t,n){let o=Math.max(n-Math.abs(e-t),0)/n;return Math.max(e,t)+o*o*n*.25}function Je(e,t,n,o,s,a){let r=s-n,l=a-o,u=Math.max(0,Math.min(1,((e-n)*r+(t-o)*l)/(r*r+l*l)));return Math.hypot(e-n-u*r,t-o-u*l)}var Rt=at-ne,At=Ht/ee;function tn(e,t){let n=ae(e,t),o=ne-Math.abs(Math.abs(t)-Rt);o=Qt(o,$e-Math.abs(t),Zt);let s=Math.floor(e/At);for(let a=s-1;a<=s+1;a++){let r=a*At,l=(a+1)*At,u=a%2===0?1:-1;for(let f of[1,-1]){let m=-u*f*Rt,w=u*f*Rt,h=Je((e-r)*n,t,0,m,(l-r)*n,w);o=Qt(o,Ke-h,Zt)}}return o}var en=1e3,It=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.sig=[]}tri(t,n,o,s,a=0){let[r,l,u]=t.map(i=>i.p),f=(i,c)=>[i[0]-c[0],i[1]-c[1],i[2]-c[2]],m=i=>Math.hypot(i[0],i[1],i[2]),w=m(Bt(f(l,r),f(u,r))),h=[w/(m(f(u,l))||1),w/(m(f(r,u))||1),w/(m(f(l,r))||1)];for(let i=0;i<3;i++){let c=t[i];this.pos.push(c.p[0],c.p[1],c.p[2]),this.nrm.push(c.n[0],c.n[1],c.n[2]),this.col.push(o[0],o[1],o[2]),this.uv.push(c.uv[0],c.uv[1]),this.sig.push(c.sig);for(let p=0;p<3;p++)this.edg.push(n[p]?i===p?h[p]:0:en);this.mat.push(s,a,0)}}build(){let t=new O.BufferGeometry;return t.setAttribute("position",new O.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new O.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new O.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new O.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new O.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new O.Float32BufferAttribute(this.mat,3)),t.setAttribute("asig",new O.Float32BufferAttribute(this.sig,1)),t.computeBoundingSphere(),t}};function Jt(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function ie(e={}){let t=e.ns??ee*44,n=e.nt??44,o=Jt(e.face??15327176),s=Jt(e.wall??12035461),a=Ht/t,r=2*at/n,l=new Float64Array((t+1)*(n+1));for(let i=0;i<=t;i++)for(let c=0;c<=n;c++)l[i*(n+1)+c]=tn(i*a,-at+c*r);for(let i=0;i<=n;i++)l[t*(n+1)+i]=l[n-i];let u=(i,c)=>c===0||c===n?Math.min(-1e-4,l[i*(n+1)+c]):l[i*(n+1)+c],f=new It,m=te/2,w=(i,c,p)=>{let x=J(i,c),E=se(i,c),b=p*m;return{p:[x[0]+E[0]*b,x[1]+E[1]*b,x[2]+E[2]*b],n:p>0?E:[-E[0],-E[1],-E[2]]}},h=(i,c)=>{let p=w(i[0],i[1],c);return{p:p.p,n:p.n,uv:[i[0]*it,i[1]],sig:c>0?i[0]:i[0]+Ht}};for(let i=0;i<t;i++)for(let c=0;c<n;c++){let p=[[i,c],[i+1,c],[i+1,c+1],[i,c+1]],x=p.map(([v,M])=>u(v,M));if(x.every(v=>v<=0))continue;let E=[],b=[];for(let v=0;v<4;v++){let[M,H]=p[v],[L,S]=p[(v+1)%4],P=x[v],F=x[(v+1)%4];if(P>0&&(E.push([M*a,-at+H*r]),b.push(!1)),P>0!=F>0){let k=P/(P-F);E.push([(M+(L-M)*k)*a,-at+(H+(S-H)*k)*r]),b.push(P>0)}}let d=E.length;if(d<3)continue;let y=E.map(v=>h(v,1)),R=E.map(v=>h(v,-1));for(let v=1;v<d-1;v++){let M=[b[v]?1:0,v+1===d-1&&b[d-1]?1:0,v===1&&b[0]?1:0];f.tri([y[0],y[v],y[v+1]],M,o,2),f.tri([R[0],R[v+1],R[v]],[M[0],M[2],M[1]],o,2)}for(let v=0;v<d;v++){if(!b[v])continue;let M=E[v],H=E[(v+1)%d],L=h(M,1),S=h(H,1),P=h(M,-1),F=h(H,-1),k=[(M[0]+H[0])/2,(M[1]+H[1])/2],lt=[H[1]-M[1],-(H[0]-M[0])],Dt=Math.hypot(lt[0]*ae(k[0],k[1]),lt[1])||1,wt=J(k[0],k[1]),Mt=J(k[0]+lt[0]/Dt*.01,k[1]+lt[1]/Dt*.01),ft=pt([Mt[0]-wt[0],Mt[1]-wt[1],Mt[2]-wt[2]]),Le=Math.hypot(H[0]-M[0],H[1]-M[1]),Se=(k[0]*it+k[1])*1,ht=(Fe,Ce,Ve)=>({p:Fe.p,n:ft,uv:[Se+Ve*Le,Ce*m*4],sig:-1}),V=ht(L,1,0),Z=ht(P,-1,0),Y=ht(F,-1,1),Tt=ht(S,1,1),yt=Bt([Z.p[0]-V.p[0],Z.p[1]-V.p[1],Z.p[2]-V.p[2]],[Y.p[0]-V.p[0],Y.p[1]-V.p[1],Y.p[2]-V.p[2]]);yt[0]*ft[0]+yt[1]*ft[1]+yt[2]*ft[2]<0&&([V,Z,Y,Tt]=[Tt,Y,Z,V]),f.tri([V,Z,Y],[1,0,0],s,3),f.tri([V,Y,Tt],[1,0,0],s,3)}}return f.build()}function re(e,t=0){let n=J(e,0),o=se(e,0),s=pt(Lt(e,0)),a=te/2+t;return{p:[n[0]+o[0]*a,n[1]+o[1]*a,n[2]+o[2]*a],up:o,fwd:s}}var N=Q(X(),1);var I=Q(X(),1),nn=1e3,dt={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function on(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function $(e,t=dt.PLAIN,n={}){return{c:typeof e=="number"?on(e):e,p:t,f:n.f||0,w:n.w||0,s:n.s||0}}var ce=["px","nx","py","ny","pz","nz"];function U(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function St(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function rt(e){return Math.hypot(e[0],e[1],e[2])}function G(e){let t=rt(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function Ft(e,t){let n=Math.abs(t[0]),o=Math.abs(t[1]),s=Math.abs(t[2]);return n>=o&&n>=s?[e[2],e[1]]:s>=o?[e[0],e[1]]:[e[0],e[2]]}var tt=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new I.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new I.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let n=this.m.elements,o=t[0],s=t[1],a=t[2];return[n[0]*o+n[4]*s+n[8]*a+n[12],n[1]*o+n[5]*s+n[9]*a+n[13],n[2]*o+n[6]*s+n[10]*a+n[14]]}_tn(t){if(!this.nm)return t;let n=this.nm.elements,o=t[0],s=t[1],a=t[2];return G([n[0]*o+n[3]*s+n[6]*a,n[1]*o+n[4]*s+n[7]*a,n[2]*o+n[5]*s+n[8]*a])}tri(t,n,o,s,a=[1,1,1],r={}){let l=this._tp(t),u=this._tp(n),f=this._tp(o),m=G(St(U(n,t),U(o,t))),w=r.uv||[Ft(t,m),Ft(n,m),Ft(o,m)],h=G(St(U(u,l),U(f,l))),i=r.n?r.n.map(d=>this._tn(d)):[h,h,h],c=rt(St(U(u,l),U(f,l))),p=[c/(rt(U(f,u))||1),c/(rt(U(l,f))||1),c/(rt(U(u,l))||1)],x=r.k||[1,1,1],E=s.s||0,b=[l,u,f];for(let d=0;d<3;d++){let y=b[d];this.pos.push(y[0]+E,y[1]+E,y[2]+E),this.nrm.push(i[d][0],i[d][1],i[d][2]),this.col.push(s.c[0]*x[d],s.c[1]*x[d],s.c[2]*x[d]),this.uv.push(w[d][0],w[d][1]);for(let R=0;R<3;R++)a[R]?this.edg.push(d===R?p[R]:0):this.edg.push(nn);this.mat.push(s.p,s.f,s.w)}}quad(t,n,o,s,a,r=[1,1,1,1],l={}){let u=l.k||[1,1,1,1],f=l.n,m=l.uv;this.tri(t,n,o,a,[r[1],0,r[0]],{k:[u[0],u[1],u[2]],n:f&&[f[0],f[1],f[2]],uv:m&&[m[0],m[1],m[2]]}),this.tri(t,o,s,a,[r[2],r[3],0],{k:[u[0],u[2],u[3]],n:f&&[f[0],f[2],f[3]],uv:m&&[m[0],m[2],m[3]]})}box(t,n,o,s,a,r,l,u={}){t>s&&([t,s]=[s,t]),n>a&&([n,a]=[a,n]),o>r&&([o,r]=[r,o]);let f=new Set(u.open||[]),m=new Set(u.skip||[]);u.bottom||m.add("ny");let w=u.ao??1,h=u.aoTop??1,i={px:[0,s],nx:[0,t],py:[1,a],ny:[1,n],pz:[2,r],nz:[2,o]},c={px:[[s,n,r],[s,n,o],[s,a,o],[s,a,r]],nx:[[t,n,o],[t,n,r],[t,a,r],[t,a,o]],pz:[[t,n,r],[s,n,r],[s,a,r],[t,a,r]],nz:[[s,n,o],[t,n,o],[t,a,o],[s,a,o]],py:[[t,a,r],[s,a,r],[s,a,o],[t,a,o]],ny:[[t,n,o],[s,n,o],[s,n,r],[t,n,r]]};for(let p of ce){if(m.has(p)||f.has(p))continue;let x=c[p],E=[];for(let y=0;y<4;y++){let R=x[y],v=x[(y+1)%4],M=1;for(let H of ce){if(H===p)continue;let[L,S]=i[H];Math.abs(R[L]-S)<1e-9&&Math.abs(v[L]-S)<1e-9&&f.has(H)&&(M=0)}E.push(M)}let b;p==="py"||p==="ny"?b=[h,h,h,h]:b=[w,w,1,1];let d=p==="py"&&u.top?{...u.top,s:l.s}:l;this.quad(x[0],x[1],x[2],x[3],d,E,{k:b})}}cyl(t,n,o,s,a,r,l,u={}){let f=u.caps??[!0,!0],m=u.rim??[1,1],w=u.r1??s;for(let h=0;h<r;h++){let i=h/r*Math.PI*2,c=(h+1)/r*Math.PI*2,p=Math.cos(i),x=Math.sin(i),E=Math.cos(c),b=Math.sin(c),d=[t+s*p,n,o+s*x],y=[t+w*p,a,o+w*x],R=[t+w*E,a,o+w*b],v=[t+s*E,n,o+s*b],M=(s-w)/Math.max(1e-6,a-n),H=G([p,M,x]),L=G([E,M,b]),S=i*(s+w)/2,P=c*(s+w)/2;this.quad(d,y,R,v,l,[0,m[1],0,m[0]],{n:[H,H,L,L],uv:[[S,n],[S,a],[P,a],[P,n]],k:u.k}),f[1]&&w>0&&this.tri([t,a,o],R,y,l,[1,0,0]),f[0]&&this.tri([t,n,o],d,v,l,[1,0,0])}}lathe(t,n,o,s,a,r,l={}){let u=s.length,f=[];for(let h=0;h<u-1;h++){let i=s[h+1][0]-s[h][0],c=s[h+1][1]-s[h][1];f.push(G([c,-i,0]))}let m=s.map((h,i)=>{let c=f[Math.max(0,i-1)],p=f[Math.min(u-2,i)];return G([c[0]+p[0],c[1]+p[1],0])}),w=l.edges||[];for(let h=0;h<a;h++){let i=h/a*Math.PI*2,c=(h+1)/a*Math.PI*2,p=Math.cos(i),x=Math.sin(i),E=Math.cos(c),b=Math.sin(c);for(let d=0;d<u-1;d++){let[y,R]=s[d],[v,M]=s[d+1],H=[t+y*p,n+R,o+y*x],L=[t+v*p,n+M,o+v*x],S=[t+v*E,n+M,o+v*b],P=[t+y*E,n+R,o+y*b],F=l.flat?f[d]:m[d],k=l.flat?f[d]:m[d+1];this.quad(H,L,S,P,r,[0,w[d+1]?1:0,0,w[d]?1:0],{n:[[F[0]*p,F[1],F[0]*x],[k[0]*p,k[1],k[0]*x],[k[0]*E,k[1],k[0]*b],[F[0]*E,F[1],F[0]*b]],uv:[[i*1.2,R],[i*1.2,M],[c*1.2,M],[c*1.2,R]]})}}}poly(t,n,o={}){for(let s=1;s<t.length-1;s++)this.tri(t[0],t[s],t[s+1],n,[1,s===t.length-2?1:0,s===1?1:0],o)}blob(t,n,o,s,a,r,l,u={}){let f=u.sub??1,m=u.seed??0,w=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let c=0;c<f;c++){let p=[];for(let[x,E,b]of w){let d=G([(x[0]+E[0])/2,(x[1]+E[1])/2,(x[2]+E[2])/2]),y=G([(E[0]+b[0])/2,(E[1]+b[1])/2,(E[2]+b[2])/2]),R=G([(b[0]+x[0])/2,(b[1]+x[1])/2,(b[2]+x[2])/2]);p.push([x,d,R],[d,E,y],[R,y,b],[d,y,R])}w=p}let h=c=>1+(u.lump??.12)*Math.sin(c[0]*5.1+m)*Math.sin(c[1]*4.3+m*1.7)*Math.sin(c[2]*3.7+m*.3),i=c=>{let p=h(c);return[t+c[0]*s*p,n+c[1]*a*p,o+c[2]*r*p]};for(let[c,p,x]of w)this.tri(i(c),i(p),i(x),l,[0,0,0],{n:[c,p,x],k:u.k})}build(){let t=new I.BufferGeometry;return t.setAttribute("position",new I.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new I.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new I.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new I.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new I.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new I.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}},C={T:(e,t,n)=>new I.Matrix4().makeTranslation(e,t,n),RX:e=>new I.Matrix4().makeRotationX(e),RY:e=>new I.Matrix4().makeRotationY(e),RZ:e=>new I.Matrix4().makeRotationZ(e),S:(e,t,n)=>new I.Matrix4().makeScale(e,t??e,n??e),chain:(...e)=>e.reduce((t,n)=>t.multiply(n),new I.Matrix4)};var W=Q(X(),1);var sn=new W.Vector3(0,1,0);function et(e,t,n,o,s,a={}){let r=new W.Vector3(n[0]-t[0],n[1]-t[1],n[2]-t[2]),l=r.length();if(l<1e-6)return;let u=new W.Quaternion().setFromUnitVectors(sn,r.normalize()),f=new W.Matrix4().compose(new W.Vector3(t[0],t[1],t[2]),u,new W.Vector3(1,1,1));e.push(f),e.cyl(0,0,0,o,l,a.seg??6,s,{r1:a.r1??o*.85,rim:a.rim??[0,1],caps:a.caps??[!1,!0]}),e.pop()}var xn=$(14268832,dt.PLAIN),bn=$(3878953,dt.PLAIN);var fe=1.3,mt=[{z:.06,x:.028,fz:.15,fx:.17,group:0},{z:.025,x:.032,fz:0,fx:.2,group:1},{z:-.012,x:.03,fz:-.15,fx:.18,group:0}],vt=.072,he=.3,pe=2*(2*he*.18)*fe;function Ct(e){let t=e.getAttribute("position").count;return e.setAttribute("asig",new N.Float32BufferAttribute(new Float32Array(t).fill(-1),1)),e}function an(e,t){let n=new tt,o=$(e,t);n.push(C.chain(C.T(0,.098,-.2),C.RX(-.22))),n.blob(0,0,0,.078,.07,.115,o,{sub:3,lump:0}),n.pop(),n.blob(0,.082,-.075,.022,.032,.022,o,{sub:1,lump:0}),n.push(C.chain(C.T(0,vt+.008,.03),C.RX(.12))),n.blob(0,0,0,.04,.042,.088,o,{sub:2,lump:0}),n.pop(),n.blob(0,vt+.035,-.02,.03,.022,.03,o,{sub:1,lump:0}),n.push(C.chain(C.T(0,.092,.165),C.RX(.25))),n.blob(0,0,0,.055,.048,.06,o,{sub:3,lump:0}),n.pop();for(let s of[-1,1])et(n,[.022*s,.07,.21],[.004*s,.062,.245],.009,o,{seg:5,r1:.004});return Ct(n.build())}function ue(e,t,n,o){let s=mt[e],a=new tt,r=$(n,o),l=(s.fx-s.x)*t,u=s.fz-s.z,f=[l*.45,.06,u*.42],m=[l,-vt,u];return et(a,[0,0,0],f,.011,r,{seg:5,r1:.009}),et(a,f,m,.009,r,{seg:5,r1:.0045}),a.blob(f[0],f[1],f[2],.011,.011,.011,r,{sub:0,lump:0}),Ct(a.build())}function le(e,t,n){let o=new tt,s=$(t,n),a=[.06*e,.06,.035];return et(o,[0,0,0],a,.0075,s,{seg:5,r1:.006}),et(o,a,[.085*e,.025,.15],.006,s,{seg:5,r1:.006}),o.blob(.085*e,.025,.15,.009,.009,.012,s,{sub:0,lump:0}),Ct(o.build())}var Et=class{constructor(t,n){this.root=new N.Group,this.root.add(new N.Mesh(t.body,n)),this.legs=[];for(let o=0;o<3;o++)for(let s of[1,-1]){let a=new N.Group;a.position.set(mt[o].x*s,vt,mt[o].z),a.add(new N.Mesh(t.legs[o][s>0?0:1],n)),this.root.add(a);let r=(mt[o].group+(s>0?0:1))%2;this.legs.push({g:a,side:s,tripod:r,i:o})}this.antennae=[];for(let o of[1,-1]){let s=new N.Group;s.position.set(.022*o,.118,.195),s.add(new N.Mesh(t.antennae[o>0?0:1],n)),this.root.add(s),this.antennae.push({g:s,side:o})}this.root.scale.setScalar(fe)}pose(t,n){for(let o of this.legs){let a=((t+o.tripod*Math.PI)/(Math.PI*2)%1+1)%1,r,l;if(a<.5)r=1-4*a,l=0;else{let u=(a-.5)*2;r=-1+2*(u*u*(3-2*u)),l=Math.sin(u*Math.PI)}o.g.rotation.y=-r*he*o.side,o.g.rotation.z=l*.34*o.side}for(let o of this.antennae)o.g.rotation.x=Math.sin(n*3.1+o.side)*.12,o.g.rotation.y=Math.sin(n*2.3+o.side*2)*.1*o.side}};function Vt(e,t){return{body:an(e,t),legs:[0,1,2].map(n=>[ue(n,1,e,t),ue(n,-1,e,t)]),antennae:[le(1,e,t),le(-1,e,t)]}}function de(e,t){let n=document.getElementById("frame"),o=()=>{let a=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),l=document.getElementById("controls"),u=(r?r.offsetHeight:0)+6+13,f=(l?l.offsetHeight:0)+8+13,m=window.innerWidth-a*2,w=window.innerHeight-u-f,h=w,i=h*e;i>m&&(i=m,h=i/e),i=Math.max(160,Math.floor(i)),h=Math.max(120,Math.floor(h)),n.style.width=`${i}px`,n.style.height=`${h}px`,n.style.top=`${u+Math.max(0,(w-h)/2)}px`,t?.(i,h)};return window.addEventListener("resize",o),o(),o}function me(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!e)return;let o=s=>{s?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(s))};t?.addEventListener("click",()=>o(e.hasAttribute("hidden"))),n?.addEventListener("click",()=>o(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&o(!1)})}function ve(e,t,n){let o=s=>{for(let[a,r]of e)a.setAttribute("aria-pressed",String(r===s));t(s)};for(let[s,a]of e)s.addEventListener("click",()=>o(a));return n!==void 0&&o(n),o}function Ee(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let n=e[t.key.length===1?t.key.toLowerCase():t.key];n&&(t.preventDefault(),n(t))})}function ge(e,t=!0){let n=document.getElementById("btn-play"),o=s=>{t=s,n&&(n.setAttribute("aria-pressed",String(!s)),n.querySelector("span").textContent=s?"Pause":"Play",n.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),e(s)};return n?.addEventListener("click",()=>o(!t)),o(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),o}function xe(){document.body.classList.add("ready")}var ut=Math.PI*2,B=Math.PI*4,Ot=9,rn=.5,cn=.045,Te=30/38,j=document.getElementById("scene"),st=new A.WebGLRenderer({canvas:j,antialias:!0});st.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var Ut=new A.Color(15525333),ye=new A.Color(15197144);st.setClearColor(Ut,1);var Re=new A.Scene,z=Xt(),Ae=$t(z),ot=new A.Group;ot.rotation.set(-.3,0,.06);Re.add(ot);var un=new A.Mesh(ie({face:14672584,wall:9345144}),Ae);ot.add(un);var ln=Vt(3876384,4),fn=Vt(12075820,5),Wt=[];for(let e=0;e<Ot;e++){let t=new Et(e===0?fn:ln,Ae);ot.add(t.root),Wt.push(t)}var q=new A.PerspectiveCamera(28,Te,.5,200),T={az:1.05,el:.26,dist:24,auto:!0,resume:0},gt=new A.Vector3(0,-1,0),hn=new A.Vector3(-.42,.78,.46).normalize();function He(){let e=Math.cos(T.el);q.position.set(gt.x+T.dist*e*Math.sin(T.az),gt.y+T.dist*Math.sin(T.el),gt.z+T.dist*e*Math.cos(T.az)),q.lookAt(gt),q.updateMatrixWorld(),z.uLight.value.copy(hn).transformDirection(q.matrixWorld)}de(Te,(e,t)=>{st.setSize(e,t),q.aspect=e/t,q.updateProjectionMatrix()});var g={playing:!0,litho:1,lithoTarget:1,time:0,lead:Math.PI*.5,start:Math.PI*.5,paintOn:!1,paint:0};z.uPaintFrom.value=g.start;z.uMark.value=g.start;var K={deg:document.getElementById("ro-deg"),lap:document.getElementById("ro-lap"),dot:document.getElementById("ro-dot"),trail:document.getElementById("ro-trail"),ant:document.getElementById("ro-ant")},ct={cx:30,cy:30,r0:26,r1:12};function nt(e){let t=ct.r0+(ct.r1-ct.r0)*(e/B),n=-Math.PI/2+e;return[ct.cx+t*Math.cos(n),ct.cy+t*Math.sin(n)]}{let e=[];for(let l=0;l<=160;l++)e.push(nt(l/160*B).map(u=>u.toFixed(2)).join(","));document.getElementById("ro-track").setAttribute("points",e.join(" "));let[t,n]=nt(0),[o,s]=nt(ut),[a,r]=nt(B);document.getElementById("ro-t0").setAttribute("cx",t),document.getElementById("ro-t0").setAttribute("cy",n),document.getElementById("ro-t1").setAttribute("cx",o),document.getElementById("ro-t1").setAttribute("cy",s),document.getElementById("ro-t2").setAttribute("cx",a),document.getElementById("ro-t2").setAttribute("cy",r)}var be="";function Ie(){let e=((g.lead-g.start)%B+B)%B,t=Math.floor(e*180/Math.PI),[n,o]=nt(e);K.dot.setAttribute("cx",n.toFixed(2)),K.dot.setAttribute("cy",o.toFixed(2));let s=[];for(let l=0;l<=64;l++)s.push(nt(l/64*e).map(u=>u.toFixed(2)).join(","));K.trail.setAttribute("points",s.join(" ")),K.ant.style.transform=e<ut?"none":"scaleY(-1)";let a;t<8?a="At the start mark, right way up":e<ut-.14?a="First time round":e<ut+.14?a="Over the start mark, but on the far face":e<B-.14?a="Second time round, on the far face":a="Home again after 720\xB0";let r=`${t}\xB0`;K.deg.textContent!==r&&(K.deg.textContent=r),a!==be&&(K.lap.textContent=a,be=a)}me();ve([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{g.lithoTarget=e},1);var Gt=ge(e=>{g.playing=e}),qt=document.getElementById("btn-paint");function Nt(e){g.paintOn=e,qt.setAttribute("aria-pressed",String(e)),e&&(z.uPaintFrom.value=g.lead,g.paint=0)}qt.addEventListener("click",()=>Nt(!g.paintOn));Ee({l:()=>document.getElementById(g.lithoTarget?"btn-colour":"btn-litho").click(),p:()=>qt.click()," ":()=>Gt(!g.playing),0:()=>{T.auto=!0}});var D=null;j.addEventListener("pointerdown",e=>{j.setPointerCapture(e.pointerId),D={x:e.clientX,y:e.clientY},T.auto=!1});j.addEventListener("pointermove",e=>{D&&(T.az-=(e.clientX-D.x)*.006,T.el=Math.max(-1.2,Math.min(1.2,T.el+(e.clientY-D.y)*.005)),D={x:e.clientX,y:e.clientY})});var ke=()=>{D&&(D=null,T.resume=4)};j.addEventListener("pointerup",ke);j.addEventListener("pointercancel",ke);j.addEventListener("dblclick",()=>{T.auto=!0,T.resume=0});var we=new A.Matrix4,_t=new A.Vector3,xt=new A.Vector3,bt=new A.Vector3;function Pe(){let e=B/Ot;for(let t=0;t<Ot;t++){let n=g.lead-t*e,o=re((n%B+B)%B);xt.set(...o.up),bt.set(...o.fwd),_t.crossVectors(xt,bt).normalize(),bt.crossVectors(_t,xt).normalize(),we.makeBasis(_t,xt,bt);let s=Wt[t];s.root.quaternion.setFromRotationMatrix(we),s.root.position.set(...o.p),s.pose(n*it/pe*ut+t*.7,g.time+t*1.3)}}function zt(e,t){if(g.time+=e,z.uTime.value=g.time,g.lead+=rn/it*e,g.lead>1e4&&(g.lead-=B*400),g.litho!==g.lithoTarget){let n=g.lithoTarget-g.litho;g.litho+=Math.sign(n)*Math.min(Math.abs(n),t*2.2),z.uLitho.value=g.litho,st.setClearColor(ye.clone().lerp(Ut,g.litho),1)}g.paintOn?g.paint=Math.min(1,g.paint+t/7):g.paint=Math.max(0,g.paint-t/1.2),z.uPaint.value=g.paint,!T.auto&&!D&&T.resume>0&&(T.resume-=t,T.resume<=0&&(T.auto=!0)),T.auto&&(T.az+=cn*e),He(),Pe(),Ie()}var Me=performance.now();function Be(e){let t=Math.min(.05,Math.max(0,(e-Me)/1e3));Me=e,zt(g.playing?t:0,t),st.render(Re,q),requestAnimationFrame(Be)}He();Pe();Ie();xe();requestAnimationFrame(Be);window.__page={state:g,view:T,band:ot,uniforms:z,setPaint:Nt,setPlaying:Gt,antScreen(e){let t=new A.Vector3;Wt[e].root.getWorldPosition(t),t.project(q);let n=j.getBoundingClientRect();return[(t.x+1)/2*n.width,(1-t.y)/2*n.height]},set(e={}){if(e.lead!==void 0&&(g.lead=g.start+e.lead*Math.PI/180),e.az!==void 0&&(T.az=e.az),e.el!==void 0&&(T.el=e.el),e.dist!==void 0&&(T.dist=e.dist),e.auto!==void 0&&(T.auto=e.auto),e.paint!==void 0&&Nt(e.paint),e.paintAmount!==void 0&&(g.paint=e.paintAmount),e.litho!==void 0&&(g.lithoTarget=e.litho,g.litho=e.litho,z.uLitho.value=e.litho,st.setClearColor(ye.clone().lerp(Ut,e.litho),1)),e.playing!==void 0&&Gt(e.playing),e.tilt&&ot.rotation.set(...e.tilt),e.advance)for(let t=0;t<e.advance*30;t++)zt(1/30,1/30);zt(0,0)}};})();
