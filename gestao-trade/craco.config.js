const path = require('path')
const fs = require('fs').promises;

module.exports = async function ({ env }) {
  await Promise.resolve();

  console.log("HEREEEEEE", env);

  console.info('Copying files');
  await Promise.all([
    fs.copyFile(path.join(__dirname, './node_modules/sql.js/dist/sql-wasm.wasm'), path.join(__dirname, './public/sql-wasm.wasm')),
    fs.copyFile(path.join(__dirname, './node_modules/sql.js/dist/worker.sql-wasm.js'), path.join(__dirname, './public/worker.sql-wasm.js')),
  ])

  return {
    webpack: {
      alias: {
        'path': false,
        'fs': false,
        'crypto': false,
      },
    }
  }
}