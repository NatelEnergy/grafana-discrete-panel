/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { CanvasPanelCtrl } from './canvas-metric';
declare class DiscretePanelCtrl extends CanvasPanelCtrl {
    static templateUrl: string;
    defaults: {
        display: string;
        rowHeight: number;
        valueMaps: {
            value: string;
            op: string;
            text: string;
        }[];
        mappingTypes: {
            name: string;
            value: number;
        }[];
        rangeMaps: {
            from: string;
            to: string;
            text: string;
        }[];
        colorMaps: {
            text: string;
            color: string;
        }[];
        metricNameColor: string;
        valueTextColor: string;
        backgroundColor: string;
        lineColor: string;
        textSize: number;
        extendLastValue: boolean;
        writeLastValue: boolean;
        writeAllValues: boolean;
        writeMetricNames: boolean;
        showLegend: boolean;
        showLegendNames: boolean;
        showLegendValues: boolean;
        showLegendPercent: boolean;
        highlightOnMouseover: boolean;
        legendSortBy: string;
    };
    data: any;
    externalPT: boolean;
    isTimeline: boolean;
    hoverPoint: any;
    colorMap: any;
    constructor($scope: any, $injector: any);
    onDataError(err: any): void;
    onInitEditMode(): void;
    onRender(): void;
    showLegandTooltip(pos: any, info: any): void;
    clearTT(): void;
    formatValue(val: any): any;
    getColor(val: any): any;
    randomColor(): string;
    hashCode(str: any): number;
    issueQueries(datasource: any): any;
    onDataReceived(dataList: any): void;
    removeColorMap(map: any): void;
    updateColorInfo(): void;
    addColorMap(what: any): void;
    removeValueMap(map: any): void;
    addValueMap(): void;
    removeRangeMap(rangeMap: any): void;
    addRangeMap(): void;
    onConfigChanged(): void;
    getLegendDisplay(info: any, metric: any): any;
    showTooltip(evt: any, point: any, isExternal: any): void;
    onGraphHover(evt: any, showTT: any, isExternal: any): void;
    onMouseClicked(where: any): void;
    onMouseSelectedRange(range: any): void;
    clear(): void;
}
export { DiscretePanelCtrl as PanelCtrl };
