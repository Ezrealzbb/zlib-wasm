import { Buffer } from 'buffer';
import { isNative, isWebview } from './util';

class CustomEncoder {
    encode(text: string) {
        return Buffer.from(text);
    }
}

class CustomDecoder {
    decode(textBuff: ArrayBuffer) {
        return Buffer.from(textBuff).toString();
    }
}

// 在 worker 中不会有 window, TextEncoder 和 TextDecoder 都不支持在 worker 中调用
export const TextEncodeParser = isWebview() && isNative(window.TextEncoder) ? window.TextEncoder : CustomEncoder;
export const TextDecodeParser = isWebview() && isNative(window.TextDecoder) ? window.TextDecoder : CustomDecoder;
