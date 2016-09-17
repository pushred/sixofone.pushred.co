const browserSync = require('browser-sync').create();
const cleanUrls = require('clean-urls');
const gulp = require('gulp');
const log = require('gulplog');
const s3 = require('gulp-s3-upload')();

const resizeImages = require('./tasks/resize_images');

gulp.task('default', () => {
  browserSync.init({
    server: {
      baseDir: 'server',
      index: 'index.html',
      middleware: cleanUrls(['**/*'], { root: 'server' })
    },
    notify: false,
    open: false
  });
});

gulp.task('resizeImages', () => {
  return gulp.src('server/files/images/**/*.jpg')
    .pipe(resizeImages())
    .pipe(s3({
      Bucket: process.env.S3_BUCKET,
      keyTransform: filename => 'files/images/' + filename
    }));
});
