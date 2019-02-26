<template>
	<div>
		<canvas ref="canvas"></canvas>
	</div>
</template>

<script>

const THREE = global.THREE = require('three');
const createGeometry = require('three-bmfont-text');
const loadFont = require('load-bmfont');

const SHADOWS = false;

import frag from '../shaders/simplex.frag';
import vert from '../shaders/default.vert';

export default {
	props: [ 'color', 'text' ],
	watch: {
		color() {

			// this.light.color = new THREE.Color(this.color);
			this.mat.uniforms.color.value = new THREE.Color(this.color);
		}
	},
	data() {
		return {
			inited: false,
			stopped: false,
			targetpos: [ 0, 0 ],
			mousepos: [ 0, 0 ]
		};
	},
	methods: {
		setupScene() {

			var light = new THREE.PointLight(0xffffff, 3, 0, 2);

			if (SHADOWS) {
				light.castShadow = true;
				light.shadowDarkness = 0.1;
			}

			this.light = light;

			// this.light.sphere = new THREE.Mesh(
			// 	new THREE.SphereGeometry(2, 16, 16),
			// 	new THREE.MeshBasicMaterial({ color: 0xffffff })
			// );
			// this.light.add(this.light.sphere);

			this.light.position.set(400, 200, -500);
			this.scene.add(light);

			let uniforms = THREE.UniformsUtils.merge([
				THREE.UniformsLib.lights,
				{
					time: { value: 1.0 },
					color: { value: new THREE.Color(this.color) }
				}
			]);

			this.mat = new THREE.ShaderMaterial({
				uniforms: uniforms,
				vertexShader: vert,
				fragmentShader: frag,
				lights: true
			});

			var geo = new THREE.IcosahedronGeometry(1);

			this.obj = new THREE.Object3D();
			this.obj.position.x = -80;
			this.obj.position.y = 60;
			this.scene.add(this.obj);

			for (var i = 0; i < 300; i++) {
				var mesh = new THREE.Mesh(geo, this.mat);

				mesh.position.set(
					Math.random() - 0.5,
					Math.random() - 0.5,
					Math.random() - 0.5
				).normalize();

				mesh.position.multiplyScalar(Math.random() * 90);

				mesh.rotation.set(
					Math.random() * 2,
					Math.random() * 2,
					Math.random() * 2
				);

				var scale = Math.random() * 10;
				mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

				if (SHADOWS) {
					mesh.castShadow = true;
					mesh.receiveShadow = true;
				}

				this.obj.add(mesh);
			}

			loadFont(require('../fonts/hlv_neu_lt.fnt'), (e, fnt) => {

				let geometry = createGeometry({
					width: 1000,
					font: fnt
				});

				geometry.update(this.text);

				let tl = new THREE.TextureLoader();
				tl.load(require('../fonts/hlv_neu_lt.png'), (tex) => {
					let mat = new THREE.MeshBasicMaterial({
						map: tex,
						transparent: true,
						color: 0xffffff,
						side: THREE.DoubleSide
					});

					let tMesh = new THREE.Mesh(geometry, mat);
					tMesh.position.x = 10;
					tMesh.position.y = 40;
					tMesh.scale.multiplyScalar(-0.075);
					this.scene.add(tMesh);

					this.tMesh = tMesh;

				});

			});

		},
		update() {

			let now = performance.now();

			// this.light.position.z = Math.sin(now / 5000) * 1000;
			this.light.position.x = Math.cos(now / 5000) * 1000;
			this.mat.uniforms.time.value += 0.1;

			this.obj.rotation.y += 0.001;
			this.obj.rotation.x += 0.0005;

			if (this.tMesh) {
				this.tMesh.rotation.y = Math.cos(now / 1000) * Math.PI * 0.05;
			}

			this.mousepos[0] += (this.targetpos[0] - this.mousepos[0]) / 30;
			this.mousepos[1] += (this.targetpos[1] - this.mousepos[1]) / 30;

			let vec = new THREE.Vector3();
			vec.set(
				this.mousepos[0] / this.w * 2 - 1,
				-this.mousepos[1] / this.h * 2 + 1,
				0.5
			);

			vec.unproject(this.camera);

			let dir = vec.sub(this.camera.position).normalize();
			let distance = -this.camera.position.z / dir.z;
			let pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
			pos.z = -500;

			this.light.position.copy(pos);
		},
		init() {

			if (!window.WebGLRenderingContext) {
				return;
			}

			this.renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true,
				canvas: this.$refs.canvas
			});

			this.renderer.setClearColor(0xffffff, 0);
			this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

			if (SHADOWS) {
				this.renderer.shadowMapEnabled = true;
				this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
			}

			this.scene = new THREE.Scene();

			this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
			this.camera.position.z = -200;

			// this.camera.lookAt(new THREE.Vector3(80, -60, 0));
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));

			this.resize();
			this.setupScene();

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
