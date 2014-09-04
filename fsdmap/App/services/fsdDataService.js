/*
* http://blog-de.akquinet.de/2013/01/22/wartbare-rich-web-applications-mit-angularjs/
* */
gApp.factory('FsdDataService', [
    '$http',
    function($http) {
        console.info("FsdDataService");

        return {
            clients: {},
            fetchClients: function() {
                var self = this;
                return             $http({
                    method: "GET",
                    url: "../fsdmap3/fsd_data.php",
                    responseType: "document",
                    headers: {
                        Accept: "text/xml",
                        AcceptEncoding: "none"
                    }
                }).success(function (clientData, status) {
                    //console.log(clientData);
                    self.clients.pilots = [];
                    self.clients.controllers = [];
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
                            self.clients.pilots.push(pilot);
                        } else {
                            self.clients.controllers.push(pilot);
                        }
                    }
                    return self.clients;
                }).error(function (data, status) {

                });
            }
        }
    }
]);