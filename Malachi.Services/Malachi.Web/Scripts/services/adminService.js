'use strict';
MALACHIAPP.factory('adminService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services
    var _getSubmits = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Admin/GetSubmits', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchSubmits = function (name, filter, pageNumber, display) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Admin/SearchSubmits', { params: { Name: name, Filter: filter, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateSubmit = function (submitId, approved, carrierNotes) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Admin/UpdateSubmit', { SubmitId: submitId, Approved: approved, CarrierNotes: carrierNotes }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    //using the delete fuction already build in MALACHI
    var _deleteSubmit = function (submitId, approved, carrierNotes) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Admin/DeleteSubmit', { SubmitId: submitId}).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getNumberOfUnreadSubmits = function () {
        return $http.get(serviceBase + 'api/Admin/GetNumberOfUnreadSubmits', { cache: false }).then(function (results) {
            return results;
        });
    }

    var _getTeamStatistics = function (date) {
        return $http.post(serviceBase + 'api/Admin/GetTeamStatistics', { Date: date }).then(function (results) {
            return results;
        });
    };

    var _getRiskCompanyProduction = function () {
        return $http.post(serviceBase + 'api/Admin/GetRiskCompanyProduction').then(function (results) {
            return results;
        });
    };

    serviceFactory.getAgentRequests = function (requestType, pageIndex, itemsPerPage, searchString, isSearching) {
        var params = {
            RequestType: requestType,
            PageIndex: pageIndex,
            ItemsPerPage: itemsPerPage,
            SearchString: searchString,
            IsSearching: isSearching
        };

        return $http.post(serviceBase + "api/Admin/GetAgentRequests", params).then(function (result) {
            return result;
        });
    }

    serviceFactory.getZones = function () {
        return $http.post(serviceBase + 'api/Admin/getZones').then(function (results) {
            return results;
        });
    };

    serviceFactory.getSubmissionReason = function (policyId, riskCompanyId) {
        return $http.get(serviceBase + 'api/Admin/GetSubmissionReason', {
            params: {
                PolicyId: policyId, RiskCompanyId: riskCompanyId
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    // Assign Services
    serviceFactory.getSubmits = _getSubmits;
    serviceFactory.searchSubmits = _searchSubmits;
    serviceFactory.updateSubmit = _updateSubmit;
    serviceFactory.deleteSubmit = _deleteSubmit;
    serviceFactory.getNumberOfUnreadSubmits = _getNumberOfUnreadSubmits;
    serviceFactory.getTeamStatistics = _getTeamStatistics;
    serviceFactory.getRiskCompanyProduction = _getRiskCompanyProduction;
    return serviceFactory;

}]);