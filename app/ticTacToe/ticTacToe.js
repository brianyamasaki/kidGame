'use strict';

angular.module('myApp.ticTacToe', ['ngRoute', 'myApp.ticTacToeDirective'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/ticTacToe', {
      templateUrl: 'ticTacToe/ticTacToe.html',
      controller: 'TicTacToeCtrl'
    });
  }])

  .controller('TicTacToeCtrl', [function() {

  }]);