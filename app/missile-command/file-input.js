angular.module('myApp.fileInput', [])
  .directive('fileInput', ['$rootScope', function($rootScope) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'missile-command/file-input.html',
      link: function(scope, element, attrs) {
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          // Great success! All the File APIs are supported.
        } else {
          alert('The File APIs are not fully supported in this browser.');
        }

        function readFile(file) {
          var reader = new FileReader();
          var buffer;
          reader.onload = function(event) {
            var regex = new RegExp('^[ \t]*[{[]');
            buffer = event.target.result;
            // simple check to ensure it's a JSON file
            if (-1 === buffer.search(regex)) {
              alert('unrecognized file');
              return;
            }
            $rootScope.$broadcast('fileInputReceived', JSON.parse(buffer));
          }
          reader.readAsText(file);
        }

        function handleFileSelect(evt) {
          evt.stopPropagation();
          evt.preventDefault();

          var files = evt.originalEvent.dataTransfer.files; // FileList object.

          // files is a FileList of File objects. List some properties.
          var output = [];
          for (var i = 0, f; f = files[i]; i++) {
            readFile(files[i]);
            // output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
            //             f.size, ' bytes, last modified: ',
            //             f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
            //             '</li>');
          }
        }

        function handleDragOver(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }

        element.on('drop', function(evt) {
          $(this).removeClass('over');
          handleFileSelect(evt);
        });
        element.on('dragover', function(evt) {
          $(this).addClass('over');
          handleDragOver(evt);
        });
      }
    };
  }]);