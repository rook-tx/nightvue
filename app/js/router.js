import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
	base: '/',
	mode: 'history',
	routes: [
		{
			path: '/',
			component: () => import('../components/UI.vue'),
			children: [
				{
					path: '',
					component: () => import('../components/Home.vue')
				}
			]
		}
	]
});

export default router;
