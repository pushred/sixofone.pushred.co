const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const shortId = require('shortid');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const defaultTemplate = fs.readFileSync(path.join(__dirname, '..', 'server', 'index.html'), 'utf-8');

/**
 * CouchDB document
 * @typedef {Object} Doc
 * @param {String} Doc.id - CouchDB document ID
 * @param {Object} Doc.doc - CouchDB document
 * @param {String} Doc.doc.title - Post title
 */

/**
 * Upload file to S3 bucket
 *
 * @param {Object} options
 * @param {Doc} options.doc
 * @param {Array} [options.revs] - fingerprinted asset filenames
 * @param {Array} [options.template] - post markup with template literals
 * @returns {Promise} - AWS SDK putObject response
 */

function upload (options) {
  var { doc, revs, template } = options;

  if (!template) template = defaultTemplate;

  var markup = template.replace(/\${title}/g, doc.doc.title).replace(/\${slug}/g, doc.id);

  if (revs) {
    // use fingerprinted assets
    revs.forEach(file => {
      markup = markup.replace(file.filename, file.fingerprintedFilename);
    });
  }

  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'posts/' + doc.id,
      Body: markup,
      ContentType: 'text/html',
      CacheControl: 'public, max-age=31536000, no-cache'
    }).promise();
}

function uploadTemplate (revs) {
  var markup = defaultTemplate;

  // use fingerprinted assets
  revs.forEach(file => {
    markup = markup.replace(file.filename, file.fingerprintedFilename);
  });

  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'postTemplate.html',
      Body: markup,
      ContentType: 'text/html'
    }).promise();
}

/**
 * File upload summary
 * @typedef {Object} UploadSummary
 * @param {String} UploadSummary.filename - original filename
 * @param {String} UploadSummary.fingerprintedFilename - filename with fingerprint affix
 * @param {String} UploadSummary.ETag - object value returned by S3
 */

/**
 * Fingerprint and upload asset file to S3 bucket
 *
 * @param {String} filename - original filename
 * @returns {Promise.<UploadSummary>}}
 */

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
  template: uploadTemplate,
  asset: uploadAsset
};
