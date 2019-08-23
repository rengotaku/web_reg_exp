// gulp.js configuration
const
  // modules
  gulp = require('gulp'),

  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),

  htmlclean = require('gulp-htmlclean'),

  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),

  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),

  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  ejs = require('gulp-ejs'),

  fs = require('fs'),

  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // folders
  folder = {
    src: 'src/',
    build: 'build/'
  }
;

// image processing
gulp.task('images', function() {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

gulp.task('ejs', (done) => {
    var json = JSON.parse(fs.readFileSync(folder.src + 'views/var/var.json'));

    gulp.src([folder.src + 'views/*.ejs', folder.src + 'views/*.ejs.html'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(ejs(json))
        .pipe(rename({extname: ""})) // 拡張子一個目を消す
        .pipe(rename({extname: ".html"}))
        .pipe(gulp.dest(folder.build + 'html'));
    done();
});

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

// CSS processing
function scss_task(done) {
  var postCssOpts = [
  assets({ loadPaths: ['images/'] }),
  autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
  mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  gulp.src([folder.src + 'assets/scss/my_main.scss.css'])
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(concat('main.css'))
    .pipe(gulp.dest(folder.build + 'assets/css/'));

  done();
};

gulp.task('css.min', (done) => {
  gulp.src(folder.src + 'assets/scss/*.min.css')
  .pipe( gulp.dest(folder.build + 'assets/css') );

  done();
} );

gulp.task('css.image', (done) => {
  gulp.src(folder.src + 'assets/scss/origin/images/**')
  .pipe( gulp.dest(folder.build + 'assets/css/images') );

  done();
} );

// watch for changes
gulp.task('watch', function() {

  // image changes
  gulp.watch(folder.src + 'images/**/*', gulp.task('images'));

  // html changes
  gulp.watch(folder.src + 'views/**/*', gulp.task('html'));

  // javascript changes
  gulp.watch(folder.src + 'assets/js/**/*', gulp.task('js'));

  // css changes
  gulp.watch(folder.src + 'assets/scss/**/*', gulp.task('css'));

  // font changes
  gulp.watch(folder.src + 'assets/fonts/**/*', gulp.task('font'));
});

gulp.task('js', gulp.series('js.concat'));
gulp.task('css', gulp.series(scss_task, 'css.min', 'css.image'));
gulp.task('html', gulp.series('ejs'));
gulp.task('run', gulp.parallel('html', 'css', 'js', 'font', 'images'));
gulp.task('default', gulp.series('run', gulp.series('watch')));