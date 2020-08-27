MALACHIAPP.controller('RetailAgenciesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.ManagingGeneralAgent = $stateParams.ManagingGeneralAgent;
    if ($scope.ManagingGeneralAgent == null) {
        $state.transitionTo('mga');
        return;
    }

    $scope.Agencies = []; 
    $scope.Agency = null;
    $scope.newAgency = false;
    $scope.ErrorMessage = null;


    settingsService.getAgencies($scope.ManagingGeneralAgent.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Agencies = result.data.Agencies;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewAgency = function () {
        $scope.newAgency = true;
        $scope.Agency = new agency($scope.ManagingGeneralAgent.Id);
    }

    $scope.selectAgency = function (agency) {
        $scope.newAgency = true;
        $scope.Agency = $.extend(true, {}, agency);
    }

    $scope.deleteAgency = function (agency) {
        settingsService.deleteAgency(agency.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Agencies.splice($.inArray(agency, $scope.Agencies), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelAgency = function () {
        $scope.newAgency = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveAgency = function () {
        var isNew = $scope.Agency.Id == null;
        settingsService.updateAgency($scope.Agency).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Agencies.push(result.data.Agency);
                }
                else {
                    for (var i = 0; i < $scope.Agencies.length; i++) {
                        if ($scope.Agencies[i].Id == result.data.Agency.Id) {
                            $scope.Agencies[i] = result.data.Agency;
                        }
                    }
                }
                // Clean up
                $scope.cancelAgency();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


    $scope.linkToPage = function (page, agency) {
        $state.transitionTo(page, { Agency: agency });
    }
}]);


function agency(mgaId) {
    return {
        "ManagingGeneralAgentId": mgaId
    };
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
