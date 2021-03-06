'use strict';
define([], function() {
  var dependencies = [];
  var PagedPngPlotDirective = function() {
    return {
      scope: {
        fileName: '=',
        pages: '='
      },
      restrict: 'E',
      // using template because loading teplateUrl irritating in submodule
      templateUrl: './pagedPngPlotDirective.html',
      link: function(scope) {
        scope.selectNextPage = selectNextPage;
        scope.selectPreviousPage = selectPreviousPage;
        resetPage();

        scope.$watch('pages', function(newValue, oldValue) {
          if (newValue === oldValue) {
             return;
          }
          resetPage();
        });

        function resetPage() {
          scope.selectedPage = 0;
        }

        function selectNextPage() {
          ++scope.selectedPage;
        }
        function selectPreviousPage() {
          --scope.selectedPage;
        }
      }
    };
  };
  return dependencies.concat(PagedPngPlotDirective);
});
