import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@blockly/continuous-toolbox']
	},
	build: {
		commonjsOptions: {
			exclude: ['@blockly/continuous-toolbox'],
			include: []
		}
	}
});
