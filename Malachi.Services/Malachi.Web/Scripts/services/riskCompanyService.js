'use strict';
MALACHIAPP.factory('riskCompanyService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services
    var _getRiskCompany = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/RiskCompanies/GetRiskCompany', { params: { RiskCompanyId: riskCompanyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getRiskCompanies = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/RiskCompanies/GetRiskCompanies', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchRiskCompanies = function (name, pageNumber, display) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/RiskCompanies/SearchRiskCompanies', { params: { Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateRiskCompany = function (insurer) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/UpdateRiskCompany', { RiskCompany: insurer }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteRiskCompany = function (insurerId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/DeleteRiskCompany', { RiskCompanyId: insurerId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getPolicyRegisters = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/RiskCompanies/GetPolicyRegisters', { params: { RiskCompanyId: riskCompanyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updatePolicyRegister = function (mp) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/UpdatePolicyRegister', { PolicyRegister: mp }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deletePolicyRegister = function (mpId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/DeletePolicyRegister', { PolicyRegisterId: mpId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }
    var _getForms = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/RiskCompanies/GetForms', { params: { RiskCompanyId: riskCompanyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchForms = function (riskCompanyId, name, pageNumber, display) {
        return $http.get(serviceBase + 'api/RiskCompanies/SearchForms', { params: { RiskCompanyId: riskCompanyId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateForm = function (form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/UpdateForm', { Form: form }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteForm = function (formId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/RiskCompanies/DeleteForm', { FormId: formId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    // Assign Services
    serviceFactory.getRiskCompanies = _getRiskCompanies;
    serviceFactory.getRiskCompany = _getRiskCompany;
    serviceFactory.searchRiskCompanies = _searchRiskCompanies;
    serviceFactory.updateRiskCompany = _updateRiskCompany;
    serviceFactory.deleteRiskCompany = _deleteRiskCompany;
    serviceFactory.getPolicyRegisters = _getPolicyRegisters;
    serviceFactory.updatePolicyRegister = _updatePolicyRegister;
    serviceFactory.deletePolicyRegister = _deletePolicyRegister;
    serviceFactory.getForms = _getForms;
    serviceFactory.searchForms = _searchForms;
    serviceFactory.updateForm = _updateForm;
    serviceFactory.deleteForm = _deleteForm;

    return serviceFactory;

}]);