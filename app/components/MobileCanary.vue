<template>
	<div></div>
</template>

<script>

export default {
	methods: {
		isMobile() {
			var style = window.getComputedStyle(this.$el);
			return style.display === 'block';
		}
	}
};

</script>

<style lang="sass" scoped>

@import '../sass/variables';

div {
	display: none;
	position: absolute;
	width: 0;
	height: 0;
	top: -10000px;
	left: -10000px;
}

@media screen and (max-width: $tablet) {
	div {
		display: block;
	}
}


</style>
