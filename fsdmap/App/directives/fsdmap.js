"use strict";
app.directive('fsdmap', function () {
    console.info("directive fsdmap");
    return {
        restrict: 'E',
        replace: false,
        templateUrl: "App/templates/fsdmap.html?v=0",
        link: function ($scope, $element, attr, ctrl) {
            console.info("directive fsdmap LINK");
            var mapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(20.397, 20.644)
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            ctrl.registerMap(map);
            ctrl.loadData();
        },
        controller: 'GmapController'
    };
});

