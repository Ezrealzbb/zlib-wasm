import { WorkType, GzipPerfData, CollectPrefData, TrackLabel } from './types';

type PerfCollections = { [key in TrackLabel]: GzipPerfData[] };
type WorkPerfCollections = { [key in WorkType]: PerfCollections };

// 这个文件会被 worker 所加载，里面的 api使用 要注意 worker 下兼容性
// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers
class GzipPerfTracker {
    private collections: WorkPerfCollections;
    private recordStartTime: number = 0;

    constructor() {
        this.reset();
    }

    private reset() {
        this.collections = {} as WorkPerfCollections;
        this.resetTime();
    }

    private getTimestamp() {
        // worker 中要先判断 window
        if (typeof window !== 'undefined' && typeof window.performance !== 'undefined') {
            return window.performance.now();
        }
        return Date.now();
    }

    recordStart() {
        if (this.recordStartTime) {
            console.warn('GzipPerfTracker: you maybe forget call recordEnd.');
        }
        this.recordStartTime = this.getTimestamp();
    }

    resetTime() {
        this.recordStartTime = 0;
    }

    recordEnd(workType: WorkType, trackLabel: TrackLabel, dataLen: number) {
        if (!this.collections[workType]) {
            this.collections[workType] = {};
        }

        if (!this.collections[workType][trackLabel]) {
            this.collections[workType][trackLabel] = [];
        }

        if (!this.recordStartTime) {
            console.warn('GzipPerfTracker: please call recordStart first');
            return;
        }

        const workDuration = this.getTimestamp() - this.recordStartTime;

        this.collections[workType][trackLabel].push({
            length: dataLen,
            duration: workDuration,
            timeRatio: dataLen / workDuration,
        });
        this.recordStartTime = 0;
    }

    /**
     * 汇总收集平均值结果，给调用方上报
     */
    collect(): CollectPrefData[] {
        const ret: CollectPrefData[] = [];
        // 计算全部类型的平均值
        Object.keys(this.collections).forEach((workType: WorkType) => {
            const workCollections = this.collections[workType];
            const labels = Object.keys(workCollections);
            if (!labels.length) {
                return;
            }
            labels.forEach((trackLabel: TrackLabel) => {
                const labelCollections = workCollections[trackLabel];
                if (!labelCollections.length) {
                    return;
                }
                const sum = {
                    duration: 0,
                    length: 0,
                    timeRatio: 0,
                };
                const sumResult = labelCollections.reduce((pre, cur) => {
                    return {
                        length: pre.length + cur.length,
                        duration: pre.duration + cur.duration,
                        timeRatio: pre.timeRatio + cur.timeRatio,
                    };
                }, sum);
                ret.push({
                    workType,
                    trackLabel,
                    length: sumResult.length / labelCollections.length,
                    duration: sumResult.duration / labelCollections.length,
                    timeRatio: sumResult.timeRatio / labelCollections.length,
                });
            });
        });
        this.reset();
        return ret;
    }
}

export const gzipPerfTracker = new GzipPerfTracker();