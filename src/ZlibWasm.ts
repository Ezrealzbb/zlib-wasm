import { Buffer } from 'buffer';
import zlibwasm from './zlib.wasm';
import { isNative } from 'lodash-es';
import { LoadState, ZlibWasmOptions } from './types';
import { TextDecodeParser, TextEncodeParser } from './TextParser';

const DEFAULT_COMPRESSION_LEVEL = 9;
const DEFAULT_INITIAL_MEMORY_PAGES = 10;
const NO_ZLIB_HEADER = -1;

export class ZlibWasmParser {

  private memory: WebAssembly.Memory;

  // 加载状态
  private loadState: LoadState;
  private debug: boolean;

  // 将 base64 字符编译为 ArrayBuffer
  private encoder: TextEncoder = new TextEncodeParser;
  // 将 ArrayBuffer 转化为字符
  private decoder: TextDecoder = new TextDecodeParser;

  private base64Ptr: number;
  private base64ByteLength: number;
  
  private compressPtr: number;
  private compressByteLength: number;
  
  private uncompressPtr: number;
  private uncompressByteLength: number; 
  

  constructor(options: ZlibWasmOptions) {
    const { debug } = options;

    this.debug = debug;

    if (ZlibWasmParser.isSupportWasm()) {
      this.loadState = LoadState.LOADING;
      
      this.load();
    } else {
      console.warn('[zlibwasm] wasm not support');
      this.loadState = LoadState.NOT_SUPPORT;
    }
  }

  private async load() {
    this.memory = new  WebAssembly.Memory({
      // 以页(64k) 为单位 
      initial: DEFAULT_INITIAL_MEMORY_PAGES,
    });

    const importEnv = {
      memory,
      writeToJs_base64
    }
    
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




