var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browsync = require('browser-sync').create(),
    reload = browsync.reload,
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    srcmaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imgmin = require('gulp-imagemin'),
    gcmq = require('gulp-group-css-media-queries'),
    plumber = require('gulp-plumber'),
    del = require('del');

var paths = {
    src: {
        html: './*.html',
        htmlinc: './src/*.html',
        scss: 'scss/*.scss',
        js: 'js/*.js',
        img: 'img/**/*.*',
    },
    dist: {
        html: './build/',
        css: './build/css/',
        js: 'build/js/',
        img: './build/img/',
    }
}


gulp.task('sass-compile', function () {
    return gulp.src(paths.src.scss) // Берём все .scss-файлы в папке scss
        .pipe(srcmaps.init())
        .pipe(sass({
            outputStyle: 'compact',
        })) // Magic
        .pipe(srcmaps.write()) // Добавляем sourcemaps
        .pipe(gulp.dest(paths.dist.css)) // Помещаем скомпилированные CSS файлы в папку /css
        .on('end', browsync.reload);
});

gulp.task('cssprod', function () {
    del(paths.dist.css);
    gulp.src(paths.src.scss)
        .pipe(sass({
            outputStyle: 'expanded',
        }))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(gcmq())
        .pipe(gulp.dest(paths.dist.css));
});

gulp.task('build:css', ['cssprod'], function () {
    return gulp.src(paths.dist.css + 'style.css')
        .pipe(cssnano())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.css))
});

gulp.task('imgmini', function () {
    return gulp.src(paths.img)
        .pipe(imgmin())
        .pipe(gulp.dest(paths.dist.img))
});


gulp.task('jsugly', function () {
    gulp.src([
        'libs/jquery/dist/jquery.min.js',
        'js/scripts.js', // Always at the end
    ])
        .pipe(srcmaps.init())
        .pipe(concat('scripts.js'))
        .pipe(srcmaps.write('./'))
        .pipe(gulp.dest(paths.dist.js))
});

gulp.task('htmlbuild', function () {
    gulp.src(paths.src.html) //Выберем исходные файлы
        .pipe(rigger()) //Прогон через rigger
        .pipe(gulp.dest('build/')) //Складываем их в папку build
        .pipe(browsync.reload({
            stream: true
        })); //И перезагрузим наш сервер для обновлений
});

gulp.task('browser-sync', function () {
    browsync.init([paths.src.html, paths.src.scss, paths.src.js], {
        server: {
            baseDir: 'build/'
        },
        // proxy: "localhost", // Перенаправляем запросы на локальный сервер (для интеграции с CMS)
        notify: false // Отключаем уведомления от BrowserSync
    });
});

gulp.task('watch', ['browser-sync', 'htmlbuild', 'sass-compile'], function () {
    gulp.watch(paths.src.scss, function () {
        setTimeout(function () {
            gulp.start('sass-compile');
        }, 500);
    });
    gulp.watch(paths.src.html, ['htmlbuild', reload]);
    gulp.watch(paths.src.js, ['jsugly', reload]);
});