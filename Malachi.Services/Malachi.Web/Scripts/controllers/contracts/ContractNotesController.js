MALACHIAPP.controller('ContractNotesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, contractService, accountService, toolsService, settingsService) {
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

    $scope.ContractNotes = [];
    $scope.Characteristics = []; 
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.ActiveConditionZoneTree = null;
    $scope.States = [];
    $scope.ContractNote = null;
    $scope.newContractNote = false;
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


    contractService.getContractNotes($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.ContractNotes = result.data.ContractNotes;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
     

    $scope.addNewContractNote = function () {
        $scope.newContractNote = true;
        $scope.ContractNote = new contractNote($scope.Contract.Id);
        setupConditionGroups();
    }

    $scope.selectContractNote = function (contractNote) {
        $scope.newContractNote = true;
        $scope.ContractNote = $.extend(true, {}, contractNote);


        setupConditionGroups();
    }

    $scope.deleteContractNote = function (contractNote) {
        contractService.deleteContractNote(contractNote.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ContractNotes.splice($.inArray(contractNote, $scope.ContractNotes), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.ContractNote.Conditions.push(new contractNote_group_condition($scope.ContractNote.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new contractNote_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelContractNote = function () {
        $scope.newContractNote = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveContractNote = function () {
        for (var i = 0; i < $scope.ContractNote.Conditions.length; i++) {
            for (var j = 0; j < $scope.ContractNote.Conditions[i].Conditions.length; j++) {
                var c = $scope.ContractNote.Conditions[i].Conditions[j];
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

        var isNew = $scope.ContractNote.Id == null;
        contractService.updateContractNote($scope.ContractNote).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.ContractNotes.push(result.data.ContractNote);
                }
                else {
                    for (var i = 0; i < $scope.ContractNotes.length; i++) {
                        if ($scope.ContractNotes[i].Id == result.data.ContractNote.Id) {
                            $scope.ContractNotes[i] = result.data.ContractNote;
                        }
                    }
                }
                // Clean up
                $scope.cancelContractNote();
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
        if ($scope.ContractNote != null && $scope.ContractNote.Conditions != null) {
            for (var i = 0; i < $scope.ContractNote.Conditions.length; i++) {
                for (var j = 0; j < $scope.ContractNote.Conditions[i].Conditions.length; j++) {
                    var c = $scope.ContractNote.Conditions[i].Conditions[j];

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


function contractNote(contractId) {
    return {
        "ContractId": contractId,
        "Conditions": [],
        "Answer": "Yes"
    };
}

function contractNote_group_condition(conditions) {
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

function contractNote_condition(index) {
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
