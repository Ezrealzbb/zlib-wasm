export var LoadState;
(function (LoadState) {
    LoadState["NOT_SUPPORT"] = "NOT_SUPPORT";
    LoadState["LOADING"] = "LOADING";
    LoadState["READY"] = "READY";
    LoadState["ERROR"] = "ERROR";
})(LoadState || (LoadState = {}));
// zlib 定义的错误码
export var ReturnCodes;
(function (ReturnCodes) {
    ReturnCodes[ReturnCodes["Z_OK"] = 0] = "Z_OK";
    ReturnCodes[ReturnCodes["Z_STREAM_END"] = 1] = "Z_STREAM_END";
    ReturnCodes[ReturnCodes["Z_NEED_DICT"] = 2] = "Z_NEED_DICT";
    ReturnCodes[ReturnCodes["Z_ERRNO"] = -1] = "Z_ERRNO";
    ReturnCodes[ReturnCodes["Z_STREAM_ERROR"] = -2] = "Z_STREAM_ERROR";
    ReturnCodes[ReturnCodes["Z_DATA_ERROR"] = -3] = "Z_DATA_ERROR";
    ReturnCodes[ReturnCodes["Z_BUF_ERROR"] = -5] = "Z_BUF_ERROR";
})(ReturnCodes || (ReturnCodes = {}));
export var TimeRecordLabel;
(function (TimeRecordLabel) {
    TimeRecordLabel["BASE64"] = "BASE64";
    TimeRecordLabel["WASM_UNGZIP"] = "wasm_ungzip";
    TimeRecordLabel["PAKO_UNGZIP"] = "pako_ungzip";
    TimeRecordLabel["WASM_GZIP"] = "wasm_gzip";
    TimeRecordLabel["PAKO_GZIP"] = "pako_gzip";
})(TimeRecordLabel || (TimeRecordLabel = {}));
//# sourceMappingURL=types.js.map