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

const entry = path.resolve(srcFolder, 'index.ts');
console.log('entry', entry);

module.exports = merge(config, {
    mode: 'development',
    // entry: path.resolve(demoFolder, 'main.js'),
    // entry: path.resolve(srcFolder, 'index.ts'),
    entry: path.resolve(__dirname, '../src/index.ts'),
    output: {
        path: distFolder,
        filename: 'main.bundle.js',
        webassemblyModuleFilename: "[hash].wasm",
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        port: 9000,
        // open: true,
    },
    devtool: 'inline-source-map',
    plugins: [
        new htmlWebpackPlugin({  // 插件的使用： new 调用构造函数，配置项就是构造函数的参数（对象形式的参数）
            template: path.resolve(demoFolder, 'index.html'),
        }),
    ],
});