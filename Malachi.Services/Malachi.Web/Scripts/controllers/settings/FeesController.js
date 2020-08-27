MALACHIAPP.controller('FeesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', '$modal', 'settings', 'sharedService', 'settingsService', 'accountService', 'toolsService', 'contractService', 'riskCompanyService', function ($rootScope, $scope, $location, $stateParams, $state, $modal, settings, sharedService, settingsService, accountService, toolsService, contractService, riskCompanyService) {
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
    $scope.Fees = [];
    $scope.SelectedRiskCompanies = [];
    //Apps.unshift({ Id: null, Name: "All Applications" });
    $scope.Apps = [];

    $scope.newFee = false;
    $scope.ErrorMessage = null;


    riskCompanyService.getRiskCompanies().then(function (result) {
        if (result.data.Result.Success) {
            $scope.RiskCompanies = result.data.RiskCompanies;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    settingsService.getFees($scope.ManagingGeneralAgent.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Fees = result.data.Fees;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.copyFromExistingMGA = function () {
        var modalInstance = $modal.open({
            templateUrl: 'selectCopyFeeFromMgaController.html',
            controller: 'selectCopyFeeFromMgaController',
            backdrop: 'static',
            size: 'sm',
            resolve: {
                managingGeneralAgentId: function () {
                    return $scope.ManagingGeneralAgent.Id;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.Fees = data;
            }
        });
    }

    function setupRiskCompanies() {
        $scope.SelectedRiskCompanies = [];
        $scope.Fee.RiskCompanies.forEach(function(x) { x.Id = null });

        for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            var riskCompany = $scope.RiskCompanies[i];
            var existingRiskCompany = $scope.Fee.RiskCompanies.find(function (x) { return x.RiskCompanyId == riskCompany.Id });

            if (existingRiskCompany != null) {
                existingRiskCompany.Name = riskCompany.Name;
                $scope.SelectedRiskCompanies.push(existingRiskCompany);
            } else {
                $scope.SelectedRiskCompanies.push({
                    FeeId: $scope.Fee.Id,
                    RiskCompanyId: riskCompany.Id,
                    Name: riskCompany.Name
                });
            }
        }
    }

    $scope.newFeeClick = function () {
        $scope.Errors = [];
        $scope.newFee = true;
        $scope.Fee = new fee($scope.CurrentStateCode, $scope.ManagingGeneralAgent.Id);
        setupConditionGroups();
    }

    $scope.selectFee = function (fee) {
        $scope.Errors = [];
        $scope.newFee = true;
        $scope.Fee = $.extend(true, {}, fee);

        setDate($scope.Fee);
        setupConditionGroups();
        setupRiskCompanies();
    }

    $scope.saveFee = function (fee) {
        $scope.Errors = [];
        if (fee.Effective == null || fee.Expiration == null) {
            $scope.Errors.push('The effective/expiration date is not defined. Please provide a date.');
        }
        if (fee.Amount == null) {
            $scope.Errors.push('The Amount field is not defined. Please provide input for the field.');
        }

        if ($scope.Errors.length > 0) {
            return;
        }

        // Check if dates are valid
        if (sharedService.validateDate(fee.Effective) == false) {
            $scope.Errors.push('The effective date is not a valid date. Please check the calendar.');
        }
        if (sharedService.validateDate(fee.Expiration) == false) {
            $scope.Errors.push('The expiration date is not a valid date. Please check the calendar.');
        }

        if ($scope.Errors.length > 0) {
            return;
        }


        for (var i = 0; i < $scope.Fee.Conditions.length; i++) {
            for (var j = 0; j < $scope.Fee.Conditions[i].Conditions.length; j++) {
                var c = $scope.Fee.Conditions[i].Conditions[j];
                if (c.States != null && typeof c.States != 'string') {
                    c.States = c.States.join(",");
                }

                if (c.Apps != null && typeof c.Apps != 'string') {
                    c.Apps = c.Apps.join(",");
                }
            }
        }

        //$scope.Fee.RiskCompanies = [];
        //for (var i = 0; i < $scope.SelectedRiskCompanies.length; i++) {
        //    var riskCompanyId = $scope.SelectedRiskCompanies[i];
        //    $scope.Fee.RiskCompanies.push({
        //        FeeId: $scope.Fee.Id,
        //        RiskCompanyId: riskCompanyId
        //    });
        //}

        // Save fee
        var isNew = fee.Id == null;
        settingsService.updateFee(fee).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Fees.push(result.data.Fee);
                }
                else {
                    for (var i = 0; i < $scope.Fees.length; i++) {
                        if ($scope.Fees[i].Id == result.data.Fee.Id) {
                            $scope.Fees[i] = result.data.Fee;
                        }
                    }
                }
                // Clean up
                $scope.cancelFee(fee);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelFee = function (fee) {
        $scope.Fee = null;
        $scope.newFee = false;
        $scope.Errors = [];
    }

    $scope.stateChange = function () {
        if ($scope.Fee != null) $scope.Fee.StateCode = $scope.CurrentStateCode;
    }

    $scope.stateFees = function () {
        var fees = [];
        for (var i = 0; i < $scope.Fees.length; i++) {
            if ($scope.CurrentStateCode == $scope.Fees[i].StateCode) {
                fees.push($scope.Fees[i]);
            }
        }
        return fees;
    }


    // Load States
    toolsService.getStatesAndCounties().then(function (result) {
        if (result.data.Result.Success) {
            $scope.States = result.data.States;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    // Load Apps
    toolsService.getApps().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Apps = result.data.Apps;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    function setDate(obj) {
        if (obj.Effective.indexOf("-") > -1) {
            var date = moment(obj.Effective, "YYYY-MM-DD").toDate();
            var day = date.getUTCDate();
            var monthIndex = date.getMonth() + 1;
            var year = date.getFullYear();

            obj.Effective = monthIndex + '/' + day + '/' + year;

            date = moment(obj.Expiration, "YYYY-MM-DD").toDate();
            day = date.getUTCDate();
            monthIndex = date.getMonth() + 1;
            year = date.getFullYear();

            obj.Expiration = monthIndex + '/' + day + '/' + year;
        }
    }

    //---------------------------------
    // Conditions
    //---------------------------------
    contractService.getLimits().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Limits = result.data.Limits;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    settingsService.getCoverages().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Coverages = result.data.Coverages;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    contractService.getCharacteristics().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Characteristics = result.data.Characteristics;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });



    $scope.CharacteristicValues = function (characteristicId) {
        var c = getModel($scope.Characteristics, characteristicId);
        if (c == null) return [];
        return c.Values;
    }


    function setupConditionGroups() {
        if ($scope.Fee != null && $scope.Fee.Conditions != null) {
            for (var i = 0; i < $scope.Fee.Conditions.length; i++) {
                for (var j = 0; j < $scope.Fee.Conditions[i].Conditions.length; j++) {
                    var c = $scope.Fee.Conditions[i].Conditions[j];

                    if (c.States != null && typeof c.States == 'string') {
                        c.States = c.States.split(",");
                    }

                    if (c.Apps != null && typeof c.Apps == 'string') {
                        c.Apps = c.Apps.split(",");
                    }
                }
            }
        }
    }


    $scope.newConditionalGroup = function () {
        $scope.Fee.Conditions.push(new group_condition($scope.Fee.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new condition(group.GroupIndex);
        group.Conditions.push(c);
    }


    $scope.deleteCondition = function (condition, group) {
        group.Conditions.splice($.inArray(condition, group.Conditions), 1);
    }

    $scope.deleteGroup = function (group, list) {
        list.splice($.inArray(group, list), 1);
    }
}]);


MALACHIAPP.controller('selectCopyFeeFromMgaController', ['$rootScope', 'ngAuthSettings', 'localStorageService', '$http', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'settingsService', 'managingGeneralAgentId', function ($rootScope, ngAuthSettings, localStorageService, $http, $scope, $timeout, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, settingsService, managingGeneralAgentId) {
    $scope.ManagingGeneralAgents = [];
    $scope.ToMgaId = managingGeneralAgentId;
    $scope.FromMgaId = null;

    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    settingsService.getManagingGeneralAgents().then(function (result) {
        if (result.data.Result.Success) {
            $scope.ManagingGeneralAgents = result.data.ManagingGeneralAgents;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
        Metronic.unblockUI('.modal-dialog');
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        Metronic.unblockUI('.modal-dialog');
    });

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.copy = function () {
        if ($scope.FromMgaId == null) {
            $scope.Errors = ["Please select a Managing General Agent."];
            return;
        }
        $scope.busy = true;
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        settingsService.copyFeeFromMGA($scope.FromMgaId, $scope.ToMgaId).then(function (result) {
            if (result.data.Result.Success) {
                $modalInstance.close(result.data.Fees);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
            Metronic.unblockUI('.modal-dialog');
            $scope.busy = false;
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.busy = false;
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

}]);



function fee(stateCode, mgaId) {
    return {
        "StateCode": stateCode,
        "CalculateType": 0,
        "ManagingGeneralAgentId": mgaId,
        "Conditions": []
    };
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}

function group_condition(conditions) {
    var groupIndex = 0;
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].GroupIndex > groupIndex) groupIndex = conditions[i].GroupIndex;
    }

    return {
        "Name": "Condition " + (groupIndex + 1),
        "GroupIndex": groupIndex + 1,
        "Conditions": []
    };
}

function condition(index) {
    return {
        "GroupIndex": index
    };
}