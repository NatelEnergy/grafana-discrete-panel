export declare class PointInfo {
    val: string;
    start: number;
    ms: number;
    constructor(val: string, start: number);
}
export declare class LegendValue {
    val: string;
    ms: number;
    count: number;
    per: number;
    constructor(val: string);
}
export declare class DistinctPoints {
    name: any;
    changes: Array<PointInfo>;
    legendInfo: Array<LegendValue>;
    last: PointInfo;
    asc: boolean;
    transitionCount: number;
    distinctValuesCount: number;
    elapsed: number;
    constructor(name: any);
    add(ts: number, val: string): void;
    finish(ctrl: any): void;
    static combineLegend(data: DistinctPoints[], ctrl: any): DistinctPoints;
}
