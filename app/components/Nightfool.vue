<template>
	<div>
		<canvas ref="canvas"></canvas>
	</div>
</template>

<script>

const THREE = global.THREE = require('three');

export default {
	methods: {

		initStars() {
			var t = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						value: new THREE.Color(16777215)
					},
					texture: {
						value: new THREE.TextureLoader().load(this.spark)
					}
				},
				vertexShader: [
					'attribute float size;',
					'attribute vec3 customColor;',
					'varying vec3 vColor;',
					'void main() {',
					'vColor = customColor;',
					'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
					'gl_PointSize = size * ( 300.0 / -mvPosition.z );',
					'gl_Position = projectionMatrix * mvPosition;',
					'}'
				].join('\n'),
				fragmentShader: [
					'uniform vec3 color;',
					'uniform sampler2D texture;',
					'varying vec3 vColor;',
					'void main() {',
					'gl_FragColor = vec4( color * vColor, 1.0 );',
					'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',
					'}'
				].join('\n'),
				blending: THREE.AdditiveBlending,
				depthTest: !1,
				transparent: !0
			});

			var r = new THREE.BufferGeometry(),
				o = new Float32Array(3 * this.stars),
				a = new Float32Array(3 * this.stars),
				i = new Float32Array(this.stars),
				n = new THREE.Color();

			for (var s = 0, c = 0; s < this.stars; s++, c += 3) {
				o[c + 0] = (2 * Math.random() - 1) * this.radius;
				o[c + 1] = (2 * Math.random() - 1) * this.radius;
				o[c + 2] = (2 * Math.random() - 1) * this.radius;

				var l = (this.hueLower + Math.random() * (this.hueUpper - this.hueLower)) / 360;

				n.setHSL(l, 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random());
				a[c + 0] = n.r;
				a[c + 1] = n.g;
				a[c + 2] = n.b;

				i[s] = this.starSize;
			}

			r.addAttribute('position', new THREE.BufferAttribute(o, 3));
			r.addAttribute('customColor', new THREE.BufferAttribute(a, 3));
			r.addAttribute('size', new THREE.BufferAttribute(i, 1));

			let starSystem = new THREE.Points(r, t);

			this.scene.add(starSystem);
		},

		initOrbs() {
			for (var t = 0; t < this.orbCount; t++) {
				var r = new THREE.SphereGeometry(1),
					o = new THREE.MeshBasicMaterial({
						color: this.rendererBackground
					});
				let orb = new THREE.Mesh(r, o);
				orb.position.z = t * t + t * t - this.radius;
				this.orbs.push(orb);
				this.scene.add(orb);
			}
		},

		updateTrailColors() {
			var t = new THREE.Color(),
				r = (this.hueLower + Math.random() * (this.hueUpper - this.hueLower)) / 360;
			t.setHSL(r, 0.5 + 0.5 * Math.random(), 0.4 + 0.4 * Math.random());
			this.trailMaterial.uniforms.headColor.value.set(t.r, t.g, t.b, 1);
		},

		initTrailRenderers() {
			for (var o = 0; o < this.orbs.length; o++) {
				var t = [],
					r = 2 * Math.PI,
					a = 0,
					i = o / this.orbCount * 10,
					n = r / 32;

				for (var s = 0; s <= r + n; s += n) {
					var c = new THREE.Vector3();
					c.set(Math.cos(s) * i, Math.sin(s) * i, 0);
					t[a] = c;
					a++;
				}

				var l = new THREE.TrailRenderer(this.scene, !1);
				this.trailMaterial = THREE.TrailRenderer.createBaseMaterial();
				l.initialize(this.trailMaterial, this.trailLength, !1, 0, t, this.orbs[o]);
				this.updateTrailColors();
				l.activate();
				this.trails.push(l);
			}
		},

		update() {

			let now = performance.now();
			var time = now * (this.bpm / 6e4);

			// // this.light.position.z = Math.sin(now / 5000) * 1000;
			// this.light.position.x = Math.cos(now / 5000) * 1000;
			// this.mat.uniforms.time.value += 0.1;
			//
			// this.obj.rotation.y += 0.001;
			// this.obj.rotation.x += 0.0005;
			//
			// if (this.tMesh) {
			// 	this.tMesh.rotation.y = Math.cos(now / 1000) * Math.PI * 0.05;
			// }
			//
			// this.mousepos[0] += (this.targetpos[0] - this.mousepos[0]) / 30;
			// this.mousepos[1] += (this.targetpos[1] - this.mousepos[1]) / 30;
			//
			// let vec = new THREE.Vector3();
			// vec.set(
			// 	this.mousepos[0] / this.w * 2 - 1,
			// 	-this.mousepos[1] / this.h * 2 + 1,
			// 	0.5
			// );
			//
			// vec.unproject(this.camera);
			//
			// let dir = vec.sub(this.camera.position).normalize();
			// let distance = -this.camera.position.z / dir.z;
			// let pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
			// pos.z = -500;
			//
			// this.light.position.copy(pos);
		},

		init() {

			if (!window.WebGLRenderingContext) {
				return;
			}

			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: this.$refs.canvas
			});

			this.renderer.setClearColor(131081);
			this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

			this.scene = new THREE.Scene();

			this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
			this.camera.position.z = -200;

			// this.camera.lookAt(new THREE.Vector3(80, -60, 0));
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));[]

			this.resize();
			this.initStars();

			window.addEventListener('resize', () => this.resize());

			this.inited = true;
		},

		render() {
			if (!this.renderer) {
				return;
			}

			this.update();
			this.renderer.render(this.scene, this.camera);

			if (!this.stopped) {
				requestAnimationFrame(() => this.render());
			}
		},

		start() {
			this.stopped = false;
			this.render();
		},

		stop() {
			this.stopped = true;
		},

		resize() {
			var width = this.$el.clientWidth;
			var height = this.$el.clientHeight;

			this.w = width;
			this.h = height;

			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(width, height);
		},

		mousemove(e) {
			this.targetpos[0] = e.clientX;
			this.targetpos[1] = e.clientY;
		}
	},

	data() {
		return {
			inited: false,
			stopped: false,
			targetpos: [ 0, 0 ],
			mousepos: [ 0, 0 ],
			spark: require('../images/spark1.png'),
			mouseX: 0,
			mouseY: 0,
			time: 0,
			rendererBackground: 131081,
			cameraZ: 1e4,
			postprocessing: {},
			hueLower: 205,
			hueUpper: 280,
			radius: 0.8 * cameraZ,
			stars: Math.round(radius),
			starSize: radius / 92,
			starSystem,
			orbCount: 64,
			orbs: [],
			trailMaterial,
			trailLength: 120,
			trails: [],
			bpm: 136,
			tilt: 1.4 * cameraZ,
			deltaX: 0,
			deltaY: 0,
			deltaZ: 3.2 * cameraZ,
			freqs: new Uint8Array(orbCount),
			// AudioContext: window.AudioContext || window.webkitAudioContext,
			// context: new AudioContext(),
			// jsNode,
			// sourceNode,
			// analyzer,
			analyzerSmoothing: 0.4,
			analyzerResolution: 512,
			gainNode: context.createGain()
		};
	},

	mounted() {
		if (!this.inited) {
			this.init();
		}
		this.resize();
		this.start();

		window.addEventListener('mousemove', this.mousemove);
	},

	beforeDestroy() {
		this.stop();
		window.removeEventListener('mousemove', this.mousemove);
	}
};

</script>

<style lang="sass" scoped>

@import 'compass/css3';

div {
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
	@include transition(opacity 1000ms linear);

	&.v-enter {
		opacity: 0;
	}

	canvas {
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		width: 100%;
	}
}

</style>
