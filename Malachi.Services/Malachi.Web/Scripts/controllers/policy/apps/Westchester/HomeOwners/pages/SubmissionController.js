'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_SubmissionController', ['authService', '$rootScope', '$scope', '$location', '$timeout', '$filter', '$stateParams', '$ocLazyLoad', 'notificationsHub', 'settings', 'policyService', 'toolsService', 'test_policyService', '$modal', function (authService, $rootScope, $scope, $location, $timeout, $filter, $stateParams, $ocLazyLoad, notificationsHub, settings, policyService, toolsService, test_policyService, $modal) {
  $scope.parent = $scope.$parent;

  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
  });

  $scope.saved = true;
  $scope.toggleManaulAddressEntry = false;
  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.ErrorMessage = '';
  $scope.WarningMessage = '';
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.lateBinder = $.inArray("Late Binding Authority", authService.authentication.roles) > -1;
  $scope.officeId = authService.authentication.officeId;

  $scope.MinimumEarnedPremiums = ['25%', '50%', '100%'];

  $scope.AllowedStates = [
    {
      Code: 'FL',
      Name: 'Florida'
    }
  ];

  // Only doing 12 months in NPL now.
  $scope.PolicyTermOptions = [
    {
      id: 12,
      name: '12 Months'
    }
    //{
    //  id: 6,
    //  name: '6 Months'
    //},
    //{
    //  id: 3,
    //  name: '3 Months'
    //},
    //{
    //  id: 2,
    //  name: '2 Months'
    //},
    //{
    //  id: 1,
    //  name: '1 Month'
    //}
  ];

  $scope.FormOfBusiness = [
    '',
    'Partnership',
    'Corporation',
    'Individual',
    'Limited Liability Company',
    'Limited Liability Partnership',
    'Joint Venture',
    'Not For Profit',
    'Trust'
  ];
  $scope.Contacts = [];
  $scope.LicensedAgents = [];
  $scope.Agencies = [];


  if ($scope.AppId != null) {

  }

  $scope.parent.Policy.ManagingGeneralAgentId = '6F8F9A04-0D1D-424D-B1DA-5A1B72629129';

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


  if ($scope.PolicyId) { // Existing Policy
    loadPolicy();
  } else {
    $scope.parent.Policy.FormOfBussiness = 'Individual';
    $scope.parent.Policy.PolicyTerm = 12;
    $scope.createSubmission = function () {
      $scope.validatePage();
      if ($scope.ErrorList.length > 0) {
        return;
      }

      $scope.verifyMEP();

      $scope.saved = true;

      $scope.parent.Policy.CurrentVersion.Subjectivities =
        'Completed and signed homeowner application\n' +
        'Completed and signed Surplus Lines disclaimer/affidavit (if applicable)\n' +
        'Confirmation of no losses on the signed application or no known loss letter, signed by insured\n' +
        'Any required supplemental applications that may apply';

      // Account for the custom subjectivites for Alabama and Mississippi
      $scope.verifySubjectivities();

      policyService.newSubmission($scope.AppId, new Date().getTimezoneOffset(), ['Homeowners'], $scope.parent.Policy).then(function (result) {
        if (result.data.Result.Success) {

          $scope.parent.PolicyId = result.data.Policy.Id;
          $scope.parent.Policy = result.data.Policy;
          $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
          $scope.parent.Coverages = result.data.Coverages;
          $scope.parent.RiskCompanies = $scope.RiskCompanies = result.data.RiskCompanies;
          $scope.parent.RiskCompanyId = $scope.parent.Policy.CurrentVersion.RiskCompanyId;
          if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

          if (!$scope.parent.Policy.MGASubmissionNumber) {
            $scope.getMgaSubmissionNumber();
          }

          $timeout(function () { $('#lnkLocations').click(); }, 0, false);
          notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
        } else {
          $scope.ErrorList = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
      });
    }

    $scope.showSubmissionClearance = function () {
      var modalInstance = $modal.open({
        templateUrl: 'submissionClearanceModelContent.html',
        controller: 'submissionClearanceModelCtrl',
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        resolve: {
          policy: function () {
            return $scope.parent.Policy;
          }, 
          appId: function () {
            return $scope.AppId;
          }
        }
      });

      modalInstance.result.then(function (param) {
        if (param != 'back') {
          $scope.parent.showPropertyGuidelines();
        } else {
          $rootScope.$state.transitionTo('policyDashboard');
        }
      });
    }

    $scope.defaultPolicyTerm = function () {
      $scope.parent.Policy.PolicyTerm = 12;
      $scope.parent.Policy.MinimumEarnedPremium = '25%';

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();

      $scope.parent.Policy.Effective = mm + '/' + dd + '/' + yyyy;

      var expirationDate = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      expirationDate.setMonth(expirationDate.getMonth() + $scope.parent.Policy.PolicyTerm);

      dd = expirationDate.getDate();
      mm = expirationDate.getMonth() + 1;
      yyyy = expirationDate.getFullYear();

      $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
    }

    $scope.defaultPolicyTerm();
  }

  function loadPolicy() {
    if ($scope.parent.Policy.CurrentVersion.Locations == null) {
      policyService.getPolicy($scope.PolicyId).then(function (result) {
        if (result.data.Result.Success) {
          $scope.parent.Policy = result.data.Policy;
          $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
          $scope.parent.Coverages = result.data.Coverages;
          $scope.parent.RiskCompanies = $scope.RiskCompanies = result.data.RiskCompanies;
          $scope.parent.RiskCompanyId = $scope.parent.Policy.CurrentVersion.RiskCompanyId;
          //Adding this address code incase the policy is homeowners because we send Apt. as street address 2
          //this causes the AddressUnitDesignator to duplicate in the address
          var address = $scope.parent.Policy.Insured.MailingAddress;
          if ($scope.parent.Policy.AppId == "001d0418-a168-4be3-84a8-0168eda970fd" && address.AddressUnitDesignator != "" && address.AddressUnitDesignator != null) {
            $scope.parent.Policy.Insured.MailingAddress.ShortAddress = address.StreetAddress1 + " " + address.City + ", " + address.StateCode + ", " + address.Zip;
          }

          if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

          $scope.parent.getAppContracts();
          $scope.parent.LoadingPage = false;
        } else {
          $scope.ErrorList = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
      });
    } else {
      $scope.parent.LoadingPage = false;
    }
  }

  $scope.searchByBeginsWith = function (actual, expected) {
    var lowerSearchString = (actual + '').toLowerCase();
    return lowerSearchString.indexOf(expected.toLowerCase()) === 0;
  }

  $scope.accountExecSelected = function () {
    for (var i = 0; i < $scope.AccountExecutives.length; i++) {
      if ($scope.parent.Policy.UnderwriterId == $scope.AccountExecutives[i].Id) {
        // removed OfficeId assignment
		$scope.parent.Policy.UnderwriterEmail = $scope.AccountExecutives[i].Email
      }
    }
  }

  $scope.effectiveDateChanged = function () {
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

    var dd = expirationDate.getDate();
    var mm = expirationDate.getMonth() + 1;
    var yyyy = expirationDate.getFullYear();

    $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;

    $scope.verifyMEP();
	$scope.parent.Policy.CurrentVersion.RateProperty = true;
    $scope.saved = false;
  }

  $scope.verifyMEP = function () {
    var termLength = $scope.parent.Policy.PolicyTerm;

    if (termLength == 12) {
      $scope.parent.Policy.MinimumEarnedPremium = '25%';
    } else if (termLength == 6) {
      $scope.parent.Policy.MinimumEarnedPremium = '50%';
    } else if (termLength < 6) {
      $scope.parent.Policy.MinimumEarnedPremium = '100%';
    }
  }

  $scope.verifySubjectivities = function () {
    var homeState = $scope.parent.Policy.HomeStateCode;

    // Custom Subjectivities for Alabama and 
    if (homeState == 'AL' || homeState == 'MS') {
      $scope.parent.Policy.CurrentVersion.Subjectivities =
        'Completed and signed homeowner application\n' +
        'Completed and signed surplus lines disclaimer/affidavit (if applicable)\n' +
        'Confirmation of 3 year loss history on the signed application or no known loss letter, signed by insured\n' +
        'Any required supplemental applications that may apply\n';
    }
  }

  $scope.getStateByZip = function () {
    $scope.ErrorList = [];
    // reset the Insured state to make sure we get a new one from the supplied zip
    $scope.parent.Policy.Insured.MailingAddress.State = "";
    $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
    $scope.parent.Policy.Insured.MailingAddress.County = "";

    if ($scope.parent.Policy.Insured.MailingAddress.Zip == undefined || $scope.parent.Policy.Insured.MailingAddress.Zip == null || $scope.parent.Policy.Insured.MailingAddress.Zip === "") return;
    if ($scope.parent.Policy.Insured.MailingAddress.Zip.length < 5) {
      $scope.ErrorList.push("Zip code must be at least 5 digits long");
      $scope.parent.Policy.Insured.MailingAddress.State = "";
      $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
      $scope.parent.Policy.Insured.MailingAddress.County = "";
      $scope.parent.Policy.Insured.MailingAddress.Zip = "";
      $scope.parent.Policy.Insured.MailingAddress.City = "";
    }

    if ($scope.ErrorList.length > 0) return;

    toolsService.getStateAndCountyByZip($scope.parent.Policy.Insured.MailingAddress.Zip).then(function (result) {
      if (result.data.Result.Success) {
        if (result.data.State != null) {
          $scope.parent.Policy.Insured.MailingAddress.County = result.data.State.County;
          $scope.parent.Policy.Insured.MailingAddress.State = result.data.State.Name;
          $scope.parent.Policy.Insured.MailingAddress.StateCode = result.data.State.Code;
          $scope.parent.Policy.Insured.MailingAddress.City = result.data.State.City;
        } else {
          $scope.parent.Policy.Insured.MailingAddress.County = "";
          $scope.parent.Policy.Insured.MailingAddress.State = "";
          $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
          $scope.ErrorList.push("Could not find State and County for entered zip code: " + $scope.parent.Policy.Insured.MailingAddress.Zip);
          $scope.parent.Policy.Insured.MailingAddress.Zip = "";
          $scope.parent.Policy.Insured.MailingAddress.City = "";
        }
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  function setDate(policy) {
    var otherDate = $filter('date')(policy.Effective, 'shortDate');
    policy.Effective = otherDate;

    otherDate = $filter('date')(policy.Expiration, 'shortDate');
    policy.Expiration = otherDate;

  }


  $scope.placeset = function (result) {
    if (result) {
      $scope.parent.Policy.Insured.MailingAddress.StreetAddress1 = result.StreetAddress1;
      $scope.parent.Policy.Insured.MailingAddress.StreetAddress2 = result.StreetAddress2;
      $scope.parent.Policy.Insured.MailingAddress.City = result.City;
      $scope.parent.Policy.Insured.MailingAddress.State = result.State;
      for (var i = 0; i < $scope.States.length; i++) {
        if ($scope.parent.Policy.Insured.MailingAddress.State == $scope.States[i].Name) {
          $scope.parent.Policy.Insured.MailingAddress.StateCode = $scope.States[i].Code;
        }
      }
      $scope.parent.Policy.Insured.MailingAddress.Zip = result.Zip;
      $scope.parent.Policy.Insured.MailingAddress.Country = result.Country;
      $scope.parent.Policy.Insured.MailingAddress.County = result.County;
      $scope.parent.Policy.Insured.MailingAddress.ShortAddress = result.formatted_address;
    }
    $scope.saved = false;
  }

  $scope.saveChanges = function (goTo) {
    if (goTo == null) goTo = '#lnkLocations';
    $scope.validatePage();
    if ($scope.ErrorList.length > 0) {
      return;
    }

    $scope.verifyMEP();

    // Account for the custom subjectivites for Alabama and Mississippi
    $scope.verifySubjectivities();
    $scope.saved = true;
    policyService.updateSubmissionAndInsured($scope.PolicyId, $scope.parent.Policy, $scope.parent.Policy.Insured).then(function (result) {
      if (result.data.Result.Success) {

        $scope.parent.Policy = result.data.Policy;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.parent.Coverages = result.data.Coverages;

        $scope.parent.getAppContracts();

        $timeout(function () { $(goTo).click(); }, 0, false);
        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
      }
      else {
        $scope.ErrorList = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  // Function that handles page validation for user inputs
  $scope.validatePage = function () {
    $scope.ErrorList = [];

    if (checkInput($scope.parent.Policy.Insured.Name)) {
      $scope.ErrorList.push('Named Insured cannot be blank.');
    }

	if (checkInput($scope.parent.Policy.Insured.Age)) {
      $scope.ErrorList.push('Insured Age cannot be blank.');
	}

	if (isNaN($scope.parent.Policy.Insured.Age)) {
	  $scope.ErrorList.push('Insured Age must be a number.');
	}

    if (checkInput($scope.parent.Policy.UnderwriterId)) {
      $scope.ErrorList.push('Must select an underwriter.');
    }

	if (checkInput($scope.parent.Policy.UnderwriterEmail)) {
	  $scope.ErrorList.push('Underwriter email cannot be blank.');
	}

    if (checkInput($scope.parent.Policy.HomeStateCode)) {
      $scope.ErrorList.push('Must select a home state.');
    }

    if (checkInput($scope.parent.Policy.Effective)) {
      $scope.ErrorList.push('Effective date cannot be blank.');
    }

    if (checkInput($scope.parent.Policy.Expiration)) {
      $scope.ErrorList.push('Expiration date cannot be blank.');
    }

    if ($scope.parent.Policy.Insured.MailingAddress == undefined) {
      $scope.ErrorList.push('Mailing Address cannot be blank.');
    } else {
      if (checkInput($scope.parent.Policy.Insured.MailingAddress.StreetAddress1)) {
        $scope.ErrorList.push('Mailing street address cannot be blank.');
      }

      if (checkInput($scope.parent.Policy.Insured.MailingAddress.Zip)) {
        $scope.ErrorList.push('Mailing zip cannot be blank.');
      }

      if (checkInput($scope.parent.Policy.Insured.MailingAddress.City)) {
        $scope.ErrorList.push('Mailing city cannot be blank.');
      }

      if (checkInput($scope.parent.Policy.Insured.MailingAddress.State)) {
        $scope.ErrorList.push('Mailing state cannot be blank.');
        }

        // Validate the mailing address to make sure that none of the inputs are set to undefined
        if (!validateAddressInfo($scope.parent.Policy.Insured.MailingAddress)) {
            $scope.ErrorList.push('Unable to geocode the mailing address. Please confirm it is a correct address or manually enter it.');
        }
    }

      validateDates();      
    }

    function validateAddressInfo(address) {
        if (typeof (address) !== "object") return false;

        var hasUndefinedEntry = function (text) {
            return typeof (text) !== "string" || text.includes("undefined");
        }

        if (hasUndefinedEntry(address.StreetAddress1)) return false;
        if (typeof (address.StreetAddress2) === "string" && hasUndefinedEntry(address.StreetAddress2)) return false;
        if (hasUndefinedEntry(address.City)) return false;
        if (hasUndefinedEntry(address.County)) return false;
        if (hasUndefinedEntry(address.State)) return false;
        if (hasUndefinedEntry(address.Zip)) return false;

        return true;
    }

  function checkInput(input) {
    if (input == '' || input == undefined || input == null) {
      return true;
    }
    else {
      return false;
    }
  }

  function validateDates() {
    var policy = $scope.parent.Policy;
    if (policy == undefined || typeof (policy.Expiration) !== "string" || typeof (policy.Effective) !== "string") return;

    var expirationDate = new Date(policy.Expiration);
    var effectiveDate = new Date(policy.Effective);

    if (expirationDate == effectiveDate) {
      $scope.ErrorList.push("Expiration date cannot be the same as the effective date.");
    }
    else if (expirationDate < effectiveDate) {
      $scope.ErrorList.push("Expiration date cannot be before the effective date.");
    }
  }

  $scope.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  // Load States
  toolsService.getStatesAndCounties().then(function (result) {
    if (result.data.Result.Success) {
      $scope.States = result.data.States;
    }
    else {
      $scope.Errors = result.data.Result.Errors;
    }
  }, function (error) {
    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
  });


  $timeout(function () {
    $('.quoteTabLinks').click(function (e) {
      if (!$scope.saved) {
        if ($scope.createSubmission != null) {
          $scope.createSubmission();
        } else {
          $scope.saveChanges('#' + $(this).attr('id'));
        }
        e.preventDefault();
        return false;
      }
    });
  }, 1, false);
}]);

MALACHIAPP.controller('submissionClearanceModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'test_policyService', 'policy', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, test_policyService, policy) {
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.policy = policy;
  $scope.selectedSubmission = null;
  $scope.submissions = [];
  $scope.searchTerm = "";
  $scope.ErrorList = [];
  $scope.searched = false;

  $scope.getSubmissions = function () {
    if ($scope.searchTerm != null && $scope.searchTerm.length > 0) $scope.searched = true;
    $scope.ErrorList = [];
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    test_policyService.getSubmissions($scope.searchTerm).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      if (result.data.Result.Success) {
        $scope.submissions = result.data.Submissions;
      }
      else {
        $scope.ErrorList = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.submissionClicked = function (submission) {
      $scope.selectedSubmission = submission;
      console.log('test');
  }

  $scope.newSubmit = function () {
    if ($scope.selectedSubmission != null) {
      $scope.policy.Insured.Name = $scope.selectedSubmission.Name;
      $scope.policy.Insured.DBA = $scope.selectedSubmission.DBA;
      $modalInstance.close();
    } else {
      $scope.ErrorList = ['Please select a submission.'];
    }
  }

  $scope.expanded = false;

  $scope.expandModal = function () {
    if ($scope.expanded) {
      $(".modal-dialog").css("width", "900px");
      $("#tableHolder").css("max-height", "500px");
    } else {
      $(".modal-dialog").css("width", "98%");
      $("#tableHolder").css("max-height", ($(window).height() - 300) + "px");
    }

    $scope.expanded = !$scope.expanded;
  }

  $(window).resize(function () {
    if ($scope.expanded) {
      $(".modal-dialog").css("width", "98%");
      $("#tableHolder").css("max-height", ($(window).height() - 300) + "px");
    }
  });

  $scope.newInsured = function () {
    $modalInstance.close();
  }

  $scope.goBack = function () {
    $modalInstance.close('back');
  }
}]);
