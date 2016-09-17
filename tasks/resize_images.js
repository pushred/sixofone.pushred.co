const path = require('path');

const chalk = require('chalk');
const imageType = require('image-type');
const log = require('gulplog');
const range = require('lodash/range');
const sharp = require('sharp');
const sort = require('lodash/sortBy');
const through = require('through2');

const MIN_WIDTH = 640;
const FALLBACK_BUDGET = 300; // target filesize to fallback to (kB)
const MIN_STEP = 85; // kB

/**
 * Returns a range of sizes for a given image at steps optimized for filesize savings
 * https://cloudfour.com/thinks/sensible-jumps-in-responsive-image-file-sizes/
 *
 * @param {stream.Transform} transform stream of Vinyl file objects
 * @returns {stream.Transform} of JSON as Vinyl file objects
 */

function pushImages () {
  const stream = through.obj(function (file, enc, callback) {
    sharp(file.contents)
      .metadata()
      .then(metadata => {
        var widths = range(MIN_WIDTH, metadata.width, Math.floor(metadata.width / 10));
        widths.push(metadata.width); // add original for highest quality

        const queue = widths.map(width => resizeImage(file, width));

        Promise.all(queue)
          .then(optimizeSteps)
          .then(files => files.forEach(file => stream.push(file)))
          .then(callback)
          .catch(err => {
            log.warn(chalk.red(err));
            callback();
          });
      });
  });

  return stream;
}

module.exports = pushImages;

/**
 * Filter resized images to those that are smaller than the previous by the minimum filesize step
 *
 * @param {Array} images - Vinyl file objects
 * @returns {Promise.<Vinyl[]>}
 * @private
 */

function optimizeSteps (images) {
  const optimized = sort(images, 'width').reduce((steps, image, index) => {
    if (index === 0) return steps.concat(image);

    const size = image.stat.size;
    const prevSize = steps[steps.length - 1].stat.size;

    return (Math.abs(size - prevSize) > (MIN_STEP * 1000))
      ? steps.concat(image)
      : steps;
  }, []);

  // assign standard name for smallest image
  optimized[0].path = optimized[0].path.replace('640w', 'smallest');

  // assign standard name for fallback image (closest to budgeted size)
  const fallback = optimized.find(file => file.stat.size >= FALLBACK_BUDGET * 1000);
  fallback.path = fallback.path.replace(fallback.width + 'w', 'fallback');

  return Promise.resolve(optimized);
}

/**
 * Clone and resize given image file to specified width using sharp/libvips
 * Suffix filename with width and add as a Vinyl file property for use downstream
 *
 * @param {Vinyl} file - Vinyl file object with a JPEG image buffer
 * @param {Number} width
 * @returns {Promise.<Vinyl>}
 * @private
 */

function resizeImage (file, width) {
  return new Promise((resolve, reject) => {
    if (!imageType(file.contents) || imageType(file.contents).mime !== 'image/jpeg') return reject(file.relative + ' is not a JPEG');

    sharp(file.contents)
      .quality(90)
      .resize(width)
      .toBuffer((err, buffer, info) => {
        if (err) return reject(err);

        const newFile = file.clone();
        const filename = path.basename(file.path, path.extname(file.path));

        newFile.path = newFile.path.replace(filename, `${filename}-${width}w`);
        newFile.contents = buffer;
        newFile.width = width;
        newFile.stat.size = info.size;

        return resolve(newFile);
      });
  });
}
