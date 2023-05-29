CC = emcc
CFLAGS = -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web -s FILESYSTEM=0
STANDALONE = -s STANDALONE_WASM
NO_MAIN_NEED = --no-entry
LDFLAGS = -s "EXPORTED_RUNTIME_METHODS=['getValue','setValue','UTF8ArrayToString','UTF8ToString','stringToUTF8Array','stringToUTF8']"
EXPORTS_FUNCTIONS = -s "EXPORTED_FUNCTIONS=['_mallocMemory', '_freeMemory', '_unGzipBase64Content',  '_getCompressedDataPtr']"
TARGET = zlib-wasm
OPTIMIZE = -O3
WEB_OUTPUT = src/web/build/$(TARGET)

SOURCES = src/base/export.c lib/zlib/adler32.c lib/zlib/crc32.c lib/zlib/compress.c lib/zlib/deflate.c lib/zlib/infback.c lib/zlib/inffast.c lib/zlib/inflate.c lib/zlib/inftrees.c lib/zlib/trees.c lib/zlib/uncompr.c lib/zlib/zutil.c
#SHELL_FILE = --shell-file html_template/shell.html

web: $(TARGET)

$(TARGET): $(SOURCES)
	$(CC) $(CFLAGS) $(SOURCES) $(LDFLAGS) $(EXPORTS_FUNCTIONS) $(SHELL_FILE) -o $(WEB_OUTPUT).js $(OPTIMIZE) -s EXPORT_ES6 -s "USE_ES6_IMPORT_META=0"

clean:
	rm -f $(TARGET).html $(TARGET).js $(TARGET).wasm
