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

        this.pilots = [];
        this.controllers = [];
        var instance = this;

        var fnLoadData = function () {
            console.info("fnLoadData");
        };

        fnLoadData();

    }]);