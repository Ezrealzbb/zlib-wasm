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
        extensions: ['.ts', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /(node_modules)/,
            use: [
              {
                loader: 'babel-loader',
              },
              {
                loader: 'ts-loader',
                options: {
                  configFile: path.resolve(baseRoot, 'tsconfig.json'),
                },
              },
            ],
          },
          {
            test: /\.wasm$/,
            type: 'asset/inline',
            // type: 'asset/resource',
            // generator: {
            //   filename: '[name].[hash][ext]',
            // },
          },
        ],
      },
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        outputModule: true,
      },
    }
}
