const rawPackager = require('@electron/packager');
const packager = rawPackager.packager || rawPackager.default || rawPackager;
const fs = require('fs');
const path = require('path');
const os = require('os');

async function build() {
  console.log('Starting Electron packaging process...');

  const customTmp = path.join(os.tmpdir(), 'nb_packager_' + Date.now());
  fs.mkdirSync(customTmp, { recursive: true });

  try {
    const appPaths = await packager({
      dir: path.resolve(__dirname, '..'),
      name: 'NativeBOX_AI_Player',
      platform: 'win32',
      arch: 'x64',
      out: path.resolve(__dirname, '../dist'),
      overwrite: true,
      tmpdir: customTmp,
      ignore: [
        /auto-segmenter/,
        /^[\\\/]?dist([\\\/]|$)/,
        /^[\\\/]?tmp_packager([\\\/]|$)/,
        /^[\\\/]?my_tmp([\\\/]|$)/,
        /^[\\\/]?\.git([\\\/]|$)/,
        /^[\\\/]?\.next([\\\/]|$)/,
        /^[\\\/]?docs([\\\/]|$)/,
        /^[\\\/]?\.agents([\\\/]|$)/
      ]
    });

    console.log('SUCCESS! Electron app packaged successfully to:', appPaths[0]);
  } catch (err) {
    console.error('Packaging failed:', err);
    process.exit(1);
  } finally {
    try {
      fs.rmSync(customTmp, { recursive: true, force: true });
    } catch (e) {}
  }
}

build();
