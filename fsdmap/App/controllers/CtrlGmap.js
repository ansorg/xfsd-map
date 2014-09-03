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
            for (var i = 0; i < clientData.lastChild.childNodes.length; i++) {
                var clientElem = clientData.lastChild.childNodes[i];
                instance.pilots.push(clientElem);
            }
        }).error(function (data, status) {

        });

    }]);