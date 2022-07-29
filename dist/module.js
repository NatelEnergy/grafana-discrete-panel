System.register(['./canvas-metric', './distinct-points', 'lodash', 'jquery', 'moment', 'app/core/utils/kbn', 'app/core/app_events', 'app/core/utils/fontsize', 'app/plugins/sdk', './i18n'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var canvas_metric_1, distinct_points_1, lodash_1, jquery_1, moment_1, kbn_1, app_events_1, fontsize_1, sdk_1, i18n_1;
    var grafanaColors, colorSwitch, DiscretePanelCtrl;
    return {
        setters:[
            function (canvas_metric_1_1) {
                canvas_metric_1 = canvas_metric_1_1;
            },
            function (distinct_points_1_1) {
                distinct_points_1 = distinct_points_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (app_events_1_1) {
                app_events_1 = app_events_1_1;
            },
            function (fontsize_1_1) {
                fontsize_1 = fontsize_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (i18n_1_1) {
                i18n_1 = i18n_1_1;
            }],
        execute: function() {
            sdk_1.loadPluginCss({
                dark: 'plugins/natel-discrete-panel/css/discrete.dark.css',
                light: 'plugins/natel-discrete-panel/css/discrete.light.css',
            });
            grafanaColors = [
                '#7EB26D',
                '#EAB839',
                '#6ED0E0',
                '#EF843C',
                '#E24D42',
                '#1F78C1',
                '#BA43A9',
                '#705DA0',
                '#508642',
                '#CCA300',
                '#447EBC',
                '#C15C17',
                '#890F02',
                '#0A437C',
                '#6D1F62',
                '#584477',
                '#B7DBAB',
                '#F4D598',
                '#70DBED',
                '#F9BA8F',
                '#F29191',
                '#82B5D8',
                '#E5A8E2',
                '#AEA2E0',
                '#629E51',
                '#E5AC0E',
                '#64B0C8',
                '#E0752D',
                '#BF1B00',
                '#0A50A1',
                '#962D82',
                '#614D93',
                '#9AC48A',
                '#F2C96D',
                '#65C5DB',
                '#F9934E',
                '#EA6460',
                '#5195CE',
                '#D683CE',
                '#806EB7',
                '#3F6833',
                '#967302',
                '#2F575E',
                '#99440A',
                '#58140C',
                '#052B51',
                '#511749',
                '#3F2B5B',
                '#E0F9D7',
                '#FCEACA',
                '#CFFAFF',
                '#F9E2D2',
                '#FCE2DE',
                '#BADFF4',
                '#F9D9F9',
                '#DEDAF7',
            ]; // copied from public/app/core/utils/colors.ts because of changes in grafana 4.6.0
            //(https://github.com/grafana/grafana/blob/master/PLUGIN_DEV.md)
            colorSwitch = [];
            DiscretePanelCtrl = (function (_super) {
                __extends(DiscretePanelCtrl, _super);
                function DiscretePanelCtrl($scope, $injector) {
                    _super.call(this, $scope, $injector);
                    this.defaults = {
                        display: 'timeline',
                        rowHeight: 100,
                        valueMaps: [{ value: 'null', op: '=', text: 'N/A' }],
                        rangeMaps: [{ from: 'null', to: 'null', text: 'N/A' }],
                        colorMaps: [{ text: 'N/A', color: '#CCC' }],
                        metricNameColor: '#000000',
                        valueTextColor: '#000000',
                        timeTextColor: '#d8d9da',
                        crosshairColor: '#8F070C',
                        backgroundColor: 'rgba(128,128,128,0.1)',
                        lineColor: 'rgba(0,0,0,0.1)',
                        textSize: 24,
                        textSizeTime: 14,
                        extendLastValue: true,
                        writeLastValue: true,
                        writeAllValues: false,
                        writeMetricNames: false,
                        showTimeAxis: true,
                        showLegend: true,
                        showLegendNames: true,
                        showLegendValues: true,
                        showLegendPercent: true,
                        highlightOnMouseover: true,
                        expandFromQueryS: 0,
                        legendSortBy: '-ms',
                        units: 'short',
                        adjFontSize: true,
                        FontSize: '70%',
                        FontSizeValue: '140%',
                        // FontSizeTime: '0.8vw',
                        nullValue: false,
                    };
                    this.data = null;
                    this.externalPT = false;
                    this.isTimeline = true;
                    this.isStacked = false;
                    this.hoverPoint = null;
                    this.colorMap = {};
                    this._colorsPaleteCash = null;
                    this.unitFormats = null; // only used for editor
                    this.formatter = null;
                    this.fontSizes = null;
                    this.fontCalc = null;
                    this._renderDimensions = {};
                    this._selectionMatrix = [];
                    this.noPoints = false;
                    // console.log(languageList);
                    // defaults configs
                    this.translate = $injector.get('$translate');
                    lodash_1.default.defaultsDeep(this.panel, this.defaults);
                    this.panel.display = 'timeline'; // Only supported version now
                    // li.na modify start at 2019.4.16
                    this.fontCalc = [
                        {
                            text: '60%',
                            value: '60%',
                            vw: '0.6vw',
                            px: '12px',
                        },
                        {
                            text: '70%',
                            value: '70%',
                            vw: '0.8vw',
                            px: '15px',
                        },
                        {
                            text: '80%',
                            value: '80%',
                            vw: '1vw',
                            px: '19px',
                        },
                        {
                            text: '100%',
                            value: '100%',
                            vw: '1.4vw',
                            px: '27px',
                        },
                        {
                            text: '110%',
                            value: '110%',
                            vw: '1.6vw',
                            px: '31px',
                        },
                        {
                            text: '120%',
                            value: '120%',
                            vw: '1.8vw',
                            px: '35px',
                        },
                        {
                            text: '130%',
                            value: '130%',
                            vw: '2vw',
                            px: '38px',
                        },
                        {
                            text: '140%',
                            value: '140%',
                            vw: '2.2vw',
                            px: '42px',
                        },
                        {
                            text: '150%',
                            value: '150%',
                            vw: '2.4vw',
                            px: '46px',
                        },
                        {
                            text: '160%',
                            value: '160%',
                            vw: '2.6vw',
                            px: '50px',
                        },
                        {
                            text: '180%',
                            value: '180%',
                            vw: '3vw',
                            px: '58px',
                        },
                        {
                            text: '200%',
                            value: '200%',
                            vw: '3.4vw',
                            px: '65px',
                        },
                        {
                            text: '220%',
                            value: '220%',
                            vw: '3.8vw',
                            px: '73px',
                        },
                        {
                            text: '230%',
                            value: '230%',
                            vw: '4vw',
                            px: '77px',
                        },
                    ];
                    // li.na modify end at 2019.4.16
                    if (this.scope.$$listeners.isWisePaas) {
                        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
                        this.events.on('render', this.onRender.bind(this));
                        this.events.on('data-received', this.onDataReceived.bind(this));
                        this.events.on('panel-initialized', this.onPanelInitialized.bind(this));
                        this.events.on('data-error', this.onDataError.bind(this));
                        this.events.on('refresh', this.onRefresh.bind(this));
                        this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
                    }
                    this.timeSrv = $scope.ctrl.timeSrv;
                }
                // Shaun add 20220506 replace val with Dashboard Variables
                DiscretePanelCtrl.prototype.replaceCodes = function (val) {
                    var templateSrv = this.templateSrv;
                    var mapcode = {
                        group: '',
                        Value: '',
                        Text: '',
                    };
                    // console.log(this.data[0].name);
                    var gp = this.data[0].name.replace(/\d/g, ''); // get group name
                    // console.log(templateSrv.index['code']);
                    if (templateSrv.index['code']) {
                        for (var j = 0; j < templateSrv.index['code'].options.length; j++) {
                            _a = templateSrv.index['code'].options[j].text.split('|'), mapcode.group = _a[0], mapcode.Value = _a[1], mapcode.Text = _a[2];
                            // console.log(gp + val, mapcode.group + mapcode.Value);
                            if (gp + val === mapcode.group + mapcode.Value) {
                                val = mapcode.Text;
                            }
                        }
                    }
                    return val;
                    var _a;
                };
                DiscretePanelCtrl.prototype.onDataSnapshotLoad = function (snapshotData) {
                    this.onDataReceived(snapshotData);
                };
                DiscretePanelCtrl.prototype.onPanelInitialized = function () {
                    this.updateColorInfo();
                    this.onConfigChanged();
                };
                DiscretePanelCtrl.prototype.onDataError = function (err) {
                    console.log('onDataError', err);
                };
                DiscretePanelCtrl.prototype.onInitEditMode = function () {
                    var _this = this;
                    this.unitFormats = kbn_1.default.getUnitFormats();
                    var translateArr = [
                        'public.options',
                        'public.legend',
                        'public.colors',
                        'natel-discrete-panel.Mappings',
                    ];
                    this.translate(translateArr).then(function (translate) {
                        _this.addEditorTab(translate['public.options'], 'public/plugins/natel-discrete-panel/partials/editor.options.html', 2);
                        _this.addEditorTab(translate['public.legend'], 'public/plugins/natel-discrete-panel/partials/editor.legend.html', 3);
                        _this.addEditorTab(translate['public.colors'], 'public/plugins/natel-discrete-panel/partials/editor.colors.html', 4);
                        _this.addEditorTab(translate['natel-discrete-panel.Mappings'], 'public/plugins/natel-discrete-panel/partials/editor.mappings.html', 5);
                    });
                    this.editorTabIndex = 1;
                };
                DiscretePanelCtrl.prototype.onRender = function () {
                    this.initI18n();
                    if (this.data == null || !this.context) {
                        return;
                    }
                    this.data = this.formatDatas();
                    this._updateRenderDimensions();
                    this._updateSelectionMatrix();
                    this._updateCanvasSize();
                    this._renderRects();
                    this._renderTimeAxis();
                    this._renderLabels();
                    this._renderSelection();
                    this._renderCrosshair();
                };
                DiscretePanelCtrl.prototype.showLegandTooltip = function (pos, info) {
                    var body = '<div class="graph-tooltip-time">' + info.val + '</div>';
                    body += '<center>';
                    if (info.count > 1) {
                        body += info.count + ' times<br/>for<br/>';
                    }
                    body += moment_1.default.duration(info.ms).humanize();
                    if (info.count > 1) {
                        body += '<br/>total';
                    }
                    body += '</center>';
                    this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
                };
                DiscretePanelCtrl.prototype.clearTT = function () {
                    this.$tooltip.detach();
                };
                DiscretePanelCtrl.prototype.formatValue = function (val) {
                    colorSwitch.length = 0;
                    if (lodash_1.default.isNumber(val)) {
                        if (this.panel.rangeMaps) {
                            for (var i = 0; i < this.panel.rangeMaps.length; i++) {
                                var map_1 = this.panel.rangeMaps[i];
                                // value/number to range mapping
                                var from = parseFloat(map_1.from);
                                var to = parseFloat(map_1.to);
                                if (to >= val && from <= val) {
                                    return map_1.text;
                                }
                            }
                        }
                        if (this.formatter) {
                            val = this.formatter(val, this.panel.decimals);
                        }
                    }
                    var isNull = lodash_1.default.isNil(val);
                    if (!isNull && !lodash_1.default.isString(val)) {
                        val = val.toString(); // convert everything to a string
                    }
                    for (var i = 0; i < this.panel.valueMaps.length; i++) {
                        var mapJson = {
                            colorValue: '',
                            colorText: '',
                        };
                        var map = this.panel.valueMaps[i];
                        // special null case
                        if (map.value === 'null') {
                            if (isNull) {
                                return map.text;
                            }
                            continue;
                        }
                        if (val === map.value) {
                            mapJson.colorValue = map.value;
                            mapJson.colorText = map.text;
                            colorSwitch.push(mapJson);
                            return map.text;
                        }
                    }
                    if (isNull) {
                        return 'null';
                    }
                    return val;
                };
                DiscretePanelCtrl.prototype.getColor = function (val) {
                    if (lodash_1.default.has(this.colorMap, val)) {
                        return this.colorMap[val];
                    }
                    // li.na add start at 2019.6.19
                    if (this._colorsPaleteCash[val] === undefined) {
                        // let c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
                        // if (colorSwitch.length === 0) {
                        //   this._colorsPaleteCash[val] = c;
                        // } else {
                        //   for (let i = 0; i < colorSwitch.length; i++) {
                        //     if (colorSwitch[i].colorText === val) {
                        //       let colorSwitchValue = this._colorsPaleteCash[colorSwitch[i].colorValue];
                        //       this._colorsPaleteCash[val] = colorSwitchValue;
                        //     } else {
                        //       this._colorsPaleteCash[val] = c;
                        //     }
                        //   }
                        // }
                        // this._colorsPaleteCash.length++;
                        var c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
                        if (colorSwitch.length === 0) {
                            if (this.checkValidValueMapping(val)) {
                                this.mappingColorsPaleteCash(val, c);
                            }
                            else {
                                this._colorsPaleteCash[val] = c;
                            }
                        }
                        else {
                            this.mappingColorsPaleteCash(val, c);
                        }
                        // li.na add end at 2019.6.19
                        this._colorsPaleteCash.length++;
                    }
                    return this._colorsPaleteCash[val];
                };
                //li.na add at 2019.7.19
                // find valid valueMapping
                DiscretePanelCtrl.prototype.checkValidValueMapping = function (val) {
                    for (var i = 0; i < this.panel.valueMaps.length; i++) {
                        if (this.panel.valueMaps[i].text === val &&
                            this.panel.valueMaps[i].text &&
                            this.panel.valueMaps[i].text !== 'undefined') {
                            return true;
                        }
                    }
                    return false;
                };
                // mappingColor
                DiscretePanelCtrl.prototype.mappingColorsPaleteCash = function (val, c) {
                    for (var i = 0; i < this.panel.valueMaps.length; i++) {
                        if (this.panel.valueMaps[i].value === '' ||
                            this.panel.valueMaps[i].value === 'null') {
                            this._colorsPaleteCash[val] = c;
                            continue;
                        }
                        if (this.panel.valueMaps[i].text === val) {
                            if (this.colorMap.hasOwnProperty(this.panel.valueMaps[i].value)) {
                                this._colorsPaleteCash[val] = this.colorMap[this.panel.valueMaps[i].value];
                            }
                            else {
                                this._colorsPaleteCash[val] = this._colorsPaleteCash[this.panel.valueMaps[i].value];
                                if (this._colorsPaleteCash[val] === 'undefined') {
                                    this._colorsPaleteCash[val] = c;
                                }
                            }
                        }
                    }
                };
                //li.na add end
                DiscretePanelCtrl.prototype.randomColor = function () {
                    var letters = 'ABCDE'.split('');
                    var color = '#';
                    for (var i = 0; i < 3; i++) {
                        color += letters[Math.floor(Math.random() * letters.length)];
                    }
                    return color;
                };
                // Override the
                DiscretePanelCtrl.prototype.applyPanelTimeOverrides = function () {
                    _super.prototype.applyPanelTimeOverrides.call(this);
                    if (this.panel.expandFromQueryS && this.panel.expandFromQueryS > 0) {
                        var from = this.range.from.subtract(this.panel.expandFromQueryS, 's');
                        this.range.from = from;
                        this.range.raw.from = from;
                    }
                };
                DiscretePanelCtrl.prototype.onDataReceived = function (dataList) {
                    if (Array.isArray(dataList) && dataList.length === 0) {
                        this.noPoints = true;
                    }
                    else {
                        var datas = [];
                        lodash_1.default.forEach(dataList, function (metric) {
                            if (Array.isArray(metric.datapoints)) {
                                datas = datas.concat(metric.datapoints);
                            }
                        });
                        if (datas.length === 0) {
                            this.noPoints = true;
                        }
                    }
                    jquery_1.default(this.canvas).css('cursor', 'pointer');
                    //    console.log('GOT', dataList);
                    this.dataList = dataList;
                    this.data = this.formatDatas();
                    this.onRender();
                    //console.log( 'data', dataList, this.data);
                };
                DiscretePanelCtrl.prototype.exportReportCsv = function () {
                    this.panel.exportReportCsv(this.dataList);
                };
                DiscretePanelCtrl.prototype.removeColorMap = function (map) {
                    var index = lodash_1.default.indexOf(this.panel.colorMaps, map);
                    this.panel.colorMaps.splice(index, 1);
                    this.updateColorInfo();
                };
                DiscretePanelCtrl.prototype.updateColorInfo = function () {
                    var cm = {};
                    for (var i = 0; i < this.panel.colorMaps.length; i++) {
                        var m = this.panel.colorMaps[i];
                        if (m.text) {
                            cm[m.text] = m.color;
                        }
                    }
                    this._colorsPaleteCash = {};
                    this._colorsPaleteCash.length = 0;
                    this.colorMap = cm;
                    this.render();
                };
                DiscretePanelCtrl.prototype.addColorMap = function (what) {
                    var _this = this;
                    if (what === 'curent') {
                        lodash_1.default.forEach(this.data, function (metric) {
                            if (metric.legendInfo) {
                                lodash_1.default.forEach(metric.legendInfo, function (info) {
                                    if (!lodash_1.default.has(_this.colorMap, info.val)) {
                                        var v;
                                        if (colorSwitch.length === 0) {
                                            v = { text: info.val, color: _this.getColor(info.val) };
                                        }
                                        else {
                                            for (var i = 0; i < colorSwitch.length; i++) {
                                                if (colorSwitch[i].colorText === info.val) {
                                                    v = { text: info.val, color: _this.getColor(colorSwitch[i].colorValue) };
                                                }
                                                else {
                                                    v = { text: info.val, color: _this.getColor(info.val) };
                                                }
                                            }
                                        }
                                        _this.panel.colorMaps.push(v);
                                        _this.colorMap[info.val] = v;
                                    }
                                });
                            }
                        });
                    }
                    else {
                        this.panel.colorMaps.push({ text: '???', color: this.randomColor() });
                    }
                    this.updateColorInfo();
                };
                DiscretePanelCtrl.prototype.removeValueMap = function (map) {
                    var index = lodash_1.default.indexOf(this.panel.valueMaps, map);
                    this.panel.valueMaps.splice(index, 1);
                    // li.na modify start at 2019.7.10
                    this.refresh();
                };
                DiscretePanelCtrl.prototype.addValueMap = function () {
                    this.panel.valueMaps.push({ value: '', op: '=', text: '' });
                };
                DiscretePanelCtrl.prototype.removeRangeMap = function (rangeMap) {
                    var index = lodash_1.default.indexOf(this.panel.rangeMaps, rangeMap);
                    this.panel.rangeMaps.splice(index, 1);
                    this.render();
                };
                DiscretePanelCtrl.prototype.addRangeMap = function () {
                    this.panel.rangeMaps.push({ from: '', to: '', text: '' });
                };
                DiscretePanelCtrl.prototype.onConfigChanged = function (update) {
                    if (update === void 0) { update = false; }
                    this.isTimeline = this.panel.display === 'timeline';
                    this.isStacked = this.panel.display === 'stacked';
                    this.formatter = null;
                    if (this.panel.units && 'none' !== this.panel.units) {
                        this.formatter = kbn_1.default.valueFormats[this.panel.units];
                    }
                    if (update) {
                        this.refresh();
                    }
                    else {
                        this.render();
                    }
                };
                DiscretePanelCtrl.prototype.getFontSize = function (fontSize) {
                    return fontsize_1.default.getValue(this.panel.adjFontSize, fontSize);
                };
                DiscretePanelCtrl.prototype.getLegendDisplay = function (info, metric) {
                    var disp = info.val;
                    // Shaun add 20220506 replace disp with Dashboard Variables
                    disp = this.replaceCodes(disp);
                    if (this.panel.showLegendPercent ||
                        this.panel.showLegendCounts ||
                        this.panel.showLegendTime) {
                        disp += ' (';
                        var hassomething = false;
                        if (this.panel.showLegendTime) {
                            disp += moment_1.default.duration(info.ms).humanize();
                            hassomething = true;
                        }
                        if (this.panel.showLegendPercent) {
                            if (hassomething) {
                                disp += ', ';
                            }
                            var dec = this.panel.legendPercentDecimals;
                            if (lodash_1.default.isNil(dec)) {
                                if (info.per > 0.98 && metric.changes.length > 1) {
                                    dec = 2;
                                }
                                else if (info.per < 0.02) {
                                    dec = 2;
                                }
                                else {
                                    dec = 0;
                                }
                            }
                            disp += kbn_1.default.valueFormats.percentunit(info.per, dec);
                            hassomething = true;
                        }
                        if (this.panel.showLegendCounts) {
                            if (hassomething) {
                                disp += ', ';
                            }
                            disp += info.count + 'x';
                        }
                        disp += ')';
                    }
                    return disp;
                };
                //------------------
                // Mouse Events
                //------------------
                DiscretePanelCtrl.prototype.showTooltip = function (evt, point, isExternal) {
                    var from = point.start;
                    var to = point.start + point.ms;
                    var time = point.ms;
                    var val = point.val;
                    // Shaun add 20220506 replace val with Dashboard Variables
                    val = this.replaceCodes(val);
                    if (this.mouse.down != null) {
                        from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
                        to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
                        time = to - from;
                        val = 'Zoom To:';
                    }
                    var body = '<div class="graph-tooltip-time">' + val + '</div>';
                    var formatTimeType = 'YYYY-MM-DD HH:mm:ss';
                    var fromData = this.timeFormatFun(from, formatTimeType);
                    var toData = this.timeFormatFun(to, formatTimeType);
                    body += '<center>';
                    body += fromData + '<br/>';
                    body += 'to<br/>';
                    body += toData + '<br/><br/>';
                    body += moment_1.default.duration(time).humanize() + '<br/>';
                    body += '</center>';
                    var pageX = 0;
                    var pageY = 0;
                    if (isExternal) {
                        var rect = this.canvas.getBoundingClientRect();
                        pageY = rect.top + evt.pos.panelRelY * rect.height;
                        if (pageY < 0 || pageY > jquery_1.default(window).innerHeight()) {
                            // Skip Hidden tooltip
                            this.$tooltip.detach();
                            return;
                        }
                        pageY += jquery_1.default(window).scrollTop();
                        var elapsed = this.range.to - this.range.from;
                        var pX = (evt.pos.x - this.range.from) / elapsed;
                        pageX = rect.left + pX * rect.width;
                    }
                    else {
                        pageX = evt.evt.pageX;
                        pageY = evt.evt.pageY;
                    }
                    this.$tooltip.html(body).place_tt(pageX + 20, pageY + 5);
                };
                DiscretePanelCtrl.prototype.onGraphHover = function (evt, showTT, isExternal) {
                    this.externalPT = false;
                    if (this.data && this.data.length) {
                        var hover = null;
                        var panelHeight = jquery_1.default('.panel-container').height();
                        var j = Math.floor(this.mouse.position.y / (this.panel.rowHeight * panelHeight * 0.001));
                        if (j < 0) {
                            j = 0;
                        }
                        if (j >= this.data.length) {
                            j = this.data.length - 1;
                        }
                        if (this.isTimeline) {
                            hover = this.data[j].changes[0];
                            for (var i = 0; i < this.data[j].changes.length; i++) {
                                if (this.data[j].changes[i].start > this.mouse.position.ts) {
                                    break;
                                }
                                hover = this.data[j].changes[i];
                            }
                            this.hoverPoint = hover;
                            if (showTT) {
                                this.externalPT = isExternal;
                                this.showTooltip(evt, hover, isExternal);
                            }
                            this.onRender(); // refresh the view
                        }
                        else if (!isExternal) {
                            if (this.isStacked) {
                                hover = this.data[j].legendInfo[0];
                                for (var i = 0; i < this.data[j].legendInfo.length; i++) {
                                    if (this.data[j].legendInfo[i].x > this.mouse.position.x) {
                                        break;
                                    }
                                    hover = this.data[j].legendInfo[i];
                                }
                                this.hoverPoint = hover;
                                this.onRender(); // refresh the view
                                if (showTT) {
                                    this.externalPT = isExternal;
                                    this.showLegandTooltip(evt.evt, hover);
                                }
                            }
                        }
                    }
                    else {
                        this.$tooltip.detach(); // make sure it is hidden
                    }
                };
                DiscretePanelCtrl.prototype.onMouseClicked = function (where) {
                    var pt = this.hoverPoint;
                    if (pt && pt.start) {
                        var range = { from: moment_1.default.utc(pt.start), to: moment_1.default.utc(pt.start + pt.ms) };
                        this.timeSrv.setTime(range);
                        this.clear();
                    }
                };
                DiscretePanelCtrl.prototype.onMouseSelectedRange = function (range) {
                    this.timeSrv.setTime(range);
                    this.clear();
                };
                DiscretePanelCtrl.prototype.clear = function () {
                    this.mouse.position = null;
                    this.mouse.down = null;
                    this.hoverPoint = null;
                    jquery_1.default(this.canvas).css('cursor', 'wait');
                    app_events_1.default.emit('graph-hover-clear');
                    this.render();
                };
                DiscretePanelCtrl.prototype._updateRenderDimensions = function () {
                    var _this = this;
                    this._renderDimensions = {};
                    var domObj = jquery_1.default('.panel-container');
                    if (domObj.length > 0) {
                        var maxHeight;
                        for (var i = 0; i < domObj.length; i++) {
                            if (i === 0) {
                                var a = domObj[i];
                                maxHeight = a.getBoundingClientRect().height;
                            }
                            else {
                                var b = domObj[i];
                                var domHeight = b.getBoundingClientRect().height;
                                if (domHeight > maxHeight) {
                                    maxHeight = domHeight;
                                }
                            }
                        }
                    }
                    var panelHeight = jquery_1.default('.panel-container').height();
                    if (panelHeight < maxHeight) {
                        panelHeight = maxHeight;
                    }
                    var rect = (this._renderDimensions.rect = this.wrap.getBoundingClientRect());
                    var rows = (this._renderDimensions.rows = this.data.length);
                    var rowHeight = (this._renderDimensions.rowHeight =
                        this.panel.rowHeight * panelHeight * 0.001);
                    var rowsHeight = (this._renderDimensions.rowsHeight = rowHeight * rows);
                    var timeHeight = this.panel.showTimeAxis ? 14 + this.panel.textSizeTime : 0;
                    var height = (this._renderDimensions.height = rowsHeight + timeHeight);
                    var width = (this._renderDimensions.width = rect.width);
                    var top = 0;
                    var elapsed = this.range.to - this.range.from;
                    this._renderDimensions.matrix = [];
                    lodash_1.default.forEach(this.data, function (metric) {
                        var positions = [];
                        if (_this.isTimeline) {
                            var lastBS = 0;
                            var point = metric.changes[0];
                            for (var i_1 = 0; i_1 < metric.changes.length; i_1++) {
                                point = metric.changes[i_1];
                                if (point.start <= _this.range.to) {
                                    var xt = Math.max(point.start - _this.range.from, 0);
                                    var x = xt / elapsed * width;
                                    positions.push(x);
                                }
                            }
                        }
                        if (_this.isStacked) {
                            var point = null;
                            var start = _this.range.from;
                            for (var i_2 = 0; i_2 < metric.legendInfo.length; i_2++) {
                                point = metric.legendInfo[i_2];
                                var xt = Math.max(start - _this.range.from, 0);
                                var x = xt / elapsed * width;
                                positions.push(x);
                                start += point.ms;
                            }
                        }
                        _this._renderDimensions.matrix.push({
                            y: top,
                            positions: positions,
                        });
                        top += rowHeight;
                    });
                };
                DiscretePanelCtrl.prototype._updateSelectionMatrix = function () {
                    var selectionPredicates = {
                        all: function () {
                            return true;
                        },
                        crosshairHover: function (i, j) {
                            if (j + 1 === this.data[i].changes.length) {
                                return this.data[i].changes[j].start <= this.mouse.position.ts;
                            }
                            return (this.data[i].changes[j].start <= this.mouse.position.ts &&
                                this.mouse.position.ts < this.data[i].changes[j + 1].start);
                        },
                        mouseX: function (i, j) {
                            var row = this._renderDimensions.matrix[i];
                            if (j + 1 === row.positions.length) {
                                return row.positions[j] <= this.mouse.position.x;
                            }
                            return (row.positions[j] <= this.mouse.position.x &&
                                this.mouse.position.x < row.positions[j + 1]);
                        },
                        metric: function (i) {
                            return this.data[i] === this._selectedMetric;
                        },
                        legendItem: function (i, j) {
                            if (this.data[i] !== this._selectedMetric) {
                                return false;
                            }
                            return this._selectedLegendItem.val === this._getVal(i, j);
                        },
                    };
                    function getPredicate() {
                        if (this._selectedLegendItem !== undefined) {
                            return 'legendItem';
                        }
                        if (this._selectedMetric !== undefined) {
                            return 'metric';
                        }
                        if (this.mouse.down !== null) {
                            return 'all';
                        }
                        if (this.panel.highlightOnMouseover && this.mouse.position != null) {
                            if (this.isTimeline) {
                                return 'crosshairHover';
                            }
                            if (this.isStacked) {
                                return 'mouseX';
                            }
                        }
                        return 'all';
                    }
                    var pn = getPredicate.bind(this)();
                    var predicate = selectionPredicates[pn].bind(this);
                    this._selectionMatrix = [];
                    for (var i = 0; i < this._renderDimensions.matrix.length; i++) {
                        var rs = [];
                        var r = this._renderDimensions.matrix[i];
                        for (var j = 0; j < r.positions.length; j++) {
                            rs.push(predicate(i, j));
                        }
                        this._selectionMatrix.push(rs);
                    }
                };
                DiscretePanelCtrl.prototype._updateCanvasSize = function () {
                    this.canvas.width = this._renderDimensions.width * this._devicePixelRatio;
                    this.canvas.height = this._renderDimensions.height * this._devicePixelRatio;
                    jquery_1.default(this.canvas).css('width', this._renderDimensions.width + 'px');
                    jquery_1.default(this.canvas).css('height', this._renderDimensions.height + 'px');
                    this.context.scale(this._devicePixelRatio, this._devicePixelRatio);
                };
                DiscretePanelCtrl.prototype._getVal = function (metricIndex, rectIndex) {
                    var point = undefined;
                    if (this.isTimeline) {
                        point = this.data[metricIndex].changes[rectIndex];
                    }
                    if (this.isStacked) {
                        point = this.data[metricIndex].legendInfo[rectIndex];
                    }
                    return point.val;
                };
                DiscretePanelCtrl.prototype._renderRects = function () {
                    var _this = this;
                    var matrix = this._renderDimensions.matrix;
                    var ctx = this.context;
                    lodash_1.default.forEach(this.data, function (metric, i) {
                        var rowObj = matrix[i];
                        for (var j = 0; j < rowObj.positions.length; j++) {
                            var currentX = rowObj.positions[j];
                            var nextX = _this._renderDimensions.width;
                            if (j + 1 !== rowObj.positions.length) {
                                nextX = rowObj.positions[j + 1];
                            }
                            ctx.fillStyle = _this.getColor(_this._getVal(i, j));
                            var globalAlphaTemp = ctx.globalAlpha;
                            if (!_this._selectionMatrix[i][j]) {
                                ctx.globalAlpha = 0.3;
                            }
                            ctx.fillRect(currentX, matrix[i].y, nextX - currentX, _this._renderDimensions.rowHeight);
                            ctx.globalAlpha = globalAlphaTemp;
                        }
                        if (i > 0) {
                            var top_1 = matrix[i].y;
                            ctx.strokeStyle = _this.panel.lineColor;
                            ctx.beginPath();
                            ctx.moveTo(0, top_1);
                            ctx.lineTo(_this._renderDimensions.width, top_1);
                            ctx.stroke();
                        }
                    });
                };
                DiscretePanelCtrl.prototype._renderLabels = function () {
                    var _this = this;
                    var ctx = this.context;
                    ctx.lineWidth = 1;
                    ctx.textBaseline = 'middle';
                    // ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';
                    ctx.font =
                        this.getFontSize(this.panel.FontSizeValue) +
                            ' "Open Sans", Helvetica, Arial, sans-serif';
                    var offset = 2;
                    var rowHeight = this._renderDimensions.rowHeight;
                    lodash_1.default.forEach(this.data, function (metric, i) {
                        var _a = _this._renderDimensions.matrix[i], y = _a.y, positions = _a.positions;
                        var centerY = y + rowHeight / 2;
                        // let labelPositionMetricName = y + rectHeight - this.panel.textSize / 2;
                        // let labelPositionLastValue = y + rectHeight - this.panel.textSize / 2;
                        // let labelPositionValue = y + this.panel.textSize / 2;
                        var labelPositionMetricName = centerY;
                        var labelPositionLastValue = centerY;
                        var labelPositionValue = centerY;
                        var hoverTextStart = -1;
                        var hoverTextEnd = -1;
                        if (_this.mouse.position) {
                            for (var j = 0; j < positions.length; j++) {
                                if (positions[j] <= _this.mouse.position.x) {
                                    if (j >= positions.length - 1 || positions[j + 1] >= _this.mouse.position.x) {
                                        //Shaun modify 20220506 replace val with Dashboard Variables
                                        var val = _this.replaceCodes(_this._getVal(i, j));
                                        ctx.fillStyle = _this.panel.valueTextColor;
                                        ctx.textAlign = 'left';
                                        hoverTextStart = positions[j] + offset;
                                        ctx.fillText(val, hoverTextStart, labelPositionValue);
                                        var txtinfo = ctx.measureText(val);
                                        hoverTextEnd = hoverTextStart + txtinfo.width + 4;
                                        break;
                                    }
                                }
                            }
                        }
                        var minTextSpot = 0;
                        var maxTextSpot = _this._renderDimensions.width;
                        if (_this.panel.writeMetricNames) {
                            ctx.fillStyle = _this.panel.metricNameColor;
                            ctx.textAlign = 'left';
                            var txtinfo = ctx.measureText(metric.name);
                            if (hoverTextStart < 0 || hoverTextStart > txtinfo.width) {
                                ctx.fillText(metric.name, offset, labelPositionMetricName);
                                minTextSpot = offset + ctx.measureText(metric.name).width + 2;
                            }
                        }
                        if (_this.panel.writeLastValue && positions.length > 0) {
                            var val = _this._getVal(i, positions.length - 1);
                            ctx.fillStyle = _this.panel.valueTextColor;
                            ctx.textAlign = 'right';
                            var txtinfo = ctx.measureText(val);
                            var xval = _this._renderDimensions.width - offset - txtinfo.width;
                            if (xval > hoverTextEnd) {
                                ctx.fillText(val, _this._renderDimensions.width - offset, labelPositionLastValue);
                                maxTextSpot = _this._renderDimensions.width - ctx.measureText(val).width - 10;
                            }
                        }
                        if (_this.panel.writeAllValues) {
                            ctx.fillStyle = _this.panel.valueTextColor;
                            ctx.textAlign = 'left';
                            for (var j = 0; j < positions.length; j++) {
                                var val = _this._getVal(i, j);
                                var nextX = _this._renderDimensions.width;
                                if (j + 1 !== positions.length) {
                                    nextX = positions[j + 1];
                                }
                                var x = positions[j];
                                if (x > minTextSpot) {
                                    var width = nextX - x;
                                    if (maxTextSpot > x + width) {
                                        // This clips the text within the given bounds
                                        ctx.save();
                                        ctx.rect(x, y, width, rowHeight);
                                        ctx.clip();
                                        ctx.fillText(val, x + offset, labelPositionValue);
                                        ctx.restore();
                                    }
                                }
                            }
                        }
                    });
                };
                DiscretePanelCtrl.prototype._renderSelection = function () {
                    if (this.mouse.down === null) {
                        return;
                    }
                    if (this.mouse.position === null) {
                        return;
                    }
                    if (!this.isTimeline) {
                        return;
                    }
                    var ctx = this.context;
                    var height = this._renderDimensions.height;
                    var xmin = Math.min(this.mouse.position.x, this.mouse.down.x);
                    var xmax = Math.max(this.mouse.position.x, this.mouse.down.x);
                    ctx.fillStyle = 'rgba(110, 110, 110, 0.5)';
                    ctx.strokeStyle = 'rgba(110, 110, 110, 0.5)';
                    ctx.beginPath();
                    ctx.fillRect(xmin, 0, xmax - xmin, height);
                    ctx.strokeRect(xmin, 0, xmax - xmin, height);
                };
                DiscretePanelCtrl.prototype._renderTimeAxis = function () {
                    if (!this.panel.showTimeAxis || this.noPoints) {
                        return;
                    }
                    var panelHeight = jquery_1.default('.panel-container').height();
                    var ctx = this.context;
                    var rows = this.data.length;
                    var rowHeight = this.panel.rowHeight * panelHeight * 0.001;
                    var height = this._renderDimensions.height;
                    var width = this._renderDimensions.width;
                    var top = this._renderDimensions.rowsHeight;
                    var headerColumnIndent = 0; // header inset (zero for now)
                    ctx.font = this.panel.textSizeTime + ' "Open Sans", Helvetica, Arial, sans-serif';
                    // ctx.fillStyle = this.panel.timeTextColor;
                    ctx.fillStyle = jquery_1.default('.discrete-Theme').css('color');
                    ctx.textAlign = 'left';
                    // ctx.strokeStyle = this.panel.timeTextColor;
                    ctx.strokeStyle = jquery_1.default('.discrete-Theme').css('color');
                    ctx.textBaseline = 'top';
                    ctx.setLineDash([7, 5]); // dashes are 5px and spaces are 3px
                    ctx.lineDashOffset = 0;
                    var min = lodash_1.default.isUndefined(this.range.from) ? null : this.range.from.valueOf();
                    var max = lodash_1.default.isUndefined(this.range.to) ? null : this.range.to.valueOf();
                    var minPxInterval = ctx.measureText('12/33 24:59').width * 2;
                    var estNumTicks = width / minPxInterval;
                    var estTimeInterval = (max - min) / estNumTicks;
                    var timeResolution = this.getTimeResolution(estTimeInterval);
                    var pixelStep = timeResolution / (max - min) * width;
                    var nextPointInTime = this.roundDate(min, timeResolution) + timeResolution;
                    var xPos = headerColumnIndent + (nextPointInTime - min) / (max - min) * width;
                    var timeFormat = this.timeSrv.graphTimeFormat(timeResolution / 1000, min, max);
                    while (nextPointInTime < max) {
                        // draw ticks
                        ctx.beginPath();
                        ctx.moveTo(xPos, top + 5);
                        ctx.lineTo(xPos, 0);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        // draw time label
                        var date = new Date(nextPointInTime);
                        var dateStr = this.timeFormatFun(date, timeFormat);
                        var xOffset = ctx.measureText(dateStr).width / 2;
                        ctx.fillText(dateStr, xPos - xOffset, top + 10);
                        nextPointInTime += timeResolution;
                        xPos += pixelStep;
                    }
                };
                DiscretePanelCtrl.prototype.timeFormatFun = function (date, timeFormat) {
                    var dateTimeFormat = this.timeSrv.dateTimeFormatFun();
                    var dashboardTimeZone = this.dashboard.getTimezone();
                    return dateTimeFormat(date.valueOf(), {
                        format: timeFormat,
                        timeZone: dashboardTimeZone,
                    });
                };
                DiscretePanelCtrl.prototype._renderCrosshair = function () {
                    if (this.mouse.down != null) {
                        return;
                    }
                    if (this.mouse.position === null) {
                        return;
                    }
                    if (!this.isTimeline) {
                        return;
                    }
                    var panelHeight = jquery_1.default('.panel-container').height();
                    var ctx = this.context;
                    var rows = this.data.length;
                    var rowHeight = this.panel.rowHeight * panelHeight * 0.001;
                    var height = this._renderDimensions.height;
                    ctx.beginPath();
                    ctx.moveTo(this.mouse.position.x, 0);
                    ctx.lineTo(this.mouse.position.x, height);
                    ctx.strokeStyle = this.panel.crosshairColor;
                    ctx.setLineDash([]);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    // Draw a Circle around the point if showing a tooltip
                    if (this.externalPT && rows > 1) {
                        ctx.beginPath();
                        ctx.arc(this.mouse.position.x, this.mouse.position.y, 3, 0, 2 * Math.PI, false);
                        ctx.fillStyle = this.panel.crosshairColor;
                        ctx.fill();
                        ctx.lineWidth = 1;
                    }
                };
                DiscretePanelCtrl.prototype.handleValueTextChange = function (valueMap) {
                    i18n_1.setI18n(valueMap, 'text', valueMap.text, this.dashboard.panelLanguage);
                };
                DiscretePanelCtrl.prototype.handleRangeTextChange = function (rangeMap) {
                    i18n_1.setI18n(rangeMap, 'text', rangeMap.text, this.dashboard.panelLanguage);
                };
                DiscretePanelCtrl.prototype.handleLegnedFontSizeChange = function () {
                    i18n_1.setI18n(this.panel, 'FontSize', this.panel.FontSize, this.dashboard.panelLanguage);
                };
                DiscretePanelCtrl.prototype.handleFontSizeChange = function () {
                    i18n_1.setI18n(this.panel, 'FontSizeValue', this.panel.FontSizeValue, this.dashboard.panelLanguage);
                };
                DiscretePanelCtrl.prototype.formatDatas = function () {
                    var _this = this;
                    var data = [];
                    lodash_1.default.forEach(this.dataList, function (metric) {
                        if ('table' === metric.type) {
                            if ('time' !== metric.columns[0].type) {
                                throw new Error('Expected a time column from the table format');
                            }
                            var last = null;
                            for (var i = 1; i < metric.columns.length; i++) {
                                var res = new distinct_points_1.DistinctPoints(metric.columns[i].text);
                                for (var j = 0; j < metric.rows.length; j++) {
                                    var row = metric.rows[j];
                                    res.add(row[0], _this.formatValue(row[i]));
                                }
                                res.finish(_this);
                                data.push(res);
                            }
                        }
                        else {
                            // ��ĳһʱ���ϵ�
                            if (_this.panel.nullValue) {
                                var length = metric.datapoints.length;
                                metric.datapoints[length - 1][0] = null;
                            }
                            var res = new distinct_points_1.DistinctPoints(metric.target);
                            lodash_1.default.forEach(metric.datapoints, function (point) {
                                res.add(point[1], _this.formatValue(point[0]));
                            });
                            res.finish(_this);
                            data.push(res);
                        }
                    });
                    return data;
                };
                DiscretePanelCtrl.prototype.initI18n = function () {
                    if (this.dashboard.panelLanguage) {
                        for (var _i = 0, _a = this.panel.valueMaps; _i < _a.length; _i++) {
                            var valueMap = _a[_i];
                            valueMap.text = i18n_1.getI18n(valueMap, 'text', this.dashboard.panelLanguage);
                        }
                        for (var _b = 0, _c = this.panel.rangeMaps; _b < _c.length; _b++) {
                            var rangeMap = _c[_b];
                            rangeMap.text = i18n_1.getI18n(rangeMap, 'text', this.dashboard.panelLanguage);
                        }
                        this.panel.FontSize = i18n_1.getI18n(this.panel, 'FontSize', this.dashboard.panelLanguage);
                        this.panel.FontSizeValue = i18n_1.getI18n(this.panel, 'FontSizeValue', this.dashboard.panelLanguage);
                    }
                };
                DiscretePanelCtrl.templateUrl = 'partials/module.html';
                DiscretePanelCtrl.scrollable = true;
                return DiscretePanelCtrl;
            })(canvas_metric_1.CanvasPanelCtrl);
            exports_1("PanelCtrl", DiscretePanelCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map