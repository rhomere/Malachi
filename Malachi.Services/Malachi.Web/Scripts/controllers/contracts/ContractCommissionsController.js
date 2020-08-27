MALACHIAPP.controller('ContractCommissionsController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, contractService, accountService, toolsService, settingsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Contract = $stateParams.Contract;
    if ($scope.Contract == null) {
        $state.transitionTo('contracts');
        return;
    }

    $scope.ContractCommissions = [];
    $scope.Characteristics = [];
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.ActiveConditionZoneTree = null;
    $scope.States = [];
    $scope.ContractCommission = null;
    $scope.newContractCommission = false;
    $scope.ErrorMessage = null;


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


    contractService.getContractCommissions($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.ContractCommissions = result.data.ContractCommissions;
            $scope.TotalContractCommissions = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalContractCommissions / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchCommissions = function (codeNumber, pageNumber, display) {
        contractService.searchContractCommissions(codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ContractCommissions = result.data.ContractCommissions;
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
        $scope.currentTimeout = $timeout(function () { $scope.searchCommissions($scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };
      

    $scope.addNewContractCommission = function () {
        $scope.newContractCommission = true;
        $scope.ContractCommission = new contractCommission($scope.Contract.Id);
        setupConditionGroups();
    }

    $scope.selectContractCommission = function (contractCommission) {
        $scope.newContractCommission = true;
        $scope.ContractCommission = $.extend(true, {}, contractCommission);


        setupConditionGroups();
    }

    $scope.deleteContractCommission = function (contractCommission) {
        contractService.deleteContractCommission(contractCommission.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ContractCommissions.splice($.inArray(contractCommission, $scope.ContractCommissions), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelContractCommission = function () {
        $scope.newContractCommission = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveContractCommission = function () {
        for (var i = 0; i < $scope.ContractCommission.Conditions.length; i++) {
            for (var j = 0; j < $scope.ContractCommission.Conditions[i].Conditions.length; j++) {
                var c = $scope.ContractCommission.Conditions[i].Conditions[j];
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

        var isNew = $scope.ContractCommission.Id == null;
        contractService.updateContractCommission($scope.ContractCommission).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.ContractCommissions.push(result.data.ContractCommission);
                }
                else {
                    for (var i = 0; i < $scope.ContractCommissions.length; i++) {
                        if ($scope.ContractCommissions[i].Id == result.data.ContractCommission.Id) {
                            $scope.ContractCommissions[i] = result.data.ContractCommission;
                        }
                    }
                }
                // Clean up
                $scope.cancelContractCommission();
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
    $scope.newConditionalGroup = function () {
        $scope.ContractCommission.Conditions.push(new contractCommission_group_condition($scope.ContractCommission.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new contractCommission_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

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
        if ($scope.ContractCommission != null && $scope.ContractCommission.Conditions != null) {
            for (var i = 0; i < $scope.ContractCommission.Conditions.length; i++) {
                for (var j = 0; j < $scope.ContractCommission.Conditions[i].Conditions.length; j++) {
                    var c = $scope.ContractCommission.Conditions[i].Conditions[j];

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
        for (var i = 0; i < condition.SelectedZones.length; i++) {
            var zone = condition.SelectedZones[i];
            condition.AssignedZones.splice($.inArray(zone, $scope.AssignedZones), 1);
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


function contractCommission(contractId) {
    return {
        "ContractId": contractId,
        "Conditions": [],
        "Answer": "Yes"
    };
}

function contractCommission_group_condition(conditions) {
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

function contractCommission_condition(index) {
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
