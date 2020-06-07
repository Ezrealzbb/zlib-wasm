const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {
    srcFolder,
    distFolder,
    config
} = require('./webpack.base.config');
const merge = require('webpack-merge');

module.exports = merge(config, {
    entry: path.resolve(srcFolder, 'index.js'),
    devtool: 'srouce-map',
    mode: 'production',
    output: {
        filename: 'zlib-wasm.js',
        path: distFolder,
        libraryTarget: 'umd',
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
    ],
});