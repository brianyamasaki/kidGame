'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.home',
  'myApp.ticTacToe',
  'myApp.cardDeckService',
  'myApp.war'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/home'});
  }])
  .directive('activeNav', ['$location', function($location) {
    // This directive adds the active class to navigation elements for highlighting
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var nestedA = element.find('a')[0];
        var path = nestedA.href;

        scope.location = $location;
        scope.$watch('location.absUrl()', function(newPath) {
          if (path === newPath) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  }]);
