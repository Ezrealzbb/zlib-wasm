import { Buffer } from 'buffer';
import zlibWasm from './zlib.wasm';
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
      this.memory = new  WebAssembly.Memory({
        // 以页(64k) 为单位 
        initial: DEFAULT_INITIAL_MEMORY_PAGES,
      });
  
      const importEnv = {
        memory: this.memory,
        writeToJs_uncompress: this.recordUncompress,
        writeToJs_base64: this.recordBase64,
        jsLog: this.wasmLog,
      }
  
      const module = await WebAssembly.compile(zlibWasm);
      const instance = await WebAssembly.instantiate(module, {
        env: importEnv,
      });

      const enable = this.checkEnable(instance);

      if (enable) {
        this.loadState = LoadState.READY;
        this.instanceExports = instance.exports as InstaceExports;
      } else {

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

  
  ungzipBase64() {

  }
  

  
  /**
   * 判断兼容性
   */
  static isSupportWasm(): boolean {
    return isNative(window.WebAssembly);
  }

}




