'use strict';

MALACHIAPP.controller('ChangePasswordController', ['$rootScope', '$scope', '$location', 'authService', 'ngAuthSettings', function ($rootScope, $scope, $location, authService, ngAuthSettings) {
  if ($rootScope.Organization.Name == "Bass Online") {
    window.location.href = window.authServiceUri +"?changepassword={domain}";
    return;
  }
  $rootScope.$broadcast('$pageloaded');

  $scope.$on('$viewContentLoaded', function () {
    Metronic.initAjax();
  });

  $rootScope.settings.layout.pageBodySolid = false;
  $scope.Errors = [];

  var isEmptyOrUndefined = function (str) {
    return typeof (str) !== "string" || str == "";
  }

  $scope.changePassword = function () {
    $scope.Errors = [];
    authService.changePassword({ OldPassword: $scope.OldPassword, NewPassword: $scope.NewPassword, ConfirmPassword: $scope.ConfirmPassword }).then(function (result) {
      if (result.Result.Success) {
        $location.path('/dashboard');
      } else {
        $scope.Errors = result.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.passwordFieldsFilled = function () {
    if (isEmptyOrUndefined($scope.OldPassword)) return false;
    if (isEmptyOrUndefined($scope.NewPassword)) return false;
    if (isEmptyOrUndefined($scope.ConfirmPassword)) return false;

    return true;
  }
}]);