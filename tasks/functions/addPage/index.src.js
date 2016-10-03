const AWS = require('aws-sdk');
const upload = require('../../upload');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

exports.handle = function (event, context, callback) {
  if (!event.slug || !event.title) return callback();

  s3.getObject({
    Bucket: process.env.S3_BUCKET,
    Key: 'postTemplate.html'
  }).promise()
  .then(res => upload.page({
    doc: {
      id: event.slug,
      doc: {
        title: event.title
      }
    },
    template: res.Body.toString()
  }))
  .then(res => callback(null, res))
  .catch(err => callback(err));
};
