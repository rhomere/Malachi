MALACHIAPP.controller('AppManagerController', ['$rootScope', 'ngAuthSettings', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'Upload', 'appService', function ($rootScope, ngAuthSettings, $scope, $location, $timeout, $stateParams, $state, settings, Upload, appService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.Apps = [];
    $scope.App = null;
    $scope.newApp = false;
    $scope.ErrorMessage = null;

    appService.getApps().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Apps = result.data.Apps;
            $scope.TotalApps = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalApps / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchApps = function (name, pageNumber, display) {
        appService.searchApps(name, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Apps = result.data.Apps;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.searchApps($scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchApps('', $scope.currentPage, 10);
    };

    $scope.addNewApp = function () {
        $scope.newApp = true;
        $scope.App = new app();
    }

    $scope.selectApp = function (app) {
        $scope.newApp = true;
        $scope.App = $.extend(true, {}, app);
    }

    $scope.deleteApp = function (app) {
        appService.deleteApp(app.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Apps.splice($.inArray(app, $scope.Apps), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelApp = function () {
        $scope.newApp = false;
        $scope.ErrorMessage = null;
    }
    
    $scope.saveApp = function () {
        var isNew = $scope.App.Id == null;
        appService.updateApp($scope.App).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Apps.push(result.data.App);
                }
                else {
                    for (var i = 0; i < $scope.Apps.length; i++) {
                        if ($scope.Apps[i].Id == result.data.App.Id) {
                            $scope.Apps[i] = result.data.App;
                        }
                    }
                }

                if ($scope.icon != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Apps/UploadIcon',
                        data: { file: $scope.icon, 'AppId': result.data.App.Id }
                    });
                }

                // Clean up
                $scope.cancelApp();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
     
}]);


function app() {
    return {
        Enabled: true
    };
}