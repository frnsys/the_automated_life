var path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './main'],
  output: {
    filename: 'dist.js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      }
    }, {
      test: /\.json$/,
      exclude: /node_modules/,
      use: {
        loader: 'json'
      }
    }]
  },
  resolve: {
    extensions: ['.js']
  }
};