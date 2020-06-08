import { ZlibWasmParser } from '../src/index';

(window as any) .zlib = new ZlibWasmParser({ debug: true });