const path = require('path');
const {src, dest, parallel, series, watch} = require('gulp');

const del = require('del');
const browserSync = require('browser-sync');

const loaderPlugin = require('gulp-load-plugins');
const plugins = loaderPlugin();

const cwd = process.cwd();
let config = {
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.css',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'
        }
    }
};

try {
    let loadConfig = require(path.join(cwd, '/gulp.config.js'));
    config  = Object.assign(config, loadConfig);
} catch (e) {

}

const bs = browserSync.create();

const clean = () => {
    return del([config.build.paths.dist, config.build.paths.temp])
};

const style = () => {
    return src(config.build.paths.styles, {base: config.build.paths.src, cwd: config.build.paths.src})
        .pipe(plugins.sass({outputStyle: 'expanded'}))
        .pipe(dest(config.build.paths.temp))
};

const script = () => {
    return src(config.build.paths.scripts, {base: config.build.paths.src, cwd: config.build.paths.src})
        .pipe(plugins.babel({presets: [require('@babel/preset-env')]}))
        .pipe(dest(config.build.paths.temp))
};

const page = () => {
    return src(config.build.paths.pages, {base: config.build.paths.src, cwd: config.build.paths.src})
        .pipe(plugins.swig({data: config.data}))
        .pipe(dest(config.build.paths.temp))
};

const image = () => {
    return src(config.build.paths.pages.images, {base: config.build.paths.src, cwd: config.build.paths.src})
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.paths.dist))
};

const font = () => {
    return src(config.build.paths.fonts, {base: config.build.paths.src, cwd: config.build.paths.src})
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.paths.dist))
};

const extra = () => {
    return src('public/**', {base: config.build.paths.public, cwd: config.build.paths.src})
        .pipe(dest(config.build.paths.dist))
};

const serve = () => {
    watch(config.build.paths.styles, { cwd: config.build.paths.src }, style);
    watch(config.build.paths.scripts, { cwd: config.build.paths.src }, script);
    watch(config.build.paths.pages, { cwd: config.build.paths.src }, page);
    // watch('src/assets/images/**', image);
    // watch('src/assets/fonts/**', font);
    // watch('public/**', extra);
    watch([
        config.build.paths.pages.images,
        config.build.paths.pages.fonts,
    ], { cwd: config.build.paths.src }, bs.reload);

    watch('**', { cwd: config.build.public }, bs.reload);

    bs.init({
        notify: false,
        port: 7000,
        open: false, //是否自动打开浏览器
        files: config.build.paths.dist, //监听指定文件夹的文件变化，自动刷新浏览器
        server: {
            baseDir: [config.build.paths.temp, config.build.paths.src, config.build.paths.public],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
};

const useref = () => {
    return src(config.build.paths.pages, {base: config.build.paths.temp, cwd: config.build.paths.temp})
        .pipe(plugins.useref({searchPath: [config.build.paths.temp, '.']}))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest(config.build.paths.dist))
};


const compile = parallel(style, script, page);

const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra)); //上线之前执行的任务

const dev = series(compile, serve);

module.exports = {
    build,
    dev
};
