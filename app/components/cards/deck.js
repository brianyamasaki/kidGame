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

  function testDeck(inDeck) {
    var check = [];

    if (!inDeck) {
      inDeck = deck;
    }
    inDeck.forEach(function(card) {
      if (card) {
        validCard(card);
      } else {
        console.error('missing card');
      }
    });
    inDeck.map(function(card) {
      return card.cardIndex;
    }).forEach(function(val) {
      if (!check[val]) {
        check[val] = 1;
      } else {
        check[val] += 1;
      }
    });
    check.forEach(function(val) {
      if (val != 1) {
        console.error('card ' + JSON.stringify(cardInfoFromIndex(val)) + 'had count of ' + !val ? '0' : checks[val]);
      }
    });
  }

  function invalidCardWarning(card) {
    console.error('invalid card: ' + card.faceChar + ', ' + card.suit + ', ' + card.color + ', ' + card.value + ', ' + card.cardIndex);
  }

  function validCard(card) {
    var cardT = cardInfoFromIndex(card.cardIndex);
    if (card.suit !== cardT.suit ||
      card.color !== cardT.color ||
      card.value !== cardT.value ||
      card.valueAceHigh !== cardT.valueAceHigh ||
      card.faceChar !== cardT.faceChar ||
      card.rank !== cardT.rank) {
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
    testDeck: function(deck) {
      testDeck(deck);
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