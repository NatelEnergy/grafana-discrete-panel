'use strict';

System.register(['app/core/config', './canvas-metric', 'lodash', 'moment', 'angular'], function (_export, _context) {
  "use strict";

  var config, CanvasPanelCtrl, _, moment, angular, _createClass, _get, DiscretePanelCtrl;

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
    setters: [function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_canvasMetric) {
      CanvasPanelCtrl = _canvasMetric.CanvasPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_angular) {
      angular = _angular.default;
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

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      _export('PanelCtrl', DiscretePanelCtrl = function (_CanvasPanelCtrl) {
        _inherits(DiscretePanelCtrl, _CanvasPanelCtrl);

        function DiscretePanelCtrl($scope, $injector, $q) {
          _classCallCheck(this, DiscretePanelCtrl);

          var _this = _possibleConstructorReturn(this, (DiscretePanelCtrl.__proto__ || Object.getPrototypeOf(DiscretePanelCtrl)).call(this, $scope, $injector, $q));

          _this.data = null;

          // Set and populate defaults
          var panelDefaults = {
            rowHeight: 50,
            padding: { 'left': 0, 'right': 0, 'top': 0, 'bottom': 0 },
            valueMaps: [{ value: 'null', op: '=', text: 'N/A' }],
            mappingTypes: [{ name: 'value to text', value: 1 }, { name: 'range to text', value: 2 }],
            rangeMaps: [{ from: 'null', to: 'null', text: 'N/A' }],
            colorMaps: [{ text: 'N/A', color: '#CCC' }],
            metricNameColor: '#000000',
            valueTextColor: '#000000',
            backgroundColor: 'rgba(128, 128, 128, 0.1)',
            lineColor: 'rgba(128, 128, 128, 1.0)',
            writeLastValue: true,
            writeAllValues: false,
            writeMetricNames: false,
            writeMetricNamesOnRight: false,
            metricNamesOnRightWidth: 400,
            showLegend: true,
            showLegendNames: true,
            showLegendPercent: true,
            highlightOnMouseover: true,
            queryAllData: false,
            eventBeginField: 'begin',
            eventEndField: 'end',
            eventNameField: 'desc'
          };
          _.defaults(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('refresh', _this.onRefresh.bind(_this));

          _this.updateColorInfo();
          return _this;
        }

        _createClass(DiscretePanelCtrl, [{
          key: 'onDataError',
          value: function onDataError(err) {
            console.log("onDataError", err);
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/natel-discrete-panel/editor.html', 1);
            this.addEditorTab('Colors', 'public/plugins/natel-discrete-panel/colors.html', 3);
            this.addEditorTab('Mappings', 'public/plugins/natel-discrete-panel/mappings.html', 4);
            this.editorTabIndex = 1;
            this.refresh();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            var _this2 = this;

            if (!this.context) {
              console.log('No context!');
              return;
            }

            if (this.data == null) {
              console.log('No data!');
              return;
            }

            //   console.log( 'render', this.data);

            $(this.wrap).css('margin-top', this.panel.padding.top);
            $(this.wrap).css('margin-right', this.panel.padding.right);
            $(this.wrap).css('margin-bottom', this.panel.padding.bottom);
            $(this.wrap).css('margin-left', this.panel.padding.left);

            var rect = this.wrap.getBoundingClientRect();

            var rows = this.data.length;
            var rowHeight = this.panel.rowHeight;

            var height = rowHeight * rows;
            var width = rect.width - this.panel.padding.left - this.panel.padding.right;
            this.canvas.width = width;
            this.canvas.height = height;

            if (this.panel.writeMetricNamesOnRight) {
              width -= this.panel.metricNamesOnRightWidth;
            }

            var ctx = this.context;
            ctx.lineWidth = 1;
            ctx.textBaseline = 'middle';

            // ctx.shadowOffsetX = 1;
            // ctx.shadowOffsetY = 1;
            // ctx.shadowColor = "rgba(0,0,0,0.3)";
            // ctx.shadowBlur = 3;

            var top = 0;

            var elapsed = this.range.to - this.range.from;

            _.forEach(this.data, function (metric) {
              var centerV = top + rowHeight / 2;

              // The no-data line
              ctx.fillStyle = _this2.panel.backgroundColor;
              ctx.fillRect(0, top, width, rowHeight);

              /*if(!this.panel.writeMetricNames) {
                ctx.fillStyle = "#111111";
                ctx.font = '24px "Open Sans", Helvetica, Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText("No Data", 10, centerV);
              }*/

              var lastBS = 0;
              var point = metric.changes[0];
              for (var i = 0; i < metric.changes.length; i++) {
                point = metric.changes[i];
                if (point.start <= _this2.range.to) {
                  var xt = 0;
                  var w = 0;
                  if (point.start > _this2.range.from) {
                    xt = point.start - _this2.range.from;
                    point.x = xt / elapsed * width;
                    w = width * (point.ms / elapsed);
                  } else {
                    xt = 0;
                    point.x = 0;
                    w = width * ((point.ms - (_this2.range.from - point.start)) / elapsed);
                  }
                  if (point.x + w > width) {
                    w = width - point.x;
                  }
                  ctx.fillStyle = _this2.getColor(point.val);
                  ctx.fillRect(point.x, top, w, rowHeight);

                  if (_this2.panel.writeAllValues) {
                    ctx.fillStyle = _this2.panel.valueTextColor;
                    ctx.font = rowHeight - 2 + 'px "Open Sans", Helvetica, Arial, sans-serif';
                    ctx.textAlign = 'left';

                    ctx.fillText(point.val, point.x + 7, centerV);
                  }
                  lastBS = point.x;
                }
              }

              if (top > 0) {
                ctx.strokeStyle = _this2.panel.lineColor;
                ctx.beginPath();
                ctx.moveTo(0, top);
                ctx.lineTo(width, top);
                ctx.stroke();
              }

              ctx.fillStyle = "#000000";
              ctx.font = rowHeight - 2 + 'px "Open Sans", Helvetica, Arial, sans-serif';

              if (_this2.panel.writeMetricNames && (!_this2.panel.highlightOnMouseover || _this2.panel.highlightOnMouseover && (_this2.mouse.position == null || _this2.mouse.position.x > 200))) {
                ctx.fillStyle = _this2.panel.metricNameColor;
                ctx.textAlign = 'left';
                var x = 10;
                if (_this2.panel.writeMetricNamesOnRight) {
                  x = width + 10;
                }
                ctx.fillText(metric.name, x, centerV);
              }

              ctx.textAlign = 'right';

              if (_this2.mouse.down == null) {
                if (_this2.panel.highlightOnMouseover && _this2.mouse.position != null) {
                  point = metric.changes[0];
                  var next = null;
                  for (var i = 0; i < metric.changes.length; i++) {
                    if (metric.changes[i].start > _this2.mouse.position.ts) {
                      next = metric.changes[i];
                      break;
                    }
                    point = metric.changes[i];
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
                  ctx.font = rowHeight - 2 + 'px "Open Sans", Helvetica, Arial, sans-serif';
                  ctx.textAlign = 'left';
                  ctx.fillText(point.val, point.x + 10, centerV);

                  // ctx.fillText( point.val, this.mouse.position.x-10, centerV);

                  // if(point.ms > 2) {
                  //   ctx.textAlign = 'left';
                  //   ctx.font = '18px "Open Sans", Helvetica, Arial, sans-serif';

                  //   var msg = moment.duration( point.ms ).humanize(false);
                  //   ctx.fillText(msg, this.mouse.position.x+10, centerV);
                  // }
                } else if (_this2.panel.writeLastValue) {
                  ctx.fillText(point.val, width - 10, centerV);
                }
              }

              top += rowHeight;
            });

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
          key: 'showTooltip',
          value: function showTooltip(pos, point) {
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
            body += this.dashboard.formatDate(moment(from)) + "<br/>";
            body += "to<br/>";
            body += this.dashboard.formatDate(moment(to)) + "<br/><br/>";
            body += moment.duration(time).humanize() + "<br/>";
            body += "</center>";

            this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
          }
        }, {
          key: 'showLegandTooltip',
          value: function showLegandTooltip(pos, info) {
            var body = '<div class="graph-tooltip-time">' + info.val + '</div>';

            body += "<center>";
            if (info.count > 1) {
              body += info.count + " times<br/>for<br/>";
            }
            body += moment.duration(info.ms).humanize();
            if (info.count > 1) {
              body += "<br/>total";
            }
            body += "</center>";

            this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
          }
        }, {
          key: 'clearTT',
          value: function clearTT() {
            this.$tooltip.detach();
          }
        }, {
          key: 'formatValue',
          value: function formatValue(val, stats) {

            if (_.isNumber(val) && this.panel.rangeMaps) {
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

            var isNull = _.isNil(val);
            if (!isNull && _.isString(val)) {
              val = val.toString(); // convert everything to a string
            }

            for (var i = 0; i < this.panel.valueMaps.length; i++) {
              var map = this.panel.valueMaps[i];
              // special null case
              if (map.value === 'null') {
                if (isNull) {
                  return map.text;
                }
                continue;
              }

              if (val == map.value) {
                return map.text;
              }
            }

            if (isNull) {
              return "null";
            }
            return val;
          }
        }, {
          key: 'getColor',
          value: function getColor(val) {
            if (_.has(this.colorMap, val)) {
              return this.colorMap[val];
            }

            var palet = ['#FF4444', '#9933CC', '#32D1DF', '#ed2e18', '#CC3900', '#F79520', '#33B5E5'];

            return palet[Math.abs(this.hashCode(val + '')) % palet.length];
          }
        }, {
          key: 'randomColor',
          value: function randomColor() {
            var letters = 'ABCDE'.split('');
            var color = '#';
            for (var i = 0; i < 3; i++) {
              color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;
          }
        }, {
          key: 'hashCode',
          value: function hashCode(str) {
            var hash = 0;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
              var char = str.charCodeAt(i);
              hash = (hash << 5) - hash + char;
              hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
          }
        }, {
          key: 'issueQueries',
          value: function issueQueries(datasource) {
            if (this.panel.queryAllData) {
              var range = this.timeSrv.timeRange();
              range.from = 0;
              range.to = this.range.to;
              var metricsQuery = {
                panelId: this.panel.id,
                range: range,
                rangeRaw: range,
                interval: 31557600,
                intervalMs: 31557600000,
                targets: this.panel.targets,
                format: this.panel.renderer === 'png' ? 'png' : 'json',
                maxDataPoints: this.resolution,
                scopedVars: {},
                cacheTimeout: this.panel.cacheTimeout
              };

              return datasource.query(metricsQuery);
            }
            return _get(DiscretePanelCtrl.prototype.__proto__ || Object.getPrototypeOf(DiscretePanelCtrl.prototype), 'issueQueries', this).call(this, datasource);
          }
        }, {
          key: '_processLast',
          value: function _processLast(pt, end, res, valToInfo) {
            pt.ms = end - pt.start;
            if (!res.tooManyValues) {
              if (_.has(valToInfo, pt.val)) {
                var v = valToInfo[pt.val];
                v.ms += pt.ms;
                v.count++;
              } else {
                valToInfo[pt.val] = { 'val': pt.val, 'ms': pt.ms, 'count': 1 };
              }
              res.tooManyValues = valToInfo.length > 20;
            }
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var _this3 = this;

            $(this.canvas).css('cursor', 'pointer');

            var elapsed = this.range.to - this.range.from;
            var data = [];
            _.forEach(dataList, function (metric) {
              var valToInfo = {};

              if (metric.type === 'docs') {
                // handle discrete events
                _.forEach(metric.datapoints, function (point) {
                  var start = moment.utc(point[_this3.panel.eventBeginField]);
                  var startMs = start.valueOf();
                  var end = _this3.range.to;
                  if ([_this3.panel.eventEndField] && point[_this3.panel.eventEndField] !== '') {
                    end = moment.utc(point[_this3.panel.eventEndField]);
                  }
                  var endMs = end.valueOf();
                  if (!(startMs > _this3.range.to || endMs < _this3.range.from)) {
                    var pt = {
                      val: point[_this3.panel.eventNameField],
                      start: startMs,
                      ms: end.diff(start)
                    };
                    var res = {
                      name: pt.val,
                      changes: [pt],
                      tooManyValues: false,
                      legendInfo: [{ 'val': pt.val, 'ms': pt.ms, 'count': 1 }]
                    };
                    data.push(res);
                  }
                });
              } else {
                var res = {
                  name: metric.target,
                  changes: [],
                  tooManyValues: false,
                  legendInfo: [] };
                data.push(res);
                var last = null;
                _.forEach(metric.datapoints, function (point) {

                  var norm = _this3.formatValue(point[0]);
                  if (last == null || norm != last.val) {
                    var pt = {
                      val: norm,
                      start: point[1],
                      ms: 0 // time in this state
                    };

                    if (last != null) {
                      _this3._processLast(last, pt.start, res, valToInfo);
                    };

                    res.changes.push(pt);
                    last = pt;
                  }
                });

                if (last != null) {
                  _this3._processLast(last, _this3.range.to, res, valToInfo);
                };

                // Remove null from the legend if it is the first value and small (common for influx queries)
                var nullText = _this3.formatValue(null);
                if (res.changes.length > 1 && _.has(valToInfo, nullText)) {
                  var info = valToInfo[nullText];
                  if (info.count == 1) {
                    var per = info.ms / elapsed;
                    if (per < .02) {
                      if (res.changes[0].val == nullText) {
                        console.log('Removing null', info);
                        delete valToInfo[nullText];

                        res.changes[1].start = res.changes[0].start;
                        res.changes[1].ms += res.changes[0].ms;
                        res.changes.splice(0, 1);
                      }
                    }
                  }
                }
                _.forEach(valToInfo, function (value) {
                  value.per = Math.round(value.ms / elapsed * 100);
                  res.legendInfo.push(value);
                });
              }
            });
            this.data = data;

            this.onRender();

            //console.log( 'data', dataList, this.data);
          }
        }, {
          key: 'removeColorMap',
          value: function removeColorMap(map) {
            var index = _.indexOf(this.panel.colorMaps, map);
            this.panel.colorMaps.splice(index, 1);
            this.updateColorInfo();
          }
        }, {
          key: 'updateColorInfo',
          value: function updateColorInfo() {
            var cm = {};
            for (var i = 0; i < this.panel.colorMaps.length; i++) {
              var m = this.panel.colorMaps[i];
              if (m.text) {
                cm[m.text] = m.color;
              }
            }
            this.colorMap = cm;
            this.render();
          }
        }, {
          key: 'addColorMap',
          value: function addColorMap(what) {
            var _this4 = this;

            if (what == 'curent') {
              _.forEach(this.data, function (metric) {
                if (metric.legendInfo) {
                  _.forEach(metric.legendInfo, function (info) {
                    if (!_.has(info.val)) {
                      _this4.panel.colorMaps.push({ text: info.val, color: _this4.getColor(info.val) });
                    }
                  });
                }
              });
            } else {
              this.panel.colorMaps.push({ text: '???', color: this.randomColor() });
            }
            this.updateColorInfo();
          }
        }, {
          key: 'removeValueMap',
          value: function removeValueMap(map) {
            var index = _.indexOf(this.panel.valueMaps, map);
            this.panel.valueMaps.splice(index, 1);
            this.render();
          }
        }, {
          key: 'addValueMap',
          value: function addValueMap() {
            this.panel.valueMaps.push({ value: '', op: '=', text: '' });
          }
        }, {
          key: 'removeRangeMap',
          value: function removeRangeMap(rangeMap) {
            var index = _.indexOf(this.panel.rangeMaps, rangeMap);
            this.panel.rangeMaps.splice(index, 1);
            this.render();
          }
        }, {
          key: 'addRangeMap',
          value: function addRangeMap() {
            this.panel.rangeMaps.push({ from: '', to: '', text: '' });
          }
        }, {
          key: 'onConfigChanged',
          value: function onConfigChanged() {
            console.log("Config changed...");
            this.render();
          }
        }, {
          key: 'onMouseMoved',
          value: function onMouseMoved(evt) {
            if (this.data) {
              var range = this.timeSrv.timeRange();
              var hover = null;
              var j = Math.floor(this.mouse.position.y / this.panel.rowHeight);
              if (j < 0) {
                j = 0;
              }
              if (j >= this.data.length) {
                j = this.data.length - 1;
              }
              hover = this.data[j].changes[0];
              for (var i = 0; i < this.data[j].changes.length; i++) {
                if (this.data[j].changes[i].start > this.mouse.position.ts) {
                  break;
                }
                hover = this.data[j].changes[i];
              }
              this.hoverPoint = hover;
              this.showTooltip(evt, hover);
            } else {
              this.$tooltip.detach(); // make sure it is hidden
            }
            this.onRender(); // refresh the view
          }
        }, {
          key: 'onMouseClicked',
          value: function onMouseClicked(where) {
            var pt = this.hoverPoint;
            var range = { from: moment.utc(pt.start), to: moment.utc(pt.start + pt.ms) };
            console.log("CLICK", up, pt, range);
            this.timeSrv.setTime(range);
            $(this.canvas).css('cursor', 'wait');
          }
        }, {
          key: 'onMouseSelectedRange',
          value: function onMouseSelectedRange(range) {
            this.timeSrv.setTime(range);
            $(this.canvas).css('cursor', 'wait');
          }
        }]);

        return DiscretePanelCtrl;
      }(CanvasPanelCtrl));

      DiscretePanelCtrl.templateUrl = 'module.html';

      _export('PanelCtrl', DiscretePanelCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
