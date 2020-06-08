import { Buffer } from 'buffer';
import { isNative } from 'lodash-es';
var CustomEncoder = /** @class */ (function () {
    function CustomEncoder() {
    }
    CustomEncoder.prototype.encode = function (text) {
        return Buffer.from(text);
    };
    return CustomEncoder;
}());
var CustomDecoder = /** @class */ (function () {
    function CustomDecoder() {
    }
    CustomDecoder.prototype.decode = function (textBuff) {
        return Buffer.from(textBuff).toString();
    };
    return CustomDecoder;
}());
export var TextEncodeParser = isNative(window.TextEncoder) ? window.TextEncoder : CustomEncoder;
export var TextDecodeParser = isNative(window.TextDecoder) ? window.TextDecoder : CustomDecoder;
//# sourceMappingURL=TextParser.js.map