var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var isProd = (process.env.NODE_ENV === 'production');
var isTest = (process.env.NODE_ENV === 'test');

var vueBuild = (isProd ? 'vue.min.js' : 'vue.js');

var cfgFile = (isProd ? 'prod' : isTest ? 'test' : 'dev') + '.js';
var config = require(__dirname + '/cfg/' + cfgFile);

var cssLoader = (isProd ? 'css-loader' : 'css-loader?sourceMap');
var sassLoader = (isProd ? 'sass-loader?' : 'sass-loader?sourceMap&') +
	'includePaths[]=' + __dirname + "/node_modules/compass-mixins/lib";

var filename = (isProd ? '[name].[chunkhash]' : '[name]');

var commonLib = config.commonLib || [];

var webpackOptions = {

	context: __dirname + "/app",

	entry: {
		app: "./js/main.js",
		common: [
			'core-js/es6/promise',
			'dom4',
			'vue',
			'vue-router'
		].concat(commonLib)
	},

	output: {
		path: __dirname + "/dist",
		publicPath: config.publicPath,
		filename: "js/" + filename + ".js"
	},

	resolve: {
		extensions: [ '.js', '.json' ],
		alias: {
			vue: 'vue/dist/' + vueBuild
		}
	},

	plugins: [
		new CleanWebpackPlugin(['dist']),
		new webpack.DefinePlugin({
			__DESCRIPTION: JSON.stringify(config.description),
			__PATH: JSON.stringify(config.publicPath),
			__ANALYTICS_UA: JSON.stringify(config.analyticsId)
		}),
		new HtmlWebpackPlugin({
			title: config.title,
			config: config,
			template: 'index.ejs',
			inject: 'foot',
			chunksSortMode: 'dependency',
			minify: {
				collapseWhitespace: true,
				conservativeCollapse: true,
				collapseBooleanAttributes: true,
				collapseInlineTagWhitespace: true
			}
		}),
		new CopyWebpackPlugin([
			{ from: 'audio', to: 'audio' },
			{ from: 'favicon.ico', to: 'favicon.ico' },
			// { from: 'email-config.json', to: 'email-config.json' },
			{ from: 'apple-touch-icon.png', to: 'apple-touch-icon.png' }
		])
	],

	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.(vue|js)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: [ 'babel-loader' ]
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						sass: 'vue-style-loader!' + cssLoader + '!' + sassLoader
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: { importLoaders: 1 }
					},
					'postcss-loader'
				]
			},
			{
				test: /\.scss$/,
				loaders: [ cssLoader, sassLoader ]
			},
			{
				test: /\.styl(us)?$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'stylus-loader'
				]
			},
			{
				test: /\.html$/,
				loader: 'file-loader?name=[name].[ext]'
			},
			{
				test: /\.pug$/,
				loader: 'pug-plain-loader'
			},
			{
				test: /\.(eot|ttf|woff|woff2|otf|fnt)$/,
				loader: 'file-loader?hash=sha512&digest=hex&name=fonts/[hash].[ext]'
			},
			{
				test: /\.(mp4|m4v)$/,
				loader: 'file-loader?hash=sha512&digest=hex&name=video/[hash].[ext]'
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/,
				loaders: [
					'file-loader?hash=sha512&digest=hex&name=images/[hash].[ext]', {
						loader: 'image-webpack-loader',
						query: {
							optipng: {
								bypassOnDebug: false,
								optimizationLevel: 0
							}
						}
					}
				]
			},
			{
				test: /\.(frag|vert|glsl)$/,
				loaders: [
					'raw-loader',
					'glslify-loader'
				],
				exclude: /node_modules/
			}
		]
	}
};

if (isProd) {

	webpackOptions.plugins.push(
		new webpack.HashedModuleIdsPlugin()
	);

	webpackOptions.plugins.push(
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common'
		})
	);

	webpackOptions.plugins.push(
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	);

	if (config.prerenderPaths && config.prerenderPaths.length) {
		var PrerenderSpaPlugin = require('prerender-spa-plugin');
		webpackOptions.plugins.push(new PrerenderSpaPlugin(
			__dirname + '/dist',
			config.prerenderPaths
		));
	}

} else {

	webpackOptions.devServer = {
		host: '0.0.0.0',
		port: 8080,
		disableHostCheck: true,
		inline: true,
		hot: true,

		// Browser will automatically open page. Comment to disable.
		// open               : false,

		historyApiFallback: true,

		// webpack-dev-middleware options
		quiet: false,
		noInfo: false,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		}
	};

	var DashboardPlugin = require('webpack-dashboard/plugin');

	webpackOptions.plugins.push(new DashboardPlugin());
	webpackOptions.plugins.push(new webpack.NamedModulesPlugin());
	webpackOptions.plugins.push(new webpack.HotModuleReplacementPlugin());

}

module.exports = webpackOptions;
