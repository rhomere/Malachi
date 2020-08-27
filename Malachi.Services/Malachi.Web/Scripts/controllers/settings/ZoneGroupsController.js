MALACHIAPP.controller('ZoneGroupsController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'settingsService', 'insurerService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, settingsService, insurerService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Insurer = $stateParams.Insurer;
    if ($scope.Insurer == null) {
        $state.transitionTo('insurers');
        return;
    }

    $scope.ZoneGroups = [];
    $scope.ZoneGroup = null;
    $scope.newZoneGroup = false;
    $scope.ErrorMessage = null;

    insurerService.getZoneGroups($scope.Insurer.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.ZoneGroups = result.data.ZoneGroups;
            $scope.TotalZoneGroups = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalZoneGroups / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchZoneGroups = function (codeNumber, pageNumber, display) {
        insurerService.searchZoneGroups(codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ZoneGroups = result.data.ZoneGroups;
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
        $scope.currentTimeout = $timeout(function () { $scope.searchZoneGroups($scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };

    $scope.addNewZoneGroup = function () {
        $scope.newZoneGroup = true;
        $scope.ZoneGroup = new zoneGroup($scope.Insurer.Id);
    }

    $scope.selectZoneGroup = function (zoneGroup) {
        $scope.newZoneGroup = true;
        $scope.ZoneGroup = $.extend(true, {}, zoneGroup);
    }

    $scope.deleteZoneGroup = function (zoneGroup) {
        insurerService.deleteZoneGroup(zoneGroup.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ZoneGroups.splice($.inArray(zoneGroup, $scope.ZoneGroups), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelZoneGroup = function () {
        $scope.newZoneGroup = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveZoneGroup = function () {
        var isNew = $scope.ZoneGroup.Id == null;

        if (isNew) {
            insurerService.newZoneGroup($scope.Insurer.Id, $scope.ZoneGroup.Name, $scope.ZoneGroupEnabled).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.ZoneGroups.push(result.data.ZoneGroup);
                    // Clean up
                    $scope.cancelZoneGroup();
                }
                else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
        else {
            insurerService.updateZoneGroup($scope.ZoneGroup).then(function (result) {
                if (result.data.Result.Success) {
                    for (var i = 0; i < $scope.ZoneGroups.length; i++) {
                        if ($scope.ZoneGroups[i].Id == result.data.ZoneGroup.Id) {
                            $scope.ZoneGroups[i] = result.data.ZoneGroup;
                        }
                    }
                    // Clean up
                    $scope.cancelZoneGroup();
                }
                else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
    }


    $scope.Aggregate = function (zoneGroup) {
        $state.transitionTo('aggregate', { ZoneGroup: zoneGroup });
    }


    $scope.goTo = function (zoneGroup, url) {
        $state.transitionTo(url, { ZoneGroup: zoneGroup });
    }

    $scope.refreshZoneAgg = function (zoneGroup) {
        settingsService.refreshZoneAgg(zoneGroup.Id).then(function (result) {
            if (result.data.Result.Success) { 
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.deleteZoneGroup = function(zoneGroup) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this zone group?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            },
            {
                label: 'Delete Zone Group',
                cssClass: 'yellow-casablanca',
                action: function (dialogItself) {
                    dialogItself.close();
                    insurerService.deleteZoneGroup(zoneGroup.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.ZoneGroups.splice($scope.ZoneGroups.indexOf(zoneGroup), 1);
 
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) { 
                    });
                }
            }]
        });
    }
}]);


function zoneGroup(insurerId) {
    return {
        InsurerId: insurerId,
        Enabled: true
    };
}
