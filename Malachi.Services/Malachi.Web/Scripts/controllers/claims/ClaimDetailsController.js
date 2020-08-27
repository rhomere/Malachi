MALACHIAPP.controller("ClaimDetailsController", function ($rootScope, ngAuthSettings, $scope, $stateParams, authService, claimsService) {

  $scope.isPublicValue = "";

	$scope.$on("$viewContentLoaded", function () {
		// initialize core components
		Metronic.initAjax();
		// set default layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		//$rootScope.settings.layout.pageSidebarClosed = false;
		if ($stateParams.claim == null) {
			$rootScope.$state.transitionTo("claims");
    }

    if ($stateParams.claim.PublicAdjusterName != "" && $stateParams.claim.PublicAdjusterName != null) {
      $scope.publicStyle = $scope.claim.AdjusterIsPublic ? "modechoice" : "";
      $scope.isPublicValue = $scope.claim.AdjusterIsPublic ? "X" : "";
    }

		$scope.claimEditor = $.inArray("Claim Creator", authService.authentication.roles) > -1;
	});

	$scope.claim = $stateParams.claim;

	$scope.isFromFullPolicy = false;

	// Gets AppId for transition to Policy Page
  $scope.getAppId = function () {
    $scope.Errors = [];
    claimsService.getAppId($scope.claim.PolicyId).then(function (result) {
      $scope.AppId = result.data.AppId;
      $scope.isFromFullPolicy = result.data.CanNavigate;
    }, function () {
      $scope.Errors = ["An unexpected error has occured."];
    });
  };

	$scope.getStatusColor = claimsService.getStatusColor;

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

	//// LOCATION BLOCK ///// Street Address 2 can be added here, for now itar is not needed.
	$scope.LossAddress = $scope.claim.LossAddress.StreetAddress1;	// only for UI

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
		$rootScope.$state.transitionTo("updateClaim", { claim: $scope.claim });
	};

  $scope.openFullPolicy = function () {
    if ($scope.AppId !== null && $scope.claim.PolicyId !== null) {
      $rootScope.$state.transitionTo('policy', { appId: $scope.AppId, policyId: $scope.claim.PolicyId });
    }

    // IF ANY OF THE VALUES IS NULL REMOVE LINK FROM POLICY NUMBER
    $scope.isFromFullPolicy = false;
  };

	$scope.getAppId();

});