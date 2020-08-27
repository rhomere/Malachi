'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_LiabilityController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', 'settings', 'policyService', 'toolsService', 'test_policyService', 'customPackageService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, settings, policyService, toolsService, test_policyService, customPackageService) {
  $scope.parent = $scope.$parent;

  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.parent.ClassCodes = [];
  $scope.RiskCompanies = [];
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.containsLiquorLiabCodes = false;
  $scope.selectedRiskCompany = null;

  if ($scope.AppId == null) {
    $rootScope.$state.transitionTo('policyDashboard');
  }

  if ($scope.PolicyId) { // Existing Policy
    loadLiability();
  }
  else {
    $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
  }

  function loadLiability() {
    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    if ($scope.RiskCompanies.length == 1) setTimeout(function () { $('.riskCompanies').parent().hide() }, 10);
    $scope.parent.LoadingPage = false;
  }

  $scope.isCustomPackageRiskCompany = function (riskCompany) {
    return customPackageService.isCustomPackageRiskCompany(riskCompany);
  };

  $scope.showEligibleClassCodes = function () {
    var modalInstance = $modal.open({
      templateUrl: 'eligibleClassCodes.html',
      controller: 'test_Commercial_Lines_eligibleClassCodes',
      backdrop: 'static',
      size: 'lg'
    });


    modalInstance.result.then(function (data) {
    });
  };

  $scope.isAnEndorsement = function () {
    return $scope.parent.Policy.EndorsementNumber != null;
  };

  $scope.updatePolicy = function (rate) {
    if (rate) Metronic.blockUI({ animate: true, overlayColor: 'none' });

    $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateOccuranceLimit.split('/')[0];
    $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateOccuranceLimit.split('/')[1];

    test_policyService.updateLiability($scope.Policy, rate).then(function (result) {
      $scope.parent.Policy = result.data.Policy;
      $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];

      $scope.setupClassCodes();

      notificationsHub.showSuccess('Quote ' + $scope.parent.Policy.Number, 'Liability limits updated.');

      if (result.data.Result.Success == false) {
        $scope.Errors = result.data.Result.Errors;
        notificationsHub.showErrors('Quote ' + $scope.parent.Policy.Number, result.data.Result.Errors);
      }
      if (rate) Metronic.unblockUI();
    }, function (error) {
      notificationsHub.showError('Quote ' + $scope.parent.Policy.Number, 'An unexpected error has occured. Please refresh the page.');
    });
  }

  $scope.addClassCode = function (aiOnly) {
    $scope.Errors = "";
    var modalInstance = $modal.open({
      templateUrl: 'addClassCode.html',
      controller: 'test_Commercial_Lines_addClassCodeCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        policyId: function () {
          return $scope.PolicyId;
        },
        policy: function () {
          return $scope.parent.Policy;
        },
        contracts: function () {
          return $scope.parent.Contracts;
        },
        locations: function () {
          return $scope.parent.Policy.CurrentVersion.Locations;
        },
        classcodes: function () {
          return $scope.parent.Policy.CurrentVersion.ClassCodes;
        },
        contractId: function () {
          return $scope.parent.Policy.CurrentVersion.Liability.ContractId;
        },
        aiOnly: function () {
          return aiOnly;
        },
        allClassCodes: function () {
          return $scope.parent.AllClassCodes;
        }
      }
    });


    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        $scope.parent.Policy.CurrentVersion.Forms = data.policyForms;
        $scope.parent.Policy.CurrentVersion.RateProperty = true;
        $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts = data.liabilityRiskCompanyContracts;

        $scope.checkAuthorized(data.classCode);

        $scope.setupClassCodes();
        $scope.modify(data.classCode, $scope.selectedRiskCompany, true);

        //$scope.coinLaundryHardCodeForMarketChange();
      }
    });

  };

  //$scope.coinLaundryHardCodeForMarketChange = function () {
  //  var riskCompany = $scope.RiskCompanies.find(x => x.Id == "4488e1cd-a57b-4e16-828e-cf2bc4a03186");
  //  var hasCoinLaundryClassCode = $scope.parent.Policy.CurrentVersion.ClassCodes.some(x => x.Number == "14731");

  //  if (hasCoinLaundryClassCode) {
  //    var contract = $scope.parent.Contracts.find(x => x.RiskCompanyId == riskCompany.Id && x.InsurerName == "Apollo");
  //    if (contract != null) {
  //      riskCompany.ContractId = contract.Id;
  //      $scope.contractChange(riskCompany);
  //    }
  //  }
  //}

  $scope.addAssaultAndBattery = function () {
    $scope.Errors = "";
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    test_policyService.newClassCode($scope.Policy, $scope.Contracts, null, '99999', 'Assault&Battery').then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy.CurrentVersion.ClassCodes.push(result.data.ClassCode);
        $scope.parent.Policy.CurrentVersion.Forms = result.data.PolicyForms;
        $scope.parent.Policy.CurrentVersion.RateProperty = true;
        $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts = result.data.RiskCompanyContracts;
        $scope.parent.Policy.CurrentVersion.ContractDeclines = result.data.ContractDeclines;
        $scope.parent.Policy.CurrentVersion.ContractSubmits = result.data.ContractSubmits;

        $scope.setupClassCodes();

        var classCode = result.data.ClassCode;

        $scope.modify(classCode, $scope.selectedRiskCompany, true);

        Metronic.unblockUI();
      }
      else {
        Metronic.unblockUI();
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI();
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  };


  $scope.addStopGap = function () {
    var riskCompany = $scope.RiskCompanies[0];
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    policyService.newClassCode($scope.parent.Policy, $scope.Contracts, null, '99999', 'StopGap').then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy.CurrentVersion.ClassCodes.push(result.data.ClassCode);
        $scope.parent.Policy.CurrentVersion.Forms = result.data.PolicyForms;
        $scope.parent.Policy.CurrentVersion.RateProperty = true;
        $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts = result.data.RiskCompanyContracts;
        $scope.parent.Policy.CurrentVersion.ContractDeclines = result.data.ContractDeclines;
        $scope.parent.Policy.CurrentVersion.ContractSubmits = result.data.ContractSubmits;

        $scope.setupClassCodes();

        var classCode = result.data.ClassCode;

        $scope.modify(classCode, $scope.selectedRiskCompany, true);

        Metronic.unblockUI();
      }
      else {
        $scope.Errors = result.data.Result.Errors;
        Metronic.unblockUI();
      }
    }, function (error) {
      Metronic.unblockUI();
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  };


  $scope.addHNOClassCode = function () {
    $scope.Errors = "";
    var modalInstance = $modal.open({
      templateUrl: 'test_Commercial_Lines_addHNOClassCode.html',
      controller: 'test_Commercial_Lines_addHNOClassCodeCtrl',
      backdrop: 'static',
      resolve: {
        policyId: function () {
          return $scope.PolicyId;
        },
        policy: function () {
          return $scope.parent.Policy;
        },
        contracts: function () {
          return $scope.parent.Contracts;
        },
        classcodes: function () {
          return $scope.parent.Policy.CurrentVersion.ClassCodes;
        },
        contractId: function () {
          return $scope.parent.Policy.CurrentVersion.Liability.ContractId;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        var classCode = data.classCode;
        var subNumber = data.subNumber;

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        test_policyService.newClassCode($scope.parent.Policy, $scope.parent.Contracts, null, classCode, subNumber).then(function (result) {
          if (result.data.Result.Success) {
            $scope.parent.Policy.CurrentVersion.ClassCodes.push(result.data.ClassCode);
            $scope.parent.Policy.CurrentVersion.RateProperty = true;
            $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts = result.data.RiskCompanyContracts;
            $scope.parent.Policy.CurrentVersion.ContractDeclines = result.data.ContractDeclines;
            $scope.parent.Policy.CurrentVersion.ContractSubmits = result.data.ContractSubmits;
            $scope.setupClassCodes();


            $scope.modify(result.data.ClassCode, $scope.selectedRiskCompany, true);

            Metronic.unblockUI();
          }
          else {
            $scope.Errors = result.data.Result.Errors;
            Metronic.unblockUI();
          }
        }, function (error) {
          Metronic.unblockUI();
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      }
    });
  };

  $scope.checkAuthorized = function (classCode) {
    var selectedAuthorized = $.grep(classCode.ClassCodeRateInfo, function (x) { return x.RiskCompanyId == $scope.selectedRiskCompany.Id }).length;
    if (selectedAuthorized == 0) {
      for (var i = 0; i < $scope.RiskCompanies.length; i++) {
        if ($scope.RiskCompanies[i].Id != $scope.selectedRiskCompany.Id) {
          selectedAuthorized = $.grep(classCode.ClassCodeRateInfo, function (x) { return x.RiskCompanyId == $scope.RiskCompanies[i].Id }).length;
          if (selectedAuthorized > 0) {
            $scope.changeRiskCompany($scope.RiskCompanies[i]);
            return;
          }
        }
      }
      $scope.Errors = ['An unexpected error has occured. The selected class code does not exist for any of the given Risk Companies. Please refresh the page.'];
    }
    else {
      return;
    }
  }

  $scope.modify = function (classCode, riskCompany, justAdded) {
    var modalInstance = $modal.open({
      templateUrl: 'modifyClassCode.html',
      controller: 'test_Commercial_Lines_modifyClassCodeCtrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        policyId: function () {
          return $scope.PolicyId;
        },
        policy: function () {
          return $scope.Policy;
        },
        contractId: function () {
          return $scope.Policy.CurrentVersion.Liability.ContractId;
        },
        classCode: function () {
          return classCode;
        },
        locations: function () {
          return $scope.parent.Policy.CurrentVersion.Locations;
        },
        riskCompanies: function () {
          return $scope.RiskCompanies;
        },
        riskCompanyContracts: function () {
          return $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts;
        },
        submitReviewer: function () {
          return $scope.submitReviewer;
        },
        parent: function () {
          return $scope.parent;
        },
        riskCompany: function () {
          return riskCompany;
        },
        justAdded: function () {
          return justAdded;
        },
        states: function () {
          return $scope.parent.States;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != "close" || data != "closeView")
        $scope.setupClassCodes();

      //if (justAdded && classCode.Number == '14731')
      //  $scope.coinLaundryHardCodeForMarketChange();
    });
  }

  $scope.copy = function (classCode) {
    var modalInstance = $modal.open({
      templateUrl: 'copyClassCode.html',
      controller: 'test_Commercial_Lines_copyClassCodeCtrl',
      backdrop: 'static',
      size: 'md',
      resolve: {
        policyId: function () {
          return $scope.PolicyId;
        },
        policy: function () {
          return $scope.parent.Policy;
        },
        locations: function () {
          return $scope.parent.Policy.CurrentVersion.Locations;
        },
        classCode: function () {
          return classCode;
        },
        classCodes: function () {
          return $scope.parent.Policy.CurrentVersion.ClassCodes;
        }
      }
    });


    modalInstance.result.then(function (data) {
      if (data != 'cancel') {

        $scope.checkAuthorized(data[0]);

        $scope.setupClassCodes();
      }
    });
  }

  $scope.delete = function (classCode) {
    BootstrapDialog.show({
      title: 'Are you sure?',
      message: 'Are you sure you want to delete this class code?',
      buttons: [{
        label: 'Cancel',
        action: function (dialogItself) {
          dialogItself.close();
        }
      }, {
        label: 'Delete Class code',
        cssClass: 'btn-primary',
        action: function (dialogItself) {
          test_policyService.deleteClassCode($scope.parent.Policy, classCode.Id).then(function (result) {
            if (result.data.Result.Success) {
              $scope.parent.Policy.CurrentVersion.Premiums = result.data.PremiumBreakdowns;
              $scope.parent.Policy.CurrentVersion.ClassCodes.splice($scope.parent.Policy.CurrentVersion.ClassCodes.indexOf(classCode), 1);
              $scope.parent.Policy.CurrentVersion.RateProperty = true;

              $scope.setupClassCodes();

              notificationsHub.showSuccess('Quote', 'Class Code ' + classCode.Number + ' deleted.');

              //$scope.coinLaundryHardCodeForMarketChange();
            }
            else {
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

  $scope.updateAggOccurance = function () {
    $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateOccuranceLimit.split('/')[0];
    $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateOccuranceLimit.split('/')[1];

    var eachOccurance = $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit.replace(' CSL', '');
    var generalAgg = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit.replace(' CSL', '');
    var sameChoice = eachOccurance == generalAgg;
    $scope.PersAndAdvInjuryLimits = [
      { Id: eachOccurance, Name: "$" + eachOccurance },
      { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
    ];
    if ($scope.parent.Policy.CurrentVersion.Liability.PersAndAdvInjuryLimit != "-- NOT COVERED --") $scope.parent.Policy.CurrentVersion.Liability.PersAndAdvInjuryLimit = eachOccurance;

    if ($scope.parent.Policy.CurrentVersion.ClassCodes.length == 0) {
      if (!sameChoice) {
        $scope.ProductAggregateLimits = [
          { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
          { Id: $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit, Name: '$' + eachOccurance },
          { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
        ];
      } else {
        $scope.ProductAggregateLimits = [
          { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
          { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
        ];
      }

      if ($scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit != "-- NOT COVERED --")
        $scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit = $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit;
    } else {
      var included = false;
      for (var i = 0; i < $scope.parent.Policy.CurrentVersion.ClassCodes.length; i++) {
        var classCode = $scope.parent.Policy.CurrentVersion.ClassCodes[i];
        if (classCode.ClassCodeRatingInputs.length > 0 && classCode.ClassCodeRatingResults.length > 0) {
          var input = classCode.ClassCodeRatingInputs[0];
          var info = classCode.ClassCodeRateInfo[0];
          var result = classCode.ClassCodeRatingResults[0];
          if (input.RateBy != "If Any") {
            if (input.ExcludeProducts == false &&
              info.ProductsAuthority != "Not Authorized" &&
              info.ProductsAuthority != "Prohibited" &&
              info.ProductsAuthority != "Excluded" &&
              ((info.IsoRateInfo != null && info.IsoRateInfo.ProductExposureGroups.length == 0) ||
                (info.CompanyRateInfo != null && info.CompanyRateInfo.ProductExposureGroups.length == 0)) &&
              (result.ProductsPremium == 0 || result.ProductsPremium == null)) {
              included = true;
            } else {
              included = false;
              break;
            }
          }
        }
      }

      if (included) {
        if (!sameChoice) {
          $scope.ProductAggregateLimits = [
            { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
            { Id: $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit, Name: '$' + eachOccurance },
            { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
          ];
        } else {
          $scope.ProductAggregateLimits = [
            { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
            { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
          ];
        }

        if ($scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit != "-- NOT COVERED --")
          $scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit = $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit;
      } else {
        if (!sameChoice) {
          $scope.ProductAggregateLimits = [
            { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
            { Id: $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit, Name: '$' + eachOccurance },
            { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
          ];
        } else {
          $scope.ProductAggregateLimits = [
            { Id: $scope.parent.Policy.CurrentVersion.Liability.GeneralAggregateLimit, Name: '$' + generalAgg },
            { Id: "-- NOT COVERED --", Name: "-- NOT COVERED --" }
          ];
        }

        if ($scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit != "-- NOT COVERED --")
          $scope.parent.Policy.CurrentVersion.Liability.ProductAggregateLimit = $scope.parent.Policy.CurrentVersion.Liability.EachOccurrenceLimit;
      }
    }

    $scope.updatePolicy(true);
  }

  function isAssaultBattery(classCode) {
    return classCode.Number == "99999" && classCode.ClassCodeRateInfo[0].SubNumber == "Assault&Battery";
  }

  function isNullOrEmpty(text) {
    return text == null || text == "";
  }

  function toInteger(text) {
    if (isNullOrEmpty(text)) return 0;
    var numAsString = text.replace(",", "").replace("$", "");
    return !isNaN(numAsString) ? parseInt(numAsString) : 0;
  }

  $scope.updateLiquorAssaultBattery = function () {
    // Check if a liquor liability limit is set.
    var version = $scope.parent.Policy.CurrentVersion;
    var isLiquorCovered = version.Liability.LiquorLiabilityLimits != "-- NOT COVERED --";

    // Get the A&B class code.
    var abClassCode = version.ClassCodes.find(x => isAssaultBattery(x));

    if (isLiquorCovered && abClassCode != null) {
      // Get the A&B occurrence and aggregate limits.
      var questions = classCode.ClassCodeRateInfo[0].CompanyRateInfo[0].AdditionalQuestions;
      var occurrenceQid = questions.find(x => x.Question == "Occurrence").QuestionID;
      var aggregateQid = questions.find(x => x.Question == "Aggregate").QuestionID;

      var answers = classCode.ClassCodeRateInputs[0].CompanyRatingInput[0].AdditionalQuestionAnswers;
      var occurrence = answers.find(x => x.QuestionID == occurrenceQid).Answer;
      var aggregate = answers.find(x => x.QuestionID == aggregateQid).Answer;

      // Assign the limits to Liquor A&B. 
      if (toInteger(occurrence) <= 0 || toInteger(aggregate) <= 0) {
        version.Liability.LiquorAssaultandBatteryLimits = "-- NOT COVERED --"
      }
      else {
        occurrence = toInteger(occurrence);
        aggregate = toInteger(aggregate);
        version.Liability.LiquorAssaultandBatteryLimits = $scope.toCurrency(aggregate) + "/" + $scope.toCurrency(occurrence);
      }
    }
    else {
      // Default to NOT COVERED.
      version.Liability.LiquorAssaultandBatteryLimits = "-- NOT COVERED --";
    }
  }

  function isNullOrEmpty(text) {
    return text == null || text == "";
  }

  $scope.getLiabilityContracts = function (riskCompany) {
    return riskCompany.Contracts.filter(x => x.Coverages.includes("Liability"));
  };

  $scope.setupClassCodes = function () {
    var j;
    if ($scope.parent.Policy.CurrentVersion.Locations != null) {
      for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
        var location = $scope.parent.Policy.CurrentVersion.Locations[i];
        location.ClassCodes = [];
        for (j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
          var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
          if (c.LocationNumber == location.LocationNumber) {
            location.ClassCodes.push(c);
          }
        }
      }
    }

    for (var k = 0; k < $scope.RiskCompanies.length; k++) {
      var company = $scope.RiskCompanies[k];

      if (company.ContractId == null) {
        var comps = $.grep($scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts, function (x) { return (x.RiskCompanyId == company.Id); });
        if (comps.length > 0) {
          company.ContractId = comps[0].ContractId;
        }
      }

      if (company.ContractId == null) {
        // The below code should default the Acapella market for GL when available.
        var acapellaContract = company.ContractId = company.Contracts.find(x => x.InsurerName == "Acappella");
        if (acapellaContract != null) {
          company.ContractId = acapellaContract.Id;
        } else {
          company.ContractId = company.Contracts[0].Id;
        }
      }
    }

    if ($scope.parent.Policy.CurrentVersion.Locations != null) {
      $scope.containsLiquorLiabCodes = false;
      for (j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
        var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
        for (var i = 0; i < c.ClassCodeRateInfo.length; i++) {
          if (c.ClassCodeRateInfo[i].ContractId == '6caf110d-7252-4c98-8637-98404096f43c') {
            for (var k = 0; k < $scope.LiquorLiabilityClassCodes.length; k++) {
              if (c.ClassCodeRateInfo[i].Number == $scope.LiquorLiabilityClassCodes[k].Number) {
                $scope.containsLiquorLiabCodes = true;
                break;
              }
            }
          }
        }
      }
    }

    $scope.RiskCompanies.forEach(x => {
      var liabilityRiskCompanies = $scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts.filter(r => r.Id == x.Id);
      if (liabilityRiskCompanies.length > 0) {
        x.ContractId = liabilityRiskCompanies[0].ContractId;
      }
    });
  }

  $scope.contractChange = function (riskCompany) {
    policyService.updatePolicyClassCodeContract($scope.PolicyId, riskCompany.Id, riskCompany.ContractId).then(function (result) {
      if (result.data.Result.Success) {
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.showGeneralClassCodes = function (riskCompany) {
    var classCodes = $scope.parent.Policy.CurrentVersion.ClassCodes;
    if (classCodes == null) return false;

    var generalClassCodes = classCodes.filter(x => x.Number != "49950" && x.LocationNumber == null);
    for (var classCode of generalClassCodes) {
      if (!$scope.canIgnoreClassCode(classCode, riskCompany)) {
        return true;
      }
    }

    return false;
  }

  $scope.sortRiskCompanies = function () {
    var tempList = [];
    for (var i = 0; i < $scope.RiskCompanies.length; i++) {
      for (var j = 0; j < $scope.RiskCompanies.length; j++) {
        if ($scope.RiskCompanies[i].Name < $scope.RiskCompanies[j].Name) {
          var temp = $scope.RiskCompanies[i];
          $scope.RiskCompanies[i] = $scope.RiskCompanies[j];
          $scope.RiskCompanies[j] = temp;
        }
      }
    }
    if ($scope.parent.Policy == null || $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId == null)
      $scope.selectedRiskCompany = $scope.RiskCompanies[0];
    else
      $scope.selectedRiskCompany = $.grep($scope.RiskCompanies, function (x) { return (x.Id == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId); })[0];
    $scope.changeRiskCompany($scope.selectedRiskCompany);
  }

  $scope.changeRiskCompany = function (riskCompany) {
    if (riskCompany == null) return;
    $.each($scope.RiskCompanies, function (index, element) { element.active = false; });
    riskCompany.active = true;
    $scope.selectedRiskCompany = riskCompany;
  }

  $scope.getAnswer = function (riskCompany, exposure, classcode) {
    for (var i = 0; i < classcode.ClassCodeRatingInputs.length; i++) {
      var input = classcode.ClassCodeRatingInputs[i];
      if (input.ContractId == riskCompany.ContractId) {
        if (input.CompanyRatingInput != null) {
          for (var a = 0; a < input.CompanyRatingInput.AdditionalQuestionAnswers.length; a++) {
            var answer = input.CompanyRatingInput.AdditionalQuestionAnswers[a];
            if (answer.QuestionID == exposure.QuestionID) {
              return answer;
            }
          }
        }
        if (input.IsoRatingInput != null) {
          for (var a = 0; a < input.IsoRatingInput.AdditionalQuestionAnswers.length; a++) {
            var answer = input.IsoRatingInput.AdditionalQuestionAnswers[a];
            if (answer.QuestionID == exposure.QuestionID) {
              return answer;
            }
          }
        }
      }
    }
  }

  $scope.canIgnoreClassCode = function (classCode, riskCompany) {
    var hasInfo = classCode.ClassCodeRateInfo.some(x => x.ContractId == riskCompany.ContractId);
    var input = classCode.ClassCodeRatingInputs.find(x => x.ContractId == riskCompany.ContractId);
    return !hasInfo || input == null || input.IsIgnored;
  }

  $scope.canModifyClassCode = function (classCode, riskCompany) {
    var input = classCode.ClassCodeRatingInputs.find(x => x.ContractId == riskCompany.ContractId);
    return input != null && input.CanModify;
  }

  $scope.isPremisesProhibited = function (classCode, riskCompany) {
    var info = classCode.ClassCodeRateInfo.find(x => x.ContractId == riskCompany.ContractId);
    return info == null || info.PremisesAuthority == "Prohibited";
  }

  $scope.LiquorLiabilityClassCodes = [
    {
      Number: "10140"
    },
    {
      Number: "10141"
    },
    {
      Number: "10145"
    },
    {
      Number: "10146"
    },
    {
      Number: "11039"
    },
    {
      Number: "11168"
    },
    {
      Number: "13673"
    },
    {
      Number: "16910"
    },
    {
      Number: "16911"
    },
    {
      Number: "16915"
    },
    {
      Number: "16916"
    },
    {
      Number: "16920"
    },
    {
      Number: "16921"
    },
    {
      Number: "16930"
    },
    {
      Number: "16931"
    },
    {
      Number: "16940"
    },
    {
      Number: "16941"
    },
    {
      Number: "18501"
    },
    {
      Number: "51350"
    },
    {
      Number: "51351"
    },
    {
      Number: "51352"
    },
    {
      Number: "59963"
    },
    {
      Number: "59964"
    },
    {
      Number: "69999"
    },
  ];

  $scope.Deductibles = [
    {
      Id: "-- NO DEDUCTIBLE --", Name: "-- NO DEDUCTIBLE --"
    },
    {
      Id: "500 Per Occurrence", Name: "$500"
    },
    {
      Id: "750 Per Occurrence", Name: "$750"
    },
    {
      Id: "1,000 Per Occurrence", Name: "$1,000"
    },
    {
      Id: "2,000 Per Occurrence", Name: "$2,000"
    },
    {
      Id: "2,500 Per Occurrence", Name: "$2,500"
    }
  ];

  $scope.GeneralAggregateOccuranceLimits = [
    {
      Id: "100,000 CSL/100,000 CSL", Name: "$100,000 / $100,000"
    },
    {
      Id: "200,000 CSL/100,000 CSL", Name: "$200,000 / $100,000"
    },
    {
      Id: "300,000 CSL/300,000 CSL", Name: "$300,000 / $300,000"
    },
    {
      Id: "600,000 CSL/300,000 CSL", Name: "$600,000 / $300,000"
    },
    {
      Id: "500,000 CSL/500,000 CSL", Name: "$500,000 / $500,000"
    },
    {
      Id: "1,000,000 CSL/500,000 CSL", Name: "$1,000,000 / $500,000"
    },
    {
      Id: "1,000,000 CSL/1,000,000 CSL", Name: "$1,000,000 / $1,000,000"
    },
    {
      Id: "2,000,000 CSL/1,000,000 CSL", Name: "$2,000,000 / $1,000,000"
    },
    {
      Id: "2,000,000 CSL/2,000,000 CSL", Name: "$2,000,000 / $2,000,000"
    }
  ];

  $scope.MedicalExpenseLimits = [
    {
      Id: "1,000", Name: "$1,000"
    },
    {
      Id: "2,000", Name: "$2,000"
    },
    {
      Id: "2,500", Name: "$2,500"
    },
    {
      Id: "5,000", Name: "$5,000"
    },
    {
      Id: "10,000", Name: "$10,000"
    },
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    }
  ];

  $scope.PersAndAdvInjuryLimits = [
    {
      Id: "100,000", Name: "$100,000"
    },
    {
      Id: "200,000", Name: "$200,000"
    },
    {
      Id: "300,000", Name: "$300,000"
    },
    {
      Id: "500,000", Name: "$500,000"
    },
    {
      Id: "600,000", Name: "$600,000"
    },
    {
      Id: "750,000", Name: "$750,000"
    },
    {
      Id: "1,000,000", Name: "$1,000,000"
    },
    {
      Id: "2,000,000", Name: "$2,000,000"
    },
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    }
  ];

  $scope.ProductAggregateLimits = [
    {
      Id: "100,000 CSL", Name: "$100,000"
    },
    {
      Id: "200,000 CSL", Name: "$200,000"
    },
    {
      Id: "300,000 CSL", Name: "$300,000"
    },
    {
      Id: "500,000 CSL", Name: "$500,000"
    },
    {
      Id: "600,000 CSL", Name: "$600,000"
    },
    {
      Id: "750,000 CSL", Name: "$750,000"
    },
    {
      Id: "1,000,000 CSL", Name: "$1,000,000"
    },
    {
      Id: "1,500,000 CSL", Name: "$1,500,000"
    },
    {
      Id: "2,000,000 CSL", Name: "$2,000,000"
    },
    {
      Id: "3,000,000 CSL", Name: "$3,000,000"
    },
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    }
  ];

  $scope.DamageToPremisesLimits = [
    {
      Id: "50,000", Name: "$50,000"
    },
    {
      Id: "100,000", Name: "$100,000"
    },
    {
      Id: "150,000", Name: "$150,000"
    },
    {
      Id: "250,000", Name: "$250,000"
    },
    {
      Id: "300,000", Name: "$300,000"
    },
    {
      Id: "500,000", Name: "$500,000"
    },
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    }
  ];

  $scope.LiquorLiabilityLimits = [
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    },
    {
      Id: "100,000/100,000", Name: "$100,000/$100,000"
    },
    {
      Id: "200,000/100,000", Name: "$200,000/$100,000"
    },
    {
      Id: "300,000/300,000", Name: "$300,000/$300,000"
    },
    {
      Id: "600,000/300,000", Name: "$600,000/$300,000"
    },
    {
      Id: "500,000/500,000", Name: "$500,000/$500,000"
    },
    {
      Id: "1,000,000/500,000", Name: "$1,000,000/$500,000"
    },
    {
      Id: "1,000,000/1,000,000", Name: "$1,000,000/$1,000,000"
    },
    {
      Id: "2,000,000/1,000,000", Name: "$2,000,000/$1,000,000"
    }
  ];

  $scope.LiquorAssaultandBatteryLimits = [
    {
      Id: "-- NOT COVERED --", Name: "-- NOT COVERED --"
    },
    {
      Id: "25,000/25,000", Name: "$25,000/$25,000"
    },
    {
      Id: "50,000/25,000", Name: "$50,000/$25,000"
    },
    {
      Id: "50,000/50,000", Name: "$50,000/$50,000"
    },
    {
      Id: "100,000/50,000", Name: "$100,000/$50,000"
    },
    {
      Id: "100,000/100,000", Name: "$100,000/$100,000"
    },
    {
      Id: "200,000/100,000", Name: "$200,000/$100,000"
    },
    {
      Id: "300,000/300,000", Name: "$300,000/$300,000"
    },
    {
      Id: "600,000/300,000", Name: "$600,000/$300,000"
    },
    {
      Id: "500,000/500,000", Name: "$500,000/$500,000"
    },
    {
      Id: "1,000,000/500,000", Name: "$1,000,000/$500,000"
    },
    {
      Id: "1,000,000/1,000,000", Name: "$1,000,000/$1,000,000"
    },
    {
      Id: "2,000,000/1,000,000", Name: "$2,000,000/$1,000,000"
    }
  ];

  $scope.toCurrency = function (num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  $scope.setupClassCodes();

  $scope.sortRiskCompanies();

  // Call this after the whole page is loaded.
  $rootScope.$broadcast('$pageloaded');

}]);

MALACHIAPP.controller('test_Commercial_Lines_addClassCodeCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'test_policyService', 'policyId', 'locations', 'classcodes', 'contractId', 'aiOnly', 'policy', 'contracts', 'allClassCodes', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, test_policyService, policyId, locations, classcodes, contractId, aiOnly, policy, contracts, allClassCodes) {
  $scope.PolicyId = policyId;
  $scope.Policy = policy;
  $scope.Locations = locations;
  $scope.ClassCode = {};
  // Hotfix 17617: Previously, we default the selected location number to 1. Now, the location with the 
  // smallest location number will be picked.
  $scope.ClassCode.selectedLocationNumber = locations.reduce((n, l) => Math.min(n, l.LocationNumber), Number.MAX_VALUE);
  $scope.PolicyClassCodes = classcodes;
  $scope.ContractId = contractId;
  $scope.Contracts = contracts;
  $scope.aiOnly = aiOnly;
  $scope.Errors = [];
  $scope.ClassCodes = $.grep(allClassCodes, function (x) { return x.Number != '49950'; });
  $scope.AIClassCodes = $.grep(allClassCodes, function (x) { return x.Number == '49950'; });

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    $scope.Errors = [];

    if ($scope.aiOnly) $scope.ClassCode.selectedLocationNumber = null;

    if ($scope.ClassCode != null && $scope.ClassCode.Code != null) {
      // Check if selected location has the class code
      for (var i = 0; i < $scope.PolicyClassCodes.length; i++) {
        var c = $scope.PolicyClassCodes[i];

        if (c.Number != '49950' && c.LocationNumber == $scope.ClassCode.selectedLocationNumber &&
          c.Number == $scope.ClassCode.Code.Number &&
          c.SubNumber == $scope.ClassCode.Code.SubNumber) {
          $scope.Errors = ['This class code already exists for the selected location.'];
          return;
        }
      }

      Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
      test_policyService.newClassCode($scope.Policy, $scope.Contracts, $scope.ClassCode.selectedLocationNumber, $scope.ClassCode.Code.Number, $scope.ClassCode.Code.SubNumber, $scope.ClassCode.Code.Description).then(function (result) {
        if (result.data.Result.Success) {
          $scope.Policy.CurrentVersion.ContractDeclines = result.data.ContractDeclines;
          $scope.Policy.CurrentVersion.ContractSubmits = result.data.ContractSubmits;
          $scope.Policy.CurrentVersion.RateProperty = true;

          $scope.PolicyClassCodes.push(result.data.ClassCode);

          $modalInstance.close({ classCode: result.data.ClassCode, liabilityRiskCompanyContracts: result.data.RiskCompanyContracts, policyForms: result.data.PolicyForms });
          notificationsHub.showSuccess('Quote', 'Class Code ' + $scope.ClassCode.Code.Number + ' added.');

        }
        else {
          $scope.Errors = result.data.Result.Errors;
          $modalInstance.dismiss('cancel');
        }

        Metronic.unblockUI('.modal-dialog');
      }, function (error) {
        Metronic.unblockUI('.modal-dialog');
        $modalInstance.dismiss('cancel');
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }
  }
}]);

MALACHIAPP.controller('test_Commercial_Lines_copyClassCodeCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'test_policyService', 'policyId', 'locations', 'classCode', 'policy', 'classCodes', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, test_policyService, policyId, locations, classCode, policy, classCodes) {
  $scope.PolicyId = policyId;
  $scope.Policy = policy;
  $scope.Locations = locations;
  $scope.PolicyClassCode = classCode;
  $scope.PolicyClassCodes = $.grep(classCodes, function (x) { return x.Number === $scope.PolicyClassCode.Number });
  $scope.Errors = [];
  $scope.selectedLocations = [];

  $scope.allLocationsContainCode = function () {
    for (var i = 0; i < $scope.Locations.length; i++) {
      var location = $scope.Locations[i];
      var locationId = $.grep($scope.PolicyClassCodes, function (x) { return x.LocationId === location.Id });
      if (locationId.length == 0)
        return false;
    }
    return true;
  }

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    $scope.Errors = [];

    if ($scope.selectedLocations.length === 0) {
      $scope.Errors = ['Select location'];
      return;
    }

    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });

    test_policyService.copyClassCode($scope.Policy, $scope.selectedLocations, $scope.PolicyClassCode).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Policy.Versions = result.data.Policy.Versions;
        $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];

        notificationsHub.showSuccess('Quote', 'Class Code ' + $scope.PolicyClassCode.Number + ' copied.');
        Metronic.unblockUI('.modal-dialog');
        $modalInstance.close(result.data.ClassCodes);

      } else {
        $scope.Errors = result.data.Result.Errors;
        Metronic.unblockUI('.modal-dialog');
        return;
      }
    },
      function (error) {
        Metronic.unblockUI('.modal-dialog');
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        return;
      });
  }

  $scope.locationHasCode = function (location) {
    var locationId = $.grep($scope.PolicyClassCodes, function (x) { return x.LocationId === location.Id });
    return locationId.length > 0;
  }
}]);

MALACHIAPP.controller('test_Commercial_Lines_modifyClassCodeCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'test_policyService', 'policyId', 'policy', 'classCode', 'contractId', 'riskCompanies', 'riskCompanyContracts', 'submitReviewer', 'parent', 'riskCompany', 'locations', 'justAdded', 'states', 'customPackageService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, test_policyService, policyId, policy, classCode, contractId, riskCompanies, riskCompanyContracts, submitReviewer, parent, riskCompany, locations, justAdded, states, customPackageService) {
  $scope.PolicyId = policyId;
  $scope.Policy = policy;
  $scope.ClassCode = classCode;
  $scope.RiskCompanies = riskCompanies;
  $scope.LiabilityRiskCompanyContracts = riskCompanyContracts;
  $scope.parent = parent;
  $scope.submitReviewer = submitReviewer;
  $scope.busy = false;
  $scope.Errors = [];
  $scope.Locations = locations;
  $scope.States = states;
  $scope.justAdded = justAdded;
  $scope.TriggerRate = false;

  // logic to select correct tab
  $.each($scope.RiskCompanies, function (index, element) { element.active = false; });
  var selectedRiskCompany = $.grep($scope.RiskCompanies, function (x) { return (x.Id == riskCompany.Id); })[0];
  selectedRiskCompany ? selectedRiskCompany.active = true : $scope.RiskCompanies[0].active = true;

  // runs when user wants to change tab
  $scope.changeRiskCompany = function (riskCompany) {
    $.each($scope.RiskCompanies, function (index, element) { element.active = false; });
    riskCompany.active = true;
  }

  $scope.isCustomPackageRiskCompany = function (riskCompany) {
    return customPackageService.isCustomPackageRiskCompany(riskCompany);
  };

  $scope.subCodeChange = function (riskCompany) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.getClassCodeInfoAndInput($scope.Policy, $scope.ClassCode, riskCompany.SubClassCode.SubNumber, riskCompany.ContractId, riskCompany.Id, $scope.ClassCode.Id).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      if (result.data.Result.Success) {
        var inputs = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); });
        var input;
        var i;
        if (inputs.length > 0) {
          for (i = 0; i < $scope.ClassCode.ClassCodeRatingInputs.length; i++) {
            input = $scope.ClassCode.ClassCodeRatingInputs[i];
            if (input.ContractId == riskCompany.ContractId) {
              $scope.ClassCode.ClassCodeRatingInputs[i] = result.data.ClassCodeRatingInput;
            }
          }
        } else {
          $scope.ClassCode.ClassCodeRatingInputs.push(result.data.ClassCodeRatingInput);
        }

        var infos = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) { return (x.ContractId == riskCompany.ContractId); });

        if (infos.length > 0) {
          for (i = 0; i < $scope.ClassCode.ClassCodeRateInfo.length; i++) {
            input = $scope.ClassCode.ClassCodeRateInfo[i];
            if (input.ContractId == riskCompany.ContractId) {
              $scope.ClassCode.ClassCodeRateInfo[i] = result.data.ClassCodeRateInfo;
            }
          }
        } else {
          $scope.ClassCode.ClassCodeRateInfo.push(result.data.ClassCodeRateInfo);
        }
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.rateClassCode = function (close) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    test_policyService.updateClassCode($scope.Policy, $scope.ClassCode, $scope.TriggerRate).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      if (result.data.Result.Success) {
        $scope.parent.Policy.ValidateQuoteByCompany = result.data.Policy.ValidateQuoteByCompany; // TODO: Temporary fix when overriding policy classcodes disappearance 
        $scope.parent.Policy.Versions = result.data.Policy.Versions;
        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
        $scope.setupClassCodes();

        notificationsHub.showSuccess('Quote', 'Class Code ' + $scope.ClassCode.Number + ' updated.');
        if (close) $modalInstance.dismiss('close');
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.deleteClasscode = function () {
    test_policyService.deleteClassCode($scope.parent.Policy, classCode.Id).then(function (result) {
      if (result.data.Result.Success) {
        $scope.parent.Policy.CurrentVersion.Premiums = result.data.PremiumBreakdowns;
        $scope.parent.Policy.CurrentVersion.ClassCodes.splice($scope.parent.Policy.CurrentVersion.ClassCodes.indexOf(classCode), 1);
        $scope.parent.Policy.CurrentVersion.RateProperty = true;

        $scope.setupClassCodes();

        notificationsHub.showSuccess('Quote', 'Class Code ' + classCode.Number + ' deleted.');
      }
      else {
        notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
      }
    }, function (error) {
      notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
    });

    $modalInstance.dismiss('close');
  };

  //==================================================

  $scope.handleClassCodeInputs = function (funct) {
    for (var i = 0; i < $scope.RiskCompanies.length; i++) {
      var riskCompany = $scope.RiskCompanies[i];
      var ratingInput = $scope.ClassCode.ClassCodeRatingInputs.find(function (x) { return x.ContractId === riskCompany.ContractId; });
      var rateInfo = $scope.ClassCode.ClassCodeRateInfo.find(function (x) { return x.ContractId === riskCompany.ContractId; });
      if (ratingInput == undefined || rateInfo == undefined || ratingInput.RateBy === "If Any") continue;

      var input = (ratingInput.RateBy === "ISO") ? ratingInput.IsoRatingInput : ratingInput.CompanyRatingInput;
      var info = (ratingInput.RateBy === "ISO") ? rateInfo.IsoRateInfo : rateInfo.CompanyRateInfo;
      if (input == null || info == null) continue;

      funct(riskCompany, input, info);
    }
  }

  function getExposures(info, input) {
    var qas = [];

    if (info.ProductExposureGroups != null) {
      for (var i = 0; i < info.ProductExposureGroups.length; i++) {
        var exposureGroup = info.ProductExposureGroups[i];
        var isMandatory = exposureGroup.GroupType === "Mandatory";

        for (var j = 0; j < exposureGroup.Exposures.length; j++) {
          var question = exposureGroup.Exposures[j];
          var answer = input.ExposureAnswers.find(function (x) { return x.QuestionID === question.QuestionID; });
          if (answer == undefined) continue;

          question.IsMandatory = isMandatory;
          qas.push({ Question: question, Answer: answer });
        }
      }
    }

    if (info.PremisesExposureGroups != null) {
      for (var i = 0; i < info.PremisesExposureGroups.length; i++) {
        var exposureGroup = info.PremisesExposureGroups[i];
        var isMandatory = exposureGroup.GroupType === "Mandatory";

        for (var j = 0; j < exposureGroup.Exposures.length; j++) {
          var question = exposureGroup.Exposures[j];
          var answer = input.ExposureAnswers.find(function (x) { return x.QuestionID === question.QuestionID; });
          if (answer == undefined) continue;

          question.IsMandatory = isMandatory;
          qas.push({ Question: question, Answer: answer });
        }
      }
    }

    return qas;
  }

  function getAdditionals(info, input) {
    var qas = [];

    if (info.AdditionalQuestions != null) {
      for (var i = 0; i < info.AdditionalQuestions.length; i++) {
        var question = info.AdditionalQuestions[i];
        var answer = input.AdditionalQuestionAnswers.find(function (x) { return x.QuestionID === question.QuestionID; });
        if (answer == undefined) continue;

        var additionalEntry = { Question: question, Answer: answer };
        qas.push(additionalEntry);
      }
    }

    return qas;
  }

  function isNullOrEmpty(str) {
    return str === undefined || str == null || str.toString().length < 1;
  }

  function isInteger(str) {
    var cleanString = str.replace(/,/g, '');
    return parseInt(cleanString) == cleanString;
  }

  function isAnswerNotFilledIn(answer, dataType) {
    switch (dataType) {
      case "Number":
      case "Amount":
        var value = answer.Answer;
        return isNullOrEmpty(value) || !isInteger(value);
      case "Locations":
        var locations = answer.Locations;
        return locations == null || locations.length < 1;
      case "Address":
        var address = answer.Address;
        return address == null || isNullOrEmpty(address.StreetAddress1);
      default:
        var text = answer.Answer;
        return isNullOrEmpty(text);
    }
  }

  function updateSelectedLocationAnswers() {
    // Copy over selected locations from each additional question to each additional question answer.
    $scope.handleClassCodeInputs(function (riskCompany, input, info) {
      var additionals = getAdditionals(info, input);
      if (additionals.length < 1) return;

      var locationAdditional = additionals.find(x => x.Question.ExposureDataType.toLowerCase() == "locations");
      if (locationAdditional == null) return;

      var locationIds = locationAdditional.Question.Locations;
      if (locationIds == null) return;

      locationAdditional.Answer.Locations = [];

      for (var locationId of locationIds) {
        var location = $scope.Locations.find(x => x.Id == locationId);
        location.ClassCodes = null;
        locationAdditional.Answer.Locations.push(location);
      }
    });
  }

  //==================================================

  $scope.close = function (action) {
    if (action === "closeView") {
      $modalInstance.dismiss('closeView');
      return;
    }

    if (action === "cancel") {
      $scope.deleteClasscode();
      return;
    }

    updateSelectedLocationAnswers();
    $scope.Errors = [];

    // Check if all mandatory questions are answered correctly. Also do the same for all non-mandatory questions with an answer.
    $scope.handleClassCodeInputs(function (riskCompany, input, info) {
      var exposures = getExposures(info, input);
      var additionals = getAdditionals(info, input);

      // if class code is assult&Battery
      if (riskCompany.Id.toUpperCase() == "B216D262-52F0-4864-AEC9-3411ACF7C218" && classCode.Number == '99999' && classCode.SubNumber == 'Assault&Battery') {

        var answerCount = 0;

        var displayables = additionals.filter(a => a.Question.IsDisplayable);

        for (let i = 0; i < displayables.length; i++) {
          let additional = displayables[i];
          if (!isAnswerNotFilledIn(additional.Answer, additional.Question.ExposureDataType)) {
            answerCount++;
          }
        }

        if (answerCount > 0 && answerCount < displayables.length)
          $scope.Errors.push("Please answer the mandatory additional question(s).");
      }

      for (var i = 0; i < exposures.length; i++) {
        var exposure = exposures[i];
        if (isAnswerNotFilledIn(exposure.Answer, exposure.Question.ExposureDataType)) {
          if (exposure.Question.IsMandatory || !isNullOrEmpty(exposure.Answer.Answer)) {
            $scope.Errors.push("Please enter a valid exposure answer for " + riskCompany.Name);
            break;
          }
        } else {
          // Fix number-based inputs.
          var dataType = exposure.Question.ExposureDataType;
          if (dataType == "Number" || dataType == "Amount") {
            var answer = parseInt(exposure.Answer.Answer.replace(/,/g, "").replace(/\$/g, ""));
            exposure.Answer.Answer = answer.toString();
          }
        }
      }

      for (var i = 0; i < additionals.length; i++) {
        var additional = additionals[i];

        // Hotfix 17650: AI class codes have one additional question that acts like a label and should not be
        // validated, so skip that question when it comes up.
        if ($scope.ClassCode.Number == "49950" && additional.Question.QuestionID == 1) continue;

        if (isAnswerNotFilledIn(additional.Answer, additional.Question.ExposureDataType)) {
          if ((additional.Question.IsMandatory || !isNullOrEmpty(additional.Answer.Answer)) &&
            $scope.ClassCode.Number != '99999') {
            $scope.Errors.push("Please enter a valid additional question answer for " + riskCompany.Name);
            break;
          }
        } else {
          // Fix number-based inputs.
          var dataType = additional.Question.ExposureDataType;
          if (dataType == "Number" || dataType == "Amount") {
            var answer = parseInt(additional.Answer.Answer.replace(/,/g, "").replace(/\$/g, ""));
            additional.Answer.Answer = answer.toLocaleString();
          }
        }
      }
    });

    // Check if any exposure answer with a numeric exposure data type is greater than or equal to 0. Also check if at
    // least one exposure amount has a value greater than 0.
    $scope.handleClassCodeInputs(function (riskCompany, input, info) {
      var exposures = getExposures(info, input);
      var additionals = getAdditionals(info, input);
      var answers = [];

      for (var i = 0; i < exposures.length; i++) {
        var exposure = exposures[i];
        if (exposure.Question.ExposureDataType === "Number" || exposure.Question.ExposureDataType === "Amount") {
          if (!isAnswerNotFilledIn(exposure.Answer, exposure.Question.ExposureDataType)) {
            answers.push(parseInt(exposure.Answer.Answer));
          }
        }
      }

      for (var i = 0; i < additionals.length; i++) {
        var additional = additionals[i];
        if (additional.Question.ExposureDataType === "Number" || additional.Question.ExposureDataType === "Amount") {
          if (!isAnswerNotFilledIn(additional.Answer, additional.Question.ExposureDataType)) {
            answers.push(parseInt(additional.Answer.Answer));
          }
        }
      }

      var anyNegativeExposures = answers.length > 0 && answers.some(function (x) { return x < 0 });
      var allExposuresZero = answers.length > 0 && answers.every(function (x) { return x == 0 });

      if (anyNegativeExposures) {
        $scope.Errors.push(riskCompany.Name + ": Answer(s) cannot have a negative amount.");
      } else {
        if (allExposuresZero) {
          $scope.Errors.push(riskCompany.Name + ": At least one answer must have an amount greater than 0.");
        }
      }
    });



    //----------

    if ($scope.Errors.length > 0) return;

    $scope.rateClassCode(true);

    for (var i = 0; i < $scope.RiskCompanies.length; i++)
      $scope.RiskCompanies[i].SubClassCode = null;
  }

  $scope.clearDuplicateQuestionIds = function (exposureAnswers) {
    var removeIndex = -1;
    var removeCount = 0;
    for (var i = 0; i < exposureAnswers.length; i++) {
      var answer = exposureAnswers[i];
      var exposureLocations = exposureAnswers[i].Locations;

      if ($.grep(exposureAnswers, function (ex) { return ex.QuestionID == answer.QuestionID; }).length > 1) {
        if (!answer.Answer && (!exposureLocations || exposureLocations.length == 0)) {
          removeIndex = i;
          removeCount++;
        }
      }
    }

    if (removeCount == 1) {
      exposureAnswers.splice(removeIndex, 1);
    }
  }

  $scope.setupClassCodes = function () {
    if ($scope.Policy.CurrentVersion.Locations != null) {
      for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
        var location = $scope.Policy.CurrentVersion.Locations[i];
        location.ClassCodes = [];
        for (var j = 0; j < $scope.Policy.CurrentVersion.ClassCodes.length; j++) {
          var c = $scope.Policy.CurrentVersion.ClassCodes[j];
          if (c.LocationNumber == location.LocationNumber) {
            location.ClassCodes.push(c);
          }
        }
      }
    }

    for (var k = 0; k < $scope.RiskCompanies.length; k++) {
      var company = $scope.RiskCompanies[k];
      if (company.ContractId == null) {
        company.ContractId = company.Contracts[0].Id;
      }
    }
  }

  $scope.exposureCheck = function (limit, answer) {
    if (limit == null || limit == "" || parseFloat(limit) == 0) return false;
    if (parseFloat(limit) < parseFloat(answer)) return true;
    return false;
  }

  $scope.loadClassCode = function (riskCompany, subNumber) {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    $scope.ClassCode.SubNumber = subNumber;
    policyService.getClassCodesInfo($scope.PolicyId, $scope.ClassCode, riskCompany.ContractId, riskCompany.Id).then(function (result) {
      if (result.data.Result.Success) {
        $scope.ClassCode.ClassCodeRateInfo.push(result.data.ClassCodeRateInfo);
      }
      else {
      }
      Metronic.unblockUI('.modal-dialog');
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.getSubClassCodes = function (riskCompany) {
    $scope.busy = true;
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.getSubClassCodes($scope.PolicyId, riskCompany.ContractId, $scope.ClassCode.Number).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      $scope.busy = false;
      if (result.data.Result.Success) {
        riskCompany.SubClassCodes = result.data.ClassCodes;
        // Select current one
        if ($.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); }).length > 0) {
          var subNumber = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); })[0].SubNumber;

          for (var i = 0; i < riskCompany.SubClassCodes.length; i++) {
            if (riskCompany.SubClassCodes[i].SubNumber == subNumber) {
              riskCompany.SubClassCode = riskCompany.SubClassCodes[i];
            }
          }
        }
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.syncPremiseExposure = function (originalRatedBy, contractId, exposure, exposureAnswer) {
    $scope.TriggerRate = true;

    // Get exposure count from the original premises exposure group. Use it to compare with the other premises exposure groups'
    // exposure count. Both have to match for the answer to be synced.
    var orgRateInfo = $scope.ClassCode.ClassCodeRateInfo.find(x => x.ContractId == contractId);
    var orgInfo = orgRateInfo != null ? (orgRateInfo.CanRateByISO ? orgRateInfo.IsoRateInfo : orgRateInfo.CanRateByCompany ? orgRateInfo.CompanyRateInfo : null) : null;

    // Under certain circumstances, there can be issues where trying to satisfy a required validation will spread bad exposures to the class codes
    // This seems to be caused when the class code can be rated by both ISO and Company, so lets account for that in the beginning logic below
    if (orgRateInfo.CanRateByISO && orgRateInfo.CanRateByCompany) {
      // Lets use the originalRatedBy to try and get the right info
      if (originalRatedBy == "ISO") {
        orgInfo = orgRateInfo.IsoRateInfo;
      } else {
        orgInfo = orgRateInfo.CompanyRateInfo;
      }
    }

    var exposureLength = orgInfo != null ? orgInfo.PremisesExposureGroups[0].Exposures.length : 0;

    for (var riskCompany of $scope.RiskCompanies) {
      for (var info of $scope.ClassCode.ClassCodeRateInfo.filter(x => x.RiskCompanyId == riskCompany.Id && x.ContractId != contractId)) {
        var input = $scope.ClassCode.ClassCodeRatingInputs.find(x => x.ContractId == info.ContractId);
        if (input == null) continue;
        // In some situations the class codes fo not have matching RateBy values but we can still try to fill the classcodes
        if (input.RateBy != originalRatedBy) {
          // Handle if the class code is company rated 
          if (originalRatedBy == "Company") {
            // If the original rated by is Company, then this classcode should be ISO.
            if (info.IsoRateInfo != null && info.IsoRateInfo.PremisesExposureGroups != null) {
              var premisesExposureGroup = info.IsoRateInfo.PremisesExposureGroups[0];
              // Make sure that the exposure type is the same before going forward
              if (premisesExposureGroup != null && premisesExposureGroup.Exposures.length == exposureLength && premisesExposureGroup.Exposures[0].RateBasis == exposure.RateBasis && (exposure.IsArea == premisesExposureGroup.Exposures[0].IsArea || exposure.IsEach == premisesExposureGroup.Exposures[0].IsEach)) {
                var questionId = premisesExposureGroup.Exposures[0].QuestionID;
                var answer = input.IsoRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
                if (answer != null) answer.Answer = exposureAnswer.Answer;
              }
            }
          }

          // Handle if the class code is ISO rated 
          if (originalRatedBy == "ISO") {
            // If the original rated by is Company, then this classcode should be Company.
            if (info.CompanyRateInfo != null && info.CompanyRateInfo.PremisesExposureGroups != null) {
              var premisesExposureGroup = info.CompanyRateInfo.PremisesExposureGroups[0];
              // Make sure that the exposure type is the same before going forward
              if (premisesExposureGroup != null && premisesExposureGroup.Exposures.length == exposureLength && premisesExposureGroup.Exposures[0].RateBasis == exposure.RateBasis && (exposure.IsArea == premisesExposureGroup.Exposures[0].IsArea || exposure.IsEach == premisesExposureGroup.Exposures[0].IsEach)) {
                var questionId = premisesExposureGroup.Exposures[0].QuestionID;
                var answer = input.CompanyRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
                if (answer != null) answer.Answer = exposureAnswer.Answer;
              }
            }
          }

          continue;
        }

        if (info.IsoRateInfo != null && info.IsoRateInfo.PremisesExposureGroups != null) {
          var premisesExposureGroup = info.IsoRateInfo.PremisesExposureGroups[0];
          if (premisesExposureGroup != null && premisesExposureGroup.Exposures.length == exposureLength && premisesExposureGroup.Exposures[0].RateBasis == exposure.RateBasis) {
            var questionId = premisesExposureGroup.Exposures[0].QuestionID;
            var answer = input.IsoRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
            if (answer != null) answer.Answer = exposureAnswer.Answer;
          }
        }

        if (info.CompanyRateInfo != null && info.CompanyRateInfo.PremisesExposureGroups != null) {
          var premisesExposureGroup = info.CompanyRateInfo.PremisesExposureGroups[0];
          if (premisesExposureGroup != null && premisesExposureGroup.Exposures.length == exposureLength && premisesExposureGroup.Exposures[0].RateBasis == exposure.RateBasis) {
            var questionId = premisesExposureGroup.Exposures[0].QuestionID;
            var answer = input.CompanyRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
            if (answer != null) answer.Answer = exposureAnswer.Answer;
          }
        }
      }
    }
  }

  $scope.syncProductExposure = function (originalRatedBy, contractId, exposure, exposureAnswer) {
    $scope.TriggerRate = true;

    // Get exposure count from the original products exposure group. Use it to compare with the other products exposure groups'
    // exposure count. Both have to match for the answer to be synced.
    var orgRateInfo = $scope.ClassCode.ClassCodeRateInfo.find(x => x.ContractId == contractId);
    var orgInfo = orgRateInfo != null ? (orgRateInfo.CanRateByISO ? orgRateInfo.IsoRateInfo : orgRateInfo.CanRateByCompany ? orgRateInfo.CompanyRateInfo : null) : null;
    var exposureLength = orgInfo != null ? orgInfo.PremisesExposureGroups[0].Exposures.length : 0;

    for (var riskCompany of $scope.RiskCompanies) {
      for (var info of $scope.ClassCode.ClassCodeRateInfo.filter(x => x.RiskCompanyId == riskCompany.Id)) {
        var input = $scope.ClassCode.ClassCodeRatingInputs.find(x => x.ContractId == info.ContractId);
        if (input == null || input.RateBy != originalRatedBy) continue;

        if (info.IsoRateInfo != null && info.IsoRateInfo.ProductsExposureGroups != null) {
          var productsExposureGroup = info.IsoRateInfo.ProductsExposureGroups[0];
          if (productsExposureGroup != null && productsExposureGroup.Exposures.length == exposureLength && productsExposureGroup.Exposures[0].RateBasis == exposure.RateBasis) {
            var questionId = productsExposureGroup.Exposures[0].QuestionID;
            var answer = input.IsoRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
            if (answer != null) answer.Answer = exposureAnswer.Answer;
          }
        }

        if (info.CompanyRateInfo != null && info.CompanyRateInfo.ProductsExposureGroups != null) {
          var productsExposureGroup = info.CompanyRateInfo.ProductsExposureGroups[0];
          if (productsExposureGroup != null && productsExposureGroup.Exposures.length == exposureLength && productsExposureGroup.Exposures[0].RateBasis == exposure.RateBasis) {
            var questionId = productsExposureGroup.Exposures[0].QuestionID;
            var answer = input.IsoRatingInput.ExposureAnswers.find(x => x.QuestionID == questionId);
            if (answer != null) answer.Answer = exposureAnswer.Answer;
          }
        }
      }
    }
  }

  $scope.syncIfAny = function (input) {
    $scope.TriggerRate = true;

    var rateBy = input.RateBy;

    for (var i = 0; i < $scope.ClassCode.ClassCodeRatingInputs.length; i++) {

      if (rateBy == "If Any") {
        $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = rateBy;
      } else if ($scope.ClassCode.ClassCodeRatingInputs[i].RateBy == "If Any") {
        var info = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) {
          return (x.ContractId == $scope.ClassCode.ClassCodeRatingInputs[i].ContractId);
        })[0];

        if (info.CanRateByCompany && rateBy == 'Company') {
          $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'Company';
        }
        else if (info.CanRateByISO && rateBy == 'ISO') {
          $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'ISO';
        }
        else if (info.CanRateByCompany) {
          $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'Company';
        } else {
          $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'ISO';
        }
      }
    }
  }

  $scope.syncAdditionalQuestion = function (originalRatedBy, riskCompanyId, contractId, question, questionAnswer) {
    $scope.TriggerRate = $scope.ClassCode.Number != "49950" || question.ExposureDataType.toLowerCase() == "number";

    for (var riskCompany of $scope.RiskCompanies) {
      var infos = $scope.ClassCode.ClassCodeRateInfo.filter(x => x.RiskCompanyId == riskCompany.Id);

      for (var info of infos) {
        var input = $scope.ClassCode.ClassCodeRatingInputs.find(x => x.ContractId == info.ContractId);
        if (input == null) continue;

        var rates = [
          { RateType: "ISO", Input: input.IsoRatingInput, Info: info.IsoRateInfo },
          { RateType: "Company", Input: input.CompanyRatingInput, Info: info.CompanyRateInfo }
        ];

        for (var rate of rates) {
          if (input.ContractId == contractId && originalRatedBy == rate.RateType) continue;
          if (rate.Info == null || rate.Info.AdditionalQuestions == null) continue;

          for (var additionalQuestion of rate.Info.AdditionalQuestions) {
            if (additionalQuestion.RateBasis != question.RateBasis) continue;
            if (additionalQuestion.ExposureDataType != question.ExposureDataType) continue;
            if ($scope.compareQuestions(question.Question, additionalQuestion.Question) < 90) continue;

            var dataType = additionalQuestion.ExposureDataType.toLowerCase();
            var answer = rate.Input.AdditionalQuestionAnswers.find(x => x.QuestionID == additionalQuestion.QuestionID);

            if (dataType == "address") {
              if (answer.Address == null) answer.Address = {};
              if (questionAnswer.Address == null) questionAnswer.Address = {};

              answer.Address.AddressUnitDesignator = questionAnswer.Address.AddressUnitDesignator || null;
              answer.Address.City = questionAnswer.Address.City || null;
              answer.Address.Country = questionAnswer.Address.Country || null;
              answer.Address.County = questionAnswer.Address.County || null;
              answer.Address.ShortAddress = questionAnswer.Address.ShortAddress || null;
              answer.Address.State = questionAnswer.Address.State || null;
              answer.Address.StateCode = questionAnswer.Address.StateCode || null;
              answer.Address.StreetAddress1 = questionAnswer.Address.StreetAddress1 || null;
              answer.Address.StreetAddress2 = questionAnswer.Address.StreetAddress2 || null;
              answer.Address.Zip = questionAnswer.Address.Zip || null;
              answer.Address.ShortAddress = questionAnswer.Address.ShortAddress || null;
            }
            else {
              answer.Answer = questionAnswer.Answer;
            }
          }
        }
      }
    }
  }

  $scope.compareLocations = function (firstId, otherId) {
    return firstId === otherId;
  };

  $scope.syncLocations = function (exposureInfo, contractId, classCodeRateInfo) {
    for (var riskCompany of $scope.RiskCompanies) {
      var infos = $scope.ClassCode.ClassCodeRateInfo.filter(x => x.RiskCompanyId == riskCompany.Id && x.ContractId != contractId);

      for (var info of infos) {
        var rateInfos = [info.IsoRateInfo, info.CompanyRateInfo];

        for (var rateInfo of rateInfos) {
          if (rateInfo == null || rateInfo.AdditionalQuestions == null) continue;

          var additionalQuestion = rateInfo.AdditionalQuestions.find(x => x.ExposureDataType.toLowerCase() == "locations");
          if (additionalQuestion == null) continue;

          additionalQuestion.Locations = $.extend([], exposureInfo.Locations);
        }
      }
    }
  }

  $scope.getAnswer = function (riskCompany, exposure) {
    for (var i = 0; i < $scope.ClassCode.ClassCodeRatingInputs.length; i++) {
      var input = $scope.ClassCode.ClassCodeRatingInputs[i];
      if (input.ContractId == riskCompany.ContractId) {
        var answer;
        if (input.CompanyRatingInput != null) {
          for (var a = 0; a < input.CompanyRatingInput.AdditionalQuestionAnswers.length; a++) {
            answer = input.CompanyRatingInput.AdditionalQuestionAnswers[a];
            if (answer.QuestionID == exposure.QuestionID) {
              return answer;
            }
          }
        }
        if (input.IsoRatingInput != null) {
          for (var a = 0; a < input.IsoRatingInput.AdditionalQuestionAnswers.length; a++) {
            answer = input.IsoRatingInput.AdditionalQuestionAnswers[a];
            if (answer.QuestionID == exposure.QuestionID) {
              return answer;
            }
          }
        }
      }
    }
  }

  // is triggered when a user wants to change contracts for a particular risk company
  $scope.contractChange = function (riskCompany) {
    $scope.busy = true;
    policyService.updatePolicyClassCodeContract($scope.PolicyId, riskCompany.Id, riskCompany.ContractId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.getSubClassCodes(riskCompany);
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  for (var i = 0; i < $scope.RiskCompanies.length; i++) {
    riskCompany = $scope.RiskCompanies[i];
    $scope.getSubClassCodes(riskCompany);
  }

  if ($scope.RiskCompanies.length == 1) setTimeout(function () {
    $('.riskCompanies').parent().hide();
  }, 10);

  $scope.compareQuestions = function (str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    var m = str1.length;
    var n = str2.length;
    var d = $scope.makeArray(m, n);

    if (n == 0 || m == 0) {
      return 0;
    }

    for (var i = 0; i <= n; d[i][0] = i++) { }

    for (var j = 0; j <= m; d[0][j] = j++) { }

    for (var i = 1; i <= n; i++) {
      for (var j = 1; j <= m; j++) {
        var cost = 0;
        if (str1[j - 1] != str2[i - 1])
          cost = 1;
        d[i][j] = Math.min(
          Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1),
          d[i - 1][j - 1] + cost);
      }
    }

    var largerString = m;
    if (n > m)
      largerString = n;

    var fraction = (largerString - d[n][m]) / largerString;
    return fraction * 100;
  }

  $scope.makeArray = function (w, h) {
    var arr = [];
    for (i = 0; i <= h; i++) {
      arr.push(new Array(w + 1));
    }
    return arr;
  }

  $scope.placeset = function (result) {
    if (result) {
      for (var k = 0; k < $scope.RiskCompanies.length; k++) {
        var riskCompany = $scope.RiskCompanies[k];
        var inputs = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.RiskCompanyId == riskCompany.Id); });

        for (var l = 0; l < inputs.length; l++) {
          var input = inputs[l];
          var info = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) { return (x.ContractId == input.ContractId); })[0];

          var infoAdditionalQuestions = input.RateBy == 'Company' ? info.CompanyRateInfo.AdditionalQuestions : info.IsoRateInfo.AdditionalQuestions;
          var additionalQuestions = input.RateBy == 'Company' ? input.CompanyRatingInput.AdditionalQuestionAnswers : input.IsoRatingInput.AdditionalQuestionAnswers;

          if ($.grep(infoAdditionalQuestions, function (x) { return (x.ExposureDataType == 'Address'); }).length > 0) {
            var infoQuestion = $.grep(infoAdditionalQuestions, function (x) { return (x.ExposureDataType == 'Address'); })[0];
            var question = $.grep(additionalQuestions, function (x) { return (x.QuestionID == infoQuestion.QuestionID); })[0];

            question.Address = {};
            question.Address.StreetAddress1 = result.StreetAddress1;
            question.Address.StreetAddress2 = result.StreetAddress2;
            question.Address.City = result.City;
            question.Address.State = result.State;
            for (var i = 0; i < $scope.States.length; i++) {
              if (question.Address.State == $scope.States[i].Name) {
                question.Address.StateCode = $scope.States[i].Code;
              }
            }
            question.Address.Zip = result.Zip;
            question.Address.Country = result.Country;
            question.Address.County = result.County;
            question.Address.ShortAddress = result.formatted_address;
          }
        }
      }
    }
  }

  $scope.setupClassCode = function () {
    for (var riskCompany of $scope.RiskCompanies) {
      var infos = $scope.ClassCode.ClassCodeRateInfo.filter(x => x.RiskCompanyId == riskCompany.Id);

      for (var info of infos) {
        var input = $scope.ClassCode.ClassCodeRatingInputs.find(x => x.ContractId == info.ContractId);
        if (input == null) continue;

        var rates = [
          { Input: input.IsoRatingInput, Info: info.IsoRateInfo },
          { Input: input.CompanyRatingInput, Info: info.CompanyRateInfo }
        ];

        for (var rate of rates) {
          if (rate.Info == null || rate.Info.AdditionalQuestions == null) continue;

          for (var question of rate.Info.AdditionalQuestions.filter(x => x.ExposureDataType.toLowerCase() == "locations")) {
            var answer = rate.Input.AdditionalQuestionAnswers.find(x => x.QuestionID == question.QuestionID);
            if (answer == null || answer.Locations == null || answer.Locations.length < 1) continue;

            question.Locations = [];

            for (var location of answer.Locations) {
              question.Locations.push(location.Id);
            }
          }
        }
      }
    }
  }

  $scope.IsAssaultAndBattery = function (classCode, riskCompany) {
    var info = classCode.ClassCodeRateInfo.find(function (x) { return x.ContractId == riskCompany.ContractId; });

    if (classCode.Number == '99999' && info != null && info.SubNumber == 'Assault&Battery')
      return true;

    return false;
  };

  $scope.IsHNOA = function (classCode) {
    if (classCode.Number !== '99999') return false;

    if (classCode.SubNumber === 'MasterHNOA' || classCode.SubNumber === 'MasterNOA')
      return true;

    var info = classCode.ClassCodeRateInfo.find(c => c.RiskCompanyId === '689c1168-395d-483b-8837-f92ea949e92a');
    if (!info) return false;
    return info.SubNumber === '1' && info.Description === 'Hired And Non-Owned Auto';
  };

  $scope.setupClassCode();
}]);

