'use strict';
MALACHIAPP.factory('insurerService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

  var serviceBase = ngAuthSettings.apiServiceBaseUri;

  var serviceFactory = {};

  // Services
  var _getInsurers = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.get(serviceBase + 'api/Insurer/GetInsurers', { cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _searchInsurers = function (name, pageNumber, display) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.get(serviceBase + 'api/Insurer/SearchInsurers', { params: { Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _updateInsurer = function (insurer) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/UpdateInsurer', { Insurer: insurer }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _deleteInsurer = function (insurerId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/DeleteInsurer', { InsurerId: insurerId }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }


  var _getZoneGroups = function (insurerId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.get(serviceBase + 'api/Insurer/GetZoneGroups', { params: { InsurerId: insurerId }, cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _getAllZoneGroups = function (insurerId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.get(serviceBase + 'api/Insurer/GetAllZoneGroups', { cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _newZoneGroup = function (insurerId, name, enabled) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/NewZoneGroup', { InsurerId: insurerId, Name: name, Enabled: enabled }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _newZoneGroup = function (insurerId, name, enabled) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/NewZoneGroup', { InsurerId: insurerId, Name: name, Enabled: enabled }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _updateZoneGroup = function (zoneGroup) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/UpdateZoneGroup', zoneGroup).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }



  var _saveZoneBoundry = function (contractId, zone) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Contracts/SaveZoneBoundry', { ContractId: contractId, Zone: zone }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _getZones = function (zoneGroupId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.get(serviceBase + 'api/Insurer/GetZones', { params: { ZoneGroupId: zoneGroupId }, cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _saveZone = function (zoneGroupId, zone) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/SaveZone', { ZoneGroupId: zoneGroupId, Zone: zone }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  var _deleteZone = function (zoneId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Insurer/DeleteZone', { ZoneId: zoneId }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }


  serviceFactory.deleteZoneGroup = function (zoneGroupId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/insurer/deleteZoneGroup', { Id: zoneGroupId }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  // Assign Services
  serviceFactory.getInsurers = _getInsurers;
  serviceFactory.searchInsurers = _searchInsurers;
  serviceFactory.updateInsurer = _updateInsurer;
  serviceFactory.deleteInsurer = _deleteInsurer;
  serviceFactory.getZones = _getZones;
  serviceFactory.saveZone = _saveZone;
  serviceFactory.deleteZone = _deleteZone;
  serviceFactory.getZoneGroups = _getZoneGroups;
  serviceFactory.getAllZoneGroups = _getAllZoneGroups;
  serviceFactory.newZoneGroup = _newZoneGroup;
  serviceFactory.newZoneGroup = _newZoneGroup;
  serviceFactory.updateZoneGroup = _updateZoneGroup;
  serviceFactory.saveZoneBoundry = _saveZoneBoundry;

  return serviceFactory;

}]);