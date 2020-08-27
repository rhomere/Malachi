MALACHIAPP.controller('EligibilityQuestionsController', ['$rootScope', '$scope', '$location', '$timeout', '$modal', '$stateParams', '$state', '$filter', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $timeout, $modal, $stateParams, $state, $filter, settings, contractService, accountService, toolsService, settingsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Contract = $stateParams.Contract;
    $scope.AllContracts = $stateParams.AllContracts;
    if ($scope.Contract == null) {
        $state.transitionTo('contracts');
        return;
    }

    $scope.Attributes = [];
    $scope.Eligibilities = [];
    $scope.Characteristics = []; 
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.ActiveConditionZoneTree = null;
    $scope.States = [];
    $scope.Forms = [];
    $scope.Eligibility = null;
    $scope.newEligibility = false;
    $scope.ErrorMessage = null;
    $scope.Errors = [];

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


    settingsService.getAttributes().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Attributes = result.data.Attributes;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    contractService.getEligibilityQuestions($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Eligibilities = result.data.EligibilityQuestions;
            $scope.TotalEligibilities = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalEligibilities / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchEligibilities = function (contractId, codeNumber, pageNumber, display) {
        contractService.searchEligibilityQuestions(contractId, codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Eligibilities = result.data.EligibilityQuestions;
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
        $scope.currentTimeout = $timeout(function () { $scope.searchEligibilities($scope.Contract.Id, $scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchEligibilities($scope.Contract.Id, '', $scope.currentPage, 10);
    }; 

    $scope.addNewEligibility = function () {
        $scope.newEligibility = true;
        $scope.Eligibility = new eligibility($scope.Contract.Id);
        $scope.Eligibility.AssignedForms = [];
        setupConditionGroups();
    }

    $scope.selectEligibility = function (eligibility) {
        $scope.newEligibility = true;
        $scope.Eligibility = $.extend(true, {}, eligibility);
        $scope.Eligibility.EffectiveDate = $filter('date')($scope.Eligibility.EffectiveDate, 'MM/dd/y');

        $scope.Eligibility.AssignedForms = [];
        if ($scope.Eligibility.Forms != null) {
            for (var i = 0; i < $scope.Eligibility.Forms.length; i++) {
                $scope.Eligibility.AssignedForms.push($scope.Eligibility.Forms[i].FormId);
            }
        }

        setupConditionGroups();
    }

    $scope.copyEligibility = function (eligibility) {
        var modalInstance = $modal.open({
            templateUrl: 'copyEligibilityQuestion.html',
            controller: 'copyEligibilityQuestionCtrl',
            backdrop: 'static',
            size: 'md',
            resolve: {
                contract: function () { return $scope.Contract; },
                contracts: function () { return $scope.AllContracts; }
            }
        });

        modalInstance.result.then(function (result) {
            if (result !== 'cancel') {
                var eligibilityQuestionId = eligibility.Id;
                var fromContractId = eligibility.ContractId;
                var toContractId = result.contract.Id;

                contractService.copyEligibilityQuestion(eligibilityQuestionId, fromContractId, toContractId).then(function (result) {
                    if (result.data.Result.Success) {
                        var copiedQuestion = result.data.EligibilityQuestion;
                        if (copiedQuestion != null) {
                            if (fromContractId === toContractId) {
                                $scope.Eligibilities.push(copiedQuestion);
                            }
                        }
                    } else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.deleteEligibility = function (eligibility) {
        contractService.deleteEligibilityQuestion(eligibility.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Eligibilities.splice($.inArray(eligibility, $scope.Eligibilities), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.Eligibility.Conditions.push(new eligibility_group_condition($scope.Eligibility.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new eligibility_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelEligibility = function () {
        $scope.newEligibility = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveEligibility = function () {
        var checkDate = new Date($scope.Eligibility.EffectiveDate).toString();
        if (checkDate === "Invalid Date") {
            $scope.Eligibility.EffectiveDate = "";
            $scope.Errors.push("The effective date entered is not valid");
            return;
        }

        for (var i = 0; i < $scope.Eligibility.Conditions.length; i++) {
            for (var j = 0; j < $scope.Eligibility.Conditions[i].Conditions.length; j++) {
                var c = $scope.Eligibility.Conditions[i].Conditions[j];
                if (c.States != null && typeof c.States != 'string') {
                    c.States = c.States.join(",");
                }

                if (c.Attributes != null && typeof c.Attributes != 'string') {
                    c.Attributes = c.Attributes.join(",");
                }

                if (c.AdditionalCoverages && typeof c.AdditionalCoverages != 'string') {
                    c.AdditionalCoverages = c.AdditionalCoverages.join(",");
                }

                if (c.ConditionName == 'Insurance Score') {
                    if (c.ConditionValue && typeof c.ConditionValue != 'string') {
                        c.ConditionValue = c.ConditionValue.join(",");
                    }
                }

                c.Zones = [];
                if (c.AssignedZones != null) {
                    for (var z = 0; z < c.AssignedZones.length; z++) {
                        c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
                    }
                }
            }
        }

        $scope.Eligibility.Forms = [];
        for (var i = 0; i < $scope.Eligibility.AssignedForms.length; i++) {
            $scope.Eligibility.Forms.push({ EligibilityQuestionId: $scope.Eligibility.Id, FormId: $scope.Eligibility.AssignedForms[i] });
        }

        var isNew = $scope.Eligibility.Id == null;
        contractService.updateEligibilityQuestion($scope.Eligibility).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Eligibilities.push(result.data.EligibilityQuestion);
                }
                else {
                    for (var i = 0; i < $scope.Eligibilities.length; i++) {
                        if ($scope.Eligibilities[i].Id == result.data.EligibilityQuestion.Id) {
                            $scope.Eligibilities[i] = result.data.EligibilityQuestion;
                        }
                    }
                }
                // Clean up
                $scope.cancelEligibility();
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

    function setupConditionZones(condition) {
        condition.AssignedZones = [];
        if (condition.Zones != null) {
            for (var i = 0; i < condition.Zones.length; i++) {
                var zone = getZone(condition.Zones[i].ZoneId, $scope.AllZones);

                condition.AssignedZones.push({
                    Id: zone.Id,
                    Name: zone.NameTree
                });
            }
        }
    }

    $scope.selectConditionZoneTree = function (condition) {
        $scope.ActiveConditionZoneTree = condition;
    }
    function setupConditionGroups() {
        if ($scope.Eligibility != null && $scope.Eligibility.Conditions != null) {
            for (var i = 0; i < $scope.Eligibility.Conditions.length; i++) {
                for (var j = 0; j < $scope.Eligibility.Conditions[i].Conditions.length; j++) {
                    var c = $scope.Eligibility.Conditions[i].Conditions[j];

                    if (c.States != null && typeof c.States == 'string') {
                        c.States = c.States.split(",");
                    }

                    if (c.Attributes != null && typeof c.Attributes == 'string') {
                        c.Attributes = c.Attributes.split(",");
                    }

                    if (c.AdditionalCoverages != null && typeof c.AdditionalCoverages == 'string') {
                        c.AdditionalCoverages = c.AdditionalCoverages.split(",");
                    }

                    if (c.Apps != null && typeof c.Apps == 'string') {
                        c.Apps = c.Apps.split(",");
                    }

                    if (c.ConditionName == 'Insurance Score') {
                        if (c.ConditionValue != null && typeof c.ConditionValue == 'string') {
                            c.ConditionValue = c.ConditionValue.split(",");
                        }
                    }

                    setupConditionZones(c);
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


    $scope.addSelectedConditionZone = function (condition) {
        var selectedItems = condition.treeInstance.jstree(true).get_selected();

        for (var i = 0; i < selectedItems.length; i++) {
            var zone = getModel($scope.AllZones, selectedItems[i]);

            var parentName = [];
            var cZone = zone;
            while (true) {
                parentName.unshift(cZone.Name);
                cZone = getZoneParent($scope.Zones, cZone.ParentId);
                if (cZone == null) break;
                if (cZone.ParentId == null) {
                    parentName.unshift(cZone.Name); break;
                }
            }
            parentName.pop();
            if (condition.AssignedZones == null) condition.AssignedZones = [];

            var zoneAlreadyIncluded = condition.AssignedZones.some(function (x) { return x.Id === selectedItems[i]; });
            if (zoneAlreadyIncluded) continue;

            condition.AssignedZones.push({
                Id: zone.Id,
                Name: (parentName.length > 0 ? parentName.join(' > ') + ' > ' : '') + zone.Name
            });
        }
    };

    $scope.deleteSelectedConditionZones = function (condition) {
        var selectedZones = condition.SelectedZones;
        condition.AssignedZones = condition.AssignedZones.filter(function (x) {
            return !selectedZones.some(function (y) {
                return y.Id === x.Id;
            });
        });
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

    $scope.ZoneConditionConfig = {
        core: {
            "core": {
                "themes": {
                    "responsive": false
                },
                // so that create works
                "check_callback": true
            },
            "types": {
                "default": {
                    "icon": "fa fa-folder icon-lg"
                },
                "file": {
                    "icon": "fa fa-file icon-lg"
                }
            },
            "plugins": ["state", "types", "wholerow"]
        },
        version: 1
    };

    $scope.reCreateTree = function () {
        $scope.ZoneTreeConfig.version++;
    }

}]);

MALACHIAPP.controller('copyEligibilityQuestionCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'contract', 'contracts', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, contract, contracts) {
    $scope.contracts = contracts.filter(function (x) { return x.Name !== 'None'; });
    $scope.selectedContract = { value: $scope.contracts.find(function (x) { return x.Name === contract.Name; }) };
    $scope.errors = [];

    $scope.close = function () {
        $modalInstance.close('cancel');
    }

    $scope.copy = function () {
        validateForm();
        if ($scope.errors.length > 0) return;
        $modalInstance.close({
            contract: $scope.selectedContract.value
        });
    }

    $scope.getContractInsurerAndNumber = function (contract) {
        return contract.InsurerName + " - " + contract.Name;
    }

    function validateForm() {
        $scope.errors = [];

        if ($scope.selectedContract.value == null)
            $scope.errors.push('Please select a contract.');
    }
}]);

function eligibility(contractId) {
    return {
        "ContractId": contractId,
        "Conditions": [],
        "Answer": "Yes",
        "Enabled": true
    };
}

function eligibility_group_condition(conditions) {
    var groupIndex = 0;
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].GroupIndex > groupIndex) groupIndex = conditions[i].GroupIndex;
    }

    return {
        "Name": "Condition " + (groupIndex + 1),
        "GroupIndex": groupIndex + 1,
        "Conditions": [],
        "Zones": []
    };
}

function eligibility_condition(index) {
    return {
        "GroupIndex": index,
        "Zones": []
    };
}




function getZoneParent(children, parentId) {
    var parent = null;

    for (var i = 0; i < children.length; i++) {
        if (parentId == children[i].Id) return children[i];

        if (children[i].Children.length > 0) {
            parent = getZoneParent(children[i].Children, parentId)
        }

        if (parent != null) return parent;
    }

    return parent;
}

function getZone(id, zones) {
    for (var i = 0; i < zones.length; i++) {
        if (id == zones[i].Id) return zones[i];
    }
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