MALACHIAPP.controller('test_Commercial_Lines_eligibleClassCodes', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService) {
  setTimeout(function () {
    $(".modal-dialog").css("width", "58%");
  }, 0);

  var classCodes = [
    { Number: "10140", Description: "Beverage Distributors - alcoholic other than beer" },
    { Number: "10141", Description: "Beverage Distributors - nonalcoholic and beer" },
    { Number: "10145", Description: "Beverage Stores - liquor and wine" },
    { Number: "10146", Description: "Beverage Stores - soft drinks and beer" },
    { Number: "11039", Description: "Caterers" },
    { Number: "11168", Description: "Concessionaires" },
    { Number: "13673", Description: "Grocery Stores" },
    { Number: "13673", Description: "Convenience Stores" },
    { Number: "16910", Description: "Restaurants - with sale of alcoholic beverages that are less than 30% of the annual receipts of the restaurants - with table service" },
    { Number: "16911", Description: "Restaurants - with sale of alcoholic beverages that are less than 30% of the annual receipts of the restaurants - without table service with seating" },
    { Number: "16916", Description: "Restaurants - with sale of alcoholic beverages that are 30% or more of but less than 75% of the total annual receipts of the restaurants - without dance floor" },
    { Number: "16920", Description: "Restaurants - with sale of alcoholic beverages that are 75% or more of total annual receipts of the restaurants - with tables - with dance floor: table service" },
    { Number: "16921", Description: "Restaurants - with sale of alcoholic beverages that are 75% or more of total annual receipts of the restaurants - with tables - with dance floor: no table service" },
    { Number: "16930", Description: "Restaurants - with sale of alcoholic beverages that are 75% or more of total annual receipts of the restaurants - with tables - without dance floor: table service" },
    { Number: "16931", Description: "Restaurants - with sale of alcoholic beverages that are 75% or more of total annual receipts of the restaurants - with tables - without dance floor: no table service" },
    { Number: "16940", Description: "Restaurants - with sale of alcoholic beverages that 75% or more of total annual receipts of the restaurants - bar service only (no tables); with dance floor" },
    { Number: "16941", Description: "Restaurants - with sale of alcoholic beverages that 75% or more of total annual receipts of the restaurants - bar service only (no tables); without dance floor" },
    { Number: "16971", Description: "Sports Bars" },
    { Number: "18501", Description: "Supermarkets" },
    { Number: "51350", Description: "Beer, Ale or Malt Liquor Mfg. - in bottles" },
    { Number: "51351", Description: "Beer, Ale or Malt Liquor Mfg. - in cans" },
    { Number: "51352", Description: "Beer, Ale or Malt Liquor Mfg. - not bottled or canned" },
    { Number: "59963", Description: "Wine Mfg. - sparkling" },
    { Number: "59964", Description: "Wine Mfg. - still" },
    { Number: "69999", Description: "Special Events" }
  ];

  var rliExcludedClassCodes = ["59963", "59964", "16971"];
  var rsuiExcludedClassCodes = ["16916", "16920", "16921", "16930", "16931", "16940", "16941"];

  $scope.riskCompanies = [
    { Name: "RLI Insurance Company", IsSelected: true, ClassCodes: classCodes.filter(x => rliExcludedClassCodes.every(y => x.Number != y)) },
    { Name: "RSUI Covington", IsSelected: false, ClassCodes: classCodes.filter(x => rsuiExcludedClassCodes.every(y => x.Number != y)) }
  ];

  $scope.onTabSelect = function (riskCompany) {
    for (let otherRiskCompany of $scope.riskCompanies)
      otherRiskCompany.IsSelected = false;

    riskCompany.IsSelected = true;
  }

  $scope.close = function () {
    $modalInstance.dismiss("cancel");
  };
}]);

