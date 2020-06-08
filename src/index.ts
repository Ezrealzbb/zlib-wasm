import { ZlibWasmParser } from './webFunctions/index';

export * from './webFunctions/types';

export const zlib = new ZlibWasmParser({ debug: true });