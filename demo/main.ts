import { ZlibWasmProvider, gzipPerfTracker } from '../src/index';
import { randomString, calcAvg, checkDiffText } from './util';
import echarts from 'echarts';
import { range, isEqual } from 'lodash-es';

const zlib = new ZlibWasmProvider({
    exCatch: console.error,
    defaultMemory: 100,
    info: console.info,
});
zlib.setDebug(true);

const win: any = window;
const btn = document.getElementById('test');
const input = document.getElementById('randomStringLength') as HTMLInputElement;
const runTimesInput = document.getElementById('runTimes') as HTMLInputElement;
const messageBox = document.getElementById('message') as HTMLTextAreaElement;
const statusBox = document.getElementById('status');


win.zlib = zlib;
win.ungzipOutput = '';
win.gzipOutput = '';
win.chart = null;

win.testUngzip = testUngzip;
win.testGzip = testGzip;
win.testMain = testMain;

function testCore(label: string, fn: () => void, time: number) {
    for (let i = 0; i < time; i++) {
        fn();
    }
    const avg = calcAvg(gzipPerfTracker.collect().map(c => c.duration));
    // console.log(`[zlibwasm] ${label} avg const time ${avg}`);

    return +avg.toFixed(3);
}


function testUngzip(runTimes: number, content: string) {
    let wasmRet, pakoRet;
    const wasmUngipAvg = testCore('wasm', () => {
        wasmRet = zlib.ungzip(content);
    }, runTimes);

    const pakoUngipAvg = testCore('pako', () => {
        pakoRet = zlib.pakoUngzip(content);
    }, runTimes);

    win.ungzipOutput = wasmRet;
    console.assert(wasmRet, pakoRet);
    return {
        wasmUngipAvg, pakoUngipAvg,
    }
}

function testGzip(runTimes: number, content: string) {
    let wasmRet, pakoRet;
    const wasmGzipAvg = testCore('wasm', () => {
        wasmRet = zlib.gzip(content);
    }, runTimes);

    const pakoGzipAvg = testCore('pako', () => {
        pakoRet = zlib.pakoGzip(content);
    }, runTimes);

    // wasmRet 和 pakoRet 的解压结果不一定一致，但是可以互相解压出正确的结果
    // 这里不做断言
    // console.assert(wasmRet, pakoRet);
    win.gzipOutput = pakoRet;
    
    return {
        wasmGzipAvg, pakoGzipAvg,
    }
}


function testMain(len: number = 1, time: number = 1, innerRunTime : number = 1) {
    const wasmUnzip = [];
    const wasmGzip = [];
    const pakoUngzip = [];
    const pakoGzip = [];
    const content = randomString(len);
    for (let i = 0; i < time; i++) {
        const { wasmGzipAvg, pakoGzipAvg } = testGzip(innerRunTime, content);
        wasmGzip.push(wasmGzipAvg);
        pakoGzip.push(pakoGzipAvg);
    }
    
    for (let i = 0; i < time; i++) {
        const { wasmUngipAvg, pakoUngipAvg, } = testUngzip(innerRunTime, win.gzipOutput);
        wasmUnzip.push(wasmUngipAvg);
        pakoUngzip.push(pakoUngipAvg);
    }

    console.assert(win.ungzipOutput === content);
    return {
        wasmUnzip,
        wasmGzip,
        pakoUngzip,
        pakoGzip,
    };
}

function initEcharts() {
    const container = document.getElementById('echarts');
    win.chart = echarts.init(container as HTMLDivElement);
}


function renderChart(options) {
    win.chart.setOption(options);
}

function generateEchartsData(originDatas) {
    let xLen = 0;
    const series = Object.keys(originDatas).map(name => {
        xLen = originDatas[name].length;
        return {
            data: originDatas[name],
            type: 'line',
            smooth: true,
            name,
        }
    });

    const options = {
        xAxis: {
            type: 'category',
            name: '次数',
            data: range(1, xLen),
        },
        tooltip: {
            trigger: 'axis'
        },
        yAxis: {
            type: 'value',
            name: '耗时 ms'
        },
        legend: {
            data: ['wasmUnzip', 'wasmGzip', 'pakoUngzip', 'pakoGzip']
        },
        series,
    }

    return options;
}

function bindEvents() {
    btn.addEventListener('click', function() {
        updateMessage('', true);
        calc(input.value, runTimesInput.value);
    });
}

function calc(num: string, runTimes: string) {
    const value = parseInt(num, 10);
    const times = parseInt(runTimes, 10);
    if (!Number.isNaN(value) && value > 0) {
        const performanceData = testMain(value, times);
        const options = generateEchartsData(performanceData);
        renderChart(options);
    }
}

function updateBtnEnable(enable: boolean) {
    if (enable) {
        btn.removeAttribute('disabled');
    } else {
        btn.setAttribute('disabled', 'true');
    }
}

function updateStatus(message: string) {
    statusBox.innerText = message;
}

function updateMessage(message: string, clear: boolean = false) {
    if (clear) {
        messageBox.value = '';
    } else {
        messageBox.value += (message + '\n');
    }
}

function mockLog() {
    const oldLog = console.log;
    console.log = function(...args) {
        oldLog(...args);
        if (typeof args[0] === 'string' && args[0].startsWith('[zlibwasm]')) {
            updateMessage(args[0]);
        }
    }
}

win.main = function main() {
    mockLog();
    updateBtnEnable(false);
    initEcharts();
    bindEvents();
    zlib.loadedPromise.then(() => {
        updateStatus('WASM 加载完成! 开始计算');
        updateMessage('', true);
        updateBtnEnable(true);
        calc(input.value, runTimesInput.value);
    });
}

win.main();
