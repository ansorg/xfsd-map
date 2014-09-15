"use strict";
var app = angular.module('app', []);

app.controller('GmapController', ['$scope', '$interval', 'FsdDataService', function ($scope, $interval, FsdDataService) {
    console.info("GmapController");
    var fsdmap;
    var instance = this;
    instance.clients = { pilots: [], atcs: [] };
    instance.fsdData = { pilots: {}, atcs: [] };
    instance.timestamp = Date.now();
    instance.registerMap = function (mapParam) {
        fsdmap = mapParam;
        console.info("storing map", fsdmap);
    };

    $interval(function () {
        fnLoadData();
    }, 10000);

    $scope.$watch(
        angular.bind(
            this, function () {
                return this.clients;
            }), function (newValue, oldValue) {
            //TODO: this gets called twice, the first time without the controller scoped variables!?
            if (!fsdmap) {
                return;
            }
            console.info("GmapController $scope.$watch:", newValue, oldValue);
            if (newValue !== oldValue) {
                console.info("values changed, update map and lists");
                fnDrawMarkers(newValue);
            } else {
                console.info("values not changed");
            }
        }, true);

    var fnDrawMarkers = function (clients) {
        clients.pilots.forEach(function (pilot) {
            if (instance.fsdData.pilots.hasOwnProperty(pilot.cs)) {
                var point = new google.maps.LatLng(pilot.lat, pilot.lng);
                var marker = instance.fsdData.pilots[pilot.cs].marker;
                var flightPath = instance.fsdData.pilots[pilot.cs].flightPath;
                var follow = instance.fsdData.pilots[pilot.cs].follow;
                var path = flightPath.getPath();
                path.push(point);
                marker.setPosition(point);
                if (follow) {
                    fsdmap.panTo(point);
                }
            } else {
                console.info("new pilot:", pilot);
                var point = new google.maps.LatLng(pilot.lat, pilot.lng);
                var marker = new google.maps.Marker({
                    position: point,
                    map: fsdmap,
                    title: pilot.cs
                });
                var flightPath = new google.maps.Polyline({
                    path: [point, point],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                flightPath.setMap(fsdmap);
                instance.fsdData.pilots[pilot.cs] = { marker: marker, flightPath: flightPath, follow: false };
            }
        });
    };

    $scope.centerClient = function () {
        console.info(this.pilot);
        var pilot = this.pilot;
        fsdmap.panTo(new google.maps.LatLng(pilot.lat, pilot.lng));
    };

    var fnLoadData = function ($scope) {
        console.info("fnLoadData");
        instance.timestamp = Date.now();
        FsdDataService.fetchClients().success(function (clientData, status) {
            console.info("FsdDataService::fetchClients::success");
            //console.log(clientData);
            if (clientData == null) {
                console.error("got no data");
                return;
            }
            var cObj = clientData.lastElementChild ? clientData.lastElementChild.children : clientData.lastChild.childNodes;

            if (cObj.length > 0) {
                //got fresh data, reset
                instance.clients.pilots = [];
                instance.clients.atcs = [];
            }

            for (var i = 0; i < cObj.length; i++) {
                var clientElem = cObj[i];
                //console.log(clientElem);
                var s = "";
                for (var j = 0; j < clientElem.attributes.length; j++) {
                    s = s + '"' + clientElem.attributes.item(j).name + '":"' + clientElem.attributes.item(j).value
                    if (j + 1 < clientElem.attributes.length) {
                        s = s + '",'
                    }
                }
                s = '{' + s + '"}';
                var pilot = JSON.parse(s);
                if (pilot.type == "P") {
                    instance.clients.pilots.push(pilot);
                } else {
                    instance.clients.atcs.push(pilot);
                }
            }
        }).error(function (data, status) {
            console.info("FsdDataService::fetchClients::error");
            console.error(data);
            instance.clients.pilots = [];
            instance.clients.atcs = [];
        });
    };
    fnLoadData();
}]);

app.directive('fsdmap', function () {
    console.info("directive fsdmap");
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
        controller: 'GmapController'
    };
});

app.directive('sidebar', [function ($window, $parse) {
    console.info("directive sidebar");
    return {
        restrict: 'E',
        replace: false,
        templateUrl: "App/templates/pilots.html",
        link: function ($scope, $element, attr, controller) {
            console.info("directive jaPilots LINK");
        }
    };
}]);


function initialize() {
    console.info("initialize");
    angular.bootstrap(document, ['app']);
}

angular.element(document).ready(function () {
    console.info("loadScript");
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3&' +
        'key=AIzaSyCz4kRF_mWWZQNyD8ZB5auFb0pUfe-vHRI&sensor=false&' +
        'callback=initialize';
    document.body.appendChild(script);
});