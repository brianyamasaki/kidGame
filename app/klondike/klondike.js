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

        scope.discardShowCount = 3;
        scope.showAllCards = false;
        scope.clickShowAllCards = function () {
          //scope.$apply();
        };

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
          } else if (str === 'displayDiscard') {
            cards = scope.klondike.discard.displayCards;
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

          if (card && card.cardIndex !== undefined) {
            return card.cardIndex;
          }
          return '';
        };

        scope.cardClass = function(str, index, index2) {
          var card = findCard(str, index, index2);

          if (card === undefined || !card.suit) {
            return 'empty';
          } else if (!card.faceUp && !scope.showAllCards) {
            return 'card-back';
          }
        };

        function cardFromTableau(itab, icard) {
          var cards = scope.klondike.tableaus[itab].cards;
            return cards[icard];
        }

        scope.cardSuitTableau = function(itab, icard) {
          var card = cardFromTableau(itab, icard);

          if (card.faceUp || scope.showAllCards) {
            return card.suit;
          } else {
            return 'back';
          }
        };

        scope.cardRankTableau = function(itab, icard) {
          var card = cardFromTableau(itab, icard);

          if (card.faceUp || scope.showAllCards) {
            return card.rank;
          } else {
            return 'back';
          }
        };

        function cardDisplayDiscard(index) {
          var cards = scope.klondike.discard.displayCards,
            cardsLength = cards.length;
            return cardsLength ? cards[index] : undefined;
        }

        scope.cardSuitDisplayDiscard = function(index) {
          var card = cardDisplayDiscard(index);

          if (card) {
            return card.suit;
          } else {
            return 'empty';
          }
        };

        scope.cardRankDisplayDiscard = function(index) {
          var card = cardDisplayDiscard(index);

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

          // modify discard stack to have a display array
          klondike.discard.displayCards = [];
          updateDiscardDisplay();

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
          scope.undoStates = [];
        };

        function updateDiscardDisplay() {
          var discard = scope.klondike.discard;

          discard.displayCards = discard.cards.slice(-scope.discardShowCount);
          discard.displayCards.forEach(function(card) {
            cardFaceUp(card);
          });
          while (discard.displayCards.length < scope.discardShowCount) {
            discard.displayCards.unshift({});
          }
        }

        scope.draggableDisplayDiscard = function(index) {
          var cards = scope.klondike.discard.displayCards;

          return (index == 2 && cards[index].suit) ? 'true' : 'false';
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
          if (!strClass) {
            return;
          }
          if (strClass.indexOf('foundation') !== -1) {
            return 'foundations';
          } else if (strClass.indexOf('tableau') !== -1) {
            return 'tableaus';
          } else if (strClass.indexOf('discard') !== -1 ){
            return 'discard';
          }
        }

        function dropTargetInfo($target) {
          var $stack,
            stackType,
            stack,
            index,
            strTargetClasses = $target.attr('class');

          stackType = getStrStackFromClasses(strTargetClasses);
          if (stackType) {
            $stack = $target;
            if (isStackArray[stackType]) {
              index = $stack.attr('index');
              stack = cardStack(stackType)[index];
            } else {
              stack = cardStack(stackType);
            }
          } else if (strTargetClasses && strTargetClasses.indexOf('playing-card') !== -1) {
            $stack = $target.parent();
            stackType = getStrStackFromClasses($stack.attr('class'));
            if (isStackArray[stackType]) {
              index = $stack.attr('index');
              stack = cardStack(stackType)[index];
            } else {
              stack = cardStack(stackType);
            }
          }
          return {
            stack: stack,
            $stack: $stack,
            card: stack && stack.cards.length ? stack.cards[stack.cards.length-1] : undefined,
            stackType: stackType
          }
        }

        function onDragStart(e) {
          var dataTransfer = e.originalEvent.dataTransfer,
            foundation,
            $target = $(e.target);
          dataTransfer.effectAllowed = 'move';
          draggedCard = {
            strStack: getStrStackFromClasses($target.parent().attr('class')),
            stackIndex: $target.parent().attr('index'),
            suit: $target.attr('suit'),
            rank: $target.attr('rank'),
            cardIndex: parseInt($target.attr('card-index'),10)
          };
          // designate cards that are moving
          $target.add($target.nextAll('.playing-card')).css('opacity', '0.4');

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
          var $target = $(e.target),
            targetInfo;

          targetInfo = dropTargetInfo($target);
          if (targetInfo.stack && targetInfo.stack.droppable) {
            targetInfo.$stack.addClass(dragOverClassname);
            if (targetInfo.card) {
              targetInfo.$stack.find('[card-index="' + targetInfo.card.cardIndex + '"]').addClass(dragOverClassname);
            }
            //console.log('onDragEnter ' + targetInfo.stackType);
          }
        }

        function onDragLeave(e) {
          var $target = $(e.target),
            targetInfo;

          targetInfo = dropTargetInfo($target);
          if (targetInfo.stack && targetInfo.stack.droppable) {
            targetInfo.$stack.removeClass(dragOverClassname);
            //console.log('onDragLeave ' + targetInfo.stackType);
          }
        }

        function onDrop(e) {
          var dataTransfer = e.originalEvent.dataTransfer,
            $target = $(e.target),
            targetInfo;
          if (e.stopPropagation()) {
            e.stopPropagation();
          }
          targetInfo = dropTargetInfo($target);
          if (targetInfo.$stack) {
            dropStack = targetInfo.stack;
            //console.log('onDrop ' + targetInfo.stackType);
          }
          return false;
        }

        function onDragEnd(e) {
          el.find('[draggable="true"]').css('opacity', '1');
          el.find('.' + dragOverClassname).removeClass(dragOverClassname);
          if (draggedCard) {
            moveDraggedCards(draggedCard, dropStack);
            draggedCard = undefined;
          }
          //console.log('OnDragEnd ' + $(this).attr('class'));
        }

        function moveDraggedCards(draggedCard, toStack) {
          var cardIndex,
            fromStack;

          if (draggedCard && toStack && toStack.droppable) {
            if (isStackArray[draggedCard.strStack]) {
              fromStack = cardStack(draggedCard.strStack)[draggedCard.stackIndex];
            } else {
              fromStack = cardStack(draggedCard.strStack);
            }
            cardIndex = fromStack.cards.findIndex(function(card) {
              return card.cardIndex === draggedCard.cardIndex;
            });

            moveCards(fromStack.cards, toStack.cards, cardIndex);
            if (fromStack.cards.length > 0) {
              cardFaceUp(fromStack.cards[fromStack.cards.length - 1]);
            }
            if (draggedCard.strStack.indexOf('discard') !== -1) {
              updateDiscardDisplay();
            }
          }
        }

        function moveCards(fromCards, toCards, cardIndex) {
          setupUndo();
          fromCards.splice(cardIndex, fromCards.length - cardIndex).forEach(function(card) {
            toCards.push(card);
          });
          scope.$applyAsync();

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
            i,
            c,
            card;

          setupUndo();
          if (hand.cards.length > 0) {
            //moveCards(hand.cards, discard.cards, Math.max(0, hand.cards.length - scope.discardShowCount));
            c = Math.min(hand.cards.length, scope.discardShowCount);
            for(var i=0; i < c; i++) {
              card = hand.cards.pop();
              discard.cards.push(card);
            }
          } else {
            scope.klondike.hand.cards = discard.cards.reverse().map(function(card) {card.faceUp = false; return card;});
            scope.klondike.discard.cards = [];
          }
          updateDiscardDisplay();
        };

        function doubleClickableCard(card) {
          var foundationIndexForSuit,
            foundations = scope.klondike.foundations,
            foundationCards;

          foundationIndexForSuit = foundations.findIndex(function(foundation) {
            return foundation.cards.length > 0 && foundation.cards[0].suit === card.suit;
          });
          if (foundationIndexForSuit === -1) {
            foundationIndexForSuit = foundations.findIndex(function(foundation) {
              return foundation.cards.length === 0;
            });
          }
          foundationCards = foundations[foundationIndexForSuit].cards;
          if (foundationIndexForSuit !== -1 &&
            (card.rank === 'ace' ||
            foundationCards[foundationCards.length - 1].value === card.value - 1)) {
            return foundationCards;
          }
        }

        scope.onDblClickDiscard = function(cardIndex) {
          var discardCards = scope.klondike.discard.cards,
            displayCards = scope.klondike.discard.displayCards,
            foundationCards;
          if (cardIndex === 2 && discardCards.length > 0) {
            foundationCards = doubleClickableCard(displayCards[cardIndex]);
            if (foundationCards) {
              moveCards(discardCards, foundationCards, discardCards.length-1);
              updateDiscardDisplay();
            }
          }
        };

        scope.onDblClickTableau = function(tableauIndex, cardIndex) {
          var tableau = scope.klondike.tableaus[tableauIndex],
            foundations = scope.klondike.foundations,
            foundationIndexForSuit,
            foundationCards,
            clickedCard;
          if (tableau.cards.length - 1 === cardIndex) {
            clickedCard = tableau.cards[cardIndex];
            foundationCards = doubleClickableCard(clickedCard);

            if (foundationCards) {
              moveCards(tableau.cards, foundationCards, tableau.cards.length-1);
              if (tableau.cards.length > 0) {
                cardFaceUp(tableau.cards[tableau.cards.length - 1]);
              }
            }
          }
        };


        function setupUndo() {
          scope.undoStates.push(angular.copy(scope.klondike));
        }

        scope.undo = function () {
          scope.klondike = scope.undoStates.pop();
        };

        scope.checkDeck = function() {
          var deck;

          deck = scope.klondike.hand.cards.concat(scope.klondike.discard.cards)

            .concat(scope.klondike.foundations.map(function(stack) {
              return stack.cards;
            }).concatAll())
            .concat(scope.klondike.tableaus.map(function(stack) {
              return stack.cards;
            }).concatAll());
          CardDeckService.testDeck(deck);

        };

        scope.debugDisplayHand = function() {
          scope.klondike.hand.cards.forEach(function(card, index) {
            console.log('card ' + index + ': ' + card.cardIndex);
          });
        };

        scope.startGame();
      }

    };
  }]);
