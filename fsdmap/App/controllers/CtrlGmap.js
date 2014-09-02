'use strict';
gApp.controller('GmapController',
    function GmapController() {
        this.map = {
            Lon: -113.970889,
            Lat: 51.098945,
            showError: function (status) {
                toastr.error(status);
            }
        };

        this.pilots = [0, 1, 2, 3];
    });