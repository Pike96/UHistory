var gulp = require('gulp');
var pkg = require('./package.json');

var fontmin = require('gulp-fontmin');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify-es').default;
var ngAnnotate = require('gulp-ng-annotate');
var cleanCSS = require('gulp-clean-css');
var zip = require('gulp-zip');
var del = require('del');
var gulpSequence = require('gulp-sequence');

gulp.task('font', function() {
  gulp.src('./src/**/*.ttf')
    .pipe(gulp.dest('./dist'));
  gulp.src('./src/**/*.eot')
    .pipe(gulp.dest('./dist'));
  gulp.src('./src/**/*.svg')
    .pipe(gulp.dest('./dist'));
  gulp.src('./src/**/*.woff')
    .pipe(gulp.dest('./dist'));
});

gulp.task('json', function() {
  gulp.src('./src/**/*.json')
    .pipe(gulp.dest('./dist'));
});

gulp.task('html', function() {
  gulp.src('./src/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('img', function() {
  gulp.src('./src/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('js', function() {
  gulp.src('./src/**/*.js')
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function () {
  gulp.src('./src/**/*.css')
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist'));
});

gulp.task('zip', function() {
  gulp.src('./dist/**/*')
    .pipe(zip(pkg.name + '-' + pkg.version + '.zip'))
    .pipe(gulp.dest('./release'));
});

gulp.task('clean', function(callback) {
  return del(['dist', '.tmp', 'release'], callback);
});

gulp.task('build', gulpSequence(
  'clean', ['font', 'json', 'html', 'img', 'js', 'css']));

gulp.task('watch', function() {
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/**/*.js', ['js']);
});

gulp.task('default', ['build']);
