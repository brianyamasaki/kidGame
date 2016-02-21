'use strict';

angular.module('myApp.ticTacToeDirective', ['ngRoute'])

  .directive('ticTacToe', [function() {
    var initSquares = [
      undefined, undefined, undefined,
      undefined, undefined, undefined,
      undefined, undefined, undefined
    ];
    return {
      restrict: 'E',
      templateUrl: 'ticTacToe/ticTacToe-directive.html',
      replace: true,
      link: function(scope, el, attrs) {
        var i;

        scope.swapCurrentPlayer = function () {
          if (scope.currentPlayer === 'x') {
            scope.currentPlayer = 'o';
          } else {
            scope.currentPlayer = 'x';
          }
        };

        scope.squareClass = function(index){
          return (scope.boardSquares[index]);
        };

        scope.squareClick = function(index) {
          scope.boardSquares[index] = scope.currentPlayer;
          if (scope.checkForWin()) {

          } else if (scope.checkForTie()) {

          } else
          {
            scope.swapCurrentPlayer();
          }
        };

        scope.resetBoard = function() {
          scope.boardSquares = angular.copy(initSquares);
          scope.currentPlayer = 'x';
          scope.gameOver = undefined;
        };

        scope.checkForWin = function() {
          var board = scope.boardSquares,
            player = scope.currentPlayer;

          // There are eight possible ways to win - three across, three down and two diagonal
          // We test for each case
          if ((board[0] === player && board[1] === player && board[2] === player) ||
            (board[3] === player && board[4] === player && board[5] === player) ||
            (board[6] === player && board[7] === player && board[8] === player) ||
            (board[0] === player && board[3] === player && board[6] === player) ||
            (board[1] === player && board[4] === player && board[7] === player) ||
            (board[2] === player && board[5] === player && board[8] === player) ||
            (board[0] === player && board[4] === player && board[8] === player) ||
            (board[2] === player && board[4] === player && board[6] === player)) {
            scope.gameOver = 'win';
            return true;
          }
          return false;
        };

        scope.checkForTie = function() {
          var board = scope.boardSquares,
            i,
            openSquareFound = false;

          for (i = 0; i < 9; i++) {
            if (board[i] === undefined) {
              return;
            }
          }
          scope.gameOver = 'tie';
        }

        // initialize board
        scope.resetBoard();
      }
    };
  }]);