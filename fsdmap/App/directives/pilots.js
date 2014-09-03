"use strict";
angular.module('fsdInfo', [])
    .directive('jaPilots', [function ($window, $parse) {
        console.info("directive jaPilots");
        return {
            restrict: 'E',
            replace: false,
            templateUrl: "App/templates/pilots.html",
            link: function ($scope, $element, attr, controller) {
                console.info("directive jaPilots LINK");
            }
        };
    }]);
