'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_ClaimsController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', 'settings', 'policyService', 'toolsService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, settings, policyService, toolsService) {
	$scope.parent = $scope.$parent;

	$scope.$on('$viewContentLoaded', function () {
		// initialize core components
		Metronic.initAjax();
		// set default layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		//$rootScope.settings.layout.pageSidebarClosed = false;
	});

	$scope.parent.LoadingPage = true;
	$scope.AppId = $scope.parent.AppId;
	$scope.PolicyId = $scope.parent.PolicyId; 
	$scope.Policy = $scope.parent.Policy;
	$scope.showLocationToggle = false; 
	$scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;

	if ($scope.AppId == null) {
		$rootScope.$state.transitionTo('policyDashboard');
	}

	if ($scope.PolicyId) { // Existing Policy
		loadClaims();
	}
	else {
		$rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
	}

	function loadClaims() {
		$scope.Claims = $scope.parent.Policy.CurrentVersion.PolicyVersionClaims;
		$scope.parent.LoadingPage = false;
	}

	$scope.updateAnyLossesInFiveYears = function (value) {
		policyService.updateAnyLossesInFiveYears($scope.PolicyId, value).then(function (result) {
			if (result.data.Result.Success) {
				
			}
			else {
				$scope.Errors = result.data.Result.Errors;
			}
		});
	}

	//--------------------------
	//- New Claim -
	//--------------------------
	$scope.newClaim = function () {
		var modalInstance = $modal.open({
			templateUrl: 'claimModelContent.html',
			controller: 'test_Homeowners_claimModelCtrl',
			backdrop: 'static',
			size: 'lg',
			resolve: {
				claim: function () {
					return {
						Claim: {}
					};
				},
				policyId: function () {
					return $scope.PolicyId;
				},
				claims: function () {
					return $scope.Claims;
				}
			}
		});

		modalInstance.result.then(function (claim) {
			if (claim != 'cancel') {
				if ($scope.parent.Policy.CurrentVersion.PolicyVersionClaims == null) $scope.parent.Policy.CurrentVersion.PolicyVersionClaims = [];
				claim.VersionId = $scope.parent.Policy.CurrentVersion.Id;
				policyService.newClaim($scope.PolicyId, claim).then(function (result) {
					if (result.data.Result.Success) {
						$scope.parent.Policy.CurrentVersion.PolicyVersionClaims.push(result.data.Claim);
						$scope.parent.Policy.CurrentVersion.RateProperty = true;
					}
					else {
						$scope.Errors = result.data.Result.Errors;
					}
				});
			}
		});
	}

	//--------------------------
	//- Update Claim -
	//--------------------------
	$scope.updateClaim = function (claim) {
		if (!$scope.parent.canModify(false)) return;

		var modalInstance = $modal.open({
			templateUrl: 'claimModelContent.html',
			controller: 'test_Homeowners_claimModelCtrl',
			backdrop: 'static',
			size: 'lg',
			resolve: {
				claim: function () {
					return claim;
				},
				Policy: function () {
					$scope.parent.Policy;
				},
				policyId: function () {
					return $scope.PolicyId;
				},
				claims: function () {
					return $scope.Claims;
				}
			}
		});

		modalInstance.result.then(function (claim) {
			$scope.Errors = [];
			if (claim != 'cancel') {
				policyService.updateClaim($scope.PolicyId, claim).then(function (result) {
					if (result.data.Result.Success) {
						for (var i = 0; i < $scope.parent.Policy.CurrentVersion.PolicyVersionClaims.length; i++) {
							if ($scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].Id == result.data.Claim.Id) {
								$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].Number = result.data.Claim.Number;
								$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].MonthReported = result.data.Claim.MonthReported;
								$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].YearReported = result.data.Claim.YearReported;
								$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].ClaimAmount = result.data.Claim.ClaimAmount;
								$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].CauseOfLoss = result.data.Claim.CauseOfLoss;
							}
						}
						$scope.parent.Policy.CurrentVersion.RateProperty = true;
					}
					else {
						$.extend(claim, result.data.Claim);
						$scope.Errors = result.data.Result.Errors;
					}
				}, function (error) {
					$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
				});
			}
		});
	}

	//--------------------------
	//- Delete Claim -
	//--------------------------
	$scope.deleteClaim = function (claim) {
		BootstrapDialog.show({
			title: 'Delete Claim' + claim.Number,
			message: 'Are you sure you want to delete this claim ?',
			buttons: [{
				label: 'Cancel',
				action: function (dialogItself) {
					dialogItself.close();
				}
			}, {
				label: 'Delete Claim',
				cssClass: 'btn-primary',
				action: function (dialogItself) {
					policyService.deleteClaim($scope.PolicyId, { ClaimId: claim.Id }).then(function (result) {
						if (result.data.Result.Success) {
							//Get index of claim 
							var deletedIndex = $scope.parent.Policy.CurrentVersion.PolicyVersionClaims.indexOf(claim);
							//Remove claim from PolicyVersionClaims
							$scope.parent.Policy.CurrentVersion.PolicyVersionClaims.splice($scope.parent.Policy.CurrentVersion.PolicyVersionClaims.indexOf(claim), 1);
							//Update the Numbers of the remaining claims
							// todo: Update Claim Numbers in Db
							//for (var i = deletedIndex; i < $scope.parent.Policy.CurrentVersion.PolicyVersionClaims.length; i++) {
							//	$scope.parent.Policy.CurrentVersion.PolicyVersionClaims[i].Number = i + 1;
							//}
							//if ($scope.parent.Policy.CurrentVersion.PolicyVersionClaims.length == 0) {
							//	$scope.parent.Policy.HasClaims = false;
							//	$scope.parent.Policy.AnyLossesInFiveYears = false;
       //                     }
							$scope.parent.Policy.CurrentVersion.RateProperty = true;
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

	// Call this after the whole page is loaded.
	$rootScope.$broadcast('$pageloaded');

}]);

MALACHIAPP.controller('test_Homeowners_claimModelCtrl', ['$rootScope', '$http', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'claim', 'policyId', 'claims', function ($rootScope, $http, $scope, $timeout, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, claim, policyId, claims) {
	$scope.details = {};
	$scope.PolicyId = policyId;
	$scope.original_location = claim;
	$scope.original_claim = {};
	$scope.Claims = claims;
	$scope.claim = $.extend(true, {}, claim);
	$scope.Errors = [];
	$scope.TerritoryCodes = [];
	$scope.busy = false;
	$scope.LocationDetails = [];
	$scope.Months = [
	'',
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
	];
	$scope.CausesOfLoss = [
	'', 
	'Fire',
	'Water',
	'Weather',
	'Theft',
	'Other'
	];

	if ($scope.claim.Number == null) {
		if ($scope.Claims.length == 0)
			$scope.claim.Number = 1;
		else
			$scope.claim.Number = Math.max.apply(Math, $scope.Claims.map(function (l) { return l.Number; })) + 1;
	}

	var disableSave = false;

	$scope.close = function () {
		$modalInstance.dismiss('cancel');
	}

	$scope.save = function () {
		if (disableSave) return;
		// something.
		$scope.validateInputs();
		if ($scope.ErrorList.length > 0) return;

		$scope.original_claim.Id = $scope.claim.Id;
		$scope.original_claim.Number = $scope.claim.Number;
		$scope.original_claim.MonthReported = $scope.claim.MonthReported;
		$scope.original_claim.YearReported = $scope.claim.YearReported;
		$scope.original_claim.CauseOfLoss = $scope.claim.CauseOfLoss;
		$scope.original_claim.ClaimAmount = $scope.claim.ClaimAmount;

		$modalInstance.close($scope.original_claim);
	}

	$scope.validateInputs = function () {
		$scope.ErrorList = [];

		if (checkInputs($scope.claim.MonthReported)) {
			$scope.ErrorList.push('Month Reported cannot be blank.');
		}

		if (checkInputs($scope.claim.YearReported)) {
			$scope.ErrorList.push('Year Reported cannot be blank.');
		}

		if (!checkInputs($scope.claim.YearReported) && !IsNumber($scope.claim.YearReported)) {
			$scope.ErrorList.push('Year Reported must be a number');
		}

		if (!checkInputs($scope.claim.YearReported) && $scope.claim.YearReported.length != 4) {
			$scope.ErrorList.push('Year Reported must be in format YYYY.');
		}
		
		if (checkInputs($scope.claim.CauseOfLoss)) {
			$scope.ErrorList.push('Please select a Cause of Loss.');
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

	function IsNumber(val) {
		return !isNaN(val);
	}
}]);