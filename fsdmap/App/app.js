"use strict";
var gApp = angular.module('gApp', ['fsdmap', 'fsdInfo']);

function initialize() {
    console.info("initialize");
    angular.bootstrap(document, ['gApp']);
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