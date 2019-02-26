import { Selector } from 'testcafe';

fixture(`Index`).page('http://localhost.com:8080/');

test('app-wrapper gets content added', async testController => {
	const selector = await new Selector('#app-wrapper').child(0);
	await testController.expect(selector).ok();
});
