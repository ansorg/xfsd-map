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
                url: "fsd_data.php",
                responseType: "document",
                headers: {
                    Accept: "text/xml",
                    AcceptEncoding: "none"
                }
            });
        },
        fetchFP: function (cs, from, to, route) {
            console.info("FsdDataService::fetchFP", cs, from, to, route);
            return $http({
                method: "GET",
                url: "data.php?&action=track&cs=" + cs + "&from=" + from + "&to=" + to + "&route=" + route.replace(/ /g, '|'),
                responseType: "json",
                headers: {
                    Accept: "text/json",
                    AcceptEncoding: "none"
                }
            });
        }
    }
}
]);