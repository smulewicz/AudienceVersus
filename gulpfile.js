const gulp = require('gulp');
const gulp_pug = require('gulp-pug');
const gulp_sass = require('gulp-sass');
const gulp_gm = require('gulp-gm');

const browserSync = require('browser-sync');

const spawn = require('child_process').spawn;
var process;

function swallowError(error) {
	console.log(error.toString());
	this.emit('end');
} 

function swallowErrorBeQuiet() {
	this.emit('end');
}

function process_pug(cb) {
	gulp.src([
		'src/index.pug',
	])
		.pipe(gulp_pug())
		.on('error', swallowError)
		.pipe(gulp.dest('build'));
	cb();
}

function process_sass(cb) {
	gulp.src([ 
		'src/sass/index.scss',
	])
		.pipe(gulp_sass())
		.on('error', swallowError)
		.pipe(gulp.dest('build/css'));
	cb();
}

function process_image(file, stats) {
	gulp.src(file, {"base": "src/images"})
		.pipe(gulp_gm(function(f) {
			console.log('Processing \"' + f.source + '\"...');
			f._subCommand = "magick";
			return f.setFormat('webp');
		}, {
			imageMagick: true
		}))
		.on('error', swallowError)
		.pipe(gulp.dest('build/images'));
}

function process_all_images(cb) {
	process_image('src/images/*.{jpeg,jpg,gif,png}');
	cb(); 
} 

// potrzebny fix
function restart(cb) {
	browserSync.exit();
    if(process)
		process.kill();
    process = spawn('gulp.cmd', ['watch'], {stdio: 'inherit'});
    if(cb)
		cb();
}

function reload(cb) {  
	browserSync.reload();
	cb();
}

function serve(cb) { 
	browserSync.init({
		port: 8080,
		server: {
			baseDir: "./build",
			port: 8080
		},
		ui: {
			port: 8081
		}
	}); 

	gulp.watch("src/index.pug", process_pug);
	gulp.watch("src/sass/index.scss", process_sass);
	gulp.watch("src/images/*.{jpeg,jpg,gif,png}").on("add", process_image);

	gulp.watch([
		"build/css/index.css",
		"build/index.html",
		"build/images/*.webp"
	], reload);

	cb(); 
} 

exports.default = gulp.parallel(process_pug, process_sass, process_all_images);
exports.sass = process_sass;
exports.pug = process_pug;
exports.images = process_all_images;
exports.watch = serve;
