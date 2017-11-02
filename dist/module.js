///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['./canvas-metric', './distinct-points', 'lodash', 'jquery', 'moment', 'app/core/utils/kbn', 'app/core/app_events'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var canvas_metric_1, distinct_points_1, lodash_1, jquery_1, moment_1, kbn_1, app_events_1;
    var DiscretePanelCtrl;
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
                        legendSortBy: '-ms'
                    };
                    this.data = null;
                    this.externalPT = false;
                    this.isTimeline = false;
                    this.hoverPoint = null;
                    this.colorMap = {};
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
                    this.addEditorTab('Options', 'public/plugins/natel-discrete-panel/partials/editor.options.html', 1);
                    this.addEditorTab('Legend', 'public/plugins/natel-discrete-panel/partials/editor.legend.html', 3);
                    this.addEditorTab('Colors', 'public/plugins/natel-discrete-panel/partials/editor.colors.html', 4);
                    this.addEditorTab('Mappings', 'public/plugins/natel-discrete-panel/partials/editor.mappings.html', 5);
                    this.editorTabIndex = 1;
                    this.refresh();
                };
                DiscretePanelCtrl.prototype.onRender = function () {
                    var _this = this;
                    if (this.data == null || !(this.context)) {
                        return;
                    }
                    //   console.log( 'render', this.data);
                    var rect = this.wrap.getBoundingClientRect();
                    var rows = this.data.length;
                    var rowHeight = this.panel.rowHeight;
                    var height = rowHeight * rows;
                    var width = rect.width;
                    this.canvas.width = width * this._devicePixelRatio;
                    this.canvas.height = height * this._devicePixelRatio;
                    jquery_1.default(this.canvas).css('width', width + 'px');
                    jquery_1.default(this.canvas).css('height', height + 'px');
                    var ctx = this.context;
                    ctx.lineWidth = 1;
                    ctx.textBaseline = 'middle';
                    ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';
                    ctx.scale(this._devicePixelRatio, this._devicePixelRatio);
                    // ctx.shadowOffsetX = 1;
                    // ctx.shadowOffsetY = 1;
                    // ctx.shadowColor = "rgba(0,0,0,0.3)";
                    // ctx.shadowBlur = 3;
                    var top = 0;
                    var elapsed = this.range.to - this.range.from;
                    var point = null;
                    lodash_1.default.forEach(this.data, function (metric) {
                        var centerV = top + (rowHeight / 2);
                        // The no-data line
                        ctx.fillStyle = _this.panel.backgroundColor;
                        ctx.fillRect(0, top, width, rowHeight);
                        /*if(!this.panel.writeMetricNames) {
                          ctx.fillStyle = "#111111";
                          ctx.textAlign = 'left';
                          ctx.fillText("No Data", 10, centerV);
                        }*/
                        if (_this.isTimeline) {
                            var lastBS = 0;
                            point = metric.changes[0];
                            for (var i = 0; i < metric.changes.length; i++) {
                                point = metric.changes[i];
                                if (point.start <= _this.range.to) {
                                    var xt = Math.max(point.start - _this.range.from, 0);
                                    point.x = (xt / elapsed) * width;
                                    ctx.fillStyle = _this.getColor(point.val);
                                    ctx.fillRect(point.x, top, width, rowHeight);
                                    if (_this.panel.writeAllValues) {
                                        ctx.fillStyle = _this.panel.valueTextColor;
                                        ctx.textAlign = 'left';
                                        ctx.fillText(point.val, point.x + 7, centerV);
                                    }
                                    lastBS = point.x;
                                }
                            }
                        }
                        else if (_this.panel.display === 'stacked') {
                            point = null;
                            var start = _this.range.from;
                            for (var i = 0; i < metric.legendInfo.length; i++) {
                                point = metric.legendInfo[i];
                                var xt = Math.max(start - _this.range.from, 0);
                                point.x = (xt / elapsed) * width;
                                ctx.fillStyle = _this.getColor(point.val);
                                ctx.fillRect(point.x, top, width, rowHeight);
                                if (_this.panel.writeAllValues) {
                                    ctx.fillStyle = _this.panel.valueTextColor;
                                    ctx.textAlign = 'left';
                                    ctx.fillText(point.val, point.x + 7, centerV);
                                }
                                start += point.ms;
                            }
                        }
                        else {
                            console.log("Not supported yet...", _this);
                        }
                        if (top > 0) {
                            ctx.strokeStyle = _this.panel.lineColor;
                            ctx.beginPath();
                            ctx.moveTo(0, top);
                            ctx.lineTo(width, top);
                            ctx.stroke();
                        }
                        ctx.fillStyle = "#000000";
                        if (_this.panel.writeMetricNames &&
                            _this.mouse.position == null &&
                            (!_this.panel.highlightOnMouseover || _this.panel.highlightOnMouseover)) {
                            ctx.fillStyle = _this.panel.metricNameColor;
                            ctx.textAlign = 'left';
                            ctx.fillText(metric.name, 10, centerV);
                        }
                        ctx.textAlign = 'right';
                        if (_this.mouse.down == null) {
                            if (_this.panel.highlightOnMouseover && _this.mouse.position != null) {
                                var next = null;
                                if (_this.isTimeline) {
                                    point = metric.changes[0];
                                    for (var i = 0; i < metric.changes.length; i++) {
                                        if (metric.changes[i].start > _this.mouse.position.ts) {
                                            next = metric.changes[i];
                                            break;
                                        }
                                        point = metric.changes[i];
                                    }
                                }
                                else if (_this.panel.display === 'stacked') {
                                    point = metric.legendInfo[0];
                                    for (var i = 0; i < metric.legendInfo.length; i++) {
                                        if (metric.legendInfo[i].x > _this.mouse.position.x) {
                                            next = metric.legendInfo[i];
                                            break;
                                        }
                                        point = metric.legendInfo[i];
                                    }
                                }
                                // Fill canvas using 'destination-out' and alpha at 0.05
                                ctx.globalCompositeOperation = 'destination-out';
                                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                                ctx.beginPath();
                                ctx.fillRect(0, top, point.x, rowHeight);
                                ctx.fill();
                                if (next != null) {
                                    ctx.beginPath();
                                    ctx.fillRect(next.x, top, width, rowHeight);
                                    ctx.fill();
                                }
                                ctx.globalCompositeOperation = 'source-over';
                                // Now Draw the value
                                ctx.fillStyle = "#000000";
                                ctx.textAlign = 'left';
                                ctx.fillText(point.val, point.x + 7, centerV);
                            }
                            else if (_this.panel.writeLastValue) {
                                ctx.fillText(point.val, width - 7, centerV);
                            }
                        }
                        top += rowHeight;
                    });
                    if (this.isTimeline && this.mouse.position != null) {
                        if (this.mouse.down != null) {
                            var xmin = Math.min(this.mouse.position.x, this.mouse.down.x);
                            var xmax = Math.max(this.mouse.position.x, this.mouse.down.x);
                            // Fill canvas using 'destination-out' and alpha at 0.05
                            ctx.globalCompositeOperation = 'destination-out';
                            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                            ctx.beginPath();
                            ctx.fillRect(0, 0, xmin, height);
                            ctx.fill();
                            ctx.beginPath();
                            ctx.fillRect(xmax, 0, width, height);
                            ctx.fill();
                            ctx.globalCompositeOperation = 'source-over';
                        }
                        else {
                            ctx.strokeStyle = '#111';
                            ctx.beginPath();
                            ctx.moveTo(this.mouse.position.x, 0);
                            ctx.lineTo(this.mouse.position.x, height);
                            ctx.lineWidth = 3;
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(this.mouse.position.x, 0);
                            ctx.lineTo(this.mouse.position.x, height);
                            ctx.strokeStyle = '#e22c14';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            if (this.externalPT && rows > 1) {
                                ctx.beginPath();
                                ctx.arc(this.mouse.position.x, this.mouse.position.y, 3, 0, 2 * Math.PI, false);
                                ctx.fillStyle = '#e22c14';
                                ctx.fill();
                                ctx.lineWidth = 1;
                                ctx.strokeStyle = '#111';
                                ctx.stroke();
                            }
                        }
                    }
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
                    if (lodash_1.default.isNumber(val) && this.panel.rangeMaps) {
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
                    var palet = [
                        '#FF4444',
                        '#9933CC',
                        '#32D1DF',
                        '#ed2e18',
                        '#CC3900',
                        '#F79520',
                        '#33B5E5'
                    ];
                    return palet[Math.abs(this.hashCode(val + '')) % palet.length];
                };
                DiscretePanelCtrl.prototype.randomColor = function () {
                    var letters = 'ABCDE'.split('');
                    var color = '#';
                    for (var i = 0; i < 3; i++) {
                        color += letters[Math.floor(Math.random() * letters.length)];
                    }
                    return color;
                };
                DiscretePanelCtrl.prototype.hashCode = function (str) {
                    var hash = 0;
                    if (str.length === 0) {
                        return hash;
                    }
                    for (var i = 0; i < str.length; i++) {
                        /* eslint-disable */
                        var char = str.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash; // Convert to 32bit integer
                    }
                    return hash;
                };
                // Copied from Metrics Panel, only used to expand the 'from' query
                DiscretePanelCtrl.prototype.issueQueries = function (datasource) {
                    this.datasource = datasource;
                    if (!this.panel.targets || this.panel.targets.length === 0) {
                        return this.$q.when([]);
                    }
                    // make shallow copy of scoped vars,
                    // and add built in variables interval and interval_ms
                    var scopedVars = Object.assign({}, this.panel.scopedVars, {
                        "__interval": { text: this.interval, value: this.interval },
                        "__interval_ms": { text: this.intervalMs, value: this.intervalMs },
                    });
                    var range = this.range;
                    var rr = this.range.raw;
                    if (this.panel.expandFromQueryS > 0) {
                        range = {
                            from: this.range.from.clone(),
                            to: this.range.to
                        };
                        range.from.subtract(this.panel.expandFromQueryS, 's');
                        rr = {
                            from: range.from.format(),
                            to: this.range.raw.to
                        };
                        range.raw = rr;
                    }
                    var metricsQuery = {
                        panelId: this.panel.id,
                        range: range,
                        rangeRaw: rr,
                        interval: this.interval,
                        intervalMs: this.intervalMs,
                        targets: this.panel.targets,
                        format: this.panel.renderer === 'png' ? 'png' : 'json',
                        maxDataPoints: this.resolution,
                        scopedVars: scopedVars,
                        cacheTimeout: this.panel.cacheTimeout
                    };
                    return datasource.query(metricsQuery);
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
                DiscretePanelCtrl.prototype.onConfigChanged = function () {
                    //console.log( "Config changed...");
                    this.isTimeline = true; //this.panel.display == 'timeline';
                    this.render();
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
                            if (this.panel.display === 'stacked') {
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
                DiscretePanelCtrl.templateUrl = 'partials/module.html';
                return DiscretePanelCtrl;
            })(canvas_metric_1.CanvasPanelCtrl);
            exports_1("PanelCtrl", DiscretePanelCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map