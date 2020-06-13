const path = require('path');
const baseRoot = path.resolve(__dirname, '../');
const srcFolder = path.resolve(baseRoot, 'src');
const baseFolder = path.resolve(srcFolder, 'base');
const webFolder = path.resolve(srcFolder, 'web');
const demoFolder = path.resolve(baseRoot, 'demo');
const distFolder = path.resolve(baseRoot, 'dist');
const binFolder = path.resolve(baseRoot, 'bin');

module.exports = {
    baseRoot,
    srcFolder,
    demoFolder,
    distFolder,
    binFolder,
    baseFolder,
    webFolder,
    config: {
        resolve: {
            extensions: [ '.ts', '.js'],
        },
        module: {
            noParse: /\.wasm$/,
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /(node_modules)/,
                    use: [{
                        loader: 'babel-loader',
                    }, {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(baseRoot, 'tsconfig.json'),
                        }
                    }]
                },
                {
                    test: /\.wasm$/,
                    // Tells WebPack that this module should be included as
                    // base64-encoded binary file and not as code
                    loaders: ['base64-loader'],
                    // Disables WebPack's opinion where WebAssembly should be,
                    // makes it think that it's not WebAssembly
                    //
                    // Error: WebAssembly module is included in initial chunk.
                    type: 'javascript/auto'
                }
            ]
        }
    }
}