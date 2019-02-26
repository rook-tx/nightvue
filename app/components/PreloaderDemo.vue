<template>
	<div class="preloader"></div>
</template>

<style lang="sass" scoped>

@import 'compass/css3';
@import '../sass/ease';

.preloader {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 2;
	width: 100%;
	height: 100%;
	background-color: #000;
	@include transition(all 500ms $easeInOutCubic);

	&.v-leave-to {
		opacity: 0;
	}
}

</style>
