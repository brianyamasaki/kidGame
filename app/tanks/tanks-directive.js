'use strict';

angular.module('myApp.tanks', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/tanks', {
      templateUrl: 'tanks/tanks.html',
      controller: 'TanksCtrl'
    });
  }])

  .controller('TanksCtrl', [function() {

  }])
  .factory('ProjectileService', [function () {
    var projectiles = [],
      speed = 500;
    return {
      create: function(x, y, angle, distance) {
        var now = new Date().getTime(),
          dx = Math.cos(angle) * speed,
          dy = Math.sin(angle) * speed,
          dtToDistance = distance / speed * 1000;
        projectiles.push({
          x: x,
          y: y,
          dx: dx,
          dy: dy,
          tDie: now + dtToDistance
        });
        // console.log('x: ' + x + '  y: ' + y  + '  dx: ' + dx + '  dy: ' + dy);
      },
      physics: function(dt) {
        var now = new Date().getTime();
        projectiles = projectiles.filter(function(projectile) {
          if (now > projectile.tDie) {
            return false;
          }
          projectile.x += projectile.dx * dt;
          projectile.y += projectile.dy * dt;
          return true;
        });
      },
      draw: function(ctx) {
        projectiles.forEach(function(projectile) {
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(projectile.x, projectile.y, 3, 0, 6.28);
          ctx.closePath();
          ctx.fill();
        });
      }
    };
  }])
  .factory('PlayerTankService', ['ProjectileService', 'MouseService', function(projectileService, mouseService) {
    var tank = {
      x: 0,
      y: 0,
      speed: 0,
      width: 25,
      length: 40,
      angle: 0,
      turret: {
        angle: 0,
        radius: 8
      }
    },
      halfWidth = tank.width / 2,
      halfLength = tank.length / 2;
    return {
      createTank: function (x, y, angle) {
        tank.x = x;
        tank.y = y;
        tank.angle = angle;
      },
      physics: function(dt) {
        tank.x += tank.speed * dt * Math.cos(tank.angle);
        tank.y += tank.speed * dt * Math.sin(tank.angle);
      },
      aimToMouse: function() {
        var angleAim,
          mousePos = mouseService.getPos();
        angleAim = - (Math.atan2(mousePos.x - tank.x, mousePos.y - tank.y) - Math.PI/2);
        tank.turret.angle = angleAim - tank.angle;
      },
      moveForward: function () {
        tank.speed = 70;
      },
      moveBackward: function () {
        tank.speed = -55;
      },
      stop: function () {
        tank.speed = 0;
      },
      rotateLeft: function () {
        tank.angle -= .25;
      },
      rotateRight: function () {
        tank.angle += .25;
      },
      fireProjectileToMouse: function () {
        var mousePos = mouseService.getPos();
        var distance = Math.sqrt(Math.pow(mousePos.x - tank.x, 2) + Math.pow(mousePos.y - tank.y, 2));

        projectileService.create(tank.x, tank.y, tank.angle + tank.turret.angle, distance);

      },
      rotateTurretLeft: function () {
        tank.turret.angle -= .10;
      },
      rotateTurretRight: function () {
        tank.turret.angle += .10;
      },
      draw: function(ctx) {
        ctx.save();

        // draw tank
        ctx.fillStyle = "darkgreen";
        ctx.translate(tank.x, tank.y);
        ctx.rotate(tank.angle);
        ctx.fillRect(-halfLength, -halfWidth, tank.length, tank.width);

        // draw turret
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, tank.turret.radius, 0, 6.28);
        ctx.closePath();
        ctx.fill();

        // draw gun barrel
        ctx.rotate(tank.turret.angle);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(tank.turret.radius * 3, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }
    };
  }])
  .factory('MouseService', [function() {
    var mouseRadius = 30,
      clrMouse = 'red',
      mousePos = {};

    return {
      mouseMove: function (x,y) {
        mousePos.x = x;
        mousePos.y = y;
      },
      getPos: function() {
        return mousePos;
      },
      draw: function (ctx) {
        if (mousePos.x !== undefined) {
          var radius = mouseRadius;
          ctx.strokeStyle = clrMouse;
          ctx.beginPath();
          ctx.arc(mousePos.x, mousePos.y, radius, 0, 2*Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(mousePos.x - radius, mousePos.y);
          ctx.lineTo(mousePos.x + radius, mousePos.y);
          ctx.moveTo(mousePos.x, mousePos.y - radius);
          ctx.lineTo(mousePos.x, mousePos.y + radius);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }])
  .directive('tanksDirective', ['$window', 'ProjectileService', 'PlayerTankService', 'MouseService',
    function(window, projectileService, playerTankService, mouseService) {
    return {
      restrict: 'E',
      replace: true,
      template: '<canvas width="800" height="400"></canvas>',
      link: function (scope, element, attrs) {
        var ctx,
          ctxWidth = 800,
          ctxHeight = 400,
          options = {
            fps: 60,  // frames per second
            mouseSize: 40, // radius of mouse circle
            clrBackground: '#ffffff', // color for background
            clrRain: '#000000', // color for rain drop
            clrMouse: '#ff0000' // color for mouse marker
          },
          points = 0,
          canvasOffset,
          timeLast,
          interval;

        ctx = scope.ctx = element[0].getContext('2d');

        function drawScore(dt) {
          ctx.fillStyle = options.clrRain;
          ctx.font = "16pt Helvetica, Arial, sans serif";
          ctx.fillText(points.toString(), 20, ctxHeight-20);
        }

        function drawPauseScreen() {
          ctx.fillStyle = "darkred";
          ctx.font = "20pt Helvetica, Arial, sans serif";
          ctx.fillText("Paused", ctxWidth/2 - 30, ctxHeight/2);
          ctx.font = "10pt Helvetica, Arial, san serif";
          ctx.fillText('Click mouse to continue', ctxWidth/2 - 40, ctxHeight/2 + 20);
        }

        function gameOver() {
          ctx.fillStyle = "red";
          ctx.font = '20pt Helvetica, Arial, sans serif';
          ctx.fillText('Game Over', ctxWidth/2 - 35, ctxHeight/2);
          points = 0;
        }

        function physics(dt) {
          playerTankService.physics(dt);
          playerTankService.aimToMouse();
          projectileService.physics(dt);
        }

        function drawFrame(dt) {
          var i,
            fHit,
            drop;

          ctx.fillStyle = options.clrBackground;
          ctx.strokeStyle = options.clrRain;
          ctx.fillRect(0,0,800,400);
          ctx.strokeRect(0,0,800,400);

          drawScore(dt);
          playerTankService.draw(ctx);
          projectileService.draw(ctx);
          mouseService.draw(ctx);
        }

        function startClock() {
          timeLast = new Date().getTime();
          interval = setInterval(function() {
            var nowTime = new Date().getTime(),
              dt = (nowTime - timeLast) / 1000;

            physics(dt);
            drawFrame(dt);
            timeLast = nowTime;
          }, 1000/options.fps);
        }

        function pause() {
          drawPauseScreen();
          stopClock();
        }

        function stopClock() {
          clearInterval(interval);
          interval = undefined;
        }

        canvasOffset = element.offset();
        playerTankService.createTank(ctxWidth / 2, ctxHeight / 2, 0);
        startClock();

        window.addEventListener('keyup', function(event) {
          switch(event.key) {
            case 'w':
            case 's':
              playerTankService.stop();
              break;
          }
        });
        window.addEventListener('keypress', function(event) {
          var dx, dy, distance;
          switch (event.key) {
            case 'w':
              playerTankService.moveForward();
              break;
            case 's':
              playerTankService.moveBackward();
              break;
            case 'a':
              playerTankService.rotateLeft();
              break;
            case 'd':
              playerTankService.rotateRight();
              break;
            case ' ':
              playerTankService.fireProjectileToMouse();
              break;
          }
        });

        element.on('click', function(event) {
          if (interval !== undefined) {
            pause();
          } else {
            startClock();
          }
        });

        element.on('mouseover', function (event) {
          element.on('mousemove', function (event) {
            mouseService.mouseMove(event.pageX - canvasOffset.left, event.pageY - canvasOffset.top);
          });
        });

        element.on('mouseout', function (event) {
          element.off('mousemove');
          pause();
        });


        scope.$on('$destroy', function (event) {
          stopClock();
          element.off('click');
          element.off('mousemove');
        });
      }
    }
  }])