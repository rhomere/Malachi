MALACHIAPP.controller('PolicyRegistersController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'riskCompanyService', 'contractService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, riskCompanyService, contractService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.RiskCompany = $stateParams.RiskCompany;
    if ($scope.RiskCompany == null) {
        $state.transitionTo('riskcompanies');
        return;
    }

    $scope.Apps = [];
    $scope.PolicyRegisters = [];
    $scope.Characteristics = [];
    $scope.States = [];
    $scope.Forms = [];
    $scope.PolicyRegister = null;
    $scope.newPolicyRegister = false;
    $scope.ErrorMessage = null;

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

    settingsService.getApps().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Apps = result.data.Apps;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    riskCompanyService.getRiskCompany($scope.RiskCompany.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.RiskCompany = result.data.RiskCompany;
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


    riskCompanyService.getPolicyRegisters($scope.RiskCompany.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.PolicyRegisters = result.data.PolicyRegisters;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    $scope.addNewPolicyRegister = function () {
        $scope.newPolicyRegister = true;
        $scope.PolicyRegister = new policyregister($scope.RiskCompany.Id);
        $scope.PolicyRegister.AssignedForms = [];
        setupConditionGroups();
    }

    $scope.selectPolicyRegister = function (policyregister) {
        $scope.newPolicyRegister = true;
        $scope.PolicyRegister = $.extend(true, {}, policyregister);

        $scope.PolicyRegister.AssignedForms = [];
        if ($scope.PolicyRegister.Forms != null) {
            for (var i = 0; i < $scope.PolicyRegister.Forms.length; i++) {
                $scope.PolicyRegister.AssignedForms.push($scope.PolicyRegister.Forms[i].FormId);
            }
        }

        setupConditionGroups();
    }

    $scope.deletePolicyRegister = function (policyregister) {
        riskCompanyService.deletePolicyRegister(policyregister.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.PolicyRegisters.splice($.inArray(policyregister, $scope.PolicyRegisters), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.PolicyRegister.Conditions.push(new policyregister_group_condition($scope.PolicyRegister.Conditions));
        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new policyregister_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelPolicyRegister = function () {
        $scope.newPolicyRegister = false;
        $scope.ErrorMessage = null;
    }

    $scope.savePolicyRegister = function () {
        for (var i = 0; i < $scope.PolicyRegister.Conditions.length; i++) {
            for (var j = 0; j < $scope.PolicyRegister.Conditions[i].Conditions.length; j++) {
                var c = $scope.PolicyRegister.Conditions[i].Conditions[j];
                if (c.States != null && typeof c.States != 'string') {
                    c.States = c.States.join(",");
                }
            }
        }

        var isNew = $scope.PolicyRegister.Id == null;
        riskCompanyService.updatePolicyRegister($scope.PolicyRegister).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.PolicyRegisters.push(result.data.PolicyRegister);
                }
                else {
                    for (var i = 0; i < $scope.PolicyRegisters.length; i++) {
                        if ($scope.PolicyRegisters[i].Id == result.data.PolicyRegister.Id) {
                            $scope.PolicyRegisters[i] = result.data.PolicyRegister;
                        }
                    }
                }
                // Clean up
                $scope.cancelPolicyRegister();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    //---------------------------------
    // Conditions
    //---------------------------------
    $scope.CharacteristicValues = function (characteristicId) {
        var c = getModel($scope.Characteristics, characteristicId);
        if (c == null) return [];
        return c.Values;
    }

    function setupConditionGroups() {
        if ($scope.PolicyRegister != null && $scope.PolicyRegister.Conditions != null) {
            for (var i = 0; i < $scope.PolicyRegister.Conditions.length; i++) {
                for (var j = 0; j < $scope.PolicyRegister.Conditions[i].Conditions.length; j++) {
                    var c = $scope.PolicyRegister.Conditions[i].Conditions[j];

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

    $scope.deleteCondition = function (condition, group) {
        group.Conditions.splice($.inArray(condition, group.Conditions), 1);
    }

    $scope.deleteGroup = function (group, list) {
        list.splice($.inArray(group, list), 1);
    }

    $scope.hoverParent = function (event, hovering) {
        if (hovering) {
            $(event.target).parent().parent().parent().parent().addClass('hovering');
        }
        else {
            $(event.target).parent().parent().parent().parent().removeClass('hovering');
        }
    }

    //---------------------------------
    // Load States
    //---------------------------------
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


}]);


function policyregister(riskCompanyId) {
    return {
        "Coverages": [],
        "RiskCompanyId": riskCompanyId,
        "Conditions": []
    };
}

function policyregister_group_condition(conditions) {
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

function policyregister_condition(index) {
    return {
        "GroupIndex": index
    };
}


function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
