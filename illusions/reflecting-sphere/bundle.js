(()=>{var t0=Object.create;var ye=Object.defineProperty;var e0=Object.getOwnPropertyDescriptor;var o0=Object.getOwnPropertyNames;var n0=Object.getPrototypeOf,a0=Object.prototype.hasOwnProperty;var s0=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(o){throw t=0,o}};var i0=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of o0(t))!a0.call(e,n)&&n!==o&&ye(e,n,{get:()=>t[n],enumerable:!(a=e0(t,n))||a.enumerable});return e};var at=(e,t,o)=>(o=e!=null?t0(n0(e)):{},i0(t||!e||!e.__esModule?ye(o,"default",{value:e,enumerable:!0}):o,e));var et=s0((N0,we)=>{we.exports=window.THREE});var w=at(et(),1);var T=at(et(),1);var H=at(et(),1),ge=new H.Box3,Bt=new H.Vector3,st=class extends H.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],o=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],a=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(a),this.setAttribute("position",new H.Float32BufferAttribute(t,3)),this.setAttribute("uv",new H.Float32BufferAttribute(o,2))}applyMatrix4(t){let o=this.attributes.instanceStart,a=this.attributes.instanceEnd;return o!==void 0&&(o.applyMatrix4(t),a.applyMatrix4(t),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let o;t instanceof Float32Array?o=t:Array.isArray(t)&&(o=new Float32Array(t));let a=new H.InstancedInterleavedBuffer(o,6,1);return this.setAttribute("instanceStart",new H.InterleavedBufferAttribute(a,3,0)),this.setAttribute("instanceEnd",new H.InterleavedBufferAttribute(a,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let o;t instanceof Float32Array?o=t:Array.isArray(t)&&(o=new Float32Array(t));let a=new H.InstancedInterleavedBuffer(o,6,1);return this.setAttribute("instanceColorStart",new H.InterleavedBufferAttribute(a,3,0)),this.setAttribute("instanceColorEnd",new H.InterleavedBufferAttribute(a,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new H.WireframeGeometry(t.geometry)),this}fromLineSegments(t){let o=t.geometry;return this.setPositions(o.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new H.Box3);let t=this.attributes.instanceStart,o=this.attributes.instanceEnd;t!==void 0&&o!==void 0&&(this.boundingBox.setFromBufferAttribute(t),ge.setFromBufferAttribute(o),this.boundingBox.union(ge))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new H.Sphere),this.boundingBox===null&&this.computeBoundingBox();let t=this.attributes.instanceStart,o=this.attributes.instanceEnd;if(t!==void 0&&o!==void 0){let a=this.boundingSphere.center;this.boundingBox.getCenter(a);let n=0;for(let i=0,s=t.count;i<s;i++)Bt.fromBufferAttribute(t,i),n=Math.max(n,a.distanceToSquared(Bt)),Bt.fromBufferAttribute(o,i),n=Math.max(n,a.distanceToSquared(Bt));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};var z=at(et(),1);z.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new z.Vector2},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};z.ShaderLib.line={uniforms:z.UniformsUtils.merge([z.UniformsLib.common,z.UniformsLib.fog,z.UniformsLib.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var bt=class extends z.ShaderMaterial{constructor(t){super({type:"LineMaterial",uniforms:z.UniformsUtils.clone(z.ShaderLib.line.uniforms),vertexShader:z.ShaderLib.line.vertexShader,fragmentShader:z.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0!==this.worldUnits&&(this.needsUpdate=!0),t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Gt=new T.Vector4,Ee=new T.Vector3,Se=new T.Vector3,_=new T.Vector4,I=new T.Vector4,K=new T.Vector4,jt=new T.Vector3,Yt=new T.Matrix4,O=new T.Line3,Me=new T.Vector3,Ct=new T.Box3,zt=new T.Sphere,Z=new T.Vector4,Q,ft;function Re(e,t,o){return Z.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),Z.multiplyScalar(1/Z.w),Z.x=ft/o.width,Z.y=ft/o.height,Z.applyMatrix4(e.projectionMatrixInverse),Z.multiplyScalar(1/Z.w),Math.abs(Math.max(Z.x,Z.y))}function r0(e,t){let o=e.matrixWorld,a=e.geometry,n=a.attributes.instanceStart,i=a.attributes.instanceEnd,s=Math.min(a.instanceCount,n.count);for(let r=0,c=s;r<c;r++){O.start.fromBufferAttribute(n,r),O.end.fromBufferAttribute(i,r),O.applyMatrix4(o);let m=new T.Vector3,d=new T.Vector3;Q.distanceSqToSegment(O.start,O.end,d,m),d.distanceTo(m)<ft*.5&&t.push({point:d,pointOnLine:m,distance:Q.origin.distanceTo(d),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function l0(e,t,o){let a=t.projectionMatrix,i=e.material.resolution,s=e.matrixWorld,r=e.geometry,c=r.attributes.instanceStart,m=r.attributes.instanceEnd,d=Math.min(r.instanceCount,c.count),u=-t.near;Q.at(1,K),K.w=1,K.applyMatrix4(t.matrixWorldInverse),K.applyMatrix4(a),K.multiplyScalar(1/K.w),K.x*=i.x/2,K.y*=i.y/2,K.z=0,jt.copy(K),Yt.multiplyMatrices(t.matrixWorldInverse,s);for(let l=0,f=d;l<f;l++){if(_.fromBufferAttribute(c,l),I.fromBufferAttribute(m,l),_.w=1,I.w=1,_.applyMatrix4(Yt),I.applyMatrix4(Yt),_.z>u&&I.z>u)continue;if(_.z>u){let M=_.z-I.z,x=(_.z-u)/M;_.lerp(I,x)}else if(I.z>u){let M=I.z-_.z,x=(I.z-u)/M;I.lerp(_,x)}_.applyMatrix4(a),I.applyMatrix4(a),_.multiplyScalar(1/_.w),I.multiplyScalar(1/I.w),_.x*=i.x/2,_.y*=i.y/2,I.x*=i.x/2,I.y*=i.y/2,O.start.copy(_),O.start.z=0,O.end.copy(I),O.end.z=0;let p=O.closestPointToPointParameter(jt,!0);O.at(p,Me);let v=T.MathUtils.lerp(_.z,I.z,p),y=v>=-1&&v<=1,S=jt.distanceTo(Me)<ft*.5;if(y&&S){O.start.fromBufferAttribute(c,l),O.end.fromBufferAttribute(m,l),O.start.applyMatrix4(s),O.end.applyMatrix4(s);let M=new T.Vector3,x=new T.Vector3;Q.distanceSqToSegment(O.start,O.end,x,M),o.push({point:x,pointOnLine:M,distance:Q.origin.distanceTo(x),object:e,face:null,faceIndex:l,uv:null,uv1:null})}}}var yt=class extends T.Mesh{constructor(t=new st,o=new bt({color:Math.random()*16777215})){super(t,o),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let t=this.geometry,o=t.attributes.instanceStart,a=t.attributes.instanceEnd,n=new Float32Array(2*o.count);for(let s=0,r=0,c=o.count;s<c;s++,r+=2)Ee.fromBufferAttribute(o,s),Se.fromBufferAttribute(a,s),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Ee.distanceTo(Se);let i=new T.InstancedInterleavedBuffer(n,2,1);return t.setAttribute("instanceDistanceStart",new T.InterleavedBufferAttribute(i,1,0)),t.setAttribute("instanceDistanceEnd",new T.InterleavedBufferAttribute(i,1,1)),this}raycast(t,o){let a=this.material.worldUnits,n=t.camera;if(n===null&&!a&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),a===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=t.params.Line2!==void 0&&t.params.Line2.threshold||0;Q=t.ray;let s=this.matrixWorld,r=this.geometry,c=this.material;ft=c.linewidth+i,r.boundingSphere===null&&r.computeBoundingSphere(),zt.copy(r.boundingSphere).applyMatrix4(s);let m;if(a)m=ft*.5;else{let u=Math.max(n.near,zt.distanceToPoint(Q.origin));m=Re(n,u,c.resolution)}if(zt.radius+=m,Q.intersectsSphere(zt)===!1)return;r.boundingBox===null&&r.computeBoundingBox(),Ct.copy(r.boundingBox).applyMatrix4(s);let d;if(a)d=ft*.5;else{let u=Math.max(n.near,Ct.distanceToPoint(Q.origin));d=Re(n,u,c.resolution)}Ct.expandByScalar(d),Q.intersectsBox(Ct)!==!1&&(a?r0(this,o):l0(this,n,o))}onBeforeRender(t){let o=this.material.uniforms;o&&o.resolution&&(t.getViewport(Gt),this.material.uniforms.resolution.value.set(Gt.z,Gt.w))}};function Ae(e,t){let o=document.getElementById("frame"),a=()=>{let i=(window.innerWidth<640?10:28)+13,s=document.getElementById("masthead"),r=document.getElementById("controls"),c=(s?s.offsetHeight:0)+6+13,m=(r?r.offsetHeight:0)+8+13,d=window.innerWidth-i*2,u=window.innerHeight-c-m,l=u,f=l*e;f>d&&(f=d,l=f/e),f=Math.max(160,Math.floor(f)),l=Math.max(120,Math.floor(l)),o.style.width=`${f}px`,o.style.height=`${l}px`,o.style.top=`${c+Math.max(0,(u-l)/2)}px`,t?.(f,l)};return window.addEventListener("resize",a),a(),a}function Te(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),o=document.getElementById("panel-close");if(!e)return;let a=n=>{n?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(n))};t?.addEventListener("click",()=>a(e.hasAttribute("hidden"))),o?.addEventListener("click",()=>a(!1)),window.addEventListener("keydown",n=>{n.key==="Escape"&&a(!1)})}function ke(e,t,o){let a=n=>{for(let[i,s]of e)i.setAttribute("aria-pressed",String(s===n));t(n)};for(let[n,i]of e)n.addEventListener("click",()=>a(i));return o!==void 0&&a(o),a}function He(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let o=e[t.key.length===1?t.key.toLowerCase():t.key];o&&(t.preventDefault(),o(t))})}function Le(e,t=!0){let o=document.getElementById("btn-play"),a=n=>{t=n,o&&(o.setAttribute("aria-pressed",String(!n)),o.querySelector("span").textContent=n?"Pause":"Play",o.querySelector(".icon").textContent=n?"\u275A\u275A":"\u25B6"),e(n)};return o?.addEventListener("click",()=>a(!t)),a(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),a}function Pe(e,t){let o=document.getElementById("badge");o&&t&&(o.textContent=t),document.body.classList.toggle("badge-on",!!e)}function Be(){document.body.classList.add("ready")}var B=at(et(),1);var P=at(et(),1),c0=1e3,f0={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function u0(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function h(e,t=f0.PLAIN,o={}){return{c:typeof e=="number"?u0(e):e,p:t,f:o.f||0,w:o.w||0,s:o.s||0}}var Ce=["px","nx","py","ny","pz","nz"];function ot(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function Xt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Rt(e){return Math.hypot(e[0],e[1],e[2])}function J(e){let t=Rt(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function $t(e,t){let o=Math.abs(t[0]),a=Math.abs(t[1]),n=Math.abs(t[2]);return o>=a&&o>=n?[e[2],e[1]]:n>=a?[e[0],e[1]]:[e[0],e[2]]}var Y=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new P.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new P.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let o=this.m.elements,a=t[0],n=t[1],i=t[2];return[o[0]*a+o[4]*n+o[8]*i+o[12],o[1]*a+o[5]*n+o[9]*i+o[13],o[2]*a+o[6]*n+o[10]*i+o[14]]}_tn(t){if(!this.nm)return t;let o=this.nm.elements,a=t[0],n=t[1],i=t[2];return J([o[0]*a+o[3]*n+o[6]*i,o[1]*a+o[4]*n+o[7]*i,o[2]*a+o[5]*n+o[8]*i])}tri(t,o,a,n,i=[1,1,1],s={}){let r=this._tp(t),c=this._tp(o),m=this._tp(a),d=J(Xt(ot(o,t),ot(a,t))),u=s.uv||[$t(t,d),$t(o,d),$t(a,d)],l=J(Xt(ot(c,r),ot(m,r))),f=s.n?s.n.map(M=>this._tn(M)):[l,l,l],b=Rt(Xt(ot(c,r),ot(m,r))),p=[b/(Rt(ot(m,c))||1),b/(Rt(ot(r,m))||1),b/(Rt(ot(c,r))||1)],v=s.k||[1,1,1],y=n.s||0,S=[r,c,m];for(let M=0;M<3;M++){let x=S[M];this.pos.push(x[0]+y,x[1]+y,x[2]+y),this.nrm.push(f[M][0],f[M][1],f[M][2]),this.col.push(n.c[0]*v[M],n.c[1]*v[M],n.c[2]*v[M]),this.uv.push(u[M][0],u[M][1]);for(let A=0;A<3;A++)i[A]?this.edg.push(M===A?p[A]:0):this.edg.push(c0);this.mat.push(n.p,n.f,n.w)}}quad(t,o,a,n,i,s=[1,1,1,1],r={}){let c=r.k||[1,1,1,1],m=r.n,d=r.uv;this.tri(t,o,a,i,[s[1],0,s[0]],{k:[c[0],c[1],c[2]],n:m&&[m[0],m[1],m[2]],uv:d&&[d[0],d[1],d[2]]}),this.tri(t,a,n,i,[s[2],s[3],0],{k:[c[0],c[2],c[3]],n:m&&[m[0],m[2],m[3]],uv:d&&[d[0],d[2],d[3]]})}box(t,o,a,n,i,s,r,c={}){t>n&&([t,n]=[n,t]),o>i&&([o,i]=[i,o]),a>s&&([a,s]=[s,a]);let m=new Set(c.open||[]),d=new Set(c.skip||[]);c.bottom||d.add("ny");let u=c.ao??1,l=c.aoTop??1,f={px:[0,n],nx:[0,t],py:[1,i],ny:[1,o],pz:[2,s],nz:[2,a]},b={px:[[n,o,s],[n,o,a],[n,i,a],[n,i,s]],nx:[[t,o,a],[t,o,s],[t,i,s],[t,i,a]],pz:[[t,o,s],[n,o,s],[n,i,s],[t,i,s]],nz:[[n,o,a],[t,o,a],[t,i,a],[n,i,a]],py:[[t,i,s],[n,i,s],[n,i,a],[t,i,a]],ny:[[t,o,a],[n,o,a],[n,o,s],[t,o,s]]};for(let p of Ce){if(d.has(p)||m.has(p))continue;let v=b[p],y=[];for(let x=0;x<4;x++){let A=v[x],D=v[(x+1)%4],q=1;for(let G of Ce){if(G===p)continue;let[lt,ct]=f[G];Math.abs(A[lt]-ct)<1e-9&&Math.abs(D[lt]-ct)<1e-9&&m.has(G)&&(q=0)}y.push(q)}let S;p==="py"||p==="ny"?S=[l,l,l,l]:S=[u,u,1,1];let M=p==="py"&&c.top?{...c.top,s:r.s}:r;this.quad(v[0],v[1],v[2],v[3],M,y,{k:S})}}cyl(t,o,a,n,i,s,r,c={}){let m=c.caps??[!0,!0],d=c.rim??[1,1],u=c.r1??n;for(let l=0;l<s;l++){let f=l/s*Math.PI*2,b=(l+1)/s*Math.PI*2,p=Math.cos(f),v=Math.sin(f),y=Math.cos(b),S=Math.sin(b),M=[t+n*p,o,a+n*v],x=[t+u*p,i,a+u*v],A=[t+u*y,i,a+u*S],D=[t+n*y,o,a+n*S],q=(n-u)/Math.max(1e-6,i-o),G=J([p,q,v]),lt=J([y,q,S]),ct=f*(n+u)/2,Pt=b*(n+u)/2;this.quad(M,x,A,D,r,[0,d[1],0,d[0]],{n:[G,G,lt,lt],uv:[[ct,o],[ct,i],[Pt,i],[Pt,o]],k:c.k}),m[1]&&u>0&&this.tri([t,i,a],A,x,r,[1,0,0]),m[0]&&this.tri([t,o,a],M,D,r,[1,0,0])}}lathe(t,o,a,n,i,s,r={}){let c=n.length,m=[];for(let l=0;l<c-1;l++){let f=n[l+1][0]-n[l][0],b=n[l+1][1]-n[l][1];m.push(J([b,-f,0]))}let d=n.map((l,f)=>{let b=m[Math.max(0,f-1)],p=m[Math.min(c-2,f)];return J([b[0]+p[0],b[1]+p[1],0])}),u=r.edges||[];for(let l=0;l<i;l++){let f=l/i*Math.PI*2,b=(l+1)/i*Math.PI*2,p=Math.cos(f),v=Math.sin(f),y=Math.cos(b),S=Math.sin(b);for(let M=0;M<c-1;M++){let[x,A]=n[M],[D,q]=n[M+1],G=[t+x*p,o+A,a+x*v],lt=[t+D*p,o+q,a+D*v],ct=[t+D*y,o+q,a+D*S],Pt=[t+x*y,o+A,a+x*S],vt=r.flat?m[M]:d[M],xt=r.flat?m[M]:d[M+1];this.quad(G,lt,ct,Pt,s,[0,u[M+1]?1:0,0,u[M]?1:0],{n:[[vt[0]*p,vt[1],vt[0]*v],[xt[0]*p,xt[1],xt[0]*v],[xt[0]*y,xt[1],xt[0]*S],[vt[0]*y,vt[1],vt[0]*S]],uv:[[f*1.2,A],[f*1.2,q],[b*1.2,q],[b*1.2,A]]})}}}poly(t,o,a={}){for(let n=1;n<t.length-1;n++)this.tri(t[0],t[n],t[n+1],o,[1,n===t.length-2?1:0,n===1?1:0],a)}blob(t,o,a,n,i,s,r,c={}){let m=c.sub??1,d=c.seed??0,u=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let b=0;b<m;b++){let p=[];for(let[v,y,S]of u){let M=J([(v[0]+y[0])/2,(v[1]+y[1])/2,(v[2]+y[2])/2]),x=J([(y[0]+S[0])/2,(y[1]+S[1])/2,(y[2]+S[2])/2]),A=J([(S[0]+v[0])/2,(S[1]+v[1])/2,(S[2]+v[2])/2]);p.push([v,M,A],[M,y,x],[A,x,S],[M,x,A])}u=p}let l=b=>1+(c.lump??.12)*Math.sin(b[0]*5.1+d)*Math.sin(b[1]*4.3+d*1.7)*Math.sin(b[2]*3.7+d*.3),f=b=>{let p=l(b);return[t+b[0]*n*p,o+b[1]*i*p,a+b[2]*s*p]};for(let[b,p,v]of u)this.tri(f(b),f(p),f(v),r,[0,0,0],{n:[b,p,v],k:c.k})}build(){let t=new P.BufferGeometry;return t.setAttribute("position",new P.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new P.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new P.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new P.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new P.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new P.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}},k={T:(e,t,o)=>new P.Matrix4().makeTranslation(e,t,o),RX:e=>new P.Matrix4().makeRotationX(e),RY:e=>new P.Matrix4().makeRotationY(e),RZ:e=>new P.Matrix4().makeRotationZ(e),S:(e,t,o)=>new P.Matrix4().makeScale(e,t??e,o??e),chain:(...e)=>e.reduce((t,o)=>t.multiply(o),new P.Matrix4)};var Zt={W:5.6,D:4.6,H:2.9},N={c:new B.Vector3(0,1.38,0),r:.18},g={PLAIN:0,BOARDS:4,PLASTER:5,GRAIN:6,CLOTH:8,FOLIAGE:9,PAPERW:20,RUG:21,SPINE:22,LAND:23,BLOCKS:24,CHART:25,BOTANY:26,VIEW:27,GLOW:28,DIAL:29,PAPER:30,PANEL:31,DOOR:32,BRASS:33},{W:U,D:L,H:X}=Zt,wt=.95,d0={N:{len:U,m:k.T(-U/2,0,-L/2)},E:{len:L,m:k.chain(k.T(U/2,0,-L/2),k.RY(-Math.PI/2))},S:{len:U,m:k.chain(k.T(U/2,0,L/2),k.RY(Math.PI))},W:{len:L,m:k.chain(k.T(-U/2,0,L/2),k.RY(Math.PI/2))}},R={paper:11712414,panel:9334090,cap:7755578,floor:12095592,ceiling:15657176,beam:8215874,walnut:8017208,oak:10517072,paint:14867401,brass:11899218,frameGilt:11110212,frameBlack:2893604,curtain:11569216,cushion:5992026,terracotta:10771774,leaf:5599306,mahogany:6237986,glass:3107662,candle:15656658,dark:2761760},gt=[9321008,4021834,4017518,12096078,8413247,5063744,13811862,7438479,10250824,6570060,11180656,4612186];function p0(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let o=t;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}}var ut=(e=1,t=1)=>({uv:[[0,0],[e,0],[e,t],[0,t]]});function dt(e,t,o,a,n,i,s,r){e.quad([t,o,i],[a,o,i],[a,n,i],[t,n,i],s,[1,1,1,1],r||{})}function j(e,t,o,a,n,i,s=8,r=[!1,!1]){let c=new B.Vector3(...t),d=new B.Vector3(...o).clone().sub(c),u=d.length(),l=new B.Quaternion().setFromUnitVectors(new B.Vector3(0,1,0),d.normalize());e.push(new B.Matrix4().compose(c,l,new B.Vector3(1,1,1))),e.cyl(0,0,0,a,u,s,i,{r1:n,caps:r,rim:[0,0]}),e.pop()}function _t(e,t,o){let a=new Set([0,t]),n=new Set([0,wt,X]);for(let l of o)a.add(l.x0),a.add(l.x1),n.add(l.y0),n.add(l.y1);let i=[...a].sort((l,f)=>l-f),s=[...n].sort((l,f)=>l-f),r=(l,f)=>o.some(b=>l>b.x0&&l<b.x1&&f>b.y0&&f<b.y1),c=h(R.panel,g.PANEL),m=h(R.paper,g.PAPERW);for(let l=0;l<i.length-1;l++)for(let f=0;f<s.length-1;f++){let b=(i[l]+i[l+1])/2,p=(s[f]+s[f+1])/2;if(r(b,p))continue;let v=[f===0||r(b,s[f]-1e-4),l===i.length-2||r(i[l+1]+1e-4,p),f===s.length-2||r(b,s[f+1]+1e-4),l===0||r(i[l]-1e-4,p)].map(Number);e.quad([i[l],s[f],0],[i[l+1],s[f],0],[i[l+1],s[f+1],0],[i[l],s[f+1],0],p<wt?c:m,v)}let d=(l,f)=>{let b=o.filter(y=>y.y0<f&&y.y1>l).map(y=>[y.x0-.08,y.x1+.08]).sort((y,S)=>y[0]-S[0]),p=[],v=0;for(let[y,S]of b)y>v&&p.push([v,y]),v=Math.max(v,S);return v<t&&p.push([v,t]),p},u=h(R.cap,g.GRAIN);for(let[l,f]of d(wt-.03,wt+.03))e.box(l,wt-.03,0,f,wt+.02,.035,u,{bottom:!0});for(let[l,f]of d(0,.14))e.box(l,0,0,f,.14,.022,u);e.box(0,X-.09,0,t,X,.075,h(R.ceiling,g.PLASTER),{bottom:!0}),e.box(0,X-.13,0,t,X-.09,.03,h(R.ceiling,g.PLASTER),{bottom:!0})}function ze(e,t,o,a){e.quad([t.x0,t.y0,0],[t.x0,t.y0,-o],[t.x0,t.y1,-o],[t.x0,t.y1,0],a,[1,1,1,1]),e.quad([t.x1,t.y0,-o],[t.x1,t.y0,0],[t.x1,t.y1,0],[t.x1,t.y1,-o],a,[1,1,1,1]),e.quad([t.x0,t.y1,-o],[t.x1,t.y1,-o],[t.x1,t.y1,0],[t.x0,t.y1,0],a,[1,1,1,1]),t.y0>.01&&e.quad([t.x0,t.y0,0],[t.x1,t.y0,0],[t.x1,t.y0,-o],[t.x0,t.y0,-o],a,[1,1,1,1])}function m0(e,t,o,a,n,i,s,r){let c=h(r,g.GRAIN);e.box(t,o,a-s,t+n,o+i,a,c,{skip:["pz"],top:h(14274226)}),dt(e,t,o,t+n,o+i,a,h(r,g.SPINE),ut())}function h0(e,t,o,a,n,i,s){let r=t+.008;for(;r<o-.03;){let c=s();if(c<.05){r+=.03+s()*.07;continue}if(c<.1&&o-r>.3){let l=.17+s()*.06,f=a,b=2+Math.floor(s()*3);for(let p=0;p<b&&f<a+n-.06;p++){let v=.025+s()*.02,y=gt[Math.floor(s()*gt.length)],S=(s()-.5)*.02;e.box(r+S,f,i-.2,r+S+l,f+v,i-.005,h(y,g.GRAIN),{top:h(y,g.GRAIN)}),f+=v}r+=l+.01;continue}let m=.022+s()*.036,d=Math.min(n-.012,.17+s()*.13),u=.14+s()*.08;m0(e,r,a,i-.004-s()*.018,m,d,u,gt[Math.floor(s()*gt.length)]),r+=m+(s()<.12?.004:6e-4)}}function Kt(e,t,o,a,n,i,s){let r=h(R.walnut,g.GRAIN),c=.028;e.box(t,0,0,t+c,a,n,r,{bottom:!0}),e.box(o-c,0,0,o,a,n,r,{bottom:!0}),e.box(t-.025,a,0,o+.025,a+.045,n+.03,r,{bottom:!0}),e.box(t+c,0,.012,o-c,.1,n,r),dt(e,t+c,.1,o-c,a,.006,h(6177067,g.GRAIN));let m=.1,d=(a-m)/i;for(let u=0;u<i;u++){let l=m+u*d;u>0&&e.box(t+c,l-.022,0,o-c,l,n-.008,r,{bottom:!0}),h0(e,t+c,o-c,l,d-.03,n-.02,s)}}function At(e,t,o,a,n,i,s,r=.045){let c=h(s,g.GRAIN),m=.035;e.box(t-r,o-r,0,t+a+r,o,m,c,{bottom:!0}),e.box(t-r,o+n,0,t+a+r,o+n+r,m,c,{bottom:!0}),e.box(t-r,o,0,t,o+n,m,c),e.box(t+a,o,0,t+a+r,o+n,m,c),dt(e,t,o,t+a,o+n,.014,h(15130572));let d=Math.min(a,n)*.07;dt(e,t+d,o+d,t+a-d,o+n-d,.016,h(16777215,i),ut((a-2*d)/(n-2*d),1))}function v0(e,t,o){let a={x0:4.35,x1:5.25,y0:0,y1:2.1};_t(e,U,[a]),Kt(e,.25,1.95,2.32,.36,6,t),Kt(e,2,3.7,2.32,.36,6,t),o.boxes.push([.2,0,0,3.75,2.37,.39]),At(e,3.86,1.42,.36,.46,g.BOTANY,R.frameBlack,.03);let n=h(R.paint,g.GRAIN);e.box(a.x0-.08,0,0,a.x0,a.y1+.08,.03,n),e.box(a.x1,0,0,a.x1+.08,a.y1+.08,.03,n),e.box(a.x0-.08,a.y1,0,a.x1+.08,a.y1+.08,.03,n,{bottom:!0}),ze(e,a,.07,h(R.paint)),dt(e,a.x0,0,a.x1,a.y1,-.07,h(R.oak,g.DOOR),ut(.9,2.1)),e.blob(a.x1-.1,1,-.03,.028,.028,.028,h(R.brass,g.BRASS),{sub:2,lump:0}),e.box(a.x1-.13,.94,-.07,a.x1-.07,1.06,-.062,h(R.brass,g.BRASS))}function x0(e,t,o,a){let n={x0:1.45,x1:3.15,y0:.9,y1:2.4};_t(e,L,[n]);let i=h(R.paint,g.GRAIN);ze(e,n,.25,h(R.paint,g.PLASTER)),e.box(n.x0-.07,n.y0-.045,-.25,n.x1+.07,n.y0,.06,i,{bottom:!0});let s=-.17,r=-.12;e.box(n.x0,n.y0,s,n.x0+.06,n.y1,r,i),e.box(n.x1-.06,n.y0,s,n.x1,n.y1,r,i),e.box(n.x0,n.y1-.06,s,n.x1,n.y1,r,i,{bottom:!0}),e.box(n.x0,n.y0,s,n.x1,n.y0+.07,r,i);let c=(n.y0+n.y1)/2;e.box(n.x0,c-.03,s-.02,n.x1,c+.03,r-.02,i,{bottom:!0});let m=n.x0+.06,d=n.x1-.06;for(let p=1;p<3;p++){let v=m+(d-m)*p/3;e.box(v-.011,n.y0,s+.01,v+.011,n.y1,r-.01,i)}for(let p of[(n.y0+c)/2,(c+n.y1)/2])e.box(m,p-.011,s+.01,d,p+.011,r-.01,i,{bottom:!0});a.quad([-2,-.6,-.9],[L+2,-.6,-.9],[L+2,3.2,-.9],[-2,3.2,-.9],h(16777215,g.VIEW),[0,0,0,0]);let u=h(R.curtain,g.CLOTH),l=(p,v)=>{for(let S=0;S<9;S++){let M=p+(v-p)*S/9,x=p+(v-p)*(S+1)/9,A=S%2?.16:.07,D=S%2?.07:.16;e.quad([M,.12,A],[x,.12,D],[x,2.6,D],[M,2.6,A],u,[1,0,1,0])}};l(n.x0-.5,n.x0+.06),l(n.x1-.06,n.x1+.5),j(e,[n.x0-.62,2.64,.12],[n.x1+.62,2.64,.12],.016,.016,h(R.brass,g.BRASS),8,[!0,!0]);for(let p of[n.x0-.62,n.x1+.62])e.blob(p,2.64,.12,.03,.03,.03,h(R.brass,g.BRASS),{sub:1,lump:0});e.box(n.x0-.12,0,0,n.x1+.12,.44,.48,h(R.paint,g.PANEL)),e.box(n.x0-.08,.44,.03,n.x1+.08,.53,.46,h(R.cushion,g.CLOTH)),e.blob(n.x0+.25,.64,.14,.17,.13,.07,h(9059120,g.CLOTH),{sub:2,lump:.05}),o.boxes.push([n.x0-.12,0,0,n.x1+.12,.6,.48]);let f=3.85,b=.32;e.lathe(f,0,b,[[.11,0],[.13,.22],[.145,.24],[.145,.29],[.125,.29]],16,h(R.terracotta,g.PLASTER),{edges:[1,0,1,1,1]});for(let p=0;p<9;p++){let v=p*2.4,y=p===0?0:.09+.05*t();e.blob(f+Math.cos(v)*y,.42+.06*p*t()+(p===0?.2:0),b+Math.sin(v)*y*.8,.13,.15,.12,h(R.leaf,g.FOLIAGE),{sub:2,lump:.25,seed:p*3.1})}o.boxes.push([f-.2,0,b-.2,f+.2,.75,b+.2]),o.windowRect=n}function b0(e,t,o){_t(e,U,[]);let a=h(R.walnut,g.GRAIN),n=2.85,i=4.35,s=.76,r=.74;e.box(n-.02,s-.035,0,i+.02,s,r,a,{bottom:!0});for(let[x,A]of[[n,n+.42],[i-.42,i]]){e.box(x,.03,.02,A,s-.035,r-.04,a);for(let D=0;D<3;D++){let q=.08+D*.205,G=q+.19;e.box(x+.02,q,r-.04,A-.02,G,r-.025,h(6964784,g.GRAIN)),e.box((x+A)/2-.04,(q+G)/2-.008,r-.025,(x+A)/2+.04,(q+G)/2+.008,r-.012,h(R.brass,g.BRASS))}}e.box(n+.42,.42,.03,i-.42,s-.035,.06,a,{bottom:!0}),e.box(n+.44,s-.13,r-.06,i-.44,s-.035,r-.03,h(6964784,g.GRAIN),{bottom:!0}),o.boxes.push([n,0,0,i,s,r]);let c=(n+i)/2,m=h(15788760,g.PAPER);e.quad([c-.31,s+.012,.52],[c,s+.006,.52],[c,s+.006,.24],[c-.31,s+.012,.24],m,[1,1,1,1],ut(.31,.28)),e.quad([c,s+.006,.52],[c+.31,s+.012,.52],[c+.31,s+.012,.24],[c,s+.006,.24],m,[1,1,1,1],ut(.31,.28)),e.box(c-.33,s,.23,c+.33,s+.006,.53,h(7024170)),e.box(n+.08,s,.3,n+.34,s+.012,.66,m),e.cyl(n+.48,s,.16,.032,s+.05,10,h(R.dark)),e.cyl(n+.48,s+.05,.16,.012,s+.07,8,h(R.brass,g.BRASS)),j(e,[n+.43,s+.006,.36],[n+.58,s+.012,.47],.004,.004,h(R.dark),6);let d=s;for(let x=0;x<3;x++){let A=.03+.012*x;e.box(n+.06-x*.01,d,.05,n+.33+x*.012,d+A,.24,h(gt[(x*5+2)%gt.length],g.GRAIN)),d+=A}let u=i-.22,l=.3,f=h(R.brass,g.BRASS);e.lathe(u,s,l,[[.1,0],[.1,.015],[.075,.03],[.022,.055],[.014,.06]],20,f,{edges:[1,1,0,0,0]}),e.cyl(u,s+.055,l,.011,s+.42,10,f,{caps:[!1,!1]}),e.lathe(u,s,l,[[.165,.37],[.15,.39],[.06,.5],[.035,.52]],28,h(R.glass),{edges:[1,0,0,1]}),e.lathe(u,s,l,[[.035,.515],[.06,.495],[.15,.385],[.162,.37]],28,h(16777215,g.GLOW)),e.blob(u,s+.405,l,.034,.042,.034,h(16777215,g.GLOW),{sub:2,lump:0}),o.lamp=[u,s+.4,l],e.push(k.chain(k.T(c+.12,0,r+.32),k.RY(.3)));let b=h(5584420,g.GRAIN);e.box(-.22,.43,-.21,.22,.47,.21,b,{bottom:!0});for(let[x,A]of[[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])e.cyl(x,0,A,.017,.43,8,b,{caps:[!1,!1]});for(let x of[-.19,.19])e.cyl(x,.47,.18,.018,.93,8,b,{caps:[!1,!0]});e.box(-.21,.86,.165,.21,.94,.2,b,{bottom:!0});for(let x=-1;x<=1;x++)e.cyl(x*.09,.47,.182,.009,.86,6,b,{caps:[!1,!1]});e.pop(),o.boxes.push([c-.15,0,r+.05,c+.42,.95,r+.6]),At(e,2.98,1.42,.58,.44,g.LAND,R.frameGilt),At(e,3.76,1.32,.42,.6,g.BOTANY,R.frameBlack,.035);let p=.55,v=1.95,y=.86,S=.46;e.box(p,.08,.02,v,y-.03,S-.02,h(6964784,g.GRAIN)),e.box(p-.02,y-.03,0,v+.02,y,S,a,{bottom:!0});for(let x of[p+.04,v-.04])e.cyl(x,0,S-.06,.02,.08,8,a,{caps:[!1,!1]});let M=(v-p-.08)/3;for(let x=0;x<3;x++){let A=p+.04+x*M;e.box(A+.01,.12,S-.02,A+M-.01,y-.07,S-.005,h(6964784,g.PANEL)),e.blob(A+M/2,y-.2,S+.005,.012,.012,.012,f,{sub:1,lump:0})}for(let x of[p+.2,v-.2])e.lathe(x,y,.24,[[.055,0],[.05,.015],[.018,.04],[.012,.2],[.03,.22],[.02,.23]],14,f,{edges:[1,0,0,0,1,1]}),e.cyl(x,y+.23,.24,.011,y+.38,8,h(R.candle));e.lathe((p+v)/2,y,.24,[[.05,0],[.11,.05],[.14,.09],[.135,.095]],20,h(4153196),{edges:[1,0,1,1]});for(let x=0;x<3;x++)e.blob((p+v)/2+(x-1)*.06,y+.09,.24+x%2*.03,.04,.04,.04,h([12088378,11047226,10107434][x]),{sub:2,lump:.02});At(e,.78,1.25,.94,.78,g.BLOCKS,R.frameGilt,.05),o.boxes.push([p,0,0,v,y+.35,S])}function y0(e,t,o){_t(e,L,[]);let a=.9,n=1.4,i=h(R.mahogany,g.GRAIN);e.box(a-.02,0,0,n+.02,.32,.28,i),e.box(a+.03,.32,.02,n-.03,1.45,.25,i,{skip:["pz"]});let s={x0:a+.1,x1:n-.1,y0:.45,y1:1.33};e.box(a+.03,.32,.25,s.x0,1.45,.27,i),e.box(s.x1,.32,.25,n-.03,1.45,.27,i),e.box(s.x0,.32,.25,s.x1,s.y0,.27,i),e.box(s.x0,s.y1,.25,s.x1,1.45,.27,i,{bottom:!0}),dt(e,s.x0,s.y0,s.x1,s.y1,.06,h(3022102,g.GRAIN)),e.quad([s.x0,s.y0,.27],[s.x0,s.y0,.06],[s.x0,s.y1,.06],[s.x0,s.y1,.27],h(3810330),[1,1,1,1]),e.quad([s.x1,s.y0,.06],[s.x1,s.y0,.27],[s.x1,s.y1,.27],[s.x1,s.y1,.06],h(3810330),[1,1,1,1]),e.quad([s.x0,s.y1,.06],[s.x1,s.y1,.06],[s.x1,s.y1,.27],[s.x0,s.y1,.27],h(3810330),[1,1,1,1]),e.quad([s.x0,s.y0,.27],[s.x1,s.y0,.27],[s.x1,s.y0,.06],[s.x0,s.y0,.06],h(3810330),[1,1,1,1]),e.box(a-.02,1.45,0,n+.02,1.98,.29,i,{bottom:!0}),dt(e,a+.06,1.53,n-.06,1.91,.292,h(16777215,g.DIAL),ut()),e.box(a-.05,1.98,0,n+.05,2.04,.32,i,{bottom:!0}),e.blob((a+n)/2,2.1,.16,.04,.06,.04,h(R.brass,g.BRASS),{sub:2,lump:0}),o.boxes.push([a-.05,0,0,n+.05,2.1,.32]),o.pendulum={pivot:[(a+n)/2,1.42,.14]},Kt(e,2.35,4.2,1.04,.34,3,t),o.boxes.push([2.3,0,0,4.25,1.09,.37]),e.lathe(2.75,1.085,.17,[[.04,0],[.07,.05],[.075,.12],[.04,.2],[.035,.24],[.045,.25]],16,h(R.terracotta,g.PLASTER),{edges:[1,0,0,0,0,1]});for(let r=0;r<4;r++)j(e,[2.75,1.32,.17],[2.75+(r-1.5)*.09,1.62+.06*(r%2),.17+(r%2?.05:-.04)],.004,.002,h(4864554),5);At(e,2.85,1.36,1.2,.78,g.CHART,R.frameBlack,.04)}function w0(){let e=new Y,t=h(R.brass,g.BRASS);return e.box(-.006,-.72,-.004,.006,0,.004,h(3878952),{bottom:!0}),e.push(k.chain(k.T(0,-.74,0),k.RX(Math.PI/2))),e.cyl(0,-.012,0,.065,.012,24,t),e.pop(),e.build()}function _e(){let e=p0(1935),t={boxes:[]},o={},a=new Y,n={N:v0,E:x0,S:b0,W:y0},i=[];for(let s of Object.keys(n)){let r=new Y,c=d0[s];r.push(c.m),a.push(c.m);let m={boxes:[]};n[s](r,e,m,a),a.pop(),r.pop(),o[s]=r.build();for(let d of m.boxes){let u=new B.Vector3(d[0],d[1],d[2]).applyMatrix4(c.m),l=new B.Vector3(d[3],d[4],d[5]).applyMatrix4(c.m);i.push(new B.Box3(u.clone().min(l),u.clone().max(l)))}m.lamp&&(t.lamp=new B.Vector3(...m.lamp).applyMatrix4(c.m)),m.pendulum&&(t.pendulum={position:new B.Vector3(...m.pendulum.pivot).applyMatrix4(c.m),rotationY:s==="W"?Math.PI/2:0})}{let s=new Y;s.quad([-U/2,X,-L/2],[U/2,X,-L/2],[U/2,X,L/2],[-U/2,X,L/2],h(R.ceiling,g.PLASTER),[1,1,1,1]);for(let r of[-1.45,1.45])s.box(r-.09,X-.2,-L/2,r+.09,X,L/2,h(R.beam,g.GRAIN),{bottom:!0});o.ceiling=s.build()}{let s=new Y;s.quad([-U/2,0,L/2],[U/2,0,L/2],[U/2,0,-L/2],[-U/2,0,-L/2],h(R.floor,g.BOARDS),[1,1,1,1]),s.quad([-1.3,.006,.95],[1.3,.006,.95],[1.3,.006,-.95],[-1.3,.006,-.95],h(16777215,g.RUG),[1,1,1,1],ut(2.6,1.9));let r=h(9070150),c=h(R.brass,g.BRASS);s.box(-.2,.006,-.2,.2,.08,.2,r),s.lathe(0,.08,0,[[.17,0],[.165,.025],[.13,.045],[.12,.07],[.09,.1],[.07,.2],[.058,.5],[.06,.8],[.07,.88],[.085,.9],[.085,.93],[.06,.96],[.055,1.02]],28,r,{edges:[1,1,0,1,0,0,0,0,1,1,1,1,0]}),s.lathe(0,.08,0,[[.055,1.02],[.06,1.04],[.095,1.06],[.095,1.085],[.075,1.1]],28,c,{edges:[1,0,1,1,0]});let m=N.c.y,d=N.r+.004,u=m+d*Math.sin(-Math.PI/2+.95),l=d*Math.cos(-Math.PI/2+.95);s.lathe(0,0,0,[[.075,1.18],[.1,1.2],[l+.018,u-.01],[l+.012,u+.004]],32,c,{edges:[0,0,0,1]});let f=[[l+.012,u+.004]];for(let b=8;b>=0;b--){let p=-Math.PI/2+b/8*.95;f.push([Math.max(.001,d*Math.cos(p)),m+d*Math.sin(p)])}s.lathe(0,0,0,f,32,c,{edges:[1]}),o.core=s.build(),i.push(new B.Box3(new B.Vector3(-.2,0,-.2),new B.Vector3(.2,1.25,.2)))}return{groups:o,view:a.build(),pendulum:w0(),pendulumAt:t.pendulum,lamp:t.lamp,boxes:i}}var Et=at(et(),1);var Jt=1.62,nt={skin:14198152,hair:4930092,jacket:4015959,trousers:4866358,shirt:15328211,shoe:2760987,beret:2564643,cover:7024170,pencil:12818986},g0=30,Qt=8;function Ie(e){let t=new Et.Group,o=new Y,a=h(nt.skin),n=h(nt.hair),i=h(nt.jacket,Qt),s=h(nt.trousers,Qt),r=h(nt.shirt),c=h(nt.shoe),m=h(nt.beret,Qt);for(let f of[-1,1])o.blob(f*.1,.045,-.04,.052,.045,.125,c,{sub:2,lump:.02}),j(o,[f*.1,.94,.05],[f*.1,.07,.01],.078,.055,s,12);o.blob(0,.95,.06,.185,.12,.125,s,{sub:2,lump:.02}),o.push(k.chain(k.T(0,0,.07),k.S(1,1,.64))),o.lathe(0,0,0,[[.17,.86],[.18,1],[.192,1.2],[.208,1.34],[.196,1.41],[.14,1.45],[.06,1.475]],20,i,{edges:[1,0,0,0,0,0,0]}),o.pop(),o.tri([-.065,1.455,-.052],[.065,1.455,-.052],[0,1.25,-.066],r,[1,1,1]),o.cyl(0,1.43,.075,.052,1.53,12,a,{caps:[!1,!1]}),o.blob(0,1.6,.085,.078,.104,.094,a,{sub:3,lump:.015}),o.blob(0,1.628,.118,.084,.088,.084,n,{sub:2,lump:.06,seed:2}),o.blob(0,1.535,.045,.07,.05,.064,n,{sub:2,lump:.05,seed:5}),o.blob(0,1.565,-.012,.036,.012,.016,n,{sub:1,lump:0}),o.push(k.chain(k.T(.012,1.708,.095),k.RZ(-.2),k.RX(.08))),o.blob(0,0,0,.104,.03,.098,m,{sub:2,lump:.04}),o.pop(),o.blob(0,1.742,.1,.008,.012,.008,m,{sub:1,lump:0});for(let f of[-1,1])o.blob(f*.079,1.6,.095,.012,.026,.018,a,{sub:1,lump:0}),o.blob(f*.031,1.621,-.004,.011,.008,.006,h(1840916),{sub:1,lump:0}),o.box(f*.031-.019,1.643,-.006,f*.031+.019,1.651,.004,n);o.blob(0,1.592,-.014,.013,.026,.02,a,{sub:1,lump:0}),o.blob(-.2,1.39,.075,.07,.06,.07,i,{sub:1,lump:0}),o.blob(.2,1.39,.075,.07,.06,.07,i,{sub:1,lump:0}),j(o,[-.205,1.39,.07],[-.24,1.13,0],.055,.046,i,10),o.blob(-.24,1.13,0,.047,.047,.047,i,{sub:1,lump:0}),j(o,[-.24,1.13,0],[-.15,1.09,-.22],.045,.036,i,10),j(o,[-.159,1.094,-.198],[-.145,1.088,-.235],.032,.03,r,8),o.blob(-.13,1.09,-.26,.035,.03,.045,a,{sub:2,lump:.02}),o.push(k.chain(k.T(-.04,1.115,-.285),k.RY(.12),k.RX(.85))),o.box(-.155,-.008,-.11,.155,0,.11,h(nt.cover),{bottom:!0}),o.quad([-.148,.001,.104],[.148,.001,.104],[.148,.001,-.104],[-.148,.001,-.104],h(15788760,g0),[1,1,1,1],{uv:[[0,0],[.3,0],[.3,.21],[0,.21]]}),o.pop(),j(o,[.205,1.39,.07],[.24,1.14,0],.055,.046,i,10),o.blob(.24,1.14,0,.047,.047,.047,i,{sub:1,lump:0});let d=new Et.Mesh(o.build(),e);t.add(d);let u=new Y;j(u,[0,0,0],[-.17,.02,-.22],.045,.036,i,10),j(u,[-.16,.019,-.207],[-.185,.022,-.24],.032,.03,r,8),u.blob(-.2,.02,-.265,.032,.034,.044,a,{sub:2,lump:.02}),j(u,[-.185,.08,-.235],[-.225,-.02,-.29],.0045,.003,h(nt.pencil),6);let l=new Et.Group;return l.position.set(.24,1.14,0),l.add(new Et.Mesh(u.build(),e)),t.add(l),t.traverse(f=>{f.frustumCulled=!1}),{group:t,arm:l}}var $=at(et(),1),Oe=`
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
`,E0=`
vec3 finish(vec3 col, float haze, float ink, vec2 huv, float hfw, float face) {
  col = mix(col, uHaze, haze);
  vec3 colour = col * (1.0 - ink * 0.78);
  float g = vnoise(gl_FragCoord.xy * 0.6) - 0.5;
  float gw = hash12(gl_FragCoord.xy) - 0.5;
  colour += (g * 0.03 + gw * 0.025);

  float L = pow(dot(col, vec3(0.30, 0.59, 0.11)), 0.8);
  L = mix(L, 0.95, haze * 0.7);
  float t = clamp((L - 0.07) / 0.85, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t) * 0.6 + t * 0.4;
  float hp = uHatch * max(length(vW - cameraPosition), 0.3);
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
`;function De(){return{uTime:{value:0},uClock:{value:0},uLitho:{value:1},uHatch:{value:.012},uCubePass:{value:0},uAir:{value:0},uSun:{value:new $.Vector3(1,.55,-.22).normalize()},uLamp:{value:new $.Vector3},uC:{value:new $.Vector3},uFeet:{value:new $.Vector3(0,-9,0)},uPaper:{value:new $.Vector3(.925,.898,.835)},uInk:{value:new $.Vector3(.11,.1,.09)},uHaze:{value:new $.Vector3(.83,.86,.84)}}}var S0=`
attribute vec3 acol;
attribute vec2 fuv;
attribute vec3 edge;
attribute vec3 amat;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,M0=`
uniform float uTime;
uniform float uClock;
uniform float uLitho;
uniform float uHatch;
uniform float uCubePass;
uniform float uAir;
uniform float uFade;
uniform vec3 uSun;
uniform vec3 uLamp;
uniform vec3 uC;
uniform vec3 uFeet;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uHaze;
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
varying vec3 vW;
${Oe}
${E0}

float band(float x, float c, float w) { return 1.0 - smoothstep(w * 0.6, w, abs(x - c)); }
float segd(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// The landscape outside the window, as a function of direction only, so it
// reads as far away from wherever it is seen.
vec3 outside(vec3 d) {
  float el = d.y;
  float az = atan(d.z, d.x);
  vec3 sky = mix(vec3(0.95, 0.94, 0.89), vec3(0.66, 0.77, 0.88), smoothstep(0.0, 0.55, el));
  vec2 cp = vec2(az * 2.2 + uTime * 0.006, el * 5.0 / (el + 0.25));
  float cl = fbm(cp * 2.0);
  sky = mix(sky, vec3(0.99, 0.98, 0.95), smoothstep(0.52, 0.72, cl) * 0.85);
  float h1 = 0.05 + 0.05 * fbm(vec2(az * 3.0, 1.3));
  float h2 = -0.03 + 0.045 * fbm(vec2(az * 6.5, 4.1));
  vec3 col = sky;
  if (el < h1) col = mix(vec3(0.62, 0.7, 0.72), sky, 0.35);
  // a row of poplars along the nearer hedge
  float pc = az * 9.0;
  float pi = floor(pc);
  float pf = fract(pc) - 0.5;
  float ph = hash12(vec2(pi, 2.0));
  float tall = h2 + 0.06 + 0.1 * ph;
  float wid = 0.12 * (1.0 - smoothstep(h2, tall, el)) * step(0.45, ph);
  if (abs(pf) < wid && el < tall) col = vec3(0.3, 0.38, 0.27) * (0.85 + 0.3 * vnoise(vec2(az * 200.0, el * 90.0)));
  if (el < h2) {
    float f = fbm(vec2(az * 30.0, el * 80.0));
    col = mix(vec3(0.42, 0.53, 0.32), vec3(0.6, 0.6, 0.36), step(0.5, fract(az * 4.0 + el * 9.0))) * (0.85 + 0.25 * f);
  }
  return col;
}

void main() {
  if (uFade < 0.999 && hash12(gl_FragCoord.xy) > uFade) discard;
  vec3 n = normalize(vN);
  float pat = floor(vM.x + 0.5);
  vec2 uv = vUV;
  float fw = max(fwidth(uv.x), fwidth(uv.y));
  vec3 base = vC;
  float tex = 1.0;
  float lines = 0.0;
  float emit = 0.0;

  if (pat == 4.0) {            // floorboards
    float pw = 0.15;
    float row = floor(uv.y / pw);
    float fy = fract(uv.y / pw) * pw;
    float L = 1.7;
    float x = uv.x / L + hash12(vec2(row, 3.1));
    float fx = fract(x) * L;
    float d = min(min(fy, pw - fy), min(fx, L - fx));
    float l = lod(pw, fw);
    float grain = vnoise(vec2(uv.x * 2.5, uv.y * 70.0 + row * 7.0));
    tex = mix(1.0, 0.84 + 0.2 * grain + 0.16 * (hash12(vec2(floor(x), row)) - 0.5), l);
    lines = lineMask(d, 0.0025) * l * 0.85;
  } else if (pat == 5.0) {     // plaster
    tex = 0.95 + 0.07 * fbm(uv * 1.5) + 0.03 * vnoise(uv * 14.0);
  } else if (pat == 6.0) {     // wood grain on furniture
    float l = lod(0.05, fw);
    tex = mix(1.0, 0.86 + 0.22 * vnoise(vec2(uv.x * 3.0 + uv.y * 0.4, uv.y * 45.0)), l);
  } else if (pat == 8.0) {     // cloth: soft folds + weave
    tex = 0.9 + 0.08 * sin(uv.x * 40.0 + 2.0 * fbm(uv * 3.0)) + 0.04 * vnoise(uv * 120.0);
  } else if (pat == 9.0) {     // foliage
    tex = 0.7 + 0.5 * fbm(uv * 18.0);
  } else if (pat == 20.0) {    // wallpaper: stripes with a small lozenge
    float cw = 0.19;
    float sx = uv.x / cw;
    float fx = fract(sx) - 0.5;
    float l = lod(cw, fw);
    float bandC = 1.0 - smoothstep(0.17, 0.2, abs(fx));
    float ry = uv.y / 0.23 + 0.5 * mod(floor(sx), 2.0);
    vec2 m = vec2(fx * cw, (fract(ry) - 0.5) * 0.23);
    float dm = abs(m.x) / 0.022 + abs(m.y) / 0.038;
    float motif = 1.0 - smoothstep(0.8, 1.0, dm);
    tex = mix(1.0, 0.95 + 0.06 * bandC - 0.2 * motif, l) * (0.96 + 0.06 * fbm(uv * 2.5));
    lines = (lineMask(abs(abs(fx) - 0.2) * cw, 0.0011) * 0.55 + lineMask(abs(dm - 1.0) * 0.02, 0.0009) * 0.4) * l;
  } else if (pat == 21.0) {    // the rug
    vec2 sz = vec2(2.6, 1.9);
    vec2 q = uv;
    vec2 de2 = min(q, sz - q);
    float de = min(de2.x, de2.y);
    vec2 c = q - sz * 0.5;
    vec3 red = vec3(0.66, 0.3, 0.24), navy = vec3(0.27, 0.33, 0.46), cream = vec3(0.9, 0.85, 0.72), ochre = vec3(0.8, 0.63, 0.34);
    base = red;
    float l = lod(0.1, fw);
    if (de < 0.22) {
      base = navy;
      float s = de2.x < de2.y ? q.y : q.x;
      float mm = abs(fract(s / 0.17) - 0.5) * 0.17;
      float dd = mm + abs(de - 0.11);
      base = mix(base, ochre, (1.0 - smoothstep(0.05, 0.058, dd)) * l);
      base = mix(base, cream, (1.0 - smoothstep(0.022, 0.03, dd)) * l);
      lines = (lineMask(abs(de - 0.22), 0.004) + lineMask(abs(de - 0.03), 0.003)) * l;
    } else {
      base = mix(cream, ochre, 0.25);
      vec2 g = vec2(c.x + c.y, c.x - c.y) / 0.32;
      vec2 gf = abs(fract(g) - 0.5);
      float lat = min(gf.x, gf.y);
      base = mix(base, red, (1.0 - smoothstep(0.035, 0.06, lat)) * l * 0.85);
      float dot2 = length(abs(fract(g + 0.5) - 0.5));
      base = mix(base, navy, (1.0 - smoothstep(0.1, 0.13, dot2)) * l);
      float md = abs(c.x) / 0.62 + abs(c.y) / 0.44;
      if (md < 1.0) base = navy;
      if (md < 0.8) base = cream;
      if (md < 0.62) base = red;
      if (md < 0.32) base = ochre;
      lines = max(lines, lineMask(abs(md - 1.0) * 0.3, 0.003) * l);
    }
    tex = 0.86 + 0.16 * vnoise(uv * 140.0) + 0.06 * fbm(uv * 3.0);
  } else if (pat == 22.0) {    // book spine (uv 0..1)
    float h = hash12(floor(vC.rg * 251.0) + floor(vC.b * 97.0));
    float v = uv.y;
    float gilt = band(v, 0.07, 0.012) + band(v, 0.93, 0.012) + step(0.6, h) * (band(v, 0.12, 0.008) + band(v, 0.88, 0.008));
    float label = step(0.5, h) * step(0.6, v) * step(v, 0.74);
    float title = step(0.25, uv.x) * step(uv.x, 0.75) * band(fract(v * 26.0), 0.5, 0.18) * step(0.3, v) * step(v, 0.56);
    base = mix(base, base * 0.5, label);
    base = mix(base, vec3(0.82, 0.7, 0.42), clamp(gilt + title * 0.6, 0.0, 1.0));
    tex = 0.9 + 0.14 * vnoise(uv * vec2(6.0, 40.0));
    lines = (band(v, 0.6, 0.012) + band(v, 0.74, 0.012)) * step(0.5, h) * 0.6;
  } else if (pat == 23.0) {    // picture: a landscape
    vec2 p = uv;
    float hz = 0.46 + 0.06 * sin(p.x * 5.0 + 1.0) + 0.025 * sin(p.x * 17.0);
    float hz2 = 0.3 + 0.09 * sin(p.x * 2.6 + 2.5);
    base = mix(vec3(0.86, 0.85, 0.76), vec3(0.62, 0.7, 0.76), p.y);
    if (p.y < hz) base = vec3(0.5, 0.56, 0.48);
    if (p.y < hz2) base = vec3(0.6, 0.56, 0.38);
    float path = abs(p.x - 0.7 - 0.25 * (0.3 - p.y) - 0.05 * sin(p.y * 20.0)) - 0.02 * (0.35 - p.y) * 4.0;
    if (p.y < hz2 && path < 0.0) base = vec3(0.8, 0.74, 0.58);
    vec2 tp = p - vec2(0.32, hz2 + 0.02);
    float crown = length(tp * vec2(1.0, 0.8) - vec2(0.0, 0.17)) - 0.11;
    float trunk = max(abs(tp.x) - 0.012, max(-tp.y, tp.y - 0.12));
    if (min(crown, trunk) < 0.0) base = vec3(0.28, 0.33, 0.24);
    float l = lod(0.05, fw);
    lines = (lineMask(abs(p.y - hz), 0.0025) + lineMask(abs(p.y - hz2), 0.003) + lineMask(abs(crown), 0.003)) * l;
    lines += (1.0 - smoothstep(0.2, 0.35, abs(fract((p.x * 0.6 + p.y) * 70.0) - 0.5))) * step(p.y, hz2) * 0.3 * l;
  } else if (pat == 24.0) {    // picture: tumbling blocks (rhombille tiling)
    vec2 p = uv * 7.0 + vec2(0.25, 0.1);
    vec2 r = vec2(1.0, 1.7320508);
    vec2 hh = r * 0.5;
    vec2 a = mod(p, r) - hh;
    vec2 b = mod(p - hh, r) - hh;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    float ang = atan(gv.y, gv.x);
    float s;
    if (ang > 0.5236 && ang < 2.618) s = 0.92;
    else if (ang >= 2.618 || ang < -1.5708) s = 0.56;
    else s = 0.3;
    base = mix(vec3(0.8, 0.74, 0.62), vec3(0.95, 0.92, 0.84), s) * s * 1.05;
    float l = lod(0.14, fw);
    float hexd = 0.5 - max(dot(abs(gv), normalize(r)), abs(gv.x));
    float dA = abs(gv.x) + 9.0 * step(0.0, gv.y);
    vec2 u1 = vec2(0.8660254, 0.5), u2 = vec2(-0.8660254, 0.5);
    float sp1 = abs(gv.x * u1.y - gv.y * u1.x) + 9.0 * step(dot(gv, u1), 0.0);
    float sp2 = abs(gv.x * u2.y - gv.y * u2.x) + 9.0 * step(dot(gv, u2), 0.0);
    float sp = min(dA, min(sp1, sp2));
    lines = max(lineMask(hexd / 7.0, 0.0018), lineMask(sp / 7.0, 0.0018)) * l;
  } else if (pat == 25.0) {    // picture: a sea chart
    vec2 p = uv * 2.6 + vec2(3.0, 1.0);
    float e = fbm(p * 1.4);
    base = vec3(0.86, 0.8, 0.64);
    float land = smoothstep(0.495, 0.505, e);
    base = mix(base * vec3(0.93, 0.96, 1.0), base * vec3(0.98, 0.92, 0.8), land);
    float l = lod(0.04, fw);
    float coast = lineMask(abs(e - 0.5) * 0.4, 0.0018);
    float sea = (1.0 - land) * (1.0 - smoothstep(0.15, 0.3, abs(fract((0.5 - e) * 22.0) - 0.5))) * step(0.36, e);
    vec2 cr = uv - vec2(0.3, 0.3);
    float ca = atan(cr.y, cr.x);
    float rh = abs(fract(ca / 6.2831853 * 16.0) - 0.5) * length(cr) * 0.4;
    float rose = 1.0 - smoothstep(0.0, 0.002, rh);
    lines = (coast + sea * 0.45 + rose * 0.25 + lineMask(abs(length(cr) - 0.06), 0.002)) * l;
  } else if (pat == 26.0) {    // picture: a botanical study
    vec2 p = uv;
    base = vec3(0.9, 0.87, 0.78);
    float sx = 0.33 + 0.04 * sin(p.y * 6.0);
    float stem = abs(p.x - sx) - 0.004;
    float leaf = 9.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float y0 = 0.18 + fi * 0.12;
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 o = vec2(0.33 + 0.04 * sin(y0 * 6.0) + side * 0.07, y0 + 0.04);
      vec2 q = p - o;
      float an = side * 0.7;
      q = mat2(cos(an), -sin(an), sin(an), cos(an)) * q;
      leaf = min(leaf, length(q / vec2(0.075, 0.03)) - 1.0);
    }
    float flower = length(p - vec2(sx, 0.9)) - 0.045;
    if (leaf < 0.0) base = vec3(0.42, 0.52, 0.34);
    if (flower < 0.0) base = vec3(0.68, 0.32, 0.26);
    float l = lod(0.03, fw);
    lines = (lineMask(abs(leaf) * 0.03, 0.0015) + lineMask(max(stem, 0.0), 0.0015) * step(p.y, 0.86) + lineMask(abs(flower), 0.002)) * l;
  } else if (pat == 27.0) {    // the view through the window
    base = outside(normalize(vW - cameraPosition));
    emit = 1.0;
  } else if (pat == 28.0) {    // lamp glow
    base = vec3(1.0, 0.95, 0.78);
    emit = 1.0;
  } else if (pat == 29.0) {    // clock dial (uv 0..1)
    vec2 p = uv - 0.5;
    float r = length(p);
    base = vec3(0.92, 0.88, 0.76);
    float a = atan(p.x, p.y);
    float l = lod(0.02, fw);
    float tick = step(0.36, r) * step(r, 0.43) * (1.0 - smoothstep(0.0, 0.06, abs(fract(a / 6.2831853 * 12.0 + 0.5) - 0.5)));
    float mins = step(0.4, r) * step(r, 0.43) * (1.0 - smoothstep(0.0, 0.12, abs(fract(a / 6.2831853 * 60.0 + 0.5) - 0.5)));
    float hrA = uClock / 43200.0 * 6.2831853;
    float mnA = uClock / 3600.0 * 6.2831853;
    float hr = segd(p, vec2(0.0), 0.22 * vec2(sin(hrA), cos(hrA)));
    float mn = segd(p, vec2(0.0), 0.34 * vec2(sin(mnA), cos(mnA)));
    lines = max(max(tick, mins * 0.7), max(lineMask(hr, 0.018), lineMask(mn, 0.011))) * l;
    lines = max(lines, lineMask(abs(r - 0.45), 0.008) * l);
    lines *= 1.6;
  } else if (pat == 30.0) {    // paper with handwriting
    base = vec3(0.94, 0.91, 0.83);
    float l = lod(0.012, fw);
    float row = floor(uv.y / 0.012);
    float fy = fract(uv.y / 0.012);
    float word = step(0.35, vnoise(vec2(uv.x * 60.0, row * 3.1)));
    float ink = (1.0 - smoothstep(0.1, 0.25, abs(fy - 0.5 - 0.15 * sin(uv.x * 900.0 + row)))) * word * step(hash12(vec2(row, 1.0)), 0.85);
    lines = ink * l * 0.5;
  } else if (pat == 31.0) {    // panelling
    float pwid = 0.62;
    float fx = fract(uv.x / pwid) * pwid;
    float dx = min(fx, pwid - fx);
    float d = min(dx - 0.06, min(uv.y - 0.22, 0.84 - uv.y));
    float l = lod(0.06, fw);
    float bevel = smoothstep(0.0, 0.035, d);
    tex = mix(1.0, (0.86 + 0.14 * bevel) * (0.88 + 0.2 * vnoise(vec2(uv.x * 3.0, uv.y * 50.0))), l);
    lines = (lineMask(abs(d), 0.002) + lineMask(abs(d - 0.035), 0.0015) * 0.6) * l;
  } else if (pat == 32.0) {    // door leaf: four panels (uv in metres, 0.9 x 2.05)
    vec2 q = uv;
    float l = lod(0.06, fw);
    float d1 = min(min(q.x - 0.12, 0.43 - q.x), min(q.y - 1.05, 1.9 - q.y));
    float d2 = min(min(q.x - 0.47, 0.78 - q.x), min(q.y - 1.05, 1.9 - q.y));
    float d3 = min(min(q.x - 0.12, 0.43 - q.x), min(q.y - 0.15, 0.9 - q.y));
    float d4 = min(min(q.x - 0.47, 0.78 - q.x), min(q.y - 0.15, 0.9 - q.y));
    float d = max(max(d1, d2), max(d3, d4));
    float bevel = smoothstep(0.0, 0.04, d);
    tex = mix(1.0, (0.86 + 0.14 * bevel) * (0.88 + 0.2 * vnoise(vec2(uv.x * 3.0, uv.y * 50.0))), l);
    lines = (lineMask(abs(d), 0.002) + lineMask(abs(d - 0.04), 0.0015) * 0.6) * l;
  } else if (pat == 33.0) {    // brass
    tex = 0.85 + 0.3 * smoothstep(0.2, 0.9, max(dot(n, normalize(vec3(0.3, 1.0, 0.4))), 0.0));
  }

  // light: soft daylight from the window, a hemisphere fill and the desk lamp
  float sun = max(dot(n, uSun), 0.0);
  vec3 toL = uLamp - vW;
  float dl = length(toL);
  float lamp = max(dot(n, toL / dl), 0.0) * 0.55 / (1.0 + dl * dl * 6.0);
  float shade = 0.64 + 0.12 * n.y + 0.42 * sun;
  // occlusion in the corners of the room and under the pedestal and the artist
  float ao = 1.0;
  ao *= 1.0 - 0.22 * exp(-(2.8 - abs(vW.x)) * 5.0);
  ao *= 1.0 - 0.22 * exp(-(2.3 - abs(vW.z)) * 5.0);
  ao *= 1.0 - 0.16 * exp(-vW.y * 6.0);
  ao *= 1.0 - 0.18 * exp(-(2.9 - vW.y) * 6.0);
  ao *= 1.0 - 0.45 * exp(-length(vW.xz - uC.xz) / 0.16) * step(vW.y, 0.02);
  ao *= 1.0 - 0.35 * exp(-length(vW.xz - uFeet.xz) / 0.2) * step(vW.y, 0.02);
  vec3 light = vec3(shade * ao) + lamp * vec3(1.0, 0.8, 0.52);
  vec3 col = base * tex * mix(light, vec3(1.0), emit);
  col *= 1.0 - 0.55 * lines;

  float e = min(min(vE.x, vE.y), vE.z);
  float ef = max(fwidth(e), 1e-5);
  float ink = 1.0 - smoothstep(ef * 0.55, ef * 1.55, e);
  ink *= 1.0 - emit;

  // hatching runs in world space, projected on the face's dominant plane
  vec3 an = abs(n);
  vec2 huv = an.x > an.y && an.x > an.z ? vW.zy : (an.z > an.y ? vW.xy : vW.xz);
  float hfw = fwidth(huv.x) + fwidth(huv.y);
  float face = an.x > an.z ? 1.0 : 0.0;
  // a little aerial perspective in the main view sets the ball off from the room behind it
  float air = uAir * smoothstep(1.4, 4.5, length(vW - cameraPosition));
  vec3 outc = finish(col, max(emit * 0.35, air), ink * (1.0 - air), huv, hfw, face);
  gl_FragColor = vec4(outc, uCubePass > 0.5 ? length(vW - uC) : 1.0);
}
`;function It(e,t={value:1}){return new $.ShaderMaterial({uniforms:{...e,uFade:t},vertexShader:S0,fragmentShader:M0})}var R0=`
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,A0=`
uniform samplerCube uEnv;
uniform vec3 uC;
uniform float uR;
uniform float uLitho;
uniform float uMark;
uniform float uSize;
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec3 vW;
${Oe}

const int STEPS = 30;
const int REFINE = 6;
const float TMAX = 7.0;

float surf(vec3 x) { return length(x) - textureLod(uEnv, x, 0.0).a; }

vec3 trace(vec3 P, vec3 R) {
  vec3 x0 = P - uC;
  float f0 = surf(x0);
  if (f0 >= 0.0) return x0;
  float t0 = 0.0, t1 = TMAX, f1 = 1.0;
  for (int i = 1; i <= STEPS; i++) {
    float s = float(i) / float(STEPS);
    float t = TMAX * s * s;
    float f = surf(x0 + R * t);
    if (f > 0.0) { t1 = t; f1 = f; break; }
    t0 = t; f0 = f;
  }
  for (int j = 0; j < REFINE; j++) {
    float tm = mix(t0, t1, clamp(f0 / (f0 - f1), 0.15, 0.85));
    float fm = surf(x0 + R * tm);
    if (fm > 0.0) { t1 = tm; f1 = fm; } else { t0 = tm; f0 = fm; }
  }
  return x0 + R * mix(t0, t1, f0 / (f0 - f1));
}

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vW - ro);
  vec3 oc = ro - uC;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uR * uR;
  float h = max(b * b - c, 0.0);
  float t = -b - sqrt(h);
  vec3 P = ro + rd * t;
  vec3 n = normalize(P - uC);
  vec3 R = reflect(rd, n);
  vec3 X = trace(P, R);
  // filter the lookup by how much of the cube map one pixel covers (the rim is very compressed)
  vec3 Xn = normalize(X);
  float texels = length(fwidth(Xn)) * uSize / 1.5708;
  vec3 col = textureLod(uEnv, X, clamp(log2(max(texels, 1.0)), 0.0, 4.5)).rgb;

  // silvered glass: high reflectance, rising to 1 at grazing incidence
  float cosi = clamp(-dot(rd, n), 0.0, 1.0);
  float F = 0.9 + 0.1 * pow(1.0 - cosi, 5.0);
  vec3 dark = mix(vec3(0.05, 0.05, 0.06), uInk, uLitho);
  col = mix(dark, col * mix(vec3(0.95, 0.96, 0.99), vec3(1.0), uLitho), F);
  col += (hash12(gl_FragCoord.xy) - 0.5) * 0.025;

  // the ink line round the silhouette: q is the eye ray's distance from the centre
  vec3 m = oc - b * rd;
  float q = length(m);
  float ew = max(fwidth(q), 1e-6);
  float ink = 1.0 - smoothstep(ew * 0.6, ew * 2.0, uR - q);
  col = mix(col, uInk, ink * 0.92);

  // marks round the centre of the disc, where the eye sees itself
  if (uMark > 0.001) {
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec2 s2 = vec2(dot(m, right), dot(m, up)) / uR;
    float rr = length(s2);
    float arm = min(abs(s2.x), abs(s2.y));
    float w = fwidth(rr);
    float tick = (1.0 - smoothstep(w * 0.8, w * 1.8, arm)) * smoothstep(0.155, 0.16, rr) * (1.0 - smoothstep(0.235, 0.24, rr));
    float ring = 1.0 - smoothstep(w * 0.5, w * 1.5, abs(rr - 0.16));
    col = mix(col, vec3(0.64, 0.23, 0.16), max(tick, ring * 0.0) * uMark);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;function Ue(e,t,o,a){return new $.ShaderMaterial({uniforms:{uEnv:{value:t},uC:e.uC,uR:{value:o},uLitho:e.uLitho,uMark:{value:0},uSize:{value:a},uPaper:e.uPaper,uInk:e.uInk},vertexShader:R0,fragmentShader:A0})}var Wt=30/38,ae=.85,We=Jt-N.c.y,qe=Math.sqrt(ae*ae-We*We),T0=.62,k0=2*Math.PI/100,it={az:.5,el:1.12,dist:6.6,fov:36,target:new w.Vector3(0,.95,0)},qt=10631978,Mt=document.getElementById("scene"),W=new w.WebGLRenderer({canvas:Mt,antialias:!0,powerPreference:"high-performance"});W.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var Ge=new w.Color(15525333);W.setClearColor(Ge,1);var C=De();C.uC.value.copy(N.c);var F=new w.Scene,ht=_e();C.uLamp.value.copy(ht.lamp);var Lt={};for(let[e,t]of Object.entries(ht.groups)){let o={value:1},a=new w.Mesh(t,It(C,o));a.frustumCulled=!1,F.add(a),Lt[e]={mesh:a,fade:o,cur:1}}var St=new w.Mesh(ht.view,It(C));St.frustumCulled=!1;F.add(St);var Nt=new w.Group;Nt.position.copy(ht.pendulumAt.position);Nt.rotation.y=ht.pendulumAt.rotationY;var me=new w.Mesh(ht.pendulum,Lt.W.mesh.material);me.frustumCulled=!1;Nt.add(me);F.add(Nt);var H0=It(C),rt=Ie(H0);F.add(rt.group);var je=new w.WebGLCubeRenderTarget(512,{type:w.HalfFloatType,generateMipmaps:!0,minFilter:w.LinearMipmapLinearFilter}),he=new w.CubeCamera(.05,30,je);he.position.copy(N.c);F.add(he);var se=Ue(C,je.texture,N.r,512),Ht=new w.Mesh(new w.SphereGeometry(N.r,144,108),se);Ht.position.copy(N.c);F.add(Ht);var ie=[-.985,-.82,-.56,-.28,.28,.56,.82,.985],Ye=new w.Vector2(1,1),ve=(e,t,o)=>new bt({color:e,linewidth:t,dashed:o,dashSize:.045,gapSize:.03,transparent:!0,opacity:0,resolution:Ye,worldUnits:!1}),Dt=new yt(new st,ve(2761760,2,!0)),xe=new yt(new st,ve(qt,2.2,!1)),be=new yt(new st,ve(qt,4.5,!1));for(let e of[Dt,xe,be])e.frustumCulled=!1,e.renderOrder=5,F.add(e);var L0=new w.SphereGeometry(.03,12,8),P0=new w.MeshBasicMaterial({color:qt,transparent:!0,opacity:0}),mt=new w.InstancedMesh(L0,P0,ie.length+1);mt.frustumCulled=!1;mt.renderOrder=6;F.add(mt);var Vt=new w.Mesh(new w.SphereGeometry(.035,16,10),new w.MeshBasicMaterial({color:qt,transparent:!0,opacity:0,depthTest:!1}));Vt.renderOrder=7;F.add(Vt);var te=[Dt,xe,be,mt,Vt],{W:re,D:le,H:ce}=Zt,Ne=new w.Ray,fe=new w.Vector3,Xe=new w.Box3;function B0(e,t){let o=1/0;for(let a=0;a<3;a++){let n=[re/2,ce/2,le/2][a],i=a===1?ce/2:0,s=t.getComponent(a),r=e.getComponent(a)-i;if(Math.abs(s)>1e-9){let c=((s>0?n:-n)-r)/s;c>0&&(o=Math.min(o,c))}}Ne.set(e,t);for(let a of[...ht.boxes,Xe])a.containsPoint(e)||Ne.intersectBox(a,fe)&&(o=Math.min(o,fe.distanceTo(e)));return o}var ee=[],oe=[];function C0(e){let t=N.c,o=N.r,a=t.clone().sub(e),n=a.length();a.normalize();let i=new w.Vector3().crossVectors(a,new w.Vector3(0,1,0)).normalize();ee.length=0,oe.length=0;let s=new w.Matrix4;ie.forEach((c,m)=>{let d=Math.asin(c*o/n),u=a.clone().multiplyScalar(Math.cos(d)).addScaledVector(i,Math.sin(d)),l=e.clone().sub(t),f=l.dot(u),b=l.lengthSq()-o*o,p=-f-Math.sqrt(Math.max(0,f*f-b)),v=e.clone().addScaledVector(u,p),y=v.clone().sub(t).normalize(),S=u.clone().addScaledVector(y,-2*u.dot(y)),M=B0(v.clone().addScaledVector(S,.001),S),x=v.clone().addScaledVector(S,Math.min(M,9));ee.push(e.x,e.y,e.z,v.x,v.y,v.z),oe.push(v.x,v.y,v.z,x.x,x.y,x.z),mt.setMatrixAt(m,s.makeTranslation(x.x,x.y,x.z))});let r=e.clone().addScaledVector(a,n-o);mt.setMatrixAt(ie.length,s.makeTranslation(r.x,r.y,r.z)),mt.instanceMatrix.needsUpdate=!0,Dt.geometry.setPositions(ee),Dt.computeLineDistances(),xe.geometry.setPositions(oe),be.geometry.setPositions([e.x,e.y,e.z,r.x,r.y,r.z]),Vt.position.copy(e)}var pt=new w.PerspectiveCamera(45,Wt,.02,40),Tt=new w.PerspectiveCamera(45,1,.02,40),tt=new w.PerspectiveCamera(45,Wt,.02,60),Ot=Wt,ue=300,de=380,$e=Math.asin(N.r/ae),z0=e=>w.MathUtils.radToDeg(2*Math.atan(Math.tan($e)/T0/Math.min(1,e))),V=new w.Vector3;function _0(e,t){return t.set(Math.sin(e)*qe,Jt,Math.cos(e)*qe)}var Ke=new w.Vector3;function I0(){let e=Math.cos(it.el);Ke.set(Math.sin(it.az)*e,Math.sin(it.el),Math.cos(it.az)*e).multiplyScalar(it.dist).add(it.target)}I0();var Ut=document.getElementById("inset");Ae(Wt,(e,t)=>{ue=e,de=t,W.setSize(e,t),Ot=e/t,Ye.set(e*W.getPixelRatio(),t*W.getPixelRatio());let o=Math.round(Math.min(e,t)*(e<420?.4:.36));Ut.style.width=Ut.style.height=`${o}px`});var E={phi:2.7,playing:!0,litho:1,lithoTarget:1,rays:!1,k:0,t:0,mark:0,markHold:0,dirty:3};Te();ke([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{E.lithoTarget=e},1);var Ze=Le(e=>{E.playing=e}),pe=document.getElementById("btn-rays"),O0=document.getElementById("hint");function Ft(e){E.rays=e,pe.setAttribute("aria-pressed",String(e)),pe.querySelector("span").textContent=e?"Back to the artist\u2019s eye":"Show the rays",O0.textContent=e?"Drag to walk the artist round the sphere \xB7 the inset is what they see":"Drag to walk round the sphere",Pe(e,"Seen from outside \xB7 the red ray returns to the eye")}pe.addEventListener("click",()=>Ft(!E.rays));He({" ":()=>Ze(!E.playing),l:()=>document.getElementById(E.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>Ft(!E.rays),ArrowLeft:()=>{E.phi-=.12,E.markHold=1.5},ArrowRight:()=>{E.phi+=.12,E.markHold=1.5}});var kt=null;Mt.addEventListener("pointerdown",e=>{Mt.setPointerCapture(e.pointerId),kt={x:e.clientX}});Mt.addEventListener("pointermove",e=>{if(!kt)return;let t=e.clientX-kt.x;kt.x=e.clientX,E.phi-=t*(E.k>.5?.012:.006),E.markHold=1.5});var Qe=()=>{kt=null};Mt.addEventListener("pointerup",Qe);Mt.addEventListener("pointercancel",Qe);var D0=(()=>{let e=new Date;return e.getHours()*3600+e.getMinutes()*60+e.getSeconds()})(),U0=e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2,W0=(e,t,o)=>e+(t-e)*o,Ve=performance.now(),Fe=NaN;function ne(e){for(let t of Object.values(Lt))t.fade.value=e?1:t.cur}function Je(e){let t=Math.min(.05,Math.max(0,(e-Ve)/1e3));Ve=e,E.playing&&(E.t+=t,E.phi+=k0*t),C.uTime.value=E.t,C.uClock.value=D0+E.t,E.litho!==E.lithoTarget&&(E.litho+=Math.sign(E.lithoTarget-E.litho)*Math.min(Math.abs(E.lithoTarget-E.litho),t*2.2),C.uLitho.value=E.litho,W.setClearColor(Ge.clone().lerp(new w.Color(15328988),1-E.litho),1),E.dirty=1),_0(E.phi,V),rt.group.position.set(V.x,0,V.z),rt.group.rotation.y=E.phi,rt.arm.rotation.set(.05*Math.sin(E.t*2.3),.08*Math.sin(E.t*1.7),0),Xe.setFromCenterAndSize(new w.Vector3(V.x,.88,V.z),new w.Vector3(.44,1.76,.44)),C.uFeet.value.set(V.x,0,V.z),me.rotation.z=.075*Math.sin(E.t*Math.PI),(E.playing||E.phi!==Fe)&&(E.dirty=1),Fe=E.phi,pt.fov=z0(Ot),pt.aspect=Ot,pt.position.copy(V),pt.up.set(0,1,0),pt.lookAt(N.c),pt.updateProjectionMatrix();let o=E.rays?1:0;E.k+=Math.sign(o-E.k)*Math.min(Math.abs(o-E.k),t/2);let a=U0(E.k);tt.position.lerpVectors(V,Ke,a),tt.fov=W0(pt.fov,it.fov,a),tt.aspect=Ot,tt.up.set(0,1,0),tt.lookAt(fe.copy(N.c).lerp(it.target,a)),tt.updateProjectionMatrix();let n=tt.position,i=.02,s={N:n.z<-le/2+i,S:n.z>le/2-i,E:n.x>re/2-i,W:n.x<-re/2+i,ceiling:n.y>ce-i,core:!1};for(let[u,l]of Object.entries(Lt)){let f=s[u]?0:1;l.cur+=Math.sign(f-l.cur)*Math.min(Math.abs(f-l.cur),t*3)}let r=!(s.N||s.S||s.E||s.W||s.ceiling);E.markHold=Math.max(0,E.markHold-t);let c=E.markHold>0?1:0;if(E.mark+=Math.sign(c-E.mark)*Math.min(Math.abs(c-E.mark),t*3),E.dirty>0){ne(!0),St.visible=!0,rt.group.visible=!0,Ht.visible=!1;for(let u of te)u.visible=!1;C.uHatch.value=.011,C.uAir.value=0,C.uCubePass.value=1,he.update(W,F),C.uCubePass.value=0,E.dirty=Math.max(0,E.dirty-1)}ne(!1),St.visible=r,rt.group.visible=tt.position.distanceTo(V)>.3,Ht.visible=!0;let m=Math.max(0,(E.k-.6)/.4);for(let u of te)u.visible=m>.01,u.material.opacity=m;m>.01&&C0(V),se.uniforms.uMark.value=E.mark*(1-a),C.uHatch.value=.0045,C.uAir.value=.22*(1-a),W.setScissorTest(!1),W.setViewport(0,0,ue,de),W.render(F,tt);let d=E.k>.98;if(Ut.classList.toggle("on",d),d){let u=parseFloat(Ut.style.width),l=ue-u-10,f=de-u-10;ne(!0),St.visible=!0,rt.group.visible=!1;for(let b of te)b.visible=!1;Tt.position.copy(V),Tt.fov=w.MathUtils.radToDeg(2*Math.atan(Math.tan($e)/.8)),Tt.lookAt(N.c),Tt.updateProjectionMatrix(),se.uniforms.uMark.value=1,C.uAir.value=0,W.setScissorTest(!0),W.setScissor(l,f,u,u),W.setViewport(l,f,u,u),W.render(F,Tt),W.setScissorTest(!1)}requestAnimationFrame(Je)}Ft(!1);Be();requestAnimationFrame(Je);window.__page={state:E,setRays:Ft,setPlaying:Ze,renderer:W,camera:tt,eye:V,scene:F,groups:Lt,sphere:Ht,artist:rt,viewMesh:St,shared:C,THREE:w};})();
