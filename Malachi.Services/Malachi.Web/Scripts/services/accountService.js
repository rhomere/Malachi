'use strict';
MALACHIAPP.factory('accountService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services
    var _getApps = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Account/GetApps', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    var _getInsurers = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Account/GetInsurers', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };
        
    var _getBrokers = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Account/GetBrokers', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getMGAs = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Account/GetMGAs', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // Assign Services
    serviceFactory.getApps = _getApps;
    serviceFactory.getInsurers = _getInsurers;
    serviceFactory.getBrokers = _getBrokers;
    serviceFactory.getMGAs = _getMGAs;
    
    return serviceFactory;

}]);