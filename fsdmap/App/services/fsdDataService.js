/*
 * http://blog-de.akquinet.de/2013/01/22/wartbare-rich-web-applications-mit-angularjs/
 * */
app.factory('FsdDataService', ['$http', function ($http) {
    console.info("FsdDataService");
    return {
        fetchClients: function () {
            console.info("FsdDataService::fetchClients");
            return $http({
                method: "GET",
                url: "../fsdmap3/fsd_data.php",
                responseType: "document",
                headers: {
                    Accept: "text/xml",
                    AcceptEncoding: "none"
                }
            });
        }
    }
}
]);