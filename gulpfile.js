const gulp = require('gulp'),
  autoprefixer = require('autoprefixer'),
  concat = require('gulp-concat-util'),
  cssnano = require('cssnano'),
  gm = require('gulp-gm'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  plumber = require('gulp-plumber');

// Replace
gulp.task('replace', () => {
  gulp.src(['public/index.xml'])
    .pipe(plumber())
    .pipe(replace('data-src', 'src'))
    .pipe(replace(/(&lt;section)(.*)/g, ''))
    .pipe(replace(/(&lt;input)(.*)/g, ''))
    .pipe(replace(/(&lt;label)(.*)/g, ''))
    .pipe(replace('&lt;div class=&#34;panel&#34;&gt;', ''))
    .pipe(replace(/(&lt;img id=&#34;bonus&#34;)(.*)/g, ''))
    .pipe(replace('&lt;/div&gt;', ''))
    .pipe(replace('&lt;/section&gt;', ''))
    .pipe(replace(/\n\s*/g, ''))
    .pipe(replace('&lt;/figure&gt;', '&lt;/figure&gt; &lt;a href=&#34;https://www.patreon.com/rustledjimmiescomic&#34; target=&#34;_blank&#34; rel=&#34;noopener&#34;&gt;&lt;img src={{ &#34;/img/assets/patreon-banner.jpg&#34; | relURL }} alt=&#34;Patreon&#34;&gt;&lt;/a&gt;'))
    .pipe(gulp.dest('public/'));
});

// Critical CSS
gulp.task('critical', () => {
  const plugins = [autoprefixer({browsers: ['> 5%']}), cssnano()];
  return (
    gulp.src('assets/css/critical.scss')
      .pipe(plumber())
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss(plugins))
      // wrap with style tags
      .pipe(concat.header('<style>'))
      .pipe(concat.footer('</style>'))
      // convert it to an include file
      .pipe(
        rename({
          basename: 'critical',
          extname: '.html',
        })
      )
      // insert file
      .pipe(gulp.dest('layouts/partials'))
  );
});

// Image Conversion
gulp.task('convert', () => {
  return (
    gulp.src('assets/comic/*.png')
    .pipe(plumber())
    .pipe(
      gm(function(gmfile) {
        return gmfile.setFormat('jpg');
      })
    )
    .pipe(gulp.dest('static/img/comic'))
  );
});

// Move GIFs
gulp.task('gif', () => {
  return (
    gulp.src('assets/comic/*.gif')
      .pipe(plumber())
      .pipe(gulp.dest('static/img/comic'))
  );
});


// Watch asset folder for changes
gulp.task('watch', gulp.parallel(['replace', 'critical', 'convert', 'gif'], () => {
  gulp.watch('layouts/_default/rss.xml', gulp.parallel(['replace']));
  gulp.watch('assets/css/reset.scss', gulp.parallel(['critical']));
  gulp.watch('assets/css/fonts.scss', gulp.parallel(['critical']));
  gulp.watch('assets/css/critical.scss', gulp.parallel(['critical']));
  gulp.watch('assets/img/*', gulp.parallel(['convert', 'gif']));
}));

// Run Watch as default
gulp.task('default', gulp.series(['watch']));

// Build
gulp.task('build', gulp.parallel(['critical', 'convert', 'gif']));