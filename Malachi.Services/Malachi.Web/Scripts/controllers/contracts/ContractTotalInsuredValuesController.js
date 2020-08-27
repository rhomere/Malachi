MALACHIAPP.controller('ContractTotalInsuredValuesController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, contractService, accountService, toolsService, settingsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });


    $scope.Contract = $stateParams.Contract;
    $scope.Coverage = $stateParams.Coverage;
    if ($scope.Contract == null || $scope.Coverage == null) {
        $state.transitionTo('contracts');
        return;
    }


    $scope.ContractTotalInsuredValues = [];
    $scope.Characteristics = []; 
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.ActiveConditionZoneTree = null;
    $scope.States = [];
    $scope.ContractTotalInsuredValue = null;
    $scope.newContractTotalInsuredValue = false;
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

    settingsService.getCoverages().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Coverages = result.data.Coverages;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    contractService.getContractTotalInsuredValues($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.ContractTotalInsuredValues = result.data.ContractTotalInsuredValues;
            $scope.TotalContractTotalInsuredValues = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalContractTotalInsuredValues / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchTotalInsuredValues = function (codeNumber, pageNumber, display) {
        contractService.searchContractTotalInsuredValues(codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ContractTotalInsuredValues = result.data.ContractTotalInsuredValues;
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
        $scope.currentTimeout = $timeout(function () { $scope.searchTotalInsuredValues($scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };
     


    $scope.addNewContractTotalInsuredValue = function () {
        $scope.newContractTotalInsuredValue = true;
        $scope.ContractTotalInsuredValue = new contractTotalInsuredValue($scope.Contract.Id, $scope.Coverage.Id);
        setupConditionGroups();
    }

    $scope.selectContractTotalInsuredValue = function (contractTotalInsuredValue) {
        $scope.newContractTotalInsuredValue = true;
        $scope.ContractTotalInsuredValue = $.extend(true, {}, contractTotalInsuredValue);


        setupConditionGroups();
    }

    $scope.deleteContractTotalInsuredValue = function (contractTotalInsuredValue) {
        contractService.deleteContractTotalInsuredValue(contractTotalInsuredValue.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ContractTotalInsuredValues.splice($.inArray(contractTotalInsuredValue, $scope.ContractTotalInsuredValues), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.ContractTotalInsuredValue.Conditions.push(new contractTotalInsuredValue_group_condition($scope.ContractTotalInsuredValue.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new contractTotalInsuredValue_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelContractTotalInsuredValue = function () {
        $scope.newContractTotalInsuredValue = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveContractTotalInsuredValue = function () {
        for (var i = 0; i < $scope.ContractTotalInsuredValue.Conditions.length; i++) {
            for (var j = 0; j < $scope.ContractTotalInsuredValue.Conditions[i].Conditions.length; j++) {
                var c = $scope.ContractTotalInsuredValue.Conditions[i].Conditions[j];
                if (c.States != null && typeof c.States != 'string') {
                    c.States = c.States.join(",");
                }

                c.Zones = [];
                if (c.AssignedZones != null) {
                    for (var z = 0; z < c.AssignedZones.length; z++) {
                        c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
                    }
                }
            }
        }

        var isNew = $scope.ContractTotalInsuredValue.Id == null;
        contractService.updateContractTotalInsuredValue($scope.ContractTotalInsuredValue).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.ContractTotalInsuredValues.push(result.data.ContractTotalInsuredValue);
                }
                else {
                    for (var i = 0; i < $scope.ContractTotalInsuredValues.length; i++) {
                        if ($scope.ContractTotalInsuredValues[i].Id == result.data.ContractTotalInsuredValue.Id) {
                            $scope.ContractTotalInsuredValues[i] = result.data.ContractTotalInsuredValue;
                        }
                    }
                }
                // Clean up
                $scope.cancelContractTotalInsuredValue();
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
        if ($scope.ContractTotalInsuredValue != null && $scope.ContractTotalInsuredValue.Conditions != null) {
            for (var i = 0; i < $scope.ContractTotalInsuredValue.Conditions.length; i++) {
                for (var j = 0; j < $scope.ContractTotalInsuredValue.Conditions[i].Conditions.length; j++) {
                    var c = $scope.ContractTotalInsuredValue.Conditions[i].Conditions[j];

                    if (c.States != null && typeof c.States == 'string') {
                        c.States = c.States.split(",");
                    }

                    if (c.Apps != null && typeof c.Apps == 'string') {
                        c.Apps = c.Apps.split(",");
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


function contractTotalInsuredValue(contractId, coverageId) {
    return {
        "ContractId": contractId,
        "CoverageId": coverageId,
        "Conditions": []
    };
}

function contractTotalInsuredValue_group_condition(conditions) {
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

function contractTotalInsuredValue_condition(index) {
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
