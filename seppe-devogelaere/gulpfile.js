var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require("gulp-uglify"),
    mocha = require("gulp-mocha"),
    minifyCss = require('gulp-minify-css');;

var paths = {
    test: ["./test"],
    css: ["public//stylesheets/**/*.css"],
    js: ["public/javascripts/**/*.js"]
}

//CSS minify
gulp.task('minify-css', function() {
  return gulp.src(paths.css)
    .pipe(sourcemaps.init())
    .pipe(concat('style.min.css'))
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/assets/stylesheets'));
});

//js concat and minify
gulp.task('build-js', function() {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(uglify({
            magnle: false
        }))
        .pipe(sourcemaps.write("app.min.js.map"))
        .pipe(gulp.dest('public/assets/javascripts'));
});

gulp.task('watch', function() {
    gulp.watch(paths.js, ['build-js']);
    gulp.watch(paths.css, ['minify-css']);
});

gulp.task("runTests", function() {
    return gulp.src(paths.test + "/*.js")
        .pipe(mocha());
})

gulp.task("default", ["minify-css","build-js","watch"]);