<template>
	<div>
		<MobileCanary ref="canary"></MobileCanary>
		<slot name="mobile" v-if="mob"></slot>
		<slot name="desktop" v-if="!mob"></slot>
	</div>
</template>

<script>

import MobileCanary from './MobileCanary.vue';

export default {
	data() {
		return { mob: false };
	},
	components: { MobileCanary },
	methods: {
		resize() {
			this.mob = this.$refs.canary.isMobile();
		}
	},
	created() {
		window.addEventListener('resize', this.resize);
	},
	mounted() {
		this.resize();
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.resize);
	}
};

</script>
