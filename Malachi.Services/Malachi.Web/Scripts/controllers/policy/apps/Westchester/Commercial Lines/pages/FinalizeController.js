
'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_FinalizeController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', 'settings', 'policyService', 'test_policyService', 'customPackageService', 'agencyService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, settings, policyService, test_policyService, customPackageService, agencyService) {
  $scope.parent = $scope.$parent;
  $scope.Policy = $scope.parent.Policy;
  $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

  $scope.parent.LoadingPage = true;
  $scope.toggleManaulAddressEntry = false;
  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.canUpdateFees = $.inArray("Fee Update", authService.authentication.roles) > -1;
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.ErrorMessage = '';
  $scope.WarningMessage = '';

  $scope.FormOfBusiness = [];
  $scope.Agencies = [];
  $scope.Contacts = [];
  $scope.LicensedAgents = [];
  $scope.ManagingGeneralAgents = [];
  $scope.Offices = [];
  $scope.AccountExecutives = [];
  $scope.MinimumEarnedPremiums = ['25%', '50%', '100%'];
  $scope.IncludeTria = false;
  $scope.PremiumBreakdowns = [];
  $scope.EndorsementActivityGroups = [];
  $scope.RiskCompanies = [];
  $scope.Errors = [];

  $scope.InspectionTypes = [
    { Name: "On Site", Value: 0 },
    { Name: "Phone", Value: 1 }
  ];

    $scope.LocationsToInspect = [];
    $scope.locationToInspectSelected = { value: '' };
    $scope.locationAvailableToInspect = [];

  $scope.updateLocationInspectionList = function () {

    $scope.LocationsToInspect = [];
    $scope.locationAvailableToInspect = [];

    for (var i = 0; i < $scope.Locations.length; i++) {

      var toInspect = undefined;

      toInspect = { location: $scope.Locations[i], building: undefined };

      if ($scope.Locations[i].OrderInspection)
        $scope.LocationsToInspect.push(toInspect);
      else
        $scope.locationAvailableToInspect.push(toInspect);
    }
  };

  $scope.updateLocationInspectionList();

  $scope.locationAvailableToInspect.sort((a, b) => {

    if (a.location.LocationNumber < b.location.LocationNumber)
      return -1;
    if (a.location.LocationNumber > b.location.LocationNumber)
      return 1;
    if (a.location.LocationNumber == b.location.LocationNumber)
      return 0;
  });

  $scope.showInspectionType = function () {
    var version = $scope.parent.Policy.CurrentVersion;
    var riskCompanyId = version.RiskCompanyId || version.FocusedRiskCompanyId;
    var premium = version.Premiums.find(function (x) { return x.RiskCompanyId == riskCompanyId; });

    var inspectionFee = premium.Breakdown.find(function (x) { return x.Code == "INF" });
    if (inspectionFee == undefined) return false;

    return inspectionFee.Amount > 0;
  }


  $scope.canShowMultipleLocationsToInspect = function () {
    var inspectionTypeName = $scope.InspectionTypes[$scope.parent.Policy.InspectionType].Name;

    return inspectionTypeName != "Phone";
  }

  $scope.onAddLocationToInspect = function () {
    if ($scope.locationToInspectSelected.value == undefined || $scope.locationToInspectSelected.value == '')
      return;

    var location = $scope.locationToInspectSelected.value;

    var index = $scope.locationAvailableToInspect.indexOf(location);
    $scope.locationAvailableToInspect.splice(index, 1);

    $scope.LocationsToInspect.push(location);

    $scope.locationToInspectSelected.value = $scope.locationAvailableToInspect[0];

    $scope.updateInspectionFees();
  }

  $scope.removeLocationToInspect = function (loc) {
    var index = $scope.LocationsToInspect.indexOf(loc);
    $scope.LocationsToInspect.splice(index, 1);

    $scope.locationAvailableToInspect.push(loc);

    $scope.locationAvailableToInspect.sort((a, b) => {

      if (a.location.LocationNumber < b.location.LocationNumber)
        return -1;
      if (a.location.LocationNumber > b.location.LocationNumber)
        return 1;
      if (a.location.LocationNumber == b.location.LocationNumber)
        return 0;
    });

    $scope.updateInspectionFees();
  }

  $scope.updateInspectionFees = function () {

    var locationProperties = [];
    var tmpDic = {};

    for (var i = 0; i < $scope.LocationsToInspect.length; i++) {
      locationProperties.push({ LocationId: $scope.LocationsToInspect[i].location.Id, PropertyId: $scope.LocationsToInspect[i].building ? $scope.LocationsToInspect[i].building.Id : undefined });
      tmpDic[$scope.LocationsToInspect[i].location.Id] = true;
    }

    for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
      if (tmpDic[$scope.parent.Policy.CurrentVersion.Locations[i].Id])
        $scope.parent.Policy.CurrentVersion.Locations[i].OrderInspection = true;
      else
        $scope.parent.Policy.CurrentVersion.Locations[i].OrderInspection = false;

      for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Locations[i].Properties.length; j++) {
        if ($scope.parent.Policy.CurrentVersion.Locations[i].Properties[j].PropertyType == 'Building')
          $scope.parent.Policy.CurrentVersion.Locations[i].Properties[j].OrderInspection = $scope.parent.Policy.CurrentVersion.Locations[i].OrderInspection;
      }
    }

    var agencyId = $scope.parent.Policy.OriginalAgencyId;
    var agencyContactId = $scope.parent.Policy.OriginalAgencyContactId;
    var agencyCommission = $scope.parent.Policy.ProducingAgencyCommission;

    policyService.setInspectionLocations($scope.parent.Policy.Id, locationProperties).then(function (result) {
      if (result.data.Result.Success) { 
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
        $scope.Errors = []; 
        if (result.data.Policy.ValidateQuoteByCompany.length > 0) {
          for (var i = 0; i < result.data.Policy.ValidateQuoteByCompany.length; i++) {
            if (result.data.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == result.data.Policy.CurrentVersion.FocusedRiskCompanyId && result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
              for (var j = 0; j < result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length; j++) {
                var error = result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors[j];
                if (error == "Retail Agency name is required." || error == "Retail Agency commission is required." || error == "Agency contact is required.")
                  continue;
                $scope.Errors.push(error);
              }
            }
          }
        } 
        $scope.parent.Policy.OriginalAgencyId = agencyId;
        $scope.parent.Policy.OriginalAgencyContactId = agencyContactId;
        $scope.parent.Policy.ProducingAgencyCommission = agencyCommission;
        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations; 
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];

    });
  }

  if ($scope.AppId == null) {
    $rootScope.$state.transitionTo('policyDashboard');
  }

  if ($scope.PolicyId) { // Existing Policy
  }
  else {
    $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
  }

  $scope.getRiskCompany = function (riskCompanyId) {
    var riskCompany = $scope.RiskCompanies.find(function (x) { return x.Id == riskCompanyId; });
    return riskCompany;
  };

  $scope.getRiskCompanyName = function (riskCompanyId) {
    var riskCompany = $scope.getRiskCompany(riskCompanyId);
    if (!riskCompanyId)
      return "";

    return $scope.isCustomPackageRiskCompany(riskCompanyId) ? $scope.getCustomPackageRiskCompanyName(riskCompanyId) : riskCompany.Name;
  };

  /* CUSTOM PACKAGE */

  $scope.getCustomPackageRiskCompanyName = function (riskCompanyId) {
    return customPackageService.getRiskCompanyName(riskCompanyId);
  };

  $scope.getCustomPackageCoverageRiskCompanyShortName = function (coverageName, riskCompanyId) {
    var coverageRiskCompany = customPackageService.getCoverageRiskCompany(coverageName, riskCompanyId);
    if (!coverageRiskCompany)
      return "";

    return coverageRiskCompany.ShortName;
  };

  $scope.isCustomPackageRiskCompany = function (riskCompanyId) {
    var riskCompany = $scope.getRiskCompany(riskCompanyId);
    if (!riskCompany)
      return false;

    return customPackageService.isCustomPackageRiskCompany(riskCompany);
  };

  /* END */
  var selectedPremium = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId })[0];
  var policyFee = $.grep(selectedPremium.Breakdown, function (x) { return x.Name == "Policy Fee" })[0];
  $scope.IsTexasSplit = policyFee != undefined && policyFee.AgencyRetentionPercentage == 50;

  $scope.addRemoveTexasSplit = function () {
    $scope.IsTexasSplit = !$scope.IsTexasSplit;

    var selectedPremium = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId })[0];
    var policyFee = $.grep(selectedPremium.Breakdown, function (x) { return x.Name == "Policy Fee" })[0];

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

    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;


    $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;

    $scope.parent.LoadingPage = false;

    if ($scope.parent.Policy.Endorsement) {
    }

    if ($scope.parent.Policy.ManagingGeneralAgentId != null)
      $scope.changeMGA();

    $scope.Errors = [];
    for (var i = 0; i < $scope.parent.Policy.ValidateQuoteByCompany.length; i++) {
      if ($scope.parent.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == $scope.parent.RiskCompanyId && $scope.parent.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
        $scope.Errors = $scope.parent.Policy.ValidateQuoteByCompany[i];
      }
    }

    $scope.getAgencies();
    if ($scope.parent.Policy.EndorsementNumber)
      $scope.getAgencyLicenses();
  }

  $scope.updateErrorList = function (RiskCompanyId) {
    $scope.Errors = [];

    if ($scope.parent.Policy.ValidateQuoteByCompany.length > 0) {
      for (var i = 0; i < $scope.parent.Policy.ValidateQuoteByCompany.length; i++) {
        if ($scope.parent.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == RiskCompanyId && $scope.parent.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
          for (var j = 0; j < $scope.parent.Policy.ValidateQuoteByCompany[i].ValidationErrors.length; j++) {
            $scope.Errors.push($scope.parent.Policy.ValidateQuoteByCompany[i].ValidationErrors[j]);
          }
        }
      }
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
  };

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
        $scope.Locations = result.data.Policy.CurrentVersion.Locations;
        $scope.updateLocationInspectionList();
         
        $scope.Errors = [];
        if (result.data.Policy.ValidateQuoteByCompany.length > 0) {
          for (var i = 0; i < result.data.Policy.ValidateQuoteByCompany.length; i++) {
            if (result.data.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == result.data.Policy.CurrentVersion.FocusedRiskCompanyId && result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
              for (var j = 0; j < result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length; j++) {
                $scope.Errors.push(result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors[j]);
              }
            }
          }
        } 
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.saveChanges = function () {
    $scope.validatePage();
    if ($scope.Errors.length > 0) return;

    var version = $scope.parent.Policy.CurrentVersion;
    var focusedRiskCompanyId = version.RiskCompanyId || version.FocusedRiskCompanyId;
    var breakdown = $scope.PremiumBreakdowns.filter(function (x) { return x.RiskCompanyId === focusedRiskCompanyId; })[0].Breakdown;
    var policyFee = breakdown.find(function (x) { return x.Name === 'Policy Fee' });
    var inspectionFee = breakdown.find(function (x) { return x.Name === 'Inspection Fee' });

    policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, [
      { Name: 'Policy Fee', Amount: policyFee.Amount },
      { Name: 'Inspection Fee', Amount: inspectionFee.Amount }
    ], true).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.Policy = $scope.parent.Policy;
        $scope.Errors = [];

        if (result.data.Policy.ValidateQuoteByCompany.length > 0) {
          for (var i = 0; i < result.data.Policy.ValidateQuoteByCompany.length; i++) {
            if (result.data.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == result.data.Policy.CurrentVersion.FocusedRiskCompanyId && result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
              for (var j = 0; j < result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors.length; j++) {
                $scope.Errors.push(result.data.Policy.ValidateQuoteByCompany[i].ValidationErrors[j]);
              }
            }
          }
        }

        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
        $scope.updateLocationInspectionList();

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
    $scope.Errors = [];

    if (checkInput($scope.parent.Policy.UnderwriterId)) {
      $scope.Errors.push('Must select an account executive.');
    }

    if (checkInput($scope.parent.Policy.OfficeId)) {
      $scope.Errors.push('Must select an office.');
    }

    if (checkInput($scope.parent.Policy.MinimumEarnedPremium)) {
      $scope.Errors.push('Minimum earned premium not present, contact support for help.');
    }

    if (checkInput($scope.parent.Policy.OriginalAgencyId)) {
      $scope.Errors.push('You must select an agency.');
    }

    if (checkInput($scope.parent.Policy.OriginalAgencyContactId)) {
      $scope.Errors.push('You must select an agency contact.');
    }

    if ($scope.parent.Policy.EndorsementNumber) {
      if (checkInput($scope.parent.Policy.CurrentAgencyId)) {
        $scope.Errors.push('You must select an agency.');
      }

      if (checkInput($scope.parent.Policy.CurrentAgencyContactId)) {
        $scope.Errors.push('You must select an agency contact.');
      }

      if (checkInput($scope.parent.Policy.ProducingAgencyLicense)) {
        $scope.Errors.push('You must select an agency license.');
      }
    }

    if (checkInput($scope.parent.Policy.ProducingAgencyCommission) || parseInt($scope.parent.Policy.ProducingAgencyCommission) < 1) {
      $scope.Errors.push('The agency commission entered must be greater than zero.');
    }
  }

  function checkInput(input) {
    if (input == '' || input == undefined || input == null) {
      return true;
    } else {
      return false;
    }
  }


  $scope.editFees = function () {
    var modalInstance = $modal.open({
      templateUrl: 'editFees.html',
      controller: 'test_Commercial_Lines_editFeesCtrl',
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
        parent: function () {
          return $scope.parent;
        },
        breakdown: function () {
          var version = $scope.parent.Policy.CurrentVersion;
          var focusedRiskCompany = version.RiskCompanyId || version.FocusedRiskCompanyId;
          var premium = $scope.PremiumBreakdowns.filter(function (x) { return x.RiskCompanyId === focusedRiskCompany; })[0];

          return premium.Breakdown;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        policyService.updateFees($scope.PolicyId, data.EditedFees).then(function (result) {
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
      }
    });
  }
  $scope.GetRiskCompanies = function () {
    policyService.getRiskCompanies($scope.parent.Policy).then(function (result) {
      if (result.data.Result.Success) {
        $scope.RiskCompanies = result.data.RiskCompanies;
        //$scope.Errors = result.data.
        if ($scope.RiskCompanies.length == 1 || $scope.parent.Policy.RiskCompanyId == null) $scope.parent.Policy.RiskCompanyId = $scope.RiskCompanies[0].Id;

      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  loadPolicy();
}]);

MALACHIAPP.controller('test_Commercial_Lines_editFeesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'breakdown', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, breakdown, parent) {
  $scope.PolicyId = policyId;
  $scope.Locations = locations;
  $scope.Policy = policy;
  $scope.parent = parent;
  $scope.EditableFees = [];

  if (breakdown.length > 0) {
    for (var i = 0; i < breakdown.length; i++) {
      var breakdownFee = breakdown[i];
      if (breakdownFee.AllowModify) {
        if (breakdownFee.Name == 'Inspection Fee' && (isGridiron() || isRliLiquorLiability())) continue;
        $scope.EditableFees.push({ Name: breakdownFee.Name, Amount: breakdownFee.Amount });
      }
    }
  }

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    //$scope.validateInputs();
    //if ($scope.Errors.length > 0) return;        
    $modalInstance.close({ EditedFees: $scope.EditableFees });

  }

  $scope.validateInputs = function () {
    $scope.Errors = [];

    if ($scope.AIType == 'Mortgagee') {

      if (checkInputs($scope.AI.Name)) {
        $scope.Errors.push('Name cannot be blank.');
      }

    }
    else {
      if (checkInputs($scope.AI.Name)) {
        $scope.Errors.push('Name cannot be blank.');
      }

      if (checkInputs($scope.AI.LossPayeeType)) {
        $scope.Errors.push('Please select a loss payable type.');
      }
    }

    if (checkInputs($scope.AI.Address.ShortAddress) && (checkInputs($scope.AI.Address.StreetAddress1) || checkInputs($scope.AI.Address.Zip) || checkInputs($scope.AI.Address.City) || checkInputs($scope.AI.Address.State))) {
      $scope.Errors.push('Mailing address cannot be blank.');
    }


  }

  function isGridiron() {
    var gridironId = '689c1168-395d-483b-8837-f92ea949e92a';
    var version = policy.CurrentVersion;
    var focusedRiskCompanyId = version.RiskCompanyId || version.FocusedRiskCompanyId;
    return focusedRiskCompanyId === gridironId;
  }

  function isRliLiquorLiability() {
    var version = policy.CurrentVersion;
    var riskCompanyId = version.RiskCompanyId || version.FocusedRiskCompanyId;

    return riskCompanyId.toLowerCase() == "b216d262-52f0-4864-aec9-3411acf7c218"
      && version.Coverages.some(x => x.Name == "Liquor Liability");
  }

  function checkInputs(input) {
    return input == undefined || input == '';
  }
}]);

