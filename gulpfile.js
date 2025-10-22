'use strict';

import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import { deleteAsync } from 'del';

const sass = gulpSass(dartSass);

export function serverInit() {
  browserSync.init({
    server: {
      baseDir: './app/',
    },
    notify: false,
  });
}

export function styles() {
  return gulp
    .src([
      // './node_modules/@fancyapps/ui/dist/fancybox/fancybox.css',
      './app/scss/**/*.scss',
    ])
    .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
      })
    )
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.stream());
}

export function scripts() {
  return gulp
    .src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js',
      './node_modules/slick-carousel/slick/slick.min.js',
      './app/js/main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/js'));
}

export function images() {
  return gulp
    .src('./app/images/**/*')
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }),
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            {
              name: 'removeViewBox',
              active: true,
            },
            {
              name: 'cleanupIDs',
              active: false,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest('./dist/images'));
}

export function cleanDist() {
  return deleteAsync('dist');
}

function buildProject() {
  return gulp
    .src(
      ['./app/**/*.html', './app/css/style.min.css', './app/js/main.min.js'],
      {
        base: 'app',
      }
    )
    .pipe(gulp.dest('dist'));
}

export function watching() {
  gulp.watch('./app/scss/**/*.scss', styles);
  gulp.watch(['./app/js/**/*.js', '!app/js/main.min.js'], scripts);
  gulp.watch('app/**/*.html').on('change', browserSync.reload);
}

export const build = gulp.series(cleanDist, images, buildProject);
export default gulp.parallel(styles, scripts, serverInit, watching);
