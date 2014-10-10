var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    del = require('del'),
    mocha = require('gulp-mocha');

var info = require('./package.json'),
    head = '/*! ' + info.name + ' v' + info.version + ' | ' + info.author.name + '(' + info.author.email + ') | Apache License(2.0) */\n';

var paths = {
    dist: 'dist',
    scripts: ['lib.js'],
    tests: []
};

// do test
gulp.task('test', function(){
    return gulp.src(paths.tests, {read: false})
        .pipe(mocha());
});

// clean dist folder
gulp.task('clean', function(cb) {
    del([paths.dist], cb);
});

// build uncompressed result
gulp.task('build-dev', ['clean'], function() {
    return gulp.src(paths.scripts)
        .pipe(concat(info.name + '.js'))
        .pipe(replace(/\/\*[\s\S]*?\*\/\n/g, ''))
        .pipe(replace(/^/g, head))
        .pipe(gulp.dest(paths.dist));
});

// build compressed result
gulp.task('build', ['clean'], function() {
    return gulp.src(paths.scripts)
        .pipe(concat(info.name + '.min.js'))
        .pipe(uglify())
        .pipe(replace(/^/g, head))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['build-dev', 'build']);