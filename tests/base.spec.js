import devConfig from '../cfg/dev.js';
import prodConfig from '../cfg/prod.js';

describe('Party Starter', () => {

	it('has a development config', () => {
		expect(devConfig).toBeDefined();
	});

	it('defines a development public path', () => {
		expect(devConfig.publicPath).toBeDefined();
		expect(typeof devConfig.publicPath).toBe('string');
	});

	it('has a production config', () => {
		expect(prodConfig).toBeDefined();
	});

	it('defines a production public path', () => {
		expect(prodConfig.publicPath).toBeDefined();
		expect(typeof prodConfig.publicPath).toBe('string');
	});

});
