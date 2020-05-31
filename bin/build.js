const path = require("path");
const mkdirp = require("mkdirp");
const waCliUtil = require("webassembly/cli/util");
const OPTIMIZATION_LEVEL = process.argv[2] || "-Oz";

const zlibSources = [
  "adler32",
  "crc32",
  "compress",
  "deflate",
  "infback",
  "inffast",
  "inflate",
  "inftrees",
  "trees",
  "uncompr",
  "zutil",
];

const baseRoot = path.resolve(__dirname, '../')
const builddir = path.join(baseRoot, "build");
const srcdir = path.join(baseRoot, "src");
const zlibdir = path.join(baseRoot, "lib/zlib");

mkdirp.sync(path.join(__dirname, "build"));

// LLVM是目前苹果采用的编译器工具链 
// Bitcode是LLVM编译器的中间代码的一种编码
// LLVM的前端可以理解为C/C++/OC/Swift等编程语言,
// LLVM的后端可以理解为各个芯片平台上的汇编指令或者可执行机器指令数据
// 

(async () => {
  // generat bitcode file for each source code
  await waCliUtil.run(path.join(waCliUtil.bindir, "clang"), [
    zlibSources.map(s => path.join(zlibdir, `${s}.c`)),
    OPTIMIZATION_LEVEL,
    "-c", // Only run preprocess, compile, and assemble steps
    "--target=wasm32-unknown-unknown", // generator code for the targe value
    "-D", "WEBASSEMBLY", // define WEBASEEMBLY=1
    "-emit-llvm", // Use the LLVM representation for assembler and object files
    "-nostdinc", // Disable standard #include directories for the C++ standard library
    "-nostdlib", // 
    "-fno-builtin", // Disable implicit builtin knowledge of functions
    "-isystem", path.join(waCliUtil.basedir, "include"), // Add directory to SYSTEM include search path
    "-isystem", path.join(waCliUtil.basedir, "lib/musl-wasm32/include"),
    "-isystem", path.join(srcdir, "include"),
    `-I${zlibdir}`, // Add directory to include search path 增加代码查找路径
  ], { cwd: builddir }); // output dir

  // 将多个 bc 文件统一链接成一个 zlib.bc
  await waCliUtil.run(path.join(waCliUtil.bindir, "llvm-link"), [
    zlibSources.map(s => `${s}.bc`),
    "-o", "zlib.bc",
  ], { cwd: builddir });

  // 编译base 64 函数
  await waCliUtil.run(path.join(waCliUtil.bindir, "clang"), [
    path.join(srcdir, 'base64.c'), // 也编译 base64
    OPTIMIZATION_LEVEL,
    "-c",
    "--target=wasm32-unknown-unknown",
    "-D", "WEBASSEMBLY",
    "-emit-llvm",
    "-nostdinc",
    "-nostdlib",
    "-fno-builtin",
    "-isystem", path.join(waCliUtil.basedir, "include"),
    "-isystem", path.join(waCliUtil.basedir, "lib/musl-wasm32/include"),
    "-isystem", path.join(srcdir, "include"),
    `-I${zlibdir}`, // 将 zlib 的库作为代码查找路径
    `-I${path.join(srcdir, "import.h")}`,
    "-o", "base64.bc",
  ], { cwd: builddir });

  // 编译自己写的 C 函数
  await waCliUtil.run(path.join(waCliUtil.bindir, "clang"), [
    path.join(srcdir, "zlib-sample.c"),
    OPTIMIZATION_LEVEL,
    "-c",
    "--target=wasm32-unknown-unknown",
    "-D", "WEBASSEMBLY",
    "-emit-llvm",
    "-nostdinc",
    "-nostdlib",
    "-fno-builtin",
    "-isystem", path.join(waCliUtil.basedir, "include"),
    "-isystem", path.join(waCliUtil.basedir, "lib/musl-wasm32/include"),
    "-isystem", path.join(srcdir, "include"),
    `-I${zlibdir}`, // 将 zlib 的库作为代码查找路径
    `-I${path.join(srcdir, "import.h")}`,
    "-o", "tmp-zlib-sample.bc",
  ], { cwd: builddir });

  // 将自己写的 代码、zlib 源码编译而成的代码、webassembly bc 文件一起统一编译为 zlib-sample bc 文件
  await waCliUtil.run(path.join(waCliUtil.bindir, "llvm-link"), [
    "tmp-zlib-sample.bc",
    "base64.bc",
    "zlib.bc",
    path.join(waCliUtil.basedir, "lib", "webassembly.bc"),
    "-only-needed",
    "-o", "zlib-sample.bc",
  ], { cwd: builddir });

  // llc命令编译LLVM源文件到用于指定的体系结构的汇编语言
  await waCliUtil.run(path.join(waCliUtil.bindir, "llc"), [
    "zlib-sample.bc", // 源文件
    "-march=wasm32",
    "-filetype=asm",// 编译成 文本汇编语言 .s 文件
    "-asm-verbose=false", // Add comments to directives
    "-thread-model=single", // 
    "-data-sections", // Emit data into separate sections，允许去除无用的 data 和 function，减少体积
    "-function-sections",
  ], { cwd: builddir });

  // s2wasm 是 Binaryen 提供的编译程序，d
  // https://chromium.googlesource.com/external/github.com/WebAssembly/binaryen/+/refs/heads/cmake/README.md
  await waCliUtil.run(path.join(waCliUtil.bindir, "s2wasm"), [
    "zlib-sample.s",
    "--import-memory", // 采用 import 的线性内存，而不是导出型的内存
    "--allocate-stack", "10000", // 线性内存中的栈大小
    "-o", "zlib-sample.wat",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "wasm-opt"), [
    "zlib-sample.wat",
    "-O3", // 快速优化
    "--coalesce-locals-learning", // reduce # of locals by coalescing and learning
    "--dce", // removes unreachable code
    "--duplicate-function-elimination", // removes duplicate functions
    "--inlining",
    "--local-cse",
    "--merge-blocks",// merges blocks to their parents
    "--optimize-instructions",
    "--reorder-functions",
    "--reorder-locals",
    "--vacuum",// removes obviously unneeded code
    "-o", "zlib-sample.wasm", // 输出优化之后的 wasm 文件
  ], { cwd: builddir });
})();
