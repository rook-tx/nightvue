uniform sampler2D tDiffuse;
uniform float size;
uniform float amount;
uniform vec2 resolution;
uniform float darkness;

varying vec2 vUv;

void main() {
	float h = size / resolution.x;
	float v = size / resolution.y;
	vec4 sum = vec4( 0.0 );

	sum += (texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) )- darkness) * 0.051;
	sum += (texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) )- darkness) * 0.0918;
	sum += (texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) )- darkness) * 0.12245;
	sum += (texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) )- darkness) * 0.1531;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y ) )- darkness) * 0.1633;
	sum += (texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) )- darkness) * 0.1531;
	sum += (texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) )- darkness) * 0.12245;
	sum += (texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) )- darkness) * 0.0918;
	sum += (texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) )- darkness) * 0.051;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) )- darkness) * 0.051;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) )- darkness) * 0.0918;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) )- darkness) * 0.12245;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) )- darkness) * 0.1531;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y ) )- darkness) * 0.1633;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) )- darkness) * 0.1531;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) )- darkness) * 0.12245;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) )- darkness) * 0.0918;
	sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) )- darkness) * 0.051;

	vec4 base = texture2D( tDiffuse, vUv );
	gl_FragColor = base + max(sum,0.0) * amount;
}
