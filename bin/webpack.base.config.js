const path = require('path');
const baseRoot = path.resolve(__dirname, '../');
const srcFolder = path.resolve(baseRoot, 'src');
const demoFolder = path.resolve(baseRoot, 'demo');
const distFolder = path.resolve(baseRoot, 'dist');
const binFolder = path.resolve(baseRoot, 'bin');
console.log(baseRoot, srcFolder);

module.exports = {
    baseRoot,
    srcFolder,
    demoFolder,
    distFolder,
    binFolder,
    config: {
        resolve: {
            extensions: [ '.ts', '.js'],
        },
        module: {
            noParse: /\.wasm$/,
            rules: [
                // {
                //     test: /\.js$/,
                //     exclude: /(node_modules)/,
                //     use: {
                //         loader: 'babel-loader',
                //     }
                // },
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
                // {
                //     test: /\.wasm$/,
                //     // type: "webassembly/async",
                //     // type: "webassembly/experimental"
                //     use: [{
                //         loader: 'base64-loader',
                //         options: {
                //             type: 'javascript/auto',
                //         }
                //     }]
                // }
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