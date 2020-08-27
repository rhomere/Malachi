'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_BindController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', 'settings', 'policyService', 'test_policyService', 'customPackageService', 'elanyService', 'aimService', 'agencyService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, settings, policyService, test_policyService, customPackageService, elanyService, aimService, agencyService) {
  $scope.parent = $scope.$parent;

  $scope.parent.LoadingPage = true;
  $scope.toggleManaulAddressEntry = false;
  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.ErrorMessage = '';
  $scope.WarningMessage = '';
  $scope.ValidationErrorList = [];

  $scope.FormOfBusiness = [];
  $scope.Agencies = [];
  $scope.Contacts = [];
  $scope.LicensedAgents = [];
  $scope.Offices = [];
  $scope.AccountExecutives = [];
  $scope.MinimumEarnedPremiums = ['25%', '50%', '100%'];
  $scope.IncludeTria = false;
  $scope.IsCenturySuretyFocused = false;
  $scope.PremiumBreakdowns = [];
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.canUnbindPolicy = $.inArray("Unbind Authority", authService.authentication.roles) > -1;
  $scope.lateBinder = $.inArray("Late Binding Authority", authService.authentication.roles) > -1;
  $scope.InfoMessages = [];
  $scope.LateBind = {};
  $scope.LateBind.IsLateBind = false;
  $scope.LateBind.IsForcedLateBind = false;
  $scope.LateBind.UserHasAcknowledged = false;
  $scope.AffidavitCSigned = false;

  var selectedPremium = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId })[0];
  var policyFee = $.grep(selectedPremium.Breakdown, function (x) { return x.Name == "Policy Fee" })[0];
  $scope.IsTexasSplit = policyFee != undefined && policyFee.AgencyRetentionPercentage == 50;

  if ($scope.parent.Policy.HomeStateCode == 'NY' && $scope.parent.canModify()) {
    $scope.parent.getDefaultElanyCoverageRiskCodes();
  }

  if ($scope.parent.Coverages) {
    if ($scope.parent.Coverages.length < 1 || !$scope.parent.DefaultElanyRisk) {
      $scope.parent.getElanyCoverageInfo();
    }
  } else if (!$scope.parent.Coverages) {
    $scope.parent.getElanyCoverageInfo();
  }

  if ($scope.AppId === null) {
    $rootScope.$state.transitionTo('policyDashboard');
  }

  $scope.doesServerRequireLateBind = function (errors) {
    var error = errors.find(function (x) { return x == "In order to late bind you must get quote approved by the carrier." });
    if (error) $scope.LateBind.IsForcedLateBind = true;
  };

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

  $scope.getCustomPackageRiskCompanies = function (riskCompanyId) {
    var riskCompanies = [];
    var customPackage = customPackageService.getRiskCompany(riskCompanyId);
    riskCompanies.push(customPackage.propertyRiskCompany);
    riskCompanies.push(customPackage.liabilityRiskCompany);

    return riskCompanies;
  };

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

  function updateLateBind() {
    var ONE_DAY = 24 * 60 * 60 * 1000;
    var parts = $scope.parent.Policy.Effective.split("/");
    var current = new Date();
    var effective = new Date(parts[2], parts[0] - 1, parts[1]);

    var diffDays = ((current.getTime() - effective.getTime()) / ONE_DAY);
    if (diffDays > 5) {
      if (!$scope.parent.Policy.Issued) {
        $scope.LateBind.IsLateBind = true;
        if ($scope.parent.Policy.LateBindApprovedBy)
          $scope.LateBind.UserHasAcknowledged = true;
      }
      else {
        if ($scope.parent.Policy.LateBindApprovedBy) {
          $scope.LateBind.IsLateBind = true;
          $scope.LateBind.UserHasAcknowledged = true;
        }
      }
    }
    else {
      $scope.parent.Policy.LateBindApprovedBy = null;
      $scope.LateBind.IsLateBind = false;
      $scope.LateBind.UserHasAcknowledged = false;
    }
  }
  updateLateBind();

  $scope.updateApprovedByField = function () {
    if (!$scope.LateBind.UserHasAcknowledged)
      $scope.parent.Policy.LateBindApprovedBy = null;
  };

  $scope.hasInspectionFee = function () {
    var premium = $scope.parent.Policy.CurrentVersion.Premiums.find(function (x) { return x.RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId; });
    var inspectionFee = premium.Breakdown.find(function (x) { return x.Code == "INF" });

    if (inspectionFee && inspectionFee.Amount > 0)
      return true;

    return false;
  };


  function loadPolicy() {
    var policy = $scope.parent.Policy;
    var version = policy.CurrentVersion;

    // Check if a TRIA coverage is included.
    var triaCoverages = $scope.parent.Coverages.filter(function (x) { return x === "TRIA"; });
    $scope.IncludeTria = triaCoverages.length > 0;

    // Retrieve validation errors.
    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    $scope.parent.RiskCompanyId = version.FocusedRiskCompanyId;
    if ($scope.parent.RiskCompanyId == null || $scope.parent.RiskCompanyId == undefined) {
      $scope.parent.RiskCompanyId = version.RiskCompanyId;
    }

    var validateBindByCompany = policy.ValidateBindByCompany.find(function (x) {
      return x.AppRiskCompanyId === $scope.parent.RiskCompanyId;
    });
    if (validateBindByCompany != undefined) {
      var validationErrors = validateBindByCompany.ValidationErrors;
      $scope.ValidationErrorList = validationErrors.filter(function (error) { return error != "Licensed Agent name is required."; });;
      $scope.doesServerRequireLateBind($scope.ValidationErrorList);
    }

    // Retrieve premiums.
    $scope.PremiumBreakdowns = version.Premiums;

    // Check if Century Surety is selected.
    $scope.IsCenturySuretyFocused = $scope.parent.RiskCompanyId == "be7a9234-5ba5-49e5-acc0-deec3ff2ead0" || $scope.parent.RiskCompanyId == "48b1a26b-713f-4344-8470-5bfb9e25017c";

    // Retrieve offices.
    policyService.getOffices($scope.PolicyId, policy.ManagingGeneralAgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Offices = result.data.Offices;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    // Retrieve account executives.
    policyService.getAccountExecutives($scope.PolicyId, policy.ManagingGeneralAgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.AccountExecutives = result.data.Users;
        $scope.parent.LoadingPage = false;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.getAgencyLicenses();

    // Retrieve taxes.
    policyService.checkTaxes($scope.PolicyId, $scope.parent.RiskCompanyId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.InfoMessages = result.data.Result.Info;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    elanyService.isSigned($scope.PolicyId).then(function (result) {
      if (result.data.Success) {
        $scope.AffidavitCSigned = result.data.Model;
      } else {
        $scope.Errors = result.data.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      }
    );
  }

  $scope.getAgencyLicenses = function () {
    var policy = $scope.parent.Policy;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    agencyService.getAgencyLicenses(policy.OriginalAgencyId, $scope.AppId, policy.HomeStateCode, policy.Effective).then(function (result) {
      Metronic.unblockUI();
      $scope.LicensedAgents = result.data;

      if ($scope.LicensedAgents.length == 1)
        policy.ProducingAgencyLicense = $scope.LicensedAgents[0].LicenseNumber;
      if ($scope.LicensedAgents.length == 0)
        $scope.ErrorList = ["Please email the Customer Care team your AIM Submission number so they can get the agency information updated in order to bind this account in BOL."];
    }, function (error) {
      Metronic.unblockUI();
      $scope.ErrorList = error.data.Message.split("\r\n");
    });
  };

  $scope.updateBindErrorList = function (RiskCompanyId) {
    $scope.ErrorList = [];
    if ($scope.parent.Policy.ValidateBindByCompany.length > 0) {
      for (var i = 0; i < $scope.parent.Policy.ValidateBindByCompany.length; i++) {
        if ($scope.parent.Policy.ValidateBindByCompany[i].AppRiskCompanyId == RiskCompanyId && $scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors.length > 0) {
          for (var j = 0; j < $scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors.length; j++) {
            $scope.ErrorList.push($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j]);
          }
        }
      }
    }
  }

  $scope.checkForBindErrors = function () {
    var errorList = [];
    if ($scope.Policy.CurrentVersion.FocusedRiskCompanyId == null) {
      return errorList.push("No risk company has been selected");
    }
    var riskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;

    if ($scope.Policy.ValidateBindByCompany.length > 0) {
      for (var i = 0; i < $scope.Policy.ValidateBindByCompany.length; i++) {
        if ($scope.Policy.ValidateBindByCompany[i].AppRiskCompanyId == riskCompanyId && $scope.Policy.ValidateBindByCompany[i].ValidationErrors.length > 0) {
          for (var j = 0; j < $scope.Policy.ValidateBindByCompany[i].ValidationErrors.length; j++) {
            errorList.push($scope.Policy.ValidateBindByCompany[i].ValidationErrors[j]);
          }
        }
      }
    }
    return errorList;
  }

  $scope.addRemoveIndcludeTria = function () {
    if ($scope.IncludeTria) {
      // Add 
      policyService.addCoverage($scope.PolicyId, ['TRIA']).then(function (result) {
        if (result.data.Result.Success) {
          $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
          $scope.parent.Coverages.push('TRIA');
        }
        else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }
    else {
      policyService.deleteCoverage($scope.PolicyId, ['TRIA']).then(function (result) {
        if (result.data.Result.Success) {
          $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
          $scope.parent.Coverages.splice($scope.parent.Coverages.indexOf('TRIA'), 1);
        }
        else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }
  }

  $scope.accountExecSelected = function () {
    for (var i = 0; i < $scope.AccountExecutives.length; i++) {
      if ($scope.parent.Policy.UnderwriterId === $scope.AccountExecutives[i].Id) {
        $scope.parent.Policy.OfficeId = $scope.AccountExecutives[i].OfficeId;
      }
    }
  }

  $scope.effectiveDateChanged = function () {
    updateLateBind();
    var termLength = $scope.parent.Policy.PolicyTerm;

    if ($scope.parent.Policy.Effective == undefined || $scope.parent.Policy.Effective === "") return;

    $scope.ErrorList = [];
    var checkDate = new Date($scope.parent.Policy.Effective).toString();
    if (checkDate === "Invalid Date") {
      $scope.parent.Policy.Expiration = "";
      $scope.parent.Policy.Effective = "";
      $scope.ErrorList.push("The effective date entered is not valid");
      return;
    }

    var today = new Date($scope.parent.Policy.Effective);

    // check to make sure that user cant go past three days if not late binder
    if (!$scope.lateBinder) {
      var threeDaysPast = new Date();
      threeDaysPast.setHours(0, 0, 0, 0);
      threeDaysPast.setDate(threeDaysPast.getDate() - 3);

      // check to make sure user did not enter a date past three days in the past
      if (today.getTime() < threeDaysPast.getTime()) {
        $scope.parent.Policy.Expiration = "";
        $scope.parent.Policy.Effective = "";
        $scope.ErrorList.push("The effective date cannot be more than three days in the past");
        return;
      }
    }

    // make a date that is 6 months in the furture
    var sixMonths = new Date();
    sixMonths.setHours(0, 0, 0, 0);
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    // if effective is greater than six months in the future show error
    if (today.getTime() > sixMonths.getTime()) {
      $scope.parent.Policy.Expiration = "";
      $scope.parent.Policy.Effective = "";
      $scope.ErrorList.push("The effective date cannot be more than six months in the future");
      return;
    }

    var expirationDate = new Date(today.setMonth(today.getMonth() + termLength));

    if (termLength != 0 || expirationDate <= today) {

      var dd = expirationDate.getDate();
      var mm = expirationDate.getMonth() + 1;
      var yyyy = expirationDate.getFullYear();

      $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;

      policyService.checkTaxes($scope.PolicyId, $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId).then(function (result) {
        if (result.data.Result.Success) {
          $scope.InfoMessages = result.data.Result.Info;
        }
        else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
      });
    }

    $scope.saved = false;
  }

  $scope.saveChanges = function () {
    $scope.ErrorList = [];
    $scope.validatePage();
    if ($scope.ErrorList.length > 0) {
      return;
    }

    policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, []).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.ValidationErrorList = [];

        if ($scope.parent.Policy.ValidateBindByCompany.length > 0) {
          for (var i = 0; i < $scope.parent.Policy.ValidateBindByCompany.length; i++) {
            if ($scope.parent.Policy.ValidateBindByCompany[i].AppRiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId && $scope.parent.Policy.ValidateBindByCompany[i].length > 0) {
              for (var j = 0; j < $scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors.length; j++) {
                $scope.ValidationErrorList.push($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j]);
              }
            }
          }
        }
        $scope.doesServerRequireLateBind($scope.ValidationErrorList);

        var isCustomPackage = $scope.isCustomPackageRiskCompany($scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId);
        if (isCustomPackage) {
          $scope.parent.Policy.CoverageCode = $scope.parent.DefaultElanyCoverage;
          $scope.parent.Policy.RiskCode = $scope.parent.DefaultElanyRisk;
          $scope.parent.Policy.CoverageCode2 = $scope.parent.DefaultElanyCoverage2;
          $scope.parent.Policy.RiskCode2 = $scope.parent.DefaultElanyRisk2;
        }
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.openShowBoundPoliciesModal = function (propertySubmissionNumber, liabilitySubmissionNumber) {
    var modalInstance = $modal.open({
      templateUrl: 'showBoundPolicies.html',
      controller: 'test_Commercial_Lines_showBoundPolicies',
      windowClass: 'showBoundPoliciesModal',
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        propertySubmissionNumber: function () {
          return propertySubmissionNumber;
        },
        liabilitySubmissionNumber: function () {
          return liabilitySubmissionNumber;
        }
      }
    });
    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
      }
    });
  };

  function aimSubmissionModal() {
    var modalInstance = $modal.open({
      templateUrl: 'aimSubmission.html',
      controller: 'test_Commercial_Lines_aimSubmissionCtrl',
      backdrop: 'static'
    });

    modalInstance.result.then(function (data) {
      if (data !== 'cancel') {
        $scope.bindQuoteFinal(data);
      }
    });
  }

  $scope.bindQuote = function () {
    //$scope.bindQuoteFinal();
    //return;
    var isCustomPackage = $scope.isCustomPackageRiskCompany($scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId);
    if ($scope.parent.Policy.ManagingGeneralAgentId.toUpperCase() == '6F8F9A04-0D1D-424D-B1DA-5A1B72629129' && !isCustomPackage) {
      if ($scope.parent.Policy.MGASubmissionNumber == null || $scope.parent.Policy.MGASubmissionNumber == '') {
        aimSubmissionModal();
      } else {
        policyService.isSubmissionBound($scope.parent.Policy.MGASubmissionNumber)
          .then(res => res.data || aimService.isBound($scope.parent.Policy.MGASubmissionNumber).then(x => x.data))
          .then(function (result) {
            if (result) {
              $scope.parent.Policy.MGASubmissionNumber = null;
              aimSubmissionModal();
            } else {
              $scope.bindQuoteFinal(null);
            }
          });
      }
    } else {
      $scope.bindQuoteFinal($scope.parent.Policy.MGASubmissionNumber);
    }
  }

  $scope.bindQuoteFinal = function (submissionNumber) {
    policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, []).then(function (result) {
      var isCustomPackage = $scope.isCustomPackageRiskCompany($scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId);
      var coverageCodes = [];
      var riskCodes = [];
      if (isCustomPackage) {
        coverageCodes.push($scope.parent.Policy.CoverageCode);
        coverageCodes.push($scope.parent.Policy.CoverageCode2);
        riskCodes.push($scope.parent.Policy.RiskCode);
        riskCodes.push($scope.parent.Policy.RiskCode2);
      }
      test_policyService.bindQuote($scope.PolicyId, $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId, true, submissionNumber, coverageCodes, riskCodes).then(function (result) {
        if (result.data.Result.Success) {
          if (result.data.Result.Info.length > 1) {
            var property = result.data.Result.Info[0];
            var liability = result.data.Result.Info[1];

            $scope.openShowBoundPoliciesModal(property, liability);
            return;
          }

          $scope.parent.Policy = result.data.Policy;
          $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
          // Check if coverages have tria
          if ($scope.parent.Coverages.filter(x => x == 'TRIA').length > 0) {
            $scope.IncludeTria = true;
          }

          $scope.PremiumBreakdowns = $scope.parent.Policy.PremiumBreakdowns;

          loadPolicy();
        }
        else {
          $scope.ValidationErrorList = result.data.Result.Errors;
          if (result.data.Policy != null) {
            $scope.parent.Policy = result.data.Policy;
            $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
          }
          $scope.doesServerRequireLateBind(result.data.Result.Errors);
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.submitForBindQuote = function () {
    policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, []).then(function (result) {
      policyService.submitForBindQuote($scope.PolicyId, $scope.RiskCompanies[0].Id).then(function (result) {
        if (result.data.Result.Success) {
          $scope.parent.Policy = result.data.Policy;
          $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
          $scope.parent.Coverages = result.data.Coverages;
          // Check if coverages have tria
          if ($scope.parent.Coverages.filter(x => x == 'TRIA').length > 0) {
            $scope.IncludeTria = true;
          }
        }
        else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  // Function that handles page validation for user inputs
  $scope.validatePage = function () {
    $scope.ErrorList = [];

    if ($scope.hasInspectionFee()) {
      if (checkInput($scope.parent.Policy.InspectionContact)) {
        $scope.ErrorList.push('Inspection Contact cannot be blank.');
      }

      if (checkInput($scope.parent.Policy.InspectionPhone)) {
        $scope.ErrorList.push('Inspection Phone cannot be blank.');
      }
    }

    if (checkInput($scope.parent.Policy.ProducingAgencyLicense)) {
      $scope.ErrorList.push('Licensed Agent cannot be blank.');
    }

    if ($scope.LicensedAgents == null || $scope.LicensedAgents.length == 0) {
      $scope.ErrorList = ["Please email the Customer Care team your AIM Submission number so they can get the agency information updated in order to bind this account in BOL."];
      return;
    }

    if (checkInput($scope.parent.Policy.Effective)) {
      $scope.ErrorList.push('Effective date cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.Expiration)) {
      $scope.ErrorList.push('Expiration date cannot be blank.');
    }

    $scope.validateRsuiSubmits();

    if ($scope.LateBind.IsLateBind && !$scope.parent.Policy.Issued) {
      if (!$scope.LateBind.UserHasAcknowledged)
        $scope.ErrorList.push('Must acknowledge you have received carrier approval for late bind.');
      else if (checkInput($scope.parent.Policy.LateBindApprovedBy))
        $scope.ErrorList.push('Late Bind Approved By cannot be blank.');
    }

    if ($scope.isNyQuote()) {
      // Check if the coverage code and risk codes have a selection.
      if (checkInput($scope.parent.Policy.CoverageCode)) {
        $scope.ErrorList.push('Coverage code cannot be blank.');
      }

      if (checkInput($scope.parent.Policy.RiskCode)) {
        $scope.ErrorList.push('Risk code cannot be blank.');
      }

      var isCustomPackage = $scope.isCustomPackageRiskCompany($scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId);
      if (isCustomPackage) {
        if (checkInput($scope.parent.Policy.CoverageCode2)) {
          $scope.ErrorList.push('Coverage code cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.RiskCode2)) {
          $scope.ErrorList.push('Risk code cannot be blank.');
        }
      }
    }
  }

  $scope.validateRsuiSubmits = function () {
    var policy = $scope.parent.Policy;
    var riskCompanyId = policy.CurrentVersion.FocusedRiskCompanyId;
    var rsuiMarketId = "6d719a07-b422-4c38-9a7c-e9df837f3010";

    if (riskCompanyId == rsuiMarketId) {
      var approvedSubmits = policy.Submits.filter(function (submit) {
        return submit.RiskCompanyId == riskCompanyId && submit.Approved;
      });

      if (approvedSubmits.length > 0 && checkInput(policy.ReferralNumber) && policy.CurrentVersion.RenewalOf == null) {
        $scope.ErrorList.push("Referral number is required to bind for approved RSUI submits.");
      }
    }
  }

  function checkInput(input) {
    if (input === '' || input === undefined || input === null) {
      return true;
    }
    else {
      return false;
    }
  }

  $scope.confirmRenewal = function (submitForBind) {
    // Check for errors.
    $scope.validatePage();
    if ($scope.ErrorList.length > 0)
      return;

    // Confirm binding if the policy is not a renewal.
    var policy = $scope.parent.Policy;
    if (policy.RenewalOf == null || policy.RenewalOf == '') {
      $scope.confirmBind(submitForBind);
      return;
    }

    // Check if the renewal policy's effective date or risk company has changed. If so, prompt the user to continue.
    test_policyService.confirmRenewal($scope.PolicyId, policy.Effective, policy.RenewalOf, policy.CurrentVersion.FocusedRiskCompanyId).then(function (result) {
      var hasSameEffective = result.data.HasSameEffective;
      var hasSameRiskCompany = result.data.HasSameRiskCompany;
      if (hasSameEffective && hasSameRiskCompany) {
        $scope.confirmBind(submitForBind);
        return;
      }

      // Open user prompt modal. Confirm bind if the user clicks 'Continue'.
      var modalInstance = $modal.open({
        templateUrl: 'confirmRenewal.html',
        controller: 'test_Commercial_Lines_confirmRenewalCtrl',
        backdrop: 'static',
        resolve: {
          hasSameEffective: function () { return hasSameEffective; },
          hasSameRiskCompany: function () { return hasSameRiskCompany; }
        }
      });

      modalInstance.result.then(function (data) {
        if (data != 'cancel')
          $scope.confirmBind(submitForBind);
      });
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.confirmBind = function (submitForBind) {
    $scope.validatePage();

    if ($scope.ErrorList.length > 0) {
      return;
    }

    if ($scope.parent.Policy.ValidateBindByCompany.length > 0) {
      for (var i = 0; i < $scope.parent.Policy.ValidateBindByCompany.length; i++) {
        if ($scope.parent.Policy.ValidateBindByCompany[i].AppRiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId && $scope.parent.Policy.ValidateBindByCompany[i].length > 0) {
          for (var j = 0; j < $scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors.length; j++) {
            if ($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j].indexOf('required to be filled in') !== -1) {
              $scope.ValidationErrorList.push($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j]);
            }
          }
        }
      }

      if ($scope.ValidationErrorList.length > 0)
        return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'test_Commercial_Lines_confirmBind.html',
      controller: 'test_Commercial_Lines_confirmBindCtrl',
      backdrop: 'static',
      resolve: {
        scope: function () {
          return $scope;
        },
        riskCompany: function () {
          var company = "";
          for (var i = 0; i < $scope.parent.RiskCompanies.length; i++) {
            if ($scope.parent.RiskCompanies[i].Id == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId) {
              company = $scope.parent.RiskCompanies[i].Name;
            }
          }
          return company;
        },
        totalPremium: function () {
          var premium = -1;
          for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Premiums.length; i++) {
            if ($scope.parent.Policy.CurrentVersion.Premiums[i].RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId) {
              premium = $scope.parent.Policy.CurrentVersion.Premiums[i].PremiumAfterFeesAndTaxes;
            }
          }
          return premium;
        },
        effectiveDate: function () {
          return $scope.parent.Policy.Effective;
        }
      }
    });


    modalInstance.result.then(function (data) {
      if (data !== 'cancel') {
        if (submitForBind) {
          $scope.submitForBindQuote();
        }
        else {
          $scope.bindQuote();
        }
      }
    });
  }

  $scope.confirmIssue = function (submitForBind) {
    $scope.validatePage();

    if ($scope.ErrorList.length > 0) {
      return;
    }

    if ($scope.parent.Policy.ValidateBindByCompany.length > 0) {
      for (var i = 0; i < $scope.parent.Policy.ValidateBindByCompany.length; i++) {
        if ($scope.parent.Policy.ValidateBindByCompany[i].AppRiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId && $scope.parent.Policy.ValidateBindByCompany[i].length > 0) {
          for (var j = 0; j < $scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors.length; j++) {
            if ($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j].indexOf('required to be filled in') !== -1) {
              $scope.ValidationErrorList.push($scope.parent.Policy.ValidateBindByCompany[i].ValidationErrors[j]);
            }
          }
        }
      }

      if ($scope.ValidationErrorList.length > 0)
        return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'confirmIssue.html',
      controller: 'test_Commercial_Lines_confirmIssueCtrl',
      backdrop: 'static',
      resolve: {
        scope: function () {
          return $scope;
        },
        riskCompany: function () {
          var company = "";
          for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            if ($scope.RiskCompanies[i].Id == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId) {
              company = $scope.RiskCompanies[i].Name;
            }
          }
          return company;
        },
        totalPremium: function () {
          var premium = -1;
          for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Premiums.length; i++) {
            if ($scope.parent.Policy.CurrentVersion.Premiums[i].RiskCompanyId == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId) {
              premium = $scope.parent.Policy.CurrentVersion.Premiums[i].PremiumAfterFeesAndTaxes;
            }
          }
          return premium;
        }
      }
    });


    modalInstance.result.then(function (data) {
      if (data !== 'cancel') {
        if (submitForBind) {
        }
        else {
          $scope.issueBinder();
        }
      }
    });
  }

  $scope.issueBinder = function () {
	  policyService.updateProposal($scope.PolicyId, $scope.parent.Policy, []).then(function (result) {
		  test_policyService.issueBinder($scope.PolicyId, $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId, true, null).then(function (result) {
			  if (result.data.Result.Success) {
				  $scope.parent.Policy = result.data.Policy;
				  $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
				  // Check if coverages have tria
				  if ($scope.parent.Coverages.filter(x => x == 'TRIA').length > 0) {
					  $scope.IncludeTria = true;
				  }

				  $scope.PremiumBreakdowns = $scope.parent.Policy.PremiumBreakdowns;

				  loadPolicy();
			  }
			  else {
				  $scope.ValidationErrorList = result.data.Result.Errors;
			  }
		  }, function (error) {
			  $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
		  });
	  }, function (error) {
			  $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
	  });
  }

  $scope.unbindPolicy = function () {
    policyService.unbindPolicy($scope.PolicyId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.PremiumBreakdowns = $scope.parent.Policy.PremiumBreakdowns;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.isNyQuote = function () {
    var policy = $scope.parent.Policy;
    return policy != null && policy.HomeStateCode == "NY";
  }

  $scope.uploadAffidavitC = function () {
    Metronic.blockUI({ animate: true, overlayColor: "none" });
    elanyService.getCompanies().then(function (result1) {
      if (!result1.data.Success) {
        Metronic.unblockUI();
        $scope.Errors.push('An unexpected error occurred. Please refresh the page.');
        return;
      }

      var companyInfo = result1.data.Model;

      elanyService.getAffidavitCCompanies($scope.parent.Policy.Id).then(function (result2) {
        Metronic.unblockUI();
        if (!result2.data.Success) {
          $scope.Errors.push('An unexpected error occurred. Please refresh the page.');
          return;
        }

        var companies = result2.data.Model;

        var modalInstance = $modal.open({
          templateUrl: 'validateAffidavitC.html',
          controller: 'test_Homeowners_validateAffidavitCCtrl',
          backdrop: 'static',
          resolve: {
            policy: function () { return $scope.parent.Policy; },
            companyInfo: function () { return companyInfo; },
            companies: function () { return companies; },
            uploadedDocuments: function () { return $scope.parent.UploadedDocuments; }
          }
        });

        modalInstance.result.then(function (data) {
          if (data !== 'cancel') {
            $scope.AffidavitCSigned = true;
            $scope.confirmRenewal(false);
          }
        });
      });
    });
  }

  $scope.declineBindRequest = function () {
    // Ensure before continuing that the quote was made in Commercial Portal and has an unapproved bind request.
    if ($scope.parent.IsCommercialPortalQuote()) {
      if ($scope.parent.IsRequestedToBind() && !$scope.parent.IsRequestedToBindDeclined()) {
        // Shorthand reference to policy.
        var policy = $scope.parent.Policy;
        // Make API call to decline agent bind request.
        policyService.declineAgentRequestToBind(policy.Id).then((result) => {
          var data = result.data;
          // Upon success, include the attribute in the policy.
          if (data.Result.Success) { policy.Attributes.push(data.Attribute); }
          // Display error message.
          else { $scope.Errors = data.Result.Errors; }
        }, (error) => {
          $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
        })
      }
    }
  }

  $scope.hasAnyPremium = function () {
    return $scope.parent.Policy.CurrentVersion.Premiums.length > 0;
  }

  $scope.canBind = function () {
    if ($scope.parent.IsCommercialPortalQuote()) {
      if ($scope.parent.IsRequestedToBind() && $scope.parent.IsRequestedToBindDeclined()) {
        return false;
      }
    }

    var policy = $scope.parent.Policy;

    return $scope.hasAnyPremium()
      && $scope.checkForQuoteErrors().length == 0
      && $scope.checkForBindErrors().length == 0
      && !policy.Issued && !policy.Bound
      && !$scope.parent.PolicyInWorkflow()
      && (!$scope.isNyQuote() || ($scope.isNyQuote() && $scope.AffidavitCSigned));
  }

  $scope.canIssue = function () {
    if ($scope.parent.IsCommercialPortalQuote()) {
      if ($scope.parent.IsRequestedToBind() && $scope.parent.IsRequestedToBindDeclined()) {
        return false;
      }
    }

    var policy = $scope.parent.Policy;

    return $scope.hasAnyPremium()
      && $scope.checkForQuoteErrors().length == 0
      && $scope.checkForBindErrors().length == 0
      && !policy.Issued && policy.Bound
      && !$scope.parent.PolicyInWorkflow()
      && (!$scope.isNyQuote() || ($scope.isNyQuote() && $scope.AffidavitCSigned));
  }

  $scope.canUploadAffidavitC = function () {
    if ($scope.parent.IsCommercialPortalQuote()) {
      if ($scope.parent.IsRequestedToBind() && $scope.parent.IsRequestedToBindDeclined()) {
        return false;
      }
    }

    var policy = $scope.parent.Policy;

    return $scope.hasAnyPremium()
      && $scope.checkForQuoteErrors().length == 0
      && $scope.checkForBindErrors().length == 0
      && !policy.Issued
      && !$scope.parent.PolicyInWorkflow()
      && $scope.isNyQuote()
      && !$scope.AffidavitCSigned;
  }

  $scope.onFileUploaded = function (element, name) {
    var file = element.files[0];

    if (file != null) {
      var existingEntry = $scope.getDocument(name);

      if (existingEntry != null) {
        existingEntry.FileName = file.name;
        createFileByteArray(file, existingEntry);
      } else {
        var newEntry = {
          Name: name,
          FileName: file.name
        };
        createFileByteArray(file, newEntry);
        $scope.parent.UploadedDocuments.push(newEntry);
      }
    }

    $scope.$apply();
  }

  $scope.uploadFile = function (elementId) {
    var element = $("#" + elementId);

    if (element != null)
      element.click();
  }

  $scope.downloadDocument = function (name) {
    var doc = $scope.getDocument(name);

    if (doc != null) {
      var blob = new Blob([new Uint8Array(doc.Data)], { type: "application/pdf" });
      var url = window.URL || window.webkitURL;
      var downloadUrl = url.createObjectURL(blob);
      var tag = document.createElement("a");

      if (tag.download == null) {
        window.location = downloadUrl;
      } else {
        tag.href = downloadUrl;
        tag.download = doc.FileName;
        document.body.appendChild(tag);
        tag.click();
      }

      setTimeout(function () { url.revokeObjectURL(downloadUrl); }, 100);
    }
  }

  $scope.getDocument = function (name) {
    return $scope.parent.UploadedDocuments.find(function (x) { return x.Name == name });
  }

  function createFileByteArray(file, entry) {
    var reader = new FileReader();

    reader.onload = function () {
      var buffer = new Uint8Array(this.result);
      entry.Data = Array.from(buffer);
      uploadDocumentToBlob(entry);
    }

    reader.readAsArrayBuffer(file);
  }

  function uploadDocumentToBlob(document) {
    var policyId = $scope.parent.Policy.Id;

    policyService.uploadDocumentToBlob(policyId, document).then(function (result) {
      if (!result.data.Result.Success) {
        $scope.ErrorList = result.data.Result.Errors;
      }
    }, function (error) {
      console.log(error);
      $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  if ($scope.PolicyId) { // Existing Policy
    loadPolicy();
  }
  else {
    $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
  }
}]);

MALACHIAPP.controller('test_Commercial_Lines_confirmRenewalCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'hasSameEffective', 'hasSameRiskCompany', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, hasSameEffective, hasSameRiskCompany) {
  $scope.HasSameEffective = hasSameEffective;
  $scope.HasSameRiskCompany = hasSameRiskCompany;

  $scope.close = function (action) {
    $modalInstance.close(action);
  }
}]);

MALACHIAPP.controller('test_Commercial_Lines_confirmBindCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'scope', 'riskCompany', 'totalPremium', 'effectiveDate', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, scope, riskCompany, totalPremium, effectiveDate) {
  $scope.riskCompany = riskCompany;
  $scope.totalPremium = totalPremium;
  $scope.effectiveDate = effectiveDate;
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    $modalInstance.close('bind');
  }

}]);

MALACHIAPP.controller('test_Commercial_Lines_confirmIssueCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'scope', 'riskCompany', 'totalPremium', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, scope, riskCompany, totalPremium) {
  $scope.riskCompany = riskCompany;
  $scope.totalPremium = totalPremium;

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    $modalInstance.close('issue');
  }

}]);

MALACHIAPP.controller('test_Commercial_Lines_aimSubmissionCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'test_policyService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, test_policyService) {

  $scope.noExistingSubmission = false;
  $scope.submissionInfo = null;
  $scope.submissionConfirmed = false;
  $scope.submission = { Number: '', Confirmed: false, noExistingSubmission: false };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    if ($scope.submission.Confirmed) {
      $modalInstance.close($scope.submission.Number);
    } else {
      $modalInstance.close(null);
    }
  }

  $scope.search = function () {
    $scope.submissionInfo = null;
    $scope.submission.Confirmed = false;

    test_policyService.getExternalSubmission($scope.submission.Number).then(function (result) {
      if (result.data.Result.Success) {
        $scope.submissionInfo = result.data;
      } else {
      }
    }, function (error) {
    });
  }
}]);

