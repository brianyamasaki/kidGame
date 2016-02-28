'use strict';

angular.module('myApp.cardDeckService', [])

.factory('CardDeckService', [function() {
  var deck = [],
    faceChars = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    rank = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king'],
    suits = ['spade', 'heart', 'club', 'diamond'],
    colors = ['black', 'red', 'black', 'red'],
    i,
    initDeck = [];

  function cardInfoFromIndex(index) {
    var ideck = Math.floor(index / 52),
        cardInDeck = index % 52,
        isuit = Math.floor(cardInDeck / 13),
        cardValue = cardInDeck % 13;
    return {
      suit: suits[isuit],
      color: colors[isuit],
      cardIndex: index,
      value: cardValue + 1, // 1 for Ace, 2 for 2, 11 for Jack, 12 for Queen, 13 for King, etc.
      valueAceHigh: cardValue === 0 ? 13 : cardValue, // 1 for 2, 11 for Queen, 12 for King, 13 for Ace, etc.
      faceChar: faceChars[cardValue],
      rank: rank[cardValue],
      ideck: ideck
    };
  }

  function testDeck() {
    deck.forEach(function(card) {
      if (!card || !validCard(card)) {
        console.error('invalid card');
      }
    });
  }

  function invalidCardWarning(card) {
    console.error('invalid card: ' + card.faceChar + ', ' + card.suit + ', ' + card.color + ', ' + card.value + ', ' + card.cardIndex);
  }

  function validCard(card) {
    switch(card.suit) {
      case 'spade':
      case 'heart':
      case 'club':
      case 'diamond':
        break;
      default:
        invalidCardWarning(card);
        return false;
    }
    if (card.color !== 'red' && card.color !== 'black') {
      invalidCardWarning(card);
      return false;
    }
    if (typeof card.cardIndex !== 'number' || card.cardIndex < 0) {
      invalidCardWarning(card);
      return false;
    }
    if (typeof card.value !== 'number' || card.value < 1 || card.value > 13) {
      invalidCardWarning(card);
      return false;
    }
    if (typeof card.faceChar !== 'string' || faceChars.indexOf(card.faceChar) === -1) {
      invalidCardWarning(card);
      return false;
    }
    return true;
  }

  function swapCards(cards, left, right) {
    var temp = cards[left];
    cards[left] = cards[right];
    cards[right] = temp;
  }

  for(i=0; i < 52; i++) {
    initDeck.push(cardInfoFromIndex(i));
  }

  return {
    shuffle: function(cdecks) {
      var i,
        count = typeof cdecks === 'string' ? 52 * cdecks : 52;
      deck = angular.copy(initDeck);
      for (i = 0; i < count; i++) {
        swapCards(deck, i, Math.floor(Math.random()*count));
      }
      testDeck();
      return deck;
    },
    getCards: function(count) {
      if (count > deck.length) {
        return undefined;
      }
      return deck.splice(0, count);
    },
    getRemainingCards: function() {
      return deck.splice(0, deck.length);
    },
    cardsRemaining: function() {
      return deck.length;
    },
    recycleCards: function(cards) {
      var i,
        count = cards.length;
      for (i=0; i < count; i++) {
        swapCards(cards, i, Math.floor(Math.random()*count));
      }
      deck = deck.concat(cards);
      cards.splice(0, count);
      return deck;
    },
    testDeck: function() {
      testDeck();
    },
    testHand: function(hand) {
      hand.forEach(function(card) {
        if (!card || !validCard(card)) {
          console.error('invalid card');
        }
      });
    }
  };
}]);