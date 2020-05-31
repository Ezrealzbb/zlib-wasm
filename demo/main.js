import wasm from "./zlib-sample.wasm";
import { Buffer } from 'buffer';
import pako from 'pako';

window.Buffer = Buffer;

window.pokoGzip = {
  ungzip(gzipBase64Str) {
    return pako.ungzip(Buffer.from(gzipBase64Str, 'base64'), { to: 'string' });
  },
  gzip(data) {
    return Buffer.from(pako.gzip(data, { level: 9 })).toString('base64');
  }
}

async function main() {
  // window.gzip = await createInstance();
  // const wasm = await import('zlib-sample.wasm');
  console.log(wasm.length);
  console.log('dasdas');
  const gzip = await initialize(Buffer.from(wasm, 'base64'));
  window.gzip = gzip;
  window.wasmGzip = {
    ungzip(gzipBase64Str) {
      return Buffer.from(gzip.inflate(Buffer.from(gzipBase64Str, 'base64'))).toString();
    },
    gzip(str) {
      return Buffer.from(gzip.deflate(Buffer.from(str))).toString('base64');
    }
  }
  window.printBuff = function (buff) {
    let string = '';
    for (let i = 0; i < buff.length; i++) {
      string += String.fromCharCode(buff[i]);
    }
    console.log(string);
  }

  window.toBase64Buff = function (buff) {
    return Buffer.from(buff).toString('base64');
  }

  // test();
  window.uncompress = uncompress;
  window.uncompressBase64 = uncompressBase64;
  window.test = test;
  test(1);
}

main();

function test(time) {
  // var testString = 'abcdefghjklmnopqrsuvwxyz1234567890~!@#$%^&*()_+';
  // testCore('poko zip', 100, () => {
  //     window.pokoResult = window.pokoGzip.gzip(testString);
  // });

  // testCore('wasm zip', 100, () => {
  //     window.wasmResult = window.wasmGzip.gzip(testString);
  // });

  var testUnzipString = window.clientVars;
  // var testUnzipString = "H4sIAAAAAAAEAEtMSk5JTUvPyMrOyc3LLygsKi4tK6+orDI0MjYxNTO3sDSoU3RQVlGNU9PS0IzXBgB1ODe0LwAAAA==";

  testCore('wasm unzip', time, () => {
    window.wasmResult = uncompress(testUnzipString);
  });

  testCore('poko unzip', time, () => {
    window.pokoResult = window.pokoGzip.ungzip(testUnzipString);
  });

  // testCore('wasm unzip', 100, () => {
  //   window.wasmResult = window.wasmGzip.ungzip(testUnzipString);
  // });

  

  // var zipBuff = window.gzip.deflate(Buffer.from(test));
  // window.printBuff(zipBuff);
  // var zipBase64 = toBase64Buff(zipBuff);
  // var unzipBuff = window.gzip.inflate(zipBuff);

}

function testCore(label, times, fn) {
  console.time(label);
  for (let i = 0; i < times; i++) {
    fn();
  }
  console.timeEnd(label);
}

window.decoder = new TextDecoder('utf-8');

function uncompressBase64(ungzipBase64Str) {
  var start = window.zlib._malloc(ungzipBase64Str.length);
  var buff = new Uint8Array(window.gzipMemory.buffer,  start, ungzipBase64Str.length);
  buff.set(new TextEncoder().encode(ungzipBase64Str));
  window.uncompressRet = window.zlib.uncompress_base64(start, ungzipBase64Str.length, window.dstPtr,window.gzipMemory.buffer.byteLength);
  // 表示解压成功
  if (window.uncompressRet === 0) {
    
    // window.uncompressRet = Buffer.from(window.gzipMemory.buffer, window.dstPtr, window.size).toString();
    window.uncompressBuff = window.gzipMemory.buffer.slice(window.dstPtr, window.dstPtr + window.size);
    window.uncompressRet = window.decoder.decode(window.uncompressBuff);
    return window.uncompressRet;
  }
  return window.uncompressRet;
}

function uncompress(ungzipBase64Str) {
  // console.log(1, performance.now());
  var start = window.zlib._malloc(ungzipBase64Str.length);
  // console.log(2, performance.now());
  var buff = new Uint8Array(window.gzipMemory.buffer,  start, ungzipBase64Str.length);
  // console.log(3, performance.now());
  // var startBuff = window.gzipMemory.buffer.slice(start, start + )
  // var x = Buffer.from(ungzipBase64Str, 'base64');
  // var buff = new Uint8Array(window.gzipMemory.buffer, window.srcPtr, x.length);
  // buff.set(Uint8Array.from(ungzipBase64Str, s => s.charCodeAt()));
  buff.set(new TextEncoder().encode(ungzipBase64Str));
  // console.log(4, performance.now());
  window.zlib._base64_decode(start, ungzipBase64Str.length, ungzipBase64Str.length);
  // console.log(5, performance.now());
  // window.zlib.example(window.srcPtr, x.length, window.dstPtr, x.length);
  // window.uncompressRet = window.zlib.example(window.srcPtr, x.length, window.dstPtr, 1024 * 1024);
  window.uncompressRet = window.zlib.example(window.base64Ptr, window.base64Size, window.dstPtr, 1024 * 1024);
  // console.log(6, performance.now());
  // 表示解压成功
  if (window.uncompressRet === 0) {
    
    // window.uncompressRet = Buffer.from(window.gzipMemory.buffer, window.dstPtr, window.size).toString();
    window.uncompressBuff = window.gzipMemory.buffer.slice(window.dstPtr, window.dstPtr + window.size);
    window.uncompressRet = window.decoder.decode(window.uncompressBuff);
    return window.uncompressRet;
  }
  return window.uncompressRet;
  // if(window.uncompressRet === 0) {
  //   return 
  // }

//   console.time('slice');
// var a = window.gzipMemory.buffer.slice(window.dstPtr, window.dstPtr + 1024 * 1024);
// var b = Buffer.from(a).toString();
// console.timeEnd('slice');

// console.time('from');
// var y = Buffer.from(window.gzipMemory.buffer, window.dstPtr, 1024 * 1024).toString();
// console.timeEnd('from');

// JSON.parse(b);
}


