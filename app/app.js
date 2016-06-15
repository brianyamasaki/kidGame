'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.home',
  'myApp.ticTacToe',
  'myApp.cardDeckService',
  'myApp.war',
  'myApp.klondike',
  'myApp.tanks',
  'myApp.missileCommand'
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

// polyfill for array.findIndex()
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}
if (!Array.prototype.concatAll) {

  Array.prototype.concatAll = function() {
    var results = [];
    this.forEach(function(subArray) {
      results.push.apply(results, subArray);
    });

    return results;
  };
}
