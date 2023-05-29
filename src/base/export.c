#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>
#include "../../lib/zlib/zlib.h"
#include "../../lib/base64/base64.c"
#include <stdint.h>


#ifdef __cplusplus
extern "C" {
#endif

int ungzip_data(const char *source, int src_len, char **dest, int *dest_len) {
    z_stream strm;
    int ret;
    int buffer_size = 1024;
    int bytes_written = 0;

    strm.zalloc = Z_NULL;
    strm.zfree = Z_NULL;
    strm.opaque = Z_NULL;
    strm.avail_in = src_len;
    strm.next_in = (Bytef *)source;

    // 设置 windowBits 为 16 + MAX_WBITS（32），以启用 gzip 解压缩
    ret = inflateInit2(&strm, 16 + MAX_WBITS);
    if (ret != Z_OK) {
        return ret;
    }

    *dest = (char *)malloc(buffer_size);

    do {
        strm.avail_out = buffer_size - bytes_written;
        strm.next_out = (Bytef *)(*dest + bytes_written);

        ret = inflate(&strm, Z_NO_FLUSH);

        switch (ret) {
            case Z_NEED_DICT:
                ret = Z_DATA_ERROR;
            case Z_DATA_ERROR:
            case Z_MEM_ERROR:
                (void)inflateEnd(&strm);
                return ret;
        }

        bytes_written = buffer_size - strm.avail_out;

        if (strm.avail_out == 0) {
            buffer_size *= 2;
            *dest = (char *)realloc(*dest, buffer_size);
        }

    } while (ret != Z_STREAM_END);

    (void)inflateEnd(&strm);
    *dest_len = bytes_written;
    return Z_OK;
}


char *uncompressed_data = NULL;

EMSCRIPTEN_KEEPALIVE
const char* getCompressedDataPtr() {
    return uncompressed_data;
}

int EMSCRIPTEN_KEEPALIVE unGzipBase64Content(
    char *src,
    size_t srcLen,
    char *base64out,
    size_t *base64outLen,
    size_t *outLen
) {
//     printf("in: %s end\n", src);
    // `+2` 是为了确保在数据长度不是 3 的倍数时能够正确处理剩余的字节。
    // `/3` 是因为每 3 个字节被编码成 4 个字符
    // `*4` 是因为每个编码后的字符占用一个字节
    // +1 是为了容纳字符串的结束符 '\0'
//     *base64outLen = (((srcLen + 2) * 3) / 4) + 1;
//     int base64outLen = (((srcLen + 2) * 3) / 4) + 1;
//     base64out = malloc(base64outLen);
//     if (base64out == 0) {
//         return MEMORY_ALLOCATION_FAILED;
//     }

    if (uncompressed_data != NULL) {
        free(uncompressed_data);
    }


    int encodeRet = base64_decode2(src, srcLen, base64out, base64outLen);
//     printf("base64Encode: %d, outPtr %d outLen %d \n", encodeRet, base64out, base64outLen);
    if (encodeRet != 0) {
        printf("base64Encode: %d end\n", encodeRet);
        return encodeRet;
    }

    int unGzipRet = ungzip_data(base64out, *base64outLen, &uncompressed_data, outLen);
    if (unGzipRet != Z_OK) {
        printf("ungzip_data: %d end\n", unGzipRet);
        return unGzipRet;
    }

    return 0;
}

EMSCRIPTEN_KEEPALIVE
void* mallocMemory(size_t size) {
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void freeMemory(void* pointer) {
    return free(pointer);
}

EMSCRIPTEN_KEEPALIVE
uint32_t getI32Value(const void *ptr) {
  return *(uint32_t *)ptr;
}

#ifdef __cplusplus
}
#endif
