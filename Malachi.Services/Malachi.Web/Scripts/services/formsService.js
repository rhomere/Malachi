'use strict';
MALACHIAPP.factory('formsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services


    var _getForms = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Forms/GetForms', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _canDownloadForm = function (formId) {
        return $http.get(serviceBase + 'api/Forms/CanDownloadForm', {
            params: {
                FormId: formId
            }, cache: false
        }).then(function (results) {
            return results;
        });
    };

    var _searchForms = function (name, pageNumber, display) {
        //Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Forms/SearchForms', { params: { Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            //Metronic.unblockUI();
            return results;
        });
    }

    var _updateForm = function (form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Forms/UpdateForm', { Form: form }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteForm = function (formId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Forms/DeleteForm', { FormId: formId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // Assign Services
    serviceFactory.getForms = _getForms;
    serviceFactory.searchForms = _searchForms;
    serviceFactory.updateForm = _updateForm;
    serviceFactory.deleteForm = _deleteForm;
    serviceFactory.canDownloadForm = _canDownloadForm;

    return serviceFactory;

}]);