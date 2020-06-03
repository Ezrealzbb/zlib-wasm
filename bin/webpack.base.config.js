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
            extensions: ['.wasm', '.ts', '.js'],
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
                {
                    test: /\.wasm$/,
                    // type: "webassembly/async",
                    type: "webassembly/experimental"
                    // use: [{
                    //     loader: 'base64-loader',
                    //     options: {
                    //         type: 'javascript/auto',
                    //     }
                    // }]
                }
            ]
        }
    }
}