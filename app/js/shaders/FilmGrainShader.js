/* eslint-disable */

THREE.FilmGrainShader = {
	uniforms: {
			tDiffuse: {
					type: "t",
					value: null
			},
			time: {
					type: "f",
					value: 0
			},
			noiseAmt: {
					type: "f",
					value: .05
			},
			resolution: {
					type: "v2",
					value: new THREE.Vector2(0,0)
			}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tDiffuse;", "uniform sampler2D bg;", "uniform float time;", "uniform float noiseAmt;", "float snoise(in vec2 co){", "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", "}", "void main() {", "vec4 warp = texture2D(tDiffuse, vUv);", "float noise = snoise(vUv + vec2(cos(time), sin(time)));", "gl_FragColor = warp + (noise * noiseAmt);", "}"].join("\n")
}