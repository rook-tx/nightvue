<template>

	<section class="map-container">
		<div id="map">
			<gmap-map
				:center="center"
				:zoom="17"
				:options="{ scrollwheel, draggable, zoomControl }">
				<gmap-marker
					:position="center"
					:label="label">
				</gmap-marker>
			</gmap-map>
		</div>
	</section>

</template>

<script>

import * as VueGoogleMaps from 'vue2-google-maps';
import Vue from 'vue';
const iconBase = require('../marker.png');

Vue.use(VueGoogleMaps, {
	load: 'AIzaSyCU94afFT36d12eC2eqBXR-FxkiwjpQlyo'
});

export default {
	data() {
		return {
			center: { lat: 43.645281, lng: -79.432878 },
			scrollwheel: false,
			draggable: false,
			zoomControl: false,
			iconBase,
			label: {
				text: 'Array of Stars',
				color: '#870707',
				fontWeight: 'bold'
			}
		};
	}
};

</script>

<style lang="sass" scoped>

@import "compass/css3";
@import "../sass/variables";

.map-container {
	padding-top: 9/16*100%;
	position: relative;

	#map {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		.vue-map-container {
			height: 100%;
			width: 100%;
		}
	}
}

</style>
