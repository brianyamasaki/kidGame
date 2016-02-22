'use strict';

angular.module('myApp.war', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/war', {
      templateUrl: 'war/war.html',
      controller: 'WarCtrl'
    });
  }])

  .controller('WarCtrl', [function() {

  }])
  .directive('warDirective', ['CardDeckService', function(CardDeckService) {
    return {
      restrict: 'E',
      scope: {

      },
      templateUrl: 'war/war-directive.html',
      link: function(scope, el, attrs) {
        var playerScore = {
          hand:[],
          discard: [],
          storage: [],
          points: 0
        };
        CardDeckService.shuffle(1);
        scope.left = angular.copy(playerScore);
        scope.right = angular.copy(playerScore);
        scope.left.hand = CardDeckService.getCards(26);
        scope.right.hand = CardDeckService.getCards(26);

        scope.recycleCards = function () {
          var count;
          CardDeckService.recycleCards(scope.left.discard);
          CardDeckService.recycleCards(scope.right.discard);
          CardDeckService.recycleCards(scope.left.storage);
          count = CardDeckService.recycleCards(scope.right.storage).length;

          scope.left.hand = scope.left.hand.concat(CardDeckService.getCards( count / 2));
          scope.right.hand = scope.right.hand.concat(CardDeckService.getCards( count / 2));

          scope.playCards();
        };

        function scorePlay () {
          var leftTop = scope.leftDiscardTop(),
            rightTop = scope.rightDiscardTop();
          if (leftTop.value === rightTop.value) {

          } else if (leftTop.value < rightTop.value) {
            scope.right.points = scope.right.points + scope.left.discard.length + scope.right.discard.length;
            moveCards(scope.right.discard, scope.right.storage, scope.right.discard.length);
            moveCards(scope.left.discard, scope.right.storage, scope.left.discard.length);
          } else {
            scope.left.points = scope.left.points + scope.left.discard.length + scope.right.discard.length;
            moveCards(scope.right.discard, scope.leftStorage, scope.right.discard.length);
            moveCards(scope.left.discard, scope.leftStorage, scope.left.discard.length);
          }
        }

        function moveCards(from, to, count) {
          to = from.splice(0, count).concat(to);
        }

        function moveCard(from, to) {
          to.unshift(from.shift());
        }

        scope.playCards = function() {
          moveCard(scope.left.hand, scope.left.discard);
          moveCard(scope.right.hand, scope.right.discard);
        };

        scope.leftDiscardTop = function() {
          return scope.left.discard[0];
        };

        scope.rightDiscardTop = function() {
          return scope.right.discard[0];
        };

        scope.leftHandCount = function() {
          return scope.left.hand.length;
        };

        scope.rightHandCount = function() {
          return scope.right.hand.length;
        };

        scope.playCards();
      }
    }
  }]);