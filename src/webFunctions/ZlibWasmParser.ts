import { Buffer } from 'buffer';
import pako from 'pako';
import zlibWasm from './zlib.wasm';
import { isNative, isWebview } from './util';
import {
  LoadState,
  ZlibWasmOptions,
  InstaceExports,
  TimeRecordLabel, 
  DeflateLevel, 
  ReturnCodes,
  Pointer,
  TimeRecordMaps,
} from './types';
import { TextDecodeParser, TextEncodeParser } from './TextParser';
import { isNULLPtr } from './util';

const DEFAULT_COMPRESSION_LEVEL = 9;
const DEFAULT_INITIAL_MEMORY_PAGES = 10;
const NO_ZLIB_HEADER = -1;

export class ZlibWasmParser {

  private memory: WebAssembly.Memory;
  private instanceExports: InstaceExports;
  // debug 用
  private pako;
  private buff;

  // 加载状态
  private loadState: LoadState;
  private debug: boolean;
  private timeMaps: TimeRecordMaps = {} as TimeRecordMaps;

  // 将 base64 字符编译为 ArrayBuffer，默认是 window.TextEncoder
  private encoder = new TextEncodeParser;
  // 将 ArrayBuffer 转化为字符，默认是 window.TextDecoder
  private decoder = new TextDecodeParser;

  private base64InputPtr: Pointer = 0;
  private base64InputByteLength: number = 0;
  private base64OutputPtr: Pointer = 0;
  private base64OutputByteLength: number = 0;
  
  private inputPtr: Pointer = 0;
  private inputByteLength: number = 0;
  private outputPtr: Pointer = 0;
  private outputByteLength: number = 0;
  

  constructor(options: ZlibWasmOptions) {
    const { debug } = options;

    this.debug = debug;

    if (debug) {
      this.pako = pako;
      this.buff = Buffer;
    }

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
        writeToJs: () => { },
        writeToJs_gzip: this.recordGzip.bind(this),
        writeToJs_base64: this.recordBase64.bind(this),
        jsLog: this.wasmLog,
        _abort: console.error,
        _grow: () => true,
      }
  
