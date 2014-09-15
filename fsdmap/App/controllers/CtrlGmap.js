'use strict';
gApp.controller('GmapController', ['$scope', '$interval', 'FsdDataService',
    function GmapController($scope, $interval, FsdDataService) {
        console.info("GmapController");

        $interval(function () {
            fnLoadData();
        }, 10000);

        this.map = {
            Lon: -113.970889,
            Lat: 51.098945,
            showError: function (status) {
                toastr.error(status);
            }
        };

        this.scope = $scope;
        var instance = this;

        var fnLoadData = function ($scope) {
            console.info("fnLoadData");
            instance.time = Date.now();
            FsdDataService.fetchClients().success(function (clientData, status) {
                console.info("FsdDataService::fetchClients::success");
                //console.log(clientData);
                instance.pilots = [];
                instance.controllers = [];
                if (clientData == null) {
                    console.error("got no data");
                    return;
                }
                var cObj = clientData.lastElementChild ? clientData.lastElementChild.children : clientData.lastChild.childNodes;

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
                        instance.pilots.push(pilot);
                    } else {
                        instance.controllers.push(pilot);
                    }
                }
            }).error(function (data, status) {
                console.info("FsdDataService::fetchClients::error");
                console.error(data);
                instance.pilots = [];
                instance.controllers = [];
            });
        };

        fnLoadData();

    }]);