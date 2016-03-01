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
  .directive('klondikeDirective', ['CardDeckService', '$interval', '$document', function(CardDeckService, $interval, $document) {
    var stackBase = {
        droppable: false,
        cards: []
      },
      klondikeBase = {
        hand: angular.copy(stackBase),
        discard: angular.copy(stackBase),
        foundations:[],
        tableaus:[]
      },

      dragOverClassname = 'over',
      icardDeal,
      draggedCard,
      dropStack,
      suitToColor = {
        'spade': 'black',
        'club': 'black',
        'heart': 'red',
        'diamond': 'red'
      },
      rankToValue = {
        'ace': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
        'seven': 7,
        'eight': 8,
        'nine': 9,
        'ten': 10,
        'jack': 11,
        'queen': 12,
        'king':13
      },
      dealTableau = [
        {index: 0, faceUp:true}, {index: 1}, {index:2}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 1, faceUp:true}, {index:2}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 2, faceUp:true}, {index:3}, {index:4}, {index:5}, {index:6},
        {index: 3, faceUp:true}, {index:4}, {index:5}, {index:6},
        {index: 4, faceUp:true}, {index:5}, {index:6},
        {index: 5, faceUp:true}, {index:6},
        {index: 6, faceUp:true}
      ],
      isStackArray = {
        'foundations': true,
        'tableaus': true
      };


    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'klondike/klondike-directive.html',
      link: function (scope, el, attrs) {


        function cardStack (str) {
          return scope.klondike[str];
        }

        function findCard(str, index, cardIndex) {
          var cards;

          if (isStackArray[str]) {
            if (cardIndex === undefined) {
              console.error('cardIndex is undefined in findCard');
            }
            cards = cardStack(str)[index].cards;
            index = cardIndex;
          } else {
            cards = cardStack(str).cards;
          }

          if (cards.length === 0) {
            return undefined;
          } else if (index === -1) {
            return cards[cards.length-1];
          } else {
            return cards[index];
          }
        }

        scope.cardIndex = function(str, index, index2) {
          var card = findCard(str, index, index2);

          if (card) {
            return card.cardIndex;
          }
          return '';
        };

        scope.cardClass = function(str, index, index2) {
          var card = findCard(str, index, index2);

          if (card === undefined) {
            return 'empty';
          } else if (!card.faceUp) {
            return 'card-back';
          }
        };

        function cardFromTableau(itab, icard) {
          var cards = scope.klondike.tableaus[itab].cards;
            return cards[icard];
        }

        scope.cardSuitTableau = function(itab, icard) {
          var card = cardFromTableau(itab, icard);

          if (card.faceUp) {
            return card.suit;
          } else {
            return 'back';
          }
        };

        scope.cardRankTableau = function(itab, icard) {
          var card = cardFromTableau(itab, icard);

          if (card.faceUp) {
            return card.rank;
          } else {
            return 'back';
          }
        };

        function cardDiscardTop() {
          var cards = scope.klondike.discard.cards,
            cardsLength = cards.length;
            return cardsLength ? cards[cardsLength-1] : undefined;
        }

        scope.cardSuitDiscardTop = function() {
          var card = cardDiscardTop();

          if (card) {
            return card.suit;
          } else {
            return 'empty';
          }
        };

        scope.cardRankDiscardTop = function() {
          var card = cardDiscardTop();

          if (card) {
            return card.rank;
          } else {
            return 'empty';
          }
        };

        function cardFoundationTop(ifoundation) {
          var cards = scope.klondike.foundations[ifoundation].cards,
            cardsLength = cards.length;
            return(cardsLength ? cards[cardsLength-1] : undefined);

        }

        scope.cardSuitFoundationTop = function(ifoundation) {
          var card = cardFoundationTop(ifoundation);

          if (card) {
            return card.suit;
          } else {
            return 'empty';
          }
        };

        scope.cardRankFoundationTop = function(ifoundation) {
          var card = cardFoundationTop(ifoundation);

          if (card) {
            return card.rank;
          } else {
            return 'empty';
          }
        };

        scope.startGame = function () {
          var i,
            klondike = scope.klondike = angular.copy(klondikeBase);

          for (i=0; i < 4; i++) {
            klondike.foundations.push(angular.copy(stackBase));
          }

          for(i=0; i < 7; i++) {
            klondike.tableaus.push(angular.copy(stackBase))
          }

          // create and shuffle a deck of cards
          CardDeckService.shuffle(1);

          icardDeal = 0;
          dealCards();
        };

        scope.draggableDiscard = function() {
          var cards = scope.klondike.discard.cards;

          return cards.length > 0 ? 'true' : 'false';
        };

        scope.draggableTableau = function(itab, icard) {
          var cards = scope.klondike.tableaus[itab].cards,
            card = cards[icard];
          return card.faceUp ? 'true' : 'false';
        };

        function droppableStacks() {
          scope.klondike.foundations.forEach(function(foundation, index) {
            var cards = foundation.cards;
            if ((draggedCard.rank === 'ace' && cards.length === 0) ||
              (cards.length > 0 && cards[0].suit === draggedCard.suit && rankToValue[draggedCard.rank] - 1 === cards[cards.length-1].value)
            )
            {
              foundation.droppable = true;
            } else {
              foundation.droppable = false;
            }
            //installDropListeners('.foundation[index="' + index + '"]', droppable);
            //el.find('.foundation[index="' + index + '"]').attr('droppable', droppable ? 'true' : 'false');
          });
          scope.klondike.tableaus.forEach(function(tableau, index) {
            var cards = tableau.cards,
              topCard = (cards.length > 0) ? cards[cards.length-1] : undefined;

            if ((cards.length === 0 && draggedCard.rank === 'king') ||
              (topCard && topCard.color != suitToColor[draggedCard.suit] && rankToValue[topCard.rank] === rankToValue[draggedCard.rank] + 1)) {
              tableau.droppable = true;
            } else {
              tableau.droppable = false;
            }
            //installDropListeners('.tableau[index="' + index + '"]', droppable);
            // el.find('.tableau[index="' + index + '"]').attr('droppable', droppable ? 'true' : 'false');
          });
        }
        function getStrStackFromClasses(strClass) {
          if (strClass.indexOf('foundation') !== -1) {
            return 'foundations';
          } else if (strClass.indexOf('tableau') !== -1) {
            return 'tableaus';
          } else {
            return 'discard';
          }
        }

        function onDragStart(e) {
          var dataTransfer = e.originalEvent.dataTransfer,
            $target = $(e.target);
          $target.css('opacity', '0.4');
          dataTransfer.effectAllowed = 'move';
          draggedCard = {
            strStack: getStrStackFromClasses($target.parent().attr('class')),
            stackIndex: $target.parent().attr('index'),
            suit: $target.attr('suit'),
            rank: $target.attr('rank'),
            cardIndex: parseInt($target.attr('card-index'),10)
          };
          dataTransfer.setData('application/text', 'playing-card:' + draggedCard.rank + ':' + draggedCard.suit + ':' + draggedCard.class);
          droppableStacks();
          //console.log('dragstart ' + JSON.stringify(draggedCard));
        }

        function onDragOver(e) {
          if (e.preventDefault()) {
            e.preventDefault();
          }
          e.originalEvent.dataTransfer.dropEffect = 'move';
        }

        function onDragEnter(e) {
          $(e.target).addClass(dragOverClassname);
          console.log('onDragEnter ' + $(e.target).attr('class'));
        }

        function onDragLeave(e) {
          $(e.target).removeClass(dragOverClassname);
          console.log('onDragLeave ' + $(e.target).attr('class'));
        }

        function onDrop(e) {
          var dataTransfer = e.originalEvent.dataTransfer,
            $target = $(e.target).parent();
          if (e.stopPropagation()) {
            e.stopPropagation();
          }
          if ($target.attr('class').indexOf('tableau') !== -1) {
            dropStack = scope.klondike.tableaus[$target.attr('index')];
          } else {
            dropStack = scope.klondike.foundations[$target.attr('index')];
          }
          //console.log('onDrop: card  ' + dataTransfer.getData('application/text'));
          return false;
        }

        function onDragEnd(e) {
          el.find('[draggable="true"]').css('opacity', '1');
          el.find('.' + dragOverClassname).removeClass(dragOverClassname);
          if (draggedCard) {
            moveCards(draggedCard, dropStack);
            draggedCard = undefined;
          }
          //console.log('OnDragEnd ' + $(this).attr('class'));
        }

        function moveCards(draggedCard, toStack) {
          var cardIndex,
            fromStack,
            fromCards,
            toCards;

          if (draggedCard && toStack && toStack.droppable) {
            if (isStackArray[draggedCard.strStack]) {
              fromStack = cardStack(draggedCard.strStack)[draggedCard.stackIndex];
            } else {
              fromStack = cardStack(draggedCard.strStack);
            }
            fromCards = fromStack.cards ? fromStack.cards : fromStack;
            cardIndex = fromCards.findIndex(function(card) {
              return card.cardIndex === draggedCard.cardIndex;
            });
            toCards = toStack.cards ? toStack.cards : toStack;
            fromCards.splice(cardIndex, fromCards.length - cardIndex).forEach(function(card) {
              toCards.push(card);
            });
            if (fromCards.length > 0) {
              cardFaceUp(fromCards[fromCards.length - 1]);
            }
            scope.$apply();
          }
        }

        function cardFaceUp(card) {
          card.faceUp = true;
        }

        function dealCardsFinished() {
          scope.klondike.hand.cards = CardDeckService.getRemainingCards();
          // install drag/drop listener at directive root
          el.on('dragstart', onDragStart)
            .on('dragend', onDragEnd)
            .on('dragenter', onDragEnter)
            .on('dragover', onDragOver)
            .on('dragleave', onDragLeave)
            .on('drop', onDrop);

        }

        function dealCards() {

          function dealCard() {
            var card,
              dealItem = dealTableau[icardDeal];

            card = CardDeckService.getCards(1)[0];
            if (dealItem.faceUp) {
              card.faceUp = true;
            }
            scope.klondike.tableaus[dealItem.index].cards.push(card);
            icardDeal++;

            if (icardDeal >= dealTableau.length) {
              dealCardsFinished();
            }
          }

          icardDeal = 0;
          $interval(dealCard, 30, dealTableau.length);
        }

        scope.onClickHand = function() {
          var hand = scope.klondike.hand,
            discard = scope.klondike.discard,
            card = hand.cards.pop();

          if (card) {
            card.faceUp = true;
            discard.cards.push(card);
            cardFaceUp(card);
          } else {
            scope.klondike.hand.cards = discard.cards.reverse().map(function(card) {card.faceUp = false; return card;});
            scope.klondike.discard.cards = [];
          }
        };

        scope.startGame();
      }
    };
  }]);
