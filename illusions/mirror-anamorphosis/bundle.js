(()=>{var de=Object.create;var At=Object.defineProperty;var pe=Object.getOwnPropertyDescriptor;var me=Object.getOwnPropertyNames;var ve=Object.getPrototypeOf,ye=Object.prototype.hasOwnProperty;var xe=(e,n)=>()=>{try{return n||e((n={exports:{}}).exports,n),n.exports}catch(a){throw n=0,a}};var ge=(e,n,a,v)=>{if(n&&typeof n=="object"||typeof n=="function")for(let t of me(n))!ye.call(e,t)&&t!==a&&At(e,t,{get:()=>n[t],enumerable:!(v=pe(n,t))||v.enumerable});return e};var Mt=(e,n,a)=>(a=e!=null?de(ve(e)):{},ge(n||!e||!e.__esModule?At(a,"default",{value:e,enumerable:!0}):a,e));var ut=xe((Ae,Vt)=>{Vt.exports=window.THREE});var m=Mt(ut(),1);function qt(e,n){let a=document.getElementById("frame"),v=()=>{let g=(window.innerWidth<640?10:28)+13,l=document.getElementById("masthead"),p=document.getElementById("controls"),i=(l?l.offsetHeight:0)+6+13,d=(p?p.offsetHeight:0)+8+13,T=window.innerWidth-g*2,w=window.innerHeight-i-d,M=w,k=M*e;k>T&&(k=T,M=k/e),k=Math.max(160,Math.floor(k)),M=Math.max(120,Math.floor(M)),a.style.width=`${k}px`,a.style.height=`${M}px`,a.style.top=`${i+Math.max(0,(w-M)/2)}px`,n?.(k,M)};return window.addEventListener("resize",v),v(),v}function Dt(){let e=document.getElementById("panel"),n=document.getElementById("btn-info"),a=document.getElementById("panel-close");if(!e)return;let v=t=>{t?e.removeAttribute("hidden"):e.setAttribute("hidden",""),n?.setAttribute("aria-expanded",String(t))};n?.addEventListener("click",()=>v(e.hasAttribute("hidden"))),a?.addEventListener("click",()=>v(!1)),window.addEventListener("keydown",t=>{t.key==="Escape"&&v(!1)})}function bt(e,n,a){let v=t=>{for(let[g,l]of e)g.setAttribute("aria-pressed",String(l===t));n(t)};for(let[t,g]of e)t.addEventListener("click",()=>v(g));return a!==void 0&&v(a),v}function Bt(e){window.addEventListener("keydown",n=>{if(n.target.closest?.("input, textarea, select"))return;let a=e[n.key.length===1?n.key.toLowerCase():n.key];a&&(n.preventDefault(),a(n))})}function Ft(e,n=!0){let a=document.getElementById("btn-play"),v=t=>{n=t,a&&(a.setAttribute("aria-pressed",String(!t)),a.querySelector("span").textContent=t?"Pause":"Play",a.querySelector(".icon").textContent=t?"\u275A\u275A":"\u25B6"),e(t)};return a?.addEventListener("click",()=>v(!n)),v(n&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),v}function it(e,n){let a=document.getElementById("badge");a&&n&&(a.textContent=n),document.body.classList.toggle("badge-on",!!e)}function Gt(){document.body.classList.add("ready")}var K=Mt(ut(),1),Z=1,st=3.2,$=new K.Vector3(0,9,13),J=new K.Vector3(0,1.6,0),wt=J.clone().sub($).normalize(),_t=new K.Vector3().crossVectors(wt,new K.Vector3(0,1,0)).normalize(),Me=new K.Vector3().crossVectors(_t,wt),L={u0:-.05,u1:.05,v0:-.1266,v1:.0215},b={x0:-6.2,x1:6.2,z0:-5.4,z1:9};function be(e,n,a=new K.Vector3){return a.copy(wt).addScaledVector(_t,e).addScaledVector(Me,n).normalize()}function ot(e,n,a=$,v=0){let t=be(e,n);return we(a,t,v)}function we(e,n,a=0){let v=n.x*n.x+n.z*n.z,t=2*(e.x*n.x+e.z*n.z),g=e.x*e.x+e.z*e.z-Z*Z,l=t*t-4*v*g;if(l<0)return null;let p=(-t-Math.sqrt(l))/(2*v);if(p<=0)return null;let i=e.clone().addScaledVector(n,p);if(i.y<a||i.y>a+st)return null;let d=new K.Vector3(i.x,0,i.z).divideScalar(Z),T=n.clone().addScaledVector(d,-2*n.dot(d));if(T.y>=0)return{hit:i,n:d,r:T,ground:null};let w=i.clone().addScaledVector(T,-i.y/T.y);return{hit:i,n:d,r:T,ground:w}}var q=Math.sqrt(3)/2,dt=4;function Et([e,n,a]){let v=q*(e-a);return[n-(e+a)/2,-v]}function Ut(e=dt){let n=l=>l.map(([p,i])=>[i,-p]),a=n([[-q,-.5],[q*e,-(e+2)/2],[q*e,(e-2)/2],[q*(e-1),(e-3)/2],[q*(e-1),(1-e)/2],[-q,.5]]),v=n([[q*(e+1),-(e+1)/2],[q*(e+1),(e+1)/2],[q,.5],[2*q,0],[q*e,(e-2)/2],[q*e,-(e+2)/2]]),t=n([[q*e,(e+2)/2],[q*(e+1),(e+1)/2],[q,.5],[q*(e-1),(3-e)/2],[q*(e-1),(1-e)/2],[-q,.5]]),g=(l,p,i)=>({o:l,a:p,b:i});return{light:{poly:a,faces:[g([0,0,1],[e+1,0,0],[0,1,0]),g([e,0,1],[1,0,0],[0,e,0])]},mid:{poly:t,faces:[g([e,e+1,0],[1,0,0],[0,0,e+1]),g([0,1,0],[e,0,0],[0,0,1])]},dark:{poly:v,faces:[g([e+1,0,0],[0,e+1,0],[0,0,1]),g([e+1,e,0],[0,1,0],[0,0,e+1])]}}}function jt(e){let n=e>>>0;return()=>{n=n+1831565813>>>0;let a=n;return a=Math.imul(a^a>>>15,a|1),a^=a+Math.imul(a^a>>>7,a|61),((a^a>>>14)>>>0)/4294967296}}function mt(e,n,a="#fff"){let v=document.createElement("canvas");v.width=e,v.height=n;let t=v.getContext("2d");return t.fillStyle=a,t.fillRect(0,0,e,n),[v,t]}var nt=(e,n)=>[e[0]+n[0],e[1]+n[1],e[2]+n[2]],pt=(e,n)=>[e[0]*n,e[1]*n,e[2]*n],Ee=(()=>{let n=2048/(L.v1-L.v0);return{W:Math.round((L.u1-L.u0)*n),H:2048,k:n}})(),Y=(()=>{let e=Ut(dt),n=[...e.light.poly,...e.mid.poly,...e.dark.poly],a=n.map(d=>d[0]),v=n.map(d=>d[1]),t=(Math.min(...a)+Math.max(...a))/2,g=(Math.min(...v)+Math.max(...v))/2,l=Math.max(...a)-Math.min(...a),p=.088/l,i=-.0255;return{reg:e,cx:t,cy:g,sc:p,vc:i,bottom:(Math.min(...v)-g)*p+i,top:(Math.max(...v)-g)*p+i,half:l/2*p}})();function Ot([e,n]){return[(e-Y.cx)*Y.sc,(n-Y.cy)*Y.sc+Y.vc]}function Tt(){let e=dt;return[[0,0,0],[e+1,0,0],[e+1,0,1],[e+1,e+1,1],[e+1,e+1,0],[0,1,0]].map(a=>Ot(Et(a)))}function $t(){let e=Tt(),n=e.reduce((p,i)=>p+i[0],0)/e.length,a=e.reduce((p,i)=>p+i[1],0)/e.length,v=e.map(([p,i])=>[n+(p-n)*1.32,a+(i-a)*1.32]);v.sort((p,i)=>Math.atan2(p[1]-a,p[0]-n)-Math.atan2(i[1]-a,i[0]-n));let t=[...v].sort((p,i)=>p[1]-i[1]).slice(0,2),g=L.v0-.01,l=[];for(let p of v){if(p===t[0]||p===t[1]){if(!l.skirt){let[i,d]=t[0][0]<t[1][0]?[t[0],t[1]]:[t[1],t[0]];l.push(i,[i[0],g],[d[0],g],d),l.skirt=!0}continue}l.push(p)}return l.map(p=>[p[0],p[1]])}function Yt(){let{W:e,H:n,k:a}=Ee,[v,t]=mt(e,n),[g,l]=mt(e,n,"rgba(0,0,0,0)"),p=new Path2D;$t().forEach(([E,S],P)=>{let I=(E-L.u0)*a,R=(L.v1-S)*a;P?p.lineTo(I,R):p.moveTo(I,R)}),p.closePath(),l.save(),l.clip(p),t.save(),t.clip(p);let i=([E,S])=>{let[P,I]=Ot([E,S]);return[(P-L.u0)*a,(L.v1-I)*a]},d=Y.sc*a,T=E=>i(Et(E)),w=(E,S)=>{E.beginPath(),S.forEach((P,I)=>I?E.lineTo(P[0],P[1]):E.moveTo(P[0],P[1])),E.closePath()},M=jt(11);l.fillStyle="#dcdcb0",l.fillRect(0,0,e,n);for(let E=0;E<520;E++){let S=M()*e,P=M()*n;t.fillStyle="rgba(0,0,0,0.55)",t.beginPath(),t.arc(S,P,1.3+M()*1.1,0,Math.PI*2),t.fill()}{let[E,S]=i([Y.cx,0]),P=(L.v1-Y.bottom)*a;for(let R=0;R<900;R++){let B=M(),C=e*.08+M()*e*.84,A=P+10+Math.pow(M(),.8)*(n-P-40),N=1-Math.abs(C-e/2)/(e*.46);if(!(M()>N*.9))if(t.fillStyle="rgba(0,0,0,0.75)",B<.7)t.beginPath(),t.arc(C,A,1.6+M()*1.4,0,Math.PI*2),t.fill();else{t.strokeStyle="rgba(0,0,0,0.8)",t.lineWidth=2,t.beginPath();for(let U=-2;U<=2;U++)t.moveTo(C+U*4,A),t.lineTo(C+U*6+(M()-.5)*4,A-14-M()*10);t.stroke()}}let I=l.createLinearGradient(0,P,0,n);I.addColorStop(0,"rgba(176,186,128,0.0)"),I.addColorStop(.15,"rgba(176,186,128,0.55)"),I.addColorStop(1,"rgba(160,172,112,0.75)"),l.fillStyle=I,l.beginPath(),l.ellipse(e/2,P+(n-P)*.55,e*.47,(n-P)*.75,0,0,Math.PI*2),l.fill()}let k={light:{wash:[236,226,204],hatch:0,cross:0},mid:{wash:[204,184,146],hatch:.11,cross:0},dark:{wash:[140,122,98],hatch:.075,cross:.1}};for(let E of["light","mid","dark"]){let S=Y.reg[E],P=k[E],I=S.poly.map(i);for(let R of S.faces){let B=[R.o,nt(R.o,R.a),nt(nt(R.o,R.a),R.b),nt(R.o,R.b)].map(T);for(let c of[l,t])c.save(),w(c,I),c.clip(),w(c,B),c.clip();let C=Math.hypot(...R.a),A=Math.hypot(...R.b),N=pt(R.a,1/C),U=pt(R.b,1/A),D=(c,f)=>T(nt(nt(R.o,pt(N,c)),pt(U,f))),F=C>=A?"a":"b",o=R.a[1]!==0||R.b[1]!==0;l.fillStyle=`rgb(${P.wash.join(",")})`,l.fillRect(0,0,e,n);let s=[];if(o){let c=R.a[1]!==0,f=c?C:A,r=c?A:C,y=R.o[1];for(let x=0;x*.5<f-1e-6;x++){let z=Math.round((y+x*.5)/.5)%2*.5;for(let H=-z;H<r;H+=1){let V=Math.max(0,H),rt=Math.min(r,H+1);s.push(c?[x*.5,V,x*.5+.5,rt]:[V,x*.5,rt,x*.5+.5])}}}else{let c=F==="a"?C:A,f=F==="a"?A:C;for(let r=0;r*.5<f-1e-6;r++){let y=r%2*.5;for(let x=-y;x<c;x+=1){let z=Math.max(0,x),H=Math.min(c,x+1);s.push(F==="a"?[z,r*.5,H,r*.5+.5]:[r*.5,z,r*.5+.5,H])}}}for(let[c,f,r,y]of s){let x=[D(c,f),D(r,f),D(r,y),D(c,y)],z=(M()-.5)*22;l.fillStyle=`rgb(${P.wash.map(H=>Math.round(H+z)).join(",")})`,w(l,x),l.fill(),t.lineWidth=.022*d,t.strokeStyle="rgba(0,0,0,0.85)",w(t,x),t.stroke();for(let H=0;H<3;H++){if(M()<.5)continue;let V=D(c+(r-c)*M(),f+(y-f)*M());t.fillStyle="rgba(0,0,0,0.6)",t.beginPath(),t.arc(V[0],V[1],.008*d+M()*.01*d,0,Math.PI*2),t.fill()}}let h=(c,f,r,y)=>{if(!c)return;t.strokeStyle="rgba(0,0,0,0.9)",t.lineWidth=r*d;let x=f==="a"?C:A,z=f==="a"?A:C;t.beginPath();for(let H=c/2;H<z;H+=c){let V=H+(M()-.5)*y,rt=f==="a"?D(0,V):D(V,0),Wt=f==="a"?D(x,V):D(V,x);t.moveTo(rt[0],rt[1]),t.lineTo(Wt[0],Wt[1])}t.stroke()};h(P.hatch,F,.018,.01),h(P.cross,F==="a"?"b":"a",.014,.01);for(let c of[l,t])c.restore()}}t.lineJoin="round";for(let E of["light","mid","dark"])t.lineWidth=.045*d,t.strokeStyle="#000",w(t,Y.reg[E].poly.map(i)),t.stroke();return l.restore(),t.restore(),{ink:v,wash:g}}var Te=(()=>{let n=2048/(b.x1-b.x0);return{W:2048,H:Math.round((b.z1-b.z0)*n),k:n}})();function Pe(e=360){let n=new Float32Array(e),a=$t(),v=400;for(let t=0;t<a.length;t++){let g=a[t],l=a[(t+1)%a.length];for(let p=0;p<v;p++){let i=p/v,d=ot(g[0]+(l[0]-g[0])*i,g[1]+(l[1]-g[1])*i);if(!d||!d.ground)continue;let T=Math.atan2(d.ground.x,d.ground.z),w=(Math.floor((T+Math.PI)/(2*Math.PI)*e)%e+e)%e;n[w]=Math.max(n[w],Math.hypot(d.ground.x,d.ground.z))}}return n}function ke(){let n=Pe(360),a=new Float32Array(360);for(let i=0;i<360;i++){let d=0;for(let T=-5;T<=5;T++)d=Math.max(d,n[(i+T+360)%360]);a[i]=Math.max(d+.55,2.9)}let v=(i,d)=>{let T=new Float32Array(360);for(let w=0;w<360;w++){let M=0,k=0;for(let E=-d;E<=d;E++){let S=1-Math.abs(E)/(d+1);M+=i[(w+E+360)%360]*S,k+=S}T[w]=M/k}return T},t=Float32Array.from(a);for(let i=0;i<8;i++){t=v(t,14);for(let d=0;d<360;d++)t[d]=Math.max(t[d],a[d])}t=v(t,6);let g=new Float32Array(360);for(let i=0;i<360;i++){let d=i/360*Math.PI*2,T=.1*Math.sin(d*5+.7)+.07*Math.sin(d*11+1.3)+.04*Math.sin(d*23+.4);g[i]=Math.max(t[i]+.05+T,a[i]-.2)}return{radius:(i,d)=>{let w=(Math.atan2(i,d)+Math.PI)/(2*Math.PI)*360,M=Math.floor(w)%360,k=(M+1)%360,E=w-Math.floor(w);return g[M]*(1-E)+g[k]*E},pointAt:(i,d=0)=>{let T=(i+Math.PI)/(2*Math.PI)*360,w=Math.floor(T)%360,M=(w+1)%360,k=T-Math.floor(T),E=g[w]*(1-k)+g[M]*k+d;return[Math.sin(i)*E,Math.cos(i)*E]},core:n}}function Nt(){let{W:e,H:n,k:a}=Te,[v,t]=mt(e,n),[g,l]=mt(e,n),p=(o,s)=>[(o-b.x0)*a,(s-b.z0)*a],i=jt(5),d=ke(),T=(o,s,h=0)=>Math.hypot(o,s)<d.radius(o,s)+h,w=o=>{let s=new Path2D;return o.forEach(([h,c],f)=>{let r=p(h,c);f?s.lineTo(r[0],r[1]):s.moveTo(r[0],r[1])}),s.closePath(),s},M=[[b.x0-1,b.z0-1]];for(let o=0;o<=60;o++){let s=b.x0+(b.x1-b.x0)*(o/60),h=-3.7+.35*Math.sin(s*.9+.5)+.22*Math.sin(s*2.3)-.5*Math.exp(-((s-4.4)**2)/1.5)+.3*Math.exp(-((s+3.8)**2)/2);M.push([s,h])}M.push([b.x1+1,b.z0-1]);let k=w(M),E=[[b.x0-1,2.4]];for(let o=0;o<=30;o++){let s=o/30;E.push([b.x0+.2+2.2*Math.sin(s*Math.PI*.5)+.12*Math.sin(s*19),2.6+s*7+.1*Math.sin(s*11)])}E.push([b.x0-1,b.z1+1]);let S=w(E),P=[[b.x1+1,4.8]];for(let o=0;o<=30;o++){let s=o/30;P.push([b.x1-.1-1.7*Math.sin(s*Math.PI*.5)-.1*Math.sin(s*17),5+s*5])}P.push([b.x1+1,b.z1+1]);let I=w(P),R=(o=0)=>{let s=new Path2D;for(let h=0;h<=360;h++){let c=h/360*Math.PI*2-Math.PI,[f,r]=d.pointAt(c,o),y=p(f,r);h?s.lineTo(y[0],y[1]):s.moveTo(y[0],y[1])}return s.closePath(),s};l.fillStyle="#c4d3cf",l.fillRect(0,0,e,n),l.fillStyle="#d7d5a8";for(let o of[k,S,I])l.fill(o);l.fillStyle="#e6dcb4",l.fill(R(0)),l.fillStyle="#dcdcb0",l.fill(R(-.22)),t.save();let B=new Path2D;B.rect(0,0,e,n),B.addPath(R(.02)),B.addPath(k),B.addPath(S),B.addPath(I),t.clip(B,"evenodd"),t.strokeStyle="rgba(0,0,0,0.7)",t.lineWidth=1.6;for(let o=b.z0;o<b.z1;o+=.085){t.beginPath();let s=b.x0;for(;s<b.x1;){let h=.4+i()*2.2,c=i()<.25?.15+i()*.5:0,f=p(s,o),r=p(Math.min(b.x1,s+h),o+(i()-.5)*.004);t.moveTo(f[0],f[1]),t.lineTo(r[0],r[1]),s+=h+c}t.stroke()}for(let o=1;o<=7;o++)t.lineWidth=2.2-o*.18,t.setLineDash([40+o*25,8+o*6]),t.stroke(R(.07*o+.012*o*o));t.setLineDash([]),t.restore(),t.lineWidth=3,t.strokeStyle="#000",t.stroke(R(0));for(let o of[k,S,I])t.stroke(o);t.fillStyle="rgba(0,0,0,0.75)";for(let o=0;o<2600;o++){let s=i()*Math.PI*2-Math.PI,h=-Math.pow(i(),1.7)*.32,[c,f]=d.pointAt(s,h),r=p(c,f);t.beginPath(),t.arc(r[0],r[1],1.2+i()*1.1,0,Math.PI*2),t.fill()}let C=(o,s)=>{let h=Math.atan2(o,s),c=Math.floor((h+Math.PI)/(2*Math.PI)*360)%360,f=0;for(let r=-3;r<=3;r++)f=Math.max(f,d.core[(c+r+360)%360]);return f},A=(o,s,h=.15)=>{let c=Math.hypot(o,s);return c>1.15&&T(o,s,-.35)&&c>C(o,s)+h};for(let o=0;o<1500;o++){let s=(i()-.5)*12,h=-3+i()*12;if(!A(s,h))continue;let c=p(s,h);t.fillStyle="rgba(0,0,0,0.7)",t.beginPath(),t.arc(c[0],c[1],1.2+i(),0,Math.PI*2),t.fill()}let N=(o,s,h,c)=>{let f=p(o,s),r=h*a;l.fillStyle="rgba(80,90,60,0.35)",l.beginPath(),l.ellipse(f[0]+r*.6,f[1]-r*.35,r*1.05,r*.8,-.5,0,Math.PI*2),l.fill(),t.save(),t.beginPath(),t.ellipse(f[0]+r*.6,f[1]-r*.35,r*1.05,r*.8,-.5,0,Math.PI*2),t.clip(),t.strokeStyle="rgba(0,0,0,0.75)",t.lineWidth=1.4,t.beginPath();for(let x=-r*2;x<r*2;x+=5)t.moveTo(f[0]+x-r,f[1]-r*2),t.lineTo(f[0]+x+r*2,f[1]+r);t.stroke(),t.restore(),l.fillStyle=c?"#8b9a68":"#9aa775",l.beginPath();let y=9;for(let x=0;x<=y*4;x++){let z=x/(y*4)*Math.PI*2,H=r*(.86+.14*Math.abs(Math.sin(z*y/2))),V=[f[0]+Math.cos(z)*H,f[1]+Math.sin(z)*H];x?l.lineTo(V[0],V[1]):l.moveTo(V[0],V[1])}l.fill(),t.lineWidth=2,t.strokeStyle="#000",t.beginPath();for(let x=0;x<=y*4;x++){let z=x/(y*4)*Math.PI*2,H=r*(.86+.14*Math.abs(Math.sin(z*y/2))),V=[f[0]+Math.cos(z)*H,f[1]+Math.sin(z)*H];x?t.lineTo(V[0],V[1]):t.moveTo(V[0],V[1])}t.stroke(),t.save(),t.beginPath(),t.arc(f[0],f[1],r*.95,0,Math.PI*2),t.clip(),t.lineWidth=1.3,t.beginPath();for(let x=0;x<r*1.6;x+=4.5){let z=f[0]+r*.95-x*.45,H=f[1]-r*.95+x;t.moveTo(z-r*.3,H-r*.6),t.lineTo(z+r*.6,H+r*.3)}t.stroke(),t.restore()};for(let o=0,s=0;o<400&&s<16;o++){let h=i()*Math.PI*2-Math.PI,c=1.3+i()*1.6,f=Math.sin(h)*c,r=Math.cos(h)*c,y=.18+i()*.12;!A(f,r,y+.12)||!T(f,r,-y-.25)||(N(f,r,y,s%2),s++)}{let o=p(0,0),s=.97*a,h=.62*a;l.fillStyle="#d9cdb2",l.beginPath(),l.arc(o[0],o[1],s,0,Math.PI*2),l.fill(),l.fillStyle="#c7c59a",l.beginPath(),l.arc(o[0],o[1],h,0,Math.PI*2),l.fill(),t.fillStyle="#fff",t.beginPath(),t.arc(o[0],o[1],s,0,Math.PI*2),t.fill(),t.strokeStyle="#000",t.lineWidth=3.2,t.beginPath(),t.arc(o[0],o[1],s,0,Math.PI*2),t.stroke(),t.lineWidth=2.2,t.beginPath(),t.arc(o[0],o[1],h,0,Math.PI*2),t.stroke(),t.lineWidth=1.4,t.beginPath(),t.arc(o[0],o[1],(h+s)/2,0,Math.PI*2),t.stroke(),t.beginPath();for(let c=0;c<28;c++){let f=c/28*Math.PI*2,r=f+Math.PI/28,y=(h+s)/2;t.moveTo(o[0]+Math.cos(f)*h,o[1]+Math.sin(f)*h),t.lineTo(o[0]+Math.cos(f)*y,o[1]+Math.sin(f)*y),t.moveTo(o[0]+Math.cos(r)*y,o[1]+Math.sin(r)*y),t.lineTo(o[0]+Math.cos(r)*s,o[1]+Math.sin(r)*s)}t.stroke(),t.save(),t.beginPath(),t.arc(o[0],o[1],h-2,0,Math.PI*2),t.clip(),t.fillStyle="rgba(0,0,0,0.7)";for(let c=0;c<160;c++){let f=i()*Math.PI*2,r=Math.sqrt(i())*h;t.beginPath(),t.arc(o[0]+Math.cos(f)*r,o[1]+Math.sin(f)*r,1.5+i()*2.5,0,Math.PI*2),t.fill()}t.lineWidth=1.3,t.beginPath();for(let c=-h;c<h;c+=6)t.moveTo(o[0]+c,o[1]-h),t.lineTo(o[0]+c+h,o[1]);t.stroke(),t.restore()}t.save(),t.clip(k);for(let o=0;o<4;o++){let s=b.z0+.5+o*.55;for(let h=b.x0-.5+o%2*.9;h<b.x1+.5;h+=1.6+i()*.8){let c=.9+i()*.7,f=.35+i()*.2,r=p(h,s);l.fillStyle=o%2?"#c8c491":"#bfbf8c",l.beginPath(),l.ellipse(r[0],r[1],c*a,f*a,0,Math.PI,0),l.fill(),t.fillStyle="#fff",t.beginPath(),t.ellipse(r[0],r[1],c*a,f*a,0,Math.PI,0),t.fill(),t.lineWidth=2,t.strokeStyle="#000",t.beginPath(),t.ellipse(r[0],r[1],c*a,f*a,0,Math.PI,0),t.stroke(),t.save(),t.beginPath(),t.ellipse(r[0],r[1],c*a,f*a,0,Math.PI,0),t.clip(),t.lineWidth=1.2,t.beginPath();for(let y=0;y<c*a;y+=5)t.moveTo(r[0]+y,r[1]-f*a),t.lineTo(r[0]+y-f*a*.6,r[1]);t.stroke(),t.restore()}}t.restore();let U=(o,s,h,c,f)=>{let r=p(o,s),y=h*a,x=c*a;l.fillStyle="#e9e1cc",l.fillRect(r[0]-y/2,r[1]-x,y,x),l.fillStyle=f,l.beginPath(),l.moveTo(r[0]-y/2-3,r[1]-x),l.lineTo(r[0],r[1]-x-y*.55),l.lineTo(r[0]+y/2+3,r[1]-x),l.fill(),t.fillStyle="#fff",t.fillRect(r[0]-y/2,r[1]-x-y*.55,y,x+y*.55),t.lineWidth=1.8,t.strokeStyle="#000",t.strokeRect(r[0]-y/2,r[1]-x,y,x),t.beginPath(),t.moveTo(r[0]-y/2-3,r[1]-x),t.lineTo(r[0],r[1]-x-y*.55),t.lineTo(r[0]+y/2+3,r[1]-x),t.closePath(),t.stroke(),t.lineWidth=1.1,t.beginPath();for(let z=4;z<y*.5;z+=4)t.moveTo(r[0]+z,r[1]-x-y*.55*(1-z/(y*.5))),t.lineTo(r[0]+z,r[1]-x);t.stroke(),t.fillStyle="#000",t.fillRect(r[0]-y*.12,r[1]-x*.45,y*.24,x*.45)},D=[];for(let o=0;o<14;o++)D.push([-3.6+(i()-.5)*2.8,-4.45+(i()-.5)*.6]);D.sort((o,s)=>o[1]-s[1]);for(let[o,s]of D)U(o,s,.32+i()*.16,.22+i()*.12,i()<.5?"#b56a4f":"#a5584a");{let o=p(-3,-4.25);l.fillStyle="#e9e1cc",l.fillRect(o[0]-14,o[1]-120,28,120),t.fillStyle="#fff",t.fillRect(o[0]-14,o[1]-150,28,150),t.lineWidth=2,t.strokeRect(o[0]-14,o[1]-120,28,120),t.beginPath(),t.moveTo(o[0]-17,o[1]-120),t.lineTo(o[0],o[1]-175),t.lineTo(o[0]+17,o[1]-120),t.closePath(),l.fillStyle="#7b8c8c",l.beginPath(),l.moveTo(o[0]-17,o[1]-120),l.lineTo(o[0],o[1]-175),l.lineTo(o[0]+17,o[1]-120),l.fill(),t.stroke(),t.fillStyle="#000",t.fillRect(o[0]-4,o[1]-100,8,14)}let F=[];for(let o=0;o<26;o++)F.push([1.2+i()*4.8,-4.95+i()*1]);for(let o=0;o<12;o++)F.push([b.x0+.3+i()*1.4,4+i()*4.6]);for(let o=0;o<9;o++)F.push([b.x1-.3-i()*1.1,6.6+i()*2.2]);F.sort((o,s)=>o[1]-s[1]);for(let[o,s]of F)[k,S,I].some(c=>{let f=p(o,s);return t.isPointInPath(c,f[0],f[1])})&&N(o,s,.16+i()*.1,i()<.5?1:0);t.lineWidth=1.4,t.strokeStyle="rgba(0,0,0,0.8)";for(let o=0;o<160;o++){let s=o%2,h=i(),c=s?b.x0+.2+2.2*Math.sin(h*Math.PI*.5)+.1:b.x1-.1-1.7*Math.sin(h*Math.PI*.5)-.1,f=s?2.6+h*7:5+h*5,r=p(c+(s?.12:-.12)*i(),f);t.beginPath();for(let y=0;y<3;y++)t.moveTo(r[0]+y*3,r[1]),t.lineTo(r[0]+y*3+(i()-.5)*8,r[1]-12-i()*10);t.stroke()}{let o=p(-3.9,5.6);l.fillStyle="#9a7a55",l.beginPath(),l.ellipse(o[0],o[1],46,12,-.15,0,Math.PI*2),l.fill(),t.fillStyle="#fff",t.beginPath(),t.ellipse(o[0],o[1],46,12,-.15,0,Math.PI*2),t.fill(),t.lineWidth=2.2,t.strokeStyle="#000",t.stroke(),t.beginPath(),t.moveTo(o[0]-2,o[1]),t.lineTo(o[0]-2,o[1]-70),t.stroke(),l.fillStyle="#efe6d2";let s=()=>{let h=new Path2D;return h.moveTo(o[0],o[1]-66),h.quadraticCurveTo(o[0]+30,o[1]-40,o[0]+4,o[1]-6),h.closePath(),h};l.fill(s()),t.fillStyle="#fff",t.fill(s()),t.stroke(s()),t.lineWidth=1.2;for(let h=6;h<60;h+=6)t.beginPath(),t.moveTo(o[0]+2,o[1]-66+h),t.lineTo(o[0]+8+h*.2,o[1]-66+h),t.stroke();t.lineWidth=1.3;for(let h=1;h<5;h++)t.beginPath(),t.moveTo(o[0]+46+h*12,o[1]-6+h*3),t.lineTo(o[0]+70+h*22,o[1]-2+h*4),t.stroke()}t.lineWidth=1.8;for(let[o,s,h]of[[2.9,-2.9,1],[3.4,-3.1,.8],[3.1,-2.6,.7],[-5.1,-2.4,.9],[4.9,2.9,.8]]){let c=p(o,s);t.beginPath(),t.moveTo(c[0]-14*h,c[1]-2),t.quadraticCurveTo(c[0]-6*h,c[1]-10*h,c[0],c[1]),t.quadraticCurveTo(c[0]+6*h,c[1]-10*h,c[0]+14*h,c[1]-2),t.stroke()}{let o=p(4.5,7.5),s=.62*a;t.lineWidth=2,t.strokeStyle="#000",t.fillStyle="#fff",t.beginPath(),t.arc(o[0],o[1],s*.75,0,Math.PI*2),t.fill(),t.stroke(),t.beginPath(),t.arc(o[0],o[1],s*.68,0,Math.PI*2),t.stroke();for(let h=0;h<8;h++){let c=h/8*Math.PI*2,f=h%2?s*.6:s,r=[o[0]+Math.sin(c)*f,o[1]-Math.cos(c)*f],y=[o[0]+Math.sin(c-.5)*s*.14,o[1]-Math.cos(c-.5)*s*.14],x=[o[0]+Math.sin(c+.5)*s*.14,o[1]-Math.cos(c+.5)*s*.14];t.fillStyle="#fff",t.beginPath(),t.moveTo(y[0],y[1]),t.lineTo(r[0],r[1]),t.lineTo(x[0],x[1]),t.lineTo(o[0],o[1]),t.closePath(),t.fill(),t.stroke(),t.fillStyle="#000",t.beginPath(),t.moveTo(o[0],o[1]),t.lineTo(r[0],r[1]),t.lineTo(x[0],x[1]),t.closePath(),t.fill()}l.fillStyle="#d8c79a",l.beginPath(),l.arc(o[0],o[1],s*.75,0,Math.PI*2),l.fill()}t.strokeStyle="#000",t.lineWidth=5,t.strokeRect(.32*a,.32*a,e-.64*a,n-.64*a),t.lineWidth=1.6,t.strokeRect(.42*a,.42*a,e-.84*a,n-.84*a);for(let o of[t,l])o.fillStyle="#fff",o.fillRect(0,0,e,.3*a),o.fillRect(0,n-.3*a,e,.3*a),o.fillRect(0,0,.3*a,n),o.fillRect(e-.3*a,0,.3*a,n);return{ink:v,wash:g,island:d}}var W=Mt(ut(),1);function Xt(){return{uLitho:{value:1},uPaper:{value:new W.Vector3(.93,.905,.845)},uInk:{value:new W.Vector3(.1,.09,.085)},uLight:{value:new W.Vector3(-.42,.82,.4).normalize()},uCyl:{value:new W.Vector4(0,0,0,1)},uDim:{value:new W.Vector2(1,3.2)},uSheet:{value:null},uSheetRect:{value:new W.Vector4},uHatchPx:{value:7}}}var Re=`
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
`,Se=`
float hatchSet(float a, float c) {
  float d = abs(fract(a) - 0.5) * 2.0;
  float aa = fwidth(a) * 1.5 + 0.02;
  return smoothstep(1.0 - c - aa, 1.0 - c + aa, d) * smoothstep(0.0, 0.08, c);
}
vec3 litho(vec3 col, vec2 huv, float hfw) {
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  vec3 colour = col + (g * 0.03 + gw * 0.025);
  float L = dot(col, vec3(0.30, 0.59, 0.11));
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float want = max(hfw * uHatchPx, 1e-5);
  float lv = log2(want / 0.01);
  float l0 = floor(lv), fr = lv - l0;
  float hpA = 0.01 * exp2(l0), hpB = hpA * 2.0;
  float c1 = clamp((0.66 - t) * 1.25, 0.0, 0.85);
  float c2 = clamp((0.38 - t) * 1.6, 0.0, 0.85);
  float h1 = mix(hatchSet((huv.x + huv.y) / hpA, c1), hatchSet((huv.x + huv.y) / hpB, c1), fr);
  float h2 = mix(hatchSet((huv.x - huv.y) / hpA, c2), hatchSet((huv.x - huv.y) / hpB, c2), fr);
  float v = 0.16 + 0.86 * t - h1 * 0.34 - h2 * 0.3 + g * 0.1 + gw * 0.06;
  return mix(colour, mix(uInk, uPaper, clamp(v, 0.0, 1.0)), uLitho);
}
`,Pt=`
uniform float uLitho;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uLight;
uniform vec4 uCyl;
uniform vec2 uDim;
uniform sampler2D uSheet;
uniform vec4 uSheetRect;
uniform float uHatchPx;
${Re}
${Se}

// soft shadow of the cylinder on the table (directional light)
float cylShadow(vec3 p) {
  vec2 L = uLight.xz / uLight.y;
  vec2 c = uCyl.xz;
  // the sun ray from p is above p + L*h at height h; the cylinder fills h in [base, base + H]
  float h = clamp(dot(c - p.xz, L) / dot(L, L), uCyl.y, uCyl.y + uDim.y);
  float d = length(p.xz + L * h - c);
  float pen = 0.04 + 0.05 * h;
  return (1.0 - smoothstep(uDim.x - pen, uDim.x + pen, d)) * uCyl.w;
}

float lampPool(vec3 p) {
  return 1.0 - 0.42 * smoothstep(5.0, 17.0, length(p.xz - vec2(-0.6, 1.2)));
}

vec3 tableColour(vec3 p, out vec2 huv) {
  // planks along x, 0.9 wide
  float w = 0.9;
  float row = floor(p.z / w);
  float fz = fract(p.z / w) * w;
  float off = hash12(vec2(row, 1.3)) * 7.0;
  float grain = fbm(vec2((p.x + off) * 0.35, p.z * 9.0));
  float knot = smoothstep(0.08, 0.0, length(vec2(fract((p.x + off) / 3.1) - 0.5, fz / w - 0.5) * vec2(3.1, 1.6)) - 0.05);
  vec3 c = mix(vec3(0.6, 0.47, 0.33), vec3(0.73, 0.6, 0.44), grain);
  c *= 0.9 + 0.18 * hash12(vec2(row, 7.0));
  c *= 1.0 - 0.35 * knot;
  float seam = smoothstep(0.012, 0.0, min(fz, w - fz));
  c *= 1.0 - 0.55 * seam;
  huv = p.xz * 1.3;
  return c;
}

// colour of the table top at p (y = 0), lit, shadowed, in display space
vec3 groundColour(vec3 p, float hfw) {
  vec2 q = (p.xz - uSheetRect.xy) / (uSheetRect.zw - uSheetRect.xy);
  float lightK = (0.5 + 0.55 * uLight.y) * lampPool(p);
  float sh = cylShadow(p);
  // contact darkening round the foot of the cylinder
  float r = length(p.xz - uCyl.xz);
  float ao = 1.0 - 0.35 * exp(-max(r - uDim.x, 0.0) * 9.0) * step(uCyl.y, 0.01) * uCyl.w;
  vec3 col;
  if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
    vec4 s = texture2D(uSheet, vec2(q.x, 1.0 - q.y));
    float ink = s.a;
    vec3 wash = s.rgb;
    float grain = 0.965 + 0.05 * vnoise(p.xz * 37.0) + 0.02 * fbm(p.xz * 3.0);
    vec3 paper = uPaper * grain;
    vec3 colourV = mix(paper * mix(vec3(1.0), wash, 0.9), vec3(0.16, 0.12, 0.1), ink * 0.92);
    float lum = dot(wash, vec3(0.3, 0.59, 0.11));
    vec3 lithoV = mix(paper * mix(1.0, lum, 0.22), uInk, ink * 0.92);
    col = mix(colourV, lithoV, uLitho);
    // the sheet's edge casts a hairline shadow and catches a little light
    vec2 e = min(q, 1.0 - q) * (uSheetRect.zw - uSheetRect.xy);
    col *= 1.0 - 0.06 * smoothstep(0.05, 0.0, min(e.x, e.y));
    col *= lightK * (1.0 - 0.42 * sh) * ao;
  } else {
    vec2 huv;
    vec3 c = tableColour(p, huv);
    // the paper's shadow on the wood, just outside its edge (offset away from the light)
    vec2 d = max(uSheetRect.xy - p.xz, p.xz - uSheetRect.zw);
    float outside = max(d.x, d.y);
    float paperSh = smoothstep(0.12, 0.0, outside) * 0.35;
    c *= lightK * (1.0 - 0.5 * sh) * ao * (1.0 - paperSh);
    col = litho(c, huv, hfw * 1.3);
  }
  return col;
}

vec3 envColour(vec3 d) {
  // a dim room: darker low down, a bright window over the left shoulder
  vec3 wall = mix(vec3(0.45, 0.42, 0.38), vec3(0.95, 0.93, 0.88), smoothstep(-0.1, 0.6, d.y));
  float w = smoothstep(0.86, 0.93, dot(d, uLight));
  vec3 c = mix(wall, vec3(1.05), w);
  vec3 lt = mix(uInk, uPaper, smoothstep(0.15, 0.95, dot(c, vec3(0.3, 0.59, 0.11))));
  return mix(c, lt, uLitho);
}
`,kt=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;function Kt(e){return new W.ShaderMaterial({uniforms:e,vertexShader:kt,fragmentShader:`
${Pt}
varying vec3 vW;
void main() {
  vec3 p = vec3(vW.x, 0.0, vW.z);
  float fw = max(fwidth(p.x), fwidth(p.z));
  vec3 c = groundColour(p, fw);
  // fade the far table into the room
  float far = smoothstep(10.0, 24.0, length(p.xz));
  c = mix(c, envColour(normalize(vec3(p.x, 0.02, p.z))), far);
  gl_FragColor = vec4(c, 1.0);
}
`})}function Jt(e){return new W.ShaderMaterial({uniforms:e,vertexShader:kt,fragmentShader:`
${Pt}
varying vec3 vW;
void main() {
  gl_FragColor = vec4(envColour(normalize(vW - cameraPosition)), 1.0);
}
`,side:W.BackSide,depthWrite:!1})}function Qt(e){return new W.ShaderMaterial({uniforms:e,vertexShader:kt,transparent:!0,fragmentShader:`
${Pt}
varying vec3 vW;
void main() {
  vec3 ro = cameraPosition - vec3(uCyl.x, uCyl.y, uCyl.z);
  vec3 rd = normalize(vW - cameraPosition);
  float R = uDim.x, Hc = uDim.y;
  float tHit = 1e9;
  vec3 n = vec3(0.0);
  float side = 0.0;
  float a = dot(rd.xz, rd.xz);
  float b = 2.0 * dot(ro.xz, rd.xz);
  float c = dot(ro.xz, ro.xz) - R * R;
  float disc = b * b - 4.0 * a * c;
  // distance of the ray from the axis, for the silhouette line
  float dAxis = abs(ro.x * rd.z - ro.z * rd.x) / sqrt(max(a, 1e-8));
  if (disc > 0.0) {
    float t = (-b - sqrt(disc)) / (2.0 * a);
    float y = ro.y + t * rd.y;
    if (t > 0.0 && y >= 0.0 && y <= Hc) { tHit = t; vec3 p = ro + t * rd; n = vec3(p.x, 0.0, p.z) / R; side = 1.0; }
  }
  if (rd.y < 0.0) {
    float t = (Hc - ro.y) / rd.y;
    vec3 p = ro + t * rd;
    if (t > 0.0 && t < tHit && dot(p.xz, p.xz) <= R * R) { tHit = t; n = vec3(0.0, 1.0, 0.0); side = 0.0; }
  }
  if (tHit > 1e8) discard;
  vec3 pl = ro + tHit * rd;
  vec3 P = pl + vec3(uCyl.x, uCyl.y, uCyl.z);
  vec3 r = reflect(rd, n);
  vec3 col;
  if (r.y < -1e-4) {
    vec3 G = P + r * (-P.y / r.y);
    float fw = max(fwidth(G.x), fwidth(G.z));
    col = groundColour(G, min(fw, 0.5));
    float far = smoothstep(10.0, 24.0, length(G.xz));
    col = mix(col, envColour(normalize(vec3(G.x, 0.02, G.z))), far);
  } else {
    col = envColour(r);
  }
  // polished steel: a faint cool tint, a little darker at normal incidence
  float cosi = abs(dot(rd, n));
  vec3 tint = mix(vec3(0.84, 0.86, 0.9), vec3(0.88), uLitho);
  col *= tint * (0.92 + 0.08 * pow(1.0 - cosi, 2.0));
  // the top face catches the room's light
  if (side < 0.5) col = mix(col, uPaper * 1.02, 0.35);
  col += pow(max(dot(r, uLight), 0.0), 140.0) * 0.5;
  // ink: silhouette, top rim and foot
  float e1 = (R - dAxis) / max(fwidth(dAxis), 1e-5);
  float e2 = side > 0.5 ? (Hc - pl.y) / max(fwidth(pl.y), 1e-5) : (R - length(pl.xz)) / max(fwidth(length(pl.xz)), 1e-5);
  float e3 = side > 0.5 ? pl.y / max(fwidth(pl.y), 1e-5) : 1e3;
  float e = min(side > 0.5 ? e1 : 1e3, min(e2, e3));
  float inkL = 1.0 - smoothstep(0.6, 1.6, e);
  col = mix(col, uInk, inkL * 0.9);
  gl_FragColor = vec4(col, uCyl.w);
}
`})}function Zt(e,n){return new W.ShaderMaterial({uniforms:{tInk:{value:e},tWash:{value:n}},vertexShader:`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,fragmentShader:`
uniform sampler2D tInk, tWash;
varying vec2 vUv;
void main() {
  float ink = 1.0 - dot(texture2D(tInk, vUv).rgb, vec3(0.333));
  gl_FragColor = vec4(texture2D(tWash, vUv).rgb, ink);
}
`,depthTest:!1,depthWrite:!1,blending:W.NoBlending})}function te(e,n){return new W.ShaderMaterial({uniforms:{tInk:{value:e},tWash:{value:n}},vertexShader:`
attribute vec2 pic;
varying vec2 vPic;
void main() { vPic = pic; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,fragmentShader:`
uniform sampler2D tInk, tWash;
varying vec2 vPic;
void main() {
  vec4 w = texture2D(tWash, vPic);
  if (w.a < 0.5) discard; // outside the drawn window: keep the sheet's own drawing
  float ink = 1.0 - dot(texture2D(tInk, vPic).rgb, vec3(0.333));
  gl_FragColor = vec4(w.rgb, ink);
}
`,depthTest:!1,depthWrite:!1,blending:W.NoBlending,side:W.DoubleSide})}var ee=10631978,Q=document.getElementById("scene"),j=new m.WebGLRenderer({canvas:Q,antialias:!0,powerPreference:"high-performance"});j.setPixelRatio(Math.min(window.devicePixelRatio||1,2));j.setClearColor(15525333,1);var O=Xt();O.uDim.value.set(Z,st);O.uSheetRect.value.set(b.x0,b.z0,b.x1,b.z1);function ne(e={}){let n=Yt(),a=Nt(),v=o=>{let s=new m.CanvasTexture(o);return s.minFilter=m.LinearMipmapLinearFilter,s.anisotropy=j.capabilities.getMaxAnisotropy(),s},t=v(n.ink),g=v(n.wash),l=v(a.ink),p=v(a.wash),i=j.capabilities.maxTextureSize||4096,d=Math.min(2048,i),T=Math.min(i,Math.round(d*(b.z1-b.z0)/(b.x1-b.x0))),w=new m.WebGLRenderTarget(d,T,{minFilter:m.LinearMipmapLinearFilter,magFilter:m.LinearFilter,generateMipmaps:!0,depthBuffer:!1});w.texture.anisotropy=j.capabilities.getMaxAnisotropy();let M=220,k=360,E=new Float32Array((M+1)*(k+1)*3),S=new Float32Array((M+1)*(k+1)*2),P=new Uint8Array((M+1)*(k+1)),I=new Float32Array((M+1)*(k+1)),R=new Float32Array((M+1)*(k+1));for(let o=0;o<=k;o++)for(let s=0;s<=M;s++){let h=o*(M+1)+s,c=s/M,f=o/k,r=ot(L.u0+(L.u1-L.u0)*c,L.v0+(L.v1-L.v0)*f);if(S[h*2]=c,S[h*2+1]=f,!r||!r.ground)continue;let y=r.ground;P[h]=1,I[h]=y.x,R[h]=y.z,E[h*3]=(y.x-b.x0)/(b.x1-b.x0)*2-1,E[h*3+1]=1-(y.z-b.z0)/(b.z1-b.z0)*2}let B=[],C=(o,s)=>Math.hypot(I[o]-I[s],R[o]-R[s])<1.2;for(let o=0;o<k;o++)for(let s=0;s<M;s++){let h=o*(M+1)+s,c=h+1,f=h+M+1,r=f+1;P[h]&&P[c]&&P[f]&&C(h,c)&&C(h,f)&&C(c,f)&&B.push(h,c,f),P[c]&&P[r]&&P[f]&&C(c,r)&&C(r,f)&&C(c,f)&&B.push(c,r,f)}let A=new m.BufferGeometry;A.setAttribute("position",new m.BufferAttribute(E,3)),A.setAttribute("pic",new m.BufferAttribute(S,2)),A.setIndex(B);let N=new m.Scene,U=new m.Mesh(new m.PlaneGeometry(2,2),Zt(l,p));U.frustumCulled=!1,U.renderOrder=0;let D=new m.Mesh(A,te(t,g));D.frustumCulled=!1,D.renderOrder=1,N.add(U,D),e.noMap&&(D.visible=!1);let F=new m.Camera;j.setRenderTarget(w),j.render(N,F),j.setRenderTarget(null);for(let o of[t,g,l,p])o.dispose();return A.dispose(),w}var yt=ne();O.uSheet.value=yt.texture;var lt=new m.Scene;{let e=new m.PlaneGeometry(80,80);e.rotateX(-Math.PI/2);let n=new m.Mesh(e,Kt(O));n.frustumCulled=!1,lt.add(n);let a=new m.Mesh(new m.SphereGeometry(120,32,16),Jt(O));a.frustumCulled=!1,a.renderOrder=-1,lt.add(a)}var zt=new m.Mesh(new m.CylinderGeometry(Z*1.06,Z*1.06,st+.06,64,1,!1),Qt(O));zt.frustumCulled=!1;lt.add(zt);var G={x:0,base:0,z:0};function ae(){zt.position.set(G.x,G.base+st/2,G.z),O.uCyl.value.set(G.x,G.base,G.z,1)}ae();var X=new m.Group,re=[];{let e=new m.MeshBasicMaterial({color:ee,transparent:!0}),n=new m.MeshBasicMaterial({color:ee,transparent:!0,opacity:.5});re.push([e,1],[n,.55]);let a=new m.CylinderGeometry(1,1,1,6,1,!0);a.translate(0,.5,0);let v=[],t=(p,i,d,T=.036,w=.3,M=.17)=>{let k=i.clone().sub(p),E=k.length(),S=new m.Quaternion().setFromUnitVectors(new m.Vector3(0,1,0),k.clone().normalize());for(let P=0;P<E;P+=w+M)v.push({mat:d,p:p.clone().addScaledVector(k,P/E),q:S,len:Math.min(w,E-P),r:T})},g=(p,i,d=.06)=>{let T=new m.Mesh(new m.SphereGeometry(d,12,8),i);T.position.copy(p),X.add(T)};for(let[p,i]of Tt()){let d=ot(p,i);!d||!d.ground||(t($,d.hit,e),t(d.hit,d.ground,e),g(d.hit,e,.06),g(d.ground,e,.09))}for(let[p,i]of[[L.u0*.97,L.v1*.97],[L.u1*.97,L.v1*.97]]){let d=ot(p,i);d&&d.ground&&(t($,d.hit,n,.018),t(d.hit,d.ground,n,.018))}for(let p of[e,n]){let i=v.filter(w=>w.mat===p),d=new m.InstancedMesh(a,p,i.length),T=new m.Matrix4;i.forEach((w,M)=>d.setMatrixAt(M,T.compose(w.p,w.q,new m.Vector3(w.r,w.len,w.r)))),d.frustumCulled=!1,X.add(d)}g($,e,.16);let l=new m.Mesh(new m.TorusGeometry(.34,.025,6,40),e);l.position.copy($),X.add(l),X.userData.ring=l,X.renderOrder=5,X.visible=!1,lt.add(X)}var _=new m.PerspectiveCamera(27,30/38,.1,400),ie=new m.Vector3(0,1.1,1),Ht=$.clone().sub(J),se=Ht.length(),le=Math.asin(Ht.y/se),gt=23,ht={eye:()=>({pos:$.clone(),target:ie.clone(),fov:gt,up:new m.Vector3(0,1,0)}),sheet:()=>({pos:new m.Vector3(0,23,1.8+.001),target:new m.Vector3(0,0,1.8),fov:40,up:new m.Vector3(0,0,-1)}),rays:()=>({pos:new m.Vector3(-18,9,5.5),target:new m.Vector3(0,4.4,5.6),fov:64,up:new m.Vector3(0,1,0)})};function ce(e,n,a=gt){let v=new m.Vector3(Math.sin(e)*Math.cos(n),Math.sin(n),Math.cos(e)*Math.cos(n)).multiplyScalar(se).add(J),t=ie.clone().sub(J).applyAxisAngle(new m.Vector3(0,1,0),e).add(J);return{pos:v,target:t,fov:a,up:new m.Vector3(0,1,0)}}function St(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2}var vt=[[0,0,0],[6,0,0],[10.5,.62,.2],[12,.62,.2],[17.5,-.5,-.17],[19,-.5,-.17],[23.5,0,0],[26,0,0]],Rt=26;function ze(e){let n=(e%Rt+Rt)%Rt,a=0;for(;a<vt.length-2&&vt[a+1][0]<=n;)a++;let[v,t,g]=vt[a],[l,p,i]=vt[a+1],d=St(Math.min(1,Math.max(0,(n-v)/Math.max(1e-6,l-v))));return t===0&&g===0&&p===0&&i===0?ht.eye():ce(t+(p-t)*d,le+g+(i-g)*d)}var u={mode:"tour",tourTime:0,playing:!0,litho:1,lithoTarget:1,tween:null,cur:ht.eye(),orbit:{az:0,el:le,fov:gt},rays:0,cyl:null};function He(e){_.position.copy(e.pos),_.up.copy(e.up).normalize(),_.lookAt(e.target),_.fov!==e.fov&&(_.fov=e.fov,_.updateProjectionMatrix())}function Ie(e){return{pos:e.pos.clone(),target:e.target.clone(),fov:e.fov,up:e.up.clone()}}function It(e,n=2.2,a){u.tween={from:Ie(u.cur),to:e,t:0,dur:n,then:a}}function Ct(e,n=2){u.cyl={from:{...G},to:e,t:0,dur:n}}var Lt=document.getElementById("hint"),ft=document.getElementById("btn-rays");Dt();bt([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{u.lithoTarget=e},1);var tt=bt([[document.getElementById("btn-mirror"),"mirror"],[document.getElementById("btn-sheet"),"sheet"]],e=>{e==="sheet"?Le():(u.mode==="sheet"||u.mode==="rays")&&(ft.setAttribute("aria-pressed","false"),ct())},"mirror"),Ce=Ft(e=>{u.playing=e});function Le(){et(!1,!0),u.mode="sheet",Ct({x:8.8,base:0,z:-1.2},2.2),It(ht.sheet(),2.6),Lt.textContent="The sheet on its own: an island fortress in a lake"}function ct(){u.mode="returning",(G.x!==0||G.z!==0)&&Ct({x:0,base:0,z:0},2.2),It(ht.eye(),2.4,()=>{u.mode="tour",u.tourTime=0}),Lt.textContent="Drag to look from elsewhere \xB7 scroll to zoom \xB7 double-click to return to the eye point"}function et(e,n){ft.setAttribute("aria-pressed",String(e)),e?(u.mode==="sheet"&&tt("mirror"),G.x!==0&&Ct({x:0,base:0,z:0},2),u.mode="rays",It(ht.rays(),2.6),Lt.textContent="Red: eye rays from the corners of the triangle, reflected by the cylinder onto the paper"):!n&&u.mode==="rays"&&ct()}ft.addEventListener("click",()=>et(u.mode!=="rays"));Bt({" ":()=>Ce(!u.playing),l:()=>document.getElementById(u.lithoTarget?"btn-colour":"btn-litho").click(),s:()=>tt(u.mode==="sheet"?"mirror":"sheet"),m:()=>tt("mirror"),r:()=>et(u.mode!=="rays"),e:()=>{tt("mirror"),et(!1,!0),ct()},0:()=>{tt("mirror"),et(!1,!0),ct()}});var at=null;function he(){if(u.mode==="manual"||u.mode==="sheet")return;let e=u.cur.pos.clone().sub(J);u.orbit={az:Math.atan2(e.x,e.z),el:Math.asin(Math.min(.99,Math.max(-.2,e.y/e.length()))),fov:u.cur.fov},u.mode==="rays"&&ft.setAttribute("aria-pressed","false"),u.mode="manual",u.tween=null}Q.addEventListener("pointerdown",e=>{Q.setPointerCapture(e.pointerId),at={x:e.clientX,y:e.clientY}});Q.addEventListener("pointermove",e=>{if(!at)return;let n=e.clientX-at.x,a=e.clientY-at.y;if(Math.abs(n)+Math.abs(a)<1||(at={x:e.clientX,y:e.clientY},u.mode==="sheet"))return;let v=u.mode==="rays";he(),v&&(u.rays=1),u.orbit.az-=n*.005,u.orbit.el=Math.min(1.45,Math.max(.08,u.orbit.el+a*.004))});var fe=()=>{at=null};Q.addEventListener("pointerup",fe);Q.addEventListener("pointercancel",fe);Q.addEventListener("dblclick",()=>{tt("mirror"),et(!1,!0),ct()});Q.addEventListener("wheel",e=>{e.preventDefault(),u.mode!=="sheet"&&(he(),u.orbit.fov=Math.min(60,Math.max(10,u.orbit.fov*Math.exp(e.deltaY*.001))))},{passive:!1});qt(30/38,(e,n)=>{j.setSize(e,n),_.aspect=e/n,_.updateProjectionMatrix()});var oe=performance.now();function xt(e){if(u.playing&&u.mode==="tour"&&(u.tourTime+=e),u.litho!==u.lithoTarget){let t=u.lithoTarget-u.litho;u.litho+=Math.sign(t)*Math.min(Math.abs(t),e*2.2),O.uLitho.value=u.litho}if(u.cyl){let t=u.cyl;t.t=Math.min(1,t.t+e/t.dur);let g=St(t.t);G.x=t.from.x+(t.to.x-t.from.x)*g,G.z=t.from.z+(t.to.z-t.from.z)*g,G.base=Math.sin(Math.PI*g)*1.4*(Math.abs(t.to.x-t.from.x)>.1?1:0),t.t>=1&&(u.cyl=null),ae()}if(u.tween){let t=u.tween;t.t=Math.min(1,t.t+e/t.dur);let g=St(t.t);u.cur={pos:t.from.pos.clone().lerp(t.to.pos,g),target:t.from.target.clone().lerp(t.to.target,g),fov:t.from.fov+(t.to.fov-t.from.fov)*g,up:t.from.up.clone().lerp(t.to.up,g).normalize()},t.t>=1&&(u.tween=null,t.then?.())}else u.mode==="tour"?u.cur=ze(u.tourTime):u.mode==="manual"&&(u.cur=ce(u.orbit.az,u.orbit.el,u.orbit.fov));He(u.cur);let n=u.mode==="rays"||u.mode==="manual"&&ft.getAttribute("aria-pressed")==="true"?1:0;u.rays+=Math.sign(n-u.rays)*Math.min(Math.abs(n-u.rays),e*1.4),X.visible=u.rays>.01;for(let[t,g]of re)t.opacity=g*u.rays;X.userData.ring.lookAt(_.position);let a=_.position.distanceTo($),v=m.MathUtils.radToDeg(_.position.clone().sub(J).angleTo(Ht));u.mode==="sheet"&&!u.tween?it(!0,"Sheet only: the drawing as a picture in its own right"):u.mode==="rays"&&!u.tween?it(!0,"Each eye ray keeps its slope and is mirrored sideways"):a<.05?it(!0,"At the eye point: the mirror rebuilds the picture"):it(!0,`${Math.max(1,Math.round(v))}\xB0 from the eye point: the reflection bends`),j.render(lt,_)}function ue(e){let n=Math.min(.05,Math.max(0,(e-oe)/1e3));oe=e,xt(n),requestAnimationFrame(ue)}Gt();requestAnimationFrame(ue);window.__page={state:u,camera:_,renderer:j,u:O,step:xt,setView:tt,setRays:et,setLitho(e){document.getElementById(e?"btn-litho":"btn-colour").click(),u.litho=e?1:0,O.uLitho.value=u.litho},setTour(e){u.mode="tour",u.tween=null,u.tourTime=e},orbit(e,n,a=gt){u.mode="manual",u.tween=null,u.orbit={az:e,el:n,fov:a}},finish(){u.tween&&(u.tween.t=1),u.cyl&&(u.cyl.t=1),xt(1e-4),xt(1e-4)},fov(e){u.cur.fov=e},rebuild(e){yt.dispose(),yt=ne(e),O.uSheet.value=yt.texture}};})();
