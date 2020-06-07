import { ZlibWasmParser } from './webFunctions/ZlibWasmParser';

(window as any).zlib = new ZlibWasmParser({ debug: true });