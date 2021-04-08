const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devServer = {
  hot: true,
  contentBase: path.join(__dirname, '../dist'),
}

module.exports = merge(baseConfig, {
  mode: "development",
  devServer,
  devtool: 'inline-source-map',
  target: 'electron-renderer',
  entry: path.resolve(__dirname, '../src/render/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        exclude: /node_modules/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
            },
          },
          "less-loader",
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ["postcss-preset-env"]
              }
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/render/index.html'),
    }),
  ],
})