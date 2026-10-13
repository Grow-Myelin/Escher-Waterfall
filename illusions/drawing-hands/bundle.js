(()=>{var tn=Object.create;var Zt=Object.defineProperty;var en=Object.getOwnPropertyDescriptor;var nn=Object.getOwnPropertyNames;var on=Object.getPrototypeOf,an=Object.prototype.hasOwnProperty;var sn=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(a){throw e=0,a}};var rn=(t,e,a,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of nn(e))!an.call(t,o)&&o!==a&&Zt(t,o,{get:()=>e[o],enumerable:!(n=en(e,o))||n.enumerable});return t};var cn=(t,e,a)=>(a=t!=null?tn(on(t)):{},rn(e||!t||!t.__esModule?Zt(a,"default",{value:t,enumerable:!0}):a,t));var Jt=sn((In,Qt)=>{Qt.exports=window.THREE});var i=cn(Jt(),1);var V=(t,e,a)=>[t,e,a],G=(t,e)=>[t[0]+e[0],t[1]+e[1],t[2]+e[2]],Y=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],q=(t,e)=>[t[0]*e,t[1]*e,t[2]*e],Rt=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],ee=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Ht=t=>Math.hypot(t[0],t[1],t[2]),O=t=>q(t,1/(Ht(t)||1)),pt=(t,e)=>O(Y(t,q(e,Rt(t,e)))),dt={roll:.36,pitch:.17,dev:.5,ext:-.42},ne=V(7.2,3.4,1.2),Pt=V(10.3,3.85,-2.9),Et=O(Y(Pt,ne)),U={r:.37,tipLen:.35,coneLen:2.1,back:10.5},ln=4,fn=G(Pt,q(Et,ln));function At(t,e,a){let n=Math.max(a-Math.abs(t-e),0)/a;return Math.min(t,e)-n*n*a*.25}function hn(t,e,a,n){let o=Y(e,t),l=Rt(o,o),r=a-n,s=l-r*r,v=1/l;return{a:t,b:e,r1:a,r2:n,ba:o,l2:l,rr:r,a2:s,il2:v,k:Math.sign(r)*r*r}}function bt(t,e,a,n){let o=t-n.a[0],l=e-n.a[1],r=a-n.a[2],s=n.ba[0],v=n.ba[1],g=n.ba[2],d=o*s+l*v+r*g,h=d-n.l2,u=o*n.l2-s*d,w=l*n.l2-v*d,x=r*n.l2-g*d,p=u*u+w*w+x*x,R=d*d*n.l2,f=h*h*n.l2,c=n.k*p;return Math.sign(h)*n.a2*f>c?Math.sqrt(p+f)*n.il2-n.r2:Math.sign(d)*n.a2*R<c?Math.sqrt(p+R)*n.il2-n.r1:(Math.sqrt(p*n.a2*n.il2)+d*n.rr)*n.il2-n.r1}function yt(t,e,a){return{c:t,r:e,m:a}}function un(t,e,a,n){let o=t-n.c[0],l=e-n.c[1],r=a-n.c[2];if(n.m){let p=n.m,R=p[0]*o+p[1]*l+p[2]*r,f=p[3]*o+p[4]*l+p[5]*r,c=p[6]*o+p[7]*l+p[8]*r;o=R,l=f,r=c}let s=o/n.r[0],v=l/n.r[1],g=r/n.r[2],d=s/n.r[0],h=v/n.r[1],u=g/n.r[2],w=Math.sqrt(s*s+v*v+g*g),x=Math.sqrt(d*d+h*h+u*u);return x>1e-9?w*(w-1)/x:-Math.min(n.r[0],n.r[1],n.r[2])}function _t(t,e,a,n){let o=[0,0,-1],l=[t],r=0,s=t;for(let v=0;v<a.length;v++){r+=n[v];let g=G(q(e,Math.cos(r)),q(o,Math.sin(r)));s=G(s,q(g,a[v])),l.push(s)}return l}function te(t,e,a,n,o=0){let l=Y(a,t),r=O([l[0],l[1],0]),s=Math.hypot(l[0],l[1]),v=-l[2],g=(x,p)=>{let R=[x,x+p,x+p+n*p],f=0,c=0;for(let m=0;m<3;m++)f+=e[m]*Math.cos(R[m]),c+=e[m]*Math.sin(R[m]);return[f,c]},d=[0,0],h=1e9;for(let x=-.5;x<=1.7;x+=.02)for(let p=0;p<=2.1;p+=.02){let[R,f]=g(x,p),c=(R-s)**2+(f-v)**2+.002*p*p;c<h&&(h=c,d=[x,p])}let u=[d[0],d[1],n*d[1]],w=O(G(r,[-r[1]*o,r[0]*o,0]));return{pts:_t(t,r,e,u),d:w,err:Math.sqrt(h)}}function dn(t,e,a,n,o){let l=Y(e,t),r=Math.min(Ht(l),a+n-.001),s=O(l),v=pt(o,s),g=(a*a+r*r-n*n)/(2*a*r),d=Math.acos(Math.max(-1,Math.min(1,g))),h=G(t,G(q(s,a*Math.cos(d)),q(v,a*Math.sin(d)))),u=G(h,q(O(Y(G(t,q(s,r)),h)),n));return[t,h,u]}function oe(){let t={palm:[],fingers:[],pads:[]},e=(c,m,y,M)=>hn(c,m,y,M),a={index:V(8.4,2.45,.3),middle:V(8.8,.72,.42),ring:V(8.4,-.95,.22),pinky:V(7.7,-2.45,-.12)},n={index:V(1.6,1.25,.45),middle:V(1.4,.3,.55),ring:V(1.5,-.62,.45),pinky:V(1.7,-1.5,.25)},o={index:.84,middle:.86,ring:.8,pinky:.72};for(let c of["index","middle","ring","pinky"])t.palm.push(e(n[c],a[c],.62,o[c]));t.pads.push(yt(V(4.7,0,-.2),[3.7,3,.7])),t.pads.push(yt(V(5.4,3.05,-.25),[2.3,1.05,.8])),t.pads.push(yt(V(3.2,2.15,-.75),[2.4,1.35,1])),t.pads.push(yt(V(4,-2.05,-.6),[2.9,.82,.85])),t.pads.push(yt(V(8,0,-.55),[1.1,2.9,.6])),t.palm.push(e(V(-13.5,0,0),V(-2.5,0,0),1.82,1.74)),t.palm.push(e(V(-2.5,0,0),V(1,0,.1),1.74,1.45));let l=1.5,r=pt([0,0,1],Et),s=O(ee(Et,r)),v=(c,m,y)=>G(G(Pt,q(Et,c)),q(G(q(r,Math.cos(m)),q(s,Math.sin(m))),U.r+y)),g={index:[4,2.35,1.85],middle:[4.45,2.75,1.95],ring:[4.15,2.6,1.85],pinky:[3.3,2,1.65]},d={index:[.84,.76,.68,.56],middle:[.87,.79,.7,.58],ring:[.82,.74,.65,.54],pinky:[.72,.65,.57,.47]},h={};h.index=te(a.index,g.index,v(.25,-.25,.62),.55),h.middle=te(a.middle,g.middle,v(.65,Math.PI*.85,.55),.7),h.ring={pts:_t(a.ring,O([.97,-.1,0]),g.ring,[.9,1.9,.9])},h.pinky={pts:_t(a.pinky,O([.96,-.22,0]),g.pinky,[.95,1.85,.85])};for(let c of["index","middle","ring","pinky"]){let m=h[c].pts,y=d[c],M=[];for(let k=0;k<3;k++)M.push(e(m[k],m[k+1],y[k],y[k+1]));let E=O(Y(m[1],m[0])),b=O(Y(m[2],m[1])),P=O(G(pt([0,0,1],E),pt([0,0,1],b))),C=G(m[1],q(P,y[1]*.42));M.push(e(C,G(C,q(b,.01)),y[1]*.62,y[1]*.6)),t.fingers.push({name:c,segs:M,pts:m,rad:y})}let u=V(1.7,2.1,-.55),w=V(5.6,4.35,-1.15),x=v(-.05,Math.PI*.42,.6),p=dn(w,x,3,2.55,O([-.2,.55,.8])),R={name:"thumb",segs:[e(u,w,1.25,1.02),e(p[0],p[1],1.02,.9),e(p[1],p[2],.9,.7)],pts:[u,...p],rad:[1.25,1.02,.9,.7]};t.fingers.push(R);for(let c of t.fingers){let m=[1e9,1e9,1e9],y=[-1e9,-1e9,-1e9];for(let M of c.segs)for(let E of[M.a,M.b])for(let b=0;b<3;b++)m[b]=Math.min(m[b],E[b]-1.4),y[b]=Math.max(y[b],E[b]+1.4);c.lo=m,c.hi=y}function f(c,m,y){let M=1e9;for(let b=0;b<t.palm.length;b++){let P=t.palm[b],C=b>=4?bt(c,m/l,y,P)*1.2:bt(c,m,y,P);M=b===0?C:At(M,C,b>=4?1.8:.9)}for(let b of t.pads)M=At(M,un(c,m,y,b),.9);let E=M;for(let b of t.fingers){let P=Math.max(b.lo[0]-c,0,c-b.hi[0]),C=Math.max(b.lo[1]-m,0,m-b.hi[1]),k=Math.max(b.lo[2]-y,0,y-b.hi[2]);if(P*P+C*C+k*k>(M+1)*(M+1)&&M>0)continue;let A=bt(c,m,y,b.segs[0]);for(let H=1;H<b.segs.length;H++)A=At(A,bt(c,m,y,b.segs[H]),.22);M=Math.min(M,At(E,A,b.name==="thumb"?.8:.3))}return M}return{sdf:f,prims:t,fingers:h,thumb:R,MCP:a,pen:{W:ne,C:Pt,D:Et,tip:fn},n1:r,n2:s,ik:{index:h.index.err,middle:h.middle.err}}}function ae(t,e,a,n){let o=Math.ceil((a[0]-e[0])/n)+1,l=Math.ceil((a[1]-e[1])/n)+1,r=Math.ceil((a[2]-e[2])/n)+1,s=n*4,v=Math.ceil((a[0]-e[0])/s)+2,g=Math.ceil((a[1]-e[1])/s)+2,d=Math.ceil((a[2]-e[2])/s)+2,h=new Float32Array(v*g*d);for(let H=0;H<d;H++)for(let T=0;T<g;T++)for(let S=0;S<v;S++)h[S+v*(T+g*H)]=t(e[0]+S*s,e[1]+T*s,e[2]+H*s);let u=s*.65,w=new Float32Array(o*l*r),x=v*g;for(let H=0;H<r;H++){let T=e[2]+H*n,S=H*n/s,W=Math.floor(S),z=S-W;for(let I=0;I<l;I++){let L=e[1]+I*n,N=I*n/s,gt=Math.floor(N),tt=N-gt,j=v*gt+x*W,et=j+v,xt=j+x,ut=et+x,Mt=o*(I+l*H);for(let rt=0;rt<o;rt++,Mt++){let nt=rt*n/s,K=Math.floor(nt),it=nt-K,Ye=h[j+K]*(1-it)+h[j+K+1]*it,Ze=h[et+K]*(1-it)+h[et+K+1]*it,Qe=h[xt+K]*(1-it)+h[xt+K+1]*it,Je=h[ut+K]*(1-it)+h[ut+K+1]*it,Vt=(Ye*(1-tt)+Ze*tt)*(1-z)+(Qe*(1-tt)+Je*tt)*z;w[Mt]=Vt>u||Vt<-u?Vt:t(e[0]+rt*n,L,T)}}}let p=o-1,R=l-1,f=r-1,c=new Int32Array(p*R*f).fill(-1),m=[],y=o*l,M=[0,1,o,o+1,y,y+1,y+o,y+o+1],E=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],b=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],P=new Float64Array(8);for(let H=0;H<f;H++)for(let T=0;T<R;T++){let S=o*(T+l*H);for(let W=0;W<p;W++){let z=S+W,I=0;for(let j=0;j<8;j++){let et=w[z+M[j]];P[j]=et,et<0&&I++}if(I===0||I===8)continue;let L=0,N=0,gt=0,tt=0;for(let j=0;j<12;j++){let et=b[j][0],xt=b[j][1],ut=P[et],Mt=P[xt];if(ut<0==Mt<0)continue;let rt=ut/(ut-Mt),nt=E[et],K=E[xt];L+=nt[0]+(K[0]-nt[0])*rt,N+=nt[1]+(K[1]-nt[1])*rt,gt+=nt[2]+(K[2]-nt[2])*rt,tt++}c[W+p*(T+R*H)]=m.length/3,m.push(e[0]+(W+L/tt)*n,e[1]+(T+N/tt)*n,e[2]+(H+gt/tt)*n)}}let C=(H,T,S)=>w[H+o*(T+l*S)],k=[],A=(H,T,S)=>c[H+p*(T+R*S)];for(let H=1;H<r-1;H++)for(let T=1;T<l-1;T++)for(let S=1;S<o-1;S++){let W=C(S,T,H)<0;if(S<o-1&&W!==C(S+1,T,H)<0){let z=A(S,T-1,H-1),I=A(S,T,H-1),L=A(S,T,H),N=A(S,T-1,H);W?k.push(z,I,L,z,L,N):k.push(z,L,I,z,N,L)}if(T<l-1&&W!==C(S,T+1,H)<0){let z=A(S-1,T,H-1),I=A(S,T,H-1),L=A(S,T,H),N=A(S-1,T,H);W?k.push(z,L,I,z,N,L):k.push(z,I,L,z,L,N)}if(H<r-1&&W!==C(S,T,H+1)<0){let z=A(S-1,T-1,H),I=A(S,T-1,H),L=A(S,T,H),N=A(S-1,T,H);W?k.push(z,I,L,z,L,N):k.push(z,L,I,z,N,L)}}return{positions:new Float32Array(m),index:new Uint32Array(k)}}var se=(t,e,a)=>{let n=Math.min(1,Math.max(0,(a-t)/(e-t)));return n*n*(3-2*n)};function re(t,e){let a=Math.cos(dt.roll),n=Math.sin(dt.roll),o=(h,u)=>{let w=Math.cos(u),x=Math.sin(u),p=h[1]*a-h[2]*n,R=h[1]*n+h[2]*a;return[h[0]*w+R*x,p,-h[0]*x+R*w]},l=(h,u)=>{let w=se(-2.6,.9,u),x=dt.ext*(1-w),p=Math.cos(x),R=Math.sin(x),f=h[0]*p+h[2]*R,c=-h[0]*R+h[2]*p,m=h[1],y=dt.dev*w,M=Math.cos(y),E=Math.sin(y);return[f*M-m*E,f*E+m*M,c]},r=dt.pitch;if(e){let h=[];for(let p=0;p<e.length;p+=9)e[p]>1.5&&h.push([e[p],e[p+1],e[p+2]]);let u=p=>{let R=1e9;for(let f of h)R=Math.min(R,o(f,p)[2]);return R-o(t.pen.tip,p)[2]},w=-.3,x=.9;for(let p=0;p<30;p++){let R=(w+x)/2;u(R)>0?x=R:w=R}r=(w+x)/2}let v=-o(t.pen.tip,r)[2];return{rot:h=>{let u=o(h,r),w=dt.dev,x=Math.cos(w),p=Math.sin(w);return[u[0]*x-u[1]*p,u[0]*p+u[1]*x,u[2]]},pitch:r,lift:v,apply:h=>{let u=l(o(h,r),h[0]);return[u[0],u[1],u[2]+v]}}}function ie(t,e,a,n){let o=e.length/3,l=new Float32Array(o).fill(9),r=new Float32Array(o).fill(1),s=new Float32Array(o),v=t.prims.fingers.filter(u=>["index","middle","thumb"].includes(u.name)),g=t.prims.fingers.filter(u=>!["index","middle","thumb"].includes(u.name)),d=(u,w)=>{let x=1e9;for(let p of w.segs)x=Math.min(x,bt(u[0],u[1],u[2],p));return x},h=[];for(let u of t.prims.fingers){let w=u.pts,x=u.rad,p=w[w.length-2],R=w[w.length-1],f=O(Y(R,p)),c;u.name==="thumb"?c=pt(O([-.15,.6,.8]),f):c=pt([0,0,1],f);let m=ee(f,c),y=Ht(Y(R,p));h.push({j3:p,u:f,dors:c,side:m,L:y,r:x[x.length-2],rt:x[x.length-1]})}for(let u=0;u<o;u++){let w=[e[3*u],e[3*u+1],e[3*u+2]],x=9;for(let E of h){let b=Y(w,E.j3),P=Rt(b,E.u);if(P<-.2||P>E.L+E.rt+.3)continue;let C=Y(b,q(E.u,P)),k=Ht(C),A=E.r+(E.rt-E.r)*Math.min(1,Math.max(0,P/E.L));if(Math.abs(k-A)>.35)continue;let H=Math.atan2(Rt(C,E.side),Rt(C,E.dors)),T=P-(.35*E.L+(E.L+.35*E.rt))/2,S=(E.L+.35*E.rt-.35*E.L)/2,W=H*A,z=.62*A,I=Math.abs(T)-S+.18,L=Math.abs(W)-z+.18,N=Math.min(Math.max(I,L),0)+Math.hypot(Math.max(I,0),Math.max(L,0))-.18;N<x&&(x=N)}l[u]=x;let p=1e9;for(let E of v)p=Math.min(p,d(w,E));let R=1e9;for(let E of g)R=Math.min(R,d(w,E));if(p<.6&&p<R){let E=Ht(Y(w,t.pen.C));s[u]=1-se(1.2,4.6,E)}let f=a[3*u],c=a[3*u+1],m=a[3*u+2],y=0,M=1;for(let E=1;E<=4;E++){let b=.35*E,P=n(w[0]+f*b,w[1]+c*b,w[2]+m*b);y+=M*Math.max(0,b-P),M*=.55}r[u]=Math.max(0,1-y*.55)}return{nail:l,ao:r,fing:s}}function ce(t,e,a,n){let o=Math.round((a-e)/n)+1,l=new Float32Array(o).fill(1e9),r=new Float32Array(o).fill(-1e9);for(let s=0;s<t.length;s+=3){let v=Math.round((t[s]-e)/n);v<0||v>=o||(l[v]=Math.min(l[v],t[s+1]),r[v]=Math.max(r[v],t[s+1]))}return{x0:e,step:n,lo:l,hi:r,at(s){let v=Math.min(o-1.001,Math.max(0,(s-e)/n)),g=Math.floor(v),d=v-g;return[l[g]*(1-d)+l[g+1]*d,r[g]*(1-d)+r[g+1]*d]}}}function pn(t){let e=t>>>0||1;return()=>(e=e*1664525+1013904223>>>0)/4294967296}function mn(t){let e=0;for(let a=1;a<t.length;a++)e+=Math.hypot(t[a][0]-t[a-1][0],t[a][1]-t[a-1][1]);return e}function _(t,e,a,n){let o=[];for(let d=0;d<=64;d++)o.push(t(d/64));let l=mn(o),r=Math.max(2,Math.ceil(l/e)),s=n()*6.28,v=n()*6.28,g=[];for(let d=0;d<=r;d++){let h=d/r,u=t(h),w=t(Math.min(1,h+.001)),x=t(Math.max(0,h-.001)),p=w[0]-x[0],R=w[1]-x[1],f=Math.hypot(p,R)||1;p/=f,R/=f;let c=a*(Math.sin(h*5.1+s)*.6+Math.sin(h*13.7+v)*.4);g.push([u[0]-R*c,u[1]+p*c])}return g}var B=(t,e,a)=>t+(e-t)*a,ot=(t,e)=>a=>[B(t[0],e[0],a),B(t[1],e[1],a)],Bt=(t,e,a,n,o=-Math.PI/2,l=Math.PI/2)=>r=>{let s=B(o,l,r);return[t[0]+n*e*Math.cos(s),t[1]+a*Math.sin(s)]};function le(t){let e=pn(11),a=[],n=(f,c={})=>a.push({pts:f,w:c.w??.075,dark:c.dark??1,speed:(c.speed??16)*1.3,kind:c.kind??"line"}),o=(f,c={})=>n(f,{w:.042,dark:.75,speed:32,kind:"hatch",...c}),l=-4.1,r=-5.4,s=-7.7,v=-9.2,g=f=>t.at(f),d=Math.max(-g(r)[0],g(r)[1])+.5,h=.5,u=(f,c)=>c*(d+.18*Math.sin(Math.PI*(r-f)/(r-s))+.1*(r-f)/(r-s)),w=(f,c)=>c*(d+.1+.75*Math.sin(.5*Math.PI*Math.min(1,(s-f)/(s-v))));n(_(ot([l,g(l)[1]],[r+.2,g(r)[1]-.02]),.12,.02,e)),n(_(ot([l,g(l)[0]],[r+.2,g(r)[0]+.02]),.12,.02,e)),n(_(Bt([r,0],h,d,1,-Math.PI/2,Math.PI/2),.12,.018,e));let x=g(r),p=Math.asin(Math.max(-1,x[0]/d)),R=Math.asin(Math.min(1,x[1]/d));n(_(f=>{let c=B(Math.PI*.5,Math.PI-R,f);return[r+h*Math.cos(c),d*Math.sin(c)]},.1,.01,e),{w:.06,dark:.85}),n(_(f=>{let c=B(-Math.PI*.5,-Math.PI-p,f);return[r+h*Math.cos(c),d*Math.sin(c)]},.1,.01,e),{w:.06,dark:.85}),n(_(f=>{let c=B(r,s,f);return[c,u(c,1)]},.14,.02,e)),n(_(f=>{let c=B(r,s,f);return[c,u(c,-1)]},.14,.02,e)),n(_(Bt([s,0],h*.85,u(s,1),1),.14,.018,e),{w:.065}),n(_(Bt([r-.4,0],h*.85,d-.1,1,-Math.PI*.47,Math.PI*.47),.12,.01,e),{w:.035,dark:.6});for(let[f,c]of[[-6.2,d-.68],[-7,d-.64]])n(_(m=>[f+.2*Math.cos(m*6.7),c+.2*Math.sin(m*6.7)],.05,.004,e),{w:.045,speed:8});n(_(ot([-6.25,-d+.55],[-6.95,-d+.52]),.08,.004,e),{w:.04,dark:.8}),n(_(f=>{let c=B(s-.05,v,f);return[c,w(c,1)]},.14,.03,e),{w:.06,dark:.85}),n(_(f=>{let c=B(s-.05,v,f);return[c,w(c,-1)]},.14,.03,e),{w:.06,dark:.85}),n(_(f=>[B(s-.5,s-1.1,f),B(-d+.4,.5,f)+.25*Math.sin(f*3.1)],.12,.02,e),{w:.05,dark:.7}),n(_(f=>[B(s-.9,v+.15,f),B(.9,d+.6,f)-.2*Math.sin(f*2.6)],.12,.02,e),{w:.05,dark:.65});for(let f of[1,-1]){let c=f>0?x[1]:x[0],m=f*d;for(let y=0;y<7;y++){let M=(y+.5)/7,E=B(c,m,M),b=r+h*Math.sqrt(Math.max(0,1-(E/d)**2));o(_(ot([b-.04,E],[r-.3,E+f*.1]),.08,.004,e),{dark:.9})}}for(let f=0;f<7;f++){let c=B(l-.15,r+.4,f/6),m=g(c)[0]+.07;o(_(ot([c+.2,m],[c-.1,m+.75-.3*(f%2)]),.08,.004,e))}for(let f=0;f<6;f++){let c=-d+.14+f*.19;o(_(ot([r-.6-.05*f,c],[s+.2+.3*f,c-.04]),.12,.006,e),{dark:.7})}for(let f=0;f<5;f++){let c=s+.35+f*.33;o(_(ot([c,-d+.06],[c+.3,-d+.85-.1*f]),.08,.004,e),{dark:.6})}for(let f=0;f<6;f++){let c=s-.35-f*.22,m=w(c,-1);o(_(ot([c,m+.1],[c-.25,m+.9-.08*f]),.08,.004,e),{dark:.55})}for(let f=0;f<4;f++){let c=s-.7-f*.2;o(_(ot([c,.95+.05*f],[c-.2,1.7+.1*f]),.08,.004,e),{dark:.5})}return{strokes:a,XW:l,XC:r,XB:s,rimY:d}}function fe(t,e={}){let a=e.travel??50,n=[],o=e.start??.4,l=null;for(let r=0;r<t.length;r++){let s=t[r],v=s.pts[0];if(l){let w=.09+Math.hypot(v[0]-l[0],v[1]-l[1])/a;n.push({type:"move",from:l,to:v,t0:o,t1:o+w}),o+=w}let g=[0];for(let u=1;u<s.pts.length;u++)g.push(g[u-1]+Math.hypot(s.pts[u][0]-s.pts[u-1][0],s.pts[u][1]-s.pts[u-1][1]));let d=g[g.length-1],h=d/s.speed+.04;s.cum=g,s.len=d,s.t0=o,s.t1=o+h,n.push({type:"draw",stroke:s,t0:o,t1:o+h}),o+=h,l=s.pts[s.pts.length-1]}return{events:n,end:o,first:t[0].pts[0],last:l}}var vn=t=>t*t*(3-2*t);function he(t,e){let a=t.events;if(e<=a[0].t0)return{p:t.first,lift:.5,drawing:!1};for(let n of a){if(e>n.t1)continue;let o=(e-n.t0)/(n.t1-n.t0);if(n.type==="move"){let u=vn(o);return{p:[B(n.from[0],n.to[0],u),B(n.from[1],n.to[1],u)],lift:.5*Math.sin(Math.PI*o)**.6,drawing:!1}}let l=n.stroke,r=Math.min(1,o*1.04)*l.len,s=1;for(;s<l.cum.length-1&&l.cum[s]<r;)s++;let v=l.pts[s-1],g=l.pts[s],d=l.cum[s]-l.cum[s-1]||1,h=Math.min(1,Math.max(0,(r-l.cum[s-1])/d));return{p:[B(v[0],g[0],h),B(v[1],g[1],h)],lift:0,drawing:!0}}return{p:t.last,lift:0,drawing:!1}}function ue(t){let e=[],a=[],n=[],o=[],l=[],r=[];for(let s of t){let v=e.length/3,g=s.pts.length;for(let d=0;d<g;d++){let h=s.pts[d],u=s.pts[Math.min(g-1,d+1)],w=s.pts[Math.max(0,d-1)],x=u[0]-w[0],p=u[1]-w[1],R=Math.hypot(x,p)||1;x/=R,p/=R;let f=s.cum[d]/(s.len||1),c=Math.min(1,f*6+.25)*Math.min(1,(1-f)*4+.15),m=s.w*(.55+.45*c)*.5+.012,y=s.t0+(s.t1-s.t0-.04)*f/1.04;for(let M of[-1,1])e.push(h[0]-p*m*M,h[1]+x*m*M,.004),a.push(M),n.push(y),o.push(s.cum[d]),l.push(s.dark*(.6+.4*c));if(d<g-1){let M=v+2*d;r.push(M,M+1,M+3,M,M+3,M+2)}}}return{pos:e,side:a,time:n,arcl:o,weight:l,index:r}}var Ft=`
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
`,Wt=`
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
`,de=`
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
${Wt}
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
`,pe=`
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
${Ft}

// hatching lines along coordinate s (in line spacings); w = half-width fraction.
// Families that are badly resolved on screen fade out.
float hfam(float s, float w, out float ok) {
  float fw = fwidth(s);
  ok = smoothstep(0.05, 0.12, fw) * (1.0 - smoothstep(0.5, 0.8, fw));
  float d = abs(fract(s) - 0.5);       // distance from the line at the middle of each period
  float aa = fw * 0.75 + 1e-4;
  float line = (1.0 - smoothstep(w - aa, w + aa, d)) * smoothstep(0.0, aa, w);
  return mix(2.0 * w, line, smoothstep(0.55, 0.3, fw));
}

void main() {
  // Where the arm sinks into the paper the solid thins out into the paper
  // like crayon, in a fine stipple.
  float solidity = smoothstep(0.06, 0.42, vF);
  float st = hash12(floor(gl_FragCoord.xy)) * 0.7 + hash12(floor(gl_FragCoord.xy * 0.5) + 7.0) * 0.3;
  if (vMat < 0.5 && st > solidity * 1.02) discard;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLight);
  float wrap = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
  float diff = clamp(ndl, 0.0, 1.0);
  float ao = mix(1.0, vAO, 0.6);
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

  float light = (0.1 + 0.9 * mix(wrap * wrap, diff, 0.72)) * ao + 0.05 * rim;
  float spec = pow(max(dot(n, h), 0.0), 26.0) * gloss;
  vec3 colour = alb * (0.22 + 0.86 * light) + spec * vec3(1.0, 0.97, 0.9);
  colour *= 1.0 - 0.45 * nailEdge;

  // ---- lithograph: crayon tone that keeps the paper as its highlight,
  // with hatching that goes round the form in the shadows
  float t = clamp(light * lum(alb) / 0.79 + spec * 0.7, 0.0, 1.0);
  float tv = smoothstep(0.0, 0.86, t);
  float dk = 1.0 - t;
  vec3 hp = vRest;
  float ok1, ok2, ok3;
  float s1 = dot(hp, normalize(vec3(0.95, 0.2, 0.3))) / 0.11;
  float s2 = dot(hp, normalize(vec3(-0.3, 0.9, 0.35))) / 0.12;
  float s3 = (gl_FragCoord.x * 0.6 - gl_FragCoord.y * 0.8) / 3.6;
  float w1 = clamp(dk * 0.62 - 0.11, 0.0, 0.4);
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
  gl_FragColor = vec4(col, 1.0);
}
`,me=`
uniform float uWidth;   // px
uniform vec2 uRes;      // px
varying float vF;
${Wt}
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
`,ve=`
uniform vec3 uInkC;
varying float vF;
${Ft}
void main() {
  // the outline thins out with the form, in the same stipple
  float solidity = smoothstep(0.06, 0.42, vF);
  float st = hash12(floor(gl_FragCoord.xy)) * 0.7 + hash12(floor(gl_FragCoord.xy * 0.5) + 7.0) * 0.3;
  if (st > solidity * 1.02) discard;
  gl_FragColor = vec4(uInkC, 1.0);
}
`,we=`
uniform vec3 uLight;
uniform float uMode;    // 0: shCast along the light, 1: straight down
varying float vH;
varying float vF;
${Wt}
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
`,ge=`
uniform float uMode;
varying float vH;
varying float vF;
void main() {
  if (vF < 0.5) discard;
  float shCast = (0.8 - 0.5 * smoothstep(0.0, 9.0, vH)) * smoothstep(0.5, 0.9, vF);
  float contact = (1.0 - smoothstep(0.0, 1.1, vH)) * smoothstep(0.5, 0.9, vF);
  gl_FragColor = uMode < 0.5 ? vec4(shCast, 0.0, 0.0, 1.0) : vec4(0.0, contact, 0.0, 1.0);
}
`,xe=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Me=`
uniform sampler2D uShadow;
uniform vec4 uShadowRect;   // x0, y0, width, height (world)
uniform vec2 uShadowTexel;
uniform vec3 uPaper;
uniform vec2 uSheet;        // half size of the sheet
varying vec3 vW;
${Ft}
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
`,ye=`
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
`,Ee=`
uniform float uNow;
uniform float uFade;
uniform vec3 uGraphite;
varying float vSide;
varying float vTime;
varying float vArc;
varying float vWeight;
varying vec2 vWxy;
${Ft}
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
`;function be(t,e){let a=document.getElementById("frame"),n=()=>{let l=(window.innerWidth<640?10:28)+13,r=document.getElementById("masthead"),s=document.getElementById("controls"),v=(r?r.offsetHeight:0)+6+13,g=(s?s.offsetHeight:0)+8+13,d=window.innerWidth-l*2,h=window.innerHeight-v-g,u=h,w=u*t;w>d&&(w=d,u=w/t),w=Math.max(160,Math.floor(w)),u=Math.max(120,Math.floor(u)),a.style.width=`${w}px`,a.style.height=`${u}px`,a.style.top=`${v+Math.max(0,(h-u)/2)}px`,e?.(w,u)};return window.addEventListener("resize",n),n(),n}function Re(){let t=document.getElementById("panel"),e=document.getElementById("btn-info"),a=document.getElementById("panel-close");if(!t)return;let n=o=>{o?t.removeAttribute("hidden"):t.setAttribute("hidden",""),e?.setAttribute("aria-expanded",String(o))};e?.addEventListener("click",()=>n(t.hasAttribute("hidden"))),a?.addEventListener("click",()=>n(!1)),window.addEventListener("keydown",o=>{o.key==="Escape"&&n(!1)})}function He(t,e,a){let n=o=>{for(let[l,r]of t)l.setAttribute("aria-pressed",String(r===o));e(o)};for(let[o,l]of t)o.addEventListener("click",()=>n(l));return a!==void 0&&n(a),n}function Te(t){window.addEventListener("keydown",e=>{if(e.target.closest?.("input, textarea, select"))return;let a=t[e.key.length===1?e.key.toLowerCase():e.key];a&&(e.preventDefault(),a(e))})}function Se(t,e=!0){let a=document.getElementById("btn-play"),n=o=>{e=o,a&&(a.setAttribute("aria-pressed",String(!o)),a.querySelector("span").textContent=o?"Pause":"Play",a.querySelector(".icon").textContent=o?"\u275A\u275A":"\u25B6"),t(o)};return a?.addEventListener("click",()=>n(!e)),n(e&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),n}function ke(t,e){let a=document.getElementById("badge");a&&e&&(a.textContent=e),document.body.classList.toggle("badge-on",!!t)}function Ae(){document.body.classList.add("ready")}var gn=performance.now(),ht=oe(),at=ae(ht.sdf,[-13,-4.6,-6.6],[14,7,3.6],.15),kt=re(ht,at.positions);function xn(){let t=new i.BufferGeometry;t.setAttribute("position",new i.BufferAttribute(at.positions,3)),t.setIndex(new i.BufferAttribute(at.index,1)),t.computeVertexNormals();let e=t.attributes.normal.array,a=ie(ht,at.positions,e,ht.sdf),n=at.positions.length/3,o=new Float32Array(n*3),l=new Float32Array(n*3);for(let s=0;s<n;s++){let v=kt.apply([at.positions[3*s],at.positions[3*s+1],at.positions[3*s+2]]),g=kt.rot([e[3*s],e[3*s+1],e[3*s+2]]);o.set(v,3*s),l.set(g,3*s)}let r=new i.BufferGeometry;return r.setAttribute("position",new i.BufferAttribute(o,3)),r.setAttribute("normal",new i.BufferAttribute(l,3)),r.setAttribute("aAO",new i.BufferAttribute(a.ao,1)),r.setAttribute("aNail",new i.BufferAttribute(a.nail,1)),r.setAttribute("aMat",new i.BufferAttribute(new Float32Array(n),1)),r.setAttribute("aFing",new i.BufferAttribute(a.fing,1)),r.setIndex(new i.BufferAttribute(at.index,1)),r}function Mn(t,e){let o=U.r*Math.cos(Math.PI/6),l=m=>o/Math.cos((m%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6),r=m=>m<U.tipLen?.012+(.09-.012)*(m/U.tipLen):.09+(U.r-.09)*Math.min(1,(m-U.tipLen)/U.coneLen),s=new i.Vector3(...e).normalize(),v=new i.Vector3(0,0,1).cross(s).normalize(),g=new i.Vector3().crossVectors(s,v).normalize(),d=[0,.05,.12,.2,.28,U.tipLen,.45,.6,.8,1,1.2,1.4,1.6,1.8,1.95,2.1,2.25,2.4,2.6,3.2,5,7,9,10.5],h=[],u=[],w=[],x=[];for(let m of d)for(let y=0;y<=36;y++){let M=y/36*Math.PI*2,E=l(M),b=r(m),P=Math.min(E,b),C=new i.Vector3(...t).addScaledVector(s,m).addScaledVector(v,Math.cos(M)*P).addScaledVector(g,Math.sin(M)*P),k;if(b<E-1e-4){let A=m<U.tipLen?.078/U.tipLen:(U.r-.09)/U.coneLen;k=new i.Vector3().addScaledVector(v,Math.cos(M)).addScaledVector(g,Math.sin(M)).addScaledVector(s,-A).normalize()}else{let A=Math.floor((M+Math.PI/6)/(Math.PI/3))*(Math.PI/3);k=new i.Vector3().addScaledVector(v,Math.cos(A)).addScaledVector(g,Math.sin(A))}h.push(C.x,C.y,C.z),u.push(k.x,k.y,k.z),w.push(m<U.tipLen+.02?3:b<E-.01?2:1)}let p=37;for(let m=0;m<d.length-1;m++)for(let y=0;y<36;y++){let M=m*p+y,E=M+1,b=M+p,P=b+1;x.push(M,E,b,E,P,b)}let R=h.length/3,f=new i.Vector3(...t).addScaledVector(s,10.5);h.push(f.x,f.y,f.z),u.push(s.x,s.y,s.z),w.push(2);for(let m=0;m<36;m++){let y=(d.length-1)*p+m;x.push(R,y,y+1)}let c=new i.BufferGeometry;return c.setAttribute("position",new i.Float32BufferAttribute(h,3)),c.setAttribute("normal",new i.Float32BufferAttribute(u,3)),c.setAttribute("aMat",new i.Float32BufferAttribute(w,1)),c.setAttribute("aAO",new i.Float32BufferAttribute(new Array(h.length/3).fill(1),1)),c.setAttribute("aNail",new i.Float32BufferAttribute(new Array(h.length/3).fill(9),1)),c.setAttribute("aFing",new i.Float32BufferAttribute(new Array(h.length/3).fill(1),1)),c.setIndex(x),c}var Ct=xn(),Q=kt.apply(ht.pen.tip),Nt=Mn(Q,kt.rot(ht.pen.D).map(t=>-t)),Ie=ce(Ct.attributes.position.array,-11,0,.2),yn=performance.now()-gn,It=le(Ie),Pe=(()=>{let t=0,e=0,a=0;for(let n of It.strokes)for(let o of n.pts)t+=o[0],e+=o[1],a++;return[t/a-.9,e/a+1.3]})(),qt=-Math.PI/2-.66,lt=new i.Matrix4;{let t=Math.cos(qt),e=Math.sin(qt),a=Q[0]+Pe[0],n=Q[1]+Pe[1],o=-(t*a-e*n)/2,l=-(e*a+t*n)/2;lt.makeRotationZ(qt).setPosition(o,l,0)}var vt=new i.Matrix4().makeRotationZ(Math.PI).multiply(lt),En=lt.clone().invert(),st=new i.Vector2(-2.6,0),bn=new i.Vector2(-5,-.3),D=fe(It.strokes),Ut=1.8,$t=1.3,Ve=.9,_e=D.end+Ut+$t+Ve,Rn=document.getElementById("scene"),X=new i.WebGLRenderer({canvas:Rn,antialias:!0,powerPreference:"high-performance"});X.setPixelRatio(Math.min(window.devicePixelRatio||1,2));X.setClearColor(3814188,1);X.autoClear=!1;var Hn=new i.Vector3(.93,.905,.845),Tn=new i.Vector3(.11,.1,.09),Sn=new i.Vector3(-.62,.55,.56).normalize(),Ot=new i.Vector3(...kt.apply(ht.pen.W)),kn=new i.Vector3(...Q),ct={uPenW:{value:Ot},uPenR:{value:new i.Matrix3},uPenS:{value:new i.Vector3},uMotion:{value:new i.Vector4(0,0,0,0)},uPivot:{value:st},uFlat:{value:bn},uLight:{value:Sn},uView:{value:new i.Vector3(0,0,1)},uLitho:{value:1},uPaper:{value:Hn},uInk:{value:Tn}},wt=new i.Scene,Be=new i.Scene,We=new i.Vector2(1,1);function Ne(t){let e={...ct,uPlace:{value:t}},a=new i.Mesh(Ct,new i.ShaderMaterial({uniforms:e,vertexShader:de,fragmentShader:pe,side:i.DoubleSide})),n=new i.Mesh(Nt,a.material),o=new i.ShaderMaterial({uniforms:{...e,uWidth:{value:1.8},uRes:{value:We},uInkC:{value:new i.Vector3(.12,.1,.09)}},vertexShader:me,fragmentShader:ve,side:i.BackSide}),l=new i.Mesh(Ct,o),r=new i.Mesh(Nt,o);for(let s of[a,n,l,r])s.frustumCulled=!1,wt.add(s);for(let s of[0,1]){let v=new i.ShaderMaterial({uniforms:{...e,uMode:{value:s}},vertexShader:we,fragmentShader:ge,side:i.DoubleSide,depthTest:!1,depthWrite:!1,blending:i.CustomBlending,blendEquation:i.MaxEquation,blendSrc:i.OneFactor,blendDst:i.OneFactor});for(let g of[Ct,Nt]){let d=new i.Mesh(g,v);d.frustumCulled=!1,Be.add(d)}}return{body:a,hull:l}}Ne(lt);Ne(vt);var An=new i.Vector2(15.4,19.6),ft=new i.Vector4(-16,-20,32,40),qe=new i.WebGLRenderTarget(640,800,{depthBuffer:!1}),Xt=new i.OrthographicCamera(ft.x,ft.x+ft.z,ft.y+ft.w,ft.y,-100,100);Xt.position.set(0,0,50);Xt.lookAt(0,0,0);var Oe=new i.Mesh(new i.PlaneGeometry(80,90),new i.ShaderMaterial({uniforms:{uShadow:{value:qe.texture},uShadowRect:{value:ft},uShadowTexel:{value:new i.Vector2(1/640,1/800)},uPaper:ct.uPaper,uSheet:{value:An}},vertexShader:xe,fragmentShader:Me}));Oe.renderOrder=-10;wt.add(Oe);var zt={uNow:{value:0},uFade:{value:1},uGraphite:{value:new i.Vector3(.19,.19,.21)}};{let t=ue(It.strokes),e=new i.BufferGeometry;e.setAttribute("position",new i.Float32BufferAttribute(t.pos,3)),e.setAttribute("aSide",new i.Float32BufferAttribute(t.side,1)),e.setAttribute("aTime",new i.Float32BufferAttribute(t.time,1)),e.setAttribute("aArc",new i.Float32BufferAttribute(t.arcl,1)),e.setAttribute("aWeight",new i.Float32BufferAttribute(t.weight,1)),e.setIndex(t.index);let a=new i.ShaderMaterial({uniforms:zt,vertexShader:ye,fragmentShader:Ee,transparent:!0,depthWrite:!1,side:i.DoubleSide});for(let n of[lt,vt]){let o=new i.Mesh(e,a);o.matrixAutoUpdate=!1,o.matrix.copy(n),o.matrixWorldNeedsUpdate=!0,o.frustumCulled=!1,o.renderOrder=1,wt.add(o)}}var mt=new i.Group,Dt=new i.LineDashedMaterial({color:10631978,dashSize:.55,gapSize:.35,transparent:!0,opacity:0,depthTest:!1}),De=new i.MeshBasicMaterial({color:10631978,transparent:!0,opacity:0,depthTest:!1});{let t=(r,s)=>new i.Vector3(r[0],r[1],r[2]??0).applyMatrix4(s),e=r=>t([4.5,3.5,9.5],r),a=[t(Q,lt).setZ(.3),e(vt),t(Q,vt).setZ(.3),e(lt)],n=new i.CatmullRomCurve3(a,!0,"centripetal"),o=new i.BufferGeometry().setFromPoints(n.getPoints(160)),l=new i.Line(o,Dt);l.computeLineDistances(),mt.add(l);for(let r of[.13,.63]){let s=new i.Mesh(new i.ConeGeometry(.42,1.2,14),De);s.position.copy(n.getPointAt(r)),s.quaternion.setFromUnitVectors(new i.Vector3(0,1,0),n.getTangentAt(r)),mt.add(s)}mt.renderOrder=30,mt.visible=!1,wt.add(mt)}var J=new i.OrthographicCamera(-1,1,1,-1,1,400),Pn=14.6,je={az:-Math.PI/2,el:Math.PI/2,zoom:1},Ge={az:-Math.PI/2+.7,el:.56,zoom:.95},Z={...je,px:0,py:0},jt=30/38;function Kt(){let t=Math.cos(Z.el),e=Math.sin(Z.el),a=new i.Vector3(t*Math.cos(Z.az),t*Math.sin(Z.az),e);J.position.copy(a).multiplyScalar(150);let n=new i.Vector3(0,1,0).lerp(new i.Vector3(0,0,1),Math.min(1,t*1.5)).normalize();J.up.copy(n),J.position.x+=Z.px,J.position.y+=Z.py,J.lookAt(Z.px,Z.py,1.5*t);let o=Pn/Z.zoom;J.left=-o*jt,J.right=o*jt,J.top=o,J.bottom=-o,J.updateProjectionMatrix(),ct.uView.value.copy(a)}be(30/38,(t,e)=>{X.setSize(t,e),jt=t/e,We.set(t*X.getPixelRatio(),e*X.getPixelRatio()),Kt()});Re();var F={t:0,playing:!0,litho:1,lithoTarget:1,revealed:!1,tween:null};He([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],t=>{F.lithoTarget=t},1);var Ue=Se(t=>{F.playing=t});F.playing||(F.t=D.end+.2);var Gt=document.getElementById("btn-reveal");function Yt(t){F.revealed=t,Gt.setAttribute("aria-pressed",String(t)),Gt.querySelector("span").textContent=t?"Back to the print":"Tilt the sheet",F.tween={from:{...Z},to:t?{...Ge}:{...je},k:0,dur:2},ke(t,"From the side: only the hands stand up; the cuffs are flat graphite")}Gt.addEventListener("click",()=>Yt(!F.revealed));Te({" ":()=>Ue(!F.playing),l:()=>document.getElementById(F.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>Yt(!F.revealed)});var Tt=new i.Vector3;function $e(t){if(t<D.end){let o=he(D,t),l=D.events[0].t0;return{p:o.p,lift:t<l?.6*(1-t/l):o.lift}}let e=Math.min(1,Math.max(0,(t-D.end-Ut)/($t+Ve))),a=e*e*(3-2*e);return{p:[D.last[0]+(D.first[0]-D.last[0])*a,D.last[1]+(D.first[1]-D.last[1])*a],lift:.6*Math.min(1,(t-D.end)/.5)}}var Fe=2.3,$={turn:0,slide:0,vTurn:0,vSlide:0,init:!1},Le=new i.Quaternion,Lt=new i.Vector3,St=new i.Vector3,Ce=new i.Matrix4;function Fn(t,e){let a=t-st.x,n=e-st.y,o=Math.hypot(a,n),l=Q[0]-st.x,r=Q[1]-st.y,s=Math.sqrt(Math.max(1,o*o-r*r));return[Math.atan2(n,a)-Math.atan2(r,s),s-l]}function Xe(t,e){let{p:a,lift:n}=$e(t);Tt.set(a[0],a[1],0).applyMatrix4(vt).applyMatrix4(En);let o=Tt.x-Q[0],l=Tt.y-Q[1],r=Math.hypot(o,l),s=r>Fe?(r-Fe)/r:0,[v,g]=Fn(Q[0]+o*s,Q[1]+l*s);if(!$.init||e<=0)$.turn=v,$.slide=g,$.init=!0;else for(let m of["turn","slide"]){let y=m==="turn"?v:g,M=m==="turn"?"vTurn":"vSlide",E=81*(y-$[m])-18*$[M];$[M]+=E*e,$[m]+=$[M]*e}ct.uMotion.value.set($.turn,$.slide,n,0);let d=Math.cos(-$.turn),h=Math.sin(-$.turn),u=Tt.x-st.x,w=Tt.y-st.y,x=st.x+d*u-h*w-$.slide,p=st.y+h*u+d*w;Lt.copy(kn).sub(Ot);let R=Lt.length();Lt.normalize(),St.set(x,p,0).sub(Ot);let f=St.length();St.normalize(),Le.setFromUnitVectors(Lt,St),Ce.makeRotationFromQuaternion(Le),ct.uPenR.value.setFromMatrix4(Ce),ct.uPenS.value.copy(St).multiplyScalar(f-R)}var Ln=(t,e,a)=>t+Math.sign(e-t)*Math.min(Math.abs(e-t),a),Cn=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,ze=performance.now();function Ke(t){let e=Math.min(.05,Math.max(0,(t-ze)/1e3));ze=t,F.playing&&(F.t=(F.t+e)%_e);let a=F.t;if(Xe(a,F.playing?e:0),zt.uNow.value=a,zt.uFade.value=1-Math.min(1,Math.max(0,(a-D.end-Ut)/$t)),F.litho=Ln(F.litho,F.lithoTarget,e*2.2),ct.uLitho.value=F.litho,F.tween){let o=F.tween;o.k=Math.min(1,o.k+e/o.dur);let l=Cn(o.k);for(let r of["az","el","zoom"])Z[r]=o.from[r]+(o.to[r]-o.from[r])*l;o.k>=1&&(F.tween=null),Kt()}let n=Math.min(1,Math.max(0,(Math.PI/2-Z.el)/(Math.PI/2-Ge.el)));Dt.opacity=De.opacity=Math.max(0,n*1.4-.4),mt.visible=Dt.opacity>.01,X.setRenderTarget(qe),X.setClearColor(0,1),X.clear(),X.render(Be,Xt),X.setRenderTarget(null),X.setClearColor(3814188,1),X.clear(),X.render(wt,J),requestAnimationFrame(Ke)}Ae();requestAnimationFrame(Ke);window.__page={pencilTarget:$e,BUILD_MS:yn,state:F,view:Z,updateCamera:Kt,setRevealed:Yt,setPlaying:Ue,shared:ct,tl:D,PERIOD:_e,solveMotion:Xe,fp:Ie,drawing:It,strokeU:zt,scene:wt,placeA:lt,placeB:vt};})();
