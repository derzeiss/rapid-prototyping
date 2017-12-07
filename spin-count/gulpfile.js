const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

path = {
    scss: 'src/',
    js: 'src/',
    dist: 'dist/',
    example: 'example/'
};

// ---------- DEV TASKS ----------
gulp.task('scss', function () {
    return gulp.src(path.scss + '*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(path.scss));
});

gulp.task('scss:watch', ['scss'], function () {
    return gulp.watch(path.scss + '**/*.scss', ['css']);
});

gulp.task('dev', ['scss:watch']);

// ---------- BUILD TASKS ----------
gulp.task('css', ['scss'], function () {
    return gulp.src(path.scss + '*.css')
    // export concat
        .pipe(concat('spin-count.css'))
        .pipe(gulp.dest(path.dist))
        .pipe(gulp.dest(path.example))

        // export minified
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCss())
        .pipe(gulp.dest(path.dist))
        .pipe(gulp.dest(path.example))
});

gulp.task('js', function () {
    return gulp.src(path.js + '*.js')
        .pipe(concat('spin-count.js'))
        .pipe(babel({presets: ['env']}))

        // export transpiled
        .pipe(gulp.dest(path.dist))
        .pipe(gulp.dest(path.example))

        // export minified
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist))
        .pipe(gulp.dest(path.example))
});

gulp.task('build', ['css', 'js']);