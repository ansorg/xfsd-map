'use strict';
gApp.controller('GmapController', ['$scope', '$http',
    function GmapController($scope, $http) {
        this.map = {
            Lon: -113.970889,
            Lat: 51.098945,
            showError: function (status) {
                toastr.error(status);
            }
        };

        this.pilots = [];

        var instance = this;

        $http({
            method: "GET",
            url: "/xfsd-map/sample-data/fsd_data.xml",
            responseType: "document"
        }).success(function (clientData, status) {
            console.log(clientData);
            for (var i = 0; i < clientData.lastElementChild.children.length; i++) {
                var clientElem = clientData.lastElementChild.children[i];
                console.log(clientElem);
                var s = "";
                for (var i = 0; i < clientElem.attributes.length; i++) {
                    s = s + '"' + clientElem.attributes.item(i).name + '":"' + clientElem.attributes.item(i).value
                    if (i + 1 < clientElem.attributes.length) {
                        s = s + '",'
                    }
                }
                s = '{' + s + '"}';
                var pilot = JSON.parse(s);
                instance.pilots.push(pilot);
            }
        }).error(function (data, status) {

        });

    }]);