MALACHIAPP.controller('test_Commercial_Lines_showBoundPolicies', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$timeout', 'settings', 'policyService', 'toolsService', 'authService', 'propertySubmissionNumber', 'liabilitySubmissionNumber', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $timeout, settings, policyService, toolsService, authService, propertySubmissionNumber, liabilitySubmissionNumber) {
  $scope.Errors = [];

  $scope.PropertySubmissionNumber = propertySubmissionNumber;
  $scope.LiabilitySubmissionNumber = liabilitySubmissionNumber;

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('policyDashboard');
  };
}]);

MALACHIAPP.controller('test_Homeowners_validateAffidavitCCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'test_policyService', 'elanyService', 'policy', 'companyInfo', 'companies', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, test_policyService, elanyService, policy, companyInfo, companies) {

  $scope.Policy = policy;
  $scope.CompanyInfo = companyInfo;
  $scope.Companies = companies;
  if ($scope.Companies == null) {
    $scope.Companies = [{}, {}, {}];
  } else {
    $scope.Companies.forEach(function (company) {
      company.Info = $scope.CompanyInfo.filter(info => info.Name === company.Name)[0];
    });
  }
  $scope.Errors = [];
  $scope.Document = {};

  $scope.setCompanyInfo = function (company, companyInfo) {
    company.Name = companyInfo.Name;
    //company.NaicCode = companyInfo.Code;
  }

  $scope.onFileUploaded = function (element) {
    var file = element.files[0];
    $scope.Document.Name = file.name;
    var reader = new FileReader();
    reader.onload = function () {
      var buffer = new Uint8Array(this.result);
      $scope.Document.Data = Array.from(buffer);
    }
    reader.readAsArrayBuffer(file);
    $scope.$apply();
  }

  $scope.close = function () {
    $modalInstance.close('cancel');
  }

  function isNullOrEmpty(s) {
    return s == null || s === '';
  }

  $scope.isComplete = function (company) {
    return !(isNullOrEmpty(company.Name) ||
      isNullOrEmpty(company.NaicCode) ||
      isNullOrEmpty(company.DateDeclining) ||
      isNullOrEmpty(company.FirstNameOfRepresentative) ||
      isNullOrEmpty(company.LastNameOfRepresentative));
  }

  $scope.validateInputs = function () {
    $scope.Errors = [];
    for (let i = 0; i < $scope.Companies.length; i++) {
      let company = $scope.Companies[i];
      validateCompany(company, i);
    }
    if (!$scope.Document.Data) {
      $scope.Errors.push('Please upload the Affidavit C document.');
    }
    if (!$scope.Document.NelpChecked) {
      $scope.Errors.push('Please check the box above.');
    }
  }

  function validateCompany(company, i) {
    if (!$scope.isComplete(company)) {
      $scope.Errors.push(`Please fill in all the fields for Company ${i + 1}.`);
    }
    if (company.DateDeclining !== null) {
      let declining = new Date(company.DateDeclining);
      let effective = new Date(policy.Effective);
      if (declining > effective) {
        $scope.Errors.push(`The Date Declining for Company ${i + 1} is invalid. It must be before the effective date of the quote.`);
      }
      let ninetyDaysBefore = new Date(effective);
      ninetyDaysBefore.setDate(ninetyDaysBefore.getDate() - 90);
      if (declining < ninetyDaysBefore) {
        $scope.Errors.push(`The Date Declining for Company ${i + 1} is invalid. It must not be more than 90 days before the effective date of the quote.`);
      }
    }
    if (company.Name != null && $scope.Companies.filter(x => x.Name === company.Name).length > 1) {
      $scope.Errors.push(`Please don't enter the same company more than once: ${company.Name}.`);
    }
    let info = $scope.CompanyInfo.find(i => i.Name === company.Name);
    if (info.Code !== company.NaicCode) {
      $scope.Errors.push(`NAIC code for ${company.Name} should be ${info.Code}. Ensure the code on the Affidavit C is correct before uploading.`);
    }
  }

  $scope.next = function () {
    var active = $scope.Companies.findIndex(c => c.active);
    $scope.Errors = [];
    validateCompany($scope.Companies[active], active);
    if ($scope.Errors.length > 0)
      return;
    if (active == 2) {
      $scope.Document.Active = true;
    } else {
      $scope.Companies[active + 1].active = true;
    }
  }

  $scope.back = function () {
    var active = $scope.Companies.findIndex(c => c.active);
    if (active == -1) {
      $scope.Companies[2].active = true;
      return;
    }
    $scope.Companies[active - 1].active = true;
  }

  $scope.confirm = function () {
    $scope.validateInputs();
    if ($scope.Errors.length > 0) {
      return;
    }
    Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });
    elanyService.sign({
      AffidavitC: {
        PolicyId: policy.Id,
        Companies: $scope.Companies,
        Signature: ''
      },
      Document: $scope.Document.Data
    }).then(
      function (result) {
        Metronic.unblockUI(".modal-dialog");
        $modalInstance.close('confirm');
      },
      function (error) {
        Metronic.unblockUI(".modal-dialog");
        $scope.Errors = ['An unexpected error occurred. Please refresh the page.'];
      });
  }
}]);