MALACHIAPP.controller('test_Commercial_Lines_addHNOClassCodeCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'policyId', 'classcodes', 'contractId', 'policy', 'contracts', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, policyId, classcodes, contractId, policy, contracts) {
  $scope.PolicyId = policyId;
  $scope.Policy = policy;
  $scope.ClassCode = {};
  $scope.PolicyClassCodes = classcodes;
  $scope.ContractId = contractId;
  $scope.Contracts = contracts;
  $scope.Errors = [];

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.add = function () {
    if ($scope.ClassCode != null && $scope.ClassCode.Code != null) {
      if ($scope.PolicyClassCodes.some(x => x.Number != '49950' && x.Number == $scope.ClassCode.Code.Number)) {
        if ($scope.ClassCode.Code.SubNumber == "MasterHNOA" || $scope.ClassCode.Code.SubNumber == "MasterNOA") {
          if ($scope.PolicyClassCodes.some(x => x.ClassCodeRatingInputs[0].SubNumber == "MasterNOA" || x.ClassCodeRatingInputs[0].SubNumber == "MasterHNOA")) {
            $scope.Errors = ['Cannot have more than one of these class codes.'];
            return;
          }
        }
      }
      $modalInstance.close({ classCode: $scope.ClassCode.Code.Number, subNumber: $scope.ClassCode.Code.SubNumber });
    }
  }

  $scope.ClassCodes = [
    {
      Number: "99999",
      SubNumber: "MasterHNOA",
      Description: "Hired & Non - Owned"
    },
    {
      Number: "99999",
      SubNumber: "MasterNOA",
      Description: "Non - Owned Only"
    }];
}]);


MALACHIAPP.filter('propsFilter', function () {
  return function (items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function (item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().startsWith(text) || item[prop].toString().replace("$", "").toLowerCase().startsWith(text)) {
            itemMatches = true;
            break;
          }
        }
        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});

MALACHIAPP.filter('aiPropsFilter', function () {
  return function (items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function (item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) > -1) {
            itemMatches = true;
            break;
          }
        }
        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});


