import Vue from 'vue';
import MobileCanary from '../app/components/MobileCanary.vue';

describe('MobileCanary', () => {

	let vm;
	let ctor;

	it('exists', () => expect(MobileCanary).toBeDefined());

	it('can be created', () => {

		ctor = Vue.extend(MobileCanary);
		expect(ctor).toBeDefined();

	});

	it('has an isMobile() function', () => {

		let mc = new ctor().$mount();
		expect(typeof mc.isMobile).toBe('function');

	});

	it('renders', () => {

		vm = new Vue(ctor).$mount();
		expect(vm._isVue).toBeTruthy();

	});

	it('renders a div', () => {

		let el = vm.$el;
		expect(el.tagName).toBe('DIV');

	});

// resize window, check getComputedStyle()

});
