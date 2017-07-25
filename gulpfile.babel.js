// generated on 2016-07-11 using generator-chrome-extension 0.5.6
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import { stream as wiredep } from 'wiredep';
import rollup from 'rollup-stream';
import zip from 'gulp-zip';

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import npm from 'rollup-plugin-node-resolve';
import source from 'vinyl-source-stream';
import json from 'rollup-plugin-json';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('vendor', () => {
  return gulp.src([
    'app/scripts.babel/vendor/jquery.js',
    'app/scripts.babel/vendor/jquery.textcomplete.js',
  ]).pipe(gulp.dest('app/scripts/vendor/'))
});

gulp.task('copy-chromereload', () => {
  return gulp.src([
    'app/scripts.babel/chromereload.js'
  ]).pipe(gulp.dest('app/scripts/'))
})

function lint (files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint(['app/scripts.babel/**/*.js', '!app/scripts.babel/vendor/*.js'], {
  env: {
    es6: true
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true
    }
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{ cleanupIDs: false }]
    }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe($.sourcemaps.init())
    // .pipe($.if('*.js', $.uglify()))
    // .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: false,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    // .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    // .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist'));
});

gulp.task('rollup-contentscript', () => {
  return rollup({
    entry: 'app/scripts.babel/contentscript.js',
    plugins: [
      json(),
      npm({
        jsnext: true,
        main: true
      }),
      commonjs(),
      babel({
        babelrc: false,
        presets: ['es2015-rollup']
      })
    ]
  })
    .pipe(source('contentscript.js'))
    .pipe(gulp.dest('app/scripts'))
});

gulp.task('rollup-background', () => {
  return rollup({
    entry: 'app/scripts.babel/background.js',
    plugins: [
      json(),
      npm({
        jsnext: true,
        main: true
      }),
      commonjs(),
      babel({
        babelrc: false,
        presets: ['es2015-rollup']
      })
    ]
  })
    .pipe(source('background.js'))
    .pipe(gulp.dest('app/scripts'))
});
//
// gulp.task('rollup-popup', () => {
//   return rollup({
//     entry: 'app/scripts.babel/popup.js',
//     plugins: [
//       babel({
//         babelrc: false,
//         presets: ['es2015-rollup']
//       })
//     ]
//   })
//     .pipe(source('popup.js'))
//     .pipe(gulp.dest('app/scripts'))
// });

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'rollup', 'html', 'vendor', 'copy-chromereload'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'rollup']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
    .pipe($.zip('emoji-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('rollup', ['rollup-contentscript', 'rollup-background']);

gulp.task('build', (cb) => {
  runSequence(
    'clean', 'vendor', 'lint', 'rollup', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