async function initialize(buff) {

  if (window.gzip) return window.gzip;

  const COMPRESSION_LEVEL = 9;
  const NO_ZLIB_HEADER = -1;
  const CHUNK_SIZE = 32 * 1024;
  const map = {};
  const memory = new WebAssembly.Memory({
    // initial: 1000,
    initial: 1,
    // maximum: 64 * 1024, // 64MB
  });
  window.gzipMemory = memory;
  const env = {
    memory,
    // writeToJs(ptr, size) {
    //   const o = map[ptr];
    //   o.onData(new Uint8Array(memory.buffer, dstPtr, size));
    // },
    writeToJs(ptr, size) {
      // const buff = memory.buffer.slice(ptr, ptr + size);
      // window.ret = Buffer.from(buff).toString();
      // window.onResult && window.onResult(window.ret);
      window.base64Ptr = ptr;
      window.base64Size = size;
    },
    writeToJs2(size) {
      window.size = size;
    },
    jsLog: console.log,
    _abort: errno => {
      console.error(`Error: ${errno}`)
    },
    _grow: () => { },
  };

  const module = await WebAssembly.compile(buff);
  const ins = await WebAssembly.instantiate(module, {
    env
  });

  window.zlib = ins.exports;

  const srcPtr = ins.exports._malloc(CHUNK_SIZE * 2);
  const dstPtr = ins.exports._malloc(CHUNK_SIZE * 100);
  window.srcPtr = srcPtr;
  window.dstPtr = dstPtr;

  class RawDef {
    constructor() {
      this.zstreamPtr = ins.exports._createDeflateContext(COMPRESSION_LEVEL, NO_ZLIB_HEADER);
      map[this.zstreamPtr] = this;
      this.offset = 0;
      this.buff = new Uint8Array(CHUNK_SIZE);
    }

    deflate(chunk, flush) {
      const src = new Uint8Array(memory.buffer, srcPtr, chunk.length);
      src.set(chunk);
      ins.exports._deflate(this.zstreamPtr, srcPtr, dstPtr, chunk.length, CHUNK_SIZE, flush);
    }

    onData(chunk) {
      if (this.buff.length < this.offset + chunk.length) {
        const buff = this.buff;
        this.buff = new Uint8Array(this.buff.length * 2);
        this.buff.set(buff);
      }
      this.buff.set(chunk, this.offset);
      this.offset += chunk.length;
    }

    destroy() {
      ins.exports._freeDeflateContext(this.zstreamPtr);
      delete map[this.zstreamPtr];
      this.buff = null;
    }

    getBuffer() {
      return new Buffer(this.buff.buffer, 0, this.offset);
    }
  }

  class RawInf {
    constructor() {
      this.zstreamPtr = ins.exports._createInflateContext(NO_ZLIB_HEADER);
      map[this.zstreamPtr] = this;
      this.offset = 0;
      this.buff = new Uint8Array(CHUNK_SIZE);
    }

    inflate(chunk) {
      const src = new Uint8Array(memory.buffer, srcPtr, chunk.length);
      src.set(chunk);
      ins.exports._inflate(this.zstreamPtr, srcPtr, dstPtr, chunk.length, CHUNK_SIZE);
    }

    onData(chunk) {
      if (this.buff.length < this.offset + chunk.length) {
        const buff = this.buff;
        this.buff = new Uint8Array(this.buff.length * 2);
        this.buff.set(buff);
      }
      this.buff.set(chunk, this.offset);
      this.offset += chunk.length;
    }

    destroy() {
      ins.exports._freeInflateContext(this.zstreamPtr);
      delete map[this.zstreamPtr];
      this.buff = null;
    }

    getBuffer() {
      return new Buffer(this.buff.buffer, 0, this.offset);
    }
  }

  const ret = {
    inflate(rawDeflateBuffer) {
      const rawInf = new RawInf();
      for (let offset = 0; offset < rawDeflateBuffer.length; offset += CHUNK_SIZE) {
        const end = Math.min(offset + CHUNK_SIZE, rawDeflateBuffer.length);
        const chunk = rawDeflateBuffer.subarray(offset, end);
        rawInf.inflate(chunk);
      }
      const ret = rawInf.getBuffer();
      rawInf.destroy();
      return ret;
    },
    deflate(rawInflateBuffer) {
      const rawDef = new RawDef();
      for (let offset = 0; offset < rawInflateBuffer.length; offset += CHUNK_SIZE) {
        const end = Math.min(offset + CHUNK_SIZE, rawInflateBuffer.length);
        const chunk = rawInflateBuffer.subarray(offset, end);
        rawDef.deflate(chunk, rawInflateBuffer.length <= offset + CHUNK_SIZE);
      }
      const ret = rawDef.getBuffer();
      rawDef.destroy();
      return ret;
    },
  }

  return ret;
};




