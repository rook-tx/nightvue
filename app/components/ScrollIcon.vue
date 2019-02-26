<template>
	<div class="scroll-indicator">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36"><title>Scroll</title><path d="M16.58 4.17a7.26 7.26 0 0 1 7.25 7.25v13.83a7.25 7.25 0 0 1-14.5 0V11.42a7.26 7.26 0 0 1 7.25-7.25m0-2a9.28 9.28 0 0 0-9.25 9.25v13.83a9.28 9.28 0 0 0 9.25 9.25 9.28 9.28 0 0 0 9.25-9.25V11.42a9.28 9.28 0 0 0-9.25-9.25z"></path><path d="M16.58 9.17a.92.92 0 0 0-.92.92v3.83a.92.92 0 1 0 1.83 0v-3.84a.92.92 0 0 0-.92-.92z" class="mouse-wheel"></path></svg>
    </div>
</template>

<style lang="sass" scoped>

@import 'compass/css3';
@import '../sass/variables';
@import '../sass/global';
@import '../sass/ease';

.scroll-indicator {
	bottom: $let*.5rem;
	left: ((100vh/3)/.5625);
	margin-left: 1vw;
	opacity: .6;
	pointer-events: none;
	position: absolute;
	@include transition(all .8s $easeOutCubic .8s);
	z-index: 5;

	&.v-enter, &.v-leave-to {
		opacity: 0;
		left: 0;
	}

	&.v-leave-to {
		opacity: 0;
		@include transition-timing-function( $easeInOutCubic );
		@include transition-delay( 0s );
	}
}

svg {
	display: block;
	height: (36/1440)*100vw;
	width: (32/1440)*100vw;
}

path {
	stroke: none;
	fill: #fff;
}

path.mouse-wheel {
	-webkit-animation: 1s infinite alternate scroll;
	-moz-animation: 1s infinite alternate scroll;
	animation: 1s infinite alternate scroll;
}

@-webkit-keyframes scroll {
	0% {
		@include transform(translateY(-25%));
	}

	100% {
		@include transform(translateY(75%));
	}
}

@-moz-keyframes scroll {
	0% {
		@include transform(translateY(-25%));
	}

	100% {
		@include transform(translateY(75%));
	}
}

@keyframes scroll {
	0% {
		@include transform(translateY(-25%));
	}

	100% {
		@include transform(translateY(75%));
	}
}

@media screen and (max-width: $tablet) {
	.scroll-indicator {
		left: ((100vh/3)/.5625) - 10;
	}
}

@media screen and (min-width: $coletop + 1) {
	svg {
		height: vlock((36/1440)*100);
		width: vlock((32/1440)*100);
	}
}

</style>
