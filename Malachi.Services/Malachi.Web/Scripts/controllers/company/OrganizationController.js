MALACHIAPP.controller('OrganizationController', ['$rootScope', 'ngAuthSettings', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'Upload', 'organizationService', function ($rootScope, ngAuthSettings, $scope, $location, $timeout, $stateParams, $state, settings, Upload, organizationService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.ErrorMessage = null;

    organizationService.getOrganization().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Organization = result.data.Organization;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.save = function () {
        organizationService.updateOrganization($scope.Organization).then(function (result) {
            if (result.data.Result.Success) {
                if ($scope.loginLogo != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Organization/Upload',
                        data: { file: $scope.loginLogo, name: 'LoginLogo' }
                    })
                }

                if ($scope.pageLogo != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Organization/Upload',
                        data: { file: $scope.pageLogo, name: 'PageLogo' }
                    })
                }

                if ($scope.favicon != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Organization/Upload',
                        data: { file: $scope.favicon, name: 'Favicon' }
                    })
                }

                $timeout(function () {
                    organizationService.getOrganization().then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.Organization = result.data.Organization;
                        } else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }, 1000);

            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


}]);

