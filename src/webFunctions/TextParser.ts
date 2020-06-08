import { Buffer } from 'buffer';
import { isNative } from './util';

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

export const TextEncodeParser = isNative(window.TextEncoder) ? window.TextEncoder : CustomEncoder;
export const TextDecodeParser = isNative(window.TextDecoder) ? window.TextDecoder : CustomDecoder;
