'use strict';


MALACHIAPP.controller('ContactController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'ngAuthSettings', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, ngAuthSettings) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    if (authService.authentication.isAuth == false) {
        $location.path('/login');
    }

    $scope.ClassCode = {};


    // Call this after the whole page is loaded.
    $rootScope.$broadcast('$pageloaded');
}]);