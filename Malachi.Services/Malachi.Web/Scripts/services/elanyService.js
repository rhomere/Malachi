'use strict';
MALACHIAPP.factory('elanyService', ['$http', 'ngAuthSettings', function($http, ngAuthSettings) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    serviceFactory.getCompanies = function() {
        return $http.get(serviceBase + 'api/Elany/GetCompanies', {cache: true})
            .then(function (results) { return results; });
    };

    serviceFactory.sign = function(affidavitC) {
        return $http.post(serviceBase + 'api/Elany/Sign', affidavitC)
            .then(function (results) { return results; });
    };

    serviceFactory.getAffidavitCCompanies = function(policyId) {
        return $http.get(serviceBase + 'api/Elany/GetAffidavitCCompanies?policyId=' + policyId)
            .then(function (results) { return results; });
    };

    serviceFactory.isSigned = function(policyId) {
        return $http.get(serviceBase + 'api/Elany/IsSigned?policyId=' + policyId)
            .then(function(results) { return results; });
    };

    serviceFactory.getLicensedAgentInfo = function(licenseNumber) {
        return $http.get(serviceBase + 'api/Elany/GetLicensedAgentInfo?licenseNumber=' + licenseNumber)
            .then(function(results) { return results; });
    };

    return serviceFactory;
}]);