const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const cleanCSS  =  require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const jsdoc = require('gulp-jsdoc3');
// =====
// HELP ========================================================================
// =============================================================================
// gulp
// Собирает проект в режиме watch с запуском локального сервера
// Сборка в разработку
// 
// gulp public
// Сборка в продакшен
// 
// gulp getdoc
// Создает документацию 



// JSDoc =======================================================================
gulp.task("getdoc", function(cb) {
  gulp.src(["README.md", "./app/src/**/*.js"], { read: false })
  .pipe(jsdoc(cb));
});



// Section Dev ============================================================

    gulp.task('server', function() {
        // запуск локального сервера
        browserSync({
            server: {
                baseDir: "app/dev"
            }
        });
    });

gulp.task('copy-files', function() {
    // для переноса всех стандартных файлов из папки src в dev
    return gulp.src([
            // web files
            'app/src/**/*.html',
            'app/src/**/*.css',
            'app/src/**/*.js',
            // images
            'app/src/**/*.+(jpeg|jpg)',
            'app/src/**/*.png',
            'app/src/**/*.svg',
            // fonts ↓
            'app/src/**/*.eot',
            'app/src/**/*.ttf',
            'app/src/**/*.woff',
            'app/src/**/*.woff2'
        ])
        .pipe(gulp.dest('app/dev'))
        .pipe(browserSync.stream());
});

gulp.task('pug-compile', function() {
    return gulp.src(['app/src/**/*.+(pug|jade)'])
        // забрать все файлы .pug в src/
        .pipe(pug({ pretty: true }))
        // минификация отключена
        .pipe(gulp.dest('app/dev'))
        // положить файлы в dev/
        .pipe(browserSync.stream())
        // перезапуск браузера
});

gulp.task('sass-compile', function() {
    return gulp.src('app/src/**/*.+(scss|sass)')
        // компиляция и .SASS и .SCSS
        .pipe(sass().on('error', sass.logError))
        // вывод логов ошибок в консоль
        .pipe(gulp.dest('app/dev'))
        .pipe(browserSync.stream())
});


// === Watch Dev
gulp.task('watch', function() {
    // gulp.watch(['app/dev/**/*.+(html|css|js)']).on('change', browserSync.reload)
    // следит за изменением скомпилированных файлов и обновляет браузер
    gulp.watch(['app/src/**/*.+(pug|jade)'], gulp.parallel(['pug-compile']))
        // следит за изменением фалов pug и запускает задачи
    gulp.watch(['app/src/**/*.+(scss|sass)'], gulp.parallel(['sass-compile']))
        // следит за изменением sass и scss и запускает и компиляцию
    gulp.watch(['app/src/**/*.+(html|css|js)'], gulp.parallel(['copy-files']))
        // следит за изменением html/css/js в папке src и копирует их
    gulp.watch(['app/src/**/*.+(jpeg|jpg|png|svg)'], gulp.parallel(['copy-files']))
        // следит за изменением картинок в папке src и копирует их вместе с html/css/js
});

// Default task ==========================================================
// =======================================================================
gulp.task('default', gulp.parallel('pug-compile', 'sass-compile', 'copy-files', 'watch', 'server'));
// =======================================================================
// =======================================================================



// Section Public ==========================================================

gulp.task('server', function() {
    // запуск локального сервера
    browserSync({
        server: {
            baseDir: "app/public"
        }
    });
});


gulp.task('copy-files-public', function() {
    // для переноса всех стандартных файлов из папки src в public
    return gulp.src([
            // web files ↓
            'app/src/**/*.html',
            'app/src/**/*.css',
            'app/src/**/*.js',
            // исключения ↓
            '!app/src/**/blocks/**/*.*',
            // images ↓
            'app/src/**/*.+(jpeg|jpg)',
            'app/src/**/*.png',
            'app/src/**/*.svg',
            // fonts ↓
            'app/src/**/*.eot',
            'app/src/**/*.ttf',
            'app/src/**/*.woff'
        ])
        .pipe(gulp.dest('app/public'));
});

gulp.task('pug-compile-public', function() {
    return gulp.src(['app/src/**/*.+(pug|jade)',
            // исключения ↓
            '!app/src/**/blocks/**/*.*'
        ])
        .pipe(pug({ pretty: false }))
        // минификация включена
        .pipe(gulp.dest('app/public'))
});

gulp.task('sass-compile-public', function() {
    return gulp.src(['app/src/**/*.+(scss|sass)',
            //  исключения 
            '!app/src/**/blocks/**/*.*'
        ])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        // включена оптимизация CSS
        .pipe(gulp.dest('app/public'))
});

gulp.task('autoprefix-public', function() {
    return gulp.src('app/public/**/*.css')
        .pipe(autoprefixer())
        .pipe(gulp.dest('app/public'))
});

gulp.task('minify-css-public', function() {
    return gulp.src('app/public/**/*.css')
        .pipe(cleanCSS({ 
            // режим совместимость с ie8
            compatibility: 'ie8', 
            // выводит логи в консоль     
            debug: true, 
            // уровень оптимизации
            level: { 
                // список первого уровня оптимизации
                1: {
                  all: true, // использовать все опции из списка 1 уровня
                  normalizeUrls: false // кроме изменения URL
                },
                // список второго уровня минификации
                2: {
                    all: true,
                    removeUnusedAtRules: false // не удалять неиспользуемые свойства (удаляет font.css)
                //   restructureRules: true // произвести реструктуризацию
                }
            }
        },
            (details) => {
            // вывод логов
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(gulp.dest('app/public'))
});

// === Public Compile
gulp.task('public', gulp.series([
    'copy-files-public',
    'pug-compile-public',
    'sass-compile-public',
    'autoprefix-public',
    'minify-css-public',
    'server'
]));
// Задание для финальной сборки в продакшен