      const module = await WebAssembly.compile(Buffer.from(zlibWasm, 'base64'));
      // return;
      const instance: WebAssembly.Instance = await WebAssembly.instantiate(module, {
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
    this.base64OutputPtr = ptr;
    this.base64OutputByteLength = size;
  }

  private recordGzip(size: number) {
    this.outputByteLength = size;
  }

  private wasmLog(pos: number, value: number) {
    console.log(`[zlibwasm] ${pos} ${value}`);
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


  private timeRecord(label: TimeRecordLabel) {
    if (this.debug && label) {
      this.timeMaps[label] = window.performance.now();
    }
  }

  private timeRecordEnd(label: TimeRecordLabel) {
    if (this.debug && label && this.timeMaps[label]) {
      console.log(`[zlibwasm] time performance ${label}: ${ window.performance.now() - this.timeMaps[label] }ms`);
      this.timeMaps[label] = 0;
    }
  }

  /**
   * 释放内存
   */
  private reset() {

    if (this.base64InputPtr) {
      this.instanceExports._free(this.base64InputPtr);
      this.base64InputPtr = 0;
      this.base64InputByteLength = 0;
    }

    if (this.base64OutputPtr) {
      this.instanceExports._free(this.base64OutputPtr);
      this.base64OutputPtr = 0;
      this.base64OutputByteLength = 0;
    }
    
    if (this.inputPtr) {
      this.instanceExports._free(this.inputPtr);
      this.inputPtr = 0;
      this.inputByteLength = 0;
    }
    if (this.outputPtr) {
      this.instanceExports._free(this.outputPtr);
      this.outputPtr = 0;
      this.outputByteLength = 0;
    }
  }

  
  ungzipBase64(base64Text: string) {

    if (!this.isReady()) {
      return this.pakoUngzip(base64Text);
    }

    this.timeRecord(TimeRecordLabel.WASM_UNGZIP);
    this.reset();

    // 将text转换为 ArrayBuffer
    const textBuff = this.encoder.encode(base64Text);
    
    // 在线性内存中分配，得到数据指针的起始位置
    this.base64InputPtr = this.instanceExports._malloc(textBuff.byteLength);
    this.base64InputByteLength = textBuff.byteLength;

    // 赋值内存
    const emptyBuff = new Uint8Array(this.memory.buffer, this.base64InputPtr, this.base64InputByteLength);
    emptyBuff.set(textBuff);

    // 执行base64 解码，得到原始的二进制数据
    // 解压之后的二进制长度应该是原始长度的 3/4
    // const outPtr = this.instanceExports._base64_decode(this.base64Ptr, textBuff.byteLength, textBuff.byteLength * (3 / 4));
    this.base64OutputByteLength = textBuff.byteLength * 3 / 4;
    this.base64OutputPtr = this.instanceExports._malloc(this.base64OutputByteLength);
    const decodeRet = this.instanceExports._base64_decode2(this.base64InputPtr, this.base64InputByteLength, this.base64OutputPtr, this.base64OutputByteLength);
    console.log('[zlibwasm] decodeRet', decodeRet);

    // 解码失败，走 Buffer的解码
    if (decodeRet) {
      const base64DecodeBuff = Buffer.from(base64Text, 'base64');
      this.inputByteLength = base64DecodeBuff.byteLength;
      this.inputPtr = this.instanceExports._malloc(this.inputByteLength);
      new Uint8Array(this.memory.buffer, this.inputPtr, this.inputByteLength).set(base64DecodeBuff);
    } else {
      this.inputPtr = this.base64OutputPtr;
      // 值和 inputPtr 一致，防止在 reset 函数中重复 _free 报错 unreachable
      this.base64OutputPtr = 0;
      this.inputByteLength = this.base64OutputByteLength;
    }

    // 默认传入最大内存
    this.outputByteLength = this.memory.buffer.byteLength;
    this.outputPtr = this.instanceExports._malloc(this.outputByteLength);

    if (isNULLPtr(this.inputPtr) || isNULLPtr(this.outputPtr)) {
      return this.pakoUngzip(base64Text);
    }

    // 开始解压
    const ret = this.instanceExports._uncompress_gzip(
      this.inputPtr,
      this.inputByteLength,
      this.outputPtr,
      this.outputByteLength,
    );

    if (ret !== ReturnCodes.Z_OK) {
      console.warn(`[zlibwasm] wasm ungzip fail with code ${ret}, using pako instead`);
      return this.pakoUngzip(base64Text);
    }

    const outputBuff = this.memory.buffer.slice(this.outputPtr, this.outputPtr + this.outputByteLength);
    const outputText = this.decoder.decode(outputBuff);
    this.timeRecordEnd(TimeRecordLabel.WASM_UNGZIP);
    return outputText;
  }

  pakoUngzip(base64Text: string): string {
    this.timeRecord(TimeRecordLabel.PAKO_UNGZIP);
    const ret = pako.ungzip(Buffer.from(base64Text, 'base64'), { to: 'string' });
    this.timeRecordEnd(TimeRecordLabel.PAKO_UNGZIP);
    return ret;
  }

  gzip(text: string, level: DeflateLevel = DEFAULT_COMPRESSION_LEVEL): string {
    if (!this.isReady()) {
      return this.pakoGzip(text, level);
    }

    this.timeRecord(TimeRecordLabel.WASM_GZIP);
    this.reset();

    // 将text转换为 ArrayBuffer
    const textBuff = this.encoder.encode(text);
    
    // 在线性内存中分配，得到数据指针的起始位置
    this.inputPtr = this.instanceExports._malloc(textBuff.byteLength);

    this.inputByteLength = textBuff.byteLength;

    // 赋值内存
    const emptyBuff = new Uint8Array(this.memory.buffer, this.inputPtr, textBuff.byteLength);
    emptyBuff.set(textBuff);

    // 计算压缩之后的最大可能大小
    // 经过网友测试，在 best_compress(9) 的模式下，由随机字符构成的原串，压缩输出串有可能比原串长度大
    // 由随机字符构成的原串，长度在 0-40k 情况下，output_buffer_size / compressBound() * 100 最大为 133.33（best_compress 和 best_speed 下此值一样）
    // 为保证输出缓冲区足够大，缓冲区大小设置为 compressBound() * 2
    this.outputByteLength = this.instanceExports._compress_bound(this.inputByteLength) * 2;
    this.outputPtr = this.instanceExports._malloc(this.outputByteLength);

    if (isNULLPtr(this.inputPtr) || isNULLPtr(this.outputPtr)) {
      this.timeRecordEnd(TimeRecordLabel.WASM_GZIP);
      return this.pakoGzip(text, level);
    }

    // 开始执行压缩
    const ret = this.instanceExports._compress_gzip(
      this.inputPtr,
      this.inputByteLength,
      this.outputPtr,
      this.outputByteLength,
      level,
    );

    if (ret !== ReturnCodes.Z_OK) {
      console.warn(`[zlibwasm] wasm gzip fail with code ${ret}, using pako instead`);
      return this.pakoGzip(text);
    }

    // 将压缩之后的 ArrayBuff 转换为 base64 字符
    this.instanceExports._base64_encode(this.outputPtr, this.outputByteLength, this.outputByteLength * 4 / 3);
    const outputBuff = this.memory.buffer.slice(this.base64OutputPtr, this.base64OutputPtr + this.base64OutputByteLength);
    const outputText = this.decoder.decode(outputBuff);

    this.timeRecordEnd(TimeRecordLabel.WASM_GZIP);
    return outputText;
  }

  pakoGzip(text: string, level: DeflateLevel = DEFAULT_COMPRESSION_LEVEL): string {
    this.timeRecord(TimeRecordLabel.PAKO_GZIP);
    const ret = Buffer.from(pako.gzip(text, { level })).toString('base64');
    this.timeRecordEnd(TimeRecordLabel.PAKO_GZIP);
    return ret;
  }

  isReady() {
    return this.loadState === LoadState.READY;
  }

  /**
   * 判断兼容性
   */
  static isSupportWasm(): boolean {
    return isWebview() && window.WebAssembly && isNative(window.WebAssembly.compile);
  }

}




