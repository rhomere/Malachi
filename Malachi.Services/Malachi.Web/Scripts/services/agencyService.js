'use strict';
MALACHIAPP.factory('agencyService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {
  var serviceBase = ngAuthSettings.apiServiceBaseUri;
  var serviceFactory = {};

  serviceFactory.getUnderwriterAgencies = function (underwriterId) {
    return $http.get(serviceBase + 'api/Agency/GetUnderwriterAgencies', { params: { underwriterId: underwriterId }, cache: false }).then(function (results) {
      return results;
    });
  };

  serviceFactory.getAgencyCommission = function (agencyId, appId) {
    return $http.get(serviceBase + 'api/Agency/GetAgencyCommission', { params: { agencyId: agencyId, appId: appId }, cache: false }).then(function (results) {
      return results;
    });
  };

  serviceFactory.getAgencyLicenses = function (agencyId, appId, stateCode, effectiveDate) {
    return $http.get(serviceBase + 'api/Agency/GetAgencyLicenses', { params: { agencyId: agencyId, appId: appId, stateCode: stateCode, effectiveDate: effectiveDate }, cache: false }).then(function (results) {
      return results;
    });
  };

  serviceFactory.getAgencyDetails = function (policyId) {
    return $http.get(serviceBase + 'api/Agency/GetAgencyDetails', { params: { policyId: policyId }, cache: false }).then(function (results) {
      return results;
    });
  };

  serviceFactory.getAgencyContacts = function (policyId, agencyId) {
    return $http.get(serviceBase + 'api/Agency/GetAgencyContacts', { params: { policyId: policyId, agencyId: agencyId }, cache: false }).then(function (results) {
      return results;
    });
  };

  return serviceFactory;
}]);