'use strict';

angular.module('myApp.levelDesigner', [])
  .directive('levelDesigner', ['ToolbarService', 
    function(toolbarService) {

      return {
        restrict: 'E',
        replace: true,
        template: '<canvas width="800" height="550"></canvas>',
        link: function(scope, element, attrs) {
              var ctx,
                ctxWidth = 800,
                ctxHeight = 550,
                options = {
                  fps: 60,  // frames per second
                  mouseSize: 40, // radius of mouse circle
                  clrBackground: '#ffffff', // color for background
                  clrRain: '#000000', // color for rain drop
                  clrMouse: '#ff0000' // color for mouse marker
                },
                canvasOffset,
                timeLast,
                isStarted,
                interval;
          
            ctx = scope.ctx = element[0].getContext('2d');

            function init() {
              toolbarService.init(ctxWidth, ctxHeight);
            }

            function drawFrame(now) {
              ctx.fillStyle = options.clrBackground;
              ctx.strokeStyle = options.clrRain;
              ctx.fillRect(0,0,ctxWidth,ctxHeight);
              ctx.strokeRect(0,0,ctxWidth,ctxHeight);

              toolbarService.draw(ctx);
              window.requestAnimationFrame(drawFrame);          
            }

            init();
            window.requestAnimationFrame(drawFrame);

            element.on('click', function(event) {
              click
            });
        }
      }
  }])
  .factory('ToolbarService', [function() {
    var ctxDx, ctxDy;
    var dyToolbar = 100;
    return {
      init: function (dx, dy) {
        ctxDx = dx;
        ctxDy = dy;
      },
      draw: function(ctx) {
        ctx.fillStyle = 'gray';
        ctx.strokeStyle = 'black';
        ctx.fillRect(0,0,ctxDx,dyToolbar);
        ctx.strokeRect(0,0,ctxDx,dyToolbar);
        
      },
      click: function(pos) {

      }
    };
  }]);