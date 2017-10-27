import _ from "lodash";

export class DistinctPoints {

  changes: Array<any> = [];
  legendInfo: Array<any> = [];
  last: any = null;
  asc: boolean = false;
  transitionCount: number = 0;
  distinctValuesCount: number = 0;
  elapsed: number = 0;

  constructor(public name) {

  }

  // ts numeric ms,
  // val is the normalized value
  add( ts: number, val: any ) {
    if (this.last == null) {
      this.last = {
        val: val,
        start: ts,
        ms: 0
      };
      this.changes.push(this.last);
    } else if (ts == this.last.ts ) {
      console.log('skip point with duplicate timestamp', ts, val);
      return;
    } else {
      if (this.changes.length === 1) {
        this.asc = ts > this.last.start;
      }

      if ( (ts > this.last.start) != this.asc ) {
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

  finish(ctrl) {
    if (this.changes.length<1) {
      console.log( "no points found!" );
      return;
    }


    if (!this.asc) {
      this.last = this.changes[0];
      _.reverse(this.changes);
    }

    // Add a point beyond the controls
    if (this.last.start < ctrl.range.to) {
      var until = ctrl.range.to+1;
      // var now = Date.now();
      // if(this.last.start < now && ctrl.range.to > now) {
      //   until = now;
      // }

      // This won't be shown, but will keep the count consistent
      this.changes.push( {
        val: this.last.val,
        start: until,
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
    for (var i = 1; i<this.changes.length; i++) {
      var pt = this.changes[i];

      var s = last.start;
      var e = pt.start;
      if ( s < ctrl.range.from ) {
        s = ctrl.range.from;
      } else if (s<ctrl.range.to) {
        this.transitionCount++;
      }

      if ( e > ctrl.range.to ) {
        e = ctrl.range.to;
      }

      last.ms = e - s;
      if (last.ms>0) {
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

    _.forEach(valToInfo, (value) => {
      value.per = (value.ms/elapsed);
      this.legendInfo.push( value );
    });
    this.distinctValuesCount = _.size(this.legendInfo);


    if (!ctrl.isTimeline) {
      this.legendInfo = _.orderBy( this.legendInfo, ['ms'], ['desc'] );
    }
    //console.log( "FINISH", this );
  }
}
