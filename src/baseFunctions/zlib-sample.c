#include <webassembly.h>
#include <stdlib.h>
#include "../zlib/zlib.h"
#include "import.h"

export void *_malloc(size_t size) {
  return malloc(size);
}

export void _free(void *p) {
  free(p);
}

// base64 编码介绍 https://juejin.im/post/5bd00c0251882577787451f4
// 说明解码后的实际字节数 <= inputLen * (3/4)
export char* _base64_decode(unsigned char* src, size_t inputLen, size_t * outLen) {
  char * out = base64_decode(src, inputLen, outLen);
  writeToJs_base64(out, outLen);
  return out;
}

export char* _base64_encode(unsigned char* src, size_t inputLen, size_t * outLen) {
  char * out = base64_encode(src, inputLen, outLen);
  writeToJs_base64(out, outLen);
  return out;
}

export int _compress_bound(size_t size) {
  return compressBound(size);
}

export int _uncompress_gzip(const char * input, int inputLen, const char* output, int outLen) {

    int ret = uncompress_gzip(output, &outLen, input, inputLen);
    if (ret == Z_OK)
    {
      writeToJs_gzip(outLen);
      return Z_OK;
    }
    
    return ret;
}

export int _compress_gzip(const char * input, int inputlen, const char* output, int outlen, int level) {
  int ret = compress_gzip(output, &outlen, input, inputlen, level);
  if (ret == Z_OK) {
    writeToJs_gzip(outlen);
    return Z_OK;
  }
  return ret;
}


export z_stream *_createDeflateContext(int compression_level, int zlib_header) {
  z_stream *ptr = (z_stream*)malloc(sizeof(z_stream));
  ptr->zalloc = Z_NULL;
  ptr->zfree = Z_NULL;
  ptr->opaque = Z_NULL;
  if (deflateInit2(ptr, compression_level, Z_DEFLATED, MAX_WBITS * zlib_header, MAX_MEM_LEVEL, Z_DEFAULT_STRATEGY) == Z_OK) {
    return ptr;
  } else {
    deflateEnd(ptr);
    return NULL;
  }
}

export z_stream *_createDeflateContext_gzip(int compression_level, int zlib_header) {
  z_stream *ptr = (z_stream*)malloc(sizeof(z_stream));
  ptr->zalloc = Z_NULL;
  ptr->zfree = Z_NULL;
  ptr->opaque = Z_NULL;
  if (deflateInit2(ptr, compression_level, Z_DEFLATED, MAX_WBITS + 16, MAX_MEM_LEVEL, Z_DEFAULT_STRATEGY) == Z_OK) {
    return ptr;
  } else {
    deflateEnd(ptr);
    return NULL;
  }
}

export int _deflate(z_stream *ptr, unsigned char *src, unsigned char *dst, size_t avail_in, size_t avail_out, int flush) {
  ptr->avail_in = avail_in;
  ptr->next_in = src;
  int have;
  int ret;
  do {
      ptr->avail_out = avail_out;
      ptr->next_out = dst;
      ret = deflate(ptr, flush ? Z_FINISH : Z_NO_FLUSH);
      if (ret == Z_STREAM_ERROR) return ret;
      have = avail_out - ptr->avail_out;
      writeToJs(ptr, have);
  } while (ptr->avail_out == 0);
  return ret;
}

export void _freeDeflateContext(z_stream *ptr) {
  deflateEnd(ptr);
}

export z_stream *_createInflateContext_gzip(int zlib_header) {
  z_stream *ptr = malloc(sizeof(z_stream));
  ptr->zalloc = Z_NULL;
  ptr->zfree = Z_NULL;
  ptr->opaque = Z_NULL;
  ptr->avail_in = 0;
  ptr->next_in = Z_NULL;
  if (inflateInit2(ptr, MAX_WBITS + 16) == Z_OK) {
    return ptr;
  } else {
    inflateEnd(ptr);
    return NULL;
  }
}

export z_stream *_createInflateContext(int zlib_header) {
  z_stream *ptr = malloc(sizeof(z_stream));
  ptr->zalloc = Z_NULL;
  ptr->zfree = Z_NULL;
  ptr->opaque = Z_NULL;
  ptr->avail_in = 0;
  ptr->next_in = Z_NULL;
  if (inflateInit2(ptr, MAX_WBITS * zlib_header) == Z_OK) {
    return ptr;
  } else {
    inflateEnd(ptr);
    return NULL;
  }
}

export int _inflate(z_stream *ptr, unsigned char *src, unsigned char *dst, size_t avail_in, size_t avail_out) {
  // 压缩数据的长度
  ptr->avail_in = avail_in;
  // 要压缩的数据的首地址
  ptr->next_in = src;
  int ret;
  int have;
  do {
    // 压缩数据存储可用的空间，一开始是最大值
    ptr->avail_out = avail_out;
    // 压缩数据保存位置
    ptr->next_out = dst;
    ret = inflate(ptr, Z_NO_FLUSH);
    // jsLog(ret);
    switch (ret) {
      case Z_NEED_DICT:
        ret = Z_DATA_ERROR;
      case Z_DATA_ERROR:
      case Z_MEM_ERROR:
        return ret;
    }
    // have 是压缩后数据的大小
    have = avail_out - ptr->avail_out;
    // 告诉 JS 去读取这段数据
    writeToJs(ptr, have);
  } while (ptr->avail_out == 0);
  return ret;
}

export void _freeInflateContext(z_stream *ptr) {
  inflateEnd(ptr);
} 
