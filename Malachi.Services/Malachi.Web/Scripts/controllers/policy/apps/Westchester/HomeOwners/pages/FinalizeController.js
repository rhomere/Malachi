'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_FinalizeController', ['authService', '$rootScope', '$scope', '$modal', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', 'settings', 'policyService', 'test_policyService', 'agencyService', function (authService, $rootScope, $scope, $modal, $location, $stateParams, $ocLazyLoad, notificationsHub, settings, policyService, test_policyService, agencyService) {
  $scope.parent = $scope.$parent;
  $scope.Policy = $scope.parent.Policy;

  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
    $scope.spawnInspectionList();
  });

  $scope.toggleManaulAddressEntry = false;
  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.ErrorMessage = '';
  $scope.WarningMessage = '';
  $scope.canUpdateFees = $.inArray("Fee Update", authService.authentication.roles) > -1;
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.isAgencyPortal = $scope.AppId == "001d0418-a168-4be3-84a8-0168eda970fd";

  $scope.FormOfBusiness = [];
  $scope.Agencies = [];
  $scope.Contacts = [];
  $scope.LicensedAgents = [];
  $scope.Offices = [];
  $scope.PremiumBreakdowns = [];
  $scope.FeesAndTaxes = [];
  $scope.AccountExecutives = [];
  $scope.MinimumEarnedPremiums = ['25%', '50%', '100%'];
  $scope.Errors = [];

  $scope.spawnInspectionList = function () {
    if ($scope.parent.Policy.Bound == 1) {
      $scope.InspectionTypes = [
        { Name: "On Site", Value: 0 },
        { Name: "Exterior Only - Fly Over", Value: 2 }
      ];
    } else {
      $scope.InspectionTypes = [
        { Name: "On Site", Value: 0 }
      ];
    }
  };

  $scope.placeset = function (result) {
    if (result) {
      $scope.parent.Policy.AgencyDetail.Address.StreetAddress1 = result.StreetAddress1;
      $scope.parent.Policy.AgencyDetail.Address.StreetAddress2 = result.StreetAddress2;
      $scope.parent.Policy.AgencyDetail.Address.Zip = result.Zip;
      $scope.parent.Policy.AgencyDetail.Address.City = result.City;
      $scope.parent.Policy.AgencyDetail.Address.County = result.County;
      $scope.parent.Policy.AgencyDetail.Address.State = result.State;
    }
    $scope.saved = false;
  }

  $scope.showInspectionType = function () {
    var version = $scope.parent.Policy.CurrentVersion;
    var riskCompanyId = version.RiskCompanyId || version.FocusedRiskCompanyId;
    var premium = version.Premiums.find(function (x) { return x.RiskCompanyId == riskCompanyId; });

    var inspectionFee = premium.Breakdown.find(function (x) { return x.Code == "INF" });
    if (inspectionFee == undefined) return false;

    return inspectionFee.Amount > 0;
  }

  if ($scope.AppId == null) {
    $rootScope.$state.transitionTo('policyDashboard');
  }

  var selectedPremium = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId })[0];
  var policyFee = $.grep(selectedPremium.Breakdown, function (x) { return x.Name == "Policy Fee" })[0];
  $scope.IsTexasSplit = policyFee != undefined && policyFee.AgencyRetentionPercentage == 50;

  $scope.addRemoveTexasSplit = function () {
    $scope.IsTexasSplit = !$scope.IsTexasSplit;

    policyService.updateFee($scope.PolicyId, policyFee.Name, policyFee.Amount, $scope.IsTexasSplit).then(function (result) {
      if (result.data.Result.Success) {
        notificationsHub.showSuccess('Quote ' + $scope.parent.Policy.Number, 'Fees have been updated.');
        $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  };

  $scope.changeMGA = function () {
    policyService.getAccountExecutives($scope.PolicyId, $scope.parent.Policy.ManagingGeneralAgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.AccountExecutives = result.data.Users;

      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    policyService.getOffices($scope.PolicyId, $scope.parent.Policy.ManagingGeneralAgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Offices = result.data.Offices;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  }

  function loadPolicy() {
    // Check if coverages have tria
    if ($scope.parent.Coverages.filter(x => x.Name == 'TRIA').length > 0) {
      $scope.IncludeTria = true;
    }

    if ($scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId.toUpperCase() === 'F20153C2-7B31-42F0-B3CB-26C6BC82EAF0' &&
      !$scope.parent.Policy.CurrentVersion.Subjectivities.includes('\n4 Point Inspection required')) {

      $scope.parent.Policy.CurrentVersion.Subjectivities = $scope.parent.Policy.CurrentVersion.Subjectivities + '\n4 Point Inspection required';
    }

    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

    $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;

    $scope.parent.LoadingPage = false;

    if ($scope.parent.Policy.ManagingGeneralAgentId != null)
      $scope.changeMGA();

    $scope.getAgencies();
    if ($scope.parent.Policy.EndorsementNumber)
      $scope.getAgencyLicenses();
  }

  $scope.accountExecSelected = function () {
    for (var i = 0; i < $scope.AccountExecutives.length; i++) {
      if ($scope.parent.Policy.UnderwriterId == $scope.AccountExecutives[i].Id) {
        $scope.parent.Policy.OfficeId = $scope.AccountExecutives[i].OfficeId;
      }
    }
  }

  $scope.inspectionTypeSelected = function () {
    var policyId = $scope.PolicyId;
    var inspectionType = $scope.parent.Policy.InspectionType;

    policyService.updateInspectionType(policyId, inspectionType).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
        notificationsHub.showSuccess('Quote ' + $scope.parent.Policy.Number, 'Inspection type has been updated.');
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.saveChanges = function () {
    $scope.validatePage();
    if ($scope.ErrorList.length > 0) {
      return;
    }

    policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, []).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];

        policyService.onQuoteSave($scope.PolicyId, $scope.parent.Policy);
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  }

  // Function that handles page validation for user inputs
  $scope.validatePage = function () {
    $scope.ErrorList = [];

    if (checkInput($scope.parent.Policy.AgencyDetail.Address.StreetAddress1)) {
      $scope.ErrorList.push('Retail Agency Address 1 cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.AgencyDetail.Address.Zip)) {
      $scope.ErrorList.push('Retail Agency Zip cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.AgencyDetail.Address.County)) {
      $scope.ErrorList.push('Retail Agency County cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.AgencyDetail.Address.State)) {
      $scope.ErrorList.push('Retail Agency State cannot be blank.');
    }

    //if (checkInput($scope.parent.Policy.AgencyDetail.ContactEmail)) {
    //  $scope.ErrorList.push('Retail Agency Email cannot be blank.');
    //}

    //if (checkInput($scope.parent.Policy.AgencyDetail.ContactPhone)) {
    //  $scope.ErrorList.push('Retail Agency Phone cannot be blank.');
    //}

    if (checkInput($scope.parent.Policy.AgencyDetail.ContactName)) {
      $scope.ErrorList.push('Agent Contact Name cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.AgencyDetail.AgencyCode)) {
      $scope.ErrorList.push('Agency Producer Code cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.AgencyDetail.AgencyName)) {
      $scope.ErrorList.push('Retail Agency Name cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.UnderwriterId)) {
      $scope.ErrorList.push('Must select an account executive.');
    }

    //if (checkInput($scope.parent.Policy.OfficeId)) {
    //  $scope.ErrorList.push('Must select an office.');
    //}

    if (checkInput($scope.parent.Policy.MinimumEarnedPremium)) {
      $scope.ErrorList.push('Must select a Minimum Earned Premium.');
    }

    if ($scope.parent.Policy.EndorsementNumber) {
      //if (checkInput($scope.parent.Policy.CurrentAgencyId)) {
      //  $scope.ErrorList.push('You must select an agency.');
      //}

      //if (checkInput($scope.parent.Policy.CurrentAgencyContactId)) {
      //  $scope.ErrorList.push('You must select an agency contact.');
      //}

      if (checkInput($scope.parent.Policy.ProducingAgencyLicense)) {
        $scope.ErrorList.push('You must select an agency license.');
      }
    }

    if (checkInput($scope.parent.Policy.ProducingAgencyCommission) || parseInt($scope.parent.Policy.ProducingAgencyCommission) < 1) {
      $scope.ErrorList.push('The agency commission entered must be greater than zero.');
    }
  }

  function checkInput(input) {
    if (input == '' || input == undefined || input == null) {
      return true;
    }
    else {
      return false;
    }
  }

  $scope.getAgencyName = function (name, code, city, stateCode, zipCode) {
    if (name && name.length > 44) {
      name = name.substr(0, 44) + '...';
    }
    if (city && city.length > 10) {
      city = city.substr(0, 10) + '...';
    }

    if (!name) return null;

    return name + ' - ' + code + ' - ' + city + ', ' + stateCode + ' ' + zipCode;
  }

  $scope.agencySelected = function () {
    // Unselect the agency contact if user makes change to the agency
    if (!$scope.parent.Policy.EndorsementNumber)
      $scope.parent.Policy.OriginalAgencyContactId = null;
    else
      $scope.parent.Policy.CurrentAgencyContactId = null;

    // Unselect the agency license if user makes change to the agency
    $scope.parent.Policy.ProducingAgencyLicense = null;

    // Get commission for the selected agency
    $scope.getAgencyCommission();
    if ($scope.parent.Policy.EndorsementNumber)
      $scope.getAgencyLicenses();
  }

  $scope.getAgencies = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    agencyService.getUnderwriterAgencies($scope.parent.Policy.UnderwriterId).then(function (result) {
      Metronic.unblockUI();
      $scope.Agencies = result.data;
    }, function (error) {
      Metronic.unblockUI();
      $scope.Errors = error.data.Message.split("\r\n");
    });
  };

  $scope.getAgencyCommission = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    agencyService.getAgencyCommission($scope.parent.Policy.OriginalAgencyId, $scope.AppId).then(function (result) {
      Metronic.unblockUI();
      $scope.parent.Policy.ProducingAgencyCommission = result.data.Commission;
    }, function (error) {
      Metronic.unblockUI();
      // if can not find commission then default to 10 else show errors
      if (error.data.Message && error.data.Message == "Could not find an active commission.")
        $scope.parent.Policy.ProducingAgencyCommission = 10;
      else
        $scope.Errors = error.data.Message.split("\r\n");
    });
  };

  $scope.getAgencyLicenses = function () {
    var policy = $scope.parent.Policy;
    var agencyId = null;
    if (!$scope.parent.Policy.EndorsementNumber)
      agencyId = $scope.parent.Policy.OriginalAgencyId;
    else
      agencyId = $scope.parent.Policy.CurrentAgencyId;

    if (!agencyId) {
      $scope.LicensedAgents = [];
      return;
    }

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    agencyService.getAgencyLicenses(agencyId, $scope.AppId, policy.HomeStateCode, policy.Effective).then(function (result) {
      Metronic.unblockUI();
      $scope.LicensedAgents = result.data;

      if ($scope.LicensedAgents.length == 1)
        policy.ProducingAgencyLicense = $scope.LicensedAgents[0].LicenseNumber;
      if ($scope.LicensedAgents.length == 0)
        $scope.Errors = ["Please email the Customer Care team your AIM Submission number so they can get the agency information updated in order to bind this account in BOL."];
      else
        $scope.Errors = [];
    }, function (error) {
      Metronic.unblockUI();
      $scope.Errors = error.data.Message.split("\r\n");
    });
  };

  $scope.getContacts = function () {
    var agencyId = null;
    if ($scope.parent.Policy.EndorsementNumber)
      agencyId = $scope.parent.Policy.CurrentAgencyId;
    else
      agencyId = $scope.parent.Policy.OriginalAgencyId;

    if (!agencyId)
      return [];

    var agency = $scope.Agencies.find(x => x.Id == agencyId);
    if (!agency)
      return [];

    return agency.Contacts;
  };

  $scope.hideEditFees = function () {
    return $scope.Policy.AppId == "001d0418-a168-4be3-84a8-0168eda970fd";
  }

  $scope.getBreakdowns = function () {
    for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Premiums.length; i++) {
      if ($scope.parent.Policy.CurrentVersion.Premiums[i].RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId) {
        let breakdowns = $scope.parent.Policy.CurrentVersion.Premiums[i].Breakdown;
        for (var j = 0; j < breakdowns.length; j++) {
          if (breakdowns[j].Name.includes('Premium')) {
            $scope.FeesAndTaxes.push(breakdowns[j]);
          }
        }
      }
    }
  }

  $scope.getBreakdowns();

  $scope.editFees = function () {
    var modalInstance = $modal.open({
      templateUrl: 'editFees.html',
      controller: 'test_Homeowners_editFeesCtrl',
      backdrop: 'static',
      resolve: {
        policy: function () {
          return $scope.parent.Policy;
        },
        policyId: function () {
          return $scope.PolicyId;
        },
        locations: function () {
          return $scope.Locations;
        },
        breakdowns: function () {
          return $.extend([], $scope.FeesAndTaxes);
        },
        parent: function () {
          return $scope.parent;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        policyService.updateFees($scope.PolicyId, data.EditedFees).then(function (result) {
          if (result.data.Result.Success) {
            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Fees have been updated.');
            $scope.FeesAndTaxes = data.FeesAndTaxes;
            $scope.getBreakdowns();
            //$scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
          }
          else {
            $scope.Errors = result.data.Result.Errors;
          }
        }, function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      }
    });
  }

  if ($scope.PolicyId) { // Existing Policy
    loadPolicy();
  }
  else {
    $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
  }
}]);

MALACHIAPP.controller('test_Homeowners_editFeesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'breakdowns', 'parent', '$modal', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, breakdowns, parent, $modal) {
  $scope.parent = parent;
  $scope.PolicyId = policyId;
  $scope.Locations = locations;
  $scope.Policy = policy;
  $scope.EditableFees = [];
  $scope.breakdowns = $.extend([], breakdowns);
  $scope.BreakDownTypes = [
    'Policy Fee',
    'Inspection Fee',
    'Broker Fee',
    'Processing Fee',
    'Surplus Lines Tax',
    'Service Office Fee',
    'FEMA',
    'Other Fee'
  ];

  $scope.breakdowns = $scope.breakdowns.filter(function (b) {
    b.ShowInput = b.Name && !$scope.BreakDownTypes.includes(b.Name);
    return b.Name && ($scope.BreakDownTypes.includes(b.Name) || b.Name.includes('Fee') || b.Name.includes('Tax'));
  });
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.deleteBreakdown = function (breakdown) {
    $scope.breakdowns.splice($scope.breakdowns.indexOf(breakdown), 1);
  }

  $scope.breakdownTypeSelected = function (breakdown) {
    if (breakdown.Name == 'Other Fee') {
      breakdown.Name = null;
      breakdown.ShowInput = true;
    }
  }

  $scope.update = function () {
    $scope.validateInputs();
    if ($scope.ErrorList.length > 0) return;
    let breakdowns = $scope.breakdowns.map(({ ShowInput, ...rest }) => rest);
    $modalInstance.close({ EditedFees: breakdowns, FeesAndTaxes: breakdowns });
  }

  $scope.add = function () {
    $scope.breakdowns.push({});
  }

  $scope.validateInputs = function () {
    $scope.ErrorList = [];

    if ($scope.breakdowns.filter(breakdown => checkInputs(breakdown.Name)).length > 0) {
        $scope.ErrorList.push('Name cannot be blank.');
    }

    if ($scope.breakdowns.filter(breakdown => checkInputs(breakdown.Amount)).length > 0) {
        $scope.ErrorList.push('Amount cannot be blank.');
    }

  }

  function checkInputs(input) {
    if (input == '' || input == undefined) {
      return true;
    }
    else {
      return false;
    }
  }

}]);