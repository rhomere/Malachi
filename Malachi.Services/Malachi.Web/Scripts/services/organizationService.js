'use strict';
MALACHIAPP.factory('organizationService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services

    var _getOrganization = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Organization/GetOrganization', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateOrganization = function (form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Organization/UpdateOrganization', { Organization: form }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    // Assign Services
    serviceFactory.getOrganization = _getOrganization;
    serviceFactory.updateOrganization = _updateOrganization;

    return serviceFactory;

}]);