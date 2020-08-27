'use strict';
MALACHIAPP.factory('toolsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    var statesAndCountiesResult = null;
    var statesResult = null;

    // Services
    var _getStates = function () {
        if (statesResult != null) {
            return new Promise(function (resolve) {
                resolve(statesResult);
            });
        }
        return $http.get(serviceBase + 'api/Tools/GetStates', { cache: true }).then(function (results) {
            statesResult = results;
            return results;
        });
    };

    var _getStatesAndCounties = function () {
        if (statesAndCountiesResult != null) {
            return new Promise(function (resolve) {
                resolve(statesAndCountiesResult);
            });
        }
        return $http.get(serviceBase + 'api/Tools/GetStatesAndCounties', { cache: true }).then(function (results) {
            statesAndCountiesResult = results;
            return results;
        });
    };

    var _getStatesAndCountiesByZip = function (zip) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Tools/GetStatesAndCountiesByZip', { params: { Zip: zip }, cache: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    var _getStateAndCountyByZip = function (zip) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Tools/GetStateAndCountyByZip', { params: { Zip: zip }, cache: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    var _getGeoJson = function (type, name, relativeName) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Tools/GetGeoJson', { params: { Type: type, Name: name, RelativeName: relativeName }, cache: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    var _getGeoJsonById = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Tools/GetGeoJsonById', { params: { Id: id }, cache: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    var _getApps = function () {
        return $http.get(serviceBase + 'api/Tools/GetApps', { cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getStructureInsights = function (streetAddress1, city, state, zip, useYelpData) {
        return $http.get(serviceBase + 'api/propertyinsights/GetPropertyInsights', { cache: true, params: { streetAddress1: streetAddress1, city: city, state: state, zip: zip, useYelpData: useYelpData} }).then(function (results) {
            return results;
        });
    }; 
    // Service call for Zillow/BridgeInteractive parcels data
    serviceFactory.getParcelsData = function (street1, city, state, zip, street2) {
      return $http.get(serviceBase + 'api/propertyinsights/getParcelsData', { params: { Street1: street1, City: city, State: state, Zip: zip, Street2: street2 } }).then(function (results) {
        return results;
      });
    }; 
    // Service call for zillow zpid (require parameter for zillow apis)
    serviceFactory.getzpid = function (street1, city, state, zip, street2) {
      return $http.get(serviceBase + 'api/propertyinsights/getzpid', { params: { Street1: street1, City: city, State: state, Zip: zip, Street2: street2}}).then(function (results) {
        return results;
      });
    }; 

    // Assign Services
    serviceFactory.getStates = _getStates;
    serviceFactory.getStatesAndCounties = _getStatesAndCounties;
    serviceFactory.getStatesAndCountiesByZip = _getStatesAndCountiesByZip;
    serviceFactory.getStateAndCountyByZip = _getStateAndCountyByZip;
    serviceFactory.getGeoJson = _getGeoJson;
    serviceFactory.getGeoJsonById = _getGeoJsonById;
    serviceFactory.getApps = _getApps;

    return serviceFactory;

}]);