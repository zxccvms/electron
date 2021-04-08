const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals');
const baseConfig = require('./webpack.base')


module.exports = merge(baseConfig, {
  mode: "development",
  target: 'electron-main',
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, '../src/main/index.ts'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  node: {
    __filename: false,
    __dirname: false,
  },
  externals: [nodeExternals()],
})