'use strict';
MALACHIAPP.factory('contractService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services

    var _getContractsWithRateSheets = function () {
        return $http.get(serviceBase + 'api/Contracts/GetContractsWithRateSheets', { cache: false }).then(function (results) {
            return results;
        });
    }

    var _getLimits = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetLimits', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getAllContracts = function (dontValidateSyndicates) {
        dontValidateSyndicates = dontValidateSyndicates || false;
        return $http.get(serviceBase + 'api/Contracts/getAllContracts', { params: { dontValidateSyndicates: dontValidateSyndicates }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _searchContracts = function (name, pageNumber, display, status, appId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/SearchContracts', { params: { Name: name, PageNumber: pageNumber, Display: display, Status: status, AppId: appId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchRateSheets = function (name, contractId) {
        return $http.get(serviceBase + 'api/Contracts/SearchRateSheets', { params: { Name: name, ContractId: contractId }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _recacheContract = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/recacheContract', { ContractId: contractId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _copy = function (contractId, insurerId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/CopyContract', { ContractId: contractId, InsurerId: insurerId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getContractsByRiskCompany = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContractsByRiskCompany', { cache: false, params: { RiskCompanyId: riskCompanyId } }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getContracts = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContracts', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getContract = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContract', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateContract = function (contract) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContract', { Contract: contract }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateContractCoverages = function (contractId, coverages) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContractCoverages', { ContractId: contractId, Coverages: coverages }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteContract = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteContract', { ContractId: contractId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getZones = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetZones', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getCharacteristics = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetCharacteristics', { cache: true }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getRatesheets = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetRatesheets', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getRateSheet = function (ratesheetId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetRateSheet', { params: { RatesheetId: ratesheetId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _saveRateSheet = function (contractId, ratesheet, rateSheetZones) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/SaveRateSheet', { ContractId: contractId, RateSheet: ratesheet, RateSheetZones: rateSheetZones }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _saveRateSheetRate = function (tableId, rate) {
        return $http.post(serviceBase + 'api/Contracts/SaveRateSheetRate', { TableId: tableId, Rate: rate }).then(function (results) {
            return results;
        });
    }

    var _deleteRateSheetRate = function (rateId) {
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetRate', { RateId: rateId }).then(function (results) {
            return results;
        });
    }


    var _newRateSheet = function (contractId, name) {
        return $http.post(serviceBase + 'api/Contracts/NewRateSheet', { ContractId: contractId, Name: name }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheet = function (rateSheet) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheet', { RateSheet: rateSheet }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetName = function (rateSheetId, name) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetName', { RateSheetId: rateSheetId, Name: name }).then(function (results) {
            return results;
        });
    }


    var _newRateSheetConditionRateGroup = function (ratesheetId, group) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetConditionRateGroup', { RatesheetId: ratesheetId, Group: group }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _newRateSheetExclusionGroup = function (ratesheetId, group) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetExclusionGroup', { RatesheetId: ratesheetId, Group: group }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _newRateSheetTableConditionGroup = function (tableId, group) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetTableConditionGroup', { TableId: tableId, Group: group }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _newRateSheetConditionRateCondition = function (groupId, condition) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetConditionRateCondition', { GroupId: groupId, Condition: condition }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _newRateSheetExclusion = function (groupId, condition) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetExclusion', { GroupId: groupId, Condition: condition }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _newRateSheetTableCondition = function (groupId, condition) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetTableCondition', { GroupId: groupId, Condition: condition }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteRateSheet = function (rateSheetId) {
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheet', { RateSheetId: rateSheetId }).then(function (results) {
            return results;
        });
    }


    var _deleteRateSheetConditionRateGroup = function (groupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetConditionRateGroup', { GroupId: groupId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _deleteRateSheetExclusionGroup = function (groupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetExclusionGroup', { GroupId: groupId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _deleteRateSheetTableConditionGroup = function (groupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetTableConditionGroup', { GroupId: groupId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteRateSheetConditionRate = function (conditionId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetConditionRate', { ConditionId: conditionId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteRateSheetExclusion = function (conditionId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetExclusion', { ConditionId: conditionId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _deleteRateSheetTableCondition = function (conditionId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetTableCondition', { ConditionId: conditionId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateRateSheetConditionRateGroup = function (group) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetConditionRateGroup', { Group: group }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetExclusionGroup = function (group) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetExclusionGroup', { Group: group }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetTableConditionGroup = function (group) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetTableConditionGroup', { Group: group }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetConditionRate = function (condition) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetConditionRate', { Condition: condition }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetExclusion = function (condition) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetExclusion', { Condition: condition }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetTableCondition = function (condition) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetTableCondition', { Condition: condition }).then(function (results) {
            return results;
        });
    }

    var _copyRateSheetConditionsTo = function (rateSheetId, copyToId) {
        return $http.post(serviceBase + 'api/Contracts/CopyRateSheetConditionsTo', { CopyFromId: rateSheetId, CopyToId: copyToId }).then(function (results) {
            return results;
        });
    }
    var _copyRateSheetExclusionsTo = function (rateSheetId, copyToId) {
        return $http.post(serviceBase + 'api/Contracts/CopyRateSheetExclusionsTo', { CopyFromId: rateSheetId, CopyToId: copyToId }).then(function (results) {
            return results;
        });
    }

    var _copyRateSheetConditionTo = function (rateSheetId, copyToId, groupId) {
        return $http.post(serviceBase + 'api/Contracts/CopyRateSheetConditionTo', { CopyFromId: rateSheetId, CopyToId: copyToId, GroupId: groupId }).then(function (results) {
            return results;
        });
    }

    var _copyRateSheetExclusionTo = function (rateSheetId, copyToId, groupId) {
        return $http.post(serviceBase + 'api/Contracts/CopyRateSheetExclusionTo', { CopyFromId: rateSheetId, CopyToId: copyToId, GroupId: groupId }).then(function (results) {
            return results;
        });
    }

    var _copyRateSheetTableTo = function (rateSheetId, copyToId, tableId) {
        return $http.post(serviceBase + 'api/Contracts/CopyRateSheetTableTo', { CopyFromId: rateSheetId, CopyToId: copyToId, TableId: tableId }).then(function (results) {
            return results;
        });
    }

    var _newRateSheetTable = function (rateSheetId, table) {
        return $http.post(serviceBase + 'api/Contracts/NewRateSheetTable', { RateSheetId: rateSheetId, Table: table }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetTable = function (table) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetTable', { Table: table }).then(function (results) {
            return results;
        });
    }

    var _deleteRateSheetTable = function (tableId) {
        return $http.post(serviceBase + 'api/Contracts/DeleteRateSheetTable', { TableId: tableId }).then(function (results) {
            return results;
        });
    }

    var _updateRateSheetZones = function (rateSheetId, rateSheetZones) {
        return $http.post(serviceBase + 'api/Contracts/UpdateRateSheetZones', { RateSheetId: rateSheetId, RateSheetZones: rateSheetZones }).then(function (results) {
            return results;
        });
    }

    var _getEligibilityQuestions = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetEligibilityQuestions', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchEligibilityQuestions = function (contractId, name, pageNumber, display) {
        return $http.get(serviceBase + 'api/Contracts/SearchEligibilityQuestions', { params: { ContractId: contractId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateEligibilityQuestion = function (eligibilityQuestion) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateEligibilityQuestion', { EligibilityQuestion: eligibilityQuestion }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var copyEligibilityQuestion = function (eligibilityQuestionId, fromContractId, toContractId) {
        var params = {
            EligibilityQuestionId: eligibilityQuestionId,
            FromContractId: fromContractId,
            ToContractId: toContractId
        }
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/CopyEligibilityQuestion', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteEligibilityQuestion = function (eligibilityId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteEligibilityQuestion', { EligibilityQuestionId: eligibilityId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getEligibilities = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetEligibilities', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchEligibilities = function (contractId, name, pageNumber, display) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/SearchEligibilities', { params: { ContractId: contractId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _copyEligibilityConditionGroup = function (conditionGroupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/CopyEligibilityConditionGroup', { params: { conditionGroupId: conditionGroupId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateEligibility = function (eligibilityQuestion) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateEligibility', { Eligibility: eligibilityQuestion }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var copyEligibility = function (eligibilityId, fromContractId, toContractId) {
        var params = {
            EligibilityId: eligibilityId,
            FromContractId: fromContractId,
            ToContractId: toContractId
        }
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/CopyEligibility', params).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteEligibility = function (eligibilityId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteEligibility', { EligibilityId: eligibilityId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getContractNotes = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContractNotes', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateContractNote = function (contractNote) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContractNote', { ContractNote: contractNote }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteContractNote = function (eligibilityId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteContractNote', { ContractNoteId: eligibilityId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getClassCodes = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContractClassCodes', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchContractClassCodes = function (contractId, codeNumber, pageNumber, display) {
        return $http.get(serviceBase + 'api/Contracts/SearchContractClassCode', { params: { ContractId: contractId, CodeNumber: codeNumber, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateClassCode = function (classcode) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContractClassCode', { ClassCode: classcode }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteClassCode = function (classcodeId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteContractClassCode', { ClassCodeId: classcodeId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getContractCommissions = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContractCommissions', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchContractCommissions = function (contractId, name, pageNumber, display) {
        return $http.get(serviceBase + 'api/Contracts/SearchContractCommissions', { params: { ContractId: contractId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateContractCommission = function (contractCommission) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContractCommission', { ContractCommission: contractCommission }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteContractCommission = function (eligibilityId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteContractCommission', { ContractCommissionId: eligibilityId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getContractTotalInsuredValues = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetContractTotalInsuredValues', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchContractTotalInsuredValues = function (contractId, name, pageNumber, display) {
        return $http.get(serviceBase + 'api/Contracts/SearchContractTotalInsuredValues', { params: { ContractId: contractId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateContractTotalInsuredValue = function (contractTotalInsuredValue) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateContractTotalInsuredValue', { ContractTotalInsuredValue: contractTotalInsuredValue }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteContractTotalInsuredValue = function (eligibilityId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteContractTotalInsuredValue', { ContractTotalInsuredValueId: eligibilityId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    var _getMinimumPremiums = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetMinimumPremiums', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _updateMinimumPremium = function (mp) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateMinimumPremium', { MinimumPremium: mp }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteMinimumPremium = function (mpId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteMinimumPremium', { MinimumPremiumId: mpId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _getRatingQuestions = function (contractId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Contracts/GetRatingQuestions', { params: { ContractId: contractId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _searchRatingQuestions = function (contractId, name, pageNumber, display) {
        return $http.get(serviceBase + 'api/Contracts/SearchRatingQuestions', { params: { ContractId: contractId, Name: name, PageNumber: pageNumber, Display: display }, cache: false }).then(function (results) {
            return results;
        });
    }

    var _updateRatingQuestion = function (ratingQuestion) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/UpdateRatingQuestion', { RatingQuestion: ratingQuestion }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    var _deleteRatingQuestion = function (ratingId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Contracts/DeleteRatingQuestion', { RatingQuestionId: ratingId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // Assign Services
    serviceFactory.recacheContract = _recacheContract;
    serviceFactory.getContractsWithRateSheets = _getContractsWithRateSheets;
    serviceFactory.getLimits = _getLimits;
    serviceFactory.searchContracts = _searchContracts;
    serviceFactory.getAllContracts = _getAllContracts;
    serviceFactory.searchRateSheets = _searchRateSheets;
    serviceFactory.getContracts = _getContracts;
    serviceFactory.getContractsByRiskCompany = _getContractsByRiskCompany;
    serviceFactory.getContract = _getContract;
    serviceFactory.updateContract = _updateContract;
    serviceFactory.updateContractCoverages = _updateContractCoverages;
    serviceFactory.deleteContract = _deleteContract;
    serviceFactory.getZones = _getZones; 
    serviceFactory.getCharacteristics = _getCharacteristics;
    serviceFactory.getRatesheets = _getRatesheets;
    serviceFactory.getRateSheet = _getRateSheet;
    serviceFactory.saveRateSheet = _saveRateSheet;
    serviceFactory.saveRateSheetRate = _saveRateSheetRate;
    serviceFactory.deleteRateSheet = _deleteRateSheet;
    serviceFactory.deleteRateSheetRate = _deleteRateSheetRate;
    serviceFactory.newRateSheet = _newRateSheet;
    serviceFactory.updateRateSheet = _updateRateSheet;
    serviceFactory.updateRateSheetName = _updateRateSheetName;
    serviceFactory.newRateSheetTable = _newRateSheetTable;
    serviceFactory.updateRateSheetTable = _updateRateSheetTable;
    serviceFactory.deleteRateSheetTable = _deleteRateSheetTable;
    serviceFactory.updateRateSheetZones = _updateRateSheetZones;
    serviceFactory.copyRateSheetExclusionsTo = _copyRateSheetExclusionsTo;
    serviceFactory.copyRateSheetConditionsTo = _copyRateSheetConditionsTo;
    serviceFactory.copyRateSheetExclusionTo = _copyRateSheetExclusionTo;
    serviceFactory.copyRateSheetConditionTo = _copyRateSheetConditionTo;
    serviceFactory.copyRateSheetTableTo = _copyRateSheetTableTo;
    serviceFactory.getEligibilityQuestions = _getEligibilityQuestions;
    serviceFactory.searchEligibilityQuestions = _searchEligibilityQuestions;
    serviceFactory.updateEligibilityQuestion = _updateEligibilityQuestion;
    serviceFactory.copyEligibilityQuestion = copyEligibilityQuestion;
    serviceFactory.deleteEligibilityQuestion = _deleteEligibilityQuestion;
    serviceFactory.getEligibilities = _getEligibilities;
    serviceFactory.searchEligibilities = _searchEligibilities;
    serviceFactory.updateEligibility = _updateEligibility;
    serviceFactory.copyEligibility = copyEligibility;
    serviceFactory.deleteEligibility = _deleteEligibility;
    serviceFactory.newRateSheetConditionRateGroup = _newRateSheetConditionRateGroup;
    serviceFactory.newRateSheetConditionRateCondition = _newRateSheetConditionRateCondition;
    serviceFactory.deleteRateSheetConditionRateGroup = _deleteRateSheetConditionRateGroup;
    serviceFactory.deleteRateSheetConditionRate = _deleteRateSheetConditionRate;
    serviceFactory.updateRateSheetConditionRateGroup = _updateRateSheetConditionRateGroup;
    serviceFactory.updateRateSheetConditionRate = _updateRateSheetConditionRate;
    serviceFactory.newRateSheetExclusionGroup = _newRateSheetExclusionGroup;
    serviceFactory.newRateSheetExclusion = _newRateSheetExclusion;
    serviceFactory.deleteRateSheetExclusionGroup = _deleteRateSheetExclusionGroup;
    serviceFactory.deleteRateSheetExclusion = _deleteRateSheetExclusion;
    serviceFactory.updateRateSheetExclusionGroup = _updateRateSheetExclusionGroup;
    serviceFactory.updateRateSheetExclusion = _updateRateSheetExclusion;
    serviceFactory.newRateSheetTableConditionGroup = _newRateSheetTableConditionGroup;
    serviceFactory.newRateSheetTableCondition = _newRateSheetTableCondition;
    serviceFactory.deleteRateSheetTableConditionGroup = _deleteRateSheetTableConditionGroup;
    serviceFactory.deleteRateSheetTableCondition = _deleteRateSheetTableCondition;
    serviceFactory.updateRateSheetTableConditionGroup = _updateRateSheetTableConditionGroup;
    serviceFactory.updateRateSheetTableCondition = _updateRateSheetTableCondition;
    serviceFactory.getContractNotes = _getContractNotes;
    serviceFactory.updateContractNote = _updateContractNote;
    serviceFactory.deleteContractNote = _deleteContractNote;
    serviceFactory.getContractCommissions = _getContractCommissions;
    serviceFactory.searchContractCommissions = _searchContractCommissions;
    serviceFactory.updateContractCommission = _updateContractCommission;
    serviceFactory.deleteContractCommission = _deleteContractCommission;
    serviceFactory.getContractTotalInsuredValues = _getContractTotalInsuredValues;
    serviceFactory.searchContractTotalInsuredValues = _searchContractTotalInsuredValues;
    serviceFactory.updateContractTotalInsuredValue = _updateContractTotalInsuredValue;
    serviceFactory.deleteContractTotalInsuredValue = _deleteContractTotalInsuredValue;
    serviceFactory.getClassCodes = _getClassCodes;
    serviceFactory.searchContractClassCodes = _searchContractClassCodes;
    serviceFactory.updateClassCode = _updateClassCode;
    serviceFactory.deleteClassCode = _deleteClassCode;
    serviceFactory.getMinimumPremiums = _getMinimumPremiums;
    serviceFactory.updateMinimumPremium = _updateMinimumPremium;
    serviceFactory.deleteMinimumPremium = _deleteMinimumPremium;
    serviceFactory.getRatingQuestions = _getRatingQuestions;
    serviceFactory.searchRatingQuestions = _searchRatingQuestions;
    serviceFactory.updateRatingQuestion = _updateRatingQuestion;
    serviceFactory.deleteRatingQuestion = _deleteRatingQuestion;
    serviceFactory.copy = _copy;
    serviceFactory.copyEligibilityConditionGroup = _copyEligibilityConditionGroup;

    return serviceFactory;
}]);