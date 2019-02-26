const ContentPlugin = {
	init(vue) {
		ContentPlugin.vue = vue;
	},
	preload() {
		return new Promise((resolve) => {

			// Set up any preloading here

			setTimeout(() => resolve(), 1000);
		});
	}
};

ContentPlugin.install = (Vue) => {

	Vue.prototype.getContent = function() { // eslint-disable-line func-names

		// Inject properties into components here

	};

	Vue.mixin({ beforeCreate: Vue.prototype.getContent });

};

export default ContentPlugin;
