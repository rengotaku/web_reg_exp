// gulp.js configuration
const
  // modules
  gulp = require('gulp'),

  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),

  htmlclean = require('gulp-htmlclean'),
  clean = require('postcss-clean'),
  del = require('del'),

  browserSync = require('browser-sync').create(),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  replace = require('gulp-replace'),
  header = require('gulp-header'),
  flexBugsFixes = require('postcss-flexbugs-fixes'),
  sorting = require('postcss-sorting'),

  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),

  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  ejs = require('gulp-ejs'),
  pug = require('gulp-pug'),

  fs = require('fs'),

  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // DELETE:
  // folders
  folder = {
    src: 'src/',
    build: 'dest/'
  },

  paths = {
    root: './src',
    html: {
      src: './src/views/*.pug',
      dest: './dest',
      var: './src/views/var.json',
    },
    styles: {
      src: './src/assets/sass/my_main.scss',
      dest: './dest/assets/css',
      map: './dest/css/maps',
    },
    scripts: {
      src: './src/js/**/*.js',
      jsx: './src/js/**/*.jsx',
      dest: './dest/js',
      map: './dest/js/maps',
      core: 'src/js/core/**/*.js',
      app: 'src/js/app/**/*.js',
    },
    images: {
      src: './src/img/**/*.{jpg,jpeg,png,svg,gif}',
      dest: './dest/img/',
    },
  },

  // Post CSS
  autoprefixerOption = {
    grid: true,
  },
  sortingOptions = require('./postcss-sorting.json'),
  postcssOption = [
    assets({
      baseUrl: '/',
      basePath: 'src/',
      loadPaths: ['img/'],
      cachebuster: true,
    }),
    flexBugsFixes,
    autoprefixer(autoprefixerOption),
    sorting(sortingOptions),
  ]
;

// image processing
gulp.task('images', function() {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

//pugをhtmlに変換
gulp.task('pug', function(done) {
  var option = {
    pretty: true
  }
  gulp.src(paths.html.src)
    .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(pug(option))
      // .pipe(rename({extname: ""})) // 拡張子一個目を消す
      // .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest(paths.html.dest))
  done();
});

// gulp.task('ejs', (done) => {
//     var json = JSON.parse(fs.readFileSync(paths.html.var));

//     gulp.src([paths.html.src])
//       .pipe(plumber({
//         handleError: function (err) {
//           console.log(err);
//           this.emit('end');
//         }
//       }))
//       .pipe(ejs(json))
//       .pipe(rename({extname: ""})) // 拡張子一個目を消す
//       .pipe(rename({extname: ".html"}))
//       .pipe(gulp.dest(paths.html.dest));
//     done();
// });

// JavaScript processing
gulp.task('js.concat', function() {

  var jsbuild = gulp.src([folder.src + 'assets/js/**/*'])
    .pipe(deporder())
    .pipe(concat('main.js'));

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'assets/js/'));
});

gulp.task( 'font', (done) => {
    gulp.src(
        [ folder.src + 'assets/fonts/**' ],
        { base: folder.src }
    )
    .pipe( gulp.dest(folder.build) );

    done();
} );

// Sassコンパイル(非圧縮)
function stylesTask(done) {
  gulp
    .src(paths.styles.src, { sourcemaps: true })
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      }),
    )
    .pipe(
      sass({
        outputStyle: 'expanded',
      }),
    )
    .pipe(replace(/@charset "UTF-8";/g, ''))
    .pipe(header('@charset "UTF-8";\n\n'))
    .pipe(postcss(postcssOption))
    .pipe(rename({
      basename: "main",
      extname: ".css"
    }))
    .pipe(gulp.dest(paths.styles.dest, { sourcemaps: './maps' }));

  done();
}
// Sassコンパイル（圧縮）
function sassCompressTask() {
  return gulp
    .src(paths.styles.src)
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      }),
    )
    .pipe(
      sass({
        outputStyle: 'compressed',
      }),
    )
    .pipe(replace(/@charset "UTF-8";/g, ''))
    .pipe(header('@charset "UTF-8";\n\n'))
    .pipe(postcss(postcssOption, [clean()]))
    .pipe(rename({
      basename: "main",
      extname: ".css"
    }))
    .pipe(gulp.dest(paths.styles.dest));
}

// マップファイル除去
function cleanMapFiles() {
  return del([paths.styles.map, paths.scripts.map]);
}

// ブラウザ更新&ウォッチタスク
const browserSyncOption = {
  port: 8080,
  server: {
    baseDir: './dest',
    index: 'index.html',
  },
  reloadOnRestart: true,
};
function browsersyncTask(done) {
  browserSync.init(browserSyncOption);
  done();
}

function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload();
    done();
  };
  // HACK: 理想形
  // gulp.watch(paths.styles.src).on('change', gulp.series(styles, browserReload));

  // image changes
  gulp.watch(folder.src + 'images/**/*').on('change', gulp.series(gulp.task('images'), browserReload));

  // html changes
  gulp.watch(folder.src + 'views/**/*').on('change', gulp.series(gulp.task('html'), browserReload));

  // javascript changes
  gulp.watch(folder.src + 'assets/js/**/*').on('change', gulp.series(gulp.task('js'), browserReload));

  // css changes
  gulp.watch(folder.src + 'assets/sass/**/*').on('change', gulp.series(stylesTask, browserReload));

  // font changes
  gulp.watch(folder.src + 'assets/fonts/**/*').on('change', gulp.series(gulp.task('font'), browserReload));
}

gulp.task('js', gulp.series('js.concat'));
gulp.task('html', gulp.series('pug'));
gulp.task('build', gulp.series(gulp.parallel('js', 'images', sassCompressTask, 'html', 'font'), cleanMapFiles));
gulp.task('default', gulp.series(gulp.parallel('js', stylesTask, 'html'), gulp.series(browsersyncTask, watchFiles)));