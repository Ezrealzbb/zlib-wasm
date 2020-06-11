import { zlib } from '../src/index';

const win: any = window;

function test(label: string, fn: () => void) {
    for (let i = 0; i < 1000; i++) {
        fn();
    }

    console.log(`[zlibwasm] ${label} avg const time ${calcAvg(zlib.timeSet)}`);

    zlib.timeSet.length = 0;
}

function calcAvg(arr: number[]) {
    return arr.reduce((pre, cur) => pre + cur, 0) / arr.length;
}

win.zlib = zlib;


function testUngzip() {
    test('wasm', () => {
        zlib.ungzipBase64(win.a);
    });

    test('pako', () => {
        zlib.pakoUngzip(win.a);
    });
}

function testGzip() {
    test('wasm', () => {
        zlib.gzip(win.a);
    });

    test('pako', () => {
        zlib.gzip(win.a);
    });
}

win.testUngzip = testUngzip;
win.testGzip = testGzip;