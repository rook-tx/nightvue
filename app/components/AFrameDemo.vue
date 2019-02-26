<template>
	<div class="outer">

		<div class="input">
			<input type="text" value="cat" ref="q"
				placeholder="cat" v-on:change="inputChange()"/>
			<input type="number" value="0" ref="page"
				step="1" min="0" max="99" v-on:change="inputChange()"/>
		</div>

		<a-scene>

			<a-entity position="0 0 2">
				<a-camera>
					<a-cursor></a-cursor>
				</a-camera>
			</a-entity>

			<a-assets>
				<video v-for="vid in vData"
					:key="vid.id"
					:id="vid.id"
					:src="vid.images.original_mp4.mp4"
					autoplay loop webkit-playsinline></video>
			</a-assets>

			<a-sky color="#acc6f6"></a-sky>

			<a-video v-for="vid, index in vData"
				:key="'v' + vid.id"
				:src="'#' + vid.id"
				:data-obj="JSON.stringify(vid)"
				ref="vidobj"
				width="1"
				height="0.7"
				cursor-listener
				:position="(-1.5 + Math.floor(index / 4)) + ' ' + (2.6 - (Math.floor(index % 4) * 0.7)) + ' 0'"></a-video>

		</a-scene>

	</div>
</template>

<script>

import AFRAME from 'aframe';
import axios from 'axios';
import Vue from 'vue';

const apikey = '367525a3f6ef4068a8d6edf981fe847a';
const searchurl = 'https://api.giphy.com/v1/gifs/search?limit=16&lang=en&';

AFRAME.registerComponent('cursor-listener', {
	init() {
		this.el.addEventListener('click', () => {

			// var obj = JSON.parse(this.el.getAttribute('data-obj'));
			// window.open(obj.url);

		});
	}
});

export default {

	methods: {
		search(q, page) {

			var url = `${searchurl}api_key=${apikey}&q=${q}&offset=${page * 16}`;

			axios.get(url).then((res) => {
				this.vData = res.data.data;
				Vue.nextTick(() => this.playVids());
			});

		},
		inputChange() {
			var search = this.$refs.q.value;
			var page = this.$refs.page.value;
			this.search(search, page);
		},
		playVids() {
			var vids = document.getElementsByTagName('video');
			for (var i = 0; i < vids.length; i++) {
				vids[i].play();
			}
		}
	},

	data() {
		return {
			vData: [],
			page: 0
		};
	},

	mounted() {
		window.addEventListener('click', () => this.playVids());
		this.inputChange();
	}
};

</script>

<style lang="sass" scoped>

.outer {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.input {
	position: absolute;
	top: 2vw;
	left: 2vw;
	z-index: 2;

	input {
		background-color: #fff;
	}
}

</style>
