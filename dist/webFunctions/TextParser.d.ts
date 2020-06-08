/// <reference types="node" />
declare class CustomEncoder {
    encode(text: string): Buffer;
}
declare class CustomDecoder {
    decode(textBuff: ArrayBuffer): string;
}
export declare const TextEncodeParser: typeof CustomEncoder | ({
    new (): TextEncoder;
    prototype: TextEncoder;
} & ((...args: any[]) => any));
export declare const TextDecodeParser: typeof CustomDecoder | ({
    new (label?: string, options?: TextDecoderOptions): TextDecoder;
    prototype: TextDecoder;
} & ((...args: any[]) => any));
export {};
