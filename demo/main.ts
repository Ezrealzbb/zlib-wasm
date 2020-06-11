import { zlib } from '../src/index';

const win: any = window;

function test(label: string, fn: () => void, time: number) {
    for (let i = 0; i < time; i++) {
        fn();
    }

    console.log(`[zlibwasm] ${label} avg const time ${calcAvg(zlib.timeSet)}`);

    zlib.timeSet.length = 0;
}

function calcAvg(arr: number[]) {
    return arr.reduce((pre, cur) => pre + cur, 0) / arr.length;
}

win.zlib = zlib;


function testUngzip(time: number) {
    let wasmRet, pakoRet;
    test('wasm', () => {
        wasmRet = zlib.ungzipBase64(win.a);
    }, time);

    test('pako', () => {
        pakoRet = zlib.pakoUngzip(win.a);
    }, time);

    console.log(wasmRet === pakoRet);
    return pakoRet;
}

function testGzip(time: number) {
    let wasmRet, pakoRet;
    test('wasm', () => {
        wasmRet = zlib.gzip(win.a);
    }, time);

    test('pako', () => {
        pakoRet = zlib.gzip(win.a);
    }, time);

    console.log(wasmRet === pakoRet);
    return pakoRet;
}

win.testUngzip = testUngzip;
win.testGzip = testGzip;