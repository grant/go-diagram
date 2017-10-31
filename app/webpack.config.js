var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    "webpack-dev-server/client?http://localhost:3000", // Needed for hot reloading
    "webpack/hot/only-dev-server", // See above
    path.resolve(__dirname, 'js/app.js')
  ],
  output: { // Compile into js/build.js
    path: path.resolve(__dirname, 'build'),
    filename: "js/bundle.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015']
      }
    }, {
      test: /\.styl$/,
      loader: 'style-loader!css-loader!stylus-loader'
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true,
      filename: 'index.html',
    }),
  ],
  target: "web",
  stats: false,
  progress: true
};
