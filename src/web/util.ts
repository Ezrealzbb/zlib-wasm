
/**
 * 判断是否是空指针，如果是空指针，则说明内存分配失败
 * @param ptr 指针
 */
export function isNULLPtr(ptr: number): boolean {
  return ptr === 0;
}

/**
 *  判断是否是原生方法
 * @param Ctor Webassembly & TextEncoder
 */
export function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

/**
 * 在worker 或 node 环境中不支持
 */
export function isWebview(): boolean {
  return typeof window === 'object';
}

/**
 * 获取比 x 大的且能被 y 整除的最小数
 * @param x 被除数
 * @param y 除数
 */
export function getMinDivisionNumber(x: number, y: number) {
  const reset = x % y;
  return reset ? x + y - reset : x;
}

export const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

export function base64clean(str: string): string {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

/**
 *
 * @param str input string
 * @param heap arrayBuffer
 * @param outIdx start point
 * @param maxBytesToWrite memory to write
 */
export function stringToUTF8Array(str: string, heap: ArrayBuffer, outIdx: number, maxBytesToWrite: number) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = 65536 + ((u & 1023) << 10) | u1 & 1023
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | u >> 6;
      heap[outIdx++] = 128 | u & 63
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | u >> 12;
      heap[outIdx++] = 128 | u >> 6 & 63;
      heap[outIdx++] = 128 | u & 63
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | u >> 18;
      heap[outIdx++] = 128 | u >> 12 & 63;
      heap[outIdx++] = 128 | u >> 6 & 63;
      heap[outIdx++] = 128 | u & 63
    }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx
}

export function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead, decoder) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && decoder) {
    return decoder.decode(heapOrArray.subarray(idx, endPtr))
  }
  var str = '';
  while (idx < endPtr) {
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode((u0 & 31) << 6 | u1);
      continue
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = (u0 & 15) << 12 | u1 << 6 | u2
    } else {
      u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0)
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
    }
  }
  return str
}

export function writeUint8Byte(targetBuffer: Uint8Array, sourceBuffer: Uint8Array, start: number) {
  for (let i = 0, len = sourceBuffer.length; i < len; i++) {
    targetBuffer[start + i] = sourceBuffer[i];
  }
}

export function writeNumberToByte(number: number, uint8Array: Uint8Array, offset: number) {
  for (let i = 0; i < 4; i++) {
    uint8Array[offset + i] = (number >> (i * 8)) & 0xFF;
  }
}

export function isNativeTextToBufferEnable() {
  return isWebview() && isNative(window.TextEncoder);
}

export function isNativeBufferToTextEnable() {
  return isWebview() && isNative(window.TextDecoder);
}
