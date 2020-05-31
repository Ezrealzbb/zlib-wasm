const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackCfg = require('./webpack.dev.config');
const serverCfg = require('./dev-server');


const compiler = webpack(webpackCfg);
const devServer = new webpackDevServer(compiler, serverCfg);

devServer.listen(9000, '0.0.0.0', (err) => {
    if (err) {
        console.error(err)
    }
})