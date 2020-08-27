'use strict';
MALACHIAPP.factory('appService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services


    var _getApps = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Apps/GetApps', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchApps = function (name, pageNumber, display) {
        return $http.get(serviceBase + 'api/Apps/SearchApps', { params: { Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateApp = function (app) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Apps/UpdateApp', { App: app }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteApp = function (appId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Apps/DeleteApp', { AppId: appId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // Assign Services
    serviceFactory.getApps = _getApps;
    serviceFactory.searchApps = _searchApps;
    serviceFactory.updateApp = _updateApp;
    serviceFactory.deleteApp = _deleteApp;

    return serviceFactory;

}]);