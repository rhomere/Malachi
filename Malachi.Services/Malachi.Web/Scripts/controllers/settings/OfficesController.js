MALACHIAPP.controller('OfficesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, accountService, toolsService) {
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

    $scope.Offices = [];
    $scope.Office = null;
    $scope.newOffice = false;
    $scope.ErrorMessage = null;


    settingsService.getOffices($scope.ManagingGeneralAgent.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Offices = result.data.Offices;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewOffice = function () {
        $scope.newOffice = true;
        $scope.Office = new office($scope.ManagingGeneralAgent.Id);
    }

    $scope.selectOffice = function (office) {
        $scope.newOffice = true;
        $scope.Office = $.extend(true, {}, office);
    }

    $scope.deleteOffice = function (office) {
        settingsService.deleteOffice(office.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Offices.splice($.inArray(office, $scope.Offices), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelOffice = function () {
        $scope.newOffice = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveOffice = function () {
        var isNew = $scope.Office.Id == null;
        settingsService.updateOffice($scope.Office).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Offices.push(result.data.Office);
                }
                else {
                    for (var i = 0; i < $scope.Offices.length; i++) {
                        if ($scope.Offices[i].Id == result.data.Office.Id) {
                            $scope.Offices[i] = result.data.Office;
                        }
                    }
                }
                // Clean up
                $scope.cancelOffice();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


}]);


function office(mgaId) {
    return {
        "ManagingGeneralAgentId": mgaId
    };
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
