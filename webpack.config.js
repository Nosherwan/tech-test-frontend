/* global __dirname, process */
const path = require('path'); //node module to resolve paths
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// the path(s) that should be cleaned
const pathsToClean = [
	'www'
];

// the clean options to use
const cleanOptions = {
	// root: '/full/webpack/root/path',
	// exclude: ['shared.js'],
	verbose: true,
	dry: false
};

const babelSettings = {
	extends: path.join(__dirname, '/.babelrc')
};
const PATHS = {
	src: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'www'),
};

const devEntries = [
	'webpack-dev-server/client?http://0.0.0.0:8081',	//DEV only
];

let prodEntries = [
	// '@babel/polyfill',
	'es6-promise',
	'whatwg-fetch',
	PATHS.src
];


module.exports = env => {
	env = { options: process.env.NODE_ENV };

	console.log('process.env=', process.env.NODE_ENV);
	process.traceDeprecation = true;
	if (env && env.options && env.options === 'development') {
		prodEntries = devEntries.concat(prodEntries);
	}

	return {
		mode: env.options,
		// devServer is for dev only
		devServer: {
			compress: true,
			inline: true,
			port: 8081,
			// outputPath: PATHS.build,
			contentBase: PATHS.build
		},
		devtool: 'inline-source-map',
		// devtool: 'eval-source-map',
		// devtool: 'cheap-module-source-map',
		// devtool: 'inline-source-map',
		entry: {
			'./www': prodEntries,
		},
		output: {
			filename: 'bundle.[hash].js', //destination file name
			path: PATHS.build, //destination folder
		},
		resolve: {
			modules: [ 
				__dirname,
				path.join(__dirname, 'node_modules')
			],
			plugins: [
			],
			extensions: ['.js','.jsx','.ts', '.tsx'],
			alias: {}
		},
		module: { //add multiple loaders to process files
			rules: [
				{
					// Only run .js & .jsx files through Babel
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: babelSettings
						}
					]
				},
				{
					// Transform our own .css files with PostCSS and CSS-modules
					test: /\.css$/,
					// exclude: /node_modules/,
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: [
							{
								loader: 'css-loader',
								query: {
									modules: true,
									importLoaders: 1,
									localIdentName: '[local]-[hash:base64:5]'
								}
							}
						]
					})
				},
				{
					test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
						name: '[name].[ext]'
					}
				},
				{
					test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
					exclude: [/images/],
					loader: 'file-loader',
					options: {
						name: '[name].[ext]'
					}
				},
				{
					test: /.*\.(gif|png|jpe?g)$/i,
					loader: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]'
							}
						},
						{
							loader: 'image-webpack-loader',
							options: {
								progressive: true,
								optimizationLevel: 7,
								interlaced: false,
								pngquant: {
									quality: '65-90',
									speed: 4
								}
							}
						},
					]
				},
				{
					test: /\.svg$/,
					exclude: /node_modules/,
					loader: 'svg-react-loader'
				}
			]
		},
		plugins: [
			new webpack.EnvironmentPlugin(['NODE_ENV', 'DEBUG']),
			new CleanWebpackPlugin(pathsToClean, cleanOptions),
			new ExtractTextPlugin('styles.css'),
			new HtmlWebpackPlugin({
				template: path.join(__dirname, 'src/index.html'),
				filename: 'index.html',
				inject: 'body',
			}),
		]
	};
};
