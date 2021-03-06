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
        // This shouldn't have to be modified for the exercises
        scope.squareClass = function(index){
          return (scope.boardSquares[index]);
        };

        // Function is called when user clicks on a board square
        // index will be a value from 0 to 8
        scope.squareClick = function(index) {

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
          scope.gameOver = undefined; // undefined if game is still playing, 'win' if won, 'tie' if there is no winner
          scope.errorMsg = undefined; // undefined if no errors, set to error message like 'illegal move' when you click on a square that already has a value
        };

        // This function returns true if the current player has won the game
        scope.checkForWin = function() {
          return false;
        };

        // This function returns true if all squares have been chosen
        scope.checkForTie = function() {
          return false;
        }

        // initialize board now
        scope.resetBoard();
      }
    };
  }]);