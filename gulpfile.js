var gulp = require('gulp');

// Pug
const pug = require('gulp-pug');
const pugI18n = require('gulp-i18n-pug');

// TS
const typescript = require('gulp-typescript');
//const babel = require('gulp-babel');
// Sass
const sass = require('gulp-sass');
const exec = require('gulp-exec');

gulp.task('pug', () => {
  return gulp.src(['./pug/**/*.pug', './pug/**/*.jade', '!**/layout*', '!**/include/*', '!**/includes/*'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./production/'));
});
gulp.task('pugI18n', () => {
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
gulp.task('default', gulp.series('pug', 'pugI18n'));

gulp.task('sass', () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./production/'));
});

gulp.task('ts', () => {
  return gulp.src([ './ts/**/*.ts' ])
         .pipe(typescript({ target: 'ES5', module: 'commonjs' }))
         .js
         .pipe(gulp.dest('./production/'));
});


gulp.task('shell', () => {
  return gulp.src('.')
  .pipe(exec("./build_local_console.sh",(err, stdout, stderr) => {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
  }));
});
/*
gulp.task('babel', function() {
  gulp.src('./production/console/js-ES6/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./production/console/js'))
});
*/
