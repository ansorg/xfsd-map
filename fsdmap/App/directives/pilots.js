"use strict";
angular.module('fsdInfo', [])
    .directive('jaPilots', [function ($window, $parse) {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: "App/templates/pilots.html"
        };
    }]);
