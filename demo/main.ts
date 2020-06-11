import { zlib } from '../src/index';
import { randomString, calcAvg } from './util';

const win: any = window;

function test(label: string, fn: () => void, time: number) {
    for (let i = 0; i < time; i++) {
        fn();
    }
    const avg = calcAvg(zlib.timeSet);
    // console.log(`[zlibwasm] ${label} avg const time ${avg}`);

    zlib.timeSet.length = 0;
    return avg;
}


win.zlib = zlib;
win.ungipOutput = '';
win.gipOutput = '';

function testUngzip(time: number, content: string) {
    let wasmRet, pakoRet;
    const wasmUngipAvg = test('wasm', () => {
        wasmRet = zlib.ungzipBase64(content);
    }, time);

    const pakoUngipAvg = test('pako', () => {
        pakoRet = zlib.pakoUngzip(content);
    }, time);
    console.assert(wasmRet === pakoRet);
    win.ungipOutput = wasmRet;
    return {
        wasmUngipAvg, pakoUngipAvg,
    }
}

function testGzip(time: number, content: string) {
    let wasmRet, pakoRet;
    const wasmGzipAvg = test('wasm', () => {
        wasmRet = zlib.gzip(content);
    }, time);

    const pakoGzipAvg = test('pako', () => {
        pakoRet = zlib.gzip(content);
    }, time);

    console.assert(wasmRet === pakoRet);
    win.gipOutput = wasmRet;
    return {
        wasmGzipAvg, pakoGzipAvg,
    }
}

win.testUngzip = testUngzip;
win.testGzip = testGzip;
win.differentInputText = differentInputText;

function differentInputText(len: number = 0, time: number = 1) {
    const wasmUnzip = [];
    const wasmGzip = [];
    const pakoUngzip = [];
    const pakoGzip = [];
    for (let i = 1; i <= len; i++) {
        const content = randomString(i);
        const { wasmGzipAvg, pakoGzipAvg } = testGzip(time, content);
        wasmGzip.push(wasmGzipAvg);
        pakoGzip.push(pakoGzipAvg);

        const { wasmUngipAvg, pakoUngipAvg, } = testUngzip(time, win.gipOutput);
        wasmUnzip.push(wasmUngipAvg);
        pakoUngzip.push(pakoUngipAvg);

        console.assert(win.ungipOutput === content);
    }
}