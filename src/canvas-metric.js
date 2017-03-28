
import {MetricsPanelCtrl} from  'app/plugins/sdk';

import _ from 'lodash';
import moment from 'moment';
import angular from 'angular';

// Expects a template with:
// <div class="canvas-spot"></div>
export class CanvasPanelCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $q) {
    super($scope, $injector);

    this.q = $q;
    this.data = null;
    this.mouse = {
      position: null,
      down: null,
    };
    this.$tooltip = $('<div id="tooltip" class="graph-tooltip">');

    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
    this.events.on('render', this.onRender.bind(this));

    console.log( 'constructor', this );
  }

  onPanelInitalized() {
    console.log("onPanelInitalized()");
    this.render();
  }

  onRefresh() {
    console.log("onRefresh()");
    this.render();
  }

  // Typically you will override this
  onRender() {
    if( !(this.context) ) {
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
    if(this.mouse.position != null) {
      time = this.dashboard.formatDate( moment(this.mouse.position.ts) );
    }

    ctx.fillStyle = '#999999';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.font = '24px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Mouse @ "+time, 10, centerV);



    if(this.mouse.position != null ) {
      if(this.mouse.down != null) {
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
  }

  clearTT() {
    this.$tooltip.detach(); 
  }

  getMousePosition(evt) {
    var rect = this.canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var elapsed = this.range.to - this.range.from;
    var ts = this.range.from + (elapsed*(x/rect.width));

    return {
      x: x,
      y: evt.clientY - rect.top,
      ts: ts,
      evt: evt
    };
  }

  onMouseMoved(evt) {

    var pos = this.mouse.position;
    var body = '<div class="graph-tooltip-time">hello</div>';
    
    body += "<center>"
    body += this.dashboard.formatDate( moment(pos.ts) );
    body += "</center>"

    this.$tooltip.html(body).place_tt(pos.evt.pageX + 20, pos.evt.pageY);

    this.render();
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

    console.log( 'link', this );

    this.context = this.canvas.getContext('2d');
    this.canvas.addEventListener('mousemove', (evt) => {
      this.mouse.position = this.getMousePosition(evt);
      this.onMouseMoved(evt);
    }, false);

    this.canvas.addEventListener('mouseout', (evt) => {
      this.mouse.position = null;
      this.mouse.down = null;
      this.onRender(); 
      this.$tooltip.detach();
    }, false);

    this.canvas.addEventListener('mousedown', (evt) => {
      this.mouse.down = this.getMousePosition(evt);
      $(this.canvas).css( 'cursor', 'col-resize' );
    }, false);

    this.canvas.addEventListener('mouseenter', (evt) => {
      $(this.canvas).css( 'cursor', 'pointer' );
    }, false);

    this.canvas.addEventListener('mouseup', (evt) => {
      var up = this.getMousePosition(evt);
      if(this.mouse.down != null) {
        if(up.x == this.mouse.down.x && up.y == this.mouse.down.y ) {
          this.onMouseClicked(up);
        }
        else {
          var min = Math.min(this.mouse.down.ts, up.ts);
          var max = Math.max(this.mouse.down.ts, up.ts);
          var range = {from: moment.utc(min), to: moment.utc(max) };
          this.mouse.position = up;
          this.onMouseSelectedRange(range);
        }
      }
      this.mouse.down = null;
      this.mouse.position = null;
      this.$tooltip.detach();
    }, false);
  }
}

