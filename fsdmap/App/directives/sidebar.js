"use strict";
app.directive('sidebar', [function ($window, $parse) {
    console.info("directive sidebar");
    return {
        restrict: 'E',
        replace: false,
        templateUrl: "App/templates/sidebar.html",
        link: function ($scope, $element, attr, ctrl) {
            console.info("directive sidebar LINK");
        }
    };
}]);