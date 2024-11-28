import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
	manifest : {
		permissions: [
			"storage",
			"activeTab"
		],
		host_permissions : [
			"https://finviz.com/screener.ashx?*"
		]
	}
});
