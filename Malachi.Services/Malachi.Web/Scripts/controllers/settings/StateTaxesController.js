MALACHIAPP.controller('StateTaxesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'sharedService', 'settingsService', 'accountService', 'toolsService', 'contractService', function ($rootScope, $scope, $location, $stateParams, $state, settings, sharedService, settingsService, accountService, toolsService, contractService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });
     
    $scope.Taxes = [];
    //Apps.unshift({ Id: null, Name: "All Applications" });
    $scope.Apps = [];

    $scope.newTax = false;
    $scope.ErrorMessage = null;

    settingsService.getStateTaxes().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Taxes = result.data.Taxes;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

      
    $scope.newTaxClick = function () { 
        $scope.Errors = [];
        $scope.newTax = true;
        $scope.Tax = new tax($scope.CurrentStateCode);
        $scope.Tax.TaxableFee = true;
        setupConditionGroups();
    }

    $scope.selectTax = function (tax) {
        $scope.Errors = [];
        $scope.newTax = true;
        $scope.Tax = tax;
        $scope.Tax = $.extend(true, {}, tax);

        setDate($scope.Tax);
        setupConditionGroups();
    }

    $scope.saveTax = function (tax) {
        // Check if dates are valid
        $scope.Errors = [];
        if (tax.Effective == null || tax.Expiration == null) {
            $scope.Errors.push('The effective/expiration date is not defined. Please provide a date.');
        }
        if (tax.Amount == null) {
            $scope.Errors.push('The Amount field is not defined. Please provide input for the field.');
        }

        if ($scope.Errors.length > 0) {
            return;
        }

        if (sharedService.validateDate(tax.Effective) == false) {
            $scope.Errors.push('The effective date is not a valid date. Please check the calendar.');
        }
        if (sharedService.validateDate(tax.Expiration) == false) {
            $scope.Errors.push('The expiration date is not a valid date. Please check the calendar.');
        }

        if ($scope.Errors.length > 0) {
            return;
        }

        // Save tax
        var isNew = tax.Id == null;
        settingsService.updateStateTax(tax).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Taxes.push(result.data.StateTax);
                }
                else {
                    for (var i = 0; i < $scope.Taxes.length; i++) {
                        if ($scope.Taxes[i].Id == result.data.StateTax.Id) {
                            $scope.Taxes[i] = result.data.StateTax;
                        }
                    }
                }
                // Clean up
                $scope.cancelTax(tax);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelTax = function (tax) {
        $scope.Tax = null;
        $scope.newTax = false;
        $scope.Errors = [];
    }

    $scope.stateChange = function () {
        if ($scope.Tax != null) $scope.Tax.StateCode = $scope.CurrentStateCode;
    }

    $scope.stateTaxes = function () {
        var taxes = [];

        for (var i = 0; i < $scope.Taxes.length; i++) {
            if ($scope.CurrentStateCode == $scope.Taxes[i].StateCode) {
                taxes.push($scope.Taxes[i]);
            }
        }

        return taxes;
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
        if ($scope.Tax != null && $scope.Tax.Conditions != null) {
            for (var i = 0; i < $scope.Tax.Conditions.length; i++) {
                for (var j = 0; j < $scope.Tax.Conditions[i].Conditions.length; j++) {
                    var c = $scope.Tax.Conditions[i].Conditions[j];

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
        $scope.Tax.Conditions.push(new group_condition($scope.Tax.Conditions));

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


function tax(stateCode) {
    return {
        "StateCode": stateCode,
        "CalculateType": 0,
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