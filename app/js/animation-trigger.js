var animationTrigger = {
	methods: {
		check(ref, el, animationClass) {
			let boxY = ref.getBoundingClientRect().y;
			let boxH = ref.getBoundingClientRect().height;
			let windowH = window.screen.height;

			let header = 60;
			let buffer = 100;

			let alreadyHas = el.classList.contains(animationClass);
			let visible = boxY > -boxH + header && boxY < windowH - header - buffer;

			if (visible && alreadyHas) {
				return true;
			} else if (visible && !alreadyHas) {
				if (boxY > -(header + buffer) && boxY < header + buffer) {
					el.classList.add(animationClass);
				}
			} else {
				el.classList.remove(animationClass);
			}
			return true;
		}
	}
};

export default animationTrigger;
