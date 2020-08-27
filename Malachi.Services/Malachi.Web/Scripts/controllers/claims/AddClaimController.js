MALACHIAPP.controller("AddClaimController", function ($rootScope, ngAuthSettings, $scope, $stateParams, $modal, authService, claimsService, toolsService, adjustersService) {

  $scope.getPublicAdjusterList = function () {
    $scope.Errors = [];
    adjustersService.getAdjusterList().then(function (result) {
      if (result.data.Success) {
        $scope.publicAdjusterList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of Adjusters. Please refresh the page."];
    });
  };

  $scope.$on("$viewContentLoaded", function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;

    if ($stateParams.claim == null) {
      $rootScope.$state.transitionTo("claims");
    }

    $scope.getPublicAdjusterList();
  });

  // This block will activate the agency selection if info is missing from the policy
  $scope.showAgencyEntrySection = false;
  $scope.Agencies = [];
  $scope.Agents = [];
  $scope.search = {};

  $scope.getAgencies = function (search) {
    $scope.Errors = [];
    if (search.length > 2) {
      claimsService.getAgencies(search).then(function (result) {
        if (result.data.Success) {
          $scope.Agencies = result.data.Data;
        }
        else {
          $scope.Errors = result.data.Errors;
        }
      }, function () {

      });
    }
  };

  $scope.claim = $stateParams.claim;

  // Add vars to track changes for construction
  $scope.hasConstruction = $scope.claim.Construction;
  $scope.hasOccupancy = $scope.claim.Occupancy;

  // Check here to determine whether or not we need to show the agency entry section
  $scope.checkClaimForAgencyInfo = function () {
    if (!$scope.claim) return;
    if (!$scope.claim.AgencyCode || !$scope.claim.AgencyName) $scope.showAgencyEntrySection = true;
    if ($scope.claim.AgencyCode == '' || $scope.claim.AgencyName == '') $scope.showAgencyEntrySection = true;
  };

  $scope.checkClaimForAgencyInfo();

  $scope.clearAgentInfo = function () {
    $scope.claim.AgentName = null;
    $scope.claim.AgentPhone = null;
    $scope.claim.AgentEmail = null;
  };

  $scope.clearAgencyInfo = function () {
    $scope.claim.AgencyCode = null;
    $scope.claim.AgencyName = null;
  };

  $scope.agencySelected = function () {
    var agency = $scope.search.Agency;
    $scope.clearAgencyInfo();

    // As long as we got a valid choice, lets go ahead and add the info to the claim
    if (agency) {
      $scope.clearAgentInfo();
      $scope.claim.AgencyCode = agency.AgencyCode;
      $scope.claim.AgencyName = agency.AgencyName;
      $scope.Agents = [];
      $scope.Agents = $scope.search.Agency.Agents;
      $scope.search.Agent = null;
    }
  };

  $scope.agentSelected = function () {
    var agent = $scope.search.Agent;

    // As long as we got a valid choice, lets go ahead and add the info to the claim
    if (agent) {
      $scope.claim.AgentName = agent.ContactName;
      $scope.claim.AgentPhone = agent.ContactPhone;
      $scope.claim.AgentEmail = agent.ContactEmail;
    }
  };

  // Default value
  $scope.claim.ClaimantName = "";
  $scope.HasAddress = $stateParams.hasAddress;

  // Get list of statuses with codes
  $scope.statuses = claimsService.statuses;

  // Returns status name, depends on the status code
  $scope.getStatus = claimsService.getStatus;

  // Change background color of Status select box after it was selected
  $scope.changeColor = function () {
    $("span[class='btn btn-default form-control ui-select-toggle']").first().css({ "backgroundColor": claimsService.getStatusColor($stateParams.claim.Status), color: "#fff" });
  };

  // Change bg color for a default selection after the page is completely loaded
  $scope.$watch("$viewContentLoaded", function () {
    $scope.changeColor();
  });

  //// LOCATION BLOCK /////
  $scope.LossAddress = $scope.claim.LossAddress.StreetAddress1 + " " + $scope.claim.LossAddress.StreetAddress2;	// only for UI


  $scope.ConstructionTypes = claimsService.getConstructionTypeList;
  $scope.OccupancyList = claimsService.getOccupancyList;

  // Open Policy Details View
  $scope.openPolicyView = function () {
    $scope.Errors = [];
    claimsService.getPolicyOverview($scope.claim.PolicyNumber, $scope.claim.EffectiveDate).then(function (result) {
      if (result.data.Success) {
        $rootScope.$state.transitionTo("policyDetails", { policy: result.data.Data });
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function (error) {
      $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
    });
  };

  $scope.createClaim = function () {
    $scope.Errors = [];
    claimsService.createClaim($scope.claim).then(function (result) {
      if (result.data.Success) {
        $rootScope.$state.transitionTo("claimDetails", { claim: result.data.Data });
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function (error) {
      $scope.Errors = ["An unexpected error has occured. Could not create a claim."];
    });
  };

  $scope.getCityAndStateByZip = function () {

    toolsService.getStateAndCountyByZip($scope.claim.LossAddress.Zip).then(function (result) {
      if (result.data.Result.Success) {
        if (result.data.State != null) {
          $scope.claim.LossAddress.State = result.data.State.Code;
          $scope.claim.LossAddress.City = result.data.State.City;
        } else {
          $scope.claim.LossAddress.State = null;
          $scope.claim.LossAddress.City = "";
        }
      }
      else {
        $scope.Errors = result.data.result.Errors;
      }
    }, function (error) {
      $scope.Errors = ["Could not find matche for this Zip Code or Zip Code is not valid."];
    });
  };

  //// ADJUSTER BLOCK ////
  $scope.adjuster = {};
  $scope.publicAdjuster = {};
  $scope.publicAdjusterList = [];
  $scope.PublicAdjusterName;

  // Controsl visibility of the Add Adjuster Block
  $scope.showSearch = false;

  // TPA's Model
  $scope.tpa = {};
  $scope.tpa.Company = {};
  $scope.tpaList = [];
  $scope.tpa.Adjuster = {};

  $scope.isPublicValue = "";

  $scope.makePublic = function () {
    $scope.claim.AdjusterIsPublic = !$scope.claim.AdjusterIsPublic;
    $scope.publicStyle = $scope.claim.AdjusterIsPublic ? "modechoice" : "";
    $scope.isPublicValue = $scope.claim.AdjusterIsPublic ? "X" : "";
  };

  $scope.applyAdjuster = function () {
    $scope.claim.AdjusterId = $scope.tpa.Adjuster.Id;
    $scope.claim.AdjusterName = $scope.tpa.Adjuster.FirstName + " " + $scope.tpa.Adjuster.LastName;
    $scope.claim.AdjusterPhone = $scope.tpa.Adjuster.Phone;
    $scope.claim.AdjusterEmail = $scope.tpa.Adjuster.Email;
    $scope.claim.AdjusterExtension = $scope.tpa.Adjuster.Extension;
  };

  $scope.applyPublicAdjuster = function () {
    $scope.claim.PublicAdjusterName = $scope.publicAdjuster.FirstName + " " + $scope.publicAdjuster.LastName;
  };

  $scope.getTpaList = function () {
    $scope.Errors = [];
    adjustersService.getTpaList().then(function (result) {
      if (result.data.Success) {
        $scope.tpaList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
    });
  };

  $scope.getLossTypesList = function () {
    $scope.Errors = [];
    claimsService.getLossTypesList().then(function (result) {
      if (result.data.Success) {
        $scope.LossTypesList = result.data.Data.LossTypes;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
    });
  };

  $scope.applyAdjustersList = function () {

    // Reset erors list
    $scope.Errors = [];

    // Assign TPA name to the claim
    $scope.applyTpaName();

    // Get list of adjusters for this TPA
    adjustersService.getAdjusterListByTpaId($scope.tpa.Company.Id).then(function (result) {
      if (result.data.Success) {
        $scope.adjustersList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of adjusters for the specified TPA. Please refresh the page."];
    });
  };

  $scope.adjustersList = [];

  $scope.applyTpaName = function () {
    $scope.claim.AdjusterCompanyId = $scope.tpa.Company.Id;
    $scope.claim.TpaName = $scope.tpa.Company.Name;
  };

  $scope.getLossTypesList();
  $scope.getTpaList();

  $scope.addNewAdjuster = function () {
    var modalInstance = $modal.open({
      templateUrl: 'addAdjuster.html',
      controller: 'Claims_NewAdjuster',
      backdrop: 'static',
      resolve: {
        parent: function () {
          return $scope.parent;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        adjustersService.addNewAdjuster($scope.tpa.adjuster).then(function (result) {
          if (result.data.Success) {
            $scope.close();
          }
        });
      } else {
        $scope.close();
      }
    });
  };

  $scope.newPublicAdjuster = function () {
    var modalInstance = $modal.open({
      templateUrl: 'publicAdjuster.html',
      controller: 'Claims_NewPublicAdjuster',
      backdrop: 'static',
      resolve: {
        parent: function () {
          return $scope.parent;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data !== 'cancel') {
        adjustersService.addPublicAdjuster(data).then(function (result) {
          if (result.data.Success) {
            $scope.getPublicAdjusterList();
            $scope.success = true;
          }
          else {
            $scope.Errors = result.data.Errors;
          }
        }, function () {
          $scope.Errors = ["Failed to add new public adjuster"];
        });
      }
      else {
        $scope.close();
      }
    });
  };

});

MALACHIAPP.controller("Claims_NewAdjuster", function ($rootScope, ngAuthSettings, $modalInstance, $scope, adjustersService) {

  $scope.$on("$viewContentLoaded", function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;

  });

  $scope.tpa = {};
  $scope.tpa.Company = {};
  $scope.tpa.adjuster = {};
  $scope.isAdjusterSelected = false;
  $scope.isTpaSelected = false;
  $scope.success = false;
  $scope.changed = false;

  $scope.successReset = function () {
    $scope.success = false;
    $scope.changed = true;
  };

  $scope.modeAdd = true;

  $scope.tpa = {};
  $scope.tpa.Company = {};
  $scope.tpa.adjuster = {};
  $scope.adjustersList = [];
  $scope.isTpaSelected = false;

  $scope.tpaSelected = function () {
    $scope.isAdjusterSelected = false;
    if ($scope.modeTable === true) {
      $scope.isTpaSelected = true;
    }
    $scope.applyAdjustersList();
    $scope.successReset();
    $scope.changed = false;
  };

  $scope.addNewAdjuster = function () {
    $scope.Errors = [];
    $scope.success = false;
    $scope.tpa.adjuster.ClaimsAdjusterCompanyId = $scope.tpa.Company.Id;
    adjustersService.addNewAdjuster($scope.tpa.adjuster).then(function (result) {
      if (result.data.Success) {
        $scope.success = true;
        $scope.tpa.adjuster = {};
        $scope.close();
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
    });

  };

  $scope.close = function () {
    $modalInstance.dismiss("cancel");
  };

  $scope.getTpaList = function () {
    $scope.Errors = [];
    adjustersService.getTpaList().then(function (result) {
      if (result.data.Success) {
        $scope.tpaList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
    });
  };

  $scope.applyAdjustersList = function () {

    // Reset erors list
    $scope.Errors = [];

    // Get list of adjusters for this TPA
    adjustersService.getAdjusterListByTpaId($scope.tpa.Company.Id).then(function (result) {
      if (result.data.Success) {
        $scope.adjustersList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of adjusters for the specified TPA. Please refresh the page."];
    });

  };

  $scope.adjustersList = [];

  $scope.getTpaList();
});

MALACHIAPP.controller("Claims_NewPublicAdjuster", function ($rootScope, ngAuthSettings, $modalInstance, $scope, adjustersService) {

  $scope.$on("$viewContentLoaded", function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;

  });

  $scope.publicAdjuster = {};

  $scope.successReset = function () {
    $modalInstance.dismiss($scope.publicAdjuster);
  };

  $scope.modeAdd = true;

  $scope.addNewAdjuster = function () {
    $scope.Errors = [];
    $scope.success = false;

    if ($scope.publicAdjuster.Name != "" && $scope.publicAdjuster.Name != null) {
      $modalInstance.close($scope.publicAdjuster);
    }

  };

  $scope.close = function () {
    $modalInstance.dismiss("cancel");
  };

});



