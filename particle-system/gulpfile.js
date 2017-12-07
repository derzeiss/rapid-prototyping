const gulp = require('gulp');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

path = {
    modules: 'modules/',
    dist: 'dist/'
};

gulp.task('js', function () {
    return gulp.src(path.modules + '*.js')
        .pipe(concat('particle-system.js'))

        // export transpiled
        .pipe(babel({presets: ['env']}))
        .pipe(gulp.dest(path.dist))

        // export minified
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist))
});

gulp.task('build', ['js']);