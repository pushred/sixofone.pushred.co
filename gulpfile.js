const browserSync = require('browser-sync').create();
const cleanUrls = require('clean-urls');
const gulp = require('gulp');

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
