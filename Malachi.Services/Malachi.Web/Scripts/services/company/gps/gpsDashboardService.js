'use strict';
MALACHIAPP.factory('gpsDashboardService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Assign Services
    serviceFactory.getAllClassCodes = function (search) {
        return $http.get(serviceBase + 'api/gps/dashboard/GetAllClassCodes', {
            params: {
                Search: search
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }


    return serviceFactory;
}]);