'use strict';

System.register(['app/plugins/sdk', 'lodash', 'moment', 'angular', 'app/core/app_events'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, moment, angular, appEvents, _createClass, CanvasPanelCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_angular) {
      angular = _angular.default;
    }, function (_appCoreApp_events) {
      appEvents = _appCoreApp_events.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('CanvasPanelCtrl', CanvasPanelCtrl = function (_MetricsPanelCtrl) {
        _inherits(CanvasPanelCtrl, _MetricsPanelCtrl);

        function CanvasPanelCtrl($scope, $injector, $q) {
          _classCallCheck(this, CanvasPanelCtrl);

          var _this = _possibleConstructorReturn(this, (CanvasPanelCtrl.__proto__ || Object.getPrototypeOf(CanvasPanelCtrl)).call(this, $scope, $injector));

          _this.q = $q;
          _this.data = null;
          _this.mouse = {
            position: null,
            down: null
          };
          _this.$tooltip = $('<div id="tooltip" class="graph-tooltip">');

          _this.events.on('panel-initialized', _this.onPanelInitalized.bind(_this));
          _this.events.on('refresh', _this.onRefresh.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));

          console.log('constructor', _this);
          return _this;
        }

        _createClass(CanvasPanelCtrl, [{
          key: 'onPanelInitalized',
          value: function onPanelInitalized() {
            console.log("onPanelInitalized()");
            this.render();
          }
        }, {
          key: 'onRefresh',
          value: function onRefresh() {
            console.log("onRefresh()");
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            if (!this.context) {
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
              time = this.dashboard.formatDate(moment(this.mouse.position.ts));
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
              } else {
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
          }
        }, {
          key: 'clearTT',
          value: function clearTT() {
            this.$tooltip.detach();
          }
        }, {
          key: 'getMousePosition',
          value: function getMousePosition(evt) {
            var rect = this.canvas.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var elapsed = this.range.to - this.range.from;
            var ts = this.range.from + elapsed * (x / rect.width);
            var y = evt.clientY - rect.top;

            return {
              x: x,
              y: y,
              yRel: y / rect.height,
              ts: ts,
              evt: evt
            };
          }
        }, {
          key: 'onMouseMoved',
          value: function onMouseMoved(evt) {

            var pos = this.mouse.position;
            var body = '<div class="graph-tooltip-time">hello</div>';

            body += "<center>";
            body += this.dashboard.formatDate(moment(pos.ts));
            body += "</center>";

            this.$tooltip.html(body).place_tt(pos.evt.pageX + 20, pos.evt.pageY);

            this.render();
          }
        }, {
          key: 'onMouseClicked',
          value: function onMouseClicked(where) {
            console.log("CANVAS CLICKED", where);
            this.render();
          }
        }, {
          key: 'onMouseSelectedRange',
          value: function onMouseSelectedRange(range) {
            console.log("CANVAS Range", range);
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            var _this2 = this;

            this.wrap = elem.find('.canvas-spot')[0];
            this.canvas = document.createElement("canvas");
            this.wrap.appendChild(this.canvas);

            $(this.canvas).css('cursor', 'pointer');
            $(this.wrap).css('width', '100%');

            //  console.log( 'link', this );

            this.context = this.canvas.getContext('2d');
            this.canvas.addEventListener('mousemove', function (evt) {
              _this2.mouse.position = _this2.getMousePosition(evt);
              _this2.onMouseMoved(evt);
              var info = {
                pos: {
                  pageX: evt.pageX,
                  pageY: evt.pageY,
                  x: _this2.mouse.position.ts,
                  panelRelY: _this2.mouse.position.yRel
                },
                panel: _this2.panel
              };
              appEvents.emit('graph-hover', info);
            }, false);

            this.canvas.addEventListener('mouseout', function (evt) {
              _this2.mouse.position = null;
              _this2.mouse.down = null;
              _this2.onRender();
              _this2.$tooltip.detach();
              appEvents.emit('graph-hover-clear');
            }, false);

            this.canvas.addEventListener('mousedown', function (evt) {
              _this2.mouse.down = _this2.getMousePosition(evt);
              $(_this2.canvas).css('cursor', 'col-resize');
            }, false);

            this.canvas.addEventListener('mouseenter', function (evt) {
              $(_this2.canvas).css('cursor', 'pointer');
            }, false);

            this.canvas.addEventListener('mouseup', function (evt) {
              var up = _this2.getMousePosition(evt);
              if (_this2.mouse.down != null) {
                if (up.x == _this2.mouse.down.x && up.y == _this2.mouse.down.y) {
                  _this2.onMouseClicked(up);
                } else {
                  var min = Math.min(_this2.mouse.down.ts, up.ts);
                  var max = Math.max(_this2.mouse.down.ts, up.ts);
                  var range = { from: moment.utc(min), to: moment.utc(max) };
                  _this2.mouse.position = up;
                  _this2.onMouseSelectedRange(range);
                }
              }
              _this2.mouse.down = null;
              _this2.mouse.position = null;
              _this2.$tooltip.detach();
            }, false);

            // global events
            appEvents.on('graph-hover', function (event) {

              // ignore other graph hover events if shared tooltip is disabled
              if (!_this2.dashboard.sharedTooltipModeEnabled()) {
                return;
              }

              // ignore if we are the emitter
              if (event.panel.id === _this2.panel.id || _this2.otherPanelInFullscreenMode()) {
                return;
              }

              var ts = event.pos.x;
              var rect = _this2.canvas.getBoundingClientRect();
              var elapsed = _this2.range.to - _this2.range.from;
              var x = rect.left + (ts - _this2.range.from) / (elapsed * 1.0) * rect.width;

              _this2.mouse.position = {
                x: x,
                y: event.pos.panelRelY * rect.height,
                yRel: event.pos.panelRelY,
                ts: ts,
                evt: event
              };
              if (!_this2.dashboard.sharedCrosshairModeOnly()) {
                // console.log( "TODO Full Tooltip", event);
              }
              _this2.render();
            }, scope);

            appEvents.on('graph-hover-clear', function (event, info) {
              console.log("HOVER Clear", event);
              _this2.mouse.position = null;
              _this2.render();
              _this2.$tooltip.detach();
            }, scope);
          }
        }]);

        return CanvasPanelCtrl;
      }(MetricsPanelCtrl));

      _export('CanvasPanelCtrl', CanvasPanelCtrl);
    }
  };
});
//# sourceMappingURL=canvas-metric.js.map
