#include <stdlib.h>

void writeToJs(void *ptr, size_t size);
void writeToJs_base64(void *ptr, size_t size);
void writeToJs_uncompress(size_t size);

int jsLog(int a, int b);

unsigned char * base64_encode(const unsigned char *src, size_t len,
			      size_t *out_len);
unsigned char * base64_decode(const unsigned char *src, size_t len,
			      size_t *out_len);