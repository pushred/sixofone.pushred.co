const fs = require('fs');
const path = require('path');

const chalk = require('chalk');

const db = require('../db');
const upload = require('./upload');

db.allDocs({
  include_docs: true
}).then(docs => {
  docs.rows.forEach(row => {
    upload.page(row)
      .then(res => console.log(chalk.green('✓'), chalk.gray('/posts/' + row.id)))
      .catch(err => console.error(chalk.red(JSON.stringify(err))));
  });
});

const assets = fs.readdirSync(path.join(__dirname, '..', 'server', 'files')).filter(path.extname); // fs.stat'd be better
const fonts = fs.readdirSync(path.join(__dirname, '..', 'server', 'files', 'fonts')).filter(path.extname); // but we don't need it today

assets.forEach(filename => {
  upload.asset(filename)
    .then(res => console.log(chalk.green('✓'), chalk.gray(filename)))
    .catch(err => console.error(chalk.red(JSON.stringify(err))));
});

fonts.forEach(filename => {
  upload.asset('fonts/' + filename)
    .then(res => console.log(chalk.green('✓'), chalk.gray(filename)))
    .catch(err => console.error(chalk.red(JSON.stringify(err))));
});

