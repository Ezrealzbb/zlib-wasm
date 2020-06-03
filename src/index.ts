// "use strict";

// const fs = require("fs");
// const buff = fs.readFileSync("build/zlib-sample.wasm");
// let ret;

// module.exports.initialize = async () => {
//   if (ret) return ret;

//   const COMPRESSION_LEVEL = 6;
//   const NO_ZLIB_HEADER = -1;
//   const CHUNK_SIZE = 32 * 1024;
//   const map = {};
//   const memory = new WebAssembly.Memory({
//     initial: 1,
//     maximum: 1024, // 64MB
//   });
//   const env = {
//     memory,
//     writeToJs(ptr, size) {
//       const o = map[ptr];
//       o.onData(new Uint8Array(memory.buffer, dstPtr, size));
//     },
//     _abort: errno => { console.error(`Error: ${errno}`) },
//     _grow: () => { },
//   };

//   const module = await WebAssembly.compile(buff);
//   const ins = await WebAssembly.instantiate(module, { env });

//   const srcPtr = ins.exports._malloc(CHUNK_SIZE);
//   const dstPtr = ins.exports._malloc(CHUNK_SIZE);

//   class RawDef {
//     constructor() {
//       this.zstreamPtr = ins.exports._createDeflateContext(COMPRESSION_LEVEL, NO_ZLIB_HEADER);
//       map[this.zstreamPtr] = this;
//       this.offset = 0;
//       this.buff = new Uint8Array(CHUNK_SIZE);
//     }

//     deflate(chunk, flush) {
//       const src = new Uint8Array(memory.buffer, srcPtr, chunk.length);
//       src.set(chunk);
//       ins.exports._deflate(this.zstreamPtr, srcPtr, dstPtr, chunk.length, CHUNK_SIZE, flush);
//     }

//     onData(chunk) {
//       if (this.buff.length < this.offset + chunk.length) {
//         const buff = this.buff;
//         this.buff = new Uint8Array(this.buff.length * 2);
//         this.buff.set(buff);
//       }
//       this.buff.set(chunk, this.offset);
//       this.offset += chunk.length;
//     }

//     destroy() {
//       ins.exports._freeDeflateContext(this.zstreamPtr);
//       delete map[this.zstreamPtr];
//       this.buff = null;
//     }

//     getBuffer() {
//       return new Buffer(this.buff.buffer, 0, this.offset);
//     }
//   }

//   class RawInf {
//     constructor() {
//       this.zstreamPtr = ins.exports._createInflateContext(NO_ZLIB_HEADER);
//       map[this.zstreamPtr] = this;
//       this.offset = 0;
//       this.buff = new Uint8Array(CHUNK_SIZE);
//     }

//     inflate(chunk) {
//       // 从 buffer 中取内存，从 srcPtr 开始，chunk 的大小
//       const src = new Uint8Array(memory.buffer, srcPtr, chunk.length);
//       // 将 chunk 的内存复制到 src。他们两的长度是相等的
//       src.set(chunk);
//       ins.exports._inflate(this.zstreamPtr, srcPtr, dstPtr, chunk.length, CHUNK_SIZE);
//     }

//     onData(chunk) {
//       if (this.buff.length < this.offset + chunk.length) {
//         const buff = this.buff;
//         this.buff = new Uint8Array(this.buff.length * 2);
//         this.buff.set(buff);
//       }
//       this.buff.set(chunk, this.offset);
//       this.offset += chunk.length;
//     }

//     destroy() {
//       ins.exports._freeInflateContext(this.zstreamPtr);
//       delete map[this.zstreamPtr];
//       this.buff = null;
//     }

//     getBuffer() {
//       return new Buffer(this.buff.buffer, 0, this.offset);
//     }
//   }
  
//   ret = {
//     inflate(rawDeflateBuffer) {
//       const rawInf = new RawInf();
//       for (let offset = 0; offset < rawDeflateBuffer.length; offset += CHUNK_SIZE) {
//         const end = Math.min(offset + CHUNK_SIZE, rawDeflateBuffer.length);
//         const chunk = rawDeflateBuffer.subarray(offset, end);
//         rawInf.inflate(chunk);
//       }
//       const ret = rawInf.getBuffer();
//       rawInf.destroy();
//       return ret;
//     },
//     deflate(rawInflateBuffer) {
//       const rawDef = new RawDef();
//       for (let offset = 0; offset < rawInflateBuffer.length; offset += CHUNK_SIZE) {
//         const end = Math.min(offset + CHUNK_SIZE, rawInflateBuffer.length);
//         const chunk = rawInflateBuffer.subarray(offset, end);
//         rawDef.deflate(chunk, rawInflateBuffer.length <= offset + CHUNK_SIZE);
//       }
//       const ret = rawDef.getBuffer();
//       rawDef.destroy();
//       return ret;
//     },
//   }

//   return ret;
// };
// import { ZlibWasmParser } from './ZlibWasm';

// (window as any).parser = new ZlibWasmParser({
//   debug: true,
// });

console.log('sdads');