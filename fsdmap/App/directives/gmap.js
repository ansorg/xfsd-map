"use strict";
angular.module('fsdmap', [])
    .directive('jaGmap', [function ($window, $parse) {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: "App/templates/gmap.html"
        };
    }]);
