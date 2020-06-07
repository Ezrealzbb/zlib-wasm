"use strict";
exports.__esModule = true;
exports.TextDecodeParser = exports.TextEncodeParser = void 0;
var buffer_1 = require("buffer");
var lodash_es_1 = require("lodash-es");
var CustomEncoder = /** @class */ (function () {
    function CustomEncoder() {
    }
    CustomEncoder.prototype.encode = function (text) {
        return buffer_1.Buffer.from(text);
    };
    return CustomEncoder;
}());
var CustomDecoder = /** @class */ (function () {
    function CustomDecoder() {
    }
    CustomDecoder.prototype.decode = function (textBuff) {
        return buffer_1.Buffer.from(textBuff).toString();
    };
    return CustomDecoder;
}());
exports.TextEncodeParser = lodash_es_1.isNative(window.TextEncoder) ? window.TextEncoder : CustomEncoder;
exports.TextDecodeParser = lodash_es_1.isNative(window.TextDecoder) ? window.TextDecoder : CustomDecoder;
