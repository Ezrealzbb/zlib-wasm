var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Buffer } from 'buffer';
import pako from 'pako';
import zlibWasm from './zlib.wasm';
import { isNative } from 'lodash-es';
import { LoadState, TimeRecordLabel, ReturnCodes, } from './types';
import { TextDecodeParser, TextEncodeParser } from './TextParser';
import { isNULLPtr } from './util';
var DEFAULT_COMPRESSION_LEVEL = 9;
var DEFAULT_INITIAL_MEMORY_PAGES = 10;
var NO_ZLIB_HEADER = -1;
var ZlibWasmParser = /** @class */ (function () {
    function ZlibWasmParser(options) {
        this.timeMaps = {};
        // 将 base64 字符编译为 ArrayBuffer，默认是 window.TextEncoder
        this.encoder = new TextEncodeParser;
        // 将 ArrayBuffer 转化为字符，默认是 window.TextDecoder
        this.decoder = new TextDecodeParser;
        this.base64Ptr = 0;
        this.base64ByteLength = 0;
        this.inputPtr = 0;
        this.inputByteLength = 0;
        this.outputPtr = 0;
        this.outputByteLength = 0;
        var debug = options.debug;
        this.debug = debug;
        if (debug) {
            this.pako = pako;
            this.buff = Buffer;
        }
        if (ZlibWasmParser.isSupportWasm()) {
            this.loadState = LoadState.LOADING;
            this.init();
        }
        else {
            console.warn('[zlibwasm] wasm not support');
            this.loadState = LoadState.NOT_SUPPORT;
        }
    }
    ZlibWasmParser.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var importEnv, module_1, instance, enable, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        this.memory = new WebAssembly.Memory({
                            // 以页(64k) 为单位 
                            initial: DEFAULT_INITIAL_MEMORY_PAGES,
                        });
                        importEnv = {
                            memory: this.memory,
                            writeToJs: function () { },
                            writeToJs_gzip: this.recordGzip.bind(this),
                            writeToJs_base64: this.recordBase64.bind(this),
                            jsLog: this.wasmLog,
                            _abort: console.error,
                            _grow: function () { return true; },
                        };
                        return [4 /*yield*/, WebAssembly.compile(Buffer.from(zlibWasm, 'base64'))];
                    case 1:
                        module_1 = _a.sent();
                        return [4 /*yield*/, WebAssembly.instantiate(module_1, {
                                env: importEnv,
                            })];
                    case 2:
                        instance = _a.sent();
                        enable = this.checkEnable(instance);
                        if (enable) {
                            this.loadState = LoadState.READY;
                            this.instanceExports = instance.exports;
                        }
                        else {
                            this.loadState = LoadState.ERROR;
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        ex_1 = _a.sent();
                        console.error(ex_1);
                        this.loadState = LoadState.ERROR;
                        return [3 /*break*/, 5];
                    case 4:
                        this.reset();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ZlibWasmParser.prototype.recordBase64 = function (ptr, size) {
        this.base64Ptr = ptr;
        this.base64ByteLength = size;
    };
    ZlibWasmParser.prototype.recordGzip = function (size) {
        this.outputByteLength = size;
    };
    ZlibWasmParser.prototype.wasmLog = function (pos, value) {
        console.log("[zlibwasm] " + pos + " " + value);
    };
    /**
     *
     * @param instance 校验 Webassembly compile 结果
     */
    ZlibWasmParser.prototype.checkEnable = function (instance) {
        if (!instance || !instance.exports) {
            return false;
        }
        // todo: 增加导出函数的 isNative 检测
        return true;
    };
    ZlibWasmParser.prototype.timeRecord = function (label) {
        if (this.debug && label) {
            this.timeMaps[label] = window.performance.now();
        }
    };
    ZlibWasmParser.prototype.timeRecordEnd = function (label) {
        if (this.debug && label && this.timeMaps[label]) {
            console.log("[zlibwasm] time performance " + label + ": " + (window.performance.now() - this.timeMaps[label]) + "ms");
            this.timeMaps[label] = 0;
        }
    };
    /**
     * 释放内存
     */
    ZlibWasmParser.prototype.reset = function () {
        if (this.inputPtr) {
            this.instanceExports._free(this.inputPtr);
            this.inputPtr = 0;
        }
        if (this.outputPtr) {
            this.instanceExports._free(this.outputPtr);
            this.outputPtr = 0;
        }
        this.inputByteLength = 0;
        this.outputByteLength = 0;
        this.inputPtr = 0;
        this.outputPtr = 0;
    };
    ZlibWasmParser.prototype.ungzipBase64 = function (base64Text) {
        if (!this.isReady()) {
            return this.pakoUngzip(base64Text);
        }
        this.timeRecord(TimeRecordLabel.WASM_UNGZIP);
        this.reset();
        // 将text转换为 ArrayBuffer
        var textBuff = this.encoder.encode(base64Text);
        // 在线性内存中分配，得到数据指针的起始位置
        this.base64Ptr = this.instanceExports._malloc(textBuff.byteLength);
        // 赋值内存
        var emptyBuff = new Uint8Array(this.memory.buffer, this.base64Ptr, textBuff.byteLength);
        emptyBuff.set(textBuff);
        // 执行base64 解码，得到原始的二进制数据
        // 解压之后的二进制长度应该是原始长度的 3/4
        var outPtr = this.instanceExports._base64_decode(this.base64Ptr, textBuff.byteLength, textBuff.byteLength * (3 / 4));
        var base64DecodeBuff;
        // 解码失败，走 Buffer的解码
        if (!outPtr) {
            base64DecodeBuff = Buffer.from(base64Text, 'base64');
            this.inputByteLength = base64DecodeBuff.byteLength;
            this.inputPtr = this.instanceExports._malloc(this.inputByteLength);
        }
        else {
            this.inputPtr = outPtr;
            this.inputByteLength = this.base64ByteLength;
        }
        // 默认传入最大内存
        this.outputByteLength = this.memory.buffer.byteLength;
        this.outputPtr = this.instanceExports._malloc(this.outputByteLength);
        if (isNULLPtr(this.inputPtr) || isNULLPtr(this.outputPtr)) {
            return this.pakoUngzip(base64Text);
        }
        // 开始解压
        var ret = this.instanceExports._uncompress_gzip(this.inputPtr, this.inputByteLength, this.outputPtr, this.outputByteLength);
        if (ret !== ReturnCodes.Z_OK) {
            console.warn("[zlibwasm] wasm ungzip fail with code " + ret + ", using pako instead");
            return this.pakoUngzip(base64Text);
        }
        var outputBuff = this.memory.buffer.slice(this.outputPtr, this.outputPtr + this.outputByteLength);
        var outputText = this.decoder.decode(outputBuff);
        this.timeRecordEnd(TimeRecordLabel.WASM_UNGZIP);
        return outputText;
    };
    ZlibWasmParser.prototype.pakoUngzip = function (base64Text) {
        this.timeRecord(TimeRecordLabel.PAKO_UNGZIP);
        var ret = pako.ungzip(Buffer.from(base64Text, 'base64'), { to: 'string' });
        this.timeRecordEnd(TimeRecordLabel.PAKO_UNGZIP);
        return ret;
    };
    ZlibWasmParser.prototype.gzip = function (text, level) {
        if (level === void 0) { level = DEFAULT_COMPRESSION_LEVEL; }
        if (!this.isReady()) {
            return this.pakoGzip(text, level);
        }
        this.timeRecord(TimeRecordLabel.WASM_GZIP);
        this.reset();
        // 将text转换为 ArrayBuffer
        var textBuff = this.encoder.encode(text);
        // 在线性内存中分配，得到数据指针的起始位置
        this.inputPtr = this.instanceExports._malloc(textBuff.byteLength);
        this.inputByteLength = textBuff.byteLength;
        // 赋值内存
        var emptyBuff = new Uint8Array(this.memory.buffer, this.inputPtr, textBuff.byteLength);
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
        var ret = this.instanceExports._compress_gzip(this.inputPtr, this.inputByteLength, this.outputPtr, this.outputByteLength, level);
        if (ret !== ReturnCodes.Z_OK) {
            console.warn("[zlibwasm] wasm gzip fail with code " + ret + ", using pako instead");
            return this.pakoGzip(text);
        }
        // 将压缩之后的 ArrayBuff 转换为 base64 字符
        this.instanceExports._base64_encode(this.outputPtr, this.outputByteLength, this.outputByteLength * 4 / 3);
        var outputBuff = this.memory.buffer.slice(this.base64Ptr, this.base64Ptr + this.base64ByteLength);
        var outputText = this.decoder.decode(outputBuff);
        this.timeRecordEnd(TimeRecordLabel.WASM_GZIP);
        return outputText;
    };
    ZlibWasmParser.prototype.pakoGzip = function (text, level) {
        if (level === void 0) { level = DEFAULT_COMPRESSION_LEVEL; }
        this.timeRecord(TimeRecordLabel.PAKO_GZIP);
        var ret = Buffer.from(pako.gzip(text, { level: level })).toString('base64');
        this.timeRecordEnd(TimeRecordLabel.PAKO_GZIP);
        return ret;
    };
    ZlibWasmParser.prototype.isReady = function () {
        return this.loadState === LoadState.READY;
    };
    /**
     * 判断兼容性
     */
    ZlibWasmParser.isSupportWasm = function () {
        return window.WebAssembly && isNative(window.WebAssembly.compile);
    };
    return ZlibWasmParser;
}());
export { ZlibWasmParser };
//# sourceMappingURL=ZlibWasmParser.js.map