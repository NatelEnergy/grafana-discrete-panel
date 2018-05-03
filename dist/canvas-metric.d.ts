/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
export declare class CanvasPanelCtrl extends MetricsPanelCtrl {
    data: any;
    mouse: any;
    $tooltip: any;
    wrap: any;
    canvas: any;
    context: any;
    _devicePixelRatio: number;
    constructor($scope: any, $injector: any);
    onPanelInitalized(): void;
    onRefresh(): void;
    onRender(): void;
    clearTT(): void;
    getMousePosition(evt: any): {
        x: any;
        y: number;
        yRel: number;
        ts: any;
        evt: any;
    };
    onGraphHover(evt: any, showTT: any, isExternal: any): void;
    onMouseClicked(where: any, event: any): void;
    onMouseSelectedRange(range: any, event: any): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
    time_format(range: number, secPerTick: number): string;
    getTimeResolution(estTimeInterval: number): number;
    roundDate(timeStamp: any, roundee: any): any;
    formatDate(d: any, fmt: any): any;
    leftPad(n: any, pad: any): any;
}
