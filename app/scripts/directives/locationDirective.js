'use strict';

angular.module('angularPassportApp')
.directive('googleplace', function() {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '=?'
        },
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    scope.details = scope.gPlace.getPlace();
                    scope.latitude = scope.details.geometry.location.A;
                    scope.longitude = scope.details.geometry.location.F;
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});
