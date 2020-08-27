MALACHIAPP.controller("ClaimsController", function ($rootScope, ngAuthSettings, $scope, authService, claimsService) {

	$scope.$on("$viewContentLoaded", function () {
		// initialize core components
		Metronic.initAjax();
		// set default layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		//$rootScope.settings.layout.pageSidebarClosed = false;

	});

	// Default Tab
	$scope.tab = "policies";

	// Change Selected Tab
	$scope.selectTab = function (setTab) {
		$scope.tab = setTab;
	};

	// Check which tab is selected
  $scope.isSelectedTab = function (selectedTab) {
    return $scope.tab === selectedTab;
  };

	// Get 15 recently updated policies
	$scope.policies = [];
	$scope.getInitialPolcies = function () {
		$scope.policies = claimsService.getLastFifteenPolicies().then(function (result) {
			if (result.data.Success) {
				$scope.policies = result.data.Data;
			} else {
				$scope.policies = null;
				$scope.Errors = result.data.Errors;
			}
		},
			function (error) {
				$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
			});
	};

	// Get 15 recently updated claims
	$scope.claims = [];
  $scope.getInitialClaims = function () {
    $scope.claims = claimsService.getLastFifteenClaims().then(function (result) {
      if (result.data.Success) {
        $scope.claims = result.data.Data;
      }
      else {
        $scope.claims = null;
        $scope.Errors = result.data.Errors;
      }
    }, function (error) {
      $scope.Errors = ["An error has occured. Could not load policies."];
    });
  };

	// Open Policy Details View
  $scope.openPolicyView = function (policy) {

    claimsService.getPolicyOverview(policy.PolicyNumber, policy.Effective).then(function (result) {
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

  $scope.openClaimView = function (id) {
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

	// Returns Status color, depends on the status code
	$scope.getStatusColor = claimsService.getStatusColor;

	// Returns status name, depends on the status code
	$scope.getStatus = claimsService.getStatus;

	// Returns address as 1 string
	$scope.getAddress = claimsService.getAddress;

	// Returns ALL policies with the matching number
  $scope.searchPoliciesByNumber = function (policyNumber) {
    $scope.Errors = [];
    if (policyNumber === null || policyNumber === "") {
      $scope.getInitialPolcies();
    } else {
      claimsService.searchPoliciesByNumber(policyNumber.trim()).then(function (result) {
        if (result.data.Success) {
          $scope.policies = result.data.Data;

          if ($scope.policies.length < 1) {
            $scope.Errors = ["Could not find any policy with this number. Please, try another number."];
          }
        }
        else {
          $scope.Errors = ["A server error has occured. Please, try again, or report to the support team."];
          $scope.getInitialPolcies();
          $scope.Errors = result.data.Errors;
        }
      }, function (error) {
        $scope.Errors = ["An error has occured. Could not load policies."];
      });
    }
  };

	// Returns ALL claims with the matching number
  $scope.searchClaimByNumber = function (claimNumber) {
    $scope.Errors = [];
    if (claimNumber === null || claimNumber === "") {
      $scope.getInitialCLaims();
    } else {
      claimsService.searchClaimByNumber(claimNumber.trim()).then(function (result) {
        if (result.data.Success) {

          if ($scope.claims.length < 1) {
            $scope.Errors = ["Could not find any claim with this number. Please, try another number."];
          } else {
            $scope.claims = result.data.Data;
          }
        }
        else {
          $scope.Errors = ["A server error has occured. Please, try again, or report to the support team."];
          $scope.getInitialCLaims();
          $scope.Errors = result.data.Errors;
        }
      }, function (error) {
        $scope.Errors = ["An error has occured. Could not load claims."];
      });
    }
  };

	$scope.getInitialPolcies();
	$scope.getInitialClaims();
});