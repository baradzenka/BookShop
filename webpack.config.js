
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
	entry: path.resolve(__dirname, "./src/index.ts"),
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
//		clean: true   // clean the output directory before emit.
	},

//	mode: "development", devtool: "inline-source-map",
	mode: "production",

	stats: "errors-warnings",   // to reduce output info.

	plugins: [
		new MiniCssExtractPlugin({filename: "index.css"}),
		new CopyPlugin({
			patterns: [
				{ from: "./src/index.html", to: "./" },   // copy index.html from ./src to ./dist .
				{ from: "./src/images", to: "./images" }]   // copy images from ./src to ./dist/images .
			}),
	],

	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js", ".css", ".scss"]
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader"
			},
			{
				test: /\.scss$/,
				use: [ 
				 	{ loader: MiniCssExtractPlugin.loader },
//				 	{ loader: "css-modules-typescript-loader"},  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
				 	{ loader: "css-loader", /*options: { modules: true }*/ },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
				 	{ loader: "sass-loader" }  // to convert SASS to CSS
				]
			}
		],
	},
	optimization: {
		minimizer: [
			new TerserPlugin(),
			new CssMinimizerPlugin(),
		],
	}
}
