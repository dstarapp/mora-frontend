import { program } from 'commander'
import { readFile } from 'fs/promises';
import { deploy } from './deploy/index.js'
import { build } from './build/index.js'

const moraPackage = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
);

program.on('--help', () => {
})

program
  .version(`Mora: ${moraPackage.version}`);

program
  .option('-B, --build [type]', 'Package the specified Mora planet Id or empty');

program
  .option('-D, --deploy <type>', 'Deploy Mora IC or CDN');

if (process.argv.length <= 2) {
  console.log(`Mora: ${program._helpFlags} ${program._helpCommandDescription}`)
}

program.parse();

const options = program.opts();
if (options.deploy) {
  if (options.deploy === 'IC') {
    deploy('IC')
  } else if (options.deploy === 'CDN') {
    deploy('CDN')
  } else {
    console.log('Parameter error')
  }
}

if (options.build) {
  if (typeof options.build === 'boolean') {
    build('All')
  }

  if (typeof options.build === 'string') {
    build(options.build)
  }
}
