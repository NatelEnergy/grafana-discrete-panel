///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import config from 'app/core/config';
import angular from 'angular';

import {CanvasPanelCtrl} from './canvas-metric';
import {DistinctPoints, LegendValue} from './distinct-points';

import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import kbn from 'app/core/utils/kbn';

import appEvents from 'app/core/app_events';

const grafanaColors = [
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

class DiscretePanelCtrl extends CanvasPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  defaults = {
    display: 'timeline', // or 'stacked'
    rowHeight: 50,
    valueMaps: [{value: 'null', op: '=', text: 'N/A'}],
    rangeMaps: [{from: 'null', to: 'null', text: 'N/A'}],
    colorMaps: [{text: 'N/A', color: '#CCC'}],
    metricNameColor: '#000000',
    valueTextColor: '#000000',
    timeTextColor: '#d8d9da',
    crosshairColor: '#8F070C',
    backgroundColor: 'rgba(128,128,128,0.1)',
    lineColor: 'rgba(0,0,0,0.1)',
    textSize: 24,
    textSizeTime: 12,
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
  };

  annotations: any = [];
  data: DistinctPoints[] = null;
  legend: DistinctPoints[] = null;

  externalPT = false;
  isTimeline = true;
  isStacked = false;
  hoverPoint: any = null;
  colorMap: any = {};
  unitFormats: any = null; // only used for editor
  formatter: any = null;

  _colorsPaleteCash: any = null;
  _renderDimensions: any = {};
  _selectionMatrix: Array<Array<String>> = [];

  constructor($scope, $injector, public annotationsSrv) {
    super($scope, $injector);

    // defaults configs
    _.defaultsDeep(this.panel, this.defaults);
    this.panel.display = 'timeline'; // Only supported version now

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('panel-initialized', this.onPanelInitialized.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
  }

  onPanelInitialized() {
    this.updateColorInfo();
    this.onConfigChanged();
  }

  onDataSnapshotLoad(snapshotData) {
    this.onDataReceived(snapshotData);
  }

  onDataError(err) {
    this.annotations = [];
    console.log('onDataError', err);
  }

  onInitEditMode() {
    this.unitFormats = kbn.getUnitFormats();

    this.addEditorTab(
      'Options',
      'public/plugins/natel-discrete-panel/partials/editor.options.html',
      1
    );
    this.addEditorTab(
      'Legend',
      'public/plugins/natel-discrete-panel/partials/editor.legend.html',
      3
    );
    this.addEditorTab(
      'Colors',
      'public/plugins/natel-discrete-panel/partials/editor.colors.html',
      4
    );
    this.addEditorTab(
      'Mappings',
      'public/plugins/natel-discrete-panel/partials/editor.mappings.html',
      5
    );
    this.editorTabIndex = 1;
    this.refresh();
  }

  onRender() {
    if (this.data == null || !this.context) {
      return;
    }

    this._updateRenderDimensions();
    this._updateSelectionMatrix();
    this._updateCanvasSize();
    this._renderRects();
    this._renderTimeAxis();
    this._renderLabels();
    this._renderAnnotations();
    this._renderSelection();
    this._renderCrosshair();

    this.renderingCompleted();
  }

  showLegandTooltip(pos, info) {
    let body = '<div class="graph-tooltip-time">' + info.val + '</div>';

    body += '<center>';
    if (info.count > 1) {
      body += info.count + ' times<br/>for<br/>';
    }
    body += moment.duration(info.ms).humanize();
    if (info.count > 1) {
      body += '<br/>total';
    }
    body += '</center>';

    this.$tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
  }

  clearTT() {
    this.$tooltip.detach();
  }

  formatValue(val): string {
    if (_.isNumber(val)) {
      if (this.panel.rangeMaps) {
        for (let i = 0; i < this.panel.rangeMaps.length; i++) {
          let map = this.panel.rangeMaps[i];

          // value/number to range mapping
          let from = parseFloat(map.from);
          let to = parseFloat(map.to);
          if (to >= val && from <= val) {
            return map.text;
          }
        }
      }

      // Convert it to a string first
      if (this.formatter) {
        val = this.formatter(val, this.panel.decimals);
      }
    }

    let isNull = _.isNil(val);
    if (!isNull && !_.isString(val)) {
      val = val.toString(); // convert everything to a string
    }

    for (let i = 0; i < this.panel.valueMaps.length; i++) {
      let map = this.panel.valueMaps[i];
      // special null case
      if (map.value === 'null') {
        if (isNull) {
          return map.text;
        }
        continue;
      }

      if (val === map.value) {
        return map.text;
      }
    }

    if (isNull) {
      return 'null';
    }
    return val;
  }

  getColor(val) {
    if (_.has(this.colorMap, val)) {
      return this.colorMap[val];
    }
    if (this._colorsPaleteCash[val] === undefined) {
      let c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
      this._colorsPaleteCash[val] = c;
      this._colorsPaleteCash.length++;
    }
    return this._colorsPaleteCash[val];
  }

  randomColor() {
    let letters = 'ABCDE'.split('');
    let color = '#';
    for (let i = 0; i < 3; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }

  // Override the
  applyPanelTimeOverrides() {
    super.applyPanelTimeOverrides();

    if (this.panel.expandFromQueryS && this.panel.expandFromQueryS > 0) {
      let from = this.range.from.subtract(this.panel.expandFromQueryS, 's');
      this.range.from = from;
      this.range.raw.from = from;
    }
  }

  onDataReceived(dataList) {
    $(this.canvas).css('cursor', 'pointer');

    let data: DistinctPoints[] = [];
    _.forEach(dataList, metric => {
      if ('table' === metric.type) {
        if ('time' !== metric.columns[0].type) {
          throw new Error('Expected a time column from the table format');
        }

        let last = null;
        for (let i = 1; i < metric.columns.length; i++) {
          let res = new DistinctPoints(metric.columns[i].text);
          for (let j = 0; j < metric.rows.length; j++) {
            let row = metric.rows[j];
            res.add(row[0], this.formatValue(row[i]));
          }
          res.finish(this);
          data.push(res);
        }
      } else {
        let res = new DistinctPoints(metric.target);
        _.forEach(metric.datapoints, point => {
          res.add(point[1], this.formatValue(point[0]));
        });
        res.finish(this);
        data.push(res);
      }
    });
    this.data = data;
    this.updateLegendMetrics();

    // Annotations Query
    this.annotationsSrv
      .getAnnotations({
        dashboard: this.dashboard,
        panel: this.panel, // {id: 4}, //
        range: this.range,
      })
      .then(
        result => {
          this.loading = false;
          if (result.annotations && result.annotations.length > 0) {
            this.annotations = result.annotations;
          } else {
            this.annotations = null;
          }
          this.onRender();
        },
        () => {
          this.loading = false;
          this.annotations = null;
          this.onRender();
          console.log('ERRR', this);
        }
      );
  }

  updateLegendMetrics(notify?: boolean) {
    if (
      !this.data ||
      !this.panel.showLegend ||
      this.panel.showLegendNames ||
      this.data.length <= 1
    ) {
      this.legend = this.data;
    } else {
      this.legend = [DistinctPoints.combineLegend(this.data, this)];
    }

    if (notify) {
      this.onConfigChanged();
    }
  }

  removeColorMap(map) {
    let index = _.indexOf(this.panel.colorMaps, map);
    this.panel.colorMaps.splice(index, 1);
    this.updateColorInfo();
  }

  updateColorInfo() {
    let cm = {};
    for (let i = 0; i < this.panel.colorMaps.length; i++) {
      let m = this.panel.colorMaps[i];
      if (m.text) {
        cm[m.text] = m.color;
      }
    }
    this._colorsPaleteCash = {};
    this._colorsPaleteCash.length = 0;
    this.colorMap = cm;
    this.render();
  }

  addColorMap(what) {
    if (what === 'curent') {
      _.forEach(this.data, metric => {
        if (metric.legendInfo) {
          _.forEach(metric.legendInfo, info => {
            if (!_.has(this.colorMap, info.val)) {
              let v = {text: info.val, color: this.getColor(info.val)};
              this.panel.colorMaps.push(v);
              this.colorMap[info.val] = v;
            }
          });
        }
      });
    } else {
      this.panel.colorMaps.push({text: '???', color: this.randomColor()});
    }
    this.updateColorInfo();
  }

  removeValueMap(map) {
    let index = _.indexOf(this.panel.valueMaps, map);
    this.panel.valueMaps.splice(index, 1);
    this.render();
  }

  addValueMap() {
    this.panel.valueMaps.push({value: '', op: '=', text: ''});
  }

  removeRangeMap(rangeMap) {
    let index = _.indexOf(this.panel.rangeMaps, rangeMap);
    this.panel.rangeMaps.splice(index, 1);
    this.render();
  }

  addRangeMap() {
    this.panel.rangeMaps.push({from: '', to: '', text: ''});
  }

  onConfigChanged(update = false) {
    this.isTimeline = this.panel.display === 'timeline';
    this.isStacked = this.panel.display === 'stacked';

    this.formatter = null;
    if (this.panel.units && 'none' !== this.panel.units) {
      this.formatter = kbn.valueFormats[this.panel.units];
    }

    if (update) {
      this.refresh();
    } else {
      this.render();
    }
  }

  getLegendDisplay(info, metric) {
    let disp = info.val;
    if (
      this.panel.showLegendPercent ||
      this.panel.showLegendCounts ||
      this.panel.showLegendTime
    ) {
      disp += ' (';
      let hassomething = false;
      if (this.panel.showLegendTime) {
        disp += moment.duration(info.ms).humanize();
        hassomething = true;
      }

      if (this.panel.showLegendPercent) {
        if (hassomething) {
          disp += ', ';
        }

        let dec = this.panel.legendPercentDecimals;
        if (_.isNil(dec)) {
          if (info.per > 0.98 && metric.changes.length > 1) {
            dec = 2;
          } else if (info.per < 0.02) {
            dec = 2;
          } else {
            dec = 0;
          }
        }
        disp += kbn.valueFormats.percentunit(info.per, dec);
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
  }

  //------------------
  // Mouse Events
  //------------------

  showTooltip(evt, point, isExternal) {
    let from = point.start;
    let to = point.start + point.ms;
    let time = point.ms;
    let val = point.val;

    if (this.mouse.down != null) {
      from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
      to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
      time = to - from;
      val = 'Zoom To:';
    }

    let body = '<div class="graph-tooltip-time">' + val + '</div>';

    body += '<center>';
    body += this.dashboard.formatDate(moment(from)) + '<br/>';
    body += 'to<br/>';
    body += this.dashboard.formatDate(moment(to)) + '<br/><br/>';
    body += moment.duration(time).humanize() + '<br/>';
    body += '</center>';

    let pageX = 0;
    let pageY = 0;
    if (isExternal) {
      let rect = this.canvas.getBoundingClientRect();
      pageY = rect.top + evt.pos.panelRelY * rect.height;
      if (pageY < 0 || pageY > $(window).innerHeight()) {
        // Skip Hidden tooltip
        this.$tooltip.detach();
        return;
      }
      pageY += $(window).scrollTop();

      let elapsed = this.range.to - this.range.from;
      let pX = (evt.pos.x - this.range.from) / elapsed;
      pageX = rect.left + pX * rect.width;
    } else {
      pageX = evt.evt.pageX;
      pageY = evt.evt.pageY;
    }

    this.$tooltip.html(body).place_tt(pageX + 20, pageY + 5);
  }

  onGraphHover(evt, showTT, isExternal) {
    this.externalPT = false;
    if (this.data && this.data.length) {
      let hover = null;
      let j = Math.floor(this.mouse.position.y / this.panel.rowHeight);
      if (j < 0) {
        j = 0;
      }
      if (j >= this.data.length) {
        j = this.data.length - 1;
      }

      if (this.isTimeline) {
        hover = this.data[j].changes[0];
        for (let i = 0; i < this.data[j].changes.length; i++) {
          if (this.data[j].changes[i].start > this.mouse.position.ts) {
            break;
          }
          hover = this.data[j].changes[i];
        }
        this.hoverPoint = hover;

        if (this.annotations && !isExternal && this._renderDimensions) {
          if (evt.pos.y > this._renderDimensions.rowsHeight - 5) {
            let min = _.isUndefined(this.range.from) ? null : this.range.from.valueOf();
            let max = _.isUndefined(this.range.to) ? null : this.range.to.valueOf();
            let width = this._renderDimensions.width;

            const anno = _.find(this.annotations, a => {
              if (a.isRegion) {
                return evt.pos.x > a.time && evt.pos.x < a.timeEnd;
              }
              const anno_x = (a.time - min) / (max - min) * width;
              const mouse_x = evt.evt.offsetX;
              return anno_x > mouse_x - 5 && anno_x < mouse_x + 5;
            });
            if (anno) {
              console.log('TODO, hover <annotation-tooltip>', anno);
              // See: https://github.com/grafana/grafana/blob/master/public/app/plugins/panel/graph/jquery.flot.events.js#L10
              this.$tooltip
                .html(anno.text)
                .place_tt(evt.evt.pageX + 20, evt.evt.pageY + 5);
              return;
            }
          }
        }

        if (showTT) {
          this.externalPT = isExternal;
          this.showTooltip(evt, hover, isExternal);
        }
        this.onRender(); // refresh the view
      } else if (!isExternal) {
        if (this.isStacked) {
          hover = this.data[j].legendInfo[0];
          // for (let i = 0; i < this.data[j].legendInfo.length; i++) {
          //   if (this.data[j].legendInfo[i].x > this.mouse.position.x) {
          //     break;
          //   }
          //   hover = this.data[j].legendInfo[i];
          // }
          this.hoverPoint = hover;
          this.onRender(); // refresh the view

          if (showTT) {
            this.externalPT = isExternal;
            this.showLegandTooltip(evt.evt, hover);
          }
        }
      }
    } else {
      this.$tooltip.detach(); // make sure it is hidden
    }
  }

  onMouseClicked(where, event) {
    if (event.metaKey == true || event.ctrlKey == true) {
      console.log('TODO? Create Annotation?', where, event);
      return;
    }

    let pt = this.hoverPoint;
    if (pt && pt.start) {
      let range = {from: moment.utc(pt.start), to: moment.utc(pt.start + pt.ms)};
      this.timeSrv.setTime(range);
      this.clear();
    }
  }

  onMouseSelectedRange(range, event) {
    if (event.metaKey == true || event.ctrlKey == true) {
      console.log('TODO? Create range annotation?', range, event);
      return;
    }
    this.timeSrv.setTime(range);
    this.clear();
  }

  clear() {
    this.mouse.position = null;
    this.mouse.down = null;
    this.hoverPoint = null;
    $(this.canvas).css('cursor', 'wait');
    appEvents.emit('graph-hover-clear');
    this.render();
  }

  _updateRenderDimensions() {
    this._renderDimensions = {};

    const rect = (this._renderDimensions.rect = this.wrap.getBoundingClientRect());
    const rows = (this._renderDimensions.rows = this.data.length);
    const rowHeight = (this._renderDimensions.rowHeight = this.panel.rowHeight);
    const rowsHeight = (this._renderDimensions.rowsHeight = rowHeight * rows);
    const timeHeight = this.panel.showTimeAxis ? 14 + this.panel.textSizeTime : 0;
    const height = (this._renderDimensions.height = rowsHeight + timeHeight);
    const width = (this._renderDimensions.width = rect.width);

    let top = 0;
    let elapsed = this.range.to - this.range.from;

    this._renderDimensions.matrix = [];
    _.forEach(this.data, metric => {
      let positions = [];

      if (this.isTimeline) {
        let lastBS = 0;
        let point = metric.changes[0];
        for (let i = 0; i < metric.changes.length; i++) {
          point = metric.changes[i];
          if (point.start <= this.range.to) {
            let xt = Math.max(point.start - this.range.from, 0);
            let x = xt / elapsed * width;
            positions.push(x);
          }
        }
      }

      if (this.isStacked) {
        let point = null;
        let start = this.range.from;
        for (let i = 0; i < metric.legendInfo.length; i++) {
          point = metric.legendInfo[i];
          let xt = Math.max(start - this.range.from, 0);
          let x = xt / elapsed * width;
          positions.push(x);
          start += point.ms;
        }
      }

      this._renderDimensions.matrix.push({
        y: top,
        positions: positions,
      });

      top += rowHeight;
    });
  }

  _updateSelectionMatrix() {
    let selectionPredicates = {
      all: function() {
        return true;
      },
      crosshairHover: function(i, j) {
        if (j + 1 === this.data[i].changes.length) {
          return this.data[i].changes[j].start <= this.mouse.position.ts;
        }
        return (
          this.data[i].changes[j].start <= this.mouse.position.ts &&
          this.mouse.position.ts < this.data[i].changes[j + 1].start
        );
      },
      mouseX: function(i, j) {
        let row = this._renderDimensions.matrix[i];
        if (j + 1 === row.positions.length) {
          return row.positions[j] <= this.mouse.position.x;
        }
        return (
          row.positions[j] <= this.mouse.position.x &&
          this.mouse.position.x < row.positions[j + 1]
        );
      },
      metric: function(i) {
        return this.data[i] === this._selectedMetric;
      },
      legendItem: function(i, j) {
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

    let pn = getPredicate.bind(this)();
    let predicate = selectionPredicates[pn].bind(this);
    this._selectionMatrix = [];
    for (let i = 0; i < this._renderDimensions.matrix.length; i++) {
      let rs = [];
      let r = this._renderDimensions.matrix[i];
      for (let j = 0; j < r.positions.length; j++) {
        rs.push(predicate(i, j));
      }
      this._selectionMatrix.push(rs);
    }
  }

  _updateCanvasSize() {
    this.canvas.width = this._renderDimensions.width * this._devicePixelRatio;
    this.canvas.height = this._renderDimensions.height * this._devicePixelRatio;

    $(this.canvas).css('width', this._renderDimensions.width + 'px');
    $(this.canvas).css('height', this._renderDimensions.height + 'px');

    this.context.scale(this._devicePixelRatio, this._devicePixelRatio);
  }

  _getVal(metricIndex, rectIndex) {
    let point = undefined;
    if (this.isTimeline) {
      point = this.data[metricIndex].changes[rectIndex];
    }
    if (this.isStacked) {
      point = this.data[metricIndex].legendInfo[rectIndex];
    }
    return point.val;
  }

  _renderRects() {
    const matrix = this._renderDimensions.matrix;
    const ctx = this.context;
    _.forEach(this.data, (metric, i) => {
      const rowObj = matrix[i];
      for (let j = 0; j < rowObj.positions.length; j++) {
        const currentX = rowObj.positions[j];
        let nextX = this._renderDimensions.width;
        if (j + 1 !== rowObj.positions.length) {
          nextX = rowObj.positions[j + 1];
        }
        ctx.fillStyle = this.getColor(this._getVal(i, j));
        let globalAlphaTemp = ctx.globalAlpha;
        if (!this._selectionMatrix[i][j]) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fillRect(
          currentX,
          matrix[i].y,
          nextX - currentX,
          this._renderDimensions.rowHeight
        );
        ctx.globalAlpha = globalAlphaTemp;
      }

      if (i > 0) {
        const top = matrix[i].y;
        ctx.strokeStyle = this.panel.lineColor;
        ctx.beginPath();
        ctx.moveTo(0, top);
        ctx.lineTo(this._renderDimensions.width, top);
        ctx.stroke();
      }
    });
  }

  _renderLabels() {
    let ctx = this.context;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';

    const offset = 2;
    const rowHeight = this._renderDimensions.rowHeight;
    _.forEach(this.data, (metric, i) => {
      const {y, positions} = this._renderDimensions.matrix[i];

      const centerY = y + rowHeight / 2;
      // let labelPositionMetricName = y + rectHeight - this.panel.textSize / 2;
      // let labelPositionLastValue = y + rectHeight - this.panel.textSize / 2;
      // let labelPositionValue = y + this.panel.textSize / 2;
      let labelPositionMetricName = centerY;
      let labelPositionLastValue = centerY;
      let labelPositionValue = centerY;

      let hoverTextStart = -1;
      let hoverTextEnd = -1;

      if (this.mouse.position) {
        for (let j = 0; j < positions.length; j++) {
          if (positions[j] <= this.mouse.position.x) {
            if (j >= positions.length - 1 || positions[j + 1] >= this.mouse.position.x) {
              let val = this._getVal(i, j);
              ctx.fillStyle = this.panel.valueTextColor;
              ctx.textAlign = 'left';
              hoverTextStart = positions[j] + offset;
              ctx.fillText(val, hoverTextStart, labelPositionValue);
              const txtinfo = ctx.measureText(val);
              hoverTextEnd = hoverTextStart + txtinfo.width + 4;
              break;
            }
          }
        }
      }

      let minTextSpot = 0;
      let maxTextSpot = this._renderDimensions.width;
      if (this.panel.writeMetricNames) {
        ctx.fillStyle = this.panel.metricNameColor;
        ctx.textAlign = 'left';
        const txtinfo = ctx.measureText(metric.name);
        if (hoverTextStart < 0 || hoverTextStart > txtinfo.width) {
          ctx.fillText(metric.name, offset, labelPositionMetricName);
          minTextSpot = offset + ctx.measureText(metric.name).width + 2;
        }
      }
      if (this.panel.writeLastValue) {
        let val = this._getVal(i, positions.length - 1);
        ctx.fillStyle = this.panel.valueTextColor;
        ctx.textAlign = 'right';
        const txtinfo = ctx.measureText(val);
        const xval = this._renderDimensions.width - offset - txtinfo.width;
        if (xval > hoverTextEnd) {
          ctx.fillText(
            val,
            this._renderDimensions.width - offset,
            labelPositionLastValue
          );
          maxTextSpot = this._renderDimensions.width - ctx.measureText(val).width - 10;
        }
      }

      if (this.panel.writeAllValues) {
        ctx.fillStyle = this.panel.valueTextColor;
        ctx.textAlign = 'left';
        for (let j = 0; j < positions.length; j++) {
          const val = this._getVal(i, j);
          let nextX = this._renderDimensions.width;
          if (j + 1 !== positions.length) {
            nextX = positions[j + 1];
          }

          const x = positions[j];
          if (x > minTextSpot) {
            const width = nextX - x;
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
  }

  _renderSelection() {
    if (this.mouse.down === null) {
      return;
    }
    if (this.mouse.position === null) {
      return;
    }
    if (!this.isTimeline) {
      return;
    }

    let ctx = this.context;
    let height = this._renderDimensions.height;

    let xmin = Math.min(this.mouse.position.x, this.mouse.down.x);
    let xmax = Math.max(this.mouse.position.x, this.mouse.down.x);

    ctx.fillStyle = 'rgba(110, 110, 110, 0.5)';
    ctx.strokeStyle = 'rgba(110, 110, 110, 0.5)';
    ctx.beginPath();
    ctx.fillRect(xmin, 0, xmax - xmin, height);
    ctx.strokeRect(xmin, 0, xmax - xmin, height);
  }

  _renderTimeAxis() {
    if (!this.panel.showTimeAxis) {
      return;
    }

    const ctx = this.context;
    const rows = this.data.length;
    const rowHeight = this.panel.rowHeight;
    const height = this._renderDimensions.height;
    const width = this._renderDimensions.width;
    const top = this._renderDimensions.rowsHeight;

    const headerColumnIndent = 0; // header inset (zero for now)

    ctx.font = this.panel.textSizeTime + 'px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.fillStyle = this.panel.timeTextColor;
    ctx.textAlign = 'left';
    ctx.strokeStyle = this.panel.timeTextColor;
    ctx.textBaseline = 'top';
    ctx.setLineDash([7, 5]); // dashes are 5px and spaces are 3px
    ctx.lineDashOffset = 0;

    let min = _.isUndefined(this.range.from) ? null : this.range.from.valueOf();
    let max = _.isUndefined(this.range.to) ? null : this.range.to.valueOf();
    let minPxInterval = ctx.measureText('12/33 24:59').width * 2;
    let estNumTicks = width / minPxInterval;
    let estTimeInterval = (max - min) / estNumTicks;
    let timeResolution = this.getTimeResolution(estTimeInterval);
    let pixelStep = timeResolution / (max - min) * width;
    let nextPointInTime = this.roundDate(min, timeResolution) + timeResolution;
    let xPos = headerColumnIndent + (nextPointInTime - min) / (max - min) * width;

    let timeFormat = this.time_format(max - min, timeResolution / 1000);
    let displayOffset = 0;
    if (this.dashboard.timezone == 'utc') {
      displayOffset = new Date().getTimezoneOffset() * 60000;
    }

    while (nextPointInTime < max) {
      // draw ticks
      ctx.beginPath();
      ctx.moveTo(xPos, top + 5);
      ctx.lineTo(xPos, 0);
      ctx.lineWidth = 1;
      ctx.stroke();

      // draw time label
      const date = new Date(nextPointInTime + displayOffset);
      const dateStr = this.formatDate(date, timeFormat);
      const xOffset = ctx.measureText(dateStr).width / 2;
      ctx.fillText(dateStr, xPos - xOffset, top + 10);

      nextPointInTime += timeResolution;
      xPos += pixelStep;
    }
  }

  _renderCrosshair() {
    if (this.mouse.down != null) {
      return;
    }
    if (this.mouse.position === null) {
      return;
    }
    if (!this.isTimeline) {
      return;
    }

    let ctx = this.context;
    let rows = this.data.length;
    let rowHeight = this.panel.rowHeight;
    let height = this._renderDimensions.height;

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
  }

  _renderAnnotations() {
    if (!this.panel.showTimeAxis) {
      return;
    }
    if (!this.annotations) {
      return;
    }

    const ctx = this.context;
    const rows = this.data.length;
    const rowHeight = this.panel.rowHeight;
    const height = this._renderDimensions.height;
    const width = this._renderDimensions.width;
    const top = this._renderDimensions.rowsHeight;

    const headerColumnIndent = 0; // header inset (zero for now)
    ctx.font = this.panel.textSizeTime + 'px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#7FE9FF';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#7FE9FF';

    ctx.textBaseline = 'top';
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = 0;
    ctx.lineWidth = 2;

    let min = _.isUndefined(this.range.from) ? null : this.range.from.valueOf();
    let max = _.isUndefined(this.range.to) ? null : this.range.to.valueOf();
    let xPos = headerColumnIndent;

    _.forEach(this.annotations, anno => {
      ctx.setLineDash([3, 3]);

      let isAlert = false;
      if (anno.source.iconColor) {
        ctx.fillStyle = anno.source.iconColor;
        ctx.strokeStyle = anno.source.iconColor;
      } else if (anno.annotation === undefined) {
        // grafana annotation
        ctx.fillStyle = '#7FE9FF';
        ctx.strokeStyle = '#7FE9FF';
      } else {
        isAlert = true;
        ctx.fillStyle = '#EA0F3B'; //red
        ctx.strokeStyle = '#EA0F3B';
      }

      this._drawVertical(
        ctx,
        anno.time,
        min,
        max,
        headerColumnIndent,
        top,
        width,
        isAlert
      );

      //do the TO rangeMap
      if (anno.isRegion) {
        this._drawVertical(
          ctx,
          anno.timeEnd,
          min,
          max,
          headerColumnIndent,
          top,
          width,
          isAlert
        );

        //draw horizontal line at bottom
        let xPosStart = headerColumnIndent + (anno.time - min) / (max - min) * width;
        let xPosEnd = headerColumnIndent + (anno.timeEnd - min) / (max - min) * width;

        // draw ticks
        ctx.beginPath();
        ctx.moveTo(xPosStart, top + 5);
        ctx.lineTo(xPosEnd, top + 5);

        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.stroke();
        //end horizontal
        //do transparency
        if (isAlert == false) {
          ctx.save();
          ctx.fillStyle = '#7FE9FF';
          ctx.globalAlpha = 0.2;
          ctx.fillRect(xPosStart, 0, xPosEnd - xPosStart, rowHeight);
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }

  _drawVertical(ctx, timeVal, min, max, headerColumnIndent, top, width, isAlert) {
    let xPos = headerColumnIndent + (timeVal - min) / (max - min) * width;

    // draw ticks
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, top + 5);
    ctx.lineTo(xPos, 0);
    ctx.stroke();

    // draw triangle
    ctx.moveTo(xPos + 0, top);
    ctx.lineTo(xPos - 5, top + 7);
    ctx.lineTo(xPos + 5, top + 7);
    ctx.fill();

    // draw alert label
    if (isAlert == true) {
      let dateStr = '\u25B2';
      let xOffset = ctx.measureText(dateStr).width / 2;
      ctx.fillText(dateStr, xPos - xOffset, top + 10);
    }
  }
}

export {DiscretePanelCtrl as PanelCtrl};
