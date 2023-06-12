import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: [
			'@blockly/continuous-toolbox',
			'file-saver',
		]
	},
	// build: {
	// 	commonjsOptions: {
	// 		include: [
	// 			'@blockly/continuous-toolbox',
	// 			'file-saver',
	// 		]
	// 	}
	// }
});
