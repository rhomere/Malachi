MALACHIAPP.controller("AdjustersController", function ($rootScope, ngAuthSettings, $scope, adjustersService) {

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
  
  $scope.successReset = function() {
    $scope.success = false;
    $scope.changed = true;
  };

  $scope.modeAdd = true;
  $scope.modeEdit = false;
  $scope.modeTable = false;

  $scope.selectTab = function (tab) {
    if (tab === "add") {
      $scope.modeAdd = true;
      $scope.modeEdit = false;
      $scope.modeTable = false;
    }
    else if (tab === "edit") {
      $scope.modeAdd = false;
      $scope.modeEdit = true;
      $scope.modeTable = false;
    } else {
      $scope.modeAdd = false;
      $scope.modeEdit = false;
      $scope.modeTable = true;
    }

    $scope.tpa = {};
    $scope.tpa.Company = {};
    $scope.tpa.adjuster = {};
    $scope.isAdjusterSelected = false;
    $scope.adjustersList = [];
    $scope.isTpaSelected = false;
  };
  
  $scope.tpaSelected = function () {
    $scope.isAdjusterSelected = false;
    if ($scope.modeTable === true) {
      $scope.isTpaSelected = true;
    }
    $scope.applyAdjustersList();
    $scope.successReset();
    $scope.changed = false;
  };

  $scope.adjusterSelected = function () {
    $scope.isAdjusterSelected = true;
    $scope.successReset();
    $scope.changed = false;
  };

  $scope.updateAdjuster = function() {
    $scope.Errors = [];
    adjustersService.updateAdjuster($scope.tpa.adjuster).then(function (result) {
      if (result.data.Success) {
        $scope.success = true;
        $scope.changed = false;
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
      });
    
  };

  $scope.addNewAdjuster = function () {
    $scope.Errors = [];
    $scope.success = false;
    $scope.tpa.adjuster.ClaimsAdjusterCompanyId = $scope.tpa.Company.Id;
    adjustersService.addNewAdjuster($scope.tpa.adjuster).then(function (result) {
      if (result.data.Success) {
        $scope.success = true;
        $scope.tpa.adjuster = {};
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't get list of TPAs. Please refresh the page."];
    });

  };

  $scope.editAdjuster = function(adjuster) {
    $scope.selectTab('edit');
    $scope.adjusterSelected();
    $scope.tpa.adjuster = adjuster;
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