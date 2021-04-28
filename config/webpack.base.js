const webpack = require('webpack')
const path = require('path')

const globalFilePath = path.resolve(__dirname, '../src/base/js-helper/global.ts')

module.exports = {
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      src: path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.m?[tj]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    electron: 'v12.0.2'
                  }
                }
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              [
                "@babel/plugin-proposal-decorators",
                {
                  "legacy": true,
                }

              ],
              ["@babel/plugin-proposal-class-properties",
                {
                  "loose": true
                }
              ],
              '@babel/plugin-transform-modules-commonjs'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new webpack.DefinePlugin({
      TEST_VALUE: JSON.stringify('test')
    }),
    new webpack.ProvidePlugin({
      empty: [globalFilePath, 'empty'],
      noop: [globalFilePath, 'noop']
    })
  ],
}