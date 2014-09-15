"use strict";
angular.module('fsdmap', []).directive('jaGmap', [function ($window, $parse) {
    console.info("directive jaGmap");
    return {
        restrict: 'E',
        replace: false,
        templateUrl: "App/templates/gmap.html?v=0",
        link: function ($scope, $element, attr, ctrl) {
            console.info("directive jaGmap LINK");
            var mapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(-34.397, 150.644)
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            ctrl.registerMap(map);
        },
        controller: function ($scope) {
            console.info("directive jaGmap CONTROLLER");
            // $scope is the appropriate scope for the directive
            var map;
            this.registerMap = function (varMap) {
                map = varMap;
            }

            $scope.$watch(
                angular.bind(
                    this, function () {
                        return this.time;
                    }), function (newValue, oldValue) {
                    console.info("directive jaGmap CONTROLLER $scope.$watch:", newValue, oldValue);
                    if (newValue !== oldValue) {
                        var center = map.getCenter(),
                            latitude = center.lat(),
                            longitude = center.lng();
                        if ($scope.latitude !== latitude || $scope.longitude !== longitude)
                            map.setCenter(new google.maps.LatLng($scope.latitude, $scope.longitude));
                    }
                });


            this.addChild = function (nestedDirective) { // this refers to the controller
                console.log('Got the message from nested directive:' + nestedDirective.message);
            };
        }
    };
}]);
