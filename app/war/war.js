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
        var playerHands = {
            hand:[],
            discard: []
          },
          cDecks = 1;

        scope.startGame = function () {
          // create and shuffle a deck of cards
          CardDeckService.shuffle(cDecks);

          // deal cards to each player's hands
          scope.left.hand = CardDeckService.getCards(cDecks * 26);
          scope.right.hand = CardDeckService.getCards(cDecks * 26);
          scope.left.discard = [];
          scope.right.discard = [];

          scope.playCards();
        };

        function scorePlay () {
          var leftTop = scope.leftDiscardTop(),
            rightTop = scope.rightDiscardTop();
          if (!leftTop && !rightTop) {
            return;
          } else if (!leftTop || leftTop.valueAceHigh < rightTop.valueAceHigh) {
            moveCards(scope.right.discard, scope.right.hand, scope.right.discard.length);
            moveCards(scope.left.discard, scope.right.hand, scope.left.discard.length);
          } else if (!rightTop || leftTop.valueAceHigh > rightTop.valueAceHigh){
            moveCards(scope.right.discard, scope.left.hand, scope.right.discard.length);
            moveCards(scope.left.discard, scope.left.hand, scope.left.discard.length);
          } else {
            // war

            if (scope.left.hand.length > 0 && scope.right.hand.length > 0) {
              // move an extra card from hand to the discard pile
              moveCard(scope.left.hand, scope.left.discard);
              moveCard(scope.right.hand, scope.right.discard);
            } else {
              announceWinner();
            }

            // and leave everything on the discard piles
          }
        }

        // Use this to move multiple cards from card groups to card groups
        function moveCards(from, to, count) {
          from.splice(0, count).forEach(function(card) {
            to.push(card);
          });
        }

        // Use this to move one card from card groups to card groups
        function moveCard(from, to) {
          to.unshift(from.shift());
        }

        function announceWinner() {
          if (scope.left.hand > 0) {
            scope.winMessage = 'left wins';
          } else {
            scope.winMessage = 'right wins';
          }
        }

        // Called when the "Play Card" button is pressed
        scope.playCards = function() {
          // score the displayed cards
          scorePlay();

          if (scope.left.hand.length > 0 && scope.right.hand.length > 0) {
            // move a card from hand to the discard pile
            moveCard(scope.left.hand, scope.left.discard);
            moveCard(scope.right.hand, scope.right.discard);
          } else {
            announceWinner();
          }
        };

        // returns the top card in the left discard pile
        scope.leftDiscardTop = function() {
          return scope.left.discard[0];
        };

        // returns the top card in the right discard pile
        scope.rightDiscardTop = function() {
          return scope.right.discard[0];
        };

        scope.handCount = function(side) {
          if (side === 'left') {
            return scope.left.hand.length;
          } else {
            return scope.right.hand.length;
          }
        };

        // returns the class for modifying display of the hands
        scope.cardBackClass = function(deck) {
          var hand = deck==='left' ? scope.left.hand : scope.right.hand;
          if (hand.length > 0) {
            return 'card-back';
          } else {
            return 'empty';
          }
        };

        // create structures to keep hands
        scope.left = angular.copy(playerHands);
        scope.right = angular.copy(playerHands);

        scope.winMessage = undefined;

        scope.startGame();

      }
    }
  }]);