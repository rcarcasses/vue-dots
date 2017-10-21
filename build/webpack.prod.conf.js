'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env

const webpackConfig = [
  merge(baseWebpackConfig, {
    entry: path.resolve(__dirname + '/../src/plugin.js'),
    output: {
      filename: 'vue-dots.js',
      libraryTarget: 'umd',
      library: 'vue-dots',
      umdNamedDefine: true
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin( {
        minimize : true,
        sourceMap : false,
        mangle: true,
        compress: {
          warnings: false
        }
      }),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath('../vue-dots.css')
      })
    ]
  }),
  merge(baseWebpackConfig, {
    entry: path.resolve(__dirname + '/../src/plugin.js'),
    output: {
      filename: 'vue-dots.min.js',
      libraryTarget: 'window',
      library: 'VueDots'
    },
    externals: {
      vue: 'vue'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin( {
        minimize : true,
        sourceMap : false,
        mangle: true,
        compress: {
          warnings: false
        }
    }),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath('../vue-dots.css')
      })
    ]
  })
]

module.exports = webpackConfig
