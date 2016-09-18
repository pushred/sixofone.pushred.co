const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const cleanUrls = require('clean-urls');
const gulp = require('gulp');
const log = require('gulplog');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const run = require('run-sequence');
const s3 = require('gulp-s3-upload')();
const source = require('vinyl-source-stream');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const watch = require('gulp-watch');

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

  watch(['server/*.html'], () => browserSync.reload);
  watch(['{browser,components}/**/*.css'], () => run('bundleCSS', browserSync.reload));
  watch(['{browser,components}/**/*.js'], () => run('bundleJS', browserSync.reload));
  watch(['server/icons/**/*.svg'], () => run('bundleSVG'));
});

gulp.task('bundleCSS', () => {
  return gulp
    .src('browser/index.css')
    .pipe(postcss([
      require('postcss-import'),
      require('postcss-custom-properties'),
      require('postcss-apply'),
      require('postcss-nesting'),
      require('autoprefixer')({ browsers: ['last 2 versions', 'ie 9']})
    ]))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('server/files'));
});

gulp.task('bundleJS', () => {
  return browserify('browser/index.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('server/files'));
});

gulp.task('bundleSVG', () => {
  return gulp
    .src('server/files/icons/**/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      },
      plugins: [{
        convertColors: {
          currentColor: true
        }
      }]
    }))
    .pipe(svgstore())
    .pipe(rename('bundle.svg'))
    .pipe(gulp.dest('server/files'));
});

gulp.task('resizeImages', () => {
  return gulp.src('server/files/images/**/*.jpg')
    .pipe(resizeImages())
    .pipe(s3({
      Bucket: process.env.S3_BUCKET,
      keyTransform: filename => 'files/images/' + filename
    }));
});
