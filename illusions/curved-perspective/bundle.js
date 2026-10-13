(()=>{var Ut=Object.create;var yt=Object.defineProperty;var $t=Object.getOwnPropertyDescriptor;var Yt=Object.getOwnPropertyNames;var zt=Object.getPrototypeOf,Kt=Object.prototype.hasOwnProperty;var Xt=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(o){throw t=0,o}};var Jt=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Yt(t))!Kt.call(e,n)&&n!==o&&yt(e,n,{get:()=>t[n],enumerable:!(a=$t(t,n))||a.enumerable});return e};var Q=(e,t,o)=>(o=e!=null?Ut(zt(e)):{},Jt(t||!e||!e.__esModule?yt(o,"default",{value:e,enumerable:!0}):o,e));var U=Xt((ye,bt)=>{bt.exports=window.THREE});var y=Q(U(),1);function Mt(e,t){let o=document.getElementById("frame"),a=()=>{let r=(window.innerWidth<640?10:28)+13,i=document.getElementById("masthead"),c=document.getElementById("controls"),f=(i?i.offsetHeight:0)+6+13,l=(c?c.offsetHeight:0)+8+13,s=window.innerWidth-r*2,d=window.innerHeight-f-l,p=d,g=p*e;g>s&&(g=s,p=g/e),g=Math.max(160,Math.floor(g)),p=Math.max(120,Math.floor(p)),o.style.width=`${g}px`,o.style.height=`${p}px`,o.style.top=`${f+Math.max(0,(d-p)/2)}px`,t?.(g,p)};return window.addEventListener("resize",a),a(),a}function Tt(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!e)return;let a=n=>{n?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(n))};t?.addEventListener("click",()=>a(e.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function Rt(e,t,o){let a=n=>{for(let[r,i]of e)r.setAttribute("aria-pressed",String(i===n));t(n)};for(let[n,r]of e)n.addEventListener("click",()=>a(r));return o!==void 0&&a(o),a}function At(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let o=e[t.key.length===1?t.key.toLowerCase():t.key];o&&(t.preventDefault(),o(t))})}function St(e,t=!0){let o=document.getElementById("btn-play"),a=n=>{t=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),e(n)};return o?.addEventListener("click",()=>a(!t)),a(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function Ht(){document.body.classList.add("ready")}var H=Q(U(),1);function Lt(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new H.Vector3(.3,.88,.36).normalize()},uPaper:{value:new H.Vector3(.925,.898,.835)},uInk:{value:new H.Vector3(.11,.1,.09)},uEye:{value:new H.Vector3},uFwd:{value:new H.Vector3(0,0,-1)},uRight:{value:new H.Vector3(1,0,0)},uUp:{value:new H.Vector3(0,1,0)},uS:{value:0},uHalf:{value:new H.Vector2(1.3,1.65)},uFar:{value:200},uTop:{value:50},uFade:{value:1},uLift:{value:0}}}var Pt=`
uniform vec3 uEye;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform float uS;
uniform vec2 uHalf;
uniform float uFar;
varying float vFront;
vec4 curvedProject(vec3 wp) {
  vec3 d = wp - uEye;
  float dist = max(length(d), 1e-4);
  vec3 n = d / dist;
  float a = dot(n, uRight), b = dot(n, uUp), c = dot(n, uFwd);
  float phi = asin(clamp(a, -1.0, 1.0));
  float lam = atan(b, c);
  vFront = c;
  float x, y;
  if (uS < 1e-3) {
    x = phi; y = lam;
  } else {
    float lim = 1.56;
    y = tan(clamp(uS * lam, -lim, lim)) / uS;
    x = tan(clamp(uS * phi, -lim, lim)) / uS / pow(max(cos(lam), 1e-3), uS);
  }
  float z = clamp(dist / uFar, 0.0, 1.0) * 2.0 - 1.0;
  return vec4(clamp(x / uHalf.x, -50.0, 50.0), clamp(y / uHalf.y, -50.0, 50.0), z, 1.0);
}
`,Qt=`
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
  return smoothstep(3.5, 8.0, period / max(fw, 1e-5));
}
`,Zt=`
vec3 finish(vec3 col, float ink, vec2 huv, float hfw, float face) {
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.035 + gw * 0.03);
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = 0.2;
  float hl = lod(hp, hfw);
  float a1 = (huv.x + huv.y) / hp;
  float a2 = (huv.x - huv.y) / hp + face * 0.37;
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85);
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85);
  float d1 = abs(fract(a1) - 0.5) * 2.0;
  float d2 = abs(fract(a2) - 0.5) * 2.0;
  float aa1 = fwidth(a1) * 2.0 + 0.02, aa2 = fwidth(a2) * 2.0 + 0.02;
  float h1 = 1.0 - smoothstep(1.0 - c1 - aa1, 1.0 - c1 + aa1, d1);
  float h2 = 1.0 - smoothstep(1.0 - c2 - aa2, 1.0 - c2 + aa2, d2);
  // fade each set where its lines come closer than a few pixels
  float l1 = hl * (1.0 - smoothstep(0.12, 0.28, fwidth(a1)));
  float l2 = hl * (1.0 - smoothstep(0.12, 0.28, fwidth(a2)));
  h1 = mix(c1, h1, l1);
  h2 = mix(c2, h2, l2);
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
attribute vec4 edge;
attribute vec2 amat;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec4 vE;
varying vec2 vM;
varying vec3 vW;
${Pt}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  vW = wp.xyz;
  gl_Position = curvedProject(wp.xyz);
}
`,ee=`
uniform float uTime;
uniform float uLitho;
uniform vec3 uLight;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uTop;
uniform float uFade;
uniform float uLift;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec4 vE;
varying vec2 vM;
varying vec3 vW;
varying float vFront;
${Qt}
${Zt}

void main() {
  if (vFront < -0.2) discard;
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.66 + 0.4 * diff;
  // light falls in from the open top, so the well darkens with depth
  shade *= mix(0.74, 1.05, smoothstep(-2.0, uTop, vW.y));
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  float tex = 1.0;
  float lines = 0.0;
  float glow = 0.0;

  if (pat == 2.0) {            // ashlar
    float rh = 0.5, bl = 1.15;
    float row = floor(uv.y / rh);
    float x = uv.x / bl + 0.37 * mod(row, 3.0);
    float fx = fract(x) * bl, fy = fract(uv.y / rh) * rh;
    float d = min(min(fx, bl - fx), min(fy, rh - fy));
    float h = hash12(vec2(floor(x), row) + 7.0);
    float l = lod(rh, fw);
    tex = mix(1.0, 0.9 + 0.16 * h, l) * (0.96 + 0.08 * vnoise(uv * 6.0));
    lines = lineMask(d, 0.02) * l * 0.7;
  } else if (pat == 4.0) {     // wood
    float ph = 0.22;
    float fy = fract(uv.x / ph) * ph;
    float d = min(fy, ph - fy);
    float l = lod(ph, fw);
    tex = mix(1.0, 0.8 + 0.3 * vnoise(vec2(uv.x * 30.0, uv.y * 1.5)), l);
    lines = lineMask(d, 0.012) * l * 0.7;
  } else if (pat == 5.0) {     // plaster
    tex = 0.94 + 0.1 * fbm(uv * 0.9) + 0.03 * vnoise(uv * 9.0);
  } else if (pat == 14.0) {    // stone treads
    tex = 0.93 + 0.1 * fbm(uv * 1.4);
  } else if (pat == 15.0) {    // the dark inside of a doorway
    tex = 0.9 + 0.1 * vnoise(uv * 3.0);
  } else if (pat == 16.0) {    // window light
    glow = 1.0;
  } else if (pat == 17.0) {    // floor mosaic: rings and rays about the well's centre
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float ring = abs(fract(r / 1.2) - 0.5) * 1.2;
    float ray = abs(fract(a / 6.2832 * 24.0) - 0.5) / 24.0 * 6.2832 * r;
    float star = step(fract(r / 2.4 + 0.25 * step(0.5, fract(a / 6.2832 * 12.0))), 0.5);
    float l = lod(0.6, fw);
    tex = mix(1.0, mix(0.78, 1.06, star), l);
    lines = max(lineMask(ring, 0.03), lineMask(ray, 0.03)) * l * 0.8;
    tex *= 0.95 + 0.08 * fbm(uv * 2.0);
  } else if (pat == 18.0) {    // water
    float w = sin(length(uv) * 9.0 - uTime * 2.5) * 0.5 + 0.5;
    tex = 0.88 + 0.16 * w;
  }

  vec3 col = vC * tex * shade;
  col *= 1.0 - 0.5 * lines;
  if (glow > 0.5) col = mix(vC, vec3(1.0), 0.15);
  col = mix(col, vec3(0.97, 0.95, 0.9), uLift * uLitho);

  float e = min(min(vE.x, vE.y), min(vE.z, vE.w));
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);

  float face = abs(n.x) > abs(n.z) ? 1.0 : 0.0;
  vec3 outc = finish(col, ink, uv, fw, face);
  gl_FragColor = vec4(outc, uFade);
}
`;function Z(e,t={}){return new H.ShaderMaterial({uniforms:e,vertexShader:te,fragmentShader:ee,transparent:!!t.transparent,side:t.side??H.DoubleSide})}var oe=`
attribute float dist;
varying float vD;
${Pt}
void main() {
  vD = dist;
  gl_Position = curvedProject((modelMatrix * vec4(position, 1.0)).xyz);
  gl_Position.z = -1.0;
}
`,ae=`
uniform vec3 uColor;
uniform float uOpacity;
uniform float uDash;
varying float vD;
varying float vFront;
void main() {
  if (vFront < -0.2) discard;
  if (uDash > 0.0 && fract(vD / uDash) > 0.6) discard;
  gl_FragColor = vec4(uColor, uOpacity);
}
`;function st(e,t,o){return new H.ShaderMaterial({uniforms:{...e,uColor:{value:new H.Color(t)},uOpacity:{value:0},uDash:{value:o}},vertexShader:oe,fragmentShader:ae,transparent:!0,depthTest:!1,depthWrite:!1})}var C=Q(U(),1),tt=1e3,R={PLAIN:0,ASHLAR:2,WOOD:4,PLASTER:5,STONE:14,VOID:15,GLOW:16,MOSAIC:17,WATER:18};function A(e,t=R.PLAIN){return{c:[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255],p:t}}var T=(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],kt=(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]],N=(e,t)=>[e[0]*t,e[1]*t,e[2]*t],lt=(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2],$=(e,t)=>[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],B=e=>Math.hypot(e[0],e[1],e[2]),Y=e=>{let t=B(e)||1;return[e[0]/t,e[1]/t,e[2]/t]},ct=(e,t,o)=>[e[0]+(t[0]-e[0])*o,e[1]+(t[1]-e[1])*o,e[2]+(t[2]-e[2])*o];function ne(e,t){let o=Math.abs(t[0]),a=Math.abs(t[1]),n=Math.abs(t[2]);return o>=a&&o>=n?[e[2],e[1]]:n>=a?[e[0],e[1]]:[e[0],e[2]]}var _=class{constructor(t=.6){this.cell=t,this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[]}_vert(t,o,a,n,r){this.pos.push(t[0],t[1],t[2]),this.nrm.push(o[0],o[1],o[2]),this.col.push(a.c[0],a.c[1],a.c[2]);let i=r||ne(t,o);this.uv.push(i[0],i[1]),this.edg.push(n[0],n[1],n[2],n[3]),this.mat.push(a.p,0)}_edgeDist(t,o,a,n){let r=[tt,tt,tt,tt];for(let i=0;i<o.length;i++){if(!n[i])continue;let c=o[i],f=o[(i+1)%o.length],l=Y($(a,T(f,c)));r[i]=Math.abs(lt(T(t,c),l))}return r}quad(t,o,a,n,r,i=[1,1,1,1],c={}){let f=[t,o,a,n],l=i,s=Y($(T(o,t),T(a,t)));B($(T(o,t),T(a,t)))<1e-9&&(s=Y($(T(a,t),T(n,t)))),c.hint&&lt(s,c.hint)<0&&(f=[t,n,a,o],l=[i[3],i[2],i[1],i[0]],s=N(s,-1));let d=c.cell||this.cell,p=Math.max(1,Math.ceil(Math.max(B(T(f[1],f[0])),B(T(f[2],f[3])))/d)),g=Math.max(1,Math.ceil(Math.max(B(T(f[3],f[0])),B(T(f[2],f[1])))/d)),m=(v,E)=>ct(ct(f[0],f[1],v/p),ct(f[3],f[2],v/p),E/g);for(let v=0;v<p;v++)for(let E=0;E<g;E++){let b=m(v,E),P=m(v+1,E),O=m(v+1,E+1),J=m(v,E+1);for(let k of[b,P,O,b,O,J])this._vert(k,s,r,this._edgeDist(k,f,s,l),c.uv&&c.uv(k))}}tri(t,o,a,n,r=[1,1,1],i={}){let c=[t,o,a],f=Y($(T(o,t),T(a,t))),l=r;i.hint&&lt(f,i.hint)<0&&(c=[t,a,o],l=[r[2],r[1],r[0]],f=N(f,-1));let s=i.cell||this.cell,d=Math.max(1,Math.ceil(Math.max(B(T(c[1],c[0])),B(T(c[2],c[1])),B(T(c[0],c[2])))/s)),p=(v,E)=>kt(c[0],kt(N(T(c[1],c[0]),v/d),N(T(c[2],c[0]),E/d))),g=[l[0],l[1],l[2],0],m=v=>this._vert(v,f,n,this._edgeDist(v,c,f,g),i.uv&&i.uv(v));for(let v=0;v<d;v++)for(let E=0;E<d-v;E++)m(p(v,E)),m(p(v+1,E)),m(p(v,E+1)),v+E<d-1&&(m(p(v+1,E)),m(p(v+1,E+1)),m(p(v,E+1)))}box(t,o,a,n,r,i,c,f={}){let l=new Set(f.skip||[]),s={px:[[n,o,i],[n,o,a],[n,r,a],[n,r,i]],nx:[[t,o,a],[t,o,i],[t,r,i],[t,r,a]],pz:[[t,o,i],[n,o,i],[n,r,i],[t,r,i]],nz:[[n,o,a],[t,o,a],[t,r,a],[n,r,a]],py:[[t,r,i],[n,r,i],[n,r,a],[t,r,a]],ny:[[t,o,a],[n,o,a],[n,o,i],[t,o,i]]};for(let d of Object.keys(s)){if(l.has(d))continue;let p=s[d];this.quad(p[0],p[1],p[2],p[3],d==="py"&&f.top||c,[1,1,1,1],f)}}lathe(t,o,a,n,r,i,c={}){for(let f=0;f<r;f++){let l=f/r*Math.PI*2,s=(f+1)/r*Math.PI*2;for(let d=0;d<n.length-1;d++){let[p,g]=n[d],[m,v]=n[d+1],E=[t+p*Math.cos(l),o+g,a+p*Math.sin(l)],b=[t+p*Math.cos(s),o+g,a+p*Math.sin(s)],P=[t+m*Math.cos(s),o+v,a+m*Math.sin(s)],O=[t+m*Math.cos(l),o+v,a+m*Math.sin(l)],J=[t+(p+m)/2*Math.cos((l+s)/2),0,a+(p+m)/2*Math.sin((l+s)/2)],k=Y([J[0]-t,(p-m)*0,J[2]-a]),Et=(c.edges||[])[d]?1:0,xt=(c.edges||[])[d+1]?1:0;Math.abs(p)<1e-6?this.tri(E,P,O,i,[0,xt,0],{hint:c.inside?N(k,-1):[k[0],p-m,k[2]],cell:c.cell}):Math.abs(m)<1e-6?this.tri(E,b,P,i,[Et,0,0],{hint:c.inside?N(k,-1):[k[0],p-m+(v-g)*0,k[2]],cell:c.cell}):this.quad(E,b,P,O,i,[Et,0,xt,0],{hint:c.inside?N(k,-1):[k[0],p-m,k[2]],cell:c.cell,uv:c.uv})}}}build(){let t=new C.BufferGeometry;return t.setAttribute("position",new C.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new C.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new C.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new C.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new C.Float32BufferAttribute(this.edg,4)),t.setAttribute("amat",new C.Float32BufferAttribute(this.mat,2)),t.computeBoundingSphere(),t}get triangles(){return this.pos.length/9}};var h=5.5,u=8.5,z=1.2,D=4,ut=16,V=.6,K=1.25,F=.25,et=12,L=50,x={wall:A(14011060,R.ASHLAR),stair:A(14274491,R.STONE),soffit:A(13089700,R.PLASTER),para:A(13616301,R.PLASTER),cope:A(14866886,R.STONE),jamb:A(11116168,R.PLASTER),void:A(2236187,R.VOID),glow:A(15986402,R.GLOW),floor:A(13813422,R.MOSAIC),basin:A(13287336,R.STONE),water:A(9416888,R.WATER),cornice:A(12892320,R.PLASTER),door:A(6967352,R.WOOD)},ie=[(e,t,o)=>[e,t,-o],(e,t,o)=>[o,t,e],(e,t,o)=>[-e,t,o],(e,t,o)=>[-o,t,-e]],re=[(e,t,o)=>[e,t,-o],(e,t,o)=>[o,t,e],(e,t,o)=>[-e,t,o],(e,t,o)=>[-o,t,-e]];function ot(e,t){let o=ie[t],a=re[t];return{quad:(n,r,i,c,f,l,s,d={})=>e.quad(o(...n),o(...r),o(...i),o(...c),f,l,{...d,hint:a(...s)}),tri:(n,r,i,c,f,l,s={})=>e.tri(o(...n),o(...r),o(...i),c,f,{...s,hint:a(...l)})}}var It=D/(2*h);function se(e,t,o){let a=ot(e,t),n=2*h/ut,r=D/ut,i=h+F;for(let d=0;d<ut;d++){let p=-h+d*n,g=p+n,m=o+d*r,v=m+r;a.quad([p,m,i],[p,v,i],[p,v,u],[p,m,u],x.stair,[1,1,1,1],[-1,0,0]),a.quad([p,v,i],[g,v,i],[g,v,u],[p,v,u],x.stair,[1,1,1,1],[0,1,0]);let E=o+(p+h)*It+K,b=o+(g+h)*It+K;a.quad([p,v,i],[g,v,i],[g,b,i],[p,E,i],x.para,[1,0,1,0],[0,0,1])}let c=o-V,f=o+D-V,l=o+K,s=o+D+K;a.quad([-h,c,h],[h,f,h],[h,s,h],[-h,l,h],x.para,[1,0,1,0],[0,0,-1]),a.quad([-h,l,h],[h,s,h],[h,s,i],[-h,l,i],x.cope,[1,0,1,0],[0,1,0]),a.quad([-h,c,h],[h,f,h],[h,f,u],[-h,c,u],x.soffit,[1,0,1,0],[0,-1,0])}function le(e,t,o){let a=ot(e,t);a.quad([-u,o,h],[-h,o,h],[-h,o,u],[-u,o,u],x.stair,[0,0,0,0],[0,1,0]),a.quad([-u,o-V,h],[-h,o-V,h],[-h,o-V,u],[-u,o-V,u],x.soffit,[0,0,0,0],[0,-1,0]);let n=[-h-F,-h],r=o-V,i=o+K+.18;a.quad([n[0],r,h],[n[1],r,h],[n[1],i,h],[n[0],i,h],x.para,[1,1,1,1],[0,0,-1]),a.quad([n[0],r,h+F],[n[0],r,h],[n[0],i,h],[n[0],i,h+F],x.para,[1,1,1,1],[-1,0,0]),a.quad([n[0],i,h],[n[1],i,h],[n[1],i,h+F],[n[0],i,h+F],x.cope,[1,1,1,1],[0,1,0]),a.quad([n[0],r,h],[n[1],r,h],[n[1],r,h+F],[n[0],r,h+F],x.soffit,[1,1,1,1],[0,-1,0])}function ce(e,t,o){let a=ot(e,t),n=new Set([-u,u]),r=new Set([0,L]);for(let s of o)n.add(s.t[0]),n.add(s.t[1]),r.add(s.y[0]),r.add(s.y[1]),r.add(s.y[1]+s.r);let i=[...n].sort((s,d)=>s-d),c=[...r].sort((s,d)=>s-d),f=(s,d)=>{if(s<0||d<0||s>=i.length-1||d>=c.length-1)return"out";let p=(i[s]+i[s+1])/2,g=(c[d]+c[d+1])/2;for(let m of o){if(p>m.t[0]&&p<m.t[1]&&g>m.y[0]&&g<m.y[1])return"hole";if(p>m.t[0]&&p<m.t[1]&&g>m.y[1]&&g<m.y[1]+m.r)return"arch"}return"solid"},l=s=>s==="out"||s==="hole"?1:0;for(let s=0;s<i.length-1;s++)for(let d=0;d<c.length-1;d++){if(f(s,d)!=="solid")continue;let p=[l(f(s,d-1)),l(f(s+1,d)),l(f(s,d+1)),l(f(s-1,d))];a.quad([i[s],c[d],u],[i[s+1],c[d],u],[i[s+1],c[d+1],u],[i[s],c[d+1],u],x.wall,p,[0,0,-1],{cell:.7})}for(let s of o)ue(a,s)}function ue(e,t){let[o,a]=t.t,[n,r]=t.y,i=t.r,c=(o+a)/2,f=r+i,l=t.kind==="door"?z:.7,s=10,d=g=>{let m=Math.PI*(1-g/s);return[c+i*Math.cos(m),r+i*Math.sin(m)]};for(let g=0;g<s;g++){let[m,v]=d(g),[E,b]=d(g+1),P=g===0?o:m,O=g===s-1?a:E;e.quad([P,v,u],[O,b,u],[O,f,u],[P,f,u],x.wall,[1,0,0,0],[0,0,-1]),e.quad([m,v,u],[E,b,u],[E,b,u+l],[m,v,u+l],x.jamb,[1,0,1,0],[c-(m+E)/2,r-(v+b)/2,0])}e.quad([o,n,u],[o,r,u],[o,r,u+l],[o,n,u+l],x.jamb,[1,0,1,1],[1,0,0]),e.quad([a,n,u],[a,r,u],[a,r,u+l],[a,n,u+l],x.jamb,[1,0,1,1],[-1,0,0]),e.quad([o,n,u],[a,n,u],[a,n,u+l],[o,n,u+l],x.jamb,[1,1,1,1],[0,1,0]);let p=t.kind==="door"?x.void:x.glow;e.quad([o,n,u+l],[a,n,u+l],[a,r,u+l],[o,r,u+l],p,[0,0,0,0],[0,0,-1]);for(let g=0;g<s;g++){let[m,v]=d(g),[E,b]=d(g+1);e.tri([c,r,u+l],[m,v,u+l],[E,b,u+l],p,[0,0,0],[0,0,-1])}if(t.kind==="window"){let m=u+l*.55;e.quad([c-.07,n,m],[c+.07,n,m],[c+.07,f,m],[c-.07,f,m],x.jamb,[1,1,1,1],[0,0,-1]);let v=r-.4;e.quad([o,v-.07,m],[a,v-.07,m],[a,v+.07,m],[o,v+.07,m],x.jamb,[1,1,1,1],[0,0,-1])}}function fe(e){e.quad([-u,0,u],[u,0,u],[u,0,-u],[-u,0,-u],x.floor,[1,1,1,1],{hint:[0,1,0],cell:.8,uv:t=>[t[0],t[2]]}),e.lathe(0,0,0,[[2,0],[2,.55],[1.78,.55],[1.78,.25]],40,x.basin,{edges:[1,1,1,1],cell:.5}),e.lathe(0,0,0,[[1.78,.42],[0,.42]],40,x.water,{edges:[1,0],cell:.5,uv:t=>[t[0],t[2]]}),e.lathe(0,0,0,[[.28,.42],[.22,1.6],[0,1.6]],16,x.basin,{edges:[0,1,0],cell:.4}),e.lathe(0,0,0,[[.2,1.5],[.8,1.75],[.85,1.9],[.7,1.9],[0,1.8]],24,x.basin,{edges:[1,0,1,1,0],cell:.4})}function he(e){for(let t=0;t<4;t++){let o=ot(e,t),a=u-.45;o.quad([-u,L-.8,a],[u,L-.8,a],[u,L,a],[-u,L,a],x.cornice,[1,0,1,0],[0,0,-1]),o.quad([-u,L-.8,a],[u,L-.8,a],[u,L-.8,u],[-u,L-.8,u],x.cornice,[1,0,1,0],[0,-1,0]),o.quad([-u,L,a],[u+z,L,a],[u+z,L,u+z],[-u,L,u+z],x.cope,[1,0,1,0],[0,1,0])}}function Ft(){let e=new _(.55),t=[[],[],[],[]];for(let o=0;o<2;o++)for(let a=0;a<et;a++){let n=(a+2*o)%4,r=D*a;le(e,n,r),t[n].push({t:[-7.7,-6.3],y:[r,r+2.45],r:.7,kind:"door"}),a<et-1&&(se(e,n,r),t[n].push({t:[-.65,.65],y:[r+3.7,r+6],r:.65,kind:"window"}))}for(let o=0;o<4;o++)ce(e,o,t[o]);return fe(e),he(e),e.build()}var I=Q(U(),1);var Bt=[(e,t,o)=>[e,t,-o],(e,t,o)=>[o,t,e],(e,t,o)=>[-e,t,o],(e,t,o)=>[-o,t,-e]];function ft(e){let t=new _(5);return e(t),t.build()}var Ct=[7166538,5201774,8014650,5595978];function de(e){let t=A(e,R.PLAIN),o=A(new I.Color(e).multiplyScalar(.6).getHex(),R.PLAIN),a=A(14997702,R.PLAIN);return{body:ft(n=>{n.lathe(0,0,0,[[.16,.86],[.17,1.1],[.2,1.42],[.11,1.52],[0,1.54]],8,t,{edges:[1,0,0,0,0]}),n.lathe(0,0,0,[[0,1.56],[.09,1.6],[.12,1.7],[.1,1.8],[0,1.84]],8,a,{})}),leg:ft(n=>n.lathe(0,0,0,[[.075,0],[.065,-.45],[.055,-.86],[0,-.86]],6,o,{edges:[0,0,1,0]})),arm:ft(n=>n.lathe(0,0,0,[[.055,0],[.045,-.36],[.04,-.6],[0,-.62]],6,t,{}))}}function at(e,t){let o=h+F+t,a=[],n=D/(2*h);for(let i=0;i<et-1;i++){let c=(i+2*e)%4,f=D*i;i>0&&a.push({p:Bt[c](-o,f,o),flat:!0});for(let l=0;l<=8;l++){let s=-h+l/8*2*h;a.push({p:Bt[c](s,f+(s+h)*n+.12,o),flat:!1})}}let r=0;a[0].s=0;for(let i=1;i<a.length;i++){let c=a[i-1].p,f=a[i].p;r+=Math.hypot(f[0]-c[0],f[1]-c[1],f[2]-c[2]),a[i].s=r}return{pts:a,total:r}}function me(e,t){let o=e.pts;t=Math.max(0,Math.min(e.total,t));let a=0,n=o.length-1;for(;n-a>1;){let f=a+n>>1;o[f].s<=t?a=f:n=f}let r=o[a],i=o[n],c=(t-r.s)/Math.max(1e-6,i.s-r.s);return{p:new I.Vector3(r.p[0]+(i.p[0]-r.p[0])*c,r.p[1]+(i.p[1]-r.p[1])*c,r.p[2]+(i.p[2]-r.p[2])*c),d:new I.Vector3(i.p[0]-r.p[0],0,i.p[2]-r.p[2]).normalize(),climbing:Math.abs(i.p[1]-r.p[1])>.01}}var pe=1.15,nt=class{constructor(t,o){this.list=[];let a=[[at(0,.9),at(0,1.95)],[at(1,.9),at(1,1.95)]];[[0,0,1,.02],[0,0,1,.37],[0,1,-1,.15],[0,1,-1,.66],[1,0,1,.12],[1,0,1,.58],[1,1,-1,.3],[1,1,-1,.82]].forEach(([r,i,c,f],l)=>{let s=de(Ct[l%Ct.length]),d={...o,uFade:{value:1},uLift:{value:.4}},p=Z(d,{transparent:!0}),g=new I.Group,m=E=>{let b=new I.Mesh(E,p);return b.frustumCulled=!1,b};g.add(m(s.body));let v=[];for(let E of[-1,1]){let b=new I.Group;b.position.set(.09*E,.88,0),b.add(m(s.leg)),g.add(b);let P=new I.Group;P.position.set(.23*E,1.44,0),P.add(m(s.arm)),g.add(P),v.push({hip:b,sh:P})}g.scale.setScalar(1.12),t.add(g),this.list.push({path:a[r][i],dir:c,phase:f,root:g,limbs:v,u:d})})}update(t){for(let o of this.list){let a=o.path.total,n=(t*pe/a+o.phase)%1*a;o.dir<0&&(n=a-n);let r=me(o.path,n);o.root.position.copy(r.p);let i=r.d.clone().multiplyScalar(o.dir);o.root.rotation.set(0,Math.atan2(i.x,i.z),0);let c=n/1.35*Math.PI*2*o.dir;for(let l=0;l<2;l++){let s=Math.sin(c+l*Math.PI);o.limbs[l].hip.rotation.x=-(.45*s+(r.climbing?.25*Math.max(0,Math.cos(c+l*Math.PI)):0)),o.limbs[l].sh.rotation.x=.4*s}let f=Math.min(n,a-n);o.u.uFade.value=Math.min(1,f/3),o.root.visible=o.u.uFade.value>.01}}};var Nt=30/38,qt=Math.PI/2+.065,ht={mid:23,amp:17,period:110},q=document.getElementById("scene"),j=new y.WebGLRenderer({canvas:q,antialias:!0,powerPreference:"high-performance"});j.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var wt=new y.Color(15854816),Vt=new y.Color(14673638);j.setClearColor(wt,1);var rt=new y.Scene,S=Lt();S.uTop.value=L;var Wt=new y.Mesh(Ft(),Z(S));Wt.frustumCulled=!1;rt.add(Wt);var ve=new nt(rt,S),W=new y.Group,vt=[];{let e=[];for(let l=-900;l<-80;l+=20)e.push(l);for(let l=-80;l<=140;l+=.5)e.push(l);for(let l=160;l<=1e3;l+=20)e.push(l);let t=st(S,10631978,.9);vt.push(t);for(let[l,s]of[[h,h],[-h,h],[h,-h],[-h,-h]]){let d=[],p=[];for(let v=0;v<e.length-1;v++)d.push(l,e[v],s,l,e[v+1],s),p.push(e[v],e[v+1]);let g=new y.BufferGeometry;g.setAttribute("position",new y.Float32BufferAttribute(d,3)),g.setAttribute("dist",new y.Float32BufferAttribute(p,1));let m=new y.LineSegments(g,t);m.frustumCulled=!1,W.add(m)}let o=st(S,3104650,.7);vt.push(o);let a=[],n=[],r=720,i=u;for(let l=0;l<r;l++){let s=l/r*Math.PI*2,d=(l+1)/r*Math.PI*2;a.push(i*Math.cos(s),0,i*Math.sin(s),i*Math.cos(d),0,i*Math.sin(d)),n.push(s*i,d*i)}let c=new y.BufferGeometry;c.setAttribute("position",new y.Float32BufferAttribute(a,3)),c.setAttribute("dist",new y.Float32BufferAttribute(n,1));let f=new y.LineSegments(c,o);f.frustumCulled=!1,W.add(f),W.userData.horizon=f,W.renderOrder=10,rt.add(W)}var dt={zenith:document.getElementById("lbl-zenith"),nadir:document.getElementById("lbl-nadir"),horizon:document.getElementById("lbl-horizon")},ge=new y.OrthographicCamera(-1,1,1,-1,-1,1),w={yaw:.3,height:0,morph:1,morphTarget:1,guides:0,guidesTarget:0},Ot=Nt;Mt(Nt,(e,t)=>{j.setSize(e,t),Ot=e/t,S.uHalf.value.set(qt*Ot,qt)});function mt(e,t,o){let a,n;return o<.001?(a=e,n=t):(n=Math.tan(Math.max(-1.56,Math.min(1.56,o*t)))/o,a=Math.tan(Math.max(-1.56,Math.min(1.56,o*e)))/o/Math.pow(Math.max(Math.cos(t),.001),o)),[a/S.uHalf.value.x,n/S.uHalf.value.y]}function pt(e,t,o){let a=o&&Math.abs(t[0])<.98&&Math.abs(t[1])<.995;e.style.opacity=a?String(w.guides):"0",a&&(e.style.left=`${(t[0]*.5+.5)*100}%`,e.style.top=`${(.5-t[1]*.5)*100}%`)}Tt();var M={t:0,litho:1,lithoTarget:1,playing:!0};Rt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{M.lithoTarget=e},1);var we=St(e=>{M.playing=e}),gt=document.getElementById("morph");gt.addEventListener("input",()=>{w.morphTarget=gt.value/1e3,w.morph=w.morphTarget});function X(e){w.morphTarget=Math.max(0,Math.min(1,e)),gt.value=String(Math.round(w.morphTarget*1e3))}var _t=document.getElementById("btn-guides");function it(e){w.guidesTarget=e?1:0,_t.setAttribute("aria-pressed",String(e))}_t.addEventListener("click",()=>it(!w.guidesTarget));At({" ":()=>we(!M.playing),l:()=>document.getElementById(M.lithoTarget?"btn-colour":"btn-litho").click(),g:()=>it(!w.guidesTarget),c:()=>X(w.morphTarget>.5?0:1),"[":()=>X(w.morphTarget-.1),"]":()=>X(w.morphTarget+.1),ArrowLeft:()=>{w.yaw-=.15},ArrowRight:()=>{w.yaw+=.15},ArrowUp:()=>{w.height+=2},ArrowDown:()=>{w.height-=2},0:()=>{w.yaw=.3,w.height=0}});var G=null;q.addEventListener("pointerdown",e=>{q.setPointerCapture(e.pointerId),G={x:e.clientX,y:e.clientY}});q.addEventListener("pointermove",e=>{if(!G)return;let t=e.clientX-G.x,o=e.clientY-G.y;G={x:e.clientX,y:e.clientY},w.yaw+=t/q.clientWidth*2.4,w.height+=o/q.clientHeight*30});var Gt=()=>{G=null};q.addEventListener("pointerup",Gt);q.addEventListener("pointercancel",Gt);q.addEventListener("dblclick",()=>{w.yaw=.3,w.height=0});function Ee(){let e=ht.mid+w.height+ht.amp*Math.sin(M.t/ht.period*Math.PI*2);return Math.max(2.5,Math.min(L-3,e))}var Dt=performance.now();function jt(e){let t=Math.min(.05,Math.max(0,(e-Dt)/1e3));if(Dt=e,M.playing&&(M.t+=t),S.uTime.value=M.t,M.litho!==M.lithoTarget){let r=M.lithoTarget-M.litho;M.litho+=Math.sign(r)*Math.min(Math.abs(r),t*2.2),j.setClearColor(wt.clone().lerp(Vt,1-M.litho),1)}S.uLitho.value=M.litho,w.morph+=(w.morphTarget-w.morph)*Math.min(1,t*3.5),Math.abs(w.morphTarget-w.morph)<1e-4&&(w.morph=w.morphTarget),S.uS.value=1-w.morph,w.guides+=Math.sign(w.guidesTarget-w.guides)*Math.min(Math.abs(w.guidesTarget-w.guides),t*3),vt.forEach(r=>{r.uniforms.uOpacity.value=w.guides}),W.visible=w.guides>.001;let o=S.uEye.value;o.set(0,Ee(),0);let a=S.uFwd.value.set(Math.sin(w.yaw),0,-Math.cos(w.yaw));S.uRight.value.crossVectors(a,S.uUp.value).normalize(),W.userData.horizon.position.y=o.y;let n=S.uS.value;pt(dt.zenith,mt(0,Math.PI/2-1e-4,n),!0),pt(dt.nadir,mt(0,-Math.PI/2+1e-4,n),!0),pt(dt.horizon,mt(.62,0,n),!0),ve.update(M.t),j.render(rt,ge),requestAnimationFrame(jt)}Ht();requestAnimationFrame(jt);window.__page={view:w,state:M,uniforms:S,setMorph:X,setGuides:it,setTime:e=>{M.t=e},setLitho:e=>{M.litho=M.lithoTarget=e,S.uLitho.value=e,j.setClearColor(wt.clone().lerp(Vt,1-e),1)},setMorphNow:e=>{X(e),w.morph=w.morphTarget},setGuidesNow:e=>{it(e),w.guides=e?1:0}};})();
