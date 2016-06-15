'use strict';

angular.module('myApp.missileCommand', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/missile-command', {
      templateUrl: 'missile-command/missile-command.html',
      controller: 'MissileCommandCtrl'
    });
  }])

  .controller('MissileCommandCtrl', [function() {

  }])
  .factory('EnemyMissileService', ['ScoringService', function(scoringService) {
    var missiles = [];
    var tCreated;
    var level = 0;
    var missileInLevel = 0;
    var context = {};
    var interval;

    function createMissile() {
      missiles.push({
        tLaunch: new Date().getTime(),
        from: {
          x: Math.random(),
          y: 0
        },
        to: {
          x: Math.random(),
          y: 1
        },
        radius: 4,
        speed: 40
      });
    }
    function startMissiles () {
      interval = setInterval(createMissile, 1500);
    }
    return {
      create: function (ctxWidth, ctxHeight) {
        tCreated = new Date().getTime();
        context.width = ctxWidth;
        context.height = ctxHeight;
        startMissiles();
      },
      pause: function () {
        clearInterval(interval);
      },
      unpause: function () {
        startMissiles();
      },
      restart: function() {
        missiles = [];
        startMissiles();
      },
      physics: function (dt) {
        var tElapsed = new Date().getTime() - tCreated;
        missiles = missiles.filter(function(missile) {
          if (missile.destroyed) {
            scoringService.destroyedMissile(10);
            return false;
          } else {
            if (!missile.angle) {
              missile.x = missile.from.x * context.width;
              missile.y = missile.from.y * context.height;
              missile.angle = Math.atan2((missile.to.x - missile.from.x) * context.width,
                (missile.to.y - missile.from.y) * context.height) - Math.PI/2;
            }
            missile.x += Math.cos(missile.angle) * missile.speed * dt;
            missile.y += -Math.sin(missile.angle) * missile.speed * dt;
            return true;
          }
        });
      },
      draw: function(ctx) {
        ctx.fillStyle = 'green';
        missiles.forEach(function(missile) {
          ctx.fillRect(missile.x-missile.radius, missile.y-missile.radius, missile.radius*2, missile.radius*2);
        });
      },
      getMissiles: function() {
        return missiles;
      }
    }
  }])
  .factory('LauncherService', ['MouseService', 'ProjectileService', function(mouseService, projectileService) {
    var launchers = [];
    var launcherRadius = 10;
    var launcherBarrelLength = 40;
    return {
      create: function(x, y, cMissiles) {
        launchers.push({
          x: x,
          y: y,
          angle: 0,
          cMissiles: cMissiles,
          muzzle: {}
        });
      },
      physics: function (dt) {
        var mousePos = mouseService.getPos();
        launchers.forEach(function(launcher) {

          launcher.angle = - (Math.atan2(mousePos.x - launcher.x, mousePos.y - launcher.y) - Math.PI/2);
          launcher.muzzle.x = launcher.x + Math.cos(launcher.angle)*launcherBarrelLength;
          launcher.muzzle.y = launcher.y + Math.sin(launcher.angle)*launcherBarrelLength;
        });
      },
      fireProjectile: function () {
        var mousePos = mouseService.getPos();
        launchers.forEach(function(launcher) {
          var distance = Math.sqrt(Math.pow(launcher.muzzle.x - mousePos.x, 2) + Math.pow(launcher.muzzle.y - mousePos.y, 2));

          projectileService.create(launcher.muzzle.x, launcher.muzzle.y, launcher.angle, distance);
        });
      },
      draw: function (ctx) {
        var lineWidth = ctx.lineWidth;
        var fillStyle = ctx.fillStyle;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'black';
        launchers.forEach(function(launcher) {
          ctx.beginPath();
          ctx.arc(launcher.x, launcher.y, launcherRadius, 0, Math.PI*2);
          ctx.closePath();
          ctx.fill();

          // draw gun barrel
          ctx.beginPath();
          ctx.moveTo(launcher.x, launcher.y);
          ctx.lineTo(launcher.muzzle.x, launcher.muzzle.y);
          ctx.closePath();
          ctx.stroke();

        });
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = fillStyle;

      }
    };
  }])
  .factory('ExplosionService', [ 'EnemyMissileService', function(enemyMissileService) {
    var explosions = [];
    var options = {
      tLifetime: 1500,
      radiusDefault: 30
    };

    return {
      create: function (x, y, radius) {
        if (!radius) {
          radius = options.radiusDefault;
        }
        explosions.push({
          x: x,
          y: y,
          tCreate: new Date().getTime(),
          radiusMax: radius,
          radiusCur: 0,
          tLifetime: options.tLifetime
        });
      },
      physics: function (dt) {
        var now = new Date().getTime();
        explosions = explosions.filter(function(explosion) {
          var missiles;
          if (now - explosion.tCreate > explosion.tLifetime) {
            return false;
          } else {
            explosion.radiusCur = Math.sin(((now - explosion.tCreate) / explosion.tLifetime) * Math.PI) * explosion.radiusMax;
            missiles = enemyMissileService.getMissiles();
            missiles.forEach(function(missile) {
              if (Math.pow(explosion.x - missile.x, 2) + Math.pow(explosion.y - missile.y, 2) < Math.pow(explosion.radiusCur + missile.radius, 2)) {
                missile.destroyed = true;
              }
            });
            return true;
          }
        });
      },
      draw: function(ctx) {
        explosions.forEach(function(explosion) {
          ctx.fillStyle = 'orange';
          ctx.beginPath();
          ctx.arc(explosion.x, explosion.y, explosion.radiusCur, 0, Math.PI*2);
          ctx.closePath();
          ctx.fill();
        });
      }
    };
  }])
  .factory('ProjectileService', ['MouseService', 'ExplosionService', function (mouseService, explosionService) {
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
          if (now > projectile.tDie || projectile.destroyed) {
            explosionService.create(projectile.x, projectile.y);
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
      },
      get: function() {
        return projectiles;
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
  .factory('ScoringService', [function() {
    var score = 0;
    return {
      resetScore: function() {
        score = 0;
      },
      getScore: function() {
        return score;
      },
      destroyedMissile: function(points) {
        score += points;
      }
    }
  }])
  .directive('missileCommand', ['$window', 'ProjectileService', 'LauncherService', 'MouseService', 'ExplosionService', 'EnemyMissileService', 'ScoringService',
    function(window, projectileService, launcherService, mouseService, explosionService, enemyMissileService, scoringService) {
    return {
      restrict: 'E',
      replace: true,
      template: '<canvas width="800" height="500"></canvas>',
      link: function (scope, element, attrs) {
        var ctx,
          ctxWidth = 800,
          ctxHeight = 500,
          options = {
            fps: 60,  // frames per second
            mouseSize: 40, // radius of mouse circle
            clrBackground: '#ffffff', // color for background
            clrRain: '#000000', // color for rain drop
            clrMouse: '#ff0000' // color for mouse marker
          },
          canvasOffset,
          timeLast,
          interval;

        ctx = scope.ctx = element[0].getContext('2d');

        function drawScore(dt) {
          ctx.fillStyle = options.clrRain;
          ctx.font = "16pt Helvetica, Arial, sans serif";
          ctx.fillText(scoringService.getScore().toString(), 20, ctxHeight-20);
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
          scoringService.resetScore();
        }

        function physics(dt) {
          projectileService.physics(dt);
          launcherService.physics(dt);
          explosionService.physics(dt);
          enemyMissileService.physics(dt);
        }

        function drawFrame(dt) {
          var i,
            fHit,
            drop;

          ctx.fillStyle = options.clrBackground;
          ctx.strokeStyle = options.clrRain;
          ctx.fillRect(0,0,ctxWidth,ctxHeight);
          ctx.strokeRect(0,0,ctxWidth,ctxHeight);

          drawScore(dt);
          launcherService.draw(ctx);
          projectileService.draw(ctx);
          explosionService.draw(ctx);
          enemyMissileService.draw(ctx);
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

        function init() {
          canvasOffset = element.offset();
          launcherService.create(400, 250, 50);
          enemyMissileService.create(ctxWidth, ctxHeight);
        }

        init();
        startClock();


        element.on('click', function(event) {
          launcherService.fireProjectile();
        });

        element.on('mouseover', function (event) {
          element.on('mousemove', function (event) {
            mouseService.mouseMove(event.pageX - canvasOffset.left, event.pageY - canvasOffset.top);
          });
        });

        element.on('mouseout', function (event) {
          element.off('mousemove');
        });


        scope.$on('$destroy', function (event) {
          stopClock();
          element.off('click');
          element.off('mouseout');
          element.off('mouseover');
          element.off('mousemove');
          enemyMissileService.pause();
        });
      }
    }
  }])