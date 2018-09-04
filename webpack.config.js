'use strict';

const webpack = require('webpack');
const rxPaths = require('rxjs/_esm5/path-mapping');
const babelOptions = require('./babel.config');

const env = process.env.NODE_ENV || 'production';

// default production build will tree shake and minimize
// we have both a minimized and unminimized production build for umd
const MINIMIZE = (process.env.MINIMIZE && process.env.MINIMIZE === 'false') ? false :
  (env === 'production') ? true :
  false;

const config = {
  mode: env,
  optimization: {
    minimize: MINIMIZE
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader', options: babelOptions }
        ]
      }
    ]
  },
  resolve: {
    alias: rxPaths()  // not sure that this is needed but is in rxjs docs
  },
  output: {
    library: 'ReduxLogic',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};

module.exports = config;
