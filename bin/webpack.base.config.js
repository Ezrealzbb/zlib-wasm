const path = require('path');
const baseRoot = path.resolve(__dirname, '../');
const srcFolder = path.resolve(baseRoot, 'src');
const demoFolder = path.resolve(baseRoot, 'demo');
const distFolder = path.resolve(baseRoot, 'dist');
const binFolder = path.resolve(baseRoot, 'bin');

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
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                    }
                },
                {
                    test: /\.ts$/,
                    exclude: /(node_modules)/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(baseRoot, 'tsconfig.json'),
                        }
                    }]
                }
            ]
        }
    }
}