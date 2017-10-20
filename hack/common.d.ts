/// <reference path="./es6-shim/es6-shim.d.ts" />

declare var System: any;

// dummy modules
declare module 'app/core/config' {
  var config: any;
  export default config;
}

declare module 'lodash' {
  var lodash: any;
  export default lodash;
}

declare module 'moment' {
  var moment: any;
  export default moment;
}

declare module 'angular' {
  var angular: any;
  export default angular;
}

declare module 'jquery' {
  var jquery: any;
  export default jquery;
}

declare module 'q' {
  var q: any;
  export default q;
}

declare module 'app/core/time_series2' {
  var time_series2: any;
  export default time_series2;
}

declare module 'app/core/table_model' {
  var table_model: any;
  export default table_model;
}

declare module 'app/core/utils/file_export' {
  var file_export: any;
  export default file_export;
}

declare module 'app/core/utils/flatten' {
  var flatten: any;
  export default flatten;
}

declare module 'app/core/utils/kbn' {
  var kbn: any;
  export default kbn;
  // var interval_regex: string;
  // var intervals_in_seconds: string;
  // var formatBuilders: any;
  // var valueFormats: any;

  // export function round_interval(interval: number): number;
  // export function secondsToHms(seconds: number): string;
  // export function to_percent(number: number, outof: number): string;
  // export function calculateInterval(range: any, resolution: any, userInterval: any);
  // export function describe_interval(string: string): any;
  // export function interval_to_ms(string: string): number;
  // export function interval_to_seconds(string: string): number;
  // export function query_color_dot(color: string, diameter: string|number): string;
  // export function slugifyForUrl(str: string): string;
  // export function stringToJsRegex(str: string): RegExp;
  // export function toFixed(value: any, decimals: any): any;
  // export function toFixedScaled(value: any, decimals: any, scaledDecimals: any, additionalDecimals: any, ext: any);
  // export function roundValue(num: number, decimals: number): number;
  // export function toDuration(size, decimals, timeScale): string;
  // export function getUnitFormats(): any;
}

declare module 'app/core/store' {
  var store: any;
  export default store;
}

declare module 'app/core/app_events' {
  var appEvents: any;
  export default appEvents;
}

declare module 'tether' {
  var config: any;
  export default config;
}

declare module 'tether-drop' {
  var config: any;
  export default config;
}

declare module 'eventemitter3' {
  var config: any;
  export default config;
}

declare module 'app/core/utils/datemath' {
  export function parse(text: any, roundUp?: any): any;
  export function isValid(text: any): any;
  export function parseDateMath(mathString: any, time: any, roundUp?: any): any;
}

declare module 'app/plugins/sdk' {
  export class PanelCtrl{
    panel: any;
    error: any;
    row: any;
    dashboard: any;
    editorTabIndex: number;
    pluginName: string;
    pluginId: string;
    editorTabs: any;
    $scope: any;
    $injector: any;
    $timeout: any;
    fullscreen: boolean;
    inspector: any;
    editModeInitiated: boolean;
    editorHelpIndex: number;
    editMode: any;
    height: any;
    containerHeight: any;
    events: any;
    timing: any;

subTabIndex: number; // ???

    constructor($scope: any, $injector: any);

    init(): void;
    renderingCompleted(): void;
    refresh(): void;
    publishAppEvent(evtName: any, evt: any): void;
    changeView(fullscreen: boolean, edit: boolean): void;
    viewPanel(): void;
    editPanel(): void;
    exitFullscreen(): void;
    initEditMode(): void;
    changeTab(newIndex: any): void;
    addEditorTab(title: any, directiveFn: any, index?: any): void;
    getMenu(): any;
    getExtendedMenu(): any;
    otherPanelInFullscreenMode(): boolean;
    calculatePanelHeight(): void;
    render(payload?: any): void;
    toggleEditorHelp(index: any): void;
    duplicate(): void;
    updateColumnSpan(span: any): void;
    removePanel(): void;
    editPanelJson(): void;
    replacePanel(newPanel: any, oldPanel: any): void;
    sharePanel(): void;
    getInfoMode(): void;
    getInfoContent(options: any): void;
    openInspector(): void;
  }
  export class MetricsPanelCtrl extends PanelCtrl {
    scope: any;
    loading: boolean;
    datasource: any;
    datasourceName: any;
    $q: any;
    $timeout: any;
    datasourceSrv: any;
    timeSrv: any;
    templateSrv: any;
    timing: any;
    range: any;
    rangeRaw: any;
    interval: any;
    intervalMs: any;
    resolution: any;
    timeInfo: any;
    skipDataOnInit: boolean;
    dataStream: any;
    dataSubscription: any;
    dataList: any;
    nextRefId: string;

    constructor($scope, $injector);

    private onPanelTearDown(): void;

    private onInitMetricsPanelEditMode(): void;

    private onMetricsPanelRefresh(): void;

    setTimeQueryStart(): void;

    setTimeQueryEnd(): void;

    updateTimeRange(datasource?): void;

    calculateInterval(): void;

    applyPanelTimeOverrides(): void;

    issueQueries(datasource): void;

    handleQueryResult(result): void;

    handleDataStream(stream): void;

    setDatasource(datasource): void;

    addQuery(target): void;

    removeQuery(target): void;

    moveQuery(target, direction): void;
  }
  export class QueryCtrl{
    constructor($scope:any, $injector: any);
    target: any;
    panelCtrl: any;
    panel: any;
    datasource: any;
    hasRawMode: boolean;
    error: string;

    refresh(): void;
  }

  export function loadPluginCss(options: any): void;
}