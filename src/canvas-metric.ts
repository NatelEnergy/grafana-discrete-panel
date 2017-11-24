///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';

import _ from 'lodash';
import moment from 'moment';
import $ from 'jquery';

import appEvents from 'app/core/app_events';


// Expects a template with:
// <div class="canvas-spot"></div>
export class CanvasPanelCtrl extends MetricsPanelCtrl {

  data: any;
  mouse: any;
  $tooltip: any;
  wrap: any;
  canvas: any;
  context: any;
  _devicePixelRatio: number;

  constructor($scope, $injector) {
    super($scope, $injector);

    this.data = null;
    this.mouse = {
      position: null,
      down: null,
    };
    this.$tooltip = $('<div class="graph-tooltip">');

    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
    this.events.on('render', this.onRender.bind(this));

    this._devicePixelRatio = 1;
    if (window.devicePixelRatio !== undefined) {
      this._devicePixelRatio = window.devicePixelRatio;
    }
  }

  onPanelInitalized() {
    //console.log("onPanelInitalized()");
    this.render();
  }

  onRefresh() {
    //console.log("onRefresh()");
    this.render();
  }

  // Typically you will override this
  onRender() {
    if ( !(this.context) ) {
      console.log( 'No context!');
      return;
    }
    console.log( 'canvas render', this.mouse );

    var rect = this.wrap.getBoundingClientRect();


    var height = Math.max( this.height, 100 );
    var width = rect.width;
    this.canvas.width = width;
    this.canvas.height = height;

    var centerV = height / 2;

    var ctx = this.context;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';

    var time = "";
    if (this.mouse.position != null) {
      time = this.dashboard.formatDate( moment(this.mouse.position.ts) );
    }

    ctx.fillStyle = '#999999';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.font = '24px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Mouse @ "+time, 10, centerV);



    if (this.mouse.position != null ) {
      if (this.mouse.down != null) {
        var xmin = Math.min( this.mouse.position.x, this.mouse.down.x);
        var xmax = Math.max( this.mouse.position.x, this.mouse.down.x);

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

  clearTT() {
    this.$tooltip.detach();
  }

  getMousePosition(evt) {
    var elapsed = this.range.to - this.range.from;
    var rect = this.canvas.getBoundingClientRect();
    var x = evt.offsetX; // - rect.left;
    var ts = this.range.from + (elapsed*(x/parseFloat(rect.width)));
    var y = evt.clientY - rect.top;

    return {
      x: x,
      y: y,
      yRel: y / parseFloat(rect.height),
      ts: ts,
      evt: evt
    };
  }

  onGraphHover(evt, showTT, isExternal) {
    console.log( "HOVER", evt, showTT, isExternal );
  }

  onMouseClicked(where) {
    console.log( "CANVAS CLICKED", where );
    this.render();
  }

  onMouseSelectedRange(range) {
    console.log( "CANVAS Range", range );
  }

  link(scope, elem, attrs, ctrl) {
    this.wrap = elem.find('.canvas-spot')[0];
    this.canvas = document.createElement("canvas");
    this.wrap.appendChild(this.canvas);

    $(this.canvas).css( 'cursor', 'pointer' );
    $(this.wrap).css( 'width', '100%' );

  //  console.log( 'link', this );

    this.context = this.canvas.getContext('2d');
    this.canvas.addEventListener('mousemove', (evt) => {
      if (!this.range) {
        return; // skip events before we have loaded
      }

      this.mouse.position = this.getMousePosition(evt);
      var info = {
        pos: {
          pageX: evt.pageX,
          pageY: evt.pageY,
          x: this.mouse.position.ts,
          y: this.mouse.position.y,
          panelRelY: this.mouse.position.yRel,
          panelRelX: this.mouse.position.xRel
        },
        evt: evt,
        panel: this.panel
      };
      appEvents.emit('graph-hover', info);
      if (this.mouse.down != null) {
        $(this.canvas).css( 'cursor', 'col-resize' );
      }
    }, false);

    this.canvas.addEventListener('mouseout', (evt) => {
      if (this.mouse.down == null) {
        this.mouse.position = null;
        this.onRender();
        this.$tooltip.detach();
        appEvents.emit('graph-hover-clear');
      }
    }, false);

    this.canvas.addEventListener('mousedown', (evt) => {
      this.mouse.down = this.getMousePosition(evt);
    }, false);

    this.canvas.addEventListener('mouseenter', (evt) => {
      if (this.mouse.down && !evt.buttons ) {
        this.mouse.position = null;
        this.mouse.down = null;
        this.onRender();
        this.$tooltip.detach();
        appEvents.emit('graph-hover-clear');
      }
      $(this.canvas).css( 'cursor', 'pointer' );
    }, false);

    this.canvas.addEventListener('mouseup', (evt) => {
      this.$tooltip.detach();
      var up = this.getMousePosition(evt);
      if (this.mouse.down != null) {
        if (up.x === this.mouse.down.x && up.y === this.mouse.down.y ) {
          this.mouse.position = null;
          this.mouse.down = null;
          this.onMouseClicked(up);
        } else {
          var min = Math.min(this.mouse.down.ts, up.ts);
          var max = Math.max(this.mouse.down.ts, up.ts);
          var range = {from: moment.utc(min), to: moment.utc(max) };
          this.mouse.position = up;
          this.onMouseSelectedRange(range);
        }
      }
      this.mouse.down = null;
      this.mouse.position = null;
    }, false);

    this.canvas.addEventListener('dblclick', (evt) => {
      this.mouse.position = null;
      this.mouse.down = null;
      this.onRender();
      this.$tooltip.detach();
      appEvents.emit('graph-hover-clear');

      console.log( 'TODO, ZOOM OUT' );

    }, true);

    // global events
    appEvents.on('graph-hover', (event) => {

      // ignore other graph hover events if shared tooltip is disabled
      var isThis = event.panel.id === this.panel.id;
      if (!this.dashboard.sharedTooltipModeEnabled() && !isThis) {
        return;
      }

      // ignore if other panels are fullscreen
      if (this.otherPanelInFullscreenMode()) {
        return;
      }

      // Calculate the mouse position when it came from somewhere else
      if (!isThis) {
        if (!event.pos.x) {
          console.log( "Invalid hover point", event );
          return;
        }

        var ts = event.pos.x;
        var rect = this.canvas.getBoundingClientRect();
        var elapsed = this.range.to - this.range.from;
        var x = ((ts - this.range.from)/elapsed)*rect.width;

        this.mouse.position = {
          x: x,
          y: event.pos.panelRelY * rect.height,
          yRel: event.pos.panelRelY,
          ts: ts,
          gevt: event
        };
        //console.log( "Calculate mouseInfo", event, this.mouse.position);
      }

      this.onGraphHover(event, isThis || !this.dashboard.sharedCrosshairModeOnly(), !isThis);
    }, scope);

    appEvents.on('graph-hover-clear', (event, info) => {
      this.mouse.position = null;
      this.mouse.down = null;
      this.render();
      this.$tooltip.detach();
    }, scope);

    // scope.$on('$destroy', () => {
    //   this.$tooltip.destroy();
    //   elem.off();
    //   elem.remove();
    // });
  }
}

