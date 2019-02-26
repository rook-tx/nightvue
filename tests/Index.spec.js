import Vue from 'vue';

import Index from '../app/components/Index.vue';
import router from '../app/js/router.js';

Vue.use(router);

describe('Index', () => {

	it('exists', () => expect(Index).toBeDefined());

	it('can be created', () => {

		let index = Vue.extend(Index);
		expect(index).toBeDefined();

	});

	let vm;

	it('renders', () => {

		vm = new Vue({
			router,
			render: (h) => h(Index)
		}).$mount();

		expect(vm._isVue).toBeTruthy();

	});

	it('creates an instance of #app-wrapper', () => {

		let el = vm.$el;
		expect(el.id).toBe('app-wrapper');

	});

});
