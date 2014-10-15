"use strict";
var app = angular.module('app', []);

app.controller('GmapController', ['$scope', '$interval', 'FsdDataService', function ($scope, $interval, FsdDataService) {
    console.info("GmapController");
    console.info("load settings", localStorage.fsdmap);
    var settings = localStorage.fsdmap ? JSON.parse(localStorage.fsdmap) : { mapType: 'terrain' };
    var storeSettings = function () {
        localStorage.fsdmap = JSON.stringify(settings);
    };

    var instance = this;
    instance.isFirstRun = true;
    instance.showTracks = settings.showTracks !== 'undefined' ? settings.showTracks : true;
    instance.clients = { pilots: [], atcs: [] };
    instance.fsdData = { pilots: {}, atcs: {} };
    instance.timestamp = Date.now();

    var PLANEOPACITY = 1.0;
    var planeIcons = {
        D: {
            fillColor: "gray",
            fillOpacity: 0.4,
            strokeColor: "red",
            strokeWidth: 4,
            path: "M56.5029 96.2693l0 -25.7829 -14.1736 2.98356c-0.930522,5.4773 -2.45367,9.04821 -4.1745,9.04821 -1.53638,0 -2.91516,-2.84826 -3.8555,-7.358l-18.663 3.92883 0 -16.4168 17.7132 -9.32562c0.728316,-8.19706 2.60523,-14.0353 4.8053,-14.0353 1.74539,0 3.28782,3.67484 4.21418,9.28632l14.1339 -7.44153 0 -1.31414 0 -14.092 0 -6.82244c0,-2.56101 3.95415,-7.30395 7.48953,-7.30395 3.53575,0 7.50464,4.36498 7.50464,7.30395l0 6.82244 0 14.092 0 1.31414 14.1339 7.44153c0.926364,-5.61148 2.46879,-9.28632 4.21418,-9.28632 2.20007,0 4.07698,5.83825 4.8053,14.0353l17.7132 9.32562 0 16.4168 -18.663 -3.92883c-0.940348,4.50974 -2.31912,7.358 -3.8555,7.358 -1.72082,0 -3.24397,-3.5709 -4.1745,-9.04821l-14.1736 -2.98356 0 25.7829 13.618 13.618 0 6.88669 -15.3937 -4.12461 -5.72146 0 -5.72146 0 -15.3937 4.12461 0 -6.88669 13.618 -13.618z",
            anchor: new google.maps.Point(62, 62),
            scale: 0.3,
            rotation: -0
        },
        M: {
            fillColor: "blue",
            fillOpacity: PLANEOPACITY,
            strokeColor: "black",
            strokeWidth: 0,
            path: "M56.5029 96.2693l0 -25.7829 -14.1736 2.98356c-0.930522,5.4773 -2.45367,9.04821 -4.1745,9.04821 -1.53638,0 -2.91516,-2.84826 -3.8555,-7.358l-18.663 3.92883 0 -16.4168 17.7132 -9.32562c0.728316,-8.19706 2.60523,-14.0353 4.8053,-14.0353 1.74539,0 3.28782,3.67484 4.21418,9.28632l14.1339 -7.44153 0 -1.31414 0 -14.092 0 -6.82244c0,-2.56101 3.95415,-7.30395 7.48953,-7.30395 3.53575,0 7.50464,4.36498 7.50464,7.30395l0 6.82244 0 14.092 0 1.31414 14.1339 7.44153c0.926364,-5.61148 2.46879,-9.28632 4.21418,-9.28632 2.20007,0 4.07698,5.83825 4.8053,14.0353l17.7132 9.32562 0 16.4168 -18.663 -3.92883c-0.940348,4.50974 -2.31912,7.358 -3.8555,7.358 -1.72082,0 -3.24397,-3.5709 -4.1745,-9.04821l-14.1736 -2.98356 0 25.7829 13.618 13.618 0 6.88669 -15.3937 -4.12461 -5.72146 0 -5.72146 0 -15.3937 4.12461 0 -6.88669 13.618 -13.618z",
            anchor: new google.maps.Point(62, 62),
            scale: 0.3,
            rotation: -0
        },
        L: {
            fillColor: "green",
            fillOpacity: PLANEOPACITY,
            strokeColor: "black",
            strokeWidth: 0,
            path: "M57.6954 78.3407l0 -17.0975 -27.2486 -0.626269 0 -14.7307 27.2486 -1.01783 0 -3.69676 0 -3.823c0,-3.22281 3.32523,-9.19183 6.2986,-9.19183 2.97298,0 6.31069,5.49355 6.31069,9.19183l0 3.823 0 3.69676 27.2486 1.01783 0 14.7307 -27.2486 0.626269 0 17.0975 12.6236 2.84864 0 7.05072 -12.9865 -0.425954 -5.94181 0 -5.94181 0 -12.9865 0.425954 0 -7.05072 12.6236 -2.84864z",
            anchor: new google.maps.Point(62, 62),
            scale: 0.4,
            rotation: -0
        },
        H: {
            fillColor: "darkblue",
            fillOpacity: PLANEOPACITY,
            strokeColor: "black",
            strokeWidth: 0,
            path: "M35.4532 53.2703c0.791813,-7.6271 2.59919,-12.9589 4.70174,-12.9589 1.52542,0 2.89512,2.80668 3.83472,7.25897l12.316 -8.22351 0 -13.5969 0 -12.8315c0,-3.25909 4.05809,-9.29539 7.68682,-9.29539 3.62873,0 7.70194,5.55516 7.70194,9.29539l0 12.8315 0 13.5969 12.316 8.22351c0.939592,-4.45229 2.3093,-7.25897 3.83472,-7.25897 2.10256,0 3.90993,5.33179 4.70174,12.9589l7.39882 4.94023c0.940726,-3.82489 2.33046,-6.2453 3.88007,-6.2453 2.23635,0 4.13859,5.04077 4.84045,12.0684l12.3784 8.26509 0 16.4168 -13.7239 -5.48713c-0.916159,3.00322 -2.14451,4.84121 -3.49494,4.84121 -1.76731,0 -3.32637,-3.14835 -4.24895,-7.9374l-8.04134 -3.21525c-0.932789,4.06905 -2.24164,6.60134 -3.69034,6.60134 -1.79755,0 -3.37928,-3.89746 -4.29506,-9.79391l-11.8556 -4.73991 0 32.2217 17.559 14.6816 0 6.88669 -18.4105 -4.12461 -6.84285 0 -6.84285 0 -18.4105 4.12461 0 -6.88669 17.559 -14.6816 0 -32.2217 -11.8556 4.73991c-0.915781,5.89645 -2.49752,9.79391 -4.29506,9.79391 -1.4487,0 -2.75755,-2.53229 -3.69034,-6.60134l-8.04134 3.21525c-0.922584,4.78905 -2.48164,7.9374 -4.24895,7.9374 -1.35043,0 -2.57878,-1.83799 -3.49494,-4.84121l-13.7239 5.48713 0 -16.4168 12.3784 -8.26509c0.70186,-7.02767 2.6041,-12.0684 4.84045,-12.0684 1.54961,0 2.93934,2.42041 3.88007,6.2453l7.39882 -4.94023z",
            anchor: new google.maps.Point(62, 62),
            scale: 0.3,
            rotation: -0
        }
    };

    var mapColors = {
        fp: {
            ROADMAP: "blue",
            TERRAIN: "blue",
            HYBRID: "aqua",
            SATELLITE: "aqua"
        },
        track: {
            ROADMAP: "red",
            TERRAIN: "red",
            HYBRID: "yellow",
            SATELLITE: "yellow"
        },
        D: {ROADMAP: "red", TERRAIN: "red", HYBRID: "yellow", SATELLITE: "yellow"},
        L: {ROADMAP: "cornflowerblue", TERRAIN: "royalblue", HYBRID: "orange", SATELLITE: "white"},
        M: {ROADMAP: "royalblue", TERRAIN: "mediumblue", HYBRID: "darkorange", SATELLITE: "lightgrey"},
        H: {ROADMAP: "navy", TERRAIN: "navy", HYBRID: "tomato", SATELLITE: "silver"}
    }; //google.maps.MapTypeId

    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(0.0, 43.0),
        mapTypeId: settings.mapType.toLowerCase()
    };
    var fsdmap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    google.maps.event.addListener(fsdmap, 'maptypeid_changed', function () {
        settings.mapType = fsdmap.getMapTypeId();
        storeSettings();
        redrawMap(settings.mapType.toUpperCase());
    });

    $interval(function ($scope) {
        loadData();
    }, 10000);

    $scope.$watch(angular.bind(this, function () {
        return this.showTracks;
    }), function (newValue, oldValue) {
        if (oldValue == newValue) return;
        console.log(oldValue, newValue);
        settings.showTracks = newValue;
        storeSettings();
        redrawMap(settings.mapType.toUpperCase());
    });
    $scope.$watch(
        angular.bind(
            this, function () {
                return this.clients;
            }), function (newValue, oldValue) {
            //console.info("GmapController $scope.$watch:", newValue, oldValue);
            if (newValue !== oldValue) {
                console.info("values changed, update map and lists");
                cleanupClients(newValue);
                drawMapMarkers(newValue);
            } else {
                console.info("values not changed");
            }
        }, true);

    var cleanupClients = function (clients) {
        console.info("cleanupClients");
        var clients = clients;
        //https://docs.angularjs.org/api/ng/function/angular.forEach
        angular.forEach(instance.fsdData.pilots, function (value, key) {
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
            var stillThere = clients.pilots.some(function (c) {
                return c.cs == this
            }, key);
            console.info(key, 'still there?', stillThere);
            if (!stillThere) {
                instance.fsdData.pilots[key].marker.setMap(null);
                instance.fsdData.pilots[key].track.setMap(null);
                if (instance.fsdData.pilots[key].fp) instance.fsdData.pilots[key].fp.setMap(null);
                delete instance.fsdData.pilots[key];
            }
        });
    };

    var getHeadingFromPath = function (p) {
        if (p.length < 2) {
            return 0;
        }
        var p1 = p.getAt(p.length - 2), p2 = p.getAt(p.length - 1);
        if (p1.lat() == p2.lat() && p1.lng() == p2.lng()) {
            //skip if not changed
            return;
        }
        var newHdg = LatLon.bearing(parseFloat(p1.lat()), parseFloat(p1.lng()), parseFloat(p2.lat()), parseFloat(p2.lng()));
        return newHdg.toFixed(0);
    };

    var getIconType = function (acf) {
        var typeSuffix = "D";
        var planeParams = acf.split('/');
        if (planeParams.length > 2) {
            typeSuffix = planeParams[2].charAt(0);
        }
        if (typeSuffix == "F") {
            typeSuffix = "H";
        }
        return typeSuffix;
    };

    var updatePilotData = function (newData) {
        //if pilot exists, update some properties else initialize new empty one
        var pilot = instance.fsdData.pilots[newData.cs] || {};
        pilot.acf = newData.acf;
        pilot.alt = newData.alt;
        pilot.cid = newData.cid;
        pilot.cs = newData.cs;
        pilot.from = newData.from;
        pilot.gs = newData.gs;
        pilot.lat = newData.lat;
        pilot.lng = newData.lng;
        pilot.name = newData.name;
        pilot.rating = newData.rating;
        pilot.route = newData.route;
        pilot.to = newData.to;
        pilot.type = newData.type;
        pilot.T = getIconType(pilot.acf || '');
        pilot.getInfoText = function () {
            return pilot.cs + ": " + pilot.acf + " " + pilot.hdg + "° " + pilot.gs + "kt " + pilot.alt + "ft<br>" + pilot.route;
        };
        return pilot;
    };

    var drawMapMarkers = function (updatedClients) {
        var mapType = fsdmap.getMapTypeId().toUpperCase();
        console.info("drawMapMarkers on mypType", mapType);
        var bounds = new google.maps.LatLngBounds();
        updatedClients.pilots.forEach(function (updatedPilot) {
            if (instance.fsdData.pilots.hasOwnProperty(updatedPilot.cs)) {
                var pilot = updatePilotData(updatedPilot);
                var point = new google.maps.LatLng(pilot.lat, pilot.lng);
                var marker = pilot.marker;
                var track = pilot.track;
                var path = track.getPath();
                path.push(point);
                path.setOptions({ strokeColor: mapColors.track[mapType] || '#FF0000' });
                if (instance.showTracks) {
                    track.setMap(fsdmap);
                } else {
                    track.setMap(null);
                }
                marker.setPosition(point);
                pilot.hdg = getHeadingFromPath(path);
                if (pilot.hdg) {
                    console.info("set hdg", pilot.hdg);
                    marker.setIcon({
                        fillColor: mapColors[pilot.T][mapType] || planeIcons[pilot.T].fillColor,
                        fillOpacity: planeIcons[pilot.T].fillOpacity,
                        strokeColor: mapColors[pilot.T][mapType] || planeIcons[pilot.T].strokeColor,
                        strokeWidth: planeIcons[pilot.T].strokeWidth,
                        path: planeIcons[pilot.T].path,
                        scale: planeIcons[pilot.T].scale,
                        rotation: planeIcons[pilot.T].rotation + parseFloat(pilot.hdg),
                        anchor: planeIcons[pilot.T].anchor
                    });
                    //add base icon rotation to actual heading
                    pilot.infoWindow.setContent(pilot.getInfoText());
                }
                if (pilot.followed) {
                    console.info("following", pilot.cs);
                    fsdmap.panTo(point);
                }
            } else {
                console.info("new pilot:", updatedPilot);
                var pilot = updatePilotData(updatedPilot);
                pilot.hdg = 0;
                var point = new google.maps.LatLng(updatedPilot.lat, updatedPilot.lng);
                var marker = new google.maps.Marker({
                    position: point,
                    map: fsdmap,
                    title: updatedPilot.cs,
                    icon: {
                        fillColor: mapColors[pilot.T][mapType] || planeIcons[pilot.T].fillColor,
                        fillOpacity: planeIcons[pilot.T].fillOpacity,
                        strokeColor: mapColors[pilot.T][mapType] || planeIcons[pilot.T].strokeColor,
                        strokeWidth: planeIcons[pilot.T].strokeWidth,
                        path: planeIcons[pilot.T].path,
                        scale: planeIcons[pilot.T].scale,
                        anchor: planeIcons[pilot.T].anchor,
                        rotation: planeIcons[pilot.T].rotation
                    }
                });
                var track = new google.maps.Polyline({
                    path: [point, point],
                    geodesic: true,
                    strokeColor: mapColors.track[mapType] || '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                if (instance.showTracks) {
                    track.setMap(fsdmap);
                }
                var infowindow = new google.maps.InfoWindow({
                    content: pilot.getInfoText()
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open(fsdmap, marker);
                });
                pilot.marker = marker;
                pilot.track = track;
                pilot.infoWindow = infowindow;
                instance.fsdData.pilots[updatedPilot.cs] = pilot;
                bounds.extend(point);
            }
        });
        if (instance.isFirstRun) {
            console.info("first run, show all clients");
            fsdmap.panToBounds(bounds);
            instance.isFirstRun = false;
        }
    };

    var redrawMap = function (mapType) {
        angular.forEach(instance.fsdData.pilots, function (pilot) {
            if (pilot.fp) {
                pilot.fp.setOptions({ strokeColor: mapColors.fp[mapType] });
            }
            if (pilot.track) {
                pilot.track.setOptions({ strokeColor: mapColors.track[mapType] });
                if (settings.showTracks) {
                    pilot.track.setMap(fsdmap);
                } else {
                    pilot.track.setMap(null);
                }
            }
            if (pilot.marker) {
                var icon = pilot.marker.getIcon();
                icon.fillColor = mapColors[pilot.T][mapType] || planeIcons[pilot.T].fillColor;
                icon.strokeColor = mapColors[pilot.T][mapType] || planeIcons[pilot.T].strokeColor;
                pilot.marker.setIcon(icon);
            }
        });
    };

    $scope.toggleAside = function (evt, data) {
        evt.target.parentElement.classList.toggle("closed");
    };

    $scope.followClient = function (evt, data) {
        //create a dummy pilot to use for resetting the "follow"
        var data = data || {};
        if (!data.pilot) {
            data.pilot = { cs: "" };
        } else {
            console.info("follow", data.pilot);
            fsdmap.panTo(new google.maps.LatLng(data.pilot.lat, data.pilot.lng));
        }
        angular.forEach(instance.fsdData.pilots, function (pilot) {
            pilot.followed = (pilot.cs == data.pilot.cs);
        });
    };

    $scope.centerClient = function (evt, data) {
        console.info("center on", data.pilot);
        fsdmap.panTo(new google.maps.LatLng(data.pilot.lat, data.pilot.lng));
    };

    $scope.loadFP = function (evt, data) {
        console.info("flightplan for", data.pilot);
        var pilot = data.pilot;
        if (!instance.fsdData.pilots.hasOwnProperty(pilot.cs)) {
            return;
        }
        evt.currentTarget.classList.toggle("active");
        if (instance.fsdData.pilots[pilot.cs].fp != null) {
            //remove any existing track, toggle FP OFF
            instance.fsdData.pilots[pilot.cs].fp.setMap(null);
            delete instance.fsdData.pilots[pilot.cs].fp;
        } else {
            FsdDataService.fetchFP(pilot.cs, pilot.from, pilot.to, pilot.route).success(function (fp, status) {
                console.info("FsdDataService::fetchFP::success");
                console.log(fp);
                if (fp.lines.length != 1) {
                    return;
                }
                var path = [];
                for (var i = 0; i < fp.lines[0].points.length; i++) {
                    path.push(new google.maps.LatLng(fp.lines[0].points[i].lat, fp.lines[0].points[i].lng));
                }
                var mapPath = new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: mapColors.fp[fsdmap.getMapTypeId().toUpperCase()],
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                mapPath.setMap(fsdmap);
                instance.fsdData.pilots[pilot.cs].fp = mapPath;
            });
        }
    };

    var loadData = function ($scope) {
        instance.timestamp = Date.now();
        console.info("loadData", instance.timestamp);
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
                var client = JSON.parse(s);
                if (client.lat == '' || client.lng == '' || parseFloat(client.lat) == NaN || parseFloat(client.lng) == NaN) {
                    //invalid data, skip to next
                    console.error("invalid data:", clientElem);
                    continue;
                }

                if (client.type == "P") {
                    client.hdg = 0;
                    instance.clients.pilots.push(client);
                } else {
                    instance.clients.atcs.push(client);
                }
            }
        }).error(function (data, status) {
            console.info("FsdDataService::fetchClients::error");
            console.error(data);
            //instance.clients.pilots = [];
            //instance.clients.atcs = [];
        });
    };
    loadData();
}]);

//http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
//does it have side effects?
app.config(['$httpProvider', function ($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
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