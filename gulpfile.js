var gulp = require('gulp');

// Pug
var pug = require('gulp-pug');
var pugI18n = require('gulp-i18n-pug');

var typescript = require('gulp-typescript');

// Sass
const sass = require('gulp-sass');

gulp.task('default', ['pug', 'pugI18n']);
gulp.task('pug', function() {
  return gulp.src(['./pug/**/*.pug', './pug/**/*.jade', '!**/layout*', '!**/include/*', '!**/includes/*'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
gulp.task('pugI18n', function() {
  var options = {
    i18n: {
      //verbose: true,
      dest: './production/',
      locales: './locales/*.*'
    },
    pretty: true
  };
  return gulp.src(['./pugI18n/**/*.pug', './pugI18n/**/*.jade', '!**/layout*', '!**/include/*', '!**/includes/*'])
  .pipe(pugI18n(options))
  .pipe(gulp.dest(options.i18n.dest));
});

gulp.task('sass', () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./production/'));
});

gulp.task('ts', function() {
  return gulp.src([ './ts/**/*.ts' ])
         .pipe(typescript({ target: 'ES5', module: 'commonjs' }))
         .js
         .pipe(gulp.dest('./production/'));
});
