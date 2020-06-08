# zlib-wasm

## Introduction

A wasm module compiled from the zlib library can greatly improve the performance of js decompression and compression.
For environments that do not support wasm, pako will be downgraded by default to ensure that the production environment is not blocked.

## Usage

```shell
yarn add zlib-wasm --save
```

## Demo
You can run a demo service to debug zlib-wasm in the browser

```shell
yarn start
```

Then visit http://localhost:9000 in your browser tab.

## License
MIT & Zlib
