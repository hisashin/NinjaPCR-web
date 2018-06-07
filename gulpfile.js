var gulp = require('gulp'); 
var pug = require('gulp-pug');

gulp.task('pug', function() {
  return gulp.src(['./pug/**/*.pug', './pug/**/*.jade', '!./pug/**/_*.pug'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
gulp.task('v1', function() {
  return gulp.src(['./pug/v1/**/*.pug', './pug/v1/**/*.jade', '!./pug/v1/**/_*.pug'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
gulp.task('v2', function() {
  return gulp.src(['./pug/v2/**/*.pug', './pug/v2/**/*.jade', '!./pug/v2/**/_*.pug'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
