(()=>{var Xe=Object.create;var Xt=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var Ye=Object.getOwnPropertyNames;var Ze=Object.getPrototypeOf,Je=Object.prototype.hasOwnProperty;var tn=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var en=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of Ye(e))!Je.call(t,a)&&a!==o&&Xt(t,a,{get:()=>e[a],enumerable:!(n=Qe(e,a))||n.enumerable});return t};var nn=(t,e,o)=>(o=t!=null?Xe(Ze(t)):{},en(e||!t||!t.__esModule?Xt(o,"default",{value:t,enumerable:!0}):o,t));var Yt=tn((Pn,Qt)=>{Qt.exports=window.THREE});var i=nn(Yt(),1);var I=(t,e,o)=>[t,e,o],Q=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],X=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],N=(t,e)=>[t[0]*e,t[1]*e,t[2]*e],xt=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],Jt=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Mt=t=>Math.hypot(t[0],t[1],t[2]),$=t=>N(t,1/(Mt(t)||1)),kt=(t,e)=>$(X(t,N(e,xt(t,e)))),ut={roll:.36,pitch:.17,dev:.5,ext:-.42},te=I(7.2,3.4,1.2),St=I(10.3,3.85,-2.9),wt=$(X(St,te)),O={r:.37,tipLen:.35,coneLen:2.1,back:10.5},on=3.4,an=Q(St,N(wt,on));function Ht(t,e,o){let n=Math.max(o-Math.abs(t-e),0)/o;return Math.min(t,e)-n*n*o*.25}function sn(t,e,o,n){let a=X(e,t),r=xt(a,a),c=o-n,s=r-c*c,f=1/r;return{a:t,b:e,r1:o,r2:n,ba:a,l2:r,rr:c,a2:s,il2:f,k:Math.sign(c)*c*c}}function gt(t,e,o,n){let a=t-n.a[0],r=e-n.a[1],c=o-n.a[2],s=n.ba[0],f=n.ba[1],v=n.ba[2],m=a*s+r*f+c*v,d=m-n.l2,u=a*n.l2-s*m,l=r*n.l2-f*m,p=c*n.l2-v*m,h=u*u+l*l+p*p,x=m*m*n.l2,H=d*d*n.l2,g=n.k*h;return Math.sign(d)*n.a2*H>g?Math.sqrt(h+H)*n.il2-n.r2:Math.sign(m)*n.a2*x<g?Math.sqrt(h+x)*n.il2-n.r1:(Math.sqrt(h*n.a2*n.il2)+m*n.rr)*n.il2-n.r1}function Tt(t,e,o){return{c:t,r:e,m:o}}function rn(t,e,o,n){let a=t-n.c[0],r=e-n.c[1],c=o-n.c[2];if(n.m){let h=n.m,x=h[0]*a+h[1]*r+h[2]*c,H=h[3]*a+h[4]*r+h[5]*c,g=h[6]*a+h[7]*r+h[8]*c;a=x,r=H,c=g}let s=a/n.r[0],f=r/n.r[1],v=c/n.r[2],m=s/n.r[0],d=f/n.r[1],u=v/n.r[2],l=Math.sqrt(s*s+f*f+v*v),p=Math.sqrt(m*m+d*d+u*u);return p>1e-9?l*(l-1)/p:-Math.min(n.r[0],n.r[1],n.r[2])}function Ct(t,e,o,n){let a=[0,0,-1],r=[t],c=0,s=t;for(let f=0;f<o.length;f++){c+=n[f];let v=Q(N(e,Math.cos(c)),N(a,Math.sin(c)));s=Q(s,N(v,o[f])),r.push(s)}return r}function Zt(t,e,o,n,a=0){let r=X(o,t),c=$([r[0],r[1],0]),s=Math.hypot(r[0],r[1]),f=-r[2],v=(p,h)=>{let x=[p,p+h,p+h+n*h],H=0,g=0;for(let w=0;w<3;w++)H+=e[w]*Math.cos(x[w]),g+=e[w]*Math.sin(x[w]);return[H,g]},m=[0,0],d=1e9;for(let p=-.5;p<=1.7;p+=.02)for(let h=0;h<=2.1;h+=.02){let[x,H]=v(p,h),g=(x-s)**2+(H-f)**2+.002*h*h;g<d&&(d=g,m=[p,h])}let u=[m[0],m[1],n*m[1]],l=$(Q(c,[-c[1]*a,c[0]*a,0]));return{pts:Ct(t,c,e,u),d:l,err:Math.sqrt(d)}}function cn(t,e,o,n,a){let r=X(e,t),c=Math.min(Mt(r),o+n-.001),s=$(r),f=kt(a,s),v=(o*o+c*c-n*n)/(2*o*c),m=Math.acos(Math.max(-1,Math.min(1,v))),d=Q(t,Q(N(s,o*Math.cos(m)),N(f,o*Math.sin(m)))),u=Q(d,N($(X(Q(t,N(s,c)),d)),n));return[t,d,u]}function ee(){let t={palm:[],fingers:[],pads:[]},e=(g,w,E,y)=>sn(g,w,E,y),o={index:I(8.4,2.45,.3),middle:I(8.8,.72,.42),ring:I(8.4,-.95,.22),pinky:I(7.7,-2.45,-.12)},n={index:I(1.6,1.25,.45),middle:I(1.4,.3,.55),ring:I(1.5,-.62,.45),pinky:I(1.7,-1.5,.25)},a={index:.84,middle:.86,ring:.8,pinky:.72};for(let g of["index","middle","ring","pinky"])t.palm.push(e(n[g],o[g],.62,a[g]));t.pads.push(Tt(I(4.7,0,-.2),[3.7,3,.78])),t.pads.push(Tt(I(3.2,2.15,-.75),[2.4,1.35,1])),t.pads.push(Tt(I(4,-2.05,-.6),[2.9,.82,.85])),t.pads.push(Tt(I(8,0,-.55),[1.1,2.9,.6])),t.palm.push(e(I(-13.5,0,0),I(-2.5,0,0),1.82,1.74)),t.palm.push(e(I(-2.5,0,0),I(1,0,.1),1.74,1.45));let r=1.5,c=kt([0,0,1],wt),s=$(Jt(wt,c)),f=(g,w,E)=>Q(Q(St,N(wt,g)),N(Q(N(c,Math.cos(w)),N(s,Math.sin(w))),O.r+E)),v={index:[4,2.35,1.85],middle:[4.45,2.75,1.95],ring:[4.15,2.6,1.85],pinky:[3.3,2,1.65]},m={index:[.9,.82,.73,.6],middle:[.93,.85,.75,.62],ring:[.88,.8,.7,.58],pinky:[.78,.7,.62,.5]},d={};d.index=Zt(o.index,v.index,f(.25,-.25,.62),.55),d.middle=Zt(o.middle,v.middle,f(1.25,Math.PI*.82,.55),.7),d.ring={pts:Ct(o.ring,$([.97,-.1,0]),v.ring,[.9,1.9,.9])},d.pinky={pts:Ct(o.pinky,$([.96,-.22,0]),v.pinky,[.95,1.85,.85])};for(let g of["index","middle","ring","pinky"]){let w=d[g].pts,E=m[g],y=[];for(let M=0;M<3;M++)y.push(e(w[M],w[M+1],E[M],E[M+1]));t.fingers.push({name:g,segs:y,pts:w,rad:E})}let u=I(1.7,2.1,-.55),l=I(5.6,4.35,-1.15),p=f(-.05,Math.PI*.42,.6),h=cn(l,p,3,2.55,$([-.2,.55,.8])),x={name:"thumb",segs:[e(u,l,1.25,1.02),e(h[0],h[1],1.02,.9),e(h[1],h[2],.9,.7)],pts:[u,...h],rad:[1.25,1.02,.9,.7]};t.fingers.push(x);for(let g of t.fingers){let w=[1e9,1e9,1e9],E=[-1e9,-1e9,-1e9];for(let y of g.segs)for(let M of[y.a,y.b])for(let b=0;b<3;b++)w[b]=Math.min(w[b],M[b]-1.4),E[b]=Math.max(E[b],M[b]+1.4);g.lo=w,g.hi=E}function H(g,w,E){let y=1e9;for(let b=0;b<t.palm.length;b++){let A=t.palm[b],C=b>=4?gt(g,w/r,E,A)*1.2:gt(g,w,E,A);y=b===0?C:Ht(y,C,b>=4?1.8:.9)}for(let b of t.pads)y=Ht(y,rn(g,w,E,b),.9);let M=y;for(let b of t.fingers){let A=Math.max(b.lo[0]-g,0,g-b.hi[0]),C=Math.max(b.lo[1]-w,0,w-b.hi[1]),V=Math.max(b.lo[2]-E,0,E-b.hi[2]);if(A*A+C*C+V*V>(y+1)*(y+1)&&y>0)continue;let S=gt(g,w,E,b.segs[0]);for(let R=1;R<b.segs.length;R++)S=Ht(S,gt(g,w,E,b.segs[R]),.22);y=Math.min(y,Ht(M,S,b.name==="thumb"?.8:.3))}return y}return{sdf:H,prims:t,fingers:d,thumb:x,MCP:o,pen:{W:te,C:St,D:wt,tip:an},n1:c,n2:s,ik:{index:d.index.err,middle:d.middle.err}}}function ne(t,e,o,n){let a=Math.ceil((o[0]-e[0])/n)+1,r=Math.ceil((o[1]-e[1])/n)+1,c=Math.ceil((o[2]-e[2])/n)+1,s=n*4,f=Math.ceil((o[0]-e[0])/s)+2,v=Math.ceil((o[1]-e[1])/s)+2,m=Math.ceil((o[2]-e[2])/s)+2,d=new Float32Array(f*v*m);for(let R=0;R<m;R++)for(let T=0;T<v;T++)for(let k=0;k<f;k++)d[k+f*(T+v*R)]=t(e[0]+k*s,e[1]+T*s,e[2]+R*s);let u=s*.65,l=new Float32Array(a*r*c),p=f*v;for(let R=0;R<c;R++){let T=e[2]+R*n,k=R*n/s,_=Math.floor(k),F=k-_;for(let L=0;L<r;L++){let P=e[1]+L*n,B=L*n/s,pt=Math.floor(B),J=B-pt,q=f*pt+p*_,tt=q+f,mt=q+p,ht=tt+p,vt=a*(L+r*R);for(let st=0;st<a;st++,vt++){let et=st*n/s,U=Math.floor(et),rt=et-U,Ge=d[q+U]*(1-rt)+d[q+U+1]*rt,Ue=d[tt+U]*(1-rt)+d[tt+U+1]*rt,$e=d[mt+U]*(1-rt)+d[mt+U+1]*rt,Ke=d[ht+U]*(1-rt)+d[ht+U+1]*rt,It=(Ge*(1-J)+Ue*J)*(1-F)+($e*(1-J)+Ke*J)*F;l[vt]=It>u||It<-u?It:t(e[0]+st*n,P,T)}}}let h=a-1,x=r-1,H=c-1,g=new Int32Array(h*x*H).fill(-1),w=[],E=a*r,y=[0,1,a,a+1,E,E+1,E+a,E+a+1],M=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],b=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],A=new Float64Array(8);for(let R=0;R<H;R++)for(let T=0;T<x;T++){let k=a*(T+r*R);for(let _=0;_<h;_++){let F=k+_,L=0;for(let q=0;q<8;q++){let tt=l[F+y[q]];A[q]=tt,tt<0&&L++}if(L===0||L===8)continue;let P=0,B=0,pt=0,J=0;for(let q=0;q<12;q++){let tt=b[q][0],mt=b[q][1],ht=A[tt],vt=A[mt];if(ht<0==vt<0)continue;let st=ht/(ht-vt),et=M[tt],U=M[mt];P+=et[0]+(U[0]-et[0])*st,B+=et[1]+(U[1]-et[1])*st,pt+=et[2]+(U[2]-et[2])*st,J++}g[_+h*(T+x*R)]=w.length/3,w.push(e[0]+(_+P/J)*n,e[1]+(T+B/J)*n,e[2]+(R+pt/J)*n)}}let C=(R,T,k)=>l[R+a*(T+r*k)],V=[],S=(R,T,k)=>g[R+h*(T+x*k)];for(let R=1;R<c-1;R++)for(let T=1;T<r-1;T++)for(let k=1;k<a-1;k++){let _=C(k,T,R)<0;if(k<a-1&&_!==C(k+1,T,R)<0){let F=S(k,T-1,R-1),L=S(k,T,R-1),P=S(k,T,R),B=S(k,T-1,R);_?V.push(F,L,P,F,P,B):V.push(F,P,L,F,B,P)}if(T<r-1&&_!==C(k,T+1,R)<0){let F=S(k-1,T,R-1),L=S(k,T,R-1),P=S(k,T,R),B=S(k-1,T,R);_?V.push(F,P,L,F,B,P):V.push(F,L,P,F,P,B)}if(R<c-1&&_!==C(k,T,R+1)<0){let F=S(k-1,T-1,R),L=S(k,T-1,R),P=S(k,T,R),B=S(k-1,T,R);_?V.push(F,L,P,F,P,B):V.push(F,P,L,F,B,P)}}return{positions:new Float32Array(w),index:new Uint32Array(V)}}var oe=(t,e,o)=>{let n=Math.min(1,Math.max(0,(o-t)/(e-t)));return n*n*(3-2*n)};function ae(t,e){let o=Math.cos(ut.roll),n=Math.sin(ut.roll),a=(d,u)=>{let l=Math.cos(u),p=Math.sin(u),h=d[1]*o-d[2]*n,x=d[1]*n+d[2]*o;return[d[0]*l+x*p,h,-d[0]*p+x*l]},r=(d,u)=>{let l=oe(-2.6,.9,u),p=ut.ext*(1-l),h=Math.cos(p),x=Math.sin(p),H=d[0]*h+d[2]*x,g=-d[0]*x+d[2]*h,w=d[1],E=ut.dev*l,y=Math.cos(E),M=Math.sin(E);return[H*y-w*M,H*M+w*y,g]},c=ut.pitch;if(e){let d=[];for(let h=0;h<e.length;h+=9)e[h]>1.5&&d.push([e[h],e[h+1],e[h+2]]);let u=h=>{let x=1e9;for(let H of d)x=Math.min(x,a(H,h)[2]);return x-a(t.pen.tip,h)[2]},l=-.3,p=.9;for(let h=0;h<30;h++){let x=(l+p)/2;u(x)>0?p=x:l=x}c=(l+p)/2}let f=-a(t.pen.tip,c)[2];return{rot:d=>{let u=a(d,c),l=ut.dev,p=Math.cos(l),h=Math.sin(l);return[u[0]*p-u[1]*h,u[0]*h+u[1]*p,u[2]]},pitch:c,lift:f,apply:d=>{let u=r(a(d,c),d[0]);return[u[0],u[1],u[2]+f]}}}function se(t,e,o,n){let a=e.length/3,r=new Float32Array(a).fill(9),c=new Float32Array(a).fill(1),s=new Float32Array(a),f=t.prims.fingers.filter(u=>["index","middle","thumb"].includes(u.name)),v=t.prims.fingers.filter(u=>!["index","middle","thumb"].includes(u.name)),m=(u,l)=>{let p=1e9;for(let h of l.segs)p=Math.min(p,gt(u[0],u[1],u[2],h));return p},d=[];for(let u of t.prims.fingers){let l=u.pts,p=u.rad,h=l[l.length-2],x=l[l.length-1],H=$(X(x,h)),g;u.name==="thumb"?g=kt($([-.15,.6,.8]),H):g=kt([0,0,1],H);let w=Jt(H,g),E=Mt(X(x,h));d.push({j3:h,u:H,dors:g,side:w,L:E,r:p[p.length-2],rt:p[p.length-1]})}for(let u=0;u<a;u++){let l=[e[3*u],e[3*u+1],e[3*u+2]],p=9;for(let M of d){let b=X(l,M.j3),A=xt(b,M.u);if(A<-.2||A>M.L+M.rt+.3)continue;let C=X(b,N(M.u,A)),V=Mt(C),S=M.r+(M.rt-M.r)*Math.min(1,Math.max(0,A/M.L));if(Math.abs(V-S)>.35)continue;let R=Math.atan2(xt(C,M.side),xt(C,M.dors)),T=A-(.35*M.L+(M.L+.35*M.rt))/2,k=(M.L+.35*M.rt-.35*M.L)/2,_=R*S,F=.62*S,L=Math.abs(T)-k+.18,P=Math.abs(_)-F+.18,B=Math.min(Math.max(L,P),0)+Math.hypot(Math.max(L,0),Math.max(P,0))-.18;B<p&&(p=B)}r[u]=p;let h=1e9;for(let M of f)h=Math.min(h,m(l,M));let x=1e9;for(let M of v)x=Math.min(x,m(l,M));if(h<.6&&h<x){let M=Mt(X(l,t.pen.C));s[u]=1-oe(1.2,4.6,M)}let H=o[3*u],g=o[3*u+1],w=o[3*u+2],E=0,y=1;for(let M=1;M<=4;M++){let b=.35*M,A=n(l[0]+H*b,l[1]+g*b,l[2]+w*b);E+=y*Math.max(0,b-A),y*=.55}c[u]=Math.max(0,1-E*.9)}return{nail:r,ao:c,fing:s}}function re(t,e,o,n){let a=Math.round((o-e)/n)+1,r=new Float32Array(a).fill(1e9),c=new Float32Array(a).fill(-1e9);for(let s=0;s<t.length;s+=3){let f=Math.round((t[s]-e)/n);f<0||f>=a||(r[f]=Math.min(r[f],t[s+1]),c[f]=Math.max(c[f],t[s+1]))}return{x0:e,step:n,lo:r,hi:c,at(s){let f=Math.min(a-1.001,Math.max(0,(s-e)/n)),v=Math.floor(f),m=f-v;return[r[v]*(1-m)+r[v+1]*m,c[v]*(1-m)+c[v+1]*m]}}}function ln(t){let e=t>>>0||1;return()=>(e=e*1664525+1013904223>>>0)/4294967296}function fn(t){let e=0;for(let o=1;o<t.length;o++)e+=Math.hypot(t[o][0]-t[o-1][0],t[o][1]-t[o-1][1]);return e}function W(t,e,o,n){let a=[];for(let m=0;m<=64;m++)a.push(t(m/64));let r=fn(a),c=Math.max(2,Math.ceil(r/e)),s=n()*6.28,f=n()*6.28,v=[];for(let m=0;m<=c;m++){let d=m/c,u=t(d),l=t(Math.min(1,d+.001)),p=t(Math.max(0,d-.001)),h=l[0]-p[0],x=l[1]-p[1],H=Math.hypot(h,x)||1;h/=H,x/=H;let g=o*(Math.sin(d*5.1+s)*.6+Math.sin(d*13.7+f)*.4);v.push([u[0]-x*g,u[1]+h*g])}return v}var K=(t,e,o)=>t+(e-t)*o,Y=(t,e)=>o=>[K(t[0],e[0],o),K(t[1],e[1],o)],Vt=(t,e,o,n,a=-Math.PI/2,r=Math.PI/2)=>c=>{let s=K(a,r,c);return[t[0]+n*e*Math.cos(s),t[1]+o*Math.sin(s)]};function ie(t){let e=ln(11),o=[],n=(l,p={})=>o.push({pts:l,w:(p.w??.05)*1.45,dark:Math.min(1,(p.dark??.85)*1.15),speed:p.speed??12,kind:p.kind??"line"}),a=-4.1,r=-5.4,c=-7.5,s=l=>t.at(l),f=Math.max(-s(r)[0],s(r)[1])+.55,v=.5;n(W(Y([a,s(a)[1]],[r+.15,s(r)[1]]),.12,.02,e),{w:.055}),n(W(Y([a,s(a)[0]],[r+.15,s(r)[0]]),.12,.02,e),{w:.055}),n(W(Vt([r,0],v,f,1,-Math.PI/2,Math.PI/2),.12,.02,e),{w:.055});let m=s(r),d=Math.asin(Math.max(-1,m[0]/f)),u=Math.asin(Math.min(1,m[1]/f));n(W(l=>{let p=K(Math.PI*.5,Math.PI-u,l);return[r+v*Math.cos(p),f*Math.sin(p)]},.1,.01,e),{w:.045,dark:.75}),n(W(l=>{let p=K(-Math.PI*.5,-Math.PI-d,l);return[r+v*Math.cos(p),f*Math.sin(p)]},.1,.01,e),{w:.045,dark:.75}),n(W(Y([r,f],[c,f+.12]),.14,.025,e),{w:.055}),n(W(Y([r,-f],[c,-f-.12]),.14,.025,e),{w:.055}),n(W(Vt([c,0],v*.9,f+.12,1),.14,.02,e),{w:.05}),n(W(Vt([r-.42,0],v*.9,f-.12,1,-Math.PI*.46,Math.PI*.46),.12,.01,e),{w:.03,dark:.55});for(let[l,p]of[[-6.55,f-.75],[-7.45,f-.72]])n(W(h=>[l+.21*Math.cos(h*6.6),p+.21*Math.sin(h*6.6)],.06,.004,e),{w:.038,speed:7});n(W(Y([c-.05,f+.14],[c-1,f+.3]),.14,.02,e),{w:.045,dark:.6}),n(W(Y([c-.05,-f-.14],[c-1,-f-.32]),.14,.02,e),{w:.045,dark:.6}),n(W(l=>[c-.35-.2*l,K(-1.4,.6,l)+.15*Math.sin(l*3)],.12,.02,e),{w:.035,dark:.5});for(let l of[1,-1]){let p=l>0?m[1]:m[0],h=l*f;for(let x=0;x<6;x++){let H=(x+.5)/6,g=K(p,h,H),w=r+v*Math.sqrt(Math.max(0,1-(g/f)**2));n(W(Y([w-.05,g],[r-.32,g+l*.12]),.08,.004,e),{w:.032,dark:.8,speed:26,kind:"hatch"})}}for(let l=0;l<9;l++){let p=K(a-.25,r+.35,l/8),h=s(p)[0]+.06;n(W(Y([p+.22,h],[p-.12,h+.95-.35*(l%2)]),.08,.004,e),{w:.03,dark:.7,speed:26,kind:"hatch"})}for(let l=0;l<6;l++){let p=-f+.16+l*.2,h=r-.55-.05*l,x=c+.2+.35*l;n(W(Y([h,p],[x,p-.05]),.12,.006,e),{w:.03,dark:.65,speed:28,kind:"hatch"})}for(let l=0;l<5;l++){let p=c+.45+l*.36;n(W(Y([p,-f+.08],[p+.32,-f+.9-.1*l]),.08,.004,e),{w:.028,dark:.6,speed:26,kind:"hatch"})}for(let l=0;l<5;l++){let p=f-.12-l*.17;n(W(Y([r-.5,p],[r-1.4+.12*l,p+.03]),.1,.004,e),{w:.026,dark:.55,speed:28,kind:"hatch"})}return{strokes:o,XW:a,XC:r,XB:c,rimY:f}}function ce(t,e={}){let o=e.travel??34,n=[],a=e.start??.4,r=null;for(let c=0;c<t.length;c++){let s=t[c],f=s.pts[0];if(r){let l=.12+Math.hypot(f[0]-r[0],f[1]-r[1])/o;n.push({type:"move",from:r,to:f,t0:a,t1:a+l}),a+=l}let v=[0];for(let u=1;u<s.pts.length;u++)v.push(v[u-1]+Math.hypot(s.pts[u][0]-s.pts[u-1][0],s.pts[u][1]-s.pts[u-1][1]));let m=v[v.length-1],d=m/s.speed+.04;s.cum=v,s.len=m,s.t0=a,s.t1=a+d,n.push({type:"draw",stroke:s,t0:a,t1:a+d}),a+=d,r=s.pts[s.pts.length-1]}return{events:n,end:a,first:t[0].pts[0],last:r}}var hn=t=>t*t*(3-2*t);function le(t,e){let o=t.events;if(e<=o[0].t0)return{p:t.first,lift:.5,drawing:!1};for(let n of o){if(e>n.t1)continue;let a=(e-n.t0)/(n.t1-n.t0);if(n.type==="move"){let u=hn(a);return{p:[K(n.from[0],n.to[0],u),K(n.from[1],n.to[1],u)],lift:.5*Math.sin(Math.PI*a)**.6,drawing:!1}}let r=n.stroke,c=Math.min(1,a*1.04)*r.len,s=1;for(;s<r.cum.length-1&&r.cum[s]<c;)s++;let f=r.pts[s-1],v=r.pts[s],m=r.cum[s]-r.cum[s-1]||1,d=Math.min(1,Math.max(0,(c-r.cum[s-1])/m));return{p:[K(f[0],v[0],d),K(f[1],v[1],d)],lift:0,drawing:!0}}return{p:t.last,lift:0,drawing:!1}}function fe(t){let e=[],o=[],n=[],a=[],r=[],c=[];for(let s of t){let f=e.length/3,v=s.pts.length;for(let m=0;m<v;m++){let d=s.pts[m],u=s.pts[Math.min(v-1,m+1)],l=s.pts[Math.max(0,m-1)],p=u[0]-l[0],h=u[1]-l[1],x=Math.hypot(p,h)||1;p/=x,h/=x;let H=s.cum[m]/(s.len||1),g=Math.min(1,H*6+.25)*Math.min(1,(1-H)*4+.15),w=s.w*(.55+.45*g)*.5+.012,E=s.t0+(s.t1-s.t0-.04)*H/1.04;for(let y of[-1,1])e.push(d[0]-h*w*y,d[1]+p*w*y,.004),o.push(y),n.push(E),a.push(s.cum[m]),r.push(s.dark*(.6+.4*g));if(m<v-1){let y=f+2*m;c.push(y,y+1,y+3,y,y+3,y+2)}}}return{pos:e,side:o,time:n,arcl:a,weight:r,index:c}}var Wt=`
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
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
// paper: warm, with fibres and a fine tooth (screen-space grain on top)
vec3 paperColour(vec2 wxy, vec3 paper) {
  float f = fbm(wxy * vec2(0.9, 2.2)) - 0.5;
  float fib = vnoise(wxy * vec2(9.0, 1.4)) - 0.5;
  return paper * (1.0 + f * 0.035 + fib * 0.02);
}
float grain() {
  return (vnoise(gl_FragCoord.xy * 0.6) - 0.5) * 0.05 + (hash12(gl_FragCoord.xy) - 0.5) * 0.04;
}
`,_t=`
attribute float aFing;  // how much a vertex follows the pencil (1 for the pencil)
uniform vec3 uPenW;     // the pencil turns about where it rests in the hand
uniform mat3 uPenR;     // ... by this rotation
uniform vec3 uPenS;     // ... and slides along itself by this
uniform vec4 uMotion;   // hand: turn (rad), slide (cm), lift (cm), unused
uniform vec2 uPivot;    // pivot of the turn, hand frame
uniform vec2 uFlat;     // the arm rises out of the paper between these x
uniform mat4 uPlace;    // hand frame -> world
vec3 nRound; // the normal before pressing flat: the arm still shades as round
vec3 handMotion(vec3 p, inout vec3 n, out float f) {
  // fingers move the pencil
  vec3 pf = uPenW + uPenR * (p - uPenW) + uPenS;
  p = mix(p, pf, aFing);
  n = normalize(mix(n, uPenR * n, aFing));
  // the hand slides and turns
  vec3 q = p + vec3(uMotion.y, 0.0, 0.0);
  vec2 r = q.xy - uPivot;
  float cs = cos(uMotion.x), sn = sin(uMotion.x);
  q.xy = uPivot + vec2(cs * r.x - sn * r.y, sn * r.x + cs * r.y);
  n.xy = vec2(cs * n.x - sn * n.y, sn * n.x + cs * n.y);
  q.z += uMotion.z * smoothstep(uFlat.x, uFlat.y + 2.0, q.x);
  nRound = n;
  // press flat: z -> z\xB7f(x); the normal follows the inverse transpose
  float w = uFlat.y - uFlat.x;
  float t = clamp((q.x - uFlat.x) / w, 0.0, 1.0);
  f = t * t * (3.0 - 2.0 * t);
  float df = 6.0 * t * (1.0 - t) / w;
  float z = max(q.z, 0.0);
  n = vec3(f * n.x - z * df * n.z, f * n.y, n.z);
  q.z = z * f;
  return q;
}
`,he=`
attribute float aAO;
attribute float aNail;
attribute float aMat;
varying vec3 vN;
varying vec3 vRest;
varying vec3 vW;
varying float vF;
varying float vAO;
varying float vNail;
varying float vMat;
${_t}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vN = normalize(mat3(uPlace) * nRound);
  vRest = position;
  vW = wp.xyz;
  vF = f;
  vAO = aAO;
  vNail = aNail;
  vMat = aMat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ue=`
