(()=>{var qe=Object.create;var Gt=Object.defineProperty;var Oe=Object.getOwnPropertyDescriptor;var De=Object.getOwnPropertyNames;var je=Object.getPrototypeOf,Ge=Object.prototype.hasOwnProperty;var $e=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var Ue=(t,e,n,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of De(e))!Ge.call(t,a)&&a!==n&&Gt(t,a,{get:()=>e[a],enumerable:!(o=Oe(e,a))||o.enumerable});return t};var Ke=(t,e,n)=>(n=t!=null?qe(je(t)):{},Ue(e||!t||!t.__esModule?Gt(n,"default",{value:t,enumerable:!0}):n,t));var Ut=$e((Mo,$t)=>{$t.exports=window.THREE});var f=Ke(Ut(),1);var A=(t,e,n)=>[t,e,n],K=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],Y=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],B=(t,e)=>[t[0]*e,t[1]*e,t[2]*e],dt=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],Xt=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Mt=t=>Math.hypot(t[0],t[1],t[2]),$=t=>B(t,1/(Mt(t)||1)),yt=(t,e)=>$(Y(t,B(e,dt(t,e)))),Tt={roll:.36,pitch:.17,flat:[-5.6,-.6]},Yt=A(7.2,3.4,1.2),Et=A(10.3,3.85,-2.9),ut=$(Y(Et,Yt)),q={r:.37,tipLen:.35,coneLen:2.1,back:10.5},Xe=3.4,Ye=K(Et,B(ut,Xe));function wt(t,e,n){let o=Math.max(n-Math.abs(t-e),0)/n;return Math.min(t,e)-o*o*n*.25}function Ze(t,e,n,o){let a=Y(e,t),r=dt(a,a),l=n-o,s=r-l*l,i=1/r;return{a:t,b:e,r1:n,r2:o,ba:a,l2:r,rr:l,a2:s,il2:i,k:Math.sign(l)*l*l}}function gt(t,e,n,o){let a=t-o.a[0],r=e-o.a[1],l=n-o.a[2],s=o.ba[0],i=o.ba[1],h=o.ba[2],u=a*s+r*i+l*h,p=u-o.l2,w=a*o.l2-s*u,c=r*o.l2-i*u,d=l*o.l2-h*u,m=w*w+c*c+d*d,x=u*u*o.l2,R=p*p*o.l2,v=o.k*m;return Math.sign(p)*o.a2*R>v?Math.sqrt(m+R)*o.il2-o.r2:Math.sign(u)*o.a2*x<v?Math.sqrt(m+x)*o.il2-o.r1:(Math.sqrt(m*o.a2*o.il2)+u*o.rr)*o.il2-o.r1}function xt(t,e,n){return{c:t,r:e,m:n}}function Je(t,e,n,o){let a=t-o.c[0],r=e-o.c[1],l=n-o.c[2];if(o.m){let m=o.m,x=m[0]*a+m[1]*r+m[2]*l,R=m[3]*a+m[4]*r+m[5]*l,v=m[6]*a+m[7]*r+m[8]*l;a=x,r=R,l=v}let s=a/o.r[0],i=r/o.r[1],h=l/o.r[2],u=s/o.r[0],p=i/o.r[1],w=h/o.r[2],c=Math.sqrt(s*s+i*i+h*h),d=Math.sqrt(u*u+p*p+w*w);return d>1e-9?c*(c-1)/d:-Math.min(o.r[0],o.r[1],o.r[2])}function St(t,e,n,o){let a=[0,0,-1],r=[t],l=0,s=t;for(let i=0;i<n.length;i++){l+=o[i];let h=K(B(e,Math.cos(l)),B(a,Math.sin(l)));s=K(s,B(h,n[i])),r.push(s)}return r}function Kt(t,e,n,o,a=0){let r=Y(n,t),l=$([r[0],r[1],0]),s=Math.hypot(r[0],r[1]),i=-r[2],h=(d,m)=>{let x=[d,d+m,d+m+o*m],R=0,v=0;for(let g=0;g<3;g++)R+=e[g]*Math.cos(x[g]),v+=e[g]*Math.sin(x[g]);return[R,v]},u=[0,0],p=1e9;for(let d=-.5;d<=1.7;d+=.02)for(let m=0;m<=2.1;m+=.02){let[x,R]=h(d,m),v=(x-s)**2+(R-i)**2+.002*m*m;v<p&&(p=v,u=[d,m])}let w=[u[0],u[1],o*u[1]],c=$(K(l,[-l[1]*a,l[0]*a,0]));return{pts:St(t,l,e,w),d:c,err:Math.sqrt(p)}}function Qe(t,e,n,o,a){let r=Y(e,t),l=Math.min(Mt(r),n+o-.001),s=$(r),i=yt(a,s),h=(n*n+l*l-o*o)/(2*n*l),u=Math.acos(Math.max(-1,Math.min(1,h))),p=K(t,K(B(s,n*Math.cos(u)),B(i,n*Math.sin(u)))),w=K(p,B($(Y(K(t,B(s,l)),p)),o));return[t,p,w]}function Zt(){let t={palm:[],fingers:[],pads:[]},e=(v,g,b,M)=>Ze(v,g,b,M),n={index:A(8.4,2.45,.3),middle:A(8.8,.72,.42),ring:A(8.4,-.95,.22),pinky:A(7.7,-2.45,-.12)},o={index:A(1.6,1.25,.45),middle:A(1.4,.3,.55),ring:A(1.5,-.62,.45),pinky:A(1.7,-1.5,.25)},a={index:.84,middle:.86,ring:.8,pinky:.72};for(let v of["index","middle","ring","pinky"])t.palm.push(e(o[v],n[v],.62,a[v]));t.pads.push(xt(A(4.7,0,-.2),[3.7,3,.78])),t.pads.push(xt(A(3.2,2.15,-.75),[2.4,1.35,1])),t.pads.push(xt(A(4,-2.05,-.6),[2.9,.82,.85])),t.pads.push(xt(A(8,0,-.55),[1.1,2.9,.6])),t.palm.push(e(A(-13.5,0,0),A(-2.5,0,0),1.82,1.74)),t.palm.push(e(A(-2.5,0,0),A(1,0,.1),1.74,1.45));let r=1.5,l=yt([0,0,1],ut),s=$(Xt(ut,l)),i=(v,g,b)=>K(K(Et,B(ut,v)),B(K(B(l,Math.cos(g)),B(s,Math.sin(g))),q.r+b)),h={index:[4,2.35,1.85],middle:[4.45,2.75,1.95],ring:[4.15,2.6,1.85],pinky:[3.3,2,1.65]},u={index:[.9,.82,.73,.6],middle:[.93,.85,.75,.62],ring:[.88,.8,.7,.58],pinky:[.78,.7,.62,.5]},p={};p.index=Kt(n.index,h.index,i(.25,-.25,.62),.55),p.middle=Kt(n.middle,h.middle,i(1.25,Math.PI*.82,.55),.7),p.ring={pts:St(n.ring,$([.97,-.1,0]),h.ring,[.9,1.9,.9])},p.pinky={pts:St(n.pinky,$([.96,-.22,0]),h.pinky,[.95,1.85,.85])};for(let v of["index","middle","ring","pinky"]){let g=p[v].pts,b=u[v],M=[];for(let E=0;E<3;E++)M.push(e(g[E],g[E+1],b[E],b[E+1]));t.fingers.push({name:v,segs:M,pts:g,rad:b})}let w=A(1.7,2.1,-.55),c=A(5.6,4.35,-1.15),d=i(-.05,Math.PI*.42,.6),m=Qe(c,d,3,2.55,$([-.2,.55,.8])),x={name:"thumb",segs:[e(w,c,1.25,1.02),e(m[0],m[1],1.02,.9),e(m[1],m[2],.9,.7)],pts:[w,...m],rad:[1.25,1.02,.9,.7]};t.fingers.push(x);for(let v of t.fingers){let g=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];for(let M of v.segs)for(let E of[M.a,M.b])for(let T=0;T<3;T++)g[T]=Math.min(g[T],E[T]-1.4),b[T]=Math.max(b[T],E[T]+1.4);v.lo=g,v.hi=b}function R(v,g,b){let M=1e9;for(let E=0;E<t.palm.length;E++){let T=t.palm[E],V=E>=4?gt(v,g/r,b,T)*1.2:gt(v,g,b,T);M=E===0?V:wt(M,V,E>=4?1.8:.9)}for(let E of t.pads)M=wt(M,Je(v,g,b,E),.9);for(let E of t.fingers){let T=Math.max(E.lo[0]-v,0,v-E.hi[0]),V=Math.max(E.lo[1]-g,0,g-E.hi[1]),j=Math.max(E.lo[2]-b,0,b-E.hi[2]);if(T*T+V*V+j*j>(M+1)*(M+1)&&M>0)continue;let F=gt(v,g,b,E.segs[0]);for(let S=1;S<E.segs.length;S++)F=wt(F,gt(v,g,b,E.segs[S]),.22);M=wt(M,F,E.name==="thumb"?.8:.3)}return M}return{sdf:R,prims:t,fingers:p,thumb:x,MCP:n,pen:{W:Yt,C:Et,D:ut,tip:Ye},n1:l,n2:s,ik:{index:p.index.err,middle:p.middle.err}}}function Jt(t,e,n,o){let a=Math.ceil((n[0]-e[0])/o)+1,r=Math.ceil((n[1]-e[1])/o)+1,l=Math.ceil((n[2]-e[2])/o)+1,s=o*4,i=Math.ceil((n[0]-e[0])/s)+2,h=Math.ceil((n[1]-e[1])/s)+2,u=Math.ceil((n[2]-e[2])/s)+2,p=new Float32Array(i*h*u);for(let y=0;y<u;y++)for(let H=0;H<h;H++)for(let k=0;k<i;k++)p[k+i*(H+h*y)]=t(e[0]+k*s,e[1]+H*s,e[2]+y*s);let w=s*.65,c=new Float32Array(a*r*l),d=i*h;for(let y=0;y<l;y++){let H=e[2]+y*o,k=y*o/s,_=Math.floor(k),L=k-_;for(let I=0;I<r;I++){let z=e[1]+I*o,W=I*o/s,lt=Math.floor(W),Z=W-lt,N=i*lt+d*_,J=N+i,ft=N+d,rt=J+d,ht=a*(I+r*y);for(let ot=0;ot<a;ot++,ht++){let Q=ot*o/s,G=Math.floor(Q),nt=Q-G,_e=p[N+G]*(1-nt)+p[N+G+1]*nt,Be=p[J+G]*(1-nt)+p[J+G+1]*nt,We=p[ft+G]*(1-nt)+p[ft+G+1]*nt,Ne=p[rt+G]*(1-nt)+p[rt+G+1]*nt,kt=(_e*(1-Z)+Be*Z)*(1-L)+(We*(1-Z)+Ne*Z)*L;c[ht]=kt>w||kt<-w?kt:t(e[0]+ot*o,z,H)}}}let m=a-1,x=r-1,R=l-1,v=new Int32Array(m*x*R).fill(-1),g=[],b=a*r,M=[0,1,a,a+1,b,b+1,b+a,b+a+1],E=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],T=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],V=new Float64Array(8);for(let y=0;y<R;y++)for(let H=0;H<x;H++){let k=a*(H+r*y);for(let _=0;_<m;_++){let L=k+_,I=0;for(let N=0;N<8;N++){let J=c[L+M[N]];V[N]=J,J<0&&I++}if(I===0||I===8)continue;let z=0,W=0,lt=0,Z=0;for(let N=0;N<12;N++){let J=T[N][0],ft=T[N][1],rt=V[J],ht=V[ft];if(rt<0==ht<0)continue;let ot=rt/(rt-ht),Q=E[J],G=E[ft];z+=Q[0]+(G[0]-Q[0])*ot,W+=Q[1]+(G[1]-Q[1])*ot,lt+=Q[2]+(G[2]-Q[2])*ot,Z++}v[_+m*(H+x*y)]=g.length/3,g.push(e[0]+(_+z/Z)*o,e[1]+(H+W/Z)*o,e[2]+(y+lt/Z)*o)}}let j=(y,H,k)=>c[y+a*(H+r*k)],F=[],S=(y,H,k)=>v[y+m*(H+x*k)];for(let y=1;y<l-1;y++)for(let H=1;H<r-1;H++)for(let k=1;k<a-1;k++){let _=j(k,H,y)<0;if(k<a-1&&_!==j(k+1,H,y)<0){let L=S(k,H-1,y-1),I=S(k,H,y-1),z=S(k,H,y),W=S(k,H-1,y);_?F.push(L,I,z,L,z,W):F.push(L,z,I,L,W,z)}if(H<r-1&&_!==j(k,H+1,y)<0){let L=S(k-1,H,y-1),I=S(k,H,y-1),z=S(k,H,y),W=S(k-1,H,y);_?F.push(L,z,I,L,W,z):F.push(L,I,z,L,z,W)}if(y<l-1&&_!==j(k,H,y+1)<0){let L=S(k-1,H-1,y),I=S(k,H-1,y),z=S(k,H,y),W=S(k-1,H,y);_?F.push(L,I,z,L,z,W):F.push(L,z,I,L,W,z)}}return{positions:new Float32Array(g),index:new Uint32Array(F)}}function Qt(t,e){let n=Math.cos(Tt.roll),o=Math.sin(Tt.roll),a=(h,u)=>{let p=Math.cos(u),w=Math.sin(u),c=h[1]*n-h[2]*o,d=h[1]*o+h[2]*n;return[h[0]*p+d*w,c,-h[0]*w+d*p]},r=Tt.pitch;if(e){let h=[];for(let c=0;c<e.length;c+=9)e[c]>1.5&&h.push([e[c],e[c+1],e[c+2]]);let u=c=>{let d=1e9;for(let m of h)d=Math.min(d,a(m,c)[2]);return d-a(t.pen.tip,c)[2]},p=-.3,w=.9;for(let c=0;c<30;c++){let d=(p+w)/2;u(d)>0?w=d:p=d}r=(p+w)/2}let s=-a(t.pen.tip,r)[2];return{rot:h=>a(h,r),pitch:r,lift:s,apply:h=>{let u=a(h,r);return[u[0],u[1],u[2]+s]}}}function te(t,e,n,o){let a=e.length/3,r=new Float32Array(a).fill(9),l=new Float32Array(a).fill(1),s=[];for(let i of t.prims.fingers){let h=i.pts,u=i.rad,p=h[h.length-2],w=h[h.length-1],c=$(Y(w,p)),d;i.name==="thumb"?d=yt($([-.15,.6,.8]),c):d=yt([0,0,1],c);let m=Xt(c,d),x=Mt(Y(w,p));s.push({j3:p,u:c,dors:d,side:m,L:x,r:u[u.length-2],rt:u[u.length-1]})}for(let i=0;i<a;i++){let h=[e[3*i],e[3*i+1],e[3*i+2]],u=9;for(let x of s){let R=Y(h,x.j3),v=dt(R,x.u);if(v<-.2||v>x.L+x.rt+.3)continue;let g=Y(R,B(x.u,v)),b=Mt(g),M=x.r+(x.rt-x.r)*Math.min(1,Math.max(0,v/x.L));if(Math.abs(b-M)>.35)continue;let E=Math.atan2(dt(g,x.side),dt(g,x.dors)),T=v-(.35*x.L+(x.L+.35*x.rt))/2,V=(x.L+.35*x.rt-.35*x.L)/2,j=E*M,F=.62*M,S=Math.abs(T)-V+.18,y=Math.abs(j)-F+.18,H=Math.min(Math.max(S,y),0)+Math.hypot(Math.max(S,0),Math.max(y,0))-.18;H<u&&(u=H)}r[i]=u;let p=n[3*i],w=n[3*i+1],c=n[3*i+2],d=0,m=1;for(let x=1;x<=4;x++){let R=.35*x,v=o(h[0]+p*R,h[1]+w*R,h[2]+c*R);d+=m*Math.max(0,R-v),m*=.55}l[i]=Math.max(0,1-d*.9)}return{nail:r,ao:l}}function ee(t,e,n,o){let a=Math.round((n-e)/o)+1,r=new Float32Array(a).fill(1e9),l=new Float32Array(a).fill(-1e9);for(let s=0;s<t.length;s+=3){let i=Math.round((t[s]-e)/o);i<0||i>=a||(r[i]=Math.min(r[i],t[s+1]),l[i]=Math.max(l[i],t[s+1]))}return{x0:e,step:o,lo:r,hi:l,at(s){let i=Math.min(a-1.001,Math.max(0,(s-e)/o)),h=Math.floor(i),u=i-h;return[r[h]*(1-u)+r[h+1]*u,l[h]*(1-u)+l[h+1]*u]}}}function to(t){let e=t>>>0||1;return()=>(e=e*1664525+1013904223>>>0)/4294967296}function eo(t){let e=0;for(let n=1;n<t.length;n++)e+=Math.hypot(t[n][0]-t[n-1][0],t[n][1]-t[n-1][1]);return e}function C(t,e,n,o){let a=[];for(let u=0;u<=64;u++)a.push(t(u/64));let r=eo(a),l=Math.max(2,Math.ceil(r/e)),s=o()*6.28,i=o()*6.28,h=[];for(let u=0;u<=l;u++){let p=u/l,w=t(p),c=t(Math.min(1,p+.001)),d=t(Math.max(0,p-.001)),m=c[0]-d[0],x=c[1]-d[1],R=Math.hypot(m,x)||1;m/=R,x/=R;let v=n*(Math.sin(p*5.1+s)*.6+Math.sin(p*13.7+i)*.4);h.push([w[0]-x*v,w[1]+m*v])}return h}var U=(t,e,n)=>t+(e-t)*n,X=(t,e)=>n=>[U(t[0],e[0],n),U(t[1],e[1],n)],At=(t,e,n,o,a=-Math.PI/2,r=Math.PI/2)=>l=>{let s=U(a,r,l);return[t[0]+o*e*Math.cos(s),t[1]+n*Math.sin(s)]};function oe(t){let e=to(11),n=[],o=(c,d={})=>n.push({pts:c,w:d.w??.05,dark:d.dark??.85,speed:d.speed??12,kind:d.kind??"line"}),a=-3.9,r=-5.65,l=-8.3,s=c=>t.at(c),i=Math.max(-s(r)[0],s(r)[1])+.55,h=.5;o(C(X([a,s(a)[1]],[r+.15,s(r)[1]]),.12,.02,e),{w:.055}),o(C(X([a,s(a)[0]],[r+.15,s(r)[0]]),.12,.02,e),{w:.055}),o(C(At([r,0],h,i,1,-Math.PI/2,Math.PI/2),.12,.02,e),{w:.055});let u=s(r),p=Math.asin(Math.max(-1,u[0]/i)),w=Math.asin(Math.min(1,u[1]/i));o(C(c=>{let d=U(Math.PI*.5,Math.PI-w,c);return[r+h*Math.cos(d),i*Math.sin(d)]},.1,.01,e),{w:.045,dark:.75}),o(C(c=>{let d=U(-Math.PI*.5,-Math.PI-p,c);return[r+h*Math.cos(d),i*Math.sin(d)]},.1,.01,e),{w:.045,dark:.75}),o(C(X([r,i],[l,i+.12]),.14,.025,e),{w:.055}),o(C(X([r,-i],[l,-i-.12]),.14,.025,e),{w:.055}),o(C(At([l,0],h*.9,i+.12,1),.14,.02,e),{w:.05}),o(C(At([r-.42,0],h*.9,i-.12,1,-Math.PI*.46,Math.PI*.46),.12,.01,e),{w:.03,dark:.55});for(let[c,d]of[[-6.55,i-.75],[-7.45,i-.72]])o(C(m=>[c+.21*Math.cos(m*6.6),d+.21*Math.sin(m*6.6)],.06,.004,e),{w:.038,speed:7});o(C(X([l-.05,i+.14],[l-1,i+.3]),.14,.02,e),{w:.045,dark:.6}),o(C(X([l-.05,-i-.14],[l-1,-i-.32]),.14,.02,e),{w:.045,dark:.6}),o(C(c=>[l-.35-.2*c,U(-1.4,.6,c)+.15*Math.sin(c*3)],.12,.02,e),{w:.035,dark:.5});for(let c of[1,-1]){let d=c>0?u[1]:u[0],m=c*i;for(let x=0;x<6;x++){let R=(x+.5)/6,v=U(d,m,R),g=r+h*Math.sqrt(Math.max(0,1-(v/i)**2));o(C(X([g-.05,v],[r-.32,v+c*.12]),.08,.004,e),{w:.032,dark:.8,speed:26,kind:"hatch"})}}for(let c=0;c<9;c++){let d=U(a-.25,r+.35,c/8),m=s(d)[0]+.06;o(C(X([d+.22,m],[d-.12,m+.95-.35*(c%2)]),.08,.004,e),{w:.03,dark:.7,speed:26,kind:"hatch"})}for(let c=0;c<6;c++){let d=-i+.16+c*.2,m=r-.55-.05*c,x=l+.2+.35*c;o(C(X([m,d],[x,d-.05]),.12,.006,e),{w:.03,dark:.65,speed:28,kind:"hatch"})}for(let c=0;c<5;c++){let d=l+.45+c*.36;o(C(X([d,-i+.08],[d+.32,-i+.9-.1*c]),.08,.004,e),{w:.028,dark:.6,speed:26,kind:"hatch"})}for(let c=0;c<5;c++){let d=i-.12-c*.17;o(C(X([r-.5,d],[r-1.4+.12*c,d+.03]),.1,.004,e),{w:.026,dark:.55,speed:28,kind:"hatch"})}return{strokes:n,XW:a,XC:r,XB:l,rimY:i}}function ne(t,e={}){let n=e.travel??34,o=[],a=e.start??.4,r=null;for(let l=0;l<t.length;l++){let s=t[l],i=s.pts[0];if(r){let c=.12+Math.hypot(i[0]-r[0],i[1]-r[1])/n;o.push({type:"move",from:r,to:i,t0:a,t1:a+c}),a+=c}let h=[0];for(let w=1;w<s.pts.length;w++)h.push(h[w-1]+Math.hypot(s.pts[w][0]-s.pts[w-1][0],s.pts[w][1]-s.pts[w-1][1]));let u=h[h.length-1],p=u/s.speed+.04;s.cum=h,s.len=u,s.t0=a,s.t1=a+p,o.push({type:"draw",stroke:s,t0:a,t1:a+p}),a+=p,r=s.pts[s.pts.length-1]}return{events:o,end:a,first:t[0].pts[0],last:r}}var oo=t=>t*t*(3-2*t);function ae(t,e){let n=t.events;if(e<=n[0].t0)return{p:t.first,lift:.5,drawing:!1};for(let o of n){if(e>o.t1)continue;let a=(e-o.t0)/(o.t1-o.t0);if(o.type==="move"){let w=oo(a);return{p:[U(o.from[0],o.to[0],w),U(o.from[1],o.to[1],w)],lift:.5*Math.sin(Math.PI*a)**.6,drawing:!1}}let r=o.stroke,l=Math.min(1,a*1.04)*r.len,s=1;for(;s<r.cum.length-1&&r.cum[s]<l;)s++;let i=r.pts[s-1],h=r.pts[s],u=r.cum[s]-r.cum[s-1]||1,p=Math.min(1,Math.max(0,(l-r.cum[s-1])/u));return{p:[U(i[0],h[0],p),U(i[1],h[1],p)],lift:0,drawing:!0}}return{p:t.last,lift:0,drawing:!1}}function se(t){let e=[],n=[],o=[],a=[],r=[],l=[];for(let s of t){let i=e.length/3,h=s.pts.length;for(let u=0;u<h;u++){let p=s.pts[u],w=s.pts[Math.min(h-1,u+1)],c=s.pts[Math.max(0,u-1)],d=w[0]-c[0],m=w[1]-c[1],x=Math.hypot(d,m)||1;d/=x,m/=x;let R=s.cum[u]/(s.len||1),v=Math.min(1,R*6+.25)*Math.min(1,(1-R)*4+.15),g=s.w*(.55+.45*v)*.5+.012,b=s.t0+(s.t1-s.t0-.04)*R/1.04;for(let M of[-1,1])e.push(p[0]-m*g*M,p[1]+d*g*M,.004),n.push(M),o.push(b),a.push(s.cum[u]),r.push(s.dark*(.6+.4*v));if(u<h-1){let M=i+2*u;l.push(M,M+1,M+3,M,M+3,M+2)}}}return{pos:e,side:n,time:o,arcl:a,weight:r,index:l}}var Pt=`
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
`,Ft=`
uniform vec4 uMotion;   // turn (rad), slide (cm), lift (cm), unused
uniform vec2 uPivot;    // pivot of the turn, hand frame
uniform vec2 uFlat;     // the arm rises out of the paper between these x
uniform mat4 uPlace;    // hand frame -> world
vec3 handMotion(vec3 p, inout vec3 n, out float f) {
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
`,re=`
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
${Ft}
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
`,ie=`
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
${Pt}

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
`,ce=`
uniform float uWidth;   // px
uniform vec2 uRes;      // px
varying float vF;
${Ft}
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
`,le=`
uniform vec3 uInkC;
varying float vF;
void main() {
  if (vF < 0.12) discard;
  gl_FragColor = vec4(uInkC, 1.0);
}
`,fe=`
uniform vec3 uLight;
uniform float uMode;    // 0: shCast along the light, 1: straight down
varying float vH;
varying float vF;
${Ft}
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
`,he=`
uniform float uMode;
varying float vH;
varying float vF;
void main() {
  if (vF < 0.06) discard;
  float shCast = (0.85 - 0.55 * smoothstep(0.0, 9.0, vH)) * smoothstep(0.06, 0.4, vF);
  float contact = (1.0 - smoothstep(0.0, 1.1, vH)) * smoothstep(0.06, 0.6, vF);
  gl_FragColor = uMode < 0.5 ? vec4(shCast, 0.0, 0.0, 1.0) : vec4(0.0, contact, 0.0, 1.0);
}
`,ue=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,de=`
uniform sampler2D uShadow;
uniform vec4 uShadowRect;   // x0, y0, width, height (world)
uniform vec2 uShadowTexel;
uniform vec3 uPaper;
uniform vec2 uSheet;        // half size of the sheet
varying vec3 vW;
${Pt}
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
`,pe=`
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
`,me=`
uniform float uNow;
uniform float uFade;
uniform vec3 uGraphite;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
${Pt}
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
`;function ve(t,e){let n=document.getElementById("frame"),o=()=>{let r=(window.innerWidth<640?10:28)+13,l=document.getElementById("masthead"),s=document.getElementById("controls"),i=(l?l.offsetHeight:0)+6+13,h=(s?s.offsetHeight:0)+8+13,u=window.innerWidth-r*2,p=window.innerHeight-i-h,w=p,c=w*t;c>u&&(c=u,w=c/t),c=Math.max(160,Math.floor(c)),w=Math.max(120,Math.floor(w)),n.style.width=`${c}px`,n.style.height=`${w}px`,n.style.top=`${i+Math.max(0,(p-w)/2)}px`,e?.(c,w)};return window.addEventListener("resize",o),o(),o}function we(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!t)return;let o=a=>{a?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(a))};e?.addEventListener("click",()=>o(t.hasAttribute("hidden"))),n?.addEventListener("click",()=>o(!1)),window.addEventListener("keydown",a=>{a.key==="Escape"&&o(!1)})}function ge(t,e,n){let o=a=>{for(let[r,l]of t)r.setAttribute("aria-pressed",String(l===a));e(a)};for(let[a,r]of t)a.addEventListener("click",()=>o(r));return n!==void 0&&o(n),o}function xe(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let n=t[e.key.length===1?e.key.toLowerCase():e.key];n&&(e.preventDefault(),n(e))})}function Me(t,e=!0){let n=document.getElementById("btn-play"),o=a=>{e=a,n&&(n.setAttribute("aria-pressed",String(!a)),n.querySelector("span").textContent=a?"Pause":"Play",n.querySelector(".icon").textContent=a?"\u275A\u275A":"\u25B6"),t(a)};return n?.addEventListener("click",()=>o(!e)),o(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),o}function ye(t,e){let n=document.getElementById("badge");n&&e&&(n.textContent=e),document.body.classList.toggle("badge-on",!!t)}function Ee(){document.body.classList.add("ready")}var it=Zt(),tt=Jt(it.sdf,[-13,-4.6,-6.6],[14,7,3.6],.15),Ht=Qt(it,tt.positions);function ao(){let t=new f.BufferGeometry;t.setAttribute("position",new f.BufferAttribute(tt.positions,3)),t.setIndex(new f.BufferAttribute(tt.index,1)),t.computeVertexNormals();let e=t.attributes.normal.array,n=te(it,tt.positions,e,it.sdf),o=tt.positions.length/3,a=new Float32Array(o*3),r=new Float32Array(o*3);for(let s=0;s<o;s++){let i=Ht.apply([tt.positions[3*s],tt.positions[3*s+1],tt.positions[3*s+2]]),h=Ht.rot([e[3*s],e[3*s+1],e[3*s+2]]);a.set(i,3*s),r.set(h,3*s)}let l=new f.BufferGeometry;return l.setAttribute("position",new f.BufferAttribute(a,3)),l.setAttribute("normal",new f.BufferAttribute(r,3)),l.setAttribute("aAO",new f.BufferAttribute(n.ao,1)),l.setAttribute("aNail",new f.BufferAttribute(n.nail,1)),l.setAttribute("aMat",new f.BufferAttribute(new Float32Array(o),1)),l.setIndex(new f.BufferAttribute(tt.index,1)),l}function so(t,e){let a=q.r*Math.cos(Math.PI/6),r=g=>a/Math.cos((g%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6),l=g=>g<q.tipLen?.012+(.09-.012)*(g/q.tipLen):.09+(q.r-.09)*Math.min(1,(g-q.tipLen)/q.coneLen),s=new f.Vector3(...e).normalize(),i=new f.Vector3(0,0,1).cross(s).normalize(),h=new f.Vector3().crossVectors(s,i).normalize(),u=[0,.05,.12,.2,.28,q.tipLen,.45,.6,.8,1,1.2,1.4,1.6,1.8,1.95,2.1,2.25,2.4,2.6,3.2,5,7,9,11,13],p=[],w=[],c=[],d=[];for(let g of u)for(let b=0;b<=36;b++){let M=b/36*Math.PI*2,E=r(M),T=l(g),V=Math.min(E,T),j=new f.Vector3(...t).addScaledVector(s,g).addScaledVector(i,Math.cos(M)*V).addScaledVector(h,Math.sin(M)*V),F;if(T<E-1e-4){let S=g<q.tipLen?.078/q.tipLen:(q.r-.09)/q.coneLen;F=new f.Vector3().addScaledVector(i,Math.cos(M)).addScaledVector(h,Math.sin(M)).addScaledVector(s,-S).normalize()}else{let S=Math.floor((M+Math.PI/6)/(Math.PI/3))*(Math.PI/3);F=new f.Vector3().addScaledVector(i,Math.cos(S)).addScaledVector(h,Math.sin(S))}p.push(j.x,j.y,j.z),w.push(F.x,F.y,F.z),c.push(g<q.tipLen+.02?3:T<E-.01?2:1)}let m=37;for(let g=0;g<u.length-1;g++)for(let b=0;b<36;b++){let M=g*m+b,E=M+1,T=M+m,V=T+1;d.push(M,T,E,E,T,V)}let x=p.length/3,R=new f.Vector3(...t).addScaledVector(s,13);p.push(R.x,R.y,R.z),w.push(s.x,s.y,s.z),c.push(2);for(let g=0;g<36;g++){let b=(u.length-1)*m+g;d.push(x,b,b+1)}let v=new f.BufferGeometry;return v.setAttribute("position",new f.Float32BufferAttribute(p,3)),v.setAttribute("normal",new f.Float32BufferAttribute(w,3)),v.setAttribute("aMat",new f.Float32BufferAttribute(c,1)),v.setAttribute("aAO",new f.Float32BufferAttribute(new Array(p.length/3).fill(1),1)),v.setAttribute("aNail",new f.Float32BufferAttribute(new Array(p.length/3).fill(9),1)),v.setIndex(d),v}var bt=ao(),mt=Ht.apply(it.pen.tip),Lt=so(mt,Ht.rot(it.pen.D).map(t=>-t)),Re=ee(bt.attributes.position.array,-11,0,.2),be=[-6.6,0],zt=-Math.PI/2+.16,vt=new f.Matrix4;{let t=Math.cos(zt),e=Math.sin(zt),n=mt[0]+be[0],o=mt[1]+be[1],a=-(t*n-e*o)/2,r=-(e*n+t*o)/2;vt.makeRotationZ(zt).setPosition(a,r,0)}var Bt=new f.Matrix4().makeRotationZ(Math.PI).multiply(vt),ro=vt.clone().invert(),pt=new f.Vector2(-2.6,0),io=new f.Vector2(-5,-.3),Wt=oe(Re),O=ne(Wt.strokes),Nt=1.6,qt=1.4,ke=.9,Te=O.end+Nt+qt+ke,co=document.getElementById("scene"),D=new f.WebGLRenderer({canvas:co,antialias:!0,powerPreference:"high-performance"});D.setPixelRatio(Math.min(window.devicePixelRatio||1,2));D.setClearColor(3814188,1);D.autoClear=!1;var lo=new f.Vector3(.93,.905,.845),fo=new f.Vector3(.11,.1,.09),ho=new f.Vector3(-.45,.55,.72).normalize(),ct={uMotion:{value:new f.Vector4(0,0,0,0)},uPivot:{value:pt},uFlat:{value:io},uLight:{value:ho},uView:{value:new f.Vector3(0,0,1)},uLitho:{value:1},uPaper:{value:lo},uInk:{value:fo}},Rt=new f.Scene,Se=new f.Scene,Ae=new f.Vector2(1,1);function Pe(t){let e={...ct,uPlace:{value:t}},n=new f.Mesh(bt,new f.ShaderMaterial({uniforms:e,vertexShader:re,fragmentShader:ie,side:f.DoubleSide})),o=new f.Mesh(Lt,n.material),a=new f.ShaderMaterial({uniforms:{...e,uWidth:{value:1.6},uRes:{value:Ae},uInkC:{value:new f.Vector3(.12,.1,.09)}},vertexShader:ce,fragmentShader:le,side:f.BackSide}),r=new f.Mesh(bt,a),l=new f.Mesh(Lt,a);for(let s of[n,o,r,l])s.frustumCulled=!1,Rt.add(s);for(let s of[0,1]){let i=new f.ShaderMaterial({uniforms:{...e,uMode:{value:s}},vertexShader:fe,fragmentShader:he,side:f.DoubleSide,depthTest:!1,depthWrite:!1,blending:f.CustomBlending,blendEquation:f.MaxEquation,blendSrc:f.OneFactor,blendDst:f.OneFactor});for(let h of[bt,Lt]){let u=new f.Mesh(h,i);u.frustumCulled=!1,Se.add(u)}}return{body:n,hull:r}}Pe(vt);Pe(Bt);var uo=new f.Vector2(14.6,18.2),st=new f.Vector4(-16,-20,32,40),Fe=new f.WebGLRenderTarget(640,800,{depthBuffer:!1,type:f.HalfFloatType}),Ot=new f.OrthographicCamera(st.x,st.x+st.z,st.y+st.w,st.y,-100,100);Ot.position.set(0,0,50);Ot.lookAt(0,0,0);var Le=new f.Mesh(new f.PlaneGeometry(80,90),new f.ShaderMaterial({uniforms:{uShadow:{value:Fe.texture},uShadowRect:{value:st},uShadowTexel:{value:new f.Vector2(1/640,1/800)},uPaper:ct.uPaper,uSheet:{value:uo}},vertexShader:ue,fragmentShader:de}));Le.renderOrder=-10;Rt.add(Le);var Ct={uNow:{value:0},uFade:{value:1},uGraphite:{value:new f.Vector3(.19,.19,.21)}};{let t=se(Wt.strokes),e=new f.BufferGeometry;e.setAttribute("position",new f.Float32BufferAttribute(t.pos,3)),e.setAttribute("aSide",new f.Float32BufferAttribute(t.side,1)),e.setAttribute("aTime",new f.Float32BufferAttribute(t.time,1)),e.setAttribute("aArc",new f.Float32BufferAttribute(t.arcl,1)),e.setAttribute("aWeight",new f.Float32BufferAttribute(t.weight,1)),e.setIndex(t.index);let n=new f.ShaderMaterial({uniforms:Ct,vertexShader:pe,fragmentShader:me,transparent:!0,depthWrite:!1});for(let o of[vt,Bt]){let a=new f.Mesh(e,n);a.matrixAutoUpdate=!1,a.matrix.copy(o),a.matrixWorldNeedsUpdate=!0,a.frustumCulled=!1,a.renderOrder=1,Rt.add(a)}}var et=new f.OrthographicCamera(-1,1,1,-1,1,400),po=15.2,ze={az:-Math.PI/2,el:Math.PI/2,zoom:1},mo={az:-Math.PI/2+.75,el:.42,zoom:.92},at={...ze},Vt=30/38;function Dt(){let t=Math.cos(at.el),e=Math.sin(at.el),n=new f.Vector3(t*Math.cos(at.az),t*Math.sin(at.az),e);et.position.copy(n).multiplyScalar(150);let o=new f.Vector3(0,1,0).lerp(new f.Vector3(0,0,1),Math.min(1,t*1.5)).normalize();et.up.copy(o),et.lookAt(0,0,1.5*t);let a=po/at.zoom;et.left=-a*Vt,et.right=a*Vt,et.top=a,et.bottom=-a,et.updateProjectionMatrix(),ct.uView.value.copy(n)}ve(30/38,(t,e)=>{D.setSize(t,e),Vt=t/e,Ae.set(t*D.getPixelRatio(),e*D.getPixelRatio()),Dt()});we();var P={t:0,playing:!0,litho:1,lithoTarget:1,revealed:!1,tween:null};ge([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{P.lithoTarget=t},1);var Ie=Me(t=>{P.playing=t}),_t=document.getElementById("btn-reveal");function jt(t){P.revealed=t,_t.setAttribute("aria-pressed",String(t)),_t.querySelector("span").textContent=t?"Back to the print":"Tilt the sheet",P.tween={from:{...at},to:t?{...mo}:{...ze},k:0,dur:2},ye(t,"From the side: only the hands stand up; the cuffs are flat graphite")}_t.addEventListener("click",()=>jt(!P.revealed));xe({" ":()=>Ie(!P.playing),l:()=>document.getElementById(P.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>jt(!P.revealed)});var It=new f.Vector3;function vo(t){if(t<O.end){let a=ae(O,t),r=O.events[0].t0;return{p:a.p,lift:t<r?.6*(1-t/r):a.lift}}let e=Math.min(1,Math.max(0,(t-O.end-Nt)/(qt+ke))),n=e*e*(3-2*e);return{p:[O.last[0]+(O.first[0]-O.last[0])*n,O.last[1]+(O.first[1]-O.last[1])*n],lift:.6*Math.min(1,(t-O.end)/.5)}}function Ce(t){let{p:e,lift:n}=vo(t);It.set(e[0],e[1],0).applyMatrix4(Bt).applyMatrix4(ro);let o=It.x-pt.x,a=It.y-pt.y,r=Math.hypot(o,a),l=mt[0]-pt.x,s=mt[1]-pt.y,i=Math.sqrt(Math.max(1,r*r-s*s)),h=i-l,u=Math.atan2(a,o)-Math.atan2(s,i);ct.uMotion.value.set(u,h,n,0)}var wo=(t,e,n)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),n),go=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,He=performance.now();function Ve(t){let e=Math.min(.05,Math.max(0,(t-He)/1e3));He=t,P.playing&&(P.t=(P.t+e)%Te);let n=P.t;if(Ce(n),Ct.uNow.value=n,Ct.uFade.value=1-Math.min(1,Math.max(0,(n-O.end-Nt)/qt)),P.litho=wo(P.litho,P.lithoTarget,e*2.2),ct.uLitho.value=P.litho,P.tween){let o=P.tween;o.k=Math.min(1,o.k+e/o.dur);let a=go(o.k);for(let r of["az","el","zoom"])at[r]=o.from[r]+(o.to[r]-o.from[r])*a;o.k>=1&&(P.tween=null),Dt()}D.setRenderTarget(Fe),D.setClearColor(0,1),D.clear(),D.render(Se,Ot),D.setRenderTarget(null),D.setClearColor(3814188,1),D.clear(),D.render(Rt,et),requestAnimationFrame(Ve)}Ee();requestAnimationFrame(Ve);window.__page={state:P,view:at,updateCamera:Dt,setRevealed:jt,setPlaying:Ie,shared:ct,tl:O,PERIOD:Te,solveMotion:Ce,fp:Re,drawing:Wt};})();
