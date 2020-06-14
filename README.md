# zlib-wasm

## Introduction

A wasm module compiled from the zlib library can greatly improve the performance of js decompression and compression.
For environments that do not support wasm, pako will be downgraded by default to ensure that the production environment is not blocked.

## Usage

First of all, you need add `zlib-wasm` in project. run:

```shell
yarn add zlib-wasm --save
```

This module is a singleton with 2 simple api.It is recommended to export 2 functions for external use.

```ts
import { zlib } from 'zlib-wasm';

// false by default. There are some logs in console if `true` was setted；
zlib.setDebug(true);

export function ungzip<T>(gzipBase64Str: string): T {
  return zlib.ungzip(gzipBase64Str)
}

export function gzip(data: string): string {
  return zlib.gzip(data, 9/* gzip level */);
}

```

Wasm broke into the zlib-wasm chunk in the form of base64, but the loading process of the Webassembly Module was asynchronous.

You don't need to care whether the state is loaded. When Webassembly is not available, it will automatically downgrade to use pako.If you really depend on this state, you can judge by `zlib.isReady(): boolean` or `zlib.loadedPromise.then((instance => { /* wasm is Ready */ }))`.


## Performance
You can run a local service to debug zlib-wasm in the browser. By default, this is a performance page to test `zlib-wasm` and  `pako`.

```shell
yarn start
```

Then visit http://localhost:9000 in your browser tab.

## License
MIT
