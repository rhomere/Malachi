'use strict';
MALACHIAPP.factory('settingsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Services
    serviceFactory.getCoverages = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetCoverages', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getApps = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetApps', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };


    serviceFactory.getAttributes = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetAttributes', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.getRoles = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetRoles', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    serviceFactory.getRoleDescriptions = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetRoleDescriptions', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };



    serviceFactory.getBrokers = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetBrokers', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchBrokers = function (name) {
        return $http.get(serviceBase + 'api/Settings/SearchBrokers', { params: { Name: name }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateBroker = function (broker) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateBroker', { Broker: broker }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteBroker = function (brokerId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteBroker', { BrokerId: brokerId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getManagingGeneralAgents = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetManagingGeneralAgents', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchManagingGeneralAgents = function (name) {
        return $http.get(serviceBase + 'api/Settings/SearchManagingGeneralAgents', { params: { Name: name }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateManagingGeneralAgent = function (mga) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateManagingGeneralAgent', { ManagingGeneralAgent: mga }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteManagingGeneralAgent = function (mgaId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteManagingGeneralAgent', { ManagingGeneralAgentId: mgaId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getUsers = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetUsers', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchUsers = function (name, pageNumber, display, organizationType, organizationName) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/SearchUsers', { params: { Name: name, PageNumber: pageNumber, Display: display, OrganizationType: organizationType, OrganizationName: organizationName }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchUsersByOrganization = function (orgId, orgType) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/SearchUsersByOrganization', { params: { OrganizationId: orgId, OrganizationType: orgType }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.updateUser = function (user) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateUser', { User: user }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.resetPasswordEmail = function (user) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/resetPasswordEmail', { User: user }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteUser = function (userId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteUser', { UserId: userId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchOrganizations = function (name, type) {
        return $http.get(serviceBase + 'api/Settings/SearchOrganizations', { params: { Name: name, Type: type }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAllOrganizations = function () {
        return $http.get(serviceBase + 'api/Settings/GetAllOrganizations', { cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAgents = function (agencyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetAgents', { params: { AgencyId: agencyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAgentById = function (agentId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetAgentById', { params: { AgentId: agentId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAgencyById = function (agencyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetAgencyById', { params: { AgencyId: agencyId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchAgents = function (name, mgaid) {
        return $http.get(serviceBase + 'api/Settings/SearchAgents', { params: { Name: name, AgencyId: agencyId }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateAgent = function (agent) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateAgent', { Agent: agent }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteAgent = function (agentId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteAgent', { AgentId: agentId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getOffices = function (mgaid) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetOffices', { params: { MgaId: mgaid }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchOffices = function (name, mgaid) {
        return $http.get(serviceBase + 'api/Settings/SearchOffices', { params: { Name: name, MgaId: mgaid }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateOffice = function (office) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateOffice', { Office: office }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteOffice = function (officeId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteOffice', { OfficeId: officeId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getMGAStateSignatures = function (mgaid) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetMGAStateSignatures', { params: { MgaId: mgaid }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchMGAStateSignatures = function (name, mgaid) {
        return $http.get(serviceBase + 'api/Settings/SearchMGAStateSignatures', { params: { Name: name, MgaId: mgaid }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateMGAStateSignature = function (stateSignature) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateMGAStateSignature', { MGAStateSignature: stateSignature }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteMGAStateSignature = function (stateSignatureId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteMGAStateSignature', { MGAStateSignatureId: stateSignatureId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAgencies = function (mgaid) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetAgencies', { params: { MgaId: mgaid }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchAgencies = function (name, mgaid) {
        return $http.get(serviceBase + 'api/Settings/SearchAgencies', { params: { Name: name, MgaId: mgaid }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.searchAgenciesByName = function (name) {
        return $http.get(serviceBase + 'api/Settings/SearchAgenciesByName', { params: { Name: name }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getAgentsByAgencyId = function (agencyKey) {
        return $http.get(serviceBase + 'api/Settings/GetAgentsByAgencyId', { params: { AgencyKey: agencyKey }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateAgency = function (agency) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateAgency', { Agency: agency }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteAgency = function (agencyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteAgency', { AgencyId: agencyId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getFees = function (mgaid) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetFees', { params: { MgaId: mgaid }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchFees = function (name, mgaid) {
        return $http.get(serviceBase + 'api/Settings/SearchFees', { params: { Name: name, MgaId: mgaid }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateFee = function (fee) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateFee', { Fee: fee }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteFee = function (feeId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteFee', { FeeId: feeId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // -----


    serviceFactory.getStateTaxes = function (mgaid) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetStateTaxes', { params: { MgaId: mgaid }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.searchStateTaxes = function (name) {
        return $http.get(serviceBase + 'api/Settings/SearchStateTaxes', { params: { Name: name }, cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.updateStateTax = function (tax) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/UpdateStateTax', { StateTax: tax }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.deleteStateTax = function (taxId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.post(serviceBase + 'api/Settings/DeleteStateTax', { StateTaxId: taxId }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    // ----

    serviceFactory.copyFeeFromMGA = function (fromMGAId, toMGAID) {
        return $http.post(serviceBase + 'api/Settings/copyFeeFromMGA', { FromManagingGeneralAgentId: fromMGAId, ToManagingGeneralAgentId: toMGAID }).then(function (results) {
            return results;
        });
    }


    serviceFactory.getPropertyLimits = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Settings/GetPropertyLimits', { cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.getAllZoneGroups = function () {
        return $http.get(serviceBase + 'api/Insurer/GetAllZoneGroups', { cache: false }).then(function (results) {
            return results;
        });
    }

    serviceFactory.getZonesWithAggregate = function (zoneGroupId, unBlockUi) {
        if (!unBlockUi)
            Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/settings/getZonesWithAggregate', { params: { ZoneGroupId: zoneGroupId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }

    serviceFactory.refreshZoneAgg = function (zoneGroupId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/settings/refreshZoneAgg', { params: { ZoneGroupId: zoneGroupId }, cache: false }).then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    }


    return serviceFactory;

}]);