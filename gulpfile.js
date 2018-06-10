var gulp = require('gulp'); 
var pug = require('gulp-pug');
var pugI18n = require('gulp-i18n-pug');

gulp.task('default', ['pug', 'pugI18n']);
gulp.task('pug', function() {
  return gulp.src(['./pug/**/*.pug', './pug/**/*.jade', '!**/layout*'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
gulp.task('pugI18n', function() {
  var options = {
    i18n: {
      dest: './production/',
      locales: './locales/*.*'
    },
    pretty: true
  };
  return gulp.src(['./pugI18n/**/*.pug', './pugI18n/**/*.jade', '!**/layout*'])
  .pipe(pugI18n(options))
  .pipe(gulp.dest(options.i18n.dest));
});

