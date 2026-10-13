(()=>{var wn=Object.create;var Ae=Object.defineProperty;var gn=Object.getOwnPropertyDescriptor;var En=Object.getOwnPropertyNames;var xn=Object.getPrototypeOf,bn=Object.prototype.hasOwnProperty;var yn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var Sn=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of En(t))!bn.call(e,s)&&s!==n&&Ae(e,s,{get:()=>t[s],enumerable:!(o=gn(t,s))||o.enumerable});return e};var lt=(e,t,n)=>(n=e!=null?wn(xn(e)):{},Sn(t||!e||!e.__esModule?Ae(n,"default",{value:e,enumerable:!0}):n,e));var rt=yn((so,ke)=>{ke.exports=window.THREE});var G=lt(rt(),1);var gt=lt(rt(),1);function Be(){return{uTime:{value:0},uLitho:{value:1},uLight:{value:new gt.Vector3(.1,.9,.66).normalize()},uPaper:{value:new gt.Vector3(.925,.898,.835)},uInk:{value:new gt.Vector3(.11,.1,.09)},uHaze:{value:new gt.Vector3(.83,.86,.84)},uBg:{value:new gt.Vector3(.925,.898,.835)}}}var Mn=`
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
`,Tn=`
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
`,Rn=`
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
  vN = normalize(mat3(modelMatrix) * normal);
  vC = acol;
  vUV = fuv;
  vE = edge;
  vM = amat;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Hn=`
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
varying vec3 vN;
varying vec3 vC;
varying vec2 vUV;
varying vec3 vE;
varying vec3 vM;
${Mn}
${Tn}

