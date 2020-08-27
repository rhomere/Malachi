'use strict';
MALACHIAPP.controller('RegisterController', ['$rootScope', '$scope', '$location', 'authService', 'ngAuthSettings', function ($rootScope, $scope, $location, authService, ngAuthSettings) {

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
    $scope.User = {};
    $scope.Errors = [];
    $scope.emailVerified = false;

    $scope.verify = function () {
        $scope.emailVerified = false;
        authService.verifyEmail($scope.User.Email).then(function (result) {
            if (result.data.Result.Success) {
                $scope.emailVerified = true;
                $scope.Offices = result.data.Offices;
                $scope.ManagingGeneralAgent = result.data.ManagingGeneralAgent;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.register = function () {


    }
}]);