angular.module('myApp.fileInput', [])
  .directive('fileInput', [function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'missile-command/file-input.html',
      link: function(scope, element, attrs) {
        
      }
    };
  }]);