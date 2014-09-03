"use strict";
angular.module('fsdmap', [])
    .directive('jaGmap', [function ($window, $parse) {
        console.info("directive jaGmap");
        return {
            restrict: 'E',
            replace: false,
            templateUrl: "App/templates/gmap.html?v=0",
            link: function ($scope, $element, attr) {
                console.info("directive jaGmap LINK");
                var mapOptions = {
                    zoom: 8,
                    center: new google.maps.LatLng(-34.397, 150.644)
                };
                var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            },
            controller: function ($scope, $compile, $http) {
                console.info("directive jaGmap controller");
                // $scope is the appropriate scope for the directive
                this.addChild = function (nestedDirective) { // this refers to the controller
                    console.log('Got the message from nested directive:' + nestedDirective.message);
                };
            }
        };
    }]);
