import _ from 'lodash';

export class PointInfo {
  val: string;
  start: number; // timestamp
  ms: number = 0; // elapsed time

  constructor(val: string, start: number) {
    this.val = val;
    this.start = start;
  }
}

export class LegendValue {
  val: string;
  ms: number = 0; // elapsed time
  count: number = 0;
  per: number = 0;

  constructor(val: string) {
    this.val = val;
  }
}

export class DistinctPoints {
  changes: Array<PointInfo> = [];
  legendInfo: Array<LegendValue> = [];
  last: PointInfo = null;
  asc = false;
  transitionCount = 0;
  distinctValuesCount = 0;
  elapsed = 0;

  constructor(public name) {}

  // ts numeric ms,
  // val is the normalized value
  add(ts: number, val: string) {
    if (this.last == null) {
      this.last = {
        val: val,
        start: ts,
        ms: 0,
      };
      this.changes.push(this.last);
    } else if (ts === this.last.start) {
      console.log('skip point with duplicate timestamp', ts, val);
      return;
    } else {
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
      } else {
        this.last = {
          val: val,
          start: ts,
          ms: 0,
        };
        this.changes.push(this.last);
      }
    }
  }

  finish(ctrl) {
    if (this.changes.length < 1) {
      console.log('no points found!');
      return;
    }

    if (!this.asc) {
      this.last = this.changes[0];
      _.reverse(this.changes);
    }

    // Add a point beyond the controls
    if (this.last.start < ctrl.range.to) {
      let until = ctrl.range.to + 1;
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
    let distinct = new Map<string, LegendValue>();
    let last: PointInfo = this.changes[0];
    for (let i = 1; i < this.changes.length; i++) {
      let pt = this.changes[i];

      let s = last.start;
      let e = pt.start;
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
        if (distinct.has(last.val)) {
          let v = distinct.get(last.val);
          v.ms += last.ms;
          v.count++;
        } else {
          distinct.set(last.val, {val: last.val, ms: last.ms, count: 1, per: 0});
        }
      }
      last = pt;
    }

    let elapsed = ctrl.range.to - ctrl.range.from;
    this.elapsed = elapsed;

    distinct.forEach((value: LegendValue, key: any) => {
      value.per = value.ms / elapsed;
      this.legendInfo.push(value);
    });
    this.distinctValuesCount = _.size(this.legendInfo);

    if (!ctrl.isTimeline) {
      this.legendInfo = _.orderBy(this.legendInfo, ['ms'], ['desc']);
    }
  }

  static combineLegend(data: DistinctPoints[], ctrl: any): DistinctPoints {
    if (data.length == 1) {
      return data[0];
    }

    let merged: DistinctPoints = new DistinctPoints('merged');
    let elapsed = 0;
    let distinct = new Map<string, LegendValue>();
    _.forEach(data, (m: DistinctPoints) => {
      merged.transitionCount += m.transitionCount;
      elapsed += m.elapsed;

      _.forEach(m.legendInfo, (leg: LegendValue) => {
        if (distinct.has(leg.val)) {
          let v = distinct.get(leg.val);
          v.ms += leg.ms;
          v.count += leg.count;
          // per gets recalculated at the end
        } else {
          distinct.set(leg.val, {val: leg.val, ms: leg.ms, count: leg.count, per: 0});
        }
      });
    });

    merged.elapsed = elapsed;
    distinct.forEach((value: LegendValue, key: any) => {
      value.per = value.ms / elapsed;
      merged.legendInfo.push(value);
    });
    merged.distinctValuesCount = _.size(merged.legendInfo);
    return merged;
  }
}
