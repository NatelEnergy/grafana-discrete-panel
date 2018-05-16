System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var PointInfo, LegendValue, DistinctPoints;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            PointInfo = (function () {
                function PointInfo(val, start) {
                    this.ms = 0; // elapsed time
                    this.val = val;
                    this.start = start;
                }
                return PointInfo;
            })();
            exports_1("PointInfo", PointInfo);
            LegendValue = (function () {
                function LegendValue(val) {
                    this.ms = 0; // elapsed time
                    this.count = 0;
                    this.per = 0;
                    this.val = val;
                }
                return LegendValue;
            })();
            exports_1("LegendValue", LegendValue);
            DistinctPoints = (function () {
                function DistinctPoints(name) {
                    this.name = name;
                    this.changes = [];
                    this.legendInfo = [];
                    this.last = null;
                    this.asc = false;
                    this.transitionCount = 0;
                    this.distinctValuesCount = 0;
                    this.elapsed = 0;
                }
                // ts numeric ms,
                // val is the normalized value
                DistinctPoints.prototype.add = function (ts, val) {
                    if (this.last == null) {
                        this.last = {
                            val: val,
                            start: ts,
                            ms: 0,
                        };
                        this.changes.push(this.last);
                    }
                    else if (ts === this.last.start) {
                        console.log('skip point with duplicate timestamp', ts, val);
                        return;
                    }
                    else {
                        if (this.changes.length === 1) {
                            this.asc = ts > this.last.start;
                        }
                        if (ts > this.last.start !== this.asc) {
                            console.log('skip out of order point', ts, val);
                            return;
                        }
                        // Same value
                        if (val === this.last.val) {
                            if (!this.asc) {
                                this.last.start = ts;
                            }
                        }
                        else {
                            this.last = {
                                val: val,
                                start: ts,
                                ms: 0,
                            };
                            this.changes.push(this.last);
                        }
                    }
                };
                DistinctPoints.prototype.finish = function (ctrl) {
                    var _this = this;
                    if (this.changes.length < 1) {
                        console.log('no points found!');
                        return;
                    }
                    if (!this.asc) {
                        this.last = this.changes[0];
                        lodash_1.default.reverse(this.changes);
                    }
                    // Add a point beyond the controls
                    if (this.last.start < ctrl.range.to) {
                        var until = ctrl.range.to + 1;
                        // let now = Date.now();
                        // if(this.last.start < now && ctrl.range.to > now) {
                        //   until = now;
                        // }
                        // This won't be shown, but will keep the count consistent
                        this.changes.push({
                            val: this.last.val,
                            start: until,
                            ms: 0,
                        });
                    }
                    this.transitionCount = 0;
                    var distinct = new Map();
                    var last = this.changes[0];
                    for (var i = 1; i < this.changes.length; i++) {
                        var pt = this.changes[i];
                        var s = last.start;
                        var e = pt.start;
                        if (s < ctrl.range.from) {
                            s = ctrl.range.from;
                        }
                        else if (s < ctrl.range.to) {
                            this.transitionCount++;
                        }
                        if (e > ctrl.range.to) {
                            e = ctrl.range.to;
                        }
                        last.ms = e - s;
                        if (last.ms > 0) {
                            if (distinct.has(last.val)) {
                                var v = distinct.get(last.val);
                                v.ms += last.ms;
                                v.count++;
                            }
                            else {
                                distinct.set(last.val, { val: last.val, ms: last.ms, count: 1, per: 0 });
                            }
                        }
                        last = pt;
                    }
                    var elapsed = ctrl.range.to - ctrl.range.from;
                    this.elapsed = elapsed;
                    distinct.forEach(function (value, key) {
                        value.per = value.ms / elapsed;
                        _this.legendInfo.push(value);
                    });
                    this.distinctValuesCount = lodash_1.default.size(this.legendInfo);
                    if (!ctrl.isTimeline) {
                        this.legendInfo = lodash_1.default.orderBy(this.legendInfo, ['ms'], ['desc']);
                    }
                };
                DistinctPoints.combineLegend = function (data, ctrl) {
                    if (data.length == 1) {
                        return data[0];
                    }
                    var merged = new DistinctPoints('merged');
                    var elapsed = 0;
                    var distinct = new Map();
                    lodash_1.default.forEach(data, function (m) {
                        merged.transitionCount += m.transitionCount;
                        elapsed += m.elapsed;
                        lodash_1.default.forEach(m.legendInfo, function (leg) {
                            if (distinct.has(leg.val)) {
                                var v = distinct.get(leg.val);
                                v.ms += leg.ms;
                                v.count += leg.count;
                            }
                            else {
                                distinct.set(leg.val, { val: leg.val, ms: leg.ms, count: leg.count, per: 0 });
                            }
                        });
                    });
                    merged.elapsed = elapsed;
                    distinct.forEach(function (value, key) {
                        value.per = value.ms / elapsed;
                        merged.legendInfo.push(value);
                    });
                    merged.distinctValuesCount = lodash_1.default.size(merged.legendInfo);
                    return merged;
                };
                return DistinctPoints;
            })();
            exports_1("DistinctPoints", DistinctPoints);
        }
    }
});
//# sourceMappingURL=distinct-points.js.map