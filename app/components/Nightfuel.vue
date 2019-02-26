<template>
	<div>
		<canvas ref="canvas"></canvas>
	</div>
</template>

<script>

const THREE = global.THREE = require('three');
require('../js/TrailRenderer.js');
require('../../node_modules/three/examples/js/shaders/CopyShader.js');
require('../../node_modules/three/examples/js/postprocessing/EffectComposer.js');
require('../../node_modules/three/examples/js/postprocessing/ShaderPass.js');
require('../../node_modules/three/examples/js/postprocessing/RenderPass.js');
require('../js/shaders/GlowShader.js');
require('../js/shaders/WobbleShader.js');
require('../js/shaders/FilmGrainShader.js');

export default {

	methods: {
		init() {
			if (!window.WebGLRenderingContext) {
				return;
			}

			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 30000);

			this.camera.lookAt(this.scene.position);

			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: this.$refs.canvas
			});

			this.renderer.setClearColor(this.rendererBackground);

			this.resize();

			this.renderPass = new THREE.RenderPass(this.scene, this.camera);

			this.glowPass = new THREE.ShaderPass(THREE.GlowShader);
			console.log(this.glowPass.uniforms);
			this.glowPass.uniforms.resolution.value = new THREE.Vector2(this.width, this.height);
			this.glowPass.uniforms.amount.value = 9;

			this.wobblePass = new THREE.ShaderPass(THREE.WobbleShader);
			this.wobblePass.uniforms.size.value = 9;

			this.filmGrainPass = new THREE.ShaderPass(THREE.FilmGrainShader);
			this.filmGrainPass.uniforms.resolution.value = new THREE.Vector2(this.width, this.height);
			this.filmGrainPass.renderToScreen = true;

			this.composer = new THREE.EffectComposer(this.renderer);
			this.composer.addPass(this.renderPass);
			this.composer.addPass(this.wobblePass);
			this.composer.addPass(this.glowPass);
			this.composer.addPass(this.filmGrainPass);

			this.inited = true;

			this.initStars();
			this.initOrbs();
		},

		initStars() {
			let shaderMaterial = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						value: new THREE.Color(0xffffff)
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

			let starsGeometry = new THREE.BufferGeometry(),
				positions = new Float32Array(3 * this.stars),
				colors = new Float32Array(3 * this.stars),
				sizes = new Float32Array(this.stars),
				color = new THREE.Color();

			for (let s = 0, c = 0; s < this.stars; s++, c += 3) {
				positions[c + 0] = (2 * Math.random() - 1) * this.radius;
				positions[c + 1] = (2 * Math.random() - 1) * this.radius;
				positions[c + 2] = (2 * Math.random() - 1) * this.radius;

				let hue = (this.hueLower + Math.random() * (this.hueUpper - this.hueLower)) / 360;

				color.setHSL(hue, 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random());
				colors[c + 0] = color.r;
				colors[c + 1] = color.g;
				colors[c + 2] = color.b;

				sizes[s] = this.starSize;
			}

			starsGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
			starsGeometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
			starsGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

			let starSystem = new THREE.Points(starsGeometry, shaderMaterial);

			this.scene.add(starSystem);

		},

		initOrbs() {
			for (var t = 0; t < this.orbCount; t++) {
				var geometry = new THREE.SphereGeometry(1),
					material = new THREE.MeshBasicMaterial({
						color: 0xffffff
					});
				let orb = new THREE.Mesh(geometry, material);
				orb.position.z = t * t + t * t - this.radius;
				this.orbs.push(orb);
				this.scene.add(orb);
			}

			this.initTrailRenderers();

		},

		initTrailRenderers() {
			for (var o = 0; o < this.orbs.length; o++) {
				let trailHeadGeometry = [],
					twoPi = 2 * Math.PI,
					index = 0,
					scale = o / this.orbCount * 10,
					// scale = 6 + o / this.orbCount * 2,
					inc = twoPi / 32,
					trail = new THREE.TrailRenderer(this.scene, false),
					trailMaterial = THREE.TrailRenderer.createBaseMaterial();

				for (var s = 0; s <= twoPi + inc; s += inc) {
					let vector = new THREE.Vector3();
					vector.set(Math.cos(s) * scale, Math.sin(s) * scale, 0);
					trailHeadGeometry[index] = vector;
					index++;
				}

				var color = new THREE.Color(),
					hue = (this.hueLower + Math.random() * (this.hueUpper - this.hueLower)) / 360;

				color.setHSL(hue, 0.5 + 0.5 * Math.random(), 0.4 + 0.4 * Math.random());

				trailMaterial.uniforms.headColor.value.set(color.r, color.g, color.b, 1);

				trail.initialize(trailMaterial, this.trailLength, false, 0, trailHeadGeometry, this.orbs[o]);

				trail.activate();

				this.trails.push(trail);
			}

			this.setupRoutingGraph();
		},

		setupRoutingGraph() {
			let sourceNode = this.context.createBufferSource();
			let analyzer = this.context.createAnalyser();

			analyzer.smoothingTimeConstant = this.analyzerSmoothing;
			analyzer.fftSize = 2 * this.orbCount;

			let jsNode = this.context.createScriptProcessor(this.analyzerResolution, 1, 1);

			jsNode.onaudioprocess = () => {
				analyzer.getByteFrequencyData(this.freqs);
			};

			jsNode.connect(this.context.destination);
			sourceNode.connect(analyzer);
			sourceNode.connect(this.gainNode);
			analyzer.connect(jsNode);
			this.gainNode.connect(this.context.destination);

			var req = new XMLHttpRequest();
			req.open('GET', '../audio/grace.mp3', true);
			req.responseType = 'arraybuffer';

			req.onload = () => {
				this.context.decodeAudioData(req.response, (buf) => {
					sourceNode.buffer = buf;
					sourceNode.loop = !0;
					sourceNode.start(0);
				}, () => {
					// console.log(e);
				});
			};

			req.send();
		},

		update() {

			let time = performance.now(),
				scaledTime = time * (this.bpm / 60000);

			for (let i = 0; i < this.orbs.length; i++) {
				var ishift = this.orbCount - i,
					ratio = this.freqs[ishift] / 256,
					midThreshold = 256 - i / 54 * 62,
					heavyThreshold = 256 - (this.orbCount - i),
					orbRadius = i * (i + ratio * (i / 15)),
					orbRadiusMid = i * (i + ratio * (i / 9)),
					orbRadiusHeavy = i * (i + ratio * (i / 2)),
					orbZed = i * (i / 4),
					theta = scaledTime * i / 95;

				if (this.freqs[0] < 100) {
					orbRadius = i * i;
				}

				if (this.freqs[ishift] > midThreshold) {
					orbRadius = orbRadiusMid;
				}

				if (this.freqs[ishift] > heavyThreshold) {
					orbRadius = orbRadiusHeavy;
				}

				if (i % 2 === 0) {
					this.orbs[i].position.x = orbRadius * Math.sin(theta);
					this.orbs[i].position.y = orbRadius * Math.cos(theta);
					this.orbs[i].position.z = i * i + i * i * (i / 17) - 2 * this.radius + orbZed * Math.cos(theta);
				} else {
					this.orbs[i].position.x = orbRadius * Math.cos(theta);
					this.orbs[i].position.y = orbRadius * Math.sin(theta);
					this.orbs[i].position.z = i * i + i * i * (i / 17) - 2 * this.radius - orbZed * Math.sin(theta);
				}

				this.trails[i].advance();

			}

			this.camera.position.x += 0.02 * (this.deltaX - this.camera.position.x);
			this.camera.position.y += 0.02 * (this.deltaY - this.camera.position.y);
			this.camera.position.z += 0.03 * (this.deltaZ - this.camera.position.z);

			this.camera.lookAt(this.scene.position);

			this.camera.rotation.z += scaledTime / 4;

			this.filmGrainPass.uniforms.time.value = scaledTime;
			this.wobblePass.uniforms.time.value = scaledTime / 2;
			this.wobblePass.uniforms.strength.value = 0.015 * Math.sin(scaledTime);

		},

		render() {
			if (!this.renderer) {
				return;
			}

			this.update();
			this.composer.render();

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
			this.width = window.innerWidth;
			this.height = window.innerHeight;

			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(this.width, this.height);
			this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		},

		momo(e) {
			this.mouseX = e.clientX - this.width / 2;
			this.mouseY = e.clientY - this.height / 2;

			this.deltaZ = this.cameraZ;
			this.deltaX = this.mouseX / this.width * this.tilt;
			this.deltaY = this.mouseY / this.height * this.tilt;
		}
	},

	data() {
		let width = window.innerWidth,
			height = window.innerHeight,
			rendererBackground = 131081,
			cameraZ = 10000,
			hueLower = 225,
			hueUpper = 340,
			radius = 0.8 * cameraZ,
			stars = Math.round(2 * radius),
			starSize = radius / 50,
			bpm = 120,
			tilt = 1.4 * cameraZ,
			deltaX = 0,
			deltaY = 0,
			deltaZ = 3.2 * cameraZ,
			orbCount = 64,
			orbs = [],
			trails = [],
			trailLength = 120,
			freqs = new Uint8Array(orbCount),
			analyzerSmoothing = 0.4,
			analyzerResolution = 512,
			AudioContext = window.AudioContext || window.webkitAudioContext,
			context = new AudioContext(),
			gainNode = context.createGain();

		return {
			width,
			height,
			mouseX: width / 2,
			mouseY: height / 2,
			inited: false,
			stopped: false,
			spark: require('../images/spark1.png'),
			rendererBackground,
			cameraZ,
			hueLower,
			hueUpper,
			radius,
			stars,
			starSize,
			bpm,
			tilt,
			deltaX,
			deltaY,
			deltaZ,
			orbCount,
			orbs,
			trails,
			trailLength,
			freqs,
			analyzerSmoothing,
			analyzerResolution,
			context,
			gainNode
		};
	},

	mounted() {
		if (!this.inited) {
			this.init();
		}
		this.start();
		window.addEventListener('resize', this.resize);
		window.addEventListener('mousemove', this.momo);
		window.addEventListener('blur', this.stop);
		window.addEventListener('focus', this.start);
	},

	beforeDestroy() {
		this.stop();
	}

};

</script>

<style scoped>

div, canvas {
	height: 100%;
	left: 0;
	position: fixed;
	top: 0;
	width: 100%;
}

</style>
