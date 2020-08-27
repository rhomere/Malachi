'use strict';
MALACHIAPP.factory('policyService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services
    serviceFactory.createPolicyVersionCreditEntry = function (policyId, coverage, policyVersionCreditEntry) {
        return $http.post(serviceBase + 'api/Policy/CreatePolicyVersionCreditEntry', { PolicyId: policyId, Coverage: coverage, CreditEntry: policyVersionCreditEntry }).then(function (results) {
            return results;
        });
    };

    serviceFactory.updateAssignedContracts = function (policyId, updatedAssignedContracts) {
        return $http.post(serviceBase + 'api/test/Policy/UpdateAssignedContracts', { PolicyId: policyId, UpdatedAssignedContracts: updatedAssignedContracts }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getApps = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetApps', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.getApp = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetApp', { params: { Id: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.getRetailAgencies = function (mgaId) {
        return $http.get(serviceBase + 'api/Policy/GetRetailAgencies', { params: { ManagingGeneralAgentId: mgaId }, cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getManagingGeneralAgents = function () {
        return $http.get(serviceBase + 'api/Policy/GetManagingGeneralAgents', { cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getAgencies = function (search, mgaId) {
        return $http.get(serviceBase + 'api/Policy/GetAgencies', { params: { Search: search, MgaId: mgaId }, cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getPolicies = function (search, filterType, pageNumber, display, quotedBy, agency, appId, searchBy) {
        return $http.get(serviceBase + 'api/Policy/GetPolicies', { params: { Search: search, FilterType: filterType, PageNumber: pageNumber, Display: display, QuotedBy: quotedBy, Agency: agency, AppId: appId, SearchBy: searchBy }, cache: false }).then(function (results) {
            return results;
        });
    };

    serviceFactory.renewalSearch = function (request) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/renewalSearch', request).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.newPolicy = function (appId, timeZoneOffsetInMinutes) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/NewPolicy', { AppId: appId, TimeZoneOffsetInMinutes: timeZoneOffsetInMinutes }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicyInfo = function (id, blockUi) {
        if (blockUi == null) blockUi = true;
        if (blockUi) Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyInfo', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicy = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicy', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.changePolicyVersion = function (id, versionNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        return $http.post(serviceBase + 'api/Policy/changePolicyVersion', { PolicyId: id, VersionNumber: versionNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // get all documents possible for download
    serviceFactory.getStoredDocuments = function (id) {
        return $http.get(serviceBase + 'api/Policy/GetStoredDocuments', { params: { PolicyId: id }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getUploadedDocumentList = function (id) {
        return $http.get(serviceBase + 'api/Policy/GetUploadedDocumentList', { params: { PolicyId: id }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getPoliciesMissingDocuments = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPoliciesMissingDocuments').then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getProductionInfo = function (reportType, reportFrom, reportTo) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetProductionInfo', { params: { ReportType: reportType, ReportFrom: reportFrom, ReportTo: reportTo } }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addPolicyNote = function (policyId, note) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddPolicyNote', { PolicyId: policyId, Note: note }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicyNotes = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyNotes', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addPolicyClaim = function (claim) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddPolicyClaim', { PolicyClaim: claim }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicyClaims = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyClaims', { params: { PolicyId: policyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.addPolicyEndorsementManuscript = function (endorsementManuscript) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddPolicyEndorsementManuscript', { PolicyEndorsementManuscript: endorsementManuscript }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicyEndorsementManuscripts = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyEndorsementManuscripts', { params: { PolicyId: policyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var riskCompanyCharacteristicResults = {};
    serviceFactory.getRiskCompanyCharacteristicValues = function (riskCompanyId, characteristic) {
        if (riskCompanyCharacteristicResults && riskCompanyCharacteristicResults[riskCompanyId]) {
            return new Promise(function (resolve) {
                resolve(riskCompanyCharacteristicResults[riskCompanyId]);
            });
        }
        return $http.get(serviceBase + 'api/Policy/GetRiskCompanyCharacteristicValues', { params: { RiskCompanyId: riskCompanyId, Characteristic: characteristic }, cache: false }).then(function (results) {
            riskCompanyCharacteristicResults[riskCompanyId] = results;
            return results;
        });
    }

    serviceFactory.getPolicyPremiumBreakdown = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyPremiumBreakdown', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getForms = function (id) {
        return $http.get(serviceBase + 'api/Policy/GetForms', { params: { PolicyId: id }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getEligibleForms = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetEligibleForms', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getInsured = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetInsured', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateInsured = function (id, params) {
        params.PolicyId = id;
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateInsured', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAgencyDetail = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetAgencyDetail', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getOffices = function (id, mgaId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetOffices', { params: { PolicyId: id, ManagingGeneralAgentId: mgaId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var getOfficesAndExecutivesResults = null;
    serviceFactory.getOfficesAndExecutives = function (id, mgaId, blockUi) {
        if (getOfficesAndExecutivesResults != null) {
            return new Promise(function (resolve) {
                resolve(getOfficesAndExecutivesResults);
            });
        }
        if (blockUi == null) blockUi = true;
        if (blockUi) Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetOfficesAndExecutives', { params: { PolicyId: id, ManagingGeneralAgentId: mgaId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            getOfficesAndExecutivesResults = results;
            return results;
        });
    }

    serviceFactory.getAccountExecutives = function (id, mgaId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetAccountExecutives', { params: { PolicyId: id, ManagingGeneralAgentId: mgaId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateAgencyContact = function (params) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateAgencyContact', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateOfficeAndExecutive = function (policy) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateOfficeAndExecutive', policy).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateSubmission = function (id, params) {
        params.PolicyId = id;
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateSubmission', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateSubmissionAndInsured = function (id, policy, coverages) {
        if (coverages == null) {
            coverages = [];
        }
        var params = {
            PolicyId: id,
            Policy: policy,
            Coverages: coverages
        };

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateSubmissionAndInsured', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updatePolicyTermToToday = function (id, term) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdatePolicyTermToToday', { PolicyId: id, PolicyTerm: term }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updatePolicyTerm = function (policyId, effective, expiration) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdatePolicyTerm', { PolicyId: policyId, Effective: effective, Expiration: expiration }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updatePolicyMgaSubmissionNumber = function (policyId, mgaSubmissionNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/updatePolicyMgaSubmissionNumber', { PolicyId: policyId, MgaSubmissionNumber: mgaSubmissionNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getLocations = function (id) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetLocations', { params: { PolicyId: id }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.newLocation = function (id, params) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/NewLocation', { PolicyId: id, Location: params }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getLocationNumber = function (id, params) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/GetLocationNumber', { PolicyId: id, Location: params }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.setInspectionLocations = function (id, locationProperties) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/SetInspectionLocations', { PolicyId: id, LocationProperties: locationProperties }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateCrimeScores = function (id, params) {
        return $http.post(serviceBase + 'api/Policy/UpdateCrimeScores', { PolicyId: id, Location: params }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateLocation = function (id, params) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateLocation', { PolicyId: id, Location: params }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.removeDeclineOverride = function (policyId, riskCompanyId, contractId, coverageId, group, reason, wind) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/removeDeclineOverride', { policyId: policyId, riskCompanyId: riskCompanyId, contractId: contractId, coverageId: coverageId, group: group, reason: reason, wind: wind }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addDeclineOverride = function (policyId, riskCompanyId, contractId, coverageId, group, reason, wind) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/addDeclineOverride', { policyId: policyId, riskCompanyId: riskCompanyId, contractId: contractId, coverageId: coverageId, group: group, reason: reason, wind: wind }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteLocation = function (id, params) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        params.PolicyId = id;
        return $http.post(serviceBase + 'api/Policy/DeleteLocation', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getDistanceToCoast = function (address, latitude, longitude) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetDistanceToCoast', { params: { Address: address, Latitude: latitude, Longitude: longitude }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // Get Location Details - Returns geographic details on the address
    serviceFactory.getLocationDetails = function (address) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetLocationDetails', { params: { address: address } }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getTerritoryCodes = function (stateCode, zip) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetTerritoryCodes', { params: { StateCode: stateCode, Zip: zip }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getZones = function (contractId, latitude, longitude) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetZones', { params: { ContractId: contractId, Latitude: latitude, Longitude: longitude }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getLiability = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetLiabilityLimits', { params: { PolicyId: policyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateLiability = function (policy, rate) {
        return $http.post(serviceBase + 'api/Policy/UpdateLiabilityLimits', { Policy: policy, RateClassCodes: rate }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getPolicyClassCodes = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetPolicyClassCodes', { params: { PolicyId: policyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updatePolicyClassCodeContract = function (policyId, riskCompanyId, contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/updatePolicyClassCodeContract', { PolicyId: policyId, RiskCompanyId: riskCompanyId, ContractId: contractId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.checkClassCodeEligibility = function (classCode) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/CheckClassCodeEligibility', { params: { ClassCode: classCode.Number, SubNumber: classCode.SubNumber }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.getLiabilityRiskCompanies = function (appId, policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Policy/GetLiabilityRiskCompanies', { params: { AppId: appId, PolicyId: policyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }



    serviceFactory.getClassCodeInfo = function (policyId, classCode, contractId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetClassCodeInfo', {
            params: { PolicyId: policyId, ContractId: contractId, ClassCodeId: classCode.Id, ClassCode: classCode.Number, SubNumber: classCode.SubNumber }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getSubClassCodes = function (policyId, classCode, contractId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetSubClassCodes', {
            params: {
                PolicyId: policyId, ContractId: contractId, ClassCode: classCode.Number, SubNumber: classCode.SubNumber
            }, cache: true
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getClassCodeInfoAndInput = function (policy, classCode, subNumber, contractId, riskCompanyId, classCodeId) {
        return $http.post(serviceBase + 'api/Policy/GetClassCodeInfoAndInput', {
            Policy: policy, ContractId: contractId, ClassCode: classCode.Number, SubNumber: subNumber, RiskCompanyId: riskCompanyId, ClassCodeId: classCodeId
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getRiskCompanies = function (policy) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/GetRiskCompanies', {
            AppId: policy.AppId,
            RiskCompanyId: policy.CurrentVersion.RiskCompanyId,
            Effective: policy.Effective,
            HomeStateCode: policy.HomeStateCode,
            CoverageIds: policy.CurrentVersion.Coverages.map(x => x.CoverageId),
            PolicyAttributes: policy.Attributes.map(x => x.Name)
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteClassCode = function (policy, classCodeId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteClassCode', {
            Policy: policy, ClassCodeId: classCodeId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.newClassCode = function (policy, contracts, locationNumber, code, subCode, description) {
        return $http.post(serviceBase + 'api/Policy/NewClassCode', {
            Policy: policy,
            Contracts: contracts,
            Description: description,
            ClassCode: {
                Number: code,
                SubNumber: subCode,
                LocationNumber: locationNumber
            }
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAppContracts = function (appId, effective, coverages, attributes, homeStateCode) {
        var coverageIds = coverages.map(function (v) { return v.CoverageId; });
        return $http.get(serviceBase + 'api/Policy/getAppContracts', {
            params: {
                AppId: appId,
                Effective: effective,
                CoverageIds: coverageIds,
                Attributes: attributes,
                HomeStateCode: homeStateCode
            }
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAllClassCodesForApp = function (policyId) {
        return $http.get(serviceBase + 'api/Policy/getAllClassCodesForApp', {
            params: {
                PolicyId: policyId
            }
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.rateClassCode = function (policy, classCode) {
        return $http.post(serviceBase + 'api/Policy/RateClassCode', {
            Policy: policy, ClassCode: classCode
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.rateClassCodeInputs = function (policy, classCodeRatingInputs, contractIds) {
        return $http.post(serviceBase + 'api/Policy/RateClassCodeInputs', {
            Policy: policy,
            ClassCodeRatingInputs: classCodeRatingInputs,
            ContractIds: contractIds
        }).then(function (results) {
            return results;
        });
    };

    serviceFactory.rateClassCodeInput = function (policy, classCodeRatingInput, contractId) {
        return $http.post(serviceBase + 'api/Policy/RateClassCodeInput', {
            Policy: policy,
            ClassCodeRatingInput: classCodeRatingInput,
            ContractId: contractId
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateClassCode = function (policyId, classCode) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateClassCode', {
            PolicyId: policyId, ClassCode: classCode
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getEligibileLiabilityContracts = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetEligibileLiabilityContracts', {
            params: {
                PolicyId: policyId
            }, cache: true
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getClassCodes = function (policyId, search) {
        return $http.get(serviceBase + 'api/Policy/GetClassCodes', {
            params: {
                PolicyId: policyId, Search: search
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAIClassCodes = function (policyId, search) {
        return $http.get(serviceBase + 'api/Policy/GetAIClassCodes', {
            params: {
                PolicyId: policyId, Search: search
            }, cache: false
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getSubClassCodes = function (policyId, contractId, classCode) {
        return $http.get(serviceBase + 'api/Policy/GetSubClassCodes', {
            params: {
                PolicyId: policyId, ContractId: contractId, ClassCode: classCode
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAllClassCodes = function (search) {
        return $http.get(serviceBase + 'api/Policy/GetAllClassCodes', {
            params: {
                Search: search
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }


    serviceFactory.getPropertyCharacteristics = function (appId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetPropertyCharacteristics', {
            params: {
                AppId: appId
            }, cache: true
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getProperty = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetPropertyCoverages', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.quoteFlood = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/QuoteFloodCoverage', {
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.quoteFloodEndorsement = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/QuoteEndorsementFloodCoverage', {
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPropertyCoverageInfo = function (locationId, isHomeowners) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetPropertyCoverageInfo', {
            params: {
                LocationId: locationId,
                IsHomeowners: isHomeowners
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.newProperty = function (policyId, locationId) {
        return $http.post(serviceBase + 'api/Policy/NewPropertyCoverage', {
            PolicyId: policyId, LocationId: locationId
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateProperty = function (policyId, property, requiresRate) {
        requiresRate = (typeof (requiresRate) === "boolean") ? requiresRate : true;
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdatePropertyCoverage', {
            PolicyId: policyId,
            Property: property,
            RequiresRate: requiresRate
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.copyStructure = function (locationId, propertyId, policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/CopyPropertyCoverage', {
            LocationId: locationId,
            PropertyId: propertyId,
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteProperty = function (policyId, propertyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeletePropertyCoverage', {
            PolicyId: policyId,
            PropertyId: propertyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.checkEligibility = function (policyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.post(serviceBase + 'api/Policy/CheckEligibility', {
            PolicyId: policyId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getEquipmentBreakdown = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/GetEquipmentBreakdown', {
            params: {
                PolicyId: policyId,
                RiskCompanyId: riskCompanyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateEquipmentBreakdown = function (policyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateEquipmentBreakdown', {
            PolicyId: policyId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateEquipmentBreakdownPremium = function (policyId, riskCompanyId, premium) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateEquipmentBreakdownPremium', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId,
            Premium: premium
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.rateEquipmentBreakdown = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/RateEquipmentBreakdown', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.getLiquorLiability = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/GetLiquorLiability', {
            params: {
                PolicyId: policyId,
                RiskCompanyId: riskCompanyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateLiquorLiability = function (policyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateLiquorLiability', {
            PolicyId: policyId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateLiquorLiabilityPremium = function (policyId, riskCompanyId, premium) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateLiquorLiabilityPremium', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId,
            Premium: premium
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.rateLiquorLiability = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/RateLiquorLiability', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getProfessionalLiability = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/GetProfessionalLiability', {
            params: {
                PolicyId: policyId,
                RiskCompanyId: riskCompanyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateProfessionalLiability = function (policyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateProfessionalLiability', {
            PolicyId: policyId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateProfessionalLiabilityPremium = function (policyId, riskCompanyId, premium) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/UpdateProfessionalLiabilityPremium', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId,
            Premium: premium
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.rateProfessionalLiability = function (policyId, riskCompanyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.get(serviceBase + 'api/Policy/RateProfessionalLiability', {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.rateProperty = function (policyId, riskCompanyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.post(serviceBase + 'api/Policy/RateProperty', {
            PolicyId: policyId,
            Coverage: coverage,
            RiskCompanyId: riskCompanyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.clearEligibility = function (policyId) {
        return $http.post(serviceBase + 'api/Policy/ClearEligibility', {
            PolicyId: policyId
        }).then(function (results) {
            return results;
        });
    }


    serviceFactory.updateContractMod = function (limits, assignedContractId, coverage) {
        Metronic.blockUI({ animate: true, overlayColor: 'none', zIndex: 9999999 });
        return $http.post(serviceBase + 'api/Policy/UpdateContractMod', {
            ContractLimits: limits,
            AssignedContractId: assignedContractId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateContractPremium = function (policyId, limits, assignedContractId, coverage) {
        Metronic.blockUI({ animate: true, overlayColor: 'none', zIndex: 9999999 });
        return $http.post(serviceBase + 'api/Policy/UpdateContractPremium', {
            PolicyId: policyId,
            ContractLimits: limits,
            AssignedContractId: assignedContractId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateEDPremium = function (policyId, premium) {
        Metronic.blockUI({ animate: true, overlayColor: 'none', zIndex: 9999999 });
        return $http.post(serviceBase + 'api/Policy/UpdateEDPremium', {
            PolicyId: policyId,
            Premium: premium
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateContractFinalRate = function (policyId, limits, assignedContractId, coverage) {
        Metronic.blockUI({ animate: true, overlayColor: 'none', zIndex: 9999999 });
        return $http.post(serviceBase + 'api/Policy/UpdateContractFinalRate', {
            PolicyId: policyId,
            ContractLimits: limits,
            AssignedContractId: assignedContractId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.adjustSplit = function (policyId, contractId, split, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AdjustSplit', {
            PolicyId: policyId, ContractId: contractId, Split: split, Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getEligibilityQuestions = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetEligibilityQuestions', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getContractDeclines = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetContractDeclines', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.adjustEligibility = function (policyId, questions) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AdjustEligibility', {
            PolicyId: policyId, EligibilityQuestions: questions
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.adjustRating = function (policyId, question, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AdjustRating', {
            PolicyId: policyId, RatingQuestion: question, Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.downloadRateSheet = function (policyId) {
        return $http.get(serviceBase + 'api/Policy/DownloadRateSheet', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            return results;
        });
    };

    serviceFactory.canDownloadPolicy = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(window.documentServiceBase + 'api/Document/CanDownloadPolicy', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.addCoverage = function (policyId, coverages) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddCoverage', {
            PolicyId: policyId,
            Coverages: coverages
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }
    serviceFactory.deleteCoverage = function (policyId, coverages) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteCoverage', {
            PolicyId: policyId,
            Coverages: coverages
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.addEDPCoverage = function (policyId, limit) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddEDPCoverage', {
            PolicyId: policyId,
            Limit: limit
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateEDPCoverage = function (coverageId, limit) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateEDPCoverage', {
            CoverageId: coverageId,
            Limit: limit
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addEQBCoverage = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddEQBCoverage', {
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addEQCoverage = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddEQCoverage', {
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addFloodCoverage = function (policyId, quoteId, optionNumber) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddFloodCoverage', {
            PolicyId: policyId,
            QuoteId: quoteId,
            OptionNumber: optionNumber
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.removeFloodCoverage = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/RemoveFloodCoverage', {
            PolicyId: policyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getMortgagees = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetMortgagees', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addMortgagee = function (policyId, mortgagee) {
        return $http.post(serviceBase + 'api/Policy/AddMortgagee', {
            PolicyId: policyId,
            Mortgagee: mortgagee,
            Properties: mortgagee.Properties
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateMortgagee = function (policyId, mortgagee) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateMortgagee', {
            PolicyId: policyId,
            Mortgagee: mortgagee
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteMortgagee = function (policyId, mortgageeId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteMortgagee', {
            PolicyId: policyId,
            MortgageeId: mortgageeId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getLossPayees = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetLossPayees', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addLossPayee = function (policyId, lossPayee) {
        return $http.post(serviceBase + 'api/Policy/AddLossPayee', {
            PolicyId: policyId,
            LossPayee: lossPayee,
            Properties: lossPayee.Properties
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateLossPayee = function (policyId, lossPayee) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateLossPayee', {
            PolicyId: policyId,
            LossPayee: lossPayee
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteLossPayee = function (policyId, lossPayeeId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteLossPayee', {
            PolicyId: policyId,
            LossPayeeId: lossPayeeId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getScheduledProperties = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetScheduledProperties', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addScheduledProperty = function (policyId, scheduledPropertyCoverage) {
        return $http.post(serviceBase + 'api/Policy/AddScheduledProperty', {
            PolicyId: policyId,
            ScheduledPropertyCoverage: scheduledPropertyCoverage,
            Properties: scheduledPropertyCoverage.Properties
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateScheduledProperty = function (policyId, scheduledPropertyCoverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateScheduledProperty', {
            PolicyId: policyId,
            ScheduledPropertyCoverage: scheduledPropertyCoverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteScheduledProperty = function (policyId, scheduledPropertyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteScheduledProperty', {
            PolicyId: policyId,
            ScheduledPropertyId: scheduledPropertyId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.getAdditionalStructures = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetAdditionalStructures', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addAdditionalStructure = function (additionalStructures) {
        return $http.post(serviceBase + 'api/Policy/AddAdditionalStructure', {
            AdditionalStructureCoverage: additionalStructures
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateAdditionalStructure = function (additionalStructure) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateAdditionalStructure', {
            AdditionalStructureCoverage: additionalStructure
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteAdditionalStructure = function (additionalStructureId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteAdditionalStructure', {
            AdditionalStructureId: additionalStructureId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindQuote = function (policyId, riskCompanyId, issue, submissionNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Issue: issue, ExternalSubmissionNumber: submissionNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.issueBinder = function (policyId, riskCompanyId, issue, submissionNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/IssueBinder', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Issue: issue, ExternalSubmissionNumber: submissionNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.payAndBindQuote = function (policyId, riskCompanyId, payment, issue) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/PayAndBindQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Payment: payment, Issue: issue }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.payQuote = function (policyId, riskCompanyId, payment, issue) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/payQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Payment: payment, Issue: issue }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.payAndIssueAndExportQuote = function (policyId, riskCompanyId, payment, issue) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/PayAndIssueAndExportQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Payment: payment, Issue: issue }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindAndIssueMortgageeQuote = function (policyId, riskCompanyId, authorizationCode) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindAndIssueMortgageeQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, AuthorizationCode: authorizationCode }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.completeQuote = function (policyId, riskCompanyId, paymentOption) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CompleteQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, PaymentOption: paymentOption }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.unbindPolicy = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UnbindPolicy', { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.submitForBindQuote = function (policyId, riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/SubmitForBindQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addForm = function (policyId, formId, riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddForm', { PolicyId: policyId, FormId: formId, RiskCompanyId: riskCompanyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateForm = function (policyId, form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateForm', { PolicyId: policyId, Form: form }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteForm = function (policyId, formId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/DeleteForm', { PolicyId: policyId, FormId: formId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addBackRemovedForm = function (policyId, formId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddBackRemovedForm', { PolicyId: policyId, FormId: formId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.attachFormToQuoteDocument = function (policyId, form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AttachFormToQuoteDocument', { PolicyId: policyId, Form: form }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getProtectiveSafeGuards = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetProtectiveSafeGuards', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addProtectiveSafeGuards = function (policyId, protectiveSafeGuards) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddProtectiveSafeGuards', {
            PolicyId: policyId,
            ProtectiveSafeGuards: protectiveSafeGuards
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addProtectiveSafeGuard = function (policyId, protectiveSafeGuard) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/AddProtectiveSafeGuard', {
            PolicyId: policyId,
            ProtectiveSafeGuard: protectiveSafeGuard,
            Properties: protectiveSafeGuard.Properties
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateProtectiveSafeGuard = function (policyId, protectiveSafeGuard) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateProtectiveSafeGuard', {
            PolicyId: policyId,
            ProtectiveSafeGuard: protectiveSafeGuard,
            Properties: protectiveSafeGuard.Properties
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteProtectiveSafeGuards = function (policyId, protectiveSafeGuardIds) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteProtectiveSafeGuards', {
            PolicyId: policyId,
            ProtectiveSafeGuardIds: protectiveSafeGuardIds
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteProtectiveSafeGuard = function (policyId, protectiveSafeGuardId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteProtectiveSafeGuard', {
            PolicyId: policyId,
            ProtectiveSafeGuardId: protectiveSafeGuardId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteProtectiveSafeGuards = function (policyId, protectiveSafeGuardIds) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeleteProtectiveSafeGuards', {
            PolicyId: policyId,
            ProtectiveSafeGuardIds: protectiveSafeGuardIds
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.getPropertyDeductibles = function (policyId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.get(serviceBase + 'api/Policy/GetPropertyDeductibles', {
            params: {
                PolicyId: policyId
            }, cache: false
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addPropertyDeductible = function (policyId, PropertyDeductibles) {
        return $http.post(serviceBase + 'api/Policy/AddPropertyDeductible', {
            PolicyId: policyId,
            PropertyDeductibles: PropertyDeductibles
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updatePropertyDeductibles = function (policyId, propertyId, PropertyDeductibles) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdatePropertyDeductibles', {
            PolicyId: policyId,
            PropertyId: propertyId,
            PropertyDeductibles: PropertyDeductibles
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updatePropertyDeductible = function (policyId, PropertyDeductible) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdatePropertyDeductible', {
            PolicyId: policyId,
            PropertyDeductible: PropertyDeductible
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deletePropertyDeductibles = function (policyId, propertyDeductibleIds) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/DeletePropertyDeductibles', {
            PolicyId: policyId,
            PropertyDeductibleIds: propertyDeductibleIds
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deletePropertyDeductible = function (policyId, PropertyDeductibleId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeletePropertyDeductible', {
            PolicyId: policyId,
            PropertyDeductibleId: PropertyDeductibleId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateAdditionalCoverages = function (policyId, PropertyAdditionalCoverages) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateAdditionalCoverages', {
            PolicyId: policyId,
            PropertyAdditionalCoverages: PropertyAdditionalCoverages
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateAdditionalCoverage = function (policyId, PropertyAdditionalCoverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateAdditionalCoverage', {
            PolicyId: policyId,
            PropertyAdditionalCoverage: PropertyAdditionalCoverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deletePropertyAdditionalCoverage = function (policyId, PropertyAdditionalCoverageId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeletePropertyAdditionalCoverage', {
            PolicyId: policyId,
            PropertyAdditionalCoverageId: PropertyAdditionalCoverageId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateSublimits = function (policyId, propertyId, PropertySublimits) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateSublimits', {
            PolicyId: policyId,
            PropertyId: propertyId,
            PropertySublimits: PropertySublimits
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateSublimit = function (policyId, PropertySublimit) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/UpdateSublimit', {
            PolicyId: policyId,
            PropertySublimit: PropertySublimit
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deletePropertySublimit = function (policyId, PropertySublimitId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/Policy/DeletePropertySublimit', {
            PolicyId: policyId,
            PropertySublimitId: PropertySublimitId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.updateInsured = function (id, params) {
        params.PolicyId = id;
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateInsured', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.checkTaxes = function (policyId, riskCompanyId) {
        return $http.post(serviceBase + 'api/Policy/CheckTaxes', { PolicyId: policyId, RiskCompanyId: riskCompanyId }).then(function (results) {
            return results;
        });
    }

    serviceFactory.refreshTaxes = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/RefreshTaxes', { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateFee = function (policyId, name, amount, isTexasFee) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateFee', { PolicyId: policyId, Name: name, Amount: amount, IsTexasFee: isTexasFee }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateFees = function (policyId, fees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateFees', { PolicyId: policyId, Fees: fees }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.toggleIgnoreMP = function (policyId, riskCompanyId, ignoreMP) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/ToggleIgnoreMP', { PolicyId: policyId, RiskCompanyId: riskCompanyId, IgnoreMP: ignoreMP }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateTax = function (policyId, name, amount) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateTax', { PolicyId: policyId, Name: name, Amount: amount }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.submitQuote = function (policyId, riskCompanyId, notes) {
        return $http.post(serviceBase + 'api/Policy/SubmitQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Notes: notes }).then(function (results) {
            return results;
        });
    }

    serviceFactory.importFromCarrier = function (policyNumber, riskCompany, aimSubmission) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/test/Policy/ImportPolicyFromCarrier', { PolicyNumber: policyNumber, RiskCompany: riskCompany, AimSubmission: aimSubmission }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.saveImportFromCarrier = function (policyNumber, riskCompany, aimSubmission, selectedAgency) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/test/Policy/SaveImportPolicyFromCarrier', { PolicyNumber: policyNumber, RiskCompany: riskCompany, AimSubmission: aimSubmission, SelectedAgency: selectedAgency }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.submitApprovedQuote = function (policyId, riskCompanyId, notes, externalApprovedBy) {
        return $http.post(serviceBase + 'api/Policy/SubmitApprovedQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Notes: notes, ExternalApprovedBy: externalApprovedBy }).then(function (results) {
            return results;
        });
    }

    serviceFactory.renew = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/Renew', { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.copyPolicy = function (policyId, coverages, submissionNumber, submissionInfo) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CopyPolicyToNewSubmission', {
            PolicyId: policyId,
            Coverages: coverages,
            AimSubmissionNumber: submissionNumber,
            AimSubmissionInfo: submissionInfo
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.splitPackageQuote = function (policyId) {
        return $http.get(serviceBase + 'api/Policy/SplitPackageQuote?strPolicyId=' + policyId).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.endorse = function (policyId, endorsementNumber, effective) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CreateGeneralEndorsement', { PolicyId: policyId, EndorsementNumber: endorsementNumber, EndorsementEffective: effective }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.createPolicyTermEndorsement = function (policyId, endorsementNumber, effective, expiration, policyTerm) {
        return $http.post(serviceBase + 'api/Policy/CreatePolicyTermEndorsement', { PolicyId: policyId, EndorsementNumber: endorsementNumber, EndorsementEffective: effective, EndorsementExpiration: expiration, EndorsementPolicyTerm: policyTerm }).then(function (results) {
            return results;
        });
    }

    serviceFactory.voidLastEndorsement = function (policyId) {
        return $http.post(serviceBase + 'api/Policy/VoidLastEndorsement', { PolicyId: policyId }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getGeneralEndorsementChangeRecord = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/GetGeneralEndorsementChangeRecord', { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateGeneralEndorsementRecordPremium = function (policyId, endorsementRecord, customFees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateGeneralEndorsementRecordPremium', { PolicyId: policyId, EndorsementRecord: endorsementRecord, CustomFees: customFees }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.saveGeneralEndorsement = function (policyId, endorsementRecord, customFees, payment) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/saveGeneralEndorsement', { PolicyId: policyId, EndorsementRecord: endorsementRecord, CustomFees: customFees, Payment: payment, IsDirectPayment: payment != null }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindGeneralEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsementRecord, customFees, isDirectPayment, payment, referralNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/bindGeneralEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, EndorsementRecord: endorsementRecord, CustomFees: customFees, Payment: payment, IsDirectPayment: isDirectPayment, ReferralNumber: referralNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.requestApprovalForEndorsement = function (policyId, endorsementRecord, customFees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/saveGeneralEndorsement', { PolicyId: policyId, EndorsementRecord: endorsementRecord, CustomFees: customFees, RequestApproval: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.approveEndorsement = function (policyId, endorsementRecord, customFees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/saveGeneralEndorsement', { PolicyId: policyId, EndorsementRecord: endorsementRecord, CustomFees: customFees, IsApproved: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.denyEndorsement = function (policyId, endorsementRecord, customFees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/saveGeneralEndorsement', { PolicyId: policyId, EndorsementRecord: endorsementRecord, CustomFees: customFees, IsDenied: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.payGeneralEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsementRecord, customFees, payment) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/PayGeneralEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, EndorsementRecord: endorsementRecord, CustomFees: customFees, Payment: payment, IsDirectPayment: payment != null }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteEndorsement = function (endorsementId) {
        return $http.post(serviceBase + 'api/Policy/DeleteEndorsement', { PolicyId: endorsementId }).then(function (results) {
            return results;
        });
    }

    serviceFactory.reinstatePolicy = function (endorsementId) {
        return $http.post(serviceBase + 'api/Policy/ReinstatePolicy', { PolicyId: endorsementId }).then(function (results) {
            return results;
        });
    }

    serviceFactory.calculateFeeEndorsement = function (policyId, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CalculateFeeEndorsement', { PolicyId: policyId, FeeEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.calculateCancellation = function (policyId, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CalculateCancellation', { PolicyId: policyId, CancellationEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.calculateExtension = function (policyId, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CalculateExtension', { PolicyId: policyId, ExtensionEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindExtensionEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindExtensionEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, ExtensionEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindCancellationEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindCancellationEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, CancellationEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindFeeEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindFeeEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, FeeEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.emailInsuredPortal = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/EmailInsuredPortal', { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getPolicyIdAndAppId = function (quoteNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/GetPolicyIdAndAppId', { QuoteNumber: quoteNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateFocusedRiskCompanyId = function (policyId, focusedRiskCompanyId, unblockUi) {
        if (unblockUi == null) unblockUi = false;
        var params = {
            PolicyId: policyId,
            FocusedRiskCompanyId: focusedRiskCompanyId
        }
        if (!unblockUi) Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateFocusedRiskCompanyId', params).then(function (results) {
            if (!unblockUi) Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateInspectionType = function (policyId, inspectionType) {
        var params = { PolicyId: policyId, InspectionType: inspectionType };
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/UpdateInspectionType', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateProposal = function (policyId, policy, fees, validate) {
        var params = {
            PolicyId: policyId,
            Policy: policy,
            Fees: fees,
            Validate: validate
        };

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/updateProposal', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.onQuoteSave = function (policyId, policy) {
        var params = {
            PolicyId: policyId,
            Policy: policy
        };

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/OnQuoteSave', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    serviceFactory.newAimSubmission = function (policyId) {
        var params = { PolicyId: policyId }

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/newAimSubmission', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAimSubmissionNumber = function (policyId) {
        var params = { PolicyId: policyId };

        return $http.get(serviceBase + 'api/Policy/getAimSubmissionNumber', { params: params, cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.newSubmission = function (appId, timeZoneOffsetInMinutes, coverages, policy) {
        var params = {
            AppId: appId,
            TimeZoneOffsetInMinutes: timeZoneOffsetInMinutes,
            Coverages: coverages,
            Policy: policy
        }
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/newSubmission', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.calculateTriaEndorsement = function (policyId, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/CalculateTriaEndorsement', { PolicyId: policyId, TriaEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.bindTriaEndorsement = function (policyId, emailToAgent, contactEmail, contactName, endorsement) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/BindTriaEndorsement', { PolicyId: policyId, EmailToAgent: emailToAgent, ContactEmail: contactEmail, ContactName: contactName, TriaEndorsement: endorsement }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.markNonRenewal = function (endorsementGroupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/MarkAsNonRenewal', { EndorsementGroupId: endorsementGroupId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.rescindNonRenewal = function (endorsementGroupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/RescindNonRenewal', { EndorsementGroupId: endorsementGroupId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateInlandMarine = function (policyId, riskCompanyId, contractorsEquipment, installationFloater, electronicData, accountsReceivable, valuablePapers, bailees) {
        return $http.post(serviceBase + 'api/Policy/UpdateInlandMarine', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, ContractorsEquipment: contractorsEquipment, InstallationFloater: installationFloater,
            ElectronicData: electronicData, AccountsReceivable: accountsReceivable, ValuablePapers: valuablePapers, Bailees: bailees
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.rateInlandMarine = function (policyId, riskCompanyId, contractorsEquipment, installationFloater, electronicData, accountsReceivable, valuablePapers, bailees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/RateInlandMarine', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, ContractorsEquipment: contractorsEquipment, InstallationFloater: installationFloater,
            ElectronicData: electronicData, AccountsReceivable: accountsReceivable, ValuablePapers: valuablePapers, Bailees: bailees
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineAccountsReceivable = function (policyId, riskCompanyId, accountsReceivable) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineAccountsReceivable', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, AccountsReceivable: accountsReceivable
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineContractorsEquipment = function (policyId, riskCompanyId, contractorsEquipment) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineContractorsEquipment', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, ContractorsEquipment: contractorsEquipment
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineInstallationFloater = function (policyId, riskCompanyId, installationFloater) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineInstallationFloater', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, InstallationFloater: installationFloater
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineElectronicData = function (policyId, riskCompanyId, electronicData) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineElectronicData', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, ElectronicData: electronicData
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineValuablePapers = function (policyId, riskCompanyId, valuablePapers) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineValuablePapers', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, ValuablePapers: valuablePapers
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.addInlandMarineBailees = function (policyId, riskCompanyId, bailees) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/AddInlandMarineBailees', {
            PolicyId: policyId, RiskCompanyId: riskCompanyId, Bailees: bailees
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getUploadedDocuments = function (policyId) {
        var params = { PolicyId: policyId };

        return $http.get(serviceBase + 'api/Policy/GetUploadedDocuments', {
            params: params,
            cache: false
        }).then(function (results) {
            return results;
        });
    };

    serviceFactory.uploadDocumentToBlob = function (policyId, document) {
        var params = { PolicyId: policyId, Document: document };

        return $http.post(serviceBase + 'api/Policy/UploadDocumentToBlob', params).then(function (results) {
            return results;
        });
    };

    serviceFactory.uploadDocumentsToBlob = function (policyId, documents) {
        var params = { PolicyId: policyId, Documents: documents };

        return $http.post(serviceBase + 'api/Policy/UploadDocumentsToBlob', params).then(function (results) {
            return results;
        });
    };

    serviceFactory.getElanyCoverageInfo = function () {
        return $http.get(serviceBase + 'api/Policy/GetElanyCoverageInfo', { cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.getElanyRiskAndCoverageCodes = function (policyId) {
        var params = { PolicyId: policyId };

        return $http.get(serviceBase + 'api/Elany/GetDefaultNyCoverageAndRiskCodes', { params: params, cache: true }).then(function (results) {
            return results;
        });
    };

    serviceFactory.emailQuoteDocToAgent = function (policyId, riskCompanyId, includeFinance) {
        var params = { PolicyId: policyId, RiskCompanyId: riskCompanyId, DownloadFinance: includeFinance };

        return $http.post(window.documentServiceBase + 'api/document/EmailQuoteDocument', params).then(function (results) {
            return results;
        });
    }

    serviceFactory.clearHelpByUnderwriter = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + "api/policy/ClearHelpByUnderwriter", { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.declineAgentRequestToBind = function (policyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + "api/policy/DeclineAgentRequestToBind", { PolicyId: policyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.releaseQuoteToAgent = function (policyId) {
        var params = { PolicyId: policyId };
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/policy/ReleaseQuoteToAgent', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.emailPolicyDocument = function (policyId, riskCompanyId, documentTypes, downloadFinance, to, cc, replyTo, subject, body, attachments) {
        var params = {
            PolicyId: policyId,
            RiskCompanyId: riskCompanyId,
            DocumentTypes: documentTypes,
            DownloadFinance: downloadFinance,
            To: to,
            Cc: cc,
            ReplyTo: replyTo,
            Subject: subject,
            Body: body,
            Attachments: attachments
        };

        return $http.post(window.documentServiceBase + 'api/document/EmailPolicyDocument', params).then(function (results) {
            return results;
        });
    }

    serviceFactory.isSubmissionBound = function (submissionNumber) {
        var params = { SubmissionNumber: submissionNumber };
        return $http.get(serviceBase + 'api/Policy/IsSubmissionBound', { params: params, cache: true });
    };

	serviceFactory.newClaim = function (id, params) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Policy/NewClaim', { PolicyId: id, Claim: params }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

	serviceFactory.deleteClaim = function (id, params) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		params.PolicyId = id;
		return $http.post(serviceBase + 'api/Policy/DeleteClaim', params).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

	serviceFactory.updateClaim = function (id, params) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Policy/UpdateClaim', { PolicyId: id, Claim: params }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

	serviceFactory.updateAnyLossesInFiveYears = function (id, value) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Policy/UpdateAnyLossesInFiveYears', { PolicyId: id, AnyLossesInFiveYears: value}).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

    return serviceFactory;
}]);