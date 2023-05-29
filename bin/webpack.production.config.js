const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {
    srcFolder,
    distFolder,
    config
} = require('./webpack.base.config');
const merge = require('webpack-merge');

module.exports = merge(config, {
    entry: path.resolve(srcFolder, 'index.ts'),
    devtool: 'source-map',
    mode: 'production',

    output: {
//        globalObject: 'this',
        filename: 'index.js',
        path: distFolder,
        libraryTarget: 'module',
        webassemblyModuleFilename: '[contenthash].wasm',
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
    ],
});