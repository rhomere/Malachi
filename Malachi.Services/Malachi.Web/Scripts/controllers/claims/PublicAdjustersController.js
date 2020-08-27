MALACHIAPP.controller("PublicAdjustersController", function ($rootScope, ngAuthSettings, $scope, adjustersService) {

  $scope.$on("$viewContentLoaded", function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;

  });

  $scope.adjuster = {};
  $scope.success = false;
  $scope.changed = false;

  $scope.addPublicAdjuster = function () {
    $scope.Errors = [];
    $scope.success = false;
    $scope.adjuster;
    adjustersService.addPublicAdjuster($scope.adjuster).then(function (result) {
      if (result.data.Success) {
        $scope.success = true;
        $scope.adjuster = {};
      }
      else {
        $scope.Errors = result.data.Errors;
      }
    }, function () {
      $scope.Errors = ["Couldn't add the new public adjuster. Please refresh the page."];
    });

  };

});