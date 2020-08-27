'use strict';

MALACHIAPP.factory('guidelinesService', function ($http, ngAuthSettings) {

  var serviceBase = ngAuthSettings.apiServiceBaseUri;
  var serviceFactory = {};

  serviceFactory.getNodeChildren = function (node) {
    return $http.get(serviceBase + 'api/guidelines/GetNodeChildren', {
      params: {
      }, cache: true
    }).then(function (results) {
      return results;
    });
  }

  serviceFactory.getRootNodes = function (waitForContainerToUpdate) {
    return $http.post(serviceBase + 'api/guidelines/GetRootNodes', {
      Wait: waitForContainerToUpdate
    }).then(function (results) {
      return results;
    });
  }

  serviceFactory.AddNode = function (data, directory, fileName) {
    return $http.post(serviceBase + 'api/guidelines/AddNode', {
        Bytes: data,
        Directory: directory,
        FileName: fileName
    }).then(function (results) {
      return results;
    });
  }

  serviceFactory.DeleteNode = function (directory, fileName) {
    return $http.post(serviceBase + 'api/guidelines/DeleteNode', {
      Directory: directory,
      FileName: fileName
    }).then(function (results) {
      return results;
    });
  }

  return serviceFactory;
});