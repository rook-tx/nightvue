<template>
	<section id="ie10" :class="[isIE10 ? 'takeover' : '' ]">
		<div class="text-box">
			<h3>To view this site at its optimal, please use another browser:</h3>
			<ul>
				<li>
					<a href="https://www.mozilla.org/en-US/firefox/new/">
						<img :src="require('../images/firefox.png')" alt="">
						<span>Download Firefox</span>
					</a>
				</li>
				<li>
					<a href="https://www.google.com/chrome/browser/desktop/index.html">
						<img :src="require('../images/chrome.png')" alt="">
						<span>Download Chrome</span>
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<script>

const TEST_JS = '/*@cc_on return /^10/.test(@_jscript_version) @*/';

export default {
	methods: {
		ieCheck() {
			this.isIE10 = false;
			if (this.eval(TEST_JS)()) {
				this.isIE10 = true;
			}
		}
	},
	data() {
		return {
			isIE10: false
		};
	},
	beforeMount() {
		this.ieCheck();
	}
};

</script>

<style lang="sass" scoped>

#ie10 {
	display: none;

	&.takeover {
		display: block;
		position: fixed;
		background: #fff;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100%;
		width: 100%;
		z-index: 100;

		.text-box {
			background: #000;
			color: #fff;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
			padding: 40px;

			li {
				text-align: center;

				span {
					padding-left: 10px;
				}

				img {
					vertical-align: text-bottom;
					display: inline-block;
				}
			}
		}
	}
}

</style>
