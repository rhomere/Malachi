MALACHIAPP.controller('ClassCodesController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'contractService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, contractService, accountService, toolsService) {
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

    $scope.ClassCodes = [];
    $scope.ClassCode = null;
    $scope.newClassCode = false;
    $scope.ErrorMessage = null;
    $scope.ActiveConditionZoneTree = null;

    contractService.getClassCodes($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.ClassCodes = result.data.ClassCodes;
            $scope.TotalClassCodes = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalClassCodes / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewClassCode = function () {
        $scope.newClassCode = true;
        $scope.ClassCode = new classcode($scope.Contract.Id);
    }

    $scope.canRateByCompany = function () {
        if ($scope.ClassCode.CanRateByCompany) {
            $scope.ClassCode.CompanyRateInfo = {
                PremisesExposureGroups: [],
                ProductExposureGroups: [],
                AdditionalQuestions: []
            };
        }
        else {
            $scope.ClassCode.CompanyRateInfo = null;
        }
    }

    $scope.canRateByISO = function () {
        if ($scope.ClassCode.CanRateByISO) {
            $scope.ClassCode.IsoRateInfo = {
                PremisesExposureGroups: [],
                ProductExposureGroups: [],
                AdditionalQuestions: []
            };
        }
        else {
            $scope.ClassCode.IsoRateInfo = null;
        }
    }

    $scope.selectClassCode = function (classcode) {
        $scope.newClassCode = true;
        $scope.ClassCode = $.extend(true, {}, classcode);
    }

    $scope.deleteClassCode = function (classcode) {
        contractService.deleteClassCode(classcode.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ClassCodes.splice($.inArray(classcode, $scope.ClassCodes), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelClassCode = function () {
        $scope.newClassCode = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveClassCode = function () {
        var isNew = $scope.ClassCode.Id == null;
        contractService.updateClassCode($scope.ClassCode).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.ClassCodes.push(result.data.ClassCode);
                }
                else {
                    for (var i = 0; i < $scope.ClassCodes.length; i++) {
                        if ($scope.ClassCodes[i].Id == result.data.ClassCode.Id) {
                            $scope.ClassCodes[i] = result.data.ClassCode;
                        }
                    }
                }
                // Clean up
                $scope.cancelClassCode();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
     
    $scope.newPremisesExposureGroups = function (info) {
        info.PremisesExposureGroups.push({ Exposures: [] });
    }

    $scope.newProductExposureGroups = function (info) {
        info.ProductExposureGroups.push({ Exposures: [] });
    }

    $scope.newPremisesExposure = function (group) {
        group.Exposures.push({});
    }

    $scope.newProductExposure = function (group) {
        group.Exposures.push({});
    }

    $scope.newAdditionalQuestions = function (info) {
        info.AdditionalQuestions.push({
            IsMandatory: true,
            IsDisplayable: true
        });
    }

    $scope.deletePremisesExposureGroups = function (info, item) {
        info.PremisesExposureGroups.splice($.inArray(item, info.PremisesExposureGroups), 1);
    }

    $scope.deleteProductExposureGroups = function (info, item) {
        info.ProductExposureGroups.splice($.inArray(item, info.ProductExposureGroups), 1);
    }

    $scope.deletePremisesExposure = function (group, item) {
        group.Exposures.splice($.inArray(item, group.Exposures), 1);
    }

    $scope.deleteProductExposure = function (group, item) {
        group.Exposures.splice($.inArray(item, group.Exposures), 1);
    }

    $scope.deleteAdditionalQuestions = function (info, item) {
        info.AdditionalQuestions.splice($.inArray(item, info.AdditionalQuestions), 1);
    }

    $scope.searchContractClassCodes = function (contractId, codeNumber, pageNumber, display) {
        contractService.searchContractClassCodes(contractId, codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ClassCodes = result.data.ClassCodes;
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
        $scope.currentTimeout = $timeout(function () { $scope.searchContractClassCodes($scope.Contract.Id, $scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchContractClassCodes($scope.Contract.Id, '', $scope.currentPage, 10);
    };


    $scope.exposureBasisChange = function (exposure) {
        if (exposure.ExposureDisplayBasis == null || exposure.ExposureDisplayBasis == '') {
            exposure.ExposureDisplayBasis = exposure.ExposureBasis;
        }
    }
    $scope.exposureBasisChange = function (exposure) {
        if (exposure.AdditionalChargeBasis == null || exposure.AdditionalChargeBasis == '') {
            exposure.AdditionalChargeBasis = exposure.ExposureBasis;
        }
        if (exposure.ExposureDataType == null || exposure.ExposureDataType == '') {
            exposure.ExposureDataType = 'Number';
        }
        if (exposure.RateBasis == null || exposure.RateBasis == '') {
            exposure.RateBasis = '1';
        }
    }

    //---------------------------------
    // Conditions
    //---------------------------------
    $scope.newConditionalGroup = function () {
        $scope.ClassCode.Conditions.push(new ClassCode_group_condition($scope.ClassCode.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new ClassCode_condition(group.GroupIndex);
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
        if ($scope.ClassCode != null && $scope.ClassCode.Conditions != null) {
            for (var i = 0; i < $scope.ClassCode.Conditions.length; i++) {
                for (var j = 0; j < $scope.ClassCode.Conditions[i].Conditions.length; j++) {
                    var c = $scope.ClassCode.Conditions[i].Conditions[j];

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


function classcode(contractId) {
    return {
        "ContractId": contractId,
        CanModify: true,
        Conditions: []
    };
}

function getModel(list, id) {
    if(list != null)
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}


function ClassCode_group_condition(conditions) {
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

function ClassCode_condition(index) {
    return {
        "GroupIndex": index,
        "Zones": []
    };
}

