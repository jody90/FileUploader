var gulp       = require('gulp');
var watch      = require('gulp-watch');
var sass       = require('gulp-sass');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss   = require('gulp-clean-css');
var rename     = require('gulp-rename');
var livereload = require('gulp-livereload');
var gutil      = require('gulp-util');
var dirSync    = require('gulp-directory-sync');
var fs         = require('fs');

var uploadsDir = './uploads';
var thumbsDir = './uploads/thumbs';
var midsizeDir = './uploads/midsize';

var scripts = [
    './src/js/scripts.js'
];

var angularScripts = [
    './src/angular/app.js',
    './src/angular/controller/*.js'
];

var sassFiles = './src/sass/*.scss';
var jsFiles = './src/js/*.js';
var angularFiles = './src/angular/**/*.js';
var imageFiles = './src/images';
var jsLibrarys = './src/librarys';
var fonts = './src/fonts';

function handleError(err) {
    console.error(err.toString());
    this.emit('end');
}

gulp.task('createFolders', function() {
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir);
    }
    // kurz warten damit Ordner uploads auch wirklich erstellt wurde
    setTimeout(function() {
        if (!fs.existsSync(thumbsDir)){
            fs.mkdirSync(thumbsDir);
        }
        if (!fs.existsSync(midsizeDir)){
                fs.mkdirSync(midsizeDir);
        }
    }, 500);
})

gulp.task('watch', function() {
    gulp.watch([sassFiles, jsFiles, angularFiles, imageFiles, jsLibrarys, fonts], ['sass', 'js', 'angular', 'images', 'librarys', 'fonts']);
})

gulp.task('images', function() {
    return gulp.src( '' )
        .pipe(dirSync( './src/images', './ressources/images', { printSummary: true } ))
        .on('error', handleError)
        .pipe(livereload());
})

gulp.task('librarys', function() {
    return gulp.src( '' )
        .pipe(dirSync( jsLibrarys, './ressources/js', { printSummary: true } ))
        .on('error', handleError)
        .pipe(livereload());
})

gulp.task('fonts', function() {
    return gulp.src( '' )
        .pipe(dirSync( fonts, './ressources/fonts', { printSummary: true } ))
        .on('error', handleError)
        .pipe(livereload());
})

gulp.task('js', function() {
    return gulp.src(jsFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.min.js'))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(gulp.dest('./ressources/js'))
    .pipe(livereload());
});

gulp.task('angular', function() {
    return gulp.src(angularScripts)
        .pipe(sourcemaps.init())
        .pipe(concat('customAngular.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('./ressources/angular'))
        .pipe(livereload());
});

gulp.task('sass', function () {
    return gulp.src('./src/sass/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', handleError))
        .pipe(gutil.env.type === 'production' ? cleanCss() : gutil.noop())
        .pipe(gutil.env.type === 'production' ? gutil.noop() : sourcemaps.write())
        .pipe(rename({
            basename: "style.min"
        }))
        .pipe(gulp.dest('./ressources/css'))
        .pipe(livereload());
});

// Default Task
gulp.task('default', ['sass', 'js', 'angular', 'images', 'librarys', 'fonts', 'createFolders', 'watch']);
