'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, DistinctPoints;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
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

      DistinctPoints = function () {
        function DistinctPoints(name) {
          _classCallCheck(this, DistinctPoints);

          this.name = name;
          this.changes = [];
          this.legendInfo = [];

          // last point we added
          this.last = null;
          this.asc = false;
        }

        // ts numeric ms,
        // val is the normalized value


        _createClass(DistinctPoints, [{
          key: 'add',
          value: function add(ts, val) {
            if (this.last == null) {
              this.last = {
                val: val,
                start: ts,
                ms: 0
              };
              this.changes.push(this.last);
            } else if (ts == this.last.ts) {
              console.log('skip point with duplicate timestamp', ts, val);
              return;
            } else {
              if (this.changes.length === 1) {
                this.asc = ts > this.last.start;
              }

              if (ts > this.last.start != this.asc) {
                console.log('skip out of order point', ts, val);
                return;
              }

              // Same value
              if (val == this.last.val) {
                if (!this.asc) {
                  this.last.start = ts;
                }
              } else {
                this.last = {
                  val: val,
                  start: ts,
                  ms: 0
                };
                this.changes.push(this.last);
              }
            }
          }
        }, {
          key: 'finish',
          value: function finish(ctrl) {
            var _this = this;

            if (this.changes.length < 1) {
              console.log("no points found!");
              return;
            }

            if (!this.asc) {
              this.last = this.changes[0];
              _.reverse(this.changes);
            }

            // Add a point beyond the controls
            if (this.last.start < ctrl.range.to) {
              this.changes.push({
                val: this.last.val,
                start: ctrl.range.to + 1,
                ms: 0
              });
            }

            this.transitionCount = 0;
            var valToInfo = {};
            var lastTS = 0;
            var legendCount = 0;
            var maxLegendSize = ctrl.panel.legendMaxValues;
            if (!maxLegendSize) {
              maxLegendSize = 20;
            }
            var last = this.changes[0];
            for (var i = 1; i < this.changes.length; i++) {
              var pt = this.changes[i];

              var s = last.start;
              var e = pt.start;
              if (s < ctrl.range.from) {
                s = ctrl.range.from;
              } else if (s < ctrl.range.to) {
                this.transitionCount++;
              }

              if (e > ctrl.range.to) {
                e = ctrl.range.to;
              }

              last.ms = e - s;
              if (last.ms > 0) {
                if (_.has(valToInfo, last.val)) {
                  var v = valToInfo[last.val];
                  v.ms += last.ms;
                  v.count++;
                } else {
                  valToInfo[last.val] = { 'val': last.val, 'ms': last.ms, 'count': 1 };
                  legendCount++;
                }
              }
              last = pt;
            }

            var elapsed = ctrl.range.to - ctrl.range.from;
            this.elapsed = elapsed;

            // Remove null from the legend if it is the first value and small (common for influx queries)
            var nullText = ctrl.formatValue(null);
            if (this.changes.length > 1 && _.has(valToInfo, nullText)) {
              var info = valToInfo[nullText];
              if (info.count == 1) {
                var per = info.ms / elapsed;
                if (per < .02) {
                  if (this.changes[0].val == nullText) {
                    console.log('Removing null', info);
                    delete valToInfo[nullText];

                    this.changes[1].start = this.changes[0].start;
                    this.changes[1].ms += this.changes[0].ms;
                    this.changes.splice(0, 1);
                  }
                }
              }
            }
            _.forEach(valToInfo, function (value) {
              value.per = value.ms / elapsed;
              _this.legendInfo.push(value);
            });
            this.distinctValuesCount = _.size(this.legendInfo);
            //console.log( "FINISH", valToInfo, this );
          }
        }]);

        return DistinctPoints;
      }();

      _export('default', DistinctPoints);
    }
  };
});
//# sourceMappingURL=points.js.map
