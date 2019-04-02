var path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './main'],
  output: {
    filename: 'dist.js',
    path: __dirname + '/static'
  },
  devServer: {
    publicPath: '/static/'
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
    }]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      'data': path.resolve('./data'),
      'config': path.resolve('./config'),
      'store': path.resolve('./app/store')
    }
  }
};