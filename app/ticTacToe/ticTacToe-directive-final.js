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
      scope: {

      },
      replace: true,
      link: function(scope, el, attrs) {
        var i;

        // Call this to swap from player X to player O
        scope.swapCurrentPlayer = function () {
          if (scope.currentPlayer === 'x') {
            scope.currentPlayer = 'o';
          } else {
            scope.currentPlayer = 'x';
          }
        };

        // This function allows displaying of boardSquare content onto the TicTacToe board on the main page.
        // It is called by the Angular through ng-click="squareClass($index)" in the template HTML
        scope.squareClass = function(index){
          return (scope.boardSquares[index]);
        };

        // Function is called when user clicks on a board square
        // index will be a value from 0 to 8
        scope.squareClick = function(index) {
          // if the game is not won or tied, the value is undefined. If it's not undefined, then ignore this click.
          if (scope.gameOver !== undefined) {
            return;
          }
          // check if this square already has a value (x or o). If so, ignore this click
          if (scope.boardSquares[index] !== undefined) {
            scope.errorMsg = 'Cannot Click on this square';
            return;
          } else {
            scope.errorMsg = undefined;
          }
          // put the current player into the proper boardSquares item.
          scope.boardSquares[index] = scope.currentPlayer;

          if (scope.checkForWin()) { // checks if the game is won by the current player
            scope.gameOver = 'win';
          } else if (scope.checkForTie()) { // checks if the game is tied (all squares are taken)
            scope.gameOver = 'tie';
          } else // prepare for next player to move
          {
            scope.swapCurrentPlayer();
          }
        };

        // This function initializes the board for a new game
        scope.resetBoard = function() {
          scope.boardSquares = angular.copy(initSquares);
          scope.currentPlayer = 'x';
          scope.gameOver = undefined;
        };

        // This function returns true if the current player has won the game
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
            return true;
          }
          return false;
        };

        // This function returns true if all squares have been chosen
        scope.checkForTie = function() {
          var board = scope.boardSquares,
            i,
            openSquareFound = false;

          for (i = 0; i < 9; i++) {
            if (board[i] === undefined) {
              return false;
            }
          }
          return true;
        }

        // initialize board now
        scope.resetBoard();
      }
    };
  }]);