MALACHIAPP.controller("UpdateClaimController", function ($rootScope, ngAuthSettings, $scope, $stateParams, $modal, authService, claimsService, toolsService, adjustersService) {

  $scope.isPublicValue = "";

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

    if ($stateParams.claim.PublicAdjusterName != "" && $stateParams.claim.PublicAdjusterName != null) {
      $scope.publicStyle = $scope.claim.AdjusterIsPublic ? "modechoice" : "";
      $scope.isPublicValue = $scope.claim.AdjusterIsPublic ? "X" : "";
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

	$scope.claim = $stateParams.claim;

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

  $scope.getLossTypesList();

	// LOSS BLOCK	
	$scope.ConstructionTypes = claimsService.getConstructionTypeList;
	$scope.OccupancyList = claimsService.getOccupancyList;

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

	//// LOCATION BLOCK /////
	$scope.LossAddress = $scope.claim.LossAddress.StreetAddress1 + " " + $scope.claim.LossAddress.StreetAddress2;	// only for UI

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

	$scope.updateClaim = function () {
		$scope.Errors = [];
		claimsService.updateClaim($scope.claim).then(function (result) {
			if (result.data.Success) {
				$rootScope.$state.transitionTo("claimDetails", { claim: result.data.Data });
			}
			else {
				$scope.Errors = result.data.Errors;
			}
		}, function (error) {
			$scope.Errors = ["Couldn't save the claim changes. Please try again."];
		});
	};


	//// TPA BLOCK ////
	$scope.tpa = {};

	// Temp storage for Tpa Model
	$scope.tpa.Company = {};
	$scope.tpa.Company.Id = $scope.claim.AdjusterCompanyId;
	$scope.tpa.Company.Name = ($scope.claim.AdjusterCompanyId == null ||
		$scope.claim.AdjusterCompanyId === "") ? "" : $scope.claim.TpaName;

	$scope.tpaList = [];
	$scope.tpa.Adjuster = {};

	$scope.makePublic = function () {
		$scope.claim.AdjusterIsPublic = !$scope.claim.AdjusterIsPublic;
		$scope.publicStyle = $scope.claim.AdjusterIsPublic ? "modechoice" : "";
		$scope.isPublicValue = $scope.claim.AdjusterIsPublic ? "X" : "";
	};

	//// ADJUSTER BLOCK ////
	$scope.adjustersList = [];

	// Contril visibility of the Add Adjuster Block
	$scope.showChange = false;
	$scope.hasAdjuster = (!$scope.claim.AdjusterName
		|| !$scope.claim.AdjusterName
		|| !$scope.claim.AdjusterId
		|| !$scope.claim.TpaName
		|| !$scope.claim.AdjusterCompanyId) ? false : true;
	
	$scope.showChangeBtn = function () {
		$scope.showChange = true;
		$scope.applyAdjustersList();
	};
  
	// Get full Adjuster object
	$scope.initializeAdjusterAndTpa = function () {
		// Assign initial values 
		if ($scope.hasAdjuster) {
			$scope.tpa.Adjuster = $scope.getAdjusterById($scope.claim.AdjusterId);
			$scope.tpa.Company.Id = $scope.claim.AdjusterCompanyId;
			$scope.tpa.Company.Name = $scope.claim.TpaName;
		}
		// Make sure adjuster's values are reset
		else {
			$scope.claim.AdjusterEmail = "";
			$scope.claim.AdjusterPhone = "";
			$scope.claim.AdjusterExtension = "";
			$scope.claim.AdjusterName = "";
		}
	};

	// Get full Claim object By ID
	$scope.openClaimDetails = function (id) {
		$scope.Errors = [];
		claimsService.getClaimById(id).then(function (result) {
			if (result.data.Success) {
				$rootScope.$state.transitionTo("claimDetails", { claim: result.data.Data });
			} else {
				$scope.Errors = result.data.Errors;
			}
		},
			function (error) {
				$scope.Errors = ["An unexpected error has occured. Please refresh the page."];
			});
	};

	$scope.applyAdjustersList = function () {

		// Reset erors list
		$scope.Errors = [];

		// Assign TPA name to the claim
		$scope.applyTpaName();

		if ($scope.tpa.Company.Id)
			// Get list of adjusters for this TPA
			adjustersService.getAdjusterListByTpaId($scope.tpa.Company.Id).then(function (result) {
				if (result.data.Success) {
					$scope.adjustersList = result.data.Data;
				}
				else {
					$scope.Errors = result.data.Errors;
				}
			}, function () {
				$scope.Errors = ["Couldn't get list of adjusters for the specified. Please refresh the page."];
			});
	};
	$scope.applyTpaName = function () {
		$scope.claim.AdjusterCompanyId = $scope.tpa.Company.ID;
		$scope.claim.TpaName = $scope.tpa.Company.Name;
	};
  
	// Save changes to Adjuster and update values in the form
	$scope.ApplyAdjusterChanges = function () {
		$scope.Errors = [];
		adjustersService.updateAdjuster($scope.tpa.Adjuster).then(function (result) {
			if (result.data.Success) {
				$scope.tpa.Adjuster = result.data.Data;
				$scope.applyAdjuster();
			} else {
				$scope.Errors = result.data.Errors;
			}
		},
			function (error) {
				$scope.Errors = ["An unexpected error has occured. Please refresh the page."];
			});


	};
	// Copy value of the selected adjuster into claim
	$scope.applyAdjuster = function () {
		$scope.claim.AdjusterId = $scope.tpa.Adjuster.Id;
		$scope.claim.AdjusterName = $scope.tpa.Adjuster.FirstName + " " + $scope.tpa.Adjuster.LastName;
		$scope.claim.AdjusterPhone = $scope.tpa.Adjuster.Phone;
		$scope.claim.AdjusterEmail = $scope.tpa.Adjuster.Email;
		$scope.claim.AdjusterExtension = $scope.tpa.Adjuster.Extension;
		$scope.claim.AdjusterCompanyId = $scope.tpa.Company.Id;
		$scope.claim.TpaName = $scope.tpa.Company.Name;

		$scope.showSearch = false;
		$scope.showChange = false;
		//$scope.hasAdjuster = true;
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

	$scope.getAdjusterById = function (id) {
		// Get list of adjusters for this TPA
		adjustersService.getAdjusterById(id).then(function (result) {
			if (result.data.Success) {
				$scope.tpa.Adjuster = result.data.Data;
			}
			else {
				$scope.Errors = result.data.Errors;
			}
		}, function () {
			$scope.Errors = ["Couldn't get adjuster. Please try again."];
		});
  };

	$scope.getTpaList();
  $scope.initializeAdjusterAndTpa();

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

  $scope.updatePublicAdjuster = function () {
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
      if (data != 'cancel') {
        if (result.data.Success) {
          $scope.close();
        }
      } else {
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

  $scope.applyPublicAdjuster = function () {
    $scope.claim.PublicAdjusterName = $scope.publicAdjuster.FirstName + " " + $scope.publicAdjuster.LastName;
  };

  $scope.getAdjustersList = function () {

    // Reset erors list
    $scope.Errors = [];

    // Get list of adjusters for this TPA
    adjustersService.getAdjusterList().then(function (result) {
      if (result.data.Success) {
        $scope.adjustersList = result.data.Data;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of public adjusters. Please refresh the page."];
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

  $scope.updateNewAdjuster = function () {
    $scope.Errors = [];
    $scope.success = false;

    adjustersService.updatePublicAdjuster($scope.publicAdjuster).then(function (result) {
      if (result.data.Success) {
        $scope.success = true;
        $scope.close();
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Failed to update public adjuster"];
    });

  };

  $scope.close = function () {
    $modalInstance.dismiss("cancel");
  };

});