'use strict'

/* Setup general page controller */
MALACHIAPP.controller('PolicyController', ['$rootScope', '$scope', '$location', '$modal', 'settings', 'policyService', 'test_policyService', 'ngAuthSettings', 'localStorageService', 'toolsService', 'authService', '$http', 'claimsService', 'notificationsHub', function ($rootScope, $scope, $location, $modal, settings, policyService, test_policyService, ngAuthSettings, localStorageService, toolsService, authService, $http, claimsService, notificationsHub) {

  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
  });

  $scope.Filter = 'Quotes';
  $scope.NonRenewalAdmin = $.inArray("Non-Renewal Admin", authService.authentication.roles) > -1;

  $scope.canViewMGAs = $.inArray("MGA View", authService.authentication.roles) > -1;
  $scope.hasCanSeeBound = $.inArray("Can See Bound", authService.authentication.roles) > -1;

  $scope.RenewalItems = [];
  $scope.RenewalSearched = false;
  $scope.TermOptions = [
    {
      id: 30,
      name: '30 Days'
    },
    {
      id: 45,
      name: '45 Days'
    },
    {
      id: 60,
      name: '60 Days'
    },
    {
      id: 90,
      name: '90 Days'
    },
    {
      id: 120,
      name: '120 Days'
    }];

  $scope.RiskCompanies = [
    'Gridiron Ins.',
    'RLI Insurance Company'
  ];

  $scope.Request = {
    DateRange: 30,
    HomeStateCode: 'ALL',
    Company: 'ALL',
    RetailAgency: 'ALL',
    Office: 'ALL',
    AccountExecutive: 'ALL',
    UnderwriterId: 'ALL',
    PolicyPrefix: '',
    Expiration: getTodaysDate(),
    HideQuotedRenewals: true
  }
  $scope.searchObj = {
    search: null,
    searchByNumber: false,
    searchByInsured: false
  }

  // This empty object will hold the values to be used when trying to import a policy
  $scope.PolicyImport = {};
  $scope.ImportedPolicy = {};
  $scope.importPolicyFound = false;

  $scope.importPolicyFound = false;
  $scope.hasNoMatchingNames = false;
  $scope.importSuccess = false;
  $scope.differentNames = [];
  $scope.Agencies = [];
  $scope.Contacts = [];
  $scope.LicensedAgents = [];
  $scope.SelectedAgency = {};
  $scope.showAdvancedSearch = false;
  $scope.showRenewalManager = false;
  $scope.loading = {};
  $scope.Quotes = [];
  $scope.Binders = [];
  $scope.Policies = [];
  $scope.WorkflowBinders = [];
  $scope.Apps = $rootScope.Apps;
  $scope.showDateRangeWarning = false;

  if (authService.authentication.isUnderwriterExec) {
    $scope.Request.UnderwriterId = authService.authentication.userId;
  }


  $scope.setShowAdvancedSearch = function () {
    $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
  }

  $scope.dateTermChanged = function () {
    var termLength = $scope.Request.DateRange;

    if ($scope.Request.Expiration == undefined || $scope.Request.Expiration === "") return;

    $scope.ErrorList = [];
    var checkDate = new Date($scope.Request.Expiration).toString();
    if (checkDate === "Invalid Date") {
      $scope.Request.ExpirationTo = "";
      $scope.ErrorList.push("The expiraiton date entered is not valid");
      return;
    }

    var today = new Date($scope.Request.Expiration);
    var expirationDate = new Date(today.addDays(termLength));

    var dd = expirationDate.getDate();
    var mm = expirationDate.getMonth() + 1;
    var yyyy = expirationDate.getFullYear();

    $scope.Request.ExpirationTo = mm + '/' + dd + '/' + yyyy;

    $scope.showDateRangeWarning = termLength >= 60;
  }

  $scope.dateTermChanged();

  $scope.LoadRenewalManager = function () {
    if (!$scope.ManagingGeneralAgents || $scope.ManagingGeneralAgents.length == 0) {
      Metronic.blockUI({ animate: true, overlayColor: 'none' });
      policyService.getManagingGeneralAgents().then(function (result) {
        if (result.data.Result.Success) {
          $scope.ManagingGeneralAgents = result.data.ManagingGeneralAgents;
          $scope.Request.ManagingGeneralAgentId = $scope.ManagingGeneralAgents[0].Id;
          $scope.selectMGA();
          Metronic.unblockUI();
        } else {
          $scope.Errors = result.data.Result.Errors;
        }
      },
        function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    if (!$scope.States || $scope.States.length == 0) {
      Metronic.blockUI({ animate: true, overlayColor: 'none' });
      toolsService.getStatesAndCounties().then(function (result) {
        if (result.data.Result.Success) {
          $scope.States = result.data.States;
          $scope.States.unshift({
            Code: 'ALL',
            Name: 'ALL'
          });
          Metronic.unblockUI();
        } else {
          $scope.ErrorList = result.data.Result.Errors;
        }
      },
        function (error) {
          $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
  };

  $scope.selectMGA = function () {
    policyService.getOfficesAndExecutives(null, $scope.Request.ManagingGeneralAgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.AccountExecutives = result.data.Users;
        $scope.AccountExecutives.unshift({
          Id: 'ALL',
          Name: 'ALL'
        });

        $scope.Offices = result.data.Offices;
        $scope.Offices.unshift({
          Id: 'ALL',
          Code: 'ALL',
          Name: 'ALL'
        });

        if ($scope.Request.UnderwriterId == 'ALL' && result.data.ExecUser != null) {
          $scope.Request.UnderwriterId = result.data.ExecUser.Id;
        }
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    policyService.getRetailAgencies($scope.Request.ManagingGeneralAgentId).then(function (result) {
      $scope.RetailAgencies = result.data;

      for (var i = 0; i < $scope.RetailAgencies.length; i++) {
        $scope.RetailAgencies[i].Name = $scope.RetailAgencies[i].AgencyName + ($scope.RetailAgencies[i].AgencyCode == null ? '' : ' - ' + $scope.RetailAgencies[i].AgencyCode);
      }

      $scope.RetailAgencies.unshift({
        Name: 'ALL',
        AgencyName: 'ALL'
      });
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.searchRenewals = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    $http.post(ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/renewalSearch', $scope.Request).then(function (results) {
      Metronic.unblockUI();
      return results;
    }).then(function (result) {
      $scope.RenewalItems = result.data.RenewalSearchItems;
      $scope.RenewalSearched = true;
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  if (!$rootScope.Apps || $rootScope.Apps.length == 0) {
    policyService.getApps().then(function (result) {
      $rootScope.Apps = result.data.Apps;
      $scope.Apps = $rootScope.Apps;
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }


  $scope.currentTimeout = null;
  $scope.searchNameChanged = function () {
    if ($scope.currentTimeout != null) {
      $timeout.cancel($scope.currentTimeout);
    }
    $scope.currentTimeout = $timeout(function () { $scope.searchForms($scope.searchName, 0, 0); }, 1000);
  };

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function () {
    $scope.search();
  };

  $scope.keyPress = function (keyCode, search) {
    if (keyCode == 13) {
      $scope.search(search, $scope.Filter);
    }
  }

  $scope.show = function (filter) {
    if (filter != "RenewalManager" && filter != "ImportFromCarrier") {
      $scope.Filter = filter;
      $scope.ShowPolicies = filter == 'Policies';
      $scope.showRenewalManager = false;
      $scope.showPolicyImportManager = false;

      if (filter == 'Quotes' && $scope.Quotes.length > 0) {
        return;
      } else if (filter == 'Binders' && $scope.Binders.length > 0) {
        return;
      } else if (filter == 'Policies' && $scope.Policies.length > 0) {
        return;
      } else if (filter == 'WorkflowBinders' && $scope.WorkflowBinders.length > 0) {
        return;
      }

      $scope.search("", filter, "", "");

    } else {

      if (filter == "ImportFromCarrier") {
        $scope.showRenewalManager = false;
        $scope.showPolicyImportManager = true;
        $scope.PolicyImport = {};
        $scope.ImportedPolicy = {};
        $scope.importPolicyFound = false;
        $scope.importSuccess = false;
      } else {
        $scope.showPolicyImportManager = false;
        $scope.showRenewalManager = true;
        $scope.LoadRenewalManager();
      }
    }
  }

  // Clears the import data in case the user wants to start over
  $scope.clearImport = function () {
    $scope.importPolicyFound = false;
    $scope.hasNoMatchingNames = false;
    $scope.differentNames = [];
    $scope.Agencies = [];
    $scope.Contacts = [];
    $scope.LicensedAgents = [];
    $scope.SelectedAgency = {};
  }

  // Quality of life improvement to auto select the risk company when they enter a policy number
  $scope.autoSelectRiskCompany = function () {
    var input = $scope.PolicyImport.Number;

    if (input.length < 3) {
      return;
    } else {
      var cleanInput = input.toLowerCase();
      if (cleanInput.startsWith('gps')) {
        $scope.PolicyImport.RiskCompany = 'Gridiron Ins.';
      }

      if (cleanInput.startsWith('rli') || cleanInput.startsWith('gpd') || cleanInput.startsWith('ggl') || cleanInput.startsWith('gpk')) {
        $scope.PolicyImport.RiskCompany = 'RLI Insurance Company';
      }
    }
  }

  $scope.searchImports = function () {
    $scope.importPolicyFound = false;
    $scope.hasNoMatchingNames = false;
    $scope.importSuccess = false;
    $scope.differentNames = [];
    $scope.Agencies = [];
    $scope.Contacts = [];
    $scope.LicensedAgents = [];
    $scope.SelectedAgency = {};
    $scope.importEndorsements = [];
    $scope.PolicyImport.Confirmed = false;

    $scope.validateImport();

    if ($scope.importErrorList.length == 0) {
      // Go into the server at this point and search it
      policyService.importFromCarrier($scope.PolicyImport.Number.trim(), $scope.PolicyImport.RiskCompany, $scope.PolicyImport.AimSubmission.trim()).then(function (result) {
        $scope.importResult = result.data.Policy;
        if ($scope.importResult != null) {
          $scope.importPolicyFound = true;
          $scope.importErrorList = result.data.Errors;
          $scope.importEndorsements = result.data.EndorsementNumbers;

          if (result.data.HasNoMatchingNames) {
            $scope.hasNoMatchingNames = true;
            $scope.differentNames = result.data.DifferentNames;
          }

        } else if (result.data.HasNoMatchingNames) {
          $scope.hasNoMatchingNames = true;
          $scope.differentNames = result.data.DifferentNames;
          $scope.importErrorList = result.data.Errors;
          $scope.importEndorsements = result.data.EndorsementNumbers;
        } else if (result.data.Errors.length > 0) {
          $scope.importErrorList = result.data.Errors;
        }

      }, function (error) {
        $scope.importErrorList = ['An unexpected error has occured with the import. Please contact support for help.'];
      });
    }
  }


  $scope.getAgencies = function (val) {
    return test_policyService.getAgencies(val, $scope.importResult.Effective, $scope.importResult.HomeStateCode).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Agencies = result.data.Agencies;
      }
      else {
      }
    }, function (error) {
    });
  }

  $scope.agencySelected = function () {
    if ($scope.SelectedAgency.Contact == null) $scope.SelectedAgency.Contact = {};
    // make sure to empty contact name and their information
    $scope.SelectedAgency.Contact = null;
    $scope.SelectedAgency.LicensedAgent = null;
    $scope.Agency = $scope.SelectedAgency.Agency;
    $scope.Contacts = $scope.Agency.Contacts;
    $scope.LicensedAgents = $scope.Agency.LicensedAgents;
    if ($scope.SelectedAgency.Agency != null && $scope.Agency.LicensedAgents <= 0) {
      $scope.importErrorList = ['Please contact the customer care team to get the licensed agent updated.'];
    } else {
      $scope.importErrorList = [];
    }
  }


  $scope.validateImport = function () {
    $scope.importErrorList = [];

    if (checkInputs($scope.PolicyImport.Number)) {
      $scope.importErrorList.push("Policy Number cannot be blank");
    }

    if (checkInputs($scope.PolicyImport.RiskCompany)) {
      $scope.importErrorList.push("Please select a Risk Company");
    }

    if (checkInputs($scope.PolicyImport.AimSubmission)) {
      $scope.importErrorList.push("AIM Submission Number cannot be blank");
    }

    if ($scope.importPolicyFound) {
      if ($scope.SelectedAgency.Agency == null) {
        $scope.importErrorList.push("Please select an agency before saving the import");
      }

      if ($scope.SelectedAgency.Contact == null) {
        $scope.importErrorList.push("Please select an agency contact before saving the import");
      }

      if ($scope.SelectedAgency.LicensedAgent == null) {
        $scope.importErrorList.push("Please select a licensed agent before saving the import");
      }
    }
  }

  $scope.saveImportPolicy = function () {
    $scope.validateImport();
    if ($scope.importErrorList.length > 0) return;
    $scope.importSuccess = false;
    // Go into the server at this point and save it
    policyService.saveImportFromCarrier($scope.PolicyImport.Number.trim(), $scope.PolicyImport.RiskCompany, $scope.PolicyImport.AimSubmission.trim(), $scope.SelectedAgency).then(function (result) {
      if (result.data.Policy != null) {
        $scope.importSuccess = true;
        $scope.clearImport();
      } else {
        $scope.importErrorList.push("There was a problem importing this policy, please contact support for help");
      }

    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.advancedSearch = function (message, quotedBy, agency, appId) {
    $scope.policySearch = message ? message : "";
    $scope.quotedBy = quotedBy ? quotedBy : "";
    $scope.agency = agency ? agency : "";
    $scope.appId = appId ? appId : "";

    $scope.search($scope.policySearch, $scope.Filter, $scope.quotedBy, $scope.agency, $scope.appId);
  }

  $scope.advancedSearchNextPage = function (message, quotedBy, agency, appId) {
    $scope.policySearch = message ? message : "";
    $scope.quotedBy = quotedBy ? quotedBy : "";
    $scope.agency = agency ? agency : "";
    $scope.appId = appId ? appId : "";

    $scope.search($scope.policySearch, $scope.Filter, $scope.quotedBy, $scope.agency, $scope.appId);
  }

  $scope.getCoverage = function (policy) {
    var coveragesList = policy.CoveragesList;

    var hasHomeowners = coveragesList.includes("Homeowners");
    var hasFlood = coveragesList.includes("Flood");
    var hasLiability = coveragesList.includes("Liability");
    var hasProperty = coveragesList.includes("Property");
    var hasPackage = hasProperty && hasLiability;

    return hasHomeowners ? "Homeowners" : hasFlood ? "Flood" : hasPackage ? "Package" : hasProperty ? "Property" : "Liability";
  }

  $scope.newQuote = function (app) {
    var allowDisabledApp = $.inArray("View Disabled Apps", authService.authentication.roles) > -1;
    if (!allowDisabledApp && !app.Enabled)
      return;

    // Load App
    $rootScope.$state.transitionTo('policy', { appId: app.Id, policyId: null });
  }

  $scope.openPolicy = function (policy) {
    // Load App
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: policy.Id });
  }

  $scope.openParentPolicy = function (policy) {

    if (policy.Endorsements != null) {
      $scope.showEndorsements(policy);
      return;
    }

    // Load App
    var id = policy.Id;
    if (policy.ParentId != null) id = policy.ParentId;
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: id });
  }

  $scope.copyPolicy = function (policy) {
    var id = policy.Id;
    if (policy.ParentId != null) id = policy.ParentId;

    if (policy.AppId == '001d0418-a168-4be3-84a8-0168eda970fd') {
      policyService.copyPolicy(id, ['Homeowners'], null, null).then(function (result) {
        $rootScope.$state.transitionTo('policy', { appId: 'e415a683-cc63-46b8-a42a-3669489f87be', policyId: result.data.PolicyId });
      },
        function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      return;
    }

    if (policy.AppId == 'e415a683-cc63-46b8-a42a-3669489f87be') {
      policyService.copyPolicy(id, ['Homeowners'], null, null).then(function (result) {
        $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: result.data.PolicyId });
      },
        function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'test_showPolicyCoverages.html',
      controller: 'test_showPolicyCoveragesCtrl',
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        coverages: function () {
          return ['Property', 'Liability'];
        },
        selectedCoverages: function () {
          return policy.CoveragesList;
        },
        appId: () => policy.AppId
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        var submissionNumber = data.SubmissionNumber;
        var submissionInfo = data.Data;

        policyService.copyPolicy(id, data.Coverages, submissionNumber, submissionInfo).then(function (result) {
          $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: result.data.PolicyId });
        },
          function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
      }
    });
  }

  $scope.renewPolicy = function (policy) {
    // if it is AGP policy don't renew
    if (policy.AppId == '001d0418-a168-4be3-84a8-0168eda970fd') return;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    $http.post(ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/renew', { PolicyId: policy.Id, PolicyNumber: policy.Number }).then(function (results) {
      Metronic.unblockUI();
      return results;
    }).then(function (result) {
      $rootScope.$state.transitionTo('policy', { appId: result.data.AppId, policyId: result.data.PolicyId });
      //if (policy.SubmissionNumber != null) {//change to SubmissionNumber == null 
      //    //Open Modal
      //    var modalInstance = $modal.open({
      //        templateUrl: 'inputSubmissionNumberModelContent.html',
      //        controller: 'inputSubmissionNumberModelContentCtrl',
      //        backdrop: 'static',
      //        size: 'sm',
      //        resolve: {
      //            policy: function () {
      //                return policy;
      //            }
      //        }
      //    });


      //    //in modal result, set value entered to Policy.SubmissionNumber
      //    modalInstance.result.then(function (data) {
      //        var sm = $scope.SubmissionNumber
      //        if (data != null) {
      //            if (data == 'back') {
      //                $rootScope.$state.transitionTo('policyDashboard');
      //            }
      //            else {
      //                policy.SubmissionNumber = data;
      //                $rootScope.$state.transitionTo('policy', { appId: result.data.AppId, policyId: result.data.PolicyId });
      //            }

      //        }
      //    });
      //}

    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

	$scope.canRenew = function (policy) {
		// feature18897 - If GPS return false
		if (policy.RiskCompanyId == '689c1168-395d-483b-8837-f92ea949e92a') {
			return false;
		}
		if ((policy.Issued || policy.Bound) && policy.EndorsementId == null && !policy.NonRenewal && policy.AppId != '001d0418-a168-4be3-84a8-0168eda970fd') {
			return true
		}
		return true;
	}

  $scope.renew = function (policy) {
    // if it is AGP policy don't renew
    if (policy.AppId == '001d0418-a168-4be3-84a8-0168eda970fd') return;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    $http.post(ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/renew', { PolicyId: policy.PolicyId, PolicyNumber: policy.PolicyNumber }).then(function (results) {
      Metronic.unblockUI();
      return results;
    }).then(function (result) {
      $rootScope.$state.transitionTo('policy', { appId: result.data.AppId, policyId: result.data.PolicyId });
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.editPolicy = function (policy, endorsementId) {
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: endorsementId });
  }

  $scope.deleteEndorsement = function (policy, endorsementId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    policyService.deleteEndorsement(endorsementId).then(function (result) {
      Metronic.unblockUI();

      var endorsement = $.grep(policy.Endorsements, function (n) { return n.Id == endorsementId })[0];
      policy.Endorsements.splice(policy.Endorsements.indexOf(endorsement), 1);
      policy.EndorsementId = null;

      policy.EndorsementNumbers.splice(policy.EndorsementNumbers.indexOf(endorsement.EndorsementNumber), 1);

      if (policy.Endorsements.length == 0) {
        policy.HasEndorsements = false;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.downloadEndorsement = function (policy, endorsementId) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.documentServiceBase + 'api/document/DownloadEndorsementDocument', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();
      if (this.status === 200) {
        var filename = "Endorsement.pdf";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify({ PolicyId: endorsementId }));
  }

  $scope.isCurrentEndorsementBound = function (policy) {

    var currentEndorsement = policy.Endorsements.find(e => e.Id == policy.EndorsementId);

    return currentEndorsement.Bound || currentEndorsement.Issue;
  };

  $scope.downloadPolicy = function (policy) {
    var id = policy.Id;
    // if (policy.ParentId != null) id = policy.ParentId; -- GET LATEST DONT GO TO PARENT

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.documentServiceBase + 'api/document/DownloadPolicy', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();
      if (this.status === 200) {
        var contentType = xhr.getResponseHeader('Content-Type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          var response = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(this.response)));
          notificationsHub.showError({
            title: 'Download Policy',
            body: response.Errors.join(' '),
            timeout: 25000,
            clickHandler: function (toaster, isCloseButton) { return isCloseButton; },
            showCloseButton: true
          });
          $scope.$apply();
          return;
        }
        var filename = "Policy.pdf";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify({ PolicyId: id }));
  }

  $scope.showEndorsements = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'endorsementsModelContent.html',
      controller: 'endorsementsModelCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        policy: function () {
          return policy;
        }
      }
    });

    modalInstance.result.then(function () {
    });
  }

  $scope.markNonRenewal = function (policy, EndorsementGroupId) {
    $scope.Errors = [];
    policyService.markNonRenewal(EndorsementGroupId).then(function (result) {
      policy.NonRenewal = true;
      if (policy.Endorsements != null && policy.Endorsements.length > 0) {
        policy.Endorsements.forEach(function (endorsement) {
          endorsement.NonRenewal = true;
        });
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.rescindNonRenewal = function (policy, EndorsementGroupId) {
    $scope.Errors = [];
    policyService.rescindNonRenewal(EndorsementGroupId).then(function (result) {
      policy.NonRenewal = false;
      if (policy.Endorsements != null && policy.Endorsements.length > 0) {
        policy.Endorsements.forEach(function (endorsement) {
          endorsement.NonRenewal = false;
        });
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.exportToExcel = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/ExportRenewalToExcel', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();
      if (this.status === 200) {
        var filename = "Renewal" + getTodaysDate().replace("/", "_") + ".xlsx";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify($scope.Request));
  }

  $scope.search = function (search, filter, quotedBy, agency, appId) {

    if (filter == 'Quotes') {
      $scope.Quotes = [];
    } else if (filter == 'Binders') {
      $scope.Binders = [];
    } else if (filter == 'WorkflowBinders') {
      $scope.WorkflowBinders = [];
    } else {
      $scope.Policies = [];
    }

    $scope.loading[filter] = true;

    var searchBy = !$scope.searchObj.searchByInsured && !$scope.searchObj.searchByNumber ? 'ALL' : $scope.searchObj.searchByInsured ? 'INSURED' : 'NUMBER';
    policyService.getPolicies(search, filter, 1, 15, quotedBy, agency, appId, searchBy).then(function (result) {
      if (filter == 'Quotes') {
        $scope.Quotes = result.data.Policies;
      } else if (filter == 'Binders') {
        $scope.Binders = result.data.Policies;
      } else if (filter == 'WorkflowBinders') {
        $scope.WorkflowBinders = result.data.Policies;
      } else {
        $scope.Policies = result.data.Policies;
      }
      $scope.loading[filter] = false;
    }.bind(this), function (error) {
    });
  }

  $scope.getResults = function () {
    if ($scope.Filter == 'Quotes') {
      return $scope.Quotes;
    } else if ($scope.Filter == 'Binders') {
      return $scope.Binders;
    } else if ($scope.Filter == 'WorkflowBinders') {
      return $scope.WorkflowBinders;
    } else {
      return $scope.Policies;
    }
  }

  // Open Policy Details View
  $scope.showClaimsForPolicy = function (policy) {

    claimsService.getPolicyOverview(policy.Number, policy.Effective).then(function (result) {
      if (result.data.Success) {
        $rootScope.$state.transitionTo("policyDetails", { policy: result.data.Data });
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ['Couldn\'t open claims for this policy.'];
    });
  }

  $scope.show('Quotes');

  function checkInputs(input) {
    if (input == '' || input == undefined) {
      return true;
    }
    else {
      return false;
    }
  }
}]);

MALACHIAPP.controller('test_showPolicyCoveragesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'test_policyService', 'settings', 'coverages', 'selectedCoverages', 'appId', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, test_policyService, settings, coverages, selectedCoverages, appId) {
  $scope.SubmissionNumber = null;
  $scope.isHomeowners = selectedCoverages.some(function (x) { return x == "Homeowners" });
  $scope.Coverages = coverages;
  $scope.SelectedCoverages = selectedCoverages;
  $scope.AppId = appId;

  if (!$scope.isHomeowners) {
    $scope.SelectedCoverages = $scope.SelectedCoverages.filter(function (x) {
      return x == "Property" || x == "Liability";
    });
  }


  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.save = function () {
    if ($scope.SelectedCoverages.length > 0) {
      if ($scope.SubmissionNumber != null && $scope.SubmissionNumber.length > 0) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        test_policyService.importFromAIM($scope.SubmissionNumber, $scope.AppId).then(function (result) {
          Metronic.unblockUI('.modal-dialog');
          if (result.data.Success) {
            $modalInstance.close({
              Coverages: $scope.SelectedCoverages,
              Data: result.data,
              SubmissionNumber: $scope.SubmissionNumber
            });
          } else {
            $scope.ErrorList = result.data.Errors;
          }
        }, function (error) {
          Metronic.unblockUI('.modal-dialog');
          $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
        });
      } else {
        $modalInstance.close({
          Coverages: $scope.SelectedCoverages
        });
      }
    }
    else {
      $scope.Errors = ['You must pick at least one coverage.'];
    }
  }
}]);

MALACHIAPP.controller('endorsementsModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'ngAuthSettings', 'localStorageService', 'policyService', '$modal', 'policy', 'authService', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, ngAuthSettings, localStorageService, policyService, $modal, policy, authService) {
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }
  $scope.isLiability = function (policy) {
    return policy.Coverage == 'Liability' || policy.Coverage == 'Package';
  }

  $scope.isProperty = function (policy) {
    return policy.Coverage == 'Property' || policy.Coverage == 'Homeowners' || policy.Coverage == 'Package';
  }

  $scope.policy = policy;
  $scope.CancelAuthority = $.inArray("Cancel Authority", authService.authentication.roles) > -1;
  $scope.EndorseFeeAuthority = $.inArray("Fee Endorsement Authority", authService.authentication.roles) > -1;
  $scope.hasEndorsePolicyTermRole = $.inArray("Policy Term Endorsement", authService.authentication.roles) > -1;

  $scope.showEndorsementDropdown = function (policy) {
    return !policy.IsCanceled
      && !policy.Number.startsWith('CCP')
      && !policy.Number.startsWith('USA')
      && !policy.Number.startsWith('GPS')
      && !policy.Number.startsWith('VBA')
      && !$scope.isNoEndorsementRiskCompany(policy)
      && $scope.checkSourceOrgId(policy);
  }

  $scope.isNoEndorsementRiskCompany = function (policy) {
    // Right now it is IFG, and test for this function
    var riskCompanyId = policy.RiskCompanyId.toUpperCase();
    return (riskCompanyId == '5328469D-F3FE-4D09-9294-7898FEA47ADC' || riskCompanyId == '9F2A41E8-A05D-41ED-A224-B179C82E5F50' || riskCompanyId == 'B831D0F1-9C3B-4B5F-986A-B53273051556');

  }

  $scope.checkSourceOrgId = function (policy) {
    return policy.SourceOrganizationId == null || policy.SourceOrganizationId == '';
  }

  $scope.showReinstateButton = function (policy) {
    return policy.IsCanceled && $scope.checkSourceOrgId(policy) && !$scope.policy.Number.startsWith("VBA") && $scope.CancelAuthority;
  }

  $scope.openPolicy = function (policy) {
    // Load App
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: policy.Id });
  }

  $scope.openParentPolicy = function (policy) {
    // Load App
    var id = policy.Id;
    if (policy.ParentId != null) id = policy.ParentId;
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: id });
  }

  $scope.copyPolicy = function (id, appId) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.copyPolicy(id).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      $modalInstance.dismiss('cancel');
      $rootScope.$state.transitionTo('policy', { appId: appId, policyId: result.data.PolicyId });
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.canCreateEndorsement = function () {
    var hasQuote = false;
    var endorsements = policy.Endorsements;
    if (endorsements)
      for (var i = 0; i < endorsements.length; i++)
        if (!endorsements[i].Bound) {
          hasQuote = true;
          break;
        }

    return !hasQuote;
  }

  $scope.endorsePolicy = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'endorsementModelContent.html',
      controller: 'endorsementModelCtrl',
      backdrop: 'static',
      size: 'sm',
      resolve: {
        numbers: function () {
          return policy.EndorsementNumbers;
        },
        effective: function () {
          return policy.Effective;
        },
        expiration: function () {
          return policy.Expiration;
        },
        appId: function () {
          return policy.AppId;
        }
      }
    });

    modalInstance.result.then(function (endorsement) {
      if (endorsement != 'cancel') {
        $modalInstance.dismiss('cancel');
        if (endorsement.Type == 1) {
          policyService.endorse(policy.Id, endorsement.Number, endorsement.Effective).then(function (result) {
            if (result.data.Result.Success) {
              $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: result.data.PolicyId });
            }
            else {
              $scope.Errors = result.data.Result.Errors;
            }
          }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
        }
        else {
          $rootScope.$state.transitionTo('triaEndorsement', { policyId: policy.Id });
        }
      }
    });
  }


  // Check if it's RLI
  $scope.isRli = function (policy) {
    if (policy.Number.startsWith("GGL") || policy.Number.startsWith("GPK") || policy.Number.startsWith("GPD"))
      return true;
    else
      return false;
  }

  $scope.renewPolicy = function (policy) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.renew(policy.Id).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      $modalInstance.dismiss('cancel');
      $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: result.data.PolicyId });
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      Metronic.unblockUI();
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.cancelPolicy = function (policy) {
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('cancellation', { policyId: policy.Id });
  }

  $scope.editPolicy = function (policy, endorsementId) {
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('policy', { appId: policy.AppId, policyId: endorsementId });
  }

  $scope.deleteEndorsement = function (policy, endorsementId) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.deleteEndorsement(endorsementId).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      var endorsement = $.grep(policy.Endorsements, function (n) { return n.Id == endorsementId })[0];
      policy.Endorsements.splice(policy.Endorsements.indexOf(endorsement), 1);
      policy.EndorsementId = null;

      policy.EndorsementNumbers.splice(policy.EndorsementNumbers.indexOf(endorsement.EndorsementNumber), 1);

      if (policy.Endorsements.length == 0) {
        policy.HasEndorsements = false;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.reinstatePolicy = function (policy, endorsementId) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.reinstatePolicy(policy.Id).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      if (result.data.Result.Success) {
        if (policy.Endorsements == null) policy.Endorsements = [];
        if (policy.EndorsementNumbers == null) policy.EndorsementNumbers = [];

        policy.Endorsements.push(result.data.Endorsement);
        policy.EndorsementNumbers.push(result.data.Endorsement.EndorsementNumber);
        policy.IsCanceled = false;
        if (policy.ParentId == null) policy.ParentId = policy.Id;
        policy.Id = result.data.Endorsement.EndorsementPolicyId;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.endorsePolicyTerm = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'endorsementPolicyTermModelContent.html',
      controller: 'endorsementPolicyTermModelCtrl',
      backdrop: 'static',
      size: 'md',
      resolve: {
        numbers: function () {
          return policy.EndorsementNumbers;
        },
        effective: function () {
          return policy.Effective;
        },
        endorsements: function () {
          return policy.Endorsements == null ? [] : policy.Endorsements;
        }
      }
    });

    modalInstance.result.then(function (endorsement) {
      if (endorsement != 'cancel') {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.createPolicyTermEndorsement(policy.Id, endorsement.Number, endorsement.Effective, endorsement.Expiration, endorsement.PolicyTerm).then(function (result) {
          Metronic.unblockUI('.modal-dialog');
          if (result.data.Result.Success) {
            if (policy.Endorsements == null) {
              policy.Endorsements = [];
              policy.EndorsementNumbers = [];
              policy.HasEndorsements = true;
            }
            policy.Endorsements.push(result.data.Endorsement);
            policy.EndorsementNumbers.push(result.data.Endorsement.EndorsementNumber);

            if (policy.ParentId == null) policy.ParentId = policy.Id;
            policy.Id = result.data.Endorsement.EndorsementPolicyId;
          } else {
            $scope.Errors = result.data.Result.Errors;
          }
        }, function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      }
    });
  }

  $scope.voidLastEndorsement = function (policy) {
    BootstrapDialog.show({
      title: 'Void Last Endorsement',
      message: 'Are you sure you want to void the last endorsement?',
      buttons: [{
        label: 'Cancel',
        action: function (dialogItself) {
          dialogItself.close();
        }
      }, {
        label: 'Void Last Endorsement',
        cssClass: 'btn-primary',
        action: function (dialogItself) {
          Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
          policyService.voidLastEndorsement(policy.Id).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
              policy.Endorsements.push(result.data.Endorsement);
              policy.EndorsementNumbers.push(result.data.Endorsement.EndorsementNumber);

              if (policy.ParentId == null) policy.ParentId = policy.Id;
              policy.Id = result.data.Endorsement.EndorsementPolicyId;
            } else {
              $scope.Errors = result.data.Result.Errors;
            }
          }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
          dialogItself.close();
        }
      }]
    });
  }

  $scope.endorsePolicyFees = function (policy) {
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('feeendorsement', { policyId: policy.Id });
  }

  $scope.extendPolicy = function (policy) {
    $modalInstance.dismiss('cancel');
    $rootScope.$state.transitionTo('extensionEndorsement', { policyId: policy.Id });
  }

  $scope.downloadEndorsement = function (policy, endorsementId) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.documentServiceBase + 'api/document/DownloadEndorsementDocument', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI('.modal-dialog');
      if (this.status === 200) {
        var filename = "Endorsement.pdf";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify({ PolicyId: endorsementId }));
  }

  $scope.downloadPolicy = function (policy) {
    var id = policy.Id;
    if (policy.ParentId != null) id = policy.ParentId;

    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.documentServiceBase + 'api/document/DownloadPolicy', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI('.modal-dialog');
      if (this.status === 200) {
        var filename = "Policy.pdf";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify({ PolicyId: id }));
  }

  $scope.showCceEndorsement = function (policy) {
    return policy.Number.startsWith('LOL') || policy.Number.startsWith('AGP') || policy.Number.startsWith('NPH') || policy.Number.startsWith('RSK');
  }

  $scope.createCceEndorsement = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'cceEndorsement.html',
      controller: 'cceEndorsementModelCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: { policy: function () { return policy; } }
    });

    modalInstance.result.then(function (result) {
      if (result !== 'cancel') {
        // TODO: Add something here...
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.createCceEndorsementLiability = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'cceEndorsementLiability.html',
      controller: 'cceEndorsementLiabilityModelCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: { policy: function () { return policy; } }
    });

    modalInstance.result.then(function (result) {
      if (result !== 'cancel') {
        // TODO: Add something here...
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.updateContact = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'updateContact.html',
      controller: 'updateContactModelCtrl',
      backdrop: 'static',
      size: 'md',
      resolve: { policy: function () { return policy; } }
    });

    modalInstance.result.then(function (result) {
      if (result !== 'cancel') {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.updateAgencyContact(result).then(function (result) {
          Metronic.unblockUI('.modal-dialog');
          if (!result.data.Result.Success)
            $scope.Errors = result.data.Result.Errors;
        }, function (error) {
          Metronic.unblockUI('.modal-dialog');
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.updateAccountExecutive = function (policy) {
    var modalInstance = $modal.open({
      templateUrl: 'updateAccountExec.html',
      controller: 'updateAccountExecModelCtrl',
      backdrop: 'static',
      size: 'md',
      resolve: { policyId: function () { return policy.Id; } }
    });

    modalInstance.result.then(function (result) {
      if (result != "cancel") {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.updateOfficeAndExecutive(result.UpdatedPolicy).then(function (result) {
          Metronic.unblockUI('.modal-dialog');
          if (!result.data.Success)
            $scope.Errors = result.data.Errors;
        }, function (error) {
          Metronic.unblockUI('.modal-dialog');
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          console.log(error);
        });
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      console.log(error);
    });
  }
}]);

MALACHIAPP.controller('inputSubmissionNumberModelContentCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'ngAuthSettings', 'localStorageService', 'policyService', '$modal', 'policy', 'authService', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, ngAuthSettings, localStorageService, policyService, $modal, policy, authService) {
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.submission = {};
  $scope.policy = policy;
  $scope.CancelAuthority = $.inArray("Cancel Authority", authService.authentication.roles) > -1;
  $scope.EndorseFeeAuthority = $.inArray("Fee Endorsement Authority", authService.authentication.roles) > -1;
  $scope.hasEndorsePolicyTermRole = $.inArray("Policy Term Endorsement", authService.authentication.roles) > -1;

  $scope.goBack = function () {
    $modalInstance.close('back');
  }

  $scope.newSubmit = function () {
    $modalInstance.close($scope.submission.SubmissionNumber);
    //if ($scope.selectedSubmission != null) {

    //$scope.Policy = {};
    //$scope.Policy.Insured = {};
    //$scope.Policy.Insured.Name = $scope.selectedSubmission.Name;
    //$scope.Policy.MGASubmissionNumber = $scope.selectedSubmission.SubmissionNumber;
    //$scope.Policy.AccountExec = $scope.selectedSubmission.AccountExec;
    //$scope.Policy.Insured.DBA = $scope.selectedSubmission.DBA;
    //$scope.Policy.DateQuoted = $scope.selectedSubmission.DateQuoted;
    //$scope.Policy.Effective = $scope.selectedSubmission.Effective;
    //$scope.Policy.MailingAddress = $scope.selectedSubmission.MailingAddress;
    //$scope.Policy.MailingCity = $scope.selectedSubmission.MailingCity;
    //$scope.Policy.MailingState = $scope.selectedSubmission.MailingState;
    //$scope.Policy.MailingZip = $scope.selectedSubmission.MailingZip;
    //$scope.Policy.Product = $scope.selectedSubmission.Product;
    //$scope.Policy.SubmitGrpId = $scope.selectedSubmission.SubmitGrpId;        
    //} else {
    //$scope.ErrorList = ['Please select a submission.'];
    //}
  }

}]);

MALACHIAPP.controller('endorsementModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'numbers', 'effective', 'expiration', 'appId', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, numbers, effective, expiration, appId) {

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.AppId = appId.toLowerCase();
  $scope.PolicyEffective = effective;

  if (expiration == null) {
    expiration = undefined;
  }

  $scope.PolicyExpiration = expiration;

  var endorsementNumbers = numbers;
  $scope.endorsementNumbers = endorsementNumbers;
  var number = endorsementNumbers.length == 0 ? 1 : Math.max.apply(Math, endorsementNumbers) + 1;

  $scope.Endorsement = {
    Number: number,
    Effective: effective
  }

  $scope.create = function () {
    $scope.ErrorList = [];
    var effective = new Date($scope.Endorsement.Effective);
    var policyEffective = new Date($scope.PolicyEffective);

    if ($scope.Endorsement.Type != null) {

      if (effective >= policyEffective) {
        $modalInstance.close($scope.Endorsement);
      } else {
        $scope.ErrorList.push("Endorsement effective date can't be past of policy effective date.");
      }
    } else {
      $scope.ErrorList.push("Please pick type of endorsement.");
    }
  }
}]);

MALACHIAPP.controller('endorsementPolicyTermModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'numbers', 'effective', 'endorsements', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, numbers, effective, endorsements) {
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.PolicyTermOptions = [
    {
      id: 12,
      name: '12 Months'
    },
    {
      id: 6,
      name: '6 Months'
    },
    {
      id: 3,
      name: '3 Months'
    },
    {
      id: 0,
      name: 'Short-Term'
    }
  ];

  $scope.PolicyEffective = effective;
  $scope.Endorsements = endorsements;

  var endorsementNumbers = numbers;
  $scope.endorsementNumbers = endorsementNumbers;
  var number = endorsementNumbers.length == 0 ? 1 : Math.max.apply(Math, endorsementNumbers) + 1;

  $scope.Endorsement = {
    Number: number,
    Effective: effective,
    PolicyTerm: 12
  }

  $scope.create = function () {
    $modalInstance.close($scope.Endorsement);
  }

  $scope.canEndorsePolicyTerm = function () {
    for (var i = 0; i < $scope.Endorsements.length; i++) {
      var endorsement = $scope.Endorsements[i];
      if (endorsement.ReturnPremium != 0 || endorsement.AdditionalPremium != 0) return false;
    }
    return true;
  }


  $scope.effectiveDateChanged = function () {
    var termLength = $scope.Endorsement.PolicyTerm;

    if ($scope.Endorsement.Effective == undefined || $scope.Endorsement.Effective === "") return;

    $scope.ErrorList = [];
    var checkDate = new Date($scope.Endorsement.Effective).toString();
    if (checkDate === "Invalid Date") {
      $scope.Endorsement.Expiration = "";
      $scope.ErrorList.push("The effective date entered is not valid");
      return;
    }

    var today = new Date($scope.Endorsement.Effective);
    var expirationDate = new Date(today.setMonth(today.getMonth() + termLength));

    if (termLength != 0 || expirationDate <= today) {

      var dd = expirationDate.getDate();
      var mm = expirationDate.getMonth() + 1;
      var yyyy = expirationDate.getFullYear();

      $scope.Endorsement.Expiration = mm + '/' + dd + '/' + yyyy;
    }
  }

  setTimeout(function () { $scope.effectiveDateChanged(); }, 100);
}]);

