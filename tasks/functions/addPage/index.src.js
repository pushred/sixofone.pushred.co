const upload = require('../../upload');

exports.handle = function (event, context, callback) {
  if (!event.slug || !event.title) return callback();

  upload.page({
    id: event.slug,
    doc: {
      title: event.title
    }
  })
  .then(res => callback(null, res))
  .catch(err => callback(err));
}
