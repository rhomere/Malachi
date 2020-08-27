MALACHIAPP.controller('MGAController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'insurerService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, insurerService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.ManagingGeneralAgents = [];
    $scope.Brokers = [];
    $scope.Insurers = [];
    $scope.ManagingGeneralAgent = null;
    $scope.newManagingGeneralAgent = false;
    $scope.ErrorMessage = null;

    settingsService.getManagingGeneralAgents().then(function (result) {
        if (result.data.Result.Success) {
            $scope.ManagingGeneralAgents = result.data.ManagingGeneralAgents;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    settingsService.getBrokers().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Brokers = result.data.Brokers;

        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    insurerService.getInsurers().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Insurers = result.data.Insurers;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewManagingGeneralAgent = function () {
        $scope.newManagingGeneralAgent = true;
        $scope.ManagingGeneralAgent = new mga();
        $scope.ManagingGeneralAgent.AssignedBrokers = [];
        $scope.ManagingGeneralAgent.AssignedInsurers = [];
    }

    $scope.selectManagingGeneralAgent = function (mga) {
        $scope.newManagingGeneralAgent = true;
        $scope.ManagingGeneralAgent = $.extend(true, {}, mga);

        $scope.ManagingGeneralAgent.AssignedInsurers = [];
        for (var i = 0; i < $scope.ManagingGeneralAgent.Insurers.length; i++) {
            $scope.ManagingGeneralAgent.AssignedInsurers.push($scope.ManagingGeneralAgent.Insurers[i].InsurerId);
        }

        $scope.ManagingGeneralAgent.AssignedBrokers = [];
        for (var i = 0; i < $scope.ManagingGeneralAgent.Brokers.length; i++) {
            $scope.ManagingGeneralAgent.AssignedBrokers.push($scope.ManagingGeneralAgent.Brokers[i].BrokerId);
        }
    }

    $scope.deleteManagingGeneralAgent = function (mga) {
        settingsService.deleteManagingGeneralAgent(mga.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ManagingGeneralAgents.splice($.inArray(mga, $scope.ManagingGeneralAgents), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelManagingGeneralAgent = function () {
        $scope.newManagingGeneralAgent = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveManagingGeneralAgent = function () {
        $scope.ManagingGeneralAgent.Insurers = [];
        for (var i = 0; i < $scope.ManagingGeneralAgent.AssignedInsurers.length; i++) {
            $scope.ManagingGeneralAgent.Insurers.push({ InsurerId: $scope.ManagingGeneralAgent.AssignedInsurers[i] });
        }

        $scope.ManagingGeneralAgent.Brokers = [];
        for (var i = 0; i < $scope.ManagingGeneralAgent.AssignedBrokers.length; i++) {
            $scope.ManagingGeneralAgent.Brokers.push({ BrokerId: $scope.ManagingGeneralAgent.AssignedBrokers[i] });
        }


        var isNew = $scope.ManagingGeneralAgent.Id == null;
        settingsService.updateManagingGeneralAgent($scope.ManagingGeneralAgent).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.ManagingGeneralAgents.push(result.data.ManagingGeneralAgent);
                }
                else {
                    for (var i = 0; i < $scope.ManagingGeneralAgents.length; i++) {
                        if ($scope.ManagingGeneralAgents[i].Id == result.data.ManagingGeneralAgent.Id) {
                            $scope.ManagingGeneralAgents[i] = result.data.ManagingGeneralAgent;
                        }
                    }
                }
                // Clean up
                $scope.cancelManagingGeneralAgent();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newManagingGeneralAgentTable = function () {
        $scope.ManagingGeneralAgent.Tables.push(new mgaTable());
    }

    $scope.newManagingGeneralAgentField = function (table) {
        if (table != null)
            table.Fields.push(new mgaField());
        else
            $scope.ManagingGeneralAgent.Fields.push(new mgaField());
    }

    $scope.newManagingGeneralAgentFieldOptions = function (table) {
        var field = new mgaField();
        field.OptionItems.push(new mgaFieldOptionItem());
        if (table != null)
            table.Fields.push(field);
        else
            $scope.ManagingGeneralAgent.Fields.push(field);
    }

    $scope.newOption = function (field) {
        field.OptionItems.push(new mgaFieldOptionItem());
    }

    $scope.deleteTable = function (table) {
        $scope.ManagingGeneralAgent.Tables.splice($.inArray(table, $scope.ManagingGeneralAgent.Tables), 1);
    }

    $scope.deleteField = function (field, fields) {
        fields.splice($.inArray(field, fields), 1);
    }

    $scope.deleteOption = function (option, options) {
        options.splice($.inArray(option, options), 1);
    }

    
    $scope.placeset = function (result) {
        if (result) {
            $scope.ManagingGeneralAgent.StreetAddress1 = result.StreetAddress1;
            $scope.ManagingGeneralAgent.StreetAddress2 = result.StreetAddress2;
            $scope.ManagingGeneralAgent.City = result.City;
            $scope.ManagingGeneralAgent.State = result.State;
            $scope.ManagingGeneralAgent.Zip = result.Zip;
            $scope.ManagingGeneralAgent.Country = result.Country;
            $scope.ManagingGeneralAgent.County = result.County;
            $scope.ManagingGeneralAgent.ShortAddress = result.formatted_address;
        }
    }

    $scope.linkToPage = function (page, mga) {
        $state.transitionTo(page, { ManagingGeneralAgent: mga });
    }
}]);


function mga() {
    return {
        Enabled: true,
        CornerstoneAgency: false,
    };
}
