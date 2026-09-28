const { execSync } = require('child_process');
const fs = require('fs');

console.log('Building production minified assets...');
execSync('npx -y esbuild style.css --minify --outfile=style.min.css', { stdio: 'inherit' });
execSync('npx -y esbuild app.js --minify --outfile=app.min.js', { stdio: 'inherit' });

const rawCssSize = fs.statSync('style.css').size;
const minCssSize = fs.statSync('style.min.css').size;
const rawJsSize = fs.statSync('app.js').size;
const minJsSize = fs.statSync('app.min.js').size;

console.log(`✓ style.min.css: ${(minCssSize / 1024).toFixed(2)} KiB (saved ${((rawCssSize - minCssSize) / 1024).toFixed(2)} KiB)`);
console.log(`✓ app.min.js: ${(minJsSize / 1024).toFixed(2)} KiB (saved ${((rawJsSize - minJsSize) / 1024).toFixed(2)} KiB)`);
