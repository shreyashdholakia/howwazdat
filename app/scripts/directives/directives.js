'use strict';

angular.module('howWasThat')
  .directive('tooltip', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $(element)
          .attr('title', scope.$eval(attrs.tooltip))
          .tooltip({container: 'body'});
      }
    };
  })
  .filter('startFrom', function () {
    return function (input, start) {
      if(input) {
        start = +start; //parse to int
        return input.slice(start);
      }
    }
  });
