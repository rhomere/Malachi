MALACHIAPP.controller('AgentsController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Agency = $stateParams.Agency;
    if ($scope.Agency == null) {
        $state.transitionTo('mga'); 
        return; 
    }

    $scope.Agents = [];
    $scope.Agent = null;
    $scope.newAgent = false;
    $scope.ErrorMessage = null;


    settingsService.getAgents($scope.Agency.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Agents = result.data.Agents;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewAgent = function () {
        $scope.newAgent = true;
        $scope.Agent = new agent($scope.Agency.Id);
    }

    $scope.selectAgent = function (agent) {
        $scope.newAgent = true;
        $scope.Agent = $.extend(true, {}, agent);
    }

    $scope.deleteAgent = function (agent) {
        settingsService.deleteAgent(agent.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Agents.splice($.inArray(agent, $scope.Agents), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelAgent = function () {
        $scope.newAgent = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveAgent = function () {
        var isNew = $scope.Agent.Id == null;
        settingsService.updateAgent($scope.Agent).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Agents.push(result.data.Agent);
                }
                else {
                    for (var i = 0; i < $scope.Agents.length; i++) {
                        if ($scope.Agents[i].Id == result.data.Agent.Id) {
                            $scope.Agents[i] = result.data.Agent;
                        }
                    }
                }
                // Clean up
                $scope.cancelAgent();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


}]);


function agent(agencyId) {
    return {
        "AgencyId": agencyId
    };
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
