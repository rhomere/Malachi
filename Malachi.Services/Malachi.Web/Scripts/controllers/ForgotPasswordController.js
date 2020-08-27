'use strict';
MALACHIAPP.controller('ForgotPasswordController', ['$rootScope', '$scope', '$location', 'authService', 'ngAuthSettings', function ($rootScope, $scope, $location, authService, ngAuthSettings) {

    if (authService.authentication.isAuth) {
        $location.path('/dashboard');
    } else {
        // Call this after the whole page is loaded.
        $rootScope.$broadcast('$pageloaded');
    }

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
    $scope.Email = '';
    $scope.Errors = [];
    $scope.emailVerified = false;

    $scope.resetpassword = function () {
        $scope.Errors = [];
        $scope.emailVerified = false;
        authService.resetPassword($scope.Email).then(function (result) {
            if (result.data.Result.Success) {
                $scope.emailVerified = true;

            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
}]);