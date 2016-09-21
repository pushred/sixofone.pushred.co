const AWS = require('aws-sdk');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const db = require('../db');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const template = fs.readFileSync('../server/index.html', 'utf-8');

function upload (doc) {
  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'posts/' + doc.id,
      Body: template.replace(/\${title}/g, doc.doc.title).replace(/\${slug}/g, doc.id),
      ContentType: 'text/html'
    }).promise();
}

function uploadAsset (filename) {
  var types = {
    '.css': 'text/css',
    '.eot': 'application/vnd.ms-fontobject',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/octet-stream',
    '.woff': 'application/font-woff'
  };

  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'files/' + filename,
      Body: fs.readFileSync('../server/files/' + filename),
      ContentType: types[path.extname(filename)]
    }).promise();
}

module.exports = upload;

// upload everything if invoked via CLI
if (!module.parent) {
  db.allDocs({
    include_docs: true
  }).then(docs => {
    docs.rows.forEach(row => {
      upload(row)
        .then(res => console.log(chalk.green('✓'), chalk.gray('/posts/' + row.id)))
        .catch(err => console.error(chalk.red(err)));
    });
  });

  const assets = fs.readdirSync('../server/files').filter(path.extname); // fs.stat'd be better
  const fonts = fs.readdirSync('../server/files/fonts').filter(path.extname); // but we don't need it today

  assets.forEach(filename => {
    uploadAsset(filename)
      .then(res => console.log(chalk.green('✓'), chalk.gray(filename)))
      .catch(err => console.error(chalk.red(err)));
  });

  fonts.forEach(filename => {
    uploadAsset('fonts/' + filename)
      .then(res => console.log(chalk.green('✓'), chalk.gray(filename)))
      .catch(err => console.error(chalk.red(err)));
  });
}
