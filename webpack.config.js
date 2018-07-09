const path = require('path');
const webpack = require('webpack');
const moment = require('moment');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

const packageJson = require('./package.json');

module.exports = {
  node: {
    fs: 'empty',
  },
  context: path.join(__dirname, 'src'),
  entry: {
    module: './module.ts',
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'amd',
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all'
  //   }
  // },
  performance: {hints: false},
  externals: [
    'lodash',
    'jquery',
    'moment',
    'slate',
    'prismjs',
    'slate-plain-serializer',
    'slate-react',
    function(context, request, callback) {
      var prefix = 'app/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request);
      }
      callback();
    },
  ],
  plugins: [
    new CleanWebpackPlugin('dist', {allowExternal: true}),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CopyWebpackPlugin([
      {from: 'plugin.json', to: '.'},
      {from: '../README.md', to: '.'},
      {from: '../LICENSE', to: '.'},
      {from: 'partials/*', to: '.'},
      {from: 'img/*', to: '.'},
    ]),
    new ReplaceInFileWebpackPlugin([
      {
        dir: 'dist',
        files: ['plugin.json'],
        rules: [
          {
            search: '%VERSION%',
            replace: packageJson.version,
          },
          {
            search: '%TODAY%',
            replace: moment().format('YYYY.MM.DD'),
          },
        ],
      },
    ]),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: 'babel-loader',
            options: {presets: ['env']},
          },
          'ts-loader',
        ],
        exclude: /(node_modules)/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
