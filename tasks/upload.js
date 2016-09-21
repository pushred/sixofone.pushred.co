const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const chalk = require('chalk');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const template = fs.readFileSync(path.join(__dirname, '..', 'server', 'index.html'), 'utf-8');

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
      Body: fs.readFileSync(path.join(__dirname, '..', 'server', 'files', filename)),
      ContentType: types[path.extname(filename)]
    }).promise();
}

module.exports = {
  page: upload,
  asset: uploadAsset
};
