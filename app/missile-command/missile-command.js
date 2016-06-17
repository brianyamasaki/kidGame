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
  .factory('UtilService', [function() {
    function _doLinesIntersect(p1, p2, p3, p4) {
      // see http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
      var a = p4.x - p3.x,
        b = p1.y - p3.y,
        c = p4.y - p3.y,
        d = p1.x - p3.x,
        e = p2.x - p1.x,
        f = p2.y - p1.y,
        g = p1.y - p3.y,
        denom = c * e - a * f,
        ua,
        ub;

      if (denom < 0.000001) {
        return false;
      }
      ua = (a * b - c * d) / denom;
      ub = (e * g - e * a) / denom;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return true;
      } else {
        return false;
      }
    }
    return {
      distance: function(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
      },
      isWithin: function(dx, dy, distance) {
        return dx * dx + dy * dy < distance * distance;
      },
      doLinesIntersect: function(p1, p2, p3, p4) {
        return _doLinesIntersect(p1, p2, p3, p4);
      },
      isPointInPolygon: function(p1, polyp) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var x = p1.x,
          y = p1.y;
        var inside = false;

        for (var i = 0, j = polyp.length - 1; i < polyp.length; j = i++) {
          var xi = polyp[i].x,
            yi = polyp[i].y,
            xj = polyp[j].x,
            yj = polyp[j].y;

          var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }

        return inside;
      }
    };
  }])
  .factory('EnemyMissileService', ['ScoringService', 'GroundService', function(scoringService, groundService) {
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
        speed: 80
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
          } else if ( 
            missile.x < -missile.radius || 
            missile.x > context.width + missile.radius ||
            missile.y < -missile.radius || 
            missile.y > context.height + missile.radius ||
            groundService.pointInGround({x: missile.x, y: missile.y})) {
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
  .factory('LauncherService', ['MouseService', 'ProjectileService', 'UtilService', function(mouseService, projectileService, utilService) {
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

          projectileService.create(launcher.muzzle.x, launcher.muzzle.y, launcher.angle,
            utilService.distance(launcher.muzzle.x - mousePos.x, launcher.muzzle.y - mousePos.y));
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
  .factory('ExplosionService', [ 'EnemyMissileService', 'UtilService', function(enemyMissileService, utilService) {
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
              if (utilService.isWithin(explosion.x - missile.x, explosion.y - missile.y, explosion.radiusCur + missile.radius)) {
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
  .factory('ProjectileService', ['MouseService', 'ExplosionService', 'GroundService', function (mouseService, explosionService, groundService) {
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
          } else if (groundService.pointInGround({x: projectile.x, y: projectile.y})){
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
  .factory('GroundService', ['UtilService', function(utilService) {
    var context = { };
    var grounds;
    return {
      create: function (ctxWidth, ctxHeight, level) {
        context.dx = ctxWidth;
        context.dy = ctxHeight;
        grounds = [];
        grounds = angular.copy(window.gameData[level].grounds);
        grounds.forEach(function(polygon) {
          var points = polygon.points,
            yMin,
            xMin,
            yMax,
            xMax;

          points.forEach(function(point, index) {
            point.x = point.x * context.dx; 
            point.y = point.y * context.dy;
            if (index === 0) {
              yMin = yMax = point.y;
              xMin = xMax = point.x;
            } else {
              yMin = Math.min(yMin, point.y);
              yMax = Math.max(yMax, point.y);
              xMin = Math.min(xMin, point.x);
              xMax = Math.max(xMax, point.x);
            }
          });
          polygon.bounds = {
            xMin: xMin,
            yMin: yMin,
            xMax: xMax,
            yMax: yMax
          }
        });
      },
      pointInGround: function (point) {
        var inside = false;
        var polygon;
        for (var i=0; i < grounds.length; i++) {
          polygon = grounds[i];
          if (point.x >= polygon.bounds.xMin &&
              point.x <= polygon.bounds.xMax && 
              point.y >= polygon.bounds.yMin &&
              point.y <= polygon.bounds.yMax) {
            inside = utilService.isPointInPolygon(point, polygon.points);
          }
          if (inside) {
            break;
          }
        }
        return inside;
      },
      draw: function (ctx, level) {
        grounds.forEach(function(polygon) {
          ctx.fillStyle = polygon.fillStyle;
          polygon.points.forEach(function(point, index) {
            if (index === 0) {
              ctx.beginPath();
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.closePath();
          ctx.fill();
        });

      }
    };
  }])
  .directive('missileCommand', ['$window', 'ProjectileService', 'LauncherService', 'MouseService', 'ExplosionService', 'EnemyMissileService', 'ScoringService', 'UtilService', 'GroundService',
    function(window, projectileService, launcherService, mouseService, explosionService, enemyMissileService, scoringService, utilService, groundService) {
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

          groundService.draw(ctx, 0);
          drawScore();
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
          groundService.create(ctxWidth, ctxHeight, 0);
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