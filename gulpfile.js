//не требуют установки
const { src, dest, parallel, series, watch } = require('gulp');
//***
//html
const htmlmin = require('gulp-htmlmin');
//стили
const sass = require('gulp-sass')(require('sass'));
const csso = require('gulp-csso');
//скрипты
const uglify = require('gulp-uglify-es').default;
//конкатенация
const concat = require('gulp-concat');
//автопрефиксер
const autoPrefixer = require('gulp-autoprefixer');
//очистка папки с билдом
const clean = require('gulp-clean');
//возможность импортировать компоненты
const include = require('gulp-file-include')
//imagemin 7.1.0 - стабильная версия
const imagemin = require('gulp-imagemin')
//
const sync = require('browser-sync').create()
//конвертация шрифтов
const fonter = require('gulp-fonter-unx');
const ttf2woff2 = require('gulp-ttf2woff2');


function html() {
  return src('src/**.html')
    .pipe(include({
      prefix: '@@'
    }))  
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('build'))
}

function scripts() {
  return src('src/scripts/*.js')
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('build/scripts'))
}

function styles() {
  return src('src/styles/*.scss')
    .pipe(concat('style.css'))
    .pipe(autoPrefixer(['last 2 versions']))
    .pipe(sass().on('error', sass.logError))
    .pipe(csso())
    .pipe(dest('build/styles/'))
}

function imageminification() {
  return src('src/images/*')
    .pipe(imagemin())
    .pipe(dest('build/images'))
}

function cleanBuild() {
  return src('build')
    .pipe(clean())
}

function fonts() {
  return src('src/fonts/*')
    .pipe(fonter({
      formats: ['woff', 'ttf', 'eot']
    }))
    .pipe(dest('src/fonts'))
    .pipe(dest('build/fonts'))
}
function fontsWoff2() {
  return src('src/fonts/*')
    .pipe(ttf2woff2())
    .pipe(dest('src/fonts'))
    .pipe(dest('build/fonts'))
}

function buildFonts() {
  return src('src/fonts/*')
    .pipe(fonter({
      formats: ['woff', 'ttf', 'eot']
    }))
    .pipe(ttf2woff2())
    .pipe(dest('build/fonts'))
}

function serve() {
  sync.init({
    server:{
      baseDir:'./build'
    },
    notify: false
  })
  watch('src/**.html', series(html)).on('change', sync.reload)
  watch('src/scripts/**.js', series(scripts)).on('change', sync.reload)
  watch('src/styles/**.scss', series(styles)).on('change', sync.reload)
  watch('src/images/*', series(imageminification)).on('change', sync.reload)
}

//перед работой сконвертировать шрифты
exports.fonts = fonts
exports.fontsWoff2 = fontsWoff2
exports.buildFonts = buildFonts

//для тестов
exports.cleanBuild = cleanBuild
exports.imageminification = imageminification

//build
exports.build = parallel(buildFonts, html, imageminification, styles, scripts)

//serve
exports.serve = serve