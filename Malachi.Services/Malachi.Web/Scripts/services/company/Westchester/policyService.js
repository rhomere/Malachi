'use strict';
MALACHIAPP.factory('test_policyService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Assign Services
    serviceFactory.getAgencies = function (search, effective, stateCode) {
        return $http.get(serviceBase + 'api/test/policy/GetAgencies', {
            params: {
                Search: search,
                Effective: effective,
                StateCode: stateCode
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    //serviceFactory.getLegacyBrokers = function () {
    //    Metronic.blockUI({
    //        animate: true, overlayColor: 'none', zIndex: 9999999
    //    });
    //    return $http.get(serviceBase + 'api/test/policy/GetLegacyBrokers').then(function (results) {
    //        Metronic.unblockUI();
    //        return results;
    //    });
    //}

    serviceFactory.getSubmissions = function (search) {
        return $http.get(serviceBase + 'api/test/policy/getSubmissions', {
            params: {
                Search: search
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getExternalSubmission = function (submissionNumber) {
        return $http.get(serviceBase + 'api/test/policy/getExternalSubmission', {
            params: {
                submissionNumber: submissionNumber
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.importFromAIM = function (submissionNumber, appId) {
        return $http.get(serviceBase + 'api/test/policy/importFromAIM', {
            params: {
                submissionNumber: submissionNumber,
                appId: appId
            }, cache: true
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateQuestionReviewConfirmation = function (policyId, riskCompanyIds) {
        Metronic.blockUI({ animate: true, overlayColor: 'none', zIndex: 9999999 });
        return $http.post(serviceBase + 'api/test/Policy/UpdateQuestionReviewConfirmation', {
            PolicyId: policyId,
            ReviewedRiskCompanyIds: riskCompanyIds
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.checkCommercialEligibility = function (policyId, coverage) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none', zIndex: 9999999
        });
        return $http.post(serviceBase + 'api/test/Policy/CheckCommercialEligibility', {
            PolicyId: policyId,
            Coverage: coverage
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteClassCode = function (policy, classCodeId) {
        Metronic.blockUI({
            animate: true, overlayColor: 'none'
        });
        return $http.post(serviceBase + 'api/test/Policy/DeleteClassCode', {
            Policy: policy, ClassCodeId: classCodeId
        }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.newClassCode = function (policy, contracts, locationNumber, code, subCode, description) {
        return $http.post(serviceBase + 'api/test/Policy/NewClassCode', {
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

    serviceFactory.copyClassCode = function (policy, locations, code) {
        return $http.post(serviceBase + 'api/test/Policy/CopyPolicyClassCode',
            {
                Policy: policy,
                Locations: locations,
                ClassCode: code
            }).then(function (results) {
                return results;
            });
    }

    serviceFactory.updateClassCode = function (policy, classCode, triggerRate) {
        return $http.post(serviceBase + 'api/test/Policy/UpdateClassCode', {
            Policy: policy, ClassCode: classCode, TriggerRate: triggerRate
        }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateLiability = function (policy, rate) {
        return $http.post(serviceBase + 'api/test/Policy/UpdateLiabilityLimits', { Policy: policy, RateClassCodes: rate }).then(function (results) {
            return results;
        });
    }

    serviceFactory.bindCCEEndorsementSetup = function (policyId, contractSplits, emailToAgent) {
        emailToAgent = false;
        var params = {
            PolicyId: policyId,
            ContractSplits: contractSplits,
            EmailToAgent: emailToAgent
        }
        return $http.post(serviceBase + 'api/test/Policy/BindCCEEndorsement', params).then(function (results) {
            return results;
        });
    };

  serviceFactory.bindCCELiabilityEndorsementSetup = function (policyId, contractSplits, emailToAgent) {
    emailToAgent = false;
    var params = {
      PolicyId: policyId,
      ContractSplits: contractSplits,
      EmailToAgent: emailToAgent
    }
    return $http.post(serviceBase + 'api/test/Policy/BindCCELiabilityEndorsement', params).then(function (results) {
      return results;
    });
  };

  serviceFactory.getCCEEndorsementSetup = function (policyId, appId, coverages) {
        var params = {
            PolicyId: policyId,
            AppId: appId,
            Coverages: coverages
        }
        return $http.post(serviceBase + 'api/test/Policy/GetCCEEndorsementSetup', params).then(function (results) {
            return results;
        });
    };

    serviceFactory.getContractsByRiskCompany = function (appId, riskCompanyId, policyEffective, coverages) {
        var params = {
            AppId: appId,
            RiskCompanyId: riskCompanyId,
            PolicyEffective: policyEffective,
            Coverages: coverages
        }
        return $http.post(serviceBase + 'api/test/Policy/GetContractsByRiskCompany', params).then(function (results) {
            return results;
        });
    };

    serviceFactory.getPropertyContractsByRiskCompany = function (appId, firstPropertyId, riskCompanyId, policyEffective, coverage) {
        if (!coverage) coverage = 'Property';
        return $http.post(
            serviceBase + 'api/test/Policy/GetPropertyContractsByRiskCompany', {
                AppId: appId, FirstPropertyId:
                    firstPropertyId, RiskCompanyId: riskCompanyId, PolicyEffective: policyEffective, Coverage: coverage
            }).then(function (results) {
                return results;
            });
    };

    serviceFactory.updateAssignedContracts = function (policyId, updatedAssignedContracts) {
        return $http.post(serviceBase + 'api/test/Policy/UpdateAssignedContracts', { PolicyId: policyId, UpdatedAssignedContracts: updatedAssignedContracts }).then(function (results) {
            return results;
        });
    };

    serviceFactory.bindQuote = function (policyId, riskCompanyId, issue, submissionNumber, coverageCodes, riskCodes) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
      return $http.post(serviceBase + 'api/test/Policy/BindQuote', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Issue: issue, ExternalSubmissionNumber: submissionNumber, CoverageCodes: coverageCodes, RiskCodes: riskCodes }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.issueBinder = function (policyId, riskCompanyId, issue, submissionNumber) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/test/Policy/IssueBinder', { PolicyId: policyId, RiskCompanyId: riskCompanyId, Issue: issue, ExternalSubmissionNumber: submissionNumber }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.renewalSearch = function (request) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Policy/renewalSearch', request).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.confirmRenewal = function (policyId, effective, renewalOf, riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/test/policy/ConfirmRenewal', { PolicyId: policyId, Effective: effective, RenewalOf: renewalOf, RiskCompanyId: riskCompanyId }).then(function (result) {
            Metronic.unblockUI();
            return result;
        });
    }

	serviceFactory.newClaim = function (id, params) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Policy/NewClaim', { PolicyId: id, Claim: params }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}
    return serviceFactory;
}]);