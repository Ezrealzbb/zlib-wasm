import { Buffer } from 'buffer';
// import zlibWasm from './zlib.wasm';
import { isNative } from 'lodash-es';
import { LoadState, ZlibWasmOptions, InstaceExports } from './types';
import { TextDecodeParser, TextEncodeParser } from './TextParser';

const DEFAULT_COMPRESSION_LEVEL = 9;
const DEFAULT_INITIAL_MEMORY_PAGES = 10;
const NO_ZLIB_HEADER = -1;

export class ZlibWasmParser {

  private memory: WebAssembly.Memory;
  private instanceExports: InstaceExports;

  // 加载状态
  private loadState: LoadState;
  private debug: boolean;

  // 将 base64 字符编译为 ArrayBuffer，默认是 window.TextEncoder
  private encoder = new TextEncodeParser;
  // 将 ArrayBuffer 转化为字符，默认是 window.TextDecoder
  private decoder = new TextDecodeParser;

  private base64Ptr: number = 0;
  private base64ByteLength: number = 0;
  
  private inputPtr: number = 0;
  private inputByteLength: number = 0;
  private outputPtr: number = 0;
  private outputByteLength: number = 0;
  

  constructor(options: ZlibWasmOptions) {
    const { debug } = options;

    this.debug = debug;

    if (ZlibWasmParser.isSupportWasm()) {
      this.loadState = LoadState.LOADING;
      this.init();
    } else {
      console.warn('[zlibwasm] wasm not support');
      this.loadState = LoadState.NOT_SUPPORT;
    }
  }

  private async init() {

    try {
      this.memory = new WebAssembly.Memory({
        // 以页(64k) 为单位 
        initial: DEFAULT_INITIAL_MEMORY_PAGES,
      });
  
      const importEnv = {
        memory: this.memory,
        writeToJs_uncompress: this.recordUncompress,
        writeToJs_base64: this.recordBase64,
        jsLog: this.wasmLog,
      }
  
      // const zlibWasm = await import('./zlib.wasm');
      const zlibWasm = await import('./zlib.wasm');
      // @ts-ignore
      // const module = await WebAssembly.compile(zlibWasm);
      const instance: WebAssembly.Instance = await WebAssembly.instantiate(zlibWasm, {
        env: importEnv,
      });

      const enable = this.checkEnable(instance);

      if (enable) {
        this.loadState = LoadState.READY;
        this.instanceExports = instance.exports as InstaceExports;
      } else {
        this.loadState = LoadState.ERROR;
      }

    } catch (ex) {
      console.error(ex);
      this.loadState = LoadState.ERROR;
    } finally {
      this.reset()
    }
    
  }

  private recordBase64(ptr: number, size: number) {
    this.base64Ptr = ptr;
    this.base64ByteLength = size;
  }

  private recordUncompress(size: number) {
    this.outputByteLength = size;
  }

  private wasmLog(pos: number, value: number) {
    console.log(`[ZlibWasm] ${pos} ${value}`);
  }

  /**
   * 
   * @param instance 校验 Webassembly compile 结果
   */
  private checkEnable(instance: WebAssembly.Instance | null): boolean {
    if (!instance || !instance.exports) {
      return false;
    }
    // todo: 增加导出函数的 isNative 检测
    return true;
  }

  /**
   * 释放内存
   */
  private reset() {
    if (this.inputPtr) {
      this.instanceExports._free(this.inputPtr);
    }
    if (this.outputPtr) {
      this.instanceExports._free(this.outputPtr);
    }
    this.inputByteLength = 0;
    this.outputByteLength = 0;
    this.inputPtr = 0;
    this.outputPtr = 0;
  }

  
  ungzipBase64(base64Text: string) {
    // 将text转换为 ArrayBuffer
    const textBuff = this.encoder.encode(base64Text);
    
    // 在线性内存中分配，得到数据指针的起始位置
    this.base64Ptr = this.instanceExports._malloc(textBuff.byteLength);

    // 赋值内存
    const emptyBuff = new Uint8Array(this.memory.buffer, this.base64Ptr, textBuff.byteLength);
    emptyBuff.set(textBuff);

    // 执行base64 解码，得到原始的二进制数据
    // 解压之后的二进制长度应该是原始长度的 3/4
    const outPtr = this.instanceExports._base64_decode(this.base64Ptr, textBuff.byteLength, textBuff.byteLength * (3 / 4));

    let base64DecodeBuff;

    // 解码失败，走 Buffer的解码
    if (!outPtr) {
      base64DecodeBuff = Buffer.from(base64Text, 'base64');
      this.inputByteLength = base64DecodeBuff.byteLength;
      this.inputPtr = this.instanceExports._malloc(this.inputByteLength);
    } else {
      this.inputPtr = outPtr;
      this.inputByteLength = this.base64ByteLength;
    }

    // 默认传入最大内存
    this.outputByteLength = this.instanceExports._compress_bounds(this.inputByteLength);
    this.outputPtr = this.instanceExports._malloc(this.outputByteLength);
    

    // 开始解压
    const ret = this.instanceExports._uncompress_gzip(
      this.inputPtr,
      this.inputByteLength,
      this.outputPtr,
      this.outputByteLength,
    );

    if (ret != 0) {
      console.warn(`[ZlibWasm] wasm ungzip fail with code ${ret}, using pako instead`);
      this.reset();
      return this.pakoUngzip(base64Text);
    }

    const outputBuff = this.memory.buffer.slice(this.outputPtr, this.outputByteLength);
    const outputText = this.decoder.decode(outputBuff);
    return outputText;
  }

  pakoUngzip(base64Text: string) {
    
  }

  isReady() {
    return this.loadState === LoadState.READY;
  }
  

  
  /**
   * 判断兼容性
   */
  static isSupportWasm(): boolean {
    return isNative(window.WebAssembly);
  }

}




