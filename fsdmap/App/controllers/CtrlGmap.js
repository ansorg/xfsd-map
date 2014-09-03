'use strict';
gApp.controller('GmapController', ['$scope', '$http',
    function GmapController($scope, $http, $intervall) {
        this.map = {
            Lon: -113.970889,
            Lat: 51.098945,
            showError: function (status) {
                toastr.error(status);
            }
        };

        this.pilots = [];
        this.controllers = [];

        var instance = this;

        $http({
            method: "GET",
            url: "../fsdmap/fsd_data.php",
            responseType: "document"
        }).success(function (clientData, status) {
            console.log(clientData);

            var clients = clientData.lastElementChild ? clientData.lastElementChild.children : clientData.lastChild.childNodes;

            for (var i = 0; i < clients.length; i++) {
                var clientElem = clients[i];
                console.log(clientElem);
                var s = "";
                for (var j = 0; j < clientElem.attributes.length; j++) {
                    s = s + '"' + clientElem.attributes.item(j).name + '":"' + clientElem.attributes.item(j).value
                    if (j + 1 < clientElem.attributes.length) {
                        s = s + '",'
                    }
                }
                s = '{' + s + '"}';
                var pilot = JSON.parse(s);
                if (pilot.type=="P") {
                    instance.pilots.push(pilot);
                } else {
                    instance.controllers.push(pilot);
                }
            }
        }).error(function (data, status) {

        });

    }]);