uniform vec3 uLight;
uniform vec3 uView;
uniform float uLitho;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec3 vN;
varying vec3 vRest;
varying vec3 vW;
varying float vF;
varying float vAO;
varying float vNail;
varying float vMat;
${Wt}

// hatching lines along coordinate s (in line spacings); w = half-width fraction.
// Families that are badly resolved on screen fade out.
float hfam(float s, float w, out float ok) {
  float fw = fwidth(s);
  ok = smoothstep(0.05, 0.12, fw) * (1.0 - smoothstep(0.5, 0.8, fw));
  float d = abs(fract(s) - 0.5);
  float aa = fw * 0.75 + 1e-4;
  float line = 1.0 - smoothstep(0.5 - w - aa, 0.5 - w + aa, d);
  return mix(2.0 * w, line, smoothstep(0.55, 0.3, fw));
}

void main() {
  // Where the arm sinks into the paper the solid breaks up into lines that
  // go round its form, like a sketch, and the lines thin out to nothing.
  float solidity = smoothstep(0.07, 0.4, vF);
  float sc = dot(vRest, normalize(vec3(0.95, 0.2, 0.3))) / 0.2;
  float band = abs(fract(sc) - 0.5) * 2.0;
  float keep = mix(0.14 * smoothstep(0.02, 0.08, vF), 1.05, solidity * solidity);
  if (vMat < 0.5 && band > keep) discard;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLight);
  float wrap = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
  float diff = clamp(ndl, 0.0, 1.0);
  float ao = mix(1.0, vAO, 0.75);
  vec3 h = normalize(uLight + uView);
  float rim = pow(1.0 - clamp(dot(n, uView), 0.0, 1.0), 3.0);

  vec3 alb;
  float gloss = 0.0;
  if (vMat < 0.5) { alb = vec3(0.91, 0.76, 0.64); gloss = 0.14; }
  else if (vMat < 1.5) { alb = vec3(0.84, 0.64, 0.27); gloss = 0.55; }
  else if (vMat < 2.5) { alb = vec3(0.88, 0.75, 0.56); }
  else { alb = vec3(0.2, 0.2, 0.22); gloss = 0.4; }
  float fn = max(fwidth(vNail), 1e-3);
  float nail = (1.0 - smoothstep(-fn, fn, vNail)) * step(vMat, 0.5);
  alb = mix(alb, vec3(0.96, 0.84, 0.79), nail * 0.85);
  gloss = mix(gloss, 0.6, nail);
  float nailEdge = (1.0 - smoothstep(0.0, fn * 1.5, abs(vNail + 0.01))) * step(vMat, 0.5);

  float light = (0.12 + 0.88 * mix(wrap * wrap, diff, 0.7)) * ao + 0.05 * rim;
  float spec = pow(max(dot(n, h), 0.0), 26.0) * gloss;
  vec3 colour = alb * (0.22 + 0.86 * light) + spec * vec3(1.0, 0.97, 0.9);
  colour *= 1.0 - 0.45 * nailEdge;

  // ---- lithograph: crayon tone that keeps the paper as its highlight,
  // with hatching that goes round the form in the shadows
  float t = clamp(light * lum(alb) / 0.79 + spec * 0.7, 0.0, 1.0);
  float tv = smoothstep(0.1, 0.78, t);
  float dk = 1.0 - t;
  vec3 hp = vRest;
  float ok1, ok2, ok3;
  float s1 = dot(hp, normalize(vec3(0.95, 0.2, 0.3))) / 0.11;
  float s2 = dot(hp, normalize(vec3(-0.3, 0.9, 0.35))) / 0.12;
  float s3 = (gl_FragCoord.x * 0.6 - gl_FragCoord.y * 0.8) / 3.6;
  float w1 = clamp(dk * 0.62 - 0.2, 0.0, 0.4);
  float w2 = clamp(dk * 0.66 - 0.38, 0.0, 0.4);
  float w3 = clamp(dk * 0.7 - 0.52, 0.0, 0.4);
  float h1 = hfam(s1, w1, ok1);
  float h2 = hfam(s2, w2, ok2);
  float h3 = hfam(s3, w3, ok3);
  float hh = 1.0 - (1.0 - h1 * ok1 - (1.0 - ok1) * 2.0 * w1) * (1.0 - h2 * ok2 - (1.0 - ok2) * 2.0 * w2) * (1.0 - h3);
  float g = grain();
  float v = mix(1.0, tv, 0.86) * (1.0 - 0.42 * hh) + g * 1.3;
  v *= 1.0 - 0.6 * nailEdge;
  vec3 litho = mix(uInk, uPaper, clamp(v, 0.0, 1.0));
  vec3 col = mix(colour + g * 0.6, litho, uLitho);
  // the thinnest sketch lines are graphite; as they widen they take on the form's own tone
  vec3 graphite = mix(vec3(0.4, 0.39, 0.39), uInk * 3.4, uLitho);
  col = mix(graphite, col, smoothstep(0.12, 0.5, solidity) * step(vMat, 0.5) + step(0.5, vMat));
  gl_FragColor = vec4(col, 1.0);
}
`,de=`
uniform float uWidth;   // px
uniform vec2 uRes;      // px
varying float vF;
${_t}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vec3 wn = normalize(mat3(uPlace) * n);
  vec4 c = projectionMatrix * viewMatrix * wp;
  vec4 cn = projectionMatrix * viewMatrix * vec4(wp.xyz + wn, 1.0);
  vec2 dir = cn.xy / cn.w - c.xy / c.w;
  float l = length(dir);
  dir = l > 1e-6 ? dir / l : vec2(0.0);
  float wpx = uWidth * (0.45 + 0.55 * smoothstep(0.3, 0.85, f)) * smoothstep(0.08, 0.3, f);
  c.xy += dir * wpx * 2.0 / uRes * c.w;
  vF = f;
  gl_Position = c;
}
`,pe=`
uniform vec3 uInkC;
varying float vF;
void main() {
  if (vF < 0.08) discard;
  gl_FragColor = vec4(uInkC, 1.0);
}
`,me=`
uniform vec3 uLight;
uniform float uMode;    // 0: shCast along the light, 1: straight down
varying float vH;
varying float vF;
${_t}
void main() {
  vec3 n = normal;
  float f;
  vec3 q = handMotion(position, n, f);
  vec4 wp = uPlace * vec4(q, 1.0);
  vH = wp.z;
  vF = f;
  vec3 p = wp.xyz;
  p.xy -= uMode < 0.5 ? uLight.xy * (p.z / uLight.z) : vec2(0.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(p.xy, 0.0, 1.0);
}
`,ve=`
uniform float uMode;
varying float vH;
varying float vF;
void main() {
  if (vF < 0.5) discard;
  float shCast = (0.8 - 0.5 * smoothstep(0.0, 9.0, vH)) * smoothstep(0.5, 0.9, vF);
  float contact = (1.0 - smoothstep(0.0, 1.1, vH)) * smoothstep(0.5, 0.9, vF);
  gl_FragColor = uMode < 0.5 ? vec4(shCast, 0.0, 0.0, 1.0) : vec4(0.0, contact, 0.0, 1.0);
}
`,we=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ge=`
uniform sampler2D uShadow;
uniform vec4 uShadowRect;   // x0, y0, width, height (world)
uniform vec2 uShadowTexel;
uniform vec3 uPaper;
uniform vec2 uSheet;        // half size of the sheet
varying vec3 vW;
${Wt}
void main() {
  vec2 uv = (vW.xy - uShadowRect.xy) / uShadowRect.zw;
  // soft shCast shadow: a ring of taps, wider than the contact shade
  float shCast = 0.0, contact = 0.0;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 2.39996;
    float r = sqrt((float(i) + 0.5) / 12.0);
    vec2 o = vec2(cos(a), sin(a)) * r;
    shCast += texture2D(uShadow, uv + o * uShadowTexel * 9.0).r;
    contact += texture2D(uShadow, uv + o * uShadowTexel * 3.0).g;
  }
  shCast /= 12.0; contact /= 12.0;
  vec3 c = paperColour(vW.xy, uPaper);
  c *= 1.0 - 0.42 * shCast - 0.3 * contact;
  // the sheet's edge, seen when the camera turns away
  vec2 e = abs(vW.xy) - uSheet;
  float inside = 1.0 - smoothstep(-0.02, 0.02, max(e.x, e.y));
  vec3 desk = vec3(0.36, 0.31, 0.26) * (0.9 + 0.1 * vnoise(vW.xy * 0.4));
  c = mix(desk, c, inside);
  gl_FragColor = vec4(c + grain(), 1.0);
}
`,xe=`
attribute float aSide;
attribute float aTime;
attribute float aArc;
attribute float aWeight;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
void main() {
  vSide = aSide; vTime = aTime; vArc = aArc; vWeight = aWeight;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWxy = wp.xy;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Me=`
uniform float uNow;
uniform float uFade;
uniform vec3 uGraphite;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
${Wt}
void main() {
  float shown = smoothstep(vTime - 0.02, vTime + 0.02, uNow);
  if (shown <= 0.0) discard;
  float fs = fwidth(vSide);
  float edge = 1.0 - smoothstep(1.0 - fs * 1.5, 1.0 + fs * 0.5, abs(vSide));
  // graphite catches on the paper's tooth
  float tooth = vnoise(vWxy * 22.0) * 0.6 + vnoise(vWxy * 61.0) * 0.4;
  float a = edge * vWeight * (0.72 + 0.4 * tooth) * shown * uFade;
  a *= 0.85 + 0.15 * sin(vArc * 7.0);
  gl_FragColor = vec4(uGraphite, clamp(a, 0.0, 1.0));
}
`;function ye(t,e){let o=document.getElementById("frame"),n=()=>{let r=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),s=document.getElementById("controls"),f=(c?c.offsetHeight:0)+6+13,v=(s?s.offsetHeight:0)+8+13,m=window.innerWidth-r*2,d=window.innerHeight-f-v,u=d,l=u*t;l>m&&(l=m,u=l/t),l=Math.max(160,Math.floor(l)),u=Math.max(120,Math.floor(u)),o.style.width=`${l}px`,o.style.height=`${u}px`,o.style.top=`${f+Math.max(0,(d-u)/2)}px`,e?.(l,u)};return window.addEventListener("resize",n),n(),n}function Ee(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let n=a=>{a?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(a))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function be(t,e,o){let n=a=>{for(let[r,c]of t)r.setAttribute("aria-pressed",String(c===a));e(a)};for(let[a,r]of t)a.addEventListener("click",()=>n(r));return o!==void 0&&n(o),n}function Re(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function He(t,e=!0){let o=document.getElementById("btn-play"),n=a=>{e=a,o&&(o.setAttribute("aria-pressed",String(!a)),o.querySelector("span").textContent=a?"Pause":"Play",o.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),t(a)};return o?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function Te(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function ke(){document.body.classList.add("ready")}var ft=ee(),nt=ne(ft.sdf,[-13,-4.6,-6.6],[14,7,3.6],.15),bt=ae(ft,nt.positions);function dn(){let t=new i.BufferGeometry;t.setAttribute("position",new i.BufferAttribute(nt.positions,3)),t.setIndex(new i.BufferAttribute(nt.index,1)),t.computeVertexNormals();let e=t.attributes.normal.array,o=se(ft,nt.positions,e,ft.sdf),n=nt.positions.length/3,a=new Float32Array(n*3),r=new Float32Array(n*3);for(let s=0;s<n;s++){let f=bt.apply([nt.positions[3*s],nt.positions[3*s+1],nt.positions[3*s+2]]),v=bt.rot([e[3*s],e[3*s+1],e[3*s+2]]);a.set(f,3*s),r.set(v,3*s)}let c=new i.BufferGeometry;return c.setAttribute("position",new i.BufferAttribute(a,3)),c.setAttribute("normal",new i.BufferAttribute(r,3)),c.setAttribute("aAO",new i.BufferAttribute(o.ao,1)),c.setAttribute("aNail",new i.BufferAttribute(o.nail,1)),c.setAttribute("aMat",new i.BufferAttribute(new Float32Array(n),1)),c.setAttribute("aFing",new i.BufferAttribute(o.fing,1)),c.setIndex(new i.BufferAttribute(nt.index,1)),c}function pn(t,e){let a=O.r*Math.cos(Math.PI/6),r=w=>a/Math.cos((w%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6),c=w=>w<O.tipLen?.012+(.09-.012)*(w/O.tipLen):.09+(O.r-.09)*Math.min(1,(w-O.tipLen)/O.coneLen),s=new i.Vector3(...e).normalize(),f=new i.Vector3(0,0,1).cross(s).normalize(),v=new i.Vector3().crossVectors(s,f).normalize(),m=[0,.05,.12,.2,.28,O.tipLen,.45,.6,.8,1,1.2,1.4,1.6,1.8,1.95,2.1,2.25,2.4,2.6,3.2,5,7,9,11,13],d=[],u=[],l=[],p=[];for(let w of m)for(let E=0;E<=36;E++){let y=E/36*Math.PI*2,M=r(y),b=c(w),A=Math.min(M,b),C=new i.Vector3(...t).addScaledVector(s,w).addScaledVector(f,Math.cos(y)*A).addScaledVector(v,Math.sin(y)*A),V;if(b<M-1e-4){let S=w<O.tipLen?.078/O.tipLen:(O.r-.09)/O.coneLen;V=new i.Vector3().addScaledVector(f,Math.cos(y)).addScaledVector(v,Math.sin(y)).addScaledVector(s,-S).normalize()}else{let S=Math.floor((y+Math.PI/6)/(Math.PI/3))*(Math.PI/3);V=new i.Vector3().addScaledVector(f,Math.cos(S)).addScaledVector(v,Math.sin(S))}d.push(C.x,C.y,C.z),u.push(V.x,V.y,V.z),l.push(w<O.tipLen+.02?3:b<M-.01?2:1)}let h=37;for(let w=0;w<m.length-1;w++)for(let E=0;E<36;E++){let y=w*h+E,M=y+1,b=y+h,A=b+1;p.push(y,M,b,M,A,b)}let x=d.length/3,H=new i.Vector3(...t).addScaledVector(s,13);d.push(H.x,H.y,H.z),u.push(s.x,s.y,s.z),l.push(2);for(let w=0;w<36;w++){let E=(m.length-1)*h+w;p.push(x,E,E+1)}let g=new i.BufferGeometry;return g.setAttribute("position",new i.Float32BufferAttribute(d,3)),g.setAttribute("normal",new i.Float32BufferAttribute(u,3)),g.setAttribute("aMat",new i.Float32BufferAttribute(l,1)),g.setAttribute("aAO",new i.Float32BufferAttribute(new Array(d.length/3).fill(1),1)),g.setAttribute("aNail",new i.Float32BufferAttribute(new Array(d.length/3).fill(9),1)),g.setAttribute("aFing",new i.Float32BufferAttribute(new Array(d.length/3).fill(1),1)),g.setIndex(p),g}var Pt=dn(),Z=bt.apply(ft.pen.tip),Bt=pn(Z,bt.rot(ft.pen.D).map(t=>-t)),ze=re(Pt.attributes.position.array,-11,0,.2),Lt=ie(ze),Se=(()=>{let t=0,e=0,o=0;for(let n of Lt.strokes)for(let a of n.pts)t+=a[0],e+=a[1],o++;return[t/o,e/o+1.3]})(),Nt=-Math.PI/2+.12,dt=new i.Matrix4;{let t=Math.cos(Nt),e=Math.sin(Nt),o=Z[0]+Se[0],n=Z[1]+Se[1],a=-(t*o-e*n)/2,r=-(e*o+t*n)/2;dt.makeRotationZ(Nt).setPosition(a,r,0)}var zt=new i.Matrix4().makeRotationZ(Math.PI).multiply(dt),mn=dt.clone().invert(),at=new i.Vector2(-2.6,0),vn=new i.Vector2(-5,-.3),j=ce(Lt.strokes),jt=1.6,Gt=1.4,Ie=.9,Ce=j.end+jt+Gt+Ie,wn=document.getElementById("scene"),G=new i.WebGLRenderer({canvas:wn,antialias:!0,powerPreference:"high-performance"});G.setPixelRatio(Math.min(window.devicePixelRatio||1,2));G.setClearColor(3814188,1);G.autoClear=!1;var gn=new i.Vector3(.93,.905,.845),xn=new i.Vector3(.11,.1,.09),Mn=new i.Vector3(-.45,.55,.72).normalize(),qt=new i.Vector3(...bt.apply(ft.pen.W)),yn=new i.Vector3(...Z),ct={uPenW:{value:qt},uPenR:{value:new i.Matrix3},uPenS:{value:new i.Vector3},uMotion:{value:new i.Vector4(0,0,0,0)},uPivot:{value:at},uFlat:{value:vn},uLight:{value:Mn},uView:{value:new i.Vector3(0,0,1)},uLitho:{value:1},uPaper:{value:gn},uInk:{value:xn}},Rt=new i.Scene,Ve=new i.Scene,We=new i.Vector2(1,1);function _e(t){let e={...ct,uPlace:{value:t}},o=new i.Mesh(Pt,new i.ShaderMaterial({uniforms:e,vertexShader:he,fragmentShader:ue,side:i.DoubleSide})),n=new i.Mesh(Bt,o.material),a=new i.ShaderMaterial({uniforms:{...e,uWidth:{value:1.6},uRes:{value:We},uInkC:{value:new i.Vector3(.12,.1,.09)}},vertexShader:de,fragmentShader:pe,side:i.BackSide}),r=new i.Mesh(Pt,a),c=new i.Mesh(Bt,a);for(let s of[o,n,r,c])s.frustumCulled=!1,Rt.add(s);for(let s of[0,1]){let f=new i.ShaderMaterial({uniforms:{...e,uMode:{value:s}},vertexShader:me,fragmentShader:ve,side:i.DoubleSide,depthTest:!1,depthWrite:!1,blending:i.CustomBlending,blendEquation:i.MaxEquation,blendSrc:i.OneFactor,blendDst:i.OneFactor});for(let v of[Pt,Bt]){let m=new i.Mesh(v,f);m.frustumCulled=!1,Ve.add(m)}}return{body:o,hull:r}}_e(dt);_e(zt);var En=new i.Vector2(15.4,19.6),lt=new i.Vector4(-16,-20,32,40),Be=new i.WebGLRenderTarget(640,800,{depthBuffer:!1,type:i.HalfFloatType}),Ut=new i.OrthographicCamera(lt.x,lt.x+lt.z,lt.y+lt.w,lt.y,-100,100);Ut.position.set(0,0,50);Ut.lookAt(0,0,0);var Ne=new i.Mesh(new i.PlaneGeometry(80,90),new i.ShaderMaterial({uniforms:{uShadow:{value:Be.texture},uShadowRect:{value:lt},uShadowTexel:{value:new i.Vector2(1/640,1/800)},uPaper:ct.uPaper,uSheet:{value:En}},vertexShader:we,fragmentShader:ge}));Ne.renderOrder=-10;Rt.add(Ne);var Ft={uNow:{value:0},uFade:{value:1},uGraphite:{value:new i.Vector3(.19,.19,.21)}};{let t=fe(Lt.strokes),e=new i.BufferGeometry;e.setAttribute("position",new i.Float32BufferAttribute(t.pos,3)),e.setAttribute("aSide",new i.Float32BufferAttribute(t.side,1)),e.setAttribute("aTime",new i.Float32BufferAttribute(t.time,1)),e.setAttribute("aArc",new i.Float32BufferAttribute(t.arcl,1)),e.setAttribute("aWeight",new i.Float32BufferAttribute(t.weight,1)),e.setIndex(t.index);let o=new i.ShaderMaterial({uniforms:Ft,vertexShader:xe,fragmentShader:Me,transparent:!0,depthWrite:!1,side:i.DoubleSide});for(let n of[dt,zt]){let a=new i.Mesh(e,o);a.matrixAutoUpdate=!1,a.matrix.copy(n),a.matrixWorldNeedsUpdate=!0,a.frustumCulled=!1,a.renderOrder=1,Rt.add(a)}}var ot=new i.OrthographicCamera(-1,1,1,-1,1,400),bn=14.6,qe={az:-Math.PI/2,el:Math.PI/2,zoom:1},Rn={az:-Math.PI/2+.75,el:.42,zoom:.92},it={...qe},Ot=30/38;function $t(){let t=Math.cos(it.el),e=Math.sin(it.el),o=new i.Vector3(t*Math.cos(it.az),t*Math.sin(it.az),e);ot.position.copy(o).multiplyScalar(150);let n=new i.Vector3(0,1,0).lerp(new i.Vector3(0,0,1),Math.min(1,t*1.5)).normalize();ot.up.copy(n),ot.lookAt(0,0,1.5*t);let a=bn/it.zoom;ot.left=-a*Ot,ot.right=a*Ot,ot.top=a,ot.bottom=-a,ot.updateProjectionMatrix(),ct.uView.value.copy(o)}ye(30/38,(t,e)=>{G.setSize(t,e),Ot=t/e,We.set(t*G.getPixelRatio(),e*G.getPixelRatio()),$t()});Ee();var z={t:0,playing:!0,litho:1,lithoTarget:1,revealed:!1,tween:null};be([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{z.lithoTarget=t},1);var Oe=He(t=>{z.playing=t}),Dt=document.getElementById("btn-reveal");function Kt(t){z.revealed=t,Dt.setAttribute("aria-pressed",String(t)),Dt.querySelector("span").textContent=t?"Back to the print":"Tilt the sheet",z.tween={from:{...it},to:t?{...Rn}:{...qe},k:0,dur:2},Te(t,"From the side: only the hands stand up; the cuffs are flat graphite")}Dt.addEventListener("click",()=>Kt(!z.revealed));Re({" ":()=>Oe(!z.playing),l:()=>document.getElementById(z.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>Kt(!z.revealed)});var yt=new i.Vector3;function Hn(t){if(t<j.end){let a=le(j,t),r=j.events[0].t0;return{p:a.p,lift:t<r?.6*(1-t/r):a.lift}}let e=Math.min(1,Math.max(0,(t-j.end-jt)/(Gt+Ie))),o=e*e*(3-2*e);return{p:[j.last[0]+(j.first[0]-j.last[0])*o,j.last[1]+(j.first[1]-j.last[1])*o],lift:.6*Math.min(1,(t-j.end)/.5)}}var Ae=1.7,D={turn:0,slide:0,vTurn:0,vSlide:0,init:!1},Pe=new i.Quaternion,At=new i.Vector3,Et=new i.Vector3,Fe=new i.Matrix4;function Tn(t,e){let o=t-at.x,n=e-at.y,a=Math.hypot(o,n),r=Z[0]-at.x,c=Z[1]-at.y,s=Math.sqrt(Math.max(1,a*a-c*c));return[Math.atan2(n,o)-Math.atan2(c,s),s-r]}function De(t,e){let{p:o,lift:n}=Hn(t);yt.set(o[0],o[1],0).applyMatrix4(zt).applyMatrix4(mn);let a=yt.x-Z[0],r=yt.y-Z[1],c=Math.hypot(a,r),s=c>Ae?(c-Ae)/c:0,[f,v]=Tn(Z[0]+a*s,Z[1]+r*s);if(!D.init||e<=0)D.turn=f,D.slide=v,D.init=!0;else for(let w of["turn","slide"]){let E=w==="turn"?f:v,y=w==="turn"?"vTurn":"vSlide",M=81*(E-D[w])-18*D[y];D[y]+=M*e,D[w]+=D[y]*e}ct.uMotion.value.set(D.turn,D.slide,n,0);let m=Math.cos(-D.turn),d=Math.sin(-D.turn),u=yt.x-at.x,l=yt.y-at.y,p=at.x+m*u-d*l-D.slide,h=at.y+d*u+m*l;At.copy(yn).sub(qt);let x=At.length();At.normalize(),Et.set(p,h,0).sub(qt);let H=Et.length();Et.normalize(),Pe.setFromUnitVectors(At,Et),Fe.makeRotationFromQuaternion(Pe),ct.uPenR.value.setFromMatrix4(Fe),ct.uPenS.value.copy(Et).multiplyScalar(H-x)}var kn=(t,e,o)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),o),Sn=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Le=performance.now();function je(t){let e=Math.min(.05,Math.max(0,(t-Le)/1e3));Le=t,z.playing&&(z.t=(z.t+e)%Ce);let o=z.t;if(De(o,z.playing?e:0),Ft.uNow.value=o,Ft.uFade.value=1-Math.min(1,Math.max(0,(o-j.end-jt)/Gt)),z.litho=kn(z.litho,z.lithoTarget,e*2.2),ct.uLitho.value=z.litho,z.tween){let n=z.tween;n.k=Math.min(1,n.k+e/n.dur);let a=Sn(n.k);for(let r of["az","el","zoom"])it[r]=n.from[r]+(n.to[r]-n.from[r])*a;n.k>=1&&(z.tween=null),$t()}G.setRenderTarget(Be),G.setClearColor(0,1),G.clear(),G.render(Ve,Ut),G.setRenderTarget(null),G.setClearColor(3814188,1),G.clear(),G.render(Rt,ot),requestAnimationFrame(je)}ke();requestAnimationFrame(je);window.__page={state:z,view:it,updateCamera:$t,setRevealed:Kt,setPlaying:Oe,shared:ct,tl:j,PERIOD:Ce,solveMotion:De,fp:ze,drawing:Lt,strokeU:Ft,scene:Rt,placeA:dt,placeB:zt};})();
