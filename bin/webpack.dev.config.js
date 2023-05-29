const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const wasmLoader = require('wasm-loader');
const {
    config,
    srcFolder,
    distFolder,
    demoFolder,
} = require('./webpack.base.config');
const merge = require('webpack-merge');

const devConfig = {
  context: srcFolder,
  mode: 'development',
  entry: path.resolve(demoFolder, 'main.ts'),
  output: {
    globalObject: 'this',
    path: distFolder,
    filename: 'main.[hash].js',
    webassemblyModuleFilename: '[hash].wasm',
    libraryTarget: 'umd',
  },
  experiments: {
    outputModule: false,
  },
  devtool: 'inline-source-map',
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(demoFolder, 'index.html'),
    }),
  ],
  devServer: {
    static: {
      directory: distFolder,
    },
    compress: false,
    port: 9000,
  },
};

module.exports = merge(config, devConfig);