void main() {
  vec3 n = normalize(vN);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.36 + 0.66 * diff;
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
`;function Rt(e,t={}){let n=new gt.ShaderMaterial({uniforms:{...e,uFade:{value:t.fade??1},uCue:{value:t.cue??1},uHatch:{value:t.hatch??1}},vertexShader:Rn,fragmentShader:Hn,transparent:!!t.transparent,side:t.side??gt.FrontSide});return t.offset&&(n.polygonOffset=!0,n.polygonOffsetFactor=t.offset,n.polygonOffsetUnits=t.offset),n}var zt=lt(rt(),1);var B=lt(rt(),1);var N=lt(rt(),1),Le=new N.Box3,te=new N.Vector3,Ut=class extends N.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],o=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(o),this.setAttribute("position",new N.Float32BufferAttribute(t,3)),this.setAttribute("uv",new N.Float32BufferAttribute(n,2))}applyMatrix4(t){let n=this.attributes.instanceStart,o=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(t),o.applyMatrix4(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let n;t instanceof Float32Array?n=t:Array.isArray(t)&&(n=new Float32Array(t));let o=new N.InstancedInterleavedBuffer(n,6,1);return this.setAttribute("instanceStart",new N.InterleavedBufferAttribute(o,3,0)),this.setAttribute("instanceEnd",new N.InterleavedBufferAttribute(o,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let n;t instanceof Float32Array?n=t:Array.isArray(t)&&(n=new Float32Array(t));let o=new N.InstancedInterleavedBuffer(n,6,1);return this.setAttribute("instanceColorStart",new N.InterleavedBufferAttribute(o,3,0)),this.setAttribute("instanceColorEnd",new N.InterleavedBufferAttribute(o,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new N.WireframeGeometry(t.geometry)),this}fromLineSegments(t){let n=t.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new N.Box3);let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;t!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(t),Le.setFromBufferAttribute(n),this.boundingBox.union(Le))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new N.Sphere),this.boundingBox===null&&this.computeBoundingBox();let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(t!==void 0&&n!==void 0){let o=this.boundingSphere.center;this.boundingBox.getCenter(o);let s=0;for(let i=0,c=t.count;i<c;i++)te.fromBufferAttribute(t,i),s=Math.max(s,o.distanceToSquared(te)),te.fromBufferAttribute(n,i),s=Math.max(s,o.distanceToSquared(te));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};var J=lt(rt(),1);J.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new J.Vector2},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};J.ShaderLib.line={uniforms:J.UniformsUtils.merge([J.UniformsLib.common,J.UniformsLib.fog,J.UniformsLib.line]),vertexShader:`
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
		`};var Vt=class extends J.ShaderMaterial{constructor(t){super({type:"LineMaterial",uniforms:J.UniformsUtils.clone(J.ShaderLib.line.uniforms),vertexShader:J.ShaderLib.line.vertexShader,fragmentShader:J.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0!==this.worldUnits&&(this.needsUpdate=!0),t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var pe=new B.Vector4,_e=new B.Vector3,ze=new B.Vector3,tt=new B.Vector4,et=new B.Vector4,Et=new B.Vector4,me=new B.Vector3,ve=new B.Matrix4,nt=new B.Line3,Ce=new B.Vector3,ee=new B.Box3,ne=new B.Sphere,xt=new B.Vector4,bt,_t;function Pe(e,t,n){return xt.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),xt.multiplyScalar(1/xt.w),xt.x=_t/n.width,xt.y=_t/n.height,xt.applyMatrix4(e.projectionMatrixInverse),xt.multiplyScalar(1/xt.w),Math.abs(Math.max(xt.x,xt.y))}function An(e,t){let n=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,i=o.attributes.instanceEnd,c=Math.min(o.instanceCount,s.count);for(let r=0,a=c;r<a;r++){nt.start.fromBufferAttribute(s,r),nt.end.fromBufferAttribute(i,r),nt.applyMatrix4(n);let d=new B.Vector3,l=new B.Vector3;bt.distanceSqToSegment(nt.start,nt.end,l,d),l.distanceTo(d)<_t*.5&&t.push({point:l,pointOnLine:d,distance:bt.origin.distanceTo(l),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function kn(e,t,n){let o=t.projectionMatrix,i=e.material.resolution,c=e.matrixWorld,r=e.geometry,a=r.attributes.instanceStart,d=r.attributes.instanceEnd,l=Math.min(r.instanceCount,a.count),f=-t.near;bt.at(1,Et),Et.w=1,Et.applyMatrix4(t.matrixWorldInverse),Et.applyMatrix4(o),Et.multiplyScalar(1/Et.w),Et.x*=i.x/2,Et.y*=i.y/2,Et.z=0,me.copy(Et),ve.multiplyMatrices(t.matrixWorldInverse,c);for(let u=0,h=l;u<h;u++){if(tt.fromBufferAttribute(a,u),et.fromBufferAttribute(d,u),tt.w=1,et.w=1,tt.applyMatrix4(ve),et.applyMatrix4(ve),tt.z>f&&et.z>f)continue;if(tt.z>f){let p=tt.z-et.z,x=(tt.z-f)/p;tt.lerp(et,x)}else if(et.z>f){let p=et.z-tt.z,x=(et.z-f)/p;et.lerp(tt,x)}tt.applyMatrix4(o),et.applyMatrix4(o),tt.multiplyScalar(1/tt.w),et.multiplyScalar(1/et.w),tt.x*=i.x/2,tt.y*=i.y/2,et.x*=i.x/2,et.y*=i.y/2,nt.start.copy(tt),nt.start.z=0,nt.end.copy(et),nt.end.z=0;let v=nt.closestPointToPointParameter(me,!0);nt.at(v,Ce);let w=B.MathUtils.lerp(tt.z,et.z,v),m=w>=-1&&w<=1,b=me.distanceTo(Ce)<_t*.5;if(m&&b){nt.start.fromBufferAttribute(a,u),nt.end.fromBufferAttribute(d,u),nt.start.applyMatrix4(c),nt.end.applyMatrix4(c);let p=new B.Vector3,x=new B.Vector3;bt.distanceSqToSegment(nt.start,nt.end,x,p),n.push({point:x,pointOnLine:p,distance:bt.origin.distanceTo(x),object:e,face:null,faceIndex:u,uv:null,uv1:null})}}}var oe=class extends B.Mesh{constructor(t=new Ut,n=new Vt({color:Math.random()*16777215})){super(t,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let t=this.geometry,n=t.attributes.instanceStart,o=t.attributes.instanceEnd,s=new Float32Array(2*n.count);for(let c=0,r=0,a=n.count;c<a;c++,r+=2)_e.fromBufferAttribute(n,c),ze.fromBufferAttribute(o,c),s[r]=r===0?0:s[r-1],s[r+1]=s[r]+_e.distanceTo(ze);let i=new B.InstancedInterleavedBuffer(s,2,1);return t.setAttribute("instanceDistanceStart",new B.InterleavedBufferAttribute(i,1,0)),t.setAttribute("instanceDistanceEnd",new B.InterleavedBufferAttribute(i,1,1)),this}raycast(t,n){let o=this.material.worldUnits,s=t.camera;if(s===null&&!o&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),o===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=t.params.Line2!==void 0&&t.params.Line2.threshold||0;bt=t.ray;let c=this.matrixWorld,r=this.geometry,a=this.material;_t=a.linewidth+i,r.boundingSphere===null&&r.computeBoundingSphere(),ne.copy(r.boundingSphere).applyMatrix4(c);let d;if(o)d=_t*.5;else{let f=Math.max(s.near,ne.distanceToPoint(bt.origin));d=Pe(s,f,a.resolution)}if(ne.radius+=d,bt.intersectsSphere(ne)===!1)return;r.boundingBox===null&&r.computeBoundingBox(),ee.copy(r.boundingBox).applyMatrix4(c);let l;if(o)l=_t*.5;else{let f=Math.max(s.near,ee.distanceToPoint(bt.origin));l=Pe(s,f,a.resolution)}ee.expandByScalar(l),bt.intersectsBox(ee)!==!1&&(o?An(this,n):kn(this,s,n))}onBeforeRender(t){let n=this.material.uniforms;n&&n.resolution&&(t.getViewport(pe),this.material.uniforms.resolution.value.set(pe.z,pe.w))}};var se=new Set,dt=class{constructor(t){this.count=t,this.geometry=new Ut,this.geometry.setPositions(new Float32Array(t*6));let n=new Float32Array(t*2),o=new zt.InstancedInterleavedBuffer(n,2,1);this.geometry.setAttribute("instanceDistanceStart",new zt.InterleavedBufferAttribute(o,1,0)),this.geometry.setAttribute("instanceDistanceEnd",new zt.InterleavedBufferAttribute(o,1,1)),this.pos=this.geometry.attributes.instanceStart.data,this.dist=o}set(t,n,o){let s=this.pos.array;s[t*6]=n.x,s[t*6+1]=n.y,s[t*6+2]=n.z,s[t*6+3]=o.x,s[t*6+4]=o.y,s[t*6+5]=o.z,this.dist.array[t*2]=0,this.dist.array[t*2+1]=n.distanceTo(o)}commit(){this.pos.needsUpdate=!0,this.dist.needsUpdate=!0}mesh(t,n=0){let o=new oe(this.geometry,t);return o.frustumCulled=!1,o.renderOrder=n,o}};function ut(e={}){let t=new Vt({color:1841687,linewidth:e.width??2,dashed:!!e.dashed,dashSize:e.dash??.12,gapSize:e.gap??.09,transparent:!0,opacity:e.opacity??1,depthTest:e.depthTest??!0,depthWrite:e.depthWrite??!1});return e.depthFunc!==void 0&&(t.depthFunc=e.depthFunc),t.userData.baseWidth=e.width??2,e.rgb&&(t.color.setRGB(e.rgb[0],e.rgb[1],e.rgb[2],zt.SRGBColorSpace),t.userData.keepColour=!0),se.add(t),t}function Ie(e,t,n){for(let o of se)o.resolution.set(e,t),o.linewidth=o.userData.baseWidth*n}var z=lt(rt(),1);var Y=lt(rt(),1),Yt=1e3,$={PLAIN:0,BRICK:1,ASHLAR:2,TILE:3,WOOD:4,PLASTER:5,GRASS:6,COBBLE:7,CLOTH:8,FOLIAGE:9,STONE:10,PANE:11,SOIL:12,VINE:13};function Bn(e){return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function j(e,t=$.PLAIN,n={}){return{c:typeof e=="number"?Bn(e):e,p:t,f:n.f||0,w:n.w||0,s:n.s||0}}var Ue=["px","nx","py","ny","pz","nz"];function Ht(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function we(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Xt(e){return Math.hypot(e[0],e[1],e[2])}function yt(e){let t=Xt(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function Ct(e,t){let n=Math.abs(t[0]),o=Math.abs(t[1]),s=Math.abs(t[2]);return n>=o&&n>=s?[e[2],e[1]]:s>=o?[e[0],e[1]]:[e[0],e[2]]}var ft=class{constructor(){this.pos=[],this.nrm=[],this.col=[],this.uv=[],this.edg=[],this.mat=[],this.m=null,this.nm=null,this.stack=[]}get triangleCount(){return this.pos.length/9}push(t){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(t):t.clone(),this.nm=new Y.Matrix3().getNormalMatrix(this.m),this}pop(){return this.m=this.stack.pop()||null,this.nm=this.m?new Y.Matrix3().getNormalMatrix(this.m):null,this}_tp(t){if(!this.m)return[t[0],t[1],t[2]];let n=this.m.elements,o=t[0],s=t[1],i=t[2];return[n[0]*o+n[4]*s+n[8]*i+n[12],n[1]*o+n[5]*s+n[9]*i+n[13],n[2]*o+n[6]*s+n[10]*i+n[14]]}_tn(t){if(!this.nm)return t;let n=this.nm.elements,o=t[0],s=t[1],i=t[2];return yt([n[0]*o+n[3]*s+n[6]*i,n[1]*o+n[4]*s+n[7]*i,n[2]*o+n[5]*s+n[8]*i])}tri(t,n,o,s,i=[1,1,1],c={}){let r=this._tp(t),a=this._tp(n),d=this._tp(o),l=yt(we(Ht(n,t),Ht(o,t))),f=c.uv||[Ct(t,l),Ct(n,l),Ct(o,l)],u=yt(we(Ht(a,r),Ht(d,r))),h=c.n?c.n.map(p=>this._tn(p)):[u,u,u],g=Xt(we(Ht(a,r),Ht(d,r))),v=[g/(Xt(Ht(d,a))||1),g/(Xt(Ht(r,d))||1),g/(Xt(Ht(a,r))||1)],w=c.k||[1,1,1],m=s.s||0,b=[r,a,d];for(let p=0;p<3;p++){let x=b[p];this.pos.push(x[0]+m,x[1]+m,x[2]+m),this.nrm.push(h[p][0],h[p][1],h[p][2]),this.col.push(s.c[0]*w[p],s.c[1]*w[p],s.c[2]*w[p]),this.uv.push(f[p][0],f[p][1]);for(let y=0;y<3;y++)i[y]?this.edg.push(p===y?v[y]:0):this.edg.push(Yt);this.mat.push(s.p,s.f,s.w)}}quad(t,n,o,s,i,c=[1,1,1,1],r={}){let a=r.k||[1,1,1,1],d=r.n,l=r.uv;this.tri(t,n,o,i,[c[1],0,c[0]],{k:[a[0],a[1],a[2]],n:d&&[d[0],d[1],d[2]],uv:l&&[l[0],l[1],l[2]]}),this.tri(t,o,s,i,[c[2],c[3],0],{k:[a[0],a[2],a[3]],n:d&&[d[0],d[2],d[3]],uv:l&&[l[0],l[2],l[3]]})}box(t,n,o,s,i,c,r,a={}){t>s&&([t,s]=[s,t]),n>i&&([n,i]=[i,n]),o>c&&([o,c]=[c,o]);let d=new Set(a.open||[]),l=new Set(a.skip||[]);a.bottom||l.add("ny");let f=a.ao??1,u=a.aoTop??1,h={px:[0,s],nx:[0,t],py:[1,i],ny:[1,n],pz:[2,c],nz:[2,o]},g={px:[[s,n,c],[s,n,o],[s,i,o],[s,i,c]],nx:[[t,n,o],[t,n,c],[t,i,c],[t,i,o]],pz:[[t,n,c],[s,n,c],[s,i,c],[t,i,c]],nz:[[s,n,o],[t,n,o],[t,i,o],[s,i,o]],py:[[t,i,c],[s,i,c],[s,i,o],[t,i,o]],ny:[[t,n,o],[s,n,o],[s,n,c],[t,n,c]]};for(let v of Ue){if(l.has(v)||d.has(v))continue;let w=g[v],m=[];for(let x=0;x<4;x++){let y=w[x],k=w[(x+1)%4],C=1;for(let O of Ue){if(O===v)continue;let[L,F]=h[O];Math.abs(y[L]-F)<1e-9&&Math.abs(k[L]-F)<1e-9&&d.has(O)&&(C=0)}m.push(C)}let b;v==="py"||v==="ny"?b=[u,u,u,u]:b=[f,f,1,1];let p=v==="py"&&a.top?{...a.top,s:r.s}:r;this.quad(w[0],w[1],w[2],w[3],p,m,{k:b})}}cyl(t,n,o,s,i,c,r,a={}){let d=a.caps??[!0,!0],l=a.rim??[1,1],f=a.r1??s;for(let u=0;u<c;u++){let h=u/c*Math.PI*2,g=(u+1)/c*Math.PI*2,v=Math.cos(h),w=Math.sin(h),m=Math.cos(g),b=Math.sin(g),p=[t+s*v,n,o+s*w],x=[t+f*v,i,o+f*w],y=[t+f*m,i,o+f*b],k=[t+s*m,n,o+s*b],C=(s-f)/Math.max(1e-6,i-n),O=yt([v,C,w]),L=yt([m,C,b]),F=h*(s+f)/2,Z=g*(s+f)/2;this.quad(p,x,y,k,r,[0,l[1],0,l[0]],{n:[O,O,L,L],uv:[[F,n],[F,i],[Z,i],[Z,n]],k:a.k}),d[1]&&f>0&&this.tri([t,i,o],y,x,r,[1,0,0]),d[0]&&this.tri([t,n,o],p,k,r,[1,0,0])}}lathe(t,n,o,s,i,c,r={}){let a=s.length,d=[];for(let u=0;u<a-1;u++){let h=s[u+1][0]-s[u][0],g=s[u+1][1]-s[u][1];d.push(yt([g,-h,0]))}let l=s.map((u,h)=>{let g=d[Math.max(0,h-1)],v=d[Math.min(a-2,h)];return yt([g[0]+v[0],g[1]+v[1],0])}),f=r.edges||[];for(let u=0;u<i;u++){let h=u/i*Math.PI*2,g=(u+1)/i*Math.PI*2,v=Math.cos(h),w=Math.sin(h),m=Math.cos(g),b=Math.sin(g);for(let p=0;p<a-1;p++){let[x,y]=s[p],[k,C]=s[p+1],O=[t+x*v,n+y,o+x*w],L=[t+k*v,n+C,o+k*w],F=[t+k*m,n+C,o+k*b],Z=[t+x*m,n+y,o+x*b],P=r.flat?d[p]:l[p],K=r.flat?d[p]:l[p+1];this.quad(O,L,F,Z,c,[0,f[p+1]?1:0,0,f[p]?1:0],{n:[[P[0]*v,P[1],P[0]*w],[K[0]*v,K[1],K[0]*w],[K[0]*m,K[1],K[0]*b],[P[0]*m,P[1],P[0]*b]],uv:[[h*1.2,y],[h*1.2,C],[g*1.2,C],[g*1.2,y]]})}}}poly(t,n,o={}){for(let s=1;s<t.length-1;s++)this.tri(t[0],t[s],t[s+1],n,[1,s===t.length-2?1:0,s===1?1:0],o)}blob(t,n,o,s,i,c,r,a={}){let d=a.sub??1,l=a.seed??0,f=[[[1,0,0],[0,1,0],[0,0,1]],[[0,0,1],[0,1,0],[-1,0,0]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,1],[0,-1,0]],[[0,0,1],[-1,0,0],[0,-1,0]],[[-1,0,0],[0,0,-1],[0,-1,0]],[[0,0,-1],[1,0,0],[0,-1,0]]];for(let g=0;g<d;g++){let v=[];for(let[w,m,b]of f){let p=yt([(w[0]+m[0])/2,(w[1]+m[1])/2,(w[2]+m[2])/2]),x=yt([(m[0]+b[0])/2,(m[1]+b[1])/2,(m[2]+b[2])/2]),y=yt([(b[0]+w[0])/2,(b[1]+w[1])/2,(b[2]+w[2])/2]);v.push([w,p,y],[p,m,x],[y,x,b],[p,x,y])}f=v}let u=g=>1+(a.lump??.12)*Math.sin(g[0]*5.1+l)*Math.sin(g[1]*4.3+l*1.7)*Math.sin(g[2]*3.7+l*.3),h=g=>{let v=u(g);return[t+g[0]*s*v,n+g[1]*i*v,o+g[2]*c*v]};for(let[g,v,w]of f)this.tri(h(g),h(v),h(w),r,[0,0,0],{n:[g,v,w],k:a.k})}build(){let t=new Y.BufferGeometry;return t.setAttribute("position",new Y.Float32BufferAttribute(this.pos,3)),t.setAttribute("normal",new Y.Float32BufferAttribute(this.nrm,3)),t.setAttribute("acol",new Y.Float32BufferAttribute(this.col,3)),t.setAttribute("fuv",new Y.Float32BufferAttribute(this.uv,2)),t.setAttribute("edge",new Y.Float32BufferAttribute(this.edg,3)),t.setAttribute("amat",new Y.Float32BufferAttribute(this.mat,3)),t.computeBoundingSphere(),t}},ht={T:(e,t,n)=>new Y.Matrix4().makeTranslation(e,t,n),RX:e=>new Y.Matrix4().makeRotationX(e),RY:e=>new Y.Matrix4().makeRotationY(e),RZ:e=>new Y.Matrix4().makeRotationZ(e),S:(e,t,n)=>new Y.Matrix4().makeScale(e,t??e,n??e),chain:(...e)=>e.reduce((t,n)=>t.multiply(n),new Y.Matrix4)};var Ln=[.86,.82,.74],Ve=[.64,.23,.16];function Oe(e,t){let n=new z.Group,o=[];for(let S=0;S<8;S++)o.push(new z.Vector3(S&1?1:-1,S&2?1:-1,S&4?1:-1));let s=[];for(let S=0;S<8;S++)for(let H of[1,2,4])S&H||s.push([S,S|H]);let i=[];for(let S=0;S<3;S++)for(let H of[-1,1]){let A=(S+1)%3,U=(S+2)%3,_=(ct,Qt)=>{let wt=[0,0,0];return wt[S]=H,wt[A]=ct,wt[U]=Qt,(wt[0]>0?1:0)|(wt[1]>0?2:0)|(wt[2]>0?4:0)},W=[_(-1,-1),_(1,-1),_(1,1),_(-1,1)];H<0&&(W=W.reverse());let vt=new z.Vector3;vt.setComponent(S,H),i.push({q:W,n:vt,axis:S,u:A,v:U})}let c=i.length*6,r=new z.BufferGeometry,a=new z.BufferAttribute(new Float32Array(c*3),3),d=new z.BufferAttribute(new Float32Array(c*3),3),l=new Float32Array(c*3),f=new Float32Array(c*2),u=new Float32Array(c*3),h=new Float32Array(c*3),g=[0,1,2,0,2,3];i.forEach((S,H)=>{g.forEach((A,U)=>{let _=H*6+U,W=o[S.q[A]];l.set(Ln,_*3),f[_*2]=W.getComponent(S.u),f[_*2+1]=W.getComponent(S.v),u.set([Yt,Yt,Yt],_*3)})}),r.setAttribute("position",a),r.setAttribute("normal",d),r.setAttribute("acol",new z.BufferAttribute(l,3)),r.setAttribute("fuv",new z.BufferAttribute(f,2)),r.setAttribute("edge",new z.BufferAttribute(u,3)),r.setAttribute("amat",new z.BufferAttribute(h,3));let v=Rt(e,{cue:0,hatch:.32,side:z.DoubleSide,offset:2,transparent:!0}),w=new z.Mesh(r,v);w.frustumCulled=!1,w.renderOrder=0,n.add(w);let m=new dt(s.length),b=ut({width:2.4}),p=ut({width:2.4,depthFunc:z.GreaterDepth}),x=ut({width:1.5,dashed:!0,dash:.1,gap:.085,depthFunc:z.GreaterDepth});n.add(m.mesh(b,1),m.mesh(p,2),m.mesh(x,3));let y=new dt(8),k=ut({width:1.4,dashed:!0,dash:.09,gap:.07,rgb:Ve,opacity:0,depthTest:!1}),C=y.mesh(k,4);n.add(C);let O=new z.SphereGeometry(.035,12,8),L=new z.MeshBasicMaterial({color:new z.Color().setRGB(...Ve,z.SRGBColorSpace),transparent:!0,opacity:0,depthTest:!1}),F=[];for(let S=0;S<8;S++){let H=o[S],A=H.clone().addScaledVector(t,-2*H.dot(t));y.set(S,H,A);for(let U of[H,A]){let _=new z.Mesh(O,L);_.position.copy(U),_.renderOrder=5,F.push(_),n.add(_)}}y.commit();let Z=o.map(S=>S.clone()),P=new z.Vector3,K=-1;function E(S){if(S===K)return;K=S;for(let A=0;A<8;A++)Z[A].copy(o[A]).addScaledVector(t,-2*S*o[A].dot(t));let H=1-2*S;i.forEach((A,U)=>{Math.abs(H)>.001?P.copy(A.n).addScaledVector(t,2*S/H*A.n.dot(t)).normalize():P.copy(t).multiplyScalar(Math.sign(A.n.dot(t))||1),g.forEach((_,W)=>{let vt=U*6+W,ct=Z[A.q[_]];a.setXYZ(vt,ct.x,ct.y,ct.z),d.setXYZ(vt,P.x,P.y,P.z)})}),a.needsUpdate=!0,d.needsUpdate=!0,s.forEach(([A,U],_)=>m.set(_,Z[A],Z[U])),m.commit()}E(0);let M=14,T=(S,H,A)=>{let U=Math.min(1,Math.max(0,(A-S)/(H-S)));return U*U*(3-2*U)};function D(S){let H=(S%M+M)%M,A=T(0,.9,H)*(1-T(4.6,5.5,H)),U=T(7,7.9,H)*(1-T(11.6,12.5,H)),_=T(5.6,6.9,H)*(1-T(12.6,13.9,H)),W="none";return A>.5?W="A":U>.5&&(W="B"),{cue:A+U,s:_,phase:W,x:H}}let I=D(0);return{group:n,lineMats:[b,p,x,k],get state(){return I},update(S,H,A){I=D(S),E(I.s),v.uniforms.uCue.value=I.cue,v.uniforms.uFade.value=A,b.opacity=A,p.opacity=A*(1-I.cue),x.opacity=A*I.cue*.8,k.opacity=A*H,L.opacity=A*H;let U=H*A>.01;C.visible=U,F.forEach(_=>{_.visible=U})}}}var Q=lt(rt(),1);var pt=.13,_n=14274491;function Dt(e,t,n,o,s,i,c,r){return{axis:e,sign:t,c:n,u0:o,u1:s,v0:i,v1:c,e:{u0:1,u1:1,v0:1,v1:1,...r}}}function Ot(e,t,n){let{axis:o,sign:s,c:i,u0:c,u1:r,v0:a,v1:d,e:l}=t,f=(o+1)%3,u=(o+2)%3,h=(m,b)=>{let p=[0,0,0];return p[o]=i,p[f]=m,p[u]=b,p},g=[0,0,0];g[o]=s;let v,w;s>0?(v=[h(c,a),h(r,a),h(r,d),h(c,d)],w=[l.v0,l.u1,l.v1,l.u0]):(v=[h(c,d),h(r,d),h(r,a),h(c,a)],w=[l.v1,l.u1,l.v0,l.u0]),e.quad(v[0],v[1],v[2],v[3],n,w,{uv:v.map(m=>Ct(m,g))})}function zn(){let e=[],t=1+pt,n=1-pt,o=s=>s<0?[-t,-n]:[n,t];for(let s=0;s<3;s++)for(let i of[-1,1]){let c=i*t;for(let r of[-1,1])for(let a of[-1,1]){let[d,l]=o(r),[f,u]=o(a);e.push(Dt(s,i,c,d,l,f,u,{u0:r<0,u1:r>0,v0:a<0,v1:a>0}))}for(let r of[-1,1])e.push(Dt(s,i,c,-n,n,...o(r),{u0:0,u1:0}));for(let r of[-1,1])e.push(Dt(s,i,c,...o(r),-n,n,{v0:0,v1:0}))}for(let s=0;s<3;s++){let i=(s+1)%3,c=(s+2)%3;for(let r of[-1,1])for(let a of[-1,1]){{let d=i,l={[s]:[-n,n],[c]:a<0?[-t,-n]:[n,t]},f=(d+1)%3,u=(d+2)%3;e.push(Dt(d,-r,r*n,l[f][0],l[f][1],l[u][0],l[u][1],{}))}{let d=c,l={[s]:[-n,n],[i]:r<0?[-t,-n]:[n,t]},f=(d+1)%3,u=(d+2)%3;e.push(Dt(d,-a,a*n,l[f][0],l[f][1],l[u][0],l[u][1],{}))}}}return e}function Cn(e,t,n,o,s){let i=[],c=[],r=(a,d,l)=>a>=l-pt-1e-6&&d<=l+pt+1e-6;for(let a of e){let d=(a.axis+1)%3,l=(a.axis+2)%3,f=m=>m===d?[a.u0,a.u1]:[a.v0,a.v1],u=!1;a.axis===0&&Math.abs(Math.abs(a.c-t)-pt)<1e-6&&(u=r(...f(2),n)),a.axis===2&&Math.abs(Math.abs(a.c-n)-pt)<1e-6&&(u=r(...f(0),t));let[h,g]=f(1);if(!u||h>o||g<s){i.push(a);continue}let v=d===1?"u":"v",w=(m,b,p,x)=>{let y={...a,e:{...a.e}};return y[v+"0"]=m,y[v+"1"]=b,y.e[v+"0"]=p,y.e[v+"1"]=x,y};i.push(w(h,o,a.e[v+"0"],0)),c.push(w(o,s,0,0)),i.push(w(s,g,0,a.e[v+"1"]))}return{keep:i,mid:c}}function De(e,t,n){let o=new Q.Group,s=j(_n),[i,c]=n,r=X=>[X.dot(i),X.dot(c)],a=X=>{let at=r(new Q.Vector3(0,1,1)),Bt=i.x;return(X-at[0])/Bt},d=X=>new Q.Vector3(-1,X,-1),l=r(d(0))[0],f=new Q.Vector3(a(l),1,1),h=(r(f)[1]-r(d(0))[1])/c.y,g={front:f,back:d(h)},w=(r(new Q.Vector3(1,0,1))[0]-r(new Q.Vector3(0,-1,-1))[0])/i.x,m=new Q.Vector3(w,-1,-1),p=(r(m)[1]-r(new Q.Vector3(1,0,1))[1])/c.y,x={front:new Q.Vector3(1,p,1),back:m},y=.86,k=h-y/2,C=h+y/2,O=g.front.dot(t)-g.back.dot(t),L=O+2*pt*(Math.abs(t.x)+Math.abs(t.y)+Math.abs(t.z))+.25,{keep:F,mid:Z}=Cn(zn(),-1,-1,k,C),P=Rt(e,{hatch:.32,transparent:!0}),K=new ft;F.forEach(X=>Ot(K,X,s));let E=new Q.Mesh(K.build(),P);o.add(E);let M=new ft;Z.forEach(X=>Ot(M,X,s));let T=new Q.Mesh(M.build(),P);o.add(T);let D=Rt(e,{hatch:.32,transparent:!0,fade:0});D.depthWrite=!1;let I=(X,at)=>Dt(1,at?1:-1,X,-1-pt,-1+pt,-1-pt,-1+pt,{}),S=new ft;Ot(S,I(k,!0),s),Ot(S,I(C,!1),s);let H=new ft;Ot(H,I(k,!1),s),Ot(H,I(C,!0),s);let A=new Q.Mesh(S.build(),D),U=new Q.Mesh(H.build(),D);o.add(A,U);let _=new dt(2),W=ut({width:1.4,dashed:!0,dash:.09,gap:.07,rgb:[.64,.23,.16],opacity:0,depthTest:!1}),vt=_.mesh(W,6);o.add(vt);let ct=new Q.Vector3(-1,k,-1),Qt=new Q.Vector3(-1,C,-1);_.set(0,ct,ct.clone().addScaledVector(t,L)),_.set(1,Qt,Qt.clone().addScaledVector(t,L)),_.commit();let wt=12,Re=(X,at,Bt)=>{let Wt=Math.min(1,Math.max(0,(Bt-X)/(at-X)));return Wt*Wt*(3-2*Wt)};function He(X){let at=(X%wt+wt)%wt;return{k:Re(2.6,4.4,at)*(1-Re(9.2,11,at)),x:at}}let Jt=He(0),vn=O/L;return{group:o,cross1:g,cross2:x,mats:[P,D],lineMats:[W],get state(){return Jt},get impossible(){return Jt.k>vn},update(X,at,Bt){Jt=He(X);let Wt=Jt.k;T.position.copy(t).multiplyScalar(L*Wt),U.position.copy(T.position),P.uniforms.uFade.value=Bt,D.uniforms.uFade.value=Bt*at,A.visible=U.visible=at>.01,W.opacity=Bt*at,vt.visible=at>.01}}}var q=lt(rt(),1);var At=lt(rt(),1);var Pn=new At.Vector3(0,1,0);function ie(e,t,n,o,s,i={}){let c=new At.Vector3(n[0]-t[0],n[1]-t[1],n[2]-t[2]),r=c.length();if(r<1e-6)return;let a=new At.Quaternion().setFromUnitVectors(Pn,c.normalize()),d=new At.Matrix4().compose(new At.Vector3(t[0],t[1],t[2]),a,new At.Vector3(1,1,1));e.push(d),e.cyl(0,0,0,o,r,i.seg??6,s,{r1:i.r1??o*.85,rim:i.rim??[0,1],caps:i.caps??[!1,!0]}),e.pop()}var ge=j(14268832,$.PLAIN),Ro=j(3878953,$.PLAIN);function Fe(e,t,n,o,s,i=1.5,c=.7){e.push(ht.chain(ht.T(t,n,o),ht.RY(s)));let r=j(4538426,$.CLOTH),a=j(7235420,$.CLOTH),d=j(3090981,$.PLAIN);for(let h of[-1,1])ie(e,[.11*h,.05,.12],[.1*h,.95,.02],.1,r,{r1:.11}),e.box(.1*h-.07,0,-.08,.1*h+.07,.09,.2,d,{});let l=-.55;e.push(ht.chain(ht.T(0,.93,.02),ht.RX(l))),e.box(-.24,0,-.14,.24,.72,.15,a,{ao:.85}),e.pop();let f=[0,.93+.72*Math.cos(l),.02+.72*Math.sin(l)];ie(e,f,[0,f[1]+.12,f[2]-.05],.075,ge);let u=[0,f[1]+.25,f[2]-.12];e.blob(u[0],u[1],u[2],.15,.16,.15,ge,{lump:.03}),e.cyl(u[0],u[1]+.07,u[2],.26,u[1]+.1,12,d,{}),e.cyl(u[0],u[1]+.1,u[2],.15,u[1]+.26,10,d,{r1:.14});for(let h of[-1,1]){let g=[.27*h,f[1]-.06,f[2]+.02],v=[.26*h,i+.07,-c+.12],w=[-.06*h,i+.07,-c-.08];ie(e,g,v,.08,a),ie(e,v,w,.07,a),e.blob(w[0],w[1],w[2],.06,.05,.07,ge,{lump:.02,sub:0})}e.pop()}var Pt={a:4,b:2,c:.62,Hs:10,ts:.7,Hp:3.5,ring:.62,P:1.6,m:.9},Ne=j(13484456,$.ASHLAR),st=j(14472126,$.PLAIN),Ge=j(14208954,$.COBBLE),qe=j(14866886,$.PLASTER),In=j(13879472,$.ASHLAR),$t=j(14735299,$.PLAIN),je=j(12081730,$.CLOTH),Un=j(6050374,$.PLAIN);function kt(e,t,n,o,s,i,c={}){let r=Math.abs(o-t)>Math.abs(s-n),a=Math.abs(r?o-t:s-n),d=c.h??.86,l=c.w??.26,f=.16,u=.15,h=(w,m,b,p,x)=>{if(r){let y=Math.min(t,o);e.box(y+w,b,n-x,y+m,p,n+x,$t,{ao:.9})}else{let y=Math.min(n,s);e.box(t-x,b,y+w,t+x,p,y+m,$t,{ao:.9})}};h(0,a,i,i+f,l/2),h(0,a,i+d-u,i+d,l/2+.03);let g=Math.max(1,Math.round(a/.36)),v=a/g;for(let w=0;w<g;w++){let m=(w+.5)*v;h(m-.065,m+.065,i+f,i+d-u,.065)}}function Vn(e,t,n,o,s=1){e.box(t-.26*s,n,o-.26*s,t+.26*s,n+.16*s,o+.26*s,st,{});let i=[[.2,0],[.2,.06],[.1,.13],[.25,.38],[.2,.56],[.07,.66],[.11,.74],[0,.92]].map(([c,r])=>[c*s,r*s]);e.lathe(t,n+.16*s,o,i,14,st,{edges:[1,0,1,0,0,1,0,1]})}function On(e,t,n,o,s,i,c,r){let a=(u,h,g)=>{let v=(h-s)/(i-s),w=c*v;return[u+w,h+w,g+w]},d=t+o,l=n+o,f=[{n:[1,0,0],q:[[d,s,l],[d,s,n],[d,i,n],[d,i,l]]},{n:[-1,0,0],q:[[t,s,n],[t,s,l],[t,i,l],[t,i,n]]},{n:[0,0,1],q:[[t,s,l],[d,s,l],[d,i,l],[t,i,l]]},{n:[0,0,-1],q:[[d,s,n],[t,s,n],[t,i,n],[d,i,n]]}];for(let u of f){let h=u.q.map(g=>a(...g));e.quad(h[0],h[1],h[2],h[3],r,[1,1,1,1],{n:[u.n,u.n,u.n,u.n],uv:u.q.map(g=>Ct(g,u.n))})}}function ae(){let{a:e,b:t,c:n}=Pt;return[{name:"front",lo:[e-n,t-n],hi:[-t,-e],k:n-e-t},{name:"back",lo:[-e,-t],hi:[t-n,e-n],k:e+t-n},{name:"left",lo:[-e,t-n],hi:[-t,e-n],k:e-t},{name:"right",lo:[e-n,-t],hi:[t-n,-e],k:t-e}]}function Dn(e){let{a:t,b:n,c:o,Hs:s,ts:i,Hp:c,ring:r,P:a,m:d}=Pt,l=t+d,f=n+d;e.box(-l-.16,-a,-f-.16,l+.16,-a+.34,f+.16,st,{ao:.85}),e.box(-l,-a+.34,-f,l,-.2,f,Ne,{ao:.9}),e.box(-l-.12,-.2,-f-.12,l+.12,0,f+.12,st,{top:Ge});let u=5,h=a/u,g=.42,v=1.5;for(let E=0;E<u;E++)e.box(-v,-a+E*h,f+.12,v,-a+(E+1)*h,f+.12+(u-E)*g,st,{ao:.88});for(let E of[-1,1]){let M=E<0?-v-.45:v,T=M+.45;e.box(M,-a,f+.12,T,-a+.62,f+.12+u*g+.1,Ne,{ao:.85}),e.box(M-.04,-a+.62,f+.08,T+.04,-a+.78,f+.12+u*g+.14,st,{})}let w=.3,m=0,b=l-w,p=f-w;kt(e,-b,p,-v-.2,p,m),kt(e,v+.2,p,b,p,m),kt(e,b,-p,b,p,m),kt(e,-b,-p,b,-p,m),kt(e,-b,-p,-b,p,m);for(let[E,M]of[[-b,p],[b,p],[b,-p],[-b,-p],[-v-.2,p],[v+.2,p]])e.box(E-.2,m,M-.2,E+.2,m+1,M+.2,$t,{ao:.9}),e.box(E-.24,m+1,M-.24,E+.24,m+1.1,M+.24,st,{});for(let E of ae()){let[M,T]=E.lo,[D,I]=E.hi,S=.34,H=.4;e.box(M-.1,0,T-.1,M+o+.1,.2,T+o+.1,st,{ao:.85}),e.box(M-.05,.2,T-.05,M+o+.05,S,T+o+.05,st,{}),On(e,M,T,o,S,s-H-E.k,E.k,qe),e.box(D-.05,s-H,I-.05,D+o+.05,s-.18,I+o+.05,st,{}),e.box(D-.11,s-.18,I-.11,D+o+.11,s,I+o+.11,st,{})}let x=.16;e.box(-n-x+.1,s,-t-x+.1,n+x-.1,s+.25,t+x-.1,In,{ao:.85}),e.box(-n-x,s+.25,-t-x,n+x,s+i,t+x,st,{top:Ge});let y=s+i;for(let E of ae()){let[M,T]=E.hi;e.box(M-.07,y,T-.07,M+o+.07,y+.22,T+o+.07,st,{ao:.85}),e.box(M,y+.22,T,M+o,y+c-.3,T+o,qe,{skip:["py"]}),e.box(M-.07,y+c-.3,T-.07,M+o+.07,y+c,T+o+.07,st,{})}let k=.14;kt(e,n-k-.02,-t+o,n-k-.02,t-o,y,{h:.82}),kt(e,-n+k+.02,-t+o,-n+k+.02,t-o,y,{h:.82}),kt(e,-n+o,t-k-.02,n-o,t-k-.02,y,{h:.82}),kt(e,-n+o,-t+k+.02,n-o,-t+k+.02,y,{h:.82});let C=y+c,O=C+r,L=o/2+.12;for(let E of ae()){let M=E.hi[0]+o/2,T=E.hi[1]+o/2;e.box(M-L,C,T-L,M+L,O+.08,T+L,st,{}),Vn(e,M,O+.08,T,1.05)}let F=.2,Z=[-n+o/2,n-o/2],P=[-t+o/2,t-o/2];for(let E of Z)e.box(E-F,C+.04,P[0]+L,E+F,O,P[1]-L,$t,{open:["pz","nz"]});for(let E of P)e.box(Z[0]+L,C+.04,E-F,Z[1]-L,O,E+F,$t,{open:["px","nx"]});let K=.82;e.push(ht.chain(ht.T(n-k-.62,y,.9),ht.S(K))),Fe(e,0,0,0,-Math.PI/2,.84/K,.62/K),e.pop()}function Fn(){let{b:e,a:t,c:n,Hs:o,ts:s,Hp:i,ring:c}=Pt,r=new ft,a=e-n/2,d=t-n/2,l=o+s+i+c+.08+1;r.cyl(a,l-.2,d,.05,l+2.6,6,Un,{}),r.blob(a,l+2.66,d,.09,.09,.09,st,{sub:1,lump:0});let f=2.3,u=10,h=[Math.SQRT1_2,0,-Math.SQRT1_2],g=l+2.45,v=.62,w=r.pos.length/3;for(let m=0;m<u;m++){let b=m/u,p=(m+1)/u,x=(C,O)=>{let L=v*(1-C*.92),F=g-(v-L)*.45-(O?0:L);return[a+h[0]*f*C,F,d+h[2]*f*C]},y=[0,m===u-1?1:0,0,m===0?1:0],k=[[b*f,0],[p*f,0],[p*f,1],[b*f,1]];r.quad(x(b,!1),x(p,!1),x(p,!0),x(b,!0),je,[1,y[1],1,y[3]],{uv:k}),r.quad(x(p,!1),x(b,!1),x(b,!0),x(p,!0),je,[1,y[3],1,y[1]],{uv:[k[1],k[0],k[3],k[2]]})}for(let m=w;m<r.pos.length/3;m++)r.mat[m*3+2]=Math.min(1,r.uv[m*2]/f)*1;return r}function Nn(e){let{P:t}=Pt,n=j(14077368,$.COBBLE),o=j(9082480,$.FOLIAGE),s=j(5983035,$.PLAIN),i=-t,c=24,r=15,a=(l,f)=>{let u=Math.max(Math.abs(l),Math.abs(f))/r,h=Math.min(1,Math.max(0,(u-.42)/.5));return h*h*(3-2*h)};for(let l=0;l<c;l++)for(let f=0;f<c;f++){let u=-r+2*r*l/c,h=-r+2*r*(l+1)/c,g=-r+2*r*f/c,v=-r+2*r*(f+1)/c,w=e.pos.length/3;e.quad([u,i,v],[h,i,v],[h,i,g],[u,i,g],n,[0,0,0,0]);for(let m=w;m<e.pos.length/3;m++)e.mat[m*3+1]=a(e.pos[m*3],e.pos[m*3+2])}let d=(l,f,u,h)=>{e.cyl(l,i,f,.12,i+.6,6,s,{}),e.lathe(l,i+.4,f,[[0,0],[h*.7,.1],[h,u*.3],[h*.85,u*.62],[h*.45,u*.88],[0,u]],12,o,{edges:[0,0,0,0,0,0]})};d(-9.6,1.4,7.6,.85),d(-7.6,4.6,6.4,.78),d(-11.2,-1.6,8.4,.9),d(1.4,-9.6,7.8,.85),d(4.4,-7.8,6.2,.78),d(-1.4,-11.4,8.6,.9)}function We(e){let t=new q.Group,n=Rt(e,{hatch:.9,transparent:!0}),o=new ft;Dn(o);let s=new q.Mesh(o.build(),n);s.frustumCulled=!1,t.add(s);let i=Rt(e,{hatch:.9,transparent:!0,side:q.DoubleSide}),c=new q.Mesh(Fn().build(),i);c.frustumCulled=!1,t.add(c);let r=Rt(e,{hatch:.9,transparent:!0}),a=new ft;Nn(a);let d=new q.Mesh(a.build(),r);d.frustumCulled=!1,d.renderOrder=-1,t.add(d);let{c:l,Hs:f}=Pt,u=ae(),h=new dt(u.length),g=new dt(u.length);u.forEach((E,M)=>{let T=new q.Vector3(E.hi[0]+l/2,f-.4,E.hi[1]+l/2),D=T.clone().addScalar(-E.k),I=new q.Vector3(E.lo[0]+l/2,.34,E.lo[1]+l/2);h.set(M,T,D),g.set(M,I,D)}),h.commit(),g.commit();let v=[.64,.23,.16],w=ut({width:1.6,dashed:!0,dash:.42,gap:.3,rgb:v,opacity:0,depthTest:!1}),m=ut({width:1.2,dashed:!0,dash:.25,gap:.25,rgb:[.35,.33,.3],opacity:0,depthTest:!1}),b=h.mesh(w,8),p=g.mesh(m,7);t.add(b,p);let x=new q.SphereGeometry(.14,12,8),y=new q.MeshBasicMaterial({color:new q.Color().setRGB(...v,q.SRGBColorSpace),transparent:!0,opacity:0,depthTest:!1}),k=[];u.forEach(E=>{for(let M of[[E.hi[0]+l/2,f-.4,E.hi[1]+l/2],[E.hi[0]+l/2-E.k,f-.4-E.k,E.hi[1]+l/2-E.k]]){let T=new q.Mesh(x,y);T.position.set(...M),T.renderOrder=9,k.push(T),t.add(T)}});let C=5,O=new dt(C*4),L=ut({width:1.7}),F=O.mesh(L,3);t.add(F);let Z=[];for(let E=0;E<C;E++)Z.push({r:7.8+E%3*1.4,y:15.4+E*7%5*.6,w:.85+E%2*.15,om:(.32+E%3*.05)*(E===3?-1:1),ph:E*1.31,fl:7+E*.9,cx:E%2*.6,cz:-(E%3)*.4});let P=(E,M,T)=>new q.Vector3(E,M,T);function K(E){Z.forEach((M,T)=>{let D=M.ph+M.om*E,I=P(M.cx+M.r*Math.cos(D),M.y+.6*Math.sin(D*2.3+T),M.cz+M.r*Math.sin(D)),S=P(-Math.sin(D),0,Math.cos(D)).multiplyScalar(Math.sign(M.om)),H=P(S.z,0,-S.x),A=Math.sin(E*M.fl+T*2.1),U=.28*M.w*A;for(let _ of[-1,1]){let W=I.clone().addScaledVector(H,_*M.w*.5).add(P(0,.18*M.w+U*.5,0)).addScaledVector(S,-.08),vt=I.clone().addScaledVector(H,_*M.w).add(P(0,U*1.2-.05,0)).addScaledVector(S,-.22),ct=T*4+(_<0?0:2);O.set(ct,I,W),O.set(ct+1,W,vt)}}),O.commit()}return{group:t,mats:[n,i,r],lineMats:[w,m],update(E,M,T){K(E),L.opacity=T*Math.max(0,1-M*1.6),F.visible=L.opacity>.01,n.uniforms.uFade.value=T,i.uniforms.uFade.value=T;let D=T*Math.max(0,1-M*1.6);r.uniforms.uFade.value=D,d.visible=D>.002;let I=T*Math.min(1,Math.max(0,(M-.25)/.5));w.opacity=I,m.opacity=I*.8,y.opacity=I;let S=I>.002;b.visible=p.visible=S,k.forEach(H=>{H.visible=S})}}}function Xe(e,t){let n=document.getElementById("frame"),o=()=>{let i=(window.innerWidth<640?10:28)+13,c=document.getElementById("masthead"),r=document.getElementById("controls"),a=(c?c.offsetHeight:0)+6+13,d=(r?r.offsetHeight:0)+8+13,l=window.innerWidth-i*2,f=window.innerHeight-a-d,u=f,h=u*e;h>l&&(h=l,u=h/e),h=Math.max(160,Math.floor(h)),u=Math.max(120,Math.floor(u)),n.style.width=`${h}px`,n.style.height=`${u}px`,n.style.top=`${a+Math.max(0,(f-u)/2)}px`,t?.(h,u)};return window.addEventListener("resize",o),o(),o}function Ye(){let e=document.getElementById("panel"),t=document.getElementById("btn-info"),n=document.getElementById("panel-close");if(!e)return;let o=s=>{s?e.removeAttribute("hidden"):e.setAttribute("hidden",""),t?.setAttribute("aria-expanded",String(s))};t?.addEventListener("click",()=>o(e.hasAttribute("hidden"))),n?.addEventListener("click",()=>o(!1)),window.addEventListener("keydown",s=>{s.key==="Escape"&&o(!1)})}function Ee(e,t,n){let o=s=>{for(let[i,c]of e)i.setAttribute("aria-pressed",String(c===s));t(s)};for(let[s,i]of e)s.addEventListener("click",()=>o(i));return n!==void 0&&o(n),o}function $e(e){window.addEventListener("keydown",t=>{if(t.target.closest?.("input, textarea, select"))return;let n=e[t.key.length===1?t.key.toLowerCase():t.key];n&&(t.preventDefault(),n(t))})}function Ze(e,t=!0){let n=document.getElementById("btn-play"),o=s=>{t=s,n&&(n.setAttribute("aria-pressed",String(!s)),n.querySelector("span").textContent=s?"Pause":"Play",n.querySelector(".icon").textContent=s?"\u275A\u275A":"\u25B6"),e(s)};return n?.addEventListener("click",()=>o(!t)),o(t&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches),o}function Ke(e,t){let n=document.getElementById("badge");n&&t&&(n.textContent=t),document.body.classList.toggle("badge-on",!!e)}function Qe(){document.body.classList.add("ready")}var Je=Math.PI/4,Gn=Math.atan(1/Math.SQRT2),Lt=Math.PI/180,Tt=document.getElementById("scene"),jt=new G.WebGLRenderer({canvas:Tt,antialias:!0});jt.setPixelRatio(Math.min(window.devicePixelRatio||1,2));var nn=new G.Color(15525333),qn=new G.Color(15328988);jt.setClearColor(nn,1);var on=new G.Scene,Gt=Be(),sn=(e,t)=>new G.Vector3(Math.cos(t)*Math.sin(e),Math.sin(t),Math.cos(t)*Math.cos(e)),an=e=>new G.Vector3(Math.cos(e),0,-Math.sin(e)),Ft=30*Lt,be=24*Lt,ue=sn(Ft,be),rn=an(Ft),ye=new G.Vector3().crossVectors(ue,rn),cn=Oe(Gt,ue),Zt=De(Gt,ue,[rn,ye]),jn=We(Gt),Wn=(e,t,n)=>{let o=e*Math.SQRT2,s=t*Math.sqrt(6),i=(n+s)/3,c=2*i-s;return new G.Vector3((c+o)/2,i,(c-o)/2)},Xn=new G.Vector3(0,Pt.Hs*.55,0),it=[{key:"necker",obj:cn,view:{az:Ft,el:be},H:5.1,target:new G.Vector3(0,0,0).addScaledVector(ye,-.2),reveal:{az:Ft-74*Lt,el:16*Lt,zoom:.8},pivot:new G.Vector3(0,0,0)},{key:"cube",obj:Zt,view:{az:Ft,el:be},H:5.1,target:new G.Vector3(0,0,0).addScaledVector(ye,-.2),reveal:{az:Ft-70*Lt,el:18*Lt,zoom:.64},pivot:ue.clone().multiplyScalar(1.3)},{key:"pavilion",obj:jn,view:{az:Je,el:Gn},H:25.5,target:Wn(.1,5.4,0),reveal:{az:Je-76*Lt,el:17*Lt,zoom:.92},pivot:Xn}];for(let e of it)on.add(e.obj.group);var Mt=new G.OrthographicCamera(-1,1,1,-1,.1,400),V={az:it[0].view.az,el:it[0].view.el,zoom:1,panX:0,panY:0,k:0},ot=0,le=30/38,ln=800;function It(){let e=it[ot],t=sn(V.az,V.el),n=an(V.az),o=new G.Vector3().crossVectors(t,n),s=e.target.clone().lerp(e.pivot,V.k);s.addScaledVector(n,V.panX).addScaledVector(o,V.panY),Mt.position.copy(s).addScaledVector(t,150),Mt.up.set(0,1,0),Mt.lookAt(s);let i=e.H/2/V.zoom;Mt.left=-i*le,Mt.right=i*le,Mt.top=i,Mt.bottom=-i,Mt.updateProjectionMatrix()}var mt=document.getElementById("overlay"),St=mt.getContext("2d"),ce=document.getElementById("caption"),qt=1;Xe(30/38,(e,t)=>{jt.setSize(e,t),le=e/t,ln=t,qt=Math.min(window.devicePixelRatio||1,2),mt.width=Math.round(e*qt),mt.height=Math.round(t*qt),mt.style.width=`${e}px`,mt.style.height=`${t}px`,Ie(e,t,Math.min(1.35,Math.max(.62,t/860))),It()});Ye();var dn=[1,0,0],R={litho:1,lithoTarget:1,revealed:!1,tween:null,time:dn[0],fade:1,switching:null};Ee([[document.getElementById("btn-litho"),1],[document.getElementById("btn-colour"),0]],e=>{R.lithoTarget=e,document.body.classList.toggle("colour",!e)},1);var Me=!0,un=Ze(e=>{Me=e}),Yn=[0,1,2].map(e=>document.getElementById(`btn-plate-${e+1}`)),Kt=Ee(Yn.map((e,t)=>[e,t]),e=>Kn(e)),de=document.getElementById("btn-reveal"),$n=document.getElementById("hint");function Zn(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2}function fn(e,t=2){R.tween={from:{...V},to:{...V,...e},t:0,dur:t}}function fe(){let e=it[ot];return{az:e.view.az,el:e.view.el,zoom:1,panX:0,panY:0,k:0}}function Te(){return{...it[ot].reveal,panX:0,panY:0,k:1}}function he(e){R.revealed=e,de.setAttribute("aria-pressed",String(e)),de.querySelector("span").textContent=e?"Back to the picture":"Reveal the 3D",$n.textContent=e?"Drag to turn the real object \xB7 scroll to zoom \xB7 double-click to reset":"Drag to pan \xB7 scroll to zoom \xB7 1 2 3 choose a plate",fn(e?Te():fe(),2)}de.addEventListener("click",()=>he(!R.revealed));function Kn(e){if(e===ot){R.switching&&(R.switching={to:e,t:R.fade*.55});return}R.switching={to:e,t:(1-R.fade)*.35}}function hn(){R.revealed?he(!1):fn(fe(),.8)}$e({" ":()=>un(!Me),l:()=>document.getElementById(R.lithoTarget?"btn-colour":"btn-litho").click(),r:()=>he(!R.revealed),1:()=>Kt(0),2:()=>Kt(1),3:()=>Kt(2),0:()=>hn()});var Nt=null;Tt.addEventListener("pointerdown",e=>{Tt.setPointerCapture(e.pointerId),Nt={x:e.clientX,y:e.clientY},R.tween=null});Tt.addEventListener("pointermove",e=>{if(!Nt)return;let t=e.clientX-Nt.x,n=e.clientY-Nt.y;Nt={x:e.clientX,y:e.clientY};let o=it[ot].H/V.zoom/Tt.clientHeight;R.revealed?(V.az-=t*.007,V.el=Math.min(1.45,Math.max(-.6,V.el+n*.005))):(V.panX-=t*o,V.panY+=n*o),It()});var pn=()=>{Nt=null};Tt.addEventListener("pointerup",pn);Tt.addEventListener("pointercancel",pn);Tt.addEventListener("dblclick",hn);Tt.addEventListener("wheel",e=>{e.preventDefault(),R.tween=null;let t=Tt.getBoundingClientRect(),n=(e.clientX-t.left)/t.width-.5,o=.5-(e.clientY-t.top)/t.height,s=it[ot].H,i=s/V.zoom,c=Math.min(6,Math.max(.4,V.zoom*Math.exp(-e.deltaY*.0015))),r=s/c;V.panX+=n*le*(i-r),V.panY+=o*(i-r),V.zoom=c,It()},{passive:!1});var re={necker:{A:"Shaded as if lit from above, the lower-left square is the front face: a cube seen from above.",none:"Without shading the drawing has no front and no back. Either square can come forward.",B:"Shade it the other way and the upper-right square comes forward: a cube seen from below.",reveal:"From the side: the two readings are mirror images in the picture plane. Each corner slides along your line of sight (red), so the drawing never changes."},cube:{possible:"A frame you could build: at both circles the front beam passes in front of the back one.",impossible:"At the red circle the back post now passes in front of the top beam. Each crossing is plausible alone; together no solid frame fits.",reveal:"The trick in 3D: a piece of the back post is cut out and slid towards you along the line of sight (red), until it hides the front beam."},pavilion:{main:"The second pillar from the right stands at the front of the podium, yet holds up the back corner of the upper floor. Its twin on the left does the reverse.",reveal:"The real building: each pillar leans along the isometric line of sight, so from that one angle it looks plumb. The middle pair cross like an X."}},tn="";function Se(e){e!==tn&&(tn=e,ce.classList.add("swap"),clearTimeout(Se.timer),Se.timer=setTimeout(()=>{ce.textContent=e,ce.classList.remove("swap")},260))}var xe=new G.Vector3;function Qn(e){return xe.copy(e).project(Mt),[(xe.x*.5+.5)*mt.width,(.5-xe.y*.5)*mt.height]}function Jn(e){St.clearRect(0,0,mt.width,mt.height);let t=it[ot].key==="cube"&&e>=.01;if(mt.style.visibility=t?"visible":"hidden",!t)return;let n=mt.height/(it[ot].H/V.zoom),o=(s,i)=>{let[c,r]=Qn(s),a=.34*n;St.save(),St.globalAlpha=e,St.lineWidth=Math.max(1.2,1.6*qt*(ln/860)),St.strokeStyle=i?"rgba(162, 59, 42, 0.95)":"rgba(40, 36, 31, 0.7)",St.setLineDash(i?[]:[4*qt,3*qt]),St.beginPath(),St.arc(c,r,a,0,Math.PI*2),St.stroke(),St.restore()};o(Zt.cross1.front,Zt.impossible),o(Zt.cross2.front,!1)}var to=[.11,.1,.09],eo=[.2,.175,.15],en=performance.now();function no(){let e=it[ot];return Math.min(1,Math.hypot(V.az-e.view.az,V.el-e.view.el)/.35)}function mn(e){let t=Math.min(.05,Math.max(0,(e-en)/1e3));if(en=e,Me&&(R.time+=t),R.litho!==R.lithoTarget){let a=R.lithoTarget-R.litho;R.litho+=Math.sign(a)*Math.min(Math.abs(a),t*2.2)}Gt.uLitho.value=R.litho;let n=qn.clone().lerp(nn,R.litho);jt.setClearColor(n,1);let o=n.clone().convertLinearToSRGB();Gt.uBg.value.set(o.r,o.g,o.b);let s=eo.map((a,d)=>a+(to[d]-a)*R.litho);for(let a of se)a.userData.keepColour||a.color.setRGB(s[0],s[1],s[2],G.SRGBColorSpace);if(R.switching){let a=R.switching;a.t+=t,a.to!==ot?(R.fade=Math.max(0,1-a.t/.35),R.fade===0&&(ot=a.to,R.time=dn[ot],R.tween=null,Object.assign(V,R.revealed?Te():fe()),It(),a.t=0)):(R.fade=Math.min(1,a.t/.55),R.fade>=1&&(R.switching=null))}if(R.tween){let a=R.tween;a.t=Math.min(1,a.t+t/a.dur);let d=Zn(a.t);for(let l of["az","el","zoom","panX","panY","k"])V[l]=a.from[l]+(a.to[l]-a.from[l])*d;a.t>=1&&(R.tween=null),It()}let i=no();Gt.uTime.value=R.time,it.forEach((a,d)=>{a.obj.group.visible=d===ot}),it[ot].obj.update(R.time,i,R.fade),Ke(i>.5,"Off the picture\u2019s axis: the illusion is broken"),jt.render(on,Mt),Jn(R.fade*(1-i));let c=it[ot].key,r;i>.5?r=re[c].reveal:c==="necker"?r=re.necker[cn.state.phase]:c==="cube"?r=re.cube[Zt.impossible?"impossible":"possible"]:r=re.pavilion.main,Se(r),ce.style.opacity=String(R.fade),requestAnimationFrame(mn)}Qe();requestAnimationFrame(mn);window.__page={view:V,state:R,updateCamera:It,setRevealed:he,setPlaying:un,setPlate:Kt,ACTS:it,renderer:jt,get act(){return ot},show(e,t=0,n=!1){ot=e,R.switching=null,R.fade=1,R.time=t,R.tween=null,Kt(e),R.switching=null,R.revealed=n,de.setAttribute("aria-pressed",String(n)),Object.assign(V,n?Te():fe()),It()}};})();
