/// <reference types="node" />
declare class CustomEncoder {
    encode(text: string): Buffer;
}
declare class CustomDecoder {
    decode(textBuff: ArrayBuffer): string;
}
export declare const TextEncodeParser: ({
    new (): TextEncoder;
    prototype: TextEncoder;
} & ((...args: any[]) => any)) | typeof CustomEncoder;
export declare const TextDecodeParser: ({
    new (label?: string, options?: TextDecoderOptions): TextDecoder;
    prototype: TextDecoder;
} & ((...args: any[]) => any)) | typeof CustomDecoder;
export {};
