// Library imports
import Vue from 'vue';

// Local imports
import Index from '../components/Index.vue';
import router from './router.js';
import ContentPlugin from './content-plugin.js';

Vue.use(ContentPlugin);

// Init Vue
const vue = new Vue({
	router,
	render: (h) => h(Index)
});

ContentPlugin.init(vue);

// Prerendering can move our code into <head>, so
// mount when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
	vue.$mount('#app-wrapper');
	ContentPlugin.preload().then(() => vue.$emit('loaded'));
});
