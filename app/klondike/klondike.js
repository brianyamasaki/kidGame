'use strict';

angular.module('myApp.klondike', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/klondike', {
      templateUrl: 'klondike/klondike.html',
      controller: 'KlondikeCtrl'
    });
  }])

  .controller('KlondikeCtrl', [function() {

  }])
  .directive('klondikeDirective', ['CardDeckService', function(CardDeckService) {
    var klondike = {
      hand: [],
      discard: [],
      foundations:[[],[],[],[]],
      tableaus:[[],[],[],[],[],[],[]]
    },
      icardDeal,
      dealTableau = [
        {index: 0, faceUp:true}, {index: 1}, {index:2}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 1, faceUp:true}, {index:2}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 2, faceUp:true}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 3, faceUp:true}, {index:4}, {index:5}, {index:6},
        {index: 4, faceUp:true}, {index:5}, {index:6},
        {index: 5, faceUp:true}, {index:6},
        {index: 6, faceUp:true}
      ];

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'klondike/klondike-directive.html',
      link: function (scope, el, attrs) {


        scope.cardStack = function (str) {
          return scope.klondike[str];
        };

        scope.cardClass = function(str, index, index2) {
          var card = scope.cardStack(str)[index];

          // sometimes we want an array inside of the array
          if (index2 !== undefined && card.length !== undefined) {
            card = card[index2];
          }

          if (card === undefined) {
            return 'empty';
          } else if (!card.faceUp) {
            return 'card-back';
          }
        };

        scope.cardSuitTableau = function(itab, icard) {
          var tableau = scope.klondike.tableaus[itab],
            card = tableau[icard];

          if (card.faceUp) {
            return card.suit;
          } else {
            return '';
          }
        };

        scope.cardRankTableau = function(itab, icard) {
          var tableau = scope.klondike.tableaus[itab],
            card = tableau[icard];

          if (card.faceUp) {
            return card.rank;
          } else {
            return '';
          }
        };

        scope.startGame = function () {
          scope.klondike = angular.copy(klondike);

          // create and shuffle a deck of cards
          CardDeckService.shuffle(1);

          icardDeal = 0;
          dealCards();
        };

        // Use this to move one card from card groups to card groups
        function moveCard(from, to) {
          to.unshift(from.shift());
        }

        function dealCards() {
          var card;
          dealTableau.forEach(function(item) {
            card = CardDeckService.getCards(1)[0];
            if (item.faceUp) {
              card.faceUp = true;
            }
            scope.klondike.tableaus[item.index].push(card);
          });
          scope.klondike.hand = CardDeckService.getRemainingCards();
        }



        scope.startGame();
      }
    };
  }]);
