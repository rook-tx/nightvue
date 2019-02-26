<template>
	<section class="home">

		<transition appear>
			<ThreeDemo :color="colors[colorIdx]" :text="versionStr"></ThreeDemo>
		</transition>

		<section class="sec mt">
			<div class="wrap">
				<div class="one-col">
					<h1>{{ str }}</h1>
					<h2>{{ str }}</h2>
					<h3>{{ str }}</h3>
					<h4>{{ str }}</h4>
					<h5>{{ str }}</h5>

					<MobileSwap>
						<div slot="mobile">
							<h4>MOBILE</h4>
						</div>
						<div slot="desktop">
							<h4>DESKTOP</h4>
						</div>
					</MobileSwap>
				</div>

				<div class="two-col">
					<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. <a href="#" v-on:click.prevent="setColor()"
						:style="{ 'border-bottom-color': nextColor }">Duis aute</a> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
				</div>
				<div class="two-col">
					<p>Duis aute <router-link to="/cats">CATS</router-link> dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
					<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
				</div>
				<div class="three-col">
					<ul>
						<li>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </li>
						<li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
						<li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
					</ul>
					<GoogleMaps></GoogleMaps>
				</div>
				<div class="three-col">
					<ol>
						<li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
						<li>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </li>
						<li>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</li>
						<li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
					</ol>
				</div>
				<div class="three-col">
					<contact-form></contact-form>
				</div>
			</div>
		</section>
		<!-- <IETakeover></IETakeover> -->
	</section>
</template>

<script>

import Vue from 'vue';
import VueRouter from 'vue-router';

import MobileSwap from './MobileSwap.vue';
import ContactForm from './ContactForm.vue';

const pjson = require('../../package.json');
const THREE = require('three');

const COLORS = [ 0x282828, 0x1041c5 ];

export default {
	components: {
		ThreeDemo: () => import('./ThreeDemo.vue'),
		GoogleMaps: () => import('./GoogleMaps.vue'),
		IETakeover: () => import('./IETakeover.vue'),
		MobileSwap,
		ContactForm
	},
	computed: {
		nextColor() {
			var cIdx = this.colorIdx + 1;
			return '#' + COLORS[cIdx % COLORS.length].toString(16);
		}
	},
	methods: {
		setColor() {
			this.colorIdx = ++this.colorIdx % COLORS.length;
			this.color = COLORS[this.colorIdx];
		},
		doSubmit() {
			let action = this.$refs.form.action;
			console.log(action);
		}
	},
	data() {

		let versions = {
			'party-starter': pjson.version,
			'vue': Vue.version,
			'vue-router': VueRouter.version,
			'three': 'r' + THREE.REVISION
		};

		let vo = Object.keys(versions).map((x) => {
			return `${x}: ${versions[x]}`;
		});

		let versionStr = vo.join('\n');

		return {
			str: 'Party Started',
			colors: COLORS,
			colorIdx: 0,
			versions,
			versionStr
		};
	}
};

</script>

<style lang="sass" scoped>

@import "../sass/variables";

.home {
	color: $w;
	min-height: 100%;
}

.mt {
	margin-top: 25vh;
	margin-bottom: 5vw;
	position: relative;
	z-index: 1;
}

a {
	display: inline-block;
	border-bottom: 2px solid #666;
}

.meta {
	position: absolute;
	top: 2vw;
	z-index: 1;
}

pre {
	line-height: 1.1em;
}

</style>

<style lang="sass">

@import "compass/css3";

html, body {
	background-color: #282828;
	background-attachment: fixed;
	@include background-image(linear-gradient(#282828, #000));
}

</style>
