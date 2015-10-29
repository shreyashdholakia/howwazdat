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
  });
