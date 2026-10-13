(()=>{var Xe=Object.create;var Xt=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var Ye=Object.getOwnPropertyNames;var Ze=Object.getPrototypeOf,Je=Object.prototype.hasOwnProperty;var tn=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(o){throw e=0,o}};var en=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of Ye(e))!Je.call(t,a)&&a!==o&&Xt(t,a,{get:()=>e[a],enumerable:!(n=Qe(e,a))||n.enumerable});return t};var nn=(t,e,o)=>(o=t!=null?Xe(Ze(t)):{},en(e||!t||!t.__esModule?Xt(o,"default",{value:t,enumerable:!0}):o,t));var Yt=tn((Pn,Qt)=>{Qt.exports=window.THREE});var c=nn(Yt(),1);var C=(t,e,o)=>[t,e,o],Q=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],X=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],N=(t,e)=>[t[0]*e,t[1]*e,t[2]*e],xt=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],Jt=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Mt=t=>Math.hypot(t[0],t[1],t[2]),$=t=>N(t,1/(Mt(t)||1)),kt=(t,e)=>$(X(t,N(e,xt(t,e)))),ht={roll:.36,pitch:.17,dev:.5,ext:-.42},te=C(7.2,3.4,1.2),St=C(10.3,3.85,-2.9),wt=$(X(St,te)),O={r:.37,tipLen:.35,coneLen:2.1,back:10.5},on=3.4,an=Q(St,N(wt,on));function Ht(t,e,o){let n=Math.max(o-Math.abs(t-e),0)/o;return Math.min(t,e)-n*n*o*.25}function sn(t,e,o,n){let a=X(e,t),r=xt(a,a),i=o-n,s=r-i*i,f=1/r;return{a:t,b:e,r1:o,r2:n,ba:a,l2:r,rr:i,a2:s,il2:f,k:Math.sign(i)*i*i}}function gt(t,e,o,n){let a=t-n.a[0],r=e-n.a[1],i=o-n.a[2],s=n.ba[0],f=n.ba[1],w=n.ba[2],m=a*s+r*f+i*w,d=m-n.l2,h=a*n.l2-s*m,l=r*n.l2-f*m,p=i*n.l2-w*m,u=h*h+l*l+p*p,M=m*m*n.l2,R=d*d*n.l2,x=n.k*u;return Math.sign(d)*n.a2*R>x?Math.sqrt(u+R)*n.il2-n.r2:Math.sign(m)*n.a2*M<x?Math.sqrt(u+M)*n.il2-n.r1:(Math.sqrt(u*n.a2*n.il2)+m*n.rr)*n.il2-n.r1}function Tt(t,e,o){return{c:t,r:e,m:o}}function rn(t,e,o,n){let a=t-n.c[0],r=e-n.c[1],i=o-n.c[2];if(n.m){let u=n.m,M=u[0]*a+u[1]*r+u[2]*i,R=u[3]*a+u[4]*r+u[5]*i,x=u[6]*a+u[7]*r+u[8]*i;a=M,r=R,i=x}let s=a/n.r[0],f=r/n.r[1],w=i/n.r[2],m=s/n.r[0],d=f/n.r[1],h=w/n.r[2],l=Math.sqrt(s*s+f*f+w*w),p=Math.sqrt(m*m+d*d+h*h);return p>1e-9?l*(l-1)/p:-Math.min(n.r[0],n.r[1],n.r[2])}function It(t,e,o,n){let a=[0,0,-1],r=[t],i=0,s=t;for(let f=0;f<o.length;f++){i+=n[f];let w=Q(N(e,Math.cos(i)),N(a,Math.sin(i)));s=Q(s,N(w,o[f])),r.push(s)}return r}function Zt(t,e,o,n,a=0){let r=X(o,t),i=$([r[0],r[1],0]),s=Math.hypot(r[0],r[1]),f=-r[2],w=(p,u)=>{let M=[p,p+u,p+u+n*u],R=0,x=0;for(let g=0;g<3;g++)R+=e[g]*Math.cos(M[g]),x+=e[g]*Math.sin(M[g]);return[R,x]},m=[0,0],d=1e9;for(let p=-.5;p<=1.7;p+=.02)for(let u=0;u<=2.1;u+=.02){let[M,R]=w(p,u),x=(M-s)**2+(R-f)**2+.002*u*u;x<d&&(d=x,m=[p,u])}let h=[m[0],m[1],n*m[1]],l=$(Q(i,[-i[1]*a,i[0]*a,0]));return{pts:It(t,i,e,h),d:l,err:Math.sqrt(d)}}function cn(t,e,o,n,a){let r=X(e,t),i=Math.min(Mt(r),o+n-.001),s=$(r),f=kt(a,s),w=(o*o+i*i-n*n)/(2*o*i),m=Math.acos(Math.max(-1,Math.min(1,w))),d=Q(t,Q(N(s,o*Math.cos(m)),N(f,o*Math.sin(m)))),h=Q(d,N($(X(Q(t,N(s,i)),d)),n));return[t,d,h]}function ee(){let t={palm:[],fingers:[],pads:[]},e=(x,g,E,y)=>sn(x,g,E,y),o={index:C(8.4,2.45,.3),middle:C(8.8,.72,.42),ring:C(8.4,-.95,.22),pinky:C(7.7,-2.45,-.12)},n={index:C(1.6,1.25,.45),middle:C(1.4,.3,.55),ring:C(1.5,-.62,.45),pinky:C(1.7,-1.5,.25)},a={index:.84,middle:.86,ring:.8,pinky:.72};for(let x of["index","middle","ring","pinky"])t.palm.push(e(n[x],o[x],.62,a[x]));t.pads.push(Tt(C(4.7,0,-.2),[3.7,3,.78])),t.pads.push(Tt(C(3.2,2.15,-.75),[2.4,1.35,1])),t.pads.push(Tt(C(4,-2.05,-.6),[2.9,.82,.85])),t.pads.push(Tt(C(8,0,-.55),[1.1,2.9,.6])),t.palm.push(e(C(-13.5,0,0),C(-2.5,0,0),1.82,1.74)),t.palm.push(e(C(-2.5,0,0),C(1,0,.1),1.74,1.45));let r=1.5,i=kt([0,0,1],wt),s=$(Jt(wt,i)),f=(x,g,E)=>Q(Q(St,N(wt,x)),N(Q(N(i,Math.cos(g)),N(s,Math.sin(g))),O.r+E)),w={index:[4,2.35,1.85],middle:[4.45,2.75,1.95],ring:[4.15,2.6,1.85],pinky:[3.3,2,1.65]},m={index:[.9,.82,.73,.6],middle:[.93,.85,.75,.62],ring:[.88,.8,.7,.58],pinky:[.78,.7,.62,.5]},d={};d.index=Zt(o.index,w.index,f(.25,-.25,.62),.55),d.middle=Zt(o.middle,w.middle,f(1.25,Math.PI*.82,.55),.7),d.ring={pts:It(o.ring,$([.97,-.1,0]),w.ring,[.9,1.9,.9])},d.pinky={pts:It(o.pinky,$([.96,-.22,0]),w.pinky,[.95,1.85,.85])};for(let x of["index","middle","ring","pinky"]){let g=d[x].pts,E=m[x],y=[];for(let v=0;v<3;v++)y.push(e(g[v],g[v+1],E[v],E[v+1]));t.fingers.push({name:x,segs:y,pts:g,rad:E})}let h=C(1.7,2.1,-.55),l=C(5.6,4.35,-1.15),p=f(-.05,Math.PI*.42,.6),u=cn(l,p,3,2.55,$([-.2,.55,.8])),M={name:"thumb",segs:[e(h,l,1.25,1.02),e(u[0],u[1],1.02,.9),e(u[1],u[2],.9,.7)],pts:[h,...u],rad:[1.25,1.02,.9,.7]};t.fingers.push(M);for(let x of t.fingers){let g=[1e9,1e9,1e9],E=[-1e9,-1e9,-1e9];for(let y of x.segs)for(let v of[y.a,y.b])for(let k=0;k<3;k++)g[k]=Math.min(g[k],v[k]-1.4),E[k]=Math.max(E[k],v[k]+1.4);x.lo=g,x.hi=E}function R(x,g,E){let y=1e9;for(let v=0;v<t.palm.length;v++){let k=t.palm[v],A=v>=4?gt(x,g/r,E,k)*1.2:gt(x,g,E,k);y=v===0?A:Ht(y,A,v>=4?1.8:.9)}for(let v of t.pads)y=Ht(y,rn(x,g,E,v),.9);for(let v of t.fingers){let k=Math.max(v.lo[0]-x,0,x-v.hi[0]),A=Math.max(v.lo[1]-g,0,g-v.hi[1]),B=Math.max(v.lo[2]-E,0,E-v.hi[2]);if(k*k+A*A+B*B>(y+1)*(y+1)&&y>0)continue;let I=gt(x,g,E,v.segs[0]);for(let S=1;S<v.segs.length;S++)I=Ht(I,gt(x,g,E,v.segs[S]),.22);y=Ht(y,I,v.name==="thumb"?.8:.3)}return y}return{sdf:R,prims:t,fingers:d,thumb:M,MCP:o,pen:{W:te,C:St,D:wt,tip:an},n1:i,n2:s,ik:{index:d.index.err,middle:d.middle.err}}}function ne(t,e,o,n){let a=Math.ceil((o[0]-e[0])/n)+1,r=Math.ceil((o[1]-e[1])/n)+1,i=Math.ceil((o[2]-e[2])/n)+1,s=n*4,f=Math.ceil((o[0]-e[0])/s)+2,w=Math.ceil((o[1]-e[1])/s)+2,m=Math.ceil((o[2]-e[2])/s)+2,d=new Float32Array(f*w*m);for(let b=0;b<m;b++)for(let H=0;H<w;H++)for(let T=0;T<f;T++)d[T+f*(H+w*b)]=t(e[0]+T*s,e[1]+H*s,e[2]+b*s);let h=s*.65,l=new Float32Array(a*r*i),p=f*w;for(let b=0;b<i;b++){let H=e[2]+b*n,T=b*n/s,W=Math.floor(T),F=T-W;for(let L=0;L<r;L++){let P=e[1]+L*n,_=L*n/s,pt=Math.floor(_),J=_-pt,q=f*pt+p*W,tt=q+f,mt=q+p,ut=tt+p,vt=a*(L+r*b);for(let st=0;st<a;st++,vt++){let et=st*n/s,U=Math.floor(et),rt=et-U,Ge=d[q+U]*(1-rt)+d[q+U+1]*rt,Ue=d[tt+U]*(1-rt)+d[tt+U+1]*rt,$e=d[mt+U]*(1-rt)+d[mt+U+1]*rt,Ke=d[ut+U]*(1-rt)+d[ut+U+1]*rt,Ct=(Ge*(1-J)+Ue*J)*(1-F)+($e*(1-J)+Ke*J)*F;l[vt]=Ct>h||Ct<-h?Ct:t(e[0]+st*n,P,H)}}}let u=a-1,M=r-1,R=i-1,x=new Int32Array(u*M*R).fill(-1),g=[],E=a*r,y=[0,1,a,a+1,E,E+1,E+a,E+a+1],v=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],k=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],A=new Float64Array(8);for(let b=0;b<R;b++)for(let H=0;H<M;H++){let T=a*(H+r*b);for(let W=0;W<u;W++){let F=T+W,L=0;for(let q=0;q<8;q++){let tt=l[F+y[q]];A[q]=tt,tt<0&&L++}if(L===0||L===8)continue;let P=0,_=0,pt=0,J=0;for(let q=0;q<12;q++){let tt=k[q][0],mt=k[q][1],ut=A[tt],vt=A[mt];if(ut<0==vt<0)continue;let st=ut/(ut-vt),et=v[tt],U=v[mt];P+=et[0]+(U[0]-et[0])*st,_+=et[1]+(U[1]-et[1])*st,pt+=et[2]+(U[2]-et[2])*st,J++}x[W+u*(H+M*b)]=g.length/3,g.push(e[0]+(W+P/J)*n,e[1]+(H+_/J)*n,e[2]+(b+pt/J)*n)}}let B=(b,H,T)=>l[b+a*(H+r*T)],I=[],S=(b,H,T)=>x[b+u*(H+M*T)];for(let b=1;b<i-1;b++)for(let H=1;H<r-1;H++)for(let T=1;T<a-1;T++){let W=B(T,H,b)<0;if(T<a-1&&W!==B(T+1,H,b)<0){let F=S(T,H-1,b-1),L=S(T,H,b-1),P=S(T,H,b),_=S(T,H-1,b);W?I.push(F,L,P,F,P,_):I.push(F,P,L,F,_,P)}if(H<r-1&&W!==B(T,H+1,b)<0){let F=S(T-1,H,b-1),L=S(T,H,b-1),P=S(T,H,b),_=S(T-1,H,b);W?I.push(F,P,L,F,_,P):I.push(F,L,P,F,P,_)}if(b<i-1&&W!==B(T,H,b+1)<0){let F=S(T-1,H-1,b),L=S(T,H-1,b),P=S(T,H,b),_=S(T-1,H,b);W?I.push(F,L,P,F,P,_):I.push(F,P,L,F,_,P)}}return{positions:new Float32Array(g),index:new Uint32Array(I)}}var oe=(t,e,o)=>{let n=Math.min(1,Math.max(0,(o-t)/(e-t)));return n*n*(3-2*n)};function ae(t,e){let o=Math.cos(ht.roll),n=Math.sin(ht.roll),a=(d,h)=>{let l=Math.cos(h),p=Math.sin(h),u=d[1]*o-d[2]*n,M=d[1]*n+d[2]*o;return[d[0]*l+M*p,u,-d[0]*p+M*l]},r=(d,h)=>{let l=oe(-2.6,.9,h),p=ht.ext*(1-l),u=Math.cos(p),M=Math.sin(p),R=d[0]*u+d[2]*M,x=-d[0]*M+d[2]*u,g=d[1],E=ht.dev*l,y=Math.cos(E),v=Math.sin(E);return[R*y-g*v,R*v+g*y,x]},i=ht.pitch;if(e){let d=[];for(let u=0;u<e.length;u+=9)e[u]>1.5&&d.push([e[u],e[u+1],e[u+2]]);let h=u=>{let M=1e9;for(let R of d)M=Math.min(M,a(R,u)[2]);return M-a(t.pen.tip,u)[2]},l=-.3,p=.9;for(let u=0;u<30;u++){let M=(l+p)/2;h(M)>0?p=M:l=M}i=(l+p)/2}let f=-a(t.pen.tip,i)[2];return{rot:d=>{let h=a(d,i),l=ht.dev,p=Math.cos(l),u=Math.sin(l);return[h[0]*p-h[1]*u,h[0]*u+h[1]*p,h[2]]},pitch:i,lift:f,apply:d=>{let h=r(a(d,i),d[0]);return[h[0],h[1],h[2]+f]}}}function se(t,e,o,n){let a=e.length/3,r=new Float32Array(a).fill(9),i=new Float32Array(a).fill(1),s=new Float32Array(a),f=t.prims.fingers.filter(h=>["index","middle","thumb"].includes(h.name)),w=t.prims.fingers.filter(h=>!["index","middle","thumb"].includes(h.name)),m=(h,l)=>{let p=1e9;for(let u of l.segs)p=Math.min(p,gt(h[0],h[1],h[2],u));return p},d=[];for(let h of t.prims.fingers){let l=h.pts,p=h.rad,u=l[l.length-2],M=l[l.length-1],R=$(X(M,u)),x;h.name==="thumb"?x=kt($([-.15,.6,.8]),R):x=kt([0,0,1],R);let g=Jt(R,x),E=Mt(X(M,u));d.push({j3:u,u:R,dors:x,side:g,L:E,r:p[p.length-2],rt:p[p.length-1]})}for(let h=0;h<a;h++){let l=[e[3*h],e[3*h+1],e[3*h+2]],p=9;for(let v of d){let k=X(l,v.j3),A=xt(k,v.u);if(A<-.2||A>v.L+v.rt+.3)continue;let B=X(k,N(v.u,A)),I=Mt(B),S=v.r+(v.rt-v.r)*Math.min(1,Math.max(0,A/v.L));if(Math.abs(I-S)>.35)continue;let b=Math.atan2(xt(B,v.side),xt(B,v.dors)),H=A-(.35*v.L+(v.L+.35*v.rt))/2,T=(v.L+.35*v.rt-.35*v.L)/2,W=b*S,F=.62*S,L=Math.abs(H)-T+.18,P=Math.abs(W)-F+.18,_=Math.min(Math.max(L,P),0)+Math.hypot(Math.max(L,0),Math.max(P,0))-.18;_<p&&(p=_)}r[h]=p;let u=1e9;for(let v of f)u=Math.min(u,m(l,v));let M=1e9;for(let v of w)M=Math.min(M,m(l,v));if(u<.6&&u<M){let v=Mt(X(l,t.pen.C));s[h]=1-oe(1.2,4.6,v)}let R=o[3*h],x=o[3*h+1],g=o[3*h+2],E=0,y=1;for(let v=1;v<=4;v++){let k=.35*v,A=n(l[0]+R*k,l[1]+x*k,l[2]+g*k);E+=y*Math.max(0,k-A),y*=.55}i[h]=Math.max(0,1-E*.9)}return{nail:r,ao:i,fing:s}}function re(t,e,o,n){let a=Math.round((o-e)/n)+1,r=new Float32Array(a).fill(1e9),i=new Float32Array(a).fill(-1e9);for(let s=0;s<t.length;s+=3){let f=Math.round((t[s]-e)/n);f<0||f>=a||(r[f]=Math.min(r[f],t[s+1]),i[f]=Math.max(i[f],t[s+1]))}return{x0:e,step:n,lo:r,hi:i,at(s){let f=Math.min(a-1.001,Math.max(0,(s-e)/n)),w=Math.floor(f),m=f-w;return[r[w]*(1-m)+r[w+1]*m,i[w]*(1-m)+i[w+1]*m]}}}function ln(t){let e=t>>>0||1;return()=>(e=e*1664525+1013904223>>>0)/4294967296}function fn(t){let e=0;for(let o=1;o<t.length;o++)e+=Math.hypot(t[o][0]-t[o-1][0],t[o][1]-t[o-1][1]);return e}function V(t,e,o,n){let a=[];for(let m=0;m<=64;m++)a.push(t(m/64));let r=fn(a),i=Math.max(2,Math.ceil(r/e)),s=n()*6.28,f=n()*6.28,w=[];for(let m=0;m<=i;m++){let d=m/i,h=t(d),l=t(Math.min(1,d+.001)),p=t(Math.max(0,d-.001)),u=l[0]-p[0],M=l[1]-p[1],R=Math.hypot(u,M)||1;u/=R,M/=R;let x=o*(Math.sin(d*5.1+s)*.6+Math.sin(d*13.7+f)*.4);w.push([h[0]-M*x,h[1]+u*x])}return w}var K=(t,e,o)=>t+(e-t)*o,Y=(t,e)=>o=>[K(t[0],e[0],o),K(t[1],e[1],o)],Vt=(t,e,o,n,a=-Math.PI/2,r=Math.PI/2)=>i=>{let s=K(a,r,i);return[t[0]+n*e*Math.cos(s),t[1]+o*Math.sin(s)]};function ie(t){let e=ln(11),o=[],n=(l,p={})=>o.push({pts:l,w:p.w??.05,dark:p.dark??.85,speed:p.speed??12,kind:p.kind??"line"}),a=-4.1,r=-5.4,i=-7.5,s=l=>t.at(l),f=Math.max(-s(r)[0],s(r)[1])+.55,w=.5;n(V(Y([a,s(a)[1]],[r+.15,s(r)[1]]),.12,.02,e),{w:.055}),n(V(Y([a,s(a)[0]],[r+.15,s(r)[0]]),.12,.02,e),{w:.055}),n(V(Vt([r,0],w,f,1,-Math.PI/2,Math.PI/2),.12,.02,e),{w:.055});let m=s(r),d=Math.asin(Math.max(-1,m[0]/f)),h=Math.asin(Math.min(1,m[1]/f));n(V(l=>{let p=K(Math.PI*.5,Math.PI-h,l);return[r+w*Math.cos(p),f*Math.sin(p)]},.1,.01,e),{w:.045,dark:.75}),n(V(l=>{let p=K(-Math.PI*.5,-Math.PI-d,l);return[r+w*Math.cos(p),f*Math.sin(p)]},.1,.01,e),{w:.045,dark:.75}),n(V(Y([r,f],[i,f+.12]),.14,.025,e),{w:.055}),n(V(Y([r,-f],[i,-f-.12]),.14,.025,e),{w:.055}),n(V(Vt([i,0],w*.9,f+.12,1),.14,.02,e),{w:.05}),n(V(Vt([r-.42,0],w*.9,f-.12,1,-Math.PI*.46,Math.PI*.46),.12,.01,e),{w:.03,dark:.55});for(let[l,p]of[[-6.55,f-.75],[-7.45,f-.72]])n(V(u=>[l+.21*Math.cos(u*6.6),p+.21*Math.sin(u*6.6)],.06,.004,e),{w:.038,speed:7});n(V(Y([i-.05,f+.14],[i-1,f+.3]),.14,.02,e),{w:.045,dark:.6}),n(V(Y([i-.05,-f-.14],[i-1,-f-.32]),.14,.02,e),{w:.045,dark:.6}),n(V(l=>[i-.35-.2*l,K(-1.4,.6,l)+.15*Math.sin(l*3)],.12,.02,e),{w:.035,dark:.5});for(let l of[1,-1]){let p=l>0?m[1]:m[0],u=l*f;for(let M=0;M<6;M++){let R=(M+.5)/6,x=K(p,u,R),g=r+w*Math.sqrt(Math.max(0,1-(x/f)**2));n(V(Y([g-.05,x],[r-.32,x+l*.12]),.08,.004,e),{w:.032,dark:.8,speed:26,kind:"hatch"})}}for(let l=0;l<9;l++){let p=K(a-.25,r+.35,l/8),u=s(p)[0]+.06;n(V(Y([p+.22,u],[p-.12,u+.95-.35*(l%2)]),.08,.004,e),{w:.03,dark:.7,speed:26,kind:"hatch"})}for(let l=0;l<6;l++){let p=-f+.16+l*.2,u=r-.55-.05*l,M=i+.2+.35*l;n(V(Y([u,p],[M,p-.05]),.12,.006,e),{w:.03,dark:.65,speed:28,kind:"hatch"})}for(let l=0;l<5;l++){let p=i+.45+l*.36;n(V(Y([p,-f+.08],[p+.32,-f+.9-.1*l]),.08,.004,e),{w:.028,dark:.6,speed:26,kind:"hatch"})}for(let l=0;l<5;l++){let p=f-.12-l*.17;n(V(Y([r-.5,p],[r-1.4+.12*l,p+.03]),.1,.004,e),{w:.026,dark:.55,speed:28,kind:"hatch"})}return{strokes:o,XW:a,XC:r,XB:i,rimY:f}}function ce(t,e={}){let o=e.travel??34,n=[],a=e.start??.4,r=null;for(let i=0;i<t.length;i++){let s=t[i],f=s.pts[0];if(r){let l=.12+Math.hypot(f[0]-r[0],f[1]-r[1])/o;n.push({type:"move",from:r,to:f,t0:a,t1:a+l}),a+=l}let w=[0];for(let h=1;h<s.pts.length;h++)w.push(w[h-1]+Math.hypot(s.pts[h][0]-s.pts[h-1][0],s.pts[h][1]-s.pts[h-1][1]));let m=w[w.length-1],d=m/s.speed+.04;s.cum=w,s.len=m,s.t0=a,s.t1=a+d,n.push({type:"draw",stroke:s,t0:a,t1:a+d}),a+=d,r=s.pts[s.pts.length-1]}return{events:n,end:a,first:t[0].pts[0],last:r}}var un=t=>t*t*(3-2*t);function le(t,e){let o=t.events;if(e<=o[0].t0)return{p:t.first,lift:.5,drawing:!1};for(let n of o){if(e>n.t1)continue;let a=(e-n.t0)/(n.t1-n.t0);if(n.type==="move"){let h=un(a);return{p:[K(n.from[0],n.to[0],h),K(n.from[1],n.to[1],h)],lift:.5*Math.sin(Math.PI*a)**.6,drawing:!1}}let r=n.stroke,i=Math.min(1,a*1.04)*r.len,s=1;for(;s<r.cum.length-1&&r.cum[s]<i;)s++;let f=r.pts[s-1],w=r.pts[s],m=r.cum[s]-r.cum[s-1]||1,d=Math.min(1,Math.max(0,(i-r.cum[s-1])/m));return{p:[K(f[0],w[0],d),K(f[1],w[1],d)],lift:0,drawing:!0}}return{p:t.last,lift:0,drawing:!1}}function fe(t){let e=[],o=[],n=[],a=[],r=[],i=[];for(let s of t){let f=e.length/3,w=s.pts.length;for(let m=0;m<w;m++){let d=s.pts[m],h=s.pts[Math.min(w-1,m+1)],l=s.pts[Math.max(0,m-1)],p=h[0]-l[0],u=h[1]-l[1],M=Math.hypot(p,u)||1;p/=M,u/=M;let R=s.cum[m]/(s.len||1),x=Math.min(1,R*6+.25)*Math.min(1,(1-R)*4+.15),g=s.w*(.55+.45*x)*.5+.012,E=s.t0+(s.t1-s.t0-.04)*R/1.04;for(let y of[-1,1])e.push(d[0]-u*g*y,d[1]+p*g*y,.004),o.push(y),n.push(E),a.push(s.cum[m]),r.push(s.dark*(.6+.4*x));if(m<w-1){let y=f+2*m;i.push(y,y+1,y+3,y,y+3,y+2)}}}return{pos:e,side:o,time:n,arcl:a,weight:r,index:i}}var Wt=`
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
`,ue=`
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
  vN = normalize(mat3(uPlace) * n);
  vRest = position;
  vW = wp.xyz;
  vF = f;
  vAO = aAO;
  vNail = aNail;
  vMat = aMat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,he=`
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
  if (vF < 0.035) discard;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLight);
  float diff = clamp(ndl * 0.8 + 0.22, 0.0, 1.0);
  float ao = mix(1.0, vAO, 0.8);
  vec3 h = normalize(uLight + uView);
  float rim = pow(1.0 - clamp(dot(n, uView), 0.0, 1.0), 3.0);

  vec3 alb;
  float gloss = 0.0;
  if (vMat < 0.5) { alb = vec3(0.90, 0.74, 0.62); gloss = 0.12; }
  else if (vMat < 1.5) { alb = vec3(0.20, 0.36, 0.30); gloss = 0.5; }
  else if (vMat < 2.5) { alb = vec3(0.86, 0.71, 0.52); }
  else { alb = vec3(0.18, 0.18, 0.2); gloss = 0.35; }
  // nails: lighter, a little pink, with a fine edge
  float fn = max(fwidth(vNail), 1e-3);
  float nail = (1.0 - smoothstep(-fn, fn, vNail)) * step(vMat, 0.5);
  alb = mix(alb, vec3(0.95, 0.8, 0.74), nail * 0.8);
  gloss = mix(gloss, 0.5, nail);
  float nailEdge = (1.0 - smoothstep(0.0, fn * 1.5, abs(vNail + 0.01))) * step(vMat, 0.5);

  float light = (0.2 + 0.8 * diff) * ao + 0.06 * rim;
  float spec = pow(max(dot(n, h), 0.0), 28.0) * gloss;
  vec3 colour = alb * light + spec * vec3(1.0, 0.97, 0.9);
  colour *= 1.0 - 0.5 * nailEdge;

  // ---- lithograph: graphite tone, with hatching that follows the form
  float t = clamp(lum(alb) / 0.78 * light + spec * 0.8, 0.0, 1.0);
  float dk = 1.0 - t;
  vec3 hp = vRest;
  float ok1, ok2, ok3;
  float s1 = dot(hp, normalize(vec3(0.95, 0.25, 0.35))) / 0.14;
  float s2 = dot(hp, normalize(vec3(-0.35, 0.9, 0.3))) / 0.15;
  float s3 = (gl_FragCoord.x * 0.6 - gl_FragCoord.y * 0.8) / 4.2;
  float w1 = clamp(dk * 0.55 - 0.05, 0.0, 0.42);
  float w2 = clamp(dk * 0.6 - 0.22, 0.0, 0.42);
  float w3 = clamp(dk * 0.7 - 0.42, 0.0, 0.42);
  float h1 = hfam(s1, w1, ok1);
  float h2 = hfam(s2, w2, ok2);
  float h3 = hfam(s3, w3, ok3);
  // where a form-following family is too sparse, the other takes over
  float hh = 1.0 - (1.0 - h1 * ok1 - (1.0 - ok1) * 2.0 * w1) * (1.0 - h2 * ok2 - (1.0 - ok2) * 2.0 * w2) * (1.0 - h3);
  float g = grain();
  float v = mix(1.0, t, 0.62) * (1.0 - 0.55 * hh) + g * 1.4;
  v *= 1.0 - 0.6 * nailEdge;
  vec3 litho = mix(uInk, uPaper, clamp(v, 0.0, 1.0));

  vec3 col = mix(colour + g * 0.6, litho, uLitho);
  // the arm fades into the paper where it is pressed flat
  float solid = smoothstep(0.035, 0.55, vF);
  vec3 paper = paperColour(vW.xy, uPaper) + g;
  gl_FragColor = vec4(mix(paper, col, solid), 1.0);
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
  float wpx = uWidth * smoothstep(0.12, 0.7, f);
  c.xy += dir * wpx * 2.0 / uRes * c.w;
  vF = f;
  gl_Position = c;
}
`,pe=`
uniform vec3 uInkC;
varying float vF;
void main() {
  if (vF < 0.12) discard;
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
  if (vF < 0.06) discard;
  float shCast = (0.85 - 0.55 * smoothstep(0.0, 9.0, vH)) * smoothstep(0.06, 0.4, vF);
  float contact = (1.0 - smoothstep(0.0, 1.1, vH)) * smoothstep(0.06, 0.6, vF);
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
  float tooth = vnoise(vWxy * 38.0) * 0.6 + vnoise(vWxy * 90.0) * 0.4;
  float a = edge * vWeight * (0.55 + 0.6 * tooth) * shown * uFade;
  a *= 0.85 + 0.15 * sin(vArc * 7.0);
  gl_FragColor = vec4(uGraphite, clamp(a, 0.0, 1.0));
}
`;function ye(t,e){let o=document.getElementById("frame"),n=()=>{let r=(window.innerWidth<640?10:28)+13,i=document.getElementById("masthead"),s=document.getElementById("controls"),f=(i?i.offsetHeight:0)+6+13,w=(s?s.offsetHeight:0)+8+13,m=window.innerWidth-r*2,d=window.innerHeight-f-w,h=d,l=h*t;l>m&&(l=m,h=l/t),l=Math.max(160,Math.floor(l)),h=Math.max(120,Math.floor(h)),o.style.width=`${l}px`,o.style.height=`${h}px`,o.style.top=`${f+Math.max(0,(d-h)/2)}px`,e?.(l,h)};return window.addEventListener("resize",n),n(),n}function Ee(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!t)return;let n=a=>{a?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(a))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),o?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&n(!1)})}function be(t,e,o){let n=a=>{for(let[r,i]of t)r.setAttribute("aria-pressed",String(i===a));e(a)};for(let[a,r]of t)a.addEventListener("click",()=>n(r));return o!==void 0&&n(o),n}function Re(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let o=t[e.key.length===1?e.key.toLowerCase():e.key];o&&(e.preventDefault(),o(e))})}function He(t,e=!0){let o=document.getElementById("btn-play"),n=a=>{e=a,o&&(o.setAttribute("aria-pressed",String(!a)),o.querySelector("span").textContent=a?"Pause":"Play",o.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),t(a)};return o?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function Te(t,e){let o=document.getElementById("badge");o&&e&&(o.textContent=e),document.body.classList.toggle("badge-on",!!t)}function ke(){document.body.classList.add("ready")}var ft=ee(),nt=ne(ft.sdf,[-13,-4.6,-6.6],[14,7,3.6],.15),bt=ae(ft,nt.positions);function dn(){let t=new c.BufferGeometry;t.setAttribute("position",new c.BufferAttribute(nt.positions,3)),t.setIndex(new c.BufferAttribute(nt.index,1)),t.computeVertexNormals();let e=t.attributes.normal.array,o=se(ft,nt.positions,e,ft.sdf),n=nt.positions.length/3,a=new Float32Array(n*3),r=new Float32Array(n*3);for(let s=0;s<n;s++){let f=bt.apply([nt.positions[3*s],nt.positions[3*s+1],nt.positions[3*s+2]]),w=bt.rot([e[3*s],e[3*s+1],e[3*s+2]]);a.set(f,3*s),r.set(w,3*s)}let i=new c.BufferGeometry;return i.setAttribute("position",new c.BufferAttribute(a,3)),i.setAttribute("normal",new c.BufferAttribute(r,3)),i.setAttribute("aAO",new c.BufferAttribute(o.ao,1)),i.setAttribute("aNail",new c.BufferAttribute(o.nail,1)),i.setAttribute("aMat",new c.BufferAttribute(new Float32Array(n),1)),i.setAttribute("aFing",new c.BufferAttribute(o.fing,1)),i.setIndex(new c.BufferAttribute(nt.index,1)),i}function pn(t,e){let a=O.r*Math.cos(Math.PI/6),r=g=>a/Math.cos((g%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6),i=g=>g<O.tipLen?.012+(.09-.012)*(g/O.tipLen):.09+(O.r-.09)*Math.min(1,(g-O.tipLen)/O.coneLen),s=new c.Vector3(...e).normalize(),f=new c.Vector3(0,0,1).cross(s).normalize(),w=new c.Vector3().crossVectors(s,f).normalize(),m=[0,.05,.12,.2,.28,O.tipLen,.45,.6,.8,1,1.2,1.4,1.6,1.8,1.95,2.1,2.25,2.4,2.6,3.2,5,7,9,11,13],d=[],h=[],l=[],p=[];for(let g of m)for(let E=0;E<=36;E++){let y=E/36*Math.PI*2,v=r(y),k=i(g),A=Math.min(v,k),B=new c.Vector3(...t).addScaledVector(s,g).addScaledVector(f,Math.cos(y)*A).addScaledVector(w,Math.sin(y)*A),I;if(k<v-1e-4){let S=g<O.tipLen?.078/O.tipLen:(O.r-.09)/O.coneLen;I=new c.Vector3().addScaledVector(f,Math.cos(y)).addScaledVector(w,Math.sin(y)).addScaledVector(s,-S).normalize()}else{let S=Math.floor((y+Math.PI/6)/(Math.PI/3))*(Math.PI/3);I=new c.Vector3().addScaledVector(f,Math.cos(S)).addScaledVector(w,Math.sin(S))}d.push(B.x,B.y,B.z),h.push(I.x,I.y,I.z),l.push(g<O.tipLen+.02?3:k<v-.01?2:1)}let u=37;for(let g=0;g<m.length-1;g++)for(let E=0;E<36;E++){let y=g*u+E,v=y+1,k=y+u,A=k+1;p.push(y,k,v,v,k,A)}let M=d.length/3,R=new c.Vector3(...t).addScaledVector(s,13);d.push(R.x,R.y,R.z),h.push(s.x,s.y,s.z),l.push(2);for(let g=0;g<36;g++){let E=(m.length-1)*u+g;p.push(M,E,E+1)}let x=new c.BufferGeometry;return x.setAttribute("position",new c.Float32BufferAttribute(d,3)),x.setAttribute("normal",new c.Float32BufferAttribute(h,3)),x.setAttribute("aMat",new c.Float32BufferAttribute(l,1)),x.setAttribute("aAO",new c.Float32BufferAttribute(new Array(d.length/3).fill(1),1)),x.setAttribute("aNail",new c.Float32BufferAttribute(new Array(d.length/3).fill(9),1)),x.setAttribute("aFing",new c.Float32BufferAttribute(new Array(d.length/3).fill(1),1)),x.setIndex(p),x}var Pt=dn(),Z=bt.apply(ft.pen.tip),Bt=pn(Z,bt.rot(ft.pen.D).map(t=>-t)),ze=re(Pt.attributes.position.array,-11,0,.2),Lt=ie(ze),Se=(()=>{let t=0,e=0,o=0;for(let n of Lt.strokes)for(let a of n.pts)t+=a[0],e+=a[1],o++;return[t/o,e/o+1.3]})(),Nt=-Math.PI/2+.42,dt=new c.Matrix4;{let t=Math.cos(Nt),e=Math.sin(Nt),o=Z[0]+Se[0],n=Z[1]+Se[1],a=-(t*o-e*n)/2,r=-(e*o+t*n)/2;dt.makeRotationZ(Nt).setPosition(a,r,0)}var zt=new c.Matrix4().makeRotationZ(Math.PI).multiply(dt),mn=dt.clone().invert(),at=new c.Vector2(-2.6,0),vn=new c.Vector2(-5,-.3),j=ce(Lt.strokes),jt=1.6,Gt=1.4,Ce=.9,Ie=j.end+jt+Gt+Ce,wn=document.getElementById("scene"),G=new c.WebGLRenderer({canvas:wn,antialias:!0,powerPreference:"high-performance"});G.setPixelRatio(Math.min(window.devicePixelRatio||1,2));G.setClearColor(3814188,1);G.autoClear=!1;var gn=new c.Vector3(.93,.905,.845),xn=new c.Vector3(.11,.1,.09),Mn=new c.Vector3(-.45,.55,.72).normalize(),qt=new c.Vector3(...bt.apply(ft.pen.W)),yn=new c.Vector3(...Z),ct={uPenW:{value:qt},uPenR:{value:new c.Matrix3},uPenS:{value:new c.Vector3},uMotion:{value:new c.Vector4(0,0,0,0)},uPivot:{value:at},uFlat:{value:vn},uLight:{value:Mn},uView:{value:new c.Vector3(0,0,1)},uLitho:{value:1},uPaper:{value:gn},uInk:{value:xn}},Rt=new c.Scene,Ve=new c.Scene,We=new c.Vector2(1,1);function _e(t){let e={...ct,uPlace:{value:t}},o=new c.Mesh(Pt,new c.ShaderMaterial({uniforms:e,vertexShader:ue,fragmentShader:he,side:c.DoubleSide})),n=new c.Mesh(Bt,o.material),a=new c.ShaderMaterial({uniforms:{...e,uWidth:{value:1.6},uRes:{value:We},uInkC:{value:new c.Vector3(.12,.1,.09)}},vertexShader:de,fragmentShader:pe,side:c.BackSide}),r=new c.Mesh(Pt,a),i=new c.Mesh(Bt,a);for(let s of[o,n,r,i])s.frustumCulled=!1,Rt.add(s);for(let s of[0,1]){let f=new c.ShaderMaterial({uniforms:{...e,uMode:{value:s}},vertexShader:me,fragmentShader:ve,side:c.DoubleSide,depthTest:!1,depthWrite:!1,blending:c.CustomBlending,blendEquation:c.MaxEquation,blendSrc:c.OneFactor,blendDst:c.OneFactor});for(let w of[Pt,Bt]){let m=new c.Mesh(w,f);m.frustumCulled=!1,Ve.add(m)}}return{body:o,hull:r}}_e(dt);_e(zt);var En=new c.Vector2(14.6,18.2),lt=new c.Vector4(-16,-20,32,40),Be=new c.WebGLRenderTarget(640,800,{depthBuffer:!1,type:c.HalfFloatType}),Ut=new c.OrthographicCamera(lt.x,lt.x+lt.z,lt.y+lt.w,lt.y,-100,100);Ut.position.set(0,0,50);Ut.lookAt(0,0,0);var Ne=new c.Mesh(new c.PlaneGeometry(80,90),new c.ShaderMaterial({uniforms:{uShadow:{value:Be.texture},uShadowRect:{value:lt},uShadowTexel:{value:new c.Vector2(1/640,1/800)},uPaper:ct.uPaper,uSheet:{value:En}},vertexShader:we,fragmentShader:ge}));Ne.renderOrder=-10;Rt.add(Ne);var Ft={uNow:{value:0},uFade:{value:1},uGraphite:{value:new c.Vector3(.19,.19,.21)}};{let t=fe(Lt.strokes),e=new c.BufferGeometry;e.setAttribute("position",new c.Float32BufferAttribute(t.pos,3)),e.setAttribute("aSide",new c.Float32BufferAttribute(t.side,1)),e.setAttribute("aTime",new c.Float32BufferAttribute(t.time,1)),e.setAttribute("aArc",new c.Float32BufferAttribute(t.arcl,1)),e.setAttribute("aWeight",new c.Float32BufferAttribute(t.weight,1)),e.setIndex(t.index);let o=new c.ShaderMaterial({uniforms:Ft,vertexShader:xe,fragmentShader:Me,transparent:!0,depthWrite:!1});for(let n of[dt,zt]){let a=new c.Mesh(e,o);a.matrixAutoUpdate=!1,a.matrix.copy(n),a.matrixWorldNeedsUpdate=!0,a.frustumCulled=!1,a.renderOrder=1,Rt.add(a)}}var ot=new c.OrthographicCamera(-1,1,1,-1,1,400),bn=15.2,qe={az:-Math.PI/2,el:Math.PI/2,zoom:1},Rn={az:-Math.PI/2+.75,el:.42,zoom:.92},it={...qe},Ot=30/38;function $t(){let t=Math.cos(it.el),e=Math.sin(it.el),o=new c.Vector3(t*Math.cos(it.az),t*Math.sin(it.az),e);ot.position.copy(o).multiplyScalar(150);let n=new c.Vector3(0,1,0).lerp(new c.Vector3(0,0,1),Math.min(1,t*1.5)).normalize();ot.up.copy(n),ot.lookAt(0,0,1.5*t);let a=bn/it.zoom;ot.left=-a*Ot,ot.right=a*Ot,ot.top=a,ot.bottom=-a,ot.updateProjectionMatrix(),ct.uView.value.copy(o)}ye(30/38,(t,e)=>{G.setSize(t,e),Ot=t/e,We.set(t*G.getPixelRatio(),e*G.getPixelRatio()),$t()});Ee();var z={t:0,playing:!0,litho:1,lithoTarget:1,revealed:!1,tween:null};be([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{z.lithoTarget=t},1);var Oe=He(t=>{z.playing=t}),Dt=document.getElementById("btn-reveal");function Kt(t){z.revealed=t,Dt.setAttribute("aria-pressed",String(t)),Dt.querySelector("span").textContent=t?"Back to the print":"Tilt the sheet",z.tween={from:{...it},to:t?{...Rn}:{...qe},k:0,dur:2},Te(t,"From the side: only the hands stand up; the cuffs are flat graphite")}Dt.addEventListener("click",()=>Kt(!z.revealed));Re({" ":()=>Oe(!z.playing),l:()=>document.getElementById(z.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>Kt(!z.revealed)});var yt=new c.Vector3;function Hn(t){if(t<j.end){let a=le(j,t),r=j.events[0].t0;return{p:a.p,lift:t<r?.6*(1-t/r):a.lift}}let e=Math.min(1,Math.max(0,(t-j.end-jt)/(Gt+Ce))),o=e*e*(3-2*e);return{p:[j.last[0]+(j.first[0]-j.last[0])*o,j.last[1]+(j.first[1]-j.last[1])*o],lift:.6*Math.min(1,(t-j.end)/.5)}}var Ae=1.7,D={turn:0,slide:0,vTurn:0,vSlide:0,init:!1},Pe=new c.Quaternion,At=new c.Vector3,Et=new c.Vector3,Fe=new c.Matrix4;function Tn(t,e){let o=t-at.x,n=e-at.y,a=Math.hypot(o,n),r=Z[0]-at.x,i=Z[1]-at.y,s=Math.sqrt(Math.max(1,a*a-i*i));return[Math.atan2(n,o)-Math.atan2(i,s),s-r]}function De(t,e){let{p:o,lift:n}=Hn(t);yt.set(o[0],o[1],0).applyMatrix4(zt).applyMatrix4(mn);let a=yt.x-Z[0],r=yt.y-Z[1],i=Math.hypot(a,r),s=i>Ae?(i-Ae)/i:0,[f,w]=Tn(Z[0]+a*s,Z[1]+r*s);if(!D.init||e<=0)D.turn=f,D.slide=w,D.init=!0;else for(let g of["turn","slide"]){let E=g==="turn"?f:w,y=g==="turn"?"vTurn":"vSlide",v=81*(E-D[g])-18*D[y];D[y]+=v*e,D[g]+=D[y]*e}ct.uMotion.value.set(D.turn,D.slide,n,0);let m=Math.cos(-D.turn),d=Math.sin(-D.turn),h=yt.x-at.x,l=yt.y-at.y,p=at.x+m*h-d*l-D.slide,u=at.y+d*h+m*l;At.copy(yn).sub(qt);let M=At.length();At.normalize(),Et.set(p,u,0).sub(qt);let R=Et.length();Et.normalize(),Pe.setFromUnitVectors(At,Et),Fe.makeRotationFromQuaternion(Pe),ct.uPenR.value.setFromMatrix4(Fe),ct.uPenS.value.copy(Et).multiplyScalar(R-M)}var kn=(t,e,o)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),o),Sn=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Le=performance.now();function je(t){let e=Math.min(.05,Math.max(0,(t-Le)/1e3));Le=t,z.playing&&(z.t=(z.t+e)%Ie);let o=z.t;if(De(o,z.playing?e:0),Ft.uNow.value=o,Ft.uFade.value=1-Math.min(1,Math.max(0,(o-j.end-jt)/Gt)),z.litho=kn(z.litho,z.lithoTarget,e*2.2),ct.uLitho.value=z.litho,z.tween){let n=z.tween;n.k=Math.min(1,n.k+e/n.dur);let a=Sn(n.k);for(let r of["az","el","zoom"])it[r]=n.from[r]+(n.to[r]-n.from[r])*a;n.k>=1&&(z.tween=null),$t()}G.setRenderTarget(Be),G.setClearColor(0,1),G.clear(),G.render(Ve,Ut),G.setRenderTarget(null),G.setClearColor(3814188,1),G.clear(),G.render(Rt,ot),requestAnimationFrame(je)}ke();requestAnimationFrame(je);window.__page={state:z,view:it,updateCamera:$t,setRevealed:Kt,setPlaying:Oe,shared:ct,tl:j,PERIOD:Ie,solveMotion:De,fp:ze,drawing:Lt,strokeU:Ft,scene:Rt,placeA:dt,placeB:zt};})();
