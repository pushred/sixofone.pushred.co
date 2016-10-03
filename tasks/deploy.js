const fs = require('fs');
const path = require('path');

const chalk = require('chalk');

const db = require('../db');
const upload = require('./upload');

const assets = fs.readdirSync(path.join(__dirname, '..', 'server', 'files')).filter(path.extname); // fs.stat'd be better
const fonts = fs.readdirSync(path.join(__dirname, '..', 'server', 'files', 'fonts')).filter(path.extname); // but we don't need it today

Promise.all(assets.map(filename => uploadAsset(filename)))
  .then(revs => {
    upload.template(revs)
      .then(res => console.log(chalk.green('✓'), chalk.white('postTemplate.html'), chalk.gray(res.ETag)))
      .catch(err => console.error(chalk.red(JSON.stringify(err))));

    db.allDocs({
      include_docs: true
    }).then(docs => {
      docs.rows.forEach((row, index) => {
        upload.page({ doc: row, revs: revs })
          .then(res => console.log(chalk.green('✓'), chalk.white('/posts/' + row.id), chalk.gray(res.ETag)))
          .catch(err => console.error(chalk.red(JSON.stringify(err))));
      });
    });
  })
  .catch(err => console.error(chalk.red(JSON.stringify(err))));

function uploadAsset (filename) {
  return upload.asset(filename)
    .then(file => {
      console.log(chalk.green('✓'), chalk.white(file.fingerprintedFilename), chalk.gray(file.ETag));
      return Promise.resolve(file);
    });
}

fonts.forEach(filename => {
  upload.asset('fonts/' + filename)
    .then(res => console.log(chalk.green('✓'), chalk.white(filename), chalk.gray(res.ETag)))
    .catch(err => console.error(chalk.red(JSON.stringify(err))));
});
