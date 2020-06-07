"use strict";
exports.__esModule = true;
exports.isNULLPtr = void 0;
/**
 * 判断是否是空指针，如果是空指针，则说明内存分配失败
 * @param ptr 指针
 */
function isNULLPtr(ptr) {
    return ptr === 0;
}
exports.isNULLPtr = isNULLPtr;
