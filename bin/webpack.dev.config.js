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

module.exports = merge(config, {
    mode: 'development',
    // entry: path.resolve(demoFolder, 'main.js'),
    entry: path.resolve(srcFolder, 'index.ts'),
    output: {
        path: distFolder,
        filename: 'main.bundle.js',
        webassemblyModuleFilename: "[hash].wasm",
    },
    devtool: 'inline-source-map',
    plugins: [
        new htmlWebpackPlugin({  // 插件的使用： new 调用构造函数，配置项就是构造函数的参数（对象形式的参数）
            template: path.resolve(demoFolder, 'index.html'),
        }),
    ],
});