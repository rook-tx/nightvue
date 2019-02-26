<template>
	<div class="app-wrapper">

		<transition appear>
			<preloader v-if="!loaded"></preloader>
		</transition>

		<transition appear>
			<router-view :key="$route.fullPath" v-if="loaded"></router-view>
		</transition>

	</div>
</template>

<script>

import Preloader from './PreloaderDemo.vue';

export default {

	components: { Preloader },

	data() {
		return { loaded: false };
	},

	mounted() {
		this.$root.$on('loaded', () => { this.loaded = true; });
	}

};

</script>

<style lang="stylus">

@import "../styl/main.styl";

</style>
