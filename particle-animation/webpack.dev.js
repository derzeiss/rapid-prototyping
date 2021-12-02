const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: "eval-source-map",
  devServer: {
    contentBase: path.join(__dirname, 'assets'),
    publicPath: '/',
    compress: true,
    port: 3000
  }
});
