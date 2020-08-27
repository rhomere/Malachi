'use strict';
MALACHIAPP.controller('ResetPasswordController', ['$rootScope', '$scope', '$location', 'authService', 'ngAuthSettings', function ($rootScope, $scope, $location, authService, ngAuthSettings) {
    // Call this after the whole page is loaded.
    $rootScope.$broadcast('$pageloaded');

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;

    $scope.Errors = [];
    $scope.emailVerified = false;
    $scope.url = window.location.href;

    $scope.setPasswordWithToken = function () {
        $scope.Errors = [];
        $scope.emailVerified = false;
        authService.setPasswordWithToken($scope.token, $scope.Password, $scope.RepeatPassword ).then(function (result) {
            if (result.data.Result.Success) {
                $location.url($location.path);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.GetToken = function (val) {
        return val.match(/\?(?:t)\=([\S\s]*)/)[1];
    }

    $scope.token = $scope.GetToken($scope.url);
}]);