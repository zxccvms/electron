const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devServer = {
  contentBase: path.join(__dirname, '../dist'),
}

module.exports = {
  mode: "development",
  devServer,
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, '../src/renderer/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.m?[tj]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
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
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/renderer/index.html'),
    })
  ],
}