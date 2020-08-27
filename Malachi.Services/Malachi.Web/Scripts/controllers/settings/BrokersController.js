MALACHIAPP.controller('BrokersController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'insurerService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, insurerService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Brokers = [];
    $scope.Insurers = [];
    $scope.Broker = null;
    $scope.newBroker = false;
    $scope.ErrorMessage = null;

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
    
    $scope.addNewBroker = function () {
        $scope.newBroker = true;
        $scope.Broker = new broker();
        $scope.Broker.AssignedInsurers = [];
    }

    $scope.selectBroker = function (broker) {
        $scope.newBroker = true;
        $scope.Broker = $.extend(true, {}, broker);
        $scope.Broker.AssignedInsurers = [];
        for (var i = 0; i < $scope.Broker.Insurers.length; i++) {
            $scope.Broker.AssignedInsurers.push($scope.Broker.Insurers[i].InsurerId);
        }
    }

    $scope.deleteBroker = function (broker) {
        settingsService.deleteBroker(broker.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Brokers.splice($.inArray(broker, $scope.Brokers), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelBroker = function () {
        $scope.newBroker = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveBroker = function () {
        $scope.Broker.Insurers = [];
        for (var i = 0; i < $scope.Broker.AssignedInsurers.length; i++) {
            $scope.Broker.Insurers.push({ InsurerId: $scope.Broker.AssignedInsurers[i] });
        }

        var isNew = $scope.Broker.Id == null;
        settingsService.updateBroker($scope.Broker).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Brokers.push(result.data.Broker);
                }
                else {
                    for (var i = 0; i < $scope.Brokers.length; i++) {
                        if ($scope.Brokers[i].Id == result.data.Broker.Id) {
                            $scope.Brokers[i] = result.data.Broker;
                        }
                    }
                }
                // Clean up
                $scope.cancelBroker();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newBrokerTable = function () {
        $scope.Broker.Tables.push(new brokerTable());
    }

    $scope.newBrokerField = function (table) {
        if (table != null)
            table.Fields.push(new brokerField());
        else
            $scope.Broker.Fields.push(new brokerField());
    }

    $scope.newBrokerFieldOptions = function (table) {
        var field = new brokerField();
        field.OptionItems.push(new brokerFieldOptionItem());
        if (table != null)
            table.Fields.push(field);
        else
            $scope.Broker.Fields.push(field);
    }

    $scope.newOption = function (field) {
        field.OptionItems.push(new brokerFieldOptionItem());
    }

    $scope.deleteTable = function (table) {
        $scope.Broker.Tables.splice($.inArray(table, $scope.Broker.Tables), 1);
    }

    $scope.deleteField = function (field, fields) {
        fields.splice($.inArray(field, fields), 1);
    }

    $scope.deleteOption = function (option, options) {
        options.splice($.inArray(option, options), 1);
    }


}]);


function broker() {
    return {
        Enabled: true
    };
}
