var gulp = require('gulp'); 
var pug = require('gulp-i18n-pug');

gulp.task('pug', function() {
  var options = {
    i18n: {
      dest: './production/',
      locales: './locales/*.*'
    },
    pretty: true
  };
  return gulp.src(['./pug/**/*.pug', './pug/**/*.jade', '!**/layout*'])
  .pipe(pug(options))
  .pipe(gulp.dest(options.i18n.dest));
});
