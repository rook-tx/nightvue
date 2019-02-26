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
			this.glowPass.uniforms.resolution.value = new THREE.Vector2(this.width, this.height);
			this.glowPass.uniforms.amount.value = 3;

			this.wobblePass = new THREE.ShaderPass(THREE.WobbleShader);
			this.wobblePass.uniforms.size.value = 5;

			this.glowPass.renderToScreen = true;

			this.composer = new THREE.EffectComposer(this.renderer);
			this.composer.addPass(this.renderPass);
			this.composer.addPass(this.wobblePass);
			this.composer.addPass(this.glowPass);

			this.inited = true;

			this.initOrbs();
		},

		initOrbs() {
			for (var t = 0; t < this.orbCount; t++) {
				var geometry = new THREE.SphereGeometry(1),
					material = new THREE.MeshBasicMaterial({
						color: 0x000000
					});
				let orb = new THREE.Mesh(geometry, material);
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
					scale = 5,
					inc = twoPi / (this.orbCount / 2),
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
		},

		update() {

			let time = performance.now(),
				scaledTime = time * (this.bpm / 60000);

			for (let i = 0; i < this.orbs.length; i++) {
				let step = Math.PI * 2 * i / this.orbCount,
					theta = scaledTime / 2 * step,
					orbRadius = 500 + this.radius / 2 * (Math.cos(scaledTime + step) + 1),
					orbDepth = this.radius * 2 * Math.sin(scaledTime + step);

				this.orbs[i].position.x = orbRadius * Math.sin(theta);
				this.orbs[i].position.y = orbRadius * Math.cos(theta);
				this.orbs[i].position.z = orbDepth;

				this.trails[i].advance();

			}

			this.camera.position.x += 0.02 * (this.deltaX - this.camera.position.x);
			this.camera.position.y += 0.02 * (this.deltaY - this.camera.position.y);
			this.camera.position.z += 0.03 * (this.deltaZ - this.camera.position.z);

			this.camera.lookAt(this.scene.position);

			this.camera.rotation.z += scaledTime / 8;

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

			this.deltaZ = this.radius * 1.5;
			this.deltaX = this.mouseX / (this.width / 2) * (this.radius / 6);
			this.deltaY = this.mouseY / (this.height / 2) * (this.radius / 6);
		}
	},

	data() {
		let width = window.innerWidth,
			height = window.innerHeight,
			rendererBackground = 131081,
			cameraZ = 10000,
			hueLower = 260,
			hueUpper = 350,
			radius = 0.8 * cameraZ,
			bpm = 92,
			tilt = 1.4 * cameraZ,
			deltaX = 0,
			deltaY = 0,
			deltaZ = 3.2 * cameraZ,
			orbCount = 60,
			orbs = [],
			trails = [],
			trailLength = 140;

		return {
			width,
			height,
			mouseX: width / 2,
			mouseY: height / 2,
			inited: false,
			stopped: false,
			rendererBackground,
			cameraZ,
			hueLower,
			hueUpper,
			radius,
			bpm,
			tilt,
			deltaX,
			deltaY,
			deltaZ,
			orbCount,
			orbs,
			trails,
			trailLength
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
