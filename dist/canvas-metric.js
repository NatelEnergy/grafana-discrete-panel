///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['app/plugins/sdk', 'moment', 'jquery', 'app/core/app_events'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var sdk_1, moment_1, jquery_1, app_events_1;
    var CanvasPanelCtrl;
    return {
        setters:[
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (app_events_1_1) {
                app_events_1 = app_events_1_1;
            }],
        execute: function() {
            // Expects a template with:
            // <div class="canvas-spot"></div>
            CanvasPanelCtrl = (function (_super) {
                __extends(CanvasPanelCtrl, _super);
                function CanvasPanelCtrl($scope, $injector) {
                    _super.call(this, $scope, $injector);
                    this.data = null;
                    this.mouse = {
                        position: null,
                        down: null,
                    };
                    this.$tooltip = jquery_1.default('<div class="graph-tooltip">');
                    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
                    this.events.on('refresh', this.onRefresh.bind(this));
                    this.events.on('render', this.onRender.bind(this));
                    this._devicePixelRatio = 1;
                    if (window.devicePixelRatio !== undefined) {
                        this._devicePixelRatio = window.devicePixelRatio;
                    }
                }
                CanvasPanelCtrl.prototype.onPanelInitalized = function () {
                    //console.log("onPanelInitalized()");
                    this.render();
                };
                CanvasPanelCtrl.prototype.onRefresh = function () {
                    //console.log("onRefresh()");
                    this.render();
                };
                // Typically you will override this
                CanvasPanelCtrl.prototype.onRender = function () {
                    if (!(this.context)) {
                        console.log('No context!');
                        return;
                    }
                    console.log('canvas render', this.mouse);
                    var rect = this.wrap.getBoundingClientRect();
                    var height = Math.max(this.height, 100);
                    var width = rect.width;
                    this.canvas.width = width;
                    this.canvas.height = height;
                    var centerV = height / 2;
                    var ctx = this.context;
                    ctx.lineWidth = 1;
                    ctx.textBaseline = 'middle';
                    var time = "";
                    if (this.mouse.position != null) {
                        time = this.dashboard.formatDate(moment_1.default(this.mouse.position.ts));
                    }
                    ctx.fillStyle = '#999999';
                    ctx.fillRect(0, 0, width, height);
                    ctx.fillStyle = "#111111";
                    ctx.font = '24px "Open Sans", Helvetica, Arial, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText("Mouse @ " + time, 10, centerV);
                    if (this.mouse.position != null) {
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
                        }
                    }
                };
                CanvasPanelCtrl.prototype.clearTT = function () {
                    this.$tooltip.detach();
                };
                CanvasPanelCtrl.prototype.getMousePosition = function (evt) {
                    var elapsed = this.range.to - this.range.from;
                    var rect = this.canvas.getBoundingClientRect();
                    var x = evt.offsetX; // - rect.left;
                    var ts = this.range.from + (elapsed * (x / parseFloat(rect.width)));
                    var y = evt.clientY - rect.top;
                    return {
                        x: x,
                        y: y,
                        yRel: y / parseFloat(rect.height),
                        ts: ts,
                        evt: evt
                    };
                };
                CanvasPanelCtrl.prototype.onGraphHover = function (evt, showTT, isExternal) {
                    console.log("HOVER", evt, showTT, isExternal);
                };
                CanvasPanelCtrl.prototype.onMouseClicked = function (where) {
                    console.log("CANVAS CLICKED", where);
                    this.render();
                };
                CanvasPanelCtrl.prototype.onMouseSelectedRange = function (range) {
                    console.log("CANVAS Range", range);
                };
                CanvasPanelCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
                    var _this = this;
                    this.wrap = elem.find('.canvas-spot')[0];
                    this.canvas = document.createElement("canvas");
                    this.wrap.appendChild(this.canvas);
                    jquery_1.default(this.canvas).css('cursor', 'pointer');
                    jquery_1.default(this.wrap).css('width', '100%');
                    //  console.log( 'link', this );
                    this.context = this.canvas.getContext('2d');
                    this.canvas.addEventListener('mousemove', function (evt) {
                        if (!_this.range) {
                            return; // skip events before we have loaded
                        }
                        _this.mouse.position = _this.getMousePosition(evt);
                        var info = {
                            pos: {
                                pageX: evt.pageX,
                                pageY: evt.pageY,
                                x: _this.mouse.position.ts,
                                y: _this.mouse.position.y,
                                panelRelY: _this.mouse.position.yRel,
                                panelRelX: _this.mouse.position.xRel
                            },
                            evt: evt,
                            panel: _this.panel
                        };
                        app_events_1.default.emit('graph-hover', info);
                        if (_this.mouse.down != null) {
                            jquery_1.default(_this.canvas).css('cursor', 'col-resize');
                        }
                    }, false);
                    this.canvas.addEventListener('mouseout', function (evt) {
                        if (_this.mouse.down == null) {
                            _this.mouse.position = null;
                            _this.onRender();
                            _this.$tooltip.detach();
                            app_events_1.default.emit('graph-hover-clear');
                        }
                    }, false);
                    this.canvas.addEventListener('mousedown', function (evt) {
                        _this.mouse.down = _this.getMousePosition(evt);
                    }, false);
                    this.canvas.addEventListener('mouseenter', function (evt) {
                        if (_this.mouse.down && !evt.buttons) {
                            _this.mouse.position = null;
                            _this.mouse.down = null;
                            _this.onRender();
                            _this.$tooltip.detach();
                            app_events_1.default.emit('graph-hover-clear');
                        }
                        jquery_1.default(_this.canvas).css('cursor', 'pointer');
                    }, false);
                    this.canvas.addEventListener('mouseup', function (evt) {
                        _this.$tooltip.detach();
                        var up = _this.getMousePosition(evt);
                        if (_this.mouse.down != null) {
                            if (up.x === _this.mouse.down.x && up.y === _this.mouse.down.y) {
                                _this.mouse.position = null;
                                _this.mouse.down = null;
                                _this.onMouseClicked(up);
                            }
                            else {
                                var min = Math.min(_this.mouse.down.ts, up.ts);
                                var max = Math.max(_this.mouse.down.ts, up.ts);
                                var range = { from: moment_1.default.utc(min), to: moment_1.default.utc(max) };
                                _this.mouse.position = up;
                                _this.onMouseSelectedRange(range);
                            }
                        }
                        _this.mouse.down = null;
                        _this.mouse.position = null;
                    }, false);
                    this.canvas.addEventListener('dblclick', function (evt) {
                        _this.mouse.position = null;
                        _this.mouse.down = null;
                        _this.onRender();
                        _this.$tooltip.detach();
                        app_events_1.default.emit('graph-hover-clear');
                        console.log('TODO, ZOOM OUT');
                    }, true);
                    // global events
                    app_events_1.default.on('graph-hover', function (event) {
                        // ignore other graph hover events if shared tooltip is disabled
                        var isThis = event.panel.id === _this.panel.id;
                        if (!_this.dashboard.sharedTooltipModeEnabled() && !isThis) {
                            return;
                        }
                        // ignore if other panels are fullscreen
                        if (_this.otherPanelInFullscreenMode()) {
                            return;
                        }
                        // Calculate the mouse position when it came from somewhere else
                        if (!isThis) {
                            if (!event.pos.x) {
                                console.log("Invalid hover point", event);
                                return;
                            }
                            var ts = event.pos.x;
                            var rect = _this.canvas.getBoundingClientRect();
                            var elapsed = _this.range.to - _this.range.from;
                            var x = ((ts - _this.range.from) / elapsed) * rect.width;
                            _this.mouse.position = {
                                x: x,
                                y: event.pos.panelRelY * rect.height,
                                yRel: event.pos.panelRelY,
                                ts: ts,
                                gevt: event
                            };
                        }
                        _this.onGraphHover(event, isThis || !_this.dashboard.sharedCrosshairModeOnly(), !isThis);
                    }, scope);
                    app_events_1.default.on('graph-hover-clear', function (event, info) {
                        _this.mouse.position = null;
                        _this.mouse.down = null;
                        _this.render();
                        _this.$tooltip.detach();
                    }, scope);
                    // scope.$on('$destroy', () => {
                    //   this.$tooltip.destroy();
                    //   elem.off();
                    //   elem.remove();
                    // });
                };
                return CanvasPanelCtrl;
            })(sdk_1.MetricsPanelCtrl);
            exports_1("CanvasPanelCtrl", CanvasPanelCtrl);
        }
    }
});
//# sourceMappingURL=canvas-metric.js.map