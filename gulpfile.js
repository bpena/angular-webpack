var gulp = require('gulp');
var path = require('path');
var gulpWebpack = require('gulp-webpack');
var $ = require('gulp-load-plugins');
var order = require('gulp-order');
var concat = require('gulp-concat');
var size = require('gulp-size');
var webpack = require('webpack');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var _path = {
    entryPoint: __dirname + '/app/index.js',
    indexHTML: __dirname + '/app/index.html',
    mainFolder: __dirname + '/app/',
    destFolder: __dirname + '/dist/',
    vendors: __dirname + '../assets'
}

var webpackConfig = {
    debug: true,
    watch: true,
    entry: _path.entryPoint,
    output: {
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            // nothing here yet! We'll add more stuff later
        ]
    },
    resolve: {
        alias: {
            lodash: path.resolve( __dirname, './node_modules/lodash-node/modern')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            _: 'lodash'
        })
    ]
};

gulp.task('webpack', function() {
    return gulp.src(_path.entryPoint)
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(_path.mainFolder))
        .pipe(gulp.dest(_path.destFolder))
});


gulp.task('usemin', function() {
    return gulp.src(_path.indexHTML)
        .pipe(usemin({
            css: [ ],
            html: [ minifyHtml({ empty: true }) ],
            js: [ uglify() ],
        }))
        .pipe(gulp.dest(_path.destFolder));
});

gulp.task('serve', ['connect'], function() {
    require('opn')('http://localhost:9000');
});

gulp.task('connect', function() {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({port: 35729}))
        .use(require('connect-modrewrite')([
            '!(\\..+)$ / [L]'
        ]))
        .use(connect.static('dist'))
        .use(connect.directory('dist'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000');
        })
});

gulp.task('watch', ['connect', 'serve'], function() {
    var server = $.livereload();

    // watch for changes
    gulp.watch([
        'dist/bundle.je',
        'dist/index.html'
    ]).on('change', function(file) {
        server.changed(file.path);
    });

    gulp.watch('app/**/*', ['webpack']);
    gulp.watch('app/index.html', ['copyIndex']);
});