MALACHIAPP.controller('cceEndorsementModelCtrl', ['$rootScope', '$scope', '$http', '$ocLazyLoad', '$modal', '$modalInstance', 'policyService', 'test_policyService', 'policy', function ($rootScope, $scope, $http, $ocLazyLoad, $modal, $modalInstance, policyService, test_policyService, policy) {
  $scope.policy = policy;
  $scope.contracts = [];
  $scope.filteredContracts = [];
  $scope.splitContracts = [];
  $scope.lastIndex = 0;
  $scope.errors = [];


  $scope.close = function () {
    $modalInstance.close('cancel');
  }

  $scope.save = function () {
    validateForm();
    if ($scope.errors.length > 0) return;
    $scope.bindEndorsement();
  }

  $scope.isContractsEmpty = function () {
    return $scope.filteredContracts.length === 0;
  }

  $scope.assignSelectedContract = function (contract) {// Liability CCE
    $scope.selectedContract = contract.SelectedContract;
  }

  $scope.isSplitContractsEmpty = function () {
    return $scope.splitContracts.length === 0;
  }

  $scope.isSplitContractsMaxedOut = function () {
    return $scope.splitContracts.length >= $scope.contracts.length;
  }

  $scope.filterContracts = function () {
    $scope.filteredContracts = $scope.contracts.filter(function (x) {
      return !$scope.splitContracts.some(function (y) {
        var contract = y.SelectedContract;
        return contract !== null && contract.Id === x.Id;
      });
    });
  }

  $scope.addSplitContract = function (selectedContract, split) {
    // Create an empty split contract.
    var splitContract = {
      Index: $scope.lastIndex++,
      SelectedContract: selectedContract,
      Split: split == null ? '0' : split
    };

    $scope.splitContracts.push(splitContract);
    $scope.filterContracts();
  }

  $scope.removeSplitContract = function (index) {
    // Filter out any contract with the corresponding index.
    $scope.splitContracts = $scope.splitContracts.filter(function (x) {
      return x.Index !== index;
    });

    $scope.filterContracts();

    if ($scope.isSplitContractsEmpty())
      $scope.lastIndex = 0;
  }

  $scope.bindEndorsement = function () {
    var contractSplits = {};

    for (var i = 0; i < $scope.splitContracts.length; i++) {
      var splitContract = $scope.splitContracts[i];
      contractSplits[splitContract.SelectedContract.Id] = splitContract.Split;
    }

    Metronic.blockUI({ target: '#cce-endorsement', animate: true, overlayColor: 'none' });
    test_policyService.bindCCEEndorsementSetup(policy.Id, contractSplits, false).then(function (result) {
      Metronic.unblockUI('#cce-endorsement');

      if (result.data.Result.Success) {
        if (policy.Endorsements == null) policy.Endorsements = [];
        policy.Endorsements.push(result.data.Endorsement);

        if (policy.EndorsementNumbers == null) policy.EndorsementNumbers = [];
        policy.EndorsementNumbers.push(result.data.Endorsement.EndorsementNumber);

        if (policy.ParentId == null) policy.ParentId = policy.Id;
        policy.Id = result.data.Endorsement.EndorsementPolicyId;

        $modalInstance.close();
      } else {
        $scope.errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('#cce-endorsement');
      $scope.errors = ['An unexpected error has occurred. Please refresh the page and try again.'];
    });
  };

  function validateForm() {
    $scope.errors = [];
    var isNoContractSelected = false;
    var isAnySplitEmpty = false;
    var isAnySplitNaN = false;
    var splitSum = 0;

    for (var i = 0; i < $scope.splitContracts.length; i++) {
      var contract = $scope.splitContracts[i];

      if (contract.SelectedContract == null)
        isNoContractSelected = true;

      if (isNullOrEmpty(contract.Split)) {
        isAnySplitEmpty = true;
      } else {
        if (isNaN(contract.Split)) {
          isAnySplitNaN = true;
        } else {
          var split = parseInt(contract.Split);
          if (split < 0 || split > 100) {
            isAnySplitNaN = true;
          } else {
            splitSum += split;
          }
        }
      }
    }

    if (isNoContractSelected)
      $scope.errors.push('A contract number must be selected.');

    if (isAnySplitEmpty)
      $scope.errors.push('Split(s) cannot be empty.');

    if (isAnySplitNaN) {
      $scope.errors.push('Split(s) must contain a whole number between 0 - 100.');
    } else {
      if (splitSum != 100)
        $scope.errors.push('Split(s) must accumulate up to 100% (currently at ' + splitSum + '%).');
    }
  }

  function isNullOrEmpty(str) {
    return typeof (str) !== 'string' || str.length === 0;
  }

  function loadContracts() {
    Metronic.blockUI({ target: '#cce-endorsement', animate: true, overlayColor: 'none' });
    test_policyService.getCCEEndorsementSetup(policy.Id, policy.AppId, ["Property"]).then(function (result) {
      Metronic.unblockUI('#cce-endorsement');
      if (result.data.Result.Success) {
        $scope.contracts = result.data.AvailableContracts;

        for (var i = 0; i < result.data.CurrentContracts.length; i++) {
          var currentContract = result.data.CurrentContracts[i];
          var split = result.data.CurrentContractSplits[currentContract.Name].toString();

          $scope.addSplitContract(currentContract, split);
        }

        $scope.filterContracts();
      } else {
        $scope.errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('#cce-endorsement');
      $scope.errors = ['An unexpected error has occurred. Please refresh the page and try again.'];
    });
  }

  setTimeout(function () { loadContracts(); }, 50);
}]);

MALACHIAPP.controller('cceEndorsementLiabilityModelCtrl', ['$rootScope', '$scope', '$http', '$ocLazyLoad', '$modal', '$modalInstance', 'policyService', 'test_policyService', 'policy', function ($rootScope, $scope, $http, $ocLazyLoad, $modal, $modalInstance, policyService, test_policyService, policy) {
  $scope.policy = policy;
  $scope.contracts = [];
  $scope.filteredContracts = [];
  $scope.splitContracts = [];
  $scope.lastIndex = 0;
  $scope.errors = [];
  $scope.selectedContract; // This is for liability  CCE endorsements
  $scope.originalLiabilityContract; // the original CCE endorsement
  $scope.liabilityContracts = [];

  $scope.close = function () {
    $modalInstance.close('cancel');
  }

  $scope.save = function () {
    validateForm();
    if ($scope.errors.length > 0) return;
    $scope.bindEndorsement();
  }

  $scope.saveLiability = function () {
    if ($scope.errors.length > 0) return;
    $scope.bindLiabilityEndorsement();
  }


  $scope.isContractsEmpty = function () {
    return $scope.liabilityContracts.length === 0;
  }

  $scope.assignSelectedContract = function (contract) {// Liability CCE
    $scope.selectedContract = contract.SelectedContract;
  }

  $scope.isSplitContractsEmpty = function () {
    return $scope.splitContracts.length === 0;
  }

  $scope.isSplitContractsMaxedOut = function () {
    return $scope.splitContracts.length >= $scope.contracts.length;
  }

  $scope.filterContracts = function () {
    $scope.filteredContracts = $scope.contracts.filter(function (x) {
      return !$scope.splitContracts.some(function (y) {
        var contract = y.SelectedContract;
        return contract !== null && contract.Id === x.Id;
      });
    });
  }

  $scope.addSplitContract = function (selectedContract, split) {
    // Create an empty split contract.
    var splitContract = {
      Index: $scope.lastIndex++,
      SelectedContract: selectedContract,
      Split: split == null ? '0' : split
    };

    $scope.splitContracts.push(splitContract);
    $scope.filterContracts();
  }

  $scope.removeSplitContract = function (index) {
    // Filter out any contract with the corresponding index.
    $scope.splitContracts = $scope.splitContracts.filter(function (x) {
      return x.Index !== index;
    });

    $scope.filterContracts();

    if ($scope.isSplitContractsEmpty())
      $scope.lastIndex = 0;
  }


  $scope.bindLiabilityEndorsement = function () {


    if ($scope.selectedContract == null) { $scope.errors = ['An unexpected error has occurred. Please refresh the page and try again.']; }

    var contractSplits = {};
    contractSplits[$scope.selectedContract.Id] = 100;

    Metronic.blockUI({ target: '#cce-endorsement', animate: true, overlayColor: 'none' });
    test_policyService.bindCCELiabilityEndorsementSetup(policy.Id, contractSplits, false).then(function (result) {
      Metronic.unblockUI('#cce-endorsement');

      if (result.data.Result.Success) {
        if (policy.Endorsements == null) policy.Endorsements = [];
        policy.Endorsements.push(result.data.Endorsement);

        if (policy.EndorsementNumbers == null) policy.EndorsementNumbers = [];
        policy.EndorsementNumbers.push(result.data.Endorsement.EndorsementNumber);

        if (policy.ParentId == null) policy.ParentId = policy.Id;
        policy.Id = result.data.Endorsement.EndorsementPolicyId;

        $modalInstance.close();
      } else {
        $scope.errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('#cce-endorsement');
      $scope.errors = ['An unexpected error has occurred. Please refresh the page and try again.'];
    });

  }


  function validateForm() {
    $scope.errors = [];

    var isNoContractSelected = false;
    var isAnySplitEmpty = false;
    var isAnySplitNaN = false;
    var splitSum = 0;

    for (var i = 0; i < $scope.splitContracts.length; i++) {
      var contract = $scope.splitContracts[i];

      if (contract.SelectedContract == null)
        isNoContractSelected = true;

      if (isNullOrEmpty(contract.Split)) {
        isAnySplitEmpty = true;
      } else {
        if (isNaN(contract.Split)) {
          isAnySplitNaN = true;
        } else {
          var split = parseInt(contract.Split);
          if (split < 0 || split > 100) {
            isAnySplitNaN = true;
          } else {
            splitSum += split;
          }
        }
      }
    }

    if (isNoContractSelected)
      $scope.errors.push('A contract number must be selected.');

    if (isAnySplitEmpty)
      $scope.errors.push('Split(s) cannot be empty.');

    if (isAnySplitNaN) {
      $scope.errors.push('Split(s) must contain a whole number between 0 - 100.');
    } else {
      if (splitSum != 100)
        $scope.errors.push('Split(s) must accumulate up to 100% (currently at ' + splitSum + '%).');
    }
  }

  function isNullOrEmpty(str) {
    return typeof (str) !== 'string' || str.length === 0;
  }





  function loadContracts() {
    Metronic.blockUI({ target: '#cce-endorsement', animate: true, overlayColor: 'none' });
    test_policyService.getCCEEndorsementSetup(policy.Id, policy.AppId, ["Liability"]).then(function (result) {
      Metronic.unblockUI('#cce-endorsement');
      if (result.data.Result.Success) {
        $scope.liabilityContracts = result.data.AvailableContracts;
        $scope.originalLiabilityContract = result.data.CurrentContracts[0]; // the original liability contract for the policy

        for (var i = 0; i < result.data.CurrentContracts.length; i++) {
          var currentContract = result.data.CurrentContracts[i];
          var split = result.data.CurrentContractSplits[currentContract.Name].toString();

          $scope.addSplitContract(currentContract, split);
        }

        $scope.filterContracts();
      } else {
        $scope.errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('#cce-endorsement');
      $scope.errors = ['An unexpected error has occurred. Please refresh the page and try again.'];
    });
  }

  setTimeout(function () { loadContracts(); }, 50);
}]);


MALACHIAPP.controller('updateContactModelCtrl', ['$rootScope', '$scope', '$http', '$ocLazyLoad', '$modalInstance', 'policyService', 'test_policyService', 'agencyService', 'policy', function ($rootScope, $scope, $http, $ocLazyLoad, $modalInstance, policyService, test_policyService, agencyService, policy) {
  $scope.policy = policy;
  $scope.errors = [];
  $scope.AgencyDetails = {};
  $scope.AgencyContacts = [];
  $scope.SelectedContact = { Id: null };

  $scope.close = function () {
    $modalInstance.close('cancel');
  }

  $scope.save = function () {
    validateForm();
    if ($scope.errors.length > 0) return;
    $modalInstance.close({
      PolicyId: $scope.policy.Id,
      SelectedContactId: $scope.SelectedContact.Id
    });
  }

  function validateForm() {
    $scope.errors = [];
    if (!$scope.SelectedContact && !$scope.SelectedContact.Id) {
      $scope.errors.push('Please select a agency contact.');
    }
  }

  /* TODO REPLACE WITH AGM CALL */
  function initialize() {
    // Load agency details from policy.        
    var policyId = $scope.policy.Id;

    Metronic.blockUI({ target: '#update-contact', animate: true, overlayColor: 'none' });
    agencyService.getAgencyDetails(policyId).then(function (result) {
      $scope.AgencyDetails = result.data;
      agencyService.getAgencyContacts(policyId, result.data.AgencyId).then(function (result) {
        Metronic.unblockUI('#update-contact');
        $scope.AgencyContacts = result.data;
        var selectedContact = $scope.AgencyContacts.find(x => x.Selected);
        if (selectedContact)
          $scope.SelectedContact.Id = selectedContact.Id;
      }, function (error) {
        Metronic.unblockUI('#update-contact');
        $scope.errors = error.data.Message.split("\r\n");
      });
    }, function (error) {
      Metronic.unblockUI('#update-contact');
      $scope.errors = error.data.Message.split("\r\n");
    });
  }

  setTimeout(function () { initialize(); }, 10);
}]);

MALACHIAPP.controller('updateAccountExecModelCtrl', ['$rootScope', '$scope', '$http', '$ocLazyLoad', '$modalInstance', 'policyService', 'test_policyService', 'policyId', function ($rootScope, $scope, $http, $ocLazyLoad, $modalInstance, policyService, test_policyService, policyId) {
  $scope.policyId = policyId;
  $scope.policy = {};
  $scope.accountExecutives = [];
  $scope.offices = [];
  $scope.errors = [];

  $scope.close = function () {
    $modalInstance.close('cancel');
  }

  $scope.save = function () {
    $scope.validate();
    if ($scope.errors.length > 0)
      return;

    $modalInstance.close({
      UpdatedPolicy: $scope.policy
    });
  }

  $scope.validate = function () {
    $scope.errors = [];

    if ($scope.policy.UnderwriterId == null || $scope.policy.UnderwriterId == "")
      $scope.errors.push("Please select an account executive.");

    if ($scope.policy.OfficeId == null || $scope.policy.OfficeId == "")
      $scope.errors.push("Please select an office.");
  }

  $scope.accountExecutiveSelected = function () {
    var userId = $scope.policy.UnderwriterId;
    var user = $scope.accountExecutives.find(function (x) { return x.Id == userId });

    if (user != null)
      $scope.policy.OfficeId = user.OfficeId;
  }

  $scope.searchByBeginsWith = function (actual, expected) {
    var searchString = (actual + '').toLowerCase();
    return searchString.indexOf(expected.toLowerCase()) === 0;
  }

  // Initialization
  setTimeout(function () {
    // Retrieve policy info.
    Metronic.blockUI({ target: "#update-exec", animate: true, overlayColor: "none" });
    policyService.getPolicyInfo($scope.policyId, false).then(function (result) {
      Metronic.unblockUI("#update-exec");
      if (result.data.Result.Success) {
        var policy = result.data.Policy;

        // Retrieve account executives and offices.
        Metronic.blockUI({ target: "#update-exec", animate: true, overlayColor: "none" });
        policyService.getOfficesAndExecutives($scope.policy.Id, $scope.policy.ManagingGeneralAgentId, false).then(function (result) {
          Metronic.unblockUI("#update-exec");
          if (result.data.Result.Success) {
            $scope.policy = policy;
            $scope.accountExecutives = result.data.Users;
            $scope.offices = result.data.Offices;
          } else {
            $scope.errors = result.data.Result.Errors;
          }
        }, function (error) {
          Metronic.unblockUI("#update-exec");
          $scope.errors = ["An unexpected error has occurred. Please refresh the page."];
          console.log(error);
        });
      } else {
        $scope.errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI("#update-exec");
      $scope.errors = ["An unexpected error has occurred. Please refresh the page."];
      console.log(error);
    });
  }, 100);
}]);
