import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: [
			'@blockly/continuous-toolbox'

		],
		exclude: ['file-dialog']
	},
	build: {
		commonjsOptions: {
			exclude: [],
			include: [
				'@blockly/continuous-toolbox',
				'file-dialog'
			]
		}
	}
});
