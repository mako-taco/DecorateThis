'use strict';

var config = require('./webpack.config');
var gutil = require('gulp-util');
var path = require('path');
var os = require('os');
var gulp = require('gulp');
var nodefn = require('when/node');
var server = require('./test/server');
var webpack = require('webpack');
var execFile = require('child_process').execFile;
var notifier = require('node-notifier');
var startTestServer;
var stopTestServer;
var webpackRun;
var runTests;

function notifyBuildFailed () {
	gutil.log(gutil.colors.red('Build failed'));
	notifier.notify({
		title: 'Build failed',
		message: 'see console for details',
		sound: true,
		icon: __dirname + '/test/notifications/bad.png'
	});
}

function notifyBuildPassed () {
	gutil.log(gutil.colors.blue('Build complete'));
	notifier.notify({
		title: 'Build complete',
		message: 'see console for details',
		icon: __dirname + '/test/notifications/good.png'
	});
}

function notifyTestsFailed (err) {
	gutil.log(gutil.colors.red('Tests failed'));
	var notification = {
		title: 'Tests failed',
		sound: true,
		icon: __dirname + '/test/notifications/bad.png'
	};

	if(err && err.url) {
		notification.message = 'Click to view in browser';
		notification.open = err.url;
	}

	notifier.notify(notification);
}

function notifyTestsPassed () {
	gutil.log(gutil.colors.blue('Tests passed'));
	notifier.notify({
		title: 'Tests passed',
		message: 'see console for details',
		icon: __dirname + '/test/notifications/good.png'
	});
}

function notifyTestBuildFailed () {
	gutil.log(gutil.colors.red('Test build failed'));
	notifier.notify({
		message: 'Test build failed',
		sound: true,
		icon: __dirname + '/test/notifications/bad.png'
	});
}

process.env.NODE_PORT = process.env.NODE_PORT || 21113;

runTests = nodefn.lift(function (callback) {
	var url = 'http://localhost:' + process.env.NODE_PORT + '/index.html';
	var file = path.resolve('node_modules','.bin','mocha-phantomjs');
	var args = ['-R', 'spec', url];

	if (os.platform() === 'win32') {
		file += '.cmd';
	}

	gutil.log('Starting unit tests', file);
	try {

		execFile(file, args, function (err, stdout, stderr) {
			var code = (err && err.code) || 0;

			if(err) {
				gutil.log(err.stack);
			}

			if(stdout) {
				gutil.log(stdout);
			}

			if(stderr) {
				gutil.log(stderr);
			}

			gutil.log('Mocha exited with code ' + code);

			//non zero! bad!
			if(code) {
				err = new Error('Client tests failed');
				err.url = url;
			}

			gutil.log('Unit tests finished');
			callback(err);
		});
	}
	catch (err) {
		gutil.log('Fatal error', err.stack);
		callback(err);
	}
});

startTestServer = nodefn.lift(function (callback) {
	gutil.log('Starting test server on port ' + process.env.NODE_PORT);
	server.start(process.env.NODE_PORT, callback);
});

stopTestServer = nodefn.lift(function (callback) {
	gutil.log('Stopping test server on port ' + process.env.NODE_PORT);
	server.stop(callback);
});

webpackRun = nodefn.lift(nodefn.lift(webpack));

gulp.task('test', ['build'], function (callback) {
	startTestServer()
		.then(function () {
			return runTests();
		}, notifyBuildFailed)
		.then(notifyTestsPassed, function (err) {
			process.exit(1);
			return notifyTestsFailed(err);
		})
		.ensure(function () {
			return stopTestServer();
		});
});

gulp.task('build', function (callback) {
	process.env.NODE_ENV = 'development';

	config.forEach(function (config) {
		config.devtool = 'source-map';
		config.debug = true;
	});

	webpackRun(config)
		.then(function (msg) {
			
		}, notifyBuildFailed)
		.done(callback, callback);
});

gulp.task('watch', function (callback) {
	var buildID = 0;
	var testsRunning = false;
	var compiler;
	var testCompiler;
	var testWatcher;

	process.env.NODE_ENV = 'development';

	config.forEach(function (config) {
		config.devtool = 'source-map';
		config.debug = true;
	});

	// Watch the main files and test files separately
	compiler = webpack(config[0]);
	testCompiler = webpack(config[1]);

	startTestServer().ensure(function () {
		compiler.watch(200, function (err, stats) {
			if(err) {
				notifyBuildFailed(err);
			}
			else {
				var jsonStats = stats.toJson();

				if(jsonStats.warnings.length > 0) {
					jsonStats.warnings.forEach(function (warning) {
						gutil.log(gutil.colors.yellow('WARN: ') + warning);
					});
				}

				if(jsonStats.errors.length > 0) {
					jsonStats.errors.forEach(function (error) {
						gutil.log(gutil.colors.red('ERROR: ') + error);
					});

					notifyBuildFailed();
				}
				else {
					buildID++;
					testWatcher.invalidate();
					notifyBuildPassed();
				}
			}
		});

		testWatcher = testCompiler.watch(200, function (err, stats) {
			// Exit early when the main files failed to build; no reason to test
			if(testsRunning) {
				return;
			}
			else if(err) {
				notifyTestBuildFailed();
			}
			else {
				var jsonStats = stats.toJson();

				if(jsonStats.warnings.length > 0) {
					jsonStats.warnings.forEach(function (warning) {
						gutil.log(gutil.colors.yellow('WARN: ' + warning));
					});
				}

				if(jsonStats.errors.length > 0) {
					jsonStats.errors.forEach(function (error) {
						gutil.log(gutil.colors.yellow('ERROR: ' + error));
					});

					notifyTestBuildFailed();
				}
				else {
					testsRunning = true;

					runTests().ensure(function () {
						testsRunning = false;
					}).done(function () {
						notifyTestsPassed();
					}, function (err) {
						notifyTestsFailed(err);
					});
				}
			}
		});
	});
});
