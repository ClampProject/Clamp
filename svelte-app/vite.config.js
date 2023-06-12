import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@blockly/continuous-toolbox']
	},
	build: {
		commonjsOptions: {
			include: ['@blockly/continuous-toolbox']
		}
	},
	dev: {
		commonjsOptions: {
			include: ['@blockly/continuous-toolbox']
		}
	}
});
