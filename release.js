//
// This script makes a new git release branch and adds the 'dist' folder to it
//

const fs = require('fs');
const versionDev = require('./package.json').version;
if (!versionDev.endsWith('-dev')) {
  console.warn('This script only works with a -dev version.  Not: ' + versionDev);
  process.exit(1);
}

// Check if the local branch has any changes not commited to git
const version = versionDev.substring(0, versionDev.lastIndexOf('-'));
const {execSync} = require('child_process');

let output = execSync('git status --untracked-files=no --porcelain').toString();
if (output.length > 0) {
  console.warn('Make sure to commit all files before running this script:\n' + output);
  process.exit(1);
}

console.log('Checkout and publish release branch');
execSync('git checkout -b release-' + version);

console.log('Update revision: ' + version);
execSync(
  `sed -i 's/${versionDev.replace('.', '\\.')}/${version.replace(
    '.',
    '\\.'
  )}/g' package.json`
);

// console.log('Test');
// execSync('yarn test');

console.log('Building...');
execSync('yarn build');

console.log('Save the artifacts in git');
console.log('ADD: ' + execSync('git add --verbose --force dist/').toString());
console.log('ADD: ' + execSync('git add package.json').toString());
console.log(
  'COMMIT: ' + execSync(`git commit -m "adding release artifacts: ${version}"`)
);

const rev = execSync('git rev-parse HEAD')
  .toString()
  .trim();

console.log('Release: ', version);
console.log('TODO... tag? and propose repository info: ', rev);
