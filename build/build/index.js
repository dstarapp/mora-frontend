import { exec } from 'child_process';
import path from 'path'
const cwd = path.resolve('../')

const build = (type) => {
	if (type === 'All') {
		const output = exec('vite build', {
			cwd
		});

		output.stdout.on('data', (data) => {
			console.log(data)
		});

		output.on('close', () => {
			console.log('End of packing, Starting Deployment.');
		});
	} else {
		console.log('development...')
	}
}

export {
	build
}