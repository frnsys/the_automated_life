var path = require('path');

module.exports = {
  entry: {
    'main': ['@babel/polyfill', './main'],
    'stats': ['@babel/polyfill', './stats']
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].js'
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
      'log': path.resolve('./app/log'),
      'config': path.resolve('./config'),
      'store': path.resolve('./app/store'),
      'i18n': path.resolve('./app/i18n')
    }
  }
};