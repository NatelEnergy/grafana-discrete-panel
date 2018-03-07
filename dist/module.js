///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['./canvas-metric', './distinct-points', 'lodash', 'jquery', 'moment', 'app/core/utils/kbn', 'app/core/app_events'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var canvas_metric_1, distinct_points_1, lodash_1, jquery_1, moment_1, kbn_1, app_events_1;
    var grafanaColors, DiscretePanelCtrl;
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
            }],
        execute: function() {
            grafanaColors = [
                "#7EB26D", "#EAB839", "#6ED0E0", "#EF843C", "#E24D42", "#1F78C1", "#BA43A9", "#705DA0",
                "#508642", "#CCA300", "#447EBC", "#C15C17", "#890F02", "#0A437C", "#6D1F62", "#584477",
                "#B7DBAB", "#F4D598", "#70DBED", "#F9BA8F", "#F29191", "#82B5D8", "#E5A8E2", "#AEA2E0",
                "#629E51", "#E5AC0E", "#64B0C8", "#E0752D", "#BF1B00", "#0A50A1", "#962D82", "#614D93",
                "#9AC48A", "#F2C96D", "#65C5DB", "#F9934E", "#EA6460", "#5195CE", "#D683CE", "#806EB7",
                "#3F6833", "#967302", "#2F575E", "#99440A", "#58140C", "#052B51", "#511749", "#3F2B5B",
                "#E0F9D7", "#FCEACA", "#CFFAFF", "#F9E2D2", "#FCE2DE", "#BADFF4", "#F9D9F9", "#DEDAF7"
            ]; // copied from public/app/core/utils/colors.ts because of changes in grafana 4.6.0
            //(https://github.com/grafana/grafana/blob/master/PLUGIN_DEV.md)
            DiscretePanelCtrl = (function (_super) {
                __extends(DiscretePanelCtrl, _super);
                function DiscretePanelCtrl($scope, $injector) {
                    _super.call(this, $scope, $injector);
                    this.defaults = {
                        display: 'timeline',
                        rowHeight: 50,
                        valueMaps: [
                            { value: 'null', op: '=', text: 'N/A' }
                        ],
                        mappingTypes: [
                            { name: 'value to text', value: 1 },
                            { name: 'range to text', value: 2 },
                        ],
                        rangeMaps: [
                            { from: 'null', to: 'null', text: 'N/A' }
                        ],
                        colorMaps: [
                            { text: 'N/A', color: '#CCC' }
                        ],
                        metricNameColor: '#000000',
                        valueTextColor: '#000000',
                        backgroundColor: 'rgba(128, 128, 128, 0.1)',
                        lineColor: 'rgba(128, 128, 128, 1.0)',
                        textSize: 24,
                        extendLastValue: true,
                        writeLastValue: true,
                        writeAllValues: false,
                        writeMetricNames: false,
                        showLegend: true,
                        showLegendNames: true,
                        showLegendValues: true,
                        showLegendPercent: true,
                        highlightOnMouseover: true,
                        legendSortBy: '-ms',
                        units: 'short'
                    };
                    this.data = null;
                    this.externalPT = false;
                    this.isTimeline = false;
                    this.isStacked = false;
                    this.hoverPoint = null;
                    this.colorMap = {};
                    this._colorsPaleteCash = null;
                    this.unitFormats = null; // only used for editor
                    this.formatter = null;
                    this._renderDimensions = {};
                    this._selectionMatrix = [];
                    // defaults configs
                    lodash_1.default.defaultsDeep(this.panel, this.defaults);
                    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
                    this.events.on('render', this.onRender.bind(this));
                    this.events.on('data-received', this.onDataReceived.bind(this));
                    this.events.on('data-error', this.onDataError.bind(this));
                    this.events.on('refresh', this.onRefresh.bind(this));
                    this.updateColorInfo();
                    this.onConfigChanged();
                }
                DiscretePanelCtrl.prototype.onDataError = function (err) {
                    console.log("onDataError", err);
                };
                DiscretePanelCtrl.prototype.onInitEditMode = function () {
                    this.unitFormats = kbn_1.default.getUnitFormats();
                    this.addEditorTab('Options', 'public/plugins/natel-discrete-panel/partials/editor.options.html', 1);
                    this.addEditorTab('Legend', 'public/plugins/natel-discrete-panel/partials/editor.legend.html', 3);
                    this.addEditorTab('Colors', 'public/plugins/natel-discrete-panel/partials/editor.colors.html', 4);
                    this.addEditorTab('Mappings', 'public/plugins/natel-discrete-panel/partials/editor.mappings.html', 5);
                    this.editorTabIndex = 1;
                    this.refresh();
                };
                DiscretePanelCtrl.prototype.onRender = function () {
                    if (this.data == null || !(this.context)) {
                        return;
                    }
                    this._updateRenderDimensions();
                    this._updateSelectionMatrix();
                    this._updateCanvasSize();
                    this._renderRects();
                    this._renderLabels();
                    this._renderSelection();
                    this._renderCrosshair();
                };
                DiscretePanelCtrl.prototype.showLegandTooltip = function (pos, info) {
                    var body = '<div class="graph-tooltip-time">' + info.val + '</div>';
                    body += "<center>";
                    if (info.count > 1) {
                        body += info.count + " times<br/>for<br/>";
                    }
                    body += moment_1.default.duration(info.ms).humanize();
                    if (info.count > 1) {
                        body += "<br/>total";
                    }
                    body += "</center>";
                    this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
                };
                DiscretePanelCtrl.prototype.clearTT = function () {
                    this.$tooltip.detach();
                };
                DiscretePanelCtrl.prototype.formatValue = function (val) {
                    if (lodash_1.default.isNumber(val)) {
                        if (this.panel.rangeMaps) {
                            for (var i = 0; i < this.panel.rangeMaps.length; i++) {
                                var map = this.panel.rangeMaps[i];
                                // value/number to range mapping
                                var from = parseFloat(map.from);
                                var to = parseFloat(map.to);
                                if (to >= val && from <= val) {
                                    return map.text;
                                }
                            }
                        }
                        if (this.formatter) {
                            return this.formatter(val, this.panel.decimals);
                        }
                    }
                    var isNull = lodash_1.default.isNil(val);
                    if (!isNull && !lodash_1.default.isString(val)) {
                        val = val.toString(); // convert everything to a string
                    }
                    for (var i = 0; i < this.panel.valueMaps.length; i++) {
                        var map_1 = this.panel.valueMaps[i];
                        // special null case
                        if (map_1.value === 'null') {
                            if (isNull) {
                                return map_1.text;
                            }
                            continue;
                        }
                        if (val === map_1.value) {
                            return map_1.text;
                        }
                    }
                    if (isNull) {
                        return "null";
                    }
                    return val;
                };
                DiscretePanelCtrl.prototype.getColor = function (val) {
                    if (lodash_1.default.has(this.colorMap, val)) {
                        return this.colorMap[val];
                    }
                    if (this._colorsPaleteCash[val] === undefined) {
                        var c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
                        this._colorsPaleteCash[val] = c;
                        this._colorsPaleteCash.length++;
                    }
                    return this._colorsPaleteCash[val];
                };
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
                    if (this.panel.expandFromQueryS > 0) {
                        var from = this.range.from.subtract(this.panel.expandFromQueryS, 's');
                        this.range.from = from;
                        this.range.raw.from = from;
                    }
                };
                DiscretePanelCtrl.prototype.onDataReceived = function (dataList) {
                    var _this = this;
                    jquery_1.default(this.canvas).css('cursor', 'pointer');
                    //    console.log('GOT', dataList);
                    var data = [];
                    lodash_1.default.forEach(dataList, function (metric) {
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
                            var res = new distinct_points_1.DistinctPoints(metric.target);
                            lodash_1.default.forEach(metric.datapoints, function (point) {
                                res.add(point[1], _this.formatValue(point[0]));
                            });
                            res.finish(_this);
                            data.push(res);
                        }
                    });
                    this.data = data;
                    this.onRender();
                    //console.log( 'data', dataList, this.data);
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
                                    if (!lodash_1.default.has(info.val)) {
                                        _this.panel.colorMaps.push({ text: info.val, color: _this.getColor(info.val) });
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
                    this.render();
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
                    //console.log( "Config changed...");
                    this.isTimeline = this.panel.display == 'timeline';
                    this.isStacked = this.panel.display == 'stacked';
                    this.formatter = null;
                    if (this.panel.units && 'none' != this.panel.units) {
                        this.formatter = kbn_1.default.valueFormats[this.panel.units];
                    }
                    if (update) {
                        this.refresh();
                    }
                    else {
                        this.render();
                    }
                };
                DiscretePanelCtrl.prototype.getLegendDisplay = function (info, metric) {
                    var disp = info.val;
                    if (this.panel.showLegendPercent || this.panel.showLegendCounts || this.panel.showLegendTime) {
                        disp += " (";
                        var hassomething = false;
                        if (this.panel.showLegendTime) {
                            disp += moment_1.default.duration(info.ms).humanize();
                            hassomething = true;
                        }
                        if (this.panel.showLegendPercent) {
                            if (hassomething) {
                                disp += ", ";
                            }
                            var dec = this.panel.legendPercentDecimals;
                            if (lodash_1.default.isNil(dec)) {
                                if (info.per > .98 && metric.changes.length > 1) {
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
                                disp += ", ";
                            }
                            disp += info.count + "x";
                        }
                        disp += ")";
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
                    if (this.mouse.down != null) {
                        from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
                        to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
                        time = to - from;
                        val = "Zoom To:";
                    }
                    var body = '<div class="graph-tooltip-time">' + val + '</div>';
                    body += "<center>";
                    body += this.dashboard.formatDate(moment_1.default(from)) + "<br/>";
                    body += "to<br/>";
                    body += this.dashboard.formatDate(moment_1.default(to)) + "<br/><br/>";
                    body += moment_1.default.duration(time).humanize() + "<br/>";
                    body += "</center>";
                    var pageX = 0;
                    var pageY = 0;
                    if (isExternal) {
                        var rect = this.canvas.getBoundingClientRect();
                        pageY = rect.top + (evt.pos.panelRelY * rect.height);
                        if (pageY < 0 || pageY > jquery_1.default(window).innerHeight()) {
                            // Skip Hidden tooltip
                            this.$tooltip.detach();
                            return;
                        }
                        pageY += jquery_1.default(window).scrollTop();
                        var elapsed = this.range.to - this.range.from;
                        var pX = (evt.pos.x - this.range.from) / elapsed;
                        pageX = rect.left + (pX * rect.width);
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
                        var j = Math.floor(this.mouse.position.y / this.panel.rowHeight);
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
                    var rect = this._renderDimensions.rect = this.wrap.getBoundingClientRect();
                    var rows = this._renderDimensions.rows = this.data.length;
                    var rowHeight = this._renderDimensions.rowHeight = this.panel.rowHeight;
                    var height = this._renderDimensions.height = rowHeight * rows;
                    var width = this._renderDimensions.width = rect.width;
                    var rectHeight = this._renderDimensions.rectHeight = rowHeight;
                    var top = 0;
                    var elapsed = this.range.to - this.range.from;
                    this._renderDimensions.matrix = [];
                    lodash_1.default.forEach(this.data, function (metric) {
                        var positions = [];
                        if (_this.isTimeline) {
                            var lastBS = 0;
                            var point = metric.changes[0];
                            for (var i = 0; i < metric.changes.length; i++) {
                                point = metric.changes[i];
                                if (point.start <= _this.range.to) {
                                    var xt = Math.max(point.start - _this.range.from, 0);
                                    var x = (xt / elapsed) * width;
                                    positions.push(x);
                                }
                            }
                        }
                        if (_this.isStacked) {
                            var point = null;
                            var start = _this.range.from;
                            for (var i = 0; i < metric.legendInfo.length; i++) {
                                point = metric.legendInfo[i];
                                var xt = Math.max(start - _this.range.from, 0);
                                var x = (xt / elapsed) * width;
                                positions.push(x);
                                start += point.ms;
                            }
                        }
                        _this._renderDimensions.matrix.push({
                            y: top,
                            positions: positions
                        });
                        top += rowHeight;
                    });
                };
                DiscretePanelCtrl.prototype._updateSelectionMatrix = function () {
                    var selectionPredicates = {
                        all: function () { return true; },
                        crosshairHover: function (i, j) {
                            if (j + 1 === this.data[i].changes.length) {
                                return this.data[i].changes[j].start <= this.mouse.position.ts;
                            }
                            return this.data[i].changes[j].start <= this.mouse.position.ts &&
                                this.mouse.position.ts < this.data[i].changes[j + 1].start;
                        },
                        mouseX: function (i, j) {
                            var row = this._renderDimensions.matrix[i];
                            if (j + 1 === row.positions.length) {
                                return row.positions[j] <= this.mouse.position.x;
                            }
                            return row.positions[j] <= this.mouse.position.x &&
                                this.mouse.position.x < row.positions[j + 1];
                        },
                        metric: function (i) {
                            return this.data[i] === this._selectedMetric;
                        },
                        legendItem: function (i, j) {
                            if (this.data[i] !== this._selectedMetric) {
                                return false;
                            }
                            return this._selectedLegendItem.val === this._getVal(i, j);
                        }
                    };
                    function getPredicate() {
                        if (this._selectedLegendItem !== undefined) {
                            return 'legendItem';
                        }
                        ;
                        if (this._selectedMetric !== undefined) {
                            return 'metric';
                        }
                        ;
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
                DiscretePanelCtrl.prototype._getWidth = function (metricIndex, rectIndex) {
                    var positions = this._renderDimensions.matrix[metricIndex].positions;
                    if (rectIndex + 1 === positions.length) {
                        return this._renderDimensions.width - positions[rectIndex];
                    }
                    return positions[rectIndex + 1] - positions[rectIndex];
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
                            ctx.fillRect(currentX, matrix[i].y, nextX - currentX, _this._renderDimensions.rectHeight);
                            ctx.globalAlpha = globalAlphaTemp;
                        }
                    });
                };
                DiscretePanelCtrl.prototype._renderLabels = function () {
                    var _this = this;
                    var ctx = this.context;
                    ctx.lineWidth = 1;
                    ctx.textBaseline = 'middle';
                    ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';
                    function findLength(text, width) {
                        for (var length = 1; length < text.length + 1; length++) {
                            var testLine = text.substr(0, length);
                            var measure = ctx.measureText(testLine);
                            if (measure.width > width) {
                                break;
                            }
                        }
                        return text.substr(0, length - 1);
                    }
                    lodash_1.default.forEach(this.data, function (metric, i) {
                        var _a = _this._renderDimensions.matrix[i], y = _a.y, positions = _a.positions;
                        var rectHeight = _this._renderDimensions.rectHeight;
                        var centerV = y + (rectHeight / 2);
                        // var labelPositionMetricName = y + rectHeight - this.panel.textSize / 2;
                        // var labelPositionLastValue = y + rectHeight - this.panel.textSize / 2;
                        // var labelPositionValue = y + this.panel.textSize / 2;
                        var labelPositionMetricName = y + (rectHeight / 2);
                        var labelPositionLastValue = labelPositionMetricName;
                        var labelPositionValue = labelPositionMetricName;
                        if (_this.mouse.position == null) {
                            if (_this.panel.writeMetricNames) {
                                ctx.fillStyle = _this.panel.metricNameColor;
                                ctx.textAlign = 'left';
                                ctx.fillText(metric.name, 10, labelPositionMetricName);
                            }
                            if (_this.panel.writeLastValue) {
                                var val = _this._getVal(i, positions.length - 1);
                                ctx.fillStyle = _this.panel.valueTextColor;
                                ctx.textAlign = 'right';
                                ctx.fillText(val, _this._renderDimensions.width, labelPositionLastValue);
                            }
                        }
                        else {
                            for (var j = 0; j < positions.length; j++) {
                                if (positions[j] <= _this.mouse.position.x) {
                                    if (j >= positions.length - 1 || positions[j + 1] >= _this.mouse.position.x) {
                                        var val = _this._getVal(i, j);
                                        ctx.fillStyle = _this.panel.valueTextColor;
                                        ctx.textAlign = 'left';
                                        ctx.fillText(val, positions[j], labelPositionValue);
                                        break;
                                    }
                                }
                            }
                        }
                        if (_this.panel.writeAllValues) {
                            ctx.fillStyle = _this.panel.valueTextColor;
                            ctx.textAlign = 'left';
                            for (var j = 0; j < positions.length; j++) {
                                var val = _this._getVal(i, j);
                                var width = _this._getWidth(i, j);
                                var cval = findLength(val, width);
                                ctx.fillText(cval, positions[j], labelPositionValue);
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
                    ctx.fillStyle = "rgba(110, 110, 110, 0.5)";
                    ctx.strokeStyle = "rgba(110, 110, 110, 0.5)";
                    ctx.beginPath();
                    ctx.fillRect(xmin, 0, xmax - xmin, height);
                    ctx.strokeRect(xmin, 0, xmax - xmin, height);
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
                    var ctx = this.context;
                    var rows = this.data.length;
                    var rowHeight = this.panel.rowHeight;
                    var height = this._renderDimensions.height;
                    ctx.beginPath();
                    ctx.moveTo(this.mouse.position.x, 0);
                    ctx.lineTo(this.mouse.position.x, height);
                    ctx.strokeStyle = this.panel.crosshairColor;
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
                DiscretePanelCtrl.templateUrl = 'partials/module.html';
                return DiscretePanelCtrl;
            })(canvas_metric_1.CanvasPanelCtrl);
            exports_1("PanelCtrl", DiscretePanelCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map