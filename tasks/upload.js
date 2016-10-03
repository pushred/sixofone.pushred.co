const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const shortId = require('shortid');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const template = fs.readFileSync(path.join(__dirname, '..', 'server', 'index.html'), 'utf-8');

function upload (doc, revs) {
  var markup = template.replace(/\${title}/g, doc.doc.title).replace(/\${slug}/g, doc.id);

  // use fingerprinted assets
  revs.forEach(file => {
    markup = markup.replace(file.filename, file.fingerprintedFilename);
  });

  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'posts/' + doc.id,
      Body: markup,
      ContentType: 'text/html',
      CacheControl: 'public, max-age=31536000, no-cache'
    }).promise();
}

function uploadAsset (filename) {
  var types = {
    '.css': 'text/css',
    '.eot': 'application/vnd.ms-fontobject',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/octet-stream',
    '.woff': 'application/font-woff'
  };

  const ext = path.extname(filename);
  const fingerprintedBase = path.basename(filename, ext) + '-' + shortId.generate();
  const fingerprintedFilename = filename.replace(path.basename(filename, ext), fingerprintedBase);

  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'files/' + fingerprintedFilename,
      Body: fs.readFileSync(path.join(__dirname, '..', 'server', 'files', filename)),
      ContentType: types[path.extname(filename)],
      CacheControl: 'public, max-age=31536000'
    }).promise()
    .then(res => Promise.resolve({
      filename,
      fingerprintedFilename,
      ETag: res.ETag
    }));
}

module.exports = {
  page: upload,
  asset: uploadAsset
};
