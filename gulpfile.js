var gulp = require("gulp");
var concat = require("gulp-concat");
var cleanCSS = require("gulp-clean-css");
var imagemin = require("gulp-imagemin");
var replace = require("gulp-replace");
var htmlmin = require("gulp-htmlmin");
var minify = require("gulp-minify");
var sitemap = require('gulp-sitemap');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');


var browserSync = require("browser-sync").create();

gulp.task("fonts", function() {
  return gulp.src("fonts/*").pipe(gulp.dest("dist/fonts"));
});

gulp.task("css", function() {
  return gulp
    .src(["css/normalize.css", "css/webflow.css", "css/solidground.webflow.css"])
    .pipe(concat("style.min.css"))
    .pipe(cleanCSS())
    .pipe(gulp.dest("dist/css"));
});

gulp.task("images", function() {
  return gulp
    .src("images/*")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"));
});

gulp.task("javascript", function() {
  return gulp
    .src("js/*")
    .pipe(minify())
    .pipe(gulp.dest("dist/js"));
});

gulp.task("html", ["javascript", "css", "fonts", "images"], function() {
  return gulp
    .src("*.html")
    .pipe(
      replace(
        '<link href="css/normalize.css" rel="stylesheet" type="text/css">',
        ""
      )
    )
    .pipe(
      replace(
        '<link href="css/webflow.css" rel="stylesheet" type="text/css">',
        ""
      )
    )
    .pipe(replace("css/solidground.webflow.css", "css/style.min.css"))
    .pipe(
      replace(
        '<script src="js/modernizr.js',
        '<script async src="js/modernizr-min.js'
      )
    )
    .pipe(replace("js/webflow.js", "/js/webflow-min.js"))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"));
});

gulp.task("text", function() {
  return gulp
  .src(["*.txt","_*"])
  .pipe(gulp.dest("dist"));
});

gulp.task("sitemap", function() {
  gulp.src(['*.html', '!**/401.html', '!**/all-layouts.html'], {read: false})
  .pipe(sitemap({
      siteUrl: 'https://www..com'
  }))
  .pipe(gulp.dest('./dist'))
});

gulp.task("browser-sync", ["html"], function() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'images/favicon.png',
		dest: 'dist/images/icons',
		iconsPath: '/images/icons/',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '14%',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'whiteSilhouette',
				backgroundColor: '#00a300',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 56.25,
				themeColor: '#326431'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

gulp.task("build", ["fonts", "css", "images", "javascript", "html", "text", "sitemap"]);

gulp.task("default", [
  "fonts",
  "css",
  "images",
  "javascript",
  "html",
  "browser-sync"
]);
