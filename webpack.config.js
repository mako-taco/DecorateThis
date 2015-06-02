'use strict';

var cache = {};
var loaders = [
	{
		test: /\.es6\.js$/,
		loader: 'babel-loader?optional[]=runtime&stage=1'
	}
];
var extensions = [
	'', '.js', '.es6.js'
];

module.exports = [{
	cache: cache,
	module: {
		loaders: loaders
	},
	entry: {
		main: './src/entry/main'
	},
	output: {
		path: './dist',
		library: 'decorate-this',
		libraryTarget: 'umd',
		filename: '[name].js'
	},
	resolve: {
		extensions: extensions,
		root: [
			__dirname,
			__dirname + '/src'
		],
	}
}, 
{
	cache: cache,
	module: {
		loaders: loaders
	},
	entry: {
		test: './test/entry/test',
	},
	output: {
		path: './test/fixtures',
		filename: '[name].js'
	},
	resolve: {
		extensions: extensions,
		root: [
			__dirname,
			__dirname + '/src',
			__dirname + '/test/tests'
		]
	}
}];