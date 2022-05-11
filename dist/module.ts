///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import config from 'app/core/config';

import {CanvasPanelCtrl} from './canvas-metric';
import {DistinctPoints} from './distinct-points';

import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import kbn from 'app/core/utils/kbn';

import appEvents from 'app/core/app_events';
import appFontSize from 'app/core/utils/fontsize';

import {loadPluginCss} from 'app/plugins/sdk';
import {getI18n, setI18n} from './i18n';

loadPluginCss({
  dark: 'plugins/natel-discrete-panel/css/discrete.dark.css',
  light: 'plugins/natel-discrete-panel/css/discrete.light.css',
});

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

const colorSwitch = [];

class DiscretePanelCtrl extends CanvasPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;
  defaults = {
    display: 'timeline', // or 'stacked'
    rowHeight: 100,
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
    textSizeTime: 14,
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
    adjFontSize: true,
    FontSize: '70%',
    FontSizeValue: '140%',
    // FontSizeTime: '0.8vw',
    nullValue: false,
  };
  translate: any;
  data: any = null;
  externalPT = false;
  isTimeline = true;
  isStacked = false;
  hoverPoint: any = null;
  colorMap: any = {};
  _colorsPaleteCash: any = null;
  unitFormats: any = null; // only used for editor
  formatter: any = null;
  fontSizes = null;
  fontCalc = null;

  _renderDimensions: any = {};
  _selectionMatrix: Array<Array<String>> = [];
  noPoints = false;
  timeSrv: any;

  constructor($scope, $injector) {
    super($scope, $injector);
    // console.log(languageList);
    // defaults configs
    this.translate = $injector.get('$translate');
    _.defaultsDeep(this.panel, this.defaults);
    this.panel.display = 'timeline'; // Only supported version now

    // li.na modify start at 2019.4.16
    this.fontCalc = [
      {
        text: '60%',
        value: '60%',
        vw: '0.6vw',
        px: '12px',
      },
      {
        text: '70%',
        value: '70%',
        vw: '0.8vw',
        px: '15px',
      },
      {
        text: '80%',
        value: '80%',
        vw: '1vw',
        px: '19px',
      },
      {
        text: '100%',
        value: '100%',
        vw: '1.4vw',
        px: '27px',
      },
      {
        text: '110%',
        value: '110%',
        vw: '1.6vw',
        px: '31px',
      },
      {
        text: '120%',
        value: '120%',
        vw: '1.8vw',
        px: '35px',
      },
      {
        text: '130%',
        value: '130%',
        vw: '2vw',
        px: '38px',
      },
      {
        text: '140%',
        value: '140%',
        vw: '2.2vw',
        px: '42px',
      },
      {
        text: '150%',
        value: '150%',
        vw: '2.4vw',
        px: '46px',
      },
      {
        text: '160%',
        value: '160%',
        vw: '2.6vw',
        px: '50px',
      },
      {
        text: '180%',
        value: '180%',
        vw: '3vw',
        px: '58px',
      },
      {
        text: '200%',
        value: '200%',
        vw: '3.4vw',
        px: '65px',
      },
      {
        text: '220%',
        value: '220%',
        vw: '3.8vw',
        px: '73px',
      },
      {
        text: '230%',
        value: '230%',
        vw: '4vw',
        px: '77px',
      },
    ];
    // li.na modify end at 2019.4.16

    if (this.scope.$$listeners.isWisePaas) {
      this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
      this.events.on('render', this.onRender.bind(this));
      this.events.on('data-received', this.onDataReceived.bind(this));
      this.events.on('panel-initialized', this.onPanelInitialized.bind(this));
      this.events.on('data-error', this.onDataError.bind(this));
      this.events.on('refresh', this.onRefresh.bind(this));
      this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    }
    this.timeSrv = $scope.ctrl.timeSrv;
  }
  // Shaun add 20220506 replace val with Dashboard Variables
  replaceCodes(val) {
    const templateSrv = this.templateSrv;
    const mapcode = {
      group: '',
      Value: '',
      Text: '',
    };
    console.log(this.data[0].name);
    let gp = this.data[0].name.replace(/\d/g, '');
    // console.log(templateSrv.index['code']);
    if (templateSrv.index['code']) {
      for (let j = 0; j < templateSrv.index['code'].options.length; j++) {
        [mapcode.group, mapcode.Value, mapcode.Text] = templateSrv.index['code'].options[
          j
        ].text.split('|');
        console.log(gp + val, mapcode.group + mapcode.Value);
        if (gp + val === mapcode.group + mapcode.Value) {
          val = mapcode.Text;
        }
      }
    }
    return val;
  }

  onDataSnapshotLoad(snapshotData) {
    this.onDataReceived(snapshotData);
  }

  onPanelInitialized() {
    this.updateColorInfo();
    this.onConfigChanged();
  }

  onDataError(err) {
    console.log('onDataError', err);
  }

  onInitEditMode() {
    this.unitFormats = kbn.getUnitFormats();
    const translateArr = [
      'public.options',
      'public.legend',
      'public.colors',
      'natel-discrete-panel.Mappings',
    ];
    this.translate(translateArr).then(translate => {
      this.addEditorTab(
        translate['public.options'],
        'public/plugins/natel-discrete-panel/partials/editor.options.html',
        2
      );
      this.addEditorTab(
        translate['public.legend'],
        'public/plugins/natel-discrete-panel/partials/editor.legend.html',
        3
      );
      this.addEditorTab(
        translate['public.colors'],
        'public/plugins/natel-discrete-panel/partials/editor.colors.html',
        4
      );
      this.addEditorTab(
        translate['natel-discrete-panel.Mappings'],
        'public/plugins/natel-discrete-panel/partials/editor.mappings.html',
        5
      );
    });
    this.editorTabIndex = 1;
  }

  onRender() {
    this.initI18n();
    if (this.data == null || !this.context) {
      return;
    }
    this.data = this.formatDatas();
    this._updateRenderDimensions();
    this._updateSelectionMatrix();
    this._updateCanvasSize();
    this._renderRects();
    this._renderTimeAxis();
    this._renderLabels();
    this._renderSelection();
    this._renderCrosshair();
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

  formatValue(val) {
    colorSwitch.length = 0;
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
      if (this.formatter) {
        val = this.formatter(val, this.panel.decimals);
      }
    }
    let isNull = _.isNil(val);
    if (!isNull && !_.isString(val)) {
      val = val.toString(); // convert everything to a string
    }

    for (let i = 0; i < this.panel.valueMaps.length; i++) {
      const mapJson = {
        colorValue: '',
        colorText: '',
      };

      var map = this.panel.valueMaps[i];
      // special null case
      if (map.value === 'null') {
        if (isNull) {
          return map.text;
        }
        continue;
      }

      if (val === map.value) {
        mapJson.colorValue = map.value;
        mapJson.colorText = map.text;
        colorSwitch.push(mapJson);
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
    // li.na add start at 2019.6.19
    if (this._colorsPaleteCash[val] === undefined) {
      // let c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
      // if (colorSwitch.length === 0) {
      //   this._colorsPaleteCash[val] = c;
      // } else {
      //   for (let i = 0; i < colorSwitch.length; i++) {
      //     if (colorSwitch[i].colorText === val) {
      //       let colorSwitchValue = this._colorsPaleteCash[colorSwitch[i].colorValue];
      //       this._colorsPaleteCash[val] = colorSwitchValue;
      //     } else {
      //       this._colorsPaleteCash[val] = c;
      //     }
      //   }
      // }
      // this._colorsPaleteCash.length++;
      let c = grafanaColors[this._colorsPaleteCash.length % grafanaColors.length];
      if (colorSwitch.length === 0) {
        if (this.checkValidValueMapping(val)) {
          this.mappingColorsPaleteCash(val, c);
        } else {
          this._colorsPaleteCash[val] = c;
        }
      } else {
        this.mappingColorsPaleteCash(val, c);
      }
      // li.na add end at 2019.6.19
      this._colorsPaleteCash.length++;
    }
    return this._colorsPaleteCash[val];
  }

  //li.na add at 2019.7.19
  // find valid valueMapping
  checkValidValueMapping(val) {
    for (let i = 0; i < this.panel.valueMaps.length; i++) {
      if (
        this.panel.valueMaps[i].text === val &&
        this.panel.valueMaps[i].text &&
        this.panel.valueMaps[i].text !== 'undefined'
      ) {
        return true;
      }
    }
    return false;
  }

  // mappingColor
  mappingColorsPaleteCash(val, c) {
    for (let i = 0; i < this.panel.valueMaps.length; i++) {
      if (
        this.panel.valueMaps[i].value === '' ||
        this.panel.valueMaps[i].value === 'null'
      ) {
        this._colorsPaleteCash[val] = c;
        continue;
      }
      if (this.panel.valueMaps[i].text === val) {
        if (this.colorMap.hasOwnProperty(this.panel.valueMaps[i].value)) {
          this._colorsPaleteCash[val] = this.colorMap[this.panel.valueMaps[i].value];
        } else {
          this._colorsPaleteCash[val] = this._colorsPaleteCash[
            this.panel.valueMaps[i].value
          ];
          if (this._colorsPaleteCash[val] === 'undefined') {
            this._colorsPaleteCash[val] = c;
          }
        }
      }
    }
  }
  //li.na add end

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
    if (Array.isArray(dataList) && dataList.length === 0) {
      this.noPoints = true;
    } else {
      let datas = [];
      _.forEach(dataList, metric => {
        if (Array.isArray(metric.datapoints)) {
          datas = datas.concat(metric.datapoints);
        }
      });
      if (datas.length === 0) {
        this.noPoints = true;
      }
    }
    $(this.canvas).css('cursor', 'pointer');

    //    console.log('GOT', dataList);
    this.dataList = dataList;
    this.data = this.formatDatas();

    this.onRender();

    //console.log( 'data', dataList, this.data);
  }

  exportReportCsv() {
    this.panel.exportReportCsv(this.dataList);
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
              let v;
              if (colorSwitch.length === 0) {
                v = {text: info.val, color: this.getColor(info.val)};
              } else {
                for (let i = 0; i < colorSwitch.length; i++) {
                  if (colorSwitch[i].colorText === info.val) {
                    v = {text: info.val, color: this.getColor(colorSwitch[i].colorValue)};
                  } else {
                    v = {text: info.val, color: this.getColor(info.val)};
                  }
                }
              }
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
    // li.na modify start at 2019.7.10
    this.refresh();
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

  getFontSize(fontSize) {
    return appFontSize.getValue(this.panel.adjFontSize, fontSize);
  }

  getLegendDisplay(info, metric) {
    let disp = info.val;
    // Shaun add 20220506 replace disp with Dashboard Variables
    disp = this.replaceCodes(disp);
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
    // Shaun add 20220506 replace val with Dashboard Variables
    val = this.replaceCodes(val);

    if (this.mouse.down != null) {
      from = Math.min(this.mouse.down.ts, this.mouse.position.ts);
      to = Math.max(this.mouse.down.ts, this.mouse.position.ts);
      time = to - from;
      val = 'Zoom To:';
    }

    let body = '<div class="graph-tooltip-time">' + val + '</div>';
    const formatTimeType = 'YYYY-MM-DD HH:mm:ss';
    const fromData = this.timeFormatFun(from, formatTimeType);
    const toData = this.timeFormatFun(to, formatTimeType);

    body += '<center>';
    body += fromData + '<br/>';
    body += 'to<br/>';
    body += toData + '<br/><br/>';
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
      var panelHeight = $('.panel-container').height();
      let j = Math.floor(
        this.mouse.position.y / (this.panel.rowHeight * panelHeight * 0.001)
      );
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

        if (showTT) {
          this.externalPT = isExternal;
          this.showTooltip(evt, hover, isExternal);
        }
        this.onRender(); // refresh the view
      } else if (!isExternal) {
        if (this.isStacked) {
          hover = this.data[j].legendInfo[0];
          for (let i = 0; i < this.data[j].legendInfo.length; i++) {
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
    } else {
      this.$tooltip.detach(); // make sure it is hidden
    }
  }

  onMouseClicked(where) {
    let pt = this.hoverPoint;
    if (pt && pt.start) {
      let range = {from: moment.utc(pt.start), to: moment.utc(pt.start + pt.ms)};
      this.timeSrv.setTime(range);
      this.clear();
    }
  }

  onMouseSelectedRange(range) {
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
    var domObj = $('.panel-container');
    if (domObj.length > 0) {
      var maxHeight;
      for (var i = 0; i < domObj.length; i++) {
        if (i === 0) {
          var a = domObj[i];
          maxHeight = a.getBoundingClientRect().height;
        } else {
          var b = domObj[i];
          var domHeight = b.getBoundingClientRect().height;
          if (domHeight > maxHeight) {
            maxHeight = domHeight;
          }
        }
      }
    }
    var panelHeight = $('.panel-container').height();
    if (panelHeight < maxHeight) {
      panelHeight = maxHeight;
    }

    const rect = (this._renderDimensions.rect = this.wrap.getBoundingClientRect());
    const rows = (this._renderDimensions.rows = this.data.length);
    const rowHeight = (this._renderDimensions.rowHeight =
      this.panel.rowHeight * panelHeight * 0.001);
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
    // ctx.font = this.panel.textSize + 'px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.font =
      this.getFontSize(this.panel.FontSizeValue) +
      ' "Open Sans", Helvetica, Arial, sans-serif';

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
              //Shaun modify 20220506 replace val with Dashboard Variables
              let val = this.replaceCodes(this._getVal(i, j));
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
      if (this.panel.writeLastValue && positions.length > 0) {
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
    if (!this.panel.showTimeAxis || this.noPoints) {
      return;
    }

    var panelHeight = $('.panel-container').height();
    const ctx = this.context;
    const rows = this.data.length;
    const rowHeight = this.panel.rowHeight * panelHeight * 0.001;
    const height = this._renderDimensions.height;
    const width = this._renderDimensions.width;
    const top = this._renderDimensions.rowsHeight;

    const headerColumnIndent = 0; // header inset (zero for now)

    ctx.font = this.panel.textSizeTime + ' "Open Sans", Helvetica, Arial, sans-serif';
    // ctx.fillStyle = this.panel.timeTextColor;
    ctx.fillStyle = $('.discrete-Theme').css('color');
    ctx.textAlign = 'left';
    // ctx.strokeStyle = this.panel.timeTextColor;
    ctx.strokeStyle = $('.discrete-Theme').css('color');
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

    let timeFormat = this.timeSrv.graphTimeFormat(timeResolution / 1000, min, max);

    while (nextPointInTime < max) {
      // draw ticks
      ctx.beginPath();
      ctx.moveTo(xPos, top + 5);
      ctx.lineTo(xPos, 0);
      ctx.lineWidth = 1;
      ctx.stroke();

      // draw time label
      let date = new Date(nextPointInTime);
      let dateStr = this.timeFormatFun(date, timeFormat);
      let xOffset = ctx.measureText(dateStr).width / 2;
      ctx.fillText(dateStr, xPos - xOffset, top + 10);

      nextPointInTime += timeResolution;
      xPos += pixelStep;
    }
  }

  timeFormatFun(date: Date, timeFormat: any) {
    const dateTimeFormat = this.timeSrv.dateTimeFormatFun();
    const dashboardTimeZone = this.dashboard.getTimezone();

    return dateTimeFormat(date.valueOf(), {
      format: timeFormat,
      timeZone: dashboardTimeZone,
    });
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

    var panelHeight = $('.panel-container').height();
    let ctx = this.context;
    let rows = this.data.length;
    let rowHeight = this.panel.rowHeight * panelHeight * 0.001;
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

  handleValueTextChange(valueMap: any) {
    setI18n(valueMap, 'text', valueMap.text, this.dashboard.panelLanguage);
  }

  handleRangeTextChange(rangeMap: any) {
    setI18n(rangeMap, 'text', rangeMap.text, this.dashboard.panelLanguage);
  }

  handleLegnedFontSizeChange() {
    setI18n(this.panel, 'FontSize', this.panel.FontSize, this.dashboard.panelLanguage);
  }

  handleFontSizeChange() {
    setI18n(
      this.panel,
      'FontSizeValue',
      this.panel.FontSizeValue,
      this.dashboard.panelLanguage
    );
  }

  formatDatas() {
    let data = [];
    _.forEach(this.dataList, metric => {
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
        // ��ĳһʱ���ϵ�
        if (this.panel.nullValue) {
          var length = metric.datapoints.length;
          metric.datapoints[length - 1][0] = null;
        }
        let res = new DistinctPoints(metric.target);
        _.forEach(metric.datapoints, point => {
          res.add(point[1], this.formatValue(point[0]));
        });
        res.finish(this);
        data.push(res);
      }
    });
    return data;
  }

  initI18n() {
    if (this.dashboard.panelLanguage) {
      for (const valueMap of this.panel.valueMaps) {
        valueMap.text = getI18n(valueMap, 'text', this.dashboard.panelLanguage);
      }
      for (const rangeMap of this.panel.rangeMaps) {
        rangeMap.text = getI18n(rangeMap, 'text', this.dashboard.panelLanguage);
      }
      this.panel.FontSize = getI18n(this.panel, 'FontSize', this.dashboard.panelLanguage);
      this.panel.FontSizeValue = getI18n(
        this.panel,
        'FontSizeValue',
        this.dashboard.panelLanguage
      );
    }
  }
}

export {DiscretePanelCtrl as PanelCtrl};
