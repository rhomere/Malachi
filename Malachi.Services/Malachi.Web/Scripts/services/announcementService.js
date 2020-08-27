'use strict';
MALACHIAPP.factory('announcementService', ['$http', 'ngAuthSettings', function($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var serviceFactory = {};

    // create method to get latest announcement
    serviceFactory.getLastestAnnouncement = function () {

        // perform request to server
        return $http.post(serviceBase + 'api/Admin/GetLatestAnnouncement').then(function (results) {

            // return the results from server
            return results;
        });
    };

    // create method to add announcement
    serviceFactory.addAnnouncement = function (subject, body) {

        // block ui
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        // perform request to server
        return $http.post(serviceBase + 'api/Admin/NewAnnouncement', { Subject: subject, Body: body }).then(function (results) {

            // unblock ui
            Metronic.unblockUI();

            // return the results from server
            return results;
        });
    };

    // return service
    return serviceFactory